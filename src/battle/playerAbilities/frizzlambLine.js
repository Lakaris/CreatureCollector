// Frizzlamb line (static sheep): Static Prickle / Flock Surge / Skittish.
//
// A ranged Electric support that banks Charge by attacking and grounds the
// whole lot into the flock at once.
//
// Static Prickle is the intake: a plain ranged hit that banks 1 Charge for
// every enemy it lands on. Granted from onHit rather than once per attack, so
// gear that Chains the Basic (Arrowsplit and friends -- see settleBasicAttack in
// battle/tick.js, whose riderHit calls this module's onHit per chained enemy)
// multiplies the rate on its own: a swing that reaches three enemies banks
// three. That is what CHARGE_CAP is sized for; the bare ability reaches one.
//
// Flock Surge is the spend. It empties the bank and every Nearby ally --
// this creature included, as Nearby always does -- recovers a share of its
// own max Health per Charge spent. Being a share of each ally's OWN Health,
// it heals a tank for more than it heals a glass cannon, and a full bank at
// max level restores half of everything nearby. Max level also hands out
// Defense Up.
//
// Skittish is a flat Speed bump: no buff, no effect of its own to name.
//
// "Charge" here is the kit's own resource on `unit.charge` -- the same field
// and the same cap Sparkshell's Battery Shell uses -- not the ability-charge
// meter that fires the Special. The two share a word and nothing else.

import { unitDist } from "../geometry.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { healUnit } from "../hp.js";
import { applyStatMod, applyWhileActiveStatMod, healReceivedMultiplier } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
// Support-priced and nearly flat -- the hit is how the bank fills, not the point.
const BASIC_DMG_BY_LEVEL = [12, 13, 14, 15, 16];
/** Static Prickle: Charge banked per enemy hit. */
const CHARGE_PER_HIT = 1;
/** The most Charge the fleece can hold -- the cap every Charge kit shares. */
const CHARGE_CAP = 50;
/** Flock Surge: % of each ally's max Health restored per Charge dispelled. */
const SURGE_HEAL_PCT_PER_CHARGE_BY_LEVEL = [0.5, 0.6, 0.7, 0.8, 1];
/** Flock Surge lvl 5: the Defense Up stack handed out (first-stack value). */
const DEF_UP_PCT = 15;
/** "Nearby" = this creature and every tile surrounding it. */
const NEARBY_RANGE = 1;
/** Skittish: flat Speed by unique level. */
const SPEED_PCT_BY_LEVEL = [2, 4, 6, 8, 10];

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** The dark boss's heal-block gates every heal this module does. */
function canBeHealed(u) {
  return (u.healImmuneTicks || 0) <= 0;
}

export function makeFrizzlambModule(cfg) {
  const { basicDmgByLevel, surgeHealPctPerChargeByLevel, speedPctByLevel } = cfg;
  return {
    onBattleStart(unit) {
      unit.charge = 0;
    },

    /** Skittish: a while-active Speed stack, re-stamped every tick. */
    onTick(unit) {
      applyWhileActiveStatMod(unit, { kind: "spd", pct: speedPctByLevel[abilityIdx(unit, "unique")], src: unit.uid });
    },

    /** Static Prickle: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      return basicDmgByLevel[abilityIdx(unit, "basic")] / BASIC_DMG_BASELINE;
    },

    /**
     * Static Prickle: bank Charge for the enemy just hit. Fires once per enemy
     * the attack lands on -- including each one a Chain rider reaches -- and
     * not at all for a dodged hit, which never reaches onHit. A boss counts.
     */
    onHit(unit) {
      unit.charge = Math.min(CHARGE_CAP, (unit.charge || 0) + CHARGE_PER_HIT);
      return 0;
    },

    // Flock Surge heals and buffs allies, so it fires off cooldown rather than
    // waiting for an enemy to come into reach -- the rule every healing and
    // buffing ability follows.
    specialInRange() {
      return true;
    },

    /**
     * Flock Surge. The bank is read and emptied first, so a heal that somehow
     * triggered more Charge could not feed back into this same cast.
     */
    special(unit, ctx) {
      const { aliveP, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const spent = unit.charge || 0;
      unit.charge = 0;
      const pct = (surgeHealPctPerChargeByLevel[idx] * spent) / 100;

      for (const a of aliveP) {
        if (a.hp <= 0 || unitDist(unit, a) > NEARBY_RANGE) continue;
        if (pct > 0 && canBeHealed(a)) {
          const heal = Math.round(a.maxHp * pct * healReceivedMultiplier(a));
          if (heal > 0) healUnit(a, heal);
        }
        // Defense Up lands whether or not the heal could -- a heal-blocked ally
        // is still standing in the flock.
        if (idx >= MAX_IDX) applyStatMod(a, { kind: "def", pct: DEF_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
        newFx.push({ id: now + "fs" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  surgeHealPctPerChargeByLevel: SURGE_HEAL_PCT_PER_CHARGE_BY_LEVEL,
  speedPctByLevel: SPEED_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const frizzlamb = makeFrizzlambModule(CFG);
export const staticoat = makeFrizzlambModule(CFG);
export const thunderfleece = makeFrizzlambModule(CFG);
