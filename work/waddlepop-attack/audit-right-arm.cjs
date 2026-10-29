const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',backup=root+'/before-shorter-right-swing',read=p=>PNG.sync.read(fs.readFileSync(p));
const report=JSON.parse(fs.readFileSync(root+'/audit.json')),prior=JSON.parse(fs.readFileSync(backup+'/audit.json'));
const oldSheet=read(backup+'/waddlepop_attack.png'),sheet=read(root+'/waddlepop_attack.png'),arm=read(root+'/arm-2.png');
for(const n of [1,2])assert(fs.readFileSync(root+`/arm-${n}.png`).equals(fs.readFileSync(backup+`/arm-${n}.png`)),'Arm artwork changed');
const target=(prior.records[8].armAngles[1]+prior.records[9].armAngles[1])/2;
assert.equal(Math.max(...report.records.map(f=>f.armAngles[1])),target);
assert.equal(target,22);
function covered(x,y,angle){const a=angle*Math.PI/180,xx=335+Math.cos(a)*(x-335)+Math.sin(a)*(y-382),yy=382-Math.sin(a)*(x-335)+Math.cos(a)*(y-382);const ix=Math.floor(xx),iy=Math.floor(yy);for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++){const sx=ix+dx,sy=iy+dy;if(sx>=0&&sx<512&&sy>=0&&sy<512&&arm.data[(sy*512+sx)*4+3])return true;}return false;}
let changed=0,outside=0;
for(let n=0;n<30;n++){
 for(const key of ['bombVisible','bombPose','expression'])assert.deepStrictEqual(report.records[n][key],prior.records[n][key]);
 assert.equal(report.records[n].armAngles[0],prior.records[n].armAngles[0],'Left arm motion changed');
 if(n>10)assert(report.records[n].armAngles[1]<=report.records[n-1].armAngles[1],'Right arm does not settle smoothly');
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const k=((Math.floor(n/6)*512+y)*sheet.width+n%6*512+x)*4;if(oldSheet.data.subarray(k,k+4).equals(sheet.data.subarray(k,k+4)))continue;changed++;if(!covered(x,y,prior.records[n].armAngles[1])&&!covered(x,y,report.records[n].armAngles[1]))outside++;}
}
assert.equal(outside,0,'Change outside right flipper');assert(changed>1000);
report.fullArmAudit={...prior.fullArmAudit,throwMotionUnchanged:false,changedPixelsOutsideFlippers:0};
report.rightArmSwingAudit={maximumDegrees:target,midpointOfPreviousFrames:[9,10],smoothReturn:true,unchangedArmArtwork:true,changedPixels:changed,changedPixelsOutsideRightArm:outside,bombAndLeftArmMotionUnchanged:true};
fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({frames:30,rightArmPeak:target,midwayBetweenPreviousFrames:[9,10],changesOutsideRightArm:outside,endpointsExact:report.endpointsExact}));
