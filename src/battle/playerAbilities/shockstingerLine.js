// Shockstinger line: Volt Sting / Overload Sting / Static Grip.
//
// Volt Sting keeps the engine's default melee attack flow (closest enemy)
// with per-level damage scaling; every landed hit also applies 1 stack of
// Restrained to the victim (2 at max level). Restrained never expires and
// can't be Cleansed: the stacks stay on the carrier until Overload Sting
// consumes them. See battle/status.js.
//
// Overload Sting is chargeless -- no energy bar (no `charge` in data); the
// engine fires it the moment its gate passes: a Restrained enemy carrying
// 20+ stacks within melee reach. It hits the closest qualifying enemy, Stuns
// it (can't attack, gains no special charge -- see isStunned), and consumes
// every Restrained stack on it. At max level the cast also grants this
// creature Speed Up. Bosses can't be Restrained, so the gate never opens on
// a boss -- same CC-immunity policy as Taunt.
//
// Static Grip doesn't act on its own: it sets how hard this creature's
// Restrained slows its carrier (restrainedSlowPct, read by attackCooldown
// via restrainedSlowMultiplier while any stacks are active).

import { aChebDist } from "../geometry.js";
import { attackRoll } from "../damage.js";
import { MELEE_RANGE, STATUS_TICKS } from "../constants.js";
import { damageUnit } from "../hp.js";
import { applyStatMod } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
const BASIC_DMG_BY_LEVEL = [14, 18, 23, 30, 30];
const SPECIAL_DMG_BY_LEVEL = [45, 52, 60, 70, 70];
/** Restrained stacks needed before Overload Sting can fire. */
const STACK_GATE = 20;
/** Static Grip: Speed lost by Restrained carriers, by unique level. */
const SLOW_PCT_BY_LEVEL = [2, 4, 6, 8, 10];
/** Overload Sting max level: Speed Up granted to self (Breezekit's value). */
const SPEED_UP_PCT = 25;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeShockstingerModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, slowPctByLevel } = cfg;

  /** Stack Restrained onto a unit (never a boss -- no uid, CC-immune). */
  function applyRestrained(unit, target, stacks) {
    if (!target || target.uid == null) return;
    target.restrainedStacks = (target.restrainedStacks || 0) + stacks;
    // Static Grip: the slow follows the strongest applier still stacking.
    const pct = slowPctByLevel[abilityIdx(unit, "unique")];
    target.restrainedSlowPct = Math.max(target.restrainedSlowPct || 0, pct);
  }

  return {
    /** Volt Sting: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / basicDmgByLevel[0];
    },

    /** Volt Sting on-hit: +1 Restrained stack, +2 at max basic level. */
    onHit(unit, target) {
      applyRestrained(unit, target, abilityIdx(unit, "basic") >= MAX_IDX ? 2 : 1);
      return 0;
    },

    /** Overload Sting's gate: a 20+-stack Restrained enemy in melee reach. */
    specialInRange(unit, { aliveE }) {
      return aliveE.some(
        (e) => (e.restrainedStacks || 0) >= STACK_GATE && aChebDist(unit.row, unit.col, e.row, e.col) <= MELEE_RANGE
      );
    },

    /** Overload Sting: strike the closest qualifying enemy, Stun it, spend the stacks. */
    special(unit, ctx) {
      const { aliveE, newFx, now } = ctx;
      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        if ((e.restrainedStacks || 0) < STACK_GATE) continue;
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        if (d <= MELEE_RANGE && d < bestD) { bestD = d; best = e; }
      }
      if (!best) return;

      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / basicDmgByLevel[0];
      const dmg = Math.max(1, Math.round(attackRoll(unit.atk) * mult));
      damageUnit(best, dmg);
      ctx.addDamageDealt(dmg);

      best.stunTicks = STATUS_TICKS;
      best.restrainedStacks = 0;
      best.restrainedSlowPct = 0;

      if (idx >= MAX_IDX) {
        applyStatMod(unit, { kind: "spd", pct: SPEED_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      newFx.push({ id: now + "os" + unit.uid, row: best.row, col: best.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  slowPctByLevel: SLOW_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const shockcrab = makeShockstingerModule(CFG);
export const voltcrusher = makeShockstingerModule(CFG);
export const galvaniccrab = makeShockstingerModule(CFG);
