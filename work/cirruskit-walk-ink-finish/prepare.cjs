const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-ink-finish',p=PNG.sync.read(fs.readFileSync('work/cirruskit-walk-chest-finish/layers/nearHind.png'));
const smooth=(a,b,t)=>{const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);},entries={};
for(let y=390;y<=436;y++)for(let x=185;x<232;x++){const i=(y*512+x)*4;if(p.data[i+3]>128&&p.data[i]<70&&p.data[i+1]<55&&p.data[i+2]<70){entries[y]=x;break;}}
let trimmedPixels=0;
for(let y=396;y<=432;y++){
 let first=0;for(let dy=-2;dy<=2;dy++)first+=entries[y+dy];first/=5;
 const edge=first+8.2,amount=smooth(396,405,y)*(1-smooth(425,432,y));
 for(let x=195;x<233;x++){
   const i=(y*512+x)*4,coverage=Math.max(0,Math.min(1,edge+.5-x)),a=Math.round(p.data[i+3]*(1-amount+amount*coverage));
   if(a!==p.data[i+3])trimmedPixels++;p.data[i+3]=a;if(!a)p.data.fill(0,i,i+4);
 }
}
fs.writeFileSync(`${root}/layers/nearHind.png`,PNG.sync.write(p));
let build=fs.readFileSync('work/cirruskit-walk-chest-finish/build.cjs','utf8').replace("root='work/cirruskit-walk-chest-finish'","root='work/cirruskit-walk-ink-finish'")
.replace('for(let pass=0;pass<8;pass++)','for(let pass=0;pass<(name===\'farFront\'&&x<440&&y-pose.bob>385?16:8);pass++)')
.replace('const w=1-smooth(rootY,410,sy);',"let w=1-smooth(rootY,410,sy);if(name==='farFront')w=Math.max(w,(1-smooth(398,438,sx))*(1-smooth(418,441,sy)));");
fs.writeFileSync(`${root}/build.cjs`,build);
for(const name of ['review','seal-sampling-gaps','check-seams'])fs.writeFileSync(`${root}/${name}.cjs`,fs.readFileSync(`work/cirruskit-walk-chest-finish/${name}.cjs`,'utf8').replaceAll("root='work/cirruskit-walk-chest-finish'","root='work/cirruskit-walk-ink-finish'"));
console.log({trimmedRearEdgePixels:trimmedPixels,frontBellyStroke:'Pinned to torso; fade into foot motion below the stroke'});
