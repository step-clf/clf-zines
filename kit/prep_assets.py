"""Prepare zine assets: trim/resize character art and generate paper/grain textures.

Usage: python3 prep_assets.py <raw_art_dir> <out_img_dir>
Raw art = the official character PNGs (transparent) + logo, named as below.
Writes trimmed PNGs (max 1000px) plus paper_cream.jpg, paper_copy.jpg, paper_pink.jpg,
speckle.png and grain_white.png into <out_img_dir> (the templates expect ./img/).
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

RAW, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

# raw filename (in Drive) -> template name
NAMES = {
    'Princette Purple Official.png': 'princette_purp', 'Princette Platinum Official.png': 'princette_plat',
    'Starsi Coral Official.png': 'starsi_coral', 'Starsi Rose Official.png': 'starsi_rose',
    'Jix Lavender Official.png': 'jix_lav', 'Jix Perriwinkle Official.png': 'jix_peri',
    'Zeep Green Official.png': 'zeep_green', 'Zeep Mint Official.png': 'zeep_mint',
    'Shimmers Yellow Official.png': 'shimmer',
    'Copy of morrey hop.png': 'morrie_hop', 'Copy of morrey butt.png': 'morrie_butt',
    'statsihmmm.png': 'starsi_hmm', 'starsinooooo.png': 'starsi_no',
    'CLF-LOGO-2.png': 'logo',
}
for f, n in NAMES.items():
    p = os.path.join(RAW, f)
    if not os.path.exists(p):
        print('missing', f); continue
    im = Image.open(p).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bb); im.thumbnail((1000, 1000), Image.LANCZOS)
    im.save(os.path.join(OUT, n + '.png'), optimize=True)

W, H = 1080, 1350
rng = np.random.default_rng(9)
def noise_base():
    n = rng.normal(0, 1, (H, W))
    return np.array(Image.fromarray(((n * 8) + 128).clip(0, 255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))).astype(float) - 128
def blotch(cell):
    return np.array(Image.fromarray((rng.normal(0, 1, (H // cell, W // cell)) * 30 + 128).clip(0, 255).astype('uint8')).resize((W, H), Image.BICUBIC)).astype(float) - 128
base, b2 = noise_base(), blotch(80)
for rgb, name, a, b in [((248, 243, 231), 'paper_cream', .7, .12), ((250, 240, 236), 'paper_pink', .7, .12), ((232, 231, 226), 'paper_copy', .9, .18)]:
    arr = np.zeros((H, W, 3))
    for i, c in enumerate(rgb): arr[..., i] = c + base * a + b2 * b
    Image.fromarray(arr.clip(0, 255).astype('uint8')).save(os.path.join(OUT, name + '.jpg'), quality=90)
sp = Image.fromarray((rng.random((H, W)) > 0.9993).astype('uint8') * 255).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
o = Image.new('RGBA', (W, H), (20, 20, 20, 0)); o.putalpha(sp.point(lambda v: int(v * .8))); o.save(os.path.join(OUT, 'speckle.png'))
g = Image.fromarray((rng.random((H, W)) * 255).astype('uint8')).point(lambda v: 255 if v > 200 else 0)
o = Image.new('RGBA', (W, H), (255, 255, 255, 0)); o.putalpha(g.point(lambda v: v * .35)); o.save(os.path.join(OUT, 'grain_white.png'))
print('done')
