// Status effects: damage-over-time and timed debuffs.
//
// DoT magnitudes scale off the boss's attack, so a level-10 boss's burn hurts
// more than a level-1 boss's. When the boss is dead they fall back to a flat 2.

/** Damage per tick for each DoT, as a fraction of boss attack. */
const DOT_RATES = { burn: 0.04, poison: 0.035, dot: 0.045 };

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
    // Burn — fire boss's Burning Touch, applied on hit.
    if ((u.burnTicks || 0) > 0) {
      u.hp = Math.max(0, u.hp - dotDamage(boss, DOT_RATES.burn));
      u.burnTicks--;
      newFx.push({ id: now + "brn" + u.uid, row: u.row, col: u.col, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    // Poison + root — nature boss's Overgrowth.
    if ((u.poisonTicks || 0) > 0) {
      u.hp = Math.max(0, u.hp - dotDamage(boss, DOT_RATES.poison));
      u.poisonTicks--;
      newFx.push({ id: now + "psn" + u.uid, row: u.row, col: u.col, t: now, isPoison: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    if ((u.rootTicks || 0) > 0) u.rootTicks--;
    // Shadow DoT + weaken + heal-block — dark boss.
    if ((u.dotTicks || 0) > 0) {
      u.hp = Math.max(0, u.hp - dotDamage(boss, DOT_RATES.dot));
      u.dotTicks--;
      newFx.push({ id: now + "dot" + u.uid, row: u.row, col: u.col, t: now, isDark: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    if ((u.weakTicks || 0) > 0) u.weakTicks--;
    if ((u.healImmuneTicks || 0) > 0) u.healImmuneTicks--;
  }
}

/** Rooted units cannot move. */
export function isRooted(u) {
  return (u.rootTicks || 0) > 0;
}

/** Slow and shock both halve action speed by doubling the cooldown. */
export function speedPenalty(u) {
  return (u.slowTicks || 0) > 0 || (u.shockTicks || 0) > 0 ? 2 : 1;
}

/** Weakened units deal 30% less damage. */
export function weakenMultiplier(u) {
  return (u.weakTicks || 0) > 0 ? 0.7 : 1;
}
