const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack-paw-alignment',read=p=>PNG.sync.read(fs.readFileSync(p)),sheet=read(`${root}/before/cirruskit_attack.png`),report=[];
for(let n=0;n<25;n++){
 const old=read(`work/cirruskit-attack-outline-repair/frames/frame-${n}.png`),rendered=read(`${root}/rendered/frame-${n}.png`),out=new PNG({width:512,height:512});
 for(let y=0;y<512;y++){const j=((Math.floor(n/5)*512+y)*sheet.width+n%5*512)*4;sheet.data.copy(out.data,y*2048,j,j+2048);}
 let count=0,x0=512,y0=512,x1=0,y1=0;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4;if(rendered.data.subarray(i,i+4).equals(old.data.subarray(i,i+4)))continue;assert(x<260&&y>260&&y<480,`Unrelated change in ${n+1}: ${x},${y}`);rendered.data.copy(out.data,i,i,i+4);count++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(out));report.push({frame:n+1,changedPixels:count,bounds:count?[x0,y0,x1,y1]:null});
}
fs.writeFileSync(`${root}/changes.json`,JSON.stringify(report,null,2));console.log(report);
