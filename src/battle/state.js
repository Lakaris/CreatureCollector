// Battle state construction.

import { CREATURE_MAP } from "../data/creatures.js";
import { computeCombatStats } from "../core/stats.js";
import { calcStats, getSpecialCharge, getSpecialChargeAt } from "../core/creatures.js";
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
 * Enemy creatures have no owned record to feed abilities with melons, so their
 * ability level is derived from `enemyLevel` where a screen provides one
 * (Arena's 1..500 curve maps evenly onto the 5 tiers -- a level-500 enemy
 * fights with a maxed kit, matching how its stats already mirror a maxed
 * player creature). Screens without an enemy level keep base-tier abilities.
 */
function enemyAbilityLevel(enemyLevel) {
  return enemyLevel ? Math.min(5, Math.floor(enemyLevel / 100)) : 0;
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
    const spd = (lvlStats || edef?.stats)?.spd || 1;
    const hp = Math.round(
      ((lvlStats?.hp ?? edef?.stats?.hp ?? 60) * HP_SCALE) * (lvlStats ? 1 : 1 + hpMult)
    );
    const atk = Math.round(
      (lvlStats?.atk ?? edef?.stats?.atk ?? 30) * (lvlStats ? 1 : 1 + atkMult)
    );
    const def = Math.round(
      (lvlStats?.def ?? edef?.stats?.def ?? 20) * (lvlStats ? 1 : 1 + defMult)
    );
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
      atk,
      def,
      spd,
      isRanged: edef?.attackType === "Ranged",
      atkCd: Math.floor(Math.random() * cooldownFor(spd)),
      abilitySpeed: (lvlStats || edef?.stats)?.abilitySpeed || 1,
      abilCharge: 0,
      abilChargeMax: getSpecialChargeAt(edef, enemyAbilityLevel(enemyLevel)),
      abilityLevels: (() => { const lvl = enemyAbilityLevel(enemyLevel); return { basic: lvl, special: lvl, unique: lvl }; })(),
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
