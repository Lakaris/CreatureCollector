const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs'),{interpolate}=require('./mesh-flow.cjs'),root='work/cirruskit-flavor-smooth';
const src=n=>PNG.sync.read(fs.readFileSync(`${root}/source/frame-${n}.png`));const field=(a,b,s)=>{const buf=fs.readFileSync(`${root}/flow-${a}-${b}-s${s}.bin`);return new Float32Array(buf.buffer,buf.byteOffset,buf.length/4);};
for(const s of [2,4,7]){const p=interpolate(src(0),src(1),field(0,1,s),field(1,0,s),.5);fs.writeFileSync(`${root}/smoothed-${s}.png`,PNG.sync.write(p));}
