// Equipment math.
//
// An item's identity is per-creature (`ownedData.equipped`, a 4-slot id array),
// but its level and ascension are GLOBAL, keyed by itemId in app state --
// upgrading an item upgrades it on every creature wearing it.

import { EQUIPMENT_MAP, EQUIP_MAX_LEVEL } from "../data/equipment.js";
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

/** Level cap for an item: every rarity levels to the same cap (100). */
export function equipMaxLevel() {
  return EQUIP_MAX_LEVEL;
}

/** Stat contribution of one item at a given level/ascension.
 * Per-level gain follows an exponential RAMP: level L adds roughly
 *   S_r * (1 + K * (1 - e^-((L-1)/TAU)))
 * per stat, where S_r is the rarity step. Early upgrades are small (+1-2),
 * then gains accelerate hard across the first ~TAU levels (a level 10
 * upgrade is ~3x a level 1 upgrade) and plateau at (1+K) * S_r per level
 * (~+5 common, ~+7 legendary), so late levels stay the biggest without the
 * total running away. The "+1 at level 1" term is baked into the curve, so
 * every level is a strict upgrade -- no dead levels -- and the closed form
 * is continuous in `level`, which the Labyrinth's fractional on-curve gear
 * model relies on.
 *
 * Rarity separation is EQUIP_STEP_BY_RARITY: higher rarities climb faster
 * every level, so the gap widens with investment. Maxed per-stat on the
 * flat two-stat items: common ~452 < rare ~499 < epic ~570 < legendary
 * ~643 (each tier ~10-13% over the last). Big single-stat bases (Sigils 18,
 * Crests 25, Relics 35) ride the same rarity step with their base offset on
 * top -- a maxed Fury Relic ends ~660/stat, ~1650 at asc 10.
 * NOTE: core/labyrinth.js's playerPowerAt models on-curve gear through this
 * same function -- difficulty recalibrates automatically if this changes. */
const EQUIP_CURVE_K = 4;    // plateau gain is (1 + K) * rarity step per level
const EQUIP_CURVE_TAU = 12; // levels the ramp-up takes; bigger = slower ramp
const EQUIP_STEP_BY_RARITY = { common: 1, rare: 1.1, epic: 1.25, legendary: 1.4 };
/** Cumulative curve value at `lvl` (0 at level 1) -- the integral of the ramp above. */
function equipCurve(lvl) {
  const x = lvl - 1;
  return x + EQUIP_CURVE_K * (x + EQUIP_CURVE_TAU * (Math.exp(-x / EQUIP_CURVE_TAU) - 1));
}
export function equipBonus(itemId, level, asc = 0) {
  const e = EQUIPMENT_MAP[itemId];
  if (!e) return {};
  const lvl = Math.min(level, equipMaxLevel(itemId));
  const ascMult = 1 + asc * 0.15;
  const step = EQUIP_STEP_BY_RARITY[e.rarity] || 1;
  const curve = equipCurve(lvl);
  return Object.fromEntries(
    Object.entries(e.stats).map(([stat, base]) => [stat, Math.round((base + step * curve) * ascMult)])
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
