#!/usr/bin/env python3
"""Ground-truth measurement of the CURRENT implementation screenshot."""
from PIL import Image
import numpy as np
from scipy import ndimage

src = Image.open('/home/z/my-project/scripts/new_logo_v2.png').convert('RGB')
a = np.array(src)
h, w, _ = a.shape
print(f'screenshot: {w}x{h}')
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)

# background is blue gradient; plaque is white-ish
whiteish = (r > 200) & (g > 210) & (b > 220)
lab, n = ndimage.label(whiteish)
sizes = ndimage.sum(whiteish, lab, range(1, n + 1))
k = int(np.argmax(sizes)) + 1
ys, xs = np.where(lab == k)
px0, px1, py0, py1 = xs.min(), xs.max(), ys.min(), ys.max()
print(f'plaque fill bbox: x {px0}-{px1} (w={px1-px0}), y {py0}-{py1} (h={py1-py0}), aspect {(px1-px0)/max(1,py1-py0):.2f}')

# check for cyan glow just outside the plaque border: sample a ring around the bbox
# look at pixels 15-40px outside the border on the background
outside = a.copy()
ring = np.zeros((h, w), bool)
mx = 25
ring[max(0,py0-mx):py0, px0+40:px1-40] = True   # above
ring[py1:min(h,py1+mx), px0+40:px1-40] = True  # below
ring[py0:py1, max(0,px0-mx):px0] = True        # left
ring[py0:py1, px1:min(w,px1+mx)] = True        # right
ys2, xs2 = np.where(ring)
px = a[ys2, xs2]
print(f'ring around plaque avg rgb: ({px[:,0].mean():.0f},{px[:,1].mean():.0f},{px[:,2].mean():.0f})')
# cyan = g and b high, r low
cyanish = ((px[:,2] - px[:,0] > 60) & (px[:,1] - px[:,0] > 40)).sum()
print(f'cyan-ish pixels in ring: {cyanish}/{len(px)}')

# text lines: saturated blue inside plaque
txt = (b > 150) & (b - r > 60) & (b - g > 60) & (r < 130)
inner = txt[py0:py1, px0:px1]
rows = inner.sum(axis=1)
bands, in_b = [], False
for i, c in enumerate(rows):
    if c > 30 and not in_b:
        s = i; in_b = True
    elif c <= 30 and in_b:
        if i - s > 6:
            bands.append((py0 + s, py0 + i - 1))
        in_b = False
print(f'blue text line bands inside plaque: {bands}')

# lens: grey rim within plaque vertical range, right half
grey = (abs(r - g) < 28) & (abs(g - b) < 30) & (r > 95) & (r < 225)
zone = np.zeros((h, w), bool)
zone[py0-60:py1+120, (px0+px1)//2 - 60:px1 + 140] = True
lm = grey & zone
lab2, n2 = ndimage.label(ndimage.binary_dilation(lm, iterations=6))
if n2:
    s2 = ndimage.sum(lm, lab2, range(1, n2 + 1))
    kb = int(np.argmax(s2)) + 1
    ys3, xs3 = np.where((lab2 == kb) & lm)
    print(f'lens rim blob: x {xs3.min()}-{xs3.max()}, y {ys3.min()}-{ys3.max()} ({len(xs3)} px)')
    rcx, rcy = (xs3.min()+xs3.max())//2, (ys3.min()+ys3.max())//2
    diam = ((xs3.max()-xs3.min()) + (ys3.max()-ys3.min())) / 2
    print(f'rim center ({rcx},{rcy}) -> rel plaque: x {(rcx-px0)/(px1-px0):.3f}, y {(rcy-py0)/(py1-py0):.3f}; diam {diam:.0f} = {diam/(py1-py0):.2f}x plaque h')

# handle: dark blob
dark = (r < 75) & (g < 75) & (b < 75)
hd = dark & zone
lab4, n4 = ndimage.label(hd)
if n4:
    s4 = ndimage.sum(hd, lab4, range(1, n4 + 1))
    kb = int(np.argmax(s4)) + 1
    ys4, xs4 = np.where(lab4 == kb)
    print(f'handle blob: x {xs4.min()}-{xs4.max()} (w={xs4.max()-xs4.min()}), y {ys4.min()}-{ys4.max()} (h={ys4.max()-ys4.min()})')
    import math
    dx, dy = (xs4.min()+xs4.max())//2 - rcx, (ys4.min()+ys4.max())//2 - rcy
    print(f'handle dir from rim center: {math.degrees(math.atan2(dy,dx)):.0f}deg (0=right,90=down)')
    print(f'handle end vs plaque: right {(xs4.max()-px1):+d}px, bottom {(ys4.max()-py1):+d}px')
