from pathlib import Path
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]

def line_center(profile, expected, radius=32):
    start = max(0, int(expected) - radius)
    stop = min(len(profile), int(expected) + radius + 1)
    local = profile[start:stop].astype(float)
    floor = np.percentile(local, 85)
    low = float(local.min())
    threshold = (floor + low) / 2
    minimum = int(np.argmin(local))
    left = minimum
    right = minimum
    while left > 0 and local[left - 1] < threshold:
        left -= 1
    while right + 1 < len(local) and local[right + 1] < threshold:
        right += 1
    lo = left - (threshold - local[left]) / max(local[left - 1] - local[left], 1e-6) if left else left
    hi = right + (threshold - local[right]) / max(local[right + 1] - local[right], 1e-6) if right + 1 < len(local) else right
    return start + (lo + hi) / 2

def luminance(arr):
    return arr[..., :3].astype(np.float32) @ np.array([.2126, .7152, .0722], dtype=np.float32)

def measure(arr, cols, rows):
    gray = luminance(arr)
    h, w = gray.shape
    xs = [line_center(np.median(gray[30:-30], axis=0), x) for x in range(200, w, 200)]
    ys = [line_center(np.median(gray[:, 30:-30], axis=1), y) for y in range(200, h, 200)]
    return {'x': xs, 'y': ys}

if __name__ == '__main__':
    for name, cols, rows in [('rocky5x8.jpg',5,8), ('rocky6x10.jpg',6,10)]:
        arr = np.asarray(Image.open(ROOT / 'images/board_backgrounds' / name).convert('RGB'))
        result = measure(arr,cols,rows)
        print(json.dumps({'file':name, 'centers':result},indent=2))
