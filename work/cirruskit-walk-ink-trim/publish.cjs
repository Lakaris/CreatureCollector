const fs=require('fs'),assert=require('assert'),crypto=require('crypto'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-ink-trim',dir='images/cirruskit',meta=JSON.parse(fs.readFileSync(`${root}/before/cirruskit_move.json`)),audit=JSON.parse(fs.readFileSync(`${root}/trim-audit.json`)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(audit.frameOneUnchanged,true);assert.equal(audit.silhouetteUnchanged,true);assert.equal(audit.changedPixels,117);
assert.equal(hash(`${dir}/cirruskit_move.json`),hash(`${root}/before/cirruskit_move.json`));
const sheet=new PNG({width:3072,height:2560});for(const f of meta.frames){const p=PNG.sync.read(fs.readFileSync(`${root}/frames/frame-${f.index}.png`));for(let y=0;y<512;y++)p.data.copy(sheet.data,((f.y+y)*sheet.width+f.x)*4,y*2048,(y+1)*2048);}
const before=PNG.sync.read(fs.readFileSync(`${root}/before/cirruskit_move.png`));let differences=0;
for(let k=0;k<sheet.width*sheet.height;k++){const i=k*4;if(!sheet.data.subarray(i,i+4).equals(before.data.subarray(i,i+4)))differences++;}
assert.equal(differences,audit.changedPixels);
for(const [name,digest]of Object.entries(JSON.parse(fs.readFileSync('work/cirruskit-walk-rebuild/protected-hashes.json'))))assert.equal(hash(`${dir}/${name}`),digest);
fs.copyFileSync(`${dir}/cirruskit_move_audit.json`,`${root}/before/cirruskit_move_audit.json`);
fs.writeFileSync(`${dir}/cirruskit_move.png`,PNG.sync.write(sheet));
fs.writeFileSync(`${dir}/cirruskit_move_audit.json`,JSON.stringify({...audit,frameSize:[512,512],grid:[6,5],frameDurationMs:50,totalDurationMs:1500,metadataUnchanged:true,idleAndFlavorUnchanged:true,scope:'Only the small inward-facing black protrusion at the front-leg/belly join. All other image pixels and all metadata are unchanged.'},null,2)+'\n');
console.log({changedPixels:differences,metadataUnchanged:true,silhouetteUnchanged:true});
