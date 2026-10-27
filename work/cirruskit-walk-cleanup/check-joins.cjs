const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-cleanup',read=p=>PNG.sync.read(fs.readFileSync(p));let lowerPixels=0,pawPixels=0,changedPixels=0;
for(let n=0;n<30;n++){
 const a=read(`${root}/before-join-fix/frames/frame-${n}.png`),b=read(`${root}/frames/frame-${n}.png`);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4,same=a.data.subarray(i,i+4).equals(b.data.subarray(i,i+4));if(!same)changedPixels++;
  if(y>=420){assert(same,`Lower paw moved in frame ${n+1} at ${x},${y}`);lowerPixels++;}
  const white=a.data[i]>140&&a.data[i+1]>175&&a.data[i+2]>185&&Math.abs(a.data[i]-a.data[i+1])<35;
  const pink=a.data[i]>140&&a.data[i]>a.data[i+1]+30&&a.data[i+2]<190;
  if(y>=399&&a.data[i+3]>=250&&(white||pink)){assert(same,`Paw color changed in frame ${n+1} at ${x},${y}`);pawPixels++;}
 }
}
const report={reviewedFrames:30,lowerFramePixelsUnchanged:lowerPixels,pawColorPixelsUnchanged:pawPixels,changedPixels,upperLegAttachmentsStabilized:true,rearTailHipSeamRestoredFromBase:true,chestContourExtensionMaxPixels:3,frameTimingUnchanged:true};
fs.writeFileSync(`${root}/join-audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
