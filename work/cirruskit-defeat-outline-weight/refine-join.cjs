const fs=require('fs'),p='work/cirruskit-defeat-outline-weight/build.cjs';let s=fs.readFileSync(p,'utf8');const start=s.indexOf('function connectRearStroke'),end=s.indexOf('function closeManeJoin',start);s=s.slice(0,start)+`function connectRearStroke(out,p){
 const start=Math.round(map('body',145,345,p)[1]),end=Math.round(map('nearHind',125,430,p)[1]),edge=[];
 for(let y=start-10;y<=end+10;y++){for(let x=40;x<225;x++)if(out.rearMask[y*S+x]>=128){edge[y]=x-.5;break;}}
 const smoothEdge=y=>{let sum=0,count=0;for(let j=-7;j<=7;j++)if(edge[y+j]!==undefined){const w=8-Math.abs(j);sum+=edge[y+j]*w;count+=w;}return sum/count;},points=[];
 for(let y=start;y<=end;y++){if(edge[y]===undefined)continue;const left=smoothEdge(y),slope=(smoothEdge(y+1)-smoothEdge(y-1))/2,norm=Math.sqrt(1+slope*slope);points.push([left+5/norm,y-5*slope/norm]);}
 const field=new Float32Array(S*S);field.fill(1000);for(let n=1;n<points.length;n++){const A=points[n-1],B=points[n],dx=B[0]-A[0],dy=B[1]-A[1],len=dx*dx+dy*dy;for(let y=Math.floor(Math.min(A[1],B[1])-6);y<=Math.ceil(Math.max(A[1],B[1])+6);y++)for(let x=Math.floor(Math.min(A[0],B[0])-6);x<=Math.ceil(Math.max(A[0],B[0])+6);x++){const t=Math.max(0,Math.min(1,((x-A[0])*dx+(y-A[1])*dy)/(len||1))),d=Math.hypot(x-A[0]-t*dx,y-A[1]-t*dy),k=y*S+x;if(d<field[k])field[k]=d;}}
 for(let k=0;k<field.length;k++){const coverage=Math.max(0,Math.min(1,5.5-field[k]));if(coverage)blend(out,k*4,[30*coverage,2*coverage,12*coverage,coverage]);}
}
`+s.slice(end);fs.writeFileSync(p,s);
