const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-ink-finish',read=p=>PNG.sync.read(fs.readFileSync(p)),poses=JSON.parse(fs.readFileSync(`${root}/poses.json`)),source=read(`${root}/layers/farFront.png`);
assert.deepStrictEqual(poses,JSON.parse(fs.readFileSync('work/cirruskit-walk-chest-finish/poses.json')));
const stroke=[];for(let y=395;y<=411;y++)for(let x=375;x<=393;x++){const i=(y*512+x)*4;if(source.data[i+3]>=250&&source.data[i]<60&&source.data[i+1]<45&&source.data[i+2]<60)stroke.push({x,y,i});}
assert(stroke.length>40,'Stroke check did not select enough source pixels');
let anchoredChecks=0,protectedChecks=0;
const failures=[];
for(let n=0;n<30;n++){
 const p=read(`${root}/frames/frame-${n}.png`),old=read(`work/cirruskit-walk-chest-finish/frames/frame-${n}.png`),bob=poses[n].bob;
 for(const {x,y,i}of stroke){const j=((y+bob)*512+x)*4;if(![0,1,2].every(c=>Math.abs(source.data[i+c]-p.data[j+c])<=1))failures.push({frame:n+1,x,y,source:[...source.data.subarray(i,i+4)],actual:[...p.data.subarray(j,j+4)]});anchoredChecks++;}
 for(let y=340;y<=385;y++)for(let x=410;x<470;x++){const i=((y+bob)*512+x)*4;assert(p.data.subarray(i,i+4).equals(old.data.subarray(i,i+4)),`Approved chest changed ${n+1}:${x},${y}`);protectedChecks++;}
}
if(failures.length)console.log('Stroke mismatches',failures.slice(0,20));
assert.equal(failures.length,0,'Belly ink must remain anchored in body coordinates');
const oldRear=read('work/cirruskit-walk-chest-finish/layers/nearHind.png'),rear=read(`${root}/layers/nearHind.png`);let trimmed=0;
for(let k=0;k<262144;k++){
 const i=k*4;if(oldRear.data.subarray(i,i+4).equals(rear.data.subarray(i,i+4)))continue;trimmed++;
 const x=k%512,y=k>>9;let oldEdge=x;for(let xx=x+1;xx<234;xx++)if(oldRear.data[(y*512+xx)*4+3]>0)oldEdge=xx;
 assert(oldEdge-x<=4,'Rear correction reached beyond the outline fringe');
 if(rear.data[i+3]>0)assert([0,1,2].every(c=>oldRear.data[i+c]===rear.data[i+c]),'Rear correction repainted a color');
 assert(rear.data[i+3]<=oldRear.data[i+3]);assert(y>=396&&y<=432&&x>=195&&x<233);
}
const report={frames:30,anchoredBellyStrokePixelChecks:anchoredChecks,approvedChestPixelsUnchanged:protectedChecks,trimmedRearOutlinePixels:trimmed,gaitPoseDataUnchanged:true};
fs.writeFileSync(`${root}/ink-audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
