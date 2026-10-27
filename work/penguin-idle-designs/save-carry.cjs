const fs=require('fs');
const sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
const path='images/waddlepop/waddlepop_idle.png';
const backup='work/penguin-idle-designs/waddlepop-before-carry.png';
if(!fs.existsSync(backup))fs.copyFileSync(path,backup);
await sharp('C:/Users/Annie/.codex/generated_images/01a17e8f-4dcd-7fb2-bf5e-79c211523db9/exec-3f389eab-c783-4f3b-8214-b9e56ae8f863.png').resize(512,512).png().toFile(path);
const meta=await sharp(path).metadata();if(meta.width!==512||meta.height!==512||!meta.hasAlpha)throw Error('Invalid image');console.log({path,width:meta.width,height:meta.height,hasAlpha:meta.hasAlpha});
})();
