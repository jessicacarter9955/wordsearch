# Word Search Game - Supabase Integration

Un gioco di ricerca parole HTML5 con supporto per database Supabase per scalabilità.

## Caratteristiche

- 🎮 Gioco di ricerca parole con 6 lingue supportate
- 🌍 Supporto multilingua: Inglese, Francese, Tedesco, Italiano, Portoghese, Spagnolo
- 🔄 Switch facile tra parole hardcoded e database Supabase
- 🗄️ Schema database PostgreSQL gratuito via Supabase
- 📱 Responsive design per mobile e desktop

## Modalità di funzionamento

Il gioco supporta due modalità per caricare le parole:

### 1. Modalità Hardcoded (Default)
- Le parole sono definite direttamente nel codice JavaScript
- Funziona offline senza connessione internet
- Ideale per sviluppo e testing

### 2. Modalità Supabase
- Le parole vengono caricate da database Supabase
- Scalabile per migliaia di parole
- Facile aggiornamento senza rilasciare update
- Richiede connessione internet

## Setup Rapido

### Per eseguire il gioco localmente:

1. Clona il repository
2. Naviga nella cartella del gioco:
   ```bash
   cd showcase.codethislab.com/games/word_search
   ```
3. Avvia un server locale:
   ```bash
   python -m http.server 8000
   ```
4. Apri http://localhost:8000 nel browser

## Configurazione Supabase

### 1. Crea un progetto Supabase gratuito
- Vai su [supabase.com](https://supabase.com)
- Crea un account gratuito
- Crea un nuovo progetto

### 2. Configura il database
Esegui lo script SQL nel file `supabase_schema.sql` nell'editor SQL di Supabase:
```bash
# Copia il contenuto di supabase_schema.sql
# Incollalo nell'editor SQL di Supabase
# Esegui lo script
```

### 3. Configura le credenziali
Rinomina `supabase_config_example.js` in `supabase_config.js` e inserisci le tue credenziali:

```javascript
const SUPABASE_CONFIG = {
    // Il tuo URL Supabase (es: "https://your-project.supabase.co")
    url: "YOUR_SUPABASE_URL_HERE",
    
    // La tua anon key (trovala in Supabase Dashboard -> Settings -> API)
    anonKey: "YOUR_SUPABASE_ANON_KEY_HERE",
    
    // Switch per abilitare Supabase
    useSupabase: false  // Cambia in true per usare Supabase
};
```

### 4. Abilita Supabase
Cambia `useSupabase: false` in `useSupabase: true` nel file di configurazione.

## Aggiungere parole al database

### Via Supabase Dashboard:
1. Vai alla tabella "words" nel dashboard Supabase
2. Clicca "Insert row"
3. Inserisci i dati:
   - `category_id`: ID della categoria
   - `word`: La parola da aggiungere
   - `difficulty`: 'easy', 'medium', o 'hard'

### Via API o Script:
Puoi creare script per inserire parole in massa nel database.

## Struttura del Database

### Tabelle:
- **languages**: Lingue supportate (en, fr, de, it, pt, es)
- **categories**: Categorie di parole per ogni lingua
- **words**: Parole individuali con categoria e difficoltà

### Relazioni:
- Una lingua ha molte categorie
- Una categoria ha molte parole

## Switch tra modalità

Per passare da hardcoded a Supabase:

1. Apri `supabase_config.js`
2. Cambia `useSupabase: false` in `useSupabase: true`
3. Ricarica il gioco

Il gioco fallback automaticamente alle parole hardcoded se Supabase non è disponibile.

## Troubleshooting

### Il gioco non carica le parole da Supabase:
- Verifica che `useSupabase` sia `true`
- Controlla che URL e anon key siano corretti
- Apri la console del browser per errori
- Verifica che le tabelle abbiano dati

### Vuoi usare solo le parole hardcoded:
- Imposta `useSupabase: false` in `supabase_config.js`
- Oppure rimuovi i file Supabase dall'HTML

## File Principali

- `index.html` - Pagina principale del gioco
- `js/main.js` - Logica del gioco (con funzioni CLang0-CLang5 modificate)
- `js/supabase_client.js` - Client Supabase per caricare le parole
- `supabase_config.js` - Configurazione Supabase
- `supabase_schema.sql` - Schema del database

## Supporto Lingue

Il gioco supporta 6 lingue:
- CLang0: Inglese (en)
- CLang1: Francese (fr) 
- CLang2: Tedesco (de)
- CLang3: Italiano (it)
- CLang4: Portoghese (pt)
- CLang5: Spagnolo (es)

## Piano di Sviluppo Futuro

- [ ] Dashboard admin per gestire le parole
- [ ] Statistiche di gioco
- [ ] Sistema di difficoltà dinamico
- [ ] Punteggi e leaderboard
- [ ] Supporto per più lingue personalizzate

## Licenza

Questo gioco è basato su un template acquistato. Le modifiche per l'integrazione Supabase sono open source.

## Supporto

Per problemi o domande:
- Controlla la console del browser per errori
- Verifica la configurazione Supabase
- Assicurati che il database abbia dati nelle tabelle