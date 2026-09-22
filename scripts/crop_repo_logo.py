#!/usr/bin/env python3
"""Crop logo region from repo menu screenshot (with coordinate grid)."""
from PIL import Image, ImageDraw, ImageFont

src = Image.open('/home/z/my-project/scripts/ref/menu_main.png').convert('RGB')
# plaque x 181-1266 (+lens to 1385), y 876-1251 (+handle margin)
crop = src.crop((120, 800, 1500, 1350))
scale = 0.85  # keep size manageable
crop = crop.resize((int(crop.width * scale), int(crop.height * scale)), Image.LANCZOS)

d = ImageDraw.Draw(crop)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
except Exception:
    font = ImageFont.load_default()
# gridlines every 150 original px
for gx in range(150, 1500, 150):
    px = int((gx - 120) * scale)
    d.line([(px, 0), (px, crop.height)], fill=(255, 0, 0), width=2)
    d.text((px + 4, 4), str(gx), fill=(255, 0, 0), font=font)
for gy in range(850, 1350, 50):
    py = int((gy - 800) * scale)
    d.line([(0, py), (crop.width, py)], fill=(255, 0, 0), width=1)
    d.text((4, py + 4), str(gy), fill=(255, 0, 0), font=font)

crop.save('/home/z/my-project/scripts/repo_logo_grid.png')
print(f'saved scripts/repo_logo_grid.png ({crop.width}x{crop.height})')
