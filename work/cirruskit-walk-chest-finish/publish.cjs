const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-chest-finish',dir='images/cirruskit',meta=JSON.parse(fs.readFileSync(`${root}/before/cirruskit_move.json`));
const seams=JSON.parse(fs.readFileSync(`${root}/seam-audit.json`)),preservation=JSON.parse(fs.readFileSync(`${root}/preservation-audit.json`));
assert(seams.perFrame.every(f=>f.enclosedJointGaps===0&&f.detachedDarkMarks===0));assert.equal(preservation.approvedRearPixelsUnchanged,5068800);
const sheet=new PNG({width:3072,height:2560});for(const frame of meta.frames){const p=PNG.sync.read(fs.readFileSync(`${root}/frames/frame-${frame.index}.png`));for(let y=0;y<512;y++)p.data.copy(sheet.data,((frame.y+y)*sheet.width+frame.x)*4,y*2048,(y+1)*2048);}
meta.notes='Thirty-frame walk at 50ms per frame. Original diagonal gait, pivots, trajectory settings, body bob and tail sway retained. Approved rear artwork unchanged. The chest and far-front leg use the continuous original base artwork and render over the belly backing, removing the flat belly edge across the leg. Upper attachments remain on the torso. Original face, mane and tail retained. Read left to right, top to bottom; no duplicate final frame.';
fs.writeFileSync(`${dir}/cirruskit_move.png`,PNG.sync.write(sheet));fs.writeFileSync(`${dir}/cirruskit_move.json`,JSON.stringify(meta,null,2)+'\n');
let code=fs.readFileSync('work/cirruskit-walk-rebuild/audit.cjs','utf8')
.replace("const root='work/cirruskit-walk-rebuild'","const root='work/cirruskit-walk-chest-finish'")
.replace('`${root}/protected-hashes.json`',"'work/cirruskit-walk-rebuild/protected-hashes.json'")
.replace('const report={','const report={seams:JSON.parse(fs.readFileSync(`${root}/seam-audit.json`)),preservation:JSON.parse(fs.readFileSync(`${root}/preservation-audit.json`)),')
.replace("method:'New separate leg layers rotate at hip/shoulder pivots in synchronized diagonal pairs. Original face, mane and tail art retained. ImageGen supplied the hidden body backing plate.'","method:'Continuous chest-to-front-leg artwork from the approved base replaces the belly backing across that leg. Approved rear region is pixel-identical to the preceding version; gait parameters and timing are unchanged.'");
fs.writeFileSync(`${root}/audit.cjs`,code);console.log('Saved the chest correction with the approved rear unchanged.');
