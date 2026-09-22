#!/usr/bin/env python3
"""Row/column profiles of text inside the plaque + color samples of WORD vs SEARCH."""
from PIL import Image
import numpy as np

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
a = np.array(src)
h, w, _ = a.shape
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)

# text blue (letters): saturated blue, medium brightness
txt = (b > 150) & (b - r > 60) & (b - g > 60) & (r < 120)
# navy extrusion
navy = (b > 40) & (b < 150) & (b - r > 12) & (r < 90)

# plaque interior approx: x 80-555, y 268-422
y0, y1, x0, x1 = 268, 422, 80, 556
sub = txt[y0:y1, x0:x1]
rows = sub.sum(axis=1)
print('row profile (y: count) where count>5:')
for i, c in enumerate(rows):
    if c > 5:
        print(f'  y={y0+i}: {c}')

print('\ncolumn profile of blue text (x: count) where count>5, full band:')
cols = sub.sum(axis=0)
runs = []
in_run = False
for i, c in enumerate(cols):
    if c > 5 and not in_run:
        s = i; in_run = True
    elif c <= 5 and in_run:
        runs.append((x0 + s, x0 + i - 1)); in_run = False
if in_run:
    runs.append((x0 + s, x1 - 1))
print(f'text column runs: {runs}')

# WORD line vs SEARCH line: use row profile gaps
# sample colors in each text band
def band_stats(yy0, yy1, label):
    m = txt[yy0:yy1, x0:x1]
    if m.sum() < 20:
        print(f'{label}: no pixels')
        return
    ys, xs = np.where(m)
    ys = ys + yy0; xs = xs + x0
    print(f'{label}: y {ys.min()}-{ys.max()}, x {xs.min()}-{xs.max()}, n={m.sum()}')
    px = a[ys, xs]
    print(f'  fill blue avg: rgb({px[:,0].mean():.0f},{px[:,1].mean():.0f},{px[:,2].mean():.0f})')
    # brightest quartile = highlight
    lum = px.sum(axis=1)
    hi = px[lum > np.percentile(lum, 85)]
    print(f'  highlight avg: rgb({hi[:,0].mean():.0f},{hi[:,1].mean():.0f},{hi[:,2].mean():.0f})')

# from vertical scan at x=315: bands ~283-333 and ~338-400
band_stats(275, 335, 'LINE-1 (WORD?)')
band_stats(336, 410, 'LINE-2 (SEARCH?)')
