const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',read=p=>PNG.sync.read(fs.readFileSync(p)),old=read(root+'/before-droplets/waddlepop_flavor.png'),now=read(root+'/waddlepop_flavor.png');
const timeline=JSON.parse(fs.readFileSync(root+'/droplets/timeline.json'));
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/poses.json')),JSON.parse(fs.readFileSync(root+'/before-droplets/poses.json')));
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/waddlepop_flavor.json')).frames,JSON.parse(fs.readFileSync(root+'/before-droplets/waddlepop_flavor.json')).frames);
assert(read(root+'/base.png').data.equals(read(root+'/before-droplets/base.png').data));
const frames=[];
for(let n=0;n<30;n++){
 const distance=new Uint16Array(512*512).fill(1024),newPixels=new Uint8Array(512*512);let added=0;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const local=y*512+x,k=((Math.floor(n/6)*512+y)*now.width+n%6*512+x)*4;
  if(old.data[k+3]>16)distance[local]=0;
  if(old.data.subarray(k,k+4).equals(now.data.subarray(k,k+4)))continue;
  assert(old.data[k+3]<=1,'An existing character pixel changed in frame '+(n+1));
  assert(now.data[k+3]>0&&x<150&&y>220&&y<365,'Unexpected edit outside droplet area');
  added++;if(now.data[k+3]>16)newPixels[local]=1;
 }
 if(!timeline[n].visible){assert.equal(added,0);frames.push({frame:n+1,visible:false,unchanged:true});continue;}
 assert(added>80,'Missing droplet burst');
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const k=y*512+x;if(x)distance[k]=Math.min(distance[k],distance[k-1]+1);if(y){distance[k]=Math.min(distance[k],distance[k-512]+1);if(x)distance[k]=Math.min(distance[k],distance[k-513]+1);if(x<511)distance[k]=Math.min(distance[k],distance[k-511]+1);}}
 for(let y=511;y>=0;y--)for(let x=511;x>=0;x--){const k=y*512+x;if(x<511)distance[k]=Math.min(distance[k],distance[k+1]+1);if(y<511){distance[k]=Math.min(distance[k],distance[k+512]+1);if(x)distance[k]=Math.min(distance[k],distance[k+511]+1);if(x<511)distance[k]=Math.min(distance[k],distance[k+513]+1);}}
 let minGap=1024,components=0;for(let k=0;k<newPixels.length;k++)if(newPixels[k])minGap=Math.min(minGap,distance[k]);
 for(let k=0;k<newPixels.length;k++)if(newPixels[k]){const queue=[k];newPixels[k]=0;for(let j=0;j<queue.length;j++)for(const delta of [-513,-512,-511,-1,1,511,512,513]){const next=queue[j]+delta;if(newPixels[next]){newPixels[next]=0;queue.push(next);}}if(queue.length>=3)components++;}
 assert.equal(components,3,'Expected three separate droplets in frame '+(n+1));assert(minGap>=10,'Droplets too close to silhouette in frame '+(n+1));
 frames.push({frame:n+1,visible:true,addedPixels:added,detachedDroplets:components,minimumGapPx:minGap});
}
const report={baseUnchanged:true,existingPixelsAboveAlpha1Identical:true,maximumCoveredBackgroundAlpha:1,expressionsUnchanged:true,timingUnchanged:true,bodyAndBombPosesUnchanged:true,overlappingVisiblePixels:0,threeSeparateDroplets:true,minimumGapPx:Math.min(...frames.filter(f=>f.visible).map(f=>f.minimumGapPx)),frames};
fs.writeFileSync(root+'/droplet-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({visibleFrames:frames.filter(f=>f.visible).map(f=>f.frame),minimumGapPx:report.minimumGapPx,overlappingPixels:0,existingArtworkPixelIdentical:true}));
