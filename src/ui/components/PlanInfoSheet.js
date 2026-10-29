// The planning phase's info popup: a card centred over the screen when a
// creature, enemy or boss on the board is pressed.
//
// It floats OVER the board and tray rather than taking a slot in the layout,
// so opening it never moves or shrinks anything underneath. The backdrop is
// only lightly dimmed: the board stays readable behind it, so the Dungeon
// boss's ability rows can still light up the tiles they hit. One card at a
// time -- the × or a tap on the backdrop closes it.
//
// Stacks above the planning screen and below the popups that can open FROM
// it: the Labyrinth's boss card (300) and the ability-tag popup (400).
//
// Every planning screen (Arena, Labyrinth/Descend, Dungeon, Daily Boss and the
// tutorial's practice board) renders its card through these pieces, so they all
// read the same. A creature's card is the Trials popup's (TrialsHome.js):
// picture header, gear, then the creature page's ability cards.

import React from "../../react.js";
import { AbilityTagPills } from "./AbilityTagPills.js";
import { PopupClose, AbilityIcon } from "./PopupArt.js";
import { useGame } from "../../state/GameContext.js";
import { EQUIPMENT_MAP } from "../../data/equipment.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import { CreatureCardHeader, CreatureCardBody } from "../screens/battle/TrialsHome.js";

const ABILITY_LABELS = { basic: "Basic", special: "Special", unique: "Passive" };

/** How long a piece on the board is held before its card opens. Long enough
 * that a drag claims the gesture first -- the card's backdrop covers the
 * board, so a card opening mid-drag would swallow the drop. Screens also
 * close the card the moment a drag starts, for a hold that ran long. */
export const PLAN_INFO_HOLD_MS = 450;

/** The popup itself: backdrop, close button and whatever card body the screen
 * passes. */
export function PlanInfoSheet({ onClose, children }) {
  // Only a tap that STARTS on the backdrop closes it. The press-and-hold that
  // opened the card ends with the finger lifting over the new backdrop, and
  // phones fire that touch's click wherever it lifts -- it would close the
  // card the moment it opened.
  const downOnBackdrop = React.useRef(false);
  return React.createElement("div", {
    className: "plan-info-backdrop",
    onPointerDown: (e) => { downOnBackdrop.current = e.target === e.currentTarget; },
    // The tutorial's overlay listens for clicks on its root, so neither a tap
    // on the card nor the backdrop's own close may reach it.
    onClick: (e) => { e.stopPropagation(); if (downOnBackdrop.current) onClose(); downOnBackdrop.current = false; },
    style: { position: "fixed", inset: 0, zIndex: 250, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" },
  },
    // The frame (.ui-panel) is the card's border, so the padding here is only
    // the gap between its inner edge and the content.
    React.createElement("div", {
      className: "plan-info-sheet ui-panel",
      onClick: (e) => e.stopPropagation(),
      style: { position: "relative", width: "100%", maxWidth: 360, maxHeight: "80%", overflowY: "auto", padding: "4px 6px 8px" },
    },
      React.createElement(PopupClose, { onClick: onClose, style: { position: "absolute", top: 0, right: 0 } }),
      children
    )
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
 * One ability, laid out like the creature page's: the Basic/Special/Passive
 * pill over its icon (AbilityIcon), then its name, tag pills and
 * description.
 * With `onClick` the row is a toggle (the Dungeon boss's "show the tiles this
 * hits"), boxed in red while `active` -- the same red as the tiles it lights.
 * The border is there in both states and only changes colour, so toggling
 * never nudges the text.
 */
export function SheetAbilityRow({ kind, icon, tags, name, desc, onTag, onClick, active }) {
  // The toggle box reaches only as far as the card's own padding, so it never
  // spills onto the frame.
  const style = onClick
    ? { borderRadius: 8, padding: "6px 6px", margin: "0 -6px 4px", cursor: "pointer", border: "1.5px solid " + (active ? "rgba(239,68,68,0.5)" : "transparent"), background: active ? "rgba(239,68,68,0.10)" : "transparent" }
    : { marginBottom: 12 };
  return React.createElement("div", { onClick, style: { ...style, display: "flex", alignItems: "flex-start", gap: 10 } },
    React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 } },
      React.createElement("span", { style: { fontSize: 8, fontWeight: 800, color: "#555", background: "#e8e8e8", borderRadius: 20, padding: "2px 7px", textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap" } }, ABILITY_LABELS[kind] || kind),
      React.createElement(AbilityIcon, { kind, icon })
    ),
    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
      React.createElement("div", { style: { fontSize: 14, fontWeight: 700, color: "#111" } }, name),
      tags && tags.length > 0 && React.createElement("div", { style: { display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 } },
        React.createElement(AbilityTagPills, { tags, onOpen: onTag })
      ),
      desc && React.createElement("div", { style: { fontSize: 12, color: "#555", marginTop: 3, lineHeight: 1.4 } }, desc)
    )
  );
}

/**
 * A creature's card, laid out as the Trials popup lays it out: picture header
 * ("Lv. N Name", type/range/role), its gear, then its abilities as the
 * creature page words them. `tierFor(k)` is each ability's upgrade tier --
 * the max when left out, since enemies fight with a maxed kit (see
 * makeArenaBattle). `gear` is [{ item, level, ascension }].
 */
export function CreatureSheetBody({ def, level, tierFor, gear, titleExtra, onTag }) {
  return React.createElement(React.Fragment, null,
    React.createElement(CreatureCardHeader, { def, level, titleExtra }),
    React.createElement("div", { style: { marginTop: 12 } },
      React.createElement(CreatureCardBody, { def, gear, tierFor, onTag }))
  );
}

/** One of the player's own creatures: its level, its own ability levels and
 * the gear it wears (item levels are global -- see core/equipment.js). */
export function AllySheetBody({ id, onTag }) {
  const { owned, equipmentLevels, equipmentAscensions } = useGame();
  const oc = owned?.[id];
  const gear = (oc?.equipped || []).filter((itemId) => itemId && EQUIPMENT_MAP[itemId]).map((itemId) => ({
    item: EQUIPMENT_MAP[itemId], level: equipmentLevels?.[itemId] || 1, ascension: equipmentAscensions?.[itemId] || 0,
  }));
  return React.createElement(CreatureSheetBody, {
    def: CREATURE_MAP[id], level: oc?.level, tierFor: (k) => oc?.abilityLevels?.[k] || 0, gear, onTag,
  });
}
