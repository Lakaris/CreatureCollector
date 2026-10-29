const fs=require('fs');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',dir=root+'/expressions',S=512;
const read=p=>PNG.sync.read(fs.readFileSync(p)),save=(p,im)=>fs.writeFileSync(p,PNG.sync.write(im)),base=read(root+'/base.png');
function sample(im,x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,v=[0,0,0];for(let j=0;j<2;j++)for(let i=0;i<2;i++){const k=((iy+j)*S+ix+i)*4,w=(i?fx:1-fx)*(j?fy:1-fy);for(let c=0;c<3;c++)v[c]+=im.data[k+c]*w;}return v;}
function features(im){
 const mask=new Uint8Array(S*S),out=[];
 for(let y=282;y<376;y++)for(let x=192;x<355;x++){const k=(y*S+x)*4;if(im.data[k]<100&&im.data[k+1]<100&&im.data[k+2]<100&&im.data[k+3]>200)mask[y*S+x]=1;}
 for(let i=0;i<mask.length;i++)if(mask[i]){const q=[i],points=[];mask[i]=0;let minX=S,minY=S,maxX=0,maxY=0;for(let j=0;j<q.length;j++){const k=q[j],x=k%S,y=Math.floor(k/S);points.push([x,y]);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);for(const next of [k-1,k+1,k-S,k+S])if(mask[next]){mask[next]=0;q.push(next);}}
  if(q.length>25&&maxX-minX<70&&maxY-minY<70)out.push({points,bounds:[minX,minY,maxX,maxY],center:[(minX+maxX)/2,(minY+maxY)/2],area:(maxX-minX)*(maxY-minY)});
 }
 return [[228,328],[321,328],[278,342]].map(([cx,cy])=>{const matches=out.filter(c=>Math.abs(c.center[0]-cx)<18&&Math.abs(c.center[1]-cy)<18).sort((a,b)=>b.area-a.area);if(!matches.length)throw Error('Missing feature near '+cx);return matches[0];});
}
const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
function hull(points){const p=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),lo=[],hi=[];for(const v of p){while(lo.length>1&&cross(lo[lo.length-2],lo[lo.length-1],v)<=0)lo.pop();lo.push(v);}for(const v of p.slice().reverse()){while(hi.length>1&&cross(hi[hi.length-2],hi[hi.length-1],v)<=0)hi.pop();hi.push(v);}return lo.slice(0,-1).concat(hi.slice(0,-1));}
function distance(poly,x,y){let inside=true,d=1e9;for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length];if(cross(a,b,[x,y])<0)inside=false;const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.min(1,Math.max(0,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));d=Math.min(d,Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy));}return inside?0:d;}
const oldFeatures=features(base),edits={},union=new PNG({width:S,height:S}),report={original:oldFeatures.map(f=>f.bounds),variants:{}};
(async()=>{
 const paths={squeezed:'C:/Users/Annie/.codex/generated_images/01a17e8f-4dcd-7fb2-bf5e-79c211523db9/exec-237451f7-f1f2-40d1-92fe-a787d533e9bc.png',half:'C:/Users/Annie/.codex/generated_images/01a17e8f-4dcd-7fb2-bf5e-79c211523db9/exec-6b70c7f0-0e77-4507-add8-202ab44150b7.png'};
 for(const [name,path]of Object.entries(paths)){
  const gen=PNG.sync.read(await sharp(path).resize(S,S).png().toBuffer());save(dir+'/'+name+'-generated.png',gen);const feature=features(gen);edits[name]=[];report.variants[name]=[];
  for(let i=0;i<3;i++){
   const old=oldFeatures[i],fresh=feature[i],dx=old.center[0]-fresh.center[0],dy=old.center[1]-fresh.center[1];
   const poly=hull(old.points.concat(fresh.points.map(p=>[p[0]+dx,p[1]+dy]))),patch=new PNG({width:S,height:S});
   let offset=[0,0,0],count=0;
   for(let y=288;y<373;y++)for(let x=195;x<346;x++){const d=distance(poly,x,y);if(d<3||d>5)continue;const k=(y*S+x)*4,g=sample(gen,x-dx,y-dy);if(base.data[k]<205||g[0]<205||base.data[k+1]<205||g[1]<205)continue;for(let c=0;c<3;c++)offset[c]+=base.data[k+c]-g[c];count++;}
   offset=offset.map(v=>Math.max(-10,Math.min(10,v/Math.max(1,count))));
   for(let y=288;y<373;y++)for(let x=195;x<346;x++){const d=distance(poly,x,y),weight=Math.max(0,Math.min(1,(4.5-d)/3));if(!weight)continue;const k=(y*S+x)*4,g=sample(gen,x-dx,y-dy),light=Math.min(1,Math.max(0,(Math.min(...g)-150)/65));for(let c=0;c<3;c++)patch.data[k+c]=Math.round(Math.max(0,Math.min(255,g[c]+offset[c]*light)));patch.data[k+3]=Math.round(weight*255);union.data[k+3]=255;}
   edits[name].push(patch);report.variants[name].push({sourceBounds:fresh.bounds,translation:[dx,dy],backgroundColorCorrection:offset});
  }
 }
 function variant(name,eyeSource,mouthSource){const out=read(root+'/base.png');for(let i=0;i<3;i++){const p=i===2?mouthSource:eyeSource;if(!p)continue;const patch=edits[p][i];for(let k=0;k<out.data.length;k+=4){const a=patch.data[k+3]/255;if(!a)continue;for(let c=0;c<3;c++)out.data[k+c]=Math.round(out.data[k+c]*(1-a)+patch.data[k+c]*a);}}save(dir+'/'+name+'.png',out);return out;}
 const variants=[base,variant('half','half','half'),variant('squeezed-open','squeezed','squeezed'),variant('squeezed-small','squeezed','half'),variant('squeezed-closed','squeezed',null)];
 save(dir+'/feature-mask.png',union);fs.writeFileSync(dir+'/registration.json',JSON.stringify(report,null,2));
 const tiles=[];for(let i=0;i<variants.length;i++)tiles.push({input:await sharp(PNG.sync.write(variants[i])).extract({left:160,top:278,width:196,height:104}).resize(392,208).png().toBuffer(),left:i*392,top:0});
 fs.writeFileSync(dir+'/expressions-review.png',await sharp({create:{width:392*variants.length,height:208,channels:4,background:'#eee'}}).composite(tiles).png().toBuffer());
 console.log(JSON.stringify(report));
})();
