// iOS Safari never fires native HTML5 drag-and-drop (draggable/dragstart/drop)
// from touch input, so without this a touch-drag on a battle-planning grid
// falls through to the browser's default touch behavior (page scroll /
// pull-to-refresh) instead of picking the creature up. This reimplements
// drag-and-drop on top of raw touch events for the four planning screens
// (Dungeon, Arena, Labyrinth, Daily Boss), which otherwise only support it
// via mouse.
import React from "../../react.js";

/**
 * cellSelector: attribute selector (e.g. '[data-cell]') used to find the grid
 *   cell under the finger on release; that element's data-cell must hold "row,col".
 * applyDrop(row, col, {id, fromCell}): places `id` (dragged from the tray) or
 *   moves the creature at `fromCell` (dragged from a grid cell) into (row, col).
 * onCancelHold(): cancels any in-progress press-and-hold gesture (view detail /
 *   info panel) once a drag is confirmed, so the two gestures don't fight.
 * onCancelDrop(fromCell): called when a cell-origin drag is released outside any
 *   grid cell -- mirrors the existing "drop outside the grid unequips it" behavior.
 */
export default function useTouchDragPlacement({ cellSelector, applyDrop, onCancelHold, onCancelDrop }) {
  const dragRef = React.useRef({ id: null, fromCell: null, cellId: null, startX: 0, startY: 0, active: false });
  const [ghost, setGhost] = React.useState(null); // {id, x, y} while actively dragging

  function move(e) {
    const ts = dragRef.current;
    if (!ts.id && !ts.fromCell) return;
    const t = e.touches[0]; if (!t) return;
    const dx = t.clientX - ts.startX, dy = t.clientY - ts.startY;
    if (!ts.active) {
      if (ts.fromCell) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      } else {
        // Tray items also scroll horizontally. Real fingers rarely move in a
        // straight line, so only concede the gesture to a scroll once it's
        // decisively horizontal -- otherwise a natural, slightly-diagonal lift
        // toward the grid above would misfire as a scroll and the drag would
        // never start. Vertical intent (picking the creature up) wins ties.
        if (Math.abs(dy) >= 10) { /* fall through to claim as drag */ }
        else if (Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy) * 1.5) { end(null); return; }
        else return;
      }
      ts.active = true;
      onCancelHold && onCancelHold();
      setGhost({ id: ts.id || ts.cellId, x: t.clientX, y: t.clientY });
      return;
    }
    e.preventDefault();
    setGhost(g => (g ? { ...g, x: t.clientX, y: t.clientY } : g));
  }

  function end(e) {
    const ts = dragRef.current;
    document.removeEventListener("touchmove", move);
    document.removeEventListener("touchend", end);
    if (ts.active && e) {
      const ch = e.changedTouches[0];
      if (ch) {
        const el = document.elementFromPoint(ch.clientX, ch.clientY);
        const cellEl = el && el.closest && el.closest(cellSelector);
        if (cellEl) {
          const [r, c] = cellEl.getAttribute("data-cell").split(",").map(Number);
          applyDrop(r, c, { id: ts.id, fromCell: ts.fromCell });
        } else if (ts.fromCell && onCancelDrop) {
          onCancelDrop(ts.fromCell);
        }
      }
    }
    dragRef.current = { id: null, fromCell: null, cellId: null, startX: 0, startY: 0, active: false };
    setGhost(null);
  }

  /** id: creature id when dragging from the tray. fromCell/cellId: cell key + its creature id when dragging from the grid. */
  function start(e, { id, fromCell, cellId }) {
    const t = e.touches[0]; if (!t) return;
    dragRef.current = { id: id || null, fromCell: fromCell || null, cellId: cellId || null, startX: t.clientX, startY: t.clientY, active: false };
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
  }

  return { start, ghost, dragRef };
}
