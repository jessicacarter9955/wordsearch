/**
 * MOTORE DEL CRUCIPUZZALE — implementazione originale
 * ============================================
 * - generatePuzzle(): piazza le parole nella griglia (con incroci consentiti
 *   quando le lettere coincidono) e riempie le celle vuote con lettere plausibili.
 * - lineBetween(): data una cella di partenza e una di arrivo, restituisce
 *   le celle della retta se sono allineate in una delle 8 direzioni.
 */

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Vec {
  r: number
  c: number
}

export interface Placement {
  word: string
  cells: Vec[]
  found: boolean
  /** Forma naturale con spazi ("tendine d'Achille") per la lista parole */
  display?: string
}

export interface Puzzle {
  rows: number
  cols: number
  grid: string[][]
  placements: Placement[]
}

export interface DifficultyConfig {
  rows: number
  cols: number
  wordCount: number
  /** direzioni consentite come [dr, dc] */
  directions: Vec[]
  maxWordLength: number
}

/** Le 8 direzioni possibili */
const ALL_DIRECTIONS: Vec[] = [
  { r: 0, c: 1 }, // →
  { r: 1, c: 0 }, // ↓
  { r: 1, c: 1 }, // ↘
  { r: 1, c: -1 }, // ↙
  { r: 0, c: -1 }, // ←
  { r: -1, c: 0 }, // ↑
  { r: -1, c: -1 }, // ↖
  { r: -1, c: 1 }, // ↗
]

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    rows: 8,
    cols: 8,
    wordCount: 6,
    // solo →, ↓, ↘ (nessuna parola al contrario, niente diagonali estranee)
    directions: [ALL_DIRECTIONS[0], ALL_DIRECTIONS[1], ALL_DIRECTIONS[2]],
    maxWordLength: 7,
  },
  medium: {
    rows: 10,
    cols: 10,
    wordCount: 8,
    // →, ↓, ↘, ↙, ←, ↑
    directions: [
      ALL_DIRECTIONS[0], ALL_DIRECTIONS[1], ALL_DIRECTIONS[2],
      ALL_DIRECTIONS[3], ALL_DIRECTIONS[4], ALL_DIRECTIONS[5],
    ],
    maxWordLength: 10,
  },
  hard: {
    rows: 12,
    cols: 12,
    wordCount: 10,
    directions: ALL_DIRECTIONS,
    maxWordLength: 12,
  },
}

export const DIFFICULTY_LABELS: Record<Difficulty, { name: string; desc: string }> = {
  easy: { name: 'Facile', desc: '8×8 · 6 parole · solo in avanti' },
  medium: { name: 'Medio', desc: '10×10 · 8 parole · anche al contrario' },
  hard: { name: 'Difficile', desc: '12×12 · 10 parole · tutte le direzioni' },
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Normalizza una parola per la griglia: MAIUSCOLO, solo lettere (Unicode),
 * senza spazi/apostrofi/trattini. Le legature rare diventano doppie lettere
 * (œ → OE) e la ß tedesca diventa SS (comportamento standard di toUpperCase).
 * Gli accenti (É Ü Ñ À Ç...) sono MANTENUTI: ogni lettera accentata è una
 * cella della griglia a tutti gli effetti.
 */
export function normalizeWord(w: string): string {
  return w
    .toUpperCase()
    .replace(/Œ/g, 'OE')
    .replace(/Æ/g, 'AE')
    .replace(/[^\p{L}\p{N}]/gu, '')
}

/**
 * Forma "display": maiuscolo con legature mappate, ma CON spazi e apostrofi
 * ("TENDINE D'ACHILLE"). Usata dal seeder per il campo Word.display e dalla
 * lista parole a lato.
 */
export function normalizeDisplay(w: string): string {
  return w
    .toUpperCase()
    .replace(/Œ/g, 'OE')
    .replace(/Æ/g, 'AE')
}

/**
 * Genera il puzzle. Riprova più volte con seed diversi se un piazzamento
 * fallisce (caso raro con griglie piccole e parole lunghe).
 */
export function generatePuzzle(
  words: string[],
  difficulty: Difficulty
): Puzzle {
  const cfg = DIFFICULTY_CONFIGS[difficulty]

  // Filtra le parole troppo lunghe e prendi quelle richieste
  const usable = words
    .map((w) => normalizeWord(w))
    .filter((w) => w.length >= 3 && w.length <= Math.min(cfg.maxWordLength, cfg.rows, cfg.cols))
  const chosen = shuffle(usable).slice(0, cfg.wordCount)

  for (let attempt = 0; attempt < 60; attempt++) {
    const result = tryBuild(chosen, cfg)
    if (result) return result
  }

  // Fallback praticamente irraggiungibile: griglia con le parole che entrano
  return tryBuild(chosen.slice(0, Math.max(3, chosen.length - 1)), cfg) ?? {
    rows: cfg.rows,
    cols: cfg.cols,
    grid: Array.from({ length: cfg.rows }, () =>
      Array.from({ length: cfg.cols }, () => 'A')
    ),
    placements: [],
  }
}

function tryBuild(
  words: string[],
  cfg: DifficultyConfig
): Puzzle | null {
  const grid: (string | null)[][] = Array.from({ length: cfg.rows }, () =>
    Array.from({ length: cfg.cols }, () => null)
  )
  const placements: Placement[] = []

  // Parole più lunghe prima: si piazzano meglio quando la griglia è vuota
  const ordered = [...words].sort((a, b) => b.length - a.length)

  for (const word of ordered) {
    let placed = false
    const dirs = shuffle(cfg.directions)
    // Proviamo posizioni casuali: 200 tentativi per parola
    for (let t = 0; t < 200 && !placed; t++) {
      const dir = dirs[t % dirs.length]
      const maxR = cfg.rows - 1 - Math.abs(dir.r) * (word.length - 1)
      const maxC = cfg.cols - 1 - Math.abs(dir.c) * (word.length - 1)
      const minR = dir.r < 0 ? word.length - 1 : 0
      const minC = dir.c < 0 ? word.length - 1 : 0
      if (maxR < minR || maxC < minC) continue

      const r0 = minR + Math.floor(Math.random() * (maxR - minR + 1))
      const c0 = minC + Math.floor(Math.random() * (maxC - minC + 1))

      // Verifica compatibilità (celle vuote o lettera identica = incrocio)
      let ok = true
      const cells: Vec[] = []
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dir.r * i
        const c = c0 + dir.c * i
        const existing = grid[r][c]
        if (existing !== null && existing !== word[i]) {
          ok = false
          break
        }
        cells.push({ r, c })
      }
      if (!ok) continue

      for (let i = 0; i < word.length; i++) {
        grid[cells[i].r][cells[i].c] = word[i]
      }
      placements.push({ word, cells, found: false })
      placed = true
    }
    if (!placed) return null
  }

  // Riempimento: lettere pesate sulle lettere delle parole (mimetismo)
  const pool = ordered.join('') + 'AAABCDEEEFGHIIILMNOOPQRSTUUVZ'
  const filled: string[][] = grid.map((row) =>
    row.map((ch) => ch ?? pool[Math.floor(Math.random() * pool.length)])
  )

  return { rows: cfg.rows, cols: cfg.cols, grid: filled, placements }
}

/**
 * Se start ed end sono allineati (8 direzioni), restituisce le celle della retta.
 * Altrimenti null. Funziona in entrambi i versi (la parola può essere selezionata al contrario).
 */
export function lineBetween(start: Vec, end: Vec): Vec[] | null {
  const dr = Math.sign(end.r - start.r)
  const dc = Math.sign(end.c - start.c)
  const lenR = Math.abs(end.r - start.r)
  const lenC = Math.abs(end.c - start.c)

  // Allineate solo se su stessa riga, stessa colonna o diagonale perfetta
  if (!(dr === 0 || dc === 0 || lenR === lenC)) return null

  const length = Math.max(lenR, lenC)
  const cells: Vec[] = []
  for (let i = 0; i <= length; i++) {
    cells.push({ r: start.r + dr * i, c: start.c + dc * i })
  }
  return cells
}

/** La selezione corrisponde a una parola? (confronto nei due versi) */
export function matchPlacement(
  puzzle: Puzzle,
  cells: Vec[]
): Placement | null {
  const selected = cells.map((v) => puzzle.grid[v.r][v.c]).join('')
  const reversed = [...selected].reverse().join('')
  return (
    puzzle.placements.find(
      (p) => !p.found && (p.word === selected || p.word === reversed)
    ) ?? null
  )
}

/** Cronometro -> mm:ss */
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Cronometro -> mm:ss:cc (minuti:secondi:centesimi) */
export function formatTimerMs(totalMs: number): string {
  const total = Math.floor(totalMs / 10) // centesimi
  const cs = total % 100
  const s = Math.floor(total / 100) % 60
  const m = Math.floor(total / 6000)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(cs).padStart(2, '0')}`
}
