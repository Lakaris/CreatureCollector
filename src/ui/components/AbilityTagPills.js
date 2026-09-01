// The tag-pill row and definition popup shared by every screen that shows an
// ability card (creature page, dex, and the battle planning panels).
//
// Targeting tags (Closest/Farthest/Weakest) render as their own pills; all
// other tags collapse into one "Effects" pill whose popup lists every effect
// with its description, so stacked effects never crowd the ability name.
//
// `compact` collapses EVERYTHING into that one pill, targeting included. The
// battle planning panels use it: they are a narrow column beside the board, and
// two pills there wrap the ability name onto another line. Nothing is lost --
// the targeting definitions move into the popup under their own heading.
//
// Popup payloads: a tag key string (single definition, also used for the ⚡
// "energy" pill the creature page/dex render themselves), or {effects:[...],
// targeting:[...]} (the list view; `targeting` only in compact mode). Screens
// keep the payload in their own state and render AbilityTagPopup with it.

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
 * or {effects, targeting}); the caller stores it and renders AbilityTagPopup
 * with it. `compact` folds targeting into the single pill (see header).
 */
export function AbilityTagPills({ tags, onOpen, compact }) {
  if (!tags || !tags.length) return null;
  const { targeting, effects } = splitAbilityTags(tags);
  if (compact) {
    // One pill for everything, always the amber "Effects" one -- including for
    // an ability whose only tags are targeting. The pill is the panel's single
    // "there is more to read here" control, so it should look and read the same
    // on every ability; varying its label and colour by what happens to be
    // inside made a column of abilities look like it had two kinds of button.
    return React.createElement("button", {
      onClick: (e) => { e.stopPropagation(); onOpen({ effects, targeting }); },
      style: EFFECTS_PILL_STYLE,
    }, "Effects");
  }
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

/**
 * Qualifiers written beside a tag's name instead of inside its description:
 * "Undispellable" and a stacking effect's ceiling ("Max 10 stacks").
 *
 * Deliberately plain muted text rather than pills -- the popup's only pill-
 * shaped things are the tag pills that opened it, so a bordered badge here
 * reads as another tag. These are footnotes on the title, the way
 * Restrained's "Never expires." is a footnote on its description.
 */
const NAME_NOTE_STYLE = { fontSize: 10, fontWeight: 600, color: "#999", marginLeft: 6, whiteSpace: "nowrap" };

export function undispellableNote(def) {
  if (!def.undispellable) return null;
  return React.createElement("span", { style: NAME_NOTE_STYLE }, "Undispellable");
}

export function maxStacksNote(def) {
  if (!def.maxStacks) return null;
  return React.createElement("span", { style: NAME_NOTE_STYLE }, "Max " + def.maxStacks + " stacks");
}

/**
 * Per-stack totals for stacking effects (1 through 5 stacks). `stackingLabel`
 * overrides the lead-in for effects whose stacks aren't a plain magnitude --
 * Damage Over Time reads "Damage per tick" rather than "Stacking effect".
 */
export function stackingLine(def) {
  if (!def.stacking) return null;
  return React.createElement("div", {
    style: { fontSize: 11, color: "#777", lineHeight: 1.4, marginTop: 3 },
  }, (def.stackingLabel || "Stacking effect") + ": " + def.stacking.map((n) => n + "%").join(" / "));
}

/** True when a tag renders anything below its description (stacking totals or
 * a summon's kit), which the single-tag view uses to place its bottom gap. */
function hasExtras(def) {
  return !!(def.stacking || def.profile || def.kit);
}

/**
 * Summoned-creature tags (Wisp) carry their own type line and three-ability
 * kit, shown as a miniature ability card under the tag's description so the
 * summon's behavior lives in one place instead of in every summoning ability.
 */
export function summonKit(def) {
  if (!def.profile && !def.kit) return null;
  return React.createElement(React.Fragment, null,
    def.profile && React.createElement("div", {
      style: { fontSize: 11, fontWeight: 700, color: "#888", marginTop: 4 },
    }, def.profile),
    def.kit && React.createElement("div", null,
      def.kit.map((a) => React.createElement("div", { key: a.key, style: { marginTop: 6 } },
        React.createElement("div", {
          style: { fontSize: 9, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 },
        }, a.key),
        React.createElement("div", { style: { fontSize: 12, color: "#555", lineHeight: 1.4 } }, a.text)
      ))
    )
  );
}

/**
 * One entry in the list view: coloured label, description, and any extras.
 * `color` separates the amber Effects entries from the purple Targeting ones,
 * matching the pill colours those tags carry when they render standalone.
 */
function tagEntry(tag, color, last) {
  const def = ABILITY_TAG_DEFS[tag];
  return React.createElement("div", { key: tag, style: { marginBottom: last ? 16 : 12 } },
    React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color, marginBottom: 2 } },
      def.label, undispellableNote(def), maxStacksNote(def)),
    React.createElement("div", { style: { fontSize: 12, color: "#555", lineHeight: 1.4 } }, def.description),
    stackingLine(def),
    summonKit(def)
  );
}

/** Section heading, shown only when the popup holds both kinds of tag. */
function sectionHeading(text, first) {
  return React.createElement("div", {
    style: { fontSize: 10, fontWeight: 800, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginTop: first ? 0 : 4, marginBottom: 6 },
  }, text);
}

/** Full-screen definition popup: one tag, or the collapsed pill's list. */
export function AbilityTagPopup({ popup, onClose }) {
  if (!popup) return null;
  const isList = typeof popup === "object";
  const effects = isList ? popup.effects || [] : null;
  // Only compact mode sends targeting through; the standalone pills open their
  // own single-tag view as before.
  const targeting = isList ? popup.targeting || [] : [];
  const bothKinds = isList && effects.length > 0 && targeting.length > 0;
  return React.createElement("div", {
    onClick: onClose,
    // Above 300, which is what the screens that can open this sit at (the
    // Daily Boss's narrow-screen info popup renders after this one in the
    // tree, so at an equal z-index it covered the definition it opened).
    style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400 },
  },
    React.createElement("div", {
      onClick: (e) => e.stopPropagation(),
      style: { background: "#fff", borderRadius: 14, padding: "18px 20px", width: 280, maxWidth: "calc(85 * var(--vw))", maxHeight: "calc(70 * var(--vh))", overflowY: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.25)" },
    },
      isList
        ? React.createElement(React.Fragment, null,
            // Titled to match the pill that opened it, whatever it holds.
            React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 10 } }, "Effects"),
            // Targeting first: it says who the ability picks, which is the
            // thing you read before what happens to them.
            bothKinds && sectionHeading("Targeting", true),
            targeting.map((tag, i) => tagEntry(tag, "#534AB7", !bothKinds && i === targeting.length - 1)),
            bothKinds && sectionHeading("Effects", false),
            effects.map((tag, i) => tagEntry(tag, EFFECTS_COLOR, i === effects.length - 1))
          )
        : React.createElement(React.Fragment, null,
            React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 8 } },
              ABILITY_TAG_DEFS[popup].label, undispellableNote(ABILITY_TAG_DEFS[popup]), maxStacksNote(ABILITY_TAG_DEFS[popup])),
            React.createElement("div", { style: { fontSize: 13, color: "#555", lineHeight: 1.4, marginBottom: hasExtras(ABILITY_TAG_DEFS[popup]) ? 4 : 16 } }, ABILITY_TAG_DEFS[popup].description),
            ABILITY_TAG_DEFS[popup].stacking && React.createElement("div", null, stackingLine(ABILITY_TAG_DEFS[popup])),
            summonKit(ABILITY_TAG_DEFS[popup]),
            hasExtras(ABILITY_TAG_DEFS[popup]) && React.createElement("div", { style: { height: 16 } })
          ),
      React.createElement("button", {
        onClick: onClose,
        style: { width: "100%", padding: "9px 0", background: "#534AB7", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer" },
      }, "Close")
    )
  );
}
