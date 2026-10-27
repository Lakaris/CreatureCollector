// Post-battle gear rewards (Dungeon, Daily Boss) as a compact grid: five
// tiles a row, each just the item's art on its rarity colour -- the same look
// as the Equipment page's Compact view. The name, rarity and stats live in
// the preview popup a tap opens, so a big haul fits on one screen.

import React from "../../react.js";
import { gearIcon } from "./IconText.js";
import { EQUIP_RARITY_CONFIG } from "../../data/equipment.js";

const COLUMNS = 5;
const TILE_ICON_PX = 40;

/** `rewards` is the dropped item defs (duplicates allowed); `onPick(item)`
 *  opens that item's preview. `style` merges onto the scrolling grid. */
function GearRewardGrid({ rewards, onPick, style }) {
  return React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(" + COLUMNS + ", 1fr)", gap: 7, alignContent: "start", ...style } },
    rewards.map((item, i) => {
      const rarCfg = EQUIP_RARITY_CONFIG[item.rarity] || EQUIP_RARITY_CONFIG.common;
      return React.createElement("div", {
        key: i,
        title: item.name,
        onClick: () => onPick(item),
        style: { aspectRatio: "1 / 1", background: rarCfg.bg, border: "1.5px solid " + rarCfg.color + "66", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxSizing: "border-box", minWidth: 0 },
      }, gearIcon(item, TILE_ICON_PX));
    })
  );
}

export default GearRewardGrid;
