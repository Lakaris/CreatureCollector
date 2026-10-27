const {execFileSync}=require('child_process');
for(const name of ['prepare-rig','refine-joints','complete-far-leg','clean-layers','build','publish','preview','audit'])execFileSync(process.execPath,[`work/cirruskit-walk-rebuild/${name}.cjs`],{stdio:'inherit'});
