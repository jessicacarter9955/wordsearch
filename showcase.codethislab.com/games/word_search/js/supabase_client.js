// Client Supabase per Word Search Game
// Gestisce il caricamento delle parole dal database Supabase

class SupabaseWordLoader {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.enabled = config.useSupabase && config.url && config.anonKey;
    }

    // Inizializza il client Supabase
    async init() {
        if (!this.enabled) {
            console.log("Supabase disabled, using hardcoded words");
            return false;
        }

        try {
            // Carica la libreria Supabase dinamicamente
            if (typeof supabase === 'undefined') {
                await this.loadSupabaseScript();
            }

            // Inizializza il client
            this.client = supabase.createClient(
                this.config.url,
                this.config.anonKey
            );

            console.log("Supabase client initialized successfully");
            return true;
        } catch (error) {
            console.error("Failed to initialize Supabase:", error);
            this.enabled = false;
            return false;
        }
    }

    // Carica la libreria Supabase
    loadSupabaseScript() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Carica le lingue disponibili
    async loadLanguages() {
        if (!this.enabled || !this.client) {
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('languages')
                .select('*')
                .order('id');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("Error loading languages:", error);
            return null;
        }
    }

    // Carica le categorie per una lingua specifica
    async loadCategories(languageCode) {
        if (!this.enabled || !this.client) {
            return null;
        }

        try {
            const { data, error } = await this.client
                .from('categories')
                .select(`
                    *,
                    words (word)
                `)
                .eq('language_id', languageCode)
                .order('id');

            if (error) throw error;

            // Converti il formato nel formato usato dal gioco
            return this.formatCategoriesForGame(data);
        } catch (error) {
            console.error("Error loading categories:", error);
            return null;
        }
    }

    // Formatta le categorie nel formato usato dal gioco
    formatCategoriesForGame(categories) {
        if (!categories || categories.length === 0) {
            return null;
        }

        const alphabet = categories[0].languages?.alphabet || "abcdefghijklmnopqrstuvwxyz".split("");

        const formattedCategories = categories.map(cat => ({
            cat_name: cat.name,
            words: cat.words.map(w => w.word),
            rows: cat.rows || 10,
            cols: cat.cols || 10
        }));

        return {
            alphabet: alphabet,
            categories: formattedCategories
        };
    }

    // Carica i dati completi per una lingua
    async loadLanguageData(languageCode) {
        if (!this.enabled || !this.client) {
            return null;
        }

        try {
            // Prima ottieni la lingua
            const { data: langData, error: langError } = await this.client
                .from('languages')
                .select('*')
                .eq('code', languageCode)
                .single();

            if (langError) throw langError;

            // Poi ottieni le categorie con le parole
            const categories = await this.loadCategories(langData.id);

            if (!categories) {
                throw new Error("Failed to load categories");
            }

            return {
                alphabet: langData.alphabet.split(""),
                categories: categories.categories
            };
        } catch (error) {
            console.error("Error loading language data:", error);
            return null;
        }
    }

    // Funzione helper per ottenere il codice lingua dall'indice
    getLanguageCode(index) {
        const codes = ['en', 'fr', 'de', 'it', 'pt', 'es'];
        return codes[index] || 'en';
    }
}

// Crea istanza globale del loader
let s_oSupabaseLoader = null;

// Funzione per inizializzare il loader
function initSupabaseLoader(config) {
    if (!s_oSupabaseLoader) {
        s_oSupabaseLoader = new SupabaseWordLoader(config);
    }
    return s_oSupabaseLoader;
}

// Funzione per ottenere il loader
function getSupabaseLoader() {
    if (!s_oSupabaseLoader && typeof SUPABASE_CONFIG !== 'undefined') {
        s_oSupabaseLoader = new SupabaseWordLoader(SUPABASE_CONFIG);
    }
    return s_oSupabaseLoader;
}