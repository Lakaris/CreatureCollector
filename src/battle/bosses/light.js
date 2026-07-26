// Light boss — Radiant Strike / Holy Radiance / Bulwark.
//
// Stationary; players must come to it. Holy Radiance stacks Power (permanent
// damage scaling) and Shield, and Radiant Strike hits harder while shielded.

import { MELEE_RANGE, BOSS_SIZE } from "../constants.js";

export default {
  key: "light",

  /** Opens on a longer cooldown so the fight doesn't start with a nuke. */
  onInit(ctx) {
    ctx.boss.specialCd = 22;
  },

  special(ctx) {
    const { boss, aliveP, newFx, now } = ctx;
    if (boss.specialCd > 0 || !aliveP.length) return;

    const powerMult = 1 + 0.2 * (boss.powerStacks || 0);
    boss.shield = (boss.shield || 0) + Math.round(boss.maxHp * 0.15);
    boss.powerStacks = (boss.powerStacks || 0) + 1;

    for (const u of aliveP) {
      u.hp = Math.max(0, u.hp - ctx.dmg(0.12 * powerMult));
      newFx.push({ id: now + "hrad" + u.uid, row: u.row, col: u.col, t: now, isPillar: true });
    }
    boss.specialCd = 20;
  },

  basic(ctx) {
    const { boss, aliveP, newFx, now, gridRows, gridCols } = ctx;
    const adj = ctx.targetsWithin(MELEE_RANGE);
    if (!adj.length || boss.atkCd > 0) return;

    // A 4-wide swing along whichever face the nearest player stands on.
    const nearest = adj[0];
    const dr = nearest.row - (boss.row + 0.5);
    const dc = nearest.col - (boss.col + 0.5);
    let tiles;
    if (Math.abs(dr) >= Math.abs(dc)) {
      const r = dr > 0 ? boss.row + BOSS_SIZE : boss.row - 1;
      tiles = [[r, boss.col - 1], [r, boss.col], [r, boss.col + 1], [r, boss.col + 2]];
    } else {
      const c = dc > 0 ? boss.col + BOSS_SIZE : boss.col - 1;
      tiles = [[boss.row - 1, c], [boss.row, c], [boss.row + 1, c], [boss.row + 2, c]];
    }
    tiles = tiles.filter(([r, c]) => r >= 0 && r < gridRows && c >= 0 && c < gridCols);

    const hits = aliveP.filter((u) => tiles.some(([r, c]) => u.row === r && u.col === c));
    if (!hits.length) return;

    const powerMult = 1 + 0.2 * (boss.powerStacks || 0);
    const shieldBonus = boss.shield > 0 ? 1.4 : 1;
    for (const [r, c] of tiles) {
      newFx.push({ id: now + "lgt" + r + "," + c, row: r, col: c, t: now, isPillar: true });
    }
    for (const tgt of hits) {
      tgt.hp = Math.max(0, tgt.hp - ctx.dmg(0.15 * powerMult * shieldBonus));
    }
    boss.atkCd = 9;
  },

  /** The four faces the 4-wide swing can land on. */
  basicTiles: (geo) => {
    const { boss, gridRows, gridCols } = geo;
    const out = new Set();
    const cols = [boss.col - 1, boss.col, boss.col + 1, boss.col + 2];
    const rows = [boss.row - 1, boss.row, boss.row + 1, boss.row + 2];
    for (const c of cols) {
      if (c < 0 || c >= gridCols) continue;
      if (boss.row + BOSS_SIZE < gridRows) out.add(boss.row + BOSS_SIZE + "," + c);
      if (boss.row - 1 >= 0) out.add(boss.row - 1 + "," + c);
    }
    for (const r of rows) {
      if (r < 0 || r >= gridRows) continue;
      if (boss.col - 1 >= 0) out.add(r + "," + (boss.col - 1));
      if (boss.col + BOSS_SIZE < gridCols) out.add(r + "," + (boss.col + BOSS_SIZE));
    }
    return out;
  },

  // Holy Radiance hits everyone.
  specialTiles: (geo) => geo.allCells(),
};
