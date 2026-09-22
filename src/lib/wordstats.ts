/**
 * Statistiche delle parole trovate (localStorage).
 * Struttura: { [langCode]: { [PAROLA]: volte_trovata } }
 */

export const WORDSTATS_KEY = 'crucipuzzle_wordstats'

export type WordStats = Record<string, Record<string, number>>

export function loadWordStats(): WordStats {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(WORDSTATS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** Incrementa il contatore di una parola trovata e persiste. */
export function recordFoundWord(lang: string, word: string): WordStats {
  const stats = loadWordStats()
  const langStats = stats[lang] ?? {}
  langStats[word] = (langStats[word] ?? 0) + 1
  stats[lang] = langStats
  try {
    localStorage.setItem(WORDSTATS_KEY, JSON.stringify(stats))
  } catch {
    // storage pieno o non disponibile: le statistiche sono best-effort
  }
  return stats
}

export interface WordStatsSummary {
  /** parole distinte trovate (somma tra le lingue) */
  unique: number
  /** totale trovati (parole × volte) */
  total: number
  /** lingue con almeno una parola trovata */
  langs: number
}

export function summarizeWordStats(stats: WordStats): WordStatsSummary {
  let unique = 0
  let total = 0
  let langs = 0
  for (const words of Object.values(stats)) {
    const keys = Object.keys(words)
    if (keys.length > 0) langs++
    unique += keys.length
    total += keys.reduce((acc, k) => acc + words[k], 0)
  }
  return { unique, total, langs }
}
