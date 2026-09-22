#!/usr/bin/env python3
"""Crop the logo area from the user's reference paste for detailed VLM inspection."""
from PIL import Image

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png')
w, h = src.size
print(f'source: {w}x{h}')

# The logo plaque sits in the upper-middle portion of the menu (640x960 portrait).
# Crop generously around it: vertical band from ~22% to ~48% of height, full width.
crop = src.crop((0, int(h * 0.20), w, int(h * 0.50)))
crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
crop.save('/home/z/my-project/scripts/ref_logo_zoom.png')
print(f'saved scripts/ref_logo_zoom.png ({crop.width}x{crop.height})')
