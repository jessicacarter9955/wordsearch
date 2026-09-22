#!/usr/bin/env python3
"""Fine 10px grid on the reference lens area for precise VLM edge reading."""
from PIL import Image, ImageDraw, ImageFont

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
x0, y0, x1, y1 = 360, 250, 570, 430
crop = src.crop((x0, y0, x1, y1))
scale = 4
crop = crop.resize((crop.width * scale, crop.height * scale), Image.LANCZOS)
d = ImageDraw.Draw(crop)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
except Exception:
    font = small = ImageFont.load_default()

# major gridlines every 10 ORIGINAL px labeled, minor every 5
for gx in range(x0, x1 + 1, 10):
    px = (gx - x0) * scale
    major = (gx % 50 == 0)
    d.line([(px, 0), (px, crop.height)], fill=(255, 0, 0) if major else (255, 150, 150), width=3 if major else 1)
    if major:
        d.text((px + 4, 4), str(gx), fill=(255, 0, 0), font=font)
for gy in range(y0, y1 + 1, 10):
    py = (gy - y0) * scale
    major = (gy % 50 == 0)
    d.line([(0, py), (crop.width, py)], fill=(255, 0, 0) if major else (255, 150, 150), width=3 if major else 1)
    if major:
        d.text((4, py + 4), str(gy), fill=(255, 0, 0), font=font)

crop.save('/home/z/my-project/scripts/ref_lens_fine_grid.png')
print(f'saved scripts/ref_lens_fine_grid.png ({crop.width}x{crop.height})')
