// Equipment math.
//
// An item's identity is per-creature (`ownedData.equipped`, a 4-slot id array),
// but its level and ascension are GLOBAL, keyed by itemId in app state --
// upgrading an item upgrades it on every creature wearing it.

import { EQUIPMENT_MAP, EQUIP_MAX_LEVEL, EQUIP_MAX_ASCENSION } from "../data/equipment.js";
import { formatStatBonus } from "../data/rarity.js";
import { CREATURE_MAP } from "../data/creatures.js";
import { TYPE_EMOJI, ROLE_CONFIG, ATTACK_TYPE_CONFIG } from "../data/types.js";

// ── Exclusivity ──────────────────────────────────────────────────────────
//
// An item restricts who may wear it by carrying the matching field: `element`
// (Fire only), `role` (Attacker only), `attackType` (Melee only), or
// `creatureId` (one named species only). Absent field = no restriction on that
// axis; an item with none is universal. Multiple axes on one item are ANDed,
// though nothing in the catalog currently uses more than one.
//
// Every axis is declared once, here, and every screen reads exclusivity
// through these helpers. The rule the checks encode was previously copied into
// roughly ten places -- the equip picker, the creature detail's gear list and
// its sort and its disabled state, both filter screens, the Dungeon drop
// preview, three "X exclusive" captions -- so adding this fourth axis by hand
// would have meant finding all ten and would have left the eleventh, whenever
// someone adds it, quietly wrong.

/**
 * The exclusivity axes, in the order they should read to a player.
 *
 * `field` is the item property; `of` pulls the creature's counterpart for
 * comparison; `label` renders the value for a caption; `emoji` and `noun` are
 * for the roomier chip the Dungeon drop preview shows ("🔥 Fire type exclusive").
 */
const EXCLUSIVITY_AXES = [
  { field: "element", of: (def) => def && def.type, label: (v) => v, emoji: (v) => TYPE_EMOJI[v] || "", noun: "type" },
  { field: "role", of: (def) => def && def.role, label: (v) => v, emoji: (v) => (ROLE_CONFIG[v] && ROLE_CONFIG[v].emoji) || "", noun: "role" },
  { field: "attackType", of: (def) => def && def.attackType, label: (v) => v, emoji: (v) => (ATTACK_TYPE_CONFIG[v] && ATTACK_TYPE_CONFIG[v].emoji) || "", noun: "" },
  // Creature-exclusive gear names a species id; the caption shows its display
  // name, falling back to the raw id so a stale id is visible rather than blank.
  {
    field: "creatureId",
    of: (def) => def && def.id,
    label: (v) => (CREATURE_MAP[v] && CREATURE_MAP[v].name) || v,
    emoji: (v) => (CREATURE_MAP[v] && CREATURE_MAP[v].emoji) || "",
    noun: "",
  },
];

/** True when the item restricts who can equip it on any axis. */
export function isExclusive(item) {
  return !!item && EXCLUSIVITY_AXES.some((a) => item[a.field]);
}

/**
 * True when `def` (a creature definition) satisfies every restriction the item
 * carries. Universal items fit everyone; a missing def fits nothing exclusive.
 */
export function itemFitsCreature(item, def) {
  if (!item) return false;
  return EXCLUSIVITY_AXES.every((a) => !item[a.field] || a.of(def) === item[a.field]);
}

/**
 * The item's restrictions as display strings, e.g. ["Fire"] or ["Emberpup"].
 * Empty for universal gear.
 */
export function exclusivityLabels(item) {
  if (!item) return [];
  return EXCLUSIVITY_AXES.filter((a) => item[a.field]).map((a) => a.label(item[a.field]));
}

/** "Fire exclusive" / "Emberpup exclusive"; empty string for universal gear. */
export function exclusivityCaption(item) {
  const parts = exclusivityLabels(item);
  return parts.length ? parts.join(" · ") + " exclusive" : "";
}

/**
 * The compact badge for a gear card corner: "🔥 Fire", "🐶 Emberpup". Just the
 * restriction, no "exclusive" -- the card has no room for it. Empty string for
 * universal gear.
 */
export function exclusivityBadge(item) {
  if (!item) return "";
  const axis = EXCLUSIVITY_AXES.find((a) => item[a.field]);
  if (!axis) return "";
  const v = item[axis.field];
  return [axis.emoji(v), axis.label(v)].filter(Boolean).join(" ");
}

/**
 * The long form, with the axis's emoji and noun: "🔥 Fire type exclusive",
 * "⚔️ Attacker role exclusive", "🐶 Emberpup exclusive". Empty string for
 * universal gear.
 */
export function exclusivityChip(item) {
  if (!item) return "";
  const axis = EXCLUSIVITY_AXES.find((a) => item[a.field]);
  if (!axis) return "";
  const v = item[axis.field];
  return [axis.emoji(v), axis.label(v), axis.noun, "exclusive"].filter(Boolean).join(" ");
}

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
/**
 * Stats an item's `stats` entry declares as a CAP rather than a growth rate.
 *
 * Health, Attack and Defense are unbounded: a `hp:5` item is worth ~450 at max
 * level and ~1100 fully ascended, and that is fine for a three-digit stat. The
 * crit pair is not that kind of number -- Crit Chance sits at 4 and Crit Damage
 * at 30 on a creature, so the same growth would hand out 450 percentage points
 * of crit chance and end the game. So for these the declared number is the most
 * the item can ever give, and investment moves it TOWARDS that number instead
 * of past it.
 */
const CAPPED_EQUIP_STATS = new Set(["crit", "critDmg"]);

/**
 * What a capped stat is worth at a given level and ascension, as a fraction of
 * its cap.
 *
 * It rides the same curve every other stat does, normalised so that full
 * investment -- max level AND max ascension -- lands exactly on the cap. The
 * floor is what a brand-new copy is worth, so a level 1 item with crit on it
 * still does something; without it the curve starts at zero and the stat reads
 * as broken until several upgrades in.
 */
const CAPPED_MIN_FRACTION = 0.25;
function cappedStatFraction(lvl, asc) {
  const full = equipCurve(EQUIP_MAX_LEVEL) * (1 + EQUIP_MAX_ASCENSION * 0.15);
  const here = equipCurve(lvl) * (1 + asc * 0.15);
  const progress = full > 0 ? Math.min(1, here / full) : 0;
  return CAPPED_MIN_FRACTION + (1 - CAPPED_MIN_FRACTION) * progress;
}

export function equipBonus(itemId, level, asc = 0) {
  const e = EQUIPMENT_MAP[itemId];
  if (!e) return {};
  const lvl = Math.min(level, equipMaxLevel(itemId));
  const ascMult = 1 + asc * 0.15;
  const step = EQUIP_STEP_BY_RARITY[e.rarity] || 1;
  const curve = equipCurve(lvl);
  const capFrac = cappedStatFraction(lvl, asc);
  return Object.fromEntries(
    Object.entries(e.stats).map(([stat, base]) => [
      stat,
      CAPPED_EQUIP_STATS.has(stat)
        // Rounded to one decimal, not to a whole number: these caps are small
        // enough that whole-number steps would make early levels look static.
        ? Math.round(base * capFrac * 10) / 10
        : Math.round((base + step * curve) * ascMult),
    ])
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
    .map(([s, v]) => formatStatBonus(s, v))
    .join(" · ");
}

/**
 * Total stat contribution of everything a creature has equipped.
 * Shared by the detail UI and the battle stat pipeline so the two cannot drift.
 */
export function totalEquipBonus(ownedData, equipmentLevels, equipmentAscensions) {
  const totals = { hp: 0, atk: 0, def: 0, spd: 0, abilitySpeed: 0, crit: 0, critDmg: 0 };
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
 * Every battle effect a creature's equipped items grant, merged into one
 * `gear` object stamped on the battle unit (state.js) and read by the engine
 * as `unit.gear?.<key>`.
 *
 * Items declare their effects as `battle: { key: value }` in data/equipment.js
 * -- the full key list, and which engine file spends each, is documented
 * there. This merge needs no per-key code: numbers take the LARGEST value
 * across the worn items and booleans are true if any item sets them, so
 * stacking copies of one family never runs past its top rung. Adding a new
 * effect is a data key plus the one place in the engine that reads it.
 */
export function gearBattleBonus(itemIds) {
  const gear = {};
  for (const itemId of itemIds || []) {
    const battle = itemId && EQUIPMENT_MAP[itemId]?.battle;
    if (!battle) continue;
    for (const [key, value] of Object.entries(battle)) {
      gear[key] = typeof value === "boolean" ? gear[key] || value : Math.max(gear[key] || 0, value);
    }
  }
  return { gear };
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
