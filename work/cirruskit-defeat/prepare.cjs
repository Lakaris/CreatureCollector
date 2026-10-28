const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-defeat',read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png'),gen=read(`${root}/inputs/expression-512.png`);
const specs={left:{box:[297,184,381,263],dx:2,dy:0},right:{box:[420,183,474,256],dx:7,dy:0},mouth:{box:[363,254,451,304],dx:12,dy:0}};
function patch(out,name){const {box:[x0,y0,x1,y1],dx,dy}=specs[name],deltas=[[],[],[]];
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*512+x)*4,j=((y-dy)*512+x-dx)*4;if(Math.min(x-x0,x1-1-x,y-y0,y1-1-y)>4)continue;if(base.data[i]>75&&base.data[i]<170&&gen.data[j]>75&&gen.data[j]<170)for(let c=0;c<3;c++)deltas[c].push(base.data[i+c]-gen.data[j+c]);}
 const offset=deltas.map(a=>a.sort((a,b)=>a-b)[a.length>>1]||0);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
  const i=(y*512+x)*4;let j=((y-dy)*512+x-dx)*4;
  if(base.data[i]>base.data[i+1]*1.35&&base.data[i+1]>base.data[i+2]*1.3)continue;
  if(gen.data[j]>gen.data[j+1]*1.35&&gen.data[j+1]>gen.data[j+2]*1.3)j-=30*512*4;
  if(name==='right'&&x>462&&y<202)continue;
  if(name!=='mouth'&&y<194&&base.data[i]>180&&base.data[i+1]>180)continue;
  if(name!=='mouth'&&y<200&&gen.data[j]>180&&gen.data[j+1]>180)continue;
  const left=name==='mouth'?x0+Math.max(0,y-278)*.5:x0,right=name==='mouth'?x1-1-Math.max(0,y-276)*.8:x1-1,edge=Math.min(x-left,right-x,y-y0,y1-1-y),w=Math.max(0,Math.min(1,edge/3));if(!w)continue;
  for(let c=0;c<3;c++){const v=gen.data[j]<65&&gen.data[j+1]<50?gen.data[j+c]:Math.max(0,Math.min(255,gen.data[j+c]+offset[c]));out.data[i+c]=Math.round(base.data[i+c]*(1-w)+v*w);}
 }
}
for(const [name,parts]of [['normal',[]],['dazed',['left','right']],['defeat',['left','right','mouth']]]){const out=new PNG({width:512,height:512});base.data.copy(out.data);for(const p of parts)patch(out,p);fs.writeFileSync(`${root}/inputs/${name}.png`,PNG.sync.write(out));}
fs.writeFileSync(`${root}/expression-patches.json`,JSON.stringify(specs,null,2));
