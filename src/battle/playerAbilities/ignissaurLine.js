// Ignissaur line: Magma Fang / Inferno Breath / Stoked Flames family.
//
// Magma Fang keeps the engine's default melee attack flow (closest enemy) --
// it only scales damage by ability level, and at max level every landed hit
// inflicts a stack of Burn.
//
// Inferno Breath fires along a straight line in the direction of the attack:
// it picks the nearest cardinally-aligned foe and damages every enemy on that
// row/column all the way to the arena's edge (the "Line" tag). At max level
// everything hit also gains a stack of Burn.
//
// Stoked Flames is a passive damage amplifier: both attacks deal +1%..+5%
// damage per stack of Burn currently active on the target being hit.
//
// Burn is the shared one (applyBurn in status.js): same duration, stack cap,
// and source-ATK-scaled damage-over-time as Emberstar's Burning Bond.

import { attackRoll } from "../damage.js";
import { occupies, cardinalStepToward } from "../geometry.js";
import { BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { applyBurn } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [30, 34, 38, 43, 43];
const SPECIAL_DMG_BY_LEVEL = [55, 62, 70, 80, 80];
/** Stoked Flames: +damage% per stack of Burn on the target, by unique level. */
const STOKED_PCT_BY_LEVEL = [1, 2, 3, 4, 5];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}


/** Stoked Flames multiplier vs this target: stacks only count while its Burn is active. */
function stokedMult(unit, target) {
  if (!target || (target.burnTicks || 0) <= 0) return 1;
  const pct = STOKED_PCT_BY_LEVEL[abilityIdx(unit, "unique")];
  return 1 + ((target.burnStacks || 0) * pct) / 100;
}

export function makeIgnissaurModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel } = cfg;
  return {
    /** Magma Fang level scaling x Stoked Flames' per-Burn-stack amplifier. */
    dmgMultForAttack(unit, target) {
      const idx = abilityIdx(unit, "basic");
      return (basicDmgByLevel[idx] / BASIC_DMG_BASELINE) * stokedMult(unit, target);
    },

    /** Magma Fang lvl 5: every landed hit inflicts a stack of Burn. */
    onHit(unit, target) {
      if (abilityIdx(unit, "basic") >= MAX_IDX) applyBurn(target, unit.atk);
      return 0;
    },

    /**
     * Inferno Breath needs something to aim along: a foe whose body shares
     * the unit's row or column. The full charge holds until that's true.
     */
    specialInRange(unit, { aliveE }) {
      return aliveE.some((e) => cardinalStepToward(unit, e));
    },

    /**
     * Inferno Breath: pick the nearest cardinally-aligned foe, then torch every
     * tile from the unit to the arena's edge in that direction -- damaging (and
     * at max level, Burning) every enemy on the way -- a 2x2 boss included,
     * once, however many of its tiles the ray crosses.
     */
    special(unit, ctx) {
      const { aliveE, gridRows, gridCols, newFx, now } = ctx;

      let dir = null, bestDist = Infinity;
      for (const e of aliveE) {
        const step = cardinalStepToward(unit, e);
        if (step && step.dist < bestDist) {
          bestDist = step.dist;
          dir = step;
        }
      }
      if (!dir) return;

      const idx = abilityIdx(unit, "special");
      const ratio = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const burns = idx >= MAX_IDX;
      let totalDmg = 0;
      // Once per creature however many of its tiles the ray crosses -- a 2x2
      // body spans two tiles of any row or column.
      const struck = new Set();

      let r = unit.row + dir.dr, c = unit.col + dir.dc;
      while (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
        newFx.push({ id: now + "breath" + unit.uid + r + "_" + c, row: r, col: c, t: now, isPillar: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });

        const foe = aliveE.find((e) => e.hp > 0 && !struck.has(e) && occupies(e, r, c));
        if (foe) {
          struck.add(foe);
          const dmg = Math.max(1, Math.round(attackRoll(unit) * ratio * stokedMult(unit, foe)));
          damageUnit(foe, dmg);
          totalDmg += dmg;
          if (burns) applyBurn(foe, unit.atk);
        }
        r += dir.dr;
        c += dir.dc;
      }

      if (totalDmg > 0) ctx.addDamageDealt(totalDmg);
    },
  };
}

export const ignissaur = makeIgnissaurModule({
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
});
// Pyresaur intentionally mirrors Ignissaur exactly for now -- same names, text,
// and numbers (see data/creatures.js); only base stats differ.
export const pyresaur = makeIgnissaurModule({
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
});
