// Damage formulas.

import { weakenMultiplier, atkModMultiplier } from "./status.js";
import { COOLDOWN_TICKS_AT_SPD_1 } from "./constants.js";

/** Base attack roll: ±20% spread around the attacker's power. */
export function attackRoll(atk) {
  return atk * (0.8 + Math.random() * 0.4);
}

/**
 * Unit-vs-unit damage, mitigated by the defender's DEF.
 * Used for player-vs-minion and minion-vs-player alike.
 */
export function unitDamage(attacker, defender) {
  const raw = attackRoll(attacker.atk) * weakenMultiplier(attacker) * atkModMultiplier(attacker);
  return Math.max(1, Math.round(Math.max(1, raw - (defender.def || 20) * 0.35)));
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
  let dmg = Math.max(1, Math.round(attackRoll(attacker.atk) * weakenMultiplier(attacker) * atkModMultiplier(attacker)));
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

/** Ticks until a unit can act again, slowed by Slow/Shock. */
export function attackCooldown(unit, penalty = 1) {
  return Math.max(3, Math.round((COOLDOWN_TICKS_AT_SPD_1 / unit.spd) * penalty));
}
