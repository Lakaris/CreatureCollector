// Water boss — Tidal Shot / Riptide / Floodwater.
// Stationary. Every attack splashes the 8 surrounding tiles (Floodwater).

import { RANGED_RANGE } from "../constants.js";
import { randomOf } from "../../core/random.js";

export default {
  key: "water",

  special(ctx) {
    const { boss, allOcc, newFx, now, gridRows } = ctx;
    if (boss.specialCd > 0 || !ctx.aliveP.length) return;

    // Bottom-most first, so units don't collide as they slide down.
    const sorted = ctx.targetsWithin(RANGED_RANGE).sort((a, z) => z.row - a.row);
    for (const u of sorted) {
      let pushed = false;
      while (true) {
        const nr = u.row + 1;
        if (nr >= gridRows) break;
        const key = nr + "," + u.col;
        if (allOcc.has(key)) break;
        allOcc.delete(u.row + "," + u.col);
        u.prevRow = u.row;
        u.prevCol = u.col;
        u.lastMoveTime = now;
        u.row = nr;
        allOcc.add(key);
        pushed = true;
      }
      u.hp = Math.max(0, u.hp - ctx.dmg(0.18));
      if (pushed) {
        newFx.push({ id: now + "rip" + u.uid, row: u.row, col: u.col, t: now, isRanged: true, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
      }
    }
    boss.specialCd = 22;
  },

  basic(ctx) {
    const { boss, aliveP, newFx, now, gridRows, gridCols } = ctx;
    if (!aliveP.length || boss.atkCd > 0) return;

    const fromR = boss.row + 0.5, fromC = boss.col + 0.5;
    for (let i = 0; i < 3; i++) {
      const tgt = randomOf(aliveP);
      const dmg = ctx.dmg(0.1);
      tgt.hp = Math.max(0, tgt.hp - dmg);
      newFx.push({ id: now + "wat" + i + tgt.uid, row: tgt.row, col: tgt.col, t: now + i * 80, isRanged: true, fromRow: fromR, fromCol: fromC, isEnemy: true });
      newFx.push({ id: now + "splc" + i, row: tgt.row, col: tgt.col, t: now + i * 80, isSplash: true, isCenter: true });

      // Floodwater: equal splash to all 8 neighbours, never onto the boss.
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const sr = tgt.row + dr, sc = tgt.col + dc;
          if (sr < 0 || sr >= gridRows || sc < 0 || sc >= gridCols) continue;
          if (ctx.bossOcc(sr, sc)) continue;
          newFx.push({ id: now + "spl" + i + "_" + sr + "_" + sc, row: sr, col: sc, t: now + i * 80, isSplash: true });
          const splashed = aliveP.find((u) => u.row === sr && u.col === sc);
          if (splashed) splashed.hp = Math.max(0, splashed.hp - dmg);
        }
      }
    }
    boss.atkCd = 12;
  },

  // Targets are random and splash reaches anywhere, so preview the whole grid.
  basicTiles: (geo) => geo.allCells(),
  specialTiles: (geo) => geo.allCells(),
};
