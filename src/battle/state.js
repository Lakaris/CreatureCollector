// Battle state construction.

import { CREATURE_MAP } from "../data/creatures.js";
import { computeCombatStats } from "../core/stats.js";
import { COOLDOWN_TICKS_AT_SPD_1 } from "./constants.js";
import { getPlayerAbilityModule } from "./playerAbilities/registry.js";

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
 * base-stat math. Arena/Dungeon/DailyBoss pass a small `bossLevel` and use
 * that formula as-is; Labyrinth's floors span a much wider difficulty range
 * (5000 floors) so it passes `difficultyOverride` (from
 * getDifficultyMultipliers in core/labyrinth.js) to replace it entirely.
 *
 * @param {Object} playerGrid  "row,col" -> creatureId
 * @param {Object} enemyGrid   "row,col" -> creature definition
 * @param {Object} owned       creatureId -> owned record
 * @param {number} bossLevel
 * @param {number} animMs
 * @param {Object} [equipmentLevels]     itemId -> level (global)
 * @param {Object} [equipmentAscensions] itemId -> ascension (global)
 * @param {{hpMult:number,atkMult:number,defMult:number}} [difficultyOverride]
 */
export function makeArenaBattle(
  playerGrid,
  enemyGrid,
  owned,
  bossLevel,
  animMs,
  equipmentLevels,
  equipmentAscensions,
  difficultyOverride
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
      abilityLevels: oc?.abilityLevels ? { ...oc.abilityLevels } : { basic: 0, special: 0, unique: 0 },
    };
  });

  // Battle-start passives (e.g. Blazehornet's Starlit DEF synergy) run once,
  // after every unit exists, so ally-presence checks see the full roster.
  for (const u of playerUnits) {
    const mod = getPlayerAbilityModule(u.creatureId);
    if (mod?.onBattleStart) mod.onBattleStart(u, playerUnits);
  }

  const { hpMult, atkMult, defMult } = difficultyOverride || {
    hpMult: bossLevel * 0.15,
    atkMult: bossLevel * 0.1,
    defMult: 0,
  };
  const enemyUnits = Object.entries(enemyGrid).map(([key, edef], i) => {
    const [row, col] = key.split(",").map(Number);
    const spd = edef?.stats?.spd || 1;
    const hp = Math.round((edef?.stats?.hp || 60) * HP_SCALE * (1 + hpMult));
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
      atk: Math.round((edef?.stats?.atk || 30) * (1 + atkMult)),
      def: Math.round((edef?.stats?.def || 20) * (1 + defMult)),
      spd,
      isRanged: edef?.attackType === "Ranged",
      atkCd: Math.floor(Math.random() * cooldownFor(spd)),
      abilCd: 0,
    };
  });

  return { playerUnits, enemyUnits, tick: 0 };
}
