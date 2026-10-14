// Pricklet (poisonous crested porcupine) line: Barbed Jab / Bristle Up /
// Venom Barbs. Ids keep the old Sporolith line's sporolith / stonewarden /
// jadolith.
//
// Barbed Jab keeps the engine's default melee attack flow (closest enemy);
// every upgrade is +damage, and the max tier Poisons each enemy it hits (not a
// boss -- it shrugs off on-hit effects, see ignoresOnHitEffects).
//
// Bristle Up is a self-buff, so it fires off cooldown (no in-range gate): the
// porcupine gains Defense Up and, for as long as THAT Defense Up lasts, every
// enemy ability hit it takes is answered with damage equal to a share of its
// Defense -- a Reflect-type retaliation (Quartz Chip scales it), dealt as
// effect damage. Tying the window to the Defense Up stack means duration gear
// stretches both alike and a buff dispel ends both. The max tier also Poisons
// the attacker; that Poison is the Special's own stack.
//
// Venom Barbs: every Poison this creature lands -- from either ability or its
// gear -- also cuts that enemy's Attack by the tier's exact percentage (its own
// stack source, not a stack of the Attack Down table; see `exact` in
// applyStatMod). At max, an ability hit from an enemy carrying max stacks of
// Poison makes it dispel every debuff on itself.

import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit, onHitLanded, retaliationMultiplier } from "../hp.js";
import { defenseOf } from "../damage.js";
import { withNestedAbility, sameSide } from "../applier.js";
import { applyPoison, applyStatMod, dispelDebuffs, onPoisonInflicted, overTimeStacks, DOT_STACK_CAP } from "../status.js";
import { hasRule } from "../classifications.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js).
 * Tank-priced, the same opener as Crystalcrab's. */
const BASIC_DMG_BY_LEVEL = [14, 15, 17, 20, 20];
/** Bristle Up: % of this creature's Defense dealt back per hit taken. */
const BRISTLE_DEF_PCT_BY_LEVEL = [15, 18, 21, 25, 25];
/** Bristle Up's Defense Up -- one stack, the standard 15% (ABILITY_TAG_DEFS). */
const DEF_UP_PCT = 15;
/** Venom Barbs: Attack cut on every enemy this creature Poisons. */
const ATK_CUT_PCT_BY_LEVEL = [5, 10, 15, 20, 20];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

const LINE_IDS = new Set(["sporolith", "stonewarden", "jadolith"]);
const isPricklet = (u) => !!u && LINE_IDS.has(u.creatureId);

/** Bristle Up is up while its own Defense Up stack is (src narrowed to the
 * Special -- see applyStatMod). */
function isBristling(u) {
  const src = u.uid + ":special";
  return !!u.statMods && u.statMods.some((m) => m.kind === "def" && m.pct > 0 && m.src === src);
}

// Bristle Up's retaliation and Venom Barbs' max-tier dispel: both answer an
// enemy's ability hit (never effect damage -- DoT ticks, reflects, hazards).
onHitLanded((attacker, target, info) => {
  if (!isPricklet(target) || info.effectDamage || target.hp <= 0 || !(attacker.hp > 0)) return;
  if (sameSide(attacker, target)) return;
  if (abilityIdx(target, "unique") >= MAX_IDX && overTimeStacks(attacker, "poison") >= DOT_STACK_CAP) {
    withNestedAbility(target, "unique", () => dispelDebuffs(target));
  }
  if (!isBristling(target)) return;
  const idx = abilityIdx(target, "special");
  const dmg = Math.max(1, Math.round(((defenseOf(target) * BRISTLE_DEF_PCT_BY_LEVEL[idx]) / 100) * retaliationMultiplier(target, "reflect")));
  withNestedAbility(target, "special", () => {
    damageUnit(attacker, dmg, { effectDamage: true });
    if (idx >= MAX_IDX && attacker.hp > 0) applyPoison(attacker);
  });
});

// Venom Barbs: every Poison this creature lands also cuts the victim's Attack.
onPoisonInflicted((applier, target) => {
  if (!isPricklet(applier) || target.hp <= 0) return;
  const pct = ATK_CUT_PCT_BY_LEVEL[abilityIdx(applier, "unique")];
  withNestedAbility(applier, "unique", () =>
    applyStatMod(target, { kind: "atk", pct: -pct, src: applier.uid, ticks: STATUS_TICKS, exact: true }));
});

export function makePrickletModule(cfg) {
  const { basicDmgByLevel } = cfg;
  return {
    /** Barbed Jab: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Barbed Jab max tier: every landed hit Poisons its target. */
    onHit(unit, target) {
      if (target && target.hp > 0 && !hasRule(target, "ignoresOnHitEffects") && abilityIdx(unit, "basic") >= MAX_IDX) applyPoison(target);
      return 0;
    },

    /** Bristle Up is a self-buff: it fires as soon as it is charged. */
    specialInRange() {
      return true;
    },

    special(unit, ctx) {
      applyStatMod(unit, { kind: "def", pct: DEF_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
      ctx.newFx.push({ id: ctx.now + "bu" + unit.uid, row: unit.row, col: unit.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = { basicDmgByLevel: BASIC_DMG_BY_LEVEL };
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const sporolith = makePrickletModule(CFG);
export const stonewarden = makePrickletModule(CFG);
export const jadolith = makePrickletModule(CFG);
