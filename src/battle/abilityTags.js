// Ability tags, as the battle engine sees them.
//
// The tags on ability cards (getAbilityTags in core/abilityText.js) are also
// the classification the engine uses for tag-driven gear -- e.g. Hydra Tooth
// buffs every ability tagged "multihit". One source of truth: tag an ability
// there and the gear picks it up here, with no per-creature code.
//
// Tags can depend on the ability's level (riders that unlock at a later
// upgrade), so they are looked up at the unit's current level and memoized
// per unit+ability+level.

import { getAbilityTags } from "../core/abilityText.js";

export function abilityHasTag(unit, key, tag) {
  if (!unit || !key || !unit.creatureId) return false;
  const level = unit.abilityLevels?.[key] ?? 0;
  const cache = unit._abilityTags || (unit._abilityTags = {});
  const slot = key + ":" + level;
  const tags = cache[slot] || (cache[slot] = getAbilityTags(unit.creatureId, key, level));
  return tags.includes(tag);
}
