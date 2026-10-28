const fs=require('fs'),assert=require('assert'),crypto=require('crypto'),{execFileSync}=require('child_process'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack-paw-alignment',dir='images/cirruskit',read=p=>PNG.sync.read(fs.readFileSync(p)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),before=read(`${root}/before/cirruskit_attack.png`),sheet=read(`${root}/before/cirruskit_attack.png`),plan=JSON.parse(fs.readFileSync(`${root}/frame-plan.json`)),changes=JSON.parse(fs.readFileSync(`${root}/changes.json`));
assert.deepEqual(plan,JSON.parse(fs.readFileSync('work/cirruskit-attack-outline-repair/frame-plan.json')));
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);},perFrame=[];let totalChanged=0;
function inspectAlpha(p,n){
 const seen=new Uint8Array(262144);let parts=0;
 for(let start=0;start<262144;start++){if(seen[start]||p.data[start*4+3]<80)continue;parts++;let todo=[start];seen[start]=1;while(todo.length){const k=todo.pop(),x=k%512,y=k>>9;for(let yy=Math.max(0,y-1);yy<=Math.min(511,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(511,x+1);xx++){const j=yy*512+xx;if(!seen[j]&&p.data[j*4+3]>=80){seen[j]=1;todo.push(j);}}}}
 assert.equal(parts,1,`Detached part in frame ${n+1}`);seen.fill(0);
 for(let start=0;start<262144;start++){if(seen[start]||p.data[start*4+3]>=128)continue;let todo=[start],area=0,exterior=false;seen[start]=1;while(todo.length){const k=todo.pop(),x=k%512,y=k>>9;area++;if(!x||!y||x===511||y===511)exterior=true;for(const [xx,yy]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(xx<0||xx>=512||yy<0||yy>=512)continue;const j=yy*512+xx;if(!seen[j]&&p.data[j*4+3]<128){seen[j]=1;todo.push(j);}}}assert(exterior||area>24,`Small gap in frame ${n+1}`);}
}
for(let n=0;n<25;n++){
 const p=read(`${root}/frames/frame-${n}.png`);let changed=0;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4,j=((Math.floor(n/5)*512+y)*sheet.width+n%5*512+x)*4;
  if(!p.data.subarray(i,i+4).equals(before.data.subarray(j,j+4))){assert(x<260&&y>260&&y<480,'Change outside rear leg');changed++;}
  if(!x||!y||x===511||y===511)assert.equal(p.data[i+3],0,'Canvas clipping');p.data.copy(sheet.data,j,i,i+4);
 }
 assert.equal(changed,changes[n].changedPixels);if(n===0||n===24)assert.equal(changed,0);totalChanged+=changed;inspectAlpha(p,n);
 const pose=plan.frames[n],correctedHind=pose.hind-Math.max(0,pose.hind+pose.tilt-32)*smooth((pose.hind-10)/20);
 perFrame.push({frame:n+1,changedPixels:changed,oldPawAngleDegrees:pose.hind+pose.tilt,correctedPawAngleDegrees:correctedHind+pose.tilt,bounds:changes[n].bounds});
}
assert(fs.readFileSync(`${dir}/cirruskit_attack.json`).equals(fs.readFileSync(`${root}/before/cirruskit_attack.json`)),'Metadata changed');
for(const [name,digest]of Object.entries(JSON.parse(fs.readFileSync('work/cirruskit-attack/protected-hashes.json'))))assert.equal(hash(`${dir}/${name}`),digest);
fs.writeFileSync(`${dir}/cirruskit_attack.png`,PNG.sync.write(sheet));execFileSync(process.execPath,['work/cirruskit-attack/export-apng.cjs']);
const version=hash(`${dir}/cirruskit_attack.png`).slice(0,12),html=fs.readFileSync(`${root}/before/cirruskit_attack_preview.html`,'utf8').replace(/cirruskit_attack\.png\?v=[a-f0-9]+/g,`cirruskit_attack.png?v=${version}`);fs.writeFileSync(`${dir}/cirruskit_attack_preview.html`,html);
const reread=read(`${dir}/cirruskit_attack.png`);assert(reread.data.equals(sheet.data));assert.equal(reread.width,2560);assert.equal(reread.height,2560);
const report={repair:'Reduce the near rear paw rotation during the pounce',frames:25,grid:[5,5],frameSize:[512,512],durationMs:400,affectedFrames:perFrame.filter(f=>f.changedPixels).map(f=>f.frame),totalChangedPixels:totalChanged,maximumPawAngleBefore:Math.max(...perFrame.map(f=>f.oldPawAngleDegrees)),maximumPawAngleAfter:Math.max(...perFrame.map(f=>f.correctedPawAngleDegrees)),allPixelsOutsideRearLegUnchanged:true,previousFrontOutlineFillPreserved:true,firstAndLastFramesExactlyUnchanged:true,timingAndMetadataByteIdentical:true,otherAnimationsUnchanged:true,noCanvasClipping:true,oneConnectedSilhouettePerFrame:true,noSmallEnclosedSeams:true,method:'Limited the rear leg rotation in the existing editable rig. Applied only that leg delta to the latest saved frames, preserving subsequent outline repairs.',perFrame};
fs.writeFileSync(`${root}/audit.json`,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(`${dir}/cirruskit_attack_audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({version,...report,perFrame:undefined}));
