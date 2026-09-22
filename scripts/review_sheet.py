#!/usr/bin/env python3
"""review_sheet.py — genera fogli di revisione compatti dai draft.

Output: scripts/review/<sezione>.txt (es. p020-026-persone.txt)
Una riga per voce: N. [flag] en | fr | de | es | it
M = multiparola in qualche lingua, ⚠ = flag residue, ? = lingua mancante.

Uso: python scripts/review_sheet.py 20 270
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DRAFTS = ROOT / "data" / "dictionary-drafts"
OUT = ROOT / "scripts" / "review"
LANGS = ["en", "fr", "de", "es", "it"]

SECTION_NAMES = {
    "persone": "Persone", "aspetto": "Aspetto", "salute": "Salute",
    "casa": "Casa", "servizi": "Servizi", "acquisti": "Acquisti",
    "cibo": "Cibo", "mangiare-fuori": "Mangiare fuori", "studio": "Studio",
    "lavoro": "Lavoro", "trasporti": "Trasporti", "sport": "Sport",
    "tempo-libero": "Tempo libero", "ambiente": "Ambiente",
}


def trunc(s, n):
    s = s or "?"
    return s if len(s) <= n else s[: n - 1] + "~"


def main():
    start, end = int(sys.argv[1]), int(sys.argv[2])
    OUT.mkdir(parents=True, exist_ok=True)
    cur_slug, buf, cur_range = None, [], [start, start]

    def flush():
        if not buf:
            return
        name = f"p{cur_range[0]:03d}-p{cur_range[1]:03d}-{cur_slug}.txt"
        (OUT / name).write_text("".join(buf))
        print(f"scritto {name} ({len(buf)} righe)")

    for pno in range(start, end + 1):
        path = DRAFTS / f"p{pno:03d}.json"
        d = json.loads(path.read_text())
        slug = d["macro_slug"] or "sconosciuta"
        if cur_slug is None:
            cur_slug = slug
        if slug != cur_slug:
            flush()
            cur_slug, buf, cur_range = slug, [], [pno, pno]
        cur_range[1] = pno
        s = d["stats"]
        buf.append(f"{'='*100}\n== p{pno:03d} [{slug}] ")
        if s["entries"] == 0:
            buf.append("PAGINA DIVISORIA / SENZA VOCI\n")
            if d["leftovers"]:
                for l in d["leftovers"]:
                    buf.append(f"   LEFT {l['text']!r} @{l['pos']}\n")
            continue
        buf.append(f"{s['entries']} voci, {s['flagged']} flag, {s['missing_lang']} mancanti, "
                   f"{s['leftovers']} leftover, header={trunc(d.get('header_raw') or '-', 60)}\n")
        for gi, g in enumerate(d["groups"]):
            parts = " • ".join(g.get("parts") or [])
            tag = "PRE" if g.get("_flag_pre") else f"G{gi}"
            buf.append(f"-- {tag} subcat: {trunc(g.get('names_raw') or '(nessuna)', 80)}\n")
            if parts:
                buf.append(f"   parts: {trunc(parts, 92)}\n")
            for ei, e in enumerate(g["entries"]):
                idx = f"{gi}.{ei}"
                real = [f for f in e["_flags"] if f != "oriz"]
                multi = any(" " in (e.get(l) or "?") and not re.search(r"\(v\)$", e.get(l) or "")
                            for l in LANGS if e.get(l))
                mark = "⚠" if real else ("M" if multi else " ")
                fl = " ".join(sorted(set(f.split(":")[0] if ":" in f else f for f in real))[:6])
                vals = " | ".join(trunc(e.get(l), 17) for l in LANGS)
                buf.append(f" {idx:<5}{mark} {vals}   {fl}\n")
                if "_parts" in e:
                    buf.append(f"        PARTS: {e['_parts']}\n")
                if "_alts" in e:
                    buf.append(f"        ALTS: {e['_alts']}\n")
        for l in d["leftovers"]:
            buf.append(f"   LEFT {l['text']!r} @{l['pos']} ({l['why']})\n")
    flush()


if __name__ == "__main__":
    main()
