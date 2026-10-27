const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-seam-repair',read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png');
const names=['body','hip-cover','nearHind','farFront'],layers=Object.fromEntries(names.map(n=>[n,read(`work/cirruskit-walk-cleanup/layers/${n}.png`)]));
const dark=(p,x,y)=>{const i=(y*512+x)*4;return p.data[i+3]>160&&p.data[i]<70&&p.data[i+1]<55&&p.data[i+2]<70;};
const leg=new PNG({width:512,height:512}),boundaries=[];
for(let y=310;y<466;y++){
 let left=95,right=224;
 if(y<404){for(let x=100;x<230;x++){const i=(y*512+x)*4;if(base.data[i+3]>240&&base.data[i]>70&&base.data[i]<170&&base.data[i+1]-base.data[i]<10&&base.data[i+2]-base.data[i]<30){left=x-11;break;}}}
 if(y<365)right=260;
 else if(y<379)right=240-(y-365);
 else if(y<429){
   for(let x=190;x<228;x++)if(dark(base,x,y)){let end=x;while(end<x+11&&dark(base,end,y))end++;right=end+1;break;}
 }else right=214;
 for(let x=left;x<right;x++){
   const i=(y*512+x)*4;base.data.copy(leg.data,i,i,i+4);
   if(y<400)layers['hip-cover'].data.fill(0,i,i+4);
 }
 boundaries.push({y,left,right});
}
layers.nearHind=leg;
const far=layers.farFront,old=Buffer.from(far.data);
for(let y=366;y<400;y++){
 const t=Math.max(0,Math.min(1,(400-y)/15)),dx=4*t*t*(3-2*t);
 for(let x=400;x<452;x++){
   const sx=x-dx*Math.max(0,Math.min(1,(x-400)/20)),x0=Math.floor(sx),f=sx-x0,i=(y*512+x)*4,j=(y*512+x0)*4;
   for(let c=0;c<4;c++)far.data[i+c]=Math.round(old[j+c]*(1-f)+old[j+4+c]*f);
 }
}
for(const [name,p]of Object.entries(layers))fs.writeFileSync(`${root}/layers/${name}.png`,PNG.sync.write(p));
fs.writeFileSync(`${root}/boundaries.json`,JSON.stringify(boundaries,null,2));
let build=fs.readFileSync('work/cirruskit-walk-cleanup/build.cjs','utf8').replace("root='work/cirruskit-walk-cleanup'","root='work/cirruskit-walk-seam-repair'").replace('for(let y=330;y<485;y++)','for(let y=300;y<485;y++)').replace("const rootY=name==='nearHind'?371:366;","const rootY=name==='nearHind'?365:380;").replace('1-smooth(rootY,400,sy)','1-smooth(rootY,410,sy)');
build=build.replace('function draw(out,name,pose)', 'let chestEdges;\nfunction draw(out,name,pose)');
build=build.replace('const sy=y-pose.bob,sx=', "if(name==='body'&&y-pose.bob>=373&&y-pose.bob<=400&&chestEdges&&x>=chestEdges[y]-2&&x>410)continue;const sy=y-pose.bob,sx=");
build=build.replace('const out=new PNG({width:S,height:S});for(const name', "const chest=new PNG({width:S,height:S});draw(chest,'farFront',pose);chestEdges=Array.from({length:S},(_,y)=>{let edge=512;for(let x=410;x<480;x++)if(chest.data[(y*S+x)*4+3]>=128)edge=x;return edge;});const out=new PNG({width:S,height:S});for(const name");
fs.writeFileSync(`${root}/build.cjs`,build);
