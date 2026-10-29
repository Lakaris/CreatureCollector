const fs=require('fs'),assert=require('assert');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',backup=root+'/before-synchronized-arms',read=p=>PNG.sync.read(fs.readFileSync(p));
const report=JSON.parse(fs.readFileSync(root+'/audit.json')),prior=JSON.parse(fs.readFileSync(backup+'/audit.json'));
const oldSheet=read(backup+'/waddlepop_attack.png'),sheet=read(root+'/waddlepop_attack.png'),arms=[read(root+'/arm-1.png'),read(root+'/arm-2.png')];
for(const n of [1,2])assert(fs.readFileSync(root+`/arm-${n}.png`).equals(fs.readFileSync(backup+`/arm-${n}.png`)),'Arm artwork changed');
const sign=v=>Math.abs(v)<1e-8?0:Math.sign(v);
function tipX(side,angle){const cx=side?335:181,x=side?357:153,a=angle*Math.PI/180;return cx+Math.cos(a)*(x-cx)-Math.sin(a)*(245-382);}
function covered(side,x,y,angle){const cx=side?335:181,a=angle*Math.PI/180,xx=cx+Math.cos(a)*(x-cx)+Math.sin(a)*(y-382),yy=382-Math.sin(a)*(x-cx)+Math.cos(a)*(y-382);const ix=Math.floor(xx),iy=Math.floor(yy);for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++){const sx=ix+dx,sy=iy+dy;if(sx>=0&&sx<512&&sy>=0&&sy<512&&arms[side].data[(sy*512+sx)*4+3])return true;}return false;}
let changed=0,outside=0;
for(let n=0;n<30;n++){
 const current=report.records[n],old=prior.records[n],angles=current.armAngles;
 for(const key of ['bombVisible','bombPose','expression'])assert.deepStrictEqual(current[key],old[key]);
 assert(angles[0]>=-2&&angles[0]<=12&&angles[1]>=-4&&angles[1]<=22,'Approved arm range exceeded');
 if(n){const previous=report.records[n-1].armAngles;assert.equal(sign(angles[0]-previous[0]),sign(angles[1]-previous[1]),'Arms move or hold at different times in frame '+(n+1));assert.equal(sign(tipX(0,angles[0])-tipX(0,previous[0])),sign(tipX(1,angles[1])-tipX(1,previous[1])),'Hands move in different screen directions');}
 if(n>=10&&n<=13)assert.deepStrictEqual(angles,[12,22],'Throw hold shortened');
 if(n>=22)assert.deepStrictEqual(angles,[0,0],'Arms do not finish recovering together');
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const k=((Math.floor(n/6)*512+y)*sheet.width+n%6*512+x)*4;
  if(oldSheet.data.subarray(k,k+4).equals(sheet.data.subarray(k,k+4)))continue;
  changed++;
  if(![0,1].some(side=>covered(side,x,y,old.armAngles[side])||covered(side,x,y,angles[side])))outside++;
 }
}
assert(changed>1000);assert.equal(outside,0,'Change outside flippers');
report.fullArmAudit={...prior.fullArmAudit,throwMotionUnchanged:false,changedPixels:changed,changedPixelsOutsideFlippers:outside};
report.synchronizedArmAudit={all30FramesSameMovementDirection:true,bothHoldFrames:[11,14],holdDurationMs:240,bothReturnCompleteFrame:23,approvedRotationLimitsPreserved:true,unchangedArmArtwork:true,changedPixels:changed,changedPixelsOutsideFlippers:outside,bombMotionAndExpressionsUnchanged:true};
fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report.synchronizedArmAudit));
