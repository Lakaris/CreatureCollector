const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const names=['work/cirruskit-walk-cleanup/layers/farFront.png','work/cirruskit-walk-tail-join/layers/farFront.png'];const p=names.map(f=>PNG.sync.read(fs.readFileSync(f)));
for(let y=380;y<=450;y+=5){console.log(y,p.map(im=>{let dark=[],all=[];for(let x=350;x<470;x++){let i=(y*512+x)*4;if(im.data[i+3]>220){all.push(x);if(im.data[i]<60)dark.push(x);}}return {bounds:[all[0],all.at(-1)],dark};}));}
