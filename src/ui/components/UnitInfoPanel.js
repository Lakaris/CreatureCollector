// Info panel shown when a deployed creature or boss is tapped during any
// battle phase. Reads plain display data derived fresh from the current tick
// snapshot each render, so HP/debuffs stay live while it's open.

import React from "../../react.js";

export const DEBUFF_DEFS = [
  { key: "burnTicks", icon: "🔥", label: "Burn" },
  { key: "poisonTicks", icon: "🐍", label: "Poison" },
  { key: "dotTicks", icon: "🟣", label: "Shadow DoT" },
  { key: "rootTicks", icon: "🌱", label: "Rooted" },
  { key: "weakTicks", icon: "⬇️", label: "Weakened" },
  { key: "slowTicks", icon: "🐌", label: "Slowed" },
  { key: "shockTicks", icon: "⚡", label: "Shocked" },
  { key: "healImmuneTicks", icon: "🚫", label: "Heal Block" },
];

/** Build the debuffs list UnitInfoPanel expects from a unit's raw tick fields. */
export function debuffsFor(u) {
  if (!u) return [];
  return DEBUFF_DEFS.filter((d) => (u[d.key] || 0) > 0);
}

function UnitInfoPanel({ emoji, name, subtitle, hp, maxHp, shield, debuffs, onClose }) {
  const pct = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
  return React.createElement("div", {
    style: { width: 150, flexShrink: 0, background: "#fff", borderRadius: 10, padding: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", boxSizing: "border-box" },
  },
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 6 } },
      React.createElement("div", { style: { fontSize: 20, lineHeight: 1, flexShrink: 0 } }, emoji),
      React.createElement("div", { style: { flex: 1, minWidth: 0 } },
        React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, name),
        subtitle && React.createElement("div", { style: { fontSize: 9, color: "#888", fontWeight: 600 } }, subtitle)
      ),
      React.createElement("button", {
        onClick: onClose,
        title: "Close",
        style: { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#999", padding: 0, lineHeight: 1, flexShrink: 0 },
      }, "×")
    ),
    React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#888", marginBottom: 2, display: "flex", justifyContent: "space-between" } },
      React.createElement("span", null, "HP"),
      React.createElement("span", null, Math.max(0, Math.round(hp)) + " / " + Math.round(maxHp))
    ),
    React.createElement("div", { style: { height: 6, background: "#eee", borderRadius: 3, overflow: "hidden" } },
      React.createElement("div", { style: { height: "100%", width: pct + "%", background: pct > 25 ? "#22c55e" : "#ef4444", borderRadius: 3, transition: "width 0.35s ease-out" } })
    ),
    shield > 0 && React.createElement(React.Fragment, null,
      React.createElement("div", { style: { fontSize: 9, fontWeight: 700, color: "#888", marginTop: 6, marginBottom: 2, display: "flex", justifyContent: "space-between" } },
        React.createElement("span", null, "Shield"),
        React.createElement("span", null, Math.round(shield))
      ),
      React.createElement("div", { style: { height: 5, background: "#eee", borderRadius: 3, overflow: "hidden" } },
        React.createElement("div", { style: { height: "100%", width: Math.min(100, (shield / maxHp) * 100) + "%", background: "#60a5fa", borderRadius: 3, transition: "width 0.35s ease-out" } })
      )
    ),
    React.createElement("div", { style: { fontSize: 9, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 8, marginBottom: 4 } }, "Debuffs"),
    (debuffs && debuffs.length)
      ? React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 3 } },
          debuffs.map((d) => React.createElement("div", { key: d.key, style: { display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 600, color: "#333" } },
            React.createElement("span", { style: { fontSize: 12 } }, d.icon),
            React.createElement("span", null, d.label)
          ))
        )
      : React.createElement("div", { style: { fontSize: 10, color: "#bbb" } }, "None")
  );
}

export default UnitInfoPanel;
