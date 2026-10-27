const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-tail-join',read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png'),body=read('work/cirruskit-walk-ink-finish/layers/body.png'),leg=read('work/cirruskit-walk-ink-finish/layers/nearHind.png'),tail=read('work/cirruskit-walk-ink-finish/layers/tail.png'),seam=JSON.parse(fs.readFileSync('work/cirruskit-walk/tail-seam.json')),splits=[];
// Restore the unchanged bottom of the tail from its original texture. It has
// no sideways displacement at this height, so it belongs to this static join.
for(let y=365;y<390;y++)for(let x=124;x<160;x++){const i=(y*512+x)*4;base.data.copy(body.data,i,i,i+4);}
// Give the tail/body and rear leg mutually exclusive ownership of the edge.
// The previous body backing retained a second, stationary leg outline here.
for(let y=365;y<=404;y++){
 let grayLeft=160;
 for(let x=110;x<160;x++){const i=(y*512+x)*4;if(base.data[i+3]>240&&base.data[i]>70&&base.data[i]<170&&base.data[i+1]-base.data[i]<10&&base.data[i+2]-base.data[i]<30){grayLeft=x;break;}}
 const split=grayLeft-13;
 for(let x=split;x<512;x++){const i=(y*512+x)*4;tail.data.fill(0,i,i+4);}
 for(let x=0;x<seam[y];x++){const i=(y*512+x)*4;body.data.fill(0,i,i+4);}
 for(let x=split;x<160;x++){const i=(y*512+x)*4;body.data.fill(0,i,i+4);base.data.copy(leg.data,i,i,i+4);}
 splits.push({y,split});
}
fs.writeFileSync(`${root}/layers/body.png`,PNG.sync.write(body));fs.writeFileSync(`${root}/layers/nearHind.png`,PNG.sync.write(leg));fs.writeFileSync(`${root}/layers/tail.png`,PNG.sync.write(tail));fs.writeFileSync(`${root}/ownership.json`,JSON.stringify(splits,null,2)+'\n');
for(const name of ['build','review','seal-sampling-gaps','check-seams'])fs.writeFileSync(`${root}/${name}.cjs`,fs.readFileSync(`work/cirruskit-walk-ink-finish/${name}.cjs`,'utf8').replaceAll("root='work/cirruskit-walk-ink-finish'","root='work/cirruskit-walk-tail-join'"));
console.log('Separated the stationary tail edge from the moving rear-leg outline.');
