// Equipment math.
//
// An item's identity is per-creature (`ownedData.equipped`, a 4-slot id array),
// but its level and ascension are GLOBAL, keyed by itemId in app state --
// upgrading an item upgrades it on every creature wearing it.

import { EQUIPMENT_MAP } from "../data/equipment.js";
import { STAT_LABELS } from "../data/rarity.js";

/** Gold cost to take an item from `level` to the next. */
export function equipUpgradeCost(level) {
  return Math.floor(100 * Math.pow(2, level));
}

/** Stat contribution of one item at a given level/ascension. */
export function equipBonus(itemId, level, asc = 0) {
  const e = EQUIPMENT_MAP[itemId];
  if (!e) return {};
  const mult = (1 + level + level * level * 0.0125) * (1 + asc * 0.15);
  return Object.fromEntries(
    Object.entries(e.stats).map(([stat, base]) => [stat, Math.round(base * mult)])
  );
}

/** Human-readable "+12 Health · +8 Attack" summary. */
export function equipBonusStr(bonuses) {
  return Object.entries(bonuses)
    .map(([s, v]) => "+" + v + " " + STAT_LABELS[s])
    .join(" · ");
}

/**
 * Total stat contribution of everything a creature has equipped.
 * Shared by the detail UI and the battle stat pipeline so the two cannot drift.
 */
export function totalEquipBonus(ownedData, equipmentLevels, equipmentAscensions) {
  const totals = { hp: 0, atk: 0, def: 0, spd: 0, abilitySpeed: 0 };
  for (const itemId of ownedData?.equipped || []) {
    if (!itemId) continue;
    const bonus = equipBonus(
      itemId,
      equipmentLevels?.[itemId] || 1,
      equipmentAscensions?.[itemId] || 0
    );
    for (const stat in bonus) totals[stat] = (totals[stat] || 0) + bonus[stat];
  }
  return totals;
}
