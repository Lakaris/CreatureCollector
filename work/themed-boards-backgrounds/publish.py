from pathlib import Path
import hashlib, html, json, shutil, zipfile
from PIL import Image

WORK=Path(__file__).resolve().parent
ROOT=WORK.parents[1]
catalogue=json.loads((WORK/'catalogue.json').read_text(encoding='utf-8'))
specs=catalogue['assets']
assert len(specs)==33 and len(catalogue['themes'])==11
reports=[]
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()

# Validate the complete staged set before copying any final asset.
for s in specs:
    p=WORK/'staged'/s['destination']
    r=json.loads((WORK/'reports'/(s['id']+'.json')).read_text(encoding='utf-8'))
    assert digest(p)==r['sha256'],f'Staged asset changed: {s["id"]}'
    with Image.open(p) as im:
        assert im.format=='JPEG' and im.mode=='RGB' and im.size==(s['width'],s['height'])
    if s['kind']=='board':assert r['max_center_error_px']<=.5 and r['purple_divider_y'] is None
    target=ROOT/s['destination']
    assert not target.exists() or digest(target)==r['sha256'],f'An unrelated file already exists: {target}'
    reports.append(r)
for s,r in zip(specs,reports):
    target=ROOT/s['destination'];target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists():shutil.copy2(WORK/'staged'/s['destination'],target)
    assert digest(target)==r['sha256']

manifest={'themes':11,'backgrounds':11,'boards':22,'images':33,'format':'JPEG','background_dimensions':[1440,3200],'board_dimensions':[[1000,1600],[1200,2000]],'tile_spacing_px':200,'maximum_measured_grid_center_error_px':max(r.get('max_center_error_px',0) for r in reports),'purple_dividers':False,'tool':'Built-in ImageGen','resolution_note':'Backgrounds are resampled exports from smaller native renders, not native 1440 x 3200 generation. Native dimensions for every image are recorded below.','integration_note':'New image assets only. Existing rocky art and game mode assignments were not changed.','files':reports}
(WORK/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')

def gallery(prefix):
    parts=['<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Creature Collector — Theme Gallery</title><style>body{margin:0;padding:28px;background:#eee9e4;color:#382831;font:16px system-ui,sans-serif}main{max-width:1180px;margin:auto}h1{font-size:30px;margin-bottom:8px}p{max-width:900px;line-height:1.5;color:#63565e}section{padding:20px 0;border-top:1px solid #c9bfc3}h2{font-size:23px}nav{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0}nav a{padding:7px 12px;border:1px solid #b6a8b0;border-radius:20px}.assets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}figure{margin:0;background:#faf7f4;padding:16px;border-radius:12px}img{display:block;max-width:100%;height:420px;object-fit:contain;margin:0 auto 14px}a{color:#654566}figcaption{line-height:1.6}small{color:#776771}@media(max-width:620px){body{padding:16px}.assets{grid-template-columns:1fr}img{height:360px}}</style><main><h1>Creature Collector — Theme Gallery</h1><p>11 matching themes, 33 JPG assets. Each theme includes a 1440 × 3200 background, a 1000 × 1600 board (5 × 8), and a 1200 × 2000 board (6 × 10). Grid centers are aligned to 200 px intervals; no purple dividers are baked in.</p><p><small>Backgrounds are resampled to the export dimensions. Click any image to open the full-size JPG.</small></p><nav>']
    for t in catalogue['themes']:parts.append(f'<a href="#{t["slug"]}">{html.escape(t["name"])}</a>')
    parts.append('</nav>')
    for t in catalogue['themes']:
        parts.append(f'<section id="{t["slug"]}"><h2>{html.escape(t["name"])}</h2><div class="assets">')
        for s in [a for a in specs if a['theme']==t['slug']]:
            url=prefix+s['destination'];label='Background' if s['kind']=='background' else f'Board {s["cols"]} × {s["rows"]}'
            parts.append(f'<figure><a href="{url}"><img loading="lazy" src="{url}" alt="{html.escape(t["name"]+" — "+label)}"></a><figcaption><a href="{url}">{label}</a><br><small>{s["width"]} × {s["height"]} · JPG<br>{Path(s["destination"]).name}</small></figcaption></figure>')
        parts.append('</div></section>')
    parts.append('</main></html>')
    return ''.join(parts)

(WORK/'gallery.html').write_text(gallery('../../'),encoding='utf-8')
readme='''CREATURE COLLECTOR — THEMED BOARDS AND BACKGROUNDS

11 themes: Water Dungeon, Fire Dungeon, Nature Dungeon, Earth Dungeon,
Wind Dungeon, Thunder Dungeon, Dark Dungeon, Light Dungeon, Forest,
Arena, Volcano. Repeated Water and Nature requests were treated as duplicates.

33 opaque JPG images:
- 11 backgrounds: 1440 x 3200 (9:20)
- 11 boards: 1000 x 1600, 5 columns x 8 rows
- 11 boards: 1200 x 2000, 6 columns x 10 rows

Board line centers sit at multiples of 200 px, with verified measurement
error below 0.5 px after geometric correction. No purple divider variants.
The floor art is flat and restrained, with no large obstacles or terrain.

Open gallery.html to browse full-size images by theme.
The images/ folders mirror their locations in the game project.
The existing rocky artwork and game code were not changed.

Artwork generated with built-in ImageGen. Backgrounds are resampled exports
from smaller renders; they are not native 1440 x 3200 generation. Per-image
native sizes and verification results are in manifest.json. Full prompts
and generation source paths are in prompts/.
'''
(WORK/'README.txt').write_text(readme,encoding='utf-8')
archive=WORK/'CreatureCollector-Themed-Art.zip'
assert not archive.exists(),'Archive already exists.'
with zipfile.ZipFile(archive,'x',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for s in specs:z.write(ROOT/s['destination'],s['destination'])
    z.writestr('gallery.html',gallery(''))
    z.writestr('README.txt',readme)
    z.write(WORK/'manifest.json','manifest.json')
    z.write(WORK/'catalogue.json','prompts/catalogue.json')
    for s in specs:z.write(WORK/'generated'/(s['id']+'.json'),'prompts/'+s['id']+'.json')
    for i in range(1,4):z.write(WORK/f'overview-{i}.jpg',f'previews/overview-{i}.jpg')
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    assert len([n for n in z.namelist() if n.startswith('images/') and n.endswith('.jpg')])==33
print(json.dumps({'saved_images':len(reports),'total_image_bytes':sum(r['bytes'] for r in reports),'background_size_range_bytes':[min(r['bytes'] for r in reports if r['kind']=='background'),max(r['bytes'] for r in reports if r['kind']=='background')],'max_grid_error_px':manifest['maximum_measured_grid_center_error_px'],'gallery':str(WORK/'gallery.html'),'archive':str(archive),'archive_bytes':archive.stat().st_size},indent=2))
