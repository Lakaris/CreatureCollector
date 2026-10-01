// Draws item icons in place of their emoji inside ordinary text.
//
// Item names and reward labels carry their emoji inline ("🍌 20 Flair
// Bananas", REWARD_LABELS' "🍌 Flair Banana", the Labyrinth's "🍌 1"), and
// that text is rendered all over the game. iconText() takes such a string
// and returns React children with each known emoji swapped for its picture,
// sized in em so it matches whatever font size the surrounding text uses --
// a drop-in wherever the plain string used to go.
//
// Only a plain 🍌 is the Flair Banana; the Mythical and Ancient bananas are
// written 🍌✨ / 🍌🏺 / 🍌⭐ and keep their emoji until they get art of their own.

import React from "../../react.js";

const ITEM_ICONS = [
  { re: /🍌(?![✨🏺⭐])/u, src: "images/item_icons/flairbanana.png", alt: "Flair Banana" },
];

function iconImg(icon, key) {
  return React.createElement("img", {
    key,
    src: icon.src,
    alt: icon.alt,
    draggable: false,
    style: { width: "1.15em", height: "1.15em", objectFit: "contain", verticalAlign: "-0.2em", display: "inline-block" },
  });
}

/** Children for `text` with item emoji replaced by their icons. Non-strings
 * pass through untouched, so it's safe on any value. */
export function iconText(text) {
  if (typeof text !== "string") return text;
  let parts = [text];
  ITEM_ICONS.forEach((icon, i) => {
    const re = new RegExp(icon.re.source, "gu");
    parts = parts.flatMap((p) => {
      if (typeof p !== "string" || !re.test(p)) return [p];
      re.lastIndex = 0;
      const out = [];
      p.split(re).forEach((seg, j) => {
        if (j > 0) out.push(iconImg(icon, "i" + i + "-" + j + "-" + out.length));
        if (seg) out.push(seg);
      });
      return out;
    });
  });
  return parts.length === 1 ? parts[0] : parts;
}
