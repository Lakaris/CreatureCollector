const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const {states,mask}=require('./expressions.cjs'),root='work/waddlepop-flavor',read=p=>PNG.sync.read(fs.readFileSync(p));
const old=read(root+'/before-expression/waddlepop_flavor.png'),now=read(root+'/waddlepop_flavor.png'),base=read(root+'/base.png'),poses=JSON.parse(fs.readFileSync(root+'/poses.json'));
assert(base.data.equals(read(root+'/before-expression/base.png').data),'Base image changed');
assert.deepEqual(poses,JSON.parse(fs.readFileSync(root+'/before-expression/poses.json')),'Body/bomb poses changed');
assert.deepEqual(JSON.parse(fs.readFileSync(root+'/waddlepop_flavor.json')).frames,JSON.parse(fs.readFileSync(root+'/before-expression/waddlepop_flavor.json')).frames,'Layout or timing changed');
function allowed(x,y,p){const a=p.a*Math.PI/180,c=Math.cos(a),s=Math.sin(a),sx=p.cx+c*(x-p.cx-p.x)+s*(y-p.cy-p.y),sy=p.cy-s*(x-p.cx-p.x)+c*(y-p.cy-p.y),ix=Math.floor(sx),iy=Math.floor(sy);for(let dy=0;dy<=1;dy++)for(let dx=0;dx<=1;dx++){const xx=ix+dx,yy=iy+dy;if(xx>=0&&xx<512&&yy>=0&&yy<512&&mask.data[(yy*512+xx)*4+3])return true;}return false;}
const frames=[];let totalChanged=0;
for(let n=0;n<30;n++){let changed=0,unexpected=0;for(let y=0;y<512;y++)for(let x=0;x<512;x++){const k=((Math.floor(n/6)*512+y)*now.width+(n%6)*512+x)*4;assert.equal(old.data[k+3],now.data[k+3],'Transparency changed in frame '+(n+1));if(old.data[k]===now.data[k]&&old.data[k+1]===now.data[k+1]&&old.data[k+2]===now.data[k+2])continue;changed++;if(!allowed(x,y,poses[n].body))unexpected++;}
 assert.equal(unexpected,0,'Pixels outside eyes/beak changed in frame '+(n+1));if(states[n]==='base')assert.equal(changed,0,'Neutral frame changed');else assert(changed>1500,'Expression missing in frame '+(n+1));frames.push({frame:n+1,expression:states[n],changedPixels:changed,changedPixelsOutsideFeatures:unexpected});totalChanged+=changed;
}
const report={baseUnchanged:true,bodyAndBombPosesUnchanged:true,flippersUnchanged:true,cheekContoursUnchanged:true,transparencyUnchanged:true,timingUnchanged:true,changesLimitedToEyesAndBeak:true,expressionFrames:frames.filter(f=>f.expression!=='base').map(f=>f.frame),mouthPoses:['closed','small open','O open'],totalChangedPixels:totalChanged,frames};
fs.writeFileSync(root+'/expression-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify({expressionFrames:report.expressionFrames,totalChangedPixels:totalChanged,changedPixelsOutsideFeatures:0,baseUnchanged:true}));
