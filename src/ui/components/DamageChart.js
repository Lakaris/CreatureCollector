// Live damage-dealt chart shown during any auto-battle. Reads the
// creatureId -> {basic, special, passive} map that each battle's tick loop
// maintains (see creditDamage in battle/tick.js), and updates every tick via
// the same snapshot state the grid/HP bars use. Self-contained minimize
// toggle -- no wiring needed from the host screen.

import React from "../../react.js";
import { CREATURE_MAP } from "../../data/creatures.js";

// Colours match the ability cards on the dex page, so "green = basic" reads
// the same wherever a player sees an ability broken out.
const SOURCES = [
  { key: "basic", label: "Basic", color: "#639922" },
  { key: "special", label: "Special", color: "#7F77DD" },
  { key: "passive", label: "Passive", color: "#EF9F27" },
];

function DamageChart({ damageDealt }) {
  const [minimized, setMinimized] = React.useState(false);
  const entries = Object.entries(damageDealt || {})
    .map(([cid, row]) => {
      const split = SOURCES.map((s) => (row && row[s.key]) || 0);
      return { cid, split, total: split.reduce((a, b) => a + b, 0) };
    })
    .filter((e) => e.total > 0)
    .sort((a, b) => b.total - a.total);
  const maxDmg = entries.length ? entries[0].total : 1;

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
      : React.createElement(React.Fragment, null,
          // Legend, once at the top -- the bars are too thin to label.
          React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" } },
            SOURCES.map((s) => React.createElement("span", { key: s.key, style: { display: "flex", alignItems: "center", gap: 3, fontSize: 8, fontWeight: 700, color: "#888" } },
              React.createElement("span", { style: { width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0 } }),
              s.label
            ))
          ),
          entries.slice(0, 8).map(({ cid, split, total }) => {
            const def = CREATURE_MAP[cid];
            return React.createElement("div", { key: cid, style: { marginBottom: 5 } },
              React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: 6, fontSize: 10, fontWeight: 600, color: "#333" } },
                React.createElement("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, def?.name || cid),
                React.createElement("span", { style: { flexShrink: 0 } }, Math.round(total))
              ),
              // One bar per creature, split into its three sources. Each
              // segment is sized against the top creature's total, so bar
              // lengths stay comparable between rows and the segment widths
              // show the mix within a row.
              React.createElement("div", { style: { display: "flex", height: 4, background: "#eee", borderRadius: 2, overflow: "hidden", marginTop: 2 } },
                SOURCES.map((s, i) => split[i] > 0 && React.createElement("div", {
                  key: s.key,
                  title: s.label + " " + Math.round(split[i]),
                  style: { height: "100%", width: (split[i] / maxDmg * 100) + "%", background: s.color, transition: "width 0.35s ease-out" },
                }))
              )
            );
          })
        )
  );
}

export default DamageChart;
