#!/usr/bin/env python3
"""Slice through LINE-1 (WORD) + save a zoomed crop of the WORD line for VLM."""
from PIL import Image, ImageDraw, ImageFont
import numpy as np

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
a = np.array(src)
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)

def cls_at(y, x):
    if b[y, x] > 150 and b[y, x] - r[y, x] > 60:
        return 'BLUE'
    if r[y, x] > 230 and g[y, x] > 230 and b[y, x] > 230:
        return 'WHITE'
    if b[y, x] < 150 and b[y, x] - r[y, x] > 12:
        return 'NAVY'
    return 'other'

for y in (300, 307, 314):
    print(f'\n--- slice y={y} (LINE-1) ---')
    prev = None
    for x in range(85, 545):
        c = cls_at(y, x)
        if c != prev:
            print(f'  x={x}: {c} rgb{tuple(int(v) for v in a[y, x])}')
            prev = c

# zoomed crop of LINE-1 with grid
crop = src.crop((74, 262, 560, 340))
crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
d = ImageDraw.Draw(crop)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except Exception:
    font = ImageFont.load_default()
for gx in range(100, 560, 50):
    px = (gx - 74) * 2
    d.line([(px, 0), (px, crop.height)], fill=(255, 0, 0), width=2)
    d.text((px + 3, 3), str(gx), fill=(255, 0, 0), font=font)
crop.save('/home/z/my-project/scripts/ref_word_line.png')
print('\nsaved scripts/ref_word_line.png')
