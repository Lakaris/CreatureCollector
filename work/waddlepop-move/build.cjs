const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-move',source='work/waddlepop-flavor',S=512,N=24,COLS=6,ROWS=4,DT=50;
const read=p=>PNG.sync.read(fs.readFileSync(p)),clone=im=>{const o=new PNG({width:im.width,height:im.height});im.data.copy(o.data);return o;};
function write(path,data){const tmp=path+'.building-'+process.pid;fs.writeFileSync(tmp,data);fs.renameSync(tmp,path);}
const save=(p,im)=>write(p,PNG.sync.write(im));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function sample(im,x,y){let o=[0,0,0,0],ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){
 const xx=ix+dx,yy=iy+dy;if(xx<0||yy<0||xx>=im.width||yy>=im.height)continue;
 const k=(yy*im.width+xx)*4,a=im.data[k+3]/255,w=(dx?fx:1-fx)*(dy?fy:1-fy);
 for(let c=0;c<3;c++)o[c]+=im.data[k+c]*a*w;o[3]+=a*w;
}return o;}
function over(out,k,p){if(p[3]<.001)return;const da=out.data[k+3]/255,a=p[3]+da*(1-p[3]);for(let c=0;c<3;c++)out.data[k+c]=Math.round((p[c]+out.data[k+c]*da*(1-p[3]))/a);out.data[k+3]=Math.round(a*255);}
function transform(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx)-s*(y-p.cy)+p.x,p.cy+s*(x-p.cx)+c*(y-p.cy)+p.y];}
function inverse(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx-p.x)+s*(y-p.cy-p.y),p.cy-s*(x-p.cx-p.x)+c*(y-p.cy-p.y)];}
function partInverse(x,y,p){const q=inverse(x,y,p);return[p.cx+(q[0]-p.cx)/p.scale,p.cy+(q[1]-p.cy)/p.scale];}
function pose(n){
 const t=2*Math.PI*(n%N)/N,s=Math.sin(t),sq=s*s;
 const body={a:1.2*s,x:1.2*s,y:2.5*sq,cx:256,cy:465};
 const center=transform(250,143,body),bounce=3*(Math.sin(t-.15)**2-Math.sin(.15)**2);
 const bomb={a:body.a+.5*s,x:center[0]-250+1.5*s,y:center[1]-143+bounce,cx:250,cy:143};
 const liftL=10*Math.max(0,s)**1.3,liftR=10*Math.max(0,-s)**1.3;
 const feet=[{a:-3*Math.max(0,s),x:6*s,y:-liftL,cx:191,cy:470},{a:3*Math.max(0,-s),x:-6*s,y:-liftR,cx:319,cy:470}];
 return{body,bomb,feet,lift:[liftL,liftR]};
}
function opaqueCore(im){for(let k=0;k<im.data.length;k+=4)if(im.data[k+3]>=250)im.data[k+3]=255;return im;}
function cleanFuseFragments(im){
 const labels=new Int32Array(S*S),small=[];let id=0;
 for(let y=0;y<100;y++)for(let x=335;x<460;x++){
  const start=y*S+x;if(labels[start]||im.data[start*4+3]<32)continue;
  const q=[start];labels[start]=++id;let warm=false;
  for(let j=0;j<q.length;j++){
   const v=q[j],vx=v%S,vy=Math.floor(v/S),k=v*4;
   warm=warm||(im.data[k]>140&&im.data[k+1]>60&&im.data[k+2]<150);
   for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=vx+dx,yy=vy+dy;if(xx<335||xx>=460||yy<0||yy>=100)continue;const next=yy*S+xx;if(!labels[next]&&im.data[next*4+3]>=32){labels[next]=id;q.push(next);}}
  }
  if(q.length<=20&&!warm)small.push(...q);
 }
 const erase=new Set(small);
 for(const v of small)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  const j=v+dy*S+dx;if(j>=0&&j<S*S&&im.data[j*4+3]<32)erase.add(j);
 }
 for(const v of erase)im.data.fill(0,v*4,v*4+4);
 return small.length;
}
function prepareFeet(base,character,underlay){
 const body=clone(character),feet=[];
 for(const roi of [[143,440,239,496],[270,443,370,496]])feet.push(completeFootOutline(base,roi));
 // Use one continuous torso contour beneath both feet. Small separate patches
 // leave bits of the old foot/body outline exposed when a foot lifts.
 function rowBounds(im,y,offset=0){let l=Infinity,r=-Infinity;for(let x=0;x<im.width;x++)if(im.data[(y*im.width+x)*4+3]>128){l=Math.min(l,x+offset);r=Math.max(r,x+offset);}return[l,r];}
 const anchor=rowBounds(character,440),genAnchor=rowBounds(underlay,43,130);
 const corrections=[anchor[0]-genAnchor[0],anchor[1]-genAnchor[1]];
 for(let y=442;y<500;y++){
  const uy=y-398+1,gb=uy<underlay.height?rowBounds(underlay,uy,130):[Infinity,-Infinity];
  const fade=1-clamp((y-440)/34,0,1),target=[gb[0]+corrections[0]*fade,gb[1]+corrections[1]*fade];
  for(let x=130;x<380;x++){
   const k=(y*S+x)*4;
   const sx=Number.isFinite(gb[0])?gb[0]+(x-target[0])/(target[1]-target[0])*(gb[1]-gb[0])-130:-100;
   const p=sample(underlay,sx,uy),rgb=p[3]>.001?p.slice(0,3).map(v=>Math.round(v/p[3])):[0,0,0];
   const prior=[...character.data.subarray(k,k+4)];
   const priorBlue=prior[2]>80&&prior[2]>prior[0]*1.3,newBlue=rgb[2]>80&&rgb[2]>rgb[0]*1.3;
   const priorCream=prior[0]>170&&prior[1]>160&&prior[2]>145,newCream=rgb[0]>170&&rgb[1]>160&&rgb[2]>145;
   // Keep the visible original belly colors wherever the material agrees;
   // the generated layer supplies only the hidden fill and the lower contour.
   let nearOldEdge=false;
   for(let dy=-2;dy<=2&&!nearOldEdge;dy++)for(let dx=-2;dx<=2;dx++){
    const j=((y+dy)*S+x+dx)*4,[rr,gg,bb,aa]=character.data.subarray(j,j+4);
    if(aa<248||(rr<75&&gg<75&&bb<75)||(rr>150&&gg>55&&bb<120&&rr>bb*1.7)){nearOldEdge=true;break;}
   }
   const retain=!nearOldEdge&&p[3]>.98&&prior[3]>248&&((priorBlue&&newBlue)||(priorCream&&newCream));
   for(let c=0;c<3;c++)body.data[k+c]=retain?prior[c]:rgb[c];
   body.data[k+3]=Math.round(p[3]*255);
  }
 }
 return{body:opaqueCore(body),feet};
}
// A complete contour belongs to each moving foot. The source has shared belly
// strokes, so copying nearby dark pixels clips some edges and captures others.
function completeFootOutline(base,roi){
 const [l,t,r,b]=roi,foot=new PNG({width:S,height:S}),field=new Float32Array(S*S),segments=[];
 const ink=[18,1,1],radius=6.25;
 for(let y=t-5;y<b+5;y++)for(let x=l-5;x<r+5;x++){
  const k=(y*S+x)*4,[rr,gg,bb,aa]=base.data.subarray(k,k+4);
  if(aa>32&&rr>gg*.9&&rr>bb*1.8&&bb<120&&gg>5)field[y*S+x]=clamp((rr-18)/237,0,1);
 }
 for(let y=t-5;y<b+4;y++)for(let x=l-5;x<r+4;x++){
  const corners=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]],v=corners.map(([xx,yy])=>field[yy*S+xx]),hits=[];
  for(let e=0;e<4;e++){const j=(e+1)%4;if((v[e]>=.5)===(v[j]>=.5))continue;const f=(.5-v[e])/(v[j]-v[e]);hits.push([corners[e][0]+f*(corners[j][0]-corners[e][0]),corners[e][1]+f*(corners[j][1]-corners[e][1])]);}
  if(hits.length===2)segments.push([hits[0],hits[1]]);
  else if(hits.length===4){segments.push([hits[0],hits[1]],[hits[2],hits[3]]);}
 }
 assert(segments.length>100,'Missing foot contour');
 function distance(x,y){let d=1e9;for(const [a,b]of segments){const vx=b[0]-a[0],vy=b[1]-a[1],u=clamp(((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy),0,1);d=Math.min(d,(x-a[0]-u*vx)**2+(y-a[1]-u*vy)**2);}return Math.sqrt(d);}
 function inside(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;return field[iy*S+ix]*(1-fx)*(1-fy)+field[iy*S+ix+1]*fx*(1-fy)+field[(iy+1)*S+ix]*(1-fx)*fy+field[(iy+1)*S+ix+1]*fx*fy>=.5;}
 for(let y=t-5;y<b+5;y++)for(let x=l-5;x<r+5;x++){
  const k=(y*S+x)*4,d=distance(x,y),core=inside(x,y);let coverage=0;
  if(core||d<radius-1)coverage=1;
  else if(d<radius+1){for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++)if(distance(x+(sx+.5)/4-.5,y+(sy+.5)/4-.5)<=radius)coverage+=1/16;}
  if(!coverage)continue;
  const [rr,gg,bb]=base.data.subarray(k,k+3),originalOrange=rr>30&&gg>5&&bb<120&&rr>bb*1.8&&rr>gg*.9;
  const keep=(core||d<1.5)&&originalOrange;
  for(let c=0;c<3;c++)foot.data[k+c]=keep?base.data[k+c]:ink[c];
  foot.data[k+3]=Math.round(coverage*255);
 }
 return foot;
}
async function build(){
 fs.mkdirSync(root+'/frames',{recursive:true});
 const protectedPaths=['images/waddlepop/waddlepop_idle.png','images/waddlepop/waddlepop_flavor.png'];
 const protectedHashes=Object.fromEntries(protectedPaths.map(p=>[p,hash(p)]));
 const base=read(protectedPaths[0]),character=read(source+'/character.png'),bomb=opaqueCore(read(source+'/bomb.png'));
 const underlay=PNG.sync.read(await sharp(root+'/feet-underlay-source.png').resize(250,102).png().toBuffer());
 const layers=prepareFeet(base,character,underlay);
 save(root+'/body.png',layers.body);layers.feet.forEach((im,i)=>save(`${root}/foot-${i+1}.png`,im));
 const cleanFuse=read(source+'/fuse/clean-layer.png'),star=read(source+'/fuse/star-layer.png'),embers=[read(source+'/fuse/ember-1.png'),read(source+'/fuse/ember-2.png')];
 const cleanBomb=clone(bomb);
 for(let y=0;y<62;y++)for(let x=367;x<442;x++){const k=(y*S+x)*4;cleanFuse.data.copy(cleanBomb.data,k,k,k+4);}
 const headBounds=[[190,218,307],[215,211,304],[240,205,315],[260,195,328],[275,181,337],[290,175,342],[310,169,348],[330,168,353],[350,173,353],[365,184,343],[378,212,317],[390,215,315]];
 function head(x,y){if(y<275||y>377)return false;let j=0;while(j<headBounds.length-2&&y>headBounds[j+1][0])j++;const u=(y-headBounds[j][0])/(headBounds[j+1][0]-headBounds[j][0]);return x>headBounds[j][1]*(1-u)+headBounds[j+1][1]*u+2&&x<headBounds[j][2]*(1-u)+headBounds[j+1][2]*u-2;}
 const correctedStart=clone(base);
 for(let y=442;y<S;y++)for(let x=130;x<380;x++){const k=(y*S+x)*4;layers.body.data.copy(correctedStart.data,k,k,k+4);}
 for(const foot of layers.feet)for(let y=435;y<505;y++)for(let x=130;x<385;x++)over(correctedStart,(y*S+x)*4,sample(foot,x,y));
 function render(n){
  if(n%N===0)return clone(correctedStart);
  const p=pose(n),out=new PNG({width:S,height:S}),phase=n%8;
  const pulse=[1,.86,.97,.83,1,.9,.96,.87][phase],angle=[0,-4,3,-3,2,4,-2,3][phase];
  const sparks=[{cx:390,cy:27,x:0,y:0,a:angle,scale:pulse},{cx:416,cy:26,x:phase*1.15,y:-phase*.65,a:-phase*2,scale:1-phase*.035},{cx:417,cy:41,x:phase*.9,y:phase*.4,a:phase*3,scale:1-phase*.025}];
  for(let y=0;y<S;y++)for(let x=65;x<470;x++){
   const k=(y*S+x)*4,q=inverse(x,y,p.bomb);
   const fuse=phase!==0&&q[0]>=367&&q[0]<=441&&q[1]>=-1&&q[1]<=61;
   over(out,k,sample(fuse?cleanBomb:bomb,...q));
   if(fuse)[star,...embers].forEach((im,i)=>over(out,k,sample(im,...partInverse(...q,sparks[i]))));
  }
  for(let y=180;y<S;y++)for(let x=95;x<415;x++)over(out,(y*S+x)*4,sample(layers.body,...inverse(x,y,p.body)));
  for(let i=0;i<2;i++)for(let y=420;y<500;y++)for(let x=135;x<380;x++)over(out,(y*S+x)*4,sample(layers.feet[i],...inverse(x,y,p.feet[i])));
  out.cleanedFusePixels=cleanFuseFragments(out);
  return out;
 }
 const frames=[],checks=[],poses=[],unique=new Set();
 for(let n=0;n<N;n++){
  const im=render(n),p=pose(n);frames.push(im);poses.push(p);
  let box=[S,S,-1,-1],warm=0,faceError=0,facePixels=0;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
   const k=(y*S+x)*4;
   if(im.data[k+3]>16){box=[Math.min(box[0],x),Math.min(box[1],y),Math.max(box[2],x),Math.max(box[3],y)];if(y<140&&im.data[k]>160&&im.data[k+1]>70&&im.data[k+2]<170)warm++;}
   if(n&&y>260&&y<390){const q=inverse(x,y,p.body);if(head(...q)){
    const expected=sample(layers.body,...q);if(expected[3]>.999){facePixels++;for(let c=0;c<3;c++)faceError=Math.max(faceError,Math.abs(im.data[k+c]-Math.round(expected[c]/expected[3])));}
   }}
  }
  assert(box[0]>0&&box[1]>0&&box[2]<511&&box[3]<511,'Clipping in frame '+(n+1));
  assert(warm>180,'Fuse stopped in frame '+(n+1));assert.equal(faceError,0,'Face warped in frame '+(n+1));
  if(n)assert(facePixels>15000);
  checks.push({frame:n+1,bounds:box,sparkPixels:warm,facePixelsChecked:facePixels,faceError,leftFootLift:p.lift[0],rightFootLift:p.lift[1],cleanedFusePixels:im.cleanedFusePixels||0});
  unique.add(crypto.createHash('sha256').update(im.data).digest('hex'));save(`${root}/frames/frame-${String(n+1).padStart(2,'0')}.png`,im);
 }
 assert.equal(unique.size,N);assert(render(N).data.equals(correctedStart.data));
 assert(!frames[N-1].data.equals(correctedStart.data),'Duplicate end pose would stall the loop');
 for(const path of protectedPaths)assert.equal(hash(path),protectedHashes[path]);
 const sheet=new PNG({width:COLS*S,height:ROWS*S});frames.forEach((im,n)=>PNG.bitblt(im,sheet,0,0,S,S,n%COLS*S,Math.floor(n/COLS)*S));
 save(root+'/waddlepop_move.png',sheet);
 const meta={image:'waddlepop_move.png',frameWidth:S,frameHeight:S,columns:COLS,rows:ROWS,loop:true,totalDurationMs:N*DT,frames:frames.map((_,index)=>({index,x:index%COLS*S,y:Math.floor(index/COLS)*S,width:S,height:S,durationMs:DT})),notes:'Gentle walk in place: feet alternate lifting and planting, with a small body sway. The bomb lightly bounces between the raised flippers and the fuse sparks continuously. Face, body and foot artwork retain their proportions. Each foot has a complete 6.25 px dark contour. Frame 1 uses the base pose with corrected foot outlines; the loop approaches it continuously without a duplicated final frame.'};
 write(root+'/waddlepop_move.json',JSON.stringify(meta,null,2));write(root+'/poses.json',JSON.stringify(poses,null,2));
 const audit={frames:N,uniqueFrames:unique.size,cell:[S,S],grid:[COLS,ROWS],totalDurationMs:N*DT,firstFrameMatchesBase:false,firstPoseMatchesBase:true,footOutlineWidth:6.25,continuousLoop:true,duplicatedEndFrame:false,faceGeometry:'Rigid rotation and translation only',feetGeometry:'Rigid cutouts with complete contours; no scale or stretch',sparkActiveEveryFrame:true,idleAndFlavorUnchanged:true,protectedHashes,checks};
 write(root+'/audit.json',JSON.stringify(audit,null,2));
 const tiles=[];for(let n=0;n<N;n++)tiles.push({input:await sharp(PNG.sync.write(frames[n])).resize(256,256).flatten({background:n%2?'#302c38':'#e7e3ed'}).png().toBuffer(),left:n%COLS*256,top:Math.floor(n/COLS)*260});
 const contact=root+'/contact-'+crypto.createHash('sha256').update(sheet.data).digest('hex').slice(0,12)+'.png';
 write(contact,await sharp({create:{width:COLS*256,height:ROWS*260,channels:4,background:'#efedf3'}}).composite(tiles).png().toBuffer());
 write(root+'/latest-contact.json',JSON.stringify({path:contact}));
 console.log(JSON.stringify({frames:N,durationMs:N*DT,contact,firstPoseMatchesBase:true,footOutlineWidth:6.25,faceErrors:0,clipping:0}));
}
build().catch(e=>{console.error(e);process.exit(1);});
