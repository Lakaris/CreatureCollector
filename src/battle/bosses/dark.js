// Dark boss — Shadow Row / Cursed Veil / Dark Shroud.
//
// Stationary and hits the entire grid every attack. Dark Shroud is a passive
// handled in the player-damage path, not here: the more debuffs the party is
// carrying, the less damage players deal back.

import { STATUS_TICKS } from "../constants.js";

export default {
  key: "dark",

  special(ctx) {
    const { boss, aliveP, newFx, now } = ctx;
    if (boss.specialCd > 0 || !aliveP.length) return;

    for (const u of aliveP) {
      u.hp = Math.max(0, u.hp - ctx.dmg(0.1));
      u.weakTicks = STATUS_TICKS;
      u.healImmuneTicks = STATUS_TICKS;
      newFx.push({ id: now + "cvl" + u.uid, row: u.row, col: u.col, t: now, isDark: true });
    }
    boss.specialCd = 22;
  },

  basic(ctx) {
    const { boss, aliveP, newFx, now, gridRows, gridCols } = ctx;
    if (boss.atkCd > 0 || !aliveP.length) return;

    for (const u of aliveP) {
      u.hp = Math.max(0, u.hp - ctx.dmg(0.11));
      u.dotTicks = STATUS_TICKS;
      newFx.push({ id: now + "drk" + u.uid, row: u.row, col: u.col, t: now, isRanged: true, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
    }
    // The sweep visually covers the whole grid.
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        newFx.push({ id: now + "drkgrid" + r + "," + c, row: r, col: c, t: now, isDark: true });
      }
    }
    boss.atkCd = 11;
  },

  /** Shadow Row reaches every deployed player, so preview the player zone. */
  basicTiles: (geo) => {
    const out = new Set();
    for (let r = geo.playerStartRow; r < geo.gridRows; r++) {
      for (let c = 0; c < geo.gridCols; c++) out.add(r + "," + c);
    }
    return out;
  },

  specialTiles: (geo) => geo.allCells(),
};
