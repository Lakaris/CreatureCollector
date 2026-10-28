const fs=require('fs'),assert=require('assert'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-attack-line-fill',S=512,read=p=>PNG.sync.read(fs.readFileSync(p)),sheet=read(`${root}/before/cirruskit_attack.png`),clips=JSON.parse(fs.readFileSync(`${root}/clips.json`));
const radius=3,disk=[];for(let y=-radius;y<=radius;y++)for(let x=-radius;x<=radius;x++)if(x*x+y*y<=radius*radius)disk.push([x,y]);
const changes=[];
for(let n=0;n<25;n++){
 const out=new PNG({width:S,height:S});for(let y=0;y<S;y++){const start=((Math.floor(n/5)*S+y)*sheet.width+n%5*S)*4;sheet.data.copy(out.data,y*S*4,start,start+S*4);}
 const original=Buffer.from(out.data),r=clips[n],box={left:r.left+4,top:r.top-2,right:r.left+20,bottom:r.top+13},changed=[];
 if(n!==0&&n!==24){
  const dilated=new Uint8Array(S*S);
  for(let y=box.top-radius;y<=box.bottom+radius;y++)for(let x=box.left-radius;x<=box.right+radius;x++){let a=0;for(const [dx,dy]of disk)a=Math.max(a,original[((y+dy)*S+x+dx)*4+3]);dilated[y*S+x]=a;}
  for(let y=box.top;y<=box.bottom;y++)for(let x=box.left;x<=box.right;x++){
   const i=(y*S+x)*4,oldA=original[i+3];if(oldA>=250)continue;let alpha=255;for(const [dx,dy]of disk)alpha=Math.min(alpha,dilated[(y+dy)*S+x+dx]);if(alpha<=oldA)continue;
   // Add only the missing ink behind the existing antialiased edge. The
   // original coloured/opaque artwork never gets repainted.
   const ink=[30,2,12];for(let c=0;c<3;c++)out.data[i+c]=Math.round((original[i+c]*oldA+ink[c]*(alpha-oldA))/alpha);out.data[i+3]=alpha;changed.push([x,y]);
  }
 }
 for(let i=0;i<out.data.length;i+=4)if(!out.data.subarray(i,i+4).equals(original.subarray(i,i+4))){const x=i/4%S,y=Math.floor(i/4/S);assert(x>=box.left&&x<=box.right&&y>=box.top&&y<=box.bottom,'Change outside the missing-line area');assert(original[i+3]<250,'Opaque artwork changed');}
 fs.writeFileSync(`${root}/frames/frame-${n}.png`,PNG.sync.write(out));changes.push({frame:n+1,box,pixels:changed.length,changed});
}
fs.writeFileSync(`${root}/changes.json`,JSON.stringify(changes,null,2));console.log(changes.map(({frame,pixels})=>({frame,pixels})));


