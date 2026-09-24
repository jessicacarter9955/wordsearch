# 🔍 Crucipuzzle — Word Search Multilingue

Gioco **word search (crucipuzzle)** originale giocabile in **5 lingue**:
🇮🇹 Italiano · 🇬🇧 English · 🇫🇷 Français · 🇩🇪 Deutsch · 🇪🇸 Español.

Implementazione **100% originale** (nessun codice di template commerciali):
motore di generazione griglie, effetti sonori procedurali e UI sviluppati da zero.

## ✨ Caratteristiche

- **Griglie generate proceduralmente** — 8 direzioni di piazzamento, incroci,
  riempimento lettere pesato: ogni partita è diversa
- **3 difficoltà** — Facile 8×8 (6 parole) · Medio 10×10 (8) · Difficile 12×12 (10)
- **Vocabolario su database** — lingue → categorie → sottocategorie → parole,
  aggiornabile senza toccare il codice
- **Sistema aiuti con spot a premio** — 3 aiuti gratuiti per partita, poi uno
  spot a premio per ogni aiuto extra (adapter `RewardedAdProvider` pronto per
  reti reali: AdSense for Games, GameDistribution, AdMob su mobile)
- **Statistiche vocabolario** — parole trovate per lingua, temi e categorie
- **Audio procedurale** — Web Audio API, zero asset esterni
- **Record e preferenze** persistiti in localStorage
- **Responsive** — mouse e touch, da 390px in su

## 🛠 Stack

| Livello | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Lingua | TypeScript |
| Stile | Tailwind CSS 4 |
| Database | Prisma ORM + SQLite |
| Icone | lucide-react |

## 🚀 Avvio in locale

```bash
# installa le dipendenze
bun install        # oppure npm install

# crea il database SQLite e popola i vocabolari
cp .env.example .env   # se non esiste: DATABASE_URL="file:./db/custom.db"
npx prisma db push
npx tsx prisma/seed.ts

# avvia il dev server
bun dev            # oppure npm run dev
```

Il gioco è disponibile su `http://localhost:3000`.

## 📁 Struttura

```
src/
  app/                 # pagina principale (orchestratore schermate) + API routes
    api/wordbanks/     # GET lingue + categorie + conteggi
    api/words/         # GET estrazione parole per partita / vocabolario completo
    api/upload/        # POST caricamento a blocchi (dizionari PDF, no limit)
  components/game/     # schermate: menu, select, game, stats, win, dialogs
  lib/
    game-engine.ts     # generazione griglie, matching selezioni
    rewarded-ads.ts    # contratto spot a premio + costanti sistema aiuti
    sfx.ts             # effetti sonori procedurali (Web Audio)
    wordstats.ts       # statistiche vocabolario (localStorage)
prisma/                # schema + seed
data/                  # wordbank.json + estratti dizionario (fonte dati)
scripts/               # tooling: build standalone, estrazione dizionario, review
supabase/              # schema SQL + seed per deploy Postgres
download/              # build standalone (itch.io / YouTube Playables) e asset
```

## 🧩 Sistema aiuti (regole)

1. Il contatore parte da **0** a ogni partita (nessun accumulo tra partite)
2. I primi **3 aiuti** sono gratuiti e immediati
3. Dal quarto, ogni aiuto richiede la **visione completa di uno spot a premio**:
   la ricompensa vale **un solo aiuto**, consumato subito — chiudere lo spot
   in anticipo non dà nulla

## 📦 Build standalone

La versione single-file (senza server, per itch.io / YouTube Playables / embed)
si genera con:

```bash
python3 scripts/build_standalone.py
```

Output in `download/` — già pronta una build funzionante.

## ℹ️ Note

- I vocabolari derivano da un dizionario visuale a 5 lingue processato con
  pipeline OCR dedicata (estrazione, pulizia, revisione) — vedi `data/` e
  `scripts/dictionary_tools.py`
- Il gioco web attualmente usa uno **spot demo** etichettato: le reti reali si
  agganciano implementando l'interfaccia `RewardedAdProvider`
