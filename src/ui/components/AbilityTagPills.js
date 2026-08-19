// The tag-pill row and definition popup shared by every screen that shows an
// ability card (creature page, dex, and the battle planning panels).
//
// Targeting tags (Closest/Farthest/Weakest) render as their own pills; all
// other tags collapse into one "Effects" pill whose popup lists every effect
// with its description, so stacked effects never crowd the ability name.
//
// Popup payloads: a tag key string (single definition, also used for the ⚡
// "energy" pill the creature page/dex render themselves), or {effects:[...]}
// (the Effects pill's list view). Screens keep the payload in their own state
// and render AbilityTagPopup with it.

import React from "../../react.js";
import { ABILITY_TAG_DEFS, splitAbilityTags } from "../../core/abilityText.js";

const PILL_BASE = {
  fontSize: 9, fontWeight: 800, borderRadius: 10, padding: "1px 8px",
  cursor: "pointer", lineHeight: 1.5, flexShrink: 0, whiteSpace: "nowrap",
};
/** Targeting pills keep the original purple. */
const PILL_STYLE = {
  ...PILL_BASE, color: "#534AB7", background: "#EEEDFE",
  border: "1px solid rgba(83,74,183,0.4)",
};
/** The Effects pill gets its own amber so it reads as a separate control
 * from the targeting pills (purple) and the ⚡ energy pill (blue). */
const EFFECTS_COLOR = "#B45309";
const EFFECTS_PILL_STYLE = {
  ...PILL_BASE, color: EFFECTS_COLOR, background: "#FEF3C7",
  border: "1px solid rgba(180,83,9,0.4)",
};

/**
 * Pills for one ability's tags. `onOpen` receives the popup payload (tag key
 * or {effects}); the caller stores it and renders AbilityTagPopup with it.
 */
export function AbilityTagPills({ tags, onOpen }) {
  if (!tags || !tags.length) return null;
  const { targeting, effects } = splitAbilityTags(tags);
  return React.createElement(React.Fragment, null,
    effects.length > 0 && React.createElement("button", {
      key: "effects",
      onClick: (e) => { e.stopPropagation(); onOpen({ effects }); },
      style: EFFECTS_PILL_STYLE,
    }, "Effects"),
    ...targeting.map((tag) => React.createElement("button", {
      key: tag,
      onClick: (e) => { e.stopPropagation(); onOpen(tag); },
      style: PILL_STYLE,
    }, ABILITY_TAG_DEFS[tag].label))
  );
}

/** "Undispellable" marker shown beside a tag's name rather than buried in its text. */
function undispellableBadge(def) {
  if (!def.undispellable) return null;
  return React.createElement("span", {
    style: {
      fontSize: 9, fontWeight: 800, color: "#6B7280", background: "#F3F4F6",
      border: "1px solid #E5E7EB", borderRadius: 8, padding: "1px 6px",
      marginLeft: 6, whiteSpace: "nowrap", verticalAlign: "middle",
    },
  }, "Undispellable");
}

/** Per-stack totals for stacking effects (1 through 5 stacks). */
function stackingLine(def) {
  if (!def.stacking) return null;
  return React.createElement("div", {
    style: { fontSize: 11, color: "#777", lineHeight: 1.4, marginTop: 3 },
  }, "Stacking effect: " + def.stacking.map((n) => n + "%").join(" / "));
}

/** Full-screen definition popup: one tag, or the Effects pill's list. */
export function AbilityTagPopup({ popup, onClose }) {
  if (!popup) return null;
  const effects = typeof popup === "object" ? popup.effects : null;
  return React.createElement("div", {
    onClick: onClose,
    style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 },
  },
    React.createElement("div", {
      onClick: (e) => e.stopPropagation(),
      style: { background: "#fff", borderRadius: 14, padding: "18px 20px", width: 280, maxWidth: "85vw", maxHeight: "70vh", overflowY: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.25)" },
    },
      effects
        ? React.createElement(React.Fragment, null,
            React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 10 } }, "Effects"),
            effects.map((tag, i) => React.createElement("div", { key: tag, style: { marginBottom: i === effects.length - 1 ? 16 : 12 } },
              React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: EFFECTS_COLOR, marginBottom: 2 } },
                ABILITY_TAG_DEFS[tag].label, undispellableBadge(ABILITY_TAG_DEFS[tag])),
              React.createElement("div", { style: { fontSize: 12, color: "#555", lineHeight: 1.4 } }, ABILITY_TAG_DEFS[tag].description),
              stackingLine(ABILITY_TAG_DEFS[tag])
            ))
          )
        : React.createElement(React.Fragment, null,
            React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 8 } },
              ABILITY_TAG_DEFS[popup].label, undispellableBadge(ABILITY_TAG_DEFS[popup])),
            React.createElement("div", { style: { fontSize: 13, color: "#555", lineHeight: 1.4, marginBottom: ABILITY_TAG_DEFS[popup].stacking ? 4 : 16 } }, ABILITY_TAG_DEFS[popup].description),
            ABILITY_TAG_DEFS[popup].stacking && React.createElement("div", { style: { marginBottom: 16 } }, stackingLine(ABILITY_TAG_DEFS[popup]))
          ),
      React.createElement("button", {
        onClick: onClose,
        style: { width: "100%", padding: "9px 0", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" },
      }, "Close")
    )
  );
}
