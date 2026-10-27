// Bottom tab bar shared by the main app shell and any full-screen page
// (creature detail, equip page) that still needs navigation available.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";

// Each tab's art is images/ui_icons/menu/<id>.png.
export const TABS = [
  { id: "home", label: "Home" },
  { id: "hatch", label: "Hatch" },
  { id: "collection", label: "Collection" },
  { id: "play", label: "Play" },
  { id: "farm", label: "Farm" },
  { id: "equipment", label: "Equipment" },
  { id: "store", label: "Store" },
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
  // "fertilizerReveal": the floor-10 Ancient Fertilizer hand-off (arrow at
  // Farm) advances to "fertilizerUpgrade" once tapped -- see FarmScreen.js,
  // which locks everything but the Upgrade Field button/flow for that step.
  farm: { farm: "harvest", fertilizerReveal: "fertilizerUpgrade" },
  equipment: { toEquipment: "equipItem" },
  home: { toHome: "descend" },
  // Post-Set-1 Dungeon reveal: arrow at Play ("dungeonReveal") hands off to
  // an arrow at the Dungeon card once tapped ("dungeonPoint"), see App.js.
  play: { dungeonReveal: "dungeonPoint" },
};

// Permanent (non-tutorial) progress gates: a tab stays locked until the
// player's best Labyrinth depth reaches the threshold, independent of
// tutorial state -- unlike TAB_TUTORIAL_STEPS above, this never re-locks
// once cleared.
const TAB_PROGRESS_GATES = {
  play: { minBestDepth: 21, message: "Unlocks via progression quest" },
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
      TABS.map((t, i) => {
        const steps = TAB_TUTORIAL_STEPS[t.id] || {};
        const unlockedByTutorial = t.id === tab || Object.prototype.hasOwnProperty.call(steps, tutorialStep);
        const gate = TAB_PROGRESS_GATES[t.id];
        const progressLocked = gate && (labyrinthBestDepth || 1) < gate.minBestDepth;
        const locked = (tutorialRestricted && !unlockedByTutorial) || progressLocked;
        const active = tab === t.id;
        const iconSrc = "images/ui_icons/" + (locked ? "symbols/locked" : "menu/" + t.id) + ".png";
        return React.createElement(
          "button",
          {
            key: t.id,
            className: "nav-btn" + (active ? " active" : ""),
            disabled: locked && !progressLocked,
            onClick: () => {
              if (progressLocked) { setLockedMsg(gate.message); return; }
              if (locked) return;
              setTab(t.id);
              const next = steps[tutorialStep];
              if (next) setTutorialStep(next);
              if (onNavigate) onNavigate();
            },
            // Icon only -- the label stays as the button's accessible name and
            // hover tooltip.
            "aria-label": t.label,
            title: t.label,
            style: { position: "relative", ...(locked ? { opacity: 0.4, cursor: "not-allowed" } : null) },
          },
          // 34px fills the height the 22px icon plus its text line used to
          // take. The selected tab keeps an invisible 34px spacer so the bar
          // never changes height, and draws its badge over it instead.
          React.createElement("img", {
            src: iconSrc,
            alt: "", "aria-hidden": "true", draggable: false,
            style: { display: "block", width: 34, height: 34, objectFit: "contain", margin: "0 auto", visibility: active ? "hidden" : "visible" },
          }),
          // Selected tab: a raised circle that pokes above the bar, holding a
          // bigger icon with the tab's name under it. It mounts fresh on
          // whichever tab is selected, so it pops in each time.
          active && React.createElement("div", {
            style: {
              // Rises ~12px above the bar. On a 375px phone the end tabs'
              // circles (Home, Store) would run off the screen edge, so those
              // two shift 7px inward.
              position: "absolute", left: "50%", bottom: -6, width: 76, height: 76,
              marginLeft: -38 + (i === 0 ? 7 : i === TABS.length - 1 ? -7 : 0),
              borderRadius: "50%", background: "#fff", border: "3px solid #e6e3fa", boxSizing: "border-box",
              boxShadow: "0 -3px 10px rgba(83,74,183,0.15)",
              // Packed toward the top rather than centred: the label then sits
              // near the circle's middle, where it's wide enough for
              // "COLLECTION" without running into the ring.
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 3, gap: 0,
              pointerEvents: "none", animation: "navBadgePop .22s ease-out",
            },
          },
            React.createElement("img", { src: iconSrc, alt: "", draggable: false, style: { display: "block", width: 40, height: 40, objectFit: "contain" } }),
            React.createElement("span", { style: { fontSize: 8, fontWeight: 800, color: "#534AB7", textTransform: "uppercase", letterSpacing: 0.2, lineHeight: 1, whiteSpace: "nowrap" } }, t.label)
          )
        );
      })
    )
  );
}

export default NavBar;
