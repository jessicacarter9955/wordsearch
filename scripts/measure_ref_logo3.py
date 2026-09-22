#!/usr/bin/env python3
"""Measure plaque ring in upper band: dilate blue mask to merge ring fragments."""
from PIL import Image
import numpy as np
from scipy import ndimage

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
a = np.array(src)
h, w, _ = a.shape
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)

blue = (b > 120) & (b - r > 40) & (b - g > 40) & (r < 140)

# upper band only (plaque zone per earlier bbox y 111-424) + margins
band = np.zeros_like(blue)
band[80:460, :] = True
bm = blue & band

# dilate to merge fragments of the ring (lens occlusion breaks it)
bm_d = ndimage.binary_dilation(bm, iterations=6)
lab, n = ndimage.label(bm_d)
sizes = ndimage.sum(bm_d, lab, range(1, n + 1))
order = np.argsort(sizes)[::-1]
for k in order[:5]:
    ys, xs = np.where((lab == k + 1) & bm)  # actual blue px in this component
    if len(xs) < 200:
        continue
    print(f'comp {k+1}: {int(sizes[k])} dilated px, {len(xs)} real blue px')
    print(f'  bbox: x {xs.min()}-{xs.max()} (w={xs.max()-xs.min()}), y {ys.min()}-{ys.max()} (h={ys.max()-ys.min()})')

# pick component with the widest span as the plaque ring
best = None
for k in order:
    ys, xs = np.where((lab == k + 1) & bm)
    if len(xs) < 2000:
        continue
    span = xs.max() - xs.min()
    if best is None or span > best[0]:
        best = (span, k + 1, xs, ys)

if best:
    span, kid, xs, ys = best
    px0, px1, py0, py1 = xs.min(), xs.max(), ys.min(), ys.max()
    print(f'\nPLAQUE RING: x {px0}-{px1} (w={px1-px0}), y {py0}-{py1} (h={py1-py0})')
    print(f'rel: x {px0/w:.3f}-{px1/w:.3f} of width, y {py0/h:.3f}-{py1/h:.3f} of height')
    print(f'aspect w/h = {(px1-px0)/(py1-py0):.2f}')

    # ring thickness: horizontal scan at ring vertical center
    cy = (py0 + py1) // 2
    row = blue[cy, px0:px1 + 1]
    runs, in_run = [], False
    for i, v in enumerate(row):
        if v and not in_run:
            s = i; in_run = True
        elif not v and in_run:
            runs.append((s + px0, i - 1 + px0, i - s)); in_run = False
    if in_run:
        runs.append((s + px0, px1, px1 - px0 - s + 1))
    print(f'blue runs at y={cy}: {runs}')

    # vertical scan at ring horizontal center for top/bottom border thickness
    cx = (px0 + px1) // 2
    col = blue[py0:py1 + 1, cx]
    vruns, in_run = [], False
    for i, v in enumerate(col):
        if v and not in_run:
            s = i; in_run = True
        elif not v and in_run:
            vruns.append((s + py0, i - 1 + py0, i - s)); in_run = False
    if in_run:
        vruns.append((s + py0, py1, py1 - py0 - s + 1))
    print(f'blue runs at x={cx}: {vruns}')

    # LENS: grey rim + dark handle to the right, within vertical band of plaque
    grey = (abs(r - g) < 25) & (abs(g - b) < 25) & (r > 90) & (r < 215)
    dark = (r < 70) & (g < 70) & (b < 70)
    zone = np.zeros_like(blue)
    zone[py0 - 30:py1 + 90, (px0 + px1) // 2 - 40:px1 + 70] = True
    lm = (grey | dark) & zone
    lab2, n2 = ndimage.label(ndimage.binary_dilation(lm, iterations=4))
    if n2:
        s2 = ndimage.sum(lm, lab2, range(1, n2 + 1))
        o2 = np.argsort(s2)[::-1]
        for kk in o2[:2]:
            ys2, xs2 = np.where((lab2 == kk + 1) & lm)
            if len(xs2) < 150:
                continue
            print(f'\nLENS part: {len(xs2)} px, x {xs2.min()}-{xs2.max()}, y {ys2.min()}-{ys2.max()}')
        # rim only (grey): approximate circle
        gr = grey & zone
        lab3, n3 = ndimage.label(ndimage.binary_dilation(gr, iterations=3))
        if n3:
            s3 = ndimage.sum(gr, lab3, range(1, n3 + 1))
            kb = int(np.argmax(s3)) + 1
            ys3, xs3 = np.where((lab3 == kb) & gr)
            print(f'RIM: {len(xs3)} px, x {xs3.min()}-{xs3.max()} (w={xs3.max()-xs3.min()}), y {ys3.min()}-{ys3.max()} (h={ys3.max()-ys3.min()})')
            rcx, rcy = (xs3.min() + xs3.max()) // 2, (ys3.min() + ys3.max()) // 2
            diam = (xs3.max() - xs3.min() + ys3.max() - ys3.min()) / 2
            print(f'rim center ({rcx},{rcy}), diameter ~{diam:.0f}px')
            print(f'rim center rel to plaque: x {(rcx-px0)/(px1-px0):.3f}, y {(rcy-py0)/(py1-py0):.3f}')
            print(f'rim diameter / plaque height: {diam/(py1-py0):.3f}')
            print(f'rim right edge vs plaque right: {(xs3.max()-px1):+d}px')
        # handle: biggest dark component
        hd = dark & zone
        lab4, n4 = ndimage.label(hd)
        if n4:
            s4 = ndimage.sum(hd, lab4, range(1, n4 + 1))
            kb = int(np.argmax(s4)) + 1
            ys4, xs4 = np.where(lab4 == kb)
            hcx, hcy = (xs4.min() + xs4.max()) // 2, (ys4.min() + ys4.max()) // 2
            print(f'HANDLE: x {xs4.min()}-{xs4.max()}, y {ys4.min()}-{ys4.max()}, center ({hcx},{hcy})')
            import math
            dx, dy = hcx - rcx, hcy - rcy
            ang = math.degrees(math.atan2(dy, dx))
            clock = (12 + ang / 30) % 24
            print(f'handle angle from rim center: {ang:.0f} deg (0=right,90=down) -> ~{clock:.1f} oclock')
            print(f'handle length ~{math.hypot(dx, dy):.0f}px, width ~{xs4.max()-xs4.min()}px')
