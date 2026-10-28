const fs=require('fs'),{PNG}=require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs'),root='work/cirruskit-defeat-line-audit',S=512,read=p=>PNG.sync.read(fs.readFileSync(p)),base=read('images/cirruskit/cirruskit_base.png');
const isGray=(p,i)=>p.data[i]>85&&p.data[i]<170&&Math.abs(p.data[i]-p.data[i+1])<18&&p.data[i+2]>p.data[i];
function background(x,y){const i=(y*S+x)*4;if(isGray(base,i))return [...base.data.subarray(i,i+3)];let sum=[0,0,0],weight=0;for(let r=2;r<=20;r+=2){for(let dy=-r;dy<=r;dy+=r)for(let dx=-r;dx<=r;dx+=r){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx<0||xx>511||yy<0||yy>511)continue;const j=(yy*S+xx)*4;if(!isGray(base,j))continue;const w=1/(dx*dx+dy*dy);for(let c=0;c<3;c++)sum[c]+=base.data[j+c]*w;weight+=w;}if(weight&&r>=8)break;}return weight?sum.map(v=>Math.round(v/weight)):[126,124,141];}
for(const name of ['dazed','defeat']){const p=read(`work/cirruskit-defeat/inputs/${name}.png`),original=Buffer.from(p.data);let mouthKeep=new Uint8Array(S*S);
 if(name==='defeat'){
  const seen=new Uint8Array(S*S);let largest=[];const candidate=k=>{const i=k*4,r=p.data[i],g=p.data[i+1],b=p.data[i+2];return r<75&&g<55||r>160&&r>g*1.25&&b>65;};
  for(let y=263;y<304;y++)for(let x=366;x<449;x++){const k=y*S+x;if(seen[k]||!candidate(k))continue;const q=[k];seen[k]=1;for(let a=0;a<q.length;a++){const j=q[a],xx=j%S,yy=j>>9;for(const [nx,ny]of [[xx-1,yy],[xx+1,yy],[xx,yy-1],[xx,yy+1]]){if(nx<366||nx>=449||ny<263||ny>=304)continue;const v=ny*S+nx;if(!seen[v]&&candidate(v)){seen[v]=1;q.push(v);}}}if(q.length>largest.length)largest=q;}
  for(const k of largest){const x=k%S,y=k>>9;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)mouthKeep[(y+dy)*S+x+dx]=1;}
  // Replace the patch's surrounding gray with the original face. Keep only
  // the connected mouth and its one-pixel antialiased boundary.
  for(let y=260;y<304;y++)for(let x=362;x<449;x++){const i=(y*S+x)*4;if(mouthKeep[y*S+x])continue;const r=base.data[i],g=base.data[i+1],b=base.data[i+2],nose=r>g*1.35&&g>b*1.3&&x>=385&&x<=426&&y<267;if(nose)base.data.copy(p.data,i,i,i+3);else if(x<381&&y>292||x>440&&y>283)base.data.copy(p.data,i,i,i+3);else p.data.set(background(x,y),i);}
 }
 // Restore the unchanged nose and the gray immediately around it, including
 // the ghost arc left by the shifted generated nose in the right-eye patch.
 for(let y=231;y<273;y++)for(let x=381;x<439;x++){const i=(y*S+x)*4,r=original[i],g=original[i+1],b=original[i+2],newEye=x>=423&&y<246&&r<75&&g<55;if(newEye||mouthKeep[y*S+x])continue;const br=base.data[i],bg=base.data[i+1],bb=base.data[i+2],nose=br>bg*1.35&&bg>bb*1.3;if(name==='dazed'&&y>=263){base.data.copy(p.data,i,i,i+3);continue;}if(nose||isGray(base,i))base.data.copy(p.data,i,i,i+3);else p.data.set(background(x,y),i);}
 fs.writeFileSync(`${root}/inputs/${name}.png`,PNG.sync.write(p));
}
console.log('Cleaned nose remnants, mouth surround and cheek dot in the expression masters.');
