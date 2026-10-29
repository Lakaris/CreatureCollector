const fs=require('fs'),assert=require('assert');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',report=JSON.parse(fs.readFileSync(root+'/audit.json')),prior=JSON.parse(fs.readFileSync(root+'/before-outline-match/audit.json'));
const refs=JSON.parse(fs.readFileSync(root+'/outline-reference.json')),oldSheet=PNG.sync.read(fs.readFileSync(root+'/before-outline-match/waddlepop_attack.png'));
function darkAt(im,x,y){x=Math.round(x);y=Math.round(y);const k=(y*512+x)*4;return im.data[k+3]>128&&Math.max(...im.data.subarray(k,k+3))<70;}
const rows=[],outsideSamples=[];let changes=0,outside=0;
for(let n=0;n<30;n++){
 const record=report.records[n],old=prior.records[n];for(const key of ['armAngles','bodyPose','bombPose','bombVisible','expression'])assert.deepStrictEqual(record[key],old[key],'Motion changed');
 const p=record.bodyPose,a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a),im=PNG.sync.read(fs.readFileSync(root+'/frames/frame-'+String(n+1).padStart(2,'0')+'.png'));
 for(let y=290;y<=365;y++){
  const ref=refs.find(r=>r.y===y);
  for(const side of ['left','right']){
   const run=ref[side+'BaseRun'],mid=Math.round((run[0]+run[1])/2),isDark=x=>darkAt(im,p.cx+c*(x-p.cx)-s*(y-p.cy)+p.x,p.cy+s*(x-p.cx)+c*(y-p.cy)+p.y);
   let l=mid,r=mid;assert(isDark(mid),'Missing cheek stroke in frame '+(n+1));while(l>mid-20&&isDark(l-1))l--;while(r<mid+20&&isDark(r+1))r++;
   rows.push({frame:n+1,y,side,baseWidth:run[1]-run[0]+1,width:r-l+1,extra:(r-l)-(run[1]-run[0])});
  }
 }
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){
  const k=(y*512+x)*4,ok=((Math.floor(n/6)*512+y)*oldSheet.width+n%6*512+x)*4;if(im.data.subarray(k,k+4).equals(oldSheet.data.subarray(ok,ok+4)))continue;changes++;
  const qx=p.cx+c*(x-p.cx-p.x)+s*(y-p.cy-p.y),qy=p.cy-s*(x-p.cx-p.x)+c*(y-p.cy-p.y);if(qx<145||qx>375||qy<248||qy>392){outside++;if(outsideSamples.length<12)outsideSamples.push({frame:n+1,x,y,qx,qy});}
 }
}
const maxExtra=Math.max(...rows.map(r=>r.extra)),worst=rows.filter(r=>r.extra>1).sort((a,b)=>b.extra-a.extra);
fs.writeFileSync(root+'/outline-width-samples.json',JSON.stringify(rows,null,2));
console.log(JSON.stringify({samples:rows.length,maxExtra,changes,outside,outsideSamples,worst:worst.slice(0,12)}));
assert.equal(outside,0,'Change outside the annotated face and shoulder regions');
assert(maxExtra<=2,'Doubled outline remains');
report.outlineAudit={checkedFrames:30,checkedCrossSections:rows.length,maxExtraPixelFromRasterSampling:maxExtra,motionUnchanged:true,changesOutsideFaceAndShoulders:outside,baseHeadContourReused:true,overlappingOutlinesRemoved:true};
fs.writeFileSync(root+'/audit.json',JSON.stringify(report,null,2));
