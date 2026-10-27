const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-chest-finish';let unchangedPixels=0;
for(let n=0;n<30;n++){
 const old=PNG.sync.read(fs.readFileSync(`work/cirruskit-walk-seam-repair/frames/frame-${n}.png`)),next=PNG.sync.read(fs.readFileSync(`${root}/frames/frame-${n}.png`));
 for(let y=0;y<512;y++){
   const start=y*512*4,end=start+330*4;
   assert(old.data.subarray(start,end).equals(next.data.subarray(start,end)),`Approved rear region changed in frame ${n+1}, row ${y}`);
   unchangedPixels+=330;
 }
}
assert.deepStrictEqual(JSON.parse(fs.readFileSync(`${root}/poses.json`)),JSON.parse(fs.readFileSync('work/cirruskit-walk-seam-repair/poses.json')));
const report={frames:30,approvedRearPixelsUnchanged:unchangedPixels,unchangedRegion:{x:0,y:0,width:330,height:512},gaitPoseDataUnchanged:true};
fs.writeFileSync(`${root}/preservation-audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
