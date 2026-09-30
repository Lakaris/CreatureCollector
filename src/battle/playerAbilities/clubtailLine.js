// Clubtail line: Tail Club / Wind Up / Dead Weight.
//
// A Legendary Earth attacker built the opposite way round to the usual one.
// Dead Weight is a deliberate handicap -- it gives up more than half its Speed
// and Haste for a slab of Attack -- so it arrives late, swings rarely, and has
// to make each swing count. Everything else in the kit is about making the
// swing that eventually lands as large as possible.
//
// Tail Club is the engine's default melee flow (closest enemy) with per-level
// damage scaling, and it is the only ability here that hits anything.
//
// Wind Up is stored damage. Each cast adds a stack of bonus damage to the NEXT
// attack, and the stacks add up to a cap of 100% -- so the interesting play is
// to let the charge come round two or three times before the club finally
// lands. The whole store is spent by one swing, whatever it hits.
//
// Dead Weight is the handicap and, at max level, its payoff: a club swing big
// enough to kill outright spills its excess onto the eight tiles around the
// corpse, split evenly between them. Overkill is exactly what this creature
// generates -- a fully wound-up hit on a nearly dead target wastes most of its
// damage -- so the max tier turns its own worst case into an area attack.

import { aChebDist } from "../geometry.js";
import { BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit } from "../hp.js";
import { applyWhileActiveStatMod, isIntangible } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Legendary attacker ladder. Unlike its cohort this one keeps climbing at the
// last tier, because every Tail Club upgrade is damage and nothing else.
const BASIC_DMG_BY_LEVEL = [30, 34, 38, 43, 48];
/** Wind Up: bonus damage added to the next attack per cast, by special level. */
const WIND_UP_PCT_BY_LEVEL = [30, 35, 40, 45, 50];
/** However many times it is cast, the stored bonus stops here. */
const WIND_UP_CAP_PCT = 100;
/** Dead Weight: Speed penalty (negative), by unique level. */
const SPEED_PCT_BY_LEVEL = [-60, -50, -50, -50, -50];
/** Dead Weight: Haste penalty (negative), by unique level. */
const HASTE_PCT_BY_LEVEL = [-60, -60, -50, -50, -50];
/** Dead Weight: Attack bonus, by unique level. */
const ATTACK_PCT_BY_LEVEL = [40, 40, 40, 50, 50];
/** The 8 tiles around the defeated creature. */
const SPLASH_RANGE = 1;
/** How many tiles the excess is divided between, whether or not all are filled.
 * Splitting by the 8 tiles rather than by the enemies actually standing there
 * keeps the payoff honest: catching one straggler is worth an eighth, not all
 * of it. */
const SPLASH_TILES = 8;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeClubtailModule(cfg) {
  const { basicDmgByLevel, windUpPctByLevel, speedPctByLevel, hastePctByLevel, attackPctByLevel } = cfg;
  return {
    onBattleStart(unit) {
      unit.windUp = 0;
    },

    /**
     * Dead Weight's three stat lines, plus the foe list the overkill splash
     * needs -- onHit, where the splash has to happen, gets no context of its
     * own (the same stash Holdfast's splash uses).
     *
     * The stats are while-active stacks: they are the creature's permanent
     * condition, not a timed buff, so they hold as long as the module runs
     * and lapse at once if it ever stops.
     */
    onTick(unit, ctx) {
      const idx = abilityIdx(unit, "unique");
      applyWhileActiveStatMod(unit, { kind: "spd", pct: speedPctByLevel[idx], src: unit.uid });
      applyWhileActiveStatMod(unit, { kind: "haste", pct: hastePctByLevel[idx], src: unit.uid });
      applyWhileActiveStatMod(unit, { kind: "atk", pct: attackPctByLevel[idx], src: unit.uid });
      unit._splashFoes = ctx.aliveE;
      unit._splashFx = ctx.newFx;
      unit._splashNow = ctx.now;
      unit._splashEnemySide = !!ctx.isEnemySide;
      unit._credit = ctx.addDamageDealt;
    },

    /**
     * Tail Club's level scaling, times whatever Wind Up has stored.
     *
     * This hook runs immediately before the damage roll for this exact target
     * (it is called from the attack loop's dmgMultVs and nowhere else), which
     * makes it the one place that can note the victim's Health BEFORE the hit
     * -- the overkill splash in onHit needs it, and by then the Health has
     * already been spent.
     */
    dmgMultForAttack(unit, target) {
      if (target && target.uid != null) {
        unit._preHitUid = target.uid;
        unit._preHitHp = target.hp;
      }
      const base = basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
      return base * (1 + (unit.windUp || 0) / 100);
    },

    /**
     * The swing landed: the store is spent, and at max level anything the
     * target could not absorb spills onto its neighbours.
     */
    onHit(unit, target, dealt) {
      unit.windUp = 0;
      if (abilityIdx(unit, "unique") < MAX_IDX) return 0;
      if (!target || dealt <= 0 || !unit._splashFoes) return 0;
      // Only a kill spills, and only the part the corpse could not use.
      if (target.hp > 0 || target.uid !== unit._preHitUid) return 0;
      const excess = dealt - (unit._preHitHp || 0);
      if (excess <= 0) return 0;

      const each = Math.max(1, Math.round(excess / SPLASH_TILES));
      for (const e of unit._splashFoes) {
        if (e.uid === target.uid || e.hp <= 0 || isIntangible(e)) continue;
        if (aChebDist(target.row, target.col, e.row, e.col) > SPLASH_RANGE) continue;
        const spilt = damageUnit(e, each);
        if (unit._credit) unit._credit(spilt);
        unit._splashFx.push({ id: unit._splashNow + "dw" + unit.uid + e.uid, row: e.row, col: e.col, t: unit._splashNow, isSplash: true, fromRow: target.row, fromCol: target.col, isEnemy: unit._splashEnemySide });
      }
      return 0; // the spill lands on neighbours, never back on the corpse
    },

    /**
     * Wind Up: store bonus damage for the next swing, up to the cap. It is a
     * self-buff with no target, so it has no in-range gate of its own -- the
     * club is worth winding whether or not anything is standing in reach yet.
     */
    specialInRange() {
      return true;
    },

    special(unit, ctx) {
      const idx = abilityIdx(unit, "special");
      unit.windUp = Math.min(WIND_UP_CAP_PCT, (unit.windUp || 0) + windUpPctByLevel[idx]);
      ctx.newFx.push({ id: ctx.now + "wu" + unit.uid, row: unit.row, col: unit.col, t: ctx.now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  windUpPctByLevel: WIND_UP_PCT_BY_LEVEL,
  speedPctByLevel: SPEED_PCT_BY_LEVEL,
  hastePctByLevel: HASTE_PCT_BY_LEVEL,
  attackPctByLevel: ATTACK_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const clubtail = makeClubtailModule(CFG);
export const anvilback = makeClubtailModule(CFG);
