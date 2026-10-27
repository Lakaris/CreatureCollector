const fs=require('fs');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='C:/Users/Annie/.codex/generated_images/01a17e8f-4dcd-7fb2-bf5e-79c211523db9/';
const assets={waddlepop:'exec-b207c4d1-ebfb-40c2-8e81-d69a1f46d95d.png',frostillery:'exec-4d329e03-7d62-48c7-9e09-a38eb12213d3.png',bombardguin:'exec-fa781c65-fa25-4799-a524-89636a5d71d8.png',cryogeddon:'exec-930f7df2-bf01-43c0-a03b-1a09faa5c229.png'};
(async()=>{const report=[];for(const [name,file] of Object.entries(assets)){
 const dir=`images/${name}`;fs.mkdirSync(dir,{recursive:true});
 const out=`${dir}/${name}_idle.png`;if(fs.existsSync(out))throw Error('Existing asset: '+out);
 await sharp(root+file).resize(464,464,{fit:'inside'}).extend({top:24,bottom:24,left:24,right:24,background:{r:0,g:0,b:0,alpha:0}}).png().toFile(out);
 const {data,info}=await sharp(out).ensureAlpha().raw().toBuffer({resolveWithObject:true});let transparent=0,opaque=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)transparent++;if(data[i]===255)opaque++;}
 if(info.width!==512||info.height!==512||transparent===0||opaque===0)throw Error('Invalid output '+name);
 report.push({name,path:out,width:info.width,height:info.height,transparentPixels:transparent,opaquePixels:opaque});
}fs.writeFileSync('work/penguin-idle-designs/validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));})();
