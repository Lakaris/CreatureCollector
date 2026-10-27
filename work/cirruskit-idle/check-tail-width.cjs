const fs=require('fs');const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const seam=JSON.parse(fs.readFileSync('work/cirruskit-idle/tail-seam.json'));
const files=['images/cirruskit/cirruskit_base.png','work/cirruskit-idle/outline-before/frame-22.png','work/cirruskit-idle/frame-22.png'];
for(const file of files){const p=PNG.sync.read(fs.readFileSync(file));let rows=[];for(let y=100;y<=260;y+=10){let right=-1;for(let x=0;x<seam[y]-3;x++){if(p.data[(y*512+x)*4+3]>=180)right=x;}let width=0;for(let x=right;x>=0;x--){const i=(y*512+x)*4;if(p.data[i+3]>=180&&p.data[i]<65&&p.data[i+1]<55&&p.data[i+2]<65)width++;else break;}rows.push([y,width]);}console.log(file,JSON.stringify(rows));}
