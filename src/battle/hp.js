// Applying damage and healing to a unit's Health.
//
// POLICY: every point of Health a unit is GIVEN goes through healUnit, so
// Overheal can see the overflow a heal would otherwise discard. Never write
// `.hp = Math.min(maxHp, ...)` anywhere else. (The Light boss is the one
// exception and says why at healUnit.)
//
// POLICY: every point of damage dealt to a unit goes through damageUnit --
// basic attacks, ability modules, boss actions, minion specials, DoTs, and
// reflects alike -- so a Shield always absorbs before Health is touched.
// Never subtract from `.hp` directly anywhere else.
//
// An ability may bypass the Shield ONLY when its own displayed text says so,
// by passing {pierceShield: true}. Two things do today, both from the
// Sicklewing line and both written on its cards: Unfettered ("its attacks
// bypass Shields" -- the attack loop passes the flag for it), and Sickle
// Cut's Execute, which is a kill rather than damage and so has no Shield to
// chew through. Adding another means writing it in the ability's text first.
//
// The boss's own separate shield pool is handled by damageBoss in damage.js.
//
// This lives in its own module (rather than in status.js beside the Shield
// timer, or in damage.js beside the damage formulas) so that status.js and
// damage.js can both use it without an import cycle.

import { buffTicks, buffStacks, shieldAmount, asPassive, currentApplier, activeAbilityOf, effectiveness, battleRoster, sameSide, extraAllyFor, asSpread, gearTriggers, triggersOn, basicAttackNumber } from "./applier.js";
import { CREATURE_MAP } from "../data/creatures.js";
import { abilityHasTag } from "./abilityTags.js";
import { gainSpecialCharge } from "./charge.js";
import { isImmobilized } from "./immobilize.js";
import { distToBoss } from "./geometry.js";

/**
 * Ground Hazards live in the battle state, which this module never sees, so
 * tick.js hands over a lookup each tick: is `u` (a creature, or the boss by
 * its body) standing on a Hazard of `kind`? Read by Flashpoint Ring and
 * Maelstrom Core.
 */
let hazardLookup = () => false;
export function setHazardLookup(fn) {
  hazardLookup = fn || (() => false);
}
export function standsOnHazard(u, kind) {
  return !!u && hazardLookup(u, kind);
}

/**
 * HIT HOOKS. Every hit that lands -- on a creature (damageUnit) or a boss
 * (damageBoss in damage.js) -- is announced here as (attacker, target, info),
 * where the attacker is the current applier and `info` carries:
 *   ability      "basic" / "special" / "unique" (null if unknown)
 *   baseDmg      the hit before the attacker's damage gear
 *   dmg          the hit as dealt (after that gear and the target's defenses)
 *   crit         whether it was a critical hit
 *   effectDamage DoT / reflect / counter / hazard damage
 * Gear that reacts to hits registers a listener instead of being written into
 * the damage path: Magpie Brooch, Bloodthirster, Shattercrit Ring (status.js),
 * Thornback Plate (damage.js), and the per-attack gear -- Twin Fang, Chain,
 * Splash (tick.js). Listeners live in the modules that have their tools; they
 * register at load, which is how this module avoids importing them (cycles).
 */
const hitListeners = [];
export function onHitLanded(fn) {
  hitListeners.push(fn);
}
export function announceHit(target, info) {
  const attacker = currentApplier();
  if (!attacker || attacker === target) return;
  info.ability = activeAbilityOf(attacker);
  // Who last damaged this creature (Duelist's Edge reads it).
  target._lastAttacker = attacker;
  for (const fn of hitListeners) fn(attacker, target, info);
}

/**
 * Crit bookkeeping for hit listeners: critMultiplier (damage.js) flags the
 * roller when it crits, and the next hit that roller lands claims the flag.
 * Claimed at the top of every hit -- dodged and blocked ones too -- so a crit
 * whose hit never lands can't leak onto a later one.
 */
function claimCrit(attacker) {
  if (!attacker || !attacker._critLanded) return false;
  attacker._critLanded = false;
  return true;
}

/**
 * POLICY: the attacker's damage gear, in one place -- damageUnit and
 * damageBoss (damage.js) both apply it, once per hit:
 *   - Echo Conch: everything dealt during an echo, at its effectiveness
 *     (the caster's own self-damage included).
 *   - Hunter's Snare: + against an Immobilized target (see immobilize.js).
 *   - Hydra Tooth: + when the ability the hit came from is tagged Multi-hit
 *     (see abilityTags.js) -- the tag is the classification, so any ability
 *     tagged there is covered, Basic or Special alike.
 *   - Berserk Core: + on the Basic ability.
 * Effect damage (DoTs, reflects, hazards) takes only the echo scaling.
 */
export function attackerDamageMultiplier(target, { effectDamage = false, crit = false } = {}) {
  let mult = effectiveness();
  const attacker = currentApplier();
  if (!attacker || attacker === target || effectDamage) return mult;
  const gear = attacker.gear;
  if (!gear) return mult;
  const ability = activeAbilityOf(attacker);
  const more = (pct) => { mult *= 1 + pct / 100; };
  if (gear.immobilizedDmgPct && isImmobilized(target)) mult *= 1 + gear.immobilizedDmgPct / 100;
  if (gear.multiHitDmgPct && abilityHasTag(attacker, ability, "multihit")) mult *= 1 + gear.multiHitDmgPct / 100;
  // Tag-keyed damage gear: Tidecaller Shell (Splash), Fault Line Gauntlet
  // (Line), Static Pin (Chain), Hollow Mask (Weakest).
  if (gear.splashDmgPct && abilityHasTag(attacker, ability, "splash")) more(gear.splashDmgPct);
  if (gear.lineDmgPct && abilityHasTag(attacker, ability, "line")) more(gear.lineDmgPct);
  if (gear.chainDmgPct && abilityHasTag(attacker, ability, "chain")) more(gear.chainDmgPct);
  if (gear.weakestDmgPct && abilityHasTag(attacker, ability, "weakest")) more(gear.weakestDmgPct);
  // Seismic Heart: an ability that Stuns, against a target that can not be
  // Stunned (a boss -- it obeys no control effect but Taunt).
  if (gear.stunImmuneDmgPct && target.uid == null && abilityHasTag(attacker, ability, "stun")) more(gear.stunImmuneDmgPct);
  // Target-state damage gear: Rime Shard (Frostbite), Grave Lily (Marked),
  // Strangler Vine (Restrained by this creature), Nightshade Bead (Shielded),
  // Flashpoint Ring (standing on a Fire Hazard).
  if (gear.frostbiteTargetDmgPct && (target.frostbiteTicks || 0) > 0) more(gear.frostbiteTargetDmgPct);
  if (gear.markedTargetDmgPct && (target.markedTicks || 0) > 0) more(gear.markedTargetDmgPct);
  if (gear.restrainedTargetDmgPct && target.restrained?.some((r) => r.src === attacker.uid && r.stacks > 0)) more(gear.restrainedTargetDmgPct);
  if (gear.shieldedTargetDmgPct && (target.shield || 0) > 0) more(gear.shieldedTargetDmgPct);
  if (gear.fireHazardTargetDmgPct && standsOnHazard(target, "fire")) more(gear.fireHazardTargetDmgPct);
  // Finisher's Coin: a critical hit on a target below its Health threshold
  // (each such item at its own threshold).
  if (crit) for (const g of gearTriggers(attacker, "critLowHpDmgPct")) if (isBelow(target, g.critLowHpBelowPct)) more(g.critLowHpDmgPct);
  // Glass Blade: everything it deals.
  if (gear.dmgDealtPct) more(gear.dmgDealtPct);
  // Ambush Fang: the first ability of the battle -- all of it (spent when that
  // Basic attack or Special ends; see tick.js).
  if (gear.firstAbilityDmgPct && !attacker._ambushDone && (ability === "basic" || ability === "special")) {
    more(gear.firstAbilityDmgPct);
    attacker._ambushUsed = true;
  }
  if (gear.basicDmgPct && ability === "basic") mult *= 1 + gear.basicDmgPct / 100;
  if (gear.specialDmgPct && ability === "special") mult *= 1 + gear.specialDmgPct / 100;
  // Duelist's Edge: the enemy that last damaged the attacker (see announceHit).
  if (gear.vsLastAttackerDmgPct && attacker._lastAttacker === target) mult *= 1 + gear.vsLastAttackerDmgPct / 100;
  // Hunter's Mark: a target below a share of its Health.
  for (const g of gearTriggers(attacker, "lowHpTargetDmgPct")) if (isBelow(target, g.lowHpTargetBelowPct)) more(g.lowHpTargetDmgPct);
  if (ability === "basic") {
    // Every-Nth-attack damage, each item on its own interval (see
    // basicAttackNumber): Focus Band, Railgun Coil.
    const n = basicAttackNumber(attacker);
    for (const g of triggersOn(attacker, "focusEvery", n)) more(g.focusDmgPct || 0);
    for (const g of triggersOn(attacker, "pierceEvery", n)) more(g.pierceEveryDmgPct || 0);
    // Charger's Greaves: the first Basic attack after moving (the flag is set
    // by onUnitMoved and spent when that attack ends).
    if (gear.afterMoveAttackDmgPct && attacker._movedSinceAttack) mult *= 1 + gear.afterMoveAttackDmgPct / 100;
  }
  // Scorchmantle: per stack of Burn on the target.
  if (gear.perBurnStackDmgPct && (target.burnTicks || 0) > 0) mult *= 1 + (gear.perBurnStackDmgPct * (target.burnStacks || 0)) / 100;
  // Slipstream Blade: a Slowed or Stunned target.
  if (gear.vsSlowStunDmgPct && ((target.slowTicks || 0) > 0 || (target.stunTicks || 0) > 0)) mult *= 1 + gear.vsSlowStunDmgPct / 100;
  // Longshot Lens: abilities tagged Farthest (the targeting tag is the classification).
  if (gear.farthestDmgPct && abilityHasTag(attacker, ability, "farthest")) mult *= 1 + gear.farthestDmgPct / 100;
  // Tempest Blade: abilities tagged Pierce (including a Basic that Gust Anklets made Pierce).
  if (gear.pierceDmgPct && abilityHasTag(attacker, ability, "pierce")) mult *= 1 + gear.pierceDmgPct / 100;
  // Shadow Shroud: the first damaging ability after a teleport -- all of it
  // (the flag is spent when that ability ends; see tick.js).
  if (gear.teleportNextDmgPct && attacker._shadowStrike) {
    mult *= 1 + gear.teleportNextDmgPct / 100;
    attacker._shadowStrikeUsed = true;
  }
  // Vanguard Gauntlet: no ally Nearby.
  if (gear.loneDmgPct && !hasAllyNearby(attacker)) mult *= 1 + gear.loneDmgPct / 100;
  // Grit Band: a share of a percent per percent of the attacker's missing Health.
  if (gear.missingHpDmgRatio && attacker.maxHp > 0) {
    const missingPct = Math.max(0, 100 - (attacker.hp / attacker.maxHp) * 100);
    mult *= 1 + (missingPct * gear.missingHpDmgRatio) / 100;
  }
  return mult;
}

/** `u` is below `pct` of its max Health (a threshold item's condition). */
export function isBelow(u, pct) {
  return !!u && u.hp < (u.maxHp * (pct || 0)) / 100;
}

/** A creature's type ("Fire", ...) -- a boss's is its element key. */
function creatureTypeOf(u) {
  if (u.uid == null) return u._bossKey ? u._bossKey[0].toUpperCase() + u._bossKey.slice(1) : null;
  return CREATURE_MAP[u.creatureId]?.type || null;
}

/** "Nearby" (the 8 surrounding tiles) holds a living ally of `u`. */
export function hasAllyNearby(u) {
  for (const a of battleRoster()) {
    if (a === u || a.hp <= 0 || !sameSide(a, u)) continue;
    if (Math.max(Math.abs(a.row - u.row), Math.abs(a.col - u.col)) <= 1) return true;
  }
  return false;
}

/**
 * POLICY: an Execute -- an instant defeat below a Health threshold -- never
 * lands on a boss: not the Dungeon/Daily boss, and not a Labyrinth Boss
 * creature (a 2x2 body). Every Execute checks this (Sickle Cut, Gloomreaper
 * Chain), and the Execute tag's text says so.
 */
export function canBeExecuted(u) {
  return !!u && !isBossUnit(u) && u.hp > 0;
}

/** A boss: the Dungeon/Daily boss (no uid) or a Labyrinth Boss creature (a
 * 2x2 body). Effects that say "excluding bosses" check this. */
export function isBossUnit(u) {
  return !!u && (u.uid == null || (u.size || 1) > 1);
}

/**
 * POLICY: the TARGET's damage-reduction gear, in one place (damageUnit):
 *   - Traveler's Cloak: less while at full Health.
 *   - Sentry Emblem: less from a Ranged attacker's abilities.
 *   - Chorus Bell: less while an ally wearing it stands beside (the Beside
 *     tag: the 8 surrounding tiles). Several Bells nearby don't add up --
 *     the strongest applies.
 */
export function defenderDamageMultiplier(target, { effectDamage = false, redirected = false } = {}) {
  let mult = 1;
  const gear = target.gear;
  const attacker = currentApplier();
  if (gear) {
    const cut = (pct) => { mult *= 1 - pct / 100; };
    if (gear.fullHpDmgReductionPct && target.hp >= target.maxHp) cut(gear.fullHpDmgReductionPct);
    if (gear.rangedDmgReductionPct && !effectDamage && attacker?.isRanged) cut(gear.rangedDmgReductionPct);
    // Element wards: damage from a creature (or boss) of that type.
    const type = attacker && attacker !== target ? creatureTypeOf(attacker) : null;
    if (type && gear["resist" + type + "Pct"]) cut(gear["resist" + type + "Pct"]);
    // Basalt Ward: everything.
    if (gear.allDmgReductionPct) cut(gear.allDmgReductionPct);
    // Guardian Idol: a hit this creature took for an ally via Protect.
    if (gear.protectDmgReductionPct && redirected) cut(gear.protectDmgReductionPct);
    // Bulwark Sigil: every Nth ability hit taken (one shared tally, each
    // item on its own interval).
    if (!effectDamage && gearTriggers(target, "reduceEveryNthHit").length) {
      target._hitsForBulwark = (target._hitsForBulwark || 0) + 1;
      for (const g of triggersOn(target, "reduceEveryNthHit", target._hitsForBulwark)) cut(g.reduceEveryNthHitPct || 0);
    }
    // Sentinel Idol: the first N instances of damage of the battle.
    if (gear.firstHitsReduced && (target._instancesTaken || 0) < gear.firstHitsReduced) {
      target._instancesTaken = (target._instancesTaken || 0) + 1;
      cut(gear.firstHitsReducedPct || 0);
    }
    // Monolith Shard: damage from an enemy that is Taunted (by anyone).
    if (gear.tauntedDmgReductionPct && attacker && attacker !== target && (attacker.tauntTicks || 0) > 0) cut(gear.tauntedDmgReductionPct);
    // Glass Blade: the price of its damage -- everything it takes.
    if (gear.dmgTakenPct) mult *= 1 + gear.dmgTakenPct / 100;
  }
  // Tesla Coil: standing inside the active Aura of an enemy that wears it.
  const tesla = teslaAuraPct(target);
  if (tesla) mult *= 1 + tesla / 100;
  if (target.uid != null) {
    let bell = 0;
    for (const a of battleRoster()) {
      const pct = a.gear?.besideAllyDmgReductionPct || 0;
      if (!pct || a === target || a.hp <= 0 || a.uid?.[0] !== target.uid[0]) continue;
      if (Math.max(Math.abs(a.row - target.row), Math.abs(a.col - target.col)) <= 1) bell = Math.max(bell, pct);
    }
    if (bell) mult *= 1 - bell / 100;
  }
  return mult;
}

/** Tesla Coil: the strongest bonus among living enemies of `target` wearing
 * it whose active Aura covers it (a boss by its body). Several don't add up. */
function teslaAuraPct(target) {
  let best = 0;
  for (const a of battleRoster()) {
    const pct = a.gear?.auraEnemyDmgPct || 0;
    if (!pct || pct <= best || a.hp <= 0 || !a.aura || !((a.aura.ticks || 0) > 0)) continue;
    // The boss is an enemy of the player side only.
    if (target.uid == null ? a.uid?.[0] !== "p" : a === target || sameSide(a, target)) continue;
    const d = target.uid == null ? distToBoss(target, a.row, a.col) : Math.max(Math.abs(a.row - target.row), Math.abs(a.col - target.col));
    if (d <= a.aura.range) best = pct;
  }
  return best;
}

/**
 * Counters and Reflects -- damage a creature returns to whoever hit it --
 * are effect damage, so the attacker gear above never touches them. Their own
 * gear scales them at the source instead, through here: `kind` "counter"
 * (Bramble Cuff) or "reflect" (Quartz Chip), read as `gear.<kind>DmgPct`.
 */
export function retaliationMultiplier(u, kind) {
  return 1 + ((u?.gear?.[kind + "DmgPct"]) || 0) / 100;
}

/**
 * Expose (a debuff; applied by applyExpose in status.js): the next ability
 * hit its carrier takes deals 20% more and spends one stack. Effect damage
 * (DoTs, reflects, hazards) neither benefits nor spends a stack -- otherwise a
 * Burn tick would eat every stack before a real hit ever landed. Returns the
 * multiplier for this hit and spends the stack. Shared by damageUnit and
 * damageBoss.
 */
export const EXPOSE_DMG_PCT = 20;
export function spendExpose(target, effectDamage) {
  if (effectDamage || !((target.exposeTicks || 0) > 0) || !((target.exposeStacks || 0) > 0)) return 1;
  if (!--target.exposeStacks) target.exposeTicks = 0;
  return 1 + EXPOSE_DMG_PCT / 100;
}

/** End a Seeded debuff (see applySeeded in status.js) and free its seeder to
 * Seed again. Lives here because a defeat -- onDefeated below -- must end it. */
export function clearSeeded(u) {
  if (!u) return;
  if (u.seededBy && u.seededBy._seedTarget === u) u.seededBy._seedTarget = null;
  u.seeded = 0;
  u.seededBy = null;
}

/**
 * `target` was just defeated. Shared by damageUnit and damageBoss so every
 * killing blow pays the same way:
 *   - Mantis Scythe: the creature that landed it gains Special charge.
 *     Damage over time and hazards tick between turns with no applier, so
 *     they credit nobody.
 *   - Warlord's Trophy: EVERY other creature on the field wearing it, on
 *     either side, gains Attack (read by gearAtkMultiplier in damage.js).
 */
/**
 * DEFEAT LISTENERS: every defeat is announced as (target, killer, info) --
 * the killer being the current applier (null for damage over time, hazards)
 * and `info` carrying `overkill` (the killing hit's damage past the Health
 * it had left) and `wasSeeded`. They run first, before the fallen creature's
 * state is cleared below, so they still see what it carried. Registered by
 * status.js (Soul Jar, Worldtree Seed) and tick.js (Inferno Heart, Wildfire
 * Brand, Reaper's Lantern, Bloodrush Crown, Warpath Greaves).
 */
const defeatListeners = [];
export function onUnitDefeated(fn) {
  defeatListeners.push(fn);
}

export function onDefeated(target, { overkill = 0 } = {}) {
  const killer = currentApplier();
  const info = { overkill: Math.max(0, Math.round(overkill)), wasSeeded: !!target.seeded };
  for (const fn of defeatListeners) fn(target, killer && killer !== target ? killer : null, info);
  // Seeded ends the moment either side of it falls -- the fallen creature
  // takes no more turns, so it can't wait for its own next tick to clear.
  if (target.seeded) clearSeeded(target);
  if (target._seedTarget && target._seedTarget.seededBy === target) clearSeeded(target._seedTarget);
  // Blessing Mantle: the Health it lent its allies goes when it does.
  if (target.gear?.shareStatsPct) {
    for (const a of battleRoster()) {
      const lent = a._mantleHp?.[target.uid];
      if (!lent) continue;
      delete a._mantleHp[target.uid];
      a.maxHp = Math.max(1, a.maxHp - lent);
      if (a.hp > 0) a.hp = Math.max(1, Math.min(a.hp, a.maxHp));
    }
  }
  if (killer && killer !== target && killer.hp > 0) {
    const pct = killer.gear?.killChargePct || 0;
    if (pct && killer.abilChargeMax) gainSpecialCharge(killer, (killer.abilChargeMax * pct) / 100);
    // Whetstone: Attack for the rest of the battle per enemy it defeats
    // (read by gearAtkMultiplier in damage.js).
    const step = killer.gear?.killAtkPct || 0;
    if (step && !sameSide(killer, target)) killer._killAtkPct = Math.min(killer.gear.killAtkMaxPct ?? Infinity, (killer._killAtkPct || 0) + step);
  }
  for (const u of battleRoster()) {
    const step = u.gear?.defeatAtkPct || 0;
    if (!step || u === target || u.hp <= 0) continue;
    u._defeatAtkPct = Math.min(u.gear.defeatAtkMaxPct ?? Infinity, (u._defeatAtkPct || 0) + step);
  }
}

/**
 * Fortify (Iglet's Hunker In) lives here rather than in status.js because
 * damageUnit below is what spends it, and status.js already imports this
 * module (the reverse import would be a cycle -- see the header note).
 *
 * Each stack halves incoming ABILITY damage -- basic attacks and damaging
 * specials alike -- and is spent by the very hit it reduces. Effect damage
 * (Burn, Damage Over Time, Hazards, reflects) passes {effectDamage: true}
 * and is neither reduced nor spends a stack, so damage over time is the
 * clean counter to a stacked-up Fortify.
 */
export const FORTIFY_STACK_CAP = 10;
export const FORTIFY_REDUCTION_PCT = 50;

/**
 * Dodge (Cragling's Seventy-Two Forms) lives here for the same reason as
 * Fortify: it is spent by the hit it cancels, and this is the one place
 * every hit passes through.
 *
 * `dodgeEvery` is the interval (dodge every Nth instance) and `dodgeCounter`
 * the running tally; the dodged hit deals no damage and, because damageUnit
 * flags it on the target, the attack loop skips its onHit effects and the
 * defender's reflect too -- "no damage and negative effects are dealt".
 *
 * Only ability damage counts: effect damage ({effectDamage: true} -- Burn,
 * DoTs, Hazards, reflects) neither advances the tally nor can be dodged, so
 * a dodge is always spent on a real swing rather than wasted on a burn tick.
 */

/**
 * Protect (Frillet's Aegis Frill) lives here for the same reason Fortify and
 * Dodge do: damageUnit is what spends it, and this is the one place every hit
 * passes through.
 *
 * A protected ally does not take the hit at all -- it is redirected onto the
 * creature that granted Protect, which then resolves it with its OWN Shield,
 * Fortify, and Dodge. One stack is spent per redirect.
 *
 * `src` holds the guardian itself rather than its uid (the way Taunt stores
 * `tauntSourceUid`) because damageUnit has no access to the rosters to
 * resolve one. Battle snapshots are shallow spreads, never JSON, so carrying
 * a live reference here is safe; a guardian that dies or is pruned simply
 * fails the `hp > 0` check below and the redirect stops happening.
 *
 * Only attacks and abilities redirect. Effect damage ({effectDamage: true} --
 * Burn, Damage Over Time, Hazards, reflects) is nobody's to intercept, so it
 * lands where it started and spends no stack.
 */
export const PROTECT_STACK_CAP = 5;

export function applyProtect(target, guard, stacks = 1) {
  if (!target || !guard || target === guard || target.uid == null) return;
  // One guardian at a time -- a newer Protect replaces an older one outright,
  // the same way a new Taunt replaces the old.
  const carried = target.protect && target.protect.src === guard ? target.protect.stacks : 0;
  target.protect = { src: guard, stacks: Math.min(PROTECT_STACK_CAP, carried + buffStacks(target, stacks)) };
  const extra = extraAllyFor(target);
  if (extra && extra !== guard) asSpread(() => applyProtect(extra, guard, stacks));
}

/** Stacks currently carried, 0 when nothing is guarding this unit. */
export function protectStacks(u) {
  return u && u.protect ? u.protect.stacks : 0;
}

/** Drop the guard outright (buff removal). */
export function clearProtect(u) {
  if (u) u.protect = null;
}

/**
 * POLICY: every Shield a unit is given goes through applyShield.
 *
 * A Shield is a plain number, not a stack of charges -- closer to a Heal that
 * sits in front of Health than to Fortify or Protect. Shields therefore do
 * NOT add together: when a second one lands, the larger is kept along with
 * its own timer, and a strictly smaller one is ignored outright (it neither
 * shrinks the pool nor refreshes the duration). An equal one does replace,
 * so a creature recasting its own Shield still refreshes it.
 *
 * A Shield may stack ONLY when its own displayed text says so. The Light
 * boss's Holy Radiance ("stackable") adds to the boss's own pool directly
 * (battle/bosses/light.js) -- that pool is one plain number with no timer,
 * spent by damageBoss in damage.js, not a unit Shield at all. On creatures,
 * stacking Shields form the STACKING LAYER below.
 *
 * The keep-the-larger comparison is against the Shield WITHOUT the stacking
 * layer, and the layer is kept on top of the winner: a stacking Shield never
 * blocks a normal one from being recast or refreshed.
 *
 * Returns true when this Shield was the one kept.
 */
export function applyShield(u, amount, ticks) {
  // Shield gear on whoever grants it (see battle/applier.js), applied before
  // the keep-the-larger comparison so a strengthened Shield competes at size.
  const extra = extraAllyFor(u);
  if (extra) asSpread(() => applyShield(extra, amount, ticks));
  const shield = Math.max(1, Math.round(shieldAmount(amount) * shieldReceivedMultiplier(u)));
  const layer = stackLayer(u);
  if (shield < (u.shield || 0) - layer) return false;
  u.shield = shield + layer;
  // Duration gear on whoever granted it (see battle/applier.js).
  u.shieldTicks = buffTicks(u, ticks);
  noteShieldPeak(u);
  return true;
}

/**
 * Shielding Down (Nightshade Bead): the Shield twin of Healing Down -- a
 * stackable stat mod of kind "shield" that shrinks every Shield the carrier
 * receives. Summed per stack like Healing Down (20% each), floor 0. Read
 * here rather than through statModMultiplier because status.js imports this
 * module (see the header note).
 */
export function shieldReceivedMultiplier(u) {
  let sum = 0;
  for (const m of u?.statMods || []) if (m.kind === "shield" && m.pct < 0) sum += m.pct;
  return Math.max(0, 1 + sum / 100);
}

/**
 * The size a unit's Shield has reached since it last went to zero -- what
 * "the Shield" means when it breaks (Aegis Feather heals a share of it).
 */
function noteShieldPeak(u) {
  u._shieldPeak = Math.max(u._shieldPeak || 0, u.shield || 0);
}

/**
 * SHIELD-BREAK LISTENERS: a unit's Shield was worn down to nothing by damage
 * (not dispelled, stolen, or run out) -- announced as (unit, peak), `peak`
 * being the Shield's size at its largest. Registered by status.js (Aegis
 * Feather) and tick.js (Geode Heart).
 */
const shieldBreakListeners = [];
export function onShieldBroken(fn) {
  shieldBreakListeners.push(fn);
}

/**
 * THE STACKING LAYER. `u.shield` is one pool -- the number damage spends and
 * the UI and Radiant Smite read -- made of two parts:
 *   - the ordinary Shield (keep-the-larger, timer `shieldTicks`), and
 *   - the stacking layer (`stackShield`, timer `stackShieldTicks`): Shields
 *     whose text says they stack. They ADD to it, it is spent FIRST (it is the
 *     outermost part), and it keeps its own timer -- Infinity for one that
 *     lasts until broken -- so neither part's expiry takes the other with it.
 * Two sources feed it today: Crest of Conquest (a battle-start Shield, until
 * broken) and the Overheal Layer (Wax Cell / Honeycomb Flask), whose own cap
 * is tracked as the `overhealLayer` share of the stacking layer.
 */
function stackLayer(u) {
  return Math.min(u.stackShield || 0, u.shield || 0);
}

/** The ordinary (non-stacking) part of a unit's Shield -- what Blubber Wall
 * watches to tell its own wall breaking from the stacking layer. */
export function baseShield(u) {
  return Math.max(0, (u.shield || 0) - stackLayer(u));
}

/** Add `amount` (final, already gear-scaled) to the stacking layer, lasting
 * at least `ticks` (Infinity = until broken). Returns what was added. */
export function addStackingShield(u, amount, ticks) {
  if (!u) return 0;
  const add = Math.round(amount * shieldReceivedMultiplier(u));
  if (add <= 0) return 0;
  u.stackShield = stackLayer(u) + add;
  u.shield = (u.shield || 0) + add;
  u.stackShieldTicks = Math.max(u.stackShieldTicks || 0, ticks);
  noteShieldPeak(u);
  return add;
}

/**
 * Leviathan Scale: dispelling debuffs banks a stacking Shield, of which the
 * creature may hold at most `capPct` of its max Health at a time -- tracked as
 * the `dispelLayer` share of the stacking layer, spent and refilled like the
 * Overheal Layer's. Returns what was added.
 */
export function addDispelLayer(u, amount, capPct, ticks) {
  const cap = ((u.maxHp || 0) * capPct) / 100;
  const room = Math.floor(cap - Math.min(u.dispelLayer || 0, stackLayer(u)));
  if (room <= 0) return 0;
  const add = addStackingShield(u, Math.min(amount, room), ticks);
  u.dispelLayer = Math.min(u.dispelLayer || 0, stackLayer(u)) + add;
  return add;
}

/**
 * Drop a unit's whole Shield, stacking layer included (buff dispel, a
 * stolen Shield). Every place that zeroes a Shield goes through here so no
 * part of it can outlive the rest.
 */
export function clearShield(u) {
  u.shield = 0;
  u.shieldTicks = 0;
  u.stackShield = 0;
  u.stackShieldTicks = 0;
  u.overhealLayer = 0;
  u.dispelLayer = 0;
  u._shieldPeak = 0;
}

/** One expiry tick for both parts of the Shield (see tickTimedMods). */
export function tickShieldTimers(u) {
  if ((u.shieldTicks || 0) > 0 && !--u.shieldTicks) {
    u.shield = stackLayer(u); // the ordinary Shield lapses; the layer stays
  }
  if ((u.stackShieldTicks || 0) > 0 && !--u.stackShieldTicks) {
    u.shield = Math.max(0, (u.shield || 0) - stackLayer(u));
    u.stackShield = 0;
    u.overhealLayer = 0;
    u.dispelLayer = 0;
  }
  if (!((u.shield || 0) > 0)) u._shieldPeak = 0;
}

/**
 * The Overheal Layer (Wax Cell / Honeycomb Flask): overhealing with that gear
 * banks into the stacking layer, holding at most `gear.overhealLayerPct` of
 * max Health of it, and refills as it is chipped away.
 */
function overhealLayer(u) {
  return Math.min(u.overhealLayer || 0, stackLayer(u));
}

/**
 * Bank up to `excess` overheal into the layer. Returns how much of the excess
 * it used, so whatever is left can still feed Reliquary's own Overheal. Runs
 * as the receiver (healUnit wraps it), so the receiver's Pearl Lacquer
 * enlarges both the layer and its cap, and its duration gear the timer.
 */
function addOverhealLayer(u, excess, capPct) {
  const boost = shieldAmount(1);
  const cap = (u.maxHp || 0) * capPct / 100 * boost;
  const room = Math.floor(cap - overhealLayer(u));
  if (room <= 0) return 0;
  const add = addStackingShield(u, Math.min(Math.round(excess * boost), room), buffTicks(u, OVERHEAL_SHIELD_TICKS));
  u.overhealLayer = overhealLayer(u) + add;
  return add / boost;
}

/**
 * POLICY: every point of Health a unit is given goes through healUnit --
 * the same rule damageUnit sets for damage, and for the same reason: Overheal
 * has to see the part of a heal that would otherwise be thrown away, and it
 * can only do that if there is one place where that overflow is visible.
 *
 * Callers pass the FINAL amount, already scaled by Healing Down
 * (healReceivedMultiplier) and already guarded by canBeHealed where that
 * applies -- this function only clamps to maxHp and banks the remainder.
 * Returns the Health actually restored, so callers keeping heal totals are
 * unaffected.
 *
 * Overheal turns the discarded excess into a Shield. Two sources grant it:
 *   - Wax Cell / Honeycomb Flask gear (`gear.overhealLayerPct`, a share of max
 *     Health) bank it into the stacking Overheal Layer (addOverhealLayer).
 *     This goes first.
 *   - Oathcub's Reliquary (`overhealPct`, a share of Defense) turns whatever
 *     excess is left into an ordinary Shield through applyShield, so the
 *     no-stacking rule holds for it -- it replaces a smaller Shield and is
 *     ignored by a larger one, rather than accumulating over a fight.
 *
 * The Light boss's self-heal deliberately does NOT come through here: a boss
 * keeps a separate shield pool spent by damageBoss (see damage.js), and
 * routing it would let a heal write to the wrong pool.
 */
const OVERHEAL_SHIELD_TICKS = 6;

/** Lifebinder Pendant: healing done by the current applier (the healer) --
 * self-heals, lifesteal and Heal Over Time (applyHealOverTime) included. */
export function healDoneMultiplier() {
  return 1 + (currentApplier()?.gear?.healDonePct || 0) / 100;
}

/**
 * HEAL LISTENERS: every heal that lands is announced as (healer, target,
 * healed), the healer being the current applier (null for a Heal Over Time
 * tick or regen). Registered by status.js for Radiant Shroud and Dawnlight
 * Halo, the same way hit listeners are.
 */
const healListeners = [];
export function onHealed(fn) {
  healListeners.push(fn);
}

/**
 * `lifesteal`: this heal is a lifesteal effect -- healing from damage dealt
 * (Bloodthirster-style gear, Venom Fang, Iglet's lifesteal). Vampiric Band
 * lets those Overheal into the stacking layer.
 */
export function healUnit(u, amount, { lifesteal = false, hotFrom = null } = {}) {
  if (!u || !(amount > 0) || u.hp <= 0) return 0;
  // Hungering Edge: nothing but its own lifesteal heals this creature.
  if (u.gear?.lifestealOnlyHeal && !lifesteal) return 0;
  // A Heal Over Time tick (`hotFrom` = whoever cast it): the caster's gear
  // was baked into the per-tick amount when it was applied, so only the
  // receiver's own gear applies now -- but it is still the caster's heal to
  // the heal listeners (Swiftgrace Band counts it).
  const healer = hotFrom || currentApplier();
  if (!hotFrom) {
    // Cantor's Beads: a heal on an ally also heals one more (the raw amount,
    // so that ally's own healing-received gear applies to it).
    const extra = extraAllyFor(u);
    if (extra) asSpread(() => healUnit(extra, amount, { lifesteal }));
  }
  // The healer's gear -- Lifebinder Pendant's healing done, an echoed
  // Special's (Echo Conch) reduced effectiveness -- and the receiver's:
  // Sunbeam Locket's healing received.
  const received = 1 + (u.gear?.healReceivedPct || 0) / 100;
  const giver = hotFrom ? 1 : healDoneMultiplier() * effectiveness();
  amount = Math.max(1, Math.round(amount * giver * received));
  const before = u.hp;
  u.hp = Math.min(u.maxHp, u.hp + amount);
  const healed = u.hp - before;
  // Halo Pin: the overflow of this healer's heals becomes a larger Overheal.
  const excess = (amount - healed) * (1 + (healer?.gear?.overhealGrantPct || 0) / 100);
  // Overheal is the RECEIVER's own passive, so its Shield is the receiver's
  // to strengthen -- not whichever healer happened to overflow it.
  let left = excess;
  // Wax Cell / Honeycomb Flask, plus Vampiric Band's share on a lifesteal
  // heal: the caps add, like any stacked gear.
  const layerCap = (u.gear?.overhealLayerPct || 0) + (lifesteal ? u.gear?.lifestealOverhealPct || 0 : 0);
  if (left > 0 && layerCap > 0) {
    left -= asPassive(u, () => addOverhealLayer(u, left, layerCap));
  }
  for (const fn of healListeners) fn(healer, u, healed);
  if (left > 0 && (u.overhealPct || 0) > 0) {
    const cap = ((u.def || 0) * u.overhealPct) / 100;
    if (cap > 0) asPassive(u, () => applyShield(u, Math.min(left, cap), OVERHEAL_SHIELD_TICKS));
  }
  return healed;
}

/**
 * Burn `dmg` through a unit's Shield pool first -- temporary bonus Health
 * from e.g. Pebbit's Boulder Hunker or Morusk's Blubber Wall. Returns
 * whatever damage is left over for Health.
 *
 * `vsShield` (Stormshell Mantle): the hit counts for that much more against
 * the Shield only -- whatever gets through to Health is back at normal size.
 */
export function absorbShield(u, dmg, vsShield = 1) {
  if ((u.shield || 0) <= 0 || dmg <= 0) return dmg;
  const absorbed = Math.min(u.shield, dmg * vsShield);
  const leftover = Math.max(0, dmg - absorbed / vsShield);
  // The stacking layer is the outermost part of the Shield, and the overheal
  // share the outermost part of that: both are spent first.
  const layer = stackLayer(u);
  u.shield -= absorbed;
  if (layer) {
    u.stackShield = Math.max(0, layer - absorbed);
    u.overhealLayer = Math.min(Math.max(0, (u.overhealLayer || 0) - absorbed), u.stackShield);
    u.dispelLayer = Math.min(Math.max(0, (u.dispelLayer || 0) - absorbed), u.stackShield);
    if (!u.stackShield) u.stackShieldTicks = 0;
  }
  return Math.round(leftover);
}

/** Stormshell Mantle: the current attacker's bonus against Shields. */
export function shieldBreakMultiplier(effectDamage) {
  if (effectDamage) return 1;
  return 1 + (currentApplier()?.gear?.shieldDmgPct || 0) / 100;
}

/**
 * Deal `dmg` to a unit: Shield first, then Health. Returns the full damage
 * dealt (including the shield-absorbed part) so callers can keep their damage
 * totals and charts unchanged.
 */
export function damageUnit(target, dmg, { pierceShield = false, effectDamage = false, redirected = false, shared = false, crit = false } = {}) {
  if (!target || dmg <= 0) return 0;
  if (!redirected) crit = claimCrit(currentApplier());
  // Intangible (Deep Submerge): can not be damaged at all -- every damage
  // source routes through here, so the immunity is engine-wide by design.
  if ((target.intangibleTicks || 0) > 0) return 0;
  // Lightning Rod: an attack redirected onto this creature (Protect, or
  // Guardian's Oath's share) charges its Special.
  if (redirected && !effectDamage && target.gear?.redirectChargePct && target.hp > 0 && target.abilChargeMax) {
    gainSpecialCharge(target, (target.abilChargeMax * target.gear.redirectChargePct) / 100);
  }
  // The attacker's gear, applied once at the top (never again on a Protect
  // redirect). Echo Conch scales EVERYTHING dealt during an echo, the caster's
  // own self-damage included; Hunter's Snare adds to its attacks on an
  // Immobilized creature (effect damage -- DoTs, reflects, hazards -- aside).
  const baseDmg = dmg;
  if (!redirected) {
    const mult = attackerDamageMultiplier(target, { effectDamage, crit });
    if (mult !== 1) dmg = Math.max(1, Math.round(dmg * mult));
  }
  const wasAlive = target.hp > 0;
  target._dodgedHit = false;
  target._redirectedTo = null;
  // Protect: hand the hit to the guardian before anything else resolves, so
  // it meets that creature's defenses rather than this one's. `redirected`
  // stops a chain -- two creatures guarding each other must not ping-pong.
  if (!effectDamage && !redirected && (target.protect?.stacks || 0) > 0) {
    const guard = target.protect.src;
    if (guard && guard !== target && guard.hp > 0 && (guard.intangibleTicks || 0) <= 0) {
      target.protect.stacks--;
      if (target.protect.stacks <= 0) target.protect = null;
      target._redirectedTo = guard;
      return damageUnit(guard, dmg, { pierceShield, effectDamage, redirected: true, crit });
    }
  }
  // Dodge: every Nth ability hit misses outright. Checked before Fortify so a
  // dodged swing does not also burn a Fortify stack.
  // A creature's own Dodge (Cragling) and Dodge gear (Featherweight Wrap):
  // one shared tally of hits taken, and each interval fires on its own count
  // (every 4th and every 6th dodge the 4th, 6th, 8th, 12th...).
  // Shadow Shroud's Dodge after a teleport: the next ability hit, once.
  if (!effectDamage && target._dodgeNext) {
    target._dodgeNext = false;
    return dodged(target);
  }
  const dodgeGear = gearTriggers(target, "dodgeEvery");
  if (!effectDamage && (target.dodgeEvery || dodgeGear.length)) {
    const n = (target.dodgeCounter = (target.dodgeCounter || 0) + 1);
    if ((target.dodgeEvery && n % target.dodgeEvery === 0) || dodgeGear.some((g) => n % g.dodgeEvery === 0)) return dodged(target);
  }
  // Expose: checked here, after Protect and Dodge, so only a hit this creature
  // actually takes spends a stack (a redirected hit spends the guardian's).
  const exposed = spendExpose(target, effectDamage);
  if (exposed !== 1) dmg = Math.max(1, Math.round(dmg * exposed));
  // Guardian's Oath: a Nearby ally wearing it takes a share of an ability hit
  // (through its own defenses) while it is healthy enough.
  if (!effectDamage && !redirected) {
    const oath = oathGuardianFor(target);
    if (oath) {
      const { guardian, pct } = oath;
      const share = Math.round((dmg * Math.min(100, pct)) / 100);
      if (share > 0) {
        damageUnit(guardian, share, { pierceShield, redirected: true, shared: true });
        dmg = Math.max(1, dmg - share);
      }
    }
  }
  // The target's own damage-reduction gear (see defenderDamageMultiplier).
  const guarded = defenderDamageMultiplier(target, { effectDamage, redirected: redirected && !shared });
  if (guarded !== 1) dmg = Math.max(1, Math.round(dmg * guarded));
  // Fortify: ability damage only. Halve it, then spend the stack that did it.
  if (!effectDamage && (target.fortifyStacks || 0) > 0) {
    dmg = Math.max(1, Math.round((dmg * (100 - FORTIFY_REDUCTION_PCT)) / 100));
    target.fortifyStacks--;
  }
  // Windbreak (Iglet's aura): unlike Fortify this reduces EVERY source,
  // effect damage included -- it is shelter, not a guard stance.
  if ((target.windbreakTicks || 0) > 0 && (target.windbreakPct || 0) > 0) {
    dmg = Math.max(1, Math.round((dmg * (100 - target.windbreakPct)) / 100));
  }
  const shieldBefore = target.shield || 0;
  let toHealth = pierceShield ? dmg : absorbShield(target, dmg, shieldBreakMultiplier(effectDamage));
  if (shieldBefore > 0 && !((target.shield || 0) > 0)) {
    const peak = Math.max(target._shieldPeak || 0, shieldBefore);
    target._shieldPeak = 0;
    for (const fn of shieldBreakListeners) fn(target, peak);
  }
  // Immortal (Silver Draught): Health can not be reduced below 1 -- the
  // clamp beats everything, shield-piercing damage included.
  const floor = (target.immortalTicks || 0) > 0 ? 1 : 0;
  // Last Breath Core: the first hit that would be fatal is negated outright,
  // and the wearer is briefly Immortal. Once per battle.
  const lastBreath = target.gear?.cheatDeathImmortalTicks || 0;
  if (lastBreath && !floor && !target._lastBreathUsed && target.hp > 0 && toHealth >= target.hp) {
    target._lastBreathUsed = true;
    toHealth = 0;
    target.immortalTicks = Math.max(target.immortalTicks || 0, lastBreath);
  }
  // The killing blow's damage past the Health that was left (Warpath Greaves).
  const overkill = Math.max(0, toHealth - Math.max(0, target.hp));
  target.hp = Math.max(floor, target.hp - toHealth);
  // Revive (Rekindle): a unit carrying the one-shot flag (set by its module
  // at battle start) returns at full Health the first time it would die.
  // Consuming it here means every damage source routes through it. Statuses
  // are deliberately kept -- a reborn phoenix doesn't mind still burning.
  if (target.hp <= 0 && target._reviveReady) {
    target._reviveReady = false;
    target.hp = target.maxHp;
  }
  // Phoenix Core: the same, once per battle, at a share of max Health. A
  // creature with both uses Rekindle first and keeps this for its next death.
  const phoenix = target.gear?.reviveHpPct || 0;
  if (target.hp <= 0 && phoenix && !target._gearReviveUsed) {
    target._gearReviveUsed = true;
    target.hp = Math.max(1, Math.round((target.maxHp * phoenix) / 100));
  }
  // Soul Lantern: an ally's lantern, once per battle, brings it back.
  if (target.hp <= 0 && wasAlive) {
    const lantern = battleRoster().find((a) => a !== target && a.hp > 0 && a.gear?.reviveAllyPct && !a._lanternUsed && sameSide(a, target));
    if (lantern) {
      lantern._lanternUsed = true;
      target.hp = Math.max(1, Math.round((target.maxHp * lantern.gear.reviveAllyPct) / 100));
    }
  }
  // Time of death, for defeat animations (ui/components/battleArtState.js).
  // Stamped here because every damage source routes through this function, and
  // only after the revive check so a reborn unit is not marked dead. Cleared
  // by that same revive path, so a second death re-stamps.
  if (target.hp <= 0) {
    if (!target.deathTime) target.deathTime = Date.now();
  } else if (target.deathTime) {
    target.deathTime = 0;
  }
  // Cicada Husk: the first time Health falls below half, slip away briefly.
  const husk = target.gear?.lowHpIntangibleTicks || 0;
  if (husk && target.hp > 0 && !target._huskUsed && target.hp < target.maxHp / 2) {
    target._huskUsed = true;
    target.intangibleTicks = Math.max(target.intangibleTicks || 0, husk);
  }
  // Twin Soul Crest: the first time an ally (the wearer included) falls below
  // the threshold, it is healed for a share of the wearer's max Health. Each
  // crest -- every wearer, every such item -- rescues each ally once, at its
  // own threshold.
  if (target.hp > 0 && target.uid != null) {
    for (const a of battleRoster()) {
      if (a.hp <= 0 || !sameSide(a, target)) continue;
      gearTriggers(a, "rescueBelowPct").forEach((g, i) => {
        const key = a.uid + ":" + i;
        const done = target._rescuedBy || (target._rescuedBy = {});
        if (done[key] || !(target.hp > 0) || !isBelow(target, g.rescueBelowPct)) return;
        done[key] = true;
        asPassive(a, () => healUnit(target, Math.round((a.maxHp * (g.rescueHealPct || 0)) / 100)));
      });
    }
  }
  if (wasAlive && target.hp <= 0) onDefeated(target, { overkill });
  announceHit(target, { baseDmg, dmg, crit, effectDamage });
  return dmg;
}

/** A hit that `target` Dodged: it lands nothing. Shale Anklet banks Attack
 * for the rest of the battle (read by gearAtkMultiplier in damage.js). */
function dodged(target) {
  target._dodgedHit = true;
  const step = target.gear?.dodgeAtkPct || 0;
  if (step) target._dodgeAtkPct = Math.min(target.gear.dodgeAtkMaxPct ?? Infinity, (target._dodgeAtkPct || 0) + step);
  return 0;
}

/** Guardian's Oath: the first living ally within Nearby (the 8 surrounding
 * tiles) of `target` that wears it and is above an Oath's Health threshold,
 * with the share it takes -- every such item of its that is above its own
 * threshold adds its share. */
function oathGuardianFor(target) {
  if (target.uid == null) return null;
  for (const a of battleRoster()) {
    if (a === target || a.hp <= 0 || !sameSide(a, target) || (a.intangibleTicks || 0) > 0) continue;
    if (Math.max(Math.abs(a.row - target.row), Math.abs(a.col - target.col)) > 1) continue;
    let pct = 0;
    for (const g of gearTriggers(a, "shareNearbyDmgPct")) if (a.hp > (a.maxHp * (g.shareAboveHpPct || 0)) / 100) pct += g.shareNearbyDmgPct;
    if (pct > 0) return { guardian: a, pct };
  }
  return null;
}
