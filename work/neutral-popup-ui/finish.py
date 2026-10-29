from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import json, math, hashlib, shutil, zipfile
import numpy as np

W=Path(__file__).resolve().parent;ROOT=W.parents[1]
S=json.loads((W/'generated-clean.json').read_text(encoding='utf-8'))
DEST=ROOT/'images/ui_panels/neutral'
AS={s['id']:Image.open(W/'staged'/(s['id']+'.png')).convert('RGBA') for s in S}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def font(size,bold=False):return ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),size)
def txt(im,xy,t,size=22,bold=False,fill='#382432'):ImageDraw.Draw(im).text(xy,t,font=font(size,bold),fill=fill)
def nine(im,size,cut,corner):
    # Preview only: assemble the actual exported nine-slice without altering it.
    w,h=im.size;out=Image.new('RGBA',size)
    xs=[0,cut,w-cut,w];ys=[0,cut,h-cut,h]
    xd=[0,corner,size[0]-corner,size[0]];yd=[0,corner,size[1]-corner,size[1]]
    for y in range(3):
        for x in range(3):
            patch=im.crop((xs[x],ys[y],xs[x+1],ys[y+1])).resize((xd[x+1]-xd[x],yd[y+1]-yd[y]),Image.Resampling.LANCZOS)
            out.alpha_composite(patch,(xd[x],yd[y]))
    return out
def panel(size,corner=32):
    out=Image.new('RGBA',size)
    inset=round(50*corner/80)
    for y in range(inset,size[1]-inset,128):
        for x in range(inset,size[0]-inset,128):
            tile=AS['panel-fill'].crop((0,0,min(128,size[0]-inset-x),min(128,size[1]-inset-y)))
            out.alpha_composite(tile,(x,y))
    out.alpha_composite(nine(AS['popup-frame'],size,80,corner))
    return out
def divider(width):
    out=Image.new('RGBA',(width,32));out.alpha_composite(AS['divider-left'],(0,0))
    for x in range(64,width-64,64):out.alpha_composite(AS['divider-middle'].crop((0,0,min(64,width-64-x),32)),(x,0))
    out.alpha_composite(AS['divider-right'],(width-64,0));return out
def checker(size,step=16):
    im=Image.new('RGBA',size,'#ede9ed');d=ImageDraw.Draw(im)
    for y in range(0,size[1],step):
        for x in range(0,size[0],step):
            if (x//step+y//step)%2:d.rectangle((x,y,x+step-1,y+step-1),fill='#d9d2da')
    return im

checks=[]
for s in S:
    im=AS[s['id']];a=np.array(im);n=im.width
    assert im.size==(s['width'],s['height'])
    r={'id':s['id'],'path':f'images/ui_panels/neutral/{s["id"]}.png','size':list(im.size),'format':'PNG','alpha_min':int(a[:,:,3].min()),'alpha_max':int(a[:,:,3].max()),'sha256':sha(W/'staged'/(s['id']+'.png'))}
    if s['id']!='panel-fill':assert r['alpha_min']==0
    if s['id'] in ['popup-frame','gear-slot','ability-icon-frame']:
        # A safe rectangular content inset includes the inner rounded corners.
        safe=next(p for p in range(1,n//2) if a[p:n-p,p:n-p,3].max()==0)
        r['fully_clear_symmetric_inset_px']=safe
        assert a[n//2,n//2,3]==0
    if s['id']=='popup-frame':
        r.update({'slice_inset_px':[80,80,80,80],'slice_coordinates_px':[80,176],'center_slice_size':[96,96],'straight_inner_edge_inset_px':{'left':54,'top':54,'right':53,'bottom':54},'recommended_content_inset_source_px':64,'edge_mode':'stretch','corner_render_size_points':16,'recommended_content_inset_points_at_16pt_corners':12.8})
        assert a[80:176,80:176,3].max()==0
    if s['id']=='gear-slot':
        r.update({'slice_inset_px':[32,32,32,32],'slice_coordinates_px':[32,64],'center_slice_size':[32,32],'recommended_content_inset_source_px':28,'edge_mode':'stretch'})
        assert a[32:64,32:64,3].max()==0
    if s['id']=='panel-fill':
        r['repeat']='both';r['maximum_rgb_seam_difference_0_to_255']=int(max(np.abs(a[:,0,:3].astype(int)-a[:,-1,:3]).max(),np.abs(a[0,:,:3].astype(int)-a[-1,:,:3]).max()))
        assert a[:,:,3].min()==255 and r['maximum_rgb_seam_difference_0_to_255']<=1
    if s['id']=='divider-middle':
        r['repeat']='horizontal';r['alpha_seam_max_difference']=int(np.abs(a[:,0,3].astype(int)-a[:,-1,3]).max())
        assert r['alpha_seam_max_difference']==0
    checks.append(r)

# Explicit joins: no empty gap at either cap-to-middle seam.
for name,col in [('divider-left',-1),('divider-middle',0),('divider-middle',-1),('divider-right',0)]:
    a=np.array(AS[name]);assert a[14:18,col,3].min()>=250

# Create a separate annotated guide. Guides never enter the production sprite.
guide=Image.new('RGB',(1120,700),'#f3efea')
txt(guide,(24,18),'Popup frame: slice and padding guide',30,True)
base=checker((512,512));base.alpha_composite(AS['popup-frame'].resize((512,512),Image.Resampling.NEAREST))
guide.paste(base.convert('RGB'),(24,94));g=ImageDraw.Draw(guide)
for q in (80,176):
    g.line((24+q*2,94,24+q*2,606),fill='#357ab1',width=3)
    g.line((24,94+q*2,536,94+q*2),fill='#357ab1',width=3)
g.rectangle((24+54*2,94+54*2,24+202*2,94+202*2),outline='#b34b6b',width=3)
g.rectangle((24+64*2,94+64*2,24+192*2,94+192*2),outline='#4b8060',width=3)
txt(guide,(565,100),'256 × 256 PNG',25,True)
txt(guide,(565,155),'Blue: cuts at 80 and 176 px',22,fill='#357ab1')
txt(guide,(565,191),'80 × 80 corners / 96 × 96 centre',21)
txt(guide,(565,248),'Rose: straight inner edge ≈ 54 px',22,fill='#b34b6b')
txt(guide,(565,284),'Rounded inner corners curve inward.',20)
txt(guide,(565,335),'Green: safe content inset 64 px',22,fill='#4b8060')
txt(guide,(565,372),'At 16-point corners: 12.8-point inset.',20)
txt(guide,(565,421),'Plain centre uses panel-fill.png.',21)
txt(guide,(565,459),'Stretch edge strips; preserve corners.',21)
txt(guide,(565,501),'Guide markings are not in the artwork.',20)
txt(guide,(24,634),'Gear slot: 96 × 96; cut at 32 / 64; use a 28 px source content inset.',22)
guide.save(W/'slice-guide.png',optimize=True)

# Contact sheet and actual nine-slice previews over four existing game themes.
preview=Image.new('RGB',(1440,1220),'#eee9e4')
txt(preview,(28,18),'Neutral popup UI',34,True)
txt(preview,(28,65),'Ivory stone • bold plum outlines • simple corners • no painted shadows',21)
positions=[('popup-frame',(28,123),(256,256),'Popup frame · 256 × 256'),('panel-fill',(324,150),(128,128),'Plain fill · 128 × 128'),('close-button',(500,150),(128,128),'Close · 128 × 128'),('ability-icon-frame',(694,130),(192,192),'Ability frame · 192 × 192'),('gear-slot',(939,163),(96,96),'Gear slot · 96 × 96')]
for name,pos,size,label in positions:
    tile=checker(size);tile.alpha_composite(AS[name]);preview.paste(tile.convert('RGB'),pos)
    txt(preview,(pos[0],392),label.replace(' · ','\n'),18,True)
bar=checker((320,64));bar.alpha_composite(divider(320),(0,16));preview.paste(bar.convert('RGB'),(1090,173))
txt(preview,(1090,256),'3-piece divider',19,True);txt(preview,(1090,285),'64 × 32 per piece',18)
txt(preview,(28,447),'Same frame, different modes',27,True)
for i,(slug,label) in enumerate([('rocky','Cave'),('water-dungeon','Water'),('fire-dungeon','Fire'),('arena','Arena')]):
    backdrop=ImageOps.fit(Image.open(ROOT/f'images/battle_backgrounds/{slug}.jpg').convert('RGBA'),(328,540))
    p=panel((304,376),32);txt(p,(30,34),'Abilities',26,True)
    close=AS['close-button'].resize((44,44),Image.Resampling.LANCZOS);p.alpha_composite(close,(238,24))
    txt(p,(30,90),'Steady Strike',23,True);txt(p,(30,126),'A reliable attack.',19)
    p.alpha_composite(divider(244).resize((244,24),Image.Resampling.LANCZOS),(30,171))
    txt(p,(30,222),'Ready for battle',21,True);txt(p,(30,258),'Simple, clear and readable.',18)
    backdrop.alpha_composite(p,(12,62));preview.paste(backdrop.convert('RGB'),(28+i*352,498));txt(preview,(28+i*352,1050),label,22,True)
txt(preview,(28,1110),'9-slice check: corners stay fixed while the edge strips stretch.',21)
txt(preview,(28,1146),'Separate light fill sits behind the transparent centre. All eight production assets are PNGs.',20)
preview.save(W/'preview.png',optimize=True)

# Small panels reproduce the user’s lower size limits at 2x for inspection.
small=Image.new('RGBA',(1000,470),'#d6ced5')
for size,pos,label in [((360,240),(24,65),'180 × 120 points'),((520,240),(430,65),'260 × 120 points')]:
    p=panel(size,32);txt(p,(32,32),'Panel title',27,True);txt(p,(32,83),'Clear text and simple borders.',20)
    p.alpha_composite(divider(size[0]-64).resize((size[0]-64,24),Image.Resampling.LANCZOS),(32,127))
    txt(p,(32,179),'Content remains inside the frame.',18);small.alpha_composite(p,pos);txt(small,(pos[0],320),label,22)
txt(small,(24,15),'Small-panel checks · displayed at 2×',26,True)
small.convert('RGB').save(W/'small-panel-check.png',optimize=True)

manifest={'style':'Neutral ivory and stone, dark plum outline','assets':checks,'frame_rendering':{'corner_size_points':16,'source_to_point_scale':.2,'content_inset_points':12.8,'border_visible_thickness_points_approx':9.6,'center_fill':'panel-fill.png','painted_drop_shadow':False},'generation':'Built-in ImageGen; downscaled to requested dimensions and encoded as optimized indexed PNGs with transparency. No game integration changed.','validation':{'assets':8,'required_dimensions_pass':True,'transparent_frame_centres_pass':True,'divider_joins_have_no_alpha_gaps':True,'divider_repeat_alpha_seam_pass':True,'fill_repeat_max_rgb_step':next(r['maximum_rgb_seam_difference_0_to_255'] for r in checks if r['id']=='panel-fill'),'small_panel_preview':'small-panel-check.png'}}
(W/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
readme='''NEUTRAL POPUP UI

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
Cuts: x=80,176 and y=80,176. Corner slices:80x80. Centre:96x96.
The frame is a transparent overlay; tile panel-fill behind its opening.
Straight inner border edge is approximately54px from the source edges.
Recommended rectangular content inset:64source pixels, including corner
clearance. At16-point rendered corner slices this is12.8points.
Visible straight band is approximately9.6points (about10) at that setting.
Use stretch for the plain edge strips; do not stretch corner slices.
Clip the fill to the opening under the frame, not to the full outer box.
See slice-guide.png for marked inner-edge and safe-padding guides.

OTHER PIECES
Close button is fixed size, suggested28points.
Divider is left cap + repeated middle + right cap. Keep the same scale
and vertical alignment across all three pieces.
Ability frame has a fully transparent centre for an icon beneath it.
Gear slot cuts are x=32,64 and y=32,64. Content inset28source pixels.
Use the same light fill beneath its centre when an opaque slot is needed.

No shadows are painted into any asset. Add shadow in code.
Artwork was generated with built-in ImageGen and downscaled to exact
requested dimensions and encoded as optimized indexed PNGs with alpha.
The light centre is intentionally plain and tiles seamlessly. It is opaque.
Frame and gear centres are fully transparent. See manifest.json for checks.
No existing game assets or consuming game code were changed.
'''
(W/'README.txt').write_text(readme,encoding='utf-8')
readme='''NEUTRAL POPUP UI

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
'''
(W/'README.txt').write_text(readme,encoding='utf-8')

# Publish only after every sizing, alpha, repeat and slice check passes.
for r in checks:
    target=ROOT/r['path'];assert not target.exists() or sha(target)==r['sha256'],f'Unexpected existing file: {target}'
for r in checks:
    target=ROOT/r['path'];target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists():shutil.copy2(W/'staged'/(r['id']+'.png'),target)
    assert sha(target)==r['sha256']

def gallery(prefix):
    items=''.join(f'<li><a href="{prefix}{r["path"]}">{r["id"]}.png</a> — {r["size"][0]} × {r["size"][1]}</li>' for r in checks)
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Neutral Popup UI</title><style>body{font:17px system-ui;background:#eee9e4;color:#382432;max-width:1440px;margin:auto;padding:24px}img{max-width:100%;height:auto}a{color:#70536c}li{line-height:1.9}</style><h1>Neutral popup UI</h1><p>Eight simple PNG assets with thick plum outlines, ivory stone bands and clear centres.</p><img src="preview.png" alt="The popup set and panels shown over four game backgrounds"><ul>'+items+'</ul><p><a href="README.txt">Usage notes</a> · <a href="manifest.json">Dimensions and slice settings</a> · <a href="slice-guide.png">Slice and padding guide</a></p><img src="slice-guide.png" alt="Slice cuts and safe content inset"><img src="small-panel-check.png" alt="Frames stretched into small panels"></html>'
(W/'gallery.html').write_text(gallery('../../'),encoding='utf-8')
archive=W/'Neutral-Popup-UI.zip'
assert not archive.exists(),'Archive already exists; do not overwrite an existing deliverable.'
with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
    for r in checks:z.write(ROOT/r['path'],r['path'])
    for name in ['README.txt','manifest.json','slice-guide.png','preview.png','small-panel-check.png']:z.write(W/name,name)
    z.write(W/'generated-clean.json','generation-prompts.json')
    z.writestr('gallery.html',gallery(''))
with zipfile.ZipFile(archive) as z:assert z.testzip() is None
print(json.dumps({'published':8,'folder':str(DEST),'total_sprite_bytes':sum((ROOT/r['path']).stat().st_size for r in checks),'zip':str(archive),'validation':manifest['validation']},indent=2))
print(json.dumps({'checks':checks,'preview':str(W/'preview.png'),'guide':str(W/'slice-guide.png')},indent=2))
