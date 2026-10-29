// Recover the visible head boundary from the approved base artwork. The old
// body cutout extended its dark stroke beyond that boundary into the arms.
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const clamp=v=>Math.max(0,Math.min(1,v));
function runs(im,y,l,r){const out=[];let start=-1;for(let x=l;x<=r;x++){const k=(y*512+x)*4,dark=x<r&&im.data[k+3]>128&&Math.max(...im.data.subarray(k,k+3))<70;if(dark&&start<0)start=x;if(!dark&&start>=0){out.push([start,x-1]);start=-1;}}return out;}
function rgb(im,x,y){const k=(y*512+x)*4;return [...im.data.subarray(k,k+3)];}
module.exports=function(sourceBody,base){
 const body=new PNG({width:512,height:512}),neckMask=new PNG({width:512,height:512});sourceBody.data.copy(body.data);const rows=[];
 for(let y=250;y<=367;y++){
  const boundaries=[];
  for(let side=0;side<2;side++){
   const l=side?305:155,r=side?370:221,existing=runs(sourceBody,y,l,r),options=runs(base,y,l,r);
   const old=side?existing.at(-1):existing[0];if(!old||!options.length)throw Error('Missing cheek boundary at '+y);
   // The edge facing the head interior is already registered to the base.
   const inner=side?0:1;options.sort((a,b)=>Math.abs(a[inner]-old[inner])-Math.abs(b[inner]-old[inner]));const run=options[0];
   const edge=run[side?1:0],background=rgb(base,edge+(side?3:-3),y),ink=rgb(base,Math.round((run[0]+run[1])/2),y);
   boundaries.push({run,edge,background,ink});
  }
  const [left,right]=boundaries;
  for(let x=155;x<370;x++){
   const k=(y*512+x)*4;
   if(x<left.edge-2||x>right.edge+2){body.data.fill(0,k,k+4);continue;}
   const side=x<=left.edge+1?left:x>=right.edge-1?right:null;
   let coverage=1,color=rgb(base,x,y);
   if(side){const vector=side.ink.map((v,c)=>v-side.background[c]),den=vector.reduce((s,v)=>s+v*v,0);coverage=den?clamp(color.reduce((s,v,c)=>s+(v-side.background[c])*vector[c],0)/den):1;color=side.ink;}
   for(let c=0;c<3;c++)body.data[k+c]=color[c];body.data[k+3]=Math.min(sourceBody.data[k+3],Math.round(coverage*255));
  }
  rows.push({y,leftBaseRun:left.run,rightBaseRun:right.run});
 }
 // Where a shoulder is covered by its flipper, its outer body stroke must
 // not also show through as a second black seam. The cheek stroke stays.
 for(let y=368;y<390;y++)for(let x=155;x<360;x++){
  if(x>=210&&x<=322)continue;const k=(y*512+x)*4,[r,g,b,a]=base.data.subarray(k,k+4),[br,bg,bb,ba]=body.data.subarray(k,k+4);
  if(a>245&&r<60&&g>30&&b>110){neckMask.data[k]=neckMask.data[k+1]=neckMask.data[k+2]=255;neckMask.data[k+3]=255;}
 }
 const edges=[];for(let y=0;y<512;y++){let l=512,r=-1;for(let x=100;x<410;x++)if(body.data[(y*512+x)*4+3]>=128){l=Math.min(l,x);r=Math.max(r,x);}edges.push([l,r]);}
 return {body,neckMask,rows,edges};
};
