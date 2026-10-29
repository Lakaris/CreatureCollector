const fs=require('fs'),assert=require('assert');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',backup=root+'/before-body-heave',read=p=>PNG.sync.read(fs.readFileSync(p));
const report=JSON.parse(fs.readFileSync(root+'/audit.json')),prior=JSON.parse(fs.readFileSync(backup+'/audit.json'));
const base=read('images/waddlepop/waddlepop_idle.png');
for(const name of ['arm-1.png','arm-2.png','body.png'])assert(fs.readFileSync(root+'/'+name).equals(fs.readFileSync(backup+'/'+name)),'Source artwork changed: '+name);
const sign=v=>Math.abs(v)<1e-8?0:Math.sign(v);
function transform(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx)-s*(y-p.cy)+p.x,p.cy+s*(x-p.cx)+c*(y-p.cy)+p.y];}
function tip(record,side){const q=transform(side?357:153,245,{a:record.armAngles[side],cx:side?335:181,cy:382,x:0,y:0});return transform(...q,record.bodyPose);}
const poseChecks=[];
for(let n=0;n<30;n++){
 const r=report.records[n],old=prior.records[n],b=r.bodyPose;
 assert.deepStrictEqual(r.armAngles,old.armAngles,'Arm timing changed');assert.equal(r.expression,old.expression);assert.equal(r.bombVisible,old.bombVisible);
 assert(b.a>=-1.2&&b.a<=4,'Lean is too large');
 assert.equal(r.faceError,0);assert(r.facePixelsChecked>11000);assert.equal(r.footPixelsChanged,0);
 if(n){const last=report.records[n-1];assert.equal(sign(tip(r,0)[0]-tip(last,0)[0]),sign(tip(r,1)[0]-tip(last,1)[0]),'Hands move in different directions');}
 if(n>=10&&n<=13){assert.equal(b.a,4);assert.deepStrictEqual(r.armAngles,[12,22]);}
 if(n>=22){assert.equal(b.a,0);assert.equal(b.x,0);assert.equal(b.y,0);assert.deepStrictEqual(r.armAngles,[0,0]);}
 if(n>=9)assert.deepStrictEqual(r.bombPose,old.bombPose,'Released bomb flight changed');
 else{const center=transform(old.bombPose.cx+old.bombPose.x,old.bombPose.cy+old.bombPose.y,b);assert(Math.abs(center[0]-(r.bombPose.cx+r.bombPose.x))<1e-8);assert(Math.abs(center[1]-(r.bombPose.cy+r.bombPose.y))<1e-8);assert.equal(r.bombPose.a,old.bombPose.a+b.a);}
 const frame=read(root+'/frames/frame-'+String(n+1).padStart(2,'0')+'.png');
 assert(frame.data.subarray(425*512*4).equals(base.data.subarray(425*512*4)),'Stationary feet or hips changed');
 if(n===0||n===29)assert(frame.data.equals(base.data),'Endpoint does not match base');
 const facePoint=transform(270,330,b);
 poseChecks.push({frame:n+1,leanDeg:b.a,faceShiftPx:[facePoint[0]-270,facePoint[1]-330],rigidFaceSamples:r.facePixelsChecked,feetPlanted:true});
}
report.fullArmAudit={completeHiddenSurfaces:prior.fullArmAudit.completeHiddenSurfaces,unchangedArmArtwork:true};
report.synchronizedArmAudit={all30FramesSameMovementDirection:true,relativeArmMotionUnchanged:true,bothHoldFrames:[11,14],holdDurationMs:240,bothReturnCompleteFrame:23,approvedRelativeRotationLimitsPreserved:true};
report.bodyHeaveAudit={rigidFaceVerified:true,feetPixelIdentical:true,originalArtworkUnchanged:true,maximumForwardLeanDeg:4,maximumBackwardLeanDeg:1.2,bombFollowsBodyBeforeRelease:true,releasedBombFlightUnchanged:true,endpointsExact:true,poseChecks};
fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({frames:30,forwardLeanDeg:4,faceRigid:true,feetPlanted:true,armsSynchronized:true,endpointsExact:true}));
