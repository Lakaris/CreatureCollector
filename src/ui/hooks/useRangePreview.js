// Shows a creature's attack reach on the planning grid while it is being
// dragged, so a player can see where a placement would actually hit before
// letting go. Shared by every planning screen (Arena, Dungeon, Daily Boss,
// Labyrinth, Test Battle) -- they all render a "r,c"-keyed grid of cells and
// all support the same two drag paths (native HTML5 for mouse, the touch
// reimplementation in useTouchDragPlacement).
//
// The reach itself comes from battle/rangePreview.js, which runs the
// creature's real ability hooks so passives that extend range are included.
import React from "../../react.js";
import { previewRangeOf, rangePreviewCells } from "../../battle/rangePreview.js";

/** Tint laid over a cell within reach. A gradient rather than a flat colour so
 * it layers on top of whatever background the cell already has (zone shading,
 * the Dungeon's boss-threat highlight) without each screen having to blend it. */
export const RANGE_TINT = "linear-gradient(rgba(83,74,183,0.26),rgba(83,74,183,0.26))";
/** Outline on the cell the creature would land on. */
export const RANGE_ORIGIN_RING = "inset 0 0 0 2px #534AB7";

const NO_CELLS = new Set();

/**
 * @param {number} gridRows
 * @param {number} gridCols
 * @returns {{cells:Set<string>, originKey:string|null, range:number,
 *   show:Function, clear:Function, cellStyle:Function}}
 *   `cells` holds the "r,c" keys within reach; `originKey` is the hovered cell
 *   itself. `cellStyle(key)` returns the style fragment to spread onto a cell.
 */
export default function useRangePreview(gridRows, gridCols) {
  const [hover, setHover] = React.useState(null); // {creatureId,row,col,range}

  const cells = React.useMemo(() => {
    if (!hover) return NO_CELLS;
    return rangePreviewCells(hover.row, hover.col, hover.range, gridRows, gridCols);
  }, [hover, gridRows, gridCols]);

  /**
   * Called on every dragover / touch-move over a grid cell. `ownedRecord` feeds
   * the ability levels that passive range bonuses scale with; pass the player's
   * record (or an override-shaped one) so a half-fed Deepsight shows its real
   * reach rather than the maxed one.
   */
  function show(creatureId, row, col, ownedRecord) {
    if (!creatureId || row == null || col == null) return;
    setHover((h) => {
      if (h && h.creatureId === creatureId && h.row === row && h.col === col) return h;
      return { creatureId, row, col, range: previewRangeOf(creatureId, ownedRecord) };
    });
  }

  function clear() {
    setHover((h) => (h ? null : h));
  }

  /** Style fragment for one cell, spread after the cell's own background. */
  function cellStyle(key) {
    if (!hover) return null;
    if (key === hover.row + "," + hover.col) return { backgroundImage: RANGE_TINT, boxShadow: RANGE_ORIGIN_RING };
    if (cells.has(key)) return { backgroundImage: RANGE_TINT };
    return null;
  }

  return { cells, originKey: hover ? hover.row + "," + hover.col : null, range: hover ? hover.range : 0, show, clear, cellStyle };
}
