// Shared white title bar for top-level tab screens (Home, Hatch, Collection, Store).
// Mirrors the header style used by full-screen modes (Farm, Arena, Dungeon, Treasure),
// bled edge-to-edge via negative margins to offset app-content's own 16px padding.

import React from "../../react.js";
import { formatNum } from "../../core/format.js";
import { iconText, currencyIcon } from "./IconText.js";

// `currency` (a currencies key) picks the icon by key -- needed when the
// emoji is shared with something else, like Gear Shards' ⚔️.
export function CurrencyChip({ currency, emoji, value }) {
  return React.createElement("div", { className: "chip currency-chip" },
    currency ? currencyIcon(currency, emoji) : iconText(emoji),
    React.createElement("span", null, formatNum(value))
  );
}

function ScreenHeader({ title, onBack, backDisabled, left, right, edgeToEdge = true }) {
  return React.createElement("div", {
    style: {
      display: "flex", alignItems: "center", gap: 12,
      background: "var(--bar-bg)", borderBottom: "1px solid var(--bar-line)",
      margin: edgeToEdge ? "0 -16px 12px" : "0 0 12px",
      padding: "16px 16px 12px", flexShrink: 0,
      position: "sticky", top: 0, zIndex: 5
    }
  },
    onBack && React.createElement("button", {
      onClick: backDisabled ? undefined : onBack,
      disabled: backDisabled,
      style: { background: "none", border: "none", cursor: backDisabled ? "not-allowed" : "pointer", fontSize: 20, color: backDisabled ? "#ccc" : "#555", padding: 0, lineHeight: 1 }
    }, React.createElement("i", { className: "ti ti-arrow-left" })),
    // Buttons on the left (Home's Settings and Daily). Not inside the title,
    // whose overflow is hidden for its ellipsis and would clip round buttons.
    left && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 } }, left),
    // Single line + ellipsis so a wide right side (badges, dev pills) can
    // never wrap the title and change the bar's height.
    React.createElement("div", { style: { fontSize: 18, fontWeight: 700, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, title),
    right && React.createElement("div", { style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 } }, right)
  );
}

export default ScreenHeader;
