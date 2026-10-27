import os,sys
sys.path.insert(0,os.path.join(os.getcwd(),'work/cirruskit-flavor-smooth/analysis-deps'))
import cv2,numpy as np
from pathlib import Path
root=Path('work/cirruskit-flavor-smooth')
def gray(n):
 p=cv2.imread(str(root/'source'/f'frame-{n}.png'),-1).astype(np.float32);a=p[:,:,3:4]/255
 return cv2.cvtColor((p[:,:,:3]*a+245*(1-a)).astype(np.uint8),cv2.COLOR_BGR2GRAY)
for a,b,initial in [('0','h','0-1'),('h','0','1-0'),('h','1','0-1'),('1','h','1-0')]:
 init=np.fromfile(root/f'flow-{initial}.bin',np.float32).reshape(512,512,2)*.5
 dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM);dis.setFinestScale(0);dis.setGradientDescentIterations(60);dis.setVariationalRefinementIterations(30);dis.setVariationalRefinementAlpha(40)
 flow=dis.calc(gray(a),gray(b),init)
 cv2.GaussianBlur(flow,(0,0),1.2).tofile(root/f'flow-{a}-{b}.bin')
 print(a,b,flush=True)
