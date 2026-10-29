(async()=>{
 require('./audit-flippers.cjs');
 require('./audit-hand-motion.cjs');
 await require('./animate-fuse.cjs').build();
 require('./publish-face-fix.cjs');
})().catch(error=>{console.error(error);process.exit(1);});
