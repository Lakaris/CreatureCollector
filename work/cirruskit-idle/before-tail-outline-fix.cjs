const fs = require('fs');
const { PNG } = require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const base = PNG.sync.read(fs.readFileSync('images/cirruskit/cirruskit_base.png'));
const FRAMES = 30;
const smooth = (a, b, value) => { const x = Math.max(0, Math.min(1, (value-a)/(b-a))); return x*x*(3-2*x); };
// Sample one periodic cycle at n / FRAMES; do not include the duplicate endpoint.
function offset(x, y, phase) {
  const angle = 2 * Math.PI * phase;
  const breath = (1 - Math.cos(angle)) / 2;
  const swish = Math.sin(angle);
  const body = smooth(155,245,x), planted = 1-smooth(350,425,y);
  const tail = (1-smooth(205,220,x))*(1-smooth(175,310,y));
  return [breath*(x-335)*.008*Math.exp(-Math.pow((y-325)/90,2))*body*planted+10*swish*tail,
    -breath*6*body*planted+.8*swish*tail];
}
function sample(x,y) {
  const ix=Math.floor(x), iy=Math.floor(y), dx=x-ix, dy=y-iy;
  const out=[0,0,0,0];
  for (const [ox,oy,w] of [[0,0,(1-dx)*(1-dy)],[1,0,dx*(1-dy)],[0,1,(1-dx)*dy],[1,1,dx*dy]]) {
    const xx=ix+ox,yy=iy+oy;
    if(xx<0||yy<0||xx>=512||yy>=512)continue;
    const i=(yy*512+xx)*4, alpha=base.data[i+3]/255;
    out[3]+=w*alpha;
    for(let c=0;c<3;c++)out[c]+=w*alpha*base.data[i+c];
  }
  return out[3] ? out.slice(0,3).map(v=>Math.round(v/out[3])).concat(Math.round(out[3]*255)) : [0,0,0,0];
}
for(let n=0;n<FRAMES;n++) {
  const frame=new PNG({width:512,height:512});
  if(n===0)base.data.copy(frame.data);
  else for(let y=0;y<512;y++)for(let x=0;x<512;x++) {
    let sx=x,sy=y;
    for(let iteration=0;iteration<5;iteration++){const [dx,dy]=offset(sx,sy,n/FRAMES);sx=x-dx;sy=y-dy;}
    const color=sample(sx,sy), i=(y*512+x)*4;
    for(let c=0;c<4;c++)frame.data[i+c]=color[c];
  }
  fs.writeFileSync(`work/cirruskit-idle/frame-${n}.png`, PNG.sync.write(frame));
}
console.log('Rendered 30 periodic idle frames from the approved base: 6px breathing, 10px tail sway.');
