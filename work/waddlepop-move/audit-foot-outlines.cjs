const fs=require('fs'),assert=require('assert');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-move',report=JSON.parse(fs.readFileSync(root+'/audit.json'));
const stencils=[];for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++)if(dx*dx+dy*dy<=36)stencils.push([dx,dy,dx*dx+dy*dy]);
const checks=[];
for(let n=0;n<24;n++){
 const im=PNG.sync.read(fs.readFileSync(`${root}/frames/frame-${String(n+1).padStart(2,'0')}.png`)),dist=new Float32Array(512*512).fill(Infinity);
 for(let y=430;y<500;y++)for(let x=130;x<385;x++){
  const k=(y*512+x)*4,[r,g,b,a]=im.data.subarray(k,k+4);
  if(a<200||r<140||g<50||b>110||r<b*1.8)continue;
  for(const [dx,dy,d2]of stencils){const j=(y+dy)*512+x+dx;dist[j]=Math.min(dist[j],d2);}
 }
 let checked=0,minAlpha=255,maxChannel=0;const failures=[];
 for(let y=420;y<506;y++)for(let x=125;x<390;x++){
  const j=y*512+x;if(dist[j]<6.25||dist[j]>23.04)continue;
  const k=j*4,a=im.data[k+3],v=Math.max(...im.data.subarray(k,k+3));
  checked++;minAlpha=Math.min(minAlpha,a);maxChannel=Math.max(maxChannel,v);
  if(a<250||v>55)failures.push({x,y,rgba:[...im.data.subarray(k,k+4)],distance:Math.sqrt(dist[j])});
 }
 checks.push({frame:n+1,outlinePixelsChecked:checked,minAlpha,maxColorChannel:maxChannel,failures:failures.length});
 assert(checked>500,'Too few foot contour samples: '+checked);
 assert.equal(failures.length,0,`Thin/gapped contour in frame ${n+1}: ${JSON.stringify(failures.slice(0,10))}`);
}
report.footOutlineChecks=checks;
report.completeThickFootOutlinesEveryFrame=true;
fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({frames:24,continuousThickFootOutlines:true,opaqueDarkPixelsChecked:checks.reduce((s,c)=>s+c.outlinePixelsChecked,0),gaps:0}));
