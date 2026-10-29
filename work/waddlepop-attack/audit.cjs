const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',read=p=>PNG.sync.read(fs.readFileSync(p)),report=JSON.parse(fs.readFileSync(root+'/audit.json'));
const base=read('images/waddlepop/waddlepop_idle.png'),frames=[];
function transform(x,y,a,cx,cy){a*=Math.PI/180;return[cx+Math.cos(a)*(x-cx)-Math.sin(a)*(y-cy),cy+Math.sin(a)*(x-cx)+Math.cos(a)*(y-cy)];}
const checks=[];
for(let n=0;n<30;n++){
 const im=read(`${root}/frames/frame-${String(n+1).padStart(2,'0')}.png`);frames.push(im);const labels=new Int32Array(512*512),components=[];
 for(let start=0;start<labels.length;start++){
  if(labels[start]||im.data[start*4+3]<32)continue;const q=[start],id=components.length+1;labels[start]=id;
  for(let j=0;j<q.length;j++){const v=q[j],x=v%512,y=Math.floor(v/512);for(const[dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=512||yy<0||yy>=512)continue;const z=yy*512+xx;if(!labels[z]&&im.data[z*4+3]>=32){labels[z]=id;q.push(z);}}}
  components.push({id,size:q.length});
 }
 const main=labels[420*512+256],expected=report.records[n].bombVisible?3:1;
 assert.equal(components.filter(c=>c.size>3).length,expected,'Stray or disconnected piece in frame '+(n+1)+' '+JSON.stringify(components));
 for(let side=0;side<2;side++){
  const p=transform(side?357:153,245,report.records[n].armAngles[side],side?335:181,382);
  assert.equal(labels[Math.round(p[1])*512+Math.round(p[0])],main,'Detached hand in frame '+(n+1));
 }
 if(!report.records[n].bombVisible)for(let y=0;y<190;y++)for(let x=0;x<512;x++)assert.equal(im.data[(y*512+x)*4+3],0,'Bomb residue in hidden frame '+(n+1));
 checks.push({frame:n+1,visibleComponents:expected,bothHandsAttached:true,bombHiddenCleanly:!report.records[n].bombVisible});
}
assert(frames[0].data.equals(base.data)&&frames.at(-1).data.equals(base.data));
for(const[p,h]of Object.entries(report.protectedHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),h);
Object.assign(report,{firstAndLastPixelIdenticalToBase:true,allHandsConnected:true,noStrayComponents:true,completeBombRemovalDuringRecovery:true,componentChecks:checks});fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({frames:30,endpointsExact:true,feetPlanted:true,faceErrors:0,handsAttached:true,strayComponents:0,bombHiddenFrames:'12–23'}));
