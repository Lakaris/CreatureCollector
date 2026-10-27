const fs = require('fs');
const {PNG} = require('C:/Users/Annie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const path = 'work/cirruskit-walk-cleanup/layers/body.png';
const p = PNG.sync.read(fs.readFileSync(path));
// The old cutout left a short dotted stroke inside this otherwise uninterrupted
// gray patch. Reconstruct only that 13-by-10 patch from its clean row endpoints.
for (let y = 369; y <= 378; y++) {
  const left = (y * 512 + 267) * 4;
  const right = (y * 512 + 281) * 4;
  for (let x = 268; x <= 280; x++) {
    const t = (x - 267) / 14, i = (y * 512 + x) * 4;
    for (let c = 0; c < 3; c++) p.data[i+c] = Math.round(p.data[left+c] * (1-t) + p.data[right+c] * t);
    p.data[i+3] = 255;
  }
}
fs.writeFileSync(path, PNG.sync.write(p));
console.log('Removed the residual dotted belly stroke (130 pixels).');
