const fs=require('fs'),assert=require('assert'),crypto=require('crypto'),{execFileSync}=require('child_process'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack-line-fill',dir='images/cirruskit',read=p=>PNG.sync.read(fs.readFileSync(p)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),before=read(`${root}/before/cirruskit_attack.png`),sheet=read(`${root}/before/cirruskit_attack.png`),changes=JSON.parse(fs.readFileSync(`${root}/changes.json`));
let totalChanged=0;const perFrame=[];
for(let n=0;n<25;n++){
 const p=read(`${root}/frames/frame-${n}.png`),allowed=new Set(changes[n].changed.map(([x,y])=>y*512+x));let changed=0;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const i=(y*512+x)*4,j=((Math.floor(n/5)*512+y)*sheet.width+n%5*512+x)*4,diff=!p.data.subarray(i,i+4).equals(before.data.subarray(j,j+4));
  if(diff){assert(allowed.has(y*512+x));assert(before.data[j+3]<250,'Existing opaque art must stay unchanged');assert(p.data[i+3]>before.data[j+3],'Only adding missing ink is permitted');changed++;}
  if(!x||!y||x===511||y===511)assert.equal(p.data[i+3],0);
  p.data.copy(sheet.data,j,i,i+4);
 }
 assert.equal(changed,changes[n].pixels);if(n===0||n===24)assert.equal(changed,0);assert(changed<=60,'Unexpectedly broad correction');totalChanged+=changed;perFrame.push({frame:n+1,changedPixels:changed,bounds:changes[n].box});
}
assert(fs.readFileSync(`${dir}/cirruskit_attack.json`).equals(fs.readFileSync(`${root}/before/cirruskit_attack.json`)),'Timing/metadata changed');
fs.writeFileSync(`${dir}/cirruskit_attack.png`,PNG.sync.write(sheet));
execFileSync(process.execPath,['work/cirruskit-attack/export-apng.cjs']);
const version=hash(`${dir}/cirruskit_attack.png`).slice(0,12),oldHtml=fs.readFileSync(`${root}/before/cirruskit_attack_preview.html`,'utf8'),html=oldHtml.replace(/cirruskit_attack\.png\?v=[a-f0-9]+/g,`cirruskit_attack.png?v=${version}`);assert.notEqual(html,oldHtml);fs.writeFileSync(`${dir}/cirruskit_attack_preview.html`,html);
for(const [name,digest]of Object.entries(JSON.parse(fs.readFileSync('work/cirruskit-attack/protected-hashes.json'))))assert.equal(hash(`${dir}/${name}`),digest);
const reread=read(`${dir}/cirruskit_attack.png`);assert(reread.data.equals(sheet.data));assert.equal(reread.width,2560);assert.equal(reread.height,2560);
const report={repair:'Fill only the missing outer ink segment at the mane/front-leg junction',frames:25,grid:[5,5],frameSize:[512,512],affectedFrames:perFrame.filter(f=>f.changedPixels).map(f=>f.frame),totalChangedPixels:totalChanged,allOtherPixelsExactlyUnchanged:true,existingOpaqueArtworkExactlyUnchanged:true,firstAndLastFramesExactlyUnchanged:true,timingAndMetadataByteIdentical:true,otherAnimationsUnchanged:true,noCanvasClipping:true,method:'Localized missing-ink fill on the existing rendered frames; no rerendering, recoloring, or pose changes.',perFrame};
fs.writeFileSync(`${root}/audit.json`,JSON.stringify(report,null,2)+'\n');fs.writeFileSync(`${dir}/cirruskit_attack_audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({version,...report,perFrame:undefined}));
