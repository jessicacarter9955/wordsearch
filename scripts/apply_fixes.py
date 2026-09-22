#!/usr/bin/env python3
"""apply_fixes.py — applica le correzioni di revisione ai draft e genera
gli estratti finali puliti in data/dictionary-extracts/.

Fixes format (scripts/review_fixes.json):
{
  "p020": {
    "groups": {"0": {"slug": "famiglia", "names": {"en": ..., "fr": ..., "de": ..., "es": ..., "it": ...}}},
    "entries": {"0.3": {"es": "el abuelo"}, "0.7": null},
    "add": [{"en": ..., "fr": ..., "de": ..., "es": ..., "it": ...}],
    "add_to_group": 0,
    "note": "..."
  }
}

Uso: python scripts/apply_fixes.py [start] [end]   (default 20 270)
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from dictionary_tools import clean_entry, strip_article  # noqa: E402

DRAFTS = ROOT / "data" / "dictionary-drafts"
EXTRACTS = ROOT / "data" / "dictionary-extracts"
FIXES = ROOT / "scripts" / "review_fixes.json"
LANGS = ["en", "fr", "de", "es", "it"]


def slugify(s):
    s = strip_article(s, "it")[0].lower()
    s = re.sub(r"[^a-zà-ÿ0-9]+", "-", s).strip("-")
    return s or "senza-nome"


def process_page(pno, fixes):
    d = json.loads((DRAFTS / f"p{pno:03d}.json").read_text())
    fx = fixes.get(f"p{pno:03d}", fixes.get(f"p{pno}", {}))

    # FASE 1: costruisci gruppi con nomi e voci già fixate (indici ORIGINALI gi.ei)
    built = []
    for gi, g in enumerate(d["groups"]):
        gfx = fx.get("groups", {}).get(str(gi), {})
        parts = g.get("parts")
        names = gfx.get("names")
        if not names and parts and len(parts) == 5:
            names = {LANGS[i]: parts[i] for i in range(5)}
        slug = gfx.get("slug") or (slugify(names["it"]) if names and names.get("it") else None)
        entries = []
        for ei, e in enumerate(g["entries"]):
            key = f"{gi}.{ei}"
            efx = fx.get("entries", {}).get(key)
            if efx is None:
                clean = {l: e[l] for l in LANGS if e.get(l)}
            elif efx == "DELETE" or efx is False:
                clean = None
            else:
                clean = {l: e.get(l) for l in LANGS if e.get(l)}
                for l, v in efx.items():
                    if l in LANGS:
                        if v is None:
                            clean.pop(l, None)
                        else:
                            clean[l] = v
            if clean:
                entries.append(clean)
        built.append({"slug": slug, "names": names, "entries": entries})

    # FASE 2: elimina / fondi gruppi (indici originali)
    merge_map = {}
    for mlist in fx.get("merge_groups", []):
        for src in mlist[1:]:
            merge_map[src] = mlist[0]
    del_groups = set(fx.get("delete_groups", []))
    groups = []
    kept_orig = []  # indice originale dei gruppi mantenuti
    for gi, g in enumerate(built):
        if gi in del_groups or gi in merge_map:
            continue
        groups.append(g)
        kept_orig.append(gi)
    for gi, g in enumerate(built):
        if gi in merge_map:
            tgt = merge_map[gi]
            pos = kept_orig.index(tgt) if tgt in kept_orig else len(groups) - 1
            groups[pos]["entries"].extend(g["entries"])

    # aggiunte
    for add in fx.get("add", []):
        gi = fx.get("add_to_group", len(groups) - 1)
        gi = max(0, min(gi, len(groups) - 1))
        clean = {l: add[l] for l in LANGS if add.get(l)}
        if clean:
            groups[gi]["entries"].append(clean)

    # pulizia finale (articoli via, flag multi/hyphen, lunghezze griglia)
    n_single = n_multi = 0
    for g in groups:
        g["entries"] = [clean_entry(e) for e in g["entries"]]
        for e in g["entries"]:
            if e["_multi"]:
                n_multi += 1
            else:
                n_single += 1

    out = {
        "page": pno,
        "source": "5 Language Visual Dictionary (DK, 2003)",
        "category": d["category"],
        "macro_slug": d["macro_slug"],
        "reviewed": bool(fx),
        "groups": groups,
    }
    if fx.get("note"):
        out["note"] = fx["note"]
    elif not fx:
        out["note"] = "Estratto automatico (parser+autofix OCR, accuratezza misurata ~94% sul campione d'oro): revisione umana pendente."
    cat_slug = re.sub(r"[^a-z0-9]+", "-", (d["category"] or {}).get("en", "x").lower()).strip("-")
    dest = EXTRACTS / f"p{pno:03d}-{cat_slug}.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    return n_single, n_multi, len(groups), dest.name


def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 270
    fixes = json.loads(FIXES.read_text()) if FIXES.exists() else {}
    EXTRACTS.mkdir(parents=True, exist_ok=True)
    tot_s = tot_m = 0
    nofix = []
    for pno in range(start, end + 1):
        path = DRAFTS / f"p{pno:03d}.json"
        if not path.exists():
            continue
        d = json.loads(path.read_text())
        if d["stats"]["entries"] == 0 and f"p{pno:03d}" not in fixes and f"p{pno}" not in fixes:
            continue  # pagina divisoria: nessun estratto
        s, m, ng, name = process_page(pno, fixes)
        tot_s += s
        tot_m += m
        fx = fixes.get(f"p{pno:03d}", fixes.get(f"p{pno}"))
        tag = "" if fx else "  (nessuna fix)"
        if not fx:
            nofix.append(pno)
        print(f"p{pno:3d}: {name:<28} gruppi={ng} singole={s:3d} multi={m:2d}{tag}")
    print(f"\nTOTALE: singole={tot_s} multi={tot_m}")
    if nofix:
        print(f"pagine senza fix manuali ({len(nofix)}): {nofix}")


if __name__ == "__main__":
    main()
