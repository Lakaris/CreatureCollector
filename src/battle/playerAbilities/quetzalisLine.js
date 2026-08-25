// Quetzalis line: Plume Dart / Feathered Gale / Rising Star.
//
// Plume Dart keeps the engine's default ranged attack flow (closest enemy)
// with per-level damage scaling; every landed dart also grinds the victim's
// DEF down by 0.5% (1% at max level), up to the 50% cap -- a ramping shred
// with one refreshing timer (see applyDartShred in battle/status.js),
// distinct from the per-source Defense Down stat mod.
//
// Feathered Gale sweeps the HORIZONTAL ROW of the closest enemy in ranged
// reach: every foe whose body overlaps that grid row takes the hit (the
// boss included), and at max level each also gets a Defense Down stack.
//
// Rising Star: every enemy hit by Feathered Gale grants +1..5% Attack and
// Speed until the next cast. Antler Dart's snapshot pattern -- the bonus
// multiplies base values recorded at battle start, and each new Gale resets
// the count before its own hits bank a fresh ramp, so a full-row sweep
// rebuilds the buff instantly while a whiffed cast drops it.

import { attackRoll, playerDamageToBoss, damageBoss } from "../damage.js";
import { distToBoss } from "../geometry.js";
import { RANGED_RANGE, BOSS_SIZE, STATUS_TICKS } from "../constants.js";
import { isIntangible, applyStatMod, applyDartShred } from "../status.js";
import { damageUnit } from "../hp.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
const BASIC_DMG_BY_LEVEL = [16, 21, 27, 34, 34];
const SPECIAL_DMG_BY_LEVEL = [55, 68, 84, 102, 102];
/** Plume Dart: DEF ground off per hit (doubled at max basic level). */
const DART_SHRED_PCT = 0.5;
/** Feathered Gale lvl 5: Defense Down (standard first-stack value). */
const DEF_DOWN_PCT = 15;
/** Rising Star: +% Attack and Speed per enemy hit by the Gale, by unique level. */
const STAR_PCT_BY_LEVEL = [1, 2, 3, 4, 5];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeQuetzalisModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, starPctByLevel } = cfg;

  /** Recompute ATK/SPD from the battle-start snapshot and the current stacks. */
  function applyStar(unit) {
    if (unit._starBaseAtk == null) return;
    const mult = 1 + ((unit._starStacks || 0) * starPctByLevel[abilityIdx(unit, "unique")]) / 100;
    unit.atk = Math.round(unit._starBaseAtk * mult);
    unit.spd = unit._starBaseSpd * mult;
  }

  return {
    onBattleStart(unit) {
      // Rising Star multiplies these snapshots rather than compounding on
      // live values, so resetting on each Gale cast is exact.
      unit._starBaseAtk = unit.atk;
      unit._starBaseSpd = unit.spd;
      unit._starStacks = 0;
    },

    /** Plume Dart: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / basicDmgByLevel[0];
    },

    /** Plume Dart's grind: shred DEF per landed hit (bosses have none -- skip). */
    onHit(unit, target) {
      if (target && target.uid != null) {
        applyDartShred(target, abilityIdx(unit, "basic") >= MAX_IDX ? DART_SHRED_PCT * 2 : DART_SHRED_PCT);
      }
      return 0;
    },

    /**
     * Feathered Gale: sweep the closest-in-range enemy's whole grid row.
     * Uses the default in-range gate (an enemy or the boss within ranged
     * reach opens it). Resets and re-banks the Rising Star ramp.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / basicDmgByLevel[0];
      const debuffs = idx >= MAX_IDX;

      // Closest targetable foe decides the row; the boss's top row is the
      // fallback when only the boss is in reach.
      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        if (isIntangible(e)) continue;
        const d = Math.max(Math.abs(e.row - unit.row), Math.abs(e.col - unit.col));
        if (d <= RANGED_RANGE && d < bestD) { bestD = d; best = e; }
      }
      const bossD = boss && boss.hp > 0 ? distToBoss(boss, unit.row, unit.col) : Infinity;
      const row = best ? best.row : bossD <= RANGED_RANGE ? boss.row : null;
      if (row == null) return;

      // "Until the next time Feathered Gale is used": the cast itself resets
      // the ramp, then every enemy this sweep hits banks a fresh stack.
      unit._starStacks = 0;

      for (const e of aliveE) {
        const size = e.size || 1;
        if (isIntangible(e) || row < e.row || row > e.row + size - 1) continue;
        const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * mult));
        const dealt = damageUnit(e, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        if (debuffs) applyStatMod(e, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
        unit._starStacks++;
        newFx.push({ id: now + "fg" + unit.uid + e.uid, row: e.row, col: e.col, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      if (boss && boss.hp > 0 && row >= boss.row && row <= boss.row + BOSS_SIZE - 1) {
        const dmg = Math.max(1, Math.round(playerDamageToBoss(unit, boss, ctx.aliveP) * mult));
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        unit._starStacks++;
        newFx.push({ id: now + "fgb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      applyStar(unit);
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  starPctByLevel: STAR_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const galeserpent = makeQuetzalisModule(CFG);
export const vortexserpent = makeQuetzalisModule(CFG);
export const cyclonwyrm = makeQuetzalisModule(CFG);
