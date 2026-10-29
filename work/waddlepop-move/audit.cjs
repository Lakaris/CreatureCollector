const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-move',read=p=>PNG.sync.read(fs.readFileSync(p));
const report=JSON.parse(fs.readFileSync(root+'/audit.json')),poses=JSON.parse(fs.readFileSync(root+'/poses.json'));
function transform(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx)-s*(y-p.cy)+p.x,p.cy+s*(x-p.cx)+c*(y-p.cy)+p.y];}
let largestUnexpected=0;const attachmentChecks=[],frames=[];
for(let n=0;n<report.frames;n++){
 const im=read(`${root}/frames/frame-${String(n+1).padStart(2,'0')}.png`);frames.push(im);
 const labels=new Int32Array(512*512),components=[];
 for(let start=0;start<labels.length;start++){
  if(labels[start]||im.data[start*4+3]<32)continue;
  const id=components.length+1,q=[start];labels[start]=id;
  for(let i=0;i<q.length;i++){
   const k=q[i],x=k%512,y=Math.floor(k/512);
   for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){
    const xx=x+dx,yy=y+dy;if(xx<0||xx>=512||yy<0||yy>=512)continue;
    const j=yy*512+xx;if(!labels[j]&&im.data[j*4+3]>=32){labels[j]=id;q.push(j);}
   }
  }
  const bounds=q.reduce((b,k)=>[Math.min(b[0],k%512),Math.min(b[1],Math.floor(k/512)),Math.max(b[2],k%512),Math.max(b[3],Math.floor(k/512))],[512,512,0,0]);
  components.push({id,size:q.length,bounds});
 }
 const sorted=components.toSorted((a,b)=>b.size-a.size),main=sorted[0].id;
 for(const extra of sorted.slice(3))largestUnexpected=Math.max(largestUnexpected,extra.size);
 for(let side=0;side<2;side++){
  const point=transform(side?319:191,470,poses[n].feet[side]);
  assert.equal(labels[Math.round(point[1])*512+Math.round(point[0])],main,'Detached foot in frame '+(n+1));
 }
 assert.equal(sorted.filter(c=>c.size>3).length,3,'Unexpected detached mark in frame '+(n+1)+': '+JSON.stringify(sorted));
 attachmentChecks.push({frame:n+1,bothFeetConnected:true,visibleComponents:sorted.filter(c=>c.size>3).length});
}
function difference(a,b){let total=0;for(let i=0;i<a.data.length;i+=4){const aa=a.data[i+3]/255,bb=b.data[i+3]/255;for(let c=0;c<3;c++)total+=Math.abs(a.data[i+c]*aa-b.data[i+c]*bb);total+=Math.abs(a.data[i+3]-b.data[i+3]);}return total;}
const differences=frames.map((im,n)=>difference(im,frames[(n+1)%frames.length]));
const wrap=differences.at(-1),maxInterior=Math.max(...differences.slice(0,-1));
assert(wrap<maxInterior*1.25,'Large visual jump at loop boundary');
for(const [path,sha]of Object.entries(report.protectedHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),sha);
Object.assign(report,{footAttachment:attachmentChecks,largestUnexpectedDetachedComponent:largestUnexpected,loopDifference:wrap,maximumInteriorFrameDifference:maxInterior,loopDifferenceRatio:wrap/maxInterior});
fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({frames:report.frames,bothFeetAttachedEveryFrame:true,strayComponents:largestUnexpected,loopDifferenceRatio:report.loopDifferenceRatio,idleAndFlavorUnchanged:true}));
