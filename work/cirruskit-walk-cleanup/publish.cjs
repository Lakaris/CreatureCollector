const fs = require('fs'), assert = require('assert');
const {PNG} = require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const root = 'work/cirruskit-walk-cleanup', dir = 'images/cirruskit';
const meta = JSON.parse(fs.readFileSync(`${root}/before/cirruskit_move.json`));
assert.deepStrictEqual(JSON.parse(fs.readFileSync(`${root}/poses.json`)), JSON.parse(fs.readFileSync(`${root}/before/poses.json`)));
assert.deepStrictEqual(JSON.parse(fs.readFileSync(`${root}/rig.json`)), JSON.parse(fs.readFileSync(`${root}/before/rig.json`)));
const sheet = new PNG({width: meta.columns * 512, height: meta.rows * 512});
for (const frame of meta.frames) {
  const p = PNG.sync.read(fs.readFileSync(`${root}/frames/frame-${frame.index}.png`));
  assert.equal(p.width,512); assert.equal(p.height,512);
  for (let y=0;y<512;y++) p.data.copy(sheet.data, ((frame.y+y)*sheet.width+frame.x)*4, y*2048, (y+1)*2048);
}
meta.notes = 'Walk-in-place with synchronized diagonal pairs. Original gait, pivots, frame order, and 30 x 50ms timing retained. Cleaned independent leg artwork has complete dark outlines and opaque interiors; torso and belly details remain on stationary body layers. Original face, mane, and tail artwork retained. Read left to right, top to bottom. No duplicate final frame.';
fs.writeFileSync(`${dir}/cirruskit_move.png`, PNG.sync.write(sheet));
fs.writeFileSync(`${dir}/cirruskit_move.json`, JSON.stringify(meta,null,2)+'\n');
console.log('Replaced the move spritesheet; gait and timing unchanged.');
