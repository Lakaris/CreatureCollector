// The single stat pipeline: base curve + equipment + flair.
//
// This exists because the game previously had two divergent paths -- the detail
// UI composed all three layers, while battles read raw `def.stats` and ignored
// equipment, ascensions, and flair entirely. Everything now routes through here.

import { calcStats } from "./creatures.js";
import { totalEquipBonus, equippedStatBonuses } from "./equipment.js";
import { STAT_CYCLE, STAT_DECIMALS } from "../data/rarity.js";
import {
  FLAIR_TITLE_MAP,
  FLAIR_AURA_MAP,
  FLAIR_BG_MAP,
  FLAIR_ITEM_MAP,
} from "../data/flair.js";

/**
 * Every flair buff a creature has earned.
 *
 * NOTE: this reads `unlockedFlair`, not the `equipped*` fields. All unlocked
 * flair contributes its buff passively; the equipped ones are only cosmetic.
 * Reading the cosmetic fields instead would badly undercount.
 */
export function getFlairBuffs(ownedData) {
  return (ownedData?.unlockedFlair || [])
    .map(
      (key) =>
        FLAIR_TITLE_MAP[key]?.buff ||
        FLAIR_AURA_MAP[key]?.buff ||
        FLAIR_BG_MAP[key]?.buff ||
        FLAIR_ITEM_MAP[key]?.buff
    )
    .filter(Boolean);
}

/**
 * Stats whose values are small fractions rather than counts: Speed and Haste
 * sit around 1, and the crit pair are single-digit percentages. A percentage
 * of one of these must NOT be rounded up to a whole number -- +5% of a Haste
 * of 1 is 0.05, and rounding it up to 1 would double the stat. HP/ATK/DEF
 * stay whole: they're discrete counts, and a percentage of a three-digit
 * stat loses nothing to rounding up.
 */
export const FRACTIONAL_STATS = new Set(["spd", "abilitySpeed", "crit", "critDmg"]);

/** Round a fractional stat's gain to the precision it is shown at (one
 * decimal unless STAT_DECIMALS asks for finer), so what the creature page
 * shows and what battle uses are the same number. */
export function roundFractional(stat, raw) {
  const f = Math.pow(10, STAT_DECIMALS[stat] ?? 1);
  return Math.round(raw * f) / f;
}

/**
 * POLICY: the one rule for a percent-of-base stat gain (equipment effects,
 * flair, ability bonuses) -- used by the battle pipeline below, the creature
 * page, and the test battle alike, so they can't disagree.
 */
export function statPctGain(stat, base, pct) {
  const raw = ((base || 0) * pct) / 100;
  return FRACTIONAL_STATS.has(stat) ? roundFractional(stat, raw) : Math.ceil(raw);
}

/** Every flair buff's raw contribution to a stat, summed BEFORE rounding once,
 * so a pile of small percentages (many 0.2% Speed flairs) isn't zeroed out by
 * rounding each source on its own. */
export function flairStatGain(stat, base, buffs) {
  const pct = buffs.filter((b) => b.stat === stat).reduce((acc, b) => acc + b.pct, 0);
  return pct ? statPctGain(stat, base, pct) : 0;
}

/**
 * Final stats for a creature: level/ascension curve, plus flat equipment
 * bonuses, plus percentage flair buffs and percentage equipment effects
 * (e.g. Fury Relic's "Gain 25% more ATK").
 *
 * Percentages apply to the PRE-equipment base, matching the detail UI.
 *
 * @returns {{hp:number, atk:number, def:number, spd:number, abilitySpeed:number}}
 */
export function computeCombatStats(
  def,
  ownedData,
  equipmentLevels,
  equipmentAscensions
) {
  const base = calcStats(def, ownedData);
  if (!ownedData) return base;

  const equip = totalEquipBonus(ownedData, equipmentLevels, equipmentAscensions);
  const buffs = getFlairBuffs(ownedData);
  const equipPct = equippedStatBonuses(ownedData);

  const out = {};
  for (const stat of STAT_CYCLE) {
    const flair = flairStatGain(stat, base[stat], buffs);
    const equipEffect = equipPct
      .filter((b) => b.stat === stat)
      .reduce((acc, b) => acc + statPctGain(stat, base[stat], b.pct), 0);
    out[stat] = base[stat] + (equip[stat] || 0) + flair + equipEffect;
  }
  return out;
}
