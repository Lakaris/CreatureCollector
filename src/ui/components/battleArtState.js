// Deriving a creature's animation state from a live battle unit.
//
// Shared by every battle screen (Arena / Dungeon / Daily Boss / Labyrinth /
// Test Battle) so they agree on what "attacking" and "moving" look like. The
// engine stamps the two timestamps this reads: lastAttackTime whenever a unit
// swings (battle/tick.js) and deathTime when its Health first hits 0
// (battle/hp.js).

import { hasArtState } from "../../core/creatures.js";

/** How long a unit reads as "attacking" after a swing, in ms. */
export const ATTACK_ART_MS = 400;

/** How long a defeated unit lingers so its defeat art can play, in ms. */
export const DEFEAT_ART_MS = 900;

/**
 * How long the battle screens hold on the final frame after a side is wiped,
 * so the winners' victory art can play before the outcome overlay appears.
 */
export const VICTORY_LINGER_MS = 2500;

/**
 * Mark every living unit in `units` as victorious -- battleArtState renders
 * them in the `victory` state from then on (falling back to idle art for
 * creatures without any). Called by each battle screen the moment it decides
 * the outcome, on the WINNING side's units. Returns how many were stamped so
 * callers can skip the linger when nobody is left to pose (e.g. losing to a
 * boss with no minions on the field).
 */
export function stampVictors(units, now) {
  let n = 0;
  for (const u of units) if (u.hp > 0) { u.victoryTime = now; n++; }
  return n;
}

/**
 * The animation state to draw a battle unit in. Attack beats move so a unit
 * that steps and swings in the same tick reads as attacking, which is the more
 * informative of the two. Victory (stamped once the battle is decided) beats
 * both -- the fight is over, so the pose wins.
 *
 * @param {number} moveAnimMs the screen's move-tween duration, which is also
 *   how long a step should read as movement.
 */
export function battleArtState(u, now, moveAnimMs) {
  if (u.hp <= 0) return "defeat";
  if (u.victoryTime) return "victory";
  if (u.lastAttackTime && now - u.lastAttackTime < ATTACK_ART_MS) return "attack";
  if (u.lastMoveTime && now - u.lastMoveTime < moveAnimMs) return "move";
  return "idle";
}

/**
 * Opacity for a battle unit's tile.
 *
 * Defeated units are never removed from the battle arrays -- only summons are
 * pruned -- so their DOM node survives and the screens just hide it. A unit
 * with real defeat art stays visible long enough to play it; every other
 * creature vanishes on death exactly as before, which is what keeps this
 * invisible until art actually exists.
 */
export function battleUnitOpacity(u, now, def, ownedData, unlockedSkins) {
  if (u.hp > 0) return 1;
  if (!hasArtState(def, ownedData, unlockedSkins, "defeat")) return 0;
  return now - (u.deathTime || 0) < DEFEAT_ART_MS ? 1 : 0;
}
