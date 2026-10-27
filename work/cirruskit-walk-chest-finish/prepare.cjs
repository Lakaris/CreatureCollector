const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-chest-finish',base=PNG.sync.read(fs.readFileSync('images/cirruskit/cirruskit_base.png')),leg=new PNG({width:512,height:512});
const poly=[[351,340],[477,340],[482,475],[391,475],[379,457],[368,427],[362,402],[357,381]];
function inside(x,y){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
for(let y=340;y<475;y++)for(let x=350;x<483;x++){
 let coverage=0;for(let yy=0;yy<4;yy++)for(let xx=0;xx<4;xx++)if(inside(x+(xx+.5)/4,y+(yy+.5)/4))coverage++;
 if(!coverage)continue;const i=(y*512+x)*4;base.data.copy(leg.data,i,i,i+4);leg.data[i+3]=Math.round(leg.data[i+3]*coverage/16);
}
fs.writeFileSync(`${root}/layers/farFront.png`,PNG.sync.write(leg));
let build=fs.readFileSync('work/cirruskit-walk-seam-repair/build.cjs','utf8').replace("root='work/cirruskit-walk-seam-repair'","root='work/cirruskit-walk-chest-finish'").replace("['tail','farHind','farFront','body','nearHind','nearFront','hip-cover','foreground']","['tail','farHind','body','farFront','nearHind','nearFront','hip-cover','foreground']");
fs.writeFileSync(`${root}/build.cjs`,build);
for(const name of ['review','seal-sampling-gaps','check-seams'])fs.writeFileSync(`${root}/${name}.cjs`,fs.readFileSync(`work/cirruskit-walk-seam-repair/${name}.cjs`,'utf8').replaceAll("root='work/cirruskit-walk-seam-repair'","root='work/cirruskit-walk-chest-finish'"));
