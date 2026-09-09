// Planning-phase attack-range preview.
//
// The engine's real reach lives on a live battle unit (attackRangeOf in
// geometry.js), but a planning grid holds only creature ids and owned records
// -- no units exist until the fight starts. Two ability lines already change
// reach, and both do it from a hook rather than a static number: Siegefin's
// Deepsight sets `rangeBonus` in onTick (scaling with the unique's level), and
// Starlit Wings sets `unit.range` in onBattleStart. Copying those tables here
// would give the preview its own set of numbers to drift away from the ones
// the fight actually uses, and the next line that gains range would be shown
// wrong until someone remembered this file.
//
// So instead of a table, the preview builds a throwaway stand-in unit and runs
// the creature's OWN module hooks over it, then reads back whatever reach they
// left behind. A creature with no module, or one whose hooks touch nothing
// range-related, falls through to the plain melee/ranged baseline.

import { CREATURE_MAP } from "../data/creatures.js";
import { MELEE_RANGE, RANGED_RANGE } from "./constants.js";
import { attackRangeOf } from "./geometry.js";
import { getPlayerAbilityModule } from "./playerAbilities/registry.js";

/**
 * A minimal unit shaped like the ones makeArenaBattle produces -- enough for a
 * hook to read its ability levels, its melee/ranged flag, and its position, and
 * to write stats onto it without throwing. Everything written here is
 * discarded except the range fields.
 */
function stubUnit(creatureId, abilityLevels) {
  const def = CREATURE_MAP[creatureId];
  return {
    uid: "__rangePreview",
    creatureId,
    row: 0, col: 0, prevRow: 0, prevCol: 0,
    lastMoveTime: 0, lastAttackTime: 0, deathTime: 0,
    hp: 1, maxHp: 1, atk: 1, def: 1, spd: 1, crit: 0, critDmg: 0,
    isRanged: def?.attackType === "Ranged",
    atkCd: 0,
    abilitySpeed: 1, abilCharge: 0, abilChargeMax: 1,
    abilityLevels: { basic: 0, special: 0, unique: 0, ...(abilityLevels || {}) },
  };
}

/**
 * The context an onTick hook expects. Empty unit lists and no boss mean a hook
 * that scans for targets finds none and does nothing; newFx is a real array so
 * a hook that pushes effects has somewhere harmless to push them.
 */
function stubCtx() {
  return {
    aliveE: [], aliveP: [], boss: null,
    newFx: [], now: 0,
    isEnemySide: false,
    gridRows: 1, gridCols: 1,
    stepToward() {},
  };
}

/**
 * A creature's attack reach in tiles, as it would be at the start of a fight,
 * including passive range bonuses at the ability levels this player has fed.
 *
 * This is a plain Chebyshev radius for every creature. A module whose BASIC
 * attack is shaped (Starlit's beam only fires along its own row and column)
 * still threatens the full square with its special -- Radiant Exchange picks
 * its blast center on plain Chebyshev distance at the same range -- so the
 * square is the honest answer to "what can this reach from here", and a
 * narrower preview would undersell the placement.
 *
 * @param {string} creatureId
 * @param {object} [ownedRecord] The player's record; only `abilityLevels` is
 *   read. Omit for an unowned/level-0 kit.
 * @returns {number} Reach in tiles.
 */
export function previewRangeOf(creatureId, ownedRecord) {
  const def = CREATURE_MAP[creatureId];
  const baseline = def?.attackType === "Ranged" ? RANGED_RANGE : MELEE_RANGE;
  const mod = getPlayerAbilityModule(creatureId);
  const u = stubUnit(creatureId, ownedRecord && ownedRecord.abilityLevels);
  // Hooks are written against a real battle, so a stub can make one throw.
  // The preview is cosmetic: a hook that can't run just contributes no bonus.
  try { if (mod && mod.onBattleStart) mod.onBattleStart(u, [u]); } catch (e) { /* preview only */ }
  try { if (mod && mod.onTick) mod.onTick(u, stubCtx()); } catch (e) { /* preview only */ }
  const range = u.range || attackRangeOf(u) || baseline;
  return Math.max(1, Math.round(range));
}

/**
 * Every in-bounds cell a creature standing at (row, col) could attack,
 * excluding its own tile, as a Set of "r,c" keys.
 */
export function rangePreviewCells(row, col, range, gridRows, gridCols) {
  const out = new Set();
  for (let r = Math.max(0, row - range); r <= Math.min(gridRows - 1, row + range); r++) {
    for (let c = Math.max(0, col - range); c <= Math.min(gridCols - 1, col + range); c++) {
      if (r === row && c === col) continue;
      out.add(r + "," + c);
    }
  }
  return out;
}
