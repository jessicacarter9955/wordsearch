# Dictionary Data Guide

## 📁 File Disponibili

Dall'estrazione del "5 Language Visual Dictionary" (pagine 10-303), sono stati creati i seguenti file:

### 🎮 **Per uso immediato nel gioco:**
- **`showcase.codethislab.com/games/word_search/dictionary_game_data.json`**
  - Contiene solo parole singole (1-2 lettere no spazi)
  - Formattato compatibile con la struttura del gioco
  - Pronto per essere integrato nel sistema Supabase o hardcoded

### 🔮 **Per uso futuro (opzionale):**
- **`showcase.codethislab.com/games/word_search/dictionary_phrases_optional.json`**
  - Contiene frasi composte (es: "united states of america")
  - Non compatibile con il gioco attuale
  - Riservato per future espansioni (potenziale "Phrase Mode")
  - Articoli rimossi anche dalle frasi

### 📄 **File sorgente:**
- **`extracted_text_full.txt`** - Testo grezzo completo da tutte le pagine
- **`dictionary_game_data_clean.json`** - Versione pulita (in root)
- **`dictionary_phrases_optional.json`** - Versione frasi opzionale (in root)

## 📊 **Statistiche attuali:**

### Parole Singole (gioco):
- **Inglese:** 15 categorie, 127 parole
- **Francese:** 15 categorie, 88 parole ✨ (articoli rimossi)
- **Tedesco:** 21 categorie, 178 parole ✨ (articoli rimossi)
- **Spagnolo:** 14 categorie, 85 parole ✨ (articoli rimossi)
- **Italiano:** 23 categorie, 162 parole ✨ (articoli rimossi)

### Frasi Composte (futuro - opzionale):
- **Inglese:** 89 categorie, 148 frasi
- **Francese:** 141 categorie, 338 frasi ✨ (articoli rimossi)
- **Tedesco:** 105 categorie, 210 frasi ✨ (articoli rimossi)
- **Spagnolo:** 134 categorie, 339 frasi ✨ (articoli rimossi)
- **Italiano:** 126 categorie, 253 frasi ✨ (articoli rimossi)

## 🚀 **Come integrare nel gioco:**

### Opzione 1: Via Supabase (Consigliato)
1. Importa i dati da `dictionary_game_data.json` nel database Supabase
2. Usa lo schema SQL già creato
3. Modifica `supabase_config.js` per abilitare Supabase

### Opzione 2: Hardcoded
1. Sostituisci le funzioni CLang0-CLang5 con i dati dal JSON
2. Mantieni il formato attuale del gioco

## ⚠️ **Note importanti:**

- L'estrazione automatica dal PDF non è perfetta
- Alcuni dati potrebbero richiedere pulizia manuale
- Per un gioco professionale, considera:
  - Estrazione manuale dei termini più importanti
  - OCR più avanzato per PDF complessi
  - Inserimento manuale delle categorie chiave

## 🔧 **Script di elaborazione:**

- `extract_pdf_text.py` - Estrae testo dal PDF
- `process_dictionary_v2.py` - Converte testo in struttura gioco
- Filtra automaticamente parole singole vs frasi composte

## 📝 **Prossimi passi suggeriti:**

1. **Testare i dati attuali** nel gioco
2. **Pulire manualmente** le categorie più importanti
3. **Aggiungere altre categorie** dal dizionario manuale
4. **Integrare con Supabase** per gestione dati scalabile

## 🎯 **Categorie estratte:**

Le categorie includono: corpo umano, casa, cibo, animali, vestiti, trasporti, tempo, natura, ecc. (dal dizionario visivo)

---

*Questi dati sono una base eccellente per espandere il tuo gioco Word Search con migliaia di parole professionalmente curate in 5 lingue!*