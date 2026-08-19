// Wind boss — Gust Strike / Cyclone / Turbulence.
//
// Melee and mobile. Every push or pull that slams a unit into a wall or
// another unit deals bonus collision damage instead of just fizzling, which is
// what makes Cyclone dangerous: it drags the whole party in at once, and a
// crowded party is a party that keeps colliding.

import { MELEE_RANGE } from "../constants.js";
import { aStepToward } from "../geometry.js";
import { damageUnit } from "../hp.js";

/** Bonus damage multiplier when a knockback/pull is blocked by something. */
const COLLISION_MULT = 0.5;

/** True when `u` can't move into a specific cell (wall, boss body, or another unit). */
function isBlockedCell(nr, nc, gridRows, gridCols, allOcc, ctx) {
  return nr < 0 || nr >= gridRows || nc < 0 || nc >= gridCols || allOcc.has(nr + "," + nc) || ctx.bossOcc(nr, nc);
}

/** Flash a collision burst at the midpoint between `u` and the cell that blocked it. */
function pushCollisionFx(u, blockedR, blockedC, ctx) {
  ctx.newFx.push({ id: ctx.now + "col" + u.uid, row: (u.row + blockedR) / 2, col: (u.col + blockedC) / 2, t: ctx.now, isCollision: true });
}

/** Draw a wind-streak trail from `fromR,fromC` to `u`'s current tile. */
function pushGustFx(u, fromR, fromC, ctx) {
  if (fromR === u.row && fromC === u.col) return;
  ctx.newFx.push({ id: ctx.now + "gst" + u.uid, row: u.row, col: u.col, t: ctx.now, isGust: true, fromRow: fromR, fromCol: fromC });
}

/** Push `u` one tile directly away from the boss's center; collides if blocked. */
function knockAway(u, ctx) {
  const { boss, allOcc, now, gridRows, gridCols } = ctx;
  const cr = boss.row + 0.5, cc = boss.col + 0.5;
  const dr = u.row - cr, dc = u.col - cc;
  const stepR = Math.abs(dr) >= Math.abs(dc) ? Math.sign(dr) || 1 : 0;
  const stepC = stepR === 0 ? Math.sign(dc) || 1 : 0;
  const nr = u.row + stepR, nc = u.col + stepC;
  if (isBlockedCell(nr, nc, gridRows, gridCols, allOcc, ctx)) {
    damageUnit(u, ctx.dmg(COLLISION_MULT));
    pushCollisionFx(u, nr, nc, ctx);
    return;
  }
  const fromR = u.row, fromC = u.col;
  allOcc.delete(u.row + "," + u.col);
  u.prevRow = u.row;
  u.prevCol = u.col;
  u.lastMoveTime = now;
  u.row = nr;
  u.col = nc;
  allOcc.add(nr + "," + nc);
  pushGustFx(u, fromR, fromC, ctx);
}

/** Pull `u` up to `tiles` steps toward the boss's center; collides if blocked partway. */
function pullToward(u, tiles, ctx) {
  const { boss, allOcc, now, gridRows, gridCols } = ctx;
  const cr = boss.row + 0.5, cc = boss.col + 0.5;
  const fromR = u.row, fromC = u.col;
  let blockedAt = null;
  for (let i = 0; i < tiles; i++) {
    const [nr, nc] = aStepToward(u.row, u.col, cr, cc);
    if (nr === u.row && nc === u.col) break; // already as close as it can get
    if (isBlockedCell(nr, nc, gridRows, gridCols, allOcc, ctx)) { blockedAt = [nr, nc]; break; }
    allOcc.delete(u.row + "," + u.col);
    u.prevRow = u.row;
    u.prevCol = u.col;
    u.lastMoveTime = now;
    u.row = nr;
    u.col = nc;
    allOcc.add(nr + "," + nc);
  }
  pushGustFx(u, fromR, fromC, ctx);
  if (blockedAt) {
    damageUnit(u, ctx.dmg(COLLISION_MULT));
    pushCollisionFx(u, blockedAt[0], blockedAt[1], ctx);
  }
}

export default {
  key: "wind",

  special(ctx) {
    const { boss, aliveP, newFx, now } = ctx;
    if (boss.specialCd > 0 || !aliveP.length) return;

    for (const u of aliveP) {
      damageUnit(u, ctx.dmg(0.16, 0.7, 0.3));
      newFx.push({ id: now + "cychit" + u.uid, row: u.row, col: u.col, t: now, isRanged: true, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
      pullToward(u, 2, ctx); // pushes its own gust-trail / collision-burst fx
    }
    boss.specialCd = 18;
  },

  basic(ctx) {
    const { boss, newFx, now } = ctx;
    if (!ctx.aliveP.length || boss.atkCd > 0) return;

    const adj = ctx.targetsWithin(MELEE_RANGE);
    if (!adj.length) {
      if (boss.moveCd <= 0) ctx.moveToward(ctx.byDistance()[0], 2);
      return;
    }

    const tgt = adj[0];
    damageUnit(tgt, ctx.dmg(0.14));
    newFx.push({ id: now + "gsthit" + tgt.uid, row: tgt.row, col: tgt.col, t: now, isRanged: false, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
    knockAway(tgt, ctx); // pushes its own gust-trail / collision-burst fx
    boss.atkCd = 11;
  },

  basicTiles: (geo) => geo.cells((r, c) => geo.distToBoss(r, c) <= MELEE_RANGE),
  specialTiles: (geo) => geo.allCells(),
};
