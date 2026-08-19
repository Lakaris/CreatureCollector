// Battle state construction.

import { CREATURE_MAP } from "../data/creatures.js";
import { computeCombatStats } from "../core/stats.js";
import { calcStats, getSpecialCharge, getSpecialChargeAt, MAX_ABILITY_LEVEL } from "../core/creatures.js";
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
 * Enemy creatures have no owned record to feed abilities with melons, so every
 * enemy everywhere (Arena, Dungeon, Labyrinth) fights with a fully upgraded
 * kit: the last entry of each ability's `upgrades` table, and the matching
 * special charge cost. Difficulty is expressed through stats -- enemy level,
 * bossLevel scaling, and the Labyrinth's difficultyOverride -- not through
 * holding abilities back.
 */
const ENEMY_ABILITY_LEVEL = MAX_ABILITY_LEVEL;

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
 * @param {number} [enemyLevel] Arena-only: when set, enemies use the same
 *   level/rarity stat curve as owned creatures (calcStats) instead of the
 *   bossLevel-scaled base stats, so a level-500 enemy roughly matches a
 *   maxed-out player creature of the same rarity.
 */
export function makeArenaBattle(
  playerGrid,
  enemyGrid,
  owned,
  bossLevel,
  animMs,
  equipmentLevels,
  equipmentAscensions,
  difficultyOverride,
  enemyLevel
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
      // Special-ability charge: +abilitySpeed (Haste) per tick, fires at
      // abilChargeMax (level-aware: e.g. Taunting Snap's final upgrade
      // reduces the cost 10%).
      abilitySpeed: stats.abilitySpeed || 1,
      abilCharge: 0,
      abilChargeMax: getSpecialChargeAt(cdef, oc?.abilityLevels?.special || 0),
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
    const lvlStats = enemyLevel
      ? calcStats(edef, { level: enemyLevel, ascensions: 0 })
      : null;
    // Labyrinth Boss creatures (every 10th floor): 2x2 body, +25% to every
    // stat -- HP/ATK/DEF plus Speed and Haste -- on top of the floor's
    // normal difficulty scaling.
    const gm = edef?.__giant ? 1.25 : 1;
    const spd = ((lvlStats || edef?.stats)?.spd || 1) * gm;
    const hp = Math.round(
      ((lvlStats?.hp ?? edef?.stats?.hp ?? 60) * HP_SCALE) * (lvlStats ? 1 : 1 + hpMult) * gm
    );
    const atk = Math.round(
      (lvlStats?.atk ?? edef?.stats?.atk ?? 30) * (lvlStats ? 1 : 1 + atkMult) * gm
    );
    const def = Math.round(
      (lvlStats?.def ?? edef?.stats?.def ?? 20) * (lvlStats ? 1 : 1 + defMult) * gm
    );
    return {
      uid: "e" + i,
      creatureId: edef.id,
      size: edef?.__giant ? 2 : 1,
      row,
      col,
      prevRow: row,
      prevCol: col,
      lastMoveTime: now - animMs,
      hp,
      maxHp: hp,
      atk,
      def,
      spd,
      isRanged: edef?.attackType === "Ranged",
      atkCd: Math.floor(Math.random() * cooldownFor(spd)),
      abilitySpeed: (((lvlStats || edef?.stats)?.abilitySpeed || 1) * gm),
      abilCharge: 0,
      abilChargeMax: getSpecialChargeAt(edef, ENEMY_ABILITY_LEVEL),
      abilityLevels: { basic: ENEMY_ABILITY_LEVEL, special: ENEMY_ABILITY_LEVEL, unique: ENEMY_ABILITY_LEVEL },
    };
  });

  // Enemy creatures run the same ability modules as player ones; their
  // battle-start passives see the enemy roster as "allUnits".
  for (const u of enemyUnits) {
    const mod = getPlayerAbilityModule(u.creatureId);
    if (mod?.onBattleStart) mod.onBattleStart(u, enemyUnits);
  }

  return { playerUnits, enemyUnits, tick: 0 };
}
