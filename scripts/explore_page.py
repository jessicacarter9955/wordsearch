#!/usr/bin/env python3
"""Esplora il layout di una pagina con fitz dict mode: span, bbox, font, size.
Serve a progettare il parser: header/subcategory hanno font diversi dalle voci.
"""
import sys
import fitz

PDF = "/home/z/my-project/uploads/dictionary.pdf"

page_no = int(sys.argv[1]) if len(sys.argv) > 1 else 10
doc = fitz.open(PDF)
page = doc[page_no - 1]
d = page.get_text("dict")

print(f"===== PAGINA {page_no} — SPAN (bbox | font size flags | testo) =====")
for block in d["blocks"]:
    if block.get("type") != 0:
        continue
    for line in block["lines"]:
        for span in line["spans"]:
            x0, y0, x1, y1 = span["bbox"]
            txt = span["text"]
            if not txt.strip():
                continue
            print(f"x[{x0:6.1f}-{x1:6.1f}] y[{y0:6.1f}-{y1:6.1f}] "
                  f"{span['font']:<28} {span['size']:5.1f} "
                  f"{'B' if span['flags'] & 16 else ' '} | {txt!r}")
