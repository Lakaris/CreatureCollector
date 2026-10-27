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
//   showcase       the creature is on display (creature page portrait, Home):
//                  now and then it plays its `flavor` art over idle, and
//                  tapping it plays a random one of its other animations
//                  (flavor, move, attack, defeat, victory -- whichever it has
//                  art for). See data/creatureArt.js.

import React, { useState, useEffect } from "../../react.js";
import { getDisplayArt, hasArtState } from "../../core/creatures.js";
import { ART_STATES, FLAVOR_STILL_MS, FLAVOR_FIRST_MS, FLAVOR_GAP_MS } from "../../data/creatureArt.js";

const randBetween = ([min, max]) => min + Math.random() * (max - min);

/** How long a showcase play of `art` lasts before returning to idle: one pass
 * of a strip, FLAVOR_STILL_MS for a still. Looping strips (move) would be over
 * in a blink after one pass, so they run two passes, at least FLAVOR_STILL_MS. */
function playMs(art) {
  if (art.kind !== "sprite") return FLAVOR_STILL_MS;
  return art.loop ? Math.max(art.totalMs * 2, FLAVOR_STILL_MS) : art.totalMs;
}

// Background position (in %) of cell `i` of a `cols`-wide sheet. Percentage
// background-position is relative to (box - image) size, not to the image, so
// 0%..100% across (cols-1) steps lands exactly on each column -- likewise for
// rows -- at any rendered size.
function cellPos(i, cols, rows) {
  const x = cols > 1 ? ((i % cols) / (cols - 1)) * 100 : 0;
  const y = rows > 1 ? (Math.floor(i / cols) / (rows - 1)) * 100 : 0;
  return x + "% " + y + "%";
}

// One @keyframes per distinct sheet, generated on first use: a keyframe at
// each frame's start time holding its cell, played with step-end so every
// frame holds for exactly its own duration (sheets can time frames unevenly).
const sheetKeyframes = new Map();
function sheetAnimation(art) {
  const sig = art.src + "|" + art.columns + "|" + art.durations.join(",");
  let name = sheetKeyframes.get(sig);
  if (!name) {
    name = "sheet" + sheetKeyframes.size;
    sheetKeyframes.set(sig, name);
    const rows = Math.ceil(art.frames / art.columns);
    let t = 0;
    const steps = art.durations.map((d, i) => {
      const at = (t / art.totalMs) * 100;
      t += d;
      return at.toFixed(4) + "%{background-position:" + cellPos(i, art.columns, rows) + "}";
    });
    steps.push("100%{background-position:" + cellPos(art.frames - 1, art.columns, rows) + "}");
    const el = document.createElement("style");
    el.textContent = "@keyframes " + name + "{" + steps.join("") + "}";
    document.head.appendChild(el);
  }
  return name + " " + (art.totalMs / 1000).toFixed(3) + "s step-end " + (art.loop ? "infinite" : "1 forwards");
}

// Sheets loaded and decoded ahead of use, by src. Switching a showcase
// creature to a sheet the browser hasn't decoded yet draws nothing for a
// moment -- a white flash -- so every state's sheet is fetched as soon as the
// creature is on show, and a play waits for its sheet before switching. The
// Image objects stay referenced here so the decoded pictures stay cached.
const preloaded = new Map();
function preloadSheet(src) {
  if (!preloaded.has(src)) {
    const img = new Image();
    img.src = src;
    const ready = (img.decode ? img.decode() : new Promise((r) => { img.onload = img.onerror = r; })).catch(() => {});
    preloaded.set(src, { img, ready });
  }
  return preloaded.get(src).ready;
}

/**
 * Drives showcase animations: flavor on a random timer, and any non-idle state
 * on tap. Returns the state playing now (null = resting) and a play count that
 * keys the rendered element, so each play remounts it and the strip starts
 * again from its first frame.
 */
function useShowcase(enabled, def, ownedData, unlockedSkins) {
  const states = enabled && def ? ART_STATES.filter((s) => s !== "idle" && hasArtState(def, ownedData, unlockedSkins, s)) : [];
  const hasFlavor = states.includes("flavor");
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(null);
  const sig = (def && def.id) + ":" + states.join();

  // Warm every sheet this creature can switch to, idle included (it's
  // remounted on the way back from a play).
  useEffect(() => {
    if (!states.length) return;
    ["idle", ...states].forEach((s) => preloadSheet(getDisplayArt(def, ownedData, unlockedSkins, s).src));
  }, [sig]);

  // Switch only once the sheet is decoded, so the swap is instant.
  const start = (s) => {
    preloadSheet(getDisplayArt(def, ownedData, unlockedSkins, s).src).then(() => {
      setPlays((n) => n + 1);
      setPlaying(s);
    });
  };

  useEffect(() => {
    if (!states.length) {
      if (playing) setPlaying(null);
      return;
    }
    let t;
    if (playing) t = setTimeout(() => setPlaying(null), playMs(getDisplayArt(def, ownedData, unlockedSkins, playing)));
    else if (hasFlavor) t = setTimeout(() => start("flavor"), randBetween(plays === 0 ? FLAVOR_FIRST_MS : FLAVOR_GAP_MS));
    return () => clearTimeout(t);
  }, [sig, playing, plays]);

  // Tap: a random state, never the one already playing when there's a choice.
  const tap = states.length
    ? () => {
        const pool = states.length > 1 ? states.filter((s) => s !== playing) : states;
        start(pool[Math.floor(Math.random() * pool.length)]);
      }
    : null;

  return { playing: states.length ? playing : null, plays, tap };
}

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

function CreatureIcon({ def, size, style, className, state, still, ownedData, unlockedSkins, contain, showcase }) {
  const sc = useShowcase(showcase && !still && (!state || state === "idle"), def, ownedData, unlockedSkins);
  if (!def) return null;
  const art = getDisplayArt(def, ownedData, unlockedSkins, sc.playing || state);
  // A fresh key per showcase play (and back to idle) remounts the element, so
  // a strip always starts on its first frame instead of resuming mid-animation.
  const key = sc.playing ? sc.playing + sc.plays : "base";
  const onClick = sc.tap || undefined;

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
    ...(onClick ? { cursor: "pointer", WebkitTapHighlightColor: "transparent" } : null),
  };

  if (art.kind === "image") {
    return React.createElement("img", {
      key,
      src: art.src,
      alt: "",
      decoding: "async",
      draggable: false,
      onClick,
      className,
      style: { ...base, objectFit: "contain", ...style },
    });
  }

  // Sprite sheet: `frames` equal square cells, `columns` to a row. The sheet is
  // sized to columns*100% x rows*100% of a square cell box and stepped through
  // with a generated keyframe (see sheetAnimation), so it's size-independent.
  //
  // Callers may stretch the box to a non-square shape (Collection cards), which
  // would stretch the cells too -- so the sheet draws in a square inner box,
  // the largest that fits (like an img's object-fit: contain), centred, or
  // bottom-aligned when the caller asks for objectPosition "... bottom".
  const rows = Math.ceil(art.frames / art.columns);
  const { objectPosition, ...outerStyle } = style || {};
  const bottom = /bottom/.test(objectPosition || "");
  return React.createElement(
    "div",
    {
      key,
      onClick,
      className,
      style: { ...base, containerType: "size", display: "flex", justifyContent: "center", alignItems: bottom ? "flex-end" : "center", ...outerStyle },
    },
    React.createElement("div", {
      style: {
        width: "min(100cqw, 100cqh)",
        height: "min(100cqw, 100cqh)",
        flexShrink: 0,
        backgroundImage: 'url("' + art.src + '")',
        backgroundSize: art.columns * 100 + "% " + rows * 100 + "%",
        backgroundRepeat: "no-repeat",
        // `still` holds the first frame as a poster instead of animating.
        ...(still ? { backgroundPosition: "0% 0%" } : { animation: sheetAnimation(art) }),
      },
    })
  );
}

export default CreatureIcon;
