const fs=require('fs'),assert=require('assert/strict'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-defeat-defined-legs',read=p=>PNG.sync.read(fs.readFileSync(p)),previous=read(`${root}/before/cirruskit_defeat.png`),head=read('work/cirruskit-transition-repair/fixed-head-mane.png'),plan=JSON.parse(fs.readFileSync(`${root}/frame-plan.json`)),report=[];
for(let n=0;n<24;n++){const p=read(`${root}/frames/frame-${n}.png`),pose=plan.frames[n],a=pose.tilt*Math.PI/180,c=Math.cos(a),s=Math.sin(a);let minY=512,count=0,unchangedHeadPixels=0;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,j=((Math.floor(n/6)*512+y)*previous.width+n%6*512+x)*4;let changed=false;for(let channel=0;channel<4;channel++)if(p.data[i+channel]!==previous.data[j+channel])changed=true;
  const dx=x-350+25*pose.spread,dy=y-320-pose.head,sx=Math.floor(350+c*dx+s*dy),sy=Math.floor(320-s*dx+c*dy);
  if(sx>=0&&sy>=0&&sx<511&&sy<511&&[[0,0],[1,0],[0,1],[1,1]].every(([ox,oy])=>head.data[((sy+oy)*512+sx+ox)*4+3]>=252)){for(let channel=0;channel<4;channel++)assert.ok(Math.abs(p.data[i+channel]-previous.data[j+channel])<=3,`Head or mane changed in frame ${n+1}`);unchangedHeadPixels++;}
  if(changed){assert.ok((x<265&&y>=330)||(x>=265&&y>=365),`Change outside the leg and join area in frame ${n+1}`);count++;minY=Math.min(minY,y);}}
 assert.ok(unchangedHeadPixels>60000);report.push({frame:n+1,changedPixels:count,firstChangedRow:count?minY:null,unchangedHeadPixels});}
const audit={changesConfinedToLegsAndJoins:true,headAndManeInteriorPreservedWithinAlphaCompositingTolerance:true,frames:report};fs.writeFileSync(`${root}/scope-audit.json`,JSON.stringify(audit,null,2));console.log(JSON.stringify(audit));

