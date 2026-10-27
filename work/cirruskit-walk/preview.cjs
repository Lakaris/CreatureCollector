const fs=require('fs'),zlib=require('zlib'),crypto=require('crypto');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const dir='images/cirruskit',meta=JSON.parse(fs.readFileSync(`${dir}/cirruskit_move.json`)),sheet=PNG.sync.read(fs.readFileSync(`${dir}/${meta.image}`));
const size=meta.frameWidth,total=meta.frames.reduce((sum,f)=>sum+f.durationMs,0),version=crypto.createHash('sha256').update(fs.readFileSync(`${dir}/${meta.image}`)).digest('hex').slice(0,12);
if(total!==meta.totalDurationMs||sheet.width!==meta.columns*size||sheet.height!==meta.rows*size)throw Error('Flavor metadata mismatch');
const table=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function chunk(name,data){const type=Buffer.from(name);let crc=0xffffffff;for(const b of Buffer.concat([type,data]))crc=table[(crc^b)&255]^(crc>>>8);const out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);type.copy(out,4);data.copy(out,8);out.writeUInt32BE((crc^0xffffffff)>>>0,data.length+8);return out;}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
const actl=Buffer.alloc(8);actl.writeUInt32BE(meta.frames.length);
const chunks=[Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('acTL',actl)];let seq=0;
for(const [n,frame]of meta.frames.entries()){
  const control=Buffer.alloc(26);control.writeUInt32BE(seq++);control.writeUInt32BE(size,4);control.writeUInt32BE(size,8);control.writeUInt16BE(frame.durationMs,20);control.writeUInt16BE(1000,22);chunks.push(chunk('fcTL',control));
  const stride=size*4,raw=Buffer.alloc(size*(stride+1));for(let y=0;y<size;y++){const from=((frame.y+y)*sheet.width+frame.x)*4;sheet.data.copy(raw,y*(stride+1)+1,from,from+stride);}
  const compressed=zlib.deflateSync(raw);if(n===0)chunks.push(chunk('IDAT',compressed));else{const sequence=Buffer.alloc(4);sequence.writeUInt32BE(seq++);chunks.push(chunk('fdAT',Buffer.concat([sequence,compressed])));}
}
chunks.push(chunk('IEND',Buffer.alloc(0)));fs.writeFileSync(`${dir}/cirruskit_move_preview.png`,Buffer.concat(chunks));

let html=fs.readFileSync('work/cirruskit-walk/preview-template.html','utf8');
const replacements={VERSION:version,COLS:meta.columns*100,ROWS:meta.rows*100,MAX:meta.frames.length-1,COUNT:meta.frames.length,SECONDS:(total/1000).toFixed(3),DURATIONS:JSON.stringify(meta.frames.map(f=>f.durationMs)),COLUMN_COUNT:meta.columns,ROW_COUNT:meta.rows,TOTAL:total};
for(const [name,value]of Object.entries(replacements))html=html.replaceAll('__'+name+'__',String(value));
fs.writeFileSync(dir+'/cirruskit_move_preview.html',html);
console.log(JSON.stringify({frames:meta.frames.length,totalMs:total,frameInspectionControls:true}));
