const fs=require('fs'),sharp=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-transition-repair',base=PNG.sync.read(fs.readFileSync('images/cirruskit/cirruskit_base.png')),cleanup=PNG.sync.read(fs.readFileSync(`${root}/generated-cleanup.png`)),bottom=new Int16Array(512).fill(-1);
for(let y=240;y<=398;y++)for(let x=201;x<490;x++){const i=(y*512+x)*4,[r,g,b,a]=base.data.subarray(i,i+4);if(a>0&&r>120&&g>110&&r-b>18&&g-b>10)bottom[x]=y;}
const border=Array.from(bottom);for(let x=201;x<440;x++){let max=-1;for(let dx=-2;dx<=2;dx++)max=Math.max(max,bottom[x+dx]||-1);if(max>=0)border[x]=max+2;}
const outer=[[435,374],[440,374],[445,374],[450,371],[455,367],[460,359],[465,351],[470,348],[475,344],[480,337],[485,320],[511,310]];
for(let k=0;k<outer.length-1;k++){const a=outer[k],b=outer[k+1];for(let x=a[0];x<=b[0];x++)border[x]=Math.ceil(a[1]+(x-a[0])/(b[0]-a[0])*(b[1]-a[1]));}
const headPolygon=[[220,-1],[512,-1],[512,310],[480,300],[451,308],[412,318],[365,319],[320,311],[278,300],[248,282],[230,259],[216,244],[214,212],[220,190]];
function inside(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
const body=new PNG({width:512,height:512}),group=new PNG({width:512,height:512});
for(let y=0;y<512;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,head=inside(x,y,headPolygon),collar=(y>=240&&x>=201&&border[x]>=0&&y<=border[x]),shoulder=(x>=197&&x<=215&&y>=242&&y<=281);base.data.copy((head||collar||shoulder?group:body).data,i,i,i+4);}
function paste(out,p,dy=0){for(let y=0;y<512-dy;y++)for(let x=0;x<512;x++){const i=(y*512+x)*4,j=((y+dy)*512+x)*4,a=p.data[i+3];if(!a)continue;if(a>=245||!out.data[j+3])p.data.copy(out.data,j,i,i+4);else{const sa=a/255,da=out.data[j+3]/255,alpha=sa+da*(1-sa);for(let c=0;c<3;c++)out.data[j+c]=Math.round((p.data[i+c]*sa+out.data[j+c]*da*(1-sa))/alpha);out.data[j+3]=Math.round(alpha*255);}}}
const out=new PNG({width:512,height:512});paste(out,body);paste(out,group,28);
// Use only the local transparency repair from ImageGen; retain the source RGB artwork.
let cleaned=0;for(let y=245;y<287;y++)for(let x=194;x<218;x++){const i=(y*512+x)*4;if(out.data[i]<80&&out.data[i+1]<60&&out.data[i+2]<80&&cleanup.data[i+3]<out.data[i+3]){out.data[i+3]=cleanup.data[i+3];if(!out.data[i+3])out.data.fill(0,i,i+4);cleaned++;}}
fs.writeFileSync(`${root}/fixed-body.png`,PNG.sync.write(body));fs.writeFileSync(`${root}/fixed-head-mane.png`,PNG.sync.write(group));fs.writeFileSync(`${root}/fixed.png`,PNG.sync.write(out));
(async()=>{await sharp(`${root}/fixed.png`).flatten({background:'#f3f1f7'}).png().toFile(`${root}/fixed-light.png`);await sharp(`${root}/fixed.png`).extract({left:185,top:245,width:315,height:190}).resize(1260,760,{kernel:'nearest'}).flatten({background:'#f3f1f7'}).png().toFile(`${root}/fixed-detail.png`);})();console.log({cleaned});

