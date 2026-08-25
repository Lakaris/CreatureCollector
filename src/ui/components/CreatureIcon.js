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

import React from "../../react.js";
import { getDisplayArt } from "../../core/creatures.js";

function CreatureIcon({ def, size, style, className, state, still, ownedData, unlockedSkins }) {
  if (!def) return null;
  const art = getDisplayArt(def, ownedData, unlockedSkins, state);

  if (art.kind === "emoji") {
    return React.createElement(
      "span",
      { className, style: { fontSize: size, lineHeight: 1, display: "block", ...style } },
      art.emoji
    );
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
