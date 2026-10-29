// Quick look at a piece of gear (Dungeon / Daily Boss rewards and loot
// previews), laid out like the gear detail page: rarity tag top-left with the
// restriction caption under it, then the art, name, stats as one " · " line,
// and the effect as plain purple text -- no pills or boxes.

import React from "../../react.js";
import { iconText, gearIcon } from "./IconText.js";
import { EQUIP_RARITY_CONFIG } from "../../data/equipment.js";
import { formatStatBonus } from "../../data/rarity.js";
import { isExclusive, exclusivityCaption } from "../../core/equipment.js";

/** `item` is the gear def shown (base stats -- a fresh drop or a loot-table
 *  entry); `onClose` dismisses it. `zIndex` lets a caller lift it over its
 *  own overlays. */
function GearPreviewPopup({ item, onClose, zIndex = 150 }) {
  if (!item) return null;
  const rarCfg = EQUIP_RARITY_CONFIG[item.rarity] || EQUIP_RARITY_CONFIG.common;
  const stats = Object.entries(item.stats || {}).map(([s, v]) => formatStatBonus(s, v)).join(" · ");
  return React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" } },
    React.createElement("div", { className:"ui-panel",onClick: (e) => e.stopPropagation(), style: { position: "relative", padding: "8px 4px 4px", width: "100%", maxWidth: 320, boxSizing: "border-box" } },
      // Placed from the frame's inner edge (the card is a .ui-panel), not its
      // outer one.
      React.createElement("div", { style: { position: "absolute", top: 0, left: 2, fontSize: 10, fontWeight: 700, color: rarCfg.color, background: rarCfg.bg, borderRadius: 4, padding: "2px 7px" } }, rarCfg.label),
      isExclusive(item) && React.createElement("div", { style: { position: "absolute", top: 22, left: 2, fontSize: 10, fontWeight: 700, color: "#7F77DD" } }, exclusivityCaption(item)),
      React.createElement("div", { style: { textAlign: "center", paddingTop: 12, marginBottom: 16 } },
        React.createElement("div", { style: { fontSize: 64, lineHeight: 1, marginBottom: 6 } }, gearIcon(item)),
        React.createElement("div", { style: { fontSize: 18, fontWeight: 700, color: "#000", marginBottom: 4 } }, item.name),
        stats && React.createElement("div", { style: { fontSize: 13, color: "#666", marginBottom: item.effect ? 6 : 0 } }, stats),
        item.effect && React.createElement("div", { style: { fontSize: 12, color: "#7F77DD", fontWeight: 600, lineHeight: 1.4 } }, iconText("✦ " + item.effect))
      ),
      React.createElement("button", { onClick: onClose, style: { width: "100%", padding: "11px 0", fontSize: 14, fontWeight: 700, background: "#f0f0f0", color: "#555", border: "none", borderRadius: 12, cursor: "pointer" } }, "Close")
    )
  );
}

export default GearPreviewPopup;
