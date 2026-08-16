// Ascension melons. Each elemental type has its own melon currency, and a
// rainbow melon substitutes for any type.

import { MELON_TYPES } from "../data/types.js";

export function getMelonKey(type) {
  return "melon" + type;
}

export function getMelonLabel(type) {
  const m = MELON_TYPES.find((m) => m.type === type);
  return m ? m.label : type + " Melon";
}

/** The ascension melon matching a creature's rarity (common/rare/epic/
 * legendary each have their own currency). Falls back to the legendary melon
 * for any unexpected rarity value. */
export function getAscensionMelon(rarity) {
  return MELON_TYPES.find((m) => m.rarity === rarity) || MELON_TYPES.find((m) => m.key === "ascensionMelon");
}

/** Typed melons plus rainbow melons, which can stand in for any type. */
export function getMelonAvailable(currencies, type) {
  return (currencies[getMelonKey(type)] || 0) + (currencies.melonRainbow || 0);
}

/** Spend one melon of `type`, falling back to a rainbow. Returns a new map. */
export function deductMelon(currencies, type) {
  const key = getMelonKey(type);
  if ((currencies[key] || 0) > 0) {
    return { ...currencies, [key]: currencies[key] - 1 };
  }
  return { ...currencies, melonRainbow: (currencies.melonRainbow || 0) - 1 };
}
