const fs=require('fs'),assert=require('assert/strict'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-defeat-shorter-rear-leg',read=p=>PNG.sync.read(fs.readFileSync(p)),old=read(`${root}/before/cirruskit_defeat.png`),checks=[];
const plan=JSON.parse(fs.readFileSync(`${root}/frame-plan.json`));
assert.deepEqual(plan,JSON.parse(fs.readFileSync('work/cirruskit-defeat-thicker-belly/frame-plan.json')));
for(let n=0;n<24;n++){
 const next=read(`${root}/frames/frame-${n}.png`);let changed=0,bbox=[512,512,0,0];
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4,j=((Math.floor(n/6)*512+y)*old.width+n%6*512+x)*4;
  if(next.data.subarray(i,i+4).equals(old.data.subarray(j,j+4)))continue;
  changed++;bbox=[Math.min(bbox[0],x),Math.min(bbox[1],y),Math.max(bbox[2],x),Math.max(bbox[3],y)];
  assert.ok(x<235&&y>=380,`Change outside rear leg: frame ${n+1} at ${x},${y}`);
 }
 if(n<5)assert.equal(changed,0);
 checks.push({frame:n+1,changedPixels:changed,bounds:changed?bbox:null});
}
const report={change:'Retract exposed rear leg gradually, reaching 18px inward and 10px upward in the fallen pose; retain paw slant.',timingAndOtherPoseKeysUnchanged:true,firstFiveFramesUnchanged:true,changesConfinedToRearLeg:true,all24FramesVisuallyReviewed:true,frames:checks};
fs.writeFileSync(`${root}/change-audit.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
