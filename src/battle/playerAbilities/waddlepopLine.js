// Waddlepop line: Ice Lob / Cryo Bomb / Snowball Effect.
//
// Ice Lob keeps the engine's default ranged attack flow (closest enemy) with
// per-level damage scaling; at max level every landed hit inflicts a Speed
// Down stack.
//
// Cryo Bomb lobs at the closest enemy in range and SPLASHES: the target's
// tile plus every surrounding tile (Splash includes the center). Enemies hit
// take the bomb's damage and a Speed Down stack (a Frostbite stack too at
// max level -- Water creatures deal +5%/stack to the carrier, see
// battle/status.js). The blast leaves ice-spike Hazards on all 9 cells:
// a foe that MOVES while standing on one takes damage (battle/tick.js
// processes state.iceHazards; teleports don't trigger them).
//
// Snowball Effect makes each Cryo Bomb hit harder than the last: +2..10%
// damage per USE, ramping up to +100%. The ramp counts casts, applies from
// the second cast on, and resets each battle (fresh units).

import { abilityRoll } from "../damage.js";
import { unitDist, occupiesAny } from "../geometry.js";
import { RANGED_RANGE, STATUS_TICKS, BASIC_DMG_BASELINE } from "../constants.js";
import { isIntangible, applyStatMod, applyFrostbite } from "../status.js";
import { damageUnit } from "../hp.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { hasRule, isBoss } from "../classifications.js";

/** Displayed damage by level; the engine deals stat-based damage scaled by the
 * current level's value over BASIC_DMG_BASELINE (see battle/constants.js). */
const BASIC_DMG_BY_LEVEL = [12, 14, 16, 18, 18];
const SPECIAL_DMG_BY_LEVEL = [24, 28, 32, 37, 37];
/** Snowball Effect: +damage% added to Cryo Bomb per use, by unique level. */
const SNOWBALL_PCT_BY_LEVEL = [2, 4, 6, 8, 10];
const SNOWBALL_MAX_PCT = 100;
/** Ice Lob lvl 5 / Cryo Bomb: Speed Down per stack (standard 5%/stack table). */
const SPEED_DOWN_PCT = 5;
/** Hazard: damage dealt when a foe moves off an ice-spiked cell, as a
 * fraction of the caster's ATK at cast time. */
const HAZARD_ATK_RATE = 0.25;
/** Ice spikes linger for the standard effect duration. */
const HAZARD_TICKS = STATUS_TICKS;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

export function makeWaddlepopModule(cfg) {
  const { basicDmgByLevel, specialDmgByLevel, snowballPctByLevel } = cfg;
  return {
    /** Ice Lob: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / BASIC_DMG_BASELINE;
    },

    /** Ice Lob lvl 5: every landed hit chills -- one Speed Down stack. */
    onHit(unit, target) {
      if (target && !hasRule(target, "ignoresOnHitEffects") && abilityIdx(unit, "basic") >= MAX_IDX) {
        applyStatMod(target, { kind: "spd", pct: -SPEED_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
      }
      return 0;
    },

    /**
     * Cryo Bomb: lob at the closest foe in ranged reach and splash the 3x3
     * around it. Uses the default in-range gate (an enemy or the boss within
     * ranged reach opens it).
     */
    special(unit, ctx) {
      const { aliveE, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const snow = 1 + Math.min(SNOWBALL_MAX_PCT, (unit._snowballPct || 0)) / 100;
      const mult = (specialDmgByLevel[idx] / BASIC_DMG_BASELINE) * snow;
      const frostbites = idx >= MAX_IDX;

      // Closest targetable foe in reach -- minions first, a boss only when no
      // minion is -- is the splash's centre (a boss's top-left body cell).
      let best = null, bestD = Infinity, bossBest = null, bossD = Infinity;
      for (const e of aliveE) {
        if (isIntangible(e)) continue;
        const d = unitDist(unit, e);
        if (d > RANGED_RANGE) continue;
        if (isBoss(e)) { if (d < bossD) { bossD = d; bossBest = e; } }
        else if (d < bestD) { bestD = d; best = e; }
      }
      const centre = best || bossBest;
      if (!centre) return;

      const cr = centre.row, cc = centre.col;
      const cells = [];
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) cells.push(cr + dr + "," + (cc + dc));
      const cellSet = new Set(cells);

      // Damage every enemy whose body is inside the splash (centre included);
      // chill each one hit, frostbite them at max level.
      for (const e of aliveE) {
        if (isIntangible(e) || !occupiesAny(e, cellSet)) continue;
        const dmg = Math.max(1, Math.round(abilityRoll(unit, e) * mult));
        const dealt = damageUnit(e, dmg);
        if (dealt) ctx.addDamageDealt(dealt);
        if (!hasRule(e, "ignoresOnHitEffects")) {
          applyStatMod(e, { kind: "spd", pct: -SPEED_DOWN_PCT, src: unit.uid, ticks: STATUS_TICKS });
          if (frostbites) applyFrostbite(e);
        }
        const mid = ((e.size || 1) - 1) / 2;
        newFx.push({ id: now + "cb" + unit.uid + e.uid, row: e.row + mid, col: e.col + mid, t: now, isRanged: false, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }

      // Ice spikes on all splash cells, then the snowball ramps for next time.
      ctx.addHazard(cells, HAZARD_TICKS, Math.max(1, Math.round(unit.atk * HAZARD_ATK_RATE)), "water");
      newFx.push({ id: now + "cbc" + unit.uid, row: cr, col: cc, t: now, isRanged: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      unit._snowballPct = Math.min(SNOWBALL_MAX_PCT, (unit._snowballPct || 0) + snowballPctByLevel[abilityIdx(unit, "unique")]);
    },
  };
}

const CFG = {
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialDmgByLevel: SPECIAL_DMG_BY_LEVEL,
  snowballPctByLevel: SNOWBALL_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const waddlepop = makeWaddlepopModule(CFG);
export const frostillery = makeWaddlepopModule(CFG);
export const bombardguin = makeWaddlepopModule(CFG);
export const cryogeddon = makeWaddlepopModule(CFG);
