const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-belly-separation',prior='work/cirruskit-walk-tail-join';
const read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png'),clean=read('work/cirruskit-walk-cleanup/layers/farFront.png'),originalLeg=read(`${prior}/layers/farFront.png`),body=read(`${prior}/layers/body.png`),belly=new PNG({width:512,height:512});
(async()=>{
// One stationary body contour. The hidden upper leg comes from the existing
// clean leg cutout, so no section of the belly contour enters the moving layer.
const curve='M330 415 C354 419 381 415 395 390 Q410 377 431 373';
const svg=`<svg width="512" height="512"><path d="${curve} L431 320 L330 320 Z" fill="white"/><path d="${curve}" fill="none" stroke="white" stroke-width="7"/></svg>`;
const mask=PNG.sync.read(await sharp(Buffer.from(svg)).png().toBuffer());
const inkCurve='M330 415 C354 419 381 415 395 390 Q398 387 401 384';
const stroke=PNG.sync.read(await sharp(Buffer.from(`<svg width="512" height="512"><path d="${inkCurve}" fill="none" stroke="#1e020c" stroke-width="7" stroke-linecap="round"/></svg>`)).png().toBuffer());
for(let y=375;y<435;y++)for(let x=340;x<432;x++){
 const i=(y*512+x)*4,ma=mask.data[i+3],sa=stroke.data[i+3]/255;
 body.data.fill(0,i,i+4);
 if(!ma)continue;
 let j=i;
 // The source's foreground-leg border is not part of the body texture.
 if(base.data[i]<70){
  if(x<365)j=(Math.min(y,399)*512+365)*4;
  else for(let yy=y-1;yy>=Math.max(375,y-25);yy--){const k=(yy*512+x)*4;if(base.data[k]>=70&&base.data[k]<170){j=k;break;}}
 }
 for(let c=0;c<3;c++)belly.data[i+c]=Math.round(base.data[j+c]*(1-sa)+stroke.data[i+c]*sa);
 belly.data[i+3]=ma;
}
// Keep the original paw and lower-leg texture. Only the upper cutout needs
// the previously cleaned backing; the transition is hidden under the torso.
for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(y>=417||x>=398){const i=(y*512+x)*4;originalLeg.data.copy(clean.data,i,i,i+4);}
fs.writeFileSync(`${root}/layers/farFront.png`,PNG.sync.write(clean));
for(let y=340;y<375;y++)for(let x=410;x<460;x++){const i=(y*512+x)*4;base.data.copy(belly.data,i,i,i+4);}
fs.writeFileSync(`${root}/layers/body.png`,PNG.sync.write(body));fs.writeFileSync(`${root}/layers/belly.png`,PNG.sync.write(belly));
let build=fs.readFileSync(`${prior}/build.cjs`,'utf8').replaceAll(`root='${prior}'`,`root='${root}'`);
build=build.replace("'joint-cover','hip-cover'","'joint-cover','hip-cover','belly'").replace("'body','farFront','nearHind'","'farFront','body','belly','nearHind'")
.replace("name==='nearHind'||name==='farFront'","name==='nearHind'||name==='farFront'||name==='nearFront'")
.replace("const rootY=name==='nearHind'?365:380;","const rootY=name==='nearHind'?365:name==='nearFront'?385:380;")
.replace("let w=1-smooth(rootY,410,sy);if(name==='farFront')w=Math.max(w,(1-smooth(398,438,sx))*(1-smooth(418,441,sy)));","let w=1-smooth(rootY,name==='nearFront'?420:410,sy);")
.replace("pass<(name==='farFront'&&x<440&&y-pose.bob>385?16:8)","pass<(name==='nearFront'||name==='farFront'?40:8)");
fs.writeFileSync(`${root}/build.cjs`,build);
for(const name of ['review','seal-sampling-gaps','check-seams'])fs.writeFileSync(`${root}/${name}.cjs`,fs.readFileSync(`${prior}/${name}.cjs`,'utf8').replaceAll(`root='${prior}'`,`root='${root}'`));
})();
