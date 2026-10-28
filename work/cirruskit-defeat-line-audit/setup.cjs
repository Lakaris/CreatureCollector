const fs=require('fs'),crypto=require('crypto'),root='work/cirruskit-defeat-line-audit',previous='work/cirruskit-defeat-tail-cover';
for(const folder of ['frames','review','before','inputs'])fs.mkdirSync(`${root}/${folder}`,{recursive:true});
for(const name of fs.readdirSync('images/cirruskit'))if(name.startsWith('cirruskit_defeat'))fs.copyFileSync(`images/cirruskit/${name}`,`${root}/before/${name}`);
for(const name of ['build.cjs','publish.cjs','audit.cjs','review.cjs','preview-template.html','image-edit-prompt.txt'])fs.writeFileSync(`${root}/${name}`,fs.readFileSync(`${previous}/${name}`,'utf8').replaceAll(previous,root));
for(const name of ['normal','dazed','defeat'])fs.copyFileSync(`work/cirruskit-defeat/inputs/${name}.png`,`${root}/inputs/${name}.png`);
const protected={};for(const name of fs.readdirSync('images/cirruskit'))if(!name.startsWith('cirruskit_defeat')&&fs.statSync(`images/cirruskit/${name}`).isFile())protected[name]=crypto.createHash('sha256').update(fs.readFileSync(`images/cirruskit/${name}`)).digest('hex');fs.writeFileSync(`${root}/protected-hashes.json`,JSON.stringify(protected,null,2));
