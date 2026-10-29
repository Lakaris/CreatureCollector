const fs=require('fs'),vm=require('vm'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-defeat-outline-weight',S=512,read=p=>PNG.sync.read(fs.readFileSync(p));
// Reuse the cleaned, editable body and limb layers from the accepted pounce.
const source=fs.readFileSync('work/cirruskit-attack-paw-alignment/build.cjs','utf8').split('const pivots=')[0];
const ctx=vm.createContext({require,Buffer});vm.runInContext(source+';globalThis.parts=layers;',ctx);
const layers=ctx.parts,base=read('images/cirruskit/cirruskit_base.png'),head=read('work/cirruskit-transition-repair/fixed-head-mane.png'),variants=Object.fromEntries(['normal','dazed','defeat'].map(n=>[n,read(`${root}/inputs/${n}.png`)]));
// The mane mask included a narrow strip of torso gray. Keep that shading on
// the torso so it cannot travel across the far leg as a detached dotted edge.
for(let y=330;y<400;y++)for(let x=215;x<470;x++){const i=(y*S+x)*4,r=base.data[i],g=base.data[i+1],b=base.data[i+2];if(r>65&&r<165&&Math.abs(g-r)<20&&b>=r)head.data[i+3]=0;}
// The hip pattern belongs to the torso; only the exposed lower leg extends.
for(let y=0;y<330;y++)layers.nearHind.data.fill(0,y*S*4,(y+1)*S*4);
for(let y=330;y<390;y++)for(let x=100;x<264;x++){const i=(y*S+x)*4;if(layers.nearHind.data[i]>145&&layers.nearHind.data[i+1]>143&&layers.nearHind.data[i+2]>155){layers.nearHind.data[i]=119;layers.nearHind.data[i+1]=117;layers.nearHind.data[i+2]=133;}}
for(const name of ['body','belly','nearHind','nearFront'])for(let y=280;y<400;y++)for(let x=200;x<490;x++){
 const i=(y*S+x)*4;if(head.data[i+3]>128)layers[name].data.fill(0,i,i+4);
}
for(const name of ['body','nearHind'])for(let y=280;y<405;y++)for(let x=90;x<190;x++){const i=(y*S+x)*4,r=layers[name].data[i],g=layers[name].data[i+1],b=layers[name].data[i+2];if(g-r>18||r-b>32)layers[name].data.fill(0,i,i+4);}
// Recover the complete original hip marking in one torso layer. The old cut
// split its lower left turn between the stationary body and moving leg.
const backEdge=[],backAnchors=[[280,215],[286,204],[300,180],[315,163],[330,152],[345,144],[360,137],[375,132],[390,125],[404,119]];
for(let y=280;y<=404;y++){
 let k=0;while(k<backAnchors.length-2&&y>backAnchors[k+1][0])k++;const A=backAnchors[k],B=backAnchors[k+1],edge=A[1]+(B[1]-A[1])*(y-A[0])/(B[0]-A[0]);backEdge[y]=edge;
 for(let x=0;x<Math.ceil(edge);x++)layers.body.data.fill(0,(y*S+x)*4,(y*S+x)*4+4);
 for(let x=Math.floor(edge);x<287;x++){const i=(y*S+x)*4;if(head.data[i+3]>=128)continue;const r=base.data[i],g=base.data[i+1],b=base.data[i+2];
  if(x<edge+9){layers.body.data.set([30,2,12,Math.round(Math.max(0,Math.min(1,x-edge+.5))*255)],i);}
  else if(y<390&&(y<375||x<204)&&r>=70&&Math.abs(g-r)<22&&b>=r&&b-r<46)base.data.copy(layers.body.data,i,i,i+4);
 }
 // Restore the original tail pixels up to the shared border, with a hidden
 // two-pixel overlap. No moving torso ink remains in the tail texture.
 for(let x=0;x<235;x++){const i=(y*S+x)*4;if(x<edge+2)base.data.copy(layers.tail.data,i,i,i+4);else layers.tail.data.fill(0,i,i+4);}
 for(let x=0;x<edge;x++)layers.nearHind.data.fill(0,(y*S+x)*4,(y*S+x)*4+4);
}
// Only the limb below the hip articulates; the complete swirl remains above.
for(let y=0;y<395;y++)layers.nearHind.data.fill(0,y*S*4,(y+1)*S*4);
// Clean the narrow inside edge of the hip, using nearby grey from the same
// height. The white marking is excluded from both sampling and replacement.
for(let y=355;y<405;y++){const edge=backEdge[y],colors=[[],[],[]];for(let yy=y-4;yy<=y+4;yy++)for(let x=Math.ceil(edge+15);x<edge+35;x++){const i=(yy*S+x)*4,r=base.data[i],g=base.data[i+1],b=base.data[i+2];if(r>95&&r<160&&Math.abs(r-g)<15&&b>=r&&b-r<30)for(let c=0;c<3;c++)colors[c].push(base.data[i+c]);}if(!colors[0].length)continue;const gray=colors.map(a=>a.sort((a,b)=>a-b)[a.length>>1]);for(const name of ['body','nearHind'])for(let x=Math.ceil(edge+8);x<edge+16;x++){const i=(y*S+x)*4;if(!layers[name].data[i+3]||layers[name].data[i]>175&&layers[name].data[i+1]>175)continue;const mix=Math.max(0,Math.min(1,x-(edge+8.5)));for(let c=0;c<3;c++)layers[name].data[i+c]=Math.round([30,2,12][c]*(1-mix)+gray[c]*mix);}}
fs.writeFileSync(`${root}/back-edge.json`,JSON.stringify(backEdge));
// Hidden overlap uses existing torso grey, preventing a seam under the mane.
for(let x=210;x<445;x++){let edge=-1;for(let y=280;y<401;y++)if(layers.body.data[(y*S+x)*4+3]>240&&head.data[((y-3)*S+x)*4+3]>100){edge=y;break;}if(edge<0)continue;const src=((edge+3)*S+x)*4;for(let y=edge-16;y<=edge;y++){const i=(y*S+x)*4;if(head.data[i+3]<10)continue;for(let c=0;c<3;c++)layers.body.data[i+c]=layers.body.data[src+c];layers.body.data[i+3]=255;}}
// The forward reach reveals the previously hidden join between torso pieces.
// Unite them and give the newly exposed underside one continuous contour.
for(let i=0;i<layers.body.data.length;i+=4){const a=layers.belly.data[i+3]/255;if(a)blend(layers.body,i,[layers.belly.data[i]*a,layers.belly.data[i+1]*a,layers.belly.data[i+2]*a,a]);}
layers.belly=new PNG({width:S,height:S});
const underside=[];for(let x=280;x<420;x++){let edge=0;for(let y=365;y<430;y++)if(layers.body.data[(y*S+x)*4+3]>=128)edge=y;underside[x]=edge;}
const original=Buffer.from(layers.body.data);for(let x=310;x<395;x++){const edge=underside[x];if(!edge)continue;let sum=0,count=0;for(let xx=x-9;xx<=x+9;xx++)if(underside[xx]){sum+=underside[xx];count++;}const t=Math.min(1,(x-310)/10,(395-x)/10),target=edge*(1-t)+sum/count*t,src=((edge-12)*S+x)*4;
 for(let y=Math.floor(Math.min(edge,target)-8);y<=Math.ceil(Math.max(edge,target)+1);y++){const i=(y*S+x)*4,a=Math.max(0,Math.min(1,target-y+.5)),ink=Math.max(0,Math.min(1,y-target+6.5));for(let c=0;c<3;c++)layers.body.data[i+c]=Math.round(original[src+c]*(1-ink)+[30,2,12][c]*ink);layers.body.data[i+3]=Math.round(a*255);}}
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const hipPattern=new Uint8Array(S*S);for(let y=310;y<395;y++)for(let x=130;x<280;x++){const i=(y*S+x)*4;if(layers.body.data[i]>170&&layers.body.data[i+1]>170&&layers.body.data[i+2]>180&&layers.body.data[i+3]>200)for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)hipPattern[(y+dy)*S+x+dx]=1;}
// Removing the mane exposes isolated antialiased bits of its former outline.
// Discard them in the torso source, before a front leg can appear behind them.
{const p=layers.body,seen=new Uint8Array(S*S);for(let n=0;n<seen.length;n++){if(seen[n]||p.data[n*4+3]<1)continue;const q=[n];seen[n]=1;for(let k=0;k<q.length;k++){const v=q[k],x=v%S,y=v>>9;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*S+xx;if(xx<0||xx>=S||yy<0||yy>=S||seen[j]||p.data[j*4+3]<1)continue;seen[j]=1;q.push(j);}}if(q.length<64)for(const v of q)p.data.fill(0,v*4,v*4+4);}}
if(process.argv.includes('--layers'))for(const [name,part]of Object.entries(layers))fs.writeFileSync(`${root}/review/source-${name}.png`,PNG.sync.write(part));
const keys=[{n:0,spread:0,drop:0,head:0,tilt:0},{n:2,spread:0,drop:0,head:-2,tilt:-1},{n:4,spread:0,drop:0,head:-3,tilt:-1.5},{n:6,spread:.1,drop:9,head:9,tilt:0},{n:8,spread:.42,drop:25,head:28,tilt:1.5},{n:11,spread:1,drop:48,head:61,tilt:4},{n:13,spread:1,drop:43,head:54,tilt:3},{n:16,spread:1,drop:46,head:58,tilt:4},{n:20,spread:1,drop:45,head:57,tilt:3.5},{n:23,spread:1,drop:45,head:57,tilt:3.5}];
function pose(n){let k=0;while(k<keys.length-2&&n>keys[k+1].n)k++;const a=keys[k],b=keys[k+1],t=smooth((n-a.n)/(b.n-a.n)),p={index:n,durationMs:30};for(const f of ['spread','drop','head','tilt'])p[f]=a[f]+(b[f]-a[f])*t;p.expression=n<2?'normal':n<4?'dazed':'defeat';p.phase=n<5?'dazed':n<12?'flop':n<20?'settle':'defeated';return p;}
function sample(p,x,y){const ix=Math.floor(x),iy=Math.floor(y),dx=x-ix,dy=y-iy,o=[0,0,0,0];for(const [ox,oy,w]of [[0,0,(1-dx)*(1-dy)],[1,0,dx*(1-dy)],[0,1,(1-dx)*dy],[1,1,dx*dy]]){const xx=ix+ox,yy=iy+oy;if(xx<0||yy<0||xx>=S||yy>=S)continue;const i=(yy*S+xx)*4,a=p.data[i+3]/255;o[3]+=w*a;for(let c=0;c<3;c++)o[c]+=w*a*p.data[i+c];}return o;}
function blend(p,i,v){const a=v[3];if(!a)return;const da=p.data[i+3]/255,oa=a+da*(1-a);for(let c=0;c<3;c++)p.data[i+c]=Math.round((v[c]+p.data[i+c]*da*(1-a))/oa);p.data[i+3]=Math.round(oa*255);}
const legs={nearHind:{start:365,end:420,x:-45,y:25},farHind:{start:337,end:425,x:-170,y:3},nearFront:{start:350,end:422,x:90,y:26},farFront:{start:340,end:420,x:33,y:7}};
function map(name,x,y,p){const t=p.spread;if(legs[name]){const d=legs[name],w=smooth((y-d.start)/(d.end-d.start)),bodyX=290+(x-290)*(1+.08*t)-8*t,px=bodyX*(1-w)+(x+d.x*t)*w,py=y+p.drop*(1-w)+d.y*t*w;
 if(name==='farHind'){const paw=smooth((y-385)/30);return[px+.15*t*paw*(x-247),py+.8*t*paw*(y-426)];}return[px,py];}if(name==='head'){const a=p.tilt*Math.PI/180,dx=x-350,dy=y-320;return[350+Math.cos(a)*dx-Math.sin(a)*dy-25*t,320+Math.sin(a)*dx+Math.cos(a)*dy+p.head];}if(name==='tail'){const w=1-smooth((y-180)/180);return[x-2*t*w,y+p.drop*.8];}return[290+(x-290)*(1+.08*t)-8*t,y+p.drop];}
function draw(out,name,p){if(name==='farHind'&&p.index>=9)return;let src=layers[name];if(name==='head'){src={data:Buffer.from(head.data)};for(let i=0;i<src.data.length;i+=4)for(let c=0;c<3;c++)src.data[i+c]=variants[p.expression].data[i+c];}
 const buf=new PNG({width:S,height:S}),sourceY=new Float32Array(S*S),sourceX=new Float32Array(S*S);
 function point(x,y){return [...map(name,x,y,p),x,y];}
 function tri(A,B,C){const den=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(den)<1e-5)return;const x0=Math.max(0,Math.floor(Math.min(A[0],B[0],C[0]))),x1=Math.min(511,Math.ceil(Math.max(A[0],B[0],C[0]))),y0=Math.max(0,Math.floor(Math.min(A[1],B[1],C[1]))),y1=Math.min(511,Math.ceil(Math.max(A[1],B[1],C[1])));for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const u=((B[1]-C[1])*(x-C[0])+(C[0]-B[0])*(y-C[1]))/den,v=((C[1]-A[1])*(x-C[0])+(A[0]-C[0])*(y-C[1]))/den,w=1-u-v;if(u<-.00001||v<-.00001||w<-.00001)continue;const sy=u*A[3]+v*B[3]+w*C[3],sx=u*A[2]+v*B[2]+w*C[2],value=sample(src,sx,sy);if(!value[3])continue;const i=(y*S+x)*4;sourceY[y*S+x]=sy;sourceX[y*S+x]=sx;for(let c=0;c<3;c++)buf.data[i+c]=Math.round(value[c]/value[3]);buf.data[i+3]=Math.round(value[3]*255);}}
 const box=name==='head'?[190,32,512,400]:name==='tail'?[0,60,225,405]:name==='nearHind'?[100,300,264,464]:name==='farHind'?[208,376,288,456]:name==='nearFront'?[248,364,368,476]:name==='farFront'?[360,340,460,460]:[100,270,472,424];
 for(let y=box[1];y<box[3];y+=4)for(let x=box[0];x<box[2];x+=4){const A=point(x,y),B=point(x+4,y),C=point(x+4,y+4),D=point(x,y+4);tri(A,B,C);tri(A,C,D);}
 reinkPart(buf,name,sourceX,sourceY);
 if(name==='body'||name==='nearHind'){out.rearMask??=new Uint8Array(S*S);for(let k=0;k<S*S;k++)if(k%S<265)out.rearMask[k]=Math.max(out.rearMask[k],buf.data[k*4+3]);}
 for(let i=0;i<buf.data.length;i+=4){const a=buf.data[i+3]/255;if(!a)continue;
  if(name==='nearHind'){const x=i/4%S,y=Math.floor(i/4/S),sx=290+(x+8*p.spread-290)/(1+.08*p.spread),sy=y-p.drop,under=sample(layers.body,sx,sy),whitePaw=buf.data[i]>150&&buf.data[i+1]>170&&buf.data[i+2]>170;if(sy<395&&under[3]>.95&&((under[0]/under[3]<65&&!whitePaw)||hipPattern[Math.round(sy)*S+Math.round(sx)]))continue;}
  blend(out,i,[buf.data[i]*a,buf.data[i+1]*a,buf.data[i+2]*a,a]);}
 if(process.argv.includes('--layers')&&p.index===23)fs.writeFileSync(`${root}/review/${name}.png`,PNG.sync.write(buf));
}

// Restore the original stroke weight after deformation, in final frame pixels.
// Open attachment cuts are excluded; only actual silhouette edges are inked.
function reinkPart(buf,name,sx,sy){
 const settings={nearHind:[0,10,399],nearFront:[4,11,382],farFront:[5,10,382],farHind:[4,9,398],body:[1,6,0]};
 if(!settings[name])return;const [outset,total,start]=settings[name],old=Buffer.from(buf.data),field=new Float32Array(S*S);field.fill(1000);
 const physical=(x,y,k)=>{if(name==='body'){const xx=sx[k],yy=sy[k];return (yy>365&&xx>200&&yy>(underside[Math.round(xx)]||420)-10)||(yy>350&&xx<155&&xx<(backEdge[Math.round(yy)]||0)+10);}if(sy[k]<start)return false;return true;};
 for(let y=1;y<S-1;y++)for(let x=1;x<S-1;x++){const k=y*S+x;if(old[k*4+3]<128||![k-1,k+1,k-S,k+S].some(j=>old[j*4+3]<128)||!physical(x,y,k))continue;
  const r=Math.ceil(Math.max(outset,total-outset)+1);for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=S||yy<0||yy>=S)continue;const j=yy*S+xx,d=Math.hypot(dx,dy);if(d<field[j])field[j]=d;}
 }
 for(let k=0;k<field.length;k++){const i=k*4,a=old[i+3]/255,d=field[k];if(d===1000)continue;
  const coverage=Math.max(0,Math.min(1,a>=.5?total-outset-.5-d:outset+.5-d));if(!coverage)continue;const oa=coverage+a*(1-coverage);for(let c=0;c<3;c++)buf.data[i+c]=Math.round(([30,2,12][c]*coverage+old[i+c]*a*(1-coverage))/oa);buf.data[i+3]=Math.round(oa*255);
 }
}

function seal(out){const visited=new Uint8Array(S*S);for(let k=0;k<S*S;k++){if(visited[k]||out.data[k*4+3]>=245)continue;const queue=[k],part=[],border=[];let exterior=false;visited[k]=1;for(let a=0;a<queue.length;a++){const v=queue[a],x=v%S,y=v>>9;part.push(v);if(!x||!y||x===511||y===511)exterior=true;for(const j of [x?v-1:-1,x<511?v+1:-1,y?v-S:-1,y<511?v+S:-1]){if(j<0)continue;if(out.data[j*4+3]>=245){border.push(j);continue;}if(!visited[j]){visited[j]=1;queue.push(j);}}}if(exterior||part.length>32)continue;for(const v of part){let best=Infinity,near=border[0];for(const j of border){const d=(v%S-j%S)**2+((v>>9)-(j>>9))**2;if(d<best){near=j;best=d;}}if(near!==undefined){for(let c=0;c<3;c++)out.data[v*4+c]=out.data[near*4+c];out.data[v*4+3]=255;}}}}
function connectRearStroke(out,p){
 const start=Math.round(map('body',145,345,p)[1]),end=Math.round(map('nearHind',125,430,p)[1]),edge=[];
 for(let y=start-10;y<=end+10;y++){for(let x=40;x<225;x++)if(out.rearMask[y*S+x]>=128){edge[y]=x-.5;break;}}
 const smoothEdge=y=>{let sum=0,count=0;for(let j=-7;j<=7;j++)if(edge[y+j]!==undefined){const w=8-Math.abs(j);sum+=edge[y+j]*w;count+=w;}return sum/count;},points=[];
 for(let y=start;y<=end;y++){if(edge[y]===undefined)continue;const left=smoothEdge(y),slope=(smoothEdge(y+1)-smoothEdge(y-1))/2,norm=Math.sqrt(1+slope*slope);points.push([left+5/norm,y-5*slope/norm]);}
 const field=new Float32Array(S*S);field.fill(1000);for(let n=1;n<points.length;n++){const A=points[n-1],B=points[n],dx=B[0]-A[0],dy=B[1]-A[1],len=dx*dx+dy*dy;for(let y=Math.floor(Math.min(A[1],B[1])-6);y<=Math.ceil(Math.max(A[1],B[1])+6);y++)for(let x=Math.floor(Math.min(A[0],B[0])-6);x<=Math.ceil(Math.max(A[0],B[0])+6);x++){const t=Math.max(0,Math.min(1,((x-A[0])*dx+(y-A[1])*dy)/(len||1))),d=Math.hypot(x-A[0]-t*dx,y-A[1]-t*dy),k=y*S+x;if(d<field[k])field[k]=d;}}
 for(let k=0;k<field.length;k++){const coverage=Math.max(0,Math.min(1,5.5-field[k]));if(coverage)blend(out,k*4,[30*coverage,2*coverage,12*coverage,coverage]);}
}
function closeManeJoin(out){const visited=new Uint8Array(S*S);for(let k=0;k<S*S;k++){if(visited[k]||out.data[k*4+3]>=128)continue;const q=[k],edge=[];visited[k]=1;let minY=512,maxY=0,exterior=false;for(let a=0;a<q.length;a++){const v=q[a],x=v%S,y=v>>9;minY=Math.min(minY,y);maxY=Math.max(maxY,y);if(!x||!y||x===511||y===511)exterior=true;for(const j of [x?v-1:-1,x<511?v+1:-1,y?v-S:-1,y<511?v+S:-1]){if(j<0)continue;if(out.data[j*4+3]>=128){const i=j*4,r=out.data[i],g=out.data[i+1],b=out.data[i+2];if(r>65&&r<170&&Math.abs(r-g)<20&&b>r)edge.push(j);continue;}if(!visited[j]){visited[j]=1;q.push(j);}}}if(exterior||q.length>512||minY<280||maxY>405||!edge.length)continue;for(const v of q){let near=edge[0],best=Infinity;for(const j of edge){const d=(j%S-v%S)**2+((j>>9)-(v>>9))**2;if(d<best){best=d;near=j;}}for(let c=0;c<3;c++)out.data[v*4+c]=out.data[near*4+c];out.data[v*4+3]=255;}}}
function removeSpecks(out){const seen=new Uint8Array(S*S);for(let k=0;k<S*S;k++){if(seen[k]||out.data[k*4+3]<8)continue;const q=[k];seen[k]=1;for(let a=0;a<q.length;a++){const v=q[a],x=v%S,y=v>>9;for(let yy=Math.max(0,y-1);yy<=Math.min(511,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(511,x+1);xx++){const j=yy*S+xx;if(!seen[j]&&out.data[j*4+3]>=8){seen[j]=1;q.push(j);}}}if(q.length<=8)for(const v of q)out.data.fill(0,v*4,v*4+4);}}
function closeRearGaps(out){const seen=new Uint8Array(S*S);for(let y=280;y<440;y++)for(let x=100;x<230;x++){const k=y*S+x;if(seen[k]||out.data[k*4+3]>=128)continue;const q=[k],border=[];seen[k]=1;let exterior=false;for(let a=0;a<q.length;a++){const v=q[a],xx=v%S,yy=v>>9;if(xx<=100||xx>=230||yy<=280||yy>=440)exterior=true;for(const j of [v-1,v+1,v-S,v+S]){if(j<0||j>=S*S)continue;if(out.data[j*4+3]>=128){border.push(j);continue;}if(!seen[j]){seen[j]=1;q.push(j);}}}if(exterior||q.length>64||!border.length)continue;for(const v of q){let closest=border[0],distance=Infinity;for(const j of border){const d=(v%S-j%S)**2+((v>>9)-(j>>9))**2;if(d<distance){distance=d;closest=j;}}for(let c=0;c<3;c++)out.data[v*4+c]=out.data[closest*4+c];out.data[v*4+3]=255;}}}
function closeFrontOutline(out,p){const [cx,cy]=map('head',429,369,p),x0=Math.floor(cx-10),x1=Math.ceil(cx+11),y0=Math.floor(cy-10),y1=Math.ceil(cy+13),disk=[];for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(dx*dx+dy*dy<=9)disk.push([dx,dy]);const old=Buffer.from(out.data),dilated=new Uint8Array(S*S);for(let y=y0-3;y<=y1+3;y++)for(let x=x0-3;x<=x1+3;x++){let a=0;for(const [dx,dy]of disk)a=Math.max(a,old[((y+dy)*S+x+dx)*4+3]);dilated[y*S+x]=a;}for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=(y*S+x)*4,alpha=old[i+3];if(alpha>=250)continue;let fill=255;for(const [dx,dy]of disk)fill=Math.min(fill,dilated[(y+dy)*S+x+dx]);if(fill<=alpha)continue;for(let c=0;c<3;c++)out.data[i+c]=Math.round((old[i+c]*alpha+[30,2,12][c]*(fill-alpha))/fill);out.data[i+3]=fill;}}
const plan=[];for(let n=0;n<24;n++){const p=pose(n),out=new PNG({width:S,height:S});for(const name of ['tail','farHind','farFront','body','belly','nearHind','nearFront','hip-cover','head'])draw(out,name,p);if(n===0)base.data.copy(out.data);else{closeManeJoin(out);seal(out);closeFrontOutline(out,p);removeSpecks(out);closeRearGaps(out);connectRearStroke(out,p);}fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(out));plan.push(p);}fs.writeFileSync(`${root}/frame-plan.json`,JSON.stringify({frames:plan,columns:6,rows:4,totalDurationMs:720,loop:false,holdLastFrame:true},null,2));
console.log('Rendered 24 stretched flop poses.');

