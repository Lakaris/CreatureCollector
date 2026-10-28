const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-defeat',S=512,read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png'),body=read('work/cirruskit-transition-repair/fixed-body.png'),head=read('work/cirruskit-transition-repair/fixed-head-mane.png'),variants=Object.fromEntries(['normal','dazed','defeat'].map(n=>[n,read(`${root}/inputs/${n}.png`)]));
// Extend the hidden torso beneath the mane so a tiny head tilt cannot expose
// the original layer cut. The existing grey shadow supplies the hidden fill.
for(let x=210;x<445;x++){
 let edge=-1;for(let y=280;y<401;y++){if(body.data[(y*S+x)*4+3]>240&&head.data[((y-3)*S+x)*4+3]>100){edge=y;break;}}
 if(edge<0)continue;
 const src=((edge+3)*S+x)*4;
 for(let y=edge-16;y<=edge;y++){const i=(y*S+x)*4;if(head.data[i+3]<10)continue;for(let c=0;c<3;c++)body.data[i+c]=body.data[src+c];body.data[i+3]=255;}
}
const keys=[{n:0,body:0,head:0,angle:0},{n:2,body:0,head:-2,angle:-1},{n:4,body:0,head:-4,angle:-2},{n:6,body:10,head:10,angle:-3},{n:8,body:36,head:41,angle:-5},{n:11,body:64,head:74,angle:-8},{n:13,body:57,head:64,angle:-6},{n:16,body:61,head:69,angle:-7.4},{n:20,body:60,head:68,angle:-7},{n:23,body:60,head:68,angle:-7}];
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
function pose(n){let k=0;while(k<keys.length-2&&n>keys[k+1].n)k++;const A=keys[k],B=keys[k+1],t=smooth((n-A.n)/(B.n-A.n)),p={index:n,durationMs:30};for(const field of ['body','head','angle'])p[field]=A[field]+(B[field]-A[field])*t;p.expression=n<2?'normal':n<4?'dazed':'defeat';p.phase=n<5?'dazed':n<12?'flop':n<20?'settle':'defeated';return p;}
function sample(p,x,y){const ix=Math.floor(x),iy=Math.floor(y),dx=x-ix,dy=y-iy,o=[0,0,0,0];for(const [ox,oy,w]of [[0,0,(1-dx)*(1-dy)],[1,0,dx*(1-dy)],[0,1,(1-dx)*dy],[1,1,dx*dy]]){const xx=ix+ox,yy=iy+oy;if(xx<0||yy<0||xx>=S||yy>=S)continue;const i=(yy*S+xx)*4,a=p.data[i+3]/255;o[3]+=w*a;for(let c=0;c<3;c++)o[c]+=w*a*p.data[i+c];}return o;}
function blend(p,i,v){const a=v[3];if(!a)return;const da=p.data[i+3]/255;if(a>=.98||!da){for(let c=0;c<3;c++)p.data[i+c]=Math.round(v[c]/a);p.data[i+3]=Math.round(a*255);}else{const oa=a+da*(1-a);for(let c=0;c<3;c++)p.data[i+c]=Math.round((v[c]+p.data[i+c]*da*(1-a))/oa);p.data[i+3]=Math.round(oa*255);}}
function bodySourceY(y,d){const source=[0,330,390,422,466,512],dest=[d,330+d,390+d*.65,422+d*.4,466,512];let k=0;while(k<source.length-2&&y>dest[k+1])k++;return source[k]+(y-dest[k])*(source[k+1]-source[k])/(dest[k+1]-dest[k]);}
function render(p){const out=new PNG({width:S,height:S});
 for(let y=0;y<S;y++){const sy=bodySourceY(y,p.body);for(let x=0;x<S;x++)blend(out,(y*S+x)*4,sample(body,x,sy));}
 // Preserve the weight of the exposed paw contours as the legs fold under.
 if(p.body>1){const d=new Float32Array(S*S),diag=Math.SQRT2;for(let k=0;k<d.length;k++)d[k]=out.data[k*4+3]>=128?1000:0;for(let y=1;y<S;y++)for(let x=1;x<S-1;x++){const k=y*S+x;d[k]=Math.min(d[k],d[k-1]+1,d[k-S]+1,d[k-S-1]+diag,d[k-S+1]+diag);}for(let y=S-2;y>=0;y--)for(let x=S-2;x>0;x--){const k=y*S+x;d[k]=Math.min(d[k],d[k+1]+1,d[k+S]+1,d[k+S-1]+diag,d[k+S+1]+diag);}for(let y=420;y<480;y++)for(let x=90;x<470;x++){const k=y*S+x,i=k*4;if(!out.data[i+3]||bodySourceY(y,p.body)<410)continue;const a=Math.max(0,Math.min(1,5-d[k]))*Math.min(1,p.body/25);for(let c=0;c<3;c++)out.data[i+c]=Math.round(out.data[i+c]*(1-a)+[30,2,12][c]*a);}}
 const h={data:Buffer.from(head.data)},color=variants[p.expression];for(let i=0;i<h.data.length;i+=4)for(let c=0;c<3;c++)h.data[i+c]=color.data[i+c];
 const a=p.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=x-350,dy=y-320-p.head,sx=350+c*dx+s*dy,sy=320-s*dx+c*dy;blend(out,(y*S+x)*4,sample(h,sx,sy));}
 if(p.index===0)base.data.copy(out.data);return out;
}
const plan=[];for(let n=0;n<24;n++){const p=pose(n);fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(render(p)));plan.push(p);}
fs.writeFileSync(`${root}/frame-plan.json`,JSON.stringify({frames:plan,columns:6,rows:4,totalDurationMs:720,loop:false,holdLastFrame:true},null,2));
console.log('Rendered 24 defeat frames.');
