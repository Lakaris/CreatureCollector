// Electric boss — Volt Strike / Arc Burst / Piercing Current.
// Stationary. Fires piercing cardinal lines and chains bolts to random targets.

import { RANGED_RANGE, BOSS_SIZE } from "../constants.js";
import { randomOf } from "../../core/random.js";

/** Every tile in one cardinal line out from the boss body to the grid edge. */
function lineTiles(boss, dr, dc, gridRows, gridCols) {
  const tiles = [];
  if (dr === 0) {
    const start = dc > 0 ? boss.col + 2 : 0;
    const end = dc > 0 ? gridCols : boss.col;
    for (let c = start; c < end; c++) tiles.push([boss.row, c]);
  } else {
    const start = dr > 0 ? boss.row + 2 : 0;
    const end = dr > 0 ? gridRows : boss.row;
    for (let r = start; r < end; r++) tiles.push([r, boss.col]);
  }
  return tiles;
}

export default {
  key: "electric",

  onStatusTick(ctx) {
    for (const u of ctx.aliveP) if ((u.shockTicks || 0) > 0) u.shockTicks--;
  },

  special(ctx) {
    const { boss, aliveP, newFx, now, gridRows, gridCols } = ctx;

    // Queue three bolts; they fire one at a time from the block below.
    if (boss.specialCd <= 0 && aliveP.length) {
      const nearby = ctx.targetsWithin(RANGED_RANGE);
      const pool = nearby.length ? nearby : aliveP;
      boss.arcQueue = Array.from({ length: 3 }, () => randomOf(pool).uid);
      boss.arcNextStrikeAt = now;
      boss.specialCd = 18;
    }

    // NOTE: this cadence is wall-clock, not tick-based, so unlike every other
    // cooldown it does not scale with the battle speed multiplier.
    if (!(boss.arcQueue || []).length || now < (boss.arcNextStrikeAt || 0)) return;

    const uid = boss.arcQueue.shift();
    const tgt = aliveP.find((u) => u.uid === uid) || randomOf(aliveP);
    if (tgt) {
      const fromR = boss.row + 0.5, fromC = boss.col + 0.5;
      tgt.hp = Math.max(0, tgt.hp - ctx.dmg(0.08));
      tgt.shockTicks = (tgt.shockTicks || 0) + 6;

      // Extend the bolt past its target to the grid edge.
      const pdr = tgt.row + 0.5 - fromR, pdc = tgt.col + 0.5 - fromC;
      let tExit = Infinity;
      if (pdr > 0) tExit = Math.min(tExit, (gridRows - fromR) / pdr);
      else if (pdr < 0) tExit = Math.min(tExit, -fromR / pdr);
      if (pdc > 0) tExit = Math.min(tExit, (gridCols - fromC) / pdc);
      else if (pdc < 0) tExit = Math.min(tExit, -fromC / pdc);

      const pRow = Math.max(0, Math.min(gridRows - 1, fromR + tExit * pdr - 0.5));
      const pCol = Math.max(0, Math.min(gridCols - 1, fromC + tExit * pdc - 0.5));
      newFx.push({ id: now + "arc" + uid, row: pRow, col: pCol, t: now, isRanged: true, fromRow: fromR, fromCol: fromC, isEnemy: true });

      // Light every tile the bolt crosses (DDA ray march).
      const r1 = fromR + tExit * pdr, c1 = fromC + tExit * pdc;
      const steps = Math.ceil(Math.max(Math.abs(r1 - fromR), Math.abs(c1 - fromC)) * 4);
      const seen = new Set();
      for (let s = 0; s <= steps; s++) {
        const f = s / steps;
        const tr = Math.floor(fromR + f * (r1 - fromR));
        const tc = Math.floor(fromC + f * (c1 - fromC));
        if (tr < 0 || tr >= gridRows || tc < 0 || tc >= gridCols) continue;
        const k = tr + "," + tc;
        if (seen.has(k)) continue;
        seen.add(k);
        newFx.push({ id: now + "arcln_" + tr + "_" + tc, row: tr, col: tc, t: now, isShock: true });
      }
    }
    boss.arcNextStrikeAt = now + 500;
  },

  basic(ctx) {
    const { boss, aliveP, newFx, now, gridRows, gridCols } = ctx;
    if (!aliveP.length || boss.atkCd > 0) return;

    const nearest = ctx.byDistance()[0];
    const dr = nearest.row - (boss.row + 0.5);
    const dc = nearest.col - (boss.col + 0.5);

    // Prefer the line hitting the most players; break ties toward the nearest.
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const hitCount = ([a, b]) =>
      aliveP.filter((u) =>
        lineTiles(boss, a, b, gridRows, gridCols).some(([r, c]) => u.row === r && u.col === c)
      ).length;
    const chosen = [...dirs].sort((a, z) => {
      const diff = hitCount(z) - hitCount(a);
      if (diff !== 0) return diff;
      return (z[0] * dr + z[1] * dc) - (a[0] * dr + a[1] * dc);
    })[0];

    const tiles = lineTiles(boss, chosen[0], chosen[1], gridRows, gridCols);
    for (const [tr, tc] of tiles) {
      newFx.push({ id: now + "shk" + tr + "," + tc, row: tr, col: tc, t: now, isShock: true });
    }
    for (const t of aliveP.filter((u) => tiles.some(([r, c]) => u.row === r && u.col === c))) {
      t.hp = Math.max(0, t.hp - ctx.dmg(0.1));
      t.shockTicks = (t.shockTicks || 0) + 5;
      newFx.push({ id: now + "vs" + t.uid, row: t.row, col: t.col, t: now, isRanged: true, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
    }
    boss.atkCd = 11;
  },

  // Volt Strike travels the full row/column bands out from the boss body.
  basicTiles: (geo) =>
    geo.cells(
      (r, c) =>
        (c >= geo.boss.col && c < geo.boss.col + BOSS_SIZE) ||
        (r >= geo.boss.row && r < geo.boss.row + BOSS_SIZE)
    ),
  // Arc Burst prefers targets within ranged distance but falls back to anyone.
  specialTiles: (geo) => geo.allCells(),
};
