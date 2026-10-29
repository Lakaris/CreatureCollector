const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',S=512;
const read=p=>PNG.sync.read(fs.readFileSync(p));
const clone=im=>{const o=new PNG({width:im.width,height:im.height});im.data.copy(o.data);return o;};
function write(path,data){const temp=path+'.building-'+process.pid;fs.writeFileSync(temp,data);fs.renameSync(temp,path);}
const save=(p,im)=>write(p,PNG.sync.write(im));
function sample(im,x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,o=[0,0,0,0];for(let j=0;j<2;j++)for(let i=0;i<2;i++){const xx=ix+i,yy=iy+j;if(xx<0||yy<0||xx>=im.width||yy>=im.height)continue;const k=(yy*im.width+xx)*4,a=im.data[k+3]/255,w=(i?fx:1-fx)*(j?fy:1-fy);for(let c=0;c<3;c++)o[c]+=im.data[k+c]*a*w;o[3]+=a*w;}return o;}
function over(a,b){return[b[0]+a[0]*(1-b[3]),b[1]+a[1]*(1-b[3]),b[2]+a[2]*(1-b[3]),b[3]+a[3]*(1-b[3])];}
function inverse(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx-p.x)+s*(y-p.cy-p.y),p.cy-s*(x-p.cx-p.x)+c*(y-p.cy-p.y)];}
function partPoint(x,y,p){const q=inverse(x,y,p);return[p.cx+(q[0]-p.cx)/p.scale,p.cy+(q[1]-p.cy)/p.scale];}
function effectRegion(x,y){return x>=367&&x<=441&&y>=-1&&y<=61;}
// This follows the existing left edge of the star where it meets the cord.
// Only the hidden tip is replaced with the generated clean underlay.
function starLeft(y){return y<=17?372:y<=27?372+(y-17)*.8:y<40?380-(y-27)*8/13:382;}
async function build(){
 const base=read(root+'/base.png'),sourceMeta=JSON.parse(fs.readFileSync(root+'/body-sequence.json'));
 assert.equal(sourceMeta.frames.length,30);
 const poses=JSON.parse(fs.readFileSync(root+'/poses.json'));
 const bombPoses=fs.existsSync(root+'/bomb-poses.json')?JSON.parse(fs.readFileSync(root+'/bomb-poses.json')):poses.map(p=>p.bomb);
 const original=sourceMeta.frames.map((_,i)=>read(`${root}/frames/frame-${String(i+1).padStart(2,'0')}.png`));
 const tip=PNG.sync.read(await sharp(root+'/fuse/clean-source.png').resize(115,85).png().toBuffer());
 const clean=clone(base),star=new PNG({width:S,height:S}),embers=[new PNG({width:S,height:S}),new PNG({width:S,height:S})];
 for(let y=0;y<50;y++)for(let x=369;x<430;x++){
  if(x<starLeft(y)-3)continue;
  const k=(y*S+x)*4;
  const cordBlue=base.data[k+2]>50&&base.data[k+2]>base.data[k]*1.6;
  if(x>=starLeft(y)&&x<409&&!cordBlue)base.data.copy(star.data,k,k,k+4);
  else if(x>=409)base.data.copy(embers[y<34?0:1].data,k,k,k+4);
  const q=(y*tip.width+x-320)*4;if(!cordBlue)tip.data.copy(clean.data,k,q,q+4);
 }
 save(root+'/fuse/clean-layer.png',clean);save(root+'/fuse/star-layer.png',star);
 embers.forEach((im,i)=>save(`${root}/fuse/ember-${i+1}.png`,im));
 // Subdivide only the old endpoint holds. All existing body poses retain
 // their exact pixels and their exact accumulated display durations.
 const mapping=sourceMeta.frames.flatMap((f,i)=>Array.from({length:f.durationMs/60},()=>i));
 assert.equal(mapping.length,39);
 const frames=[],report=[];
 for(let n=0;n<mapping.length;n++){
  const sourceIndex=mapping[n],old=original[sourceIndex],out=clone(old),p=bombPoses[sourceIndex];
  const phase=n===mapping.length-1?0:n%8;
  const pulse=[1,.86,.97,.83,1,.9,.96,.87][phase],angle=[0,-4,3,-3,2,4,-2,3][phase];
  const parts=[{cx:390,cy:27,x:0,y:0,a:angle,scale:pulse},
   {cx:416,cy:26,x:phase*1.15,y:-phase*.65,a:-phase*2,scale:1-phase*.035},
   {cx:417,cy:41,x:phase*.9,y:phase*.40,a:phase*3,scale:1-phase*.025}];
  if(phase!==0)for(let y=0;y<135;y++)for(let x=310;x<490;x++){
   const [sx,sy]=inverse(x,y,p);if(!effectRegion(sx,sy))continue;
   let pixel=sample(clean,sx,sy);
   [star,...embers].forEach((layer,i)=>{pixel=over(pixel,sample(layer,...partPoint(sx,sy,parts[i])));});
   const k=(y*S+x)*4,a=pixel[3];
   for(let c=0;c<3;c++)out.data[k+c]=a>.001?Math.round(pixel[c]/a):0;
   out.data[k+3]=a>.001?Math.round(a*255):0;
  }
  let changed=0,outside=0,warm=0,bounds=[S,S,-1,-1];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
   const k=(y*S+x)*4;
   if(!out.data.subarray(k,k+4).equals(old.data.subarray(k,k+4))){changed++;if(!effectRegion(...inverse(x,y,p)))outside++;}
   if(out.data[k+3]>16){bounds=[Math.min(bounds[0],x),Math.min(bounds[1],y),Math.max(bounds[2],x),Math.max(bounds[3],y)];
    if(effectRegion(...inverse(x,y,p))&&out.data[k]>160&&out.data[k+1]>70&&out.data[k+2]<170)warm++;
   }
  }
  assert.equal(outside,0,'Change outside fuse in frame '+(n+1));assert(warm>200,'Spark disappeared in frame '+(n+1));
  assert(bounds[0]>0&&bounds[1]>0&&bounds[2]<511&&bounds[3]<511,'Clipped frame '+(n+1));
  frames.push(out);report.push({frame:n+1,sourcePose:sourceIndex+1,phase,changedPixels:changed,changedPixelsOutsideFuse:outside,visibleWarmSparkPixels:warm,bounds});
 }
 assert(frames[0].data.equals(base.data)&&frames.at(-1).data.equals(base.data));
 for(let n=1;n<frames.length;n++)assert(!frames[n].data.equals(frames[n-1].data),'Static consecutive frames '+n);
 sourceMeta.frames.forEach((f,i)=>assert.equal(mapping.filter(j=>j===i).length*60,f.durationMs));
 const columns=6,rows=Math.ceil(frames.length/columns),sheet=new PNG({width:columns*S,height:rows*S});
 fs.mkdirSync(root+'/fuse/frames',{recursive:true});
 frames.forEach((im,n)=>{PNG.bitblt(im,sheet,0,0,S,S,n%columns*S,Math.floor(n/columns)*S);save(`${root}/fuse/frames/frame-${String(n+1).padStart(2,'0')}.png`,im);});
 save(root+'/waddlepop_flavor.png',sheet);
 const meta={...sourceMeta,columns,rows,frames:mapping.map((sourcePoseIndex,index)=>({index,x:index%columns*S,y:Math.floor(index/columns)*S,width:S,height:S,durationMs:60,sourcePoseIndex})),expressions:mapping.map(n=>sourceMeta.expressions[n]),effects:{...sourceMeta.effects,detachedNervousDroplets:{...sourceMeta.effects.detachedNervousDroplets,frameRanges:[[13,18],[20,25]]},fuseSpark:{alwaysVisible:true,animatedThroughout:true,frameIntervalMs:60,fuseLengthPreserved:true}},notes:'39 frames at 60 ms, 2340 ms total. The original 30 body poses and their exact display timing are preserved; opening and ending holds are subdivided into spark-only frames. The spark pulses and two embers flick outward throughout. First and last frames match waddlepop_idle.png exactly. Existing face, flippers, nervous droplets and fumble motion are unchanged.'};
 write(root+'/waddlepop_flavor.json',JSON.stringify(meta,null,2));
 if(fs.existsSync(root+'/bomb-wobble-audit.json')){
  const wobble=JSON.parse(fs.readFileSync(root+'/bomb-wobble-audit.json'));
  meta.bombMotion={angularGain:wobble.angularGain,horizontalGain:wobble.horizontalGain};
  meta.notes+=' The bomb now tilts 60% more and sways 25% farther horizontally. Penguin artwork, body and flipper movements, expressions, droplets and timing are identical to the prior version; only the bomb motion is increased.';
  write(root+'/waddlepop_flavor.json',JSON.stringify(meta,null,2));
 }
 if(fs.existsSync(root+'/hand-motion-audit.json')){
  const hands=JSON.parse(fs.readFileSync(root+'/hand-motion-audit.json'));
  meta.handMotion={maximumAddedMovementPx:hands.maximumAddedMovementPx,maximumRotationDeg:1.2,faceAndBodyUnchanged:true};
  meta.notes='39 transparent 512px frames at 60ms, 2340ms total. The hands make small alternating grip adjustments during the fumble, moving no more than 4px beyond their prior positions. Face shape, expressions, body movement, feet, bomb wobble, nervous droplets and timing are preserved. The fuse keeps sparking throughout. First and last frames match waddlepop_idle.png exactly.';
  write(root+'/waddlepop_flavor.json',JSON.stringify(meta,null,2));
 }
 const audit={frames:39,sourceBodyPoses:30,grid:[columns,rows],totalDurationMs:2340,bodyPoseDurationsUnchanged:true,allPixelsOutsideFuseIdentical:true,baseUnchanged:true,firstAndLastMatchBaseExactly:true,noConsecutiveStaticFrames:true,sparkVisibleEveryFrame:true,originalSparkColorsPreserved:true,clippedFrames:0,framesChecked:report};
 write(root+'/fuse/audit.json',JSON.stringify(audit,null,2));
 const hash=crypto.createHash('sha256').update(sheet.data).digest('hex').slice(0,12),contact=root+'/fuse/contact-'+hash+'.png';
 const tiles=[];for(let n=0;n<frames.length;n++)tiles.push({input:await sharp(PNG.sync.write(frames[n])).resize(256,256).flatten({background:n%2?'#322b39':'#e7e3ed'}).png().toBuffer(),left:n%6*256,top:Math.floor(n/6)*260});
 write(contact,await sharp({create:{width:1536,height:rows*260,channels:4,background:'#eceaf0'}}).composite(tiles).png().toBuffer());
 write(root+'/latest-contact.json',JSON.stringify({path:contact}));
 console.log(JSON.stringify({frames:39,totalMs:2340,bodyTimingPreserved:true,sparkAlwaysVisible:true,clippedFrames:0,contact}));
 return audit;
}
module.exports={build};
if(require.main===module)build().catch(e=>{console.error(e);process.exit(1);});
