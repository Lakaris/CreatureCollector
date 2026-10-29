const fs=require('fs');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',read=p=>PNG.sync.read(fs.readFileSync(p));
const poses=JSON.parse(fs.readFileSync(root+'/poses.json'));
function sample(im,x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,out=[0,0,0,0];for(let j=0;j<2;j++)for(let i=0;i<2;i++){if(ix+i<0||ix+i>=512||iy+j<0||iy+j>=512)continue;const k=((iy+j)*512+ix+i)*4,w=(i?fx:1-fx)*(j?fy:1-fy);for(let c=0;c<4;c++)out[c]+=im.data[k+c]*w;}return out;}
function transformed(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[p.cx+c*(x-p.cx)-s*(y-p.cy)+p.x,p.cy+s*(x-p.cx)+c*(y-p.cy)+p.y];}
const results=[];
for(let n=0;n<30;n++){
 const im=read(root+'/frames/frame-'+String(n+1).padStart(2,'0')+'.png');
 const pads=[];
 for(const roi of [[120,200,185,280],[325,210,400,292]]){
  let area=0,sumX=0,sumY=0,sumXX=0,sumYY=0,sumXY=0;
  const width=(roi[2]-roi[0])*2,height=(roi[3]-roi[1])*2,mask=new Uint8Array(width*height);
  // Measure original white cap shapes after undoing only the body sway.
  // Area and covariance are translation-invariant, unlike position/bounds.
  for(let y=roi[1];y<roi[3];y+=.5)for(let x=roi[0];x<roi[2];x+=.5){
   const rgb=sample(im,...transformed(x,y,poses[n].body));
   if(rgb[0]<230||rgb[1]<225||rgb[2]<200||rgb[3]<220)continue;
   mask[Math.round((y-roi[1])*2)*width+Math.round((x-roi[0])*2)]=1;
  }
  // Exclude disconnected white bomb fragments that occasionally enter the ROI.
  let cap=[];
  for(let k=0;k<mask.length;k++)if(mask[k]){const component=[k];mask[k]=0;for(let j=0;j<component.length;j++){const v=component[j],vx=v%width,vy=Math.floor(v/width);for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const nx=vx+dx,ny=vy+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;const next=ny*width+nx;if(mask[next]){mask[next]=0;component.push(next);}}}if(component.length>cap.length)cap=component;}
  for(const k of cap){const x=roi[0]+(k%width)/2,y=roi[1]+Math.floor(k/width)/2;area++;sumX+=x;sumY+=y;sumXX+=x*x;sumYY+=y*y;sumXY+=x*y;}
  const mx=sumX/area,my=sumY/area,cxx=sumXX/area-mx*mx,cyy=sumYY/area-my*my,cxy=sumXY/area-mx*my;
  const d=Math.sqrt((cxx-cyy)**2+4*cxy*cxy),major=Math.sqrt((cxx+cyy+d)/2),minor=Math.sqrt((cxx+cyy-d)/2);
  pads.push({area:area/4,center:[mx,my],major,minor,aspect:major/minor});
 }
 results.push({frame:n+1,pads});
}
const ranges=[0,1].map(i=>{const ref=results[0].pads[i];return {side:i?'right':'left',minAreaRatio:Math.min(...results.map(f=>f.pads[i].area/ref.area)),maxAreaRatio:Math.max(...results.map(f=>f.pads[i].area/ref.area)),minAspectRatio:Math.min(...results.map(f=>f.pads[i].aspect/ref.aspect)),maxAspectRatio:Math.max(...results.map(f=>f.pads[i].aspect/ref.aspect))};});
const report={measurement:'White flipper caps after body-sway alignment; area and aspect compared with base',ranges,frames:results};
fs.writeFileSync(root+'/flipper-shape-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(ranges));
