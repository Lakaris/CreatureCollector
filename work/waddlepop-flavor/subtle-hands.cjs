const fs=require('fs');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor';
function adjust(out,{n,p,frameCharacter,bomb,renderBomb,map,rot,inv,sample,over,sm,cheekBounds,rigidHead}){
 const old=PNG.sync.read(fs.readFileSync(`${root}/before-hand-motion/frames/frame-${String(n+1).padStart(2,'0')}.png`));
 if(!out.data.equals(old.data))throw Error('Existing animation baseline changed before hand edit, pose '+(n+1));
 const left=p.releaseL/10,right=p.releaseR/12;
 const angles=[1.2*left-.3*right,-1.2*right+.3*left];
 const lifts=[-.85*left+.2*right,-.85*right+.2*left];
 const pivots=[[181,373],[335,374]],a=p.body.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 const record={frame:n+1,anglesDeg:angles,liftsPx:lifts,changedPixels:0,changedFacePixels:0,changedBodyPixels:0,maximumAddedMovementPx:0};
 if(!left&&!right)return record;
 function extra(x,y){
  if(rigidHead(x,y))return[0,0];
  const [l,r]=cheekBounds(y),shoulder=1-sm(345,385,y);
  const weights=[sm(8,30,l-x)*shoulder,sm(8,30,x-r)*shoulder];
  let dx=0,dy=0;
  for(let i=0;i<2;i++){
   const q=rot(x,y,{a:angles[i],cx:pivots[i][0],cy:pivots[i][1],x:0,y:lifts[i]});
   dx+=(q[0]-x)*weights[i];dy+=(q[1]-y)*weights[i];
  }
  return[c*dx-s*dy,s*dx+c*dy];
 }
 function newMap(x,y){const q=map(x,y),d=extra(x,y);return[q[0]+d[0],q[1]+d[1]];}
 function sourcePoint(x,y,mapping){let [sx,sy]=inv(x,y,p.body);for(let pass=0;pass<20;pass++){
  const q=mapping(sx,sy),ex=x-q[0],ey=y-q[1];sx+=(c*ex+s*ey)*.7;sy+=(-s*ex+c*ey)*.7;
 }return[sx,sy];}
 const pixel={data:Buffer.alloc(4)};
 for(let y=185;y<405;y++)for(let x=85;x<430;x++){
  const local=inv(x,y,p.body);
  if(rigidHead(...local)||local[1]<205||local[1]>=386)continue;
  const before=sourcePoint(x,y,map),d=extra(...before);
  if(Math.hypot(...d)<.0001)continue;
  const after=sourcePoint(x,y,newMap),oldCharacter=sample(frameCharacter,...before),character=sample(frameCharacter,...after);
  if(Math.max(oldCharacter[3],character[3])<.01)continue;
  // Render once from the same source artwork, rather than bending/resampling
  // the already-exported frames. The shoulder taper stops before the face.
  pixel.data.fill(0);
  const backgroundPose=Math.round(character[3]*255)>=250?p.bomb:renderBomb;
  over(pixel,0,sample(bomb,...inv(x,y,backgroundPose)));
  over(pixel,0,character);
  const k=(y*512+x)*4;
  if(!pixel.data.equals(out.data.subarray(k,k+4))){pixel.data.copy(out.data,k);record.changedPixels++;}
  record.maximumAddedMovementPx=Math.max(record.maximumAddedMovementPx,Math.hypot(...d));
 }
 // Verify the completed frame, including the old facial expressions and
 // body, against the saved version. Only the two flipper regions may differ.
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const k=(y*512+x)*4;if(old.data.subarray(k,k+4).equals(out.data.subarray(k,k+4)))continue;
  const local=inv(x,y,p.body);
  if(rigidHead(...local))record.changedFacePixels++;
  if(local[1]>=386)record.changedBodyPixels++;
 }
 if(record.changedFacePixels||record.changedBodyPixels)throw Error('Hand movement reached face/body in pose '+(n+1));
 if(record.maximumAddedMovementPx>4)throw Error('Hand movement exceeds subtle range in pose '+(n+1));
 return record;
}
module.exports={adjust};
