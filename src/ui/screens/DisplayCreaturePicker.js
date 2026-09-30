// Picks the creature shown on the Home screen. Opened from Settings
// ("Change display creature"); tapping a creature sets it and returns.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import CreatureIcon from "../components/CreatureIcon.js";
import ScreenHeader from "../components/ScreenHeader.js";

function DisplayCreaturePicker({ onBack }) {
  const { owned, unlockedSkins, featuredCreatureId, setFeaturedCreatureId } = useGame();
  const ownedList = Object.values(owned);
  // Same fallback Home uses when nothing has been picked yet.
  const currentId = featuredCreatureId || ownedList[0]?.id;

  return React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column" } },
    React.createElement(ScreenHeader, { title: "Display Creature", onBack, edgeToEdge: false }),
    React.createElement("div", { style: { flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", alignContent: "start", gap: 8, padding: 12 } },
      ownedList.map((o) => {
        const d = CREATURE_MAP[o.id];
        if (!d) return null;
        const selected = o.id === currentId;
        return React.createElement("button", {
          key: o.id,
          onClick: () => { setFeaturedCreatureId(o.id); onBack(); },
          style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "10px 4px", borderRadius: 10, border: selected ? "2px solid #7c4dff" : "2px solid #e8e8e8", background: selected ? "#f3eeff" : "#fafafa", cursor: "pointer" }
        },
          React.createElement(CreatureIcon, { def: d, ownedData: o, unlockedSkins: unlockedSkins || [], size: 36 }),
          React.createElement("div", { style: { fontSize: 10, fontWeight: 600, color: "#333", textAlign: "center", lineHeight: 1.2 } }, d.name)
        );
      })
    )
  );
}

export default DisplayCreaturePicker;
