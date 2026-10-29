from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont

WORK = Path(__file__).resolve().parent
ROOT = WORK.parents[1]
spec = json.loads((WORK/'prompt.json').read_text(encoding='utf-8'))
destination = ROOT/spec['destination']
original_hash = hashlib.sha256(destination.read_bytes()).hexdigest()
with Image.open(spec['source']) as source:
    image = ImageOps.fit(source.convert('RGB'), (1080,2400), method=Image.Resampling.LANCZOS)
image.save(WORK/'rocky.jpg', quality=95, subsampling=0)
image = Image.open(WORK/'rocky.jpg').convert('RGB')
with Image.open(WORK/'rocky.jpg') as check:
    assert check.size == (1080,2400) and check.format == 'JPEG'
small = image.copy()
small.thumbnail((270,600),Image.Resampling.LANCZOS)
small.save(WORK/'preview.jpg',quality=94)

# Detect the three outlined accents to check their visibility after cover cropping.
arr = np.asarray(image)
mask = (arr[:,:,0] < 110) & (arr[:,:,1] < 90) & (arr[:,:,2] < 120)
mask[:1340,:] = False
mask[1810:,:] = False
mask[:,:320] = False
mask[:,820:] = False
seen = np.zeros_like(mask)
components = []
for sy,sx in np.argwhere(mask):
    if seen[sy,sx]:
        continue
    stack = [(int(sx),int(sy))]
    seen[sy,sx] = True
    minx=maxx=int(sx); miny=maxy=int(sy); count=0
    while stack:
        x,y=stack.pop(); count+=1
        minx=min(minx,x);maxx=max(maxx,x);miny=min(miny,y);maxy=max(maxy,y)
        for xx,yy in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
            if 0<=xx<1080 and 0<=yy<2400 and mask[yy,xx] and not seen[yy,xx]:
                seen[yy,xx]=True;stack.append((xx,yy))
    if maxx-minx>=85 and maxy-miny>=35:
        components.append([minx,miny,maxx+1,maxy+1])
components.sort(key=lambda box:box[1])
assert len(components)==3, f'Expected three main accents, found {components}'
for box in components:
    assert box[0] >= 360 and box[2] <= 720, 'Accent outline outside middle third.'

phones = [
    {'name':'Short phone','width':320,'height':568,'header_fraction':.094,'board_top_fraction':.118,'tray_fraction':.695},
    {'name':'Tall phone','width':390,'height':844,'header_fraction':.077,'board_top_fraction':.098,'tray_fraction':.748},
    {'name':'Extra-tall phone','width':360,'height':800,'header_fraction':.075,'board_top_fraction':.095,'tray_fraction':.755},
]
board = Image.open(ROOT/'images/board_backgrounds/rocky5x8.jpg').convert('RGB')
font_path = 'C:/Windows/Fonts/segoeui.ttf'
label_font = ImageFont.truetype(font_path,16)
ui_font = ImageFont.truetype(font_path,13)
sheet_w = sum(p['width'] for p in phones) + 80
sheet_h = max(p['height'] for p in phones) + 82
layouts = Image.new('RGB',(sheet_w,sheet_h),'#ece9e7')
raw_crops = layouts.copy()
layout_draw=ImageDraw.Draw(layouts); raw_draw=ImageDraw.Draw(raw_crops)
x_offset=20
checks=[]
for p in phones:
    w,h=p['width'],p['height']
    scale=max(w/1080,h/2400)
    source_w,source_h=w/scale,h/scale
    left,top=(1080-source_w)/2,(2400-source_h)/2
    cropped=image.resize((w,h),Image.Resampling.LANCZOS,box=(left,top,left+source_w,top+source_h))
    raw_crops.paste(cropped,(x_offset,42))
    label=f"{p['name']}  {w} x {h}"
    raw_draw.text((x_offset,12),label,fill='#36212d',font=label_font)
    layout_draw.text((x_offset,12),label,fill='#36212d',font=label_font)
    screen=cropped.copy()
    draw=ImageDraw.Draw(screen)
    header=round(h*p['header_fraction']);tray=round(h*p['tray_fraction'])
    bw=round(w*.61);bh=round(bw*1.6);bx=(w-bw)//2;by=round(h*p['board_top_fraction'])
    screen.paste(board.resize((bw,bh),Image.Resampling.LANCZOS),(bx,by))
    draw.rectangle((0,0,w,header),fill='#eae5f8')
    draw.text((w//2,header//2),'Planning Phase',anchor='mm',fill='#36212d',font=ui_font)
    draw.rectangle((0,tray,w,h),fill='white')
    draw.text((w//2,tray+20),'Creature tray',anchor='mm',fill='#777078',font=ui_font)
    card=(w-36)//6
    for row in range(2):
        for col in range(6):
            cx=10+col*(card+3);cy=tray+42+row*(card+10)
            if cy+card<h-8:
                draw.rounded_rectangle((cx,cy,cx+card,cy+card),radius=7,fill='#f0eeed')
    layouts.paste(screen,(x_offset,42))
    projected=[]
    for box in components:
        bounds=[(box[0]-left)*scale,(box[1]-top)*scale,(box[2]-left)*scale,(box[3]-top)*scale]
        visible=(bounds[0]>=0 and bounds[2]<=w and bounds[1]>=by+bh and bounds[3]<tray)
        projected.append({'bounds':[round(v,2) for v in bounds],'fully_visible_between_board_and_tray':visible})
    if h>=800:
        assert all(v['fully_visible_between_board_and_tray'] for v in projected), f'Accents obscured on {p["name"]}'
    assert abs(left)<.01, 'Unexpected horizontal crop on phone.'
    checks.append({'viewport':[w,h],'source_crop':[round(left,2),round(top,2),round(left+source_w,2),round(top+source_h,2)],'horizontal_crop_px':round(left,3),'board_bounds':[bx,by,bx+bw,by+bh],'tray_top':tray,'accents':projected})
    x_offset+=w+20
layout_draw.text((20,sheet_h-24),'Layout previews based on the supplied screenshots; not live game captures.',font=ui_font,fill='#655b62')
raw_draw.text((20,sheet_h-24),'Centered cover crops at the three requested phone sizes.',font=ui_font,fill='#655b62')
layouts.save(WORK/'phone-layout-preview.jpg',quality=94,subsampling=0)
raw_crops.save(WORK/'phone-crops.jpg',quality=94,subsampling=0)
report={'destination':str(destination),'original_sha256':original_hash,'width':1080,'height':2400,'aspect_ratio':'9:20','format':'JPEG','bytes':(WORK/'rocky.jpg').stat().st_size,'accent_bounds':components,'crop_checks':checks,'validation':'Exact centered cover geometry; board and tray bounds approximated from user screenshots. Three main accents remain fully visible in the exposed band on both tall-phone layouts. Short-phone UI covers this band, as in the supplied screenshot.'}
(WORK/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
