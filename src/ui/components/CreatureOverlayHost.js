// Full-screen creature detail overlay.
//
// Every battle screen (and the main app shell) can pop this open via
// setCreatureOverlay(id). Previously this block was duplicated verbatim at four
// call sites, each passing the same 19 props.

import React from "../../react.js";
import { useGame } from "../../state/GameContext.js";
import CreatureDetail from "../screens/CreatureDetail/index.js";

function CreatureOverlayHost() {
  const { creatureOverlay, setCreatureOverlay, owned, setBananasUsed } = useGame();

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
        padding: "0 0 80px",
      },
    },
    React.createElement(CreatureDetail, {
      ownedData: owned[creatureOverlay],
      onBack: () => setCreatureOverlay(null),
      onEvolve: (newId) => setCreatureOverlay(newId),
      onBananaUsed: () => setBananasUsed((c) => c + 1),
    })
  );
}

export default CreatureOverlayHost;
