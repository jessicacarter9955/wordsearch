
---
Task ID: 1
Agent: main (Super Z)
Task: Clona il gameplay del word search di CodeCanyon (item 16683995) come app Next.js giocabile + spiega architettura vocabolario

Work Log:
- Ispezionato il repo GitHub fornito (jessicacarter9955/wordsearch): risultato = rip non autorizzato del demo commerciale di CodeThisLab (showcase.codethislab.com), nessuna licenza, README ammette "template acquistato". Decisione: non integrare il codice commerciale; implementazione originale con la stessa architettura concettuale (lingue→categorie→parole su DB).
- Prisma schema: modelli Language, Category, Word (SQLite) + db:push
- Seed (prisma/seed.ts): 552 parole — 12 categorie IT + 3 EN, difficoltà auto per lunghezza
- API: GET /api/wordbanks (lingue+categorie+conteggi), GET /api/words?categoryId&count (estrazione casuale per partita)
- Motore (src/lib/game-engine.ts): generatePuzzle con piazzamento 8 direzioni + incroci, fill lettere pesate, lineBetween, matchPlacement
- SFX procedurali WebAudio (tick/found/wrong/win/hint) — zero asset
- UI: HomeScreen (lingue, categorie, difficoltà, record), GameBoard (pointer events mouse+touch, barre SVG arrotondate), WinDialog (stelle/statistiche), InfoDialog (spiegazione vocabolario), page.tsx orchestratore con timer/pausa/punteggio/aiuti/record localStorage
- Bug fix: bottone Gioca senza onClick → aggiunto prop onStart
- Verifiche: lint clean, 0 errori console, drag E2E su SCIMMIA (diagonale) OK, vittoria OK, replay OK, record salvato ({1_easy:147}), hint OK, mobile 390px senza overflow

Stage Summary:
- Deliverable: gioco Crucipuzzle completo e verificato su / (Next.js 16 + Prisma/SQLite)
- Architettura vocabolario: DB SQLite 3 tabelle + 2 API REST, parole aggiornabili senza toccare codice
- Non è stato usato alcun codice del prodotto commerciale
