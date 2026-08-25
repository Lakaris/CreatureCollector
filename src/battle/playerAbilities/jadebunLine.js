// Jadebun line: Herb Poultice / Silver Draught / Pestle Tempo.
//
// Herb Poultice is the game's first HEALING basic: it targets the WEAKEST
// hurt ally (lowest current Health, itself included), walking toward them
// when they're out of ranged reach -- a healer that follows friends, not
// foes. When nobody is hurt it holds position. Heals are absolute per-level
// values, like Bloomibis's, and respect Heal Block and Healing Down.
//
// Silver Draught heals the weakest ally anywhere on the grid, then checks
// their Health AFTER the heal: above 50% grants an Attack Up stack, at or
// below grants Immortal (Health can not be reduced below 1 -- clamped in
// hp.js's damageUnit, so it beats every damage source). At max level the
// draught also shields the ally for the heal amount (kept if they already
// carry a bigger shield).
//
// Pestle Tempo: while any OTHER ally within Jadebun's ranged reach is below
// half Health, Jadebun pounds faster -- +2..10% Speed and Haste applied as
// DIRECT stat adjustments (deliberately not Speed Up/Haste Up stacks: no
// buff icons, no dispel interaction, per the ability's design note).

import { attackCooldown } from "../damage.js";
import { aChebDist } from "../geometry.js";
import { RANGED_RANGE, STATUS_TICKS } from "../constants.js";
import { speedPenalty, isStunned, applyStatMod, healReceivedMultiplier } from "../status.js";

/** Absolute heal per basic level (the ability text's HEAL badge values). */
const BASIC_HEAL_BY_LEVEL = [10, 12, 14, 17, 20];
const SPECIAL_HEAL_BY_LEVEL = [24, 29, 35, 42, 42];
/** Silver Draught's post-heal branch: Attack Up above this Health fraction, Immortal at or below. */
const DRAUGHT_HP_FRAC = 0.5;
/** Immortal runs HALF the standard status duration (3 ticks, 1.5s at 1x):
 * unkillability is binary power, so it stays a clutch save, not uptime. */
const IMMORTAL_TICKS = 3;
/** Attack Up per stack (standard first-stack value). */
const ATK_UP_PCT = 15;
/** Pestle Tempo: direct +% Speed and Haste while a nearby ally is hurt, by unique level. */
const TEMPO_PCT_BY_LEVEL = [2, 4, 6, 8, 10];
/** Pestle Tempo triggers on allies below this fraction of max Health. */
const TEMPO_HP_FRAC = 0.5;

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

function healFor(target, amount) {
  return Math.max(1, Math.round(amount * healReceivedMultiplier(target)));
}

export function makeJadebunModule(cfg) {
  const { basicHealByLevel, specialHealByLevel, tempoPctByLevel } = cfg;
  return {
    /**
     * Herb Poultice: heal the weakest hurt ally in ranged reach, or walk
     * toward them. Owns targeting and movement like other basicAttack
     * overrides -- Jadebun never attacks.
     */
    basicAttack(unit, ctx) {
      const { aliveP, newFx, now } = ctx;
      const hurt = aliveP.filter((a) => a.hp > 0 && a.hp < a.maxHp && canBeHealed(a));
      if (!hurt.length) return; // nobody to tend: hold position
      hurt.sort((a, z) => a.hp - z.hp);
      const tgt = hurt[0];
      const d = aChebDist(unit.row, unit.col, tgt.row, tgt.col);
      if (d > RANGED_RANGE) { ctx.stepToward(tgt.row, tgt.col); return; }
      if (unit.atkCd > 0 || isStunned(unit)) return;

      const heal = basicHealByLevel[abilityIdx(unit, "basic")];
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + healFor(tgt, heal));
      unit.atkCd = attackCooldown(unit, speedPenalty(unit));
      newFx.push({ id: now + "hp" + unit.uid, row: tgt.row, col: tgt.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },

    /**
     * Silver Draught: heal the weakest ally anywhere (uses the default
     * Support in-range gate, so it fires once the team is engaged), then
     * branch on their POST-heal Health.
     */
    special(unit, ctx) {
      const { aliveP, newFx, now } = ctx;
      const alive = aliveP.filter((a) => a.hp > 0);
      if (!alive.length) return;
      const idx = abilityIdx(unit, "special");
      const heal = specialHealByLevel[idx];
      const tgt = [...alive].sort((a, z) => a.hp - z.hp)[0];

      if (canBeHealed(tgt)) tgt.hp = Math.min(tgt.maxHp, tgt.hp + healFor(tgt, heal));
      if (tgt.hp > tgt.maxHp * DRAUGHT_HP_FRAC) {
        applyStatMod(tgt, { kind: "atk", pct: ATK_UP_PCT, src: unit.uid, ticks: STATUS_TICKS });
      } else {
        tgt.immortalTicks = IMMORTAL_TICKS;
      }
      if (idx >= MAX_IDX) {
        // Shield for the heal amount; never stomp a bigger shield the ally
        // already carries (this is the game's first ally-granted shield).
        tgt.shield = Math.max(tgt.shield || 0, heal);
        tgt.shieldTicks = STATUS_TICKS;
      }
      newFx.push({ id: now + "sd" + unit.uid, row: tgt.row, col: tgt.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
    },

    /** Pestle Tempo: pound faster while a nearby ally is in trouble. */
    onTick(unit, ctx) {
      const pct = tempoPctByLevel[abilityIdx(unit, "unique")];
      const active = ctx.aliveP.some(
        (a) => a !== unit && a.hp > 0 && a.hp < a.maxHp * TEMPO_HP_FRAC &&
          aChebDist(unit.row, unit.col, a.row, a.col) <= RANGED_RANGE
      );
      // Direct stat adjustment, applied/removed as a tracked factor so
      // repeated ticks never compound and external stat writes stay intact.
      const f = 1 + pct / 100;
      if (active && !unit._tempoOn) {
        unit.spd *= f;
        unit.abilitySpeed *= f;
        unit._tempoOn = f;
      } else if (!active && unit._tempoOn) {
        unit.spd /= unit._tempoOn;
        unit.abilitySpeed /= unit._tempoOn;
        unit._tempoOn = 0;
      }
    },
  };
}

const CFG = {
  basicHealByLevel: BASIC_HEAL_BY_LEVEL,
  specialHealByLevel: SPECIAL_HEAL_BY_LEVEL,
  tempoPctByLevel: TEMPO_PCT_BY_LEVEL,
};
// The whole line intentionally shares one kit -- same names, text, and
// numbers (see data/creatures.js); only base stats differ per stage.
export const glowpup = makeJadebunModule(CFG);
export const radiantkit = makeJadebunModule(CFG);
export const dawnbeast = makeJadebunModule(CFG);
export const solarcrown = makeJadebunModule(CFG);
