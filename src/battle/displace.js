// Displace: forcibly moving a creature (a push, a pull, a knockback) -- the
// general term, as Immobilized is for effects that stop movement.
//
// POLICY: every Displace a creature causes goes through displaceUnit, so it
// obeys the same rules everywhere:
//   - A creature that can't be moved (Anchor Charm) stays put, and nothing
//     else about the push happens (no Impact).
//   - It moves tile by tile; the first blocked tile (the arena's edge, another
//     creature, the boss's body) stops it, and if the push came from a
//     creature it deals IMPACT damage -- `IMPACT_ATK_PCT` of that creature's
//     Attack, as effect damage, scaled by the source's `impactMult` gear
//     (Tidal Grip), which may also Stun on impact.
//   - A move that happened is announced (announceDisplaced), and counts as
//     the creature moving FROM its old tile for Ground Hazards that punish
//     moving (see the Hazards pass in tick.js).
// Bosses move creatures with their own code (battle/bosses/*), which checks
// resistsDisplacement and announces the same way.
//
// The grid it needs (occupancy, size, boss body) is handed over by tick.js
// each tick with setDisplaceGrid.

import { damageUnit } from "./hp.js";
import { withApplier } from "./applier.js";
import { resistsDisplacement, announceDisplaced } from "./immobilize.js";
import { applyTimedDebuff } from "./status.js";

/** Impact damage, as a share of the pushing creature's Attack. */
export const IMPACT_ATK_PCT = 20;

let grid = null;
export function setDisplaceGrid(g) {
  grid = g;
}

/**
 * Push `u` along (dr, dc) for up to `tiles` tiles. `source` is the creature
 * causing it (null for terrain). Returns { moved, impact }.
 */
export function displaceUnit(u, dr, dc, { tiles = 1, source = null } = {}) {
  const out = { moved: 0, impact: false };
  if (!grid || !u || u.uid == null || u.hp <= 0 || (u.size || 1) > 1 || (!dr && !dc)) return out;
  if (resistsDisplacement(u)) return out;
  const { allOcc, gridRows, gridCols, bossOcc, tick, now } = grid;
  const fromRow = u.row, fromCol = u.col;
  for (let i = 0; i < tiles; i++) {
    const nr = u.row + dr, nc = u.col + dc;
    const blocked = nr < 0 || nr >= gridRows || nc < 0 || nc >= gridCols || allOcc.has(nr + "," + nc) || (bossOcc && bossOcc(nr, nc));
    if (blocked) {
      out.impact = true;
      if (source) impact(u, source);
      break;
    }
    allOcc.delete(u.row + "," + u.col);
    u.row = nr;
    u.col = nc;
    allOcc.add(nr + "," + nc);
    out.moved++;
  }
  if (out.moved) {
    // Recorded as a move FROM the starting tile, so a hazard it was standing on
    // punishes it exactly as if it had stepped off.
    u.prevRow = fromRow;
    u.prevCol = fromCol;
    u.lastMoveTime = now;
    u._lastStepTick = tick;
    announceDisplaced(u, source);
  }
  return out;
}

/** A pushed creature hit something: Impact damage from the pusher. */
function impact(u, source) {
  const gear = source.gear || {};
  const dmg = Math.max(1, Math.round(((source.atk || 0) * IMPACT_ATK_PCT * (gear.impactMult || 1)) / 100));
  withApplier(source, () => {
    damageUnit(u, dmg, { effectDamage: true });
    if (gear.impactStunTicks && u.hp > 0) applyTimedDebuff(u, "stunTicks", Math.max(u.stunTicks || 0, gear.impactStunTicks));
  });
}

/** The single-step direction that points from (fromRow, fromCol) away through
 * (row, col): along the axis with the larger gap, so a push is always a
 * straight shove rather than a diagonal slide. */
export function awayFrom(fromRow, fromCol, row, col) {
  const dr = row - fromRow, dc = col - fromCol;
  if (Math.abs(dr) >= Math.abs(dc)) return [Math.sign(dr) || 1, 0];
  return [0, Math.sign(dc) || 1];
}
