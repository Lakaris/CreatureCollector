SOFT SLATE POPUP UI

The popup set recoloured with muted grey-purple border bands, restrained
grey-lavender highlights and thick charcoal-plum outlines. The centre is
now a very light lavender-grey off-white, replacing the warmer cream.
Palette targets: border #716C86, centre #F5F3F8, outline #382C40,
highlights #ADA8BD, bevel #565168. Generated colours are approximate;
the centre tile's measured RGB is recorded in manifest.json.

Assets: images/ui_panels/soft-slate/
popup-frame.png           256 x 256, 80 px slice inset
panel-fill.png            128 x 128, seamless repeating cool off-white fill
close-button.png          128 x 128
divider-left.png           64 x 32
divider-middle.png         64 x 32, repeating horizontal strip
divider-right.png          64 x 32
ability-icon-frame.png    192 x 192, transparent opening
gear-slot.png              96 x 96, 32 px slice inset

Popup cuts: x/y = 80,176. Keep corners fixed and stretch edge strips.
Popup recommended content inset: 64 source pixels.
At 16-point corner slices that gives 12.8 points of content padding.
Straight inner border edges are approximately 52-53 source pixels inward.
Gear cuts: x/y = 32,64. Recommended content inset: 28 source pixels.
Tile the off-white fill beneath the transparent opening. Clip it under the frame.
No shadows are painted into the assets. Add shadows in code.

The original neutral and blue-violet files remain available for comparison.
preview.png shows the set across cave, water, fire and arena backgrounds.
comparison.png compares the previous blue-violet/cream and new soft slate set.
slice-guide.png marks the inner edge, slice cuts and safe content inset.
manifest.json records dimensions, transparency and slice checks.

Recoloured with built-in ImageGen. PNG export resizing and indexed encoding
were used to retain the requested final dimensions and transparency.
Full edit prompts are included in generation-prompts.json.
The repeated divider has identical visible bar rows at both ends; its
antialiasing differs by at most 2/255 alpha in one nearly transparent pixel.
The centre fill has exactly matching repeat edges. All frame openings
and the safe content rectangles are fully transparent.
