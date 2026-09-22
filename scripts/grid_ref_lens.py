#!/usr/bin/env python3
"""Draw a labeled coordinate grid over the lens crop for precise VLM readings."""
from PIL import Image, ImageDraw, ImageFont

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
x0, y0, x1, y1 = 330, 230, 640, 480  # crop window in original coords
crop = src.crop((x0, y0, x1, y1))
scale = 3
crop = crop.resize((crop.width * scale, crop.height * scale), Image.LANCZOS)

d = ImageDraw.Draw(crop)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except Exception:
    font = ImageFont.load_default()

# vertical gridlines every 50 original px, labeled with ORIGINAL x
for gx in range(x0 + 50 - x0, x1 - x0 + 1, 50):
    ox = x0 + gx
    px = gx * scale
    d.line([(px, 0), (px, crop.height)], fill=(255, 0, 0), width=2)
    d.text((px + 4, 4), str(ox), fill=(255, 0, 0), font=font)
# horizontal gridlines every 50 original px, labeled with ORIGINAL y
for gy in range(50, y1 - y0 + 1, 50):
    oy = y0 + gy
    py = gy * scale
    d.line([(0, py), (crop.width, py)], fill=(255, 0, 0), width=2)
    d.text((4, py + 4), str(oy), fill=(255, 0, 0), font=font)

crop.save('/home/z/my-project/scripts/ref_lens_grid.png')
print(f'saved scripts/ref_lens_grid.png ({crop.width}x{crop.height})')
print('grid labels = ORIGINAL image coordinates (640x960)')
