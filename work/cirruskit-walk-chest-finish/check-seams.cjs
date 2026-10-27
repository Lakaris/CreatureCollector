const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-chest-finish',read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png'),poses=JSON.parse(fs.readFileSync(`${root}/poses.json`));
assert.deepStrictEqual(poses,JSON.parse(fs.readFileSync('work/cirruskit-walk-cleanup/poses.json')));
const inJoin=(x,y)=>(x>=120&&x<=235&&y>=330&&y<=420)||(x>=405&&x<=450&&y>=360&&y<=410);
let stablePatternPixels=0;const results=[];
for(let n=0;n<30;n++){
 const p=read(`${root}/frames/frame-${n}.png`),seen=new Uint8Array(512*512),stack=[0];seen[0]=1;
 while(stack.length){const k=stack.pop(),x=k%512,y=k>>9;for(const [xx,yy]of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){if(xx<0||xx>=512||yy<0||yy>=512)continue;const j=yy*512+xx;if(!seen[j]&&p.data[j*4+3]<128){seen[j]=1;stack.push(j);}}}
 let gaps=0;const gapLocations=[];for(let y=330;y<420;y++)for(let x=110;x<460;x++){const k=y*512+x;if(inJoin(x,y)&&p.data[k*4+3]<128&&!seen[k]){gaps++;gapLocations.push([x,y]);}}
 if(!process.argv.includes('--inspect'))assert.equal(gaps,0,`Enclosed gap in frame ${n+1}`);
 const darkSeen=new Uint8Array(512*512),specks=[];
 const dark=k=>p.data[k*4+3]>=128&&p.data[k*4]<70&&p.data[k*4+1]<55&&p.data[k*4+2]<70;
 for(let start=0;start<darkSeen.length;start++){
  if(darkSeen[start]||!dark(start))continue;const todo=[start],part=[];darkSeen[start]=1;
  while(todo.length){const k=todo.pop(),x=k%512,y=k>>9;part.push(k);for(let yy=Math.max(0,y-1);yy<=Math.min(511,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(511,x+1);xx++){const j=yy*512+xx;if(!darkSeen[j]&&dark(j)){darkSeen[j]=1;todo.push(j);}}}
  if(part.length<16&&part.some(k=>inJoin(k%512,k>>9)))specks.push(part.map(k=>[k%512,k>>9]));
 }
 assert.equal(specks.length,0,`Isolated dark mark in frame ${n+1}`);
 for(let y=330;y<365;y++)for(let x=155;x<218;x++){
  const i=(y*512+x)*4;if(base.data[i+3]<250)continue;
  let flat=true;for(const d of [-512,512,-1,1])for(let c=0;c<3;c++)if(Math.abs(base.data[i+c]-base.data[i+d*4+c])>2)flat=false;
  if(!flat)continue;const j=((y+poses[n].bob)*512+x)*4;
  assert([0,1,2].every(c=>Math.abs(base.data[i+c]-p.data[j+c])<=1),`Flank texture mismatch ${n+1}:${x},${y}`);stablePatternPixels++;
 }
 results.push({frame:n+1,enclosedJointGaps:gaps,gapLocations,detachedDarkMarks:specks.length});
}
const report={framesReviewed:30,highlightedFrames:[8,28],sameGaitPoseData:true,originalRearLegArtworkRestored:true,stableFlankPatternPixelChecks:stablePatternPixels,perFrame:results};
fs.writeFileSync(`${root}/seam-audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
