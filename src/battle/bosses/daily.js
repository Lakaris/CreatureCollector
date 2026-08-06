// Daily Boss generic kit — every Daily Boss runs this exact same kit,
// re-flavored only by boss.type (damage element, display text). Unlike the
// Dungeon bosses in fire.js/water.js/etc, Daily Bosses are not meant to have
// unique per-element mechanics — same kit, different element.
//
// Kit: <Type> Strike (basic melee hit) / <Type> Nova (AOE knockback) /
// Rising Fury (passive attack growth over time).

import { MELEE_RANGE } from "../constants.js";

const NOVA_RANGE = 2;
const FURY_INTERVAL_TICKS = 15;
const FURY_GROWTH = 1.03;

export default {
  key: "daily",

  special(ctx) {
    const { boss, allOcc, newFx, now, gridRows, gridCols } = ctx;
    if (boss.specialCd > 0) return;
    const targets = ctx.targetsWithin(NOVA_RANGE);
    for (const u of targets) {
      u.hp = Math.max(0, u.hp - ctx.dmg(0.18));
      // Knock back 1 tile directly away from the boss's center.
      const dr = Math.sign(u.row - (boss.row + 0.5)) || 1;
      const dc = Math.sign(u.col - (boss.col + 0.5)) || 0;
      const nr = u.row + dr, nc = u.col + dc;
      const key = nr + "," + nc;
      if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols && !allOcc.has(key) && !ctx.bossOcc(nr, nc)) {
        allOcc.delete(u.row + "," + u.col);
        u.prevRow = u.row;
        u.prevCol = u.col;
        u.lastMoveTime = now;
        u.row = nr;
        u.col = nc;
        allOcc.add(key);
      }
      newFx.push({ id: now + "nova" + u.uid, row: u.row, col: u.col, t: now, isRanged: false, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
    }
    boss.specialCd = 20;
  },

  basic(ctx) {
    const { boss, newFx, now } = ctx;
    const adj = ctx.targetsWithin(MELEE_RANGE);
    if (adj.length > 0 && boss.atkCd <= 0) {
      const tgt = adj[0];
      tgt.hp = Math.max(0, tgt.hp - ctx.dmg(0.12));
      boss.atkCd = 12;
      newFx.push({ id: now + "dstrike", row: tgt.row, col: tgt.col, t: now, isRanged: false, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
    } else if (adj.length === 0 && boss.moveCd <= 0 && ctx.aliveP.length) {
      ctx.moveToward(ctx.byDistance()[0], 2);
    }
  },

  // Rising Fury: passive attack growth over the course of the fight.
  onStatusTick(ctx) {
    const { boss } = ctx;
    boss._furyTicks = (boss._furyTicks || 0) + 1;
    if (boss._furyTicks % FURY_INTERVAL_TICKS === 0) {
      boss.atk = Math.round(boss.atk * FURY_GROWTH);
    }
  },

  basicTiles: (geo) => geo.cells((r, c) => geo.distToBoss(r, c) <= MELEE_RANGE),
  specialTiles: (geo) => geo.cells((r, c) => geo.distToBoss(r, c) <= NOVA_RANGE),
};
