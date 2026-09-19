-- Schema del database Supabase per Word Search Game
-- Questo schema supporta più lingue e categorie

-- Tabella delle lingue
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL, -- es: 'en', 'it', 'fr'
    name VARCHAR(50) NOT NULL, -- es: 'English', 'Italiano'
    alphabet TEXT NOT NULL, -- es: 'abcdefghijklmnopqrstuvwxyz'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella delle categorie
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    language_id INTEGER REFERENCES languages(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- es: 'Fruits', 'Frutti'
    rows INTEGER DEFAULT 10,
    cols INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella delle parole
CREATE TABLE words (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    word VARCHAR(100) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_words_category ON words(category_id);
CREATE INDEX idx_categories_language ON categories(language_id);
CREATE INDEX idx_words_language ON words(category_id) REFERENCES categories(id);

-- RLS (Row Level Security) policies
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- Policy per permettere lettura pubblica
CREATE POLICY "Allow public read access to languages" ON languages
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to words" ON words
    FOR SELECT USING (true);

-- Policy per admin write (da configurare dopo)
CREATE POLICY "Allow admin insert to languages" ON languages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin insert to categories" ON categories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin insert to words" ON words
    FOR INSERT WITH CHECK (true);

-- Dati iniziali (opzionale - puoi popolare con script separato)
INSERT INTO languages (code, name, alphabet) VALUES
('en', 'English', 'abcdefghijklmnopqrstuvwxyz'),
('fr', 'Français', 'abcdefghijklmnopqrstuvwxyz'),
('de', 'Deutsch', 'abcdefghijklmnopqrstuvwxyz'),
('it', 'Italiano', 'abcdefghijklmnopqrstuvwyz'),
('pt', 'Português', 'abcdefghijklmnopqrstuvwxyz'),
('es', 'Español', 'abcdefghijklmnopqrstuvwxyz');
