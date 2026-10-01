// Gillet line (axolotls): Water Jet / Swell / Undertow.
//
// A ranged Water support whose whole output is one shaped ability. Water Jet is
// an ordinary ranged poke that chills at max level; everything else this kit
// does happens inside Swell.
//
// Swell is a 1x3 wave sent SWELL_DEPTH tiles forward from the caster. The same
// cast damages the enemies standing in it and heals the allies standing in it,
// and at max level shoves the enemies it hit a tile further back.
//
// Undertow is why the wave resolves ROW BY ROW instead of as one instantaneous
// cell set the way Line and Fork do (see forkCells in battle/geometry.js). The
// wave leaves with a damage and healing bonus and spends it as it travels: each
// row that contains ANY creature -- ally, enemy or boss -- knocks
// UNDERTOW_FALLOFF_PCT percentage POINTS off both bonuses, and the rows behind
// it are resolved at what is left. So the order rows are touched in changes the
// result, which is the whole point of the passive.
//
// Two consequences worth keeping in mind when retuning:
//   - The falloff counts the first occupied row too, so the printed bonus is
//     never delivered in full. A wave that reaches nothing is also a wave that
//     spent nothing.
//   - It subtracts points from the BONUS, not a share of the output, so a deep
//     wave inverts into a penalty. At SWELL_DEPTH 3 the most it can spend is 90
//     points, so the worst case is x0.60 damage and x0.70 healing -- it cannot
//     reach zero, and carries no floor constant of its own. If the depth or the
//     falloff ever grows, the Math.max(1, ...) on each creature's damage and
//     heal below is what keeps a deeply spent wave from inverting outright.

import { bossOccupies } from "../geometry.js";
import { attackRoll, damageBoss } from "../damage.js";
import { BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit, healUnit } from "../hp.js";
import { healReceivedMultiplier, applyFrostbite, isIntangible } from "../status.js";
import { displaceUnit } from "../displace.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Support-priced and deliberately flat -- this creature's damage is a side
// effect of standing somewhere useful.
const BASIC_DMG_BY_LEVEL = [10, 11, 12, 13, 13];
/** Swell: damage dealt to each enemy in the wave, by special level. */
const SWELL_DMG_BY_LEVEL = [14, 17, 20, 24, 24];
/** Swell: Health restored to each ally in the wave, by special level. */
const SWELL_HEAL_BY_LEVEL = [20, 24, 28, 33, 33];
/** Undertow: damage / healing bonus the wave sets out with, by unique level.
 * Both sit BELOW an average common healer's output on the card on purpose --
 * these bonuses are what bring Swell up to par, so the two are tuned together. */
const UNDERTOW_DMG_PCT_BY_LEVEL = [50, 60, 70, 80, 90];
const UNDERTOW_HEAL_PCT_BY_LEVEL = [60, 70, 80, 90, 100];
/** Undertow: percentage POINTS struck off both bonuses per occupied row. */
const UNDERTOW_FALLOFF_PCT = 30;
/** Swell: how many tiles forward the wave travels. */
const SWELL_DEPTH = 3;
/** Swell: tiles either side of the caster's column, making the 1x3 face. */
const SWELL_HALF_WIDTH = 1;
/** Swell lvl 5: tiles each enemy hit is shoved further down the wave's path. */
const KNOCKBACK_TILES = 1;

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

/**
 * The wave's cells, grouped BY ROW and ordered outward from the caster -- the
 * grouping Undertow needs, since the falloff is charged per row rather than per
 * creature. `dir` is the facing along rows (-1 for player units, +1 for the
 * enemy side), the same convention coneCells and forkCells use. Already clipped
 * to the grid; a row that falls off the board ends the wave.
 */
function waveRows(row, col, dir, gridRows, gridCols) {
  const rows = [];
  for (let d = 1; d <= SWELL_DEPTH; d++) {
    const r = row + dir * d;
    if (r < 0 || r >= gridRows) break;
    const cells = [];
    for (let c = col - SWELL_HALF_WIDTH; c <= col + SWELL_HALF_WIDTH; c++) {
      if (c >= 0 && c < gridCols) cells.push([r, c]);
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

export function makeGilletModule(cfg) {
  const { basicDmgByLevel, swellDmgByLevel, swellHealByLevel, undertowDmgPctByLevel, undertowHealPctByLevel } = cfg;
  return {
    /** Water Jet: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Water Jet lvl 5: every landed hit leaves the target Frostbitten. */
    onHit(unit, target) {
      if (target && target.uid != null && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyFrostbite(target);
      }
      return 0;
    },

    // Swell heals allies as readily as it damages enemies, so it fires off
    // cooldown rather than waiting for something hostile to come into reach --
    // the same rule every healing ability in the game follows. Gating it on
    // enemies would hold the heal hostage to the enemy's position.
    specialInRange() {
      return true;
    },

    /**
     * Swell. Walks the wave outward a row at a time, charging Undertow's
     * falloff against each row that holds anyone, and resolving that row at
     * whatever the bonus has fallen to.
     */
    special(unit, ctx) {
      const { aliveP, aliveE, boss, newFx, now, gridRows, gridCols } = ctx;
      const sIdx = abilityIdx(unit, "special");
      const uIdx = abilityIdx(unit, "unique");
      const baseDmgMult = swellDmgByLevel[sIdx] / BASIC_DMG_BASELINE;
      const baseHeal = swellHealByLevel[sIdx];
      const dmgBonus = undertowDmgPctByLevel[uIdx];
      const healBonus = undertowHealPctByLevel[uIdx];
      const knocksBack = sIdx >= MAX_IDX;
      const dir = ctx.isEnemySide ? 1 : -1;

      // The knockback is collected and applied only once the whole wave has
      // resolved. Shoving an enemy mid-walk would move it into a row the wave
      // has not reached yet and hit it a second time.
      const toKnock = [];

      let occupiedRows = 0;
      for (const cells of waveRows(unit.row, unit.col, dir, gridRows, gridCols)) {
        const cellSet = new Set(cells.map(([r, c]) => r + "," + c));
        const foes = aliveE.filter((e) => e.hp > 0 && !isIntangible(e) && cellSet.has(e.row + "," + e.col));
        const friends = aliveP.filter((a) => a.hp > 0 && cellSet.has(a.row + "," + a.col));
        const bossHere = boss && boss.hp > 0 && cells.some(([r, c]) => bossOccupies(boss, r, c));

        // Paint the whole row, hit or not -- the shape is the ability.
        for (const [r, c] of cells) {
          newFx.push({ id: now + "sw" + unit.uid + r + "_" + c, row: r, col: c, t: now, isFrost: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        }

        // Charged BEFORE the row resolves, so the first occupied row already
        // pays -- see the header note on the printed bonus never landing whole.
        if (foes.length || friends.length || bossHere) occupiedRows++;
        const spent = UNDERTOW_FALLOFF_PCT * occupiedRows;
        const dmgMult = 1 + (dmgBonus - spent) / 100;
        const healMult = 1 + (healBonus - spent) / 100;

        for (const e of foes) {
          const dmg = Math.max(1, Math.round(attackRoll(unit) * baseDmgMult * dmgMult));
          ctx.addDamageDealt(damageUnit(e, dmg));
          if (knocksBack && !e._dodgedHit) toKnock.push(e);
        }
        if (bossHere) {
          const dmg = Math.max(1, Math.round(attackRoll(unit) * baseDmgMult * dmgMult));
          damageBoss(boss, dmg);
          ctx.addDamageDealt(dmg);
          newFx.push({ id: now + "swb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isFrost: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        }
        for (const a of friends) {
          if (!canBeHealed(a)) continue;
          const heal = Math.max(1, Math.round(baseHeal * healMult * healReceivedMultiplier(a)));
          healUnit(a, heal);
          newFx.push({ id: now + "swh" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        }
      }

      // Straight down the wave's own path, so the shove reads as the water
      // carrying them. Impact damage and Anchor-style immunity are displace.js's
      // business, not this kit's.
      for (const e of toKnock) {
        if (e.hp > 0) displaceUnit(e, dir, 0, { tiles: KNOCKBACK_TILES, source: unit });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  swellDmgByLevel: SWELL_DMG_BY_LEVEL,
  swellHealByLevel: SWELL_HEAL_BY_LEVEL,
  undertowDmgPctByLevel: UNDERTOW_DMG_PCT_BY_LEVEL,
  undertowHealPctByLevel: UNDERTOW_HEAL_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const gillet = makeGilletModule(CFG);
export const gillow = makeGilletModule(CFG);
export const plumewake = makeGilletModule(CFG);
export const xolotide = makeGilletModule(CFG);
