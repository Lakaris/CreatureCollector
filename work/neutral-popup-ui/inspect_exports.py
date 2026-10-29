from pathlib import Path
from PIL import Image
import json,numpy as np
W=Path(__file__).resolve().parent
specs=json.loads((W/'generated-clean.json').read_text(encoding='utf-8'))
D=W/'staged';D.mkdir(exist_ok=True)
report=[]
for s in specs:
    im=Image.open(s['source']).convert('RGBA').resize((s['width'],s['height']),Image.Resampling.LANCZOS)
    im=im.quantize(colors=256,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE)
    im.save(D/(s['id']+'.png'),optimize=True)
    im=im.convert('RGBA')
    a=np.array(im);h,w=a.shape[:2]
    item={'id':s['id'],'size':im.size,'bbox':im.getbbox(),'alpha_min':int(a[:,:,3].min()),'alpha_max':int(a[:,:,3].max()),'center_alpha':int(a[h//2,w//2,3])}
    if s['id'] in ['popup-frame','ability-icon-frame','gear-slot']:
        x=np.where(a[h//2,:,3]>127)[0];y=np.where(a[:,w//2,3]>127)[0]
        item['horizontal_mid_alpha_runs']=[int(x[0]),int(x[x<w//2][-1]),int(x[x>w//2][0]),int(x[-1])]
        item['vertical_mid_alpha_runs']=[int(y[0]),int(y[y<h//2][-1]),int(y[y>h//2][0]),int(y[-1])]
    if s['id'].startswith('divider'):
        item['left_alpha']=a[:,0,3].tolist();item['right_alpha']=a[:,-1,3].tolist()
    if s['id']=='panel-fill':
        item['rgb_range']=[a[:,:,:3].min(axis=(0,1)).tolist(),a[:,:,:3].max(axis=(0,1)).tolist()]
        item['seam_difference']=int(max(np.abs(a[:,0,:3].astype(int)-a[:,-1,:3]).max(),np.abs(a[0,:,:3].astype(int)-a[-1,:,:3]).max()))
    report.append(item)
(W/'initial-inspection.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
