// Duskling (vampire bat) line: Sonic Screech / Bloodletting / Insatiable.
//
// The whole line hunts wounded prey: BOTH attacks go to the Weakest enemy.
// Sonic Screech keeps the engine's default ranged attack flow, with the
// `prefersWeakestTargets` preference (see selectTarget in tick.js): it fires
// at the lowest-Health enemy already in its reach, and otherwise closes on the
// nearest like anyone. Every upgrade is +damage; the max tier inflicts Damage
// Over Time on every hit (not a boss -- it shrugs off on-hit effects).
//
// Bloodletting strikes the Weakest enemy in reach and drains 30% of the
// damage dealt back as Health -- a lifesteal heal (healUnit's `lifesteal`),
// so Insatiable and lifesteal gear both scale it. The max tier hits 50%
// harder against an enemy below 30% Health.
//
// Insatiable makes lifesteal on this creature 20-50% more effective -- EVERY
// source, Bloodletting's drain and lifesteal gear alike (`lifestealMorePct`,
// read by healUnit in hp.js). At max, while the enemy it is targeting (the
// Weakest in its reach) is below 30% Health, it has 20% more Haste -- a flat
// bump, not the Haste Up buff (see `exact` in applyStatMod).

import { attackRoll } from "../damage.js";
import { unitDist, attackRangeOf } from "../geometry.js";
import { BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit, healUnit } from "../hp.js";
import { applyDot, applyStatMod, isIntangible, WHILE_ACTIVE_TICKS } from "../status.js";
import { hasRule } from "../classifications.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [12, 15, 19, 24, 24];
const SPECIAL_DMG_BY_LEVEL = [30, 38, 47, 58, 58];
/** Bloodletting: share of the damage dealt drained back as Health. */
const DRAIN_PCT = 30;
/** Bloodletting max tier: bonus against an enemy below this Health share. */
const WOUNDED_BELOW = 0.3;
const WOUNDED_BONUS_PCT = 50;
/** Insatiable: how much more effective lifesteal is, by unique level. */
const LIFESTEAL_MORE_PCT_BY_LEVEL = [20, 30, 40, 50, 50];
/** Insatiable max tier: Haste while targeting a wounded enemy. */
const HUNT_HASTE_PCT = 20;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

const isWounded = (e) => e.hp > 0 && e.hp < e.maxHp * WOUNDED_BELOW;

/** The lowest-Health targetable enemy within `unit`'s reach, or null. */
function weakestInReach(unit, foes) {
  const range = attackRangeOf(unit);
  let best = null;
  for (const e of foes) {
    if (e.hp <= 0 || isIntangible(e) || unitDist(unit, e) > range) continue;
    if (!best || e.hp < best.hp) best = e;
  }
  return best;
}

export function makeDusklingModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, lifestealMorePctByLevel } = cfg;
  return {
    /** Insatiable, kept current every tick (levels never change mid-fight,
     * but stamping it here needs no battle-start hook), plus the line's
     * Weakest preference and the max tier's hunting Haste. */
    onTick(unit, ctx) {
      unit.prefersWeakestTargets = true;
      unit.lifestealMorePct = lifestealMorePctByLevel[abilityIdx(unit, "unique")];
      if (abilityIdx(unit, "unique") < MAX_IDX) return;
      const prey = weakestInReach(unit, ctx.aliveE);
      if (prey && isWounded(prey)) {
        applyStatMod(unit, { kind: "haste", pct: HUNT_HASTE_PCT, src: unit.uid + ":hunt", ticks: WHILE_ACTIVE_TICKS, holdDuration: true, exact: true });
      }
    },

    /** Sonic Screech: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Sonic Screech max tier: every landed hit inflicts Damage Over Time. */
    onHit(unit, target) {
      if (abilityIdx(unit, "basic") >= MAX_IDX && target.hp > 0 && !hasRule(target, "ignoresOnHitEffects")) applyDot(target, 1);
      return 0;
    },

    /** Bloodletting holds its charge until an enemy is in reach. */
    specialInRange(unit, { aliveE }) {
      return !!weakestInReach(unit, aliveE);
    },

    special(unit, ctx) {
      const target = weakestInReach(unit, ctx.aliveE);
      if (!target) return;
      const idx = abilityIdx(unit, "special");
      let mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      if (idx >= MAX_IDX && isWounded(target)) mult *= 1 + WOUNDED_BONUS_PCT / 100;
      const dealt = damageUnit(target, Math.max(1, Math.round(attackRoll(unit) * mult))) || 0;
      ctx.addDamageDealt(dealt);
      if (dealt > 0 && (unit.healImmuneTicks || 0) <= 0) healUnit(unit, (dealt * DRAIN_PCT) / 100, { lifesteal: true });
      const mid = ((target.size || 1) - 1) / 2;
      ctx.newFx.push({ id: ctx.now + "bl" + unit.uid, row: target.row + mid, col: target.col + mid, t: ctx.now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  lifestealMorePctByLevel: LIFESTEAL_MORE_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const duskling = makeDusklingModule(CFG);
export const nightbat = makeDusklingModule(CFG);
export const nightstalker = makeDusklingModule(CFG);
export const voidfang = makeDusklingModule(CFG);
