// Earth boss — Tremor Slam / Earthen Charge / Crushing Weight.
//
// Charges in a 2-wide strip toward whichever direction holds the most players,
// stacking everyone it hits flush against the far wall. If the charge can't move
// at all (wall or pinned units), it falls back to an empowered Tremor Slam.
// Each charge grants a stacking haste bonus that shortens its own cooldowns.

import { MELEE_RANGE, BOSS_SIZE } from "../constants.js";
import { bossOutOfBounds, bossBlocked } from "../geometry.js";

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** How many players sit in the 2-wide strip in each cardinal direction. */
function countByDirection(boss, aliveP) {
  return DIRS.map(([sr, sc]) => {
    if (sr === 1) return aliveP.filter((u) => u.col >= boss.col && u.col < boss.col + 2 && u.row >= boss.row + 2).length;
    if (sr === -1) return aliveP.filter((u) => u.col >= boss.col && u.col < boss.col + 2 && u.row < boss.row).length;
    if (sc === 1) return aliveP.filter((u) => u.row >= boss.row && u.row < boss.row + 2 && u.col >= boss.col + 2).length;
    return aliveP.filter((u) => u.row >= boss.row && u.row < boss.row + 2 && u.col < boss.col).length;
  });
}

/** Charge toward the most crowded direction; fall back to the nearest player. */
function pickDirection(ctx) {
  const { boss, aliveP } = ctx;
  const counts = countByDirection(boss, aliveP);
  const max = Math.max(...counts);
  if (max > 0) return DIRS[counts.indexOf(max)];
  const tgt = ctx.byDistance()[0];
  const dr = tgt.row - (boss.row + 0.5);
  const dc = tgt.col - (boss.col + 0.5);
  return Math.abs(dr) >= Math.abs(dc) ? [dr > 0 ? 1 : -1, 0] : [0, dc > 0 ? 1 : -1];
}

/** Players standing in the charge strip ahead of the boss. */
function unitsInPath(boss, aliveP, stepR, stepC) {
  return aliveP.filter((u) =>
    stepR === 1 ? u.col >= boss.col && u.col < boss.col + 2 && u.row > boss.row + 1 :
    stepR === -1 ? u.col >= boss.col && u.col < boss.col + 2 && u.row < boss.row :
    stepC === 1 ? u.row >= boss.row && u.row < boss.row + 2 && u.col > boss.col + 1 :
                  u.row >= boss.row && u.row < boss.row + 2 && u.col < boss.col
  );
}

export default {
  key: "earth",

  onStatusTick(ctx) {
    for (const u of ctx.aliveP) if ((u.slowTicks || 0) > 0) u.slowTicks--;
  },

  special(ctx) {
    const { boss, aliveP, allOcc, newFx, now, gridRows, gridCols } = ctx;
    if (boss.specialCd > 0 || !aliveP.length) return;

    const hasteBonus = boss.chargeHaste || 0;
    const [stepR, stepC] = pickDirection(ctx);

    // Group victims into lanes, then stack each lane against the wall with no
    // gaps -- pushing everyone by the same distance would preserve their
    // original spacing and leave holes.
    const lanes = new Map();
    for (const u of unitsInPath(boss, aliveP, stepR, stepC)) {
      const key = stepR !== 0 ? u.col : u.row;
      if (!lanes.has(key)) lanes.set(key, []);
      lanes.get(key).push(u);
    }
    for (const lane of lanes.values()) {
      if (stepR === 1) lane.sort((a, z) => z.row - a.row);
      else if (stepR === -1) lane.sort((a, z) => a.row - z.row);
      else if (stepC === 1) lane.sort((a, z) => z.col - a.col);
      else lane.sort((a, z) => a.col - z.col);

      lane.forEach((u, i) => {
        allOcc.delete(u.row + "," + u.col);
        u.prevRow = u.row;
        u.prevCol = u.col;
        u.lastMoveTime = now;
        if (stepR === 1) u.row = gridRows - 1 - i;
        else if (stepR === -1) u.row = i;
        else if (stepC === 1) u.col = gridCols - 1 - i;
        else u.col = i;
        allOcc.add(u.row + "," + u.col);
        u.hp = Math.max(0, u.hp - ctx.dmg(0.22));
        u.slowTicks = (u.slowTicks || 0) + 8;
        newFx.push({ id: now + "chg" + u.uid, row: u.row, col: u.col, t: now, isRanged: false, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
      });
    }

    // Charge until the wall or a unit stops us.
    const startR = boss.row, startC = boss.col;
    while (true) {
      const nr = boss.row + stepR, nc = boss.col + stepC;
      if (bossOutOfBounds(nr, nc, gridRows, gridCols)) break;
      if (bossBlocked(nr, nc, allOcc)) break;
      boss.prevRow = boss.row;
      boss.prevCol = boss.col;
      boss.lastMoveTime = now;
      boss.row = nr;
      boss.col = nc;
    }

    // Couldn't move at all: empowered Tremor Slam instead of a wasted turn.
    if (boss.row === startR && boss.col === startC) {
      for (const u of ctx.targetsWithin(2)) {
        u.hp = Math.max(0, u.hp - ctx.dmg(0.28));
        u.slowTicks = (u.slowTicks || 0) + 10;
        newFx.push({ id: now + "bts" + u.uid, row: u.row, col: u.col, t: now, isRanged: false, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
      }
      newFx.push({ id: now + "empslam", row: boss.row + 0.5, col: boss.col + 0.5, t: now, isEmpSlam: true });
    }

    boss.chargeHaste = hasteBonus + 1;
    boss.specialCd = Math.max(8, 15 - hasteBonus);
  },

  basic(ctx) {
    const { boss, newFx, now } = ctx;
    const hasteBonus = boss.chargeHaste || 0;
    const adj = ctx.targetsWithin(MELEE_RANGE);

    if (adj.length > 0 && boss.atkCd <= 0) {
      for (const u of adj) {
        u.hp = Math.max(0, u.hp - ctx.dmg(0.14));
        u.slowTicks = (u.slowTicks || 0) + 6;
        newFx.push({ id: now + "ebs" + u.uid, row: u.row, col: u.col, t: now, isRanged: false, fromRow: boss.row + 0.5, fromCol: boss.col + 0.5, isEnemy: true });
      }
      boss.atkCd = Math.max(5, 12 - hasteBonus);
    } else if (adj.length === 0 && boss.moveCd <= 0 && ctx.aliveP.length) {
      ctx.moveToward(ctx.byDistance()[0], Math.max(2, 5 - Math.floor(hasteBonus / 2)));
    }
  },

  basicTiles: (geo) => geo.cells((r, c) => geo.distToBoss(r, c) <= MELEE_RANGE),

  // Charge direction depends on where players stand, which isn't known before
  // deployment, so the preview shows both bands the charge could travel along.
  specialTiles: (geo) =>
    geo.cells(
      (r, c) =>
        (c >= geo.boss.col && c < geo.boss.col + BOSS_SIZE) ||
        (r >= geo.boss.row && r < geo.boss.row + BOSS_SIZE)
    ),
};
