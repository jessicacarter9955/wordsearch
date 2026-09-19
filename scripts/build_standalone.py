#!/usr/bin/env python3
"""
Build della versione standalone di Word Search — Crucipuzzle.

Prende scripts/standalone/index.html (con placeholder __BALOO_B64__),
inietta il font Baloo 2 variable (woff2 latin, pesi 400-800) in base64
e produce:
  - download/crucipuzzle/index.html   (per lo zip itch.io)
  - download/crucipuzzle.html         (copia singola giocabile ovunque)
  - download/crucipuzzle-itchio.zip   (index.html in root, pronto per itch.io)

Nessuna richiesta di rete nel gioco: font incorporato, vocaboli incorporati.
"""
import base64
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path('/home/z/my-project')
SRC = ROOT / 'scripts' / 'standalone' / 'index.html'
# font in posizione stabile (la cache .next è volatile: il dev server può ricompilare)
FONT = ROOT / 'scripts' / 'assets' / 'baloo2-latin-var.woff2'
if not FONT.exists():
    FONT = ROOT / '.next' / 'dev' / 'static' / 'media' / 'd7d9c82e455b419c-s.p.b0b7fb4c.woff2'
OUTDIR = ROOT / 'download' / 'crucipuzzle'
OUTDIR.mkdir(parents=True, exist_ok=True)

html = SRC.read_text(encoding='utf-8')

if '__BALOO_B64__' not in html:
    sys.exit('ERRORE: placeholder __BALOO_B64__ non trovato nel sorgente')

font_b64 = base64.b64encode(FONT.read_bytes()).decode('ascii')
html = html.replace('__BALOO_B64__', font_b64)

# --- controlli di sanità -------------------------------------------------
if '__BALOO_B64__' in html:
    sys.exit('ERRORE: placeholder residuo')
# nessun riferimento a risorse esterne (escludi xmlns e data: URI)
esterni = re.findall(r'(?:src|href)\s*=\s*["\'](?!data:|#)([^"\']+)', html)
esterni = [u for u in esterni if not u.startswith('data:')]
if esterni:
    sys.exit(f'ERRORE: riferimenti esterni trovati: {esterni}')

out_index = OUTDIR / 'index.html'
out_index.write_text(html, encoding='utf-8')

out_single = ROOT / 'download' / 'crucipuzzle.html'
out_single.write_text(html, encoding='utf-8')

zip_path = ROOT / 'download' / 'crucipuzzle-itchio.zip'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    z.write(out_index, 'index.html')

kb = lambda p: f'{p.stat().st_size/1024:.1f} KB'
print('OK — build standalone completata')
print(f'  {out_index}  ({kb(out_index)})')
print(f'  {out_single}  ({kb(out_single)})')
print(f'  {zip_path}  ({kb(zip_path)})')
print(f'  font incorporato: {FONT.name} ({FONT.stat().st_size/1024:.1f} KB -> base64 {len(font_b64)/1024:.1f} KB)')
