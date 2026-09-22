
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

---
Task ID: 2
Agent: main (Super Z)
Task: Replicare la UI del gioco dagli screenshot del repo (pull ultima commit)

Work Log:
- Pull del repo jessicacarter9955/wordsearch: ultima commit aggiunge screenshots/menu_main.png e screenshots/gameplay_italian.png (1672x2508)
- Analisi VLM dettagliata di entrambi gli screenshot (layout, colori, proporzioni, stili)
- Campionamento pixel reale (PIL) degli sfondi: menu = glow ciano #05d2fa al 50%/30% su base blu-viola #1718d3; gameplay = glow #05aafb al 50%/14% su #033ed2
- Misurazione proporzioni reali: placca 78% larghezza/top 32%, PLAY 33% larghezza/centro y 73%
- Restyle completo con codice originale: globals.css (classi ws-bg, ws-bg-game, ws-btn con cupola ::after, ws-btn-play glow viola, ws-timer, ws-glass, ws-grid-panel tubo ciano, ws-plaque, ws-logo-stroke/fill bubble text), font Baloo 2
- Nuovi componenti: decor.tsx (LetterBackground griglia deterministica, GlossyIconButton, SpeakerIcon con slash rossa), menu-screen.tsx (replica menu: bottoni angoli, placca WORD SEARCH bubble + lente conic metallica, PLAY glow), select-screen.tsx (glass), game-screen.tsx (timer pill MM:SS:CS, 4 bottoni squircle, pannello parole, griglia)
- page.tsx ristrutturato su 3 schermate: menu -> select -> game; timer con centesimi (formatTimerMs); difficoltà default medium (10x10 come riferimento)
- devIndicators: false in next.config.ts (badge N rimosso)
- Confronti iterativi VLM: menu 45% -> 75%, gameplay 85%
- BUG CRITICO TROVATO E FIXATO: nella riscrittura di game-board.tsx gli event handler (onPointerDown/Move/Up/Cancel) erano stati omessi dal div role=grid -> drag non funzionante. Diagnostica: probe DOM (eventi presenti) vs console.log React handler (mai chiamato). Fix: handler ripristinati.
- Verifica E2E completa: navigazione menu->select->game, drag 8/8 parole, vittoria con dialog, replay, mobile 390px no-overflow, lint clean, 0 errori console

Stage Summary:
- UI replicata quasi pixel-perfect con implementazione 100% originale (nessun codice/asset del prodotto commerciale usato; icone lucide come richiesto dall'utente)
- Similarità visiva stimata: menu ~75%, gameplay ~85% (differenze residue: font logo custom dell'originale non replicabile, dettagli skeuomorfi soggettivi)
- Gameplay pienamente funzionante dopo fix handler
- Comparazioni salvate in scripts/compare_menu.png e scripts/compare_gameplay.png

---
Task ID: 3
Agent: main (Super Z)
Task: "Cosa manca per pubblicarlo su YouTube Playables, itch.io e avere ads?" — analisi gap + build standalone pubblicabile

Work Log:
- Letti tutti i sorgenti (page.tsx, 5 componenti game, engine, sfx, globals.css, seed) per il port
- Creato build standalone single-file (scripts/standalone/index.html, scritto a 5 chunk): UI replica dell'app (menu/select/game + overlay vittoria/info), icone lucide inline SVG, CSS hand-ported da Tailwind (classi ws-* identiche), 552 vocaboli incorporati, motore/sfx portati 1:1, localStorage con try/catch + shim ytgame (YouTube Playables) per i salvataggi, zero richieste di rete
- Font: individuato Baloo 2 variable wght 400-800 (subset latino, 33KB) nella cache next/font; copiato in scripts/assets/baloo2-latin-var.woff2; incorporato in base64 via scripts/build_standalone.py
- Build: download/crucipuzzle/index.html + download/crucipuzzle.html (105.9 KB) + download/crucipuzzle-itchio.zip (51.2 KB, index.html in root)
- E2E con agent-browser (mouse reale): menu->select->game, drag 8/8 parole con anteprima, vittoria 2 stelle a 130s punteggio 700, record salvato + badge "2:10" sulla tessera, RIGIOCA, aiuto (hintsUsed=1, cella hint), pausa (timer congelato verificato) e ripresa, mute persistito, cambio lingua EN (3 categorie), mobile 390x844 senza overflow X, 0 errori console
- Nota: il click GIOCA via "find first" del CLI falliva per un quirk di sovrapposizione del tool; con click mouse reale alle coordinate funziona correttamente (non è un bug del gioco)
- QA visivo VLM (z-ai vision): desktop menu/select/game OK su 5 controlli; vittoria+mobile OK; similarità menu vs reference originale ~75% (in linea con l'app Next.js)
- Copertina itch.io 630x500 (scripts/make_cover.py): gradiente ws-bg, lettere faint, placca bubble con estrusione/contorno/fill sfumato via PIL+fontTools instancer, lente, mini-griglia con GIOCO evidenziato, PLAY glossy, badge categorie; QA VLM OK
- Asset pagina: download/crucipuzzle-assets/ (cover-itchio.png/jpg + 5 screenshot)

Stage Summary:
- Deliverable pronti per la pubblicazione: crucipuzzle-itchio.zip (caricabile subito su itch.io), crucipuzzle.html (giocabile ovunque offline), cover e screenshot
- Lo standalone è già conforme ai vincoli tecnici di itch.io e compatibile con i requisiti base di YouTube Playables (self-contained, touch, salvataggi via shim ytgame)
- Restano azioni esterne all'utente: account itch.io + pagina gioco; candidatura partner YouTube Playables + integrazione SDK completa; per gli ads: portali (GameDistribution/CrazyGames/Poki) o sito proprio con AdSense (serve privacy policy GDPR)

---
Task ID: 5
Agent: main (Super Z)
Task: Fix runtime error "wordbanks?.find is not a function" + completare integrazione sottocategorie/statistiche

Work Log:
- Diagnosi: /api/wordbanks restituiva 500 perché il Prisma Client era stantio (schema con parentId/slug/isNew/sortOrder/display generato prima dell'update) -> la risposta {error} veniva parsata come JSON valido e finiva nello state wordbanks (oggetto, non array) -> crash su .find()
- Fix root cause: `npx prisma generate` + riavvio dev server con .next pulito
- Fix difensivo in page.tsx: fetch /api/wordbanks ora valida Array.isArray(data) prima del setState
- Verificato DB: 5 lingue, colonne nuove presenti, 1515 parole (seed sessione precedente OK)
- Completata UI sottocategorie in select-screen.tsx: pannello chip "Tutta la categoria" + 11 gruppi (Corpo, Viso, Mano, ...) con emoji, conteggio parole e badge record; badge Layers sul tile categoria; separatore "✨ NUOVE CATEGORIE" fra vecchie e nuove
- page.tsx: stato subcategoryId (reset su cambio categoria/lingua), startGame usa subcategoryId ?? categoryId, maxLen=cfg.maxWordLength passato a /api/words, chiavi best-time su id effettivo, onReplay mantiene la sottocategoria
- Completata schermata statistiche (stats-screen.tsx era orfana): aggiunti tipi LanguageWords + THEMATIC_SLUGS in types.ts, modalità /api/words?languageCode=xx (vocabolario completo per lingua, famiglia deduplicata), registrazione recordFoundWord(lang, parola) in handleSelection, bottone Trophy in basso a sinistra nel menu
- E2E con agent-browser: menu -> select IT (13 cat + badge 11 su Persone) -> pannello sottocategorie -> partita "PERSONE · MANO" -> drag ANULARE trovato -> statistiche "LE MIE PAROLE" (1/188, sezione "I miei temi", chip anulare verde) -> FR: Gens + 11 sottocategorie francesi -> partita "GENS · MAIN" -> divider NUOVE CATEGORIE verificato in IT -> mobile 390px senza overflow -> 0 errori console/pagina
- tsc --noEmit pulito su src/, eslint pulito, /api/wordbanks OK, home HTTP 200

Stage Summary:
- Crash risolto: causa era il Prisma Client non rigenerato dopo il cambio schema della sessione precedente
- Funzionalità sottocategorie opzionali completa e verificata su 5 lingue (gioca tutta la categoria o un solo gruppo)
- Schermata statistiche integrata e funzionante (bandiere, ✓/✗, contatore volte, temi vs classiche)
- Deliverable dati già pronti dalle sessioni precedenti: data/wordbank.json (versione 2), supabase/schema.sql + seed-wordbank.sql
- Restano 14 categorie del dizionario visivo da popolare quando l'utente fornirà le prossime pagine OCR (aspetto, salute, servizi, shopping, mangiare fuori, studio, trasporti, tempo libero, ambiente, altro)

---
Task ID: 6
Agent: main (Super Z)
Task: Uploader in-game per il PDF del dizionario (nessun limite di dimensione)

Work Log:
- Aggiunto POST /api/upload (route.ts): il client invia il File come corpo raw (no multipart) e il server lo strema su disco con pipeline(Readable.fromWeb, createWriteStream) in uploads/ — zero buffering in memoria, NESSUN limite di dimensione; nome file sanitizzato, stesso nome = sostituzione
- Aggiunto GET /api/upload: elenca i file caricati (nome, dimensione, data) con Cache-Control no-store
- Nuovo componente upload-dialog.tsx: drag & drop + click per scegliere, upload via XMLHttpRequest (unico modo per avere l'evento progress), barra di avanzamento con percentuale e MB trasferiti, stati successo/errore con retry, elenco file già caricati, messaggio "chiedi all'assistente di analizzarlo"; reset stato alla chiusura (pattern lint-safe senza setState-in-effect)
- Menu: bottone libro (BookOpen) in basso a destra, simmetrico al Trophy statistiche in basso a sinistra
- .gitignore: aggiunto /uploads/ (i PDF caricati restano fuori dal repo)
- Test NO-LIMIT: dd 300MB -> curl POST -> salvato byte-perfetto (314.572.800 byte) in 1,8s; GET elenco OK; file di test rimosso
- E2E browser: menu -> bottone "Carica dizionario PDF" -> dialog -> input file esposto via eval -> upload PDF di test 1,5KB -> "File caricato!" con nome+dimensione -> file su disco byte-identical (cmp OK) -> mobile 390px senza overflow -> 0 errori console
- tsc pulito su src/, eslint pulito

Stage Summary:
- L'utente può ora caricare il PDF del dizionario direttamente dal gioco (menu -> icona libro): drag&drop o selezione, progress live, nessun limite di dimensione
- I file finiscono in /home/z/my-project/uploads/ (fuori dal repo git): quando arriva un caricamento, leggerlo da lì per l'analisi (estrazione parole per pagina -> nuove categorie wordbank.json -> reseed)
- uploads/ è vuoto e pronto per il PDF reale

---
Task ID: 7
Agent: main (Super Z)
Task: Fix 502 durante il caricamento ("Errore di rete durante il caricamento")

Work Log:
- Diagnosi: il log del dev server NON contiene la richiesta dell'utente → il 502 arriva PRIMA del container. Test isolati: 300MB via localhost:3000 OK (1,7s), 300MB via Caddy :81 OK (1,7s) → il colpevole è il gateway esterno del preview URL che rifiuta/interrompe richieste singole grandi o lente
- Soluzione: upload a BLOCCHI (chunked) — il client spezza il file e il server accoda i pezzi, così ogni richiesta è piccola e veloce
- Server route.ts: modalità blocchi con ?offset=N&last=1 → scrive su .nome.part (offset 0 = tronca/crea, offset>0 = 'r+' con start esatto così un retry sovrascrive i propri byte senza duplicati), last=1 → rename al nome finale; offset>0 senza .part → 409 {restart:true}; modalità file intero mantenuta per compatibilità; GET lista ora esclude i .part
- Client upload-dialog.tsx: uploadChunked() con blocchi da 4MB, progress complessivo (offset confermato + caricato del blocco corrente), 2 tentativi per dimensione poi dimezzo automatico fino a 256KB (aggira sia limiti di size che timeout del proxy), backoff 900ms, gestione 409 restart ripartendo da 0, caso file vuoto gestito
- Test protocollo (scripts/test-chunk-upload.sh): sequenza 3 blocchi byte-identical; retry stesso offset senza duplicati; 409 restart OK; lista GET senza .part; 20MB in blocchi da 4MB via fetch byte-identical
- E2E browser: dialog → upload PDF test → "File caricato!" 1.5KB → file su disco byte-identical → 0 errori console
- tsc + eslint puliti

Stage Summary:
- L'uploader ora funziona anche attraverso il gateway del preview URL: il file viaggia a blocchi da 4MB (auto-ridotti a 256KB se il proxy continua a rifiutare), con progress live, retry automatici e nessun limite di dimensione
- uploads/ vuoto e pronto per il PDF reale del dizionario

---
Task ID: 8
Agent: main (Super Z)
Task: Pipeline estrazione dizionario con regole utente (articoli via, multi-parola a parte)

Work Log:
- Regole concordate con l'utente per OGNI futura pagina del dizionario: (1) articoli rimossi da tutti i termini, (2) termini multi-parola tenuti COMPLETI ma salvati/flaggati a parte (il gioco ancora non li usa), (3) una categoria per pagina (header 5 lingue), (4) trattino = parola singola (avant-pied si concatena da solo)
- Creato scripts/dictionary_tools.py (riutilizzabile): strip_article per lingua (le/la/l', der/die/das, el/la, il/lo/la/l', the), flag _multi/_hyphen per lingua, _grid_len (lunghezza forma griglia), _articles_removed, salva estratti in data/dictionary-extracts/, comando `page N` per testo grezzo + header categoria, comando `clean` per pulire + diff vs wordbank
- Fix bug regex: articoli apostrofati (l'ongle, l'index) non venivano rimossi — ora l' non richiede spazio
- Processata pagina 13 (curated: scripts/p13_curated.json) → data/dictionary-extracts/p013-people.json: 27 entry (12 singole, 15 multi-parola in almeno una lingua)
- Diff vs wordbank.json: pag 13 già coperta (wrinkle/freckle/pore/dimple in viso, resto in mano/piede); divergenze trovate: es palma de la mano→palma, fr nœud de l'articulation→jointure, de Handknöchel→Knöchel, es dedo gordo del pie→dedo gordo, es parte interna del pie→empeine, es juanete→antepié, en ball→ball of foot, de kleine(r) Finger/Zeh; entry "bridge" (dorso del piede) MANCANTE nel wordbank
- Analisi giocabilità: griglie 8/10/12 con maxWordLength 7/10/12 → multi-parola concatenate ≥13 lettere (es dedopequeñodelpie=17, noeuddelarticulation=20) MAI giocabili in nessuna difficoltà; campo display già presente in DB/API ma non ancora usato nella lista parole (mostra forma concatenata)

Stage Summary:
- Pipeline pronta e dimostrata su pag 13: gli estratti futuri seguiranno automaticamente le regole (articoli via, multi a parte, categoria per pagina)
- data/dictionary-extracts/p013-people.json è il primo estratto pulito (fonte di verità per reseed/arricchimenti)
- Proposte allegate in chat all'utente per l'uso delle multi-parola nel gioco (A concatenata / B parola-chiave+display / C modalità frasi / D solo stats) — attesa decisione prima di toccare seeder/UI

---
Task ID: 9
Agent: main (Super Z)
Task: Pagine 10-19 del dizionario (macro-categoria Persone/corpo umano) — estrazione, curation, merge wordbank, reseed, esclusione multi-parola dai round, sezione A/B/C/D nell'app

Work Log:
- Estratto testo grezzo pagine 10-19 (scripts/dump_pages.py → pages_10_14.txt, pages_15_19.txt); mappatura pagine→sottocategorie: p10+p11 corpo, p12 viso, p13 viso(dettagli pelle)+mano+piede, p14 muscoli, p15 scheletro, p16 organi-interni, p17 testa+sistemi-corporei, p18 organi-riproduttivi (femminili+glossario), p19 organi-riproduttivi (maschili)+contraccezione
- Curati 10 file scripts/pXX_curated.json con correzioni OCR (es. 'la rete'→la tête, 'la rare'→la rate, 'il nasi)'→il naso, 'quadncipite'→quadricipite, 'semmai vesicle'→seminal vesicle, 'la prestata'→la próstata, 'il serio'→il seno) e ricostruzioni (en 'hip'/'lip' mancanti nell'OCR, en 'internal organs' da header de mescolato)
- Pipeline dictionary_tools clean su tutte le 10 pagine → data/dictionary-extracts/p010..p019-people.json con regole utente (articoli via incl. apostrofati, flag _multi per lingua, _grid_len)
- scripts/merge_extracts.py: merge per sottocategoria con match per termine EN; aggiornate le forme alla fedeltà del libro (es. es palma→palma de la mano, fr jointure→nœud de l'articulation, de Knöchel→Handknöchel, es empeine→parte interna del pie [instep], es juanete [ball], it spirale→dispositivo intrauterino, it colonna vertebrale→spina dorsale, it seno paranasale→seno, vertebre it plurale→singolare, de Kreislaufsystem→Herz- und Gefäßsystem, es tiroides→glándula del tiroides, es conducto eyaculador→conducto seminal, it tubo di Falloppio→di Fallopio, it tendine d'Achille→di Achille)
- Aggiunte parole mancanti: corpo +polso (da p11, mancava!) +reni (small of back); muscoli +hamstring(tendine) +calf(polpaccio muscolare) +buttock(natica, fix gluteo/gluteus) +header muscoli; scheletro +jaw(mandibola) +header scheletro; piede +bridge(dorso del piede) +ankle; organi-interni +header organi interni; testa +diaphragm (spostato da sistemi-corporei: nel libro è nel cutaway della pagina head) +header testa; organi-riproduttivi +reproduction +sexually transmitted disease +header; sistemi +header sistemi corporali
- Rimozioni: muscoli/gluteus e /muscolo (doppioni), scheletro/sternum (doppione di breast bone), contraccezione/cervical cap (voce inventata: il libro ha solo cap=cappuccio cervicale), piede/ball of foot→ball, sistemi/diaphragm (spostato)
- Extra preservati con flag: mano/finger (dito), organi-riproduttivi/egg (ovulo — NON verificabile nell'OCR p18, chiedere all'utente)
- Risultato wordbank persone: 204 concetti (corpo 33, viso 21, mano 13, piede 12, muscoli 15, scheletro 28, organi-interni 14, testa 13, sistemi-corporei 13, organi-riproduttivi 36, contraccezione 6), 0 duplicati it-word per sottocategoria
- Rigenerato supabase/seed-wordbank.sql (75 categorie, 1570 parole) + reseed SQLite via npx tsx prisma/seed.ts (1570 parole, era 1515)
- /api/words round mode: NUOVO filtro display?.includes(' ') → tutte le multi-parola escluse dai round (era: solo >maxLen); il filtro è PER LINGUA (ogni lingua ha la sua riga Word: 'big toe' escluso in en ma 'alluce' giocabile in it)
- /api/words modalità vocabolario (languageCode): ora restituisce {text, display} con forma naturale deduplicata per text (prima solo text concatenato: 'TENDINEDIACHILLE'); aggiornati LanguageWords in types.ts e stats-screen.tsx (match trovate su text, rendering display)
- info-dialog.tsx: nuova sezione violetta 'Parole composte — da valutare' con opzioni A Concatenata / B Parola-chiave ⭐ / C Modalità frasi / D Solo vocabolario (richiesta dell'utente)
- E2E agent-browser: dialog info con 4 opzioni ✓, partita Scheletro hard (mandibola+scheletro nuove in gioco, 0 multi leak su 5 round), Muscoli medium (muscoli/polpaccio nuovi), FR contraccezione (STÉRILET incluso=giocabile in fr mentre IUD escluso in it → per-lingua ok), partita Mano facile con drag MIGNOLO trovata, statistiche: 192 chip Persone con multi naturali ('dito del piede', 'arco plantare', 'tendine di achille') e match ✓ su mignolo; 0 errori console/pagina
- tsc --noEmit pulito su src/, eslint pulito

Stage Summary:
- Pipeline dizionario completa e dimostrata su 10 pagine: estratti puliti in data/dictionary-extracts/ (fonte di verità), wordbank.json aggiornato alla fedeltà del libro, DB reseedato (1570 parole), SQL Supabase rigenerato
- Multi-parola ora ESCLUSE da tutti i round (per lingua) ma visibili nelle statistiche con forma naturale — in attesa della decisione A/B/C/D (sezione 'Da valutare' nel dialog info del gioco)
- Da chiedere all'utente: (1) conferma extra 'finger' in mano e 'egg' in organi-riproduttivi (non in OCR), (2) conferma spostamento diaframma in Testa, (3) scelta opzione A/B/C/D
- Prossime pagine dizionario: dal p20 in poi (fuori dal corpo umano: aspetto, salute, servizi, shopping...)
