const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',src='work/waddlepop-flavor',S=512,N=30,COLS=6,DT=60;
const read=p=>PNG.sync.read(fs.readFileSync(p)),clone=im=>PNG.sync.read(PNG.sync.write(im));
function write(path,data){const tmp=path+'.building-'+process.pid;fs.writeFileSync(tmp,data);fs.renameSync(tmp,path);}
const save=(p,im)=>write(p,PNG.sync.write(im)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function sample(im,x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,o=[0,0,0,0];for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const xx=ix+dx,yy=iy+dy;if(xx<0||xx>=S||yy<0||yy>=S)continue;const k=(yy*S+xx)*4,a=im.data[k+3]/255,w=(dx?fx:1-fx)*(dy?fy:1-fy);for(let c=0;c<3;c++)o[c]+=im.data[k+c]*a*w;o[3]+=a*w;}return o;}
function over(out,k,p){if(p[3]<.001)return;const da=out.data[k+3]/255,a=p[3]+da*(1-p[3]);for(let c=0;c<3;c++)out.data[k+c]=Math.round((p[c]+out.data[k+c]*da*(1-p[3]))/a);out.data[k+3]=Math.round(a*255);}
function inverse(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx-p.x)+s*(y-p.cy-p.y),p.cy-s*(x-p.cx-p.x)+c*(y-p.cy-p.y)];}
function transform(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx)-s*(y-p.cy)+p.x,p.cy+s*(x-p.cx)+c*(y-p.cy)+p.y];}
// The head and shoulders stay rigid. Only the lower torso bends gently
// into the stationary hips, leaving every pixel at/below y=425 unchanged.
function bodyInverse(x,y,p){if(y>=425)return[x,y];const q=inverse(x,y,p);if(y<=390)return q;const t=(y-390)/35,w=1-t*t*(3-2*t);return[x+(q[0]-x)*w,y+(q[1]-y)*w];}
function partInverse(x,y,p){const q=inverse(x,y,p);return[p.cx+(q[0]-p.cx)/p.scale,p.cy+(q[1]-p.cy)/p.scale];}
function cleanFragments(im){const seen=new Uint8Array(S*S);let removed=0;for(let y=0;y<190;y++)for(let x=300;x<S;x++){const start=y*S+x;if(seen[start]||im.data[start*4+3]<32)continue;const q=[start];seen[start]=1;let warm=false;for(let j=0;j<q.length;j++){const v=q[j],xx=v%S,yy=Math.floor(v/S),k=v*4;warm||=im.data[k]>140&&im.data[k+1]>60&&im.data[k+2]<150;for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=xx+dx,ny=yy+dy;if(nx<0||nx>=S||ny<0||ny>=S)continue;const z=ny*S+nx;if(!seen[z]&&im.data[z*4+3]>=32){seen[z]=1;q.push(z);}}}if(q.length<=20&&!warm){removed+=q.length;for(const v of q)im.data.fill(0,v*4,v*4+4);}}return removed;}
const bombTimeline=[
 [0,0,0],[0,0,0],[-2,2,-1],[-5,4,-2],[-8,6,-3],[-8,6,-3],[-2,3,-1],
 [14,2,2],[28,0,6],[46,-5,10],[62,-10,12],
 [null,0,0],[null,0,0],[null,0,0],[null,0,0],[null,0,0],[null,0,0],[null,0,0],[null,0,0],[null,0,0],[null,0,0],[null,0,0],[null,0,0],
 [0,0,0],[0,4,0],[0,2,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]
];
// Both arms follow one phase curve, with their approved rotation ranges.
// Hold the throw for four frames, then ease both arms to rest together.
const armProgress=[0,0,-.25,-.5,-1,-1,-.25,.30,.55,.82,1,1,1,1,.970,.883,.750,.587,.413,.250,.117,.030,0,0,0,0,0,0,0,0];
assert.equal(armProgress.length,N);assert.equal(bombTimeline.length,N);
const timeline=bombTimeline.map((bomb,n)=>{const p=armProgress[n];return[p*(p<0?2:12),p*(p<0?4:22),...bomb];});
const expressions=Array(N).fill('base');for(const [n,v]of Object.entries({6:'half',7:'squeezed-closed',8:'squeezed-small',9:'squeezed-open',10:'squeezed-small',11:'squeezed-closed',12:'half'}))expressions[n]=v;
(async()=>{
 const protectedPaths=['images/waddlepop/waddlepop_idle.png','images/waddlepop/waddlepop_move.png','images/waddlepop/waddlepop_flavor.png'];
 const protectedHashes=Object.fromEntries(protectedPaths.map(p=>[p,hash(p)]));
 const base=read(protectedPaths[0]),original=read(src+'/character.png'),arms=[read(root+'/arm-1.png'),read(root+'/arm-2.png')],bomb=read(src+'/bomb.png');
 const {body,neckMask,rows:outlineRows,edges:headEdges}=require('./outline-matte.cjs')(read(root+'/body.png'),original);
 save(root+'/body-outline-matte.png',body);write(root+'/outline-reference.json',JSON.stringify(outlineRows,null,2));
 const mask=read(src+'/expressions/feature-mask.png'),faces={base};for(const state of new Set(expressions))if(state!=='base')faces[state]=read(src+'/expressions/'+state+'.png');
 const bodies={};for(const state of new Set(expressions)){const im=clone(body);if(state!=='base')for(let k=0;k<im.data.length;k+=4)if(mask.data[k+3])for(let c=0;c<3;c++)im.data[k+c]=faces[state].data[k+c];bodies[state]=im;}
 const cleanFuse=read(src+'/fuse/clean-layer.png'),star=read(src+'/fuse/star-layer.png'),embers=[read(src+'/fuse/ember-1.png'),read(src+'/fuse/ember-2.png')],cleanBomb=clone(bomb);
 for(let y=0;y<62;y++)for(let x=367;x<442;x++){const k=(y*S+x)*4;cleanFuse.data.copy(cleanBomb.data,k,k,k+4);}
 const frames=[],records=[];
 for(let n=0;n<N;n++){
  const [la,ra,bx,by,ba]=timeline[n],visible=bx!==null,endpoint=n===0||n===N-1;
  const effort=armProgress[n],bodyPose={a:effort*(effort<0?1.2:4),x:effort*(effort<0?.75:2),y:effort*(effort<0?-1:1.5),cx:256,cy:425};
  let p={a:ba,x:bx||0,y:by,cx:250,cy:143};
  // Carry the bomb with the heave while gripped; its existing flight takes
  // over at the release event so the projectile stays inside the tile.
  if(n<9){const c=transform(p.cx+p.x,p.cy+p.y,bodyPose);p={...p,a:p.a+bodyPose.a,x:c[0]-p.cx,y:c[1]-p.cy};}
  const ap=[{a:la,x:0,y:0,cx:181,cy:382},{a:ra,x:0,y:0,cx:335,cy:382}];
  const out=new PNG({width:S,height:S}),phase=endpoint?0:n%8;
  const sparks=[{cx:390,cy:27,x:0,y:0,a:[0,-4,3,-3,2,4,-2,3][phase],scale:[1,.86,.97,.83,1,.9,.96,.87][phase]},{cx:416,cy:26,x:phase*1.15,y:-phase*.65,a:-phase*2,scale:1-phase*.035},{cx:417,cy:41,x:phase*.9,y:phase*.4,a:phase*3,scale:1-phase*.025}];
  if(visible)for(let y=0;y<335;y++)for(let x=60;x<S;x++){const k=(y*S+x)*4,q=inverse(x,y,p),fuse=phase&&q[0]>=367&&q[0]<=441&&q[1]>=-1&&q[1]<=61;over(out,k,sample(fuse?cleanBomb:bomb,...q));if(fuse)[star,...embers].forEach((im,i)=>over(out,k,sample(im,...partInverse(...q,sparks[i]))));}
  for(let i=0;i<2;i++)for(let y=180;y<450;y++)for(let x=40;x<505;x++){
   const q=inverse(x,y,bodyPose),aq=inverse(...q,ap[i]),pixel=sample(arms[i],...aq);
   if(q[1]>=285&&q[1]<368&&pixel[3]>.01){
    const iy=Math.floor(q[1]),f=q[1]-iy,edge=headEdges[iy][i]*(1-f)+headEdges[iy+1][i]*f,distance=i?q[0]-edge:edge-q[0];
    if(distance>=-1&&distance<=12){
     // A touching flipper and cheek share the cheek's outline. Reuse the
     // adjacent flipper fill beneath it, instead of stacking two strokes.
     const contact=Math.max(sample(arms[i],...inverse(edge,q[1],ap[i]))[3],sample(arms[i],...inverse(edge+(i?1:-1),q[1],ap[i]))[3]);
     const fill=sample(arms[i],aq[0]+(i?10:-10),aq[1]);
     if(contact>.01&&fill[3]>.95&&fill[2]-fill[0]>60&&pixel[2]<110*pixel[3]){
      const w=Math.min(1,contact*4)*Math.min(1,(12-distance)/3);
      for(let c=0;c<3;c++)pixel[c]=pixel[c]*(1-w)+fill[c]/fill[3]*pixel[3]*w;
     }
    }
   }
   over(out,(y*S+x)*4,pixel);
  }
  for(let y=180;y<S;y++)for(let x=100;x<415;x++){
   const k=(y*S+x)*4,q=bodyInverse(x,y,bodyPose),pixel=sample(bodies[expressions[n]],...q),mask=sample(neckMask,...q)[3];
   const covered=mask*out.data[k+3]/255;
   if(covered>0){
    const side=q[0]<256?0:1,aq=inverse(...q,ap[side]),fill=sample(arms[side],aq[0]+(side?8:-8),aq[1]);
    // Remove only a buried inner stroke; retain the arm's outside contour
    // and its existing blue shading at the shoulder connection.
    if(fill[3]>.98&&fill[2]-fill[0]>80&&Math.max(...out.data.subarray(k,k+3))<150)for(let c=0;c<3;c++)out.data[k+c]=Math.round(out.data[k+c]*(1-mask)+fill[c]/fill[3]*mask);
    const reference=sample(original,...q);if(reference[3]>0)for(let c=0;c<3;c++){const color=reference[c]/reference[3];pixel[c]=pixel[c]*(1-covered)+color*pixel[3]*covered;}
   }
   over(out,k,pixel);
  }
  // Exactly reconstruct the original resting silhouette, while its spark
  // continues to animate during the short opening and recovery holds.
  if(la===0&&ra===0&&expressions[n]==='base')for(let y=190;y<S;y++)for(let x=90;x<415;x++){
   const k=(y*S+x)*4,q=inverse(x,y,p),back=visible?sample(bomb,...q):[0,0,0,0];out.data.fill(0,k,k+4);over(out,k,back);over(out,k,sample(original,x,y));if(original.data[k+3]>=250)original.data.copy(out.data,k,k,k+3);
  }
  if(endpoint)base.data.copy(out.data);
  else cleanFragments(out);
  let box=[S,S,-1,-1],warm=0,faceError=0,footError=0,facePixels=0;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const k=(y*S+x)*4;if(out.data[k+3]>16){box=[Math.min(box[0],x),Math.min(box[1],y),Math.max(box[2],x),Math.max(box[3],y)];if(y<190&&out.data[k]>160&&out.data[k+1]>70&&out.data[k+2]<170)warm++;}if(y>=425&&!out.data.subarray(k,k+4).equals(base.data.subarray(k,k+4)))footError++;
   if(y>=270&&y<=390&&x>=175&&x<=360){const q=inverse(x,y,bodyPose);if(q[0]>=190&&q[0]<=335&&q[1]>=285&&q[1]<=365){assert.deepStrictEqual(bodyInverse(x,y,bodyPose),q,'Face entered the torso bend');const expected=sample(bodies[expressions[n]],...q);if(expected[3]>.999){facePixels++;for(let c=0;c<3;c++)faceError=Math.max(faceError,Math.abs(out.data[k+c]-Math.round(expected[c]/expected[3])));}}}
  }
  assert(box[0]>0&&box[1]>0&&box[2]<511&&box[3]<511,'Clipped frame '+(n+1)+' '+box);
  assert.equal(footError,0,'Feet moved in frame '+(n+1));assert.equal(faceError,0,'Face deformed in frame '+(n+1));
  assert(facePixels>11000,'Incomplete face check in frame '+(n+1));
  assert(visible?warm>150:warm===0,'Fuse visibility incorrect in frame '+(n+1));
  frames.push(out);save(`${root}/frames/frame-${String(n+1).padStart(2,'0')}.png`,out);
  records.push({frame:n+1,bombVisible:visible,bombPose:p,armAngles:[la,ra],bodyPose,expression:expressions[n],bounds:box,footPixelsChanged:footError,faceError,facePixelsChecked:facePixels,sparkPixels:warm});
 }
 assert(frames[0].data.equals(base.data)&&frames.at(-1).data.equals(base.data));
 for(const [p,h]of Object.entries(protectedHashes))assert.equal(hash(p),h);
 const sheet=new PNG({width:COLS*S,height:5*S});frames.forEach((im,n)=>PNG.bitblt(im,sheet,0,0,S,S,n%COLS*S,Math.floor(n/COLS)*S));save(root+'/waddlepop_attack.png',sheet);
 const meta={image:'waddlepop_attack.png',frameWidth:S,frameHeight:S,columns:COLS,rows:5,loop:false,totalDurationMs:N*DT,frames:frames.map((_,index)=>({index,x:index%COLS*S,y:Math.floor(index/COLS)*S,width:S,height:S,durationMs:DT})),events:{release:{frame:10,timeMs:540},bombDisappears:{frame:12,timeMs:660},bombReappears:{frame:24,timeMs:1380}},notes:'A short overhead throw to the right, performed in place. The feet remain planted, the flippers rotate without stretching, and the face briefly squeezes with effort. The bomb disappears after release, then reappears in the raised hands. Its fuse sparks whenever visible. First and last frames are pixel-identical to waddlepop_idle.png. All art remains within one 512px tile.'};
 meta.flippers={completeArmSprites:true,motion:'rigid rotation',scale:1,synchronized:true,minimumLeftRotationDeg:-2,maximumLeftRotationDeg:12,minimumRightRotationDeg:-4,maximumRightRotationDeg:22,throwHold:{firstFrame:11,lastFrame:14,durationMs:240},returnCompleteFrame:23};
 meta.notes+=' Both full-sized flippers share one timing curve: they wind up, swing right, hold through frames 11–14 for 240 ms, and return to rest together by frame 23. The left and right arms retain their approved rotation limits. Neither arm reverses direction or pauses independently of the other.';
 meta.bodyMotion={maximumForwardLeanDeg:4,maximumBackwardLeanDeg:1.2,maximumForwardShiftPx:2,feetPlanted:true,rigidHeadAndShoulders:true,hipsFixedFromY:425,peakFrames:[11,14],returnCompleteFrame:23};
 meta.notes+=' A slight backward wind-up leads into a four-degree forward heave at the throw. The face and shoulders lean as a rigid unit, the belly bends gently into fixed hips, and the feet stay planted. The bomb follows the body while held, then follows its existing flight after release.';
 meta.notes+=' The moving head reuses the base cheek contour and stroke width. Touching arm and cheek outlines share a single visible edge; covered shoulder strokes are concealed by the existing blue artwork.';
 write(root+'/waddlepop_attack.json',JSON.stringify(meta,null,2));write(root+'/audit.json',JSON.stringify({frames:N,endpointsExact:true,feetPlantedEveryFrame:true,faceStructurePreserved:true,protectedHashes,records},null,2));
 const tiles=[];for(let n=0;n<N;n++){tiles.push({input:await sharp(PNG.sync.write(frames[n])).resize(256,256).flatten({background:n%2?'#36313d':'#eae7ef'}).png().toBuffer(),left:n%6*256,top:Math.floor(n/6)*278+22});tiles.push({input:Buffer.from(`<svg width="256" height="22"><text x="5" y="17" font-family="Arial" font-size="14">${n+1} · ${records[n].bombVisible?'bomb':'empty hands'}</text></svg>`),left:n%6*256,top:Math.floor(n/6)*278});}
 const contact=root+'/contact-'+hash(root+'/waddlepop_attack.png').slice(0,10)+'.png';write(contact,await sharp({create:{width:1536,height:1390,channels:4,background:'#efedf3'}}).composite(tiles).png().toBuffer());write(root+'/latest-contact.json',JSON.stringify({path:contact}));
 console.log(JSON.stringify({frames:N,durationMs:N*DT,endpointsExact:true,feetPlanted:true,contact}));
})();
