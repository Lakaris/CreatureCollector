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
