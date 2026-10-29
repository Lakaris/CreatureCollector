// Dev-only pause for a running fight, so the board can be inspected mid-battle.
//
// Battle logic advances only on ticks (battle/tick.js), so pausing is just
// stopping the tick interval -- nothing moves, attacks or ticks a status while
// it's stopped. Two things run off the real clock instead and need help:
//   - The 60s fight timer is measured from the battle's start time, so resuming
//     pushes that start forward by however long the pause lasted; otherwise the
//     clock would jump, or the fight would time out while paused.
//   - Attack/ability effects are CSS animations; the screen adds
//     BATTLE_PAUSED_CLASS while paused, which freezes them (components.css).
// Units already mid-step finish gliding into the tile they're moving to -- that
// tile is where the battle has them, which is what an inspection wants to see.
//
// A speed change while paused just records the new speed (the screens only
// rebuild the interval when one is running); resuming picks it up.

import React from "../../react.js";

export const BATTLE_PAUSED_CLASS = "battle-paused";

/** Shared look for the fight headers' dev Pause/Resume button; callers add the
 * background (amber running, green paused). */
export const DEV_PAUSE_BTN = { padding: "6px 12px", fontSize: 12, fontWeight: 700, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", flexShrink: 0 };

/**
 * @param {object} opts
 * @param {{current:any}} opts.tickRef    The screen's tick-interval ref.
 * @param {{current:number}} opts.startRef The battle's start-time ref (Date.now()).
 * @param {Function} opts.startTicking    Restarts the tick interval at the current speed.
 * @returns {{paused:boolean, toggle:Function, reset:Function}} `reset` clears the
 *   flag without touching the loop -- call it whenever a fight starts or ends.
 */
export default function useBattlePause({ tickRef, startRef, startTicking }) {
  const [paused, setPaused] = React.useState(false);
  const pausedAtRef = React.useRef(0);

  function toggle() {
    if (!paused) {
      // No running interval means the fight is already decided (or not started).
      if (!tickRef.current) return;
      clearInterval(tickRef.current);
      tickRef.current = null;
      pausedAtRef.current = Date.now();
      setPaused(true);
    } else {
      startRef.current += Date.now() - pausedAtRef.current;
      startTicking();
      setPaused(false);
    }
  }

  return { paused, toggle, reset: () => setPaused(false) };
}
