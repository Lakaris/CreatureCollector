// Full-screen creature detail overlay.
//
// Every battle screen (and the main app shell) can pop this open via
// setCreatureOverlay(id). Previously this block was duplicated verbatim at four
// call sites, each passing the same 19 props.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import { CREATURE_MAP } from "../../data/creatures.js";
import CreatureDetail from "../screens/CreatureDetail/index.js";
import DexEntry from "../screens/DexEntry.js";

function CreatureOverlayHost() {
  const { creatureOverlay, setCreatureOverlay, dexOverlay, setDexOverlay, owned, setBananasUsed, setCandyUsed, unlockedSkins } = useGame();

  if (dexOverlay && CREATURE_MAP[dexOverlay]) {
    return React.createElement(
      "div",
      {
        style: {
          position: "fixed",
          inset: 0,
          zIndex: 501,
          background: "#f5f5f5",
          overflowY: "auto",
          overflowX: "hidden",
          overscrollBehavior: "none",
          padding: "0 16px 80px",
        },
      },
      React.createElement(DexEntry, {
        def: CREATURE_MAP[dexOverlay],
        onBack: () => setDexOverlay(null),
        onNavigate: (d) => setDexOverlay(d.id),
        unlockedSkins,
      })
    );
  }

  if (!creatureOverlay || !owned[creatureOverlay]) return null;

  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: "#f5f5f5",
        overflowY: "auto",
        overflowX: "hidden",
        overscrollBehavior: "none",
        padding: "0 16px 80px",
      },
    },
    React.createElement(CreatureDetail, {
      ownedData: owned[creatureOverlay],
      onBack: () => setCreatureOverlay(null),
      onEvolve: (newId) => setCreatureOverlay(newId),
      onBananaUsed: () => setBananasUsed((c) => c + 1),
      onCandyUsed: () => setCandyUsed((c) => c + 1),
    })
  );
}

export default CreatureOverlayHost;
