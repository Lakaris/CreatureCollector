import os,sys,json
sys.path.insert(0,os.path.join(os.getcwd(),'work/cirruskit-flavor-smooth/analysis-deps'))
import cv2,numpy as np
from pathlib import Path
root=Path('work/cirruskit-flavor-smooth');palette=np.array(json.loads((root/'palette.json').read_text()),np.float32)
for n in [0,1]:
 p=np.fromfile(root/f'warped-{n}.bin',np.float32).reshape(512,512,4);rgb=p[:,:,:3]/np.maximum(.001,p[:,:,3:4]);labels=np.argmin(((rgb[:,:,None,:]-palette)**2).sum(axis=-1),axis=-1)+1;labels[p[:,:,3]<.5]=0
 labels.astype(np.uint8).tofile(root/f'labels-{n}.bin');sdf=[]
 for c in range(len(palette)+1):
  mask=(labels==c).astype(np.uint8);field=cv2.distanceTransform(mask,cv2.DIST_L2,5)-cv2.distanceTransform(1-mask,cv2.DIST_L2,5);sdf.append(field)
 np.stack(sdf,axis=-1).tofile(root/f'sdf-{n}.bin')
