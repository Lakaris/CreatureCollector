// Per-creature art, keyed by creature id -- the same key space as CREATURE_MAP
// and SKIN_SETS.chain. Note those ids are historical and do not always match
// the display name (id "emberstar" is the Emberstar line, "nessling"
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
// Each state maps to one sprite sheet -- a single row, or a grid read left to
// right, top row to bottom row:
//
//   src        path to the image, relative to index.html
//   frames     equal-size cells in the sheet (default 1 = a still image)
//   columns    cells per row (default = frames, i.e. one horizontal strip)
//   fps        cells per second (default DEFAULT_FPS); ignored when frames is 1
//   durations  per-frame ms, one per frame -- overrides fps, for sheets whose
//              frames hold for different times (copy them from the
//              exporter's .json)
//   loop       true to repeat forever, false to play once and hold the last
//              frame. Defaults per state (see LOOPING_STATES): idle and move
//              loop, attack/defeat/victory/flavor play once.
//   blend      CSS mix-blend-mode, for legacy art drawn on an opaque white
//              background. New art should ship real alpha and omit this --
//              multiply erases artwork against dark surfaces.
//   pixelated  true to disable smoothing when scaling (pixel art).
//
// A still image is just `frames: 1`, so a creature can start as one PNG per
// state and gain animation later by widening the strip -- no shape change, no
// code change.
//
// ── Flavor ────────────────────────────────────────────────────────────────
// `flavor` is a personality moment (a yawn, a stretch, a tail flick) that
// plays now and then over idle on the creature page and the Home showcase --
// never in battle. It plays once (one pass of the strip, or FLAVOR_STILL_MS
// for a still) and drops back to idle. A creature without flavor art just
// idles; there's no fallback to another state.
//
// In those same showcase spots, tapping the creature plays a random one of its
// non-idle states that has art (flavor, move, attack, defeat, victory), timed
// the same way -- a looping strip like move runs two passes.
//
// ── Authoring ─────────────────────────────────────────────────────────────
// Cells must be square and equal width: a 6-frame strip of 512px cells is one
// 3072x512 PNG. Art is drawn from 20px (battle grid) up to 130px (creature
// page), so ~512px per cell covers every size with retina headroom.

/** Every animation state the renderer understands, in fallback-priority order. */
export const ART_STATES = ["idle", "move", "attack", "defeat", "victory", "flavor"];

/** States that repeat by default; everything else plays once and holds. */
const LOOPING_STATES = new Set(["idle", "move"]);

export const DEFAULT_FPS = 8;

/** How long a still (frames: 1) flavor image shows before returning to idle. */
export const FLAVOR_STILL_MS = 1500;
/** Wait before the first flavor after the creature appears, then between
 * plays -- each a random pick within [min, max] ms so it never feels metronomic. */
export const FLAVOR_FIRST_MS = [5000, 10000];
export const FLAVOR_GAP_MS = [12000, 25000];

/** Whether a state's strip repeats, honoring an explicit per-entry override. */
export function artLoops(state, entry) {
  return entry.loop === undefined ? LOOPING_STATES.has(state) : !!entry.loop;
}

export const CREATURE_ART = {
  // 512px cells. Idle is a 6x5 grid breathing loop (30 frames at 64ms; 1.92s); flavor uses all 12 cells of a 4x3
  // grid with per-frame holds from cirruskit_flavor.json (2.432s).
  // Move is a 6x5 paired walk loop (30 frames at 50ms; 1.5s).
  cirruskit: {
    idle: { src: "images/cirruskit/cirruskit_idle.png", frames: 30, columns: 6, durations: Array(30).fill(64) },
    move: { src: "images/cirruskit/cirruskit_move.png", frames: 30, columns: 6, durations: Array(30).fill(50) },
    attack: { src: "images/cirruskit/cirruskit_attack.png", frames: 25, columns: 5, durations: Array(25).fill(16), loop: false },
    defeat: { src: "images/cirruskit/cirruskit_defeat.png", frames: 24, columns: 6, durations: Array(24).fill(30), loop: false },
    flavor: { src: "images/cirruskit/cirruskit_flavor.png", frames: 12, columns: 4, durations: [600, 80, 184, 208, 176, 192, 144, 144, 184, 80, 80, 360] },
  },

  // Blastar (id "blastar" -- final stage of the Emberstar line).
  // Attack and defeat are stills: attack shows for ATTACK_ART_MS after each
  // swing, defeat while the defeated unit lingers (see battleArtState.js).
  blastar: {
    idle: { src: "images/blastar/idle.png" },
    attack: { src: "images/blastar/attack.png" },
    defeat: { src: "images/blastar/defeat.png" },
  },
};
