// The one place a creature is drawn. Renders an animated sprite strip, a still
// image, or the creature's emoji -- whichever getDisplayArt resolves to for the
// requested state (see data/creatureArt.js for the fallback chain).
//
// Every creature renders through here, so a creature with no art needs no
// special-casing at the call site: pass the same props and get its emoji.
//
// Props:
//   def            creature definition (required)
//   size           rendered edge length in px
//   state          animation state -- "idle" (default), "move", "attack",
//                  "defeat", "victory". Battle screens derive it from the unit
//                  snapshot via battleArtState(); everything else omits it.
//   still          render animated art as a static poster (its first frame)
//                  instead of playing it. Grid pages (Collection, Dex) pass
//                  this so a wall of cards never becomes a wall of animations.
//   ownedData      the player's record for this creature, for skin resolution
//   unlockedSkins  ids of skin sets the player owns
//   className      extra class, applied whichever kind renders
//   style          extra styles, merged last
//   contain        keep an emoji's ink inside the size box (see below). Image
//                  art already fits its box, so this only affects emoji.

import React from "../../react.js";
import { getDisplayArt } from "../../core/creatures.js";

// An emoji drawn at font-size = size does NOT fit in a size-tall box. The
// emoji font reports a taller box than the line (ascent 50 + descent 12
// against a 46px line at that size), which drags the baseline down, and the
// glyph's own ink runs about 1.09em -- so the art ends up hanging 3-5px below
// its box. Anywhere with padding around it that goes unnoticed; on a battle
// grid, where the icon is exactly one tile, it spills into the tile below.
//
// Sizing the glyph to 0.82em of the box and lifting it 5% puts the ink inside
// with a even margin top and bottom. The numbers are measured against the
// emoji font, not derived, so they're approximate on other platforms -- but
// they err small, which clips nothing.
const EMOJI_FIT = 0.82;

function CreatureIcon({ def, size, style, className, state, still, ownedData, unlockedSkins, contain }) {
  if (!def) return null;
  const art = getDisplayArt(def, ownedData, unlockedSkins, state);

  if (art.kind === "emoji") {
    const box = contain
      ? { width: size, height: size, fontSize: Math.round(size * EMOJI_FIT), lineHeight: size + "px", textAlign: "center", display: "block", transform: "translateY(-5%)" }
      : { fontSize: size, lineHeight: 1, display: "block" };
    return React.createElement("span", { className, style: { ...box, ...style } }, art.emoji);
  }

  const base = {
    width: size,
    height: size,
    display: "block",
    ...(art.blend ? { mixBlendMode: art.blend } : null),
    ...(art.pixelated ? { imageRendering: "pixelated" } : null),
  };

  if (art.kind === "image") {
    return React.createElement("img", {
      src: art.src,
      alt: "",
      decoding: "async",
      className,
      style: { ...base, objectFit: "contain", ...style },
    });
  }

  // Sprite strip: `frames` equal cells laid out horizontally. Sizing the
  // background to frames*100% and stepping background-position-x from 0% to
  // 100% lands exactly on each cell, because percentage background-position is
  // relative to (container - image) width rather than to the image. That makes
  // the whole thing size-independent -- one keyframe (spritePlay, in
  // styles/animations.css) drives every creature at every icon size.
  //
  // jump-none is what makes the last cell reachable: plain steps(n) would stop
  // one cell short, since it never emits the 100% endpoint.
  return React.createElement("div", {
    className,
    style: {
      ...base,
      backgroundImage: 'url("' + art.src + '")',
      backgroundSize: art.frames * 100 + "% 100%",
      backgroundRepeat: "no-repeat",
      // `still` holds the first frame as a poster instead of animating.
      ...(still
        ? { backgroundPositionX: "0%" }
        : {
            animation:
              "spritePlay " +
              (art.frames / art.fps).toFixed(3) +
              "s steps(" +
              art.frames +
              ",jump-none) " +
              (art.loop ? "infinite" : "1 forwards"),
          }),
      ...style,
    },
  });
}

export default CreatureIcon;
