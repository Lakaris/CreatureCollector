// Left/right swipe-to-navigate for paging through a list of items (creature
// detail, dex entry). Fires only on touchend once the gesture clears both a
// distance and a horizontal-dominance threshold, so an ordinary vertical
// scroll on the page never gets misread as a swipe.
import React from "../../react.js";

const SWIPE_MIN_DX = 60; // minimum horizontal travel to count as a swipe
const SWIPE_MAX_DY_RATIO = 0.6; // vertical drift allowed, relative to horizontal travel

/** onSwipeLeft/onSwipeRight: called with no args once a decisive swipe in
 * that direction is released. Returns {onTouchStart,onTouchEnd} to spread
 * onto the element that should listen for the gesture. */
export default function useSwipeNav({ onSwipeLeft, onSwipeRight }) {
  const s = React.useRef({ x: 0, y: 0, active: false });

  function onTouchStart(e) {
    const t = e.touches[0]; if (!t) return;
    s.current = { x: t.clientX, y: t.clientY, active: true };
  }
  function onTouchEnd(e) {
    if (!s.current.active) return;
    s.current.active = false;
    const t = e.changedTouches[0]; if (!t) return;
    const dx = t.clientX - s.current.x;
    const dy = t.clientY - s.current.y;
    if (Math.abs(dx) < SWIPE_MIN_DX) return;
    if (Math.abs(dy) > Math.abs(dx) * SWIPE_MAX_DY_RATIO) return;
    if (dx < 0) onSwipeLeft && onSwipeLeft();
    else onSwipeRight && onSwipeRight();
  }

  return { onTouchStart, onTouchEnd };
}
