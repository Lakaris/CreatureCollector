// Crystalcrab line: Crystal Claw / Taunting Snap / Prism Shell.
//
// Crystal Claw keeps the engine's default melee attack flow (closest enemy);
// it only scales damage by ability level -- every upgrade is +damage.
//
// Taunting Snap strikes the closest foe in melee reach and Taunts it: the
// victim is forced to target this crab while the debuff lasts (tauntTicks +
// tauntSourceUid, enforced by the engine's selectTarget / boss-priority
// logic; refresh-on-reapply per the STATUS_TICKS policy). The boss can take
// the hit but ignores the Taunt -- boss AI has no target to override. The
// final upgrade cuts the special's energy cost 10% instead of adding damage
// (see getSpecialChargeAt in core/creatures.js).
//
// Prism Shell reflects a slice of every attack hit the crab takes back at
// the attacker, via the engine's onDamaged hook (attack damage only -- DoTs
// and direct boss-module hits are not reflected).

import { attackRoll, damageBoss } from "../damage.js";
import { aChebDist, distToBoss } from "../geometry.js";
import { MELEE_RANGE, STATUS_TICKS } from "../constants.js";
import { damageUnit } from "../hp.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
const BASIC_DMG_BY_LEVEL = [14, 16, 18, 20, 23];
const SPECIAL_DMG_BY_LEVEL = [26, 29, 33, 38, 38];
/** Prism Shell: % of each attack hit returned to the attacker, by unique level. */
const REFLECT_PCT_BY_LEVEL = [3, 6, 9, 12, 15];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeCrystalcrabModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, reflectPctByLevel } = cfg;
  return {
    /** Crystal Claw: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / basicDmgByLevel[0];
    },

    /** Prism Shell: reflect a % of every attack hit back at the attacker. */
    onDamaged(unit, attacker, dmg) {
      const pct = reflectPctByLevel[abilityIdx(unit, "unique")];
      if (!pct || dmg <= 0) return 0;
      return Math.max(1, Math.round((dmg * pct) / 100));
    },

    /**
     * Taunting Snap: hit the closest foe in melee reach and Taunt it onto the
     * crab. Uses the default in-range special gate (Tank role, melee range),
     * so the charge holds until something is actually beside the crab.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / basicDmgByLevel[0];

      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        if (d <= MELEE_RANGE && d < bestD) { bestD = d; best = e; }
      }
      const bd = boss && boss.hp > 0 ? distToBoss(boss, unit.row, unit.col) : Infinity;
      if (bd <= MELEE_RANGE && bd < bestD) {
        // Boss takes the hit; Taunt has no effect on bosses.
        const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * mult));
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + "ts" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        return;
      }
      if (!best) return;

      const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * mult));
      damageUnit(best, dmg);
      ctx.addDamageDealt(dmg);
      best.tauntTicks = STATUS_TICKS;
      best.tauntSourceUid = unit.uid;
      newFx.push({ id: now + "ts" + unit.uid, row: best.row, col: best.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  reflectPctByLevel: REFLECT_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const crystalcrab = makeCrystalcrabModule(CFG);
export const gemcrab = makeCrystalcrabModule(CFG);
export const gemtitan = makeCrystalcrabModule(CFG);
