const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-transition-repair',p=PNG.sync.read(fs.readFileSync(`${root}/fixed.png`)),g=PNG.sync.read(fs.readFileSync(`${root}/generated-cleanup.png`)),base=PNG.sync.read(fs.readFileSync('images/cirruskit/cirruskit_base.png'));
const dark=(d,i)=>d[i]<80&&d[i+1]<60&&d[i+2]<80,fur=(d,i)=>d[i+3]>245&&!dark(d,i)&&d[i+2]>=d[i]-8;
function nearestFur(i,x,y){let pick=-1,dist=1e9;for(let yy=y-12;yy<=y+12;yy++)for(let xx=x-12;xx<=x+12;xx++){const q=(yy*512+xx)*4;if(!fur(base.data,q))continue;const d=[0,1,2].reduce((s,c)=>s+(base.data[q+c]-g.data[i+c])**2,0);if(d<dist){dist=d;pick=q;}}return pick;}
let repairs=0;for(let y=282;y<320;y++)for(let x=194;x<219;x++){const i=(y*512+x)*4;if(dark(p.data,i)&&p.data[i+3]>0&&fur(g.data,i)){const q=nearestFur(i,x,y);if(q>=0){(fur(base.data,i)?base:g).data.copy(p.data,i,i,i+4);repairs++;}}}
let filled=0;for(let y=389;y<404;y++)for(let x=428;x<444;x++){const i=(y*512+x)*4;if(p.data[i+3]<100&&g.data[i+3]>245&&dark(g.data,i)){p.data[i]=29;p.data[i+1]=0;p.data[i+2]=10;p.data[i+3]=254;filled++;}}
fs.writeFileSync(`${root}/final.png`,PNG.sync.write(p));(async()=>{await sharp(`${root}/final.png`).flatten({background:'#f3f1f7'}).png().toFile(`${root}/final-light.png`);await sharp(`${root}/final.png`).extract({left:185,top:245,width:315,height:190}).resize(1260,760,{kernel:'nearest'}).flatten({background:'#f3f1f7'}).png().toFile(`${root}/final-detail.png`);})();console.log({repairs,filled});


