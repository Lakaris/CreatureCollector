// The block of stat pills on a creature's page.
//
// One component rather than three copies: the creature page renders this twice
// (its own layout and the swipe-nav one) and the flair page once, and all three
// used to spell out the same container inline. That was survivable while every
// stat was one flat row; it stopped being survivable once the groups had
// different sizes and column counts.
//
// The grouping itself lives in STAT_LAYOUT (data/rarity.js), not here -- this
// only knows how to draw whatever groups it is handed, side by side.

import React from "../../react.js";
import { STAT_CYCLE, STAT_LAYOUT } from "../../data/rarity.js";
import StatBar from "./StatBar.js";

// A stat present in STAT_CYCLE but missing from STAT_LAYOUT would just never
// render -- an invisible failure, and exactly what happens when someone adds a
// stat and forgets the layout. Warn once at module load instead.
const laidOut = new Set(STAT_LAYOUT.flatMap((g) => g.stats));
const missing = STAT_CYCLE.filter((s) => !laidOut.has(s));
if (missing.length) {
  console.warn("StatStrip: stats missing from STAT_LAYOUT, they will not be shown:", missing.join(", "));
}

// Each group's share of the width, as a grid-template-columns track list.
const COLUMN_TRACKS = STAT_LAYOUT.map((g) => "minmax(0," + (g.weight || 1) + "fr)").join(" ");

/**
 * @param {Object} values      stat key -> value to show
 * @param {Function} [onClick] passed the stat key when a pill is tapped
 * @param {Function} [isHighlighted] stat key -> whether to flash it
 */
function StatStrip({ values, onClick, isHighlighted }) {
  return React.createElement(
    "div",
    { className: "stat-strip", style: { gridTemplateColumns: COLUMN_TRACKS } },
    STAT_LAYOUT.map((group, i) =>
      React.createElement(
        "div",
        {
          key: i,
          className:
            "stat-strip-group" +
            (group.compact ? " stat-strip-group--sm" : "") +
            (group.fillHeight ? "" : " stat-strip-group--center"),
          // Explicit column count, not auto-fit: the 2x2 must stay 2x2 rather
          // than reflowing to 4x1 or 1x4 at some width, so it keeps lining up
          // against the stack beside it. Rows are `1fr` only in the group that
          // sets the strip's height; the rest size to content (see fillHeight).
          style: {
            gridTemplateColumns: "repeat(" + group.cols + ",minmax(0,1fr))",
            gridTemplateRows:
              "repeat(" + Math.ceil(group.stats.length / group.cols) + "," + (group.fillHeight ? "1fr" : "auto") + ")",
          },
        },
        group.stats.map((s) =>
          React.createElement(StatBar, {
            key: s,
            stat: s,
            value: values[s],
            highlight: !!(isHighlighted && isHighlighted(s)),
            onClick,
            short: !!group.compact,
          })
        )
      )
    )
  );
}

export default StatStrip;
