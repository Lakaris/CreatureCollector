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

import { abilityRoll } from "../damage.js";
import { unitDist } from "../geometry.js";
import { RANGED_RANGE, STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { isIntangible, applyStatMod, applyDartShred } from "../status.js";
import { damageUnit } from "../hp.js";
import { isBoss, hasRule } from "../classifications.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
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
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /** Plume Dart's grind: shred DEF per landed hit.
     * A boss shrugs it off (ignoresOnHitEffects in battle/classifications.js). */
    onHit(unit, target) {
      if (target && !hasRule(target, "ignoresOnHitEffects")) {
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
      const { aliveE, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const debuffs = idx >= MAX_IDX;

      // Closest targetable foe decides the row -- minions first; a boss's top
      // row is the fallback when only a boss is in reach.
      let best = null, bestD = Infinity, bossBest = null, bossD = Infinity;
      for (const e of aliveE) {
        if (isIntangible(e)) continue;
        const d = unitDist(unit, e);
        if (d > RANGED_RANGE) continue;
        if (isBoss(e)) { if (d < bossD) { bossD = d; bossBest = e; } }
        else if (d < bestD) { bestD = d; best = e; }
      }
      const row = best ? best.row : bossBest ? bossBest.row : null;
      if (row == null) return;

      // "Until the next time Feathered Gale is used": the cast itself resets
      // the ramp, then every enemy this sweep hits banks a fresh stack.
      unit._starStacks = 0;

      for (const e of aliveE) {
        const size = e.size || 1;
        if (isIntangible(e) || row < e.row || row > e.row + size - 1) continue;
        const dmg = Math.max(1, Math.round(abilityRoll(unit, e) * mult));
        const dealt = damageUnit(e, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        // A boss shrugs off the riders a hit carries (see classifications.js).
        if (debuffs && !hasRule(e, "ignoresOnHitEffects")) applyStatMod(e, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
        unit._starStacks++;
        const mid = (size - 1) / 2;
        newFx.push({ id: now + "fg" + unit.uid + e.uid, row: e.row + mid, col: e.col + mid, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
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
export const coatlet = makeQuetzalisModule(CFG);
export const plumecoatl = makeQuetzalisModule(CFG);
export const quetzalis = makeQuetzalisModule(CFG);
