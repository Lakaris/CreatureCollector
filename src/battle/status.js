// Status effects: damage-over-time and timed debuffs.
//
// DoT magnitudes scale off the boss's attack, so a level-10 boss's burn hurts
// more than a level-1 boss's. When the boss is dead they fall back to a flat 2.

import { damageUnit } from "./hp.js";

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
      damageUnit(u, dmg);
      u.burnTicks--;
      if (!u.burnTicks) u.burnSourceAtk = 0;
      newFx.push({ id: now + "brn" + u.uid, row: u.row, col: u.col, t: now, isBurn: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    // Poison + root — nature boss's Overgrowth.
    if ((u.poisonTicks || 0) > 0) {
      damageUnit(u, dotDamage(boss, DOT_RATES.poison));
      u.poisonTicks--;
      newFx.push({ id: now + "psn" + u.uid, row: u.row, col: u.col, t: now, isPoison: true, fromRow: u.row, fromCol: u.col, isEnemy: true });
    }
    if ((u.rootTicks || 0) > 0) u.rootTicks--;
    // Shadow DoT + weaken + heal-block — dark boss.
    if ((u.dotTicks || 0) > 0) {
      damageUnit(u, dotDamage(boss, DOT_RATES.dot));
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
export function applyStatMod(u, { kind, pct, src, ticks = 6 }) {
  if (!pct) return;
  const mods = (u.statMods ||= []);
  const mine = mods.find((m) => sameEffect(m, kind, pct) && m.src === src);
  if (mine) { mine.pct = pct; mine.ticks = ticks; return; }
  const stacks = mods.filter((m) => sameEffect(m, kind, pct));
  if (stacks.length >= STAT_MOD_STACK_CAP) {
    const weakest = stacks.reduce((a, b) => (Math.abs(a.pct) <= Math.abs(b.pct) ? a : b));
    if (Math.abs(pct) <= Math.abs(weakest.pct)) return;
    mods.splice(mods.indexOf(weakest), 1);
  }
  mods.push({ kind, pct, src, ticks });
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
export function tickTimedMods(u) {
  tickStatMods(u);
  if ((u.tauntTicks || 0) > 0) {
    u.tauntTicks--;
    if (!u.tauntTicks) u.tauntSourceUid = null;
  }
  if ((u.shieldTicks || 0) > 0) {
    u.shieldTicks--;
    if (!u.shieldTicks) u.shield = 0;
  }
  if ((u.stunTicks || 0) > 0) u.stunTicks--;
  if ((u.intangibleTicks || 0) > 0) u.intangibleTicks--;
  if ((u.markedTicks || 0) > 0) u.markedTicks--;
}

/**
 * Strip every dispellable debuff from a unit: DoTs, control effects
 * (including Marked), and negative stat-mod stacks. Buffs are untouched.
 * Restrained is deliberately NOT cleared -- it is undispellable by design.
 * Used by Soothing Hoot's Cleanse and Vanishing Act's self-dispel.
 */
export function dispelDebuffs(u) {
  u.burnTicks = 0;
  u.burnStacks = 0;
  u.burnSourceAtk = 0;
  u.poisonTicks = 0;
  u.rootTicks = 0;
  u.dotTicks = 0;
  u.weakTicks = 0;
  u.healImmuneTicks = 0;
  u.slowTicks = 0;
  u.shockTicks = 0;
  u.tauntTicks = 0;
  u.tauntSourceUid = null;
  u.stunTicks = 0;
  u.markedTicks = 0;
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
 * by the strongest applier's percentage. Restrained never expires and can't
 * be Cleansed -- the only thing that removes it is Overload Sting consuming
 * the stacks.
 */
export function restrainedSlowMultiplier(u) {
  if ((u.restrainedStacks || 0) <= 0) return 1;
  return Math.max(0, 1 - (u.restrainedSlowPct || 0) / 100);
}

// Shield absorption itself lives in battle/hp.js (see absorbShield /
// damageUnit) so that every damage source shares one path; this file only
// owns the Shield's timer, in tickTimedMods above.
