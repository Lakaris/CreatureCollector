const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-ink-finish',dir='images/cirruskit',meta=JSON.parse(fs.readFileSync(`${root}/before/cirruskit_move.json`)),ink=JSON.parse(fs.readFileSync(`${root}/ink-audit.json`)),seams=JSON.parse(fs.readFileSync(`${root}/seam-audit.json`));
assert.equal(ink.frames,30);assert(ink.anchoredBellyStrokePixelChecks>4000);assert(seams.perFrame.every(f=>!f.enclosedJointGaps&&!f.detachedDarkMarks));
const sheet=new PNG({width:3072,height:2560});for(const frame of meta.frames){const p=PNG.sync.read(fs.readFileSync(`${root}/frames/frame-${frame.index}.png`));for(let y=0;y<512;y++)p.data.copy(sheet.data,((frame.y+y)*sheet.width+frame.x)*4,y*2048,(y+1)*2048);}
meta.notes='Thirty frames at 50ms, with unchanged diagonal gait parameters. Trimmed excess rear inner-outline pixels at the belly overlap. The front belly stroke stays anchored to the torso; motion blends into the lower leg and paw beneath it. Approved upper chest connection retained. Original base artwork, face, mane and tail retained. Read left to right, top to bottom. No duplicate final frame.';
fs.writeFileSync(`${dir}/cirruskit_move.png`,PNG.sync.write(sheet));fs.writeFileSync(`${dir}/cirruskit_move.json`,JSON.stringify(meta,null,2)+'\n');
let code=fs.readFileSync('work/cirruskit-walk-rebuild/audit.cjs','utf8')
.replace("const root='work/cirruskit-walk-rebuild'","const root='work/cirruskit-walk-ink-finish'")
.replace('`${root}/protected-hashes.json`',"'work/cirruskit-walk-rebuild/protected-hashes.json'")
.replace('const report={','const report={ink:JSON.parse(fs.readFileSync(`${root}/ink-audit.json`)),seams:JSON.parse(fs.readFileSync(`${root}/seam-audit.json`)),')
.replace("method:'New separate leg layers rotate at hip/shoulder pivots in synchronized diagonal pairs. Original face, mane and tail art retained. ImageGen supplied the hidden body backing plate.'","method:'Rear inner-outline mask trimmed at the overlap. Front belly ink is anchored in torso coordinates while motion blends into the lower leg. Approved upper chest preserved, with original gait pose data and timing.'");
fs.writeFileSync(`${root}/audit.cjs`,code);console.log('Saved the two ink corrections.');
