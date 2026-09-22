#!/usr/bin/env python3
"""Debug mirato: righe piccole/grandi di una pagina con la loro classificazione."""
import sys
import fitz

PDF = "/home/z/my-project/uploads/dictionary.pdf"

pno = int(sys.argv[1])
doc = fitz.open(PDF)
page = doc[pno - 1]
d = page.get_text("dict")
H = page.rect.height
print(f"page height = {H}")

rows = []
for block in d["blocks"]:
    if block.get("type") != 0:
        continue
    for line in block["lines"]:
        for sp in line["spans"]:
            if not sp["text"].strip():
                continue
            x0, y0, x1, y1 = sp["bbox"]
            rows.append((y0, x0, sp["size"], sp["text"]))

rows.sort()
for y0, x0, size, text in rows:
    kind = "BIG " if size >= 18 else ("tiny" if size < 9 else "smal")
    print(f"y{y0:7.1f} x{x0:6.1f} {size:5.1f} {kind} | {text!r}")
