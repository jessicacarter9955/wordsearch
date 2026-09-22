#!/usr/bin/env python3
"""batch_parse.py — parser automatico del dizionario visivo 5 lingue (DK 2003).

Estrae per ogni pagina:
  - macro-categoria (da tabella pagine, indipendente dall'OCR dell'header)
  - sottocategorie: righe a font >= 18pt oppure 14-17pt con bullet (mini, es. "hand")
  - voci: blocchi verticali di righe a font ~12pt, ordine EN/FR/DE/ES/IT
  - voci orizzontali (righe con •, es. "male • l'homme • der Mann • ...")

Gestisce: righe guida (______), ritorni a capo dentro una lingua (partizioni),
blocchi con lingua mancante (firme articoli), colonne parallele (x-gap).

Output: data/dictionary-drafts/pNNN.json — BOZZE con flag, da revisionare.

Uso:
  python scripts/batch_parse.py 20 270          # parsifica range -> bozze
  python scripts/batch_parse.py 10 19 --gold    # confronto con estratti curati
"""
import json
import re
import sys
from itertools import combinations
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "uploads" / "dictionary.pdf"
DRAFTS = ROOT / "data" / "dictionary-drafts"
EXTRACTS = ROOT / "data" / "dictionary-extracts"

LANGS = ["en", "fr", "de", "es", "it"]

# (start, end, slug, nomi 5 lingue) — confini dalle transizioni header verificate
MACROS = [
    (10, 26, "persone", {"en": "People", "fr": "Les gens", "de": "Die Menschen", "es": "La gente", "it": "Le persone"}),
    (27, 39, "aspetto", {"en": "Appearance", "fr": "L'apparence", "de": "Die äußere Erscheinung", "es": "La apariencia", "it": "L'aspetto"}),
    (40, 52, "salute", {"en": "Health", "fr": "La santé", "de": "Die Gesundheit", "es": "La salud", "it": "La salute"}),
    (53, 87, "casa", {"en": "Home", "fr": "La maison", "de": "Das Haus", "es": "La casa", "it": "La casa"}),
    (88, 96, "servizi", {"en": "Services", "fr": "Les services", "de": "Die Dienstleistungen", "es": "Los servicios", "it": "I servizi"}),
    (97, 109, "acquisti", {"en": "Shopping", "fr": "Les courses", "de": "Der Einkauf", "es": "Las compras", "it": "Gli acquisti"}),
    (110, 138, "cibo", {"en": "Food", "fr": "La nourriture", "de": "Die Nahrungsmittel", "es": "Los alimentos", "it": "Il cibo"}),
    (139, 151, "mangiare-fuori", {"en": "Eating out", "fr": "Sortir manger", "de": "Auswärts essen", "es": "Comer fuera", "it": "Mangiare fuori"}),
    (152, 160, "studio", {"en": "Study", "fr": "L'étude", "de": "Das Lernen", "es": "El estudio", "it": "Lo studio"}),
    (161, 181, "lavoro", {"en": "Work", "fr": "Le travail", "de": "Die Arbeit", "es": "El trabajo", "it": "Il lavoro"}),
    (182, 206, "trasporti", {"en": "Transportation", "fr": "Le transport", "de": "Der Verkehr", "es": "El transporte", "it": "I trasporti"}),
    (207, 239, "sport", {"en": "Sports", "fr": "Les sports", "de": "Der Sport", "es": "Los deportes", "it": "Gli sport"}),
    (240, 264, "tempo-libero", {"en": "Leisure", "fr": "Le temps libre", "de": "Die Freizeit", "es": "El ocio", "it": "Il tempo libero"}),
    (265, 286, "ambiente", {"en": "Environment", "fr": "L'environnement", "de": "Die Umwelt", "es": "El medio ambiente", "it": "L'ambiente"}),
]

# ---- firme articoli → slot possibili (1=en 2=fr 3=de 4=es 5=it) ----
WORD_SLOTS = {
    "le": {2, 5}, "la": {2, 4, 5}, "les": {2}, "l'": {2, 5},
    "un": {2, 4, 5}, "une": {2}, "du": {2}, "des": {2},
    "der": {3}, "die": {3}, "das": {3}, "den": {3}, "dem": {3},
    "ein": {3}, "eine": {3},
    "el": {4}, "los": {4}, "las": {4}, "unos": {4}, "unas": {4}, "del": {4},
    "una": {4, 5},
    "il": {5}, "lo": {5}, "i": {5}, "gli": {5}, "uno": {5},
    "the": {1}, "an": {1},
}
ALL_SLOTS = {1, 2, 3, 4, 5}

JUNK_LINE = re.compile(r"^[\s._/*\\\-—–]+$")
JUNK_TRAIL = re.compile(r"[\s._/*\\\-—–]+$")
JUNK_LEAD = re.compile(r"^[\s/*\\_]+")
BULLETS = "[•♦■]"


def macro_for(page):
    for s, e, slug, names in MACROS:
        if s <= page <= e:
            return slug, names
    return None, None


def norm_text(s):
    s = s.replace("\u00ad", "").replace("\u2019", "'").replace("\u00a0", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def extract_spans(page):
    d = page.get_text("dict")
    big, small = [], []
    for block in d["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            for sp in line["spans"]:
                if not sp["text"].strip():
                    continue
                x0, y0, x1, y1 = sp["bbox"]
                rec = {"text": sp["text"], "x0": x0, "y0": y0, "x1": x1,
                       "y1": y1, "yc": (y0 + y1) / 2.0, "size": sp["size"]}
                (big if sp["size"] >= 18 else small).append(rec)
    return big, small


def build_lines(spans, xgap=12.0):
    """Unisce gli span in righe visive: y-center entro 4pt e gap orizzontale < xgap."""
    spans = sorted(spans, key=lambda s: (s["yc"], s["x0"]))
    lines = []
    for sp in spans:
        placed = False
        for ln in reversed(lines[-8:]):
            if abs(ln["yc"] - sp["yc"]) <= 4.0:
                if sp["x0"] - ln["x1"] < xgap and ln["x0"] - sp["x1"] < xgap:
                    ln["spans"].append(sp)
                    ln["x0"] = min(ln["x0"], sp["x0"])
                    ln["x1"] = max(ln["x1"], sp["x1"])
                    ln["yc"] = sum(s["yc"] for s in ln["spans"]) / len(ln["spans"])
                    placed = True
                    break
        if not placed:
            lines.append({"spans": [sp], "x0": sp["x0"], "x1": sp["x1"], "yc": sp["yc"]})
    # post-pass: fondi righe sulla stessa banda y con gap x entro soglia
    # (l'ordine di inserimento può aver creato righe che ora sono adiacenti)
    merged = True
    while merged:
        merged = False
        for i in range(len(lines)):
            for j in range(i + 1, len(lines)):
                a, b = lines[i], lines[j]
                if abs(a["yc"] - b["yc"]) <= 4.0:
                    gap = max(a["x0"], b["x0"]) - min(a["x1"], b["x1"])
                    if gap < xgap:
                        a["spans"].extend(b["spans"])
                        a["x0"] = min(a["x0"], b["x0"])
                        a["x1"] = max(a["x1"], b["x1"])
                        a["yc"] = (a["yc"] + b["yc"]) / 2
                        lines.pop(j)
                        merged = True
                        break
            if merged:
                break
    for ln in lines:
        ln["spans"].sort(key=lambda s: s["x0"])
        parts, prev = [], None
        for sp in ln["spans"]:
            if prev is not None and sp["x0"] - prev["x1"] > 1.5:
                parts.append(" ")
            parts.append(sp["text"])
            prev = sp
        ln["text"] = norm_text("".join(parts))
        ln["size"] = max(s["size"] for s in ln["spans"])
        ln["nbullet"] = len(re.findall(BULLETS, ln["text"]))
    lines.sort(key=lambda l: l["yc"])
    return lines


def line_slots(text):
    """Slot linguistici possibili per una riga, dalle firme degli articoli."""
    t = text.lower().strip()
    m = re.match(r"^(l'|[a-z]+)", t)
    if not m:
        return ALL_SLOTS.copy()
    w = m.group(0)
    if w in WORD_SLOTS:
        return set(WORD_SLOTS[w])
    return ALL_SLOTS.copy()


def solve_slots(texts):
    """Assegna slot 1-5 (en fr de es it) a n<5 righe in ordine. (slots, ok, alts)."""
    n = len(texts)
    evid = [line_slots(t) for t in texts]
    solutions = []

    def dfs(i, prev, acc):
        if i == n:
            solutions.append(list(acc))
            return
        for s in sorted(evid[i]):
            if s > prev:
                acc.append(s)
                dfs(i + 1, s, acc)
                acc.pop()

    dfs(0, 0, [])
    if len(solutions) == 1:
        return solutions[0], True, []
    if not solutions:
        return None, False, []
    return solutions[0], True, [s for s in solutions[1:]]  # ambiguo: prima soluzione + alternative


def solve_partition(texts):
    """Per blocchi >5 righe: partiziona in 5 gruppi contigui (wrap dentro una lingua)."""
    n = len(texts)
    evid = [line_slots(t) for t in texts]
    solutions = []
    for cuts in combinations(range(1, n), 4):
        starts = (0,) + cuts
        bounds = list(starts) + [n]
        groups = [texts[bounds[i]:bounds[i + 1]] for i in range(5)]
        if all((i + 1) in evid[starts[i]] for i in range(5)):
            solutions.append((starts, groups))
    if not solutions:
        return None, False, []
    # punteggio: continuazioni compatibili con lo slot del gruppo
    def score(sol):
        starts, groups = sol
        sc = 0
        for i, g in enumerate(groups):
            for extra in g[1:]:
                ev = line_slots(extra)
                if (i + 1) in ev or ev == ALL_SLOTS:
                    sc += 1
        return sc

    solutions.sort(key=score, reverse=True)
    best = solutions[0]
    alts = [s for s in solutions[1:] if score(s) == score(best)]
    return best, True, alts


def token_flags(text, lang):
    """Linter OCR a livello di token."""
    issues = []
    if not text:
        return issues
    for tok in text.split():
        if re.search(r"[^0-9A-Za-zÀ-ÿœŒæÆß'’\-]", tok):
            issues.append(f"weird:{tok}")
        elif re.search(r"[0-9]", tok):
            issues.append(f"num:{tok}")
        elif re.search(r"(.)\1\1", tok):
            issues.append(f"rep:{tok}")
        elif len(tok) == 1 and tok.lower() not in {"à", "y", "a", "e", "o", "l", "d", "i"}:
            issues.append(f"short:{tok}")
    if lang != "de":
        body = re.sub(r"^(?:l'|[a-z']+ )", "", text)
        if re.match(r"[A-Z]", body):
            issues.append("case")
    return issues


def parse_page(doc, pno):
    page = doc[pno - 1]
    big_spans, small_spans = extract_spans(page)
    lines = build_lines(big_spans, xgap=90.0) + build_lines(small_spans, xgap=12.0)
    H = page.rect.height
    slug, names = macro_for(pno)

    header_raw = " / ".join(l["text"] for l in lines if l["yc"] < 55) or None
    body = [l for l in lines if 55 <= l["yc"] <= H - 45]

    # pulizia righe: leader line, spazzatura iniziale/finale
    clean_body = []
    for ln in body:
        t = JUNK_LEAD.sub("", ln["text"])
        t = JUNK_TRAIL.sub("", t)
        t = norm_text(t)
        if not t or JUNK_LINE.match(t):
            continue
        ln["text"] = t
        ln["nbullet"] = len(re.findall(BULLETS, t))
        clean_body.append(ln)

    # --- sottocategorie: righe grandi (>=18) o mini (14-17 con bullet) ---
    big_lines = [l for l in clean_body if l["size"] >= 18]
    mini_lines = [l for l in clean_body if 14 <= l["size"] < 18 and l["nbullet"] >= 2]
    subcat_lines = sorted(big_lines + mini_lines, key=lambda l: l["yc"])

    subcats = []
    for ln in subcat_lines:
        if subcats and abs(ln["yc"] - subcats[-1]["yc"]) < 40 and abs(ln["x0"] - subcats[-1]["x0"]) < 60:
            subcats[-1]["raw"] += " " + ln["text"]
            subcats[-1]["yc"] = (subcats[-1]["yc"] + ln["yc"]) / 2
        else:
            subcats.append({"yc": ln["yc"], "raw": ln["text"], "size": ln["size"], "x0": ln["x0"]})
    for sc in subcats:
        parts = re.split(BULLETS, sc["raw"])
        parts = [re.sub(r"\s*\d+\s*$", "", norm_text(p)).lower() for p in parts]
        sc["parts"] = [p for p in parts if p]

    # --- blocchi verticali ---
    entry_lines = [l for l in clean_body if l not in subcat_lines]
    blocks = []
    open_blocks = []
    for ln in entry_lines:
        open_blocks = [b for b in open_blocks if ln["yc"] - b["last_yc"] <= 26.0]
        best, bestgap = None, None
        for b in open_blocks:
            gap = ln["yc"] - b["last_yc"]
            if 8.0 <= gap <= 26.0 and abs(ln["x0"] - b["x0"]) <= 25.0:
                if best is None or gap < bestgap:
                    best, bestgap = b, gap
        if best is not None:
            best["lines"].append(ln)
            best["last_yc"] = ln["yc"]
            best["x0"] = min(best["x0"], ln["x0"])
        else:
            nb = {"lines": [ln], "last_yc": ln["yc"], "x0": ln["x0"]}
            blocks.append(nb)
            open_blocks.append(nb)

    entries = []
    leftovers = []
    horiz = []
    for b in blocks:
        texts = [l["text"] for l in b["lines"]]
        joined = " ".join(texts)
        pos = [round(b["x0"]), round(b["lines"][0]["yc"])]
        nbul = sum(l["nbullet"] for l in b["lines"])
        if nbul >= 2 or (nbul >= 1 and len(texts) <= 2):
            horiz.append(b)
            continue
        if len(texts) == 5:
            entries.append({**{LANGS[i]: texts[i] for i in range(5)},
                            "_pos": pos, "_flags": []})
        elif 2 <= len(texts) <= 4:
            slots, ok, alts = solve_slots(texts)
            if ok:
                e = {LANGS[s - 1]: texts[i] for i, s in enumerate(slots)}
                e["_pos"] = pos
                e["_flags"] = [f"missing:{LANGS[i]}" for i in range(5) if i + 1 not in slots]
                if alts:
                    e["_flags"].append("slot-ambig")
                    e["_alts"] = [[LANGS[s - 1] for s in a] for a in alts[:3]]
                entries.append(e)
            else:
                leftovers.append({"text": " | ".join(texts), "pos": pos,
                                  "why": f"blocco {len(texts)} righe non risolvibile"})
        elif len(texts) == 1:
            leftovers.append({"text": texts[0], "pos": pos,
                              "why": "riga singola isolata"})
        else:  # >5: wrap
            sol, ok, alts = solve_partition(texts)
            if ok:
                starts, groups = sol
                e = {LANGS[i]: norm_text(" ".join(groups[i])) for i in range(5)}
                e["_pos"] = pos
                e["_flags"] = ["wrap"]
                if alts:
                    e["_flags"].append("wrap-ambig")
                    e["_alts"] = [{LANGS[i]: norm_text(" ".join(g[i])) for i in range(5)}
                                  for _, g in alts[:2]]
                entries.append(e)
            else:
                leftovers.append({"text": " | ".join(texts), "pos": pos,
                                  "why": f"blocco {len(texts)} righe non partizionabile"})

    # --- voci orizzontali (bullet nella stessa riga) ---
    used = set()
    for i, b in enumerate(horiz):
        if i in used:
            continue
        text = " ".join(l["text"] for l in b["lines"])
        yc = b["lines"][0]["yc"]
        x0 = b["x0"]
        for j in range(i + 1, len(horiz)):
            if j in used:
                continue
            b2 = horiz[j]
            if abs(b2["x0"] - x0) < 60 and abs(b2["lines"][0]["yc"] - yc) < 60:
                text += " " + " ".join(l["text"] for l in b2["lines"])
                used.add(j)
        parts = [norm_text(p) for p in re.split(BULLETS + "|\\*", text)]
        parts = [p for p in parts if p]
        pos = [round(x0), round(yc)]
        if len(parts) == 5:
            entries.append({**{LANGS[i]: parts[i] for i in range(5)},
                            "_pos": pos, "_flags": ["oriz"]})
        else:
            slots, ok, alts = solve_slots(parts[:5]) if len(parts) < 5 else (None, False, [])
            if ok and len(parts) < 5:
                e = {LANGS[s - 1]: parts[i] for i, s in enumerate(slots)}
                e["_pos"] = pos
                e["_flags"] = ["oriz"] + [f"missing:{LANGS[i]}" for i in range(5) if i + 1 not in slots]
                entries.append(e)
            else:
                e = {"_pos": pos, "_flags": [f"oriz:{len(parts)}p"], "_parts": parts}
                entries.append(e)

    # --- linter ---
    for e in entries:
        for lang in LANGS:
            if lang in e:
                for f in token_flags(e[lang], lang):
                    tag = f"{lang}:{f}"
                    if tag not in e["_flags"]:
                        e["_flags"].append(tag)

    # --- gruppi per sottocategoria ---
    entries.sort(key=lambda e: e["_pos"][1])
    groups = []
    if not subcats:
        groups.append({"names_raw": None, "parts": None, "entries": entries})
    else:
        borders = [sc["yc"] for sc in subcats]
        glist = [{"names_raw": sc["raw"], "parts": sc["parts"], "entries": []}
                 for sc in subcats]
        pre = []
        for e in entries:
            y = e["_pos"][1]
            if y < borders[0]:
                pre.append(e)
                continue
            gi = max(i for i, bb in enumerate(borders) if bb <= y)
            glist[gi]["entries"].append(e)
        if pre:
            groups.append({"names_raw": "(sopra la prima sottocategoria)",
                           "parts": None, "entries": pre, "_flag_pre": True})
        groups.extend(glist)

    n_complete = sum(1 for e in entries if all(l in e for l in LANGS) and not e["_flags"])
    return {
        "page": pno,
        "source": "5 Language Visual Dictionary (DK, 2003)",
        "macro_slug": slug,
        "category": names,
        "header_raw": header_raw,
        "groups": groups,
        "leftovers": leftovers,
        "stats": {
            "entries": len(entries),
            "complete_clean": n_complete,
            "flagged": sum(1 for e in entries if e["_flags"]),
            "missing_lang": sum(1 for e in entries if any(f.startswith("missing:") for f in e["_flags"])),
            "leftovers": len(leftovers),
            "subcats": len(subcats),
        },
    }


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    gold = "--gold" in sys.argv
    start, end = int(args[0]), int(args[1])
    doc = fitz.open(PDF)
    DRAFTS.mkdir(parents=True, exist_ok=True)

    tot_e = tot_f = tot_m = tot_l = 0
    for pno in range(start, end + 1):
        draft = parse_page(doc, pno)
        out = DRAFTS / f"p{pno:03d}.json"
        out.write_text(json.dumps(draft, ensure_ascii=False, indent=1) + "\n")
        s = draft["stats"]
        tot_e += s["entries"]; tot_f += s["flagged"]; tot_m += s["missing_lang"]; tot_l += s["leftovers"]
        sub = (draft["groups"][0]["parts"][0] if draft["groups"] and draft["groups"][0].get("parts") else "?")
        print(f"p{pno:3d} [{draft['macro_slug'] or '---':<8}] {sub[:22]:<22} "
              f"voci={s['entries']:3d} flag={s['flagged']:3d} manc={s['missing_lang']:2d} "
              f"left={s['leftovers']:2d} sub={s['subcats']}")
    print(f"\nTOTALE p{start}-{end}: voci={tot_e} flaggate={tot_f} "
          f"con-lingua-mancante={tot_m} leftover={tot_l}")

    if gold:
        print("\n===== GOLDEN TEST vs estratti curati (p010-p019) =====")
        for pno in range(start, end + 1):
            gpath = EXTRACTS / f"p{pno:03d}-people.json"
            if not gpath.exists():
                continue
            gold_data = json.loads(gpath.read_text())
            gold_entries = [e for g in gold_data["groups"] for e in g["entries"]]
            draft = json.loads((DRAFTS / f"p{pno:03d}.json").read_text())
            draft_entries = [e for g in draft["groups"] for e in g["entries"]]
            gk = {}
            for e in gold_entries:
                gk[(e.get("en") or "?").lower()] = e
            dk = {}
            for e in draft_entries:
                dk[(e.get("en") or "?").lower()] = e
            match = set(gk) & set(dk)
            miss = [k for k in gk if k not in dk]
            extra = [k for k in dk if k not in gk]
            langdiff = []
            for k in match:
                for l in LANGS:
                    gv, dv = gk[k].get(l), dk[k].get(l)
                    if (gv is None) != (dv is None):
                        langdiff.append(f"{k}:{l} gold={gv} draft={dv}")
            print(f"p{pno:3d}: gold={len(gold_entries):2d} draft={len(draft_entries):2d} "
                  f"en-match={len(match):2d} mancanti={miss} extra={extra}")
            for ld in langdiff[:8]:
                print(f"      {ld}")


if __name__ == "__main__":
    main()
