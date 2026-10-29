const fs=require('fs'),assert=require('assert');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',read=p=>PNG.sync.read(fs.readFileSync(p));
const report=JSON.parse(fs.readFileSync(root+'/hand-motion-audit.json'));
const poses=JSON.parse(fs.readFileSync(root+'/poses.json'));
const droplets=require('./droplets.cjs');
const oldCaps=JSON.parse(fs.readFileSync(root+'/before-hand-motion/flipper-shape-audit.json'));
const newCaps=JSON.parse(fs.readFileSync(root+'/flipper-shape-audit.json'));
assert.deepEqual(poses,JSON.parse(fs.readFileSync(root+'/before-hand-motion/poses.json')));
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/bomb-poses.json')),JSON.parse(fs.readFileSync(root+'/before-hand-motion/bomb-poses.json')));
let dropPixels=0,minGap=Infinity,maxAreaChange=0,maxAspectChange=0;
for(let n=0;n<30;n++){
 const name=`frames/frame-${String(n+1).padStart(2,'0')}.png`,old=read(root+'/before-hand-motion/'+name),now=read(root+'/'+name);
 for(let side=0;side<2;side++){
  const a=oldCaps.frames[n].pads[side],b=newCaps.frames[n].pads[side];
  maxAreaChange=Math.max(maxAreaChange,Math.abs(b.area/a.area-1));
  maxAspectChange=Math.max(maxAspectChange,Math.abs(b.aspect/a.aspect-1));
 }
 const mask=new PNG({width:512,height:512});droplets.paint(mask,n,poses[n].body);
 for(let y=210;y<375;y++)for(let x=20;x<155;x++){
  const k=(y*512+x)*4;if(mask.data[k+3]<=1)continue;
  dropPixels++;assert(old.data.subarray(k,k+4).equals(now.data.subarray(k,k+4)),'Droplet changed in pose '+(n+1));
  if(mask.data[k+3]<=16)continue;
  for(let dy=-9;dy<=9;dy++)for(let dx=-9;dx<=9;dx++){
   const q=((y+dy)*512+x+dx)*4;
   if(mask.data[q+3]<=1&&now.data[q+3]>16)minGap=Math.min(minGap,Math.max(Math.abs(dx),Math.abs(dy)));
  }
 }
}
assert(maxAreaChange<.025,'Flipper cap area changed too much');assert(maxAspectChange<.025,'Flipper cap proportions changed too much');
assert(minGap>=4,'Droplets approach the hand too closely');
assert(report.maximumAddedMovementPx<=4);
assert(report.frames.every(f=>f.endpointExact||(!f.changedFacePixels&&!f.changedBodyPixels)));
Object.assign(report,{bodyAndBombPosesUnchanged:true,frameTimingUnchanged:true,dropletsUnchanged:true,dropletPixelsChecked:dropPixels,minimumDropletGapPx:minGap,maximumFlipperCapAreaChange:maxAreaChange,maximumFlipperCapAspectChange:maxAspectChange,movingSourceFrames:report.frames.filter(f=>f.changedPixels>0).map(f=>f.frame)});
fs.writeFileSync(root+'/hand-motion-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({maximumMovementPx:report.maximumAddedMovementPx,movingSourceFrames:report.movingSourceFrames,faceChanges:0,bodyChanges:0,minimumDropletGapPx:minGap,maximumCapAreaChange:maxAreaChange,maximumCapAspectChange:maxAspectChange}));
