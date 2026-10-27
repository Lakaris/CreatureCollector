const {execFileSync}=require('child_process');
for(const name of ['prepare','build','seal-sampling-gaps','finish-junction','check-belly','check-seams','review','publish'])execFileSync(process.execPath,[`work/cirruskit-walk-belly-separation/${name}.cjs`],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-rebuild/preview.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-belly-separation/audit.cjs'],{stdio:'inherit'});
