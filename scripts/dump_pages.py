#!/usr/bin/env python3
"""Dump raw text of a page range from the dictionary PDF."""
import sys
import pypdf

PDF = "/home/z/my-project/uploads/dictionary.pdf"
start, end = int(sys.argv[1]), int(sys.argv[2])

reader = pypdf.PdfReader(PDF)
print(f"Total pages: {len(reader.pages)}\n")
for n in range(start, end + 1):
    text = reader.pages[n - 1].extract_text() or "[NO TEXT]"
    print(f"{'='*90}")
    print(f"===== PAGINA {n} =====")
    print(f"{'='*90}")
    print(text)
    print()
