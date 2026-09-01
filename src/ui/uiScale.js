// Global UI scale.
//
// The whole game is laid out in hardcoded pixels against a phone-sized design
// (buttons, card padding, font sizes, the battle boards' tiles). That reads
// correctly on the device it was drawn for and nowhere else: on a shorter
// screen the Home screen's fixed offsets collide and the bottom controls fall
// off, and on a desktop window everything sits tiny in a corner.
//
// Rather than convert several thousand inline pixel values to relative units --
// which would have to be re-done for every new screen, and would drift the
// first time someone typed a number -- the app is drawn at its design size and
// then scaled as a whole. One number moves, every pixel in the game follows,
// including screens written after this file.
//
// The mechanism is `transform: scale()` on `.app`, with the element sized
// 1/scale so it still covers the viewport exactly (see styles/base.css). The
// transform also makes `.app` the containing block for `position: fixed`
// descendants, which is what keeps the fixed-position screens, modals and
// overlays scaling along with everything else instead of anchoring themselves
// to the unscaled viewport.

/**
 * The design the pixel values in this codebase were written against: the
 * smallest screen the current layout is comfortable on. Scale is 1 here, so
 * a phone of this size renders exactly as it always has; everything else is
 * derived from it.
 */
const DESIGN_W = 375;
const DESIGN_H = 667;

/**
 * Floor and ceiling. The floor keeps a landscape phone legible rather than
 * letting the scale run to nothing; the ceiling stops a large desktop window
 * from inflating the UI past the point where it looks deliberate.
 */
const MIN_SCALE = 0.45;
const MAX_SCALE = 1.5;

/**
 * Below this many DESIGN pixels of width, layouts that need three columns drop
 * to a stacked arrangement (the battle rows, the Daily Boss's info panel).
 *
 * This used to be a plain `@media (max-width:700px)`, which stopped meaning
 * what it said the moment the app started scaling: a media query measures the
 * raw viewport, but everything inside the app is laid out in design pixels, and
 * the two now differ by the scale factor. A 690x600 window is 767 design pixels
 * wide -- room enough for the panel -- yet the old query hid it, and the mirror
 * case (a tall narrow window reporting a wide viewport) showed a panel that did
 * not fit. So the breakpoint is published from here as a flag on <html> and the
 * stylesheet keys off that instead.
 */
export const NARROW_APP_WIDTH = 700;

let current = 1;

/**
 * The scale currently applied to the app.
 *
 * Needed by code that mixes the two coordinate spaces: a pointer event's
 * clientX/clientY are in viewport (visual) pixels, while an element's inline
 * `left`/`top` inside the scaled tree are in design pixels. Divide a viewport
 * coordinate by this to place something in the tree under the pointer. Reading
 * a `getBoundingClientRect()` needs no correction -- that is already visual --
 * and neither does `elementFromPoint`, so most code can ignore this entirely.
 */
export function getUiScale() {
  return current;
}

/** The app's width in DESIGN pixels -- what its own layout is measured in. */
export function appWidth() {
  return window.innerWidth / current;
}

/**
 * True when the app is too narrow for a side-by-side layout. Screens that
 * branch in JS (the Daily Boss's press-and-hold info popup, which stands in for
 * the panel the stylesheet hides) read this, so the two can't disagree and
 * leave a player with neither.
 */
export function isAppNarrow() {
  return appWidth() <= NARROW_APP_WIDTH;
}

/**
 * Compute the scale from the viewport and publish it as CSS custom properties.
 * Idempotent; safe to call on every resize.
 *
 * Also publishes `--vw` / `--vh`: one percent of the app's box in DESIGN
 * pixels. The real `vw`/`vh` units are not usable inside the scaled tree --
 * they measure the raw viewport, so a `75vw` offset lands at 75% of the
 * viewport times the scale, drifting away from everything around it as the
 * screen changes. Anything that wants "a fraction of the screen" uses these.
 */
function apply() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, Math.min(vw / DESIGN_W, vh / DESIGN_H)));
  current = scale;
  const root = document.documentElement;
  root.style.setProperty("--ui-scale", String(scale));
  root.style.setProperty("--vw", vw / scale / 100 + "px");
  root.style.setProperty("--vh", vh / scale / 100 + "px");
  // The responsive breakpoint, in design pixels (see NARROW_APP_WIDTH).
  root.dataset.appNarrow = vw / scale <= NARROW_APP_WIDTH ? "1" : "0";
}

/** Install the scale and keep it in step with the viewport. */
export function installUiScale() {
  apply();
  window.addEventListener("resize", apply);
  window.addEventListener("orientationchange", apply);
  // On mobile the visual viewport is what actually changes when the URL bar
  // collapses or a keyboard opens; window resize does not always fire for it.
  if (window.visualViewport) window.visualViewport.addEventListener("resize", apply);
}
