// Frillet line: Guard Horn / Aegis Frill / Bulwark Body.
//
// Guard Horn keeps the engine's default melee attack flow (closest enemy)
// with per-level damage scaling; at max level every landed hit also inflicts
// a Defense Down stack.
//
// Aegis Frill is the line's identity: a Shield for itself worth a share of
// its Defense, and 2 stacks of Protect (3 at max) on every Beside ally --
// the allies standing in the tiles next to it. A protected ally does not take
// the hits aimed at it; they are redirected onto this creature, which meets
// them with its own Shield and Defense, spending one stack per redirect (see
// Protect in battle/hp.js). Shields do not stack, so a recast keeps whichever
// Shield is larger -- see applyShield.
//
// Bulwark Body pays that off: everything this creature is hit by may be
// answered with a counter -- its Basic ability turned back on the attacker at
// 80% less damage, on a chance that climbs from 50% to a certain 100%. It
// runs through the engine's reflect hook, so like every reflect it lands as
// effect damage and is never itself countered -- two Frillets facing each
// other trade one counter apiece rather than looping forever.
//
// The two halves compose: Protect drags an ally's incoming attacks onto the
// creature whose passive punishes being attacked.

import { aChebDist } from "../geometry.js";
import { basicUnitDamage } from "../damage.js";
import { MELEE_RANGE, STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { applyShield, applyProtect } from "../hp.js";
import { applyStatMod } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Tank-priced (1.0-1.42x, Morusk's exact curve): flattened with the tank
// cohort when card numbers became real. The counter inherits this too.
const BASIC_DMG_BY_LEVEL = [12, 13, 15, 17, 17];
/** Aegis Frill: Shield as a % of this creature's Defense, by special level. */
const SHIELD_PCT_BY_LEVEL = [25, 30, 35, 40, 40];
/** Aegis Frill: Protect stacks handed to each Beside ally, by special level. */
const PROTECT_STACKS_BY_LEVEL = [2, 2, 2, 2, 3];
/** Bulwark Body: chance to counter an attack, by unique level. */
const COUNTER_CHANCE_BY_LEVEL = [50, 60, 70, 80, 100];
/** A counter lands at 80% less than a normal Basic -- a fifth of the damage. */
const COUNTER_DMG_MULT = 0.2;
/** Guard Horn lvl 5: Defense Down (standard first-stack value). */
const DEF_DOWN_PCT = 15;
/** "Beside" = the allies standing in the tiles next to this creature. */
const BESIDE_RANGE = 1;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeFrilletModule(cfg) {
  const { basicDmgByLevel, shieldPctByLevel, protectStacksByLevel, counterChanceByLevel } = cfg;
  return {
    /** Guard Horn: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /** Guard Horn lvl 5: every landed hit shaves the victim's Defense. */
    onHit(unit, target) {
      if (target && target.uid != null && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyStatMod(target, { kind: "def", pct: -DEF_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      return 0;
    },

    /**
     * Bulwark Body: answer an attack with this creature's Basic, at 80% less
     * damage. Returned through the reflect hook, which the engine applies to
     * the attacker as effect damage.
     */
    onDamaged(unit, attacker, dmg) {
      if (dmg <= 0 || !attacker || unit.hp <= 0) return 0;
      if (Math.random() * 100 >= counterChanceByLevel[abilityIdx(unit, "unique")]) return 0;
      const idx = abilityIdx(unit, "basic");
      const scaled = basicUnitDamage(unit, attacker) * (basicDmgByLevel[idx] / BASIC_DMG_BASELINE);
      return Math.max(1, Math.round(scaled * COUNTER_DMG_MULT));
    },

    /**
     * Aegis Frill: Shield up and put every Beside ally behind this creature.
     * Uses the default in-range special gate (Tank, melee), so the frill goes
     * up as the line meets -- which is when allies have hits to redirect.
     */
    special(unit, ctx) {
      const { aliveP, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");

      applyShield(unit, (unit.def * shieldPctByLevel[idx]) / 100, STATUS_TICKS);
      newFx.push({ id: now + "af" + unit.uid, row: unit.row, col: unit.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });

      const stacks = protectStacksByLevel[idx];
      for (const a of aliveP) {
        if (a.uid === unit.uid || a.hp <= 0) continue;
        if (aChebDist(unit.row, unit.col, a.row, a.col) > BESIDE_RANGE) continue;
        applyProtect(a, unit, stacks);
        newFx.push({ id: now + "afp" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  shieldPctByLevel: SHIELD_PCT_BY_LEVEL,
  protectStacksByLevel: PROTECT_STACKS_BY_LEVEL,
  counterChanceByLevel: COUNTER_CHANCE_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const mosskrab = makeFrilletModule(CFG);
export const jadekrab = makeFrilletModule(CFG);
export const crystalshell = makeFrilletModule(CFG);
export const rampartops = makeFrilletModule(CFG);
