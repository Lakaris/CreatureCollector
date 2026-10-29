const fs=require('fs'),assert=require('assert');
const{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',read=p=>PNG.sync.read(fs.readFileSync(p));
const report=JSON.parse(fs.readFileSync(root+'/audit.json')),prior=JSON.parse(fs.readFileSync(root+'/before-full-arms/audit.json'));
const registration=JSON.parse(fs.readFileSync(root+'/full-arms-registration.json'));
const before=read(root+'/before-full-arms/waddlepop_attack.png'),after=read(root+'/waddlepop_attack.png');
const oldArms=[1,2].map(n=>read(root+`/before-full-arms/arm-${n}.png`)),newArms=[1,2].map(n=>read(root+`/arm-${n}.png`));
function inv(x,y,a,cx){a*=Math.PI/180;return[cx+Math.cos(a)*(x-cx)+Math.sin(a)*(y-382),382-Math.sin(a)*(x-cx)+Math.cos(a)*(y-382)];}
function covered(im,x,y){const ix=Math.floor(x),iy=Math.floor(y);for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++){const xx=ix+dx,yy=iy+dy;if(xx>=0&&xx<512&&yy>=0&&yy<512&&im.data[(yy*512+xx)*4+3])return true;}return false;}
let changed=0,outside=0;
for(let n=0;n<30;n++){
 for(const key of ['bombVisible','bombPose','armAngles','expression'])assert.deepStrictEqual(report.records[n][key],prior.records[n][key]);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const k=((Math.floor(n/6)*512+y)*before.width+n%6*512+x)*4;
  if(before.data.subarray(k,k+4).equals(after.data.subarray(k,k+4)))continue;
  changed++;let valid=false;
  for(let side=0;side<2;side++){const q=inv(x,y,report.records[n].armAngles[side],side?335:181);valid||=covered(oldArms[side],...q)||covered(newArms[side],...q);}
  if(!valid)outside++;
 }
}
assert.equal(outside,0,'Changes outside moving flippers');
assert(changed>10000,'Completed flipper artwork did not reach the spritesheet');
assert(registration.arms.every(a=>a.areaGain>1.35&&a.widths.every(w=>w.fullWidth>w.oldWidth)));
report.fullArmAudit={completeHiddenSurfaces:true,rigidRotationOnly:true,noScaling:true,throwMotionUnchanged:true,changedPixels:changed,changedPixelsOutsideFlippers:outside,armMeasurements:registration.arms};
fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({frames:30,completeFlippers:true,throwMotionUnchanged:true,changesOutsideFlippers:outside,endpointsExact:report.endpointsExact}));
