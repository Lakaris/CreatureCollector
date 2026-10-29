from pathlib import Path
import json, hashlib
from PIL import Image, ImageOps, ImageDraw, ImageFont

WORK=Path(__file__).resolve().parent
ROOT=WORK.parents[1]
spec=json.loads((WORK/'prompt.json').read_text(encoding='utf-8'))
active=ROOT/spec['destination']
original_hash=hashlib.sha256(active.read_bytes()).hexdigest()
with Image.open(spec['source']) as src:
    native_size=list(src.size)
    image=ImageOps.fit(src.convert('RGB'),(1440,3200),method=Image.Resampling.LANCZOS)
image.save(WORK/'rocky.jpg',quality=95,subsampling=0,optimize=True)
with Image.open(WORK/'rocky.jpg') as check:
    assert check.size==(1440,3200) and check.format=='JPEG' and check.mode=='RGB'
    image=check.copy()
preview=image.copy();preview.thumbnail((360,800),Image.Resampling.LANCZOS)
preview.save(WORK/'preview.jpg',quality=94)
old=Image.open(active).convert('RGB')
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',16)
smallfont=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',12)
phones=[(320,568),(390,844),(360,800),(430,932)]
sheet=Image.new('RGB',(sum(w for w,h in phones)+100,1012),'#eee9e6')
draw=ImageDraw.Draw(sheet)
x=20;checks=[]
for w,h in phones:
    scale=max(w/1440,h/3200)
    sw,sh=w/scale,h/scale
    left,top=(1440-sw)/2,(3200-sh)/2
    cropped=image.resize((w,h),Image.Resampling.LANCZOS,box=(left,top,left+sw,top+sh))
    sheet.paste(cropped,(x,42))
    draw.text((x,12),f'{w} x {h}',fill='#493e45',font=font)
    assert abs(left)<.01,'Unexpected horizontal cropping'
    checks.append({'viewport':[w,h],'source_crop':[round(v,2) for v in (left,top,left+sw,top+sh)],'horizontal_crop_px':round(left,3),'vertical_crop_each_edge_px':round(top,3)})
    x+=w+20
draw.text((20,988),'Centered cover crops of the new background; no game interface shown.',fill='#655b62',font=smallfont)
sheet.save(WORK/'phone-crops.jpg',quality=94,subsampling=0)
comparison=Image.new('RGB',(820,904),'#eee9e6')
cd=ImageDraw.Draw(comparison)
for source,x,label in [(old,10,'Original 3:4 on 390 x 844'),(image,420,'New 9:20 on 390 x 844')]:
    crop=ImageOps.fit(source,(390,844),method=Image.Resampling.LANCZOS)
    comparison.paste(crop,(x,42))
    cd.text((x,12),label,font=font,fill='#493e45')
comparison.save(WORK/'phone-before-after.jpg',quality=94,subsampling=0)
# An unscaled sample from the export for checking line quality at final pixels.
image.crop((0,850,600,1550)).save(WORK/'detail-100-percent.png')
report={'destination':str(active),'original_sha256':original_hash,'output_sha256':hashlib.sha256((WORK/'rocky.jpg').read_bytes()).hexdigest(),'width':1440,'height':3200,'aspect_ratio':'9:20','format':'JPEG','bytes':(WORK/'rocky.jpg').stat().st_size,'native_render_size':native_size,'export_method':'Lanczos resampling; no new native detail claimed','checks':checks}
(WORK/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
