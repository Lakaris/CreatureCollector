const fs=require('fs'),assert=require('assert'),crypto=require('crypto'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack-outline-repair',dir='images/cirruskit',read=p=>PNG.sync.read(fs.readFileSync(p)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),base=read(`${dir}/cirruskit_base.png`),sheet=read(`${dir}/cirruskit_attack.png`),meta=JSON.parse(fs.readFileSync(`${dir}/cirruskit_attack.json`)),plan=JSON.parse(fs.readFileSync(`${root}/frame-plan.json`)),frames=plan.frames.map(f=>read(`${root}/frames/frame-${f.index}.png`));
assert.equal(sheet.width,2560);assert.equal(sheet.height,2560);assert.equal(frames.length,25);assert(frames[0].data.equals(base.data));assert(frames[24].data.equals(base.data));assert.equal(meta.loop,false);assert.equal(meta.totalDurationMs,400);
assert.deepEqual(plan,JSON.parse(fs.readFileSync('work/cirruskit-attack-pounce/frame-plan.json')),'Pounce motion changed');
const prior=read(`${root}/before/cirruskit_attack.png`),headMask=read('work/cirruskit-walk-belly-separation/layers/foreground.png');let unchangedHeadManePixels=0,changedPixels=0;
const perFrame=[];
for(const [n,p]of frames.entries()){
 let x0=512,y0=512,x1=0,y1=0;
 for(let y=0;y<512;y++){
  const start=((Math.floor(n/5)*512+y)*sheet.width+n%5*512)*4;assert(sheet.data.subarray(start,start+2048).equals(p.data.subarray(y*2048,(y+1)*2048)));
  for(const [x,yy]of [[0,y],[511,y],[y,0],[y,511]])assert.equal(p.data[(yy*512+x)*4+3],0,`Canvas clipping in frame ${n+1}`);
  for(let x=0;x<512;x++)if(p.data[(y*512+x)*4+3]>=80){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 }
 const seen=new Uint8Array(262144),parts=[];
 for(let start=0;start<262144;start++){if(seen[start]||p.data[start*4+3]<80)continue;let area=0,todo=[start];seen[start]=1;while(todo.length){const k=todo.pop(),x=k%512,y=k>>9;area++;for(let yy=Math.max(0,y-1);yy<=Math.min(511,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(511,x+1);xx++){const j=yy*512+xx;if(!seen[j]&&p.data[j*4+3]>=80){seen[j]=1;todo.push(j);}}}parts.push(area);}
 assert.equal(parts.length,1,`Detached pixels in frame ${n+1}: ${parts}`);
 const bgSeen=new Uint8Array(262144);let smallHoles=0;
 for(let start=0;start<262144;start++){if(bgSeen[start]||p.data[start*4+3]>=128)continue;let todo=[start],area=0,exterior=false;bgSeen[start]=1;while(todo.length){const k=todo.pop(),x=k%512,y=k>>9;area++;if(!x||!y||x===511||y===511)exterior=true;for(const [xx,yy]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(xx<0||xx>=512||yy<0||yy>=512)continue;const j=yy*512+xx;if(!bgSeen[j]&&p.data[j*4+3]<128){bgSeen[j]=1;todo.push(j);}}}if(!exterior&&area<=24)smallHoles++;}assert.equal(smallHoles,0,`Small enclosed seam in frame ${n+1}`);
 const pose=plan.frames[n],a=pose.tilt*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,j=((Math.floor(n/5)*512+y)*prior.width+n%5*512+x)*4;if(!p.data.subarray(i,i+4).equals(prior.data.subarray(j,j+4)))changedPixels++;
  const dx=x-290-pose.x,dy=y-340+pose.lift,sx=290+c*dx+s*dy,sy=460+(340-s*dx+c*dy-460)/(1-pose.squash)-pose.head,ix=Math.floor(sx),iy=Math.floor(sy);if(ix<0||iy<0||ix>=511||iy>=511)continue;
  if([[0,0],[1,0],[0,1],[1,1]].every(([ox,oy])=>headMask.data[((iy+oy)*512+ix+ox)*4+3]>=251)){assert(p.data.subarray(i,i+4).equals(prior.data.subarray(j,j+4)),`Head or mane changed at ${n+1}:${x},${y}`);unchangedHeadManePixels++;}
 }
 perFrame.push({frame:n+1,phase:plan.frames[n].phase,bounds:[x0,y0,x1,y1],connectedComponents:parts.length,smallEnclosedSeams:smallHoles});
}
assert(unchangedHeadManePixels>1000000,'Head/mane comparison did not cover enough pixels');
let protectedCount=0;for(const [name,digest]of Object.entries(JSON.parse(fs.readFileSync('work/cirruskit-attack/protected-hashes.json')))){assert.equal(hash(`${dir}/${name}`),digest,`Existing asset changed: ${name}`);protectedCount++;}
const apng=fs.readFileSync(`${dir}/cirruskit_attack_preview.png`),holds=[];let plays;for(let pos=8;pos<apng.length;){const len=apng.readUInt32BE(pos),type=apng.toString('ascii',pos+4,pos+8);if(type==='fcTL'){assert.equal(apng.readUInt16BE(pos+30),1000);holds.push(apng.readUInt16BE(pos+28));}if(type==='acTL')plays=apng.readUInt32BE(pos+12);pos+=len+12;}assert.deepEqual(holds,Array(25).fill(16));assert.equal(plays,1);
const html=fs.readFileSync(`${dir}/cirruskit_attack_preview.html`,'utf8');assert(html.includes('max="24"'));assert(html.includes('background-size:500% 500%'));assert(!/__\w+__/.test(html));new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
(async()=>{const config=await import('data:text/javascript;base64,'+fs.readFileSync('src/data/creatureArt.js').toString('base64')),entry=config.CREATURE_ART.cirruskit.attack;assert.equal(entry.frames,25);assert.equal(entry.columns,5);assert.deepEqual(entry.durations,holds);assert.equal(entry.loop,false);const battle=fs.readFileSync('src/ui/components/battleArtState.js','utf8'),windowMs=Number(battle.match(/ATTACK_ART_MS\s*=\s*(\d+)/)[1]);assert(meta.totalDurationMs<=windowMs);
 const report={frames:25,grid:[5,5],frameSize:[512,512],durationMs:400,loop:false,firstAndLastMatchBaseExactly:true,pouncePosesAndTimingUnchanged:true,noCanvasClipping:true,oneConnectedSilhouettePerFrame:true,noSmallEnclosedSeams:true,unchangedHeadManePixels,changedPixels,gameAndPreviewTimingMatch:true,fitsBattleAttackWindow:true,protectedAssetFilesUnchanged:protectedCount,method:'Repaired tail/rear-leg layer ownership, restored the original tail texture under the join, re-inked physical limb contours inside their existing silhouettes, and sealed small enclosed sampling cracks. No new generated art, blur filters or color grading.',visualReview:'Inspected the rear/tail join and both front legs in every frame, plus full-size airborne details and full-pose contact sheets.',perFrame};fs.writeFileSync(`${dir}/cirruskit_attack_audit.json`,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(`${root}/audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,perFrame:undefined}));})();


