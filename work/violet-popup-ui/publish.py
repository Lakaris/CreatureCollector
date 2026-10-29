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
readme='''BLUE-VIOLET POPUP UI

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
'''
(W/'README.txt').write_text(readme,encoding='utf-8')
archive=W/'Blue-Violet-Popup-UI.zip';assert not archive.exists()
with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
    for a in m['assets']:z.write(ROOT/a['path'],a['path'])
    for name in ['preview.png','comparison.png','slice-guide.png','manifest.json','README.txt']:z.write(W/name,name)
    z.write(W/'generated-final.json','generation-prompts.json')
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print(json.dumps({'saved_images':len(m['assets']),'folder':str(ROOT/'images/ui_panels/violet'),'zip':str(archive),'zip_bytes':archive.stat().st_size},indent=2))
