const fs=require('fs'),crypto=require('crypto'),assert=require('assert');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',dir='images/waddlepop',backup=root+'/before-expression/published';
const read=p=>PNG.sync.read(fs.readFileSync(p)),base=read(root+'/base.png'),old=read(root+'/before-face-fix/base.png');
const meta=JSON.parse(fs.readFileSync(root+'/waddlepop_flavor.json')),sheet=read(root+'/waddlepop_flavor.png');
const headAudit=JSON.parse(fs.readFileSync(root+'/rigid-face-audit.json'));
const armAudit=JSON.parse(fs.readFileSync(root+'/flipper-shape-audit.json'));
const expressionAudit=JSON.parse(fs.readFileSync(root+'/expression-audit.json'));
assert(expressionAudit.changesLimitedToEyesAndBeak&&expressionAudit.baseUnchanged&&expressionAudit.flippersUnchanged&&expressionAudit.cheekContoursUnchanged);
assert.equal(expressionAudit.frames.length,30);
assert(expressionAudit.frames.every(f=>f.changedPixelsOutsideFeatures===0));
assert(read(root+'/before-arm-fix/base.png').data.equals(base.data),'Base changed during flipper correction');
assert.equal(armAudit.frames.length,30);
for(const side of armAudit.ranges){
 assert(side.minAreaRatio>=.94&&side.maxAreaRatio<=1.06,'Flipper cap size changed too much: '+side.side);
 assert(side.minAspectRatio>=.95&&side.maxAspectRatio<=1.05,'Flipper cap proportions changed too much: '+side.side);
}
assert.equal(base.width,512);assert.equal(base.height,512);assert.equal(sheet.width,3072);assert.equal(sheet.height,2560);
assert.equal(headAudit.frames.length,28);assert(headAudit.frames.every(f=>f.pixelsChecked>16000&&f.maxColorChannelError===0));
const bounds=[],hashes=new Set();
for(const f of meta.frames){
 const im=new PNG({width:512,height:512});PNG.bitblt(sheet,im,f.x,f.y,512,512,0,0);
 if(f.index===0||f.index===29)assert(im.data.equals(base.data),'Endpoint does not match corrected base');
 let x0=512,y0=512,x1=-1,y1=-1;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(im.data[(y*512+x)*4+3]>16){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 assert(x0>0&&y0>0&&x1<511&&y1<511,'Clipped frame '+(f.index+1));bounds.push([x0,y0,x1,y1]);
 hashes.add(crypto.createHash('sha256').update(im.data).digest('hex'));
}
assert.equal(meta.frames.length,30);assert.equal(hashes.size,29);assert.equal(meta.totalDurationMs,2340);
assert.equal(meta.totalDurationMs,meta.frames.reduce((s,f)=>s+f.durationMs,0));
const oldMeta=JSON.parse(fs.readFileSync(root+'/before-face-fix/waddlepop_flavor.json'));
assert.deepEqual(meta.frames,oldMeta.frames,'Frame layout or timing changed');
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/poses.json')),JSON.parse(fs.readFileSync(root+'/before-face-fix/poses.json')),'Body or bomb pose changed');
let basePixelsChanged=0;
for(let y=0;y<512;y++)for(let x=0;x<512;x++){const k=(y*512+x)*4;assert.equal(base.data[k+3],old.data[k+3],'Base transparency changed');if(!base.data.subarray(k,k+4).equals(old.data.subarray(k,k+4))){basePixelsChanged++;assert(x>=169&&x<=205&&y>=273&&y<=371,'Unexpected edit outside left cheek');}}
assert(basePixelsChanged>0);
fs.mkdirSync(backup,{recursive:true});
for(const name of ['waddlepop_idle.png','waddlepop_flavor.png','waddlepop_flavor.json','waddlepop_flavor_audit.json','waddlepop_flavor_notes.txt','waddlepop_flavor_preview.html','waddlepop_flavor_preview.png'])if(fs.existsSync(dir+'/'+name)&&!fs.existsSync(backup+'/'+name))fs.copyFileSync(dir+'/'+name,backup+'/'+name);
fs.copyFileSync(root+'/base.png',dir+'/waddlepop_idle.png');
fs.copyFileSync(root+'/waddlepop_flavor.png',dir+'/waddlepop_flavor.png');
fs.copyFileSync(root+'/waddlepop_flavor.json',dir+'/waddlepop_flavor.json');
const audit={frames:30,uniqueFrames:hashes.size,grid:[6,5],cell:[512,512],sheet:[3072,2560],totalDurationMs:meta.totalDurationMs,firstAndLastMatchBaseExactly:true,baseUnchangedThisUpdate:true,priorBaseCorrection:'Added missing viewer-left cheek contour',priorBasePixelsChanged:basePixelsChanged,baseTransparencyUnchanged:true,bodyAndBombPosesUnchanged:true,timingUnchanged:true,facePreservation:headAudit,flipperPreservation:armAudit,expressionChanges:expressionAudit,maximumLocalFlipperMovementPx:{horizontal:.78,vertical:1.44},clippedFrames:0,frameBounds:bounds};
fs.writeFileSync(dir+'/waddlepop_flavor_audit.json',JSON.stringify(audit,null,2));
fs.writeFileSync(dir+'/waddlepop_flavor_notes.txt','Waddlepop flavor: stumble, fumble, catch.\n30 frames, 6 columns x 5 rows, 512 x 512 per frame.\nRead left to right, top to bottom.\nPlay once: 300 ms opening hold, 28 frames at 60 ms, 360 ms closing hold; 2340 ms total.\nBoth endpoints are exact copies of waddlepop_idle.png.\nTransparent PNG with separate JSON timing data. Preview repeats for inspection.\nFrames 8-22 add a flustered > o < expression: partial eyelids lead into squeezed chevrons, and the beak opens/closes in two small beats before returning to normal.\nOnly the eye and beak artwork changes. The face silhouette, cheek contours, flippers, body and bomb poses, transparency, and timing are identical to the preceding version.\nThe head moves as one rigid shape; flipper motion stops outside the cheek contours. No face stretching or cross-fades.\nFlippers follow the body sway with only a slight independent reach: at most 0.78px horizontally and 1.44px vertically on the 512px art.\nExpression artwork was made with the built-in image tool and transferred only into the original eye/beak regions.\n');
console.log(JSON.stringify({frames:30,totalDurationMs:meta.totalDurationMs,basePixelsChanged,facePixelsChecked:headAudit.frames.reduce((s,f)=>s+f.pixelsChecked,0),faceErrors:0,endpointsExact:true,clippedFrames:0}));
