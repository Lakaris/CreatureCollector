const fs=require('fs');const {warp}=require('./mesh-flow.cjs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');const root='work/cirruskit-flavor-smooth';
for(const [a,b]of [[0,1],[1,0]]){const buf=fs.readFileSync(`${root}/flow-${a}-${b}-face.bin`),flow=new Float32Array(buf.buffer,buf.byteOffset,buf.length/4),src=PNG.sync.read(fs.readFileSync(`${root}/source/frame-${a}.png`)),colors=warp(src,flow,.5);fs.writeFileSync(`${root}/warped-${a}.bin`,Buffer.from(colors.buffer));}

