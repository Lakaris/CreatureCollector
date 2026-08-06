// Boss ability registry, keyed by the `key` field of DUNGEON_BOSSES.
//
// Each module owns one boss's full kit: its runtime behaviour AND the tiles the
// planning phase highlights. Those were previously two separate hand-written
// implementations per boss that had to be kept in sync by hand -- and had
// already drifted.

import fire from "./fire.js";
import nature from "./nature.js";
import earth from "./earth.js";
import electric from "./electric.js";
import water from "./water.js";
import light from "./light.js";
import dark from "./dark.js";
import wind from "./wind.js";
import daily from "./daily.js";

export const BOSS_MODULES = { fire, nature, earth, electric, water, light, dark, wind, daily };

/** Look up a boss's ability module. Returns undefined for unknown keys. */
export function getBossModule(key) {
  return BOSS_MODULES[key];
}

/**
 * Tiles the planning phase should highlight for `mode` ("basic" | "special").
 * Returns an empty Set when the boss or mode is unknown.
 */
export function getHighlightTiles(key, mode, geo) {
  const mod = BOSS_MODULES[key];
  if (!mod) return new Set();
  if (mode === "basic" && mod.basicTiles) return mod.basicTiles(geo);
  if (mode === "special" && mod.specialTiles) return mod.specialTiles(geo);
  return new Set();
}

export default BOSS_MODULES;
