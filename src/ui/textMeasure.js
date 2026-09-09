// Measuring text the layout hasn't laid out yet.
//
// Used where a layout has to be chosen FROM the text rather than the other way
// round -- how small a label has to shrink to fit its button, how narrow a grid
// column may get before a word breaks.

/**
 * Width in DESIGN pixels of `text` rendered at `fontSize` inside `host`.
 *
 * The probe is appended to `host` rather than to the body so it inherits the
 * real font family, weight and letter-spacing. A detached span is measured in
 * the browser's default face and reports a width the actual text never has --
 * which is how an earlier estimate here came out 16px short.
 *
 * offsetWidth, not getBoundingClientRect: the whole app sits inside a global
 * `transform: scale()` (ui/uiScale.js), so a rect is in VIEWPORT pixels while
 * clientWidth/padding on the elements being fitted are in DESIGN pixels.
 * Comparing across the two is wrong by the scale factor. offsetWidth is a
 * layout value, so it matches whatever it is being compared against.
 */
export function measureTextWidth(host, text, fontSize, fontWeight) {
  if (!host || !text) return 0;
  const probe = document.createElement("span");
  probe.textContent = text;
  probe.style.cssText =
    "position:absolute;visibility:hidden;white-space:pre;pointer-events:none;font-size:" +
    fontSize +
    "px" +
    (fontWeight ? ";font-weight:" + fontWeight : "");
  host.appendChild(probe);
  const w = probe.offsetWidth;
  probe.remove();
  return w;
}

/**
 * Width `el`'s own text would need on one line at `fontSize`.
 *
 * Measures a CLONE of the element rather than a bare span, so every property
 * that affects glyph advance comes along: weight, family, style, letter- and
 * word-spacing, text-transform. Building a probe by hand and copying only the
 * size gets this wrong the moment any of those live on the element itself
 * rather than being inherited -- a bold label measured at the parent's normal
 * weight reads several percent narrow, so it is never shrunk and clips.
 */
export function measureElementTextWidth(el, fontSize) {
  const host = el && el.parentElement;
  if (!host) return 0;
  const probe = el.cloneNode(true);
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.whiteSpace = "nowrap";
  probe.style.width = "auto";
  probe.style.maxWidth = "none";
  probe.style.overflow = "visible";
  probe.style.fontSize = fontSize + "px";
  host.appendChild(probe);
  const w = probe.offsetWidth;
  probe.remove();
  return w;
}

/**
 * Width of the widest single WORD across `texts` -- the narrowest a box can be
 * before that word has to break mid-word. Wrapping BETWEEN words is fine, so
 * the whole string is not the constraint; the longest word is.
 */
export function widestWordWidth(host, texts, fontSize, fontWeight) {
  let max = 0;
  const seen = new Set();
  for (const t of texts) {
    for (const word of String(t).split(/\s+/)) {
      if (!word || seen.has(word)) continue;
      seen.add(word);
      const w = measureTextWidth(host, word, fontSize, fontWeight);
      if (w > max) max = w;
    }
  }
  return max;
}
