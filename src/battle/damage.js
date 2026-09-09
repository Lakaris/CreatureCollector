// Damage formulas.

import { weakenMultiplier, statModMultiplier, restrainedSlowMultiplier, frostbiteMultiplier, dartShredMultiplier } from "./status.js";
import { COOLDOWN_TICKS_AT_SPD_1, BASIC_ATTACK_DMG_MULT } from "./constants.js";
import { CREATURE_MAP } from "../data/creatures.js";

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
  if (unit && unit._forceCrit) return 1 + critDmgOf(unit) / 100;
  const chance = (unit && unit.crit) || 0;
  if (!(Math.random() * 100 < chance)) return 1;
  return 1 + critDmgOf(unit) / 100;
}

/** Attack multiplier from any aura the unit is standing in (see status.js). */
function auraAtkMultiplier(unit) {
  return 1 + ((unit && unit._auraAtkPct) || 0) / 100;
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
  return attacker.atk * (0.8 + Math.random() * 0.4) * critMultiplier(attacker);
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
  const atk = attacker.atk * weakenMultiplier(attacker) * statModMultiplier(attacker, "atk") * auraAtkMultiplier(attacker);
  const def = (defender.def || 20) * statModMultiplier(defender, "def") * dartShredMultiplier(defender);
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

/** Apply damage to a boss, letting any shield soak it first. */
export function damageBoss(boss, dmg) {
  if (boss.shield > 0) boss.shield = Math.max(0, boss.shield - dmg);
  else boss.hp = Math.max(0, boss.hp - dmg);
}

/** Ticks until a unit can act again, slowed by Slow/Shock and sped up by Speed buffs. */
export function attackCooldown(unit, penalty = 1) {
  // Floor of 2 ticks (1s). It was 3, which at the old 12-tick base was a
  // distant 4x ceiling; against a 4-tick base it would cap Speed at 1.33x
  // and make the stat nearly worthless.
  return Math.max(2, Math.round((COOLDOWN_TICKS_AT_SPD_1 / (unit.spd * statModMultiplier(unit, "spd") * restrainedSlowMultiplier(unit))) * penalty));
}
