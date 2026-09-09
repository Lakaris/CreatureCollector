// Dustling line: Dust Flick / Pollen Veil / Moonlit Scales.
//
// Dust Flick keeps the engine's default ranged attack flow (closest enemy)
// with per-level damage scaling; at max level every landed hit also inflicts
// an Attack Down stack.
//
// Pollen Veil is the line's whole identity: a burst of scale-dust dropped on
// the LOWEST-Health ally. That ally takes the full heal; everything else in
// the 3x3 Splash around them is caught by the drifting cloud -- allies there
// recover half the amount, enemies there breathe it in and get Healing Down
// instead. It deals no damage at all. At max level the dust also Blinds the
// enemies it touches, so their next attack misses outright (see applyBlind in
// battle/status.js and missBlindedSwing in battle/tick.js).
//
// Moonlit Scales: whenever this creature is hit by an attack, a few scales
// shake loose and settle on the lowest OTHER ally, healing them -- never
// itself, so a lone Dustling gets nothing out of being punched. At max level
// that ally also gains Speed Up. The heal is queued by onDamaged (which has
// no context to find allies with) and paid out on the next onTick, the same
// one-tick handoff Deep Submerge uses.

import { aChebDist, bossOccupies } from "../geometry.js";
import { STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { applyStatMod, healReceivedMultiplier, applyBlind } from "../status.js";
// Aliased: this module already exports a healUnit of its own that wraps this one.
import { healUnit as applyHeal } from "../hp.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [12, 15, 19, 24, 24];
/** Pollen Veil: heal on the centre ally by special level (Splashed allies get half). */
const SPECIAL_HEAL_BY_LEVEL = [24, 30, 38, 48, 48];
/** Moonlit Scales: heal handed to the lowest other ally per attack taken. */
const PASSIVE_HEAL_BY_LEVEL = [6, 8, 11, 14, 14];
/** "Splash" = the target's tile plus every surrounding tile. */
const SPLASH_RANGE = 1;
/** Dust Flick lvl 5: Attack Down (standard first-stack value). */
const ATK_DOWN_PCT = 15;
/** Pollen Veil: Healing Down per stack (standard table -- 5 stacks shut healing off). */
const HEAL_DOWN_PCT = 20;
/** Moonlit Scales lvl 5: Speed Up granted to the healed ally. */
const SPEED_UP_PCT = 25;

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

// Applies this line's own Heal Block guard and Healing Down scaling, then
// hands the final amount to the engine's heal chokepoint so Overheal sees the
// overflow like it does for every other healer (see battle/hp.js).
function healUnit(target, amount) {
  if (!canBeHealed(target)) return 0;
  const amt = Math.max(1, Math.round(amount * healReceivedMultiplier(target)));
  applyHeal(target, amt);
  return amt;
}

/** Lowest-Health living ally, optionally excluding the caster itself. */
function lowestAlly(unit, aliveP, excludeSelf) {
  let best = null;
  for (const a of aliveP) {
    if (a.hp <= 0 || (excludeSelf && a.uid === unit.uid)) continue;
    if (!best || a.hp < best.hp) best = a;
  }
  return best;
}

export function makeDustlingModule(cfg) {
  const { basicDmgByLevel, specialHealByLevel, passiveHealByLevel } = cfg;
  return {
    /** Dust Flick: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /** Dust Flick lvl 5: every landed hit sands down the victim's Attack. */
    onHit(unit, target) {
      if (target && target.uid != null && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyStatMod(target, { kind: "atk", pct: -ATK_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      return 0;
    },

    /**
     * Pollen Veil: full heal on the lowest ally, then the cloud Splashes the
     * 3x3 around them -- half heal for allies caught in it, Healing Down (and
     * at max level Blind) for enemies. No damage anywhere. Uses the default
     * Support in-range gate, so it fires once the team is engaged.
     */
    special(unit, ctx) {
      const { aliveP, aliveE, boss, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const heal = specialHealByLevel[idx];
      const blinds = idx >= MAX_IDX;

      const centre = lowestAlly(unit, aliveP, false);
      if (!centre) return;
      healUnit(centre, heal);
      newFx.push({ id: now + "pv" + unit.uid, row: centre.row, col: centre.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });

      // Everything else standing in the cloud. The centre already took the
      // full amount, so it is not also healed for half.
      for (const a of aliveP) {
        if (a.uid === centre.uid || a.hp <= 0) continue;
        if (aChebDist(centre.row, centre.col, a.row, a.col) > SPLASH_RANGE) continue;
        healUnit(a, heal / 2);
        newFx.push({ id: now + "pva" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: centre.row, fromCol: centre.col, isEnemy: !!ctx.isEnemySide });
      }
      for (const e of aliveE) {
        if (aChebDist(centre.row, centre.col, e.row, e.col) > SPLASH_RANGE) continue;
        applyStatMod(e, { kind: "heal", pct: -HEAL_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
        if (blinds) applyBlind(e);
        newFx.push({ id: now + "pve" + unit.uid + e.uid, row: e.row, col: e.col, t: now, isRanged: false, fromRow: centre.row, fromCol: centre.col, isEnemy: !!ctx.isEnemySide });
      }
      if (boss && boss.hp > 0) {
        // The boss reads stat mods, so Healing Down sticks; Blind does not,
        // since boss swings don't run through the unit attack path.
        let overlaps = false;
        for (let dr = -SPLASH_RANGE; dr <= SPLASH_RANGE && !overlaps; dr++) {
          for (let dc = -SPLASH_RANGE; dc <= SPLASH_RANGE && !overlaps; dc++) {
            if (bossOccupies(boss, centre.row + dr, centre.col + dc)) overlaps = true;
          }
        }
        if (overlaps) applyStatMod(boss, { kind: "heal", pct: -HEAL_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
    },

    /** Moonlit Scales: queue one heal per attack hit taken (no reflect). */
    onDamaged(unit, attacker, dmg) {
      if (dmg > 0) unit._scalesPending = (unit._scalesPending || 0) + 1;
      return 0;
    },

    /** Pay out the queued scales: lowest OTHER ally, once per hit taken. */
    onTick(unit, ctx) {
      const pending = unit._scalesPending || 0;
      if (!pending) return;
      unit._scalesPending = 0;

      const { aliveP, newFx, now } = ctx;
      const idx = abilityIdx(unit, "unique");
      const heal = passiveHealByLevel[idx];
      const hastens = idx >= MAX_IDX;

      for (let i = 0; i < pending; i++) {
        // Re-picked each time, so a burst of hits spreads across whoever is
        // lowest at that moment rather than dumping it all on one ally.
        const tgt = lowestAlly(unit, aliveP, true);
        if (!tgt) return;
        healUnit(tgt, heal);
        if (hastens) applyStatMod(tgt, { kind: "spd", pct: SPEED_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
        newFx.push({ id: now + "ms" + unit.uid + tgt.uid + i, row: tgt.row, col: tgt.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialHealByLevel: SPECIAL_HEAL_BY_LEVEL,
  passiveHealByLevel: PASSIVE_HEAL_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const dustling = makeDustlingModule(CFG);
export const silkhusk = makeDustlingModule(CFG);
export const gloamwing = makeDustlingModule(CFG);
export const lunashroud = makeDustlingModule(CFG);
