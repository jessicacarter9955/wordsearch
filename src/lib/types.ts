export interface WordbankCategory {
  id: number
  slug: string
  name: string
  description: string
  emoji: string
  color: string
  wordCount: number
}

export interface Wordbank {
  code: string
  name: string
  emoji: string
  categories: WordbankCategory[]
}

export interface RoundWord {
  id: number
  text: string
  difficulty: string
}

/** Colori delle evidenziazioni per le parole trovate */
export const WORD_COLORS = [
  '#059669', // emerald-600
  '#e11d48', // rose-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#0d9488', // teal-600
  '#ea580c', // orange-600
  '#db2777', // pink-600
  '#65a30d', // lime-600
  '#0891b2', // cyan-600
  '#c026d3', // fuchsia-600
]
