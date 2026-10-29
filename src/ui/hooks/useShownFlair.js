// The flair a creature is SHOWN wearing: its owned data with every slot set to
// Random (RANDOM_FLAIR) swapped for one of its unlocked flair from that
// category.
//
// A new pick is drawn on every visit -- when the page showing the creature
// mounts, moves to another creature, a slot's setting changes, or the page
// says it's been opened again (`visit`, e.g. Home's tab tapped while already
// on Home) -- and never the same one as the creature's last pick, wherever
// that was shown. Between visits it's held, so the creature doesn't change
// outfit every time the page re-renders. Everything that DRAWS the creature's
// flair (title, aura, background) reads it from here; anything that changes
// flair keeps using the real owned data.
import React from "../../react.js";
import { rollRandomFlair } from "../../data/flair.js";

// The last pick shown for each creature, {field: key} per creature id, so the
// next visit -- on this page or another -- can skip it.
const lastShown = new Map();

export default function useShownFlair(ownedData, visit) {
  const o = ownedData || {};
  const picks = React.useMemo(() => {
    const avoid = lastShown.get(o.id) || {};
    const next = rollRandomFlair(ownedData, avoid);
    if (o.id) lastShown.set(o.id, { ...avoid, ...next });
    return next;
  }, [o.id, o.equippedTitle, o.equippedAura, o.equippedBackground, o.equippedItem, visit]);
  return ownedData && Object.keys(picks).length ? { ...ownedData, ...picks } : ownedData;
}
