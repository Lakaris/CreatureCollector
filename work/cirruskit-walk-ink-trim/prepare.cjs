const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-ink-trim',prior='work/cirruskit-walk-belly-separation',p=PNG.sync.read(fs.readFileSync(`${prior}/layers/farFront.png`)),original=Buffer.from(p.data),changes=[];
// Trim only the inward-facing nib at the join of the existing two leg cutouts.
// Retain the outer silhouette and interpolate into the adjacent leg color.
for(let y=411;y<=418;y++)for(let x=374;x<=379;x++){
 const i=(y*512+x)*4;if(original[i+3]<240||original[i]>90)continue;
 const edge=376.5-.32*(y-410),keep=Math.max(0,Math.min(1,edge+.5-x));if(keep===1)continue;
 const j=(y*512+384)*4;
 for(let c=0;c<3;c++)p.data[i+c]=Math.round(original[i+c]*keep+original[j+c]*(1-keep));
 changes.push({x,y});
}
fs.writeFileSync(`${root}/layers/farFront.png`,PNG.sync.write(p));fs.writeFileSync(`${root}/source-trim.json`,JSON.stringify(changes,null,2));
let code=fs.readFileSync(`${prior}/build.cjs`,'utf8').replaceAll(`root='${prior}'`,`root='${root}'`);
code=code.replace('let chestEdges;',`const originalLeg=read('${prior}/layers/farFront.png'),correctionReport=[];\nlet chestEdges;`);
const marker="if(n===0){fs.writeFileSync(`${root}/rest-composite.png`,PNG.sync.write(out));}";
const correction=`const correctedLeg=layers.farFront;layers.farFront=originalLeg;const rawBefore=new PNG({width:S,height:S});for(const name of ['tail','farHind','farFront','body','belly','nearHind','nearFront','hip-cover','foreground'])draw(rawBefore,name,pose);layers.farFront=correctedLeg;
const delivered=read('${prior}/frames/frame-'+n+'.png'),changed=[];
for(let k=0;k<S*S;k++){const i=k*4;if(n>0&&!rawBefore.data.subarray(i,i+4).equals(out.data.subarray(i,i+4))&&delivered.data.subarray(i,i+4).equals(rawBefore.data.subarray(i,i+4))){out.data.copy(delivered.data,i,i,i+4);changed.push([k%S,Math.floor(k/S)]);}}
correctionReport.push({frame:n+1,changedPixels:changed.length,locations:changed});delivered.data.copy(out.data);`;
if(!code.includes(marker))throw Error('Renderer insertion point changed');code=code.replace(marker,correction+marker).replace("fs.writeFileSync(`${root}/poses.json`", "fs.writeFileSync(`${root}/correction-report.json`,JSON.stringify(correctionReport,null,2));\nfs.writeFileSync(`${root}/poses.json`");
fs.writeFileSync(`${root}/build.cjs`,code);
console.log({sourcePixelsTrimmed:changes.length});
