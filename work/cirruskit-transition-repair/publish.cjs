const fs=require('fs'),assert=require('assert');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-transition-repair',path='images/cirruskit/cirruskit_flavor.png';
const old=fs.readFileSync(path),sheet=PNG.sync.read(old),frame=PNG.sync.read(fs.readFileSync(`${root}/final.png`));
assert.equal(sheet.width,2048);assert.equal(sheet.height,1536);assert.equal(frame.width,512);assert.equal(frame.height,512);
if(!fs.existsSync(`${root}/before-sheet.png`))fs.writeFileSync(`${root}/before-sheet.png`,old);
for(const n of [1,9])for(let y=0;y<512;y++)frame.data.copy(sheet.data,((Math.floor(n/4)*512+y)*sheet.width+n%4*512)*4,y*2048,(y+1)*2048);
fs.writeFileSync(path,PNG.sync.write(sheet));
console.log('Replaced only frames 2 and 10.');
