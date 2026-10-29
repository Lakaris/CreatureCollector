"""Precisely resample the supplied board art onto a 200-pixel grid."""
from pathlib import Path
import argparse
import hashlib
import json
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from measure import line_center, luminance, measure

ROOT = Path(__file__).resolve().parents[2]
WORK = Path(__file__).resolve().parent
ASSETS = ROOT / 'images/board_backgrounds'
STAGED = WORK / 'staged'
BACKUP = WORK / 'originals'
SPECS = [('rocky5x8.jpg', 5, 8, 1000), ('rocky6x10.jpg', 6, 10, 1200)]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def straighten_axis(arr, centers, crossing_centers):
    """Straighten horizontal lines; transposition reuses this for columns."""
    h, w, _ = arr.shape
    gray = luminance(arr)
    valid = np.arange(24, w - 24)
    for cross in crossing_centers:
        valid = valid[np.abs(valid - cross) > 18]
    target = np.array([0, 24] + [200 * (i + 1) for i in range(len(centers))] + [h - 25, h - 1], dtype=np.float32)
    curves = [np.zeros(w, dtype=np.float32), np.full(w, 24, dtype=np.float32)]
    for center in centers:
        samples = np.array([line_center(gray[:, x], center, 20) for x in valid])
        curve = np.interp(np.arange(w), valid, samples)
        curves.append(curve.astype(np.float32))
    curves += [np.full(w, h - 25, dtype=np.float32), np.full(w, h - 1, dtype=np.float32)]
    curves = np.stack(curves)
    mapping = np.zeros((h, w), dtype=np.float32)
    for i in range(len(target) - 1):
        first, last = int(target[i]), int(target[i + 1])
        ys = np.arange(first, last + 1)
        ratio = ((ys - first) / (last - first)).astype(np.float32)[:, None]
        mapping[ys] = curves[i] + ratio * (curves[i + 1] - curves[i])
    lower = np.floor(mapping).astype(np.int32)
    upper = np.minimum(lower + 1, h - 1)
    fraction = (mapping - lower)[..., None]
    xs = np.arange(w)[None, :]
    return arr[lower, xs] * (1 - fraction) + arr[upper, xs] * fraction

def check_grid(path, cols, rows, divider=None):
    with Image.open(path) as image:
        assert image.format == 'JPEG'
        assert image.size == (cols * 200, rows * 200)
        arr = np.asarray(image.convert('RGB'))
    gray = luminance(arr)
    errors = []
    for y in range(200, rows * 200, 200):
        for x in range(50, cols * 200, 50):
            if x % 200 == 0:
                continue
            errors.append(abs(line_center(gray[:, x], y, 16) - y))
    for x in range(200, cols * 200, 200):
        for y in range(50, rows * 200, 50):
            if y % 200 == 0:
                continue
            errors.append(abs(line_center(gray[y], x, 16) - x))
    result = measure(arr, cols, rows)
    maximum = max(errors)
    if maximum > .5:
        raise RuntimeError(f'{path.name}: grid drift exceeds half a pixel: {maximum:.4f}')
    return dict(width=cols*200, height=rows*200, format='JPEG',
                x_centers=[round(v,3) for v in result['x']],
                y_centers=[round(v,3) for v in result['y']],
                checked_cross_sections=len(errors), max_center_error_px=round(maximum,4),
                purple_divider_y=divider)

def purple_variant(arr, y):
    result = arr.astype(np.float32).copy()
    h, w, _ = result.shape
    # Symmetric ten-pixel stroke, centered on the exact target coordinate.
    stroke = np.clip(5.5 - np.abs(np.arange(h) - y), 0, 1).astype(np.float32)
    alpha = stroke[:, None, None]
    color = np.array([96, 80, 184], dtype=np.float32)
    result[:, 14:w-14] = result[:, 14:w-14] * (1-alpha) + color * alpha
    return result

def save_jpeg(arr, path):
    Image.fromarray(np.clip(np.rint(arr),0,255).astype(np.uint8)).save(path, quality=97, subsampling=0)

def make_preview():
    canvas = Image.new('RGB', (1020, 470), '#f2f0ec')
    draw = ImageDraw.Draw(canvas)
    font_path = Path('C:/Windows/Fonts/segoeui.ttf')
    font = ImageFont.truetype(str(font_path), 15)
    names = [('rocky5x8.jpg','5 x 8 / Regular grid'), ('rocky5x8purple.jpg','5 x 8 / Purple divider'),
             ('rocky6x10.jpg','6 x 10 / Regular grid'), ('rocky6x10purple.jpg','6 x 10 / Purple divider')]
    for i,(filename,label) in enumerate(names):
        x = 18 + 252*i
        draw.text((x,12),label,font=font,fill='#36212d')
        image = Image.open(STAGED / filename)
        image.thumbnail((234,410), Image.Resampling.LANCZOS)
        canvas.paste(image,(x,42))
    canvas.save(WORK / 'preview.jpg', quality=94)

def build():
    STAGED.mkdir(parents=True, exist_ok=True)
    report = {'method':'Per-row and per-column geometric resampling; line centers constrained to exact multiples of 200 pixels. No generative redraw. Purple variants share the corrected base artwork.', 'sources':[], 'outputs':[]}
    for filename,cols,rows,divider in SPECS:
        path = ASSETS / filename
        source = np.asarray(Image.open(path).convert('RGB'), dtype=np.float32)
        assert source.shape[:2] == (rows*200,cols*200)
        before = measure(source,cols,rows)
        report['sources'].append({'file':filename,'sha256':digest(path),'measured_centers':before})
        corrected = straighten_axis(source,before['y'],before['x'])
        corrected = straighten_axis(corrected.transpose(1,0,2),before['x'],list(range(200,rows*200,200))).transpose(1,0,2)
        for name,data,line in [(filename,corrected,None), (filename.replace('.jpg','purple.jpg'),purple_variant(corrected,divider),divider)]:
            staged = STAGED / name
            save_jpeg(data,staged)
            verification = check_grid(staged,cols,rows,line)
            report['outputs'].append({'file':name,'sha256':digest(staged),**verification})
    (WORK / 'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    make_preview()
    print(json.dumps(report,indent=2))

def publish():
    report = json.loads((WORK / 'verification.json').read_text(encoding='utf-8'))
    for entry in report['sources']:
        assert digest(ASSETS / entry['file']) == entry['sha256'], 'Source changed since measurement.'
    for entry in report['outputs']:
        assert digest(STAGED / entry['file']) == entry['sha256'], 'Staged output changed.'
        if 'purple' in entry['file']:
            assert not (ASSETS / entry['file']).exists(), 'Purple variant already exists.'
    BACKUP.mkdir(exist_ok=True)
    for entry in report['sources']:
        target = BACKUP / entry['file']
        assert not target.exists(), 'Backup already exists.'
        shutil.copy2(ASSETS / entry['file'],target)
        assert digest(target) == entry['sha256']
    for entry in report['outputs']:
        shutil.copy2(STAGED / entry['file'],ASSETS / entry['file'])
        assert digest(ASSETS / entry['file']) == entry['sha256']
    print('Published four verified JPGs. The two originals are backed up in '+str(BACKUP))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--publish',action='store_true')
    args = parser.parse_args()
    publish() if args.publish else build()
