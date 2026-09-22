#!/usr/bin/env python3
"""Build a side-by-side comparison: reference logo vs current implementation, normalized to the same plaque width."""
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage

def plaque_bbox(img_path):
    src = Image.open(img_path).convert('RGB')
    a = np.array(src)
    r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
    # white fill OR blue border of the plaque — find via blue ring + white fill union, upper 60%
    whiteish = (r > 200) & (g > 210) & (b > 220)
    blue = (b > 120) & (b - r > 40) & (b - g > 40) & (r < 140)
    # restrict to upper 55% to avoid play button etc.
    mask = (whiteish | blue)
    mask[int(a.shape[0] * 0.55):, :] = False
    # background of the app screenshot is blue too — for current impl use whiteish only
    lab, n = ndimage.label(whiteish & mask)
    if n:
        sizes = ndimage.sum(whiteish & mask, lab, range(1, n + 1))
        k = int(np.argmax(sizes)) + 1
        ys, xs = np.where(lab == k)
        return src, (xs.min(), ys.min(), xs.max(), ys.max())
    return src, None

TARGET_W = 700  # normalized plaque width in the comparison

# reference: white bg — plaque = blue ring + fill
ref = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
a = np.array(ref)
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
blue = (b > 120) & (b - r > 40) & (b - g > 40) & (r < 140)
blue[int(a.shape[0] * 0.6):, :] = False
lab, n = ndimage.label(blue)
sizes = ndimage.sum(blue, lab, range(1, n + 1))
order = np.argsort(sizes)[::-1]
best = None
for k in order[:6]:
    ys, xs = np.where(lab == k + 1)
    span = xs.max() - xs.min()
    aspect = span / max(1, ys.max() - ys.min())
    if 2.2 < aspect < 4.2 and span > 200 and (best is None or span > best[0]):
        best = (span, xs.min(), ys.min(), xs.max(), ys.max())
_, rx0, ry0, rx1, ry1 = best
print(f'reference plaque bbox: x {rx0}-{rx1}, y {ry0}-{ry1} (w={rx1-rx0})')
ref_crop = ref.crop((rx0 - 12, ry0 - 90, rx1 + 12, ry1 + 75))  # include lens/handle margins

# current — plaque is centered: viewport 780, plaque 540 => x 120-660; lens severs
# the white fill so measure y from the whiteish band but crop x from layout.
cur = Image.open('/home/z/my-project/scripts/new_logo_v6.png').convert('RGB')
a = np.array(cur)
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
whiteish = (r > 200) & (g > 210) & (b > 220)
lab, n = ndimage.label(whiteish)
sizes = ndimage.sum(whiteish, lab, range(1, n + 1))
k = int(np.argmax(sizes)) + 1
ys, xs = np.where(lab == k)
cy0, cy1 = ys.min(), ys.max()
cx0, cx1 = 120, 660  # full plaque span (border box) from layout math
print(f'current plaque: x {cx0}-{cx1}, y fill {cy0}-{cy1}')
cur_crop = cur.crop((cx0 - 15, cy0 - 95, cx1 + 15, cy1 + 85))

# scale both to same plaque width
sw = TARGET_W / (rx1 - rx0)
ref_s = ref_crop.resize((int(ref_crop.width * sw), int(ref_crop.height * sw)), Image.LANCZOS)
sw2 = TARGET_W / (cx1 - cx0)
cur_s = cur_crop.resize((int(cur_crop.width * sw2), int(cur_crop.height * sw2)), Image.LANCZOS)

W = max(ref_s.width, cur_s.width) + 40
H = ref_s.height + cur_s.height + 90
canvas = Image.new('RGB', (W, H), (245, 245, 245))
d = ImageDraw.Draw(canvas)
try:
    from PIL import ImageFont
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 28)
except Exception:
    font = ImageFont.load_default()
d.text((20, 12), 'REFERENCE (target)', fill=(200, 0, 0), font=font)
canvas.paste(ref_s, ((W - ref_s.width) // 2, 50))
d.text((20, 60 + ref_s.height), 'CURRENT v3', fill=(0, 130, 0), font=font)
canvas.paste(cur_s, ((W - cur_s.width) // 2, 100 + ref_s.height))
canvas.save('/home/z/my-project/scripts/side_by_side.png')
print(f'saved scripts/side_by_side.png ({W}x{H})')
