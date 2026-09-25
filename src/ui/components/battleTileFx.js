// Shared tile-pulse battle FX.
//
// Every battle screen used to carry its own copy of these branches, and they
// drifted: Dungeon rendered nine effect flags, Test Battle rendered four, and
// `isMiss` rendered nowhere at all -- so a DoT tick, a Poison tick, a Cryo
// Bomb splash and every Blinded swing were simply invisible on most screens.
// This is the single list of the "coloured square that pulses once" effects,
// so adding a new one lights it up everywhere at once.
//
// Deliberately understated: these are placeholder visuals meant to make an
// effect legible while testing a kit, not to compete with the bespoke
// animations (the boss slams, the wind gusts, the projectile arcs) that the
// richer screens still render themselves.

import React from "../../react.js";

/**
 * flag -> look. `bg` is the fill, `glow` the inset ring, `anim` the keyframes
 * (all already defined in styles/animations.css).
 *
 * Order matters only in that each FX object carries exactly one of these.
 */
export const TILE_FX = {
  // Fire: Burn ticks, Fire Hazards, cone breath.
  isBurn: { bg: "rgba(249,115,22,0.42)", glow: "rgba(234,88,12,0.75)", anim: "pillarFlame 0.7s ease-out forwards" },
  // Water Hazard triggers -- the icy half of the ground effects.
  isFrost: { bg: "rgba(125,211,252,0.38)", glow: "rgba(14,165,233,0.7)", anim: "splashWave 0.7s ease-out forwards" },
  // Damage Over Time (the dark boss's rot, Carrion Rip, Spectral Rake).
  isDark: { bg: "rgba(109,40,217,0.34)", glow: "rgba(139,92,246,0.7)", anim: "splashWave 0.7s ease-out forwards" },
  // Poison -- DoT's green twin.
  isPoison: { bg: "rgba(22,163,74,0.34)", glow: "rgba(74,222,128,0.7)", anim: "splashWave 0.7s ease-out forwards" },
  // Splash areas (Cryo Bomb, Pollen Veil). The struck centre reads stronger.
  isSplash: { bg: "rgba(56,189,248,0.3)", glow: "rgba(14,165,233,0.6)", anim: "splashWave 0.8s ease-out forwards", centerBg: "rgba(56,189,248,0.5)" },
  // Shock lines.
  isShock: { bg: "rgba(250,204,21,0.36)", glow: "rgba(234,179,8,0.7)", anim: "shockLine 0.8s ease-out forwards" },
  // Wind gusts, as a plain pulse on the lean screens.
  isGust: { bg: "rgba(191,219,254,0.4)", glow: "rgba(147,197,253,0.7)", anim: "windGust 0.45s ease-out forwards" },
  // A swing that missed outright: Blind on the attacker, or a spent Dodge.
  // Deliberately the faintest of the set -- it marks a non-event.
  isMiss: { bg: "rgba(148,163,184,0.22)", glow: "rgba(100,116,139,0.5)", anim: "splashWave 0.5s ease-out forwards" },
};

/**
 * Ground Hazards are STATE, not events: they sit on the board for their whole
 * duration, so they get a steady tint rather than a one-shot pulse. Without
 * this the only sign a hazard exists is the flash when something triggers it,
 * which makes an empty patch of burning ground invisible.
 *
 * Painted under the units (z-index below the pulses and the creatures) so it
 * reads as terrain. `hazards` is the live state.hazards array.
 */
const HAZARD_FIELD = {
  fire: { bg: "rgba(249,115,22,0.20)", edge: "rgba(234,88,12,0.45)" },
  water: { bg: "rgba(125,211,252,0.20)", edge: "rgba(14,165,233,0.45)" },
  wind: { bg: "rgba(203,213,225,0.24)", edge: "rgba(148,163,184,0.5)" },
};

export function renderHazardField(hazards, tile) {
  if (!hazards || !hazards.length) return null;
  const out = [];
  for (const hz of hazards) {
    const look = HAZARD_FIELD[hz.kind];
    if (!look) continue;
    for (const cell of hz.cells) {
      const [r, c] = cell.split(",").map(Number);
      out.push(React.createElement("div", {
        key: "hzf" + hz.kind + cell,
        style: {
          position: "absolute",
          left: c * tile, top: r * tile,
          width: tile, height: tile,
          background: look.bg,
          boxShadow: "inset 0 0 0 1px " + look.edge,
          pointerEvents: "none",
          zIndex: 5,
        },
      }));
    }
  }
  return out;
}

/**
 * One tile-pulse element for `e`, or null when this FX is not one of them
 * (the caller falls through to its own projectile/melee/bespoke branches).
 *
 * `tile` is the screen's pixel tile size; screens differ.
 */
export function renderTileFx(e, tile) {
  for (const flag of Object.keys(TILE_FX)) {
    if (!e[flag]) continue;
    const fx = TILE_FX[flag];
    return React.createElement("div", {
      key: e.id,
      style: {
        position: "absolute",
        left: e.col * tile, top: e.row * tile,
        width: tile, height: tile,
        background: e.isCenter && fx.centerBg ? fx.centerBg : fx.bg,
        boxShadow: "inset 0 0 8px " + fx.glow,
        animation: fx.anim,
        animationDelay: e.isSplash && !e.isCenter ? "80ms" : undefined,
        pointerEvents: "none",
        zIndex: 20,
      },
    });
  }
  return null;
}
