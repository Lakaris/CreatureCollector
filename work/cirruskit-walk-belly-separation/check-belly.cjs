const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-belly-separation',prior='work/cirruskit-walk-tail-join',read=p=>PNG.sync.read(fs.readFileSync(p)),poses=JSON.parse(fs.readFileSync(`${root}/poses.json`)),belly=read(`${root}/layers/belly.png`),leg=read(`${root}/layers/farFront.png`),oldLeg=read(`${prior}/layers/farFront.png`);
assert.deepEqual(poses,JSON.parse(fs.readFileSync(`${prior}/poses.json`)));
let bodyAnchoredPixels=0,bodyAnchoredInkPixels=0,unchangedRearPixels=0,originalPawSourcePixels=0;const perFrame=[],failures=[];
for(let y=417;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;assert(leg.data.subarray(i,i+4).equals(oldLeg.data.subarray(i,i+4)));originalPawSourcePixels++;}
for(let n=0;n<30;n++){
 const p=read(`${root}/frames/frame-${n}.png`),before=read(`${prior}/frames/frame-${n}.png`),bob=poses[n].bob;
 for(let y=390;y<419;y++)for(let x=374;x<411;x++){const i=(y*512+x)*4;if(belly.data[i+3]!==255)continue;const j=((y+bob)*512+x)*4;if(!p.data.subarray(j,j+4).equals(belly.data.subarray(i,i+4)))failures.push({frame:n+1,x,y,expected:[...belly.data.subarray(i,i+4)],actual:[...p.data.subarray(j,j+4)]});bodyAnchoredPixels++;if(belly.data[i]<60)bodyAnchoredInkPixels++;}
 for(let y=0;y<512;y++)for(let x=0;x<250;x++){const i=(y*512+x)*4;assert(p.data.subarray(i,i+4).equals(before.data.subarray(i,i+4)),`Rear changed ${n+1}:${x},${y}`);unchangedRearPixels++;}
 const seen=new Uint8Array(262144),stack=[0];seen[0]=1;
 while(stack.length){const k=stack.pop(),x=k%512,y=k>>9;for(const [xx,yy]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(xx<0||xx>=512||yy<0||yy>=512)continue;const z=yy*512+xx;if(!seen[z]&&p.data[z*4+3]<128){seen[z]=1;stack.push(z);}}}
 const gaps=[];for(let y=375;y<455;y++)for(let x=335;x<455;x++){const k=y*512+x;if(p.data[k*4+3]<128&&!seen[k])gaps.push([x,y]);}
 const darkSeen=new Uint8Array(262144),specks=[],dark=k=>p.data[k*4+3]>=128&&p.data[k*4]<70&&p.data[k*4+1]<55&&p.data[k*4+2]<70;
 for(let start=0;start<262144;start++){if(darkSeen[start]||!dark(start))continue;const todo=[start],part=[];darkSeen[start]=1;while(todo.length){const k=todo.pop(),x=k%512,y=k>>9;part.push(k);for(let yy=Math.max(0,y-1);yy<=Math.min(511,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(511,x+1);xx++){const z=yy*512+xx;if(!darkSeen[z]&&dark(z)){darkSeen[z]=1;todo.push(z);}}}if(part.length<16&&part.some(k=>k%512>=335&&k%512<455&&(k>>9)>=375&&(k>>9)<455))specks.push(part.map(k=>[k%512,k>>9]));}
 perFrame.push({frame:n+1,enclosedGaps:gaps,detachedDarkMarks:specks});
}
const report={frames:30,sameGaitPoseData:true,bodyAnchoredPixels,bodyAnchoredInkPixels,unchangedRearPixels,originalPawSourcePixels,failures,perFrame};
fs.writeFileSync(`${root}/belly-audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,failures:failures.slice(0,8),perFrame:perFrame.filter(f=>f.enclosedGaps.length||f.detachedDarkMarks.length)}));
assert.equal(failures.length,0,'Visible belly must stay fixed in body coordinates');assert(perFrame.every(f=>!f.detachedDarkMarks.length),'Detached black marks');
