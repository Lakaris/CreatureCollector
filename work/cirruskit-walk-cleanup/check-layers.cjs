const fs=require('fs'),assert=require('assert'),crypto=require('crypto');
const {PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root='work/cirruskit-walk-cleanup',read=p=>PNG.sync.read(fs.readFileSync(p)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const poses=JSON.parse(fs.readFileSync(`${root}/poses.json`));
assert.deepStrictEqual(poses,JSON.parse(fs.readFileSync(`${root}/before/poses.json`)));
assert.deepStrictEqual(JSON.parse(fs.readFileSync(`${root}/rig.json`)),JSON.parse(fs.readFileSync(`${root}/before/rig.json`)));
for(const name of ['tail','foreground'])assert.equal(hash(`${root}/layers/${name}.png`),hash(`${root}/before/${name}.png`));
const limbs={};
for(const name of ['nearHind','nearFront','farHind','farFront']){
  const p=read(`${root}/layers/${name}.png`);let top=512,bottom=0,opaqueInterior=0,translucentInterior=0,outlinedRows=0,failures=[];
  for(let y=0;y<512;y++)for(let x=0;x<512;x++)if(p.data[(y*512+x)*4+3]>=200){top=Math.min(top,y);bottom=Math.max(bottom,y);}
  const dark=(x,y)=>{const i=(y*512+x)*4;return p.data[i+3]>=100&&p.data[i]<90&&p.data[i+1]<75&&p.data[i+2]<95;};
  for(let y=top+6;y<=bottom-3;y++){
    let left=512,right=-1;
    for(let x=0;x<512;x++)if(p.data[(y*512+x)*4+3]>=200){left=Math.min(left,x);right=Math.max(right,x);}
    if(right-left<8)continue;
    const l=[0,1,2,3].some(d=>dark(left+d,y)),r=[0,1,2,3].some(d=>dark(right-d,y));
    if(l&&r)outlinedRows++;else failures.push({y,left,right,leftOutlined:l,rightOutlined:r});
    for(let x=left+3;x<=right-3;x++){
      let inside=true;
      for(let dy=-3;dy<=3&&inside;dy++)for(let dx=-3;dx<=3;dx++)if(p.data[((y+dy)*512+x+dx)*4+3]<16){inside=false;break;}
      if(inside){if(p.data[(y*512+x)*4+3]<245)translucentInterior++;else opaqueInterior++;}
    }
  }
  limbs[name]={outlinedRows,outlineFailures:failures,opaqueInterior,translucentInterior};
  assert.equal(failures.length,0,`${name}: incomplete outline`);assert.equal(translucentInterior,0,`${name}: translucent interior`);
}
const cover=read(`${root}/layers/hip-cover.png`),foreground=read(`${root}/layers/foreground.png`);let fixedBellyChecks=0;
for(let n=0;n<30;n++){
  const p=read(`${root}/frames/frame-${n}.png`),bob=poses[n].bob;
  for(let y=330;y<410;y++)for(let x=125;x<374;x++){
    const i=(y*512+x)*4,j=((y+bob)*512+x)*4;
    if(cover.data[i+3]>=250&&foreground.data[i+3]===0){
      assert(cover.data.subarray(i,i+4).equals(p.data.subarray(j,j+4)),`Belly moved with a leg at ${n}:${x},${y}`);fixedBellyChecks++;
    }
  }
}
const report={gaitAndPivotsUnchanged:true,tailAndForegroundLayersUnchanged:true,limbs,fixedBellyPixelChecks:fixedBellyChecks};
fs.writeFileSync(`${root}/layer-audit.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
