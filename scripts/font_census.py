#!/usr/bin/env python3
"""Censimento (font, size) su pagine campione per verificare la stabilità delle firme."""
import fitz
from collections import Counter

PDF = "/home/z/my-project/uploads/dictionary.pdf"
doc = fitz.open(PDF)

PAGES = [10, 20, 26, 27, 29, 39, 40, 53, 88, 97, 110, 128, 132, 139, 152,
         161, 182, 184, 200, 207, 240, 242, 265, 270]

for pno in PAGES:
    page = doc[pno - 1]
    d = page.get_text("dict")
    c = Counter()
    for block in d["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                if span["text"].strip():
                    c[(span["font"], round(span["size"]))] += 1
    top = ", ".join(f"{f.split('+')[-1]} {s}pt×{n}" for (f, s), n in
                    sorted(c.items(), key=lambda kv: -kv[1])[:6])
    print(f"p{pno:3d}: {top}")
