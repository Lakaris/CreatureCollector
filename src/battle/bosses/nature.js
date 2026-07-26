// Nature boss — Life Drain / Overgrowth / Ancient Stride.
//
// Stationary. Drains one target at unlimited range, building a damage stack the
// longer it keeps the same victim, and roots/poisons anything that closes in.
// Also spawns vine minions at the start of the fight (see battle/minions.js).

import { MELEE_RANGE } from "../constants.js";

export default {
  key: "nature",

  special(ctx) {
    const { boss, allOcc, newFx, now, gridRows } = ctx;
    if (boss.specialCd > 0 || !ctx.aliveP.length) return;

    const adj = ctx.targetsWithin(MELEE_RANGE);
    if (!adj.length) return;

    adj.forEach((u, i) => {
      u.hp = Math.max(0, u.hp - ctx.dmg(0.15, 0.7, 0.3));
      // Shove one row down the grid, if that tile is free.
      const newRow = Math.min(gridRows - 1, u.row + 1);
      const key = newRow + "," + u.col;
      if (!allOcc.has(key) || newRow === u.row) {
        allOcc.delete(u.row + "," + u.col);
        u.prevRow = u.row;
        u.prevCol = u.col;
        u.lastMoveTime = now;
        u.row = newRow;
        allOcc.add(key);
      }
      u.rootTicks = (u.rootTicks || 0) + 8;
      u.poisonTicks = (u.poisonTicks || 0) + 10;
      newFx.push({ id: now + 99993 + i, row: u.row, col: u.col, t: now, isRanged: true, fromRow: boss.row, fromCol: boss.col + 0.5, isEnemy: true });
    });
    boss.specialCd = 18;
  },

  basic(ctx) {
    const { boss, newFx, now } = ctx;
    if (!ctx.aliveP.length || boss.atkCd > 0) return;

    const tgt = ctx.byDistance()[0];
    // Staying on one target ramps the damage; switching resets it.
    if (boss.lifeTarget === tgt.uid) boss.lifeStacks = Math.min((boss.lifeStacks || 0) + 1, 10);
    else {
      boss.lifeTarget = tgt.uid;
      boss.lifeStacks = 0;
    }
    const stackMult = 1 + boss.lifeStacks * 0.25;
    tgt.hp = Math.max(0, tgt.hp - ctx.dmg(0.1 * stackMult));
    boss.atkCd = 10;
    newFx.push({ id: now + 99991, row: tgt.row, col: tgt.col, t: now, isRanged: true, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
  },

  // Life Drain has unlimited range, so every tile is a potential target.
  basicTiles: (geo) => geo.allCells(),
  specialTiles: (geo) => geo.cells((r, c) => geo.distToBoss(r, c) <= MELEE_RANGE),
};
