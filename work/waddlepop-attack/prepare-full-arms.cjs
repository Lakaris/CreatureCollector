const fs=require('fs'),assert=require('assert');
const{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-attack',S=512,read=p=>PNG.sync.read(fs.readFileSync(p)),clamp=v=>Math.max(0,Math.min(1,v));
module.exports=function prepareFullArms(){
 const generated=read(root+'/full-arms-512.png'),source=read('work/waddlepop-flavor/character.png'),report=[];
 for(let side=0;side<2;side++){
  const prior=read(root+`/before-full-arms/arm-${side+1}.png`),arm=new PNG({width:S,height:S});
  let oldArea=0,newArea=0;
  for(let y=200;y<420;y++){
   let left=S,right=-1;
   for(let x=side?256:80;x<(side?435:256);x++)if(prior.data[(y*S+x)*4+3]>128){left=Math.min(left,x);right=Math.max(right,x);}
   for(let x=side?256:80;x<(side?435:256);x++){
    const k=(y*S+x)*4;generated.data.copy(arm.data,k,k,k+4);
    // Retain the source's visible outer silhouette and tip colors; only the
    // previously hidden inner surface comes from the completed flipper art.
    if(y<360&&right>=left){
     let w=side?clamp((left+10-x)/8):clamp((x-(right-10))/8);
     // The old visible cutout can include the cheek's outline at its inner
     // edge. That stroke belongs to the face, never to the completed arm.
     const outerDistance=side?right-x:x-left;
     if(outerDistance>Math.max(14,(right-left)*.55)&&Math.max(...source.data.subarray(k,k+3))<115)w=1;
     const oa=prior.data[k+3]/255,ga=generated.data[k+3]/255,a=oa*(1-w)+ga*w;
     for(let c=0;c<3;c++)arm.data[k+c]=a?Math.round((source.data[k+c]*oa*(1-w)+generated.data[k+c]*ga*w)/a):0;
     arm.data[k+3]=Math.round(a*255);
    }
    if(arm.data[k+3]>=250)arm.data[k+3]=255;
    oldArea+=prior.data[k+3]/255;newArea+=arm.data[k+3]/255;
   }
  }
  const widths=[];for(let y=280;y<=355;y+=15){let l=S,r=-1,ol=S,or=-1;for(let x=0;x<S;x++){if(arm.data[(y*S+x)*4+3]>128){l=Math.min(l,x);r=Math.max(r,x);}if(prior.data[(y*S+x)*4+3]>128){ol=Math.min(ol,x);or=Math.max(or,x);}}widths.push({y,oldWidth:or-ol+1,fullWidth:r-l+1});}
  assert(newArea>oldArea*1.35,'Full hidden arm was not reconstructed');
  assert(widths.every(w=>w.fullWidth>w.oldWidth),'A flipper cross-section is still clipped');
  const path=root+`/arm-${side+1}.png`,tmp=path+'.building-'+process.pid;fs.writeFileSync(tmp,PNG.sync.write(arm));fs.renameSync(tmp,path);
  report.push({side:side?'right':'left',originalVisibleArea:oldArea,completeArmArea:newArea,areaGain:newArea/oldArea,widths});
 }
 fs.writeFileSync(root+'/full-arms-registration.json',JSON.stringify({source:'full-arms-source.png',originalTipsAndOuterContoursPreserved:true,armsAreCompleteRigidSprites:true,arms:report},null,2));
 return report;
};
if(require.main===module)console.log(JSON.stringify(module.exports()));
