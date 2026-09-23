// Damage formulas.

import { weakenMultiplier, statModMultiplier, restrainedSlowMultiplier, frostbiteMultiplier, dartShredMultiplier, critShredMultiplier, countBuffs } from "./status.js";
import { COOLDOWN_TICKS_AT_SPD_1, BASIC_ATTACK_DMG_MULT } from "./constants.js";
import { CREATURE_MAP } from "../data/creatures.js";
import { isUsingBasic, currentApplier, withApplier, withActiveAbility, battleRoster } from "./applier.js";
import { onDefeated, announceHit, onHitLanded, attackerDamageMultiplier, damageUnit } from "./hp.js";
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
  return ((unit && unit.critDmg) || 0) + ((unit && unit._auraCritDmgPct) || 0);
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
  return 1 + critDmgOf(unit) / 100;
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
export function gearAtkMultiplier(unit) {
  if (!unit || !unit.gear) return 1;
  const perBuff = unit.gear.atkPerBuffPct || 0;
  return 1 + ((unit._defeatAtkPct || 0) + (perBuff ? perBuff * countBuffs(unit) : 0)) / 100;
}

/**
 * Gear that raises Defense mid-battle, read by unitDamage's Defense:
 * Last Stand Crown, while its wearer is below its Health threshold.
 */
export function gearDefMultiplier(unit) {
  const pct = unit?.gear?.lowHpDefPct || 0;
  if (!pct || !(unit.hp < (unit.maxHp * (unit.gear.lowHpDefBelowPct || 0)) / 100)) return 1;
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
export function attackRoll(attacker) {
  return attacker.atk * gearAtkMultiplier(attacker) * (0.8 + Math.random() * 0.4) * critMultiplier(attacker);
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
  const atk = attacker.atk * weakenMultiplier(attacker) * statModMultiplier(attacker, "atk") * auraAtkMultiplier(attacker) * gearAtkMultiplier(attacker);
  const def = (defender.def || 20) * statModMultiplier(defender, "def") * passiveDefMultiplier(defender) * dartShredMultiplier(defender)
    * critShredMultiplier(defender) * gearDefMultiplier(defender);
  const roll = 0.8 + Math.random() * 0.4;
  return Math.max(1, Math.round(mitigatedDamage(atk, def) * roll * critMultiplier(attacker) * frostbiteMultiplier(water, defender)));
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
  let dmg = Math.max(1, Math.round(attackRoll(attacker) * weakenMultiplier(attacker) * statModMultiplier(attacker, "atk") * auraAtkMultiplier(attacker)));
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
  dmg = Math.max(1, Math.round(dmg * attackerDamageMultiplier(boss, { effectDamage })));
  const wasAlive = boss.hp > 0;
  if (boss.shield > 0) boss.shield = Math.max(0, boss.shield - dmg);
  else boss.hp = Math.max(0, boss.hp - dmg);
  if (wasAlive && boss.hp <= 0) onDefeated(boss);
  announceHit(boss, { baseDmg, dmg, crit, effectDamage });
  return dmg;
}

/** Ticks until a unit can act again, slowed by Slow/Shock and sped up by
 * Speed buffs -- and by Speed gear (Berserk Core), a flat share of the stat. */
export function attackCooldown(unit, penalty = 1) {
  // Floor of 2 ticks (1s). It was 3, which at the old 12-tick base was a
  // distant 4x ceiling; against a 4-tick base it would cap Speed at 1.33x
  // and make the stat nearly worthless.
  const gearSpd = 1 + (unit.gear?.spdPct || 0) / 100;
  return Math.max(2, Math.round((COOLDOWN_TICKS_AT_SPD_1 / (unit.spd * gearSpd * statModMultiplier(unit, "spd") * restrainedSlowMultiplier(unit))) * penalty));
}

/**
 * Thornback Plate: every Nth hit a creature takes from an enemy's ability,
 * it Counters -- its Basic damage turned on whoever hit it (the Counter tag:
 * "Attacks the creature that attacked it"). Lands as effect damage, like
 * every counter and reflect, so it is never itself countered: two Thornbacks
 * can't loop. Boss hits count too (tick.js names the boss as the applier
 * for its turn).
 */
onHitLanded((attacker, target, info) => {
  const every = target.gear?.counterEvery || 0;
  if (!every || info.effectDamage || target.hp <= 0 || !(attacker.hp > 0)) return;
  target._hitsTaken = (target._hitsTaken || 0) + 1;
  if (target._hitsTaken < every) return;
  target._hitsTaken = 0;
  withApplier(target, () => withActiveAbility(target, "unique", () => {
    if (attacker.uid == null) {
      const players = battleRoster().filter((u) => u.hp > 0 && u.uid?.[0] === "p");
      damageBoss(attacker, Math.max(1, Math.round(basicDamageToBoss(target, attacker, players))), { effectDamage: true });
    } else {
      damageUnit(attacker, Math.max(1, Math.round(basicUnitDamage(target, attacker))), { effectDamage: true });
    }
  }));
});
