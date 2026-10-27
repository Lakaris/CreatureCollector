const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-belly-separation',repairs=[];
for(let n=0;n<30;n++){
 const path=`${root}/frames/frame-${n}.png`,p=PNG.sync.read(fs.readFileSync(path)),seen=new Uint8Array(262144),holes=[];
 for(let start=0;start<262144;start++){
  if(seen[start]||p.data[start*4+3]>=128)continue;const todo=[start],part=[];let exterior=false;seen[start]=1;
  while(todo.length){const k=todo.pop(),x=k%512,y=k>>9;part.push(k);if(!x||x===511||!y||y===511)exterior=true;for(const [xx,yy]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(xx<0||xx>=512||yy<0||yy>=512)continue;const z=yy*512+xx;if(!seen[z]&&p.data[z*4+3]<128){seen[z]=1;todo.push(z);}}}
  if(!exterior&&part.length<=6&&part.every(k=>k%512>=350&&k%512<375&&(k>>9)>=410&&(k>>9)<425))holes.push(part);
 }
 for(const part of holes)for(const k of part){const i=k*4;p.data[i]=30;p.data[i+1]=2;p.data[i+2]=12;p.data[i+3]=255;}
 if(holes.length){fs.writeFileSync(path,PNG.sync.write(p));repairs.push({frame:n+1,pixels:holes.flat().length});}
}
fs.writeFileSync(`${root}/junction-repairs.json`,JSON.stringify(repairs,null,2)+'\n');console.log({subpixelJunctionRepairs:repairs});
