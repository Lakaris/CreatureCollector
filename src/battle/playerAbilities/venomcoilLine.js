// Venomcoil line: Venom Fang / Crushing Coil / Dripping Scales.
//
// Venom Fang keeps the engine's default melee attack flow (closest enemy)
// with per-level damage scaling, and drinks back a share of what it deals --
// 10% of the damage, 30% at max level. The lifesteal is ordinary healing, so
// Healing Down cuts it and the dark boss's heal-block stops it dead.
//
// Crushing Coil is the wrap: damage to the closest foe in melee reach plus
// Restrained, the same debuff the Shockstinger line applies (see
// battle/status.js). For a constrictor its leash rule is the whole point --
// Restrained is filed under this creature's uid with its melee reach, so the
// grip breaks the moment the victim is no longer beside it. Coiling a foe
// that is ALREADY wrapped drains its Ability Charge instead of stacking
// pressure: 10% of the bar, 20% at max level.
//
// Dripping Scales is why the coil is worth landing twice: every Restrain this
// creature inflicts drags Poison along with it, and while it is set on a
// Restrained foe the snake itself speeds up (a flat +2% to +10% Speed, not
// the Speed Up buff -- no pill, no stacking, it simply ends when the grip
// does). The buff is re-applied each tick the condition holds and lapses on
// its own a tick after it stops.

import { aChebDist, distToBoss } from "../geometry.js";
import { attackRoll, damageBoss } from "../damage.js";
import { MELEE_RANGE, RANGED_RANGE, BASIC_DMG_BASELINE } from "../constants.js";
import { damageUnit, healUnit } from "../hp.js";
import { applyRestrained, applyPoison, applyWhileActiveStatMod, healReceivedMultiplier } from "../status.js";
import { removeSpecialCharge } from "../charge.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [12, 15, 19, 24, 24];
const SPECIAL_DMG_BY_LEVEL = [35, 44, 55, 68, 68];
/** Venom Fang: share of the damage dealt that comes back as Health. */
const LIFESTEAL_PCT_BY_LEVEL = [10, 10, 10, 10, 30];
/** Crushing Coil on an already-Restrained foe: % of its Ability Charge bar drained. */
const CHARGE_DRAIN_PCT_BY_LEVEL = [10, 10, 10, 10, 20];
/** Dripping Scales: flat Speed gained while set on a Restrained enemy. */
const GRIP_SPEED_PCT_BY_LEVEL = [2, 4, 6, 8, 10];

/** One coil = one stack. Only the Shockstinger line counts stacks (20 to fire
 * Overload Sting); here Restrained is a state, so a single stack says it all. */
const RESTRAIN_STACKS = 1;
/** The snake's Restrained carries no slow of its own -- that is Static Grip's
 * job, and this line has no equivalent. */
const RESTRAIN_SLOW_PCT = 0;
// The grip's Speed is a while-active stack (applyWhileActiveStatMod in
// status.js): it lapses right after the grip breaks.

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeVenomcoilModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, lifestealPctByLevel, chargeDrainPctByLevel, gripSpeedPctByLevel } = cfg;

  /** Is this foe wrapped by anyone? (Overload Sting's gate counts stacks; the
   * coil only cares that a grip is already on.) */
  const isRestrained = (e) => (e.restrainedStacks || 0) > 0;

  return {
    /** Venom Fang: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /**
     * Venom Fang's lifesteal. Rides on the damage actually dealt (shield
     * absorption included, matching how the engine reports every hit), and
     * returns 0 -- it heals, it does not add damage.
     */
    onHit(unit, target, dealt) {
      if (dealt <= 0 || unit.hp <= 0) return 0;
      if ((unit.healImmuneTicks || 0) > 0) return 0;
      const pct = lifestealPctByLevel[abilityIdx(unit, "basic")];
      const raw = (dealt * pct) / 100;
      const heal = Math.max(1, Math.round(raw * healReceivedMultiplier(unit)));
      healUnit(unit, heal, { lifesteal: true });
      return 0;
    },

    /**
     * Crushing Coil: wrap the closest foe in melee reach. Uses the default
     * in-range special gate, so the charge holds until something is actually
     * beside the snake -- which is also the only place the grip can hold.
     */
    special(unit, ctx) {
      const { aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const mult = specialDmgByLevel[idx] / BASIC_DMG_BASELINE;

      let best = null, bestD = Infinity;
      for (const e of aliveE) {
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        if (d <= MELEE_RANGE && d < bestD) { bestD = d; best = e; }
      }
      const bd = boss && boss.hp > 0 ? distToBoss(boss, unit.row, unit.col) : Infinity;
      if (bd <= MELEE_RANGE && bd < bestD) {
        // The boss takes the hit but can not be wrapped -- same CC-immunity
        // policy as Taunt -- so there is no Poison and no charge to drain
        // either (bosses run on their own cast timers, not an Ability bar).
        const dmg = Math.max(1, Math.round(attackRoll(unit) * mult));
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + "cc" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
        return;
      }
      if (!best) return;

      // Read the grip BEFORE this cast adds its own, so "already Restrained"
      // means what it says.
      const alreadyWrapped = isRestrained(best);

      const dmg = Math.max(1, Math.round(attackRoll(unit) * mult));
      const dealt = damageUnit(best, dmg);
      if (dealt) ctx.addDamageDealt(dealt);

      applyRestrained(best, unit.uid, RESTRAIN_STACKS, RESTRAIN_SLOW_PCT, MELEE_RANGE);
      // Dripping Scales: the venom rides along with every Restrain.
      applyPoison(best);

      if (alreadyWrapped && best.abilChargeMax) {
        const drain = (best.abilChargeMax * chargeDrainPctByLevel[idx]) / 100;
        removeSpecialCharge(best, drain, unit);
      }
      newFx.push({ id: now + "cc" + unit.uid + best.uid, row: best.row, col: best.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },

    /**
     * Dripping Scales' Speed: on while the foe this creature would strike is
     * wrapped. Refreshed every tick the grip holds; once it breaks, nothing
     * renews it and the buff lapses a tick later.
     */
    onTick(unit, ctx) {
      const pct = gripSpeedPctByLevel[abilityIdx(unit, "unique")];
      if (!pct) return;
      const range = unit.isRanged ? RANGED_RANGE : MELEE_RANGE;
      let target = null, bestD = Infinity;
      for (const e of ctx.aliveE) {
        if (e.hp <= 0) continue;
        const d = aChebDist(unit.row, unit.col, e.row, e.col);
        if (d <= range && d < bestD) { bestD = d; target = e; }
      }
      if (!target || !isRestrained(target)) return;
      applyWhileActiveStatMod(unit, { kind: "spd", pct, src: unit.uid });
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  lifestealPctByLevel: LIFESTEAL_PCT_BY_LEVEL,
  chargeDrainPctByLevel: CHARGE_DRAIN_PCT_BY_LEVEL,
  gripSpeedPctByLevel: GRIP_SPEED_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const leafling = makeVenomcoilModule(CFG);
export const canoparch = makeVenomcoilModule(CFG);
export const verdantlord = makeVenomcoilModule(CFG);
export const ancientgrove = makeVenomcoilModule(CFG);
