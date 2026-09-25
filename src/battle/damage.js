// Damage formulas.

import { weakenMultiplier, statModMultiplier, restrainedSlowMultiplier, frostbiteMultiplier, dartShredMultiplier, critShredMultiplier, countBuffs, countDebuffs } from "./status.js";
import { COOLDOWN_TICKS_AT_SPD_1, BASIC_ATTACK_DMG_MULT } from "./constants.js";
import { CREATURE_MAP } from "../data/creatures.js";
import { isUsingBasic, currentApplier, withApplier, withActiveAbility, battleRoster } from "./applier.js";
import { onDefeated, announceHit, onHitLanded, attackerDamageMultiplier, damageUnit, spendExpose, hasAllyNearby, shieldBreakMultiplier, standsOnHazard, retaliationMultiplier, isBelow } from "./hp.js";
import { gearTriggers, triggersOn } from "./applier.js";
import { abilityHasTag } from "./abilityTags.js";
import { distToBoss } from "./geometry.js";
import { gainSpecialCharge } from "./charge.js";

/**
 * POLICY: crit is rolled in exactly TWO places -- attackRoll and unitDamage --
 * because between them they are the leaf of every damage formula in the game.
 * unitDamage does its own ±20% roll inline rather than calling attackRoll, and
 * playerDamageToBoss goes through attackRoll, so no path can roll twice.
 *
 * A crit is per damage instance, not per action: a special that hits four
 * enemies rolls four times, so a multi-target hit isn't all-or-nothing.
 *
 * Both halves are stats in percentage points, stamped on the unit in state.js:
 * `crit` is the chance, `critDmg` the extra damage (50 = half again). A unit
 * carrying neither reads 0 and simply never crits.
 *
 * Bosses crit too, but through their own roll in battle/bosses/context.js --
 * boss attacks never reach these formulas.
 */
/** critDmg plus whatever aura the unit is standing in (see status.js). */
function critDmgOf(unit) {
  // Critical Damage Up / Down stat mods (kind "critDmg") add their percent as
  // points of Critical Damage, the same way an aura's critDmgPct does.
  const mods = unit ? (statModMultiplier(unit, "critDmg") - 1) * 100 : 0;
  return ((unit && unit.critDmg) || 0) + ((unit && unit._auraCritDmgPct) || 0) + mods;
}

function critMultiplier(unit) {
  // Guaranteed Crit (Solar Pounce): skip the chance roll and always pay out
  // critDmg. Still only the two roll sites -- the flag just makes them
  // certain -- and withGuaranteedCrit below is the only thing that sets it.
  if (unit && unit._forceCrit) return landCrit(unit);
  const chance = (unit && unit.crit) || 0;
  if (!(Math.random() * 100 < chance)) return 1;
  return landCrit(unit);
}

/** A crit happened: pay crit gear, and flag it for the hit it belongs to
 * (claimed by damageUnit / damageBoss for hit listeners -- see hp.js). */
function landCrit(unit) {
  grantCritCharge(unit);
  unit._critLanded = true;
  // Prism Shard: a guaranteed crit (withGuaranteedCrit -- Solar Pounce,
  // Slayer's Band, Toxin Gland) hits harder still.
  const sure = unit._forceCrit ? 1 + (unit.gear?.guaranteedCritDmgPct || 0) / 100 : 1;
  return (1 + critDmgOf(unit) / 100) * sure;
}

/**
 * Cricket Chirp / Tuning Fork: a crit from the creature's Basic ability adds
 * a share of the special charge bar. Lives here because critMultiplier is the
 * one place a crit is decided (see the POLICY above); whether the roll came
 * from the Basic ability is tracked by tick.js (see isUsingBasic in
 * applier.js), so special and passive crits pay nothing.
 */
function grantCritCharge(unit) {
  const pct = unit.gear?.basicCritChargePct;
  if (!pct || !unit.abilChargeMax || !isUsingBasic(unit)) return;
  gainSpecialCharge(unit, (unit.abilChargeMax * pct) / 100);
}

/**
 * Attack multiplier from any aura the unit is standing in (see status.js),
 * plus `_passiveAtkPct`: a flat bonus a creature's own passive recomputes
 * each tick from some running state (Battery Shell's Charge). Kept apart from
 * stat mods on purpose -- a per-stack percentage that changes every tick has
 * no place in a five-stack table with a duration.
 */
function auraAtkMultiplier(unit) {
  return 1 + (((unit && unit._auraAtkPct) || 0) + ((unit && unit._passiveAtkPct) || 0)) / 100;
}

/**
 * POLICY: gear that raises Attack mid-battle, read wherever a formula takes a
 * creature's Attack (attackRoll, unitDamage) -- so it reaches Basics and
 * Specials alike:
 *   - Warlord's Trophy: its running total from defeats (`_defeatAtkPct`,
 *     banked by onDefeated in hp.js).
 *   - Warbuff Plate: a share per buff currently worn (countBuffs).
 */
export function gearAtkMultiplier(unit, target = null) {
  if (!unit || !unit.gear) return 1;
  const gear = unit.gear;
  // Warlord's Trophy, Jetstream Sigil, Rampage Shard, Whetstone, Shale
  // Anklet: running totals.
  let pct = (unit._defeatAtkPct || 0) + (unit._specialAtkPct || 0) + (unit._rampPct || 0) + (unit._killAtkPct || 0) + (unit._dodgeAtkPct || 0);
  if (gear.atkPerBuffPct) pct += gear.atkPerBuffPct * countBuffs(unit);
  // Tailwind Talon: a share per 0.1 of the creature's current Speed.
  if (gear.atkPerTenthSpdPct) pct += gear.atkPerTenthSpdPct * (effectiveSpeed(unit) / 0.1);
  // Duelist's Oath: against the first creature it damaged.
  if (gear.duelPct && target && unit._duelTarget === target) pct += gear.duelPct;
  return 1 + pct / 100;
}

/** Speed after every multiplier that shapes attack cadence (not Slow/Shock,
 * which lengthen the cooldown rather than lowering Speed). */
function effectiveSpeed(unit) {
  const gearSpd = 1 + ((unit.gear?.spdPct || 0) + (unit._specialSpdPct || 0) + lowHpSpdHastePct(unit)) / 100;
  return (unit.spd || 1) * gearSpd * statModMultiplier(unit, "spd") * restrainedSlowMultiplier(unit);
}

/** Adrenal Gland: Speed and Haste while below its Health threshold (Haste is
 * read by tickSpecialCharge in tick.js). */
export function lowHpSpdHastePct(unit) {
  let pct = 0;
  for (const g of gearTriggers(unit, "lowHpSpdHastePct")) if (isBelow(unit, g.lowHpSpdHasteBelowPct)) pct += g.lowHpSpdHastePct;
  return pct;
}

/**
 * A creature's Attack as the damage formulas read it: its own, what Blessing
 * Mantle lends it, and Titan's Keystone's share of its current Defense.
 */
function attackOf(unit) {
  const fromDef = unit.gear?.defToAtkPct ? (defenseOf(unit) * unit.gear.defToAtkPct) / 100 : 0;
  return (unit.atk || 0) + sharedStat(unit, "atk") + fromDef;
}

/**
 * POLICY: a creature's CURRENT Defense -- what an attack meets, and what
 * every Defense-based item reads (Titan's Keystone, Thornback Vest, Rebuke
 * Gauntlet, Geode Heart, Bedrock Slab): its own, Blessing Mantle's share,
 * Defense Up / Down, passives, shreds, and Defense gear (Last Stand Crown,
 * Rootbound Idol, Vanguard Pauldron...). `attacker` only matters for gear
 * that depends on who is attacking (Duelist's Oath).
 */
export function defenseOf(unit, attacker = null) {
  return ((unit.def || 20) + sharedStat(unit, "def")) * statModMultiplier(unit, "def") * passiveDefMultiplier(unit) * dartShredMultiplier(unit)
    * critShredMultiplier(unit) * gearDefMultiplier(unit, attacker) * hazardDefMultiplier(unit);
}

/**
 * Maelstrom Core: a creature standing on a Water Hazard has less Defense
 * while a living enemy of it wears the item (several don't add up).
 */
function hazardDefMultiplier(unit) {
  if (!unit?.uid || !standsOnHazard(unit, "water")) return 1;
  let pct = 0;
  for (const a of battleRoster()) {
    const p = a.gear?.waterHazardDefShredPct || 0;
    if (p > pct && a.hp > 0 && a.uid && a.uid[0] !== unit.uid[0]) pct = p;
  }
  return 1 - pct / 100;
}

/**
 * Gear that raises Defense mid-battle, read by unitDamage's Defense.
 */
export function gearDefMultiplier(unit, attacker = null) {
  const gear = unit?.gear;
  if (!gear) return 1;
  let pct = 0;
  // Rootbound Idol: while Rooted.
  if (gear.rootedDefPct && (unit.rootTicks || 0) > 0) pct += gear.rootedDefPct;
  // Last Stand Crown: while below its Health threshold.
  for (const g of gearTriggers(unit, "lowHpDefPct")) if (isBelow(unit, g.lowHpDefBelowPct)) pct += g.lowHpDefPct;
  // Squire's Plate: a share per debuff currently worn.
  if (gear.defPerDebuffPct) pct += gear.defPerDebuffPct * countDebuffs(unit);
  // Vanguard Pauldron: no ally Nearby.
  if (gear.loneDefPct && !hasAllyNearby(unit)) pct += gear.loneDefPct;
  // Duelist's Oath: against the first creature it damaged.
  if (gear.duelPct && attacker && unit._duelTarget === attacker) pct += gear.duelPct;
  return 1 + pct / 100;
}

/** The Defense twin of `_passiveAtkPct`; auras carry no Defense face today. */
function passiveDefMultiplier(unit) {
  return 1 + ((unit && unit._passiveDefPct) || 0) / 100;
}

/**
 * Run `fn` with every crit roll `unit` makes inside it guaranteed to land.
 * Wraps one ability's damage, so it covers whichever leaf that damage goes
 * through (attackRoll, unitDamage, playerDamageToBoss) without any of them
 * needing a new parameter. The flag is always restored, even if `fn` throws.
 */
export function withGuaranteedCrit(unit, fn) {
  const prev = unit._forceCrit;
  unit._forceCrit = true;
  try {
    return fn();
  } finally {
    unit._forceCrit = prev;
  }
}

/**
 * Base attack roll: ±20% spread around the attacker's power, times a crit.
 *
 * Takes the whole attacker rather than a bare ATK number -- it needs the
 * unit's crit chance, and every call site already had the unit in hand.
 */
export function attackRoll(attacker, target = null) {
  return attackOf(attacker) * gearAtkMultiplier(attacker, target) * (0.8 + Math.random() * 0.4) * critMultiplier(attacker);
}

/**
 * Blessing Mantle: a flat share of a living ally's own Attack or Defense,
 * added to this creature's for as long as that ally stands (its Health share
 * is granted at the start of battle and taken back when it falls -- see
 * tick.js / onDefeated). Several Mantles on a side each add their share.
 */
export function sharedStat(unit, stat) {
  if (!unit?.uid) return 0;
  let add = 0;
  for (const a of battleRoster()) {
    const pct = a.gear?.shareStatsPct || 0;
    if (!pct || a === unit || a.hp <= 0 || a.uid?.[0] !== unit.uid[0]) continue;
    add += ((a[stat] || 0) * pct) / 100;
  }
  return add;
}

/**
 * DEF mitigation: the hit is scaled by atk/(atk+def) rather than subtracting
 * a flat slice of DEF. Ratio mitigation can never zero out a hit -- the old
 * `raw - def*0.35` clamped tanky matchups to 1 damage per swing, stalling
 * them past the battle timer -- and it is level-invariant: HP/ATK/DEF all
 * grow by the same factor per level, so hits-to-kill between two same-level
 * units depends only on their base statlines.
 */
export function mitigatedDamage(atk, def) {
  if (atk <= 0) return 0;
  return atk * (atk / (atk + Math.max(0, def)));
}

/**
 * Unit-vs-unit damage, mitigated by the defender's DEF.
 * Used for player-vs-minion and minion-vs-player alike.
 */
export function unitDamage(attacker, defender) {
  // Frostbite: Water attackers hit the carrier harder (5% per stack).
  const water = CREATURE_MAP[attacker.creatureId]?.type === "Water";
  const atk = attackOf(attacker) * weakenMultiplier(attacker) * statModMultiplier(attacker, "atk") * auraAtkMultiplier(attacker) * gearAtkMultiplier(attacker, defender);
  const def = defenseOf(defender, attacker);
  const roll = 0.8 + Math.random() * 0.4;
  const crit = sureCritAgainst(attacker, defender) ? withGuaranteedCrit(attacker, () => critMultiplier(attacker)) : critMultiplier(attacker);
  return Math.max(1, Math.round(mitigatedDamage(atk, def) * roll * crit * frostbiteMultiplier(water, defender)));
}

/** Slayer's Band: a target below its Health threshold is always crit.
 * Toxin Gland: so is a Poisoned one. */
function sureCritAgainst(attacker, target) {
  if (!target || !(target.hp > 0)) return false;
  if (attacker?.gear?.alwaysCritPoisoned && (target.poisonTicks || 0) > 0) return true;
  return gearTriggers(attacker, "alwaysCritBelowPct").some((g) => isBelow(target, g.alwaysCritBelowPct));
}

/**
 * Player damage against a boss. Bosses have no DEF stat, so this is unmitigated
 * apart from the attacker's own Weaken debuff.
 *
 * The dark boss's Dark Shroud is applied here rather than in dark.js because it
 * modifies incoming damage rather than anything the boss does on its turn: the
 * more debuffs the party is carrying, the less it hurts the boss (floor 30%).
 *
 * Crit comes in through attackRoll, not from a second roll here.
 */
export function playerDamageToBoss(attacker, boss, aliveP) {
  const roll = sureCritAgainst(attacker, boss) ? withGuaranteedCrit(attacker, () => attackRoll(attacker, boss)) : attackRoll(attacker, boss);
  let dmg = Math.max(1, Math.round(roll * weakenMultiplier(attacker) * statModMultiplier(attacker, "atk") * auraAtkMultiplier(attacker)));
  if (boss._bossKey === "dark") {
    const debuffed = aliveP.filter(
      (p) => (p.dotTicks || 0) > 0 || (p.weakTicks || 0) > 0 || (p.healImmuneTicks || 0) > 0
    ).length;
    dmg = Math.max(1, Math.round(dmg * Math.max(0.3, 1 - debuffed * 0.1)));
  }
  return dmg;
}

/**
 * Basic-attack damage: the unit-vs-unit and vs-boss formulas scaled by
 * BASIC_ATTACK_DMG_MULT, so the faster attack cadence costs proportionally
 * smaller hits. Every basic attack goes through these -- the default flow in
 * tick.js and the custom basicAttack hooks alike -- while specials keep
 * calling unitDamage / playerDamageToBoss / attackRoll directly.
 */
export function basicUnitDamage(attacker, defender) {
  return unitDamage(attacker, defender) * BASIC_ATTACK_DMG_MULT;
}

export function basicDamageToBoss(attacker, boss, aliveP) {
  return playerDamageToBoss(attacker, boss, aliveP) * BASIC_ATTACK_DMG_MULT;
}

/**
 * Apply damage to a boss, letting any shield soak it first. The boss's twin
 * of damageUnit for the attacker's gear (attackerDamageMultiplier in hp.js),
 * Special charge on the defeat, and Basic-hit reactions. Returns the damage
 * actually applied.
 */
export function damageBoss(boss, dmg, { effectDamage = false } = {}) {
  const attacker = currentApplier();
  const crit = !!attacker?._critLanded;
  if (attacker) attacker._critLanded = false;
  const baseDmg = dmg;
  dmg = Math.max(1, Math.round(dmg * attackerDamageMultiplier(boss, { effectDamage, crit }) * spendExpose(boss, effectDamage)));
  const wasAlive = boss.hp > 0;
  const hpBefore = boss.hp;
  // Stormshell Mantle counts extra against the boss's shield pool too.
  if (boss.shield > 0) boss.shield = Math.max(0, boss.shield - Math.round(dmg * shieldBreakMultiplier(effectDamage)));
  else boss.hp = Math.max(0, boss.hp - dmg);
  if (wasAlive && boss.hp <= 0) onDefeated(boss, { overkill: dmg - hpBefore });
  announceHit(boss, { baseDmg, dmg, crit, effectDamage });
  return dmg;
}

/** Ticks until a unit can act again, slowed by Slow/Shock and sped up by
 * Speed buffs -- and by Speed gear (Berserk Core), a flat share of the stat. */
export function attackCooldown(unit, penalty = 1) {
  // Floor of 2 ticks (1s). It was 3, which at the old 12-tick base was a
  // distant 4x ceiling; against a 4-tick base it would cap Speed at 1.33x
  // and make the stat nearly worthless.
  // Brineplate: a Basic tagged Displace comes around sooner.
  const displace = unit.gear?.displaceCooldownPct && abilityHasTag(unit, "basic", "displace") ? 1 - unit.gear.displaceCooldownPct / 100 : 1;
  return Math.max(2, Math.round((COOLDOWN_TICKS_AT_SPD_1 / effectiveSpeed(unit)) * penalty * displace));
}

/**
 * Thornback Plate: every Nth hit a creature takes from an enemy's ability,
 * it Counters -- its Basic damage turned on whoever hit it (the Counter tag:
 * "Attacks the creature that attacked it"). Lands as effect damage, like
 * every counter and reflect, so it is never itself countered: two Thornbacks
 * can't loop. Boss hits count too (tick.js names the boss as the applier
 * for its turn).
 */
/** Deal `dmg` as `source`'s effect damage (never countered, reflected, or
 * dodged) to a creature or a boss. Shared by the retaliation gear below. */
function retaliate(source, victim, dmg) {
  withApplier(source, () => withActiveAbility(source, "unique", () => {
    if (victim.uid == null) damageBoss(victim, dmg, { effectDamage: true });
    else damageUnit(victim, dmg, { effectDamage: true });
  }));
}

/** Thornback Vest: every ability hit taken, whoever landed it takes a share
 * of this creature's Defense back. */
onHitLanded((attacker, target, info) => {
  const pct = target.gear?.thornsDefPct || 0;
  if (!pct || info.effectDamage || target.hp <= 0 || !(attacker.hp > 0)) return;
  retaliate(target, attacker, Math.max(1, Math.round((defenseOf(target) * pct) / 100)));
});

/** Capacitor Plate: every Nth ability hit taken, discharge its Basic damage
 * into every enemy Nearby (the 8 surrounding tiles; a boss whose body
 * touches them counts). */
onHitLanded((attacker, target, info) => {
  if (info.effectDamage || target.hp <= 0 || !gearTriggers(target, "dischargeEvery").length) return;
  // One tally of hits taken; each item discharges on its own interval.
  target._hitsForDischarge = (target._hitsForDischarge || 0) + 1;
  for (const g of triggersOn(target, "dischargeEvery", target._hitsForDischarge)) {
    if (target.hp <= 0) break;
    const players = battleRoster().filter((u) => u.hp > 0 && u.uid?.[0] === "p");
    for (const e of battleRoster()) {
      if (e.hp <= 0 || !e.uid || e.uid[0] === target.uid[0]) continue;
      if (Math.max(Math.abs(e.row - target.row), Math.abs(e.col - target.col)) > 1) continue;
      retaliate(target, e, Math.max(1, Math.round(basicUnitDamage(target, e))));
    }
    // The boss is an enemy of the player side only, and not in the roster.
    if (target.uid[0] === "p" && attacker.uid == null && attacker.hp > 0 && distToBoss(attacker, target.row, target.col) <= 1) {
      retaliate(target, attacker, Math.max(1, Math.round(basicDamageToBoss(target, attacker, players))));
    }
  }
});

onHitLanded((attacker, target, info) => {
  if (info.effectDamage || target.hp <= 0 || !(attacker.hp > 0) || !gearTriggers(target, "counterEvery").length) return;
  // One tally of hits taken; each item Counters on its own interval, so two
  // "every 4th" items both Counter on the 4th hit.
  target._hitsTaken = (target._hitsTaken || 0) + 1;
  for (const g of triggersOn(target, "counterEvery", target._hitsTaken)) {
    if (target.hp <= 0 || !(attacker.hp > 0)) break;
    // Rebuke Gauntlet: its counter carries a share of the counterer's Defense.
    // Bramble Cuff: Counters hit harder.
    const bonus = (defenseOf(target) * (g.counterBonusDefPct || 0)) / 100;
    const more = retaliationMultiplier(target, "counter");
    withApplier(target, () => withActiveAbility(target, "unique", () => {
      if (attacker.uid == null) {
        const players = battleRoster().filter((u) => u.hp > 0 && u.uid?.[0] === "p");
        damageBoss(attacker, Math.max(1, Math.round((basicDamageToBoss(target, attacker, players) + bonus) * more)), { effectDamage: true });
      } else {
        damageUnit(attacker, Math.max(1, Math.round((basicUnitDamage(target, attacker) + bonus) * more)), { effectDamage: true });
      }
    }));
  }
});
