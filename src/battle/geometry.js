// Grid geometry and pathfinding, shared by all three battle screens.
//
// The boss-aware helpers take the boss and grid dimensions as arguments rather
// than closing over module constants, so the same code serves the 6x10 dungeon
// grid, the 5x8 arena grid, and any future size.

import { BOSS_SIZE } from "./constants.js";

/** 8-directional distance. This is the range metric attacks use. */
export function aChebDist(r1, c1, r2, c2) {
  return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
}

/** Distance along a shared row or column; Infinity when not aligned. */
export function aCardinalDist(r1, c1, r2, c2) {
  if (r1 === r2) return Math.abs(c1 - c2);
  if (c1 === c2) return Math.abs(r1 - r2);
  return Infinity;
}

/** One greedy step toward a target, favouring the larger axis. */
export function aStepToward(r, c, tr, tc) {
  const dr = tr - r;
  const dc = tc - c;
  if (Math.abs(dr) >= Math.abs(dc) && dr !== 0) return [r + Math.sign(dr), c];
  if (dc !== 0) return [r, c + Math.sign(dc)];
  return [r, c];
}

/**
 * BFS step toward a target, routing around blocked cells.
 *
 * Returns the first step of the shortest path. When the target itself is
 * unreachable (commonly: it's occupied by the enemy being attacked), it returns
 * the first step toward the closest reachable cell instead. That fallback is
 * what stops units oscillating when their goal tile is blocked.
 *
 * (avoidR, avoidC) marks a cell that may not be taken as the FIRST step --
 * callers pass the cell the unit just vacated so that stateless re-planning
 * every tick can't flip-flop between two equal-cost routes (units visibly
 * pacing left-right against a full front line). The cell stays usable as a
 * later step of a longer route; when no other step improves, the unit stands
 * still instead of backtracking.
 */
export function aBestStep(r, c, tr, tc, isBlocked, avoidR, avoidC) {
  if (r === tr && c === tc) return [r, c];
  const visited = new Set([r + "," + c]);
  const queue = [[r, c, null]];
  let bestDist = Math.abs(r - tr) + Math.abs(c - tc);
  let bestStep = null;
  while (queue.length) {
    const [cr, cc, first] = queue.shift();
    for (const [nr, nc] of [
      [cr - 1, cc],
      [cr + 1, cc],
      [cr, cc - 1],
      [cr, cc + 1],
    ]) {
      const key = nr + "," + nc;
      if (visited.has(key)) continue;
      // Not as a first step; left unvisited so a longer route may still pass
      // through it.
      if (!first && nr === avoidR && nc === avoidC) continue;
      visited.add(key);
      if (isBlocked(nr, nc)) continue;
      const step = first || [nr, nc];
      if (nr === tr && nc === tc) return step;
      const d = Math.abs(nr - tr) + Math.abs(nc - tc);
      if (d < bestDist) {
        bestDist = d;
        bestStep = step;
      }
      queue.push([nr, nc, step]);
    }
  }
  return bestStep || [r, c];
}

// ── Multi-cell units ─────────────────────────────────────────────────────
// Units carry an optional `size` (default 1); Labyrinth Boss creatures are
// 2x2. `row`/`col` is always the body's top-left anchor. These helpers make
// distance and occupancy body-aware while collapsing to the plain metrics
// for 1x1 units.

/** Every "r,c" cell of a unit's body. */
export function cellsOf(u) {
  const s = u.size || 1;
  const out = [];
  for (let dr = 0; dr < s; dr++) for (let dc = 0; dc < s; dc++) out.push(u.row + dr + "," + (u.col + dc));
  return out;
}

/** Chebyshev distance between two units' BODIES (0 when they touch/overlap). */
export function unitDist(a, b) {
  const as = a.size || 1, bs = b.size || 1;
  const rd = Math.max(0, b.row - (a.row + as - 1), a.row - (b.row + bs - 1));
  const cd = Math.max(0, b.col - (a.col + as - 1), a.col - (b.col + bs - 1));
  return Math.max(rd, cd);
}

/** Body-aware cardinal distance: the straight-line gap when any of the two
 * bodies' rows (or columns) line up; Infinity when nothing is aligned. */
export function unitCardinalDist(a, b) {
  const as = a.size || 1, bs = b.size || 1;
  const rowsOverlap = a.row <= b.row + bs - 1 && b.row <= a.row + as - 1;
  const colsOverlap = a.col <= b.col + bs - 1 && b.col <= a.col + as - 1;
  const rd = Math.max(0, b.row - (a.row + as - 1), a.row - (b.row + bs - 1));
  const cd = Math.max(0, b.col - (a.col + as - 1), a.col - (b.col + bs - 1));
  if (rowsOverlap && colsOverlap) return 0;
  if (rowsOverlap) return cd;
  if (colsOverlap) return rd;
  return Infinity;
}

/** Ease-in-out curve for movement interpolation. */
export function aEase(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/** True when (r,c) falls inside the boss's 2x2 body. */
export function bossOccupies(boss, r, c) {
  if (!boss || boss.hp <= 0) return false;
  return (
    r >= boss.row &&
    r < boss.row + BOSS_SIZE &&
    c >= boss.col &&
    c < boss.col + BOSS_SIZE
  );
}

/**
 * Chebyshev distance from a cell to the boss's 2x2 body.
 *
 * Must stay Chebyshev: a Manhattan metric here made ranged units unable to
 * find a firing position diagonal to the boss, so they never attacked.
 */
export function distToBoss(boss, r, c) {
  if (!boss || boss.hp <= 0) return Infinity;
  const rd = Math.max(0, boss.row - r, r - (boss.row + BOSS_SIZE - 1));
  const cd = Math.max(0, boss.col - c, c - (boss.col + BOSS_SIZE - 1));
  return Math.max(rd, cd);
}

/** True when a cell is within `range` of the boss body. */
export function isAdjacentToBoss(boss, r, c, range = 1) {
  return distToBoss(boss, r, c) <= range;
}

/** Nearest free cell bordering the boss, for melee units closing in. */
export function nearestOpenBossAdj(boss, ur, uc, occupied, gridRows, gridCols) {
  if (!boss || boss.hp <= 0) return null;
  const adj = [];
  for (let dr = -1; dr < BOSS_SIZE + 1; dr++) {
    for (let dc = -1; dc < BOSS_SIZE + 1; dc++) {
      if (dr >= 0 && dr < BOSS_SIZE && dc >= 0 && dc < BOSS_SIZE) continue;
      const r = boss.row + dr;
      const c = boss.col + dc;
      if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) continue;
      if (occupied.has(r + "," + c) && !(r === ur && c === uc)) continue;
      adj.push([r, c]);
    }
  }
  adj.sort(
    (a, z) =>
      Math.abs(a[0] - ur) + Math.abs(a[1] - uc) -
      (Math.abs(z[0] - ur) + Math.abs(z[1] - uc))
  );
  return adj[0] || null;
}

/** True when the boss's 2x2 body would leave the grid at (nr,nc). */
export function bossOutOfBounds(nr, nc, gridRows, gridCols) {
  return (
    nr < 0 || nr + BOSS_SIZE > gridRows || nc < 0 || nc + BOSS_SIZE > gridCols
  );
}

/** True when any cell of a 2x2 body at (nr,nc) is occupied. */
export function bossBlocked(nr, nc, occupied) {
  for (let dr = 0; dr < BOSS_SIZE; dr++) {
    for (let dc = 0; dc < BOSS_SIZE; dc++) {
      if (occupied.has(nr + dr + "," + (nc + dc))) return true;
    }
  }
  return false;
}

/**
 * Nearest cell to (sr,sc) -- including itself -- for which `isBlocked` is
 * false, via BFS ring expansion. Used when a unit needs to land somewhere
 * that turned out to be occupied (e.g. a charge attack bouncing off a wall).
 * Returns null if the whole grid is blocked.
 */
export function nearestOpenCell(sr, sc, isBlocked, gridRows, gridCols) {
  if (!isBlocked(sr, sc)) return [sr, sc];
  const visited = new Set([sr + "," + sc]);
  const queue = [[sr, sc]];
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
      if (nr < 0 || nr >= gridRows || nc < 0 || nc >= gridCols) continue;
      const key = nr + "," + nc;
      if (visited.has(key)) continue;
      visited.add(key);
      if (!isBlocked(nr, nc)) return [nr, nc];
      queue.push([nr, nc]);
    }
  }
  return null;
}
