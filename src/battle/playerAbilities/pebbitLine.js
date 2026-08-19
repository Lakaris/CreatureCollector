// Pebbit line: Pebble Spit / Boulder Hunker / Stone Skin.
//
// Pebble Spit keeps the engine's default melee attack flow (closest enemy);
// it only scales damage by ability level -- every upgrade is +damage.
//
// Boulder Hunker taunts every enemy on the surrounding tiles (the "Nearby"
// tag: Chebyshev radius 1) onto the toad and grants it a Shield equal to a %
// of its own DEF -- a timed pool of bonus Health that attack damage burns
// through before HP (see absorbShield in battle/status.js; refresh-on-recast
// per the STATUS_TICKS policy, replacing any leftover pool). Bosses in reach
// gate the cast like any melee target but ignore the Taunt.
//
// Stone Skin makes debuffs on this creature expire faster: each tick it
// accrues `rate` worth of extra expiry, and every time that reaches a whole
// tick it decrements every active debuff timer once more (with the same
// on-expiry cleanup the engine does). A fast-forwarded DoT also skips the
// damage that tick would have dealt -- expiring faster means hurting less.

import { aChebDist } from "../geometry.js";
import { STATUS_TICKS } from "../constants.js";
import { tickStatMods } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
const BASIC_DMG_BY_LEVEL = [9, 10, 11, 12, 13];
/** Boulder Hunker: Shield as a % of this creature's DEF, by special level. */
const SHIELD_PCT_BY_LEVEL = [3, 6, 9, 12, 15];
/** "Nearby" = every surrounding tile. */
const TAUNT_RANGE = 1;
/** Stone Skin: extra debuff-expiry ticks accrued per battle tick ("N% faster"). */
const EXPIRY_RATE_BY_LEVEL = [0.1, 0.2, 0.3, 0.4, 0.5];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** One bonus expiry tick: decrement every active debuff timer, with the same
 * cleanup the regular per-tick decrements do (battle/status.js). Buffs --
 * positive ATK/Speed mods and the Shield itself -- are untouched. */
function bonusExpiryTick(u) {
  if ((u.burnTicks || 0) > 0 && !--u.burnTicks) { u.burnStacks = 0; u.burnSourceAtk = 0; }
  if ((u.poisonTicks || 0) > 0) u.poisonTicks--;
  if ((u.rootTicks || 0) > 0) u.rootTicks--;
  if ((u.dotTicks || 0) > 0) u.dotTicks--;
  if ((u.weakTicks || 0) > 0) u.weakTicks--;
  if ((u.healImmuneTicks || 0) > 0) u.healImmuneTicks--;
  if ((u.slowTicks || 0) > 0) u.slowTicks--;
  if ((u.shockTicks || 0) > 0) u.shockTicks--;
  if ((u.tauntTicks || 0) > 0 && !--u.tauntTicks) u.tauntSourceUid = null;
  if ((u.stunTicks || 0) > 0) u.stunTicks--;
  if ((u.markedTicks || 0) > 0) u.markedTicks--;
  // Negative stat-mod stacks (ATK/Speed/DEF Down, Healing Down) age one
  // extra tick; buff stacks are untouched. Restrained has no timer (it
  // never expires on its own), so Stone Skin's faster expiry can't touch it.
  tickStatMods(u, true);
}

export function makePebbitModule(cfg) {
  const { basicDmgByLevel, shieldPctByLevel, expiryRateByLevel } = cfg;
  return {
    /** Pebble Spit: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / basicDmgByLevel[0];
    },

    /** Stone Skin: debuffs on this creature expire N% faster. */
    onTick(unit) {
      const rate = expiryRateByLevel[abilityIdx(unit, "unique")];
      unit._stoneSkinAccum = (unit._stoneSkinAccum || 0) + rate;
      if (unit._stoneSkinAccum >= 1) {
        unit._stoneSkinAccum -= 1;
        bonusExpiryTick(unit);
      }
    },

    /**
     * Boulder Hunker: Taunt every enemy on a surrounding tile and shield up.
     * Uses the default in-range special gate (melee range), so the charge
     * holds until something is actually beside the toad; an adjacent boss
     * opens the gate too -- it ignores the Taunt, but the Shield still lands.
     */
    special(unit, ctx) {
      const { aliveE, newFx, now } = ctx;

      for (const e of aliveE) {
        if (aChebDist(unit.row, unit.col, e.row, e.col) > TAUNT_RANGE) continue;
        e.tauntTicks = STATUS_TICKS;
        e.tauntSourceUid = unit.uid;
        newFx.push({ id: now + "bh" + unit.uid + e.uid, row: e.row, col: e.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }

      const pct = shieldPctByLevel[abilityIdx(unit, "special")];
      unit.shield = Math.max(1, Math.round((unit.def * pct) / 100));
      unit.shieldTicks = STATUS_TICKS;
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  shieldPctByLevel: SHIELD_PCT_BY_LEVEL,
  expiryRateByLevel: EXPIRY_RATE_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const pebbit = makePebbitModule(CFG);
export const bouldrath = makePebbitModule(CFG);
export const granitarch = makePebbitModule(CFG);
export const mountainking = makePebbitModule(CFG);
