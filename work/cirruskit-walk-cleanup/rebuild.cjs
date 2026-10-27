const {execFileSync}=require('child_process');
for(const name of ['prepare-layers','clean-belly','fix-joins','finish-layers','build','review','check-layers','check-joins','publish','prepare-audit'])execFileSync(process.execPath,[`work/cirruskit-walk-cleanup/${name}.cjs`],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-rebuild/preview.cjs'],{stdio:'inherit'});
execFileSync(process.execPath,['work/cirruskit-walk-cleanup/audit.cjs'],{stdio:'inherit'});
