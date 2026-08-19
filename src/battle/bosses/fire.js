// Fire boss — Ember Strike / Pillar of Flame / Burning Touch.
// Chases the nearest player and burns whatever it touches.

import { MELEE_RANGE, BOSS_SIZE, STATUS_TICKS } from "../constants.js";
import { damageUnit } from "../hp.js";

/** The cross of tiles sharing either of the boss's two rows or two columns. */
function inCross(boss, r, c) {
  return (
    c === boss.col || c === boss.col + 1 || r === boss.row || r === boss.row + 1
  );
}

export default {
  key: "fire",

  special(ctx) {
    const { boss, aliveP, newFx, now, gridRows, gridCols } = ctx;
    if (boss.specialCd > 0) return;

    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (!inCross(boss, r, c) || ctx.bossOcc(r, c)) continue;
        newFx.push({
          id: now + "pof" + r + "," + c, row: r, col: c, t: now,
          isRanged: true,
          fromRow: boss.row + (c === boss.col || c === boss.col + 1 ? 0 : r > boss.row ? -1 : 1),
          fromCol: c, isEnemy: true, isPillar: true,
        });
      }
    }
    for (const u of aliveP.filter((u) => inCross(boss, u.row, u.col))) {
      damageUnit(u, ctx.dmg(0.2, 0.7, 0.3));
      u.burnTicks = STATUS_TICKS;
    }
    boss.specialCd = 20;
  },

  basic(ctx) {
    const { boss, newFx, now } = ctx;
    const adj = ctx.targetsWithin(MELEE_RANGE);

    if (adj.length > 0 && boss.atkCd <= 0) {
      const tgt = adj[0];
      damageUnit(tgt, ctx.dmg(0.12));
      tgt.burnTicks = STATUS_TICKS;
      boss.atkCd = 12;
      newFx.push({ id: now + 99991, row: tgt.row, col: tgt.col, t: now, isRanged: false, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
    } else if (adj.length === 0 && boss.moveCd <= 0 && ctx.aliveP.length) {
      ctx.moveToward(ctx.byDistance()[0], 2);
    }
  },

  basicTiles: (geo) => geo.cells((r, c) => geo.distToBoss(r, c) <= MELEE_RANGE),

  specialTiles: (geo) =>
    geo.cells(
      (r, c) =>
        (c >= geo.boss.col && c < geo.boss.col + BOSS_SIZE) ||
        (r >= geo.boss.row && r < geo.boss.row + BOSS_SIZE)
    ),
};
