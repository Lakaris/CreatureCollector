BLUE-VIOLET POPUP UI

The existing neutral set recoloured with muted periwinkle border bands,
slate-violet bevels, pale lavender corner highlights and thick plum outlines.
The light ivory centre tile is identical to the original neutral version.

Assets: images/ui_panels/violet/
popup-frame.png           256 x 256, 80 px slice inset
panel-fill.png            128 x 128, seamless repeating ivory fill
close-button.png          128 x 128
divider-left.png           64 x 32
divider-middle.png         64 x 32, repeating horizontal strip
divider-right.png          64 x 32
ability-icon-frame.png    192 x 192, transparent opening
gear-slot.png              96 x 96, 32 px slice inset

Popup cuts: x/y = 80,176. Keep corners fixed and stretch edge strips.
Popup recommended content inset: 64 source pixels.
At 16-point corner slices that gives 12.8 points of content padding.
Straight inner border edges are approximately 53-54 source pixels inward.
Gear cuts: x/y = 32,64. Recommended content inset: 28 source pixels.
Tile the ivory fill beneath the transparent opening. Clip it under the frame.
No shadows are painted into the assets. Add shadows in code.

The original neutral files remain available for comparison.
preview.png shows the set across cave, water, fire and arena backgrounds.
comparison.png compares the original ivory and new blue-violet frame.
slice-guide.png marks the inner edge, slice cuts and safe content inset.
manifest.json records dimensions, transparency and slice checks.

Recoloured with built-in ImageGen. PNG export resizing and indexed encoding
were used to retain the requested final dimensions and transparency.
Full edit prompts are included in generation-prompts.json.
