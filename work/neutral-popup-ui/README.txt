NEUTRAL POPUP UI

Eight production PNGs in images/ui_panels/neutral/:
popup-frame.png           256 x 256; slice 80 px on every side
panel-fill.png            128 x 128; repeat both axes
close-button.png          128 x 128
divider-left.png           64 x 32
divider-middle.png         64 x 32; repeat horizontally
divider-right.png          64 x 32
ability-icon-frame.png    192 x 192; transparent centre
gear-slot.png              96 x 96; slice 32 px on every side

POPUP FRAME
Cuts: x = 80, 176 and y = 80, 176.
Corner slices: 80 x 80. Centre slice: 96 x 96.
The frame is a transparent overlay. Tile panel-fill behind its opening.
The straight inner border edge is approximately 54 px from the source edge.
Recommended rectangular content inset: 64 source pixels, including corner
clearance. At 16-point corner slices, this becomes a 12.8-point inset.
The visible straight band is approximately 9.6 points (about 10).
Stretch the plain edge strips and keep the corner slices fixed.
Clip the fill to the opening beneath the frame, not the full outer box.
See slice-guide.png for marked inner-edge and safe-padding guides.

OTHER PIECES
Close button is fixed size, suggested 28 points.
Divider is left cap + repeated middle + right cap. Keep the same scale
and vertical alignment for all three pieces.
Ability frame has a fully transparent centre for an icon beneath it.
Gear slot cuts are x = 32, 64 and y = 32, 64. Its recommended content
inset is 28 source pixels. Use the light fill beneath its opening when
an opaque slot is needed.

No shadows are painted into any asset. Add shadows in code.
Artwork was generated with built-in ImageGen, downscaled to the requested
dimensions, and encoded as optimized indexed PNGs with transparency.
The light centre is intentionally plain, fully opaque, and seamless.
Frame and gear centre slices are fully transparent.
See manifest.json for dimensions, alpha checks, and slice settings.
No existing game assets or consuming game code were changed.
