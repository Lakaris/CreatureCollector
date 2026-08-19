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
// Burn numbers mirror Blazehornet's Burning Bond (same duration, stack cap,
// and source-ATK-scaled damage-over-time, ticked by the engine).

import { attackRoll, damageBoss } from "../damage.js";
import { bossOccupies, aCardinalDist } from "../geometry.js";
import { BOSS_SIZE, STATUS_TICKS } from "../constants.js";
import { damageUnit } from "../hp.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
const BASIC_DMG_BY_LEVEL = [30, 34, 38, 43, 43];
const SPECIAL_DMG_BY_LEVEL = [55, 62, 70, 80, 80];
/** Stoked Flames: +damage% per stack of Burn on the target, by unique level. */
const STOKED_PCT_BY_LEVEL = [1, 2, 3, 4, 5];

/** Burn numbers match Blazehornet's Burning Bond (see blazehornetLine.js). */
const BURN_DURATION_TICKS = STATUS_TICKS;
const BURN_STACK_CAP = 10;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

function applyBurn(unit, target) {
  target.burnTicks = BURN_DURATION_TICKS;
  target.burnStacks = Math.min((target.burnStacks || 0) + 1, BURN_STACK_CAP);
  target.burnSourceAtk = unit.atk;
}

/** Stoked Flames multiplier vs this target: stacks only count while its Burn is active. */
function stokedMult(unit, target) {
  if (!target || (target.burnTicks || 0) <= 0) return 1;
  const pct = STOKED_PCT_BY_LEVEL[abilityIdx(unit, "unique")];
  return 1 + ((target.burnStacks || 0) * pct) / 100;
}

/** Rows/cols the boss body spans, for alignment checks; null when no boss. */
function bossAlignment(unit, boss) {
  if (!boss || boss.hp <= 0) return null;
  const rowAligned = unit.row >= boss.row && unit.row < boss.row + BOSS_SIZE;
  const colAligned = unit.col >= boss.col && unit.col < boss.col + BOSS_SIZE;
  if (rowAligned) return { dr: 0, dc: unit.col < boss.col ? 1 : -1, dist: Math.abs(unit.col - boss.col) };
  if (colAligned) return { dr: unit.row < boss.row ? 1 : -1, dc: 0, dist: Math.abs(unit.row - boss.row) };
  return null;
}

export function makeIgnissaurModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel } = cfg;
  return {
    /** Magma Fang level scaling x Stoked Flames' per-Burn-stack amplifier. */
    dmgMultForAttack(unit, target) {
      const idx = abilityIdx(unit, "basic");
      return (basicDmgByLevel[idx] / basicDmgByLevel[0]) * stokedMult(unit, target);
    },

    /** Magma Fang lvl 5: every landed hit inflicts a stack of Burn. */
    onHit(unit, target) {
      if (abilityIdx(unit, "basic") >= MAX_IDX) applyBurn(unit, target);
      return 0;
    },

    /**
     * Inferno Breath needs something to aim along: a foe (or the boss) sharing
     * the unit's row or column. The full charge holds until that's true.
     */
    specialInRange(unit, { aliveE, boss }) {
      if (aliveE.some((e) => e.row === unit.row || e.col === unit.col)) return true;
      return !!bossAlignment(unit, boss);
    },

    /**
     * Inferno Breath: pick the nearest cardinally-aligned foe, then torch every
     * tile from the unit to the arena's edge in that direction -- damaging (and
     * at max level, Burning) every enemy on the way. The boss counts when the
     * ray crosses its 2x2 body.
     */
    special(unit, ctx) {
      const { aliveE, boss, gridRows, gridCols, newFx, now } = ctx;

      let dir = null, bestDist = Infinity;
      for (const e of aliveE) {
        if (e.row !== unit.row && e.col !== unit.col) continue;
        const d = aCardinalDist(unit.row, unit.col, e.row, e.col);
        if (d < bestDist) {
          bestDist = d;
          dir = e.row === unit.row ? { dr: 0, dc: e.col > unit.col ? 1 : -1 } : { dr: e.row > unit.row ? 1 : -1, dc: 0 };
        }
      }
      const bossDir = bossAlignment(unit, boss);
      if (bossDir && bossDir.dist < bestDist) dir = bossDir;
      if (!dir) return;

      const idx = abilityIdx(unit, "special");
      const ratio = specialDmgByLevel[idx] / basicDmgByLevel[0];
      const burns = idx >= MAX_IDX;
      let totalDmg = 0, hitBoss = false;

      let r = unit.row + dir.dr, c = unit.col + dir.dc;
      while (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
        newFx.push({ id: now + "breath" + unit.uid + r + "_" + c, row: r, col: c, t: now, isPillar: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });

        const minion = aliveE.find((e) => e.hp > 0 && e.row === r && e.col === c);
        if (minion) {
          const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * ratio * stokedMult(unit, minion)));
          damageUnit(minion, dmg);
          totalDmg += dmg;
          if (burns) applyBurn(unit, minion);
        }
        if (!hitBoss && boss && boss.hp > 0 && bossOccupies(boss, r, c)) {
          const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * ratio * stokedMult(unit, boss)));
          damageBoss(boss, dmg);
          totalDmg += dmg;
          if (burns) applyBurn(unit, boss);
          hitBoss = true;
        }
        r += dir.dr;
        c += dir.dc;
      }

      if (totalDmg > 0) ctx.addDamageDealt(totalDmg);
    },
  };
}

export const ignisdragon = makeIgnissaurModule({
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
});
// Pyresaur intentionally mirrors Ignissaur exactly for now -- same names, text,
// and numbers (see data/creatures.js); only base stats differ.
export const pyredragon = makeIgnissaurModule({
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
});
