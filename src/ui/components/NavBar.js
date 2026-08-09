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

// While the tutorial's restricted, every tab but Collection is off-limits --
// the player is meant to follow the pointer straight there to equip the item
// they just picked up.
function NavBar({ tab, setTab, onNavigate, style }) {
  const { tutorialRestricted, tutorialStep, setTutorialRestricted, setTutorialStep } = useGame();
  return React.createElement(
    "div",
    { className: "nav", style },
    TABS.map((t) => {
      const unlockedByTutorial = t.id === "collection" || (t.id === "farm" && tutorialStep === "farm");
      const locked = tutorialRestricted && !unlockedByTutorial;
      return React.createElement(
        "button",
        {
          key: t.id,
          className: "nav-btn" + (tab === t.id ? " active" : ""),
          disabled: locked,
          onClick: () => {
            if (locked) return;
            setTab(t.id);
            if (t.id === "farm" && tutorialStep === "farm") {
              setTutorialRestricted(false);
              setTutorialStep(null);
            }
            if (onNavigate) onNavigate();
          },
          style: locked ? { opacity: 0.4, cursor: "not-allowed" } : undefined,
        },
        React.createElement("i", { className: "ti " + (locked ? "ti-lock" : t.icon), "aria-hidden": "true" }),
        t.label
      );
    })
  );
}

export default NavBar;
