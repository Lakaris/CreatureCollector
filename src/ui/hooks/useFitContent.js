// Shrink content to fit the box it is in, instead of letting the box scroll.
//
// The same idea as the global UI scale (ui/uiScale.js) and useFitTile, at the
// scale of one panel: a fixed-height area whose content is bigger than it gets
// laid out at its natural size and then scaled down as a whole, so everything
// stays on screen and nothing has to be scrolled to.
//
// Use it where scrolling is the wrong answer -- a reveal animation, a result
// panel, anything the player is meant to take in at a glance. A long list is
// still a list; let that scroll.

import React from "../../react.js";

/**
 * Returns [boxRef, contentRef, scale].
 *
 * Put `boxRef` on the element whose size is the budget and `contentRef` on the
 * thing being fitted, then apply the returned `scale` to the content as a CSS
 * transform. `scale` is at most 1 -- content smaller than its box is left
 * alone rather than blown up.
 *
 * Both are callback refs, because the content typically mounts on a later
 * render than the box (it appears when there is a result to show); a plain ref
 * with [] deps would measure nothing and never retry.
 *
 * No feedback loop: the measurement reads offsetWidth/offsetHeight, which are
 * LAYOUT sizes that a CSS transform does not affect, so the content's natural
 * size reads the same whether or not it is currently scaled. ResizeObserver
 * likewise reports layout boxes, so shrinking the content never re-triggers
 * the observer that shrank it.
 */
export default function useFitContent() {
  const [box, setBox] = React.useState(null);
  const [content, setContent] = React.useState(null);
  const [scale, setScale] = React.useState(1);

  React.useLayoutEffect(() => {
    if (!box || !content) return;
    const measure = () => {
      // The box's own padding is the breathing room around the fitted content
      // -- read off the computed style rather than hardcoded here, so a caller
      // can space its panel without this having to know about it. clientHeight
      // includes padding, hence the subtraction.
      const cs = getComputedStyle(box);
      const availH = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const availW = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const natH = content.offsetHeight;
      const natW = content.offsetWidth;
      // Hidden or not yet laid out: keep the last good scale rather than
      // dividing by zero into a scale of 0.
      if (!(availH > 0) || !(availW > 0) || !(natH > 0) || !(natW > 0)) return;
      const next = Math.min(1, availH / natH, availW / natW);
      // Ignore sub-half-percent churn so a resize storm can't thrash renders.
      setScale((prev) => (Math.abs(prev - next) < 0.005 ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(content);
    return () => ro.disconnect();
  }, [box, content]);

  return [setBox, setContent, scale];
}
