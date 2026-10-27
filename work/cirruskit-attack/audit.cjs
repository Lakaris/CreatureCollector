const fs=require('fs'),assert=require('assert'),crypto=require('crypto'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack',dir='images/cirruskit',read=p=>PNG.sync.read(fs.readFileSync(p)),base=read(`${dir}/cirruskit_base.png`),head=read('work/cirruskit-transition-repair/fixed-head-mane.png'),plan=JSON.parse(fs.readFileSync(`${root}/frame-plan.json`)),meta=JSON.parse(fs.readFileSync(`${dir}/cirruskit_attack.json`)),sheet=read(`${dir}/cirruskit_attack.png`),frames=plan.frames.map(f=>read(`${root}/frames/frame-${f.index}.png`)),variants=Object.fromEntries(['normal','focused','attack'].map(n=>[n,read(`${root}/inputs/${n}.png`)])),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(sheet.width,2560);assert.equal(sheet.height,2560);assert.equal(frames.length,25);assert(frames[0].data.equals(base.data));assert(frames[24].data.equals(base.data));assert.equal(meta.loop,false);assert.equal(meta.totalDurationMs,400);
let maneChecks=0,headChecks=0,bodyChecks=0;const perFrame=[];
for(const [n,p]of frames.entries()){
 const f=plan.frames[n],variant=variants[f.expression];
 for(let y=0;y<512;y++){
  const start=((Math.floor(n/5)*512+y)*sheet.width+n%5*512)*4;assert(sheet.data.subarray(start,start+2048).equals(p.data.subarray(y*2048,(y+1)*2048)));
  for(const [x,yy]of [[0,y],[511,y],[y,0],[y,511]])assert(p.data[(yy*512+x)*4+3]===0,'Clipped border');
 }
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4,xx=x+f.reach;
  if(head.data[i+3]>=250){const yy=y+f.headDown-f.lift,j=(yy*512+xx)*4;assert([0,1,2].every(c=>p.data[j+c]===variant.data[i+c]),`Head texture mismatch ${n+1}:${x},${y}`);headChecks++;if(y>240&&base.data[i]>120&&base.data[i+1]>110&&base.data[i]-base.data[i+2]>18){assert([0,1,2].every(c=>p.data[j+c]===base.data[i+c]));maneChecks++;}}
  if(base.data[i+3]>=250&&(x<190||y>=425)){const yy=y-f.lift,j=(yy*512+xx)*4;assert([0,1,2].every(c=>p.data[j+c]===base.data[i+c]),`Tail/paw mismatch ${n+1}:${x},${y}`);bodyChecks++;}
 }
 const seen=new Uint8Array(262144),parts=[];
 for(let start=0;start<262144;start++){if(seen[start]||p.data[start*4+3]<80)continue;let area=0,todo=[start];seen[start]=1;while(todo.length){const k=todo.pop(),x=k%512,y=k>>9;area++;for(let yy=Math.max(0,y-1);yy<=Math.min(511,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(511,x+1);xx++){const j=yy*512+xx;if(!seen[j]&&p.data[j*4+3]>=80){seen[j]=1;todo.push(j);}}}parts.push(area);}assert.equal(parts.length,1,`Detached silhouette in frame ${n+1}`);
 perFrame.push({frame:n+1,phase:f.phase,expression:f.expression,headDownPx:f.headDown,liftPx:f.lift,reachPx:f.reach,connectedComponents:parts.length});
}
for(const [name,digest]of Object.entries(JSON.parse(fs.readFileSync(`${root}/protected-hashes.json`))))assert.equal(hash(`${dir}/${name}`),digest,`Existing asset changed: ${name}`);
const apng=fs.readFileSync(`${dir}/cirruskit_attack_preview.png`),holds=[];let plays;
for(let pos=8;pos<apng.length;){const len=apng.readUInt32BE(pos),type=apng.toString('ascii',pos+4,pos+8);if(type==='fcTL'){assert.equal(apng.readUInt16BE(pos+30),1000);holds.push(apng.readUInt16BE(pos+28));}if(type==='acTL')plays=apng.readUInt32BE(pos+12);pos+=len+12;}
assert.deepEqual(holds,Array(25).fill(16));assert.equal(plays,1);
const html=fs.readFileSync(`${dir}/cirruskit_attack_preview.html`,'utf8');assert(html.includes('max="24"'));assert(html.includes('background-size:500% 500%'));assert(!/__\w+__/.test(html));new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
(async()=>{const config=await import('data:text/javascript;base64,'+fs.readFileSync('src/data/creatureArt.js').toString('base64')),entry=config.CREATURE_ART.cirruskit.attack;assert.equal(entry.frames,25);assert.equal(entry.columns,5);assert.deepEqual(entry.durations,holds);assert.equal(entry.loop,false);const battle=fs.readFileSync('src/ui/components/battleArtState.js','utf8'),windowMs=Number(battle.match(/ATTACK_ART_MS\s*=\s*(\d+)/)[1]);assert(meta.totalDurationMs<=windowMs);
 const report={frames:25,grid:[5,5],frameSize:[512,512],totalDurationMs:400,frameDurationMs:16,loop:false,firstAndLastMatchBaseExactly:true,sourceTextureChecks:{headAndFace:headChecks,maneColorsAndSwirls:maneChecks,tailAndPaws:bodyChecks},maximumLiftPx:34,noCanvasClipping:true,oneConnectedSilhouettePerFrame:true,gameAndPreviewTimingMatch:true,fitsBattleAttackWindow:true,existingIdleFlavorMoveAssetsUnchanged:true,generatedExpressionRegions:['left eye','right eye','mouth'],method:'Built-in image editor created the expression. Local face patches use that master; existing head/mane and body artwork move with rigid whole-pixel translations. No frame crossfades or full-character redraws.',perFrame};fs.writeFileSync(`${root}/audit.json`,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(`${dir}/cirruskit_attack_audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,perFrame:undefined}));})();
