import sys,os
sys.path.insert(0,os.path.join(os.getcwd(),'work/cirruskit-flavor-smooth/analysis-deps'))
import cv2,numpy as np
from pathlib import Path
root=Path('work/cirruskit-flavor-smooth')
for a,b in [(0,1),(1,0),(3,4),(4,3)]:
 f=np.fromfile(root/f'flow-{a}-{b}.bin',np.float32).reshape(512,512,2)
 for s in [2,4,7]:
  cv2.GaussianBlur(f,(0,0),s).tofile(root/f'flow-{a}-{b}-s{s}.bin')
