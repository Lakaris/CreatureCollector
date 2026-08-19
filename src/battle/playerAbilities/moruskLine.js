// Morusk line: Tusk Slam / Blubber Wall / Permafrost Hide.
//
// Tusk Slam keeps the engine's default melee attack flow (closest enemy) with
// per-level damage scaling; at max level every landed hit also inflicts a
// Healing Down stack (-20% healing received per stack -- see
// healReceivedMultiplier in battle/status.js) for the standard duration.
//
// Blubber Wall shields Morusk for a % of its max Health (see absorbShield;
// refresh-on-recast per the STATUS_TICKS policy). If the shield is BROKEN by
// damage while its timer is still running, it bursts: every enemy on a
// surrounding tile (the "Nearby" tag) takes damage equal to a % of Morusk's
// DEF. A shield that simply times out fades without bursting. The break is
// detected on the unit's next onTick, so the burst lands one tick after the
// hit that shattered the wall.
//
// Permafrost Hide: every instance of damage this creature deals (basic hits
// and the wall burst) chills the victim, lowering its Speed by 2-10% for the
// standard duration. Uses the shared spdMod slot: it refreshes itself freely
// and overwrites weaker slows (or an enemy's Speed Up buff), but never
// replaces a stronger slow already on the target. Bosses are unaffected --
// their action cadence doesn't read unit speed mods.

import { aChebDist, distToBoss } from "../geometry.js";
import { damageBoss } from "../damage.js";
import { STATUS_TICKS } from "../constants.js";
import { damageUnit } from "../hp.js";
import { applyStatMod } from "../status.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * ratio of the current level's value to the basic's base value. */
const BASIC_DMG_BY_LEVEL = [18, 20, 22, 25, 25];
/** Blubber Wall: Shield as a % of this creature's max Health, by special level. */
const SHIELD_PCT_BY_LEVEL = [8, 10, 10, 12, 12];
/** Blubber Wall: burst damage as a % of this creature's DEF, by special level. */
const BURST_PCT_BY_LEVEL = [50, 50, 65, 65, 80];
/** "Nearby" = every surrounding tile. */
const BURST_RANGE = 1;
/** Permafrost Hide: Speed Down applied on dealing damage, by unique level.
 * Maxed lands on the standard 5% per stack that the Speed Down tag
 * advertises (5/10/15/20/25 across 5 sources); lower ranks chill less. */
const SLOW_PCT_BY_LEVEL = [1, 2, 3, 4, 5];
/** Tusk Slam max level: Healing Down per stack (one stack per Morusk).
 * 20% matches the Healing Down tag's advertised stacking table, where 5 stacks
 * shut healing off entirely (see ABILITY_TAG_DEFS in core/abilityText.js). */
const HEAL_DOWN_PCT = 20;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeMoruskModule(cfg) {
  const { basicDmgByLevel, shieldPctByLevel, burstPctByLevel, slowPctByLevel } = cfg;

  /** Permafrost Hide's chill: one Speed Down stack per Morusk, refreshed per
   * hit; stacks with other sources. Skips bosses (no uid -- their cadence
   * ignores unit speed mods). */
  function applyChill(unit, target) {
    if (!target || target.uid == null) return;
    const pct = slowPctByLevel[abilityIdx(unit, "unique")];
    if (!pct) return;
    applyStatMod(target, { kind: "spd", pct: -pct, src: unit.uid, ticks: STATUS_TICKS });
  }

  return {
    /** Tusk Slam: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / basicDmgByLevel[0];
    },

    /** Tusk Slam on-hit: always chill; at max basic level also halve healing received. */
    onHit(unit, target) {
      applyChill(unit, target);
      if (target && target.uid != null && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyStatMod(target, { kind: "heal", pct: -HEAL_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      return 0;
    },

    /**
     * Blubber Wall: shield up for a % of max Health. Uses the default
     * in-range special gate (melee range), so the wall goes up right as
     * something closes in -- which is also when a burst has targets.
     */
    special(unit) {
      const pct = shieldPctByLevel[abilityIdx(unit, "special")];
      unit.shield = Math.max(1, Math.round((unit.maxHp * pct) / 100));
      unit.shieldTicks = STATUS_TICKS;
      unit._wallArmed = true;
    },

    /** Detect a broken wall (shield emptied while its timer still runs) and burst. */
    onTick(unit, ctx) {
      if (!unit._wallArmed || (unit.shield || 0) > 0) return;
      const broken = (unit.shieldTicks || 0) > 0;
      unit._wallArmed = false;
      unit.shieldTicks = 0;
      if (!broken) return; // timed out quietly -- no burst

      const dmg = Math.max(1, Math.round((unit.def * burstPctByLevel[abilityIdx(unit, "special")]) / 100));
      const { aliveE, boss, newFx, now } = ctx;
      for (const e of aliveE) {
        if (aChebDist(unit.row, unit.col, e.row, e.col) > BURST_RANGE) continue;
        damageUnit(e, dmg);
        ctx.addDamageDealt(dmg);
        applyChill(unit, e);
        newFx.push({ id: now + "bw" + unit.uid + e.uid, row: e.row, col: e.col, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
      if (boss && boss.hp > 0 && distToBoss(boss, unit.row, unit.col) <= BURST_RANGE) {
        damageBoss(boss, dmg);
        ctx.addDamageDealt(dmg);
        newFx.push({ id: now + "bwb" + unit.uid, row: boss.row + 0.5, col: boss.col + 0.5, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  shieldPctByLevel: SHIELD_PCT_BY_LEVEL,
  burstPctByLevel: BURST_PCT_BY_LEVEL,
  slowPctByLevel: SLOW_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const morusk = makeMoruskModule(CFG);
export const ivormar = makeMoruskModule(CFG);
