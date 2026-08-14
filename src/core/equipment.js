// Equipment math.
//
// An item's identity is per-creature (`ownedData.equipped`, a 4-slot id array),
// but its level and ascension are GLOBAL, keyed by itemId in app state --
// upgrading an item upgrades it on every creature wearing it.

import { EQUIPMENT_MAP } from "../data/equipment.js";
import { STAT_LABELS } from "../data/rarity.js";

/** Gear Shard cost to take an item from `level` to the next.
 * Uses the same ^1.72 growth as the Field's shard-rate curve (data/farm.js),
 * which is calibrated so income at field level F funds ~2 upgrades per week
 * on an item at level ~F/5 (equipment 100 lands at endgame alongside
 * creature 500) -- doubling per level (the old curve) instead outran income
 * within a dozen levels and left a day's shards good for exactly one
 * upgrade, on any item, forever after. Matching exponents keeps the pace
 * constant, whether shards go into one item or are spread across several. */
export function equipUpgradeCost(level) {
  return Math.floor(25 * Math.pow(level, 1.72));
}

/** Stat contribution of one item at a given level/ascension.
 * Curve is calibrated against the creature stat pipeline: at full investment
 * (level 100, ascension 10) the multiplier is ~30x, so a maxed two-stat
 * legendary item gives ~1k total stats and a full set of 4 maxed items adds
 * ~20-25% of a maxed creature's own stats -- gear should be noticeable, never
 * bigger than the creature wearing it. (The old curve's dominant level^2 term
 * reached 565x, letting one item out-stat an entire maxed legendary.) */
export function equipBonus(itemId, level, asc = 0) {
  const e = EQUIPMENT_MAP[itemId];
  if (!e) return {};
  const mult = (1 + level * 0.09 + level * level * 0.0002) * (1 + asc * 0.15);
  return Object.fromEntries(
    Object.entries(e.stats).map(([stat, base]) => [stat, Math.round(base * mult)])
  );
}

/**
 * Whether an item touches a given stat -- either directly (flat `stats`) or
 * through an effect (no item has flat Speed/Haste stats, only effects that
 * grant them situationally, e.g. Cyclone Guard's "+10% SPD" or Jetstream
 * Band's "abilities recharge 40% faster"). Used by the stat filter so those
 * effect-only items are still findable under Speed/Haste.
 */
export function itemAffectsStat(item, stat) {
  if (stat === "spd") return !!item.speedEffect;
  if (stat === "abilitySpeed") return !!item.hasteEffect;
  return stat in item.stats;
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

/**
 * Equipped items whose passive effect is a flat "gain X% more STAT" buff
 * (e.g. Fury Relic's "Gain 25% more ATK"). Percentage, not flat, so the
 * gain is computed against the creature's base stat by the caller.
 */
export function equippedStatBonuses(ownedData) {
  const out = [];
  for (const itemId of ownedData?.equipped || []) {
    if (!itemId) continue;
    const e = EQUIPMENT_MAP[itemId];
    if (e?.statBonus) out.push({ itemId, name: e.name, emoji: e.emoji, ...e.statBonus });
  }
  return out;
}
