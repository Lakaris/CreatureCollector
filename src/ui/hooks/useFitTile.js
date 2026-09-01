// Planning-phase grids size themselves to the space they're given instead of
// scrolling.
//
// battle/constants.js picks each board's tile size from the WIDTH budget: 46px
// is the largest that fits six Dungeon columns on a 320px screen. Nothing was
// checking the height, so on a short viewport (a landscape phone, a small
// desktop window) the ten-row Dungeon and Daily Boss boards -- and even the
// eight-row Arena/Labyrinth ones -- outgrew their column and the planning area
// turned into a scroller. Dragging a creature onto a board you have to scroll
// to see is miserable: half the grid is off-screen while you're holding the
// thing you're trying to place.
//
// So the tile shrinks to fit instead. The constant stays the CEILING -- boards
// never render bigger than they do today -- and this only ever scales down.

import React from "../../react.js";

/**
 * Tile size in px that makes a `rows` x `cols` grid fit inside a container.
 *
 * Returns [ref, tile, clamped]. `ref` is a callback ref for the element whose
 * content box is the budget (the planning area itself, not the grid); its
 * padding is read off the computed style, so a screen changing its own padding
 * can't silently desync a hardcoded reserve here.
 *
 * `clamped` is true when even `minTile` does not fit -- the caller should let
 * that area scroll, as a safety valve. It takes a viewport so short that the
 * header and creature tray alone fill it (a landscape phone) before this
 * happens, and there the choice is between scrolling and hiding the back rows
 * outright; scrolling at least leaves every cell reachable.
 *
 * The container is measured, never the grid, so shrinking the tile can't
 * change what was measured -- there is no resize feedback loop.
 *
 * @param {number} rows
 * @param {number} cols
 * @param {number} baseTile Ceiling; the size the board uses when it fits.
 * @param {object} [opts]
 * @param {number} [opts.minTile] Hard floor, only to keep the tile a sane
 *   positive number. It is deliberately far below anything comfortable: past
 *   the point where a board can be both complete and comfortable, complete
 *   wins. A cramped ten-row board you can see all of still lets you place a
 *   creature on the back row; a comfortable one with its last two rows cut off
 *   does not, and cut-off rows read as "the board ends here" rather than as
 *   something to scroll for. Realistic phones (>=568px tall) never come near
 *   this -- they land at 26px or above.
 * @param {number} [opts.reserveW] Width to hold back for whatever shares the
 *   row with the board -- the planning screens' info column.
 *
 *   Without it the board takes every pixel of width it can use, and on a TALL
 *   screen it can use all of them: height never binds, so the tile runs up to
 *   its ceiling and the column beside it gets whatever is left. On a 420x900
 *   phone that left the info column 70px wide, too narrow even for its own
 *   Effects pill, while the board sat at full size. Width is shared, so the
 *   board's share has to be asked for rather than assumed.
 */
export default function useFitTile(rows, cols, baseTile, opts) {
  const { minTile = 12, reserveW = 0 } = opts || {};
  // The node lives in state, not a ref, because a planning grid mounts on a
  // later render than the component (screens render a battle view first). A
  // callback ref re-runs the effect when the node actually appears; a plain
  // ref with [] deps would measure nothing and never retry.
  const [node, setNode] = React.useState(null);
  const [state, setState] = React.useState({ tile: baseTile, clamped: false });

  React.useLayoutEffect(() => {
    if (!node) return;
    const measure = () => {
      const cs = getComputedStyle(node);
      const availH = node.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const fullW = node.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!(availH > 0) || !(fullW > 0)) return; // hidden/unlaid-out: keep the last good size
      // Never hand the whole row to the reserve: on a board narrow enough that
      // the two can't both be comfortable, they share what there is rather than
      // the board collapsing to its floor.
      const availW = Math.max(fullW / 2, fullW - reserveW);
      const ideal = Math.min(baseTile, Math.floor(availH / rows), Math.floor(availW / cols));
      const tile = Math.max(minTile, ideal);
      const clamped = ideal < minTile;
      setState((prev) => (prev.tile === tile && prev.clamped === clamped ? prev : { tile, clamped }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [node, rows, cols, baseTile, minTile, reserveW]);

  return [setNode, state.tile, state.clamped];
}
