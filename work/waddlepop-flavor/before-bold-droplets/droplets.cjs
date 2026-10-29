const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const sprite=PNG.sync.read(fs.readFileSync('work/waddlepop-flavor/droplets/burst.png'));
function cue(n){const frame=n+1,start=frame>=9&&frame<=14?9:frame>=16&&frame<=21?16:null;if(start===null)return null;const step=frame-start;return{step,scale:[.72,.90,1,1,.90,.70][step],x:89-step*.65,y:302-step*.25};}
function sample(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,p=[0,0,0,0];for(let j=0;j<2;j++)for(let i=0;i<2;i++){const xx=ix+i,yy=iy+j;if(xx<0||yy<0||xx>=sprite.width||yy>=sprite.height)continue;const k=(yy*sprite.width+xx)*4,a=sprite.data[k+3]/255,w=(i?fx:1-fx)*(j?fy:1-fy);for(let c=0;c<3;c++)p[c]+=sprite.data[k+c]*a*w;p[3]+=a*w;}return p;}
function paint(out,n,body){const c=cue(n);if(!c)return{frame:n+1,visible:false};const a=body.a*Math.PI/180,cos=Math.cos(a),sin=Math.sin(a),scale=c.scale*.25;let count=0,bounds=[512,512,-1,-1];for(let y=220;y<365;y++)for(let x=25;x<150;x++){
 const localX=body.cx+cos*(x-body.cx-body.x)+sin*(y-body.cy-body.y),localY=body.cy-sin*(x-body.cx-body.x)+cos*(y-body.cy-body.y);
 const u=(localX-c.x)/scale+(sprite.width-1)/2,v=(localY-c.y)/scale+(sprite.height-1)/2,p=sample(u,v);if(p[3]<.01)continue;
 // A few source-background pixels have alpha=1 (under 0.4% opacity).
 // No visible character or outline pixels may be covered by this overlay.
 const k=(y*512+x)*4;if(out.data[k+3]>1)throw Error('Droplet touches existing artwork in frame '+(n+1)+' at '+x+','+y+' alpha '+out.data[k+3]);
 const da=out.data[k+3]/255,oa=p[3]+da*(1-p[3]);for(let channel=0;channel<3;channel++)out.data[k+channel]=Math.round((p[channel]+out.data[k+channel]*da*(1-p[3]))/oa);out.data[k+3]=Math.round(oa*255);
 count++;bounds=[Math.min(bounds[0],x),Math.min(bounds[1],y),Math.max(bounds[2],x),Math.max(bounds[3],y)];
 }return{frame:n+1,visible:true,step:c.step,scale:c.scale,pixels:count,bounds};}
module.exports={cue,paint};
