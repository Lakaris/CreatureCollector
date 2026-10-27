const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs'),read=p=>PNG.sync.read(fs.readFileSync(p));
const base=read('images/cirruskit/cirruskit_base.png'),body=read('work/cirruskit-walk-cleanup/before-join-fix/layers/body.png');
const rows=[];for(let y=360;y<=400;y+=2){
 let grayLeft=0,oldRight=0,baseRight=0;
 for(let x=100;x<190;x++){const i=(y*512+x)*4;if(base.data[i+3]>240&&base.data[i]>70&&base.data[i]<170&&base.data[i+1]-base.data[i]<10&&base.data[i+2]-base.data[i]<30){grayLeft=x;break;}}
 for(let x=400;x<446;x++){let i=(y*512+x)*4;if(body.data[i+3]>200)oldRight=x;if(base.data[i+3]>200)baseRight=x;}
 rows.push({y,grayLeft,oldRight,baseRight});
}console.log(rows);
