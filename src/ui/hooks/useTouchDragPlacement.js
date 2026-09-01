// iOS Safari never fires native HTML5 drag-and-drop (draggable/dragstart/drop)
// from touch input, so without this a touch-drag on a battle-planning grid
// falls through to the browser's default touch behavior (page scroll /
// pull-to-refresh) instead of picking the creature up. This reimplements
// drag-and-drop on top of raw touch events for the four planning screens
// (Dungeon, Arena, Labyrinth, Daily Boss), which otherwise only support it
// via mouse.
import React from "../../react.js";
import { getUiScale } from "../uiScale.js";

/**
 * A touch's viewport coordinate, converted to the design-pixel space the
 * ghost element is laid out in.
 *
 * The ghost is `position: fixed`, which inside the scaled app means it is
 * positioned against `.app` and its `left`/`top` are design pixels -- while a
 * touch reports visual ones. Without this the ghost drifts further from the
 * finger the further the scale is from 1. Every other coordinate the hook
 * touches (hit-testing, drag thresholds, autoscroll) is compared against
 * something equally visual, so this is the only conversion needed.
 */
function toDesignPx(v) {
  return v / getUiScale();
}

/**
 * cellSelector: attribute selector (e.g. '[data-cell]') used to find the grid
 *   cell under the finger on release; that element's data-cell must hold "row,col".
 * applyDrop(row, col, {id, fromCell}): places `id` (dragged from the tray) or
 *   moves the creature at `fromCell` (dragged from a grid cell) into (row, col).
 * onCancelHold(): cancels any in-progress press-and-hold gesture (view detail /
 *   info panel) once a drag is confirmed, so the two gestures don't fight.
 * onCancelDrop(fromCell): called when a cell-origin drag is released outside any
 *   grid cell -- mirrors the existing "drop outside the grid unequips it" behavior.
 * onDragMove(x, y): optional; fired with the finger's client coords while a drag
 *   is active. Screens use it to edge-autoscroll their planning column, since
 *   an active drag preventDefaults the native scroll away.
 * onDragOverCell(cellKey, dragged): optional; the "row,col" under the finger as
 *   it moves (null when the finger is off the grid), plus {id, fromCell,
 *   cellId} for what is being dragged. Touch has no dragover event, so this is
 *   how the range preview learns where a touch placement would land.
 * onDragEnd(): optional; fired when the drag gesture ends for any reason.
 */
export default function useTouchDragPlacement({ cellSelector, applyDrop, onCancelHold, onCancelDrop, onDragMove, onDragOverCell, onDragEnd }) {
  const dragRef = React.useRef({ id: null, fromCell: null, cellId: null, startX: 0, startY: 0, active: false });
  const [ghost, setGhost] = React.useState(null); // {id, x, y} while actively dragging

  function move(e) {
    const ts = dragRef.current;
    if (!ts.id && !ts.fromCell) return;
    const t = e.touches[0]; if (!t) return;
    const dx = t.clientX - ts.startX, dy = t.clientY - ts.startY;
    if (!ts.active) {
      // Natural hand tremor while holding a phone still for the ~1s
      // press-and-hold gesture easily produces several px of drift -- these
      // thresholds must clear that noise floor, or a genuine "hold still"
      // gets misread as the start of a drag and the hold gets cancelled out
      // from under the player before the progress ring finishes filling.
      if (ts.fromCell) {
        if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
      } else {
        // Tray items also scroll horizontally. Real fingers rarely move in a
        // straight line, so only concede the gesture to a scroll once it's
        // decisively horizontal -- otherwise a natural, slightly-diagonal lift
        // toward the grid above would misfire as a scroll and the drag would
        // never start. Vertical intent (picking the creature up) wins ties.
        if (Math.abs(dy) >= 16) { /* fall through to claim as drag */ }
        else if (Math.abs(dx) > 18 && Math.abs(dx) > Math.abs(dy) * 1.5) { end(null); return; }
        else return;
      }
      ts.active = true;
      onCancelHold && onCancelHold();
      setGhost({ id: ts.id || ts.cellId, x: toDesignPx(t.clientX), y: toDesignPx(t.clientY) });
      onDragMove && onDragMove(t.clientX, t.clientY);
      reportCell(ts, t.clientX, t.clientY);
      return;
    }
    e.preventDefault();
    setGhost(g => (g ? { ...g, x: toDesignPx(t.clientX), y: toDesignPx(t.clientY) } : g));
    onDragMove && onDragMove(t.clientX, t.clientY);
    reportCell(ts, t.clientX, t.clientY);
  }

  /** Hit-test the grid under the finger. Mirrors the lookup `end` does on
   * release, so the cell previewed mid-drag is the one the drop will use. */
  function reportCell(ts, x, y) {
    if (!onDragOverCell) return;
    const el = document.elementFromPoint(x, y);
    const cellEl = el && el.closest && el.closest(cellSelector);
    onDragOverCell(cellEl ? cellEl.getAttribute("data-cell") : null, { id: ts.id, fromCell: ts.fromCell, cellId: ts.cellId });
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
    onDragOverCell && onDragOverCell(null, {});
    onDragEnd && onDragEnd();
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
