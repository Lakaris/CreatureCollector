const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-flavor-crisp',src=PNG.sync.read(fs.readFileSync('work/cirruskit-flavor-smooth/source/frame-2.png'));
for(let i=3;i<src.data.length;i+=4){if(src.data[i]>=245)src.data[i]=255;else if(src.data[i]<3)src.data.fill(0,i-3,i+1);}
fs.writeFileSync(`${root}/crouch-source.png`,PNG.sync.write(src));
const layers={tail:new PNG({width:512,height:512}),body:new PNG({width:512,height:512}),paw:new PNG({width:512,height:512}),guard:new PNG({width:512,height:512})};
const cream=new Uint8Array(512*512),guard=new Uint8Array(512*512);
for(let y=240;y<430;y++)for(let x=210;x<490;x++){const i=(y*512+x)*4,[r,g,b,a]=src.data.subarray(i,i+4);if(a>30&&r>160&&g>140&&r-b>20&&g-b>12)cream[y*512+x]=1;}
for(let y=240;y<430;y++)for(let x=210;x<490;x++)if(cream[y*512+x])for(let oy=-6;oy<=6;oy++)for(let ox=-6;ox<=6;ox++){if(ox*ox+oy*oy>36)continue;const xx=x+ox,yy=y+oy;if(xx>=0&&yy>=0&&xx<512&&yy<512)guard[yy*512+xx]=1;}
function guide(y){return y<160?280:y<250?280-(y-160)*.77:y<310?211-(y-250)*.94:155-(y-310)*.58;}
const lo=105,hi=300,width=hi-lo+1,last=370,paths=[];let previous=new Float64Array(width);
for(let y=0;y<=last;y++){const next=new Float64Array(width),parent=new Int16Array(width);for(let j=0;j<width;j++){const x=j+lo,alpha=src.data[(y*512+x)*4+3]/255,own=alpha*150+Math.abs(x-guide(y))*.06;if(y===0){next[j]=own;continue;}let best=Infinity,kBest=j;for(let k=Math.max(0,j-5);k<=Math.min(width-1,j+5);k++){const cost=previous[k]+Math.abs(k-j)*.1;if(cost<best){best=cost;kBest=k;}}next[j]=own+best;parent[j]=kBest;}paths.push(parent);previous=next;}
const seam=new Int16Array(512);let j=Array.from(previous).indexOf(Math.min(...previous));for(let y=last;y>=0;y--){seam[y]=j+lo;j=paths[y][j];}
for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;let name='body';if(y<=last&&x<seam[y])name='tail';else if(x>=378&&x<=480&&y>=390&&y>=430-.55*(x-380)&&!guard[y*512+x])name='paw';else if(guard[y*512+x])name='guard';src.data.copy(layers[name].data,i,i,i+4);}
for(const [name,p]of Object.entries(layers))fs.writeFileSync(`${root}/${name}.png`,PNG.sync.write(p));
function paste(dst,part,dx=0,dy=0){for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;if(!part.data[i+3])continue;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=512||yy>=512)continue;const k=(yy*512+xx)*4,sa=part.data[i+3]/255,da=dst.data[k+3]/255,a=sa+da*(1-sa);if(sa===1||!da)part.data.copy(dst.data,k,i,i+4);else{for(let c=0;c<3;c++)dst.data[k+c]=Math.round((part.data[i+c]*sa+dst.data[k+c]*da*(1-sa))/a);dst.data[k+3]=Math.round(a*255);}}}
function pose(tailX,pawX,pawY){const out=new PNG({width:512,height:512});paste(out,layers.tail,tailX,0);paste(out,layers.body);paste(out,layers.paw,pawX,pawY);paste(out,layers.guard);return out;}
if(!pose(0,0,0).data.equals(src.data))throw Error('Layer separation changed the source');
fs.writeFileSync(`${root}/raised.png`,PNG.sync.write(pose(6,6,-14)));fs.writeFileSync(`${root}/reach.png`,PNG.sync.write(pose(6,8,0)));
module.exports={pose,paste,layers,source:src};
console.log('Exact source reconstruction verified; created rigid tail/paw layers.');
