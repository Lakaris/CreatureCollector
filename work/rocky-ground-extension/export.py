from pathlib import Path
import json
import hashlib
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont

work = Path(__file__).resolve().parent
root = work.parents[1]
spec = json.loads((work/'prompt.json').read_text(encoding='utf-8'))
destination = root/spec['destination']
original_hash = hashlib.sha256(destination.read_bytes()).hexdigest()
with Image.open(spec['source']) as source:
    output = ImageOps.fit(source.convert('RGB'), (1536,2048), method=Image.Resampling.LANCZOS)
    output.save(work/'rocky.jpg',quality=95,subsampling=0)
with Image.open(work/'rocky.jpg') as saved:
    assert saved.size == (1536,2048) and saved.format == 'JPEG'
    pixels=np.asarray(saved)
    mean=[round(float(v),2) for v in pixels.mean(axis=(0,1))]
    preview=ImageOps.fit(saved,(920,720),method=Image.Resampling.LANCZOS)
    board=Image.open(root/'images/board_backgrounds/rocky5x8.jpg').convert('RGB')
    board.thumbnail((320,512),Image.Resampling.LANCZOS)
    preview.paste(board,((920-board.width)//2,65))
    # This is a layout preview only; the delivered background contains no board.
    preview.save(work/'preview-with-board.jpg',quality=94,subsampling=0)
    small=saved.copy()
    small.thumbnail((384,512),Image.Resampling.LANCZOS)
    small.save(work/'preview.jpg',quality=94)
report={'destination':str(destination),'original_sha256':original_hash,'width':1536,'height':2048,'format':'JPEG','mean_rgb':mean,'bytes':(work/'rocky.jpg').stat().st_size,'note':'Standalone overhead ground background; the grid and existing board art remain separate assets.'}
(work/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
