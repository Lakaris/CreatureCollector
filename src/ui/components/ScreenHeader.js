// Shared white title bar for top-level tab screens (Home, Hatch, Collection, Store).
// Mirrors the header style used by full-screen modes (Farm, Arena, Dungeon, Treasure),
// bled edge-to-edge via negative margins to offset app-content's own 16px padding.

import React from "../../react.js";

export function CurrencyChip({ emoji, value }) {
  return React.createElement("div", { className: "chip" },
    emoji,
    React.createElement("span", null, (value || 0).toLocaleString())
  );
}

function ScreenHeader({ title, onBack, right, edgeToEdge = true }) {
  return React.createElement("div", {
    style: {
      display: "flex", alignItems: "center", gap: 12,
      background: "#fff", borderBottom: "1px solid #e0e0e0",
      margin: edgeToEdge ? "0 -16px 12px" : "0 0 12px",
      padding: "16px 16px 12px", flexShrink: 0,
      position: "sticky", top: 0, zIndex: 5
    }
  },
    onBack && React.createElement("button", {
      onClick: onBack,
      style: { background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#555", padding: 0, lineHeight: 1 }
    }, React.createElement("i", { className: "ti ti-arrow-left" })),
    React.createElement("div", { style: { fontSize: 18, fontWeight: 700 } }, title),
    right && React.createElement("div", { style: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 } }, right)
  );
}

export default ScreenHeader;
