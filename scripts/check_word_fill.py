#!/usr/bin/env python3
"""Determine if LINE-1 (WORD) letters are white-filled with blue outline or solid blue.
Also get per-line horizontal extents."""
from PIL import Image
import numpy as np

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
a = np.array(src)
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)

txt = (b > 150) & (b - r > 60) & (b - g > 60) & (r < 120)
white = (r > 230) & (g > 230) & (b > 230)

def line_report(yy0, yy1, label):
    band_txt = txt[yy0:yy1, 85:545]
    cols = band_txt.sum(axis=0)
    runs, in_run = [], False
    for i, c in enumerate(cols):
        if c > 2 and not in_run:
            s = i; in_run = True
        elif c <= 2 and in_run:
            runs.append((85 + s, 85 + i - 1)); in_run = False
    if in_run:
        runs.append((85 + s, 544))
    print(f'{label} text column runs: {runs}')

    # white-inside-blue check: white px with blue within 25px left AND right on same row
    inside_white = 0
    total_white = 0
    for y in range(yy0, yy1, 2):
        for x in range(110, 520, 2):
            if white[y, x]:
                total_white += 1
                left = txt[y, max(0, x - 30):x - 2].any() if x > 32 else False
                right = txt[y, x + 3:x + 31].any()
                if left and right:
                    inside_white += 1
    print(f'{label}: white px sampled={total_white}, enclosed-by-blue={inside_white} ({100*inside_white/max(1,total_white):.0f}%)')

line_report(285, 331, 'LINE-1')
line_report(340, 396, 'LINE-2')

# Also: check stroke color around letters (the outline between fill and extrusion)
# Sample a horizontal slice through the middle of LINE-2 (SEARCH) and print color transitions
y = 370
row = a[y]
print(f'\ncolor transitions along y={y} (x, rgb) where color class changes:')
prev = None
for x in range(90, 470):
    px = tuple(row[x])
    if b[y, x] - r[y, x] > 60 and b[y, x] > 150:
        cls = 'BLUE'
    elif r[y, x] > 230 and g[y, x] > 230 and b[y, x] > 230:
        cls = 'WHITE'
    elif b[y, x] < 150 and b[y, x] - r[y, x] > 12:
        cls = 'NAVY'
    else:
        cls = 'other'
    if cls != prev:
        print(f'  x={x}: {cls} rgb{px}')
        prev = cls
