// Board art: one picture per board shape, drawn under the cells on every
// planning and fight board that shape uses (Arena, Labyrinth and Descend are
// 5x8; Dungeon and Daily Boss are 6x10).
//
// The art carries its own tile lines and outer frame, so wherever it shows,
// the cells' own borders and zone tints are switched off (the .board-art
// .board-cell rule in components.css) -- otherwise every line would draw twice
// and drift apart as planning shrinks the tiles. Highlights keep working:
// range previews paint background-image, which that rule leaves alone.
//
// The purple divider between the two halves is NOT in the art: it's gameplay
// (where your side starts), and that row differs per mode. The game draws it
// on the first player row's cells (boardCellClass), on art boards during
// planning only -- once the fight starts, units cross it freely, so it's hidden.
//
// Art is drawn at 200px per tile (1000x1600 and 1200x2000), so it is stretched
// to the board exactly -- the board and the art always share a shape.
//
// Every scene is a THEME: one screen backdrop (battle_backgrounds/<theme>.jpg)
// plus board art for both shapes (board_backgrounds/<theme>5x8.jpg and
// <theme>6x10.jpg). Themes: rocky (the default), arena, the eight
// "<element>-dungeon"s, and forest and volcano -- drawn for the Labyrinth but
// not used anywhere yet.

const DEFAULT_THEME = "rocky";

// rows x cols -> the art's file suffix (cols x rows).
const BOARD_ART_SHAPES = {
  "8x5": "5x8",
  "10x6": "6x10",
};

// The art's own frame has small rounded corners; the board's usual 12px
// radius would clip them off.
const BOARD_ART_RADIUS = 5;

/** Props for a board's outer box: `className` to add (empty when the shape has
 * no art) and a style fragment to spread LAST over the box's own style. */
export function boardArt(rows, cols, theme = DEFAULT_THEME) {
  const shape = BOARD_ART_SHAPES[rows + "x" + cols];
  if (!shape) return { className: "", style: null };
  return {
    className: "board-art",
    style: { backgroundImage: 'url("images/board_backgrounds/' + theme + shape + '.jpg")', backgroundSize: "100% 100%", border: "none", borderRadius: BOARD_ART_RADIUS },
  };
}

/** The scene behind the board: spread over a planning or fight screen's outer
 * style in place of its plain background. Scaled to cover the screen (never
 * stretched) and cropped from the centre, like the flair backgrounds; the grey
 * underneath shows while it loads. Kept separate from the board art on purpose
 * -- the board changes size between phases and devices, the screen doesn't. */
export function battleBackdrop(theme = DEFAULT_THEME) {
  return {
    backgroundColor: "#f5f5f5",
    backgroundImage: 'url("images/battle_backgrounds/' + theme + '.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export const BATTLE_BACKDROP = battleBackdrop();

/** className for a board cell in row `r`, so .board-art can blank its lines
 * -- plus the divider on `playerStartRow`, the first row of the player's half.
 * Fight boards leave `playerStartRow` out, so they get no divider. */
export function boardCellClass(r, playerStartRow) {
  return r === playerStartRow ? "board-cell board-divider" : "board-cell";
}
