// Shared plumbing for boss ability modules.
//
// Each boss module receives a `ctx` for runtime behaviour and a `geo` for
// planning-phase tile highlighting. Both expose the SAME geometry predicates,
// which is what keeps "what the ability hits" and "what the preview shows" from
// drifting apart -- they used to be two hand-written copies.

import { BOSS_SIZE } from "../constants.js";
import { distToBoss, bossOccupies, aStepToward } from "../geometry.js";
import { statModMultiplier, isIntangible } from "../status.js";

/** Standard damage roll: attack * random spread * ability multiplier, min 1. */
export function rollDamage(atk, mult, base = 0.8, spread = 0.4) {
  return Math.max(1, Math.round(atk * (base + Math.random() * spread) * mult));
}

/**
 * Runtime context handed to basic()/special()/onInit()/onStatusTick().
 * Mutating ctx.boss, ctx.aliveP, ctx.allOcc and pushing to ctx.newFx is the
 * expected way for a boss to act -- this matches how the engine already works.
 */
export function makeBossContext({ boss, aliveP, aliveE, allOcc, newFx, now, gridRows, gridCols }) {
  const ctx = {
    boss, aliveP, aliveE, allOcc, newFx, now, gridRows, gridCols,
    /** Damage roll against this boss's attack stat (reduced while the boss is ATK-debuffed, e.g. Starlit's Radiant Exchange). */
    dmg: (mult, base, spread) => rollDamage(boss.atk * statModMultiplier(boss, "atk"), mult, base, spread),
    /** Chebyshev distance from a cell to the boss body. */
    distToBoss: (r, c) => distToBoss(boss, r, c),
    /** True when the cell is inside the boss body. */
    bossOcc: (r, c) => bossOccupies(boss, r, c),
    /** Players within `range` of the boss, nearest first. Intangible units
     * (Deep Submerge) can not be targeted, so they never appear here. */
    targetsWithin(range) {
      return ctx.aliveP
        .filter((u) => !isIntangible(u) && distToBoss(boss, u.row, u.col) <= range)
        .sort((a, z) => distToBoss(boss, a.row, a.col) - distToBoss(boss, z.row, z.col));
    },
    /** All targetable players sorted nearest-first. */
    byDistance() {
      return ctx.aliveP.filter((u) => !isIntangible(u)).sort(
        (a, z) => distToBoss(boss, a.row, a.col) - distToBoss(boss, z.row, z.col)
      );
    },
    /**
     * Step the boss one tile toward a target, clamped to the grid and refusing
     * to overlap anything. Returns true if it actually moved.
     */
    moveToward(target, cooldown) {
      const [nr, nc] = aStepToward(boss.row, boss.col, target.row, target.col);
      const br = Math.max(0, Math.min(gridRows - BOSS_SIZE, nr));
      const bc = Math.max(0, Math.min(gridCols - BOSS_SIZE, nc));
      let blocked = false;
      for (let dr = 0; dr < BOSS_SIZE; dr++)
        for (let dc = 0; dc < BOSS_SIZE; dc++)
          if (allOcc.has(br + dr + "," + (bc + dc))) blocked = true;
      if (!blocked) {
        boss.prevRow = boss.row;
        boss.prevCol = boss.col;
        boss.lastMoveTime = now;
        boss.row = br;
        boss.col = bc;
      }
      boss.moveCd = cooldown;
      return !blocked;
    },
  };
  return ctx;
}

/**
 * Planning-phase geometry, built around a hypothetical boss position.
 * Uses the same distToBoss/bossOccupies as runtime, so a `<= MELEE_RANGE`
 * preview highlights exactly the cells a `<= MELEE_RANGE` attack would hit.
 */
export function makePlanGeometry(bossRow, bossCol, gridRows, gridCols, playerStartRow) {
  const boss = { row: bossRow, col: bossCol, hp: 1 };
  return {
    boss, gridRows, gridCols, playerStartRow,
    distToBoss: (r, c) => distToBoss(boss, r, c),
    bossOcc: (r, c) => bossOccupies(boss, r, c),
    /** Every non-boss cell matching `pred`, as a Set of "r,c". */
    cells(pred) {
      const out = new Set();
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          if (bossOccupies(boss, r, c)) continue;
          if (pred(r, c)) out.add(r + "," + c);
        }
      }
      return out;
    },
    /** Every non-boss cell on the grid. */
    allCells() {
      return this.cells(() => true);
    },
  };
}
