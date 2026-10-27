import sys,json,os
sys.path.insert(0,os.path.join(os.getcwd(),'work/cirruskit-flavor-smooth/analysis-deps'))
import cv2,numpy as np
from pathlib import Path
root=Path('work/cirruskit-flavor-smooth')
rig=json.loads((root/'rig.json').read_text())
def gray(n):
    p=cv2.imread(str(root/'source'/f'frame-{n}.png'),cv2.IMREAD_UNCHANGED).astype(np.float32)
    alpha=p[:,:,3:4]/255.0
    rgb=p[:,:,:3]*alpha+245*(1-alpha)
    return cv2.cvtColor(rgb.astype(np.uint8),cv2.COLOR_BGR2GRAY)
def initial(reverse=False):
    a=np.array(rig['pb' if reverse else 'pa']);b=np.array(rig['pa' if reverse else 'pb']);out=np.zeros((512,512,2),np.float32)
    for tri in rig['tris']:
        v=a[tri];dx=b[tri]-v
        xmin=max(0,int(np.floor(v[:,0].min())));xmax=min(511,int(np.ceil(v[:,0].max())))
        ymin=max(0,int(np.floor(v[:,1].min())));ymax=min(511,int(np.ceil(v[:,1].max())))
        x,y=np.meshgrid(np.arange(xmin,xmax+1),np.arange(ymin,ymax+1));q=np.stack([x-v[0,0],y-v[0,1]],axis=-1)
        inv=np.linalg.inv(np.stack([v[1]-v[0],v[2]-v[0]],axis=1));w=q@inv.T;mask=(w[:,:,0]>=-1e-6)&(w[:,:,1]>=-1e-6)&(w.sum(axis=-1)<=1+1e-6)
        flow=dx[0]+w[:,:,0:1]*(dx[1]-dx[0])+w[:,:,1:2]*(dx[2]-dx[0]);out[ymin:ymax+1,xmin:xmax+1][mask]=flow[mask]
    return out
for a,b in [(0,1),(1,0),(1,2),(2,1),(2,3),(3,2),(3,4),(4,3)]:
    flow=initial(a==1) if {a,b}=={0,1} else None
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    dis.setFinestScale(0);dis.setGradientDescentIterations(50);dis.setVariationalRefinementIterations(25)
    result=dis.calc(gray(a),gray(b),flow)
    result.tofile(str(root/f'flow-{a}-{b}.bin'))
    print(f'Motion analyzed {a}->{b}: max {np.linalg.norm(result,axis=-1).max():.1f}px',flush=True)
