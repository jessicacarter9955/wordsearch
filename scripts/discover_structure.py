#!/usr/bin/env python3
"""Scopre la struttura del dizionario: TOC + header categoria per ogni pagina.
Output: scripts/structure_map.txt (mappa pagine -> header) + stampe di controllo.
"""
import re
import json
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "uploads" / "dictionary.pdf"

doc = fitz.open(PDF)
print(f"Pagine totali: {len(doc)}")

# ---- TOC / outline ----
toc = doc.get_toc()
if toc:
    print("\n===== OUTLINE PDF =====")
    for lvl, title, page in toc:
        print(f"{'  ' * (lvl - 1)}[{page:3d}] {title}")
else:
    print("\n(nessun outline nel PDF)")

# ---- header per pagina ----
# Il testo della pagina: la prima riga non vuota di solito è l'header 5 lingue
# "PEOPLE • LES GENS • DIE MENSCHEN • LA GENTE • LE PERSONE"
# seguita dalla sottocategoria "body • le corps • der Körper • ..."
HEADER_SPLIT = re.compile(r"[•♦]")

def lines_of(page):
    txt = page.get_text("text")
    return [l.strip() for l in txt.splitlines() if l.strip()]

results = []
for i in range(len(doc)):
    pno = i + 1
    ls = lines_of(doc[i])
    header = None
    sub = None
    footer = None
    if ls:
        # header macro: prima riga
        parts = [p.strip(" ♦•") for p in HEADER_SPLIT.split(ls[0])]
        parts = [p for p in parts if p]
        if 3 <= len(parts) <= 6:
            header = " • ".join(re.sub(r"\s+", " ", p) for p in parts)
        # sottocategoria: seconda riga se splittabile
        if len(ls) > 1:
            parts2 = [p.strip(" ♦•") for p in HEADER_SPLIT.split(ls[1])]
            parts2 = [p for p in parts2 if p]
            if 3 <= len(parts2) <= 6:
                sub = " • ".join(re.sub(r"\s+", " ", p) for p in parts2)
        # footer: riga con numero pagina + lingue
        for l in ls[-3:]:
            m = re.match(r"^\d+\s", l)
            if m or "english" in l.lower() or "français" in l.lower():
                footer = re.sub(r"\s+", " ", l)
    results.append({"page": pno, "header": header, "sub": sub, "footer": footer,
                    "nlines": len(ls)})

out = ROOT / "scripts" / "structure_map.txt"
with out.open("w") as f:
    f.write("page\theader\tsub\tnlines\n")
    for r in results:
        f.write(f"{r['page']}\t{r['header'] or '—'}\t{r['sub'] or '—'}\t{r['nlines']}\n")

# stampa compatta: transizioni di header
print("\n===== TRANSIZIONI HEADER (macro-categorie) =====")
prev = None
for r in results:
    if r["header"] != prev:
        print(f"  p.{r['page']:3d}: {r['header'] or '(nessun header)'}")
        prev = r["header"]

# salva json per riutilizzo
(ROOT / "scripts" / "structure_map.json").write_text(
    json.dumps(results, ensure_ascii=False, indent=1))
print(f"\nSalvato: {out}")
