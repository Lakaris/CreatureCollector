// Per-creature art, keyed by creature id -- the same key space as CREATURE_MAP
// and SKIN_SETS.chain. Note those ids are historical and do not always match
// the display name (id "blazehornet" is the Emberstar line, "coralleviathan"
// is Nessling), because ids are baked into save data.
//
// EVERY creature resolves art through one path (getDisplayArt in
// core/creatures.js). A creature with no entry here, or with an entry that has
// no art for the state being rendered, falls back down the chain:
//
//     requested state  ->  idle  ->  emoji
//
// so emoji remain the default for the whole roster and art can land one
// creature -- or one state of one creature -- at a time without touching any
// render code. Adding art is one entry in this file and nothing else.
//
// ── Entry shape ───────────────────────────────────────────────────────────
// Each state maps to one horizontal sprite strip:
//
//   src        path to the image, relative to index.html
//   frames     equal-width cells in the strip (default 1 = a still image)
//   fps        cells per second (default DEFAULT_FPS); ignored when frames is 1
//   loop       true to repeat forever, false to play once and hold the last
//              frame. Defaults per state (see LOOPING_STATES): idle and move
//              loop, attack/defeat/victory play once.
//   blend      CSS mix-blend-mode, for legacy art drawn on an opaque white
//              background. New art should ship real alpha and omit this --
//              multiply erases artwork against dark surfaces.
//   pixelated  true to disable smoothing when scaling (pixel art).
//
// A still image is just `frames: 1`, so a creature can start as one PNG per
// state and gain animation later by widening the strip -- no shape change, no
// code change.
//
// ── Authoring ─────────────────────────────────────────────────────────────
// Cells must be square and equal width: a 6-frame strip of 128px cells is one
// 768x128 PNG. Art is drawn from 20px (battle grid) up to 100px (creature
// page), so ~256px per cell covers every size with retina headroom.

/** Every animation state the renderer understands, in fallback-priority order. */
export const ART_STATES = ["idle", "move", "attack", "defeat", "victory"];

/** States that repeat by default; everything else plays once and holds. */
const LOOPING_STATES = new Set(["idle", "move"]);

export const DEFAULT_FPS = 8;

/** Whether a state's strip repeats, honoring an explicit per-entry override. */
export function artLoops(state, entry) {
  return entry.loop === undefined ? LOOPING_STATES.has(state) : !!entry.loop;
}

export const CREATURE_ART = {
  // Was legacy art on an opaque white background, and carried `blend:
  // "multiply"` to knock that background out. The file now ships real alpha
  // (measured: no white pixels at all, 81% fully transparent), so the blend had
  // nothing left to erase except the artwork itself -- multiplying the
  // creature's own colours into every surface behind it, which turned it muddy
  // on the tinted cards and near-black on dark ones. Nothing to knock out any
  // more; the alpha does the job.
  breezekit: { idle: { src: "images/breezekit.png" } },

  // Blastar (id "infernoswarm" -- final stage of the Emberstar line).
  // Attack and defeat are stills: attack shows for ATTACK_ART_MS after each
  // swing, defeat while the defeated unit lingers (see battleArtState.js).
  infernoswarm: {
    idle: { src: "images/blastar/idle.png" },
    attack: { src: "images/blastar/attack.png" },
    defeat: { src: "images/blastar/defeat.png" },
  },
};
