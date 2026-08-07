// The single stat pipeline: base curve + equipment + flair.
//
// This exists because the game previously had two divergent paths -- the detail
// UI composed all three layers, while battles read raw `def.stats` and ignored
// equipment, ascensions, and flair entirely. Everything now routes through here.

import { calcStats } from "./creatures.js";
import { totalEquipBonus, equippedStatBonuses } from "./equipment.js";
import { STAT_CYCLE } from "../data/rarity.js";
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
    const flair = buffs
      .filter((b) => b.stat === stat)
      .reduce((acc, b) => acc + Math.ceil(base[stat] * (b.pct / 100)), 0);
    const equipEffect = equipPct
      .filter((b) => b.stat === stat)
      .reduce((acc, b) => acc + Math.ceil(base[stat] * (b.pct / 100)), 0);
    out[stat] = base[stat] + (equip[stat] || 0) + flair + equipEffect;
  }
  return out;
}
