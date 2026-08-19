// Breezekit line: Gust Swipe / Zephyr Step / Slipstream.
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

import { unitDamage, playerDamageToBoss, damageBoss, attackRoll, attackCooldown } from "../damage.js";
import { speedPenalty, applyStatMod } from "../status.js";
import { aChebDist, distToBoss, bossOccupies } from "../geometry.js";
import { BOSS_SIZE, STATUS_TICKS } from "../constants.js";
import { damageUnit } from "../hp.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
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
 * Bosses are skipped -- they have no DEF stat for the shred to act on. */
function applyDefShred(unit, target) {
  if (!target || target.uid == null) return;
  applyStatMod(target, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
}

/** The 8 cells around a minion, or the ring around the boss's 2x2 body. */
function cellsBeside(candidate) {
  const out = [];
  if (candidate.isBossCandidate) {
    const b = candidate.boss;
    for (let r = b.row - 1; r <= b.row + BOSS_SIZE; r++) {
      for (let c = b.col - 1; c <= b.col + BOSS_SIZE; c++) {
        if (r >= b.row && r < b.row + BOSS_SIZE && c >= b.col && c < b.col + BOSS_SIZE) continue;
        out.push([r, c]);
      }
    }
    return out;
  }
  const u = candidate.unit;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      out.push([u.row + dr, u.col + dc]);
    }
  }
  return out;
}

/** Zephyr Step's candidates: every living foe (boss included), weakest first. */
function candidatesByHp(aliveE, boss) {
  const list = aliveE.map((unit) => ({ unit, hp: unit.hp }));
  if (boss && boss.hp > 0) list.push({ isBossCandidate: true, boss, hp: boss.hp });
  return list.sort((a, z) => a.hp - z.hp);
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
      const { aliveE, aliveP, boss, newFx, now } = ctx;
      const reach = reachOf(unit);

      // Closest attackable foe: minions must sit on a straight or diagonal
      // line (always true at reach 1); the boss counts via its 2x2 body.
      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        const dr = e.row - unit.row, dc = e.col - unit.col;
        const aligned = dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        if (aligned && d <= reach && d < bestD) { bestD = d; best = { unit: e, dr: Math.sign(dr), dc: Math.sign(dc) }; }
      }
      const bossD = boss && boss.hp > 0 ? distToBoss(boss, unit.row, unit.col) : Infinity;
      if (bossD <= reach && bossD <= bestD) best = { isBoss: true };

      if (!best) {
        // Nothing in reach: chase the nearest foe.
        let chase = null, chaseD = Infinity;
        for (const e of aliveE) {
          const d = aChebDist(unit.row, unit.col, e.row, e.col);
          if (d < chaseD) { chaseD = d; chase = e; }
        }
        if (boss && boss.hp > 0 && bossD < chaseD) chase = { row: boss.row, col: boss.col };
        if (chase) ctx.stepToward(chase.row, chase.col);
        return;
      }
      if (unit.atkCd > 0) return;

      const idx = abilityIdx(unit, "basic");
      const ratio = basicDmgByLevel[idx] / basicDmgByLevel[0];
      const mult = ratio * slipstreamMult(unit);
      const shreds = idx >= MAX_IDX;
      let totalDmg = 0;

      if (best.isBoss) {
        const dmg = Math.max(1, Math.round(playerDamageToBoss(unit, boss, aliveP) * mult));
        damageBoss(boss, dmg);
        totalDmg += dmg;
        if (shreds) applyDefShred(unit, boss);
        newFx.push({ id: now + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      } else {
        // Walk the swipe line: the target's cell plus `reach` cells behind it.
        const steps = bestD + reach;
        let hitBossOnLine = false;
        for (let k = 1; k <= steps; k++) {
          const r = unit.row + best.dr * k, c = unit.col + best.dc * k;
          const victim = aliveE.find((e) => e.hp > 0 && e.row === r && e.col === c);
          if (victim) {
            const dmg = Math.max(1, Math.round(unitDamage(unit, victim) * mult));
            damageUnit(victim, dmg);
            totalDmg += dmg;
            if (shreds) applyDefShred(unit, victim);
            newFx.push({ id: now + unit.uid + "gs" + k, row: r, col: c, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
          }
          if (!hitBossOnLine && boss && boss.hp > 0 && bossOccupies(boss, r, c)) {
            const dmg = Math.max(1, Math.round(playerDamageToBoss(unit, boss, aliveP) * mult));
            damageBoss(boss, dmg);
            totalDmg += dmg;
            if (shreds) applyDefShred(unit, boss);
            hitBossOnLine = true;
          }
        }
      }

      if (totalDmg > 0) ctx.addDamageDealt(totalDmg);
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
    },

    /**
     * Zephyr Step holds its charge until some foe qualifies: either Breezekit
     * already stands beside one, or one has a free adjacent tile to land on.
     */
    specialInRange(unit, { aliveE, aliveP, boss, gridRows, gridCols }) {
      const occ = new Set([...aliveE, ...aliveP].map((o) => o.row + "," + o.col));
      const open = (r, c) =>
        r >= 0 && r < gridRows && c >= 0 && c < gridCols && !occ.has(r + "," + c) &&
        !(boss && boss.hp > 0 && bossOccupies(boss, r, c));
      for (const cand of candidatesByHp(aliveE, boss)) {
        const besideAlready = cand.isBossCandidate
          ? distToBoss(cand.boss, unit.row, unit.col) <= 1
          : aChebDist(unit.row, unit.col, cand.unit.row, cand.unit.col) <= 1;
        if (besideAlready || cellsBeside(cand).some(([r, c]) => open(r, c))) return true;
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
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = (specialDmgByLevel[idx] / basicDmgByLevel[0]) * slipstreamMult(unit);

      for (const cand of candidatesByHp(aliveE, boss)) {
        const besideAlready = cand.isBossCandidate
          ? distToBoss(cand.boss, unit.row, unit.col) <= 1
          : aChebDist(unit.row, unit.col, cand.unit.row, cand.unit.col) <= 1;

        let dest = null;
        if (!besideAlready) {
          // ctx.blocked covers bounds, every unit's cell, and the boss body.
          const openCells = cellsBeside(cand).filter(([r, c]) => !ctx.blocked(r, c));
          if (!openCells.length) continue;
          openCells.sort((a, z) => aChebDist(unit.row, unit.col, a[0], a[1]) - aChebDist(unit.row, unit.col, z[0], z[1]));
          dest = openCells[0];
        }

        const fromRow = unit.row, fromCol = unit.col;
        if (dest) ctx.relocate(dest[0], dest[1]);

        const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * mult));
        if (cand.isBossCandidate) damageBoss(cand.boss, dmg);
        else damageUnit(cand.unit, dmg);
        ctx.addDamageDealt(dmg);

        if (idx >= MAX_IDX) {
          applyStatMod(unit, { kind: "spd", pct: SPEED_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
        }

        const tr = cand.isBossCandidate ? cand.boss.row + 0.5 : cand.unit.row;
        const tc = cand.isBossCandidate ? cand.boss.col + 0.5 : cand.unit.col;
        newFx.push({ id: now + "zs" + unit.uid, row: unit.row, col: unit.col, t: now, isRanged: true, fromRow, fromCol, isEnemy: !!ctx.isEnemySide });
        newFx.push({ id: now + "zshit" + unit.uid, row: tr, col: tc, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        return;
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
};
export const breezekit = makeBreezekitModule(CFG);
// The evolutions intentionally mirror Breezekit exactly for now -- same names,
// text, and numbers (see data/creatures.js); only base stats differ.
export const galestride = makeBreezekitModule(CFG);
export const tempesthawk = makeBreezekitModule(CFG);
export const stormlord = makeBreezekitModule(CFG);
