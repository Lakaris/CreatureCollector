// Creature logic: evolution-chain traversal, owned-record creation, and the
// level/ascension stat curve.

import { CREATURE_MAP } from "../data/creatures.js";
import { SKIN_SETS } from "../data/skins.js";
import { RARITY_STAT_MULT, LEVEL_STAT_CYCLE } from "../data/rarity.js";

export const MAX_LEVEL = 500;
export const MAX_ASCENSION = 50;
/** Ability levels run 0-5 (the player cap enforced in CreatureDetail); every
 * ability's `upgrades` table has 5 entries, so both 4 and 5 read as the last
 * upgrade. Enemy creatures always fight at this level -- see makeArenaBattle. */
export const MAX_ABILITY_LEVEL = 5;

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

/** 1-indexed position of this creature within its own evolution chain
 * (1 = base form). Every chain in the roster is at most 4 stages deep. */
export function getEvolutionStage(creatureId) {
  let n = 1, cur = CREATURE_MAP[creatureId];
  while (cur && cur.evolutionOf) { n++; cur = CREATURE_MAP[cur.evolutionOf]; }
  return n;
}

/**
 * Ticks of battle time needed to fully charge this creature's special ability.
 * Every battle tick adds the creature's Haste (abilitySpeed, base 1) to the
 * charge; the ability triggers when the charge reaches this number, then the
 * bar resets and charges again. Values are placeholders in data/creatures.js
 * until abilities are implemented for real.
 *
 * Returns 0 for specials with no `charge` in their data: those are chargeless
 * -- no energy cost, no ⚡ pill, no charge bar -- and fire off their own
 * condition instead (e.g. Overload Sting's 20-stack Restrained gate).
 */
export function getSpecialCharge(defOrId) {
  const def = typeof defOrId === "string" ? CREATURE_MAP[defOrId] : defOrId;
  return def?.abilities?.special?.charge || 0;
}

/**
 * Charge cost at a given special-ability level. Taunting Snap's final upgrade
 * (Crystalcrab line, special level >= 4) cuts the energy cost by 10% -- shown
 * on the ⚡ pill rather than spelled out in the ability text. Every other
 * special costs the flat getSpecialCharge value at every level.
 */
export function getSpecialChargeAt(defOrId, specialLevel) {
  const def = typeof defOrId === "string" ? CREATURE_MAP[defOrId] : defOrId;
  const base = getSpecialCharge(def);
  if (!base) return 0;
  const discounted = def && getRootDef(def.id)?.id === "crystalcrab" && (specialLevel || 0) >= 4;
  return discounted ? Math.max(1, Math.round(base * 0.9)) : base;
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

/** Food cost to level a creature up from `lvl`. The Field's food-rate curve
 * in data/farm.js uses this same ^1.6 exponent so ~10 levels at the player's
 * current frontier cost about one week of harvests at the matching field
 * level -- see that file's header comment for the full calibration against
 * the Labyrinth's floor/10 target level. The ^1.6 exponent (steeper than the
 * old ^1.35) grows faster than a fresh creature's early levels, which stay
 * cheap regardless -- so pushing one already-high creature further costs
 * noticeably more than spreading the same food across several lower ones. */
export function energyCost(lvl) {
  return Math.floor(8 * Math.pow(lvl, 1.6));
}
