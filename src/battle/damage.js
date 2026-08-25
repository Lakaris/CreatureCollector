// Damage formulas.

import { weakenMultiplier, statModMultiplier, restrainedSlowMultiplier, frostbiteMultiplier, dartShredMultiplier } from "./status.js";
import { COOLDOWN_TICKS_AT_SPD_1 } from "./constants.js";
import { CREATURE_MAP } from "../data/creatures.js";

/** Base attack roll: ±20% spread around the attacker's power. */
export function attackRoll(atk) {
  return atk * (0.8 + Math.random() * 0.4);
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
  const atk = attacker.atk * weakenMultiplier(attacker) * statModMultiplier(attacker, "atk");
  const def = (defender.def || 20) * statModMultiplier(defender, "def") * dartShredMultiplier(defender);
  const roll = 0.8 + Math.random() * 0.4;
  return Math.max(1, Math.round(mitigatedDamage(atk, def) * roll * frostbiteMultiplier(water, defender)));
}

/**
 * Player damage against a boss. Bosses have no DEF stat, so this is unmitigated
 * apart from the attacker's own Weaken debuff.
 *
 * The dark boss's Dark Shroud is applied here rather than in dark.js because it
 * modifies incoming damage rather than anything the boss does on its turn: the
 * more debuffs the party is carrying, the less it hurts the boss (floor 30%).
 */
export function playerDamageToBoss(attacker, boss, aliveP) {
  let dmg = Math.max(1, Math.round(attackRoll(attacker.atk) * weakenMultiplier(attacker) * statModMultiplier(attacker, "atk")));
  if (boss._bossKey === "dark") {
    const debuffed = aliveP.filter(
      (p) => (p.dotTicks || 0) > 0 || (p.weakTicks || 0) > 0 || (p.healImmuneTicks || 0) > 0
    ).length;
    dmg = Math.max(1, Math.round(dmg * Math.max(0.3, 1 - debuffed * 0.1)));
  }
  return dmg;
}

/** Apply damage to a boss, letting any shield soak it first. */
export function damageBoss(boss, dmg) {
  if (boss.shield > 0) boss.shield = Math.max(0, boss.shield - dmg);
  else boss.hp = Math.max(0, boss.hp - dmg);
}

/** Ticks until a unit can act again, slowed by Slow/Shock and sped up by Speed buffs. */
export function attackCooldown(unit, penalty = 1) {
  return Math.max(3, Math.round((COOLDOWN_TICKS_AT_SPD_1 / (unit.spd * statModMultiplier(unit, "spd") * restrainedSlowMultiplier(unit))) * penalty));
}
