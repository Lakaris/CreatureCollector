const fs=require('fs');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='C:/Users/Annie/.codex/generated_images/01a17e8f-4dcd-7fb2-bf5e-79c211523db9/';
const entries=[['waddlepop','exec-1f64fb7e-0124-409d-9bcf-8cae286fb436.png',[660,780,810,935],40,295,350],['frostillery','exec-baa60edb-d421-4e0a-a426-788b28be57e6.png',[650,715,875,960],46,307,345],['bombardguin','exec-39ed8721-0f44-402b-89b0-23948ced362c.png',[685,680,900,920],50,319,336],['cryogeddon','exec-62f251e0-a20c-4e65-8581-a7938e757784.png',[640,680,890,950],56,315,339]];
(async()=>{fs.mkdirSync('work/penguin-idle-designs/before-belly',{recursive:true});const report=[];
for(const [name,file,box,size,cx,cy] of entries){
const src=PNG.sync.read(fs.readFileSync(root+file));const [x0,y0,x1,y1]=box;const mark=new PNG({width:x1-x0,height:y1-y0});let xmin=mark.width,ymin=mark.height,xmax=0,ymax=0;
for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*src.width+x)*4,j=((y-y0)*mark.width+x-x0)*4;const r=src.data[i],g=src.data[i+1],b=src.data[i+2];if(b-r>18&&g-r>12&&r>50){mark.data[j]=r;mark.data[j+1]=g;mark.data[j+2]=b;mark.data[j+3]=255;xmin=Math.min(xmin,x-x0);ymin=Math.min(ymin,y-y0);xmax=Math.max(xmax,x-x0);ymax=Math.max(ymax,y-y0);}}
const motif=PNG.sync.read(await sharp(PNG.sync.write(mark)).extract({left:xmin,top:ymin,width:xmax-xmin+1,height:ymax-ymin+1}).resize({height:size}).png().toBuffer());
const path=`images/${name}/${name}_idle.png`,backup=`work/penguin-idle-designs/before-belly/${name}_idle.png`;if(!fs.existsSync(backup))fs.copyFileSync(path,backup);const original=PNG.sync.read(fs.readFileSync(backup));const out=PNG.sync.read(fs.readFileSync(backup));const left=Math.round(cx-motif.width/2),top=Math.round(cy-motif.height/2);
for(let y=0;y<motif.height;y++)for(let x=0;x<motif.width;x++){const j=(y*motif.width+x)*4,i=((top+y)*512+left+x)*4,a=motif.data[j+3]/255;for(let c=0;c<3;c++)out.data[i+c]=Math.round(motif.data[j+c]*a+out.data[i+c]*(1-a));}
let changed=0;for(let i=0;i<out.data.length;i+=4){if(out.data[i+3]!==original.data[i+3])throw Error('Alpha changed');if(out.data[i]!==original.data[i]||out.data[i+1]!==original.data[i+1]||out.data[i+2]!==original.data[i+2])changed++;}
fs.writeFileSync(path,PNG.sync.write(out));report.push({name,changedPixels:changed,alphaUnchanged:true,markBounds:[left,top,motif.width,motif.height]});}
fs.writeFileSync('work/penguin-idle-designs/belly-validation.json',JSON.stringify(report,null,2));console.log(report);})();
