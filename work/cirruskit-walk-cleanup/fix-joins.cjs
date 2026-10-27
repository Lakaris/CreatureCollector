const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-cleanup',read=p=>PNG.sync.read(fs.readFileSync(p)),body=read(`${root}/before-join-fix/layers/body.png`),base=read('images/cirruskit/cirruskit_base.png');
// The replacement belly plate included a sliver of its own tail and a rear
// belly curve outside the near hind leg. Both belong behind that leg.
for(let y=371;y<412;y++){
  let grayLeft=160;
  for(let x=100;x<190;x++){
    const i=(y*512+x)*4;
    if(base.data[i+3]>240&&base.data[i]>70&&base.data[i]<170&&base.data[i+1]-base.data[i]<10&&base.data[i+2]-base.data[i]<30){grayLeft=x;break;}
  }
  for(let x=0;x<160;x++){
    const i=(y*512+x)*4;body.data.fill(0,i,i+4);
    // This portion of the original tail was previously left on the body side
    // of the layer split. Restore it precisely, up to the original hip edge.
    if(y<395&&x<grayLeft)base.data.copy(body.data,i,i,i+4);
  }
}
// Extend the clipped chest tip into a continuous curve under the mane. Shift
// the existing outline by at most three pixels, retaining its original width
// and colors. The unchanged lower foreleg sits behind this stationary edge.
const original=Buffer.from(body.data);
for(let y=370;y<=394;y++){
  const dx=Math.round(3*Math.sin(Math.PI*(y-370)/24));
  for(let x=390;x<450;x++){
    const from=(y*512+Math.max(390,x-dx))*4,i=(y*512+x)*4;
    original.copy(body.data,i,from,from+4);
  }
}
fs.writeFileSync(`${root}/layers/body.png`,PNG.sync.write(body));
console.log('Restored the chest edge and removed the overlapping rear belly edge.');
