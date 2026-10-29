from pathlib import Path
import json, hashlib
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont

WORK = Path(__file__).resolve().parent
ROOT = WORK.parents[1]
spec = json.loads((WORK/'prompt.json').read_text(encoding='utf-8'))
destination = ROOT/spec['destination']
original_hash = hashlib.sha256(destination.read_bytes()).hexdigest()
with Image.open(spec['source']) as src:
    image = ImageOps.fit(src.convert('RGB'), (1080,2400), method=Image.Resampling.LANCZOS)
image.save(WORK/'rocky.jpg', quality=95, subsampling=0)
image = Image.open(WORK/'rocky.jpg').convert('RGB')
assert image.size == (1080,2400)
small=image.copy();small.thumbnail((270,600),Image.Resampling.LANCZOS)
small.save(WORK/'preview.jpg',quality=94)
arr=np.asarray(image).astype(np.int16)
decor=((arr[:,:,0]<105)&(arr[:,:,1]<85)&(arr[:,:,2]<115)) | ((arr[:,:,2]>arr[:,:,0]+20)&(arr[:,:,1]>arr[:,:,0]+10))
phones=[(320,568,.094,.118,.695),(390,844,.077,.098,.748),(360,800,.075,.095,.755)]
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',15)
smallfont=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',12)
checks=[]
for cols,rows in [(5,8),(6,10)]:
    board=Image.open(ROOT/f'images/board_backgrounds/rocky{cols}x{rows}.jpg').convert('RGB')
    sheet=Image.new('RGB',(1150,926),'#ece9e7')
    sd=ImageDraw.Draw(sheet)
    ox=20
    for w,h,header_fraction,board_fraction,tray_fraction in phones:
        scale=max(w/1080,h/2400)
        sw,sh=w/scale,h/scale
        left,top=(1080-sw)/2,(2400-sh)/2
        screen=image.resize((w,h),Image.Resampling.LANCZOS,box=(left,top,left+sw,top+sh))
        by=round(h*board_fraction);tray=round(h*tray_fraction)
        if cols==5:
            bw=round(w*.61);bh=round(bw*rows/cols)
        else:
            tile=min(46,(tray-16-by)//rows,(w-32)//cols)
            bw=cols*tile;bh=rows*tile
        bx=(w-bw)//2
        pad=8
        source_box=[int(left+(bx-pad)/scale),int(top+(by-pad)/scale),int(np.ceil(left+(bx+bw+pad)/scale)),int(np.ceil(top+(by+bh+pad)/scale))]
        x1,y1,x2,y2=source_box
        count=int(decor[max(0,y1):min(2400,y2),max(0,x1):min(1080,x2)].sum())
        checks.append({'viewport':[w,h],'grid':[cols,rows],'board_bounds':[bx,by,bx+bw,by+bh],'protected_source_bounds':source_box,'margin_screen_px':pad,'decorative_overlap_pixels':count})
        screen.paste(board.resize((bw,bh),Image.Resampling.LANCZOS),(bx,by))
        d=ImageDraw.Draw(screen)
        header=round(h*header_fraction)
        d.rectangle((0,0,w,header),fill='#eae5f8')
        d.text((w//2,header//2),'Planning Phase',anchor='mm',fill='#36212d',font=smallfont)
        d.rectangle((0,tray,w,h),fill='white')
        d.text((w//2,tray+20),'Creature tray',anchor='mm',fill='#777078',font=smallfont)
        card=(w-36)//6
        for row in range(2):
            for col in range(6):
                cx=10+col*(card+3);cy=tray+42+row*(card+10)
                if cy+card<h-8:d.rounded_rectangle((cx,cy,cx+card,cy+card),radius=7,fill='#f0eeed')
        sheet.paste(screen,(ox,42))
        sd.text((ox,12),f'{w} x {h}  /  {cols} x {rows} grid',fill='#36212d',font=font)
        ox+=w+20
    sd.text((20,902),'Layout previews, not live captures. Planning positions estimated from screenshots and grid sizing.',font=smallfont,fill='#655b62')
    sheet.save(WORK/f'phone-layout-{cols}x{rows}.jpg',quality=94,subsampling=0)
report={'destination':str(destination),'original_sha256':original_hash,'output_sha256':hashlib.sha256((WORK/'rocky.jpg').read_bytes()).hexdigest(),'width':1080,'height':2400,'format':'JPEG','checks':checks,'validation_scope':'Planning layouts for the three supplied phone sizes, with both board shapes and an 8-screen-pixel safety margin. Estimated placements, not live captures or an all-screen guarantee.'}
(WORK/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
assert all(c['decorative_overlap_pixels']==0 for c in checks),'Decorative art overlaps a protected board region'
