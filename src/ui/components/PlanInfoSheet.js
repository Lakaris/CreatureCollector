// The planning phase's info popup: a bottom sheet that slides up in place of
// the creature tray when a creature, enemy or boss on the board is pressed.
//
// A sheet rather than a centred popup because the board has to stay in view:
// you read an enemy's kit while looking at where it stands, and the Dungeon's
// boss rows light up the tiles they hit. The tray is the one thing you don't
// need while reading, so the sheet takes its slot -- screens hide the tray
// while one is open and render the sheet as the planning column's last child.
// It sits IN the layout rather than over it: a sheet taller than the tray
// would otherwise cover the board's back rows, and in the layout the board
// just shrinks to fit above it (useFitTile). One card at a time -- pressing
// another piece swaps the card, the × closes it.
//
// Every planning screen (Arena, Labyrinth/Descend, Dungeon, Daily Boss and the
// tutorial's practice board) renders its card through these pieces, so they all
// read the same.

import React from "../../react.js";
import { AbilityTagPills } from "./AbilityTagPills.js";
import { getAbilityTags } from "../../core/abilityText.js";

export const ABILITY_LABELS = { basic: "Basic", special: "Special", unique: "Passive" };

/** The sheet itself: close button plus whatever card body the screen passes. */
export function PlanInfoSheet({ onClose, children }) {
  return React.createElement("div", {
    className: "plan-info-sheet",
    // The tutorial's overlay listens for clicks on its root.
    onClick: (e) => e.stopPropagation(),
    style: {
      position: "relative", flexShrink: 0, alignSelf: "center", width: "100%", maxWidth: 520, maxHeight: "45%",
      overflowY: "auto", boxSizing: "border-box", padding: "16px 16px 24px",
      background: "#fff", borderRadius: "16px 16px 0 0", boxShadow: "0 -6px 24px rgba(0,0,0,0.18)",
    },
  },
    React.createElement("button", {
      onClick: onClose,
      title: "Close",
      style: { position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: "50%", background: "#f0f0f0", border: "none", cursor: "pointer", fontSize: 18, fontWeight: 700, color: "#888", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 },
    }, "×"),
    children
  );
}

/** Name line (with an optional icon before it and extra after it) and a muted
 * subtitle. Leaves room on the right for the sheet's close button. */
export function SheetHeader({ icon, title, titleExtra, subtitle }) {
  return React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingRight: 36 } },
    icon && React.createElement("div", { style: { fontSize: 28, lineHeight: 1, flexShrink: 0 } }, icon),
    React.createElement("div", { style: { minWidth: 0 } },
      React.createElement("div", { style: { fontSize: 16, fontWeight: 800, color: "#111", display: "flex", alignItems: "center", gap: 5 } }, title, titleExtra),
      subtitle && React.createElement("div", { style: { fontSize: 12, color: "#666", fontWeight: 600 } }, subtitle)
    )
  );
}

/**
 * One ability: label and tag pills on top, then its name and description.
 * With `onClick` the row is a toggle (the Dungeon boss's "show the tiles this
 * hits"), boxed in red while `active` -- the same red as the tiles it lights.
 * The border is there in both states and only changes colour, so toggling
 * never nudges the text.
 */
export function SheetAbilityRow({ label, tags, name, desc, onTag, onClick, active }) {
  const style = onClick
    ? { borderRadius: 8, padding: "8px 10px", margin: "0 -10px 4px", cursor: "pointer", border: "1.5px solid " + (active ? "rgba(239,68,68,0.5)" : "transparent"), background: active ? "rgba(239,68,68,0.10)" : "transparent" }
    : { marginBottom: 12 };
  return React.createElement("div", { onClick, style },
    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 2 } },
      React.createElement("div", { style: { fontSize: 10, fontWeight: 800, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 } }, label),
      tags && tags.length > 0 && React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" } },
        React.createElement(AbilityTagPills, { tags, onOpen: onTag })
      )
    ),
    React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#111" } }, name),
    desc && React.createElement("div", { style: { fontSize: 12, color: "#555", marginTop: 2, lineHeight: 1.4 } }, desc)
  );
}

/**
 * A creature's card: header, then its three abilities. `descFor(k, abl)`
 * picks the tier the text is read at -- an ally's own ability level, or an
 * enemy's maxed kit. (Trials enemies, which wear gear, use TrialsHome's own
 * header and body instead.)
 */
export function CreatureSheetBody({ def, subtitle, titleExtra, descFor, onTag }) {
  return React.createElement(React.Fragment, null,
    React.createElement(SheetHeader, { title: def.name, titleExtra, subtitle }),
    def.abilities && Object.entries(def.abilities).map(([k, abl]) => abl && React.createElement(SheetAbilityRow, {
      key: k, label: ABILITY_LABELS[k] || k, tags: getAbilityTags(def.id, k), name: abl.name, desc: descFor(k, abl), onTag,
    }))
  );
}

/** An ally's text: the tier its own ability level has reached. */
export function allyDesc(oc) {
  return (k, abl) => {
    const lvl = oc && oc.abilityLevels ? oc.abilityLevels[k] || 0 : 0;
    return abl.upgrades ? abl.upgrades[Math.min(lvl, abl.upgrades.length - 1)] : "";
  };
}
