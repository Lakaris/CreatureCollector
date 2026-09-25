// The "Effects" filter, as a full page (opened from the Collection and Dex
// filter panels): effect tiles on the left, and a pinned reader panel on the
// right showing the tapped effect's full definition -- description, stacking
// table, max stacks, undispellable note, and a summon's kit, rendered by the
// same helpers the ability-card popups use so the text always matches.
//
// A tap does two things at once: toggles the effect in the filter AND focuses
// its description. Selection is the purple fill; the focused tile carries an
// outline so you can read an effect without losing track of what's selected.

import React, { useMemo, useState, useEffect } from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { ALL_DEX_FORMS } from "../../data/creatures.js";
import { EQUIPMENT_DEFS } from "../../data/equipment.js";
import { ABILITY_TAG_DEFS, TARGETING_TAGS, getCreatureEffectLabels } from "../../core/abilityText.js";
import { undispellableNote, maxStacksNote, stackingLine, summonKit } from "./AbilityTagPills.js";
import ScreenHeader from "./ScreenHeader.js";

/**
 * {targeting, effects, defs}: sorted label lists limited to labels some
 * creature's kit or some item's effect actually carries, plus label -> tag definition for the
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
  // Cone is already in TARGETING_TAGS (it gets a standalone pill on cards);
  // these four are Effects-pill tags that still read as shapes here.
  for (const k of ["horizontalrow", "line", "nearby", "splash"]) {
    const label = ABILITY_TAG_DEFS[k]?.label;
    if (label) targetingLabels.add(label);
  }
  const defs = new Map();
  for (const [key, def] of Object.entries(ABILITY_TAG_DEFS)) {
    if (key === "energy") continue;
    if (!defs.has(def.label)) defs.set(def.label, def);
  }
  // Ground effects get a section of their own: they are terrain a creature
  // leaves behind rather than a status it inflicts, and grouping them keeps
  // the Effects list to things that live on a creature.
  const hazardLabels = new Set(
    ["firehazard", "waterhazard", "windhazard"].map((k) => ABILITY_TAG_DEFS[k]?.label).filter(Boolean)
  );
  const carried = new Set();
  for (const def of ALL_DEX_FORMS) {
    for (const label of getCreatureEffectLabels(def.id)) carried.add(label);
  }
  // Effects equipment grants are listed too, so their definitions can be
  // read here even when no creature's kit carries them (selecting one still
  // matches only creature kits). An item grants every effect its text names
  // as a whole word ("Seeded", "Wind Hazard").
  for (const item of EQUIPMENT_DEFS) {
    if (!item.effect) continue;
    for (const label of defs.keys()) {
      if (new RegExp("\\b" + label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(item.effect)) carried.add(label);
    }
  }
  const targeting = [], hazards = [], effects = [];
  for (const label of carried) {
    if (targetingLabels.has(label)) targeting.push(label);
    else if (hazardLabels.has(label)) hazards.push(label);
    else effects.push(label);
  }
  targeting.sort();
  hazards.sort();
  effects.sort();
  return (catalogCache = { targeting, hazards, effects, defs });
}

const SECTION_LABEL_STYLE = { fontSize: 10, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: ".05em", textAlign: "left", margin: "10px 0 4px" };

// Height the pinned description block always holds, so the tiles sit in the
// same place before and after the first tap. Sized for the common shape --
// a label line plus a two-line description at these font sizes -- and
// measured rather than guessed; see the note at the block itself.
const PIN_MIN_HEIGHT = 84;

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

  // Tell App.js this page is up, so it drops the dev panel and outer scroll
  // for as long as it is -- this screen fills exactly one viewport and does
  // its own scrolling, and anything mounted beneath it only adds a second
  // scrollbar that drags the description off the top. Cleared on unmount.
  const { setEffectFilterOpen } = useGame();
  useEffect(() => { setEffectFilterOpen(true); return () => setEffectFilterOpen(false); }, []);

  const tile = (label) =>
    React.createElement("button", {
      key: label,
      className: "filter-chip" + (active.has(label) ? " active" : ""),
      style: { ...(active.has(label) ? TILE_ON : TILE_OFF), ...(focused === label ? { boxShadow: "0 0 0 2px rgba(83,74,183,0.35)" } : null) },
      onClick: () => { setFocused(label); onToggle(label); },
    }, label);

  // The screen is a column that fills its scroll container (.app-content)
  // exactly: header, then the description, then the tile list -- and ONLY the
  // tile list scrolls, in a region of its own below the other two. That is
  // what makes the description hold still at the top without ever sitting on
  // top of a tile: nothing is sticky, so nothing has anything to slide under.
  // (The earlier sticky version pinned the same block over the list, and an
  // empty pinned band then rode down over the tiles.)
  return React.createElement("div", { style: { height: "100%", display: "flex", flexDirection: "column", minHeight: 0 } },
    React.createElement(ScreenHeader, { title: "Effect Filters", onBack, right:
      React.createElement("button", {
        className: "btn btn-sm",
        onClick: onClear,
        disabled: active.size === 0,
        style: { marginBottom: 0, padding: "4px 12px", lineHeight: 1.2, opacity: active.size === 0 ? 0.5 : 1, cursor: active.size === 0 ? "not-allowed" : "pointer" },
      }, "Clear (" + active.size + ")"),
    }),
    // The description area: plain text (no card), always rendered at a
    // reserved minimum height so the first tap fills space that was already
    // there instead of pushing the tiles down. The reserve fits a label plus
    // a two-line description -- the common shape -- so only the few
    // definitions with a stacking table grow past it, and a tall one scrolls
    // inside its own capped height rather than eating the screen. Selection
    // state needs no text here -- the tile's purple fill says it.
    // A rule along its bottom edge marks where the description ends and the
    // scrolling list begins -- otherwise the two share a background and the
    // boundary is only visible once a tile is clipped against it.
    React.createElement("div", { style: { flexShrink: 0, padding: "6px 2px 8px", minHeight: PIN_MIN_HEIGHT, maxHeight: "calc(32 * var(--vh))", overflowY: "auto", borderBottom: "1px solid rgba(0,0,0,0.12)" } },
      focusedDef && React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 6 } },
        focusedDef.label, undispellableNote(focusedDef), maxStacksNote(focusedDef)),
      focusedDef && React.createElement("div", { style: { fontSize: 13, color: "#555", lineHeight: 1.5 } }, focusedDef.description),
      focusedDef && stackingLine(focusedDef),
      focusedDef && summonKit(focusedDef)
    ),
    // The tile list: the one part of the screen that scrolls. min-height: 0
    // lets a flex child shrink below its content so overflow can kick in.
    React.createElement("div", { style: { flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 16 } },
      React.createElement("div", { style: SECTION_LABEL_STYLE }, "Targeting"),
      React.createElement("div", { style: TILE_GRID_STYLE }, catalog.targeting.map(tile)),
      React.createElement("div", { style: SECTION_LABEL_STYLE }, "Hazards"),
      React.createElement("div", { style: TILE_GRID_STYLE }, catalog.hazards.map(tile)),
      React.createElement("div", { style: SECTION_LABEL_STYLE }, "Effects"),
      React.createElement("div", { style: TILE_GRID_STYLE }, catalog.effects.map(tile))
    )
  );
}

export default EffectFilterScreen;
