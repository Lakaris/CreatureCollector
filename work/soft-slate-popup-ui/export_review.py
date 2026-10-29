from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import json, hashlib, shutil, numpy as np
W=Path(__file__).resolve().parent;ROOT=W.parents[1];D=W/'staged';D.mkdir(exist_ok=True)
specs=json.loads((W/'generated.json').read_text(encoding='utf-8'))
assets={};checks=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
for s in specs:
    dest=D/(s['id']+'.png')
    if 'copy' in s:shutil.copy2(s['copy'],dest)
    else:
        im=Image.open(s['source']).convert('RGBA').resize((s['width'],s['height']),Image.Resampling.LANCZOS)
        im.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).save(dest,optimize=True)
    im=Image.open(dest).convert('RGBA');assets[s['id']]=im;a=np.array(im);n=im.width
    assert im.size==(s['width'],s['height'])
    r={'id':s['id'],'path':'images/ui_panels/soft-slate/'+dest.name,'size':list(im.size),'sha256':sha(dest),'alpha_min':int(a[:,:,3].min()),'alpha_max':int(a[:,:,3].max())}
    if s['id']=='panel-fill':
        assert a[:,:,3].min()==255
        r['repeat_rgb_step']=int(max(np.abs(a[:,0,:3].astype(int)-a[:,-1,:3]).max(),np.abs(a[0,:,:3].astype(int)-a[-1,:,:3]).max()))
        r['centre_rgb']=a[n//2,n//2,:3].tolist()
        assert r['repeat_rgb_step']<=1
    else:assert a[:,:,3].min()==0
    if s['id'] in ('popup-frame','gear-slot','ability-icon-frame'):
        r['safe_clear_inset_px']=next(p for p in range(1,n//2) if a[p:n-p,p:n-p,3].max()==0)
        x=np.where(a[n//2,:,3]>127)[0];y=np.where(a[:,n//2,3]>127)[0]
        r['inner_edge_insets_px']={'left':int(x[x<n//2][-1])+1,'right':int(n-x[x>n//2][0]),'top':int(y[y<n//2][-1])+1,'bottom':int(n-y[y>n//2][0])}
    if s['id']=='popup-frame':
        r.update({'slice_px':80,'cuts_px':[80,176],'content_inset_px':64});assert a[80:176,80:176,3].max()==0 and a[64:192,64:192,3].max()==0
    if s['id']=='gear-slot':
        r.update({'slice_px':32,'cuts_px':[32,64],'content_inset_px':28});assert a[32:64,32:64,3].max()==0 and a[28:68,28:68,3].max()==0
    if s['id'].startswith('divider'):
        r['left_edge_alpha_rows']=np.where(a[:,0,3]>127)[0].tolist();r['right_edge_alpha_rows']=np.where(a[:,-1,3]>127)[0].tolist()
    if s['id']=='divider-middle':
        r['repeat_alpha_difference']=int(np.abs(a[:,0,3].astype(int)-a[:,-1,3]).max())
        # Allow at most two alpha levels of export antialiasing (under 1%).
        # The visible bar still needs matching opaque rows and no seam gap.
        assert r['repeat_alpha_difference']<=2
        assert np.array_equal(a[:,0,3]>127,a[:,-1,3]>127)
    checks.append(r)
for name,col in [('divider-left',-1),('divider-middle',0),('divider-middle',-1),('divider-right',0)]:
    assert np.array(assets[name])[15:17,col,3].min()>245

def text(im,xy,label,size=22,bold=False,fill='#382432'):
    f=ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),size)
    ImageDraw.Draw(im).text(xy,label,font=f,fill=fill)
def nine(im,size,cut=80,corner=32):
    n=im.width;src=[0,cut,n-cut,n];xd=[0,corner,size[0]-corner,size[0]];yd=[0,corner,size[1]-corner,size[1]];out=Image.new('RGBA',size)
    for y in range(3):
        for x in range(3):out.alpha_composite(im.crop((src[x],src[y],src[x+1],src[y+1])).resize((xd[x+1]-xd[x],yd[y+1]-yd[y]),Image.Resampling.LANCZOS),(xd[x],yd[y]))
    return out
def panel(size,frame=None,fill=None):
    out=Image.new('RGBA',size);inset=20
    tile=fill if fill is not None else assets['panel-fill']
    for y in range(inset,size[1]-inset,128):
        for x in range(inset,size[0]-inset,128):out.alpha_composite(tile.crop((0,0,min(128,size[0]-inset-x),min(128,size[1]-inset-y))),(x,y))
    out.alpha_composite(nine(frame if frame is not None else assets['popup-frame'],size));return out
def divider(width):
    out=Image.new('RGBA',(width,32));out.alpha_composite(assets['divider-left'],(0,0))
    for x in range(64,width-64,64):out.alpha_composite(assets['divider-middle'].crop((0,0,min(64,width-64-x),32)),(x,0))
    out.alpha_composite(assets['divider-right'],(width-64,0));return out

preview=Image.new('RGB',(1440,1040),'#eee9e4')
text(preview,(28,18),'Soft slate popup set',34,True)
text(preview,(28,65),'Muted slate border · cool off-white centre · thick charcoal-plum outlines',22)
for i,(slug,label) in enumerate([('rocky','Cave'),('water-dungeon','Water'),('fire-dungeon','Fire'),('arena','Arena')]):
    back=ImageOps.fit(Image.open(ROOT/f'images/battle_backgrounds/{slug}.jpg').convert('RGBA'),(328,540))
    p=panel((304,380));text(p,(30,35),'Abilities',26,True);p.alpha_composite(assets['close-button'].resize((44,44),Image.Resampling.LANCZOS),(239,25))
    text(p,(30,98),'Steady Strike',23,True);text(p,(30,137),'A reliable attack.',19)
    p.alpha_composite(divider(244).resize((244,24),Image.Resampling.LANCZOS),(30,176))
    text(p,(30,234),'Ready for battle',21,True);text(p,(30,273),'Simple, clear and readable.',18)
    back.alpha_composite(p,(12,64));preview.paste(back.convert('RGB'),(28+i*352,112));text(preview,(28+i*352,665),label,23,True)
text(preview,(28,733),'Matching pieces',27,True)
for name,x,size,label in [('popup-frame',28,(200,200),'Popup · 256 × 256'),('close-button',300,(128,128),'Close · 128 × 128'),('ability-icon-frame',520,(192,192),'Ability · 192 × 192'),('gear-slot',790,(96,96),'Gear · 96 × 96')]:
    im=assets[name].resize(size,Image.Resampling.LANCZOS);preview.paste(im,(x,790),im);text(preview,(x,1000),label,18,True)
bar=divider(320);preview.paste(bar,(1055,840),bar);text(preview,(1055,900),'3-piece divider',20,True)
preview.save(W/'preview.png',optimize=True)

compare=Image.new('RGB',(920,470),'#eee9e4')
old=Image.open(ROOT/'images/ui_panels/violet/popup-frame.png').convert('RGBA')
oldfill=Image.open(ROOT/'images/ui_panels/violet/panel-fill.png').convert('RGBA')
for x,frame,label,fill in [(24,old,'Previous blue-violet',oldfill),(480,assets['popup-frame'],'Soft slate',assets['panel-fill'])]:
    p=panel((416,320),frame,fill);text(p,(32,32),'Panel title',29,True);text(p,(32,96),'A plain, light centre for text.',22)
    compare.paste(p,(x,76),p);text(compare,(x,24),label,26,True)
text(compare,(24,420),'Same 80 px slice cuts and 64 px recommended content inset.',21)
compare.save(W/'comparison.png',optimize=True)

guide=Image.new('RGB',(1120,660),'#eee9e4');text(guide,(24,18),'Soft slate frame: slice and padding guide',29,True)
large=assets['popup-frame'].resize((512,512),Image.Resampling.NEAREST);guide.paste(large,(24,84),large);g=ImageDraw.Draw(guide)
for k in [80,176]:g.line((24+2*k,84,24+2*k,596),fill='#397ca9',width=3);g.line((24,84+2*k,536,84+2*k),fill='#397ca9',width=3)
inner=next(c['inner_edge_insets_px'] for c in checks if c['id']=='popup-frame')
g.rectangle((24+2*inner['left'],84+2*inner['top'],24+2*(256-inner['right']),84+2*(256-inner['bottom'])),outline='#b44d69',width=3)
g.rectangle((152,212,408,468),outline='#477c55',width=3)
for y,t,color in [(110,'256 × 256 PNG','#382432'),(170,'Blue: cuts at 80 and 176 px','#397ca9'),(220,'Rose: measured inner border edge','#b44d69'),(270,'Green: 64 px safe content inset','#477c55'),(325,'16-point corners → 12.8-point padding','#382432'),(380,'Gear slot: 96 × 96; cut at 32 / 64','#382432'),(430,'Gear content inset: 28 source pixels','#382432'),(495,'The markings are only in this guide.','#382432')]:text(guide,(560,y),t,22,fill=color)
guide.save(W/'slice-guide.png',optimize=True)
manifest={'variant':'Soft slate','palette_targets':{'border':'#716C86','centre':'#F5F3F8','outline':'#382C40','highlight':'#ADA8BD','bevel':'#565168'},'assets':checks,'center_fill':'Cool off-white with a faint lavender-grey tint','popup_slice_px':80,'gear_slice_px':32,'popup_content_inset_px':64,'gear_content_inset_px':28,'generation':'Built-in ImageGen palette edits; final PNG export resizing and indexed encoding','checks':'Requested dimensions, transparent centre slices, safe content rectangles, divider alpha joins and repeat seam verified.'}
(W/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'assets':len(checks),'frame':checks[0],'divider_checks':[c for c in checks if c['id'].startswith('divider')],'preview':str(W/'preview.png')},indent=2))
