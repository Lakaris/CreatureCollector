const fs=require('fs');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const base=PNG.sync.read(fs.readFileSync('images/cirruskit/cirruskit_base.png'));
const FRAMES=30, size=512;
const smooth=(a,b,t)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x);};
// Find the transparent separation between the tail and body. Any connected
// root remains fixed because tail displacement tapers to zero above it.
function guide(y){return y<220?220:y<270?220-(y-220)*.5:195-(y-270)*1.125;}
const lo=120,hi=245,width=hi-lo+1,lastRow=310;
let previous=new Float64Array(width),paths=[];
for(let y=0;y<=lastRow;y++){
  const next=new Float64Array(width),parent=new Int16Array(width);
  for(let j=0;j<width;j++){
    const x=j+lo,a=base.data[(y*size+x)*4+3]/255;
    const own=a*150+Math.abs(x-guide(y))*.035;
    if(y===0){next[j]=own;continue;}
    let best=Infinity,bestJ=j;
    for(let k=Math.max(0,j-4);k<=Math.min(width-1,j+4);k++){
      const score=previous[k]+Math.abs(k-j)*.2;
      if(score<best){best=score;bestJ=k;}
    }
    next[j]=best+own;parent[j]=bestJ;
  }
  paths.push(parent);previous=next;
}
let j=Array.from(previous).indexOf(Math.min(...previous));
const seam=new Int16Array(size).fill(155);
for(let y=lastRow;y>=0;y--){seam[y]=j+lo;j=paths[y][j];}
const isTail=(x,y)=>x<seam[y];
function sample(x,y,tailLayer){
  const ix=Math.floor(x),iy=Math.floor(y),dx=x-ix,dy=y-iy,out=[0,0,0,0];
  for(const [ox,oy,w] of [[0,0,(1-dx)*(1-dy)],[1,0,dx*(1-dy)],[0,1,(1-dx)*dy],[1,1,dx*dy]]){
    const xx=ix+ox,yy=iy+oy;if(xx<0||yy<0||xx>=size||yy>=size||isTail(xx,yy)!==tailLayer)continue;
    const i=(yy*size+xx)*4,a=base.data[i+3]/255;out[3]+=w*a;
    for(let c=0;c<3;c++)out[c]+=w*a*base.data[i+c];
  }
  return out;
}
function bodyOffset(x,y,breath){const body=smooth(155,245,x),planted=1-smooth(350,425,y);return [breath*(x-335)*.008*Math.exp(-Math.pow((y-325)/90,2))*body*planted,-breath*6*body*planted];}
for(let n=0;n<FRAMES;n++){
  const frame=new PNG({width:size,height:size}),angle=2*Math.PI*n/FRAMES,breath=(1-Math.cos(angle))/2,swish=Math.sin(angle);
  if(n===0)base.data.copy(frame.data);
  else for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    // The entire tail cross-section receives the same shift: no horizontal
    // pinching, no iterative inversion of a steep tail mask, no duplicated rim.
    const tx=x-10*swish*(1-smooth(175,310,y));
    const tail=sample(tx,y,true);
    let sx=x,sy=y;for(let k=0;k<5;k++){const [dx,dy]=bodyOffset(sx,sy,breath);sx=x-dx;sy=y-dy;}
    const body=sample(sx,sy,false),a=body[3]+tail[3]*(1-body[3]),i=(y*size+x)*4;
    if(a){for(let c=0;c<3;c++)frame.data[i+c]=Math.round((body[c]+tail[c]*(1-body[3]))/a);frame.data[i+3]=Math.round(a*255);}
  }
  fs.writeFileSync(`work/cirruskit-idle/frame-${n}.png`,PNG.sync.write(frame));
}
for(const [name,tailLayer]of [['tail-layer',true],['body-layer',false]]){let p=new PNG({width:size,height:size});for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(isTail(x,y)===tailLayer){let i=(y*size+x)*4;base.data.copy(p.data,i,i,i+4);}fs.writeFileSync(`work/cirruskit-idle/${name}.png`,PNG.sync.write(p));}
fs.writeFileSync('work/cirruskit-idle/tail-seam.json',JSON.stringify(Array.from(seam)));
console.log('Rendered 30 frames with separate tail/body layers and uniform row-wise tail displacement.');
