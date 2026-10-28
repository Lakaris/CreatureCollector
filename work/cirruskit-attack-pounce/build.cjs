const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack-pounce',S=512,read=p=>PNG.sync.read(fs.readFileSync(p));
const base=read('images/cirruskit/cirruskit_base.png'),layers=Object.fromEntries(['tail','body','belly','nearHind','farHind','nearFront','farFront','hip-cover','foreground'].map(n=>[n,read(`work/cirruskit-walk-belly-separation/layers/${n}.png`)]));
const variants=Object.fromEntries(['normal','focused','attack'].map(n=>[n,read(`work/cirruskit-attack/inputs/${n}.png`)]));
layers.farFront=read('work/cirruskit-walk-cleanup/layers/farFront.png');
// Remove isolated extraction remnants from the editable layers, retaining
// the complete antialiased boundary around each actual part.
for(const p of Object.values(layers)){
 const seen=new Uint8Array(S*S);let largest=[];
 for(let start=0;start<S*S;start++){if(seen[start]||p.data[start*4+3]<8)continue;let part=[],todo=[start];seen[start]=1;while(todo.length){const k=todo.pop(),x=k%S,y=k>>9;part.push(k);for(let yy=Math.max(0,y-1);yy<=Math.min(511,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(511,x+1);xx++){const j=yy*S+xx;if(!seen[j]&&p.data[j*4+3]>=8){seen[j]=1;todo.push(j);}}}if(part.length>largest.length)largest=part;}
 const keep=new Uint8Array(S*S);for(const k of largest){const x=k%S,y=k>>9;for(let yy=Math.max(0,y-2);yy<=Math.min(511,y+2);yy++)for(let xx=Math.max(0,x-2);xx<=Math.min(511,x+2);xx++)keep[yy*S+xx]=1;}for(let k=0;k<S*S;k++)if(!keep[k])p.data.fill(0,k*4,k*4+4);
}
const pivots={nearHind:[180,372],farHind:[248,383],nearFront:[309,366],farFront:[407,375]};
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
// Keyed anticipation, takeoff, airborne reach, front-foot contact, then recovery.
// Angles articulate the existing editable limb layers. No frame interpolation.
const keys=[
 {n:0,tilt:0,lift:0,x:0,squash:0,head:0,front:0,hind:0,tail:0},
 {n:3,tilt:0,lift:0,x:0,squash:0.035,head:7,front:1,hind:4,tail:1},
 {n:5,tilt:1,lift:0,x:-2,squash:0.055,head:13,front:3,hind:8,tail:3},
 {n:7,tilt:5,lift:14,x:-6,squash:0,head:6,front:-20,hind:28,tail:-4},
 {n:10,tilt:12,lift:37,x:-12,squash:0,head:5,front:-48,hind:48,tail:-14},
 {n:12,tilt:15,lift:26,x:-22,squash:0,head:7,front:-45,hind:55,tail:-14},
 {n:15,tilt:12,lift:10,x:-9,squash:0,head:10,front:-18,hind:42,tail:-8},
 {n:17,tilt:5,lift:0,x:-3,squash:0.04,head:18,front:-3,hind:18,tail:2},
 {n:20,tilt:1,lift:0,x:0,squash:0.03,head:10,front:0,hind:4,tail:3},
 {n:24,tilt:0,lift:0,x:0,squash:0,head:0,front:0,hind:0,tail:0}
];
function pose(n){let k=0;while(k<keys.length-2&&n>keys[k+1].n)k++;const a=keys[k],b=keys[k+1],t=smooth((n-a.n)/(b.n-a.n)),p={n};for(const field of Object.keys(a).filter(f=>f!=='n'))p[field]=a[field]+(b[field]-a[field])*t;p.expression=n<2||n>22?'normal':n<4||n>19?'focused':'attack';p.phase=n<6?'wind-up':n<9?'takeoff':n<15?'airborne':n<19?'landing':'recover';return p;}
function sample(p,x,y){const ix=Math.floor(x),iy=Math.floor(y),dx=x-ix,dy=y-iy,o=[0,0,0,0];for(const [ox,oy,w]of [[0,0,(1-dx)*(1-dy)],[1,0,dx*(1-dy)],[0,1,(1-dx)*dy],[1,1,dx*dy]]){const xx=ix+ox,yy=iy+oy;if(xx<0||yy<0||xx>=S||yy>=S)continue;const i=(yy*S+xx)*4,a=p.data[i+3]/255;o[3]+=w*a;for(let c=0;c<3;c++)o[c]+=w*a*p.data[i+c];}return o;}
function blend(p,i,v){const a=v[3];if(!a)return;const d=p.data[i+3]/255;if(a>=0.98||!d){for(let c=0;c<3;c++)p.data[i+c]=Math.round(v[c]/a);p.data[i+3]=Math.round(a*255);}else{const oa=a+d*(1-a);for(let c=0;c<3;c++)p.data[i+c]=Math.round((v[c]+p.data[i+c]*d*(1-a))/oa);p.data[i+3]=Math.round(oa*255);}}
function boneMap(name,x,y,angle){const [px,py]=pivots[name],a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),start=name==='nearHind'?365:name==='farHind'?385:380,end=name==='nearHind'?418:name==='farHind'?420:420,w=smooth((y-start)/(end-start)),rx=px+c*(x-px)-s*(y-py),ry=py+s*(x-px)+c*(y-py);return [x+w*(rx-x),y+w*(ry-y)];}
function inverseBone(name,x,y,angle){let sx=x,sy=y;for(let n=0;n<12;n++){const p=boneMap(name,sx,sy,angle),ex=p[0]-x,ey=p[1]-y;if(Math.abs(ex)+Math.abs(ey)<0.01)break;const a=boneMap(name,sx+.1,sy,angle),b=boneMap(name,sx,sy+.1,angle),j00=(a[0]-p[0])*10,j10=(a[1]-p[1])*10,j01=(b[0]-p[0])*10,j11=(b[1]-p[1])*10,det=j00*j11-j01*j10;if(Math.abs(det)<.08)return[-1,-1];sx-=Math.max(-20,Math.min(20,(j11*ex-j01*ey)/det));sy-=Math.max(-20,Math.min(20,(-j10*ex+j00*ey)/det));}return[sx,sy];}
function drawMesh(out,name,p){const src=layers[name],buf=new PNG({width:S,height:S}),a=p.tilt*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 function point(x,y){let sx=x,sy=y;if(name==='tail'){const ta=p.tail*Math.PI/180,w=1-smooth((y-175)/135),dx=x-145,dy=y-350; sx=x+w*(145+Math.cos(ta)*dx-Math.sin(ta)*dy-x);sy=y+w*(350+Math.sin(ta)*dx+Math.cos(ta)*dy-y);}else [sx,sy]=boneMap(name,x,y,name.endsWith('Front')?p.front:p.hind);sy=460+(sy-460)*(1-p.squash);const dx=sx-290,dy=sy-340;return[290+c*dx-s*dy+p.x,340+s*dx+c*dy-p.lift,x,y];}
 function tri(A,B,C){const den=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(den)<.0001)return;const x0=Math.max(0,Math.floor(Math.min(A[0],B[0],C[0]))),x1=Math.min(511,Math.ceil(Math.max(A[0],B[0],C[0]))),y0=Math.max(0,Math.floor(Math.min(A[1],B[1],C[1]))),y1=Math.min(511,Math.ceil(Math.max(A[1],B[1],C[1])));for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const u=((B[1]-C[1])*(x-C[0])+(C[0]-B[0])*(y-C[1]))/den,v=((C[1]-A[1])*(x-C[0])+(A[0]-C[0])*(y-C[1]))/den,w=1-u-v;if(u<-.00001||v<-.00001||w<-.00001)continue;const value=sample(src,u*A[2]+v*B[2]+w*C[2],u*A[3]+v*B[3]+w*C[3]),i=(y*S+x)*4;if(!value[3])continue;for(let k=0;k<3;k++)buf.data[i+k]=Math.round(value[k]/value[3]);buf.data[i+3]=Math.round(value[3]*255);}}
 const box=name==='tail'?[0,0,224,404]:name==='nearHind'?[100,300,264,464]:name==='farHind'?[208,376,288,456]:name==='nearFront'?[248,364,368,476]:[360,364,460,460];
 for(let y=box[1];y<box[3];y+=4)for(let x=box[0];x<box[2];x+=4){const A=point(x,y),B=point(x+4,y),C=point(x+4,y+4),D=point(x,y+4);tri(A,B,C);tri(A,C,D);}for(let i=0;i<buf.data.length;i+=4){const a=buf.data[i+3]/255;if(a)blend(out,i,[buf.data[i]*a,buf.data[i+1]*a,buf.data[i+2]*a,a]);}
}
function draw(out,name,pose){let src=layers[name];if(name==='foreground'){src={width:S,height:S,data:Buffer.from(src.data)};const color=variants[pose.expression];for(let i=0;i<src.data.length;i+=4)for(let c=0;c<3;c++)src.data[i+c]=color.data[i+c];}
if(name==='tail'||pivots[name]){drawMesh(out,name,pose);return;}
const a=pose.tilt*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
for(let y=0;y<S;y++)for(let x=0;x<S;x++){
 const dx=x-290-pose.x,dy=y-340+pose.lift;let sx=290+c*dx+s*dy,sy=340-s*dx+c*dy;sy=460+(sy-460)/(1-pose.squash);
 if(name==='foreground')sy-=pose.head;
 else if(name==='tail'){const ta=-pose.tail*Math.PI/180,tx=sx-145,ty=sy-350;sx=145+Math.cos(ta)*tx-Math.sin(ta)*ty;sy=350+Math.sin(ta)*tx+Math.cos(ta)*ty;}
 else if(pivots[name]){[sx,sy]=inverseBone(name,sx,sy,name.endsWith('Front')?pose.front:pose.hind);}
 blend(out,(y*S+x)*4,sample(src,sx,sy));
}}
const plans=[];
for(let n=0;n<25;n++){const p=pose(n),out=new PNG({width:S,height:S});for(const name of ['tail','farHind','farFront','body','belly','nearHind','nearFront','hip-cover','foreground'])draw(out,name,p);if(n===0||n===24)base.data.copy(out.data);fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(out));plans.push({...p,index:n,durationMs:16});}
fs.writeFileSync(`${root}/frame-plan.json`,JSON.stringify({frames:plans,columns:5,rows:5,totalDurationMs:400},null,2));
console.log('Rendered 25 revised pounce poses.');
