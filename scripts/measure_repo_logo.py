#!/usr/bin/env python3
"""Measure logo geometry on the ORIGINAL repo menu screenshot (1672x2508)."""
from PIL import Image
import numpy as np
from scipy import ndimage

src = Image.open('/home/z/my-project/scripts/ref/menu_main.png').convert('RGB')
a = np.array(src)
h, w, _ = a.shape
print(f'image: {w}x{h}')
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)

blue = (b > 120) & (b - r > 40) & (b - g > 40) & (r < 140)

# ---- Plaque ring: find in upper half ----
band = np.zeros_like(blue)
band[int(h*0.1):int(h*0.55), :] = True
bm = blue & band
bm_d = ndimage.binary_dilation(bm, iterations=10)
lab, n = ndimage.label(bm_d)
sizes = ndimage.sum(bm_d, lab, range(1, n + 1))
best = None
for k in range(n):
    ys, xs = np.where((lab == k + 1) & bm)
    if len(xs) < 5000:
        continue
    span = xs.max() - xs.min()
    aspect = (xs.max() - xs.min()) / max(1, ys.max() - ys.min())
    print(f'comp {k+1}: {len(xs)} blue px, x {xs.min()}-{xs.max()} (w={span}), y {ys.min()}-{ys.max()} (h={ys.max()-ys.min()}), aspect {aspect:.2f}')
    if 2.2 < aspect < 4.0 and span > w * 0.4:
        if best is None or span > best[0]:
            best = (span, k + 1)

if best:
    span, kid = best
    ys, xs = np.where((lab == kid) & bm)
    px0, px1, py0, py1 = xs.min(), xs.max(), ys.min(), ys.max()
    print(f'\nPLAQUE: x {px0}-{px1} (w={px1-px0}), y {py0}-{py1} (h={py1-py0}), aspect {(px1-px0)/(py1-py0):.2f}')
    print(f'rel: x {px0/w:.3f}-{px1/w:.3f}, y {py0/h:.3f}-{py1/h:.3f}')

    # ring thickness at vertical center (left border)
    cy = (py0 + py1) // 2
    row = blue[cy, :px0 + (px1 - px0) // 3]
    runs, in_run = [], False
    for i, v in enumerate(row):
        if v and not in_run:
            s = i; in_run = True
        elif not v and in_run:
            runs.append((s, i - 1, i - s)); in_run = False
    if in_run:
        runs.append((s, len(row) - 1, len(row) - s))
    print(f'left border runs at y={cy}: {runs[-3:]}')

    # text lines inside plaque (row profile of saturated blue)
    txt = (b > 150) & (b - r > 60) & (b - g > 60) & (r < 120)
    inner = txt[py0:py1, px0:px1]
    rows = inner.sum(axis=1)
    bands, in_b = [], False
    for i, c in enumerate(rows):
        if c > 40 and not in_b:
            s = i; in_b = True
        elif c <= 40 and in_b:
            if i - s > 8:
                bands.append((py0 + s, py0 + i - 1))
            in_b = False
    print(f'text line bands: {bands}')
    for (ly0, ly1) in bands:
        m = txt[ly0:ly1, px0:px1]
        cols = m.sum(axis=0)
        cr, in_r = [], False
        for i, c in enumerate(cols):
            if c > 3 and not in_r:
                s = i; in_r = True
            elif c <= 3 and in_r:
                cr.append((px0 + s, px0 + i - 1)); in_r = False
        if in_r:
            cr.append((px0 + s, px1))
        # merge close runs (letter gaps)
        merged = []
        for s, e in cr:
            if merged and s - merged[-1][1] < 12:
                merged[-1] = (merged[-1][0], e)
            else:
                merged.append((s, e))
        print(f'  line y {ly0}-{ly1} (h={ly1-ly0}): x {merged[0][0]}-{merged[-1][1]}, letters~{len(merged)}')

    # lens: grey rim + dark handle, right-center of plaque
    grey = (abs(r - g) < 25) & (abs(g - b) < 25) & (r > 90) & (r < 215)
    dark = (r < 70) & (g < 70) & (b < 70)
    zone = np.zeros_like(blue)
    zone[py0 - 60:py1 + 160, px0 + (px1 - px0) // 2:px1 + 120] = True
    lm = (grey | dark) & zone
    lab2, n2 = ndimage.label(ndimage.binary_dilation(lm, iterations=8))
    if n2:
        s2 = ndimage.sum(lm, lab2, range(1, n2 + 1))
        o2 = np.argsort(s2)[::-1]
        for kk in o2[:3]:
            ys2, xs2 = np.where((lab2 == kk + 1) & lm)
            if len(xs2) < 800:
                continue
            print(f'lens blob: {len(xs2)} px, x {xs2.min()}-{xs2.max()}, y {ys2.min()}-{ys2.max()}')
        # rim only: biggest grey blob
        gr = grey & zone
        lab3, n3 = ndimage.label(ndimage.binary_dilation(gr, iterations=5))
        if n3:
            s3 = ndimage.sum(gr, lab3, range(1, n3 + 1))
            kb = int(np.argmax(s3)) + 1
            ys3, xs3 = np.where((lab3 == kb) & gr)
            rcx, rcy = (xs3.min() + xs3.max()) // 2, (ys3.min() + ys3.max()) // 2
            diam = ((xs3.max() - xs3.min()) + (ys3.max() - ys3.min())) / 2
            print(f'RIM: x {xs3.min()}-{xs3.max()}, y {ys3.min()}-{ys3.max()}')
            print(f'rim center ({rcx},{rcy}) rel to plaque: x {(rcx-px0)/(px1-px0):.3f}, y {(rcy-py0)/(py1-py0):.3f}; diameter ~{diam:.0f} = {diam/(py1-py0):.2f}x plaque h')
        hd = dark & zone
        lab4, n4 = ndimage.label(hd)
        if n4:
            s4 = ndimage.sum(hd, lab4, range(1, n4 + 1))
            kb = int(np.argmax(s4)) + 1
            ys4, xs4 = np.where(lab4 == kb)
            print(f'HANDLE: x {xs4.min()}-{xs4.max()} (w={xs4.max()-xs4.min()}), y {ys4.min()}-{ys4.max()} (h={ys4.max()-ys4.min()})')
            hcx, hcy = (xs4.min()+xs4.max())//2, (ys4.min()+ys4.max())//2
            import math
            dx, dy = hcx - rcx, hcy - rcy
            print(f'handle center offset from rim: ({dx},{dy}), angle {math.degrees(math.atan2(dy,dx)):.0f}deg, len {math.hypot(dx,dy):.0f}')
            print(f'handle end vs plaque: right {(xs4.max()-px1):+d}px vs border, bottom {(ys4.max()-py1):+d}px vs border')
