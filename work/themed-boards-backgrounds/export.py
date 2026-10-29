from pathlib import Path
import argparse, hashlib, json, sys
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont

WORK=Path(__file__).resolve().parent
ROOT=WORK.parents[1]
sys.path.insert(0,str(ROOT/'work/rocky-board-exact-grid'))
from measure import measure, luminance
from straighten import straighten_axis, check_grid, save_jpeg

def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()

def build(spec_path):
    spec=json.loads(spec_path.read_text(encoding='utf-8'))
    staged=WORK/'staged'/spec['destination']
    report_path=WORK/'reports'/(spec['id']+'.json')
    source=Path(spec['source'])
    if report_path.exists() and staged.exists():
        prior=json.loads(report_path.read_text(encoding='utf-8'))
        if prior['source_sha256']==digest(source) and prior['sha256']==digest(staged):
            return prior
    staged.parent.mkdir(parents=True,exist_ok=True)
    with Image.open(source) as src:
        native=list(src.size)
        im=ImageOps.fit(src.convert('RGB'),(spec['width'],spec['height']),method=Image.Resampling.LANCZOS)
    extra={}
    if spec['kind']=='board':
        cols,rows=spec['cols'],spec['rows']
        arr=np.asarray(im,dtype=np.float32)
        before=measure(arr,cols,rows)
        for iteration in range(3):
            pos=measure(arr,cols,rows)
            arr=straighten_axis(arr,pos['y'],pos['x'])
            arr=straighten_axis(arr.transpose(1,0,2),pos['x'],list(range(200,rows*200,200))).transpose(1,0,2)
            save_jpeg(arr,staged)
            try:
                extra=check_grid(staged,cols,rows)
                break
            except RuntimeError:
                if iteration==2: raise
                arr=np.asarray(Image.open(staged).convert('RGB'),dtype=np.float32)
        extra.update({'initial_centers':before,'geometric_correction_passes':iteration+1})
    else:
        im.save(staged,quality=95,subsampling=0,optimize=True)
        checks=[]
        for w,h in [(320,568),(390,844),(360,800),(430,932)]:
            scale=max(w/spec['width'],h/spec['height'])
            sw,sh=w/scale,h/scale
            left,top=(spec['width']-sw)/2,(spec['height']-sh)/2
            assert abs(left)<.01
            checks.append({'viewport':[w,h],'horizontal_crop_px':round(left,3),'vertical_crop_each_edge_px':round(top,3)})
        extra={'phone_cover_checks':checks}
    with Image.open(staged) as out:
        assert out.format=='JPEG' and out.size==(spec['width'],spec['height'])
        thumb=out.copy();thumb.thumbnail((270,420),Image.Resampling.LANCZOS)
    preview=WORK/'previews'/(spec['id']+'.jpg');preview.parent.mkdir(exist_ok=True)
    thumb.save(preview,quality=94)
    report={'id':spec['id'],'theme':spec['theme'],'kind':spec['kind'],'destination':spec['destination'],'source':str(source),'source_sha256':digest(source),'native_render_size':native,'width':spec['width'],'height':spec['height'],'format':'JPEG','bytes':staged.stat().st_size,'sha256':digest(staged),'resampled':native!=[spec['width'],spec['height']],**extra}
    report_path.parent.mkdir(exist_ok=True)
    report_path.write_text(json.dumps(report,indent=2),encoding='utf-8')
    return report

def contacts():
    catalogue=json.loads((WORK/'catalogue.json').read_text(encoding='utf-8'))
    font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',22)
    small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',14)
    for start in range(0,len(catalogue['themes']),4):
        themes=catalogue['themes'][start:start+4]
        sheet=Image.new('RGB',(1280,510*len(themes)),'#efebe7');d=ImageDraw.Draw(sheet)
        for i,t in enumerate(themes):
            y=i*510;d.text((20,y+10),t['name'],fill='#36212d',font=font)
            specs=[a for a in catalogue['assets'] if a['theme']==t['slug']]
            for j,s in enumerate(specs):
                p=WORK/'staged'/s['destination']
                if not p.exists():continue
                im=Image.open(p).convert('RGB');im.thumbnail((290,420),Image.Resampling.LANCZOS)
                x=20+j*310;sheet.paste(im,(x,y+72))
                label='Background 1440 x 3200' if s['kind']=='background' else f"Board {s['cols']} x {s['rows']}"
                d.text((x,y+45),label,fill='#655b62',font=small)
            bg=WORK/'staged'/f"images/battle_backgrounds/{t['slug']}.jpg"
            bd=WORK/'staged'/f"images/board_backgrounds/{t['slug']}5x8.jpg"
            if bg.exists() and bd.exists():
                mock=ImageOps.fit(Image.open(bg).convert('RGB'),(270,420),method=Image.Resampling.LANCZOS)
                board=Image.open(bd).resize((160,256),Image.Resampling.LANCZOS)
                mock.paste(board,(55,42));sheet.paste(mock,(980,y+72))
                d.text((980,y+45),'Pairing preview (5 x 8)',fill='#655b62',font=small)
        sheet.save(WORK/f'overview-{start//4+1}.jpg',quality=94,subsampling=0)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--theme');args=p.parse_args()
    reports=[];failures=[]
    for spec_path in sorted((WORK/'generated').glob('*.json')):
        if args.theme and not spec_path.name.startswith(args.theme+'-'):continue
        try:
            r=build(spec_path);reports.append(r)
        except Exception as e:
            failures.append({'id':spec_path.stem,'error':str(e)})
    contacts()
    print(json.dumps({'processed':len(reports),'max_grid_error_px':max((r.get('max_center_error_px',0) for r in reports),default=0),'failures':failures},indent=2))
    if failures:sys.exit(1)
