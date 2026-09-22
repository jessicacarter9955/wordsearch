#!/usr/bin/env python3
"""autofix_noise.py — correzione automatica del rumore OCR nei draft.

Passate:
  1. caratteri spazzatura (¡¿•■... e parentesi pendenti) via
  2. confusioni di articolo: es 'cl '→'el ', 'e l '→'el ', '¡I '→'el ';
     it '¡I '/'¡1 '→'il '; fr 'P'+minuscola→"l'"
  3. segmentazione: riumisce frammenti separati da spazi spurie quando la
     parola riunita è valida (pyspellchecker) e i frammenti no
  4. sostituzioni cifra→lettera (ven3→vena) come fallback
  5. rilint dei valori con le flag aggiornate

Ogni correzione è loggata (scripts/autofix_log.json) per audit.
Uso: python scripts/autofix_noise.py [start] [end]   (default 20 270)
"""
import json
import re
import sys
import unicodedata
from functools import lru_cache
from pathlib import Path

from spellchecker import SpellChecker

ROOT = Path(__file__).resolve().parent.parent
DRAFTS = ROOT / "data" / "dictionary-drafts"
LANGS = ["en", "fr", "de", "es", "it"]

SC = {l: SpellChecker(language=l) for l in LANGS}

# parole funzione (barriere di unione, mai fuse)
FUNC = {
    "en": {"of", "for", "and", "with", "without", "in", "on", "to", "the", "a",
           "an", "at", "by", "from", "into", "over", "under", "up", "down",
           "out", "off", "all", "men's", "women's", "children's"},
    "fr": {"de", "du", "des", "à", "au", "aux", "et", "en", "la", "le", "les",
           "pour", "sur", "sous", "avec", "sans", "dans", "chez", "par", "y"},
    "de": {"und", "für", "mit", "von", "zum", "zur", "der", "die", "das",
           "den", "dem", "auf", "aus", "bei", "im", "in", "an", "zu", "od"},
    "es": {"de", "del", "la", "el", "los", "las", "y", "para", "con", "sin",
           "en", "por", "un", "una", "unos", "unas", "al", "a", "o", "u"},
    "it": {"di", "del", "della", "dei", "delle", "dello", "degli", "e", "per",
           "con", "senza", "in", "la", "il", "lo", "le", "gli", "un", "una",
           "un", "uno", "al", "alla", "da", "a", "o", "ma"},
}
ARTICLES = {
    "fr": {"le", "la", "les", "l", "un", "une", "du", "des"},
    "de": {"der", "die", "das", "den", "dem", "ein", "eine"},
    "es": {"el", "la", "los", "las", "un", "una", "unos", "unas", "del"},
    "it": {"il", "lo", "la", "i", "gli", "le", "l", "un", "uno", "una"},
    "en": {"the", "a", "an"},
}

JUNK_CHARS = "¡¿•■♦*|§£€"
DIGIT_SUB = {"3": "a", "1": "l", "0": "o", "5": "s", "8": "b", "7": "i", "4": "a"}


@lru_cache(maxsize=200000)
def sc_valid(tok: str, lang: str) -> bool:
    """Token valido: parola nota (anche con apostrofo/trattino composti).
    Stretto: token corti (<3) validi solo se funzione/articolo — 'ño' & co.
    sono spazzatura dei dizionari di frequenza."""
    t = tok.lower().strip()
    if not t:
        return True
    if t in FUNC[lang]:
        return True
    if t in ARTICLES.get(lang, set()):
        return True
    if len(t) < 3:
        return False
    if t in SC[lang]:
        return True
    if "'" in t:
        return all(p == "" or p in SC[lang] or p in ARTICLES.get(lang, set())
                   for p in t.split("'"))
    if "-" in t:
        return all(p == "" or sc_valid(p, lang) for p in t.split("-"))
    if lang == "de" and len(t) >= 6:
        # composto tedesco: qualche split in due parti entrambe valide
        for i in range(2, len(t) - 1):
            if t[:i] in SC["de"] and t[i:] in SC["de"]:
                return True
    return False


def fold(s: str) -> str:
    s = s.replace("ß", "ss").replace("æ", "ae").replace("œ", "oe")
    return "".join(c for c in unicodedata.normalize("NFD", s)
                   if unicodedata.category(c) != "Mn")


FOLD_INDEX: dict[str, dict[str, str]] = {}


def build_fold_index():
    for lang in LANGS:
        idx: dict[str, str] = {}
        wf = SC[lang]._word_frequency._dictionary
        for w in wf:
            f = fold(w)
            if f == w:
                continue  # senza accenti: non serve
            if f not in idx or wf[w] > wf[idx[f]]:
                idx[f] = w
        FOLD_INDEX[lang] = idx


def fix_accents(v: str, lang: str) -> tuple[str, bool]:
    """Ripristina accenti persi dall'OCR: token non valido la cui versione
    senza accenti ha un solo candidato accentato nel dizionario."""
    if lang not in FOLD_INDEX:
        return v, False
    idx = FOLD_INDEX[lang]
    out, changed = [], False
    for tok in v.split():
        if sc_valid(tok, lang) or "'" in tok or "-" in tok or len(tok) < 3:
            out.append(tok)
            continue
        f = fold(tok.lower())
        cand = idx.get(f)
        if cand and cand != tok.lower():
            if tok[0].isupper():
                cand = cand.capitalize()
            out.append(cand)
            changed = True
        else:
            out.append(tok)
    return " ".join(out), changed


def fix_chars(v: str) -> str:
    # preserva il marcatore verbale '(v)' e simili
    m = re.search(r"\((v|n|adj|adv)\)\s*$", v)
    marker = " " + m.group(0) if m else ""
    if m:
        v = v[:m.start()].rstrip()
    for c in JUNK_CHARS:
        v = v.replace(c, "")
    v = re.sub(r"[()\[\]]+", "", v)
    v = re.sub(r"^[,\.;:\-\^~\s]+", "", v)
    v = re.sub(r"[\s,\.;:\-\^~]+$", "", v)
    v = re.sub(r"\s+", " ", v).strip()
    return v + marker


def fix_article_confusion(v: str, lang: str) -> str:
    if lang == "es":
        v = re.sub(r"^(?:cl|e l|c l|¡I|¡1)\s+", "el ", v)
        v = re.sub(r"^(?:e l|c l)\s+", "el ", v)
        v = re.sub(r"^lav\s+", "las ", v)
        v = re.sub(r"^Lis\s+", "las ", v)
    if lang == "it":
        v = re.sub(r"^(?:¡I|¡1|c l|¡l)\s+", "il ", v)
    if lang in ("fr", "es", "it"):
        # 'In' = OCR di 'la' (l→I, a→n)
        v = re.sub(r"^In\s+(?=[A-Za-zÀ-ÿ])", "la ", v)
    if lang == "fr":
        v = re.sub(r"^Ics\s+", "les ", v)
        v = re.sub(r"^1(?=')", "l'", v)
        # 'Pc' davanti a minuscola = "l'é" / "l'e" (Pccharpe → l'écharpe)
        m = re.match(r"^Pc([a-zà-ÿ][\wà-ÿ'\-]*)$", v)
        if m:
            for pref in ("l'é", "l'e"):
                cand = pref + m.group(1)
                if sc_valid(cand, "fr"):
                    v = cand
                    break
        m = re.match(r"^P([a-zà-ÿ][\wà-ÿ'’\-]*)$", v)
        if m and sc_valid(m.group(1), "fr"):
            v = "l'" + m.group(1)
    return v


def fix_digits(v: str, lang: str) -> str:
    def sub_tok(tok):
        if not re.search(r"[0-9]", tok):
            return tok
        if sc_valid(tok, lang):
            return tok
        for dig, let in DIGIT_SUB.items():
            cand = tok.replace(dig, let)
            if cand != tok and sc_valid(cand, lang):
                return cand
        return tok
    return " ".join(sub_tok(t) for t in v.split())


def fix_segmentation(v: str, lang: str) -> str:
    toks = v.split()
    if len(toks) < 2:
        return v
    barriers = FUNC[lang]
    out = []
    seg = []

    def flush():
        nonlocal seg
        if seg:
            out.extend(merge_seg(seg, lang))
            seg = []

    for t in toks:
        if t.lower() in barriers:
            flush()
            out.append(t)
        else:
            seg.append(t)
    flush()
    # fallback: frammentazione pesante residua → word-break sul concatenato
    if any(not sc_valid(t, lang) for t in out if t.lower() not in barriers):
        wb = word_break(" ".join(out), lang)
        if wb:
            return wb
    return " ".join(out)


def word_break(v: str, lang: str) -> str | None:
    """Risegmenta l'intero valore (spazi via) in parole valide (DP),
    preferendo la segmentazione col minor numero di parole."""
    words = v.split()
    s = "".join(words)
    n = len(s)
    if n < 3:
        return None
    barriers = FUNC[lang]
    # DP: best[i] = (numero minimo di parole, split) per s[:i]
    import math
    best = [math.inf] * (n + 1)
    back = [None] * (n + 1)
    best[0] = 0
    for i in range(n):
        if best[i] == math.inf:
            continue
        for j in range(i + 1, min(n, i + 24) + 1):
            w = s[i:j]
            if (w in barriers or (w in ARTICLES.get(lang, set())) or w in SC[lang]
                    or ("'" in w and sc_valid(w, lang))):
                if best[i] + 1 < best[j]:
                    best[j] = best[i] + 1
                    back[j] = i
    if best[n] == math.inf:
        return None
    parts, i = [], n
    while i > 0:
        parts.append(s[back[i]:i])
        i = back[i]
    parts.reverse()
    # solo se la segmentazione è diversa dall'originale e plausibile
    if len(parts) > len(words):
        return None
    return " ".join(parts)


def merge_seg(seg, lang):
    if len(seg) == 1 or all(sc_valid(t, lang) for t in seg):
        return seg
    n = len(seg)
    if n > 8:
        return merge_greedy(seg, lang)
    # prova tutte le unioni adiacenti: preferisci MENO token (parole intere)
    best = None
    for mask in range(1 << (n - 1)):
        merged, cur = [], seg[0]
        for i in range(n - 1):
            if mask >> i & 1:
                cur += seg[i + 1]
            else:
                merged.append(cur)
                cur = seg[i + 1]
        merged.append(cur)
        if all(sc_valid(t, lang) for t in merged):
            key = (len(merged), bin(mask).count("1"))
            if best is None or key < best[0]:
                best = (key, merged)
    if best:
        return best[1]
    # opzione drop: consonante sciolta iniziale + resto valido (anche dopo merge)
    if n >= 2 and re.fullmatch(r"[bcdfghjklmnpqrstvwxz]", seg[0].lower()):
        rest = merge_seg(seg[1:], lang)
        if all(sc_valid(t, lang) for t in rest):
            return rest
    return seg


def merge_greedy(seg, lang):
    """Per segmenti lunghi: assorbi token non-validi nel vicino valido."""
    out = []
    for t in seg:
        if sc_valid(t, lang):
            out.append(t)
        elif out and not sc_valid(out[-1], lang):
            out[-1] += t
        elif out:
            cand = out[-1] + t
            if sc_valid(cand, lang):
                out[-1] = cand
            else:
                out.append(t)
        else:
            out.append(t)
    return out


def autofix_value(v: str, lang: str) -> tuple[str, list]:
    changes = []
    orig = v
    v2 = fix_chars(v)
    if v2 != v:
        changes.append("chars")
    v3 = fix_article_confusion(v2, lang)
    if v3 != v2:
        changes.append("article")
    v4 = fix_segmentation(v3, lang)
    if v4 != v3:
        changes.append("segment")
    v5, chg = fix_accents(v4, lang)
    if chg:
        changes.append("accent")
    v6 = fix_digits(v5, lang)
    if v6 != v5:
        changes.append("digit")
    return v6, changes


def token_flags(text, lang):
    issues = []
    if not text:
        return issues
    for tok in text.split():
        if re.match(r"^\((v|n|adj|adv)\)$", tok):
            continue
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


def relint_entry(e):
    flags = [f for f in e["_flags"]
             if f.startswith(("missing:", "slot-ambig", "wrap", "oriz:"))]
    for lang in LANGS:
        if lang in e:
            for f in token_flags(e[lang], lang):
                tag = f"{lang}:{f}"
                if tag not in flags:
                    flags.append(tag)
    e["_flags"] = flags


def main():
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 20
    end = int(sys.argv[2]) if len(sys.argv) > 2 else 270
    build_fold_index()
    log = []
    nvals = nfix = 0
    per_change = {}

    for pno in range(start, end + 1):
        path = DRAFTS / f"p{pno:03d}.json"
        if not path.exists():
            continue
        d = json.loads(path.read_text())
        for gi, g in enumerate(d["groups"]):
            # nomi gruppo (parts in ordine di lingua se 5)
            if g.get("parts") and len(g["parts"]) == 5:
                for li, part in enumerate(g["parts"]):
                    fixed, ch = autofix_value(part, LANGS[li])
                    if ch:
                        log.append({"page": pno, "where": f"group[{gi}].parts[{li}]",
                                    "before": part, "after": fixed, "kinds": ch})
                        g["parts"][li] = fixed
                        nfix += 1
                        for c in ch:
                            per_change[c] = per_change.get(c, 0) + 1
                    nvals += 1
            for ei, e in enumerate(g["entries"]):
                for lang in LANGS:
                    if lang not in e:
                        continue
                    fixed, ch = autofix_value(e[lang], lang)
                    if ch:
                        log.append({"page": pno, "where": f"entry[{gi}.{ei}].{lang}",
                                    "before": e[lang], "after": fixed, "kinds": ch})
                        e[lang] = fixed
                        nfix += 1
                        for c in ch:
                            per_change[c] = per_change.get(c, 0) + 1
                    nvals += 1
                relint_entry(e)
        path.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n")

    (ROOT / "scripts" / "autofix_log.json").write_text(
        json.dumps(log, ensure_ascii=False, indent=1))

    # statistiche residue
    from collections import Counter
    residual = Counter()
    nflag = 0
    for pno in range(start, end + 1):
        path = DRAFTS / f"p{pno:03d}.json"
        if not path.exists():
            continue
        d = json.loads(path.read_text())
        for g in d["groups"]:
            for e in g["entries"]:
                real = [f for f in e["_flags"] if not f.startswith("oriz")]
                # oriz senza altri problemi non conta
                if real:
                    nflag += 1
                    for f in real:
                        residual[f.split(":")[0] if ":" in f else f] += 1
    print(f"valori processati: {nvals}, corretti: {nfix} ({per_change})")
    print(f"voci con flag residue: {nflag}")
    print("flag residue:", dict(residual.most_common(20)))
    print(f"log: scripts/autofix_log.json ({len(log)} correzioni)")


if __name__ == "__main__":
    main()
