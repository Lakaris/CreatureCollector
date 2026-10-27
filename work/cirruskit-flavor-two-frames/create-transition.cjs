const {execFileSync}=require('child_process');
for(const name of ['fix-transition','apply-local-repair','finish']) execFileSync(process.execPath,[`work/cirruskit-transition-repair/${name}.cjs`],{stdio:'inherit'});
