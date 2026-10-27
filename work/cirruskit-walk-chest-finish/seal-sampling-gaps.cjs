const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-chest-finish',repairs=[];
for(let n=0;n<30;n++){
 const path=`${root}/frames/frame-${n}.png`,p=PNG.sync.read(fs.readFileSync(path)),seen=new Uint8Array(262144),stack=[0];seen[0]=1;
 while(stack.length){const k=stack.pop(),x=k%512,y=k>>9;for(const [xx,yy]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(xx<0||xx>=512||yy<0||yy>=512)continue;const j=yy*512+xx;if(!seen[j]&&p.data[j*4+3]<128){seen[j]=1;stack.push(j);}}}
 const fixes=[];
 for(let y=370;y<400;y++)for(let x=115;x<145;x++){
   const i=(y*512+x)*4;if(p.data[i+3]>=128||seen[y*512+x])continue;
   const neighbors=[];for(let yy=y-2;yy<=y+2;yy++)for(let xx=x-2;xx<=x+2;xx++){const j=(yy*512+xx)*4;if(p.data[j+3]>=245&&p.data[j]<70&&p.data[j+1]<55&&p.data[j+2]<70)neighbors.push([p.data[j],p.data[j+1],p.data[j+2]]);}
   assert(neighbors.length>=4,'Unexpected hole outside the outline seam');
   const color=[0,1,2].map(c=>neighbors.map(a=>a[c]).sort((a,b)=>a-b)[Math.floor(neighbors.length/2)]);
   fixes.push({x,y,color});
 }
 assert(fixes.length<=4,'Unexpectedly large seam defect');
 for(const {x,y,color}of fixes){const i=(y*512+x)*4;for(let c=0;c<3;c++)p.data[i+c]=color[c];p.data[i+3]=255;}
 if(fixes.length){fs.writeFileSync(path,PNG.sync.write(p));repairs.push({frame:n+1,fixes});}
}
fs.writeFileSync(`${root}/sampling-gap-repairs.json`,JSON.stringify(repairs,null,2)+'\n');console.log({framesRepaired:repairs.length,pixels:repairs.reduce((s,r)=>s+r.fixes.length,0)});
