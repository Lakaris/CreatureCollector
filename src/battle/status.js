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
    // Burn — fire boss's Burning Touch (boss-ATK scaled), or an enemy
    // Blazehornet's Burning Bond, which stores its own source ATK on the
    // target (the fire boss never sets burnSourceAtk).
    if ((u.burnTicks || 0) > 0) {
      const dmg = u.burnSourceAtk
        ? Math.max(1, Math.round(u.burnSourceAtk * 0.035))
        : dotDamage(boss, DOT_RATES.burn);
      u.hp = Math.max(0, u.hp - dmg);
      u.burnTicks--;
      if (!u.burnTicks) u.burnSourceAtk = 0;
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

/**
 * Generic timed ATK modifier, positive (buff) or negative (debuff) -- e.g.
 * Starlit's Radiant Exchange, which buffs allies and debuffs enemies at once.
 * Works on any unit (player, minion, or boss); a fresh application always
 * overwrites rather than stacking, since `atkModPct` is just reassigned, never
 * added to.
 */
export function atkModMultiplier(u) {
  if ((u.atkModTicks || 0) <= 0) return 1;
  return 1 + (u.atkModPct || 0) / 100;
}

/** Decrement `atkModTicks` on a single unit (player, minion, or boss). */
export function tickAtkMod(u) {
  if ((u.atkModTicks || 0) > 0) u.atkModTicks--;
}

/**
 * Stacking DEF shred (e.g. Breezekit's Gust Swipe at max level): each stack
 * removes 0.5% of the defender's DEF while active. Stacks freely with no cap;
 * every application refreshes the shared timer, and the stacks clear when it
 * expires.
 */
export function defShredMultiplier(u) {
  if ((u.defShredTicks || 0) <= 0) return 1;
  return Math.max(0, 1 - (u.defShredStacks || 0) * 0.005);
}

/** Timed Speed modifier (e.g. Breezekit's Speed Up buff): +/-pct% action speed. */
export function spdModMultiplier(u) {
  if ((u.spdModTicks || 0) <= 0) return 1;
  return 1 + (u.spdModPct || 0) / 100;
}

/**
 * Decrement every generic timed modifier on one unit (player, minion, or
 * boss): ATK mod, Speed mod, DEF shred, and Taunt. Ticked once per battle
 * tick from each unit loop.
 */
export function tickTimedMods(u) {
  tickAtkMod(u);
  if ((u.spdModTicks || 0) > 0) u.spdModTicks--;
  if ((u.defShredTicks || 0) > 0) {
    u.defShredTicks--;
    if (!u.defShredTicks) u.defShredStacks = 0;
  }
  if ((u.tauntTicks || 0) > 0) {
    u.tauntTicks--;
    if (!u.tauntTicks) u.tauntSourceUid = null;
  }
  if ((u.shieldTicks || 0) > 0) {
    u.shieldTicks--;
    if (!u.shieldTicks) u.shield = 0;
  }
  if ((u.healDownTicks || 0) > 0) u.healDownTicks--;
}

/** Healing Recovery Down (Morusk's Tusk Slam): healing received is halved. */
export function healReceivedMultiplier(u) {
  return (u.healDownTicks || 0) > 0 ? 0.5 : 1;
}

/**
 * Creature-side Shield (temporary bonus Health, e.g. Boulder Hunker):
 * absorbs attack damage before HP is touched. Returns the damage left over
 * after the shield eats its share. Mirrors the boss `shield` pool the Light
 * daily boss uses, but timed (shieldTicks) per the standard buff duration.
 */
export function absorbShield(u, dmg) {
  if ((u.shield || 0) <= 0 || dmg <= 0) return dmg;
  const absorbed = Math.min(u.shield, dmg);
  u.shield -= absorbed;
  return dmg - absorbed;
}
