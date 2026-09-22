#!/usr/bin/env python3
"""Radial ring scan on BOTH logos from side_by_side.png (same plaque scale = 700px wide)."""
from PIL import Image
import numpy as np

src = Image.open('/home/z/my-project/side_by_side.png').convert('RGB') if False else Image.open('/home/z/my-project/scripts/side_by_side.png').convert('RGB')
a = np.array(src)
h, w, _ = a.shape
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
sat = np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b)
grey = (sat < 46) & (r > 105) & (r < 235)

# find the two plaque bands: reference is pasted at y=50 with height H1, current below.
# From the build script: ref_s pasted at y=50, cur at y=100+ref_s.height.
# Just scan the full image for ring centers in two vertical bands.

def scan_band(y0, y1, label):
    best = None
    for cy in range(y0, y1, 4):
        for cx in range(int(w*0.45), int(w*0.95), 4):
            for rad in range(60, 200, 4):
                n = 40
                ang = np.linspace(0, 2 * np.pi, n, endpoint=False)
                xs = np.clip((cx + rad * np.cos(ang)).round().astype(int), 0, w - 1)
                ys = np.clip((cy + rad * np.sin(ang)).round().astype(int), 0, h - 1)
                # only count points inside the band
                ok = (ys >= y0 - 20) & (ys < y1 + 20)
                if ok.sum() < 20:
                    continue
                frac = grey[ys[ok], xs[ok]].mean()
                if best is None or frac > best[0]:
                    best = (frac, cx, cy, rad)
    frac, cx, cy, rad = best
    print(f'{label}: best ring center ({cx},{cy}) r={rad} coverage {frac:.0%} -> diameter {2*rad}px at plaque=700px scale = {2*rad/700:.2f}x plaque width')

# where are the two logos? reference ~y 60-400, current ~y 460-950 (from earlier blob positions)
scan_band(60, 400, 'REFERENCE lens')
scan_band(440, 960, 'CURRENT lens')
