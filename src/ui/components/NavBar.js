// Bottom tab bar shared by the main app shell and any full-screen page
// (creature detail, equip page) that still needs navigation available.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";

export const TABS = [
  { id: "home", icon: "ti-home", label: "Home" },
  { id: "hatch", icon: "ti-egg", label: "Hatch" },
  { id: "collection", icon: "ti-layout-grid", label: "Collection" },
  { id: "play", icon: "ti-sword", label: "Play" },
  { id: "farm", icon: "ti-plant", label: "Farm" },
  { id: "equipment", icon: "ti-tool", label: "Equipment" },
  // { id: "store", icon: "ti-shopping-cart", label: "Store" }, // hidden for now, re-add later
];

// While the tutorial's restricted, every tab but the one it currently hands
// the player off to is locked. The tab they're already standing on is
// always exempt too (tapping it is a no-op, so there's nothing to guard,
// and it avoids showing a lock icon over the screen you're already on).
//
// Each tab maps tutorial-step -> "step to advance to on tap". A tab can be
// handed off to more than once across the tutorial (e.g. Collection: once
// for the initial equip flow, again later for the level-up detour), so this
// is a step->step map per tab rather than a single value. A tab's own
// advance is sometimes intentionally absent (e.g. Collection's "collection"
// entry has no mapped next step -- that transition happens when a creature
// card is tapped inside CollectionScreen instead, not here).
const TAB_TUTORIAL_STEPS = {
  collection: { collection: null, levelupNav: "levelupPick" },
  farm: { farm: "harvest" },
  equipment: { toEquipment: "equipItem" },
  home: { toHome: "descend" },
};

// Permanent (non-tutorial) progress gates: a tab stays locked until the
// player's best Labyrinth depth reaches the threshold, independent of
// tutorial state -- unlike TAB_TUTORIAL_STEPS above, this never re-locks
// once cleared.
const TAB_PROGRESS_GATES = {
  play: { minBestDepth: 21, message: "Unlocks once you beat Floor 20 of the Labyrinth" },
};

function NavBar({ tab, setTab, onNavigate, style }) {
  const { tutorialRestricted, tutorialStep, setTutorialStep, labyrinthBestDepth } = useGame();
  const [lockedMsg, setLockedMsg] = React.useState(null);
  React.useEffect(() => {
    if (!lockedMsg) return;
    const t = setTimeout(() => setLockedMsg(null), 2200);
    return () => clearTimeout(t);
  }, [lockedMsg]);
  return React.createElement(
    React.Fragment,
    null,
    lockedMsg &&
      React.createElement(
        "div",
        {
          style: {
            position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.8)", color: "#fff", borderRadius: 10, padding: "8px 16px",
            fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", zIndex: 70, pointerEvents: "none",
            animation: "toastFade 2.2s ease-in-out",
          },
        },
        lockedMsg
      ),
    React.createElement(
      "div",
      { className: "nav", style },
      TABS.map((t) => {
        const steps = TAB_TUTORIAL_STEPS[t.id] || {};
        const unlockedByTutorial = t.id === tab || Object.prototype.hasOwnProperty.call(steps, tutorialStep);
        const gate = TAB_PROGRESS_GATES[t.id];
        const progressLocked = gate && (labyrinthBestDepth || 1) < gate.minBestDepth;
        const locked = (tutorialRestricted && !unlockedByTutorial) || progressLocked;
        return React.createElement(
          "button",
          {
            key: t.id,
            className: "nav-btn" + (tab === t.id ? " active" : ""),
            disabled: locked && !progressLocked,
            onClick: () => {
              if (progressLocked) { setLockedMsg(gate.message); return; }
              if (locked) return;
              setTab(t.id);
              const next = steps[tutorialStep];
              if (next) setTutorialStep(next);
              if (onNavigate) onNavigate();
            },
            style: locked ? { opacity: 0.4, cursor: "not-allowed" } : undefined,
          },
          React.createElement("i", { className: "ti " + (locked ? "ti-lock" : t.icon), "aria-hidden": "true" }),
          t.label
        );
      })
    )
  );
}

export default NavBar;
