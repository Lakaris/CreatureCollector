// Cragling line: Staff Strike / Ruyi Reach / Seventy-Two Forms.
//
// Staff Strike keeps the engine's default melee flow (closest enemy). Its
// damage deliberately does NOT scale with level -- every upgrade buys
// Ability Charge instead, .5% of the bar per landed hit rising to 2.5%, so
// levelling the basic is really levelling how often Ruyi Reach comes up.
//
// Ruyi Reach is the staff extending down a column: it picks the closest
// targetable foe and hits every enemy sharing that foe's column (the boss
// too, when its 2x2 body spans it). At max level each one is stunned
// momentarily -- one tick, a third of the game's "briefly" (see
// MOMENTARY_STUN_TICKS), because a whole column of stun is a tempo bump
// rather than a lockdown.
//
// Seventy-Two Forms is the dodge: every 10th incoming ability hit (down to
// every 6th) misses outright. The counter and the cancelling both live in
// hp.js's damageUnit -- the single damage chokepoint -- and the attack loops
// in tick.js skip the on-hit effects and the reflect for a dodged swing, so
// nothing at all lands. Effect damage (Burn, DoTs, Hazards) neither advances
// the tally nor can be dodged.

import { attackRoll, playerDamageToBoss, damageBoss } from "../damage.js";
import { unitDist, distToBoss } from "../geometry.js";
import { BOSS_SIZE, BASIC_DMG_BASELINE } from "../constants.js";
import { isIntangible } from "../status.js";
import { damageUnit } from "../hp.js";

/** Staff Strike's damage is flat across levels -- upgrades buy charge. */
const BASIC_DMG = 20;
/** Ability Charge gained per landed basic hit, as a % of the bar, by level. */
const CHARGE_PCT_BY_LEVEL = [0.5, 1, 1.5, 2, 2.5];
/** Displayed Ruyi Reach damage by level, scaled off the basic's value. */
const SPECIAL_DMG_BY_LEVEL = [30, 38, 48, 60, 60];
/** Seventy-Two Forms: dodge every Nth incoming ability hit, by level. */
const DODGE_EVERY_BY_LEVEL = [10, 9, 8, 7, 6];
/**
 * "Momentarily" -- the shortest stun that actually costs the victim a turn.
 *
 * A stun applied during one side's phase is decremented by the victim's own
 * tickTimedMods before its action runs, so a 1-tick stun expires without
 * ever gating anything. 2 ticks means exactly one skipped action: still well
 * short of "briefly" (3) and of the 6-tick standard, which is the point --
 * this lands on a whole column at once.
 */
const MOMENTARY_STUN_TICKS = 2;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeCraglingModule(cfg) {
  const { chargePctByLevel, specialDmgByLevel, dodgeEveryByLevel } = cfg;
  return {
    /** Arm the dodge counter for this battle. */
    onBattleStart(unit) {
      unit.dodgeEvery = dodgeEveryByLevel[abilityIdx(unit, "unique")];
      unit.dodgeCounter = 0;
    },

    /** Staff Strike: flat 20 on the card at every tier, so a flat multiplier
     * (base power over BASIC_DMG_BASELINE -- see battle/constants.js). */
    dmgMultForAttack() {
      return BASIC_DMG / BASIC_DMG_BASELINE;
    },

    /**
     * Staff Strike's real payload: charge. Only a landed hit pays -- a swing
     * the target dodged (or that an Intangible ignored) deals 0 and earns
     * nothing.
     */
    onHit(unit, target, dealt) {
      if (dealt > 0 && unit.abilChargeMax) {
        const gain = (unit.abilChargeMax * chargePctByLevel[abilityIdx(unit, "basic")]) / 100;
        unit.abilCharge = Math.min(unit.abilChargeMax, (unit.abilCharge || 0) + gain);
      }
      return 0;
    },

    /**
     * Ruyi Reach: the closest targetable foe picks the column, then every
     * enemy standing in it is struck. Uses the engine's default in-range
     * gate, so the bar holds until something is actually in melee reach.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;
      const stuns = idx >= MAX_IDX;

      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        if (e.hp <= 0 || isIntangible(e)) continue;
        const d = unitDist(unit, e);
        if (d < bestD) { bestD = d; best = e; }
      }
      const bossAlive = !!(boss && boss.hp > 0);
      const bossD = bossAlive ? distToBoss(boss, unit.row, unit.col) : Infinity;
      const col = best ? best.col : bossAlive && bossD < Infinity ? boss.col : null;
      if (col == null) return;

      let total = 0;
      for (const e of aliveE) {
        const size = e.size || 1;
        if (e.hp <= 0 || isIntangible(e) || col < e.col || col > e.col + size - 1) continue;
        const dmg = Math.max(1, Math.round(attackRoll(unit) * mult));
        const dealt = damageUnit(e, dmg);
        total += dealt;
        // A dodged strike lands nothing -- the stun included.
        if (stuns && !e._dodgedHit) e.stunTicks = MOMENTARY_STUN_TICKS;
        newFx.push({ id: now + "rr" + unit.uid + e.uid, row: e.row, col: e.col, t: now, isPillar: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      if (bossAlive && col >= boss.col && col <= boss.col + BOSS_SIZE - 1) {
        const dmg = Math.max(1, Math.round(playerDamageToBoss(unit, boss, ctx.aliveP) * mult));
        damageBoss(boss, dmg);
        total += dmg;
        newFx.push({ id: now + "rrb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isPillar: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      if (total > 0) ctx.addDamageDealt(total);
    },
  };
}

const CFG = {
  chargePctByLevel: CHARGE_PCT_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  dodgeEveryByLevel: DODGE_EVERY_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const ironmole = makeCraglingModule(CFG);
export const steelmole = makeCraglingModule(CFG);
export const titanmole = makeCraglingModule(CFG);
export const skysage = makeCraglingModule(CFG);
