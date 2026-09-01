// Siegefin line: Brine Shot / Holdfast / Deepsight.
//
// Brine Shot keeps the engine's default ranged attack flow (closest enemy)
// with per-level damage scaling; at max level every landed hit also inflicts
// a Healing Down stack.
//
// Holdfast is the artillery stance. It Roots the seahorse to the spot -- its
// OWN Root, so Cleanse and Dispel can not lift it (see applyRoot), which is
// what lets the same cast dispel every other debuff without immediately
// undoing the anchor. While it is planted it winds up: flat bonus Speed, and
// every basic attack Splashes the tiles around whatever it hits. At max level
// it holds the stance "enduringly" -- 9 ticks against the usual 6 (see the
// duration ladder in battle/constants.js).
//
// Since Root now only pins a creature in place -- attacks and abilities both
// still work -- anchoring costs this creature nothing it wanted anyway.
//
// Deepsight is the reach: a flat +1 to +5 tiles of attack range, on top of
// the ranged baseline. Range feeds targeting as well as attacking (see
// attackRangeOf in battle/geometry.js), so a maxed Siegefin picks off things
// that have not even noticed it.

import { aChebDist } from "../geometry.js";
import { STATUS_TICKS, ENDURING_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { applyStatMod, applyRoot, dispelDebuffs, isRooted, isIntangible } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js).
 *
 * The ladder tops out at 1.43x rather than the ~2x most lines use, because
 * Holdfast buys attack RATE as well: anchored, the cooldown drops from 4 ticks
 * to 3, which is a third more swings. The shallower ladder pays for that, and
 * lands on the same multiplier the other legendary Attackers use. */
const BASIC_DMG_BY_LEVEL = [28, 32, 36, 40, 40];
/** Holdfast: flat Speed gained while anchored, by special level. */
const ANCHOR_SPEED_BY_LEVEL = [15, 20, 25, 30, 30];
/** Deepsight: attack range added, by unique level. */
const RANGE_BY_LEVEL = [1, 2, 3, 4, 5];
/** Brine Shot lvl 5: Healing Down per stack (standard table value). */
const HEAL_DOWN_PCT = 20;
/** "Splash" = the target's tile plus every surrounding tile. */
const SPLASH_RANGE = 1;
/** Splash catches neighbours for the same damage the main hit landed. */
const SPLASH_DMG_MULT = 1;
/** Short enough that the Speed lapses the moment the anchor does. */
const ANCHOR_BUFF_TICKS = 2;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeSiegefinModule(cfg) {
  const { basicDmgByLevel, anchorSpeedByLevel, rangeByLevel } = cfg;
  return {
    /** Brine Shot: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /**
     * Deepsight's range, plus the anchored Speed, plus the foe list the
     * splash needs.
     *
     * onTick runs before the attack flow every tick and for BOTH sides, which
     * makes it the one place that can set all three. The foe list is stashed
     * because onHit -- where the splash has to happen, since that is what
     * fires per landed hit -- receives no context of its own.
     */
    onTick(unit, ctx) {
      unit.rangeBonus = rangeByLevel[abilityIdx(unit, "unique")];
      unit._splashFoes = ctx.aliveE;
      unit._splashFx = ctx.newFx;
      unit._splashNow = ctx.now;
      unit._splashEnemySide = !!ctx.isEnemySide;
      if (isRooted(unit)) {
        applyStatMod(unit, { kind: "spd", pct: anchorSpeedByLevel[abilityIdx(unit, "special")], src: unit.uid, ticks: ANCHOR_BUFF_TICKS });
      }
    },

    /**
     * Brine Shot's on-hit: Healing Down at max level, and -- while anchored --
     * the shell bursts, catching every enemy on a tile beside the one hit.
     * The struck target is not splashed twice.
     */
    onHit(unit, target, dealt) {
      if (target && target.uid != null && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyStatMod(target, { kind: "heal", pct: -HEAL_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      if (!isRooted(unit) || dealt <= 0 || !target || !unit._splashFoes) return 0;

      const splash = Math.max(1, Math.round(dealt * SPLASH_DMG_MULT));
      for (const e of unit._splashFoes) {
        if (e.uid === target.uid || e.hp <= 0 || isIntangible(e)) continue;
        if (aChebDist(target.row, target.col, e.row, e.col) > SPLASH_RANGE) continue;
        damageUnit(e, splash);
        unit._splashFx.push({ id: unit._splashNow + "hf" + unit.uid + e.uid, row: e.row, col: e.col, t: unit._splashNow, isSplash: true, fromRow: target.row, fromCol: target.col, isEnemy: unit._splashEnemySide });
      }
      return 0; // the splash lands on neighbours, not on the struck target
    },

    /**
     * Holdfast: plant, shake off everything, and wind up. Dispel runs BEFORE
     * the Root goes on, so the cast cleanses itself without stripping the
     * anchor it is about to set.
     */
    special(unit, ctx) {
      const { newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      dispelDebuffs(unit);
      applyRoot(unit, idx >= MAX_IDX ? ENDURING_TICKS : STATUS_TICKS, { undispellable: true });
      applyStatMod(unit, { kind: "spd", pct: anchorSpeedByLevel[idx], src: unit.uid, ticks: ANCHOR_BUFF_TICKS });
      newFx.push({ id: now + "hf" + unit.uid, row: unit.row, col: unit.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },

    /** Holdfast wants to be planted, so it fires the moment the bar is full. */
    specialInRange() {
      return true;
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  anchorSpeedByLevel: ANCHOR_SPEED_BY_LEVEL,
  rangeByLevel: RANGE_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const sylvandragon = makeSiegefinModule(CFG);
export const ancientdragon = makeSiegefinModule(CFG);
