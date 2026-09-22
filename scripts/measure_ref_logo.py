#!/usr/bin/env python3
"""Measure plaque + lens geometry from the user's reference screenshot (pixel analysis)."""
from PIL import Image
import numpy as np

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
a = np.array(src)
h, w, _ = a.shape
print(f'image: {w}x{h}')

r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)

# --- Plaque blue border: saturated blue (b >> r, b >> g or all-blue-ish) ---
blue = (b > 120) & (b - r > 40) & (b - g > 40) & (r < 140)
ys, xs = np.where(blue)
# Restrict to upper 60% (plaque zone) to exclude other blue UI below
mask = ys < h * 0.6
ys, xs = ys[mask], xs[mask]
print(f'blue border pixels: {len(xs)}')
if len(xs):
    print(f'blue bbox: x {xs.min()}-{xs.max()} (w={xs.max()-xs.min()}), y {ys.min()}-{ys.max()} (h={ys.max()-ys.min()})')
    print(f'blue bbox center: ({(xs.min()+xs.max())//2}, {(ys.min()+ys.max())//2})')
    print(f'relative to image: x {xs.min()/w:.3f}-{xs.max()/w:.3f}, y {ys.min()/h:.3f}-{ys.max()/h:.3f}')

# --- Plaque white fill inside the border (upper-middle region) ---
# white-ish: all channels high
white = (r > 225) & (g > 225) & (b > 225)
sub = white[int(h*0.2):int(h*0.5), int(w*0.05):int(w*0.95)]
ys2, xs2 = np.where(sub)
if len(xs2):
    ys2 = ys2 + int(h*0.2); xs2 = xs2 + int(w*0.05)
    print(f'white fill bbox: x {xs2.min()}-{xs2.max()} (w={xs2.max()-xs2.min()}), y {ys2.min()}-{ys2.max()} (h={ys2.max()-ys2.min()})')

# --- Lens: look in the right half of the plaque zone for the silver/grey rim ---
# silver rim: greyish (r≈g≈b, mid values) OR dark handle (near black)
zone = a[int(h*0.22):int(h*0.50), int(w*0.55):int(w*0.98)]
zr, zg, zb = zone[:,:,0].astype(int), zone[:,:,1].astype(int), zone[:,:,2].astype(int)
grey = (abs(zr-zg) < 25) & (abs(zg-zb) < 25) & (zr > 90) & (zr < 215)
dark = (zr < 70) & (zg < 70) & (zb < 70)
ys3, xs3 = np.where(grey | dark)
if len(xs3):
    ys3 = ys3 + int(h*0.22); xs3 = xs3 + int(w*0.55)
    print(f'lens grey/dark bbox: x {xs3.min()}-{xs3.max()} (w={xs3.max()-xs3.min()}), y {ys3.min()}-{ys3.max()} (h={ys3.max()-ys3.min()})')
    print(f'lens center approx: ({(xs3.min()+xs3.max())//2}, {(ys3.min()+ys3.max())//2})')
    # vertical profile of dark pixels (handle) to find handle direction
    dys, dxs = np.where(dark)
    if len(dys):
        dys = dys + int(h*0.22); dxs = dxs + int(w*0.55)
        print(f'dark handle bbox: x {dxs.min()}-{dxs.max()}, y {dys.min()}-{dys.max()}')
        print(f'handle center: ({(dxs.min()+dxs.max())//2}, {(dys.min()+dys.max())//2})')

# --- Color samples ---
def sample(name, x, y):
    px = a[y, x]
    print(f'{name} @({x},{y}): rgb{tuple(px)}')

# SEARCH text blue: sample a point in the middle of the word area (just guess then refine by scanning)
# find strongly saturated blue text pixels inside plaque
inner = (slice(int(h*0.30), int(h*0.42), 4), slice(int(w*0.15), int(w*0.75), 4))
ir = r[inner].ravel(); ig = g[inner].ravel(); ib = b[inner].ravel()
sel = (ib > 130) & (ib - ir > 60) & (ib - ig > 60)
if sel.sum():
    print(f'SEARCH blue sample avg: rgb({ir[sel].mean():.0f},{ig[sel].mean():.0f},{ib[sel].mean():.0f}), n={sel.sum()}')
# navy extrusion: dark blue
sel2 = (ib < 130) & (ib > 40) & (ib - ir > 15) & (b[inner].ravel() < 130)
if sel2.sum():
    print(f'navy extrusion avg: rgb({ir[sel2].mean():.0f},{ig[sel2].mean():.0f},{ib[sel2].mean():.0f}), n={sel2.sum()}')
# border blue sample: bright blue ring
selb = blue[int(h*0.2):int(h*0.5), :][:, int(w*0.1):int(w*0.9)]
if selb.sum():
    br = r[int(h*0.2):int(h*0.5), int(w*0.1):int(w*0.9)][selb]
    bg_ = g[int(h*0.2):int(h*0.5), int(w*0.1):int(w*0.9)][selb]
    bb = b[int(h*0.2):int(h*0.5), int(w*0.1):int(w*0.9)][selb]
    print(f'border blue avg: rgb({br.mean():.0f},{bg_.mean():.0f},{bb.mean():.0f}), n={selb.sum()}')
