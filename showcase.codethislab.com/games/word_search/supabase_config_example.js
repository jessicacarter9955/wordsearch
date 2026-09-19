// Configurazione Supabase per Word Search Game
// Rinomina questo file in supabase_config.js con le tue credenziali reali

const SUPABASE_CONFIG = {
    // Sostituisci con il tuo URL Supabase
    // Es: "https://your-project.supabase.co"
    url: "YOUR_SUPABASE_URL_HERE",
    
    // Sostituisci con la tua anon key Supabase
    // Trovala in: Supabase Dashboard -> Settings -> API -> anon/public key
    anonKey: "YOUR_SUPABASE_ANON_KEY_HERE",
    
    // Switch per passare tra hardcoded e Supabase
    // true = usa database Supabase
    // false = usa parole hardcoded (default)
    useSupabase: false
};

// Per disabilitare temporaneamente Supabase in caso di problemi
const SUPABASE_ENABLED = false;