// Cinderbill line: Lava Spit / Magma Mantle / Forgeheart.
//
// A Water-side idea in a Fire body: a pelican that mantles its allies. Every
// part of the kit points at the ally standing next to it rather than at the
// enemy in front, and the enemy-facing half exists to set the team up.
//
// Lava Spit keeps the engine's default ranged flow (closest enemy) with
// per-level damage scaling; at max level every landed hit also Exposes, so the
// NEXT thing to hit that target -- usually an ally, given everything else this
// creature does -- lands harder.
//
// Magma Mantle is the wing coming down. Every Beside ally gets Protect (their
// incoming hits redirect onto the pelican, which is built to eat them) and a
// Heal Over Time, low and steady rather than a burst: this is the mother bird
// feeding the brood from its own breast, and the pelican pays for it by taking
// the hits itself. At max level the wing covers a third stack.
//
// Forgeheart is what makes that a trade rather than charity: an ally sheltering
// under the wing hits harder for as long as it is under there. The bonus is
// read off the guardian at damage time (see attackerDamageMultiplier in
// battle/hp.js), so it appears and vanishes exactly with the Protect.

import { aChebDist } from "../geometry.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { applyProtect } from "../hp.js";
import { applyExpose, applyHealOverTime } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Tank-priced, the flattened curve the tank cohort uses -- this is a Tank
// whose damage is beside the point.
const BASIC_DMG_BY_LEVEL = [12, 13, 15, 17, 17];
/** Magma Mantle: total Heal Over Time per Beside ally, by special level. */
const MANTLE_HEAL_BY_LEVEL = [8, 10, 13, 16, 16];
/** Magma Mantle: Protect stacks handed to each Beside ally, by special level. */
const MANTLE_PROTECT_BY_LEVEL = [2, 2, 2, 2, 3];
/** Forgeheart: extra damage an ally deals while Protected by this creature. */
const FORGEHEART_PCT_BY_LEVEL = [3, 6, 9, 12, 15];
/** "Beside" = the allies standing in the tiles next to this creature. */
const BESIDE_RANGE = 1;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeCinderbillModule(cfg) {
  const { basicDmgByLevel, mantleHealByLevel, mantleProtectByLevel, forgeheartPctByLevel } = cfg;
  return {
    /**
     * Forgeheart: publish what an ally under this wing is worth. Nothing reads
     * it unless that ally actually holds Protect from this creature, so this
     * is the whole passive -- see attackerDamageMultiplier in battle/hp.js.
     */
    onBattleStart(unit) {
      unit._protectDmgPct = forgeheartPctByLevel[abilityIdx(unit, "unique")];
    },
    onTick(unit) {
      unit._protectDmgPct = forgeheartPctByLevel[abilityIdx(unit, "unique")];
    },

    /** Lava Spit: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /** Lava Spit lvl 5: every landed hit leaves the target Exposed. */
    onHit(unit, target) {
      if (target && target.uid != null && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyExpose(target);
      }
      return 0;
    },

    // Everything Magma Mantle does lands on allies, so it fires off cooldown
    // rather than waiting for an enemy to come into reach.
    specialInRange() {
      return true;
    },

    /**
     * Magma Mantle: Protect and a Heal Over Time on every Beside ally. The
     * heal is written as a TOTAL on the card and spread across the standard
     * duration here, the same shape Shared Flame uses. Healing Down and Heal
     * Block apply per tick, the way they do to every Heal Over Time -- this
     * line has no healing-output bonus of its own to fold in.
     */
    special(unit, ctx) {
      const { aliveP, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const stacks = mantleProtectByLevel[idx];
      const perTick = Math.max(1, Math.round(mantleHealByLevel[idx] / STATUS_TICKS));

      for (const a of aliveP) {
        if (a.uid === unit.uid || a.hp <= 0) continue;
        if (aChebDist(unit.row, unit.col, a.row, a.col) > BESIDE_RANGE) continue;
        applyProtect(a, unit, stacks);
        applyHealOverTime(a, perTick, STATUS_TICKS);
        newFx.push({ id: now + "mm" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      newFx.push({ id: now + "mmc" + unit.uid, row: unit.row, col: unit.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  mantleHealByLevel: MANTLE_HEAL_BY_LEVEL,
  mantleProtectByLevel: MANTLE_PROTECT_BY_LEVEL,
  forgeheartPctByLevel: FORGEHEART_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const cinderbill = makeCinderbillModule(CFG);
export const emberpouch = makeCinderbillModule(CFG);
export const kilnwing = makeCinderbillModule(CFG);
export const pyrelican = makeCinderbillModule(CFG);
