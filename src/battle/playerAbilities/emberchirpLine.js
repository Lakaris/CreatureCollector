// Emberchirp line: Stolen Spark / Shared Flame / Rekindle.
//
// Stolen Spark keeps the engine's default ranged attack flow (closest
// enemy) with per-level damage scaling; every landed peck also feeds a few
// HP back to the phoenix (onHit self-heal) -- it steals the warmth.
//
// Shared Flame is the sacrifice: the phoenix burns 10% of its own max
// Health -- through damageUnit, so Shields absorb it, Immortal floors it,
// and Rekindle's revive can catch it -- then heals every hurt ally in the
// Nearby ring (Chebyshev 1), itself excluded. At max level every OTHER
// ally (outside the ring) gains Heal Over Time: the same total healing,
// spread across the standard 6 ticks (applyHealOverTime in battle/status.js).
//
// Rekindle: every heal this phoenix GIVES (its own basic included) grows
// +1..5% per full 10% of its missing Health -- Shared Flame's self-burn
// stokes it directly -- plus a one-shot revive at 100% Health, consumed in
// hp.js's damageUnit the first time Health would hit 0, so every damage
// source honors it.

import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { unitDist } from "../geometry.js";
import { healReceivedMultiplier, applyHealOverTime } from "../status.js";
import { damageUnit, healUnit } from "../hp.js";

/** Displayed damage by basic level; the engine deals stat-based damage
 * scaled by the ratio of the current level's value to the base value. */
const BASIC_DMG_BY_LEVEL = [8, 10, 13, 16, 16];
/** Absolute self-heal per landed basic hit (the HEAL badge values). */
const BASIC_HEAL_BY_LEVEL = [4, 4, 4, 4, 6];
const SPECIAL_HEAL_BY_LEVEL = [20, 26, 33, 42, 42];
/** Shared Flame's self-burn, as a fraction of the phoenix's max Health. */
const SELF_DMG_FRAC = 0.1;
/** Nearby: the ring of surrounding tiles, Chebyshev distance 1. */
const NEARBY_RANGE = 1;
/** Rekindle: +% outgoing healing per full 10% missing Health, by level. */
const REKINDLE_PCT_BY_LEVEL = [1, 2, 3, 4, 5];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** The dark boss's heal-block gates every heal this module does. */
function canBeHealed(u) {
  return (u.healImmuneTicks || 0) <= 0;
}

export function makeEmberchirpModule(cfg) {
  const { basicDmgByLevel, basicHealByLevel, specialHealByLevel, rekindlePctByLevel } = cfg;

  /** Rekindle's amp on heals the phoenix gives, read off LIVE Health. */
  function healOutMultiplier(unit) {
    const steps = Math.floor(Math.max(0, 1 - unit.hp / unit.maxHp) * 10);
    return 1 + (steps * rekindlePctByLevel[abilityIdx(unit, "unique")]) / 100;
  }

  /** Outgoing amp x the receiver's Healing Down, like every other heal. */
  function healFor(unit, target, amount) {
    return Math.round(amount * healOutMultiplier(unit) * healReceivedMultiplier(target));
  }

  return {
    onBattleStart(unit) {
      // Rekindle's revive: consumed in damageUnit (battle/hp.js) the first
      // time Health would hit 0.
      unit._reviveReady = true;
    },

    /** Stolen Spark: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /** Stolen Spark's other half: recover Health on every landed hit. */
    onHit(unit) {
      if (unit.hp > 0 && unit.hp < unit.maxHp && canBeHealed(unit)) {
        const heal = healFor(unit, unit, basicHealByLevel[abilityIdx(unit, "basic")]);
        if (heal > 0) healUnit(unit, heal);
      }
      return 0;
    },

    /**
     * Hold the bar until a hurt, healable ally is in the Nearby ring -- the
     * self-burn shouldn't be paid for nothing. At max level a hurt ally
     * ANYWHERE opens the gate: the Heal Over Time still reaches them.
     */
    specialInRange(unit, { aliveP }) {
      const maxLvl = abilityIdx(unit, "special") >= MAX_IDX;
      return aliveP.some(
        (a) => a !== unit && a.hp > 0 && a.hp < a.maxHp && canBeHealed(a) &&
          (maxLvl || unitDist(unit, a) <= NEARBY_RANGE)
      );
    },

    /** Shared Flame: burn itself, heal the ring; max level HoTs the rest. */
    special(unit, ctx) {
      const { aliveP, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const heal = specialHealByLevel[idx];

      // The sacrifice first: the heals below read the phoenix's Health
      // AFTER the burn, so this cast immediately stokes its own Rekindle.
      damageUnit(unit, Math.max(1, Math.round(unit.maxHp * SELF_DMG_FRAC)));
      newFx.push({ id: now + "sfself" + unit.uid, row: unit.row, col: unit.col, t: now, isBurn: true, fromRow: unit.row, fromCol: unit.col, isEnemy: true });

      for (const a of aliveP) {
        if (a === unit || a.hp <= 0) continue;
        if (unitDist(unit, a) <= NEARBY_RANGE) {
          if (!canBeHealed(a)) continue;
          const amt = healFor(unit, a, heal);
          if (amt > 0) healUnit(a, amt);
          newFx.push({ id: now + "sf" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        } else if (idx >= MAX_IDX) {
          // "All other allies gain Heal Over Time": the same total healing
          // spread across the standard duration. Rekindle is snapshotted
          // into the per-tick amount now; Healing Down applies per tick.
          applyHealOverTime(a, Math.max(1, Math.round((heal / STATUS_TICKS) * healOutMultiplier(unit))), STATUS_TICKS);
          newFx.push({ id: now + "sfhot" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        }
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  basicHealByLevel: BASIC_HEAL_BY_LEVEL,
  specialHealByLevel: SPECIAL_HEAL_BY_LEVEL,
  rekindlePctByLevel: REKINDLE_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const emberchirp = makeEmberchirpModule(CFG);
export const pyrefinch = makeEmberchirpModule(CFG);
export const cauterix = makeEmberchirpModule(CFG);
export const hearthenix = makeEmberchirpModule(CFG);
