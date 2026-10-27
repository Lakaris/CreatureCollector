const fs=require('fs');
const path=require('path');
const zlib=require('zlib');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
(async()=>{
const dir=path.resolve('work/cirruskit-tail/staged');
const base=fs.readFileSync(path.join(dir,'cirruskit-critters-512-v3.png'));
const frames=Array.from({length:9},(_,i)=>fs.readFileSync('work/cirruskit-tail/frames/frame-'+i+'.png'));
const durations=[850,230,260,220,240,180,180,230,650];
const assembled=new PNG({width:1536,height:1536});
for(let i=0;i<frames.length;i++){const p=PNG.sync.read(frames[i]);for(let y=0;y<512;y++)p.data.copy(assembled.data,((Math.floor(i/3)*512+y)*1536+i%3*512)*4,y*512*4,(y+1)*512*4);}
fs.writeFileSync(path.join(dir,'cirruskit-idle-v10-spritesheet.png'),PNG.sync.write(assembled));
let table=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}
function chunk(type,data){let t=Buffer.from(type),c=0xffffffff;for(let b of Buffer.concat([t,data]))c=table[(c^b)&255]^(c>>>8);let out=Buffer.alloc(12+data.length);out.writeUInt32BE(data.length);t.copy(out,4);data.copy(out,8);out.writeUInt32BE((c^0xffffffff)>>>0,8+data.length);return out;}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(512);ihdr.writeUInt32BE(512,4);ihdr[8]=8;ihdr[9]=6;
const actl=Buffer.alloc(8);actl.writeUInt32BE(frames.length);
let chunks=[Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('acTL',actl)],seq=0;
for(let i=0;i<frames.length;i++){
const ctl=Buffer.alloc(26);ctl.writeUInt32BE(seq++);ctl.writeUInt32BE(512,4);ctl.writeUInt32BE(512,8);ctl.writeUInt16BE(durations[i],20);ctl.writeUInt16BE(1000,22);ctl[24]=0;ctl[25]=0;chunks.push(chunk('fcTL',ctl));
const p=PNG.sync.read(frames[i]),raw=Buffer.alloc(512*(2048+1));for(let y=0;y<512;y++)p.data.copy(raw,y*2049+1,y*2048,(y+1)*2048);const compressed=zlib.deflateSync(raw);
if(i===0)chunks.push(chunk('IDAT',compressed));else{let s=Buffer.alloc(4);s.writeUInt32BE(seq++);chunks.push(chunk('fdAT',Buffer.concat([s,compressed])));}
}
chunks.push(chunk('IEND',Buffer.alloc(0)));fs.writeFileSync(path.join(dir,'cirruskit-idle-v10-preview.png'),Buffer.concat(chunks));
const data={image:'cirruskit-idle-v10-spritesheet.png',frameWidth:512,frameHeight:512,columns:3,rows:3,loop:true,totalDurationMs:durations.reduce((a,b)=>a+b),frames:durations.map((durationMs,i)=>({index:i,x:i%3*512,y:Math.floor(i/3)*512,width:512,height:512,durationMs})),notes:'Read left to right, top row to bottom row. First and last frames are exact copies of cirruskit-critters-512-v3.png.'};fs.writeFileSync(path.join(dir,'cirruskit-idle-v10.json'),JSON.stringify(data,null,2));
fs.writeFileSync(path.join(dir,'cirruskit-idle-v10-preview.html'),`<!doctype html><html><meta charset="utf-8"><title>Cirruskit idle preview</title><style>body{background:#e7e7ed;font:16px system-ui;text-align:center;color:#292432}img{width:512px;max-width:95vw;background:repeating-conic-gradient(#fff 0 25%,#eee 0 50%) 0/24px 24px;border-radius:16px}p{margin:12px}</style><h1>Cirruskit · idle paw tap</h1><img src="cirruskit-idle-v10-preview.png" alt="Looping Cirruskit crouch and paw tap"><p>9 frames · 512 × 512 per frame · 3.04-second loop</p></html>`);
const sheet=PNG.sync.read(fs.readFileSync(path.join(dir,'cirruskit-idle-v10-spritesheet.png'))),original=PNG.sync.read(base);for(const i of [0,8])for(let y=0;y<512;y++)for(let x=0;x<512;x++)for(let c=0;c<4;c++){if(sheet.data[((Math.floor(i/3)*512+y)*1536+i%3*512+x)*4+c]!==original.data[(y*512+x)*4+c])throw Error('Endpoint mismatch');}
console.log(JSON.stringify({sheet:[1536,1536],frames:9,endpoints:'pixel-identical to approved base',durations,totalMs:data.totalDurationMs}));
})();











