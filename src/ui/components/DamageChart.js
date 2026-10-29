// Live damage-dealt chart shown during any auto-battle. Reads the
// creatureId -> {basic, special, passive} map that each battle's tick loop
// maintains (see creditDamage in battle/tick.js), and updates every tick via
// the same snapshot state the grid/HP bars use. Self-contained minimize
// toggle -- no wiring needed from the host screen.
//
// It fills the width its slot gives it (150px on wide screens). On a phone it
// sits beside the fight board in whatever is left -- as little as ~70px next
// to a six-column board -- so below a threshold (the .damage-chart container
// query in components.css) it swaps each creature's name for its icon, the
// legend for initials, the title for "DMG", and long totals for "12.3k". Both
// forms are rendered and the stylesheet shows one, so the switch follows the
// real width with no measuring here.

import React from "../../react.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import CreatureIcon from "./CreatureIcon.js";

// Colours match the ability cards on the dex page, so "green = basic" reads
// the same wherever a player sees an ability broken out.
const SOURCES = [
  { key: "basic", label: "Basic", color: "#639922" },
  { key: "special", label: "Special", color: "#7F77DD" },
  { key: "passive", label: "Passive", color: "#EF9F27" },
];

const CARD_STYLE = { width: "100%", background: "rgba(255,255,255,0.95)", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", boxSizing: "border-box" };
const TITLE_STYLE = { fontSize: 10, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, overflow: "hidden", textOverflow: "ellipsis" };
const TOGGLE_STYLE = { background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#999", padding: 0, lineHeight: 1, flexShrink: 0 };

/** "12.3k" for the narrow form; small totals stay exact. */
function shortTotal(n) {
  return n >= 10000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
}

/** Both forms of a label; the stylesheet shows the one that fits. */
function twoForms(long, short) {
  return React.createElement(React.Fragment, null,
    React.createElement("span", { className: "dc-long" }, long),
    React.createElement("span", { className: "dc-short" }, short)
  );
}

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
    return React.createElement("div", { className: "damage-chart", style: CARD_STYLE },
      React.createElement("div", { className: "dc-body", style: { padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
        React.createElement("div", { style: TITLE_STYLE }, twoForms("Damage", "DMG")),
        React.createElement("button", { onClick: () => setMinimized(false), title: "Show damage chart", style: TOGGLE_STYLE }, "📊")
      )
    );
  }

  return React.createElement("div", { className: "damage-chart", style: CARD_STYLE },
    React.createElement("div", { className: "dc-body", style: { padding: "8px 10px" } },
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: entries.length ? 6 : 0, gap: 8 } },
        React.createElement("div", { style: TITLE_STYLE }, twoForms("Damage", "DMG")),
        React.createElement("button", { onClick: () => setMinimized(true), title: "Minimize damage chart", style: TOGGLE_STYLE }, "－")
      ),
      entries.length === 0
        ? React.createElement("div", { style: { fontSize: 10, color: "#bbb" } }, twoForms("No damage yet", "None yet"))
        : React.createElement(React.Fragment, null,
            // Legend, once at the top -- the bars are too thin to label.
            React.createElement("div", { style: { display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap" } },
              SOURCES.map((s) => React.createElement("span", { key: s.key, style: { display: "flex", alignItems: "center", gap: 3, fontSize: 8, fontWeight: 700, color: "#888" } },
                React.createElement("span", { style: { width: 6, height: 6, borderRadius: 2, background: s.color, flexShrink: 0 } }),
                twoForms(s.label, s.label[0])
              ))
            ),
            entries.slice(0, 8).map(({ cid, split, total }) => {
              const def = CREATURE_MAP[cid];
              const rounded = Math.round(total);
              return React.createElement("div", { key: cid, style: { marginBottom: 5 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, fontSize: 10, fontWeight: 600, color: "#333" } },
                  React.createElement("span", { className: "dc-long", style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, def?.name || cid),
                  React.createElement("span", { className: "dc-short", title: def?.name || cid, style: { flexShrink: 0, lineHeight: 0 } },
                    def ? React.createElement(CreatureIcon, { def, size: 14, contain: true }) : "❓"),
                  React.createElement("span", { style: { flexShrink: 0 } }, twoForms(rounded, shortTotal(rounded)))
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
    )
  );
}

export default DamageChart;
