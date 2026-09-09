// A label that shrinks its own type rather than wrapping or spilling out of
// the control it sits in.
//
// Tab strips in this game divide their row evenly and size their text in fixed
// pixels, which only works while the longest label happens to fit. The Flair
// page's "Background" tab was already at that limit: at the 375px design width
// it needed 64.2px inside a 64px button, and it was holding its own width by
// squeezing its four neighbours (64 against their 62). Any narrower -- the app
// gets below its design width once the UI scale hits its floor on a very
// narrow window -- and the word wrapped, pushing its second line out of the
// button.
//
// So the long word gives way instead: it is measured at its natural size and,
// only when that does not fit, rendered a little smaller. Short labels are
// untouched, which is why the shrinking is per-label rather than applied to
// the whole row.

import React from "../../react.js";
import { measureElementTextWidth } from "../textMeasure.js";

/**
 * @param {string} children  The text. Kept to a single line.
 * @param {number} size      Font size in px when the text fits, and its ceiling.
 * @param {number} [minSize] Floor, so a very cramped control degrades to small
 *   text rather than unreadable text. Past this the label is allowed to clip.
 */
function AutoFitText({ children, size, minSize = 8, style }) {
  const [node, setNode] = React.useState(null);
  const [fitted, setFitted] = React.useState(size);

  React.useLayoutEffect(() => {
    if (!node) return;
    const measure = () => {
      const host = node.parentElement;
      if (!host) return;
      const cs = getComputedStyle(host);
      const box = host.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!(box > 0)) return;
      // A pixel of slack, because BOTH sides of the comparison are rounded to
      // whole pixels: clientWidth and the probe's offsetWidth are integers, so
      // text that really needs 50.4px inside a 50.0px box measures as fitting
      // and then renders with an ellipsis anyway. Asking for one pixel less
      // than the box costs nothing visible and makes the check honest.
      const avail = box - 1;
      // Measured at the FULL size, not read off the live element, which may
      // already be shrunk -- that would feed this function's own output back
      // into its input.
      const natural = measureElementTextWidth(node, size);
      if (!(natural > 0)) return;
      let next = size;
      if (natural > avail) {
        // Scaling the size by the width ratio is only an ESTIMATE: glyph
        // advances don't shrink perfectly linearly with font-size, so the
        // first guess can still land a fraction over and clip. Verify it
        // against a real measurement and step down until it actually fits --
        // a handful of probe measurements, only on the rare label that needs
        // shrinking at all.
        next = Math.max(minSize, Math.floor(((size * avail) / natural) * 10) / 10);
        for (let i = 0; i < 8 && next > minSize; i++) {
          if (measureElementTextWidth(node, next) <= avail) break;
          next = Math.max(minSize, Math.round((next - 0.2) * 10) / 10);
        }
      }
      setFitted((prev) => (Math.abs(prev - next) < 0.05 ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node.parentElement || node);
    return () => ro.disconnect();
  }, [node, children, size, minSize]);

  return React.createElement(
    "span",
    // overflow/ellipsis is the last resort: a label long enough to still not
    // fit at minSize degrades to "Someth…" rather than spilling over whatever
    // sits beside it.
    {
      ref: setNode,
      style: { fontSize: fitted, whiteSpace: "nowrap", display: "block", overflow: "hidden", textOverflow: "ellipsis", ...style },
    },
    children
  );
}

export default AutoFitText;
