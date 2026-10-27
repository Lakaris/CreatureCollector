const {execFileSync}=require('child_process');
for(const name of ['prepare','build','publish','preview','audit'])execFileSync(process.execPath,[`work/cirruskit-attack/${name}.cjs`],{stdio:'inherit'});
