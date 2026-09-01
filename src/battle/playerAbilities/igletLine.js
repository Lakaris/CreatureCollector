// Iglet line: Frost Nip / Hunker In / Windbreak.
//
// Frost Nip keeps the engine's default melee flow (closest enemy) with
// per-level damage scaling; at max level the turtle drinks half of every
// hit it lands back as Health.
//
// Hunker In is the igloo: stacks of Fortify, each halving one incoming
// ability hit and spent by it (the reduction and the spending both live in
// hp.js's damageUnit, the single damage chokepoint -- see FORTIFY_* there).
// Effect damage ignores Fortify entirely and never spends a stack, so burns
// and DoTs are the clean way through a hunkered turtle. At max level, the
// moment the last stack leaves, the shell pops open and dispels every debuff
// on the turtle.
//
// Windbreak: an aura sheltering everything in the Nearby ring (the turtle
// included, per the Nearby tag) for 2..10% less damage, DOUBLED while the
// turtle itself is Fortified -- so the team's mitigation swings up exactly
// when the turtle is braced. Unlike Fortify this reduces every source,
// effect damage included. At max level, attacking the igloo is answered
// with Frostbite on the attacker.

import { RANGED_RANGE, BASIC_DMG_BASELINE } from "../constants.js";
import { unitDist, distToBoss } from "../geometry.js";
import {
  applyFortify, hasFortify, applyWindbreak, applyFrostbite,
  dispelDebuffs, healReceivedMultiplier,
} from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Tank-priced (0.83-1.17x): flattened with the rest of the tank cohort when
// card numbers became real -- the old 10-22 climbed to Attacker territory.
const BASIC_DMG_BY_LEVEL = [10, 11, 12, 14, 14];
/** Frost Nip lvl 5: share of the damage dealt returned as Health. */
const LIFESTEAL_FRAC = 0.5;
/** Hunker In: Fortify stacks granted per cast, by special level. */
const FORTIFY_BY_LEVEL = [2, 3, 4, 5, 5];
/** Windbreak: % less damage for the Nearby ring, by unique level. */
const WINDBREAK_PCT_BY_LEVEL = [2, 4, 7, 10, 10];
/** Nearby: this creature and every tile surrounding it. */
const NEARBY_RANGE = 1;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** The dark boss's heal-block gates the lifesteal, like every other heal. */
function canBeHealed(u) {
  return (u.healImmuneTicks || 0) <= 0;
}

export function makeIgletModule(cfg) {
  const { basicDmgByLevel, fortifyByLevel, windbreakPctByLevel } = cfg;
  return {
    /** Frost Nip: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /**
     * Frost Nip lvl 5: heal half the damage actually dealt -- `dealt` is what
     * landed after the target's own Shield/Fortify/Windbreak, not the raw
     * roll, so shielded targets return less.
     */
    onHit(unit, target, dealt) {
      if (abilityIdx(unit, "basic") >= MAX_IDX && dealt > 0 && unit.hp > 0 && canBeHealed(unit)) {
        const heal = Math.round(dealt * LIFESTEAL_FRAC * healReceivedMultiplier(unit));
        if (heal > 0) unit.hp = Math.min(unit.maxHp, unit.hp + heal);
      }
      return 0;
    },

    /** Windbreak lvl 5: whoever swings at the igloo leaves with Frostbite. */
    onDamaged(unit, attacker) {
      if (attacker && abilityIdx(unit, "unique") >= MAX_IDX) applyFrostbite(attacker);
      return 0;
    },

    /**
     * Windbreak's aura, plus the max-level dispel watch.
     *
     * The dispel fires from here rather than at the moment the stack is spent
     * because stacks are consumed deep inside damageUnit, which has no module
     * access -- so it lands on the tick after the last stack goes, close
     * enough for a 500ms tick.
     */
    onTick(unit, ctx) {
      const pct = windbreakPctByLevel[abilityIdx(unit, "unique")] * (hasFortify(unit) ? 2 : 1);
      for (const a of ctx.aliveP) {
        if (a.hp > 0 && unitDist(unit, a) <= NEARBY_RANGE) applyWindbreak(a, pct, ctx.now);
      }

      const stacks = unit.fortifyStacks || 0;
      if (abilityIdx(unit, "special") >= MAX_IDX && (unit._fortifyWas || 0) > 0 && stacks === 0) {
        dispelDebuffs(unit);
        ctx.newFx.push({ id: ctx.now + "wb" + unit.uid, row: unit.row, col: unit.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      unit._fortifyWas = stacks;
    },

    /**
     * Hunker In holds its charge until something is close enough to actually
     * hit the turtle -- an enemy (or the boss) within ranged reach. Bracing
     * against an empty field would just burn the bar.
     */
    specialInRange(unit, { aliveE, boss }) {
      if (aliveE.some((e) => e.hp > 0 && unitDist(unit, e) <= RANGED_RANGE)) return true;
      return !!(boss && boss.hp > 0 && distToBoss(boss, unit.row, unit.col) <= RANGED_RANGE);
    },

    special(unit, ctx) {
      applyFortify(unit, fortifyByLevel[abilityIdx(unit, "special")]);
      // Refresh the aura immediately so the doubled value applies from the
      // cast itself rather than from the next tick.
      const pct = windbreakPctByLevel[abilityIdx(unit, "unique")] * 2;
      for (const a of ctx.aliveP) {
        if (a.hp > 0 && unitDist(unit, a) <= NEARBY_RANGE) applyWindbreak(a, pct, ctx.now);
      }
      unit._fortifyWas = unit.fortifyStacks || 0;
      ctx.newFx.push({ id: ctx.now + "hk" + unit.uid, row: unit.row, col: unit.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  fortifyByLevel: FORTIFY_BY_LEVEL,
  windbreakPctByLevel: WINDBREAK_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const frostpup = makeIgletModule(CFG);
export const snowmane = makeIgletModule(CFG);
export const blizzardback = makeIgletModule(CFG);
export const glaciertusk = makeIgletModule(CFG);
