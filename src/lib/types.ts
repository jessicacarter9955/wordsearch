export interface WordbankSubcategory {
  id: number
  slug: string
  name: string
  emoji: string
  wordCount: number
}

export interface WordbankCategory {
  id: number
  slug: string
  name: string
  description: string
  emoji: string
  color: string
  wordCount: number
  isNew: boolean
  subcategories: WordbankSubcategory[]
}

export interface Wordbank {
  code: string
  name: string
  emoji: string
  categories: WordbankCategory[]
}

/**
 * Vocabolario completo di una lingua (per la schermata statistiche):
 * una sezione per categoria radice, con le parole di tutta la famiglia
 * (categoria + sottocategorie) deduplicate.
 */
export interface LanguageWords {
  code: string
  name: string
  categories: {
    id: number
    slug: string
    name: string
    emoji: string
    words: string[]
  }[]
}

/**
 * Slug delle categorie "tematiche" del dizionario visivo (nuove categorie).
 * Quelle aggiunte in seguito entreranno automaticamente nella sezione
 * "I miei temi" delle statistiche; le categorie classiche restano a parte.
 */
export const THEMATIC_SLUGS: readonly string[] = [
  'persone',
  'aspetto',
  'abbigliamento',
  'salute',
  'servizi',
  'shopping',
  'mangiare-fuori',
  'studio',
  'trasporti',
  'tempo-libero',
  'ambiente',
  'altro',
] as const

export interface RoundWord {
  id: number
  text: string
  display: string
  difficulty: string
}

/** Colori delle evidenziazioni per le parole trovate */
export const WORD_COLORS = [
  '#059669', // emerald-600
  '#e11d48', // rose-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#0d9486', // teal-600
  '#ea580c', // orange-600
  '#db2777', // pink-600
  '#65a30d', // lime-600
  '#0891b2', // cyan-600
  '#c026d3', // fuchsia-600
]
