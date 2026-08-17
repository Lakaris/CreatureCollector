// Bloomibis line: Antler Dart / Soothing Hoot / Guardian Grove family.
//
// Antler Dart keeps the engine's default single-target attack flow (nearest
// enemy, boss priority) -- it only scales the damage by ability level, and at
// max level every landed hit grants a stacking +5% ATK buff that lasts until
// the next Soothing Hoot cast.
//
// Soothing Hoot heals the 3 allies with the lowest current HP (the "Weakest"
// tag), anywhere on the grid; at max level it also cleanses every debuff from
// the allies it heals. Casting it consumes Antler Dart's ATK stacks.
//
// Guardian Grove is a passive aura: allies inside the 3x3 around Bloomibis are
// continuously healed (rate is written as HP/s in the ability text; a battle
// tick is 500ms, so the full rate lands every second tick). At max level the
// aura also grants those allies a +10% ATK buff while they stay in range.

import { aChebDist } from "../geometry.js";

/** Displayed per-hit damage by basic-ability level; the engine deals stat-based
 * damage scaled by the ratio of the current level's value to the base value. */
const BASIC_DMG_BY_LEVEL = [16, 18, 20, 23, 23];
/** +ATK% per Antler Dart hit at max basic level, uncapped, until the next special. */
const ANTLER_ATK_PCT_PER_STACK = 5;

const SPECIAL_HEAL_BY_LEVEL = [38, 48, 60, 75, 75];
const SPECIAL_TARGETS = 3;

/** Aura heal rate in HP per second (the ability text's unit), by unique level. */
const AURA_HEAL_PER_SEC_BY_LEVEL = [6, 8, 10, 13, 13];
/** Chebyshev radius 1 = the 3x3 block around the unit. */
const AURA_RANGE = 1;
const AURA_ATK_PCT = 10;
/** Refreshed every tick while in range, so 2 ticks ~= "until you step out". */
const AURA_ATK_TICKS = 2;

/** Levels are 0-based and cap at the table's last entry (level 5 == index 4). */
const MAX_IDX = 4;

function abilityIdx(unit, key) {
  const lvl = (unit.abilityLevels && unit.abilityLevels[key]) || 0;
  return Math.min(lvl, MAX_IDX);
}

/** Every player-side debuff the engine currently has (see battle/status.js). */
function hasDebuff(u) {
  return (
    (u.burnTicks || 0) > 0 || (u.poisonTicks || 0) > 0 || (u.rootTicks || 0) > 0 ||
    (u.dotTicks || 0) > 0 || (u.weakTicks || 0) > 0 || (u.healImmuneTicks || 0) > 0 ||
    (u.slowTicks || 0) > 0 || (u.shockTicks || 0) > 0 || (u.defShredTicks || 0) > 0 ||
    (u.tauntTicks || 0) > 0 ||
    ((u.atkModTicks || 0) > 0 && (u.atkModPct || 0) < 0)
  );
}

function clearDebuffs(u) {
  u.burnTicks = 0;
  u.burnStacks = 0;
  u.burnSourceAtk = 0;
  u.poisonTicks = 0;
  u.rootTicks = 0;
  u.dotTicks = 0;
  u.weakTicks = 0;
  u.healImmuneTicks = 0;
  u.slowTicks = 0;
  u.shockTicks = 0;
  u.defShredTicks = 0;
  u.defShredStacks = 0;
  u.tauntTicks = 0;
  u.tauntSourceUid = null;
  if ((u.atkModPct || 0) < 0) { u.atkModPct = 0; u.atkModTicks = 0; }
}

/** The dark boss's heal-block gates every heal this module does. */
function canBeHealed(u) {
  return (u.healImmuneTicks || 0) <= 0;
}

export function makeBloomibisModule(cfg) {
  const { basicDmgByLevel, specialHealByLevel, auraHealPerSecByLevel } = cfg;
  return {
    onBattleStart(unit) {
      // Antler Dart's stacks multiply this snapshot rather than compounding on
      // the live value, so resetting on special cast is exact.
      unit._antlerBaseAtk = unit.atk;
      unit._antlerStacks = 0;
    },

    /** Antler Dart: level scaling relative to the base level's damage. */
    dmgMultForAttack(unit) {
      const idx = abilityIdx(unit, "basic");
      return basicDmgByLevel[idx] / basicDmgByLevel[0];
    },

    /** Antler Dart lvl 5: every landed hit stacks +5% ATK until the next Soothing Hoot. */
    onHit(unit) {
      if (abilityIdx(unit, "basic") >= MAX_IDX) {
        unit._antlerStacks = (unit._antlerStacks || 0) + 1;
        unit.atk = Math.round((unit._antlerBaseAtk ?? unit.atk) * (1 + (unit._antlerStacks * ANTLER_ATK_PCT_PER_STACK) / 100));
      }
      return 0;
    },

    /** Guardian Grove: runs every tick, cooldowns and range be damned -- it's a passive. */
    onTick(unit, ctx) {
      const idx = abilityIdx(unit, "unique");
      const healPerSec = auraHealPerSecByLevel[idx];
      // A battle tick is 500ms; healing the full HP/s rate on alternating
      // ticks keeps HP integral while matching the displayed rate exactly.
      unit._groveGate = !unit._groveGate;
      for (const a of ctx.aliveP) {
        if (aChebDist(unit.row, unit.col, a.row, a.col) > AURA_RANGE) continue;
        if (unit._groveGate && a.hp < a.maxHp && canBeHealed(a)) {
          a.hp = Math.min(a.maxHp, a.hp + healPerSec);
        }
        if (idx >= MAX_IDX) {
          // Reuses the shared atkMod slot: refresh our own buff and upgrade
          // weaker ones, but never touch an active debuff or a stronger buff
          // (e.g. Starlit's Radiant Exchange at +15%).
          const pct = a.atkModPct || 0;
          if ((a.atkModTicks || 0) <= 0 || (pct > 0 && pct <= AURA_ATK_PCT)) {
            a.atkModPct = AURA_ATK_PCT;
            a.atkModTicks = AURA_ATK_TICKS;
          }
        }
      }
    },

    /**
     * Soothing Hoot has no range -- it reaches the whole party -- so instead of
     * the default in-attack-range hold it holds until the cast would actually
     * do something: an ally is missing HP (and can be healed), or, at max
     * level, an ally is carrying a debuff worth cleansing.
     */
    specialInRange(unit, { aliveP }) {
      const cleanses = abilityIdx(unit, "special") >= MAX_IDX;
      return aliveP.some((a) => (a.hp < a.maxHp && canBeHealed(a)) || (cleanses && hasDebuff(a)));
    },

    /** Soothing Hoot: heal the 3 allies with the lowest current HP; cleanse them at max level. */
    special(unit, ctx) {
      const { aliveP, newFx, now } = ctx;
      const idx = abilityIdx(unit, "special");
      const heal = specialHealByLevel[idx];
      const cleanses = idx >= MAX_IDX;

      const targets = [...aliveP].sort((a, z) => a.hp - z.hp).slice(0, SPECIAL_TARGETS);
      for (const a of targets) {
        if (cleanses) clearDebuffs(a);
        if (canBeHealed(a)) a.hp = Math.min(a.maxHp, a.hp + heal);
        newFx.push({ id: now + "hoot" + unit.uid + a.uid, row: a.row, col: a.col, t: now, isHeal: true, fromRow: unit.row, fromCol: unit.col, isEnemy: !!ctx.isEnemySide });
      }

      // "until the next time the Special is used" -- the cast itself ends the buff.
      unit._antlerStacks = 0;
      if (unit._antlerBaseAtk != null) unit.atk = unit._antlerBaseAtk;
    },
  };
}

export const bloomphoenix = makeBloomibisModule({
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialHealByLevel: SPECIAL_HEAL_BY_LEVEL,
  auraHealPerSecByLevel: AURA_HEAL_PER_SEC_BY_LEVEL,
});
// Animavis intentionally mirrors Bloomibis exactly for now -- same names, text,
// and numbers (see data/creatures.js); only base stats differ.
export const lifephoenix = makeBloomibisModule({
  basicDmgByLevel: BASIC_DMG_BY_LEVEL,
  specialHealByLevel: SPECIAL_HEAL_BY_LEVEL,
  auraHealPerSecByLevel: AURA_HEAL_PER_SEC_BY_LEVEL,
});
