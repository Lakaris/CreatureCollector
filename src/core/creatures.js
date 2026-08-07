// Creature logic: evolution-chain traversal, owned-record creation, and the
// level/ascension stat curve.

import { CREATURE_MAP } from "../data/creatures.js";
import { SKIN_SETS } from "../data/skins.js";
import { RARITY_STAT_MULT, LEVEL_STAT_CYCLE } from "../data/rarity.js";

export const MAX_LEVEL = 500;
export const MAX_ASCENSION = 50;

/** Walk `evolutionOf` back to the base form of a chain. */
export function getRootDef(creatureId) {
  let def = CREATURE_MAP[creatureId];
  while (def && def.evolutionOf) def = CREATURE_MAP[def.evolutionOf];
  return def || CREATURE_MAP[creatureId];
}

/** Full ordered chain of ids, base form first. */
export function getChain(creatureId) {
  const root = getRootDef(creatureId);
  if (!root) return [creatureId];
  const chain = [root.id];
  let cur = root;
  while (cur.evolutionId) {
    chain.push(cur.evolutionId);
    cur = CREATURE_MAP[cur.evolutionId];
  }
  return chain;
}

/** Every skin set that applies to any form in this creature's chain. */
export function getSkinsForCreature(creatureId) {
  const chain = getChain(creatureId);
  return SKIN_SETS.filter((s) => s.chain.some((id) => chain.includes(id)));
}

/** Fresh save-state record for a newly-owned creature. */
export function makeOwnedCreature(def) {
  return {
    id: def.id,
    level: 1,
    ascensions: 0,
    shards: 0,
    abilityLevels: { basic: 0, special: 0, unique: 0 },
    nextStatIdx: 0,
    baseStats: { ...def.stats },
    currentStats: { ...def.stats },
    activeSkin: null,
    equipped: [null, null, null, null],
    equippedTitle: null,
    equippedAura: null,
    equippedBackground: null,
    equippedItem: null,
    unlockedFlair: [],
  };
}

/**
 * Base combat stats from level and ascension only.
 *
 * Each level past 1 bumps one stat, rotating through LEVEL_STAT_CYCLE
 * (HP/ATK/DEF only); ascensions then scale those same HP/ATK/DEF stats by 8%
 * each. Speed and Haste never grow from leveling or ascending -- they only
 * come from Equipment and Flairs, layered on top by computeCombatStats in
 * src/core/stats.js -- this function deliberately knows nothing about them.
 */
export function calcStats(def, ownedData) {
  const base = def.stats;
  const mult = RARITY_STAT_MULT[def.rarity];
  const asc = ownedData.ascensions;
  const lvl = ownedData.level;
  const s = { ...base };
  for (let i = 0; i < lvl - 1; i++) {
    const k = LEVEL_STAT_CYCLE[i % LEVEL_STAT_CYCLE.length];
    s[k] = (s[k] || 0) + Math.round(base[k] * 0.05 * mult);
  }
  for (const k of LEVEL_STAT_CYCLE) s[k] = Math.round(s[k] * (1 + asc * 0.08));
  return s;
}

/** Resolve the emoji to show, honoring an equipped-and-unlocked skin. */
export function getDisplayEmoji(def, ownedData, unlockedSkins) {
  if (!ownedData || !ownedData.activeSkin) return def.emoji;
  const { setId, variantId } = ownedData.activeSkin;
  if (!unlockedSkins.includes(setId)) return def.emoji;
  const skinSet = SKIN_SETS.find((s) => s.id === setId);
  if (!skinSet) return def.emoji;
  const vid = variantId || def.id;
  return (skinSet.appearances[vid] && skinSet.appearances[vid].emoji) || def.emoji;
}

/** Food cost to level a creature up from `lvl`. Paired with the Main Field's
 * food-rate curve in data/farm.js -- see that file's header comment for how
 * the two are calibrated together against Labyrinth's level breakpoints. */
export function energyCost(lvl) {
  return Math.floor(8 * Math.pow(lvl, 1.35));
}
