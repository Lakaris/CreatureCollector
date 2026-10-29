const fs=require('fs');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',backup=root+'/before-face-fix';
fs.mkdirSync(backup,{recursive:true});
for(const p of ['base.png','build.cjs','finalize.cjs','waddlepop_flavor.png','waddlepop_flavor.json','poses.json'])if(!fs.existsSync(backup+'/'+p))fs.copyFileSync(root+'/'+p,backup+'/'+p);
const read=p=>PNG.sync.read(fs.readFileSync(p)),base=read(backup+'/base.png'),gen=read(root+'/outlined-generated.png');
function sample(im,x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,v=[0,0,0,0];for(let j=0;j<2;j++)for(let i=0;i<2;i++){if(ix+i<0||ix+i>511||iy+j<0||iy+j>511)continue;const k=((iy+j)*512+ix+i)*4,w=(i?fx:1-fx)*(j?fy:1-fy);for(let c=0;c<4;c++)v[c]+=im.data[k+c]*w;}return v;}
// Register the unchanged eyes and beak, excluding the newly outlined cheek.
function loss(p){let total=0;for(let y=295;y<363;y+=2)for(let x=207;x<341;x+=2){const g=sample(gen,(x-p[2])/p[0],(y-p[3])/p[1]),k=(y*512+x)*4;for(let c=0;c<3;c++)total+=Math.abs(g[c]-base.data[k+c]);}return total;}
let p=[1,1,5,5],best=loss(p);
for(const steps of [[.01,.01,2,2],[.003,.003,.5,.5],[.001,.001,.15,.15],[.0003,.0003,.04,.04]])for(let pass=0;pass<30;pass++){let moved=false;for(let j=0;j<4;j++)for(const sign of [-1,1]){const q=p.slice();q[j]+=steps[j]*sign;const value=loss(q);if(value<best){best=value;p=q;moved=true;}}if(!moved)break;}
const out=read(backup+'/base.png');let changed=0,bounds=[512,512,0,0];
// Transfer only the generated dark cheek contour, retaining original blue pixels,
// facial details, transparency, and every pixel outside this small repair.
for(let y=273;y<=374;y++)for(let x=157;x<217;x++){
 const gx=(x-p[2])/p[0],gy=(y-p[3])/p[1];
 // Keep eye pixels out of the contour selection.
 if(gx<164||(gx>196&&gy<350))continue;
 const g=sample(gen,gx,gy),k=(y*512+x)*4;
 if(g[2]>155||g[0]>80||g[1]>90||g[3]<240)continue;
 const old=[...base.data.subarray(k,k+3)];
 // A line-only alpha derived from the blue background maintains clean antialiasing.
 let a=Math.max(0,Math.min(1,(old[2]-g[2])/(old[2]-10)));
 if(old[2]<60||a<.10)continue;
 if(g[2]<22)a=1;
 for(let c=0;c<3;c++)out.data[k+c]=Math.round(old[c]*(1-a)+[19,7,9][c]*a);
 if(out.data[k]!==base.data[k]||out.data[k+1]!==base.data[k+1]||out.data[k+2]!==base.data[k+2]){changed++;bounds=[Math.min(bounds[0],x),Math.min(bounds[1],y),Math.max(bounds[2],x),Math.max(bounds[3],y)];}
}
fs.writeFileSync(root+'/base.png',PNG.sync.write(out));
fs.writeFileSync(root+'/face-outline-registration.json',JSON.stringify({transform:p,changedPixels:changed,bounds,preservesOriginalOutsideContour:true},null,2));
console.log({transform:p,changedPixels:changed,bounds});
