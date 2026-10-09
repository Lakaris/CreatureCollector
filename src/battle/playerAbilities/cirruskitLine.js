// Cirruskit line: Gust Swipe / Zephyr Step / Slipstream.
//
// (Ids and this file's name still say "cirruskit" -- the line was re-themed
// into a cloud leopard, and creature ids never change, for save compat.
// "Breezekit" below reads as the line, whose display name is now Cirruskit.)
//
// Gust Swipe is a piercing melee strike at the closest foe: the swipe travels
// in a straight (or diagonal) line and also hits whatever stands directly
// behind the target (the Slipstream "Pierce" tag). At max level every hit
// inflicts DEF Down (-10% DEF): one stack per Breezekit, refreshed per hit,
// stacking with other sources per applyStatMod in battle/status.js.
//
// Zephyr Step teleports Breezekit onto an open tile beside the enemy with the
// lowest current HP (the "Weakest" tag) and strikes it. It never lands on top
// of another creature: a candidate with no free adjacent tile is skipped for
// the next-weakest, and the charge holds until some candidate qualifies. At
// max level the cast also grants Speed Up (+25% action speed, STATUS_TICKS).
//
// Slipstream passively amplifies all of Breezekit's damage by +5%..+20%, and
// at max level extends its attack reach (and pierce depth) by one tile.

import { basicUnitDamage, attackRoll, attackCooldown } from "../damage.js";
import { speedPenalty, applyStatMod, consumeBlind } from "../status.js";
import { aChebDist, unitDist, occupies } from "../geometry.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { hasRule, isBoss } from "../classifications.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [10, 11, 12, 13, 13];
const SPECIAL_DMG_BY_LEVEL = [18, 20, 22, 25, 25];
/** Slipstream: +damage% on everything Breezekit does, by unique level. */
const PIERCE_BONUS_PCT_BY_LEVEL = [5, 10, 15, 20, 20];
const SPEED_UP_PCT = 25;
/** Gust Swipe lvl 5: Defense Down (one stack per Breezekit). The real total
 * comes from the shared stacking table in battle/status.js; this is the
 * 1-stack value, used for the sign and for cap comparisons. */
const DEF_DOWN_PCT = 15;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

function slipstreamMult(unit) {
  return 1 + PIERCE_BONUS_PCT_BY_LEVEL[abilityIdx(unit, "unique")] / 100;
}

/** Attack reach in tiles: Slipstream's final upgrade adds one. */
function reachOf(unit) {
  return abilityIdx(unit, "unique") >= MAX_IDX ? 2 : 1;
}

/** Gust Swipe lvl 5: one DEF Down stack per Breezekit, refreshed per hit.
 * A boss shrugs it off (ignoresOnHitEffects in battle/classifications.js). */
function applyDefShred(unit, target) {
  if (!target || hasRule(target, "ignoresOnHitEffects")) return;
  applyStatMod(target, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
}

/** The ring of cells around a foe's body (8 for a 1x1, 12 for a 2x2 boss). */
function cellsBeside(u) {
  const out = [];
  const size = u.size || 1;
  for (let r = u.row - 1; r <= u.row + size; r++) {
    for (let c = u.col - 1; c <= u.col + size; c++) {
      if (r >= u.row && r < u.row + size && c >= u.col && c < u.col + size) continue;
      out.push([r, c]);
    }
  }
  return out;
}

/** Zephyr Step's candidates: every living foe, weakest first. The sort is
 * stable, so a boss (last in the enemy list) loses Health ties. */
function candidatesByHp(aliveE) {
  return aliveE.filter((u) => u.hp > 0).sort((a, z) => a.hp - z.hp);
}

export function makeBreezekitModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel } = cfg;
  return {
    /**
     * Gust Swipe: hit the closest foe in reach along a straight/diagonal line,
     * piercing through to whatever stands behind it (one extra tile per point
     * of reach). Also owns chase movement, like other basicAttack overrides.
     */
    basicAttack(unit, ctx) {
      const { aliveE, newFx, now } = ctx;
      const reach = reachOf(unit);

      // Closest attackable foe: a creature must sit on a straight or diagonal
      // line (always true at reach 1). A boss is swiped wherever its body is
      // in reach, wins ties, and takes the swipe alone (no pierce through it).
      let best = null, bestD = Infinity, boss = null, bossD = Infinity;
      for (const e of aliveE) {
        const d = unitDist(unit, e);
        if (isBoss(e)) { if (e.hp > 0 && d < bossD) { bossD = d; boss = e; } continue; }
        const dr = e.row - unit.row, dc = e.col - unit.col;
        const aligned = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
        if (aligned && d <= reach && d < bestD) { bestD = d; best = { unit: e, dr: Math.sign(dr), dc: Math.sign(dc) }; }
      }
      if (boss && bossD <= reach && bossD <= bestD) best = { unit: boss, solo: true };

      if (!best) {
        // Nothing in reach: chase the nearest foe.
        let chase = null, chaseD = Infinity;
        for (const e of aliveE) {
          if (isBoss(e) && e.hp <= 0) continue;
          const d = unitDist(unit, e);
          if (d < chaseD) { chaseD = d; chase = e; }
        }
        if (chase) ctx.stepToward(chase.row, chase.col);
        return;
      }
      if (unit.atkCd > 0) return;
      // Blinded: the swipe misses entirely, cooldown still paid.
      if (consumeBlind(unit)) { unit.atkCd = attackCooldown(unit, speedPenalty(unit)); return; }

      const idx = abilityIdx(unit, "basic");
      const ratio = basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const mult = ratio * slipstreamMult(unit);
      const shreds = idx >= MAX_IDX;
      let totalDmg = 0;

      if (best.solo) {
        const victim = best.unit;
        const dmg = Math.max(1, Math.round(basicUnitDamage(unit, victim) * mult));
        damageUnit(victim, dmg);
        totalDmg += dmg;
        if (shreds) applyDefShred(unit, victim);
        const mid = ((victim.size || 1) - 1) / 2;
        newFx.push({ id: now + unit.uid, row: victim.row + mid, col: victim.col + mid, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      } else {
        // Walk the swipe line: the target's cell plus `reach` cells behind it.
        const steps = bestD + reach;
        const struck = new Set(); // once per creature, however many tiles it spans
        for (let k = 1; k <= steps; k++) {
          const r = unit.row + best.dr * k, c = unit.col + best.dc * k;
          const victim = aliveE.find((e) => e.hp > 0 && !struck.has(e) && occupies(e, r, c));
          if (!victim) continue;
          struck.add(victim);
          const dmg = Math.max(1, Math.round(basicUnitDamage(unit, victim) * mult));
          damageUnit(victim, dmg);
          totalDmg += dmg;
          if (shreds) applyDefShred(unit, victim);
          newFx.push({ id: now + unit.uid + "gs" + k, row: r, col: c, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        }
      }

      if (totalDmg > 0) ctx.addDamageDealt(totalDmg);
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
    },

    /**
     * Zephyr Step holds its charge until some foe qualifies: either Breezekit
     * already stands beside one, or one has a free adjacent tile to land on.
     */
    specialInRange(unit, { aliveE, aliveP, gridRows, gridCols }) {
      const everyone = [...aliveE, ...aliveP];
      const open = (r, c) =>
        r >= 0 && r < gridRows && c >= 0 && c < gridCols && !everyone.some((o) => occupies(o, r, c));
      for (const foe of candidatesByHp(aliveE)) {
        if (unitDist(unit, foe) <= 1 || cellsBeside(foe).some(([r, c]) => open(r, c))) return true;
      }
      return false;
    },

    /**
     * Zephyr Step: teleport beside the lowest-HP foe that has an open adjacent
     * tile (skipping fully-surrounded ones), then strike it. Never lands on an
     * occupied square; stays put when already adjacent. Max level grants
     * Speed Up on cast.
     */
    special(unit, ctx) {
      const { aliveE, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = (specialDmgByLevel[idx] / BASIC_DMG_BASELINE) * slipstreamMult(unit);

      for (const foe of candidatesByHp(aliveE)) {
        let dest = null;
        if (unitDist(unit, foe) > 1) {
          // ctx.blocked covers bounds and the body of every unit.
          const openCells = cellsBeside(foe).filter(([r, c]) => !ctx.blocked(r, c));
          if (!openCells.length) continue;
          openCells.sort((a, z) => aChebDist(unit.row, unit.col, a[0], a[1]) - aChebDist(unit.row, unit.col, z[0], z[1]));
          dest = openCells[0];
        }

        const fromRow = unit.row, fromCol = unit.col;
        // Rooted: the step never happens, so this foe is out of reach -- try
        // the next one rather than striking from where we stand. A foe we are
        // ALREADY beside needs no step and still gets hit.
        if (dest && !ctx.relocate(dest[0], dest[1])) continue;

        const dmg = Math.max(1, Math.round(attackRoll(unit) * mult));
        damageUnit(foe, dmg);
        ctx.addDamageDealt(dmg);

        if (idx >= MAX_IDX) {
          applyStatMod(unit, { kind: "spd", pct: SPEED_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
        }

        const mid = ((foe.size || 1) - 1) / 2;
        newFx.push({ id: now + "zs" + unit.uid, row: unit.row, col: unit.col, t: now, isRanged: true, fromRow, fromCol, isEnemy: !!ctx.isEnemySide });
        newFx.push({ id: now + "zshit" + unit.uid, row: foe.row + mid, col: foe.col + mid, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        return;
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
};
export const cirruskit = makeBreezekitModule(CFG);
// The evolutions intentionally mirror Breezekit exactly for now -- same names,
// text, and numbers (see data/creatures.js); only base stats differ.
export const cumulynx = makeBreezekitModule(CFG);
export const nimbupard = makeBreezekitModule(CFG);
export const stormpelt = makeBreezekitModule(CFG);
