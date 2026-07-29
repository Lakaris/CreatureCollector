// Live damage-dealt chart shown during any auto-battle. Reads a plain
// creatureId -> totalDamage map that each battle's tick loop maintains, and
// updates every tick via the same snapshot state the grid/HP bars use.
// Self-contained minimize toggle -- no wiring needed from the host screen.

import React from "../../react.js";
import { CREATURE_MAP } from "../../data/creatures.js";

function DamageChart({ damageDealt }) {
  const [minimized, setMinimized] = React.useState(false);
  const entries = Object.entries(damageDealt || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const maxDmg = entries.length ? entries[0][1] : 1;

  if (minimized) {
    return React.createElement("div", {
      style: { background: "rgba(255,255,255,0.95)", borderRadius: 10, padding: "8px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", width: 150, flexShrink: 0, boxSizing: "border-box" },
    },
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
        React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 } }, "Damage"),
        React.createElement("button", {
          onClick: () => setMinimized(false),
          title: "Show damage chart",
          style: { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#999", padding: 0, lineHeight: 1 },
        }, "📊")
      )
    );
  }

  return React.createElement("div", {
    style: { background: "rgba(255,255,255,0.95)", borderRadius: 10, padding: "8px 10px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", width: 150, flexShrink: 0, boxSizing: "border-box" },
  },
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: entries.length ? 6 : 0, gap: 8 } },
      React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 } }, "Damage"),
      React.createElement("button", {
        onClick: () => setMinimized(true),
        title: "Minimize damage chart",
        style: { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#999", padding: 0, lineHeight: 1 },
      }, "－")
    ),
    entries.length === 0
      ? React.createElement("div", { style: { fontSize: 10, color: "#bbb" } }, "No damage yet")
      : entries.slice(0, 8).map(([cid, dmg]) => {
          const def = CREATURE_MAP[cid];
          return React.createElement("div", { key: cid, style: { marginBottom: 4 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 6, fontSize: 10, fontWeight: 600, color: "#333" } },
              React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, (def?.emoji || "❓") + " " + (def?.name || cid)),
              React.createElement("span", { style: { flexShrink: 0 } }, Math.round(dmg))
            ),
            React.createElement("div", { style: { height: 3, background: "#eee", borderRadius: 2, overflow: "hidden", marginTop: 2 } },
              React.createElement("div", { style: { height: "100%", width: (dmg / maxDmg * 100) + "%", background: "#534AB7", borderRadius: 2, transition: "width 0.35s ease-out" } })
            )
          );
        })
  );
}

export default DamageChart;
