// Pieces of the popup art set (images/ui_panels/violet) that need markup
// rather than just a class: the frame's close button, plus the ability icon
// tile the popups share. The frame itself, the divider and the gear tile are
// plain classes -- .ui-panel, .ui-divider and .ui-slot in
// styles/components.css.

import React from "../../react.js";

/** The ability icon's colour behind its art, per kind -- the creature page's. */
export const ABILITY_TILE_COLORS = {
  basic: { bg: "#EAF3DE", color: "#173404" },
  special: { bg: "#EEEDFE", color: "#26215C" },
  unique: { bg: "#FFF3CD", color: "#5A3E00" },
};

/** The frame's close button. Absolutely placed by the caller (`style`), at
 * `size` px square. */
export function PopupClose({ onClick, size = 28, style }) {
  return React.createElement("button", {
    className: "ui-close",
    onClick,
    title: "Close",
    "aria-label": "Close",
    style: { width: size, height: size, ...style },
  });
}

/** An ability's icon (its `icon` art, or the creature page's "No img"
 * placeholder until it has some) on its kind's colour. No frame. */
export function AbilityIcon({ kind, icon }) {
  const tile = ABILITY_TILE_COLORS[kind] || ABILITY_TILE_COLORS.basic;
  return React.createElement("div", { className: "ui-ability-icon", style: { background: tile.bg } },
    icon
      ? React.createElement("img", { src: icon, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } })
      : React.createElement("span", { style: { fontSize: 9, fontWeight: 700, color: tile.color, opacity: 0.5, userSelect: "none", whiteSpace: "nowrap" } }, "No img")
  );
}
