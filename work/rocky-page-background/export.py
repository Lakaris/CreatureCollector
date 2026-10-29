from pathlib import Path
import json
from PIL import Image, ImageOps

work = Path(__file__).resolve().parent
root = work.parents[1]
spec = json.loads((work / 'prompt.json').read_text(encoding='utf-8'))
destination = root / spec['destination']
if destination.exists():
    raise FileExistsError(destination)
destination.parent.mkdir(parents=True, exist_ok=True)
with Image.open(spec['source']) as image:
    output = ImageOps.fit(image.convert('RGB'), (spec['width'], spec['height']), method=Image.Resampling.LANCZOS)
    output.save(destination, quality=95, subsampling=0)
with Image.open(destination) as saved:
    assert saved.format == 'JPEG'
    assert saved.size == (1536,2048)
    assert saved.mode == 'RGB'
    preview = saved.copy()
    preview.thumbnail((384,512), Image.Resampling.LANCZOS)
    preview.save(work / 'preview.jpg', quality=94)
    verification = dict(path=str(destination),width=saved.width,height=saved.height,format=saved.format,mode=saved.mode,bytes=destination.stat().st_size)
(work / 'verification.json').write_text(json.dumps(verification,indent=2),encoding='utf-8')
print(json.dumps(verification))
