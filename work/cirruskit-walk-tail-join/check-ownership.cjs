const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-tail-join',old='work/cirruskit-walk-ink-finish',read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png'),body=read(`${root}/layers/body.png`),tail=read(`${root}/layers/tail.png`),splits=JSON.parse(fs.readFileSync(`${root}/ownership.json`));
assert.deepEqual(JSON.parse(fs.readFileSync(`${root}/poses.json`)),JSON.parse(fs.readFileSync(`${old}/poses.json`)));
let exclusiveEdgeChecks=0,unchangedOutsideJoinPixelChecks=0,basePosePixelChecks=0;
for(const {y,split} of splits)for(let x=split;x<160;x++){const i=(y*512+x)*4;assert.equal(body.data[i+3],0);assert.equal(tail.data[i+3],0);exclusiveEdgeChecks++;}
const perFrame=[];
for(let n=0;n<30;n++){
 const current=read(`${root}/frames/frame-${n}.png`),prior=read(`${old}/frames/frame-${n}.png`);let changedPixels=0;const bounds=[512,512,0,0];
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4,equal=current.data.subarray(i,i+4).equals(prior.data.subarray(i,i+4));
  if(x>=175||y<355||y>=430){assert(equal,`Unexpected change outside join: frame ${n+1}, ${x},${y}`);unchangedOutsideJoinPixelChecks++;}
  if(!equal){changedPixels++;bounds[0]=Math.min(bounds[0],x);bounds[1]=Math.min(bounds[1],y);bounds[2]=Math.max(bounds[2],x);bounds[3]=Math.max(bounds[3],y);}
  if(n===0&&x>=100&&x<160&&y>=365&&y<=404){assert(current.data.subarray(i,i+4).equals(base.data.subarray(i,i+4)),`Base join mismatch ${x},${y}`);basePosePixelChecks++;}
 }
 perFrame.push({frame:n+1,changedPixels,bounds});
}
const report={frames:30,sameGaitPoseData:true,exclusiveEdgeChecks,basePosePixelChecks,unchangedOutsideJoinPixelChecks,frontChestAndPawsUnchanged:true,perFrame};
fs.writeFileSync(`${root}/ownership-audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
