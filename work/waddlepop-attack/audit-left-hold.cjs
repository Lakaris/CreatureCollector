const fs=require('fs'),assert=require('assert');
const{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',backup=root+'/before-longer-left-hold',read=p=>PNG.sync.read(fs.readFileSync(p));
const report=JSON.parse(fs.readFileSync(root+'/audit.json')),prior=JSON.parse(fs.readFileSync(backup+'/audit.json'));
const oldSheet=read(backup+'/waddlepop_attack.png'),sheet=read(root+'/waddlepop_attack.png'),arm=read(root+'/arm-1.png');
for(const n of [1,2])assert(fs.readFileSync(root+`/arm-${n}.png`).equals(fs.readFileSync(backup+`/arm-${n}.png`)),'Arm artwork changed');
for(let n=8;n<=11;n++)assert.equal(report.records[n].armAngles[0],12,'Left arm does not hold its throwing pose');
let maxReturnStep=0;for(let n=12;n<=22;n++)maxReturnStep=Math.max(maxReturnStep,Math.abs(report.records[n].armAngles[0]-report.records[n-1].armAngles[0]));assert(maxReturnStep<=7,'Left arm snaps during recovery');
function covered(x,y,angle){const a=angle*Math.PI/180,xx=181+Math.cos(a)*(x-181)+Math.sin(a)*(y-382),yy=382-Math.sin(a)*(x-181)+Math.cos(a)*(y-382);const ix=Math.floor(xx),iy=Math.floor(yy);for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++){const sx=ix+dx,sy=iy+dy;if(sx>=0&&sx<512&&sy>=0&&sy<512&&arm.data[(sy*512+sx)*4+3])return true;}return false;}
let changed=0,outside=0;
for(let n=0;n<30;n++){
 for(const key of ['bombVisible','bombPose','expression'])assert.deepStrictEqual(report.records[n][key],prior.records[n][key]);
 assert.equal(report.records[n].armAngles[1],prior.records[n].armAngles[1],'Right arm motion changed');
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const k=((Math.floor(n/6)*512+y)*sheet.width+n%6*512+x)*4;if(oldSheet.data.subarray(k,k+4).equals(sheet.data.subarray(k,k+4)))continue;changed++;if(!covered(x,y,prior.records[n].armAngles[0])&&!covered(x,y,report.records[n].armAngles[0]))outside++;}
}
assert.equal(outside,0,'Change outside left flipper');assert(changed>1000);
report.fullArmAudit={...prior.fullArmAudit,throwMotionUnchanged:false,changedPixels:changed,changedPixelsOutsideFlippers:outside};
report.leftArmHoldAudit={holdFrames:[9,12],holdDurationMs:240,addedHoldMs:180,maximumRecoveryStepDeg:maxReturnStep,unchangedArmArtwork:true,changedPixels:changed,changedPixelsOutsideLeftArm:outside,bombAndRightArmMotionUnchanged:true};
fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({frames:30,leftHoldMs:240,maximumRecoveryStepDeg:maxReturnStep,changesOutsideLeftArm:outside,endpointsExact:report.endpointsExact}));
