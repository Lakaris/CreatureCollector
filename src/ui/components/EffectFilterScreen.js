// The "Effects" filter, as a full page (opened from the Collection and Dex
// filter panels): effect tiles on the left, and a pinned reader panel on the
// right showing the tapped effect's full definition -- description, stacking
// table, max stacks, undispellable note, and a summon's kit, rendered by the
// same helpers the ability-card popups use so the text always matches.
//
// A tap does two things at once: toggles the effect in the filter AND focuses
// its description. Selection is the purple fill; the focused tile carries an
// outline so you can read an effect without losing track of what's selected.

import React, { useMemo, useState } from "../../react.js";
import { ALL_DEX_FORMS } from "../../data/creatures.js";
import { ABILITY_TAG_DEFS, TARGETING_TAGS, getCreatureEffectLabels } from "../../core/abilityText.js";
import { undispellableNote, maxStacksNote, stackingLine, summonKit } from "./AbilityTagPills.js";
import ScreenHeader from "./ScreenHeader.js";

/**
 * {targeting, effects, defs}: sorted label lists limited to labels some
 * creature's kit actually carries, plus label -> tag definition for the
 * reader panel. Twin tags sharing a label (Root and its undispellable stance
 * variant) resolve to the FIRST definition in ABILITY_TAG_DEFS -- the plain
 * one, which is the general rule rather than one creature's exception.
 * The roster is static for a session, so this is computed once.
 */
let catalogCache = null;
export function effectFilterCatalog() {
  if (catalogCache) return catalogCache;
  const targetingLabels = new Set(
    [...TARGETING_TAGS].map((k) => ABILITY_TAG_DEFS[k]?.label).filter(Boolean)
  );
  // Area shapes group under Targeting on THIS page -- they describe where an
  // ability lands, like Closest/Beside do. Deliberately not added to
  // TARGETING_TAGS itself: that set also decides which tags get standalone
  // purple pills on ability cards, and these three stay in the Effects pill.
  for (const k of ["horizontalrow", "line", "nearby", "splash"]) {
    const label = ABILITY_TAG_DEFS[k]?.label;
    if (label) targetingLabels.add(label);
  }
  const defs = new Map();
  for (const [key, def] of Object.entries(ABILITY_TAG_DEFS)) {
    if (key === "energy") continue;
    if (!defs.has(def.label)) defs.set(def.label, def);
  }
  const carried = new Set();
  for (const def of ALL_DEX_FORMS) {
    for (const label of getCreatureEffectLabels(def.id)) carried.add(label);
  }
  const targeting = [], effects = [];
  for (const label of carried) (targetingLabels.has(label) ? targeting : effects).push(label);
  targeting.sort();
  effects.sort();
  return (catalogCache = { targeting, effects, defs });
}

const SECTION_LABEL_STYLE = { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", textAlign: "left", margin: "10px 0 4px" };

// Uniform square tiles filling the page's width; auto-fill keeps every tile
// in a row the same size at any screen width. The fixed height fits the
// longest label ("Ability Charge Removal") on two centred lines. Styled
// heavier than the app's filter chips -- a 2px line and a white fill against
// the grey page -- and set inline (which outweighs the .filter-chip class),
// so both states are written out here.
const TILE_GRID_STYLE = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(105px, 1fr))", gap: 6 };
const TILE_STYLE = { width: "100%", height: 40, borderRadius: 4, padding: "2px 4px", whiteSpace: "normal", lineHeight: 1.25, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", borderWidth: 2, borderStyle: "solid" };
const TILE_OFF = { ...TILE_STYLE, background: "#fff", borderColor: "rgba(0,0,0,0.25)", color: "#666" };
const TILE_ON = { ...TILE_STYLE, background: "#534AB7", borderColor: "#534AB7", color: "#fff" };

function EffectFilterScreen({ active, onToggle, onClear, onBack }) {
  const catalog = useMemo(effectFilterCatalog, []);
  const [focused, setFocused] = useState(null);
  const focusedDef = focused ? catalog.defs.get(focused) : null;

  // The description pins at EXACTLY its natural resting position -- the
  // sticky header's height plus its bottom margin -- so scrolling never
  // moves it, not even the first few pixels. Measured off the header itself
  // (the sticky div's previous sibling) because the header's height is
  // font-rendering dependent and a hardcoded offset drifts by a few pixels.
  const [pinTop, setPinTop] = useState(64);
  const measurePin = (el) => {
    const header = el && el.previousElementSibling;
    if (!header) return;
    const gap = header.getBoundingClientRect().height + (parseFloat(getComputedStyle(header).marginBottom) || 0);
    if (Math.abs(gap - pinTop) > 0.5) setPinTop(gap);
  };

  const tile = (label) =>
    React.createElement("button", {
      key: label,
      className: "filter-chip" + (active.has(label) ? " active" : ""),
      style: { ...(active.has(label) ? TILE_ON : TILE_OFF), ...(focused === label ? { boxShadow: "0 0 0 2px rgba(83,74,183,0.35)" } : null) },
      onClick: () => { setFocused(label); onToggle(label); },
    }, label);

  return React.createElement("div", null,
    React.createElement(ScreenHeader, { title: "Effect Filters", onBack, right:
      React.createElement("button", {
        className: "btn btn-sm",
        onClick: onClear,
        disabled: active.size === 0,
        style: { marginBottom: 0, padding: "4px 12px", lineHeight: 1.2, opacity: active.size === 0 ? 0.5 : 1, cursor: active.size === 0 ? "not-allowed" : "pointer" },
      }, "Clear (" + active.size + ")"),
    }),
    // The description area: plain text (no card) pinned directly under the
    // sticky ScreenHeader (~53px), so it holds still while the tile list
    // scrolls beneath it. The wrapper carries the page background so tiles
    // slide under cleanly, and a tall definition (Wisp's kit) scrolls inside
    // its own capped height rather than eating the screen. Selection state
    // needs no text here -- the tile's purple fill says it. Nothing renders
    // until an effect has been tapped.
    // The negative-offset box shadow paints the page background over the
    // header's bottom-margin band above the pinned block, so tiles cannot
    // peek through the gap while scrolling underneath.
    focusedDef && React.createElement("div", { ref: measurePin, style: { position: "sticky", top: pinTop, zIndex: 4, background: "#f5f5f5", boxShadow: "0 -14px 0 0 #f5f5f5", padding: "6px 2px 8px", maxHeight: "calc(32 * var(--vh))", overflowY: "auto" } },
      React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 6 } },
        focusedDef.label, undispellableNote(focusedDef), maxStacksNote(focusedDef)),
      React.createElement("div", { style: { fontSize: 13, color: "#555", lineHeight: 1.5 } }, focusedDef.description),
      stackingLine(focusedDef),
      summonKit(focusedDef)
    ),
    // Below: the full-width tile list, scrolling under the pinned description.
    React.createElement("div", { style: SECTION_LABEL_STYLE }, "Targeting"),
    React.createElement("div", { style: TILE_GRID_STYLE }, catalog.targeting.map(tile)),
    React.createElement("div", { style: SECTION_LABEL_STYLE }, "Effects"),
    React.createElement("div", { style: TILE_GRID_STYLE }, catalog.effects.map(tile))
  );
}

export default EffectFilterScreen;
