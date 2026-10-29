from pathlib import Path
import json,hashlib,shutil,zipfile
W=Path(__file__).resolve().parent;ROOT=W.parents[1]
m=json.loads((W/'manifest.json').read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for a in m['assets']:
    src=W/'staged'/(a['id']+'.png');dst=ROOT/a['path']
    assert sha(src)==a['sha256']
    assert not dst.exists() or sha(dst)==a['sha256'],f'Unexpected existing asset: {dst}'
for a in m['assets']:
    dst=ROOT/a['path'];dst.parent.mkdir(parents=True,exist_ok=True)
    if not dst.exists():shutil.copy2(W/'staged'/(a['id']+'.png'),dst)
    assert sha(dst)==a['sha256']
readme='''SOFT SLATE POPUP UI

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
'''
(W/'README.txt').write_text(readme,encoding='utf-8')
archive=W/'Soft-Slate-Popup-UI.zip';assert not archive.exists()
with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
    for a in m['assets']:z.write(ROOT/a['path'],a['path'])
    for name in ['preview.png','comparison.png','slice-guide.png','manifest.json','README.txt']:z.write(W/name,name)
    z.write(W/'generated.json','generation-prompts.json')
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print(json.dumps({'saved_images':len(m['assets']),'folder':str(ROOT/'images/ui_panels/soft-slate'),'zip':str(archive),'zip_bytes':archive.stat().st_size},indent=2))
