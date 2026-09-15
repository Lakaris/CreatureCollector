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
 * The boss's crit, folded into ctx.dmg below.
 *
 * ctx.dmg is the one place a boss's attack damage is rolled -- every module
 * goes through it, and `boss.atk` appears nowhere else in bosses/ except
 * cooldown bookkeeping -- so rolling here covers every boss attack and cannot
 * double up. Modules call it INSIDE their per-target loop, so an area attack
 * rolls per victim rather than critting on everyone at once, matching how
 * creature specials behave (battle/damage.js).
 *
 * Deliberately not applied to what a boss does outside ctx.dmg: Burn and DoT
 * ticks, and effects sized as a percentage of the victim's own Health. Those
 * aren't attacks, and creatures' DoTs don't crit either.
 */
function bossCritMultiplier(boss) {
  const chance = (boss && boss.crit) || 0;
  if (!(Math.random() * 100 < chance)) return 1;
  return 1 + ((boss && boss.critDmg) || 0) / 100;
}

/**
 * TAUNT IS THE ONE CONTROL EFFECT A BOSS OBEYS.
 *
 * Everything else in the CC family -- Stun, Root, Fear, Restrained -- still
 * bounces off a boss, because those stop it acting and a boss that can be
 * stopped stops being a boss. Taunt only redirects the same attacks it was
 * going to make anyway, so it costs the fight nothing except who gets hit,
 * which is exactly the decision a tank is supposed to be making.
 *
 * Enforced here rather than in each boss module because ctx.targetsWithin and
 * ctx.byDistance are the only two ways a module chooses a victim -- collapsing
 * the list to the Taunt's holder covers every boss at once, the same way
 * selectTarget's tauntedFoe covers every creature (battle/tick.js).
 *
 * The Taunt itself expires through the ordinary timer: tickTimedMods(boss)
 * already decrements tauntTicks and clears the source.
 */
function tauntedTarget(boss, aliveP) {
  if ((boss.tauntTicks || 0) <= 0 || boss.tauntSourceUid == null) return null;
  const holder = aliveP.find((u) => u.uid === boss.tauntSourceUid);
  // A dead or Intangible taunter releases the boss back to normal targeting.
  return holder && holder.hp > 0 && !isIntangible(holder) ? holder : null;
}

/**
 * Runtime context handed to basic()/special()/onInit()/onStatusTick().
 * Mutating ctx.boss, ctx.aliveP, ctx.allOcc and pushing to ctx.newFx is the
 * expected way for a boss to act -- this matches how the engine already works.
 */
export function makeBossContext({ boss, aliveP, aliveE, allOcc, newFx, now, gridRows, gridCols }) {
  const ctx = {
    boss, aliveP, aliveE, allOcc, newFx, now, gridRows, gridCols,
    /** Damage roll against this boss's attack stat (reduced while the boss is
     * ATK-debuffed, e.g. Starlit's Radiant Exchange), times its crit. */
    dmg: (mult, base, spread) =>
      Math.max(1, Math.round(rollDamage(boss.atk * statModMultiplier(boss, "atk"), mult, base, spread) * bossCritMultiplier(boss))),
    /** Chebyshev distance from a cell to the boss body. */
    distToBoss: (r, c) => distToBoss(boss, r, c),
    /** True when the cell is inside the boss body. */
    bossOcc: (r, c) => bossOccupies(boss, r, c),
    /** Players within `range` of the boss, nearest first. Intangible units
     * (Deep Submerge) can not be targeted, so they never appear here. A Taunt
     * collapses the list to its holder (see tauntedTarget). */
    targetsWithin(range) {
      const forced = tauntedTarget(boss, ctx.aliveP);
      const pool = forced ? [forced] : ctx.aliveP;
      return pool
        .filter((u) => !isIntangible(u) && distToBoss(boss, u.row, u.col) <= range)
        .sort((a, z) => distToBoss(boss, a.row, a.col) - distToBoss(boss, z.row, z.col));
    },
    /** All targetable players sorted nearest-first, or just the Taunt holder. */
    byDistance() {
      const forced = tauntedTarget(boss, ctx.aliveP);
      const pool = forced ? [forced] : ctx.aliveP;
      return pool.filter((u) => !isIntangible(u)).sort(
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
