#!/usr/bin/env python3
"""
merge_extracts.py — unisce gli estratti puliti (data/dictionary-extracts/p*.json)
in data/wordbank.json, sottocategoria per sottocategoria.

Regole:
  - Match per concetto = termine inglese (lowercase) dell'estratto vs en del wordbank
  - Concepto trovato  → aggiorna le 5 lingue con la forma del libro
  - Concetto nuovo     → aggiunge in ordine di pagina (ordine del libro)
  - Concetto esistente non presente a pagina → PRESERVATO come "extra" in coda
    (eccezioni: rimozioni esplicite, es. voci inventate o spostate)
  - Le forme multi-parola restano naturali ("tendine di Achille"): è il motore
    di gioco che le filtra per lunghezza (maxWordLength 7/10/12)
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXTRACTS = ROOT / "data" / "dictionary-extracts"
WORDBANK = ROOT / "data" / "wordbank.json"
LANGS = ["it", "en", "fr", "de", "es"]

# Concetti esistenti da RIMUOVERE (non preservare come extra):
#   muscoli/gluteus       → il libro dice "buttock" (concetto già reintrodotto)
#   contraccezione/cervical cap → voce inventata (il libro ha solo "cap" = cappuccio cervicale)
#   piede/ball of foot    → il libro dice "ball"
#   sistemi-corporei/diaphragm → spostato in testa (cutaway della pagina head, p17)
#   muscoli/muscle        → duplicato dell'header "muscles" (muscolo/muscoli)
#   scheletro/sternum     → duplicato di "breast bone" (sterno x2)
REMOVE = {
    ("muscoli", "gluteus"),
    ("contraccezione", "cervical cap"),
    ("piede", "ball of foot"),
    ("sistemi-corporei", "diaphragm"),
    ("muscoli", "muscle"),
    ("scheletro", "sternum"),
}

PAGE_ORDER = ["p010", "p011", "p012", "p013", "p014", "p015", "p016", "p017", "p018", "p019"]


def en_key(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def load_extracts() -> dict[str, list[dict]]:
    """slug sottocategoria → lista entries pulite in ordine di pagina."""
    by_sub: dict[str, list[dict]] = {}
    for pref in PAGE_ORDER:
        f = next(EXTRACTS.glob(f"{pref}-*.json"), None)
        if not f:
            continue
        data = json.loads(f.read_text())
        for group in data["groups"]:
            for e in group["entries"]:
                entry = {k: e[k] for k in LANGS if k in e}
                if len(entry) == 5:
                    entry["_page"] = data["page"]
                    by_sub.setdefault(group["slug"], []).append(entry)
                else:
                    print(f"  !! {pref} {group['slug']}: entry con {len(entry)}/5 lingue: {e}")
    return by_sub


def main() -> None:
    wb = json.loads(WORDBANK.read_text())
    cat = next(c for c in wb["categories"] if c["slug"] == "persone")
    subs = {s["slug"]: s for s in cat["subcategories"]}
    extracts = load_extracts()

    report = []
    for slug, sub in subs.items():
        new_entries = extracts.get(slug, [])
        if not new_entries:
            continue
        old = sub.get("entries", [])
        old_by_en = {en_key(e.get("en", "")): e for e in old}

        # 1) ricostruisci in ordine di libro, deduplicando per en
        merged, seen = [], set()
        updated = added = 0
        for ne in new_entries:
            k = en_key(ne["en"])
            if k in seen:
                continue
            seen.add(k)
            merged.append({lang: ne[lang] for lang in LANGS})
            if k in old_by_en:
                updated += 1
            else:
                added += 1

        # 2) preserva gli extra esistenti non coperti dalla pagina
        extras = []
        for e in old:
            k = en_key(e.get("en", ""))
            if k in seen:
                continue
            if (slug, k) in REMOVE:
                report.append(f"  ✂ {slug}: RIMOSSO '{e.get('en')}' (it: {e.get('it')})")
                continue
            extras.append(e)
            report.append(
                f"  ⚑ {slug}: EXTRA preservato '{e.get('en')}' "
                f"(non in pagine 10-19 — verificare)"
            )

        removed = sum(1 for e in old if (slug, en_key(e.get("en", ""))) in REMOVE)
        sub["entries"] = merged + extras
        report.append(
            f"  {slug:<22} {len(old):>3} → {len(sub['entries']):>3} voci "
            f"(aggiornate {updated}, nuove {added}, rimosse {removed}, extra {len(extras)})"
        )

    WORDBANK.write_text(json.dumps(wb, ensure_ascii=False, indent=2) + "\n")

    print("═" * 70)
    print(" MERGE wordbank.json — categoria 'persone'")
    print("═" * 70)
    for line in report:
        print(line)

    # conteggio totale per lingua
    totals = {l: 0 for l in LANGS}
    multis = 0
    for s in cat["subcategories"]:
        for e in s.get("entries", []):
            for l in LANGS:
                if " " in e.get(l, ""):
                    totals[l] += 0  # conta sotto multi
            for l in LANGS:
                totals[l] += 1
            if any(" " in e.get(l, "") for l in LANGS):
                multis += 1
    total = sum(len(s.get("entries", [])) for s in cat["subcategories"])
    print("─" * 70)
    print(f" TOTALE persone: {total} concetti | con almeno 1 lingua multi-parola: {multis}")
    print(f" Estratti usati: {', '.join(p.name for p in sorted(EXTRACTS.glob('p*.json')))}")


if __name__ == "__main__":
    main()
