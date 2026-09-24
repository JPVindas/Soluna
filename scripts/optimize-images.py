"""Create responsive web derivatives; keep all supplied source artwork intact."""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
OUTPUT = PUBLIC / 'optimized'
OUTPUT.mkdir(exist_ok=True)
inventory = json.loads((ROOT / 'lib/inventory.json').read_text(encoding='utf-8-sig'))
sources = {p['image'] for p in inventory if p.get('image')}
sources.update(['/images/hero-soluna-signature.webp', '/images/hero-gold-splash.png', '/images/hero-rose.png'])
manifest = {}
original_bytes = derivative_bytes = 0
for source in sorted(sources):
    path = PUBLIC / source.lstrip('/')
    with Image.open(path) as opened:
        image = ImageOps.exif_transpose(opened).convert('RGBA' if 'A' in opened.getbands() or 'transparency' in opened.info else 'RGB')
        sizes = (768, 1440, 1920) if '/images/hero-' in source else (320, 640, 960)
        variants = []
        for width in sorted({min(size, image.width) for size in sizes}):
            height = round(image.height * width / image.width)
            output = OUTPUT / f'{path.stem}-{width}.webp'
            if not output.exists() or output.stat().st_mtime < max(path.stat().st_mtime, Path(__file__).stat().st_mtime):
                image.resize((width, height), Image.Resampling.LANCZOS).save(output, 'WEBP', quality=88, method=6)
            variants.append({'src': '/optimized/' + output.name, 'width': width})
        manifest[source] = {'width': image.width, 'height': image.height, 'variants': variants}
        original_bytes += path.stat().st_size
        derivative_bytes += (PUBLIC / variants[-1]['src'].lstrip('/')).stat().st_size
(ROOT / 'lib/image-variants.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'images': len(sources), 'original_bytes': original_bytes, 'largest_derivatives_bytes': derivative_bytes, 'reduction_percent': round((1-derivative_bytes/original_bytes)*100, 1)}))
