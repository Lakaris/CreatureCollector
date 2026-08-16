// Equipment math.
//
// An item's identity is per-creature (`ownedData.equipped`, a 4-slot id array),
// but its level and ascension are GLOBAL, keyed by itemId in app state --
// upgrading an item upgrades it on every creature wearing it.

import { EQUIPMENT_MAP, EQUIP_MAX_LEVEL, EQUIP_MAX_LEVEL_BY_RARITY } from "../data/equipment.js";
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

/** Level cap for an item -- lower rarities cap earlier (see
 * EQUIP_MAX_LEVEL_BY_RARITY's rationale in data/equipment.js). */
export function equipMaxLevel(itemId) {
  const e = EQUIPMENT_MAP[itemId];
  return (e && EQUIP_MAX_LEVEL_BY_RARITY[e.rarity]) || EQUIP_MAX_LEVEL;
}

/** Stat contribution of one item at a given level/ascension.
 * Per-level gain is gently exponential: level L adds ~G0 * 1.007^(L-1) per
 * stat, where G0 = max(2, round(base*0.115)) is the starting integer step
 * (min +2 for every item so even commons feel rewarding to upgrade; Crests
 * +3, Relics +4). Gains roughly double from level 1 to 100 (1.007^99 ~= 2),
 * so upgrades keep getting bigger -- commons ramp to +2/+3, Relics to +8.
 * Cheap items stepping as hard as legendaries is paid for by the per-rarity
 * LEVEL CAPS (equipMaxLevel: common 40 / rare 60 / epic 80 / legendary 100)
 * -- low rarities level generously but retire early, so endgame ordering
 * holds. `level` is clamped to the item's cap so over-cap legacy saves don't
 * out-stat the design. The closed-form geometric sum keeps the value
 * strictly increasing by at least 1 every level (no dead levels) and is
 * continuous in `level`, which the Labyrinth's fractional on-curve gear
 * model relies on.
 * Calibration: 17-base legendary reaches ~750/stat at its level 100 /
 * ascension 10 cap and a Relic ~1500, so a Relic still matches a maxed
 * two-stat legendary, and a full set of 4 maxed legendary items adds
 * ~25-30% of a maxed creature's own stats -- noticeable, not dominant.
 * NOTE: core/labyrinth.js's playerPowerAt models on-curve gear through this
 * same function -- difficulty recalibrates automatically if this changes. */
const EQUIP_LEVEL_GROWTH = 1.007;
export function equipBonus(itemId, level, asc = 0) {
  const e = EQUIPMENT_MAP[itemId];
  if (!e) return {};
  const lvl = Math.min(level, equipMaxLevel(itemId));
  const ascMult = 1 + asc * 0.15;
  const geo = (Math.pow(EQUIP_LEVEL_GROWTH, lvl - 1) - 1) / (EQUIP_LEVEL_GROWTH - 1);
  return Object.fromEntries(
    Object.entries(e.stats).map(([stat, base]) => [stat, Math.round((base + Math.max(2, Math.round(base * 0.115)) * geo) * ascMult)])
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
