#!/usr/bin/env python3
"""
dictionary_tools.py — pipeline riutilizzabile per il dizionario visivo 5 lingue
==============================================================================
REGOLE FISSE (concordate con l'utente):
  1. Gli ARTICOLI vengono rimossi da ogni termine (le/la/l', der/die/das,
     el/la, il/lo/la/l'...) → nel wordbank entra solo la parola nuda.
  2. I termini MULTI-PAROLA (es. "arco plantar") restano COMPLETI e vengono
     salvati A PARTE (flag `multi` + report dedicato): il gioco ancora non
     li usa, ma non si perde nulla.
  3. Una CATEGORIA per pagina (header 5 lingue estratto dal testo).
  4. I composti con TRATTINO (avant-pied, cou-de-pied) contano come parola
     singola: in griglia si concatenano naturalmente (AVANTPIED = 10).

Uso:
  python scripts/dictionary_tools.py clean scripts/p13_curated.json
      → pulisce (articoli via), flagga multi-parola, salva l'estratto in
        data/dictionary-extracts/ e stampa il report + diff vs wordbank
  python scripts/dictionary_tools.py page 13
      → stampa il testo grezzo della pagina e l'header categoria rilevato
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "uploads" / "dictionary.pdf"
WORDBANK = ROOT / "data" / "wordbank.json"
EXTRACTS = ROOT / "data" / "dictionary-extracts"

LANGS = ["en", "fr", "de", "es", "it"]

# Articoli (solo iniziali). Due forme:
#   - con spazio: "la ride" → "ride"
#   - con apostrofo: "l'ongle" → "ongle" (nessuno spazio richiesto dopo l')
ARTICLES = {
    "fr": r"(?:(?:le|la|les|un|une|des|du)\s+|l')",
    "de": r"(?:der|die|das|den|dem|ein|eine)\s+",
    "es": r"(?:el|la|los|las|un|una|unos|unas)\s+",
    "it": r"(?:(?:il|lo|la|i|gli|le|un|uno|una)\s+|l')",
    "en": r"(?:the|a|an)\s+",
}
ARTICLE_RE = {lang: re.compile(pat, re.IGNORECASE) for lang, pat in ARTICLES.items()}


def strip_article(term: str, lang: str) -> tuple[str, str | None]:
    """Rimuove l'articolo iniziale. Ritorna (termine pulito, articolo rimosso)."""
    t = clean_spaces(term)
    m = ARTICLE_RE[lang].match(t)
    if m:
        return t[m.end():], m.group(0).strip()
    return t, None


def clean_spaces(s: str) -> str:
    """Normalizza apostrofi tipografici e spazi multipli."""
    s = s.replace("\u2019", "'").replace("\u00a0", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def is_multiword(term: str) -> bool:
    return " " in term.strip()


def has_hyphen(term: str) -> bool:
    return "-" in term


def grid_len(term: str) -> int:
    """Lunghezza della forma in griglia: maiuscolo, solo lettere, spazi via."""
    t = term.upper().replace("Œ", "OE").replace("Æ", "AE").replace("ß", "SS")
    return len(re.sub(r"[^\w]|_", "", t, flags=re.UNICODE))


def clean_entry(entry: dict) -> dict:
    """Pulisce una famiglia: articoli via + flag multi/hyphen/lunghezze griglia."""
    out, removed = {}, {}
    for lang in LANGS:
        raw = entry.get(lang)
        if not raw:
            continue
        clean, art = strip_article(raw, lang)
        out[lang] = clean
        if art:
            removed[lang] = art
    multi = [lang for lang in LANGS if lang in out and is_multiword(out[lang])]
    hyph = [lang for lang in LANGS if lang in out and has_hyphen(out[lang])]
    result = dict(out)
    result["_multi"] = multi
    if hyph:
        result["_hyphen"] = hyph
    if removed:
        result["_articles_removed"] = removed
    result["_grid_len"] = {lang: grid_len(out[lang]) for lang in out}
    return result


def diff_vs_wordbank(extract: dict) -> list[str]:
    """Confronta l'estratto pulito con data/wordbank.json (categorie persone-like)."""
    wb = json.loads(WORDBANK.read_text())
    # mappa termine(lowercase) → dove si trova nel wordbank (solo sottocategorie)
    wb_terms: dict[str, tuple[str, str]] = {}
    for cat in wb["categories"]:
        for sub in cat.get("subcategories", []):
            for e in sub.get("entries", []):
                for lang, val in e.items():
                    if isinstance(val, str):
                        wb_terms[f"{lang}:{val.lower()}"] = (cat["slug"], sub["slug"])
    lines = []
    for group in extract["groups"]:
        for e in group["entries"]:
            for lang in LANGS:
                if lang not in e:
                    continue
                key = f"{lang}:{e[lang].lower()}"
                if key in wb_terms:
                    cat, sub = wb_terms[key]
                    tag = f"{cat}/{sub}" if sub != group["slug"] else "ok"
                    if tag != "ok":
                        lines.append(f"  ~ {e['en']:<14} {lang}: '{e[lang]}' già in {tag}")
                else:
                    lines.append(f"  + {e['en']:<14} {lang}: '{e[lang]}' NON presente")
    return lines


def cmd_clean(curated_path: str) -> None:
    src = Path(curated_path)
    data = json.loads(src.read_text())
    total_single, total_multi = 0, 0
    for group in data["groups"]:
        group["entries"] = [clean_entry(e) for e in group["entries"]]
        for e in group["entries"]:
            if e["_multi"]:
                total_multi += 1
            else:
                total_single += 1

    EXTRACTS.mkdir(parents=True, exist_ok=True)
    page = data.get("page", 0)
    slug = data["category"]["en"].lower().replace(" ", "-")
    out = EXTRACTS / f"p{page:03d}-{slug}.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

    # ---- report ----
    print(f" Estratto salvato: {out.relative_to(ROOT)}")
    print(f" Categoria: {data['category']['it']} / {data['category']['en']}")
    print(f" Gruppi: {', '.join(g['slug'] for g in data['groups'])}")
    print(f" Entry: {len(data['groups'][0]['entries']) + len(data['groups'][-1]['entries'])}"
          f" (singole: {total_single}, multi-parola: {total_multi})\n")

    print("═" * 78)
    print(" PAROLE SINGOLE (pronte per il gioco)")
    print("═" * 78)
    for group in data["groups"]:
        print(f"\n [{group['slug'].upper()}]")
        for e in group["entries"]:
            if e["_multi"]:
                continue
            arts = e.get("_articles_removed", {})
            art_note = " ".join(f"{l}:-{a}" for l, a in arts.items()) if arts else ""
            print(f"   {e['en']:<13}| {e['fr']:<13}| {e['de']:<15}| {e['es']:<11}| {e['it']:<12} {art_note}")

    print()
    print("═" * 78)
    print(" MULTI-PAROLA (salvate a parte — non ancora usate nel gioco)")
    print("═" * 78)
    for group in data["groups"]:
        multis = [e for e in group["entries"] if e["_multi"]]
        if not multis:
            continue
        print(f"\n [{group['slug'].upper()}]")
        for e in multis:
            langs = ",".join(e["_multi"])
            lens = " ".join(f"{l}={e['_grid_len'][l]}" for l in e["_multi"])
            print(f"   {e['en']:<22} [{langs}]  griglia: {lens}")

    print("\n─" * 78)
    print(" DIFF vs wordbank.json (persone/*)")
    print("─" * 78)
    diffs = diff_vs_wordbank(data)
    print("\n".join(diffs) if diffs else "  (nessuna differenza)")


def cmd_page(n: int) -> None:
    import pypdf
    reader = pypdf.PdfReader(PDF)
    page = reader.pages[n - 1]
    text = page.extract_text() or ""
    print(f"===== PAGINA {n} — TESTO GREZZO =====\n{text}\n")
    # header categoria: prima riga non vuota, spezzata su • o ♦
    for line in text.splitlines():
        if line.strip():
            parts = re.split(r"[•♦]", line)
            parts = [p.strip(" ♦•").lower() for p in parts if p.strip(" ♦•")]
            if 3 <= len(parts) <= 6:
                print("HEADER CATEGORIA RILEVATO:", " | ".join(parts))
            break


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == "clean":
        cmd_clean(sys.argv[2])
    elif cmd == "page":
        cmd_page(int(sys.argv[2]))
    else:
        print(f"Comando sconosciuto: {cmd}")
        sys.exit(1)
