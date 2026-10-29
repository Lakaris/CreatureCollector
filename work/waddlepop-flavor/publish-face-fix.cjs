const fs=require('fs'),crypto=require('crypto'),assert=require('assert');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',dir='images/waddlepop',backup=root+'/before-hand-motion';
const atomicCopy=(source,target)=>{const temp=target+'.building-'+process.pid;fs.copyFileSync(source,temp);fs.renameSync(temp,target);};
const read=p=>PNG.sync.read(fs.readFileSync(p)),base=read(root+'/base.png'),old=read(root+'/before-face-fix/base.png');
const meta=JSON.parse(fs.readFileSync(root+'/waddlepop_flavor.json')),sheet=read(root+'/waddlepop_flavor.png');
const headAudit=JSON.parse(fs.readFileSync(root+'/rigid-face-audit.json'));
const armAudit=JSON.parse(fs.readFileSync(root+'/flipper-shape-audit.json'));
const expressionAudit=JSON.parse(fs.readFileSync(root+'/expression-audit.json'));
const dropletAudit=JSON.parse(fs.readFileSync(root+'/droplet-audit.json'));
const fuseAudit=JSON.parse(fs.readFileSync(root+'/fuse/audit.json'));
const wobbleAudit=JSON.parse(fs.readFileSync(root+'/bomb-wobble-audit.json'));
const hands=JSON.parse(fs.readFileSync(root+'/hand-motion-audit.json'));
assert(hands.faceAndBodyIdenticalToPrior&&hands.bodyAndBombPosesUnchanged&&hands.dropletsUnchanged);
assert(hands.maximumAddedMovementPx<=4&&hands.minimumDropletGapPx>=5);
assert(hands.maximumFlipperCapAreaChange<.025&&hands.maximumFlipperCapAspectChange<.025);
assert(hands.frames.every(f=>f.endpointExact||(!f.changedFacePixels&&!f.changedBodyPixels)));
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/bomb-poses.json')),JSON.parse(fs.readFileSync(backup+'/bomb-poses.json')));
assert.deepEqual(meta.frames,JSON.parse(fs.readFileSync(backup+'/waddlepop_flavor.json')).frames,'Export timing or layout changed');
assert(wobbleAudit.bodySourceAndMotionUnchanged&&wobbleAudit.flipperTargetsUseOriginalBombPoses&&wobbleAudit.penguinCorePixelsIdenticalToPrevious);
assert(wobbleAudit.frames.every(f=>f.endpointExact||(f.priorFrameReconstructedExactly&&f.changedPixelsBelowBomb===0&&f.lockedCharacterAndDropletPixels>25000)));
assert(fuseAudit.allPixelsOutsideFuseIdentical&&fuseAudit.bodyPoseDurationsUnchanged&&fuseAudit.sparkVisibleEveryFrame&&fuseAudit.noConsecutiveStaticFrames);
assert(dropletAudit.existingPixelsAboveAlpha1Identical&&dropletAudit.threeSeparateDroplets&&dropletAudit.minimumGapPx>=5);
assert(expressionAudit.characterChangesLimitedToEyesAndBeak&&expressionAudit.baseUnchanged&&expressionAudit.flippersUnchanged&&expressionAudit.cheekContoursUnchanged);
assert.equal(expressionAudit.frames.length,30);
assert(expressionAudit.frames.every(f=>f.changedPixelsOutsideFeatures===0));
assert(read(root+'/before-arm-fix/base.png').data.equals(base.data),'Base changed during flipper correction');
assert.equal(armAudit.frames.length,30);
for(const side of armAudit.ranges){
 assert(side.minAreaRatio>=.94&&side.maxAreaRatio<=1.06,'Flipper cap size changed too much: '+side.side);
 assert(side.minAspectRatio>=.95&&side.maxAspectRatio<=1.05,'Flipper cap proportions changed too much: '+side.side);
}
assert.equal(base.width,512);assert.equal(base.height,512);assert.equal(sheet.width,3072);assert.equal(sheet.height,3584);
assert.equal(headAudit.frames.length,28);assert(headAudit.frames.every(f=>f.pixelsChecked>16000&&f.maxColorChannelError===0));
const bounds=[],hashes=new Set();
for(const f of meta.frames){
 const im=new PNG({width:512,height:512});PNG.bitblt(sheet,im,f.x,f.y,512,512,0,0);
 if(f.index===0||f.index===meta.frames.length-1)assert(im.data.equals(base.data),'Endpoint does not match corrected base');
 let x0=512,y0=512,x1=-1,y1=-1;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(im.data[(y*512+x)*4+3]>16){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 assert(x0>0&&y0>0&&x1<511&&y1<511,'Clipped frame '+(f.index+1));bounds.push([x0,y0,x1,y1]);
 hashes.add(crypto.createHash('sha256').update(im.data).digest('hex'));
}
// Opening and closing holds repeat several spark phases on the same base pose.
assert.equal(meta.frames.length,39);assert.equal(hashes.size,34);assert.equal(meta.totalDurationMs,2340);
assert.equal(meta.totalDurationMs,meta.frames.reduce((s,f)=>s+f.durationMs,0));
const oldMeta=JSON.parse(fs.readFileSync(root+'/before-face-fix/waddlepop_flavor.json'));
for(const f of oldMeta.frames)assert.equal(meta.frames.filter(n=>n.sourcePoseIndex===f.index).reduce((sum,n)=>sum+n.durationMs,0),f.durationMs,'Body pose timing changed');
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/poses.json')),JSON.parse(fs.readFileSync(root+'/before-face-fix/poses.json')),'Body or bomb pose changed');
let basePixelsChanged=0;
for(let y=0;y<512;y++)for(let x=0;x<512;x++){const k=(y*512+x)*4;assert.equal(base.data[k+3],old.data[k+3],'Base transparency changed');if(!base.data.subarray(k,k+4).equals(old.data.subarray(k,k+4))){basePixelsChanged++;assert(x>=169&&x<=205&&y>=273&&y<=371,'Unexpected edit outside left cheek');}}
assert(basePixelsChanged>0);
fs.mkdirSync(backup,{recursive:true});
for(const name of ['waddlepop_idle.png','waddlepop_flavor.png','waddlepop_flavor.json','waddlepop_flavor_audit.json','waddlepop_flavor_notes.txt','waddlepop_flavor_preview.html','waddlepop_flavor_preview.png'])if(fs.existsSync(dir+'/'+name)&&!fs.existsSync(backup+'/'+name))fs.copyFileSync(dir+'/'+name,backup+'/'+name);
atomicCopy(root+'/base.png',dir+'/waddlepop_idle.png');
atomicCopy(root+'/waddlepop_flavor.png',dir+'/waddlepop_flavor.png');
atomicCopy(root+'/waddlepop_flavor.json',dir+'/waddlepop_flavor.json');
const audit={frames:39,uniqueFrames:hashes.size,grid:[6,7],cell:[512,512],sheet:[3072,3584],totalDurationMs:meta.totalDurationMs,firstAndLastMatchBaseExactly:true,baseUnchangedThisUpdate:true,priorBaseCorrection:'Added missing viewer-left cheek contour',priorBasePixelsChanged:basePixelsChanged,baseTransparencyUnchanged:true,bodyAndBombPosesUnchanged:true,bodyPoseTimingUnchanged:true,sourcePoseAuditScope:'Prior face, flipper, expression and droplet audits refer to the 30 source body poses. Each exported frame has sourcePoseIndex; fuse audit checks all 39 output frames.',facePreservation:headAudit,flipperPreservation:armAudit,expressionChanges:expressionAudit,detachedDroplets:dropletAudit,continuousFuse:fuseAudit,maximumLocalFlipperMovementPx:{horizontal:.78,vertical:1.44},clippedFrames:0,frameBounds:bounds};
audit.bodyAndBombPosesUnchanged=true;
audit.faceAndBodyUnchanged=true;
audit.handAdjustments=hands;
audit.bombMotion={angularGain:1.6,horizontalGain:1.25,unchangedThisUpdate:true};
audit.maximumLocalFlipperMovementPx={priorHorizontal:.78,priorVertical:1.44,additionalMovement:hands.maximumAddedMovementPx,maximumAddedRotationDeg:1.2};
audit.sourcePoseAuditScope='Prior expression and droplet audits document their creation. The hand-adjustment audit compares all 30 source poses with the preceding version; the fuse audit checks all 39 final frames.';
fs.writeFileSync(dir+'/waddlepop_flavor_audit.json',JSON.stringify(audit,null,2));
fs.writeFileSync(dir+'/waddlepop_flavor_notes.txt','Waddlepop flavor: stumble, fumble, catch.\n39 frames, 6 columns x 7 rows, 512 x 512 per frame. Last three cells are unused.\nRead left to right, top to bottom.\nPlay once: every frame is 60 ms; 2340 ms total.\nFrames 1-5 preserve the original 300 ms opening body hold. Frames 34-39 preserve the original 360 ms closing body hold. Only the spark and embers move during these holds.\nBoth endpoints are exact copies of waddlepop_idle.png.\nTransparent PNG with separate JSON timing data. Preview repeats for inspection.\nThe fuse spark pulses and two embers flick outward throughout. The fuse remains attached and does not shorten.\nFrames 12-26 have the flustered > o < expression and two little mouth-opening beats.\nThree detached cyan nervous droplets appear in two short bursts at frames 13-18 and 20-25, only on the viewer-left. They remain separated from the character and disappear before recovery.\nEvery pixel outside the fuse effect is identical to the corresponding prior body pose. Body-pose durations and all prior motion are unchanged.\nThe head moves as one rigid shape. Flippers follow the body sway with at most 0.78px horizontal and 1.44px vertical independent reach.\nExpression, droplet, and hidden fuse-tip artwork were made with the built-in image tool. The original star and embers are animated as separate layers.\n');
console.log(JSON.stringify({frames:39,totalDurationMs:meta.totalDurationMs,baseUnchanged:true,facePixelsChecked:headAudit.frames.reduce((s,f)=>s+f.pixelsChecked,0),faceErrors:0,endpointsExact:true,clippedFrames:0}));
let notes=fs.readFileSync(dir+'/waddlepop_flavor_notes.txt','utf8');
notes=notes.replace('Every pixel outside the fuse effect is identical to the corresponding prior body pose. Body-pose durations and all prior motion are unchanged.','The bomb tilts 60% more and sways 25% farther horizontally. The penguin uses exactly the previous foreground artwork and movement, including the same flipper targets, face expressions and droplets. All character interior pixels are locked to their previous displayed colors. Antialiased edges are composited against the newly positioned bomb. Frame durations and base endpoints remain unchanged.');
fs.writeFileSync(dir+'/waddlepop_flavor_notes.txt',notes);
fs.writeFileSync(dir+'/waddlepop_flavor_notes.txt','Waddlepop flavor: stumble, fumble, catch.\n39 frames, 6 columns x 7 rows, 512 x 512 per frame; last three cells unused.\nRead left to right, top to bottom. Every frame is 60 ms; total 2340 ms.\nFrames 1-5 retain the opening hold and frames 34-39 retain the closing hold, with the fuse sparking throughout. First and last frames match waddlepop_idle.png exactly.\nHands make small alternating regrips during the fumble. Maximum added rotation: 1.2 degrees; maximum added movement: '+hands.maximumAddedMovementPx.toFixed(2)+' px. Existing artwork is sampled directly, with the shoulder movement tapering away from the face.\nFace shape, expressions, body movement, feet, bomb wobble, nervous droplets, timing and base image are unchanged.\nThe three detached nervous droplets remain at least '+hands.minimumDropletGapPx+' px from the character.\nTransparent PNG; JSON contains frame timing. Preview repeats for inspection.\n');
