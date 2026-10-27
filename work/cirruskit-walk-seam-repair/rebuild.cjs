const {execFileSync}=require('child_process');
for(const name of ['prepare','build','seal-sampling-gaps','review','check-seams','publish'])execFileSync(process.execPath,[`work/cirruskit-walk-seam-repair/${name}.cjs`],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-rebuild/preview.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-seam-repair/audit.cjs'],{stdio:'inherit'});
