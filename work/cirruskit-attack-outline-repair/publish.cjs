const fs=require('fs'),crypto=require('crypto'),{execFileSync}=require('child_process'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack-outline-repair',dir='images/cirruskit',plan=JSON.parse(fs.readFileSync(`${root}/frame-plan.json`)),sheet=new PNG({width:2560,height:2560});
const frames=plan.frames.map(f=>({index:f.index,x:f.index%5*512,y:Math.floor(f.index/5)*512,width:512,height:512,durationMs:f.durationMs}));
for(const f of frames){const p=PNG.sync.read(fs.readFileSync(`${root}/frames/frame-${f.index}.png`));for(let y=0;y<512;y++)p.data.copy(sheet.data,((f.y+y)*sheet.width+f.x)*4,y*2048,(y+1)*2048);}
const meta={image:'cirruskit_attack.png',frameWidth:512,frameHeight:512,columns:5,rows:5,loop:false,totalDurationMs:400,frames,notes:'Airborne pounce in place: narrowed eyes and open mouth; crouch, push off, reach both front paws forward as the hindquarters rise, land on the front paws, recover. Existing original head and mane texture stays together; independently articulated original limb layers. First and last frames exactly match cirruskit_base.png. Read left to right, top to bottom. 25 frames at 16ms fit the existing 400ms battle attack window.'};
fs.writeFileSync(`${dir}/cirruskit_attack.png`,PNG.sync.write(sheet));fs.writeFileSync(`${dir}/cirruskit_attack.json`,JSON.stringify(meta,null,2)+'\n');
execFileSync(process.execPath,['work/cirruskit-attack/export-apng.cjs']);
const version=crypto.createHash('sha256').update(fs.readFileSync(`${dir}/cirruskit_attack.png`)).digest('hex').slice(0,12),labels={'wind-up':'Crouch',takeoff:'Takeoff',airborne:'Airborne reach',landing:'Front-paws-first landing',recover:'Return to idle'};
let html=fs.readFileSync('work/cirruskit-attack/preview-template.html','utf8').replace('__VERSION__',version).replace('__DURATIONS__',JSON.stringify(frames.map(f=>f.durationMs))).replace('__PHASES__',JSON.stringify(plan.frames.map(f=>labels[f.phase]))).replace('Narrow eyes · open mouth · pounce in place','Airborne pounce · reaching front paws · soft landing');
fs.writeFileSync(`${dir}/cirruskit_attack_preview.html`,html);
fs.writeFileSync(`${dir}/cirruskit_attack_notes.txt`,[
 'Cirruskit attack — pounce outline cleanup, 2026-10-27',
 'Transparent PNG spritesheet: cirruskit_attack.png',
 '25 frames, 512 × 512 pixels per frame; 5 columns × 5 rows.',
 'Play once, 16 ms per frame, 400 ms total. First and last frames exactly equal cirruskit_base.png.',
 'Preview includes normal, half, and quarter speed plus frame stepping.',
 'Motion reference: ginger-cat-cat-jumping.gif supplied by the user. Reference used only for the airborne reach and forepaw-first landing; no props added.',
 'This revision preserves every pounce pose and its timing. It removes tail slivers from the rear-leg cutout, restores the full tail texture under the join, closes small enclosed seams, and keeps visible leg-edge strokes from thinning during bends.',
 'The source head, mane pattern, tail palette and expression are reused. Each rendered layer samples its source once; no crossfades, optical flow, blur filters or per-frame recoloring.',
 'No new generated artwork in this revision. Existing eyes and mouth came from the built-in image editor; original prompt in workspace: work/cirruskit-attack/image-edit-prompt.txt.',
 'Previous attack files are backed up at work/cirruskit-attack-outline-repair/before/. Idle, flavor and move files are unchanged.',
 ''
 ].join('\n'));
console.log({sheet:`${dir}/cirruskit_attack.png`,preview:`${dir}/cirruskit_attack_preview.html`,version});

