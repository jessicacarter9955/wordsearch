#!/usr/bin/env python3
"""Crop the lens region (right part of plaque) at 3x zoom for VLM inspection."""
from PIL import Image

src = Image.open('/home/z/my-project/upload/pasted_image_1789910797808.png').convert('RGB')
# Plaque: x 74-557, y 264-424. Lens zone: right portion incl. beyond-edge area.
crop = src.crop((330, 230, 640, 480))
crop = crop.resize((crop.width * 3, crop.height * 3), Image.LANCZOS)
crop.save('/home/z/my-project/scripts/ref_lens_zoom.png')
print(f'saved scripts/ref_lens_zoom.png ({crop.width}x{crop.height})')
print('crop maps: x 330-640, y 230-480 of the 640x960 original')
