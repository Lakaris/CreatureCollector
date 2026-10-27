const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-flavor-two-frames',base=PNG.sync.read(fs.readFileSync('images/cirruskit/cirruskit_base.png'));
const headPolygon=[[220,-1],[512,-1],[512,310],[480,300],[451,308],[412,318],[365,319],[320,311],[278,300],[248,282],[230,259],[216,244],[214,212],[220,190]];
function inside(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const headMask=new Uint8Array(512*512),cream=new Uint8Array(512*512),nearCream=new Uint8Array(512*512),maneCore=new Uint8Array(512*512),maneMask=new Uint8Array(512*512);
for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,[r,g,b,a]=base.data.subarray(i,i+4);headMask[y*512+x]=inside(x,y,headPolygon);if(x>200&&y>238&&y<400&&a>0&&r>165&&g>145&&r-b>20&&g-b>12)cream[y*512+x]=1;}
for(let y=238;y<400;y++)for(let x=200;x<495;x++)if(cream[y*512+x])for(let oy=-10;oy<=10;oy++)for(let ox=-10;ox<=10;ox++){if(ox*ox+oy*oy>100)continue;const xx=x+ox,yy=y+oy;if(xx>=0&&xx<512&&yy>=0&&yy<512)nearCream[yy*512+xx]=1;}
for(let y=235;y<410;y++)for(let x=190;x<505;x++){const k=y*512+x,i=k*4,[r,g,b,a]=base.data.subarray(i,i+4);if(!headMask[k]&&a&&(cream[k]||(nearCream[k]&&r<88&&g<65&&b<90)))maneCore[k]=1;}
for(let y=235;y<410;y++)for(let x=190;x<505;x++)if(maneCore[y*512+x])for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)if(!headMask[(y+oy)*512+x+ox])maneMask[(y+oy)*512+x+ox]=1;
const layers={body:new PNG({width:512,height:512}),mane:new PNG({width:512,height:512}),head:new PNG({width:512,height:512})};
for(let y=0;y<512;y++)for(let x=0;x<512;x++){const k=y*512+x,i=k*4,name=headMask[k]?'head':maneMask[k]?'mane':'body';base.data.copy(layers[name].data,i,i,i+4);}
function paste(out,part,dx,dy){for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;if(!part.data[i+3])continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>=512||yy<0||yy>=512)continue;const j=(yy*512+xx)*4,sa=part.data[i+3]/255,da=out.data[j+3]/255,a=sa+da*(1-sa);if(part.data[i+3]>=245||da===0)part.data.copy(out.data,j,i,i+4);else{for(let c=0;c<3;c++)out.data[j+c]=Math.round((part.data[i+c]*sa+out.data[j+c]*da*(1-sa))/a);out.data[j+3]=Math.round(a*255);}}}
const out=new PNG({width:512,height:512});paste(out,layers.body,0,0);paste(out,layers.mane,0,18);paste(out,layers.head,0,28);
for(const [name,p]of Object.entries(layers))fs.writeFileSync(`${root}/${name}.png`,PNG.sync.write(p));fs.writeFileSync(`${root}/transition.png`,PNG.sync.write(out));
sharp(`${root}/transition.png`).flatten({background:'#f3f1f7'}).png().toFile(`${root}/transition-light.png`);
console.log('Prepared a crisp head-down pose using the original pixels.');


