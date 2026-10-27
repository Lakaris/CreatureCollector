const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-ink-finish',N=30,S=512,read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png'),rig=JSON.parse(fs.readFileSync(`${root}/rig.json`)),layers=Object.fromEntries(['tail','body','foreground','joint-cover','hip-cover',...Object.keys(rig)].map(n=>[n,read(`${root}/layers/${n}.png`)])),smooth=(a,b,t)=>{const v=Math.max(0,Math.min(1,(t-a)/(b-a)));return v*v*(3-2*v);};
function sample(p,x,y){const ix=Math.floor(x),iy=Math.floor(y),dx=x-ix,dy=y-iy,o=[0,0,0,0];for(const [ox,oy,w]of [[0,0,(1-dx)*(1-dy)],[1,0,dx*(1-dy)],[0,1,(1-dx)*dy],[1,1,dx*dy]]){const xx=ix+ox,yy=iy+oy;if(xx<0||yy<0||xx>=S||yy>=S)continue;const i=(yy*S+xx)*4,a=p.data[i+3]/255;o[3]+=w*a;for(let c=0;c<3;c++)o[c]+=w*a*p.data[i+c];}return o;}
function blend(p,i,s){if(!s[3])return;const a=s[3],da=p.data[i+3]/255;if(a>=245/255||!da){for(let c=0;c<3;c++)p.data[i+c]=Math.round(s[c]/a);p.data[i+3]=Math.round(a*255);}else{const outA=a+da*(1-a);for(let c=0;c<3;c++)p.data[i+c]=Math.round((s[c]+p.data[i+c]*da*(1-a))/outA);p.data[i+3]=Math.round(outA*255);}}
let chestEdges;
function draw(out,name,pose){const p=layers[name],def=rig[name];if(!def){for(let y=0;y<S;y++)for(let x=0;x<S;x++){if(name==='body'&&y-pose.bob>=373&&y-pose.bob<=400&&chestEdges&&x>=chestEdges[y]-2&&x>410)continue;const sy=y-pose.bob,sx=x-(name==='tail'?5*Math.sin(pose.phase)*(1-smooth(175,310,sy)):0);blend(out,(y*S+x)*4,sample(p,sx,sy));}return;}
const a=pose.legs[name].angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),[px,py]=def.pivot,ty=pose.legs[name].translateY;
for(let y=300;y<485;y++)for(let x=70;x<495;x++){
  const dx=x-px,dy=y-py-ty;let sx=px+c*dx+s*dy,sy=py-s*dx+c*dy;
  // Keep the upper attachment on the torso while retaining the exact existing
  // rigid motion below the shin. The paw positions and cadence are unchanged.
  if(name==='nearHind'||name==='farFront'){
    const rootY=name==='nearHind'?365:380;
    for(let pass=0;pass<(name==='farFront'&&x<440&&y-pose.bob>385?16:8);pass++){
      let w=1-smooth(rootY,410,sy);if(name==='farFront')w=Math.max(w,(1-smooth(398,438,sx))*(1-smooth(418,441,sy)));
      const rx=px+c*(sx-px)-s*(sy-py),ry=py+s*(sx-px)+c*(sy-py)+ty;
      const ox=w*(sx-rx),oy=w*(sy+pose.bob-ry);
      sx=px+c*(x-px-ox)+s*(y-py-ty-oy);
      sy=py-s*(x-px-ox)+c*(y-py-ty-oy);
    }
  }
  blend(out,(y*S+x)*4,sample(p,sx,sy));
}}
const poses=[];
for(let n=0;n<N;n++){const phase=2*Math.PI*n/N,amount=(1-Math.cos(phase))/2,bob=-Math.round(2*Math.sin(phase)**2),legs={};for(const [name,d]of Object.entries(rig)){const angle=d.angle*amount,a=angle*Math.PI/180,[px,py]=d.pivot,[fx,fy]=d.toe,rotatedY=py+Math.sin(a)*(fx-px)+Math.cos(a)*(fy-py),lift=Math.max(0,(d.pair===0?1:-1)*Math.sin(phase))*(name==='farHind'?7:10);legs[name]={angle,lift,translateY:fy-rotatedY-lift};}const pose={frame:n,phase,bob,legs};poses.push(pose);const chest=new PNG({width:S,height:S});draw(chest,'farFront',pose);chestEdges=Array.from({length:S},(_,y)=>{let edge=512;for(let x=410;x<480;x++)if(chest.data[(y*S+x)*4+3]>=128)edge=x;return edge;});const out=new PNG({width:S,height:S});for(const name of ['tail','farHind','body','farFront','nearHind','nearFront','hip-cover','foreground'])draw(out,name,pose);if(n===0){fs.writeFileSync(`${root}/rest-composite.png`,PNG.sync.write(out));}fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(out));}
fs.writeFileSync(`${root}/poses.json`,JSON.stringify(poses,null,2));
(async()=>{const selected=[0,4,8,12,15,19,23,27],tiles=await Promise.all(selected.map(n=>sharp(`${root}/frames/frame-${n}.png`).resize(256,256).flatten({background:'#f3f1f7'}).png().toBuffer()));await sharp({create:{width:1024,height:512,channels:4,background:'#f3f1f7'}}).composite(tiles.map((input,n)=>({input,left:n%4*256,top:Math.floor(n/4)*256}))).png().toFile(`${root}/contact.png`);})();console.log('Built the paired leg-swing cycle.');




