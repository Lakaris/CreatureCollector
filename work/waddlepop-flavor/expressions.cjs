const fs=require('fs');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/waddlepop-flavor',read=p=>PNG.sync.read(fs.readFileSync(p));
const states=Array(30).fill('base');
// The first squeeze anticipates the rightward fumble. Two short mouth-opening
// beats follow the two wobbles, then the eyes reopen as the bomb settles.
const cues={8:'half',9:'squeezed-small',10:'squeezed-open',11:'squeezed-open',12:'squeezed-open',13:'squeezed-small',14:'squeezed-small',15:'squeezed-closed',16:'squeezed-small',17:'squeezed-open',18:'squeezed-open',19:'squeezed-open',20:'squeezed-small',21:'squeezed-closed',22:'half'};
for(const [frame,state]of Object.entries(cues))states[Number(frame)-1]=state;
const faces={base:read(root+'/base.png')};
for(const name of new Set(states))if(name!=='base')faces[name]=read(root+'/expressions/'+name+'.png');
const mask=read(root+'/expressions/feature-mask.png');
function characters(source){const result={base:source};for(const [name,face]of Object.entries(faces)){if(name==='base')continue;const im=PNG.sync.read(PNG.sync.write(source));for(let k=0;k<im.data.length;k+=4)if(mask.data[k+3])for(let c=0;c<3;c++)im.data[k+c]=face.data[k+c];result[name]=im;}return result;}
module.exports={states,faces,mask,characters};
