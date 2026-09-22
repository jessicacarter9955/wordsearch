#!/usr/bin/env python3
"""Refined measurement: largest connected blue component = plaque border ring."""
from PIL import Image
import numpy as np

try:
    from scipy import ndimage
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
a = np.array(src)
h, w, _ = a.shape
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)

blue = (b > 120) & (b - r > 40) & (b - g > 40) & (r < 140)

if HAS_SCIPY:
    lab, n = ndimage.label(blue)
    print(f'{n} blue components')
    sizes = ndimage.sum(blue, lab, range(1, n + 1))
    biggest = int(np.argmax(sizes)) + 1
    ys, xs = np.where(lab == biggest)
    print(f'plaque border component: {int(sizes[biggest-1])} px')
    px0, px1, py0, py1 = xs.min(), xs.max(), ys.min(), ys.max()
    print(f'plaque outer bbox: x {px0}-{px1} (w={px1-px0}), y {py0}-{py1} (h={py1-py0})')
    print(f'plaque rel: x {px0/w:.3f}-{px1/w:.3f}, y {py0/h:.3f}-{py1/h:.3f}, aspect w/h={(px1-px0)/(py1-py0):.3f}')

    # inner white region: erode bbox by border thickness estimate.
    # border thickness: scan a horizontal line through plaque center for blue run length
    cy = (py0 + py1) // 2
    row = blue[cy]
    runs = []
    in_run = False
    for x in range(px0, px1 + 1):
        if row[x] and not in_run:
            start = x; in_run = True
        elif not row[x] and in_run:
            runs.append((start, x - 1)); in_run = False
    if in_run:
        runs.append((start, px1))
    print(f'blue runs at center row y={cy}: {runs[:6]}')

    # lens: silver rim + dark handle inside plaque right area
    grey = (abs(r - g) < 25) & (abs(g - b) < 25) & (r > 90) & (r < 215)
    dark = (r < 70) & (g < 70) & (b < 70)
    lens_zone = np.zeros_like(blue)
    lens_zone[py0:py1, (px0 + px1) // 2:px1 + 60] = True
    lens_mask = (grey | dark) & lens_zone
    lab2, n2 = ndimage.label(lens_mask)
    if n2:
        sizes2 = ndimage.sum(lens_mask, lab2, range(1, n2 + 1))
        # combine top grey + dark components (rim + handle may be separate)
        order = np.argsort(sizes2)[::-1]
        for k in order[:3]:
            ys2, xs2 = np.where(lab2 == k + 1)
            print(f'lens part {k+1} ({int(sizes2[k])}px): x {xs2.min()}-{xs2.max()}, y {ys2.min()}-{ys2.max()}')
        # overall lens bbox from union of top-2 parts
        all_ys, all_xs = [], []
        for k in order[:2]:
            ys2, xs2 = np.where(lab2 == k + 1)
            all_ys.append(ys2); all_xs.append(xs2)
        ys2 = np.concatenate(all_ys); xs2 = np.concatenate(all_xs)
        lx0, lx1, ly0, ly1 = xs2.min(), xs2.max(), ys2.min(), ys2.max()
        print(f'lens overall bbox: x {lx0}-{lx1} (w={lx1-lx0}), y {ly0}-{ly1} (h={ly1-ly0})')
        print(f'lens center: ({(lx0+lx1)//2}, {(ly0+ly1)//2}) -> rel to plaque: x {(((lx0+lx1)//2)-px0)/(px1-px0):.3f}, y {(((ly0+ly1)//2)-py0)/(py1-py0):.3f}')
        print(f'lens size vs plaque height: {(ly1-ly0)/(py1-py0):.3f}, vs plaque width: {(lx1-lx0)/(px1-px0):.3f}')
        print(f'lens right edge beyond plaque border: {lx1 - px1}px')

    # handle direction: dark pixels within lens bbox
    if n2:
        hd = dark & lens_zone
        lab3, n3 = ndimage.label(hd)
        if n3:
            sizes3 = ndimage.sum(hd, lab3, range(1, n3 + 1))
            kb = int(np.argmax(sizes3)) + 1
            ys3, xs3 = np.where(lab3 == kb)
            hx0, hx1, hy0, hy1 = xs3.min(), xs3.max(), ys3.min(), ys3.max()
            hcx, hcy = (hx0 + hx1) // 2, (hy0 + hy1) // 2
            print(f'handle bbox: x {hx0}-{hx1}, y {hy0}-{hy1}, center ({hcx},{hcy})')
            # direction from lens center to handle center
            import math
            dx, dy = hcx - (lx0 + lx1) // 2, hcy - (ly0 + ly1) // 2
            ang = math.degrees(math.atan2(dy, dx))  # screen coords, y down
            print(f'handle direction angle: {ang:.0f} deg (0=right, 90=down) -> clock ~{(12 + ang/30) % 24:.1f}h')
else:
    print('scipy not available')
