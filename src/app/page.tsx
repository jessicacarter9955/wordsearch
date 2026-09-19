'use client'

import { GameBoard } from '@/components/game/game-board'
import { HomeScreen } from '@/components/game/home-screen'
import { InfoDialog } from '@/components/game/info-dialog'
import { WinDialog } from '@/components/game/win-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DIFFICULTY_CONFIGS,
  DIFFICULTY_LABELS,
  formatTime,
  generatePuzzle,
  matchPlacement,
  type Difficulty,
  type Puzzle,
  type Vec,
} from '@/lib/game-engine'
import { isMuted, setMuted, sfxFound, sfxHint, sfxWin } from '@/lib/sfx'
import type { Wordbank } from '@/lib/types'
import { WORD_COLORS } from '@/lib/types'
import { ArrowLeft, Lightbulb, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const BEST_KEY = 'crucipuzzle_best'
const MUTE_KEY = 'crucipuzzle_muted'

function loadBest(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export default function Home() {
  // ---- schermate e dati ----
  const [screen, setScreen] = useState<'home' | 'game'>('home')
  const [wordbanks, setWordbanks] = useState<Wordbank[] | null>(null)
  const [lang, setLang] = useState('it')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [categoryName, setCategoryName] = useState('')

  // ---- partita ----
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [loadingRound, setLoadingRound] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintCell, setHintCell] = useState<Vec | null>(null)
  const [won, setWon] = useState(false)
  const [score, setScore] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [bestTimes, setBestTimes] = useState<Record<string, number>>({})
  const [muted, setMutedState] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const hintTimer = useRef<number | null>(null)
  const soundInit = useRef(false)

  // ---- bootstrap: vocabolari + preferenze ----
  useEffect(() => {
    fetch('/api/wordbanks')
      .then((r) => r.json())
      .then((data: Wordbank[]) => setWordbanks(data))
      .catch(() => setWordbanks([]))
    setBestTimes(loadBest())
    const m = localStorage.getItem(MUTE_KEY) === '1'
    setMutedState(m)
    setMuted(m)
  }, [])

  // ---- cronometro ----
  useEffect(() => {
    if (screen !== 'game' || won || paused) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [screen, won, paused])

  useEffect(() => () => {
    if (hintTimer.current) window.clearTimeout(hintTimer.current)
  }, [])

  // ---- avvio partita ----
  const startGame = useCallback(
    async (catId: number) => {
      setLoadingRound(true)
      setWon(false)
      setPaused(false)
      setSeconds(0)
      setHintsUsed(0)
      setHintCell(null)
      setScore(0)
      setIsNewRecord(false)
      try {
        const cfg = DIFFICULTY_CONFIGS[difficulty]
        const res = await fetch(
          `/api/words?categoryId=${catId}&count=${cfg.wordCount + 4}`
        )
        if (!res.ok) throw new Error('fetch failed')
        const data = (await res.json()) as {
          category: { name: string }
          words: { text: string }[]
        }
        setCategoryName(data.category.name)
        const puzzle = generatePuzzle(
          data.words.map((w) => w.text),
          difficulty
        )
        setPuzzle(puzzle)
        setScreen('game')
        // sblocca l'audio al primo gesto
        if (!soundInit.current) {
          soundInit.current = true
          sfxTickInit()
        }
      } catch {
        setWordbanks((wb) => wb) // no-op re-render
        window.alert('Errore di rete: impossibile caricare le parole. Riprova.')
      } finally {
        setLoadingRound(false)
      }
    },
    [difficulty]
  )

  const sfxTickInit = () => {
    /* il primo pointerdown sulla griglia sblocca l'AudioContext */
  }

  // ---- selezione dalla griglia ----
  const handleSelection = useCallback(
    (cells: Vec[]): 'found' | 'miss' => {
      if (!puzzle || won) return 'miss'
      const placement = matchPlacement(puzzle, cells)
      if (!placement) return 'miss'

      const nextPuzzle: Puzzle = {
        ...puzzle,
        placements: puzzle.placements.map((p) =>
          p === placement ? { ...p, found: true } : p
        ),
      }
      setPuzzle(nextPuzzle)
      setScore((s) => s + placement.word.length * 10)
      sfxFound()

      if (nextPuzzle.placements.every((p) => p.found)) {
        const timeBonus = Math.max(0, 600 - seconds * 3)
        const finalScore =
          nextPuzzle.placements.reduce((acc, p) => acc + p.word.length * 10, 0) +
          timeBonus -
          hintsUsed * 25
        setScore(Math.max(0, finalScore))
        const key = `${categoryId}_${difficulty}`
        const prev = bestTimes[key]
        if (prev === undefined || seconds < prev) {
          const next = { ...bestTimes, [key]: seconds }
          setBestTimes(next)
          localStorage.setItem(BEST_KEY, JSON.stringify(next))
          setIsNewRecord(true)
        }
        window.setTimeout(() => {
          setWon(true)
          sfxWin()
        }, 450)
      }
      return 'found'
    },
    [puzzle, won, seconds, hintsUsed, categoryId, difficulty, bestTimes]
  )

  // ---- aiuto ----
  const useHint = useCallback(() => {
    if (!puzzle || won || paused) return
    const target = puzzle.placements.find((p) => !p.found)
    if (!target) return
    setHintsUsed((h) => h + 1)
    setScore((s) => Math.max(0, s - 25))
    setHintCell(target.cells[0])
    sfxHint()
    if (hintTimer.current) window.clearTimeout(hintTimer.current)
    hintTimer.current = window.setTimeout(() => setHintCell(null), 4000)
  }, [puzzle, won, paused])

  const goHome = useCallback(() => {
    setScreen('home')
    setPuzzle(null)
    setWon(false)
    setPaused(false)
    setBestTimes(loadBest())
  }, [])

  const toggleMute = () => {
    const next = !isMuted()
    setMuted(next)
    setMutedState(next)
    localStorage.setItem(MUTE_KEY, next ? '1' : '0')
  }

  const foundCount = puzzle?.placements.filter((p) => p.found).length ?? 0
  const totalCount = puzzle?.placements.length ?? 0

  // ============ RENDER ============
  return (
    <div className="flex min-h-screen flex-col bg-[#faf6ec] text-stone-800">
      <main className="flex-1">
        {screen === 'home' ? (
          <HomeScreen
            wordbanks={wordbanks}
            lang={lang}
            onLangChange={(code) => {
              setLang(code)
              setCategoryId(null)
            }}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            bestTimes={bestTimes}
            onOpenInfo={() => setInfoOpen(true)}
            onStart={() => categoryId && startGame(categoryId)}
          />
        ) : (
          <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
            {/* Barra superiore */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goHome}
                  aria-label="Torna alla home"
                  className="rounded-full hover:bg-stone-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="text-sm font-black leading-tight sm:text-base">
                    {categoryName}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {DIFFICULTY_LABELS[difficulty].name} · {foundCount}/{totalCount} parole
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="rounded-xl bg-stone-100 px-3 py-1.5 text-center">
                  <div className="text-sm font-black tabular-nums">{formatTime(seconds)}</div>
                  <div className="text-[10px] text-stone-400">tempo</div>
                </div>
                <div className="rounded-xl bg-stone-100 px-3 py-1.5 text-center">
                  <div className="text-sm font-black tabular-nums">{score}</div>
                  <div className="text-[10px] text-stone-400">punti</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={useHint}
                  disabled={won || foundCount === totalCount}
                  aria-label="Aiuto: rivela la prima lettera di una parola"
                  className="rounded-full text-amber-500 hover:bg-amber-50 hover:text-amber-600"
                >
                  <Lightbulb className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPaused((p) => !p)}
                  disabled={won}
                  aria-label={paused ? 'Riprendi' : 'Pausa'}
                  className="rounded-full hover:bg-stone-100"
                >
                  {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  aria-label={muted ? 'Attiva audio' : 'Disattiva audio'}
                  className="rounded-full hover:bg-stone-100"
                >
                  {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Area di gioco */}
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
              <div className="relative w-full lg:flex-1 lg:max-w-2xl">
                {loadingRound || !puzzle ? (
                  <Skeleton className="mx-auto aspect-square w-full max-w-[min(88vw,560px)] rounded-2xl" />
                ) : (
                  <GameBoard
                    puzzle={puzzle}
                    onSelection={handleSelection}
                    hintCell={hintCell}
                    frozen={won || paused}
                  />
                )}

                {paused && !won && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/80 backdrop-blur-sm">
                    <div className="text-xl font-black text-stone-700">In pausa</div>
                    <Button
                      onClick={() => setPaused(false)}
                      className="gap-2 rounded-full bg-emerald-600 font-bold hover:bg-emerald-700"
                    >
                      <Play className="h-4 w-4" /> Riprendi
                    </Button>
                  </div>
                )}
              </div>

              {/* Pannello parole */}
              <aside
                aria-label="Parole da trovare"
                className="w-full max-w-[min(88vw,560px)] rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:w-72 lg:max-w-none"
              >
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-400">
                  Parole da trovare
                </h2>
                <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
                  {puzzle?.placements.map((p, i) => (
                    <li
                      key={p.word}
                      className={`flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold transition-all ${
                        p.found
                          ? 'text-stone-400 line-through decoration-2'
                          : 'text-stone-700'
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: p.found
                            ? WORD_COLORS[i % WORD_COLORS.length]
                            : '#d6d3d1',
                        }}
                      />
                      {p.word}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-stone-100 pt-3 text-[11px] leading-snug text-stone-400">
                  Trascina sulle lettere in qualsiasi direzione (anche al contrario).
                  Ogni aiuto costa 25 punti.
                </p>
              </aside>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-stone-200/70 bg-white/60 py-3 text-center text-xs text-stone-400">
        Crucipuzzle — vocabolario su database SQLite · fatto con Next.js
      </footer>

      <InfoDialog open={infoOpen} onOpenChange={setInfoOpen} />

      <WinDialog
        open={won}
        categoryName={categoryName}
        difficultyName={DIFFICULTY_LABELS[difficulty].name}
        seconds={seconds}
        score={score}
        hintsUsed={hintsUsed}
        isNewRecord={isNewRecord}
        bestTime={bestTimes[`${categoryId}_${difficulty}`] ?? null}
        onReplay={() => categoryId && startGame(categoryId)}
        onHome={goHome}
      />
    </div>
  )
}
