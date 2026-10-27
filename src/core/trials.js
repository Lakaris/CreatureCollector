// Trials: an Arena-style track (ArenaScreen in "trials" mode) whose enemy
// creatures wear equipment. This module decides WHAT each enemy wears; the
// battle side (makeArenaBattle's `__equipped` / `__equipLevel`) turns that into
// stats and gear effects exactly the way a player's equipment works.
//
// The kit grows with the Trials level (1-50, ten stages each, like an Arena
// tab):
//   - how many items: 1 at levels 1-10, 2 at 11-20, 3 at 21-30, 4 from 31
//   - which rarities: Common/Rare early, Rare/Epic, Epic/Legendary, then
//     Legendary only (TRIALS_RARITY_BANDS)
//   - item level: tracks the stage's enemy level (1-500) across the item
//     level range (1-EQUIP_MAX_LEVEL)
// Every item fits its wearer (itemFitsCreature: element/role/range/species
// exclusives only go on creatures that could equip them) and no enemy wears
// the same item twice. Picks are seeded by level, stage and slot, so a stage
// always shows the same kit.

import { EQUIPMENT_DEFS, EQUIP_MAX_LEVEL } from "../data/equipment.js";
import { itemFitsCreature } from "./equipment.js";

export const TRIALS_ID = "trials";
export const TRIALS_TAB = { id: TRIALS_ID, label: "Trials", emoji: "⚔️" };

/** [up to this Trials level, rarities that may appear]. */
const TRIALS_RARITY_BANDS = [
  [12, ["common", "rare"]],
  [25, ["rare", "epic"]],
  [38, ["epic", "legendary"]],
  [Infinity, ["legendary"]],
];

export function trialsItemCount(trialsLevel) {
  return Math.min(4, 1 + Math.floor((Math.max(1, trialsLevel) - 1) / 10));
}

export function trialsRarities(trialsLevel) {
  return TRIALS_RARITY_BANDS.find(([upTo]) => trialsLevel <= upTo)[1];
}

/** Item level for a stage's enemy level (1-500), across 1-EQUIP_MAX_LEVEL. */
export function trialsItemLevel(enemyLevel) {
  const t = (Math.min(500, Math.max(1, enemyLevel)) - 1) / 499;
  return Math.max(1, Math.round(1 + t * (EQUIP_MAX_LEVEL - 1)));
}

function hash(n) {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return (n ^ (n >>> 16)) >>> 0;
}

/**
 * The items enemy `def` wears in slot `slot` of a Trials stage, as item ids.
 * Deterministic for (level, stage, slot, creature).
 */
export function trialsGearFor(def, trialsLevel, stageNum, slot) {
  const rarities = trialsRarities(trialsLevel);
  const pool = EQUIPMENT_DEFS.filter((e) => rarities.includes(e.rarity) && itemFitsCreature(e, def));
  const items = [];
  let seed = hash(trialsLevel * 7919 + stageNum * 104729 + slot * 1299709 + def.id.length * 31);
  for (let i = 0; i < trialsItemCount(trialsLevel) && pool.length; i++) {
    seed = hash(seed + i + 1);
    const pick = pool.splice(seed % pool.length, 1)[0];
    items.push(pick.id);
  }
  return items;
}
