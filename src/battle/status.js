// Status effects: damage-over-time and timed debuffs.
//
// DoT magnitudes scale off the boss's attack, so a level-10 boss's burn hurts
// more than a level-1 boss's. When the boss is dead they fall back to a flat 2.

import { damageUnit, FORTIFY_STACK_CAP, clearProtect, healUnit, clearShield, applyShield, onHitLanded, tickShieldTimers, healDoneMultiplier, clearSeeded, onHealed, canBeExecuted } from "./hp.js";
import { aChebDist } from "./geometry.js";
// constants.js imports nothing, so this cannot cycle.
import { STATUS_TICKS } from "./constants.js";
import { debuffTicks, buffTicks, debuffStacks, buffStacks, withApplier, resistsDebuff, effectiveness, asPassive, currentApplier, sameSide, extraAllyFor, asSpread } from "./applier.js";

/** Damage per tick for Burn, as a fraction of boss attack. Damage Over Time
 * and Poison scale off the victim instead -- see DOT_HEALTH_PCT below. */
const DOT_RATES = { burn: 0.04 };

/**
 * Damage Over Time is the exception: it scales off the AFFECTED creature's
 * max Health rather than off whoever applied it, so one stack costs the same
 * share of anyone's health bar -- a chip attacker's rot bites a boss exactly
 * as hard, proportionally, as it bites a common minion. Per stack, per tick.
 */
export const DOT_HEALTH_PCT = 0.5;

/** Per-tick DoT damage on a unit (or boss): a flat share of its own max HP. */
export function dotTickDamage(target) {
  return Math.max(1, Math.round(((target.maxHp || 0) * DOT_HEALTH_PCT) / 100));
}

function dotDamage(boss, rate) {
  return Math.max(1, Math.round(boss && boss.hp > 0 ? boss.atk * rate : 2));
}

/**
 * Apply every DoT and decrement every timed debuff on the player side.
 * Pushes its own FX; returns nothing.
 *
 * Ticked once per battle tick, after units act and before the boss acts.
 */
export function tickStatusEffects(aliveP, boss, newFx, now) {
  for (const u of aliveP) {
    // Burn — fire boss's Burning Touch (boss-ATK scaled), or an enemy
    // Emberstar's Burning Bond, which stores its own source ATK on the
    // target (the fire boss never sets burnSourceAtk).
    if ((u.burnTicks || 0) > 0) {
      const dmg = u.burnSourceAtk
        ? Math.max(1, Math.round(u.burnSourceAtk * 0.035))
        : dotDamage(boss, DOT_RATES.burn);
      damageUnit(u, dmg, { effectDamage: true });
      u.burnTicks--;
      // Expiry takes every stack with it, like the other over-time debuffs.
      if (!u.burnTicks) { u.burnStacks = 0; u.burnSourceAtk = 0; }
      newFx.push({ id: now + "brn" + u.uid, row: u.row, col: u.col, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    // Root's timer runs in tickTimedMods instead -- that one ticks BOTH
    // sides, and an enemy-side Root used to never expire.
    // Damage Over Time and Poison + weaken + heal-block — the dark boss's
    // Shadow DoT, the nature boss's Overgrowth, and every player-inflicted
    // one alike, all scaling off this creature's own max Health (see
    // DOT_HEALTH_PCT), multiplied by that flavor's stack count.
    const hurt = (dmg) => damageUnit(u, dmg, { effectDamage: true });
    tickOverTime(u, "dot", hurt, newFx, now);
    tickOverTime(u, "poison", hurt, newFx, now);
    if ((u.weakTicks || 0) > 0) u.weakTicks--;
    if ((u.healImmuneTicks || 0) > 0) u.healImmuneTicks--;
  }
}

/**
 * POLICY: every creature-inflicted Burn goes through applyBurn (Burning Bond,
 * Magma Fang, Inferno Breath). Stacks like the other over-time debuffs -- +1
 * per application, one shared refreshing timer, all stacks lost on expiry --
 * and through here it picks up the applier's duration and extra-stack gear.
 * The damage it ticks scales off `burnSourceAtk`, the latest applier's ATK.
 * (The fire boss writes its own boss-ATK Burn directly; bosses wear no gear.)
 */
export const BURN_STACK_CAP = 10;
export function applyBurn(target, sourceAtk) {
  if (resistsDebuff(target)) return;
  debuffLanded(target, !((target.burnTicks || 0) > 0));
  target.burnTicks = debuffTicks(target, STATUS_TICKS);
  target.burnStacks = Math.min((target.burnStacks || 0) + debuffStacks(target, 1), BURN_STACK_CAP);
  target.burnSourceAtk = sourceAtk;
}

/**
 * POLICY: a plain timer debuff -- one field counted down by the engine, no
 * stacks (Stun, Slow, Shock, Weaken, Heal Block, Marked, and the bosses'
 * flat Burn / Damage Over Time) -- is written through here rather than by
 * assigning the field, so every debuff passes resistsDebuff (Molted Skin).
 * `stretch` opts it into duration gear (Marked); hard control leaves it off.
 * The new timer replaces the old, per the control-effects-don't-stack policy.
 * Returns false when the debuff was resisted.
 */
export function applyTimedDebuff(u, field, ticks, { stretch = false } = {}) {
  if (!u || resistsDebuff(u)) return false;
  debuffLanded(u, !((u[field] || 0) > 0));
  u[field] = stretch ? debuffTicks(u, ticks) : ticks;
  return true;
}

/**
 * POLICY: every debuff helper reports what it landed here, `isNew` when the
 * target didn't already carry it -- a fresh debuff, or a new stack -- rather
 * than a refresh. The one place gear that reacts to debuffing reads from:
 * Umbral Thread heals the creature that inflicted a new debuff on an enemy.
 */
function debuffLanded(target, isNew) {
  // "New" = the target didn't already carry this debuff at all: a refresh, or
  // one more stack of something already on it, is not a new debuff.
  if (!isNew) return;
  const a = currentApplier();
  if (a === target) return; // self-inflicted: neither side's gear reacts
  // The receiving side -- Bedrock Slab: a Shield from its own Defense.
  const shieldPct = target.gear?.newDebuffShieldDefPct || 0;
  if (shieldPct && target.hp > 0 && target.uid != null) {
    asPassive(target, () => applyShield(target, ((target.def || 0) * shieldPct) / 100, STATUS_TICKS));
  }
  // The inflicting side -- Umbral Thread / Voidthread Cloak: a heal.
  if (!a || a.uid == null || a.hp <= 0) return;
  const pct = a.gear?.newDebuffHealPct || 0;
  if (!pct || (a.healImmuneTicks || 0) > 0) return;
  const amount = Math.round(((a.maxHp * pct) / 100) * healReceivedMultiplier(a));
  if (amount > 0) asPassive(a, () => healUnit(a, amount));
}

/**
 * Expose: each stack makes the next ability hit this creature takes deal 20%
 * more, spending the stack (spendExpose in hp.js). Stacks like the other
 * stacking debuffs -- +N per application, one shared refreshing timer,
 * capped -- and is dispellable.
 */
export const EXPOSE_STACK_CAP = 5;
export function applyExpose(u, stacks = 1) {
  if (!u || resistsDebuff(u)) return;
  debuffLanded(u, !((u.exposeTicks || 0) > 0));
  u.exposeStacks = Math.min(EXPOSE_STACK_CAP, ((u.exposeTicks || 0) > 0 ? u.exposeStacks || 0 : 0) + debuffStacks(u, stacks));
  u.exposeTicks = debuffTicks(u, STATUS_TICKS);
}

/**
 * Seeded (Sprout Locket): a Leech-Seed style debuff. Every tick it drains a
 * share of the carrier's max Health and heals whoever Seeded it for a share
 * of THEIR OWN max Health -- both percentages, so it hits a big-Health boss
 * harder but never heals the seeder more for it. It has no timer: it lasts
 * until dispelled (it is an ordinary dispellable debuff), until the carrier
 * falls, or until the seeder does. A seeder keeps ONE Seeded target at a
 * time (see the listener below).
 *
 * `seededBy` holds the seeder itself (like Protect's guardian), so the tick
 * can heal it and notice when it is gone; `seeded` is the flag the info
 * panel and the debuff count read.
 */
export function applySeeded(victim, seeder) {
  if (!victim || !seeder || victim === seeder || resistsDebuff(victim)) return false;
  debuffLanded(victim, !victim.seeded);
  victim.seeded = 1;
  victim.seededBy = seeder;
  seeder._seedTarget = victim;
  return true;
}

/** One Seeded tick on its carrier (from tickTimedMods). Runs as the seeder,
 * so a defeat it lands is the seeder's. */
function tickSeeded(u) {
  if (!u.seeded) return;
  const seeder = u.seededBy;
  if (!seeder || seeder.hp <= 0 || u.hp <= 0) { clearSeeded(u); return; }
  const gear = seeder.gear || {};
  // Verdant Weave: the seeder's Seeded drains and heals that much more.
  const potency = 1 + (gear.seedPotencyPct || 0) / 100;
  const drain = Math.max(1, Math.round(((u.maxHp || 0) * (gear.seedDrainPct || 0) * potency) / 100));
  withApplier(seeder, () => {
    if (u.uid == null) damageBossHp(u, drain);
    else damageUnit(u, drain, { effectDamage: true });
  });
  if ((seeder.healImmuneTicks || 0) <= 0) {
    const heal = Math.round(((seeder.maxHp * (gear.seedHealPct || 0) * potency) / 100) * healReceivedMultiplier(seeder));
    if (heal > 0) asPassive(seeder, () => healUnit(seeder, heal));
  }
  if (u.hp <= 0) clearSeeded(u);
}

/** A boss's Health pool has its own shield and no damageUnit; Seeded drains
 * it the way the bosses' own damage-over-time ticks do (straight to the
 * pool, shield first). */
function damageBossHp(boss, dmg) {
  if (boss.shield > 0) boss.shield = Math.max(0, boss.shield - dmg);
  else boss.hp = Math.max(0, boss.hp - dmg);
}

/** Sprout Locket: the first enemy this creature damages is Seeded; once
 * that one is free (dispelled, fallen), the next enemy it damages is. */
onHitLanded((attacker, target) => {
  if (!attacker.gear?.seedDrainPct || attacker.hp <= 0 || target.hp <= 0) return;
  const cur = attacker._seedTarget;
  if (cur && cur.seeded && cur.seededBy === attacker && cur.hp > 0) return;
  applySeeded(target, attacker);
});

/** Tideweave Wrap: each enemy a Special damages heals the caster. */
onHitLanded((attacker, target, info) => {
  const pct = attacker.gear?.specialHitHealPct || 0;
  if (!pct || info.ability !== "special" || info.effectDamage || attacker.uid == null || attacker.hp <= 0) return;
  if ((attacker.healImmuneTicks || 0) > 0) return;
  const amount = Math.round(((attacker.maxHp * pct) / 100) * healReceivedMultiplier(attacker));
  if (amount > 0) asPassive(attacker, () => healUnit(attacker, amount));
});

/** Cyclone Guard: hit by an enemy's ability, a Haste Up (one stack from this
 * source, refreshed by further hits, standard duration). */
onHitLanded((attacker, target, info) => {
  const pct = target.gear?.struckHastePct || 0;
  if (!pct || info.effectDamage || target.hp <= 0) return;
  withApplier(target, () => applyStatMod(target, { kind: "haste", pct, src: target.uid + ":struck", ticks: STATUS_TICKS }));
});

/** Gloomreaper Chain: an ability hit that leaves an enemy below the
 * threshold Executes it (never a boss -- see canBeExecuted in hp.js). */
onHitLanded((attacker, target, info) => {
  const below = attacker.gear?.executeBelowPct || 0;
  if (!below || info.effectDamage || !canBeExecuted(target)) return;
  if (target.hp * 100 >= target.maxHp * below) return;
  damageUnit(target, target.hp, { pierceShield: true });
});

/** Duelist's Oath: the first creature this one damages becomes its duel
 * target for the battle (read by gearAtkMultiplier / gearDefMultiplier). */
onHitLanded((attacker, target, info) => {
  if (!attacker.gear?.duelPct || attacker._duelTarget || info.effectDamage) return;
  attacker._duelTarget = target;
});

/** Radiant Shroud: healing an ally also dispels debuffs from it. */
onHealed((healer, target, healed) => {
  const n = healer?.gear?.healDispelDebuffs || 0;
  if (!n || healer === target || !(healed > 0) || !sameSide(healer, target)) return;
  for (let i = 0; i < n; i++) if (!dispelOneDebuff(target)) break;
});

/** Dawnlight Halo: being healed grants an Attack Up and a Critical Damage Up
 * (one stack each from this source, refreshed, standard duration). */
onHealed((healer, target, healed) => {
  const pct = target.gear?.healedBuffPct || 0;
  if (!pct || !(healed > 0) || target.hp <= 0) return;
  withApplier(target, () => {
    applyStatMod(target, { kind: "atk", pct, src: target.uid + ":healed", ticks: STATUS_TICKS });
    applyStatMod(target, { kind: "critDmg", pct, src: target.uid + ":healed", ticks: STATUS_TICKS });
  });
});

/**
 * Remove ONE random dispellable debuff (the Cleanse rules -- see
 * dispelDebuffs: Restrained and a self-applied stance Root stay). A negative
 * stat mod goes one stack at a time. Returns whether anything was removed.
 */
export function dispelOneDebuff(u) {
  const options = [];
  for (const m of u.statMods || []) if (m.pct < 0) options.push(() => u.statMods.splice(u.statMods.indexOf(m), 1));
  const timers = {
    burnTicks: () => { u.burnTicks = 0; u.burnStacks = 0; u.burnSourceAtk = 0; },
    dotTicks: () => { u.dotTicks = 0; u.dotStacks = 0; },
    poisonTicks: () => { u.poisonTicks = 0; u.poisonStacks = 0; },
    fearTicks: () => { u.fearTicks = 0; u.fearSourceUid = null; },
    tauntTicks: () => { u.tauntTicks = 0; u.tauntSourceUid = null; },
    frostbiteTicks: () => { u.frostbiteTicks = 0; u.frostbiteStacks = 0; },
    dartShredTicks: () => { u.dartShredTicks = 0; u.dartShredPct = 0; },
    critShredTicks: () => { u.critShredTicks = 0; u.critShredPct = 0; },
    exposeTicks: () => { u.exposeTicks = 0; u.exposeStacks = 0; },
  };
  for (const [field, clear] of Object.entries(timers)) if ((u[field] || 0) > 0) options.push(clear);
  for (const field of ["weakTicks", "healImmuneTicks", "slowTicks", "shockTicks", "stunTicks", "markedTicks"]) {
    if ((u[field] || 0) > 0) options.push(() => { u[field] = 0; });
  }
  if ((u.rootTicks || 0) > 0 && !u.rootUndispellable) options.push(() => { u.rootTicks = 0; });
  if (u.blinded) options.push(() => { u.blinded = false; });
  if (u.seeded) options.push(() => clearSeeded(u));
  if (!options.length) return false;
  options[Math.floor(Math.random() * options.length)]();
  return true;
}

/** Clay Bangle: each damaging ability hit has a chance to Slow its target. */
onHitLanded((attacker, target, info) => {
  const pct = attacker.gear?.slowOnHitChancePct || 0;
  if (!pct || info.effectDamage || target.uid == null || target.hp <= 0) return;
  if (Math.random() * 100 < pct) applyTimedDebuff(target, "slowTicks", STATUS_TICKS);
});

/** Capacitor Charm: hit by an enemy's ability, a chance to Expose the attacker. */
onHitLanded((attacker, target, info) => {
  const pct = target.gear?.exposeWhenHitChancePct || 0;
  if (!pct || info.effectDamage || target.hp <= 0) return;
  if (Math.random() * 100 < pct) withApplier(target, () => applyExpose(attacker));
});

/**
 * Gear that reacts to a creature MOVING itself -- a step or a teleport.
 * tick.js calls this from the two places a creature moves itself (being
 * pushed or pulled by an enemy doesn't count). Buffs from here are one stack
 * per source, refreshed rather than piled by further moves, for the standard
 * duration.
 */
export function onUnitMoved(u) {
  const gear = u?.gear;
  if (!gear || u.hp <= 0) return;
  // Charger's Greaves: the next Basic attack is stronger (hp.js reads this;
  // settleBasicAttack in tick.js spends it).
  if (gear.afterMoveAttackDmgPct) u._movedSinceAttack = true;
  withApplier(u, () => {
    // Breeze Feather: Attack Up and Speed Up.
    if (gear.moveAtkSpdPct) {
      applyStatMod(u, { kind: "atk", pct: gear.moveAtkSpdPct, src: u.uid + ":moved", ticks: STATUS_TICKS });
      applyStatMod(u, { kind: "spd", pct: gear.moveAtkSpdPct, src: u.uid + ":moved", ticks: STATUS_TICKS });
    }
    // Runner's Band: Haste Up.
    if (gear.moveHastePct) applyStatMod(u, { kind: "haste", pct: gear.moveHastePct, src: u.uid + ":moved", ticks: STATUS_TICKS });
  });
}

/**
 * How many debuffs a creature is carrying: each negative stat-mod stack, plus
 * one per other debuff active on it. Read by Squire's Plate.
 */
export function countDebuffs(u) {
  let n = 0;
  if (u.statMods) for (const m of u.statMods) if (m.pct < 0) n++;
  for (const f of ["burnTicks", "dotTicks", "poisonTicks", "rootTicks", "fearTicks", "weakTicks", "healImmuneTicks",
    "slowTicks", "shockTicks", "tauntTicks", "stunTicks", "markedTicks", "frostbiteTicks", "dartShredTicks",
    "critShredTicks", "exposeTicks"]) {
    if ((u[f] || 0) > 0) n++;
  }
  if (u.blinded) n++;
  if (u.seeded) n++;
  if ((u.restrainedStacks || 0) > 0) n++;
  return n;
}

/**
 * Magpie Brooch: every Nth Basic-ability hit steals one buff from whatever it
 * hit -- dispels it off the target and gives it to the attacker, keeping its
 * remaining duration/size. Picked at random from what the target carries
 * that a buff dispel could strip (see dispelBuffs): a positive stat-mod
 * stack, Shield, Fortify, Heal Over Time, Immortal. Undispellable buffs
 * (Intangible) can't be stolen; nor can Protect, which is a bond to a
 * specific guardian rather than something to carry off, or an aura, which
 * belongs to the field its emitter projects. A hit on a target with nothing
 * stealable still counts toward the next steal.
 *
 * The stolen buff lands with no gear applied (it is carried, not cast), so
 * the thief's duration/stack/Shield gear leaves it as it was.
 */
function stealableBuffs(from) {
  const out = [];
  for (const m of from.statMods || []) {
    if (m.pct > 0) out.push({ take: (to) => {
      from.statMods.splice(from.statMods.indexOf(m), 1);
      applyStatMod(to, { kind: m.kind, pct: m.pct, src: "stolen:" + m.kind, ticks: m.ticks, holdDuration: true });
    } });
  }
  // The whole Shield, stacking layer and all, arrives as one ordinary Shield.
  if ((from.shield || 0) > 0 && from.uid != null) out.push({ take: (to) => {
    const amount = from.shield, ticks = from.shieldTicks || STATUS_TICKS;
    clearShield(from);
    applyShield(to, amount, ticks);
  } });
  if ((from.fortifyStacks || 0) > 0) out.push({ take: (to) => {
    const stacks = from.fortifyStacks;
    from.fortifyStacks = 0;
    applyFortify(to, stacks);
  } });
  if ((from.hotTicks || 0) > 0) out.push({ take: (to) => {
    const amount = from.hotAmount, ticks = from.hotTicks;
    from.hotTicks = 0;
    from.hotAmount = 0;
    applyHealOverTime(to, amount, ticks);
  } });
  if ((from.immortalTicks || 0) > 0) out.push({ take: (to) => {
    to.immortalTicks = Math.max(to.immortalTicks || 0, from.immortalTicks);
    from.immortalTicks = 0;
  } });
  return out;
}

export function stealBuff(from, to) {
  if (!from || !to || from === to) return false;
  const options = stealableBuffs(from);
  if (!options.length) return false;
  const pick = options[Math.floor(Math.random() * options.length)];
  withApplier(null, () => pick.take(to));
  return true;
}

// Magpie Brooch counts Basic ATTACKS, so it fires from the per-attack pass
// in tick.js (settleBasicAttack) rather than from a per-hit listener here.

/**
 * Bloodthirster: the attacker recovers a share of all damage it deals, as
 * its own heal -- so Heal Block stops it, Healing Down shrinks it, and its
 * own Lifebinder Pendant grows it, like any heal it would receive.
 */
onHitLanded((attacker, target, info) => {
  // Bloodthirster / Leech Ring: all damage. Brawler's Grip: on top of that,
  // the damage of its abilities when it fights in Melee (a Melee creature).
  const melee = !info.effectDamage && !attacker.isRanged ? attacker.gear?.meleeLifestealPct || 0 : 0;
  const pct = (attacker.gear?.lifestealPct || 0) + melee;
  if (!pct || attacker.uid == null || attacker.hp <= 0 || !(info.dmg > 0)) return;
  if ((attacker.healImmuneTicks || 0) > 0) return;
  const amount = Math.round(((info.dmg * pct) / 100) * healReceivedMultiplier(attacker));
  if (amount > 0) asPassive(attacker, () => healUnit(attacker, amount, { lifesteal: true }));
});

/**
 * Shattercrit Ring: every critical hit shreds the target's Defense a little
 * more (see applyCritShred).
 */
onHitLanded((attacker, target, info) => {
  const pct = attacker.gear?.critShredPct || 0;
  if (!pct || !info.crit || info.effectDamage || target.uid == null) return;
  applyCritShred(target, pct, attacker.gear.critShredMaxPct || pct);
});

/**
 * Crit shred (Shattercrit Ring): a ramping Defense Down -- each application
 * adds `pct`, up to `maxPct`, on one shared refreshing timer, all of it lost
 * together on expiry. The Plume Dart shred's twin, kept separate so the two
 * stack with each other rather than sharing a cap. A dispellable debuff.
 */
export function applyCritShred(u, pct, maxPct) {
  if (resistsDebuff(u)) return;
  debuffLanded(u, !((u.critShredTicks || 0) > 0));
  u.critShredPct = Math.min(maxPct, (u.critShredPct || 0) + pct * debuffStacks(u, 1));
  u.critShredTicks = debuffTicks(u, STATUS_TICKS);
}
export function critShredMultiplier(u) {
  if ((u.critShredTicks || 0) <= 0) return 1;
  return Math.max(0, 1 - (u.critShredPct || 0) / 100);
}

/**
 * How many buffs a creature is wearing: each positive stat-mod stack, plus
 * one each for a Shield, Fortify, Protect, Heal Over Time, an aura it
 * emits, Immortal, Intangible, and Windbreak. Shared by Battery Shell's
 * "gains a buff" trigger and Warbuff Plate's per-buff Attack.
 */
export function countBuffs(u) {
  let n = 0;
  if (u.statMods) for (const m of u.statMods) if (m.pct > 0) n++;
  if ((u.shield || 0) > 0) n++;
  if ((u.fortifyStacks || 0) > 0) n++;
  if (u.protect && u.protect.stacks > 0) n++;
  if ((u.hotTicks || 0) > 0) n++;
  if (u.aura) n++;
  if ((u.immortalTicks || 0) > 0) n++;
  if ((u.intangibleTicks || 0) > 0) n++;
  if ((u.windbreakTicks || 0) > 0) n++;
  return n;
}

/**
 * Rooted units are held in place and NOTHING else: they still attack, and
 * they still cast their specials. The only thing Root takes away is
 * position -- walking (ctx.stepToward) and teleporting (ctx.relocate) both
 * refuse while it is up, so a special that has to close the distance simply
 * finds nowhere to go.
 */
export function isRooted(u) {
  return (u.rootTicks || 0) > 0;
}

/**
 * Fear (Dread Howl): the mirror of Taunt -- forced movement AWAY from
 * whoever inflicted it rather than toward them. A feared creature spends its
 * turn fleeing and can neither attack nor cast; its always-on passives still
 * run. Rooted-and-feared means it simply cowers in place.
 */
export function applyFear(u, sourceUid, ticks) {
  if (!u || u.uid == null || resistsDebuff(u)) return;
  debuffLanded(u, !((u.fearTicks || 0) > 0));
  u.fearTicks = ticks;
  u.fearSourceUid = sourceUid;
}

export function isFeared(u) {
  return (u.fearTicks || 0) > 0;
}

/** Slow and shock both halve action speed by doubling the cooldown. */
export function speedPenalty(u) {
  return (u.slowTicks || 0) > 0 || (u.shockTicks || 0) > 0 ? 2 : 1;
}

/** Weakened units deal 30% less damage. */
export function weakenMultiplier(u) {
  return (u.weakTicks || 0) > 0 ? 0.7 : 1;
}

// ── Stackable stat modifiers ─────────────────────────────────────────────
//
// ATK Up/Down, Speed Up/Down, DEF Down, and Healing Down all live in one
// per-source list (`u.statMods`). The rules:
//
//   - One source contributes AT MOST one stack per effect: reapplying from
//     the same source refreshes that stack's own duration (and magnitude),
//     never adds a second.
//   - Different sources stack, each with its own magnitude and its own
//     independent timer, so fielding several creatures with the same
//     buff/debuff is rewarded instead of wasted.
//   - Each effect (same stat, same direction) caps at 5 stacks. At the cap
//     a stronger newcomer replaces the weakest stack; a weaker one is
//     ignored.
//   - The total effect is the sum of the active stacks' percents.
//
// Entries: {kind:"atk"|"spd"|"def"|"heal", pct:<signed>, src, ticks}.
// Control debuffs (Root, Stun, Taunt, Slow, Shock, Weaken, Heal Block) and
// DoTs deliberately stay out of this system -- they don't stack.

export const STAT_MOD_STACK_CAP = 5;

/**
 * Effects whose total comes from a stacking table (indexed by stack count)
 * instead of summing each source's magnitude. Attack/Defense Down step
 * 15/20/25/30/40: middle stacks add a flat 5 each so a stat can't be zeroed
 * by piling on sources, and the 5th stack pays double, making a full stack
 * the clear payoff.
 *
 * Keys are `kind` + direction. Effects with no table here just sum their
 * stacks (Speed Up +25 each, Healing Down -20 each, Speed/Haste Down -5 each),
 * which is already linear, so both models agree. These tables are mirrored
 * by the `stacking` fields in ABILITY_TAG_DEFS (core/abilityText.js) --
 * keep the two in sync so the pills never lie.
 */
const STACK_TABLES = {
  "atk-": [15, 20, 25, 30, 40],
  "def-": [15, 20, 25, 30, 40],
};

/** Same stat, same direction = the same effect for stacking/cap purposes. */
function sameEffect(a, kind, pct) {
  return a.kind === kind && (a.pct < 0) === (pct < 0);
}

/**
 * Apply (or refresh) one source's stack of a stat modifier.
 * `src` is the applier's uid; anything falsy is treated as one shared
 * anonymous source.
 */
export function applyStatMod(u, { kind, pct, src, ticks = 6, holdDuration = false, environmental = false }) {
  if (!pct) return;
  if (pct < 0 && resistsDebuff(u, { environmental })) return;
  // Duration and extra-stack gear on whoever is applying this (see
  // battle/applier.js). The Chalices' extra stack is the one exception to
  // "one stack per source": it lands under its own sub-source, so it refreshes
  // and competes for the cap exactly like a second creature's stack would.
  // `holdDuration` opts out of duration gear only -- for while-inside stacks
  // (auras) whose short timer IS the "you left the field" rule.
  const debuff = pct < 0;
  if (!holdDuration) ticks = debuff ? debuffTicks(u, ticks) : buffTicks(u, ticks);
  const stacks = debuff ? debuffStacks(u, 1) : buffStacks(u, 1);
  const had = !!u.statMods && u.statMods.some((m) => sameEffect(m, kind, pct));
  let added = pushStatMod(u, kind, pct, src, ticks);
  for (let i = 1; i < stacks; i++) added = pushStatMod(u, kind, pct, (src ?? "anon") + ":extra" + i, ticks) || added;
  if (debuff) debuffLanded(u, added && !had);
  // Cantor's Beads: a buff on an ally reaches one more (never a while-active
  // stack -- those are re-stamped every tick and would never fall off).
  if (!debuff && !holdDuration) {
    const extra = extraAllyFor(u);
    if (extra) asSpread(() => applyStatMod(extra, { kind, pct, src, ticks, holdDuration: true }));
  }
}

/**
 * POLICY: a stat mod that lasts only WHILE some condition holds (standing in
 * an aura, being anchored, gripping a foe, a full battery) goes through here
 * rather than applyStatMod. It is re-stamped every tick the condition holds
 * and its short timer is what makes it lapse the moment the condition ends --
 * so duration gear must never stretch it, while extra-stack gear still
 * applies like any other stack.
 */
export const WHILE_ACTIVE_TICKS = 2;
export function applyWhileActiveStatMod(u, { kind, pct, src }) {
  applyStatMod(u, { kind, pct, src, ticks: WHILE_ACTIVE_TICKS, holdDuration: true });
}

/** One source's stack: refresh it if present, else add it within the cap.
 * Returns true when a NEW stack landed (not a refresh, not refused at cap). */
function pushStatMod(u, kind, pct, src, ticks) {
  const mods = (u.statMods ||= []);
  const mine = mods.find((m) => sameEffect(m, kind, pct) && m.src === src);
  if (mine) { mine.pct = pct; mine.ticks = ticks; return false; }
  const stacks = mods.filter((m) => sameEffect(m, kind, pct));
  if (stacks.length >= STAT_MOD_STACK_CAP) {
    const weakest = stacks.reduce((a, b) => (Math.abs(a.pct) <= Math.abs(b.pct) ? a : b));
    if (Math.abs(pct) <= Math.abs(weakest.pct)) return false;
    mods.splice(mods.indexOf(weakest), 1);
  }
  mods.push({ kind, pct, src, ticks });
  return true;
}

/**
 * Combined multiplier for one stat. Each direction is resolved separately:
 * table-driven effects read their total off STACK_TABLES by stack count,
 * everything else sums its stacks' percents.
 */
export function statModMultiplier(u, kind) {
  if (!u.statMods || !u.statMods.length) return 1;
  let sum = 0;
  for (const negative of [true, false]) {
    const stacks = u.statMods.filter((m) => m.kind === kind && (m.pct < 0) === negative);
    if (!stacks.length) continue;
    const table = STACK_TABLES[kind + (negative ? "-" : "+")];
    if (table) sum += (negative ? -1 : 1) * table[Math.min(stacks.length, table.length) - 1];
    else for (const m of stacks) sum += m.pct;
  }
  const mult = 1 + sum / 100;
  // Speed keeps a floor so stacked slows can never freeze a unit outright;
  // the rest just can't go negative (a fully Healing-Downed unit heals 0).
  return kind === "spd" ? Math.max(0.25, mult) : Math.max(0, mult);
}

/** Active stack count for one effect (kind + direction); for the info panel. */
export function statModStacks(u, kind, negative) {
  if (!u.statMods) return 0;
  return u.statMods.filter((m) => m.kind === kind && (m.pct < 0) === negative).length;
}

/** True if any negative stat mod is active (they count as cleansable debuffs). */
export function hasNegativeStatMods(u) {
  return !!u.statMods && u.statMods.some((m) => m.pct < 0);
}

/** Strip every negative stat mod (Cleanse); buff stacks are untouched. */
export function clearNegativeStatMods(u) {
  if (u.statMods) u.statMods = u.statMods.filter((m) => m.pct >= 0);
}

/** Strip every positive stat mod (buff dispel); debuffs are untouched. */
export function clearPositiveStatMods(u) {
  if (u.statMods) u.statMods = u.statMods.filter((m) => m.pct < 0);
}

/**
 * One expiry tick for stat mods: age every stack, drop the expired.
 * `negativeOnly` is for Pebbit's Stone Skin, which fast-forwards debuffs.
 */
export function tickStatMods(u, negativeOnly = false) {
  if (!u.statMods || !u.statMods.length) return;
  for (const m of u.statMods) if (!negativeOnly || m.pct < 0) m.ticks--;
  u.statMods = u.statMods.filter((m) => m.ticks > 0);
}

/**
 * Decrement every generic timed modifier on one unit (player, minion, or
 * boss): stat-mod stacks, Taunt, Shield, and Stun. Ticked once per battle
 * tick from each unit loop.
 */
/**
 * POLICY: every Taunt goes through applyTaunt.
 *
 * Works on a boss as well as a creature -- Taunt is the ONE control effect a
 * boss obeys (see tauntedTarget in bosses/context.js for why), and the boss's
 * tauntTicks expires through the same tickTimedMods timer everything else
 * uses. Every other CC still bounces off a boss.
 *
 * A new Taunt replaces the old outright rather than stacking, matching the
 * control-effect policy.
 */
export function applyTaunt(target, source, ticks = STATUS_TICKS) {
  if (!target || !source || target.hp <= 0 || source.uid == null) return false;
  if (resistsDebuff(target)) return false;
  debuffLanded(target, !((target.tauntTicks || 0) > 0));
  target.tauntTicks = ticks;
  target.tauntSourceUid = source.uid;
  return true;
}

/** True when this creature or boss can still be given a Taunt. */
export function isTauntable(target) {
  return !!target && target.hp > 0 && !isIntangible(target) && (target.tauntTicks || 0) <= 0;
}

/**
 * AURAS. A field a creature emits around itself, not a buff written onto the
 * creatures it helps -- which is what makes it behave the way an aura should.
 *
 * The aura lives on the EMITTER (`u.aura`). Nothing is stamped on the allies
 * inside it; instead refreshAuraFields recomputes, once per tick, what each
 * unit is currently standing in. Three of the four rules fall out of that for
 * free: walking in or out of the field takes effect immediately, an aura ends
 * the instant its emitter is defeated (a dead emitter is simply not scanned),
 * and two different auras both apply rather than colliding the way stacks of
 * one stat mod would. The fourth -- a set duration -- is the `ticks` counter
 * below, spent in tickTimedMods like every other timer.
 *
 * Size and contents are per-ability: an aura names its own `range` and the
 * bonuses it carries, so a future aura can be any shape of help at all.
 *
 * An aura has two faces. `ally` is what the emitter's own side gains inside
 * it; `enemy` is what the OTHER side suffers inside it (Discharge slows and
 * drains the enemies it reaches). Either may be omitted. Magnitudes on both
 * faces are written POSITIVE -- the enemy face is applied as a penalty by
 * refreshAuraFields, so {hastePct: 5} on `enemy` reads "-5% Haste". Each
 * face may carry:
 *   atkPct / critDmgPct / hastePct   flat percentages, summed across auras
 *   spdPct                           a Speed Up (ally) or Speed Down (enemy)
 *                                    stack, held for as long as the unit stays
 *                                    inside -- see refreshAuraFields
 * The older flat form ({atkPct, critDmgPct}) still works and means `ally`.
 */
export function applyAura(source, { range, ticks = STATUS_TICKS, ally, enemy, atkPct, critDmgPct }) {
  if (!source || !(range > 0)) return;
  const own = ally || { atkPct: atkPct || 0, critDmgPct: critDmgPct || 0 };
  source.aura = { range: auraRange(source, range), ticks: buffTicks(source, ticks), ally: own, enemy: enemy || null };
}

/**
 * POLICY: every aura's reach goes through auraRange -- applyAura's fields and
 * the passive auras that scan their own radius (Guardian Grove, Windbreak)
 * alike -- so Beacon Antler's "+1 range" reaches all of them.
 */
export function auraRange(source, base) {
  return base + ((source && source.gear?.auraRange) || 0);
}

/** Drop an emitter's aura outright (buff removal, or the emitter dying). */
export function clearAura(u) {
  if (u) u.aura = null;
}

// An aura's Speed stack is a while-active stack (applyWhileActiveStatMod): it
// survives to the next refresh while inside, and drops on the tick after
// leaving instead of lingering a full status duration.

/**
 * Recompute one side's aura totals for this tick. `units` is the side being
 * updated and `foes` the other: a unit is lifted by its own side's emitters
 * (their `ally` face) and hindered by the other side's (their `enemy` face).
 * Call it twice per tick, once per side. The emitter counts as standing in
 * its own field.
 *
 * Flat percentages land on `_auraAtkPct` / `_auraCritDmgPct` (read by
 * damage.js) and `_auraHastePct` (read by the charge step in tick.js).
 * Speed rides on the ordinary stat-mod system instead, one stack per aura,
 * re-stamped every tick a unit is inside and left to expire when it leaves --
 * so it stacks per source and shows in the info panel like any Speed Up.
 */
export function refreshAuraFields(units, foes) {
  if (!units || !units.length) return;
  for (const u of units) {
    u._auraAtkPct = 0;
    u._auraCritDmgPct = 0;
    u._auraHastePct = 0;
  }
  const paint = (src, face, sign) => {
    if (!face) return;
    for (const u of units) {
      if (u.hp <= 0) continue;
      if (aChebDist(src.row, src.col, u.row, u.col) > src.aura.range) continue;
      u._auraAtkPct += sign * (face.atkPct || 0);
      u._auraCritDmgPct += sign * (face.critDmgPct || 0);
      u._auraHastePct += sign * (face.hastePct || 0);
      // The emitter is the applier, so its extra-stack gear (the Chalices)
      // applies; duration gear does not -- the aura's own timer already
      // carries that (see applyAura), and this stack must drop on leaving.
      if (face.spdPct) withApplier(src, () => applyWhileActiveStatMod(u, { kind: "spd", pct: sign * face.spdPct, src: "aura" + src.uid }));
    }
  };
  for (const src of units) {
    if (src.aura && src.hp > 0 && (src.aura.ticks || 0) > 0) paint(src, src.aura.ally, 1);
  }
  for (const src of foes || []) {
    if (src.aura && src.hp > 0 && (src.aura.ticks || 0) > 0) paint(src, src.aura.enemy, -1);
  }
}

export function tickTimedMods(u) {
  tickStatMods(u);
  if (u.aura && (u.aura.ticks || 0) > 0 && !--u.aura.ticks) u.aura = null;
  if ((u.tauntTicks || 0) > 0) {
    u.tauntTicks--;
    if (!u.tauntTicks) u.tauntSourceUid = null;
  }
  tickShieldTimers(u);
  if ((u.stunTicks || 0) > 0) u.stunTicks--;
  if ((u.rootTicks || 0) > 0 && !--u.rootTicks) u.rootUndispellable = false;
  if ((u.fearTicks || 0) > 0 && !--u.fearTicks) u.fearSourceUid = null;
  if ((u.intangibleTicks || 0) > 0) u.intangibleTicks--;
  if ((u.markedTicks || 0) > 0) u.markedTicks--;
  if ((u.frostbiteTicks || 0) > 0) {
    u.frostbiteTicks--;
    if (!u.frostbiteTicks) u.frostbiteStacks = 0;
  }
  if ((u.immortalTicks || 0) > 0) u.immortalTicks--;
  if ((u.critShredTicks || 0) > 0 && !--u.critShredTicks) u.critShredPct = 0;
  if ((u.exposeTicks || 0) > 0 && !--u.exposeTicks) u.exposeStacks = 0;
  tickSeeded(u);
  // Dewdrop Charm: a permanent Heal Over Time of its own -- kept apart from
  // the Heal Over Time buff, whose one shared slot would otherwise make any
  // ally's timed HoT permanent too. Heal Block and Healing Down apply.
  const regen = u.gear?.regenPctPerTick || 0;
  if (regen && u.hp > 0 && u.hp < u.maxHp && (u.healImmuneTicks || 0) <= 0) {
    const amt = Math.max(1, Math.round(((u.maxHp * regen) / 100) * healReceivedMultiplier(u)));
    asPassive(u, () => healUnit(u, amt));
  }
  if ((u.dartShredTicks || 0) > 0) {
    u.dartShredTicks--;
    if (!u.dartShredTicks) u.dartShredPct = 0;
  }
  // Windbreak's aura decays on its own once its source stops refreshing it
  // (the Iglet died, or the ally walked out of range) -- see applyWindbreak.
  if ((u.windbreakTicks || 0) > 0) {
    u.windbreakTicks--;
    if (!u.windbreakTicks) u.windbreakPct = 0;
  }
  // Heal Over Time: restore hotAmount per tick. Heal Block and Healing Down
  // apply at each tick, like any other heal (5 Healing Down stacks = 0).
  if ((u.hotTicks || 0) > 0) {
    u.hotTicks--;
    if ((u.healImmuneTicks || 0) <= 0 && u.hp > 0) {
      const amt = Math.round((u.hotAmount || 1) * healReceivedMultiplier(u));
      if (amt > 0) healUnit(u, amt);
    }
    if (!u.hotTicks) u.hotAmount = 0;
  }
}

/**
 * Plume Dart's ramping Defense shred (Quetzalis line): every landed dart
 * shaves another slice off the victim's DEF, up to the cap. One shared
 * refreshing timer, all progress lost on expiry -- a grind, distinct from
 * the per-source Defense Down stat mod (both multiply in unitDamage).
 */
export const DART_SHRED_CAP_PCT = 50;
export function applyDartShred(u, pct) {
  if (resistsDebuff(u)) return;
  debuffLanded(u, !((u.dartShredTicks || 0) > 0));
  u.dartShredPct = Math.min(DART_SHRED_CAP_PCT, (u.dartShredPct || 0) + pct * debuffStacks(u, 1));
  u.dartShredTicks = debuffTicks(u, 6);
}
export function dartShredMultiplier(u) {
  if ((u.dartShredTicks || 0) <= 0) return 1;
  return Math.max(0, 1 - (u.dartShredPct || 0) / 100);
}

/**
 * Blind (Pollen Veil at max level): the carrier's next basic attack misses
 * outright -- no damage, and none of the on-hit effects that swing would have
 * carried. The miss consumes it, so it costs exactly one swing.
 *
 * The mirror image of Dodge in hp.js: same missed hit, but worn by the
 * attacker rather than the defender. Deliberately a plain boolean -- it does
 * not stack, and a second application just re-arms the same single miss.
 * Scoped to basic attacks: specials are abilities, not attacks.
 */
export function applyBlind(u) {
  if (resistsDebuff(u)) return;
  debuffLanded(u, !u.blinded);
  u.blinded = true;
}

export function isBlinded(u) {
  return !!u.blinded;
}

/** Spend the Blind if present; true when this swing should miss. */
export function consumeBlind(u) {
  if (!u.blinded) return false;
  u.blinded = false;
  return true;
}

/**
 * Over-time debuffs: Damage Over Time (Carrion Rip, Spectral Rake, and the
 * dark boss's Shadow DoT) and Poison (the nature boss's Overgrowth), which
 * are the SAME effect wearing two names. Both stack like Burn -- +N per
 * application, one shared refreshing timer, all of it lost together on
 * expiry -- and every stack adds another helping of the per-tick damage, so
 * 3 stacks hurt three times as much.
 *
 * They are deliberately separate debuffs rather than one pooled counter:
 * a creature can carry both at once, each with its own stacks and its own
 * timer, and an ability that consumes one leaves the other alone.
 *
 * The damage comes from the VICTIM's max Health (dotTickDamage above), not
 * from whoever applied it, so no inflicter identity needs storing here.
 */
export const DOT_STACK_CAP = 5;
export const POISON_STACK_CAP = DOT_STACK_CAP;
/** Standard debuff duration; matches STATUS_TICKS in battle/constants.js. */
const OVER_TIME_TICKS = 6;

/**
 * The two flavors, and which fields each one keeps its state in. `fx` is the
 * effect flag the battle screens render it with (purple rot vs green venom).
 */
export const OVER_TIME_FLAVORS = {
  dot: { ticks: "dotTicks", stacks: "dotStacks", fx: "isDark", fxKey: "dot" },
  poison: { ticks: "poisonTicks", stacks: "poisonStacks", fx: "isPoison", fxKey: "psn" },
};

export function applyOverTime(u, flavor, stacks = 1) {
  if (resistsDebuff(u)) return;
  const f = OVER_TIME_FLAVORS[flavor];
  debuffLanded(u, !((u[f.ticks] || 0) > 0));
  u[f.stacks] = Math.min(DOT_STACK_CAP, (u[f.stacks] || 0) + debuffStacks(u, stacks));
  u[f.ticks] = debuffTicks(u, OVER_TIME_TICKS);
}

/** Stacks currently carried -- at least 1 while the effect is running at all. */
export function overTimeStacks(u, flavor) {
  const f = OVER_TIME_FLAVORS[flavor];
  return (u[f.ticks] || 0) > 0 ? Math.max(1, u[f.stacks] || 0) : 0;
}

/**
 * Strip one flavor outright and report how many stacks were taken, for
 * abilities that consume it (Gorge eats the rot for bonus damage).
 */
export function clearOverTime(u, flavor) {
  const f = OVER_TIME_FLAVORS[flavor];
  const taken = overTimeStacks(u, flavor);
  u[f.ticks] = 0;
  u[f.stacks] = 0;
  return taken;
}

/**
 * Tick one flavor on one target: damage scaled by stacks, decrement, and drop
 * the stacks when the timer runs out. Returns true if it fired.
 *
 * `damage` is injected because units go through damageUnit and the boss
 * through damageBoss; `uid` likewise, because the boss has none of its own.
 */
export function tickOverTime(u, flavor, damage, newFx, now, fxPrefix = "", uid = u.uid) {
  const f = OVER_TIME_FLAVORS[flavor];
  if ((u[f.ticks] || 0) <= 0) return false;
  damage(dotTickDamage(u) * Math.max(1, u[f.stacks] || 0));
  u[f.ticks]--;
  if (!u[f.ticks]) u[f.stacks] = 0;
  newFx.push({ id: now + fxPrefix + f.fxKey + uid, row: u.row, col: u.col, t: now, [f.fx]: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
  return true;
}

// Named wrappers -- the two flavors read better at their call sites than
// applyOverTime(u, "dot") does, and modules only ever want one of them.
export const applyDot = (u, stacks = 1) => applyOverTime(u, "dot", stacks);
export const dotStacks = (u) => overTimeStacks(u, "dot");
export const clearDot = (u) => clearOverTime(u, "dot");

export const applyPoison = (u, stacks = 1) => applyOverTime(u, "poison", stacks);
export const poisonStacks = (u) => overTimeStacks(u, "poison");
export const clearPoison = (u) => clearOverTime(u, "poison");

/**
 * Frostbite (Cryo Bomb at max level): Water creatures deal 5% more damage
 * to the carrier per stack. Stacks like Burn -- +1 per application with one
 * shared refreshing timer -- capped at 5 (+25%).
 */
export const FROSTBITE_STACK_CAP = 5;
export function applyFrostbite(u) {
  if (resistsDebuff(u)) return;
  debuffLanded(u, !((u.frostbiteTicks || 0) > 0));
  u.frostbiteStacks = Math.min(FROSTBITE_STACK_CAP, (u.frostbiteStacks || 0) + debuffStacks(u, 1));
  u.frostbiteTicks = debuffTicks(u, 6);
}
export function frostbiteMultiplier(attackerIsWater, defender) {
  if (!attackerIsWater || (defender.frostbiteTicks || 0) <= 0) return 1;
  return 1 + (defender.frostbiteStacks || 0) * 0.05;
}

/**
 * Fortify (Hunker In): stacks that halve incoming ability damage, spent one
 * per hit. The reduction and the spending both live in hp.js's damageUnit
 * (the single damage chokepoint); this is just the granting side.
 *
 * Deliberately timerless -- stacks leave only by being spent -- so it is NOT
 * ticked in tickTimedMods. It is an ordinary dispellable buff by design;
 * nothing in the game strips buffs today, so that only matters once
 * something does (dispelDebuffs clears debuffs and must never touch it).
 */
export function applyFortify(u, stacks) {
  const extra = extraAllyFor(u);
  if (extra) asSpread(() => applyFortify(extra, stacks));
  u.fortifyStacks = Math.min(FORTIFY_STACK_CAP, (u.fortifyStacks || 0) + buffStacks(u, stacks));
}

export function hasFortify(u) {
  return (u.fortifyStacks || 0) > 0;
}

/**
 * Windbreak (Iglet's passive): a while-in-range aura cutting damage taken for
 * nearby allies, applied fresh by the source every tick.
 *
 * `tickKey` is the tick's shared timestamp (ctx.now): the first writer in a
 * tick clears last tick's value, and later writers max against it, so several
 * Iglets never stack -- the strongest shelters, and a dead one's value can't
 * linger. tickTimedMods expires it two ticks after the last refresh.
 */
export function applyWindbreak(u, pct, tickKey) {
  if (u._windbreakAt !== tickKey) {
    u.windbreakPct = 0;
    u._windbreakAt = tickKey;
  }
  u.windbreakPct = Math.max(u.windbreakPct || 0, pct);
  u.windbreakTicks = 2;
}

/**
 * Heal Over Time (e.g. Shared Flame at max level): a BUFF -- untouched by
 * dispelDebuffs -- restoring `perTick` Health per tick, ticked in
 * tickTimedMods above. One shared timer; reapplying keeps the stronger
 * per-tick amount and the longer remaining duration, never stacks.
 */
export function applyHealOverTime(u, perTick, ticks = 6) {
  const extra = extraAllyFor(u);
  if (extra) asSpread(() => applyHealOverTime(extra, perTick, ticks));
  // The healer's gear, baked in now (the ticks later run with no applier):
  // Lifebinder Pendant's healing done, and an echo's reduced effectiveness.
  perTick = Math.max(1, Math.round(perTick * healDoneMultiplier() * effectiveness()));
  u.hotAmount = Math.max(u.hotAmount || 0, perTick);
  u.hotTicks = Math.max(u.hotTicks || 0, buffTicks(u, ticks));
}

/**
 * Strip every dispellable debuff from a unit: DoTs, control effects
 * (including Marked), and negative stat-mod stacks. Buffs are untouched.
 * Restrained is deliberately NOT cleared -- it is undispellable by design.
 * Used by Soothing Hoot's Cleanse and Vanishing Act's self-dispel.
 */
/**
 * Root a unit for `ticks`. `undispellable` marks a Root the creature put on
 * ITSELF as a stance (Siegefin's Holdfast) rather than one an enemy inflicted:
 * dispelDebuffs leaves it alone, so the same ability can cleanse everything
 * else without immediately undoing its own anchor.
 */
export function applyRoot(u, ticks, { undispellable = false } = {}) {
  // A self-applied stance Root is not inflicted, so resistsDebuff lets it by.
  if (resistsDebuff(u)) return;
  debuffLanded(u, !((u.rootTicks || 0) > 0));
  u.rootTicks = Math.max(u.rootTicks || 0, ticks);
  u.rootUndispellable = !!undispellable;
}

/**
 * Strip every dispellable BUFF -- the mirror of dispelDebuffs, and the
 * game's first buff removal (Solar Pounce's max tier). Positive stat mods,
 * Shield, Fortify, Protect, Heal Over Time, and Immortal all come off.
 *
 * Deliberately left alone: Intangible (its tag is marked undispellable),
 * Windbreak (a while-in-range aura its source re-applies every tick, so
 * stripping it would just undo itself next tick), and properties that were
 * never "applied" as buffs at all -- Cragling's Dodge interval, Rekindle's
 * one-shot Revive, a Wisp's link to its summoner.
 */
export function dispelBuffs(u) {
  clearPositiveStatMods(u);
  clearShield(u);
  u.fortifyStacks = 0;
  clearProtect(u);
  u.hotTicks = 0;
  u.hotAmount = 0;
  u.immortalTicks = 0;
}

export function dispelDebuffs(u) {
  u.burnTicks = 0;
  u.burnStacks = 0;
  u.burnSourceAtk = 0;
  // A self-inflicted stance Root survives (see applyRoot).
  if (!u.rootUndispellable) u.rootTicks = 0;
  u.dotTicks = 0;
  u.dotStacks = 0;
  u.poisonTicks = 0;
  u.poisonStacks = 0;
  u.blinded = false;
  u.fearTicks = 0;
  u.fearSourceUid = null;
  u.weakTicks = 0;
  u.healImmuneTicks = 0;
  u.slowTicks = 0;
  u.shockTicks = 0;
  u.tauntTicks = 0;
  u.tauntSourceUid = null;
  u.stunTicks = 0;
  u.markedTicks = 0;
  u.frostbiteTicks = 0;
  u.frostbiteStacks = 0;
  u.dartShredTicks = 0;
  u.dartShredPct = 0;
  u.critShredTicks = 0;
  u.critShredPct = 0;
  u.exposeTicks = 0;
  u.exposeStacks = 0;
  clearSeeded(u);
  clearNegativeStatMods(u);
}

/**
 * Intangible (Deep Submerge): can not be targeted or damaged; enemies
 * targeting this creature change targets. Its tile stays occupied. The
 * timer lives here; the damage gate lives in hp.js and the targeting
 * exclusions in tick.js / bosses/context.js.
 */
export function isIntangible(u) {
  return (u.intangibleTicks || 0) > 0;
}

/** Healing received multiplier: stacked Healing Down, floor 0 (no healing). */
export function healReceivedMultiplier(u) {
  return statModMultiplier(u, "heal");
}

/** Stunned units (Overload Sting) can't attack and gain no special charge. */
export function isStunned(u) {
  return (u.stunTicks || 0) > 0;
}

/**
 * Restrained (Shockstinger line): stacks applied on hit gate Overload Sting
 * (20+ to fire); while any stacks are on the carrier, Static Grip slows it
 * by the strongest applier's percentage. It has no timer and can't be
 * Cleansed. Two things take it off: Overload Sting consuming the stacks, and
 * the carrier getting out of the inflicter's reach (see tickRestrained).
 *
 * Stacks are tracked PER SOURCE -- `u.restrained` is a list of
 * {src, stacks, pct, range} -- because the leash is measured from whoever
 * applied them: walking away from one scorpion shouldn't shake off another's
 * grip. `restrainedStacks` and `restrainedSlowPct` are kept in sync as the
 * aggregate totals, which is all the rest of the engine reads.
 */
function syncRestrained(u) {
  const list = u.restrained || [];
  u.restrainedStacks = list.reduce((n, r) => n + r.stacks, 0);
  u.restrainedSlowPct = list.reduce((p, r) => Math.max(p, r.pct), 0);
}

/**
 * Add stacks from one source. `range` is the INFLICTER's attack reach, stored
 * per entry so the leash check doesn't need to look the applier's kit back up.
 */
export function applyRestrained(target, srcUid, stacks, slowPct, range) {
  if (!target || target.uid == null || resistsDebuff(target)) return;
  debuffLanded(target, !((target.restrainedStacks || 0) > 0));
  const list = target.restrained || (target.restrained = []);
  let entry = list.find((r) => r.src === srcUid);
  if (!entry) list.push((entry = { src: srcUid, stacks: 0, pct: 0, range }));
  entry.stacks += debuffStacks(target, stacks);
  entry.pct = Math.max(entry.pct, slowPct);
  entry.range = range;
  syncRestrained(target);
}

/** Strip every stack from every source (Overload Sting spending them). */
export function clearRestrained(u) {
  u.restrained = [];
  syncRestrained(u);
}

/**
 * Drop the stacks of any source that can no longer reach this carrier: the
 * inflicter walked off, the carrier walked off, or the inflicter was
 * defeated (a creature that has left the field has no range to be inside).
 *
 * Run once per tick after everything has finished moving, so it reads final
 * positions. `findUnit` resolves an applier's uid against BOTH sides, since
 * the carrier is always on the opposite one.
 */
export function tickRestrained(units, findUnit) {
  for (const u of units) {
    const list = u.restrained;
    if (!list || !list.length) continue;
    const kept = list.filter((r) => {
      const src = findUnit(r.src);
      if (!src || src.hp <= 0) return false;
      return aChebDist(src.row, src.col, u.row, u.col) <= r.range;
    });
    if (kept.length === list.length) continue;
    u.restrained = kept;
    syncRestrained(u);
  }
}

export function restrainedSlowMultiplier(u) {
  if ((u.restrainedStacks || 0) <= 0) return 1;
  return Math.max(0, 1 - (u.restrainedSlowPct || 0) / 100);
}

// Shield absorption itself lives in battle/hp.js (see absorbShield /
// damageUnit) so that every damage source shares one path; this file only
// owns the Shield's timer, in tickTimedMods above.
