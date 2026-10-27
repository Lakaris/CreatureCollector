const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const source='work/cirruskit-flavor-smooth/source',dest='images/cirruskit';
const meta=JSON.parse(fs.readFileSync(`${source}/metadata.json`));assert.equal(meta.frames.length,9);assert.equal(meta.totalDurationMs,2432);
const configPath='src/data/creatureArt.js';let config=fs.readFileSync(configPath,'utf8');
const previous='flavor: { src: "images/cirruskit/cirruskit_flavor.png", frames: 36, columns: 6, durations: [160, 48, ...Array(32).fill(64), 80, 96] }';
assert(config.includes(previous),'Current flavor configuration has changed');
config=config.replace(previous,'flavor: { src: "images/cirruskit/cirruskit_flavor.png", frames: 9, columns: 3, durations: [680, 184, 208, 176, 192, 144, 144, 184, 520] }').replace('flavor is a 6x6','flavor is a 3x3');
meta.loop=false;meta.notes='Restored clean nine-frame flavor animation from before frame expansion. Includes the stray-mark cleanup and 25% speed increase. Read left to right, top to bottom. First and last frames match cirruskit_base.png. Play once, then return to idle.';
fs.writeFileSync(configPath,config);
fs.copyFileSync(`${source}/sheet.png`,`${dest}/cirruskit_flavor.png`);
fs.writeFileSync(`${dest}/cirruskit_flavor.json`,JSON.stringify(meta,null,2)+'\n');
let template=fs.readFileSync('work/cirruskit-flavor-crisp/preview-template.html','utf8');template=template.replace('Quick crouch · two paw taps · return to standing','Crouch · paw the ground · return to standing');fs.writeFileSync('work/cirruskit-flavor-crisp/preview-template.html',template);
fs.writeFileSync(`${dest}/cirruskit_flavor_notes.txt`,[
'Cirruskit flavor animation — restored nine-frame version',
'',
'9 frames, 512 x 512 pixels each, arranged in a 3 x 3 transparent PNG sheet (1536 x 1536 pixels).',
'Total duration: 2432 ms. Frame holds: 680, 184, 208, 176, 192, 144, 144, 184, 520 ms.',
'',
'The spritesheet is restored byte-for-byte from the clean version saved before the frame expansion. The prior stray-mark fixes and 25% speed increase are retained. The original standing pose is used at the beginning and end.',
'',
'The game settings, animation metadata, animated PNG and HTML preview use these nine frames. The preview includes pause, frame stepping and a frame slider.',
'',
'This is the current starting point for future revisions.'
].join('\n')+'\n');
console.log('Restored the clean nine-frame spritesheet and matching game settings.');
