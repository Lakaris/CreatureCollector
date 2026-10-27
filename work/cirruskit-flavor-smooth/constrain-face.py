import sys,os
sys.path.insert(0,os.path.join(os.getcwd(),'work/cirruskit-flavor-smooth/analysis-deps'))
import cv2,numpy as np
from pathlib import Path
root=Path('work/cirruskit-flavor-smooth')
a=np.array([[405,248],[372,265],[403,274],[425,264]],np.float32);b=np.array([[425,328],[394,336],[420,345],[440,339]],np.float32)
xx,yy=np.meshgrid(np.arange(512),np.arange(512));grid=np.stack([xx,yy],axis=-1).astype(np.float32)
for i,j,src,dst,center,radii in [(0,1,a,b,[402,261],[54,36]),(1,0,b,a,[420,335],[47,28])]:
 f=np.fromfile(root/f'flow-{i}-{j}-s2.bin',np.float32).reshape(512,512,2).copy()
 affine=np.linalg.lstsq(np.c_[src,np.ones(4)],dst,rcond=None)[0];target=np.dstack([grid,np.ones((512,512))])@affine-grid
 radius=np.sqrt(((grid-np.array(center))/np.array(radii))**2).sum(axis=-1)
 # Smoothly constrain the central nose/mouth area while leaving the cheek edges free.
 u=np.clip((radius-.45)/.55,0,1);w=(1-u*u*(3-2*u))[:,:,None]
 f=f*(1-w)+target*w;f.astype(np.float32).tofile(root/f'flow-{i}-{j}-face.bin')
 print(i,j,affine.tolist())
