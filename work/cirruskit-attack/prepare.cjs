const fs=require('fs'),crypto=require('crypto'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack',dir='images/cirruskit',read=p=>PNG.sync.read(fs.readFileSync(p)),base=read(`${dir}/cirruskit_base.png`),gen=read(`${root}/inputs/expression-512.png`);
const protectedFiles=fs.readdirSync(dir).filter(f=>!f.startsWith('cirruskit_attack'));
if(!fs.existsSync(`${root}/protected-hashes.json`))fs.writeFileSync(`${root}/protected-hashes.json`,JSON.stringify(Object.fromEntries(protectedFiles.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(`${dir}/${f}`)).digest('hex')])),null,2));
const patches={left:[297,184,381,263],right:[420,183,472,256],mouth:[363,254,445,306]};
function sample(x,y){x=Math.max(0,Math.min(511,x));y=Math.max(0,Math.min(511,y));const ix=Math.floor(x),iy=Math.floor(y),dx=x-ix,dy=y-iy,o=[0,0,0];for(const [ox,oy,w]of [[0,0,(1-dx)*(1-dy)],[1,0,dx*(1-dy)],[0,1,(1-dx)*dy],[1,1,dx*dy]]){const i=(Math.min(511,iy+oy)*512+Math.min(511,ix+ox))*4;for(let c=0;c<3;c++)o[c]+=gen.data[i+c]*w;}return o;}
function patch(out,name,height=1){const [x0,y0,x1,y1]=patches[name],bottom=y0+(y1-y0)*height;
 const deltas=[[],[],[]];for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*512+x)*4;if(Math.min(x-x0,x1-1-x,y-y0,y1-1-y)>4)continue;if(base.data[i]>75&&base.data[i]<170&&gen.data[i]>75&&gen.data[i]<170)for(let c=0;c<3;c++)deltas[c].push(base.data[i+c]-gen.data[i+c]);}
 const offset=deltas.map(a=>a.sort((a,b)=>a-b)[a.length>>1]||0);
 for(let y=y0;y<Math.ceil(bottom);y++)for(let x=x0;x<x1;x++){
  const i=(y*512+x)*4;if(name==='mouth'&&base.data[i]>base.data[i+1]*1.35&&base.data[i+1]>base.data[i+2]*1.3)continue;
  const sy=y0+(y-y0)/height,left=name==='mouth'?x0+Math.max(0,sy-276)*.4:x0,right=name==='mouth'?x1-1-Math.max(0,sy-272)*.9:x1-1,edge=Math.min(x-left,right-x,(y-y0)/height,(bottom-1-y)/height),w=Math.max(0,Math.min(1,edge/3));if(!w)continue;
  const color=sample(x,sy);for(let c=0;c<3;c++){const v=color[0]<65&&color[1]<50?color[c]:Math.max(0,Math.min(255,color[c]+offset[c]));out.data[i+c]=Math.round(base.data[i+c]*(1-w)+v*w);}
 }
}
const variants={normal:{eyes:false,mouth:0},focused:{eyes:true,mouth:0},half:{eyes:true,mouth:.70},attack:{eyes:true,mouth:1}};
for(const [name,def]of Object.entries(variants)){const p=new PNG({width:512,height:512});base.data.copy(p.data);if(def.eyes){patch(p,'left');patch(p,'right');}if(def.mouth)patch(p,'mouth',def.mouth);fs.writeFileSync(`${root}/inputs/${name}.png`,PNG.sync.write(p));}
fs.writeFileSync(`${root}/expression-patches.json`,JSON.stringify(patches,null,2));
(async()=>{const tiles=await Promise.all(Object.keys(variants).map(name=>sharp(`${root}/inputs/${name}.png`).resize(320,320).flatten({background:'#f1edf4'}).png().toBuffer()));await sharp({create:{width:1280,height:320,channels:4,background:'#f1edf4'}}).composite(tiles.map((input,i)=>({input,left:i*320,top:0}))).png().toFile(`${root}/expressions.png`);})();
