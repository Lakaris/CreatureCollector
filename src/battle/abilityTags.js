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

import { getAbilityTags, isHealingAbility } from "../core/abilityText.js";
import { triggersOn, basicAttackNumber } from "./applier.js";

/**
 * Tags a creature's GEAR adds to its abilities -- an item that changes what
 * an ability does changes what it is: Gust Anklets make the Basic Pierce,
 * Tidal Grip makes damaging Specials Displace. So tag-keyed gear composes:
 * Tempest Blade buffs a Basic that Gust Anklets made Pierce, and Brineplate
 * shortens a Special that Tidal Grip made Displace.
 *
 * "Every Nth attack" gear gives only THAT attack the shape: Railgun Coil's
 * every-4th Pierce, Shockwave Gauntlet's Splash, Tremor Edge's Line, Twin
 * Fang's extra hit (Multi-hit), Voltaic Fang's Stun, Undertow Anchor's Pull
 * (Displace). The attack in progress is counted the way Focus Band counts it
 * (see attackerDamageMultiplier in hp.js). Petrified Core's first Special
 * Stuns, so that cast is tagged Stun.
 */
function gearTags(unit, key) {
  const g = unit.gear;
  const tags = [];
  if (!g) return tags;
  if (key === "basic") {
    const n = basicAttackNumber(unit);
    const due = (every) => triggersOn(unit, every, n).length > 0;
    if (g.basicPierce || due("pierceEvery")) tags.push("pierce");
    if (g.chainTargets) tags.push("chain");
    if (due("splashEvery")) tags.push("splash");
    if (due("lineEvery")) tags.push("line");
    if (due("extraHitEvery")) tags.push("multihit");
    if (due("stunEvery")) tags.push("stun");
    if (due("pullEvery")) tags.push("displace");
  }
  if (key === "special") {
    if (g.specialPush) tags.push("displace");
    if (g.firstSpecialStunTicks && !unit._firstSpecialDone) tags.push("stun");
  }
  return tags;
}

export function abilityHasTag(unit, key, tag) {
  if (!unit || !key) return false;
  if (gearTags(unit, key).includes(tag)) return true;
  if (!unit.creatureId) return false;
  // "heal" is a classification, not a card pill: it comes from the ability's
  // heal phrase (isHealingAbility in core/abilityText.js).
  if (tag === "heal") return isHealingAbility(unit.creatureId, key);
  const level = unit.abilityLevels?.[key] ?? 0;
  const cache = unit._abilityTags || (unit._abilityTags = {});
  const slot = key + ":" + level;
  const tags = cache[slot] || (cache[slot] = getAbilityTags(unit.creatureId, key, level));
  return tags.includes(tag);
}
