// Every random pull in the game: creature gacha, skins, flair, treasure,
// dungeon rewards, and the daily-mission draw. All of them now share the
// weightedPick / randomOf primitives instead of hand-rolling cumulative loops.

import { weightedPick, randomOf, shuffle } from "./random.js";
import { getSkinsForCreature } from "./creatures.js";
import { CREATURES, CREATURE_MAP } from "../data/creatures.js";
import { RARITY_CONFIG, SKIN_TIER_CONFIG } from "../data/rarity.js";
import { EQUIPMENT_DEFS } from "../data/equipment.js";
import { TREASURE_RARITIES, TREASURES } from "../data/treasures.js";
import {
  FLAIR_TITLES,
  FLAIR_AURAS,
  FLAIR_BACKGROUNDS,
  FLAIR_ITEMS,
  FLAIR_SHARD_VALUES,
} from "../data/flair.js";
import { DAILY_POOL } from "../data/quests.js";

/** Base-form creatures of a given rarity (gacha never awards evolved forms). */
function basePoolOfRarity(rarity, excludeId) {
  return CREATURES.filter(
    (c) => c.rarity === rarity && !c.evolutionOf && c.id !== excludeId
  );
}

const FALLBACK_CREATURE = () =>
  CREATURES.find((c) => c.rarity === "common" && !c.evolutionOf);

/** Roll one creature from a banner, or from the global rarity table when it has none. */
export function rollGacha(banner) {
  if (!banner || !banner.rates) {
    const rarity = weightedPick(
      Object.entries(RARITY_CONFIG).map(([r, cfg]) => [r, cfg.rate]),
      { total: 100 }
    );
    if (!rarity) return FALLBACK_CREATURE();
    return randomOf(basePoolOfRarity(rarity)) || FALLBACK_CREATURE();
  }

  const entry = weightedPick(
    banner.rates.map((e) => [e, e.rate]),
    { total: 100 }
  );
  if (!entry) return FALLBACK_CREATURE();

  if (entry.type === "creature") return CREATURE_MAP[entry.id];
  if (entry.type === "rarity") {
    return randomOf(basePoolOfRarity(entry.rarity)) || FALLBACK_CREATURE();
  }
  if (entry.type === "rarity_excl") {
    const pool = basePoolOfRarity(entry.rarity, entry.exclude);
    if (!pool.length) return CREATURE_MAP[entry.exclude];
    return randomOf(pool);
  }
  return FALLBACK_CREATURE();
}

/**
 * Roll a skin for a creature, or null on a miss.
 * SKIN_TIER_CONFIG rates deliberately sum to less than 100 -- the shortfall is
 * the failure chance, which is why this rolls against a fixed total of 100.
 */
export function rollSkinForCreature(creatureId) {
  const availableSkins = getSkinsForCreature(creatureId);
  if (!availableSkins.length) return null;
  const tier = weightedPick(
    Object.entries(SKIN_TIER_CONFIG).map(([t, cfg]) => [t, cfg.rate]),
    { total: 100 }
  );
  if (!tier) return null; // failed roll
  const pool = availableSkins.filter((s) => s.tier === tier);
  return randomOf(pool.length ? pool : availableSkins);
}

/** Pick a flair rarity from a banana's weight table. */
export function rollFlairRarity(weights) {
  const entries = Object.entries(weights);
  return weightedPick(entries, { total: 100 }) ?? entries.at(-1)[0];
}

/** Roll a treasure. `oreType` widens or restricts the eligible rarity pool. */
export function rollTreasure(collected, oreType = "normal") {
  const rarityEntries = Object.entries(TREASURE_RARITIES);
  const eligible =
    oreType === "deluxe"
      ? rarityEntries.filter(([r]) => r !== "common")
      : rarityEntries;

  if (oreType === "rainbow") {
    // Rainbow ore only yields items you don't already have, re-weighted over
    // whichever rarities still have something uncollected.
    const availByRarity = {};
    for (const [r] of eligible) {
      const unc = TREASURES.filter((t) => t.rarity === r && !collected.has(t.id));
      if (unc.length) availByRarity[r] = unc;
    }
    const avail = Object.keys(availByRarity);
    if (!avail.length) return null; // everything collected
    const rarity =
      weightedPick(avail.map((r) => [r, TREASURE_RARITIES[r].rate])) || avail[0];
    return randomOf(availByRarity[rarity]);
  }

  const rarity =
    weightedPick(eligible.map(([r, cfg] ) => [r, cfg.rate])) || eligible[0][0];
  const pool = TREASURES.filter((t) => t.rarity === rarity);
  const uncollected = pool.filter((t) => !collected.has(t.id));
  return randomOf(uncollected.length ? uncollected : pool);
}

/** Roll `count` equipment drops, weighted toward higher rarity as boss level rises. */
export function rollDungeonRewards(count, bossType, bossLevel = 10) {
  const t = (bossLevel - 1) / 9;
  const weights = [
    ["common", 84 - 24 * t],
    ["rare", 5 + 20 * t],
    ["epic", 0.5 + 4 * t],
    ["legendary", 0.05 + 0.45 * t],
  ];
  const pool = EQUIPMENT_DEFS.filter(
    (item) => !item.element || item.element === bossType
  );
  const byRarity = {};
  for (const item of pool) {
    (byRarity[item.rarity] ||= []).push(item);
  }
  const results = [];
  for (let i = 0; i < count; i++) {
    const rarity = weightedPick(weights) || "common";
    const rarPool = byRarity[rarity] || byRarity.common || pool;
    results.push(randomOf(rarPool));
  }
  return results;
}

/**
 * The login mission plus four random others. `unlocked` excludes missions
 * for features the player hasn't reached yet (e.g. dungeon pass / plot
 * missions before those systems unlock), so they can never be drawn.
 */
export function pickDailyMissions(unlocked = {}) {
  const pool = DAILY_POOL.filter((m) => {
    if (m.id === "dm_dung1" && !unlocked.dungeon) return false;
    if (m.id === "dm_farm" && !unlocked.plots) return false;
    if (m.id === "dm_boss" && !unlocked.boss) return false;
    if (m.id === "dm_arena" && !unlocked.arena) return false;
    return true;
  });
  return ["dm_login", ...shuffle(pool).slice(0, 4).map((m) => m.id)];
}

/**
 * Spend a flair banana. Rolls a rarity, then a category, preferring something
 * not yet unlocked; falls back to other categories, then to shards on a full dupe.
 *
 * Stateful by design -- it drives setOwned/setCurrencies directly, matching how
 * the flair UI consumes it. Pass `free: true` for the day's first feed, which
 * skips the inventory deduction (the roll and rewards are unaffected).
 */
export function feedFlair(banana, ownedData, setOwned, setCurrencies, free = false) {
  const categories = ["titles", "aura", "background", "item"];
  const pools = {
    titles: FLAIR_TITLES,
    aura: FLAIR_AURAS,
    background: FLAIR_BACKGROUNDS,
    item: FLAIR_ITEMS,
  };
  const emojiFor = {
    titles: "📛",
    aura: "✨",
    background: "🖼️",
    item: "🌿",
  };
  const getKey = (cat, entry) => (cat === "titles" ? entry.name : entry.id);
  const unlocked = new Set(ownedData.unlockedFlair || []);
  const rarity = rollFlairRarity(banana.weights);
  const cat = randomOf(categories);

  const spendBanana = (extra) =>
    setCurrencies((c) => ({
      ...c,
      [banana.id]: free ? (c[banana.id] || 0) : Math.max(0, (c[banana.id] || 0) - 1),
      ...(extra ? extra(c) : {}),
    }));
  const grant = (category, won) => {
    setOwned((prev) => {
      const e = { ...prev[ownedData.id] };
      e.unlockedFlair = [...(e.unlockedFlair || []), getKey(category, won)];
      return { ...prev, [e.id]: e };
    });
  };

  const freshIn = (category) =>
    (pools[category][rarity] || []).filter((e) => !unlocked.has(getKey(category, e)));

  const pool = freshIn(cat);
  if (pool.length) {
    const won = randomOf(pool);
    spendBanana();
    grant(cat, won);
    return { rarity, cat, won, emoji: emojiFor[cat] };
  }

  for (const altCat of shuffle(categories.filter((c) => c !== cat))) {
    const altPool = freshIn(altCat);
    if (altPool.length) {
      const won = randomOf(altPool);
      spendBanana();
      grant(altCat, won);
      return { rarity, cat: altCat, won, emoji: emojiFor[altCat] };
    }
  }

  // Everything at this rarity is already unlocked: convert to shards.
  const allItems = Object.values(pools).flatMap((p) => p[rarity] || []);
  const dupeItem = randomOf(allItems) || null;
  spendBanana((c) => ({ flairShard: (c.flairShard || 0) + FLAIR_SHARD_VALUES[rarity] }));
  return { rarity, cat, won: null, dupeItem, shards: FLAIR_SHARD_VALUES[rarity] };
}
