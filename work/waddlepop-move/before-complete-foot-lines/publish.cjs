const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-move',dir='images/waddlepop';
const meta=JSON.parse(fs.readFileSync(root+'/waddlepop_move.json')),audit=JSON.parse(fs.readFileSync(root+'/audit.json'));
const sheet=PNG.sync.read(fs.readFileSync(root+'/waddlepop_move.png'));
assert.equal(meta.frames.length,24);assert.equal(meta.totalDurationMs,1200);assert(meta.loop);
assert.equal(sheet.width,3072);assert.equal(sheet.height,2048);
assert(audit.firstFrameMatchesBase&&!audit.duplicatedEndFrame&&audit.sparkActiveEveryFrame);
assert.equal(audit.largestUnexpectedDetachedComponent,0);assert(audit.footAttachment.every(f=>f.bothFeetConnected));
assert(audit.checks.every(f=>f.faceError===0&&f.sparkPixels>180));
for(const [path,expected]of Object.entries(audit.protectedHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),expected);
function copy(from,to){const tmp=to+'.building-'+process.pid;fs.copyFileSync(from,tmp);fs.renameSync(tmp,to);}
copy(root+'/waddlepop_move.png',dir+'/waddlepop_move.png');
copy(root+'/waddlepop_move.json',dir+'/waddlepop_move.json');
copy(root+'/audit.json',dir+'/waddlepop_move_audit.json');
fs.writeFileSync(dir+'/waddlepop_move_notes.txt','Waddlepop move: walk in place with a lightly bouncing snowball bomb and a continuously sparking fuse.\n24 frames; 6 columns x 4 rows; 512 x 512 px per frame. Transparent PNG spritesheet.\nRead left to right, top to bottom. Loop at 50 ms per frame (20 fps), 1.2 seconds per full two-step cycle.\nFrame 1 is an exact copy of waddlepop_idle.png. The final frame approaches the initial pose without duplicating it, avoiding a pause at the loop.\nFeet alternate lifting and planting, with a maximum 10 px lift and 6 px horizontal stride. The torso and face move as one rigid shape; the feet rotate without stretching.\nThe existing bomb and fuse artwork are reused. A hidden lower-body fill was prepared with the built-in image tool to keep the belly contour continuous behind the stepping feet.\nAll 24 frames checked for connected feet, stray components, clipping, intact face geometry and a visible fuse spark.\nThe idle image and flavor animation are unchanged.\n');
console.log(JSON.stringify({saved:dir+'/waddlepop_move.png',frames:24,columns:6,rows:4,durationMs:1200,idleAndFlavorUnchanged:true}));
