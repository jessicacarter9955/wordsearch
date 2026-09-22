#!/usr/bin/env python3
"""Radial Hough-like scan for the lens rim (silver ring) in the reference paste."""
from PIL import Image
import numpy as np

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
a = np.array(src)
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
h, w, _ = a.shape

# silver/grey-ish: low saturation, mid-high value (rim metal + AA)
sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
grey = (sat < 42) & (r > 105) & (r < 235)

# also dark (handle) for later
dark = (r < 75) & (g < 75) & (b < 75)

best = None
# search center around (400-470, 300-360), radius 70-130
for cy in range(295, 365, 5):
    for cx in range(390, 475, 5):
        for rad in range(70, 132, 4):
            # sample 48 points on the circle
            n = 48
            ang = np.linspace(0, 2 * np.pi, n, endpoint=False)
            xs = np.clip((cx + rad * np.cos(ang)).round().astype(int), 0, w - 1)
            ys = np.clip((cy + rad * np.sin(ang)).round().astype(int), 0, h - 1)
            frac = grey[ys, xs].mean()
            if best is None or frac > best[0]:
                best = (frac, cx, cy, rad)

frac, cx, cy, rad = best
print(f'BEST RING: center ({cx},{cy}), radius {rad}, grey coverage {frac:.0%}')

# refine: measure rim thickness — scan grey coverage vs radius at the best center
print('radial profile (radius: grey fraction):')
for rr in range(max(30, rad - 30), rad + 32, 2):
    n = 72
    ang = np.linspace(0, 2 * np.pi, n, endpoint=False)
    xs = np.clip((cx + rr * np.cos(ang)).round().astype(int), 0, w - 1)
    ys = np.clip((cy + rr * np.sin(ang)).round().astype(int), 0, h - 1)
    print(f'  r={rr}: {grey[ys, xs].mean():.2f}')

# plaque geometry for proportions
print(f'\nplaque: x 74-557 (w=483), y 264-424 (h=160)')
print(f'lens outer diameter ~{2*rad} = {2*rad/483:.2f}x plaque width, {2*rad/160:.2f}x plaque height')
print(f'lens center rel: x {(cx-74)/483:.2f}, y {(cy-264)/160:.2f}')
