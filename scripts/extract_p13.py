#!/usr/bin/env python3
"""Extract text from page 13 of the 5 Language Visual Dictionary PDF."""
import sys

PDF = "/home/z/my-project/uploads/Angeles Gavini _Senior Editor__ Jean-Claude Corbeil, Ariane Arch - 5 Language Visual Dictionary_ English-French-German-Spanish-Italian _2003_ DK Publi"

# Find the actual file (name may be truncated)
import glob, os
candidates = glob.glob("/home/z/my-project/uploads/*.pdf")
if not candidates:
    print("ERROR: no pdf found")
    sys.exit(1)
PDF = candidates[0]
print(f"Using file: {os.path.basename(PDF)}")

try:
    import pypdf
    reader = pypdf.PdfReader(PDF)
    n = len(reader.pages)
    print(f"Total pages: {n}")
    # Page 13 as user counts it (1-indexed) -> index 12
    for idx in [12]:
        if idx < n:
            page = reader.pages[idx]
            text = page.extract_text()
            print(f"\n===== PAGE {idx+1} (1-indexed) =====")
            print(text if text else "[NO TEXT EXTRACTED - possibly image-only page]")
        else:
            print(f"Page {idx+1} out of range")
except ImportError:
    print("pypdf not available, trying pdfplumber")
    import pdfplumber
    with pdfplumber.open(PDF) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        page = pdf.pages[12]
        text = page.extract_text()
        print(f"\n===== PAGE 13 (1-indexed) =====")
        print(text if text else "[NO TEXT EXTRACTED - possibly image-only page]")
