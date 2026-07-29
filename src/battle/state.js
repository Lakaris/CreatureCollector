// Battle state construction.

import { CREATURE_MAP } from "../data/creatures.js";
import { computeCombatStats } from "../core/stats.js";
import { COOLDOWN_TICKS_AT_SPD_1 } from "./constants.js";

/**
 * Player HP is multiplied by this so fights last a reasonable number of ticks.
 * Purely a pacing knob -- it does not exist on the creature's displayed stats.
 */
const HP_SCALE = 4;

/** Attack cooldown in ticks, derived from speed. Faster creatures act sooner. */
function cooldownFor(spd) {
  return Math.max(3, Math.round(COOLDOWN_TICKS_AT_SPD_1 / spd));
}

/**
 * Build the unit lists for a battle.
 *
 * Player units now derive their stats from `computeCombatStats`, so level,
 * ascensions, equipment, and flair all affect combat. Previously this read raw
 * `def.stats` and applied a flat HP-only level multiplier, which meant gear and
 * ascensions did nothing in a fight while the detail screen claimed otherwise.
 *
 * Enemy units have no owned record, so they keep the original level-scaled
 * base-stat math.
 *
 * @param {Object} playerGrid  "row,col" -> creatureId
 * @param {Object} enemyGrid   "row,col" -> creature definition
 * @param {Object} owned       creatureId -> owned record
 * @param {number} bossLevel
 * @param {number} animMs
 * @param {Object} [equipmentLevels]     itemId -> level (global)
 * @param {Object} [equipmentAscensions] itemId -> ascension (global)
 */
export function makeArenaBattle(
  playerGrid,
  enemyGrid,
  owned,
  bossLevel,
  animMs,
  equipmentLevels,
  equipmentAscensions
) {
  const now = Date.now();

  const playerUnits = Object.entries(playerGrid).map(([key, cid], i) => {
    const [row, col] = key.split(",").map(Number);
    const cdef = CREATURE_MAP[cid];
    const oc = (owned || {})[cid];
    const stats = oc
      ? computeCombatStats(cdef, oc, equipmentLevels, equipmentAscensions)
      : cdef?.stats || {};
    const spd = stats.spd || 1;
    const hp = Math.round((stats.hp || 60) * HP_SCALE);
    return {
      uid: "p" + i,
      creatureId: cid,
      row,
      col,
      prevRow: row,
      prevCol: col,
      lastMoveTime: now - animMs,
      hp,
      maxHp: hp,
      atk: stats.atk || 30,
      def: stats.def || 20,
      spd,
      isRanged: cdef?.attackType === "Ranged",
      atkCd: Math.floor(Math.random() * cooldownFor(spd)),
      abilCd: 0, // reserved; decremented but not yet read by any ability
    };
  });

  const enemyUnits = Object.entries(enemyGrid).map(([key, edef], i) => {
    const [row, col] = key.split(",").map(Number);
    const spd = edef?.stats?.spd || 1;
    const hp = Math.round((edef?.stats?.hp || 60) * HP_SCALE * (1 + bossLevel * 0.15));
    return {
      uid: "e" + i,
      creatureId: edef.id,
      row,
      col,
      prevRow: row,
      prevCol: col,
      lastMoveTime: now - animMs,
      hp,
      maxHp: hp,
      atk: Math.round((edef?.stats?.atk || 30) * (1 + bossLevel * 0.1)),
      def: edef?.stats?.def || 20,
      spd,
      isRanged: edef?.attackType === "Ranged",
      atkCd: Math.floor(Math.random() * cooldownFor(spd)),
      abilCd: 0,
    };
  });

  return { playerUnits, enemyUnits, tick: 0 };
}
