'use client'

import { GameScreen } from '@/components/game/game-screen'
import { InfoDialog } from '@/components/game/info-dialog'
import { MenuScreen } from '@/components/game/menu-screen'
import { SelectScreen } from '@/components/game/select-screen'
import { RewardedAdOverlay } from '@/components/game/rewarded-ad-overlay'
import { StatsScreen } from '@/components/game/stats-screen'
import { UploadDialog } from '@/components/game/upload-dialog'
import { WinDialog } from '@/components/game/win-dialog'
import {
  DIFFICULTY_CONFIGS,
  DIFFICULTY_LABELS,
  formatTimerMs,
  generatePuzzle,
  matchPlacement,
  type Difficulty,
  type Puzzle,
  type Vec,
} from '@/lib/game-engine'
import { isMuted, setMuted, sfxFound, sfxReward, sfxWin } from '@/lib/sfx'
import { FREE_HINTS_PER_GAME } from '@/lib/rewarded-ads'
import { loadWordStats, recordFoundWord, type WordStats } from '@/lib/wordstats'
import type { Wordbank } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

const BEST_KEY = 'crucipuzzle_best'
const MUTE_KEY = 'crucipuzzle_muted'

type Screen = 'menu' | 'select' | 'game' | 'stats'

function loadBest(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/** Prima parola non ancora trovata (bersaglio dell'aiuto) */
function firstUnfound(puzzle: Puzzle) {
  return puzzle.placements.find((p) => !p.found) ?? null
}

export default function Home() {
  // ---- schermate e dati ----
  const [screen, setScreen] = useState<Screen>('menu')
  const [wordbanks, setWordbanks] = useState<Wordbank[] | null>(null)
  const [lang, setLang] = useState('it')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [categoryName, setCategoryName] = useState('')

  // ---- partita ----
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [loadingRound, setLoadingRound] = useState(false)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [hintCell, setHintCell] = useState<Vec | null>(null)
  const [adOpen, setAdOpen] = useState(false)
  const [won, setWon] = useState(false)
  const [score, setScore] = useState(0)
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [bestTimes, setBestTimes] = useState<Record<string, number>>({})
  const [muted, setMutedState] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [wordStats, setWordStats] = useState<WordStats>({})

  const hintTimer = useRef<number | null>(null)

  // ---- bootstrap: vocabolari + preferenze ----
  useEffect(() => {
    fetch('/api/wordbanks')
      .then((r) => r.json())
      .then((data: unknown) =>
        setWordbanks(Array.isArray(data) ? (data as Wordbank[]) : [])
      )
      .catch(() => setWordbanks([]))
    setBestTimes(loadBest())
    setWordStats(loadWordStats())
    const m = localStorage.getItem(MUTE_KEY) === '1'
    setMutedState(m)
    setMuted(m)
  }, [])

  // ---- cronometro (aggiorna i centesimi; fermo anche durante lo spot) ----
  useEffect(() => {
    if (screen !== 'game' || won || paused || adOpen) return
    const started = Date.now() - elapsedMs
    const id = window.setInterval(() => setElapsedMs(Date.now() - started), 53)
    return () => window.clearInterval(id)
  }, [screen, won, paused, adOpen])

  useEffect(() => () => {
    if (hintTimer.current) window.clearTimeout(hintTimer.current)
  }, [])

  // ---- avvio partita ----
  const startGame = useCallback(
    async (catId: number) => {
      setLoadingRound(true)
      setWon(false)
      setPaused(false)
      setElapsedMs(0)
      setHintsUsed(0)
      setHintCell(null)
      setScore(0)
      setIsNewRecord(false)
      try {
        const cfg = DIFFICULTY_CONFIGS[difficulty]
        const res = await fetch(
          `/api/words?categoryId=${catId}&count=${cfg.wordCount + 4}&maxLen=${cfg.maxWordLength}`
        )
        if (!res.ok) throw new Error('fetch failed')
        const data = (await res.json()) as {
          category: { name: string }
          words: { text: string }[]
        }
        setCategoryName(data.category.name)
        const nextPuzzle = generatePuzzle(
          data.words.map((w) => w.text),
          difficulty
        )
        setPuzzle(nextPuzzle)
        setScreen('game')
      } catch {
        window.alert('Errore di rete: impossibile caricare le parole. Riprova.')
      } finally {
        setLoadingRound(false)
      }
    },
    [difficulty]
  )

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
      setWordStats(recordFoundWord(lang, placement.word))
      sfxFound()

      if (nextPuzzle.placements.every((p) => p.found)) {
        const seconds = Math.floor(elapsedMs / 1000)
        const timeBonus = Math.max(0, 600 - seconds * 3)
        const finalScore =
          nextPuzzle.placements.reduce((acc, p) => acc + p.word.length * 10, 0) +
          timeBonus -
          hintsUsed * 25
        setScore(Math.max(0, finalScore))
        // Chiave record: id effettivo (sottocategoria se selezionata, altrimenti categoria)
        const key = `${subcategoryId ?? categoryId}_${difficulty}`
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
    [puzzle, won, elapsedMs, hintsUsed, categoryId, subcategoryId, difficulty, bestTimes, lang]
  )

  // ---- aiuto ----
  // Regole: contatore da 0 ad ogni partita; i primi FREE_HINTS_PER_GAME sono
  // gratuiti; dal successivo serve uno spot a premio che sblocca UN solo aiuto
  // (consumato subito, nessun accumulo di scorte).
  const applyHint = useCallback(
    (target: NonNullable<ReturnType<typeof firstUnfound>>) => {
      setHintsUsed((h) => h + 1)
      setScore((s) => Math.max(0, s - 25))
      setHintCell(target.cells[0])
      import('@/lib/sfx').then(({ sfxHint }) => sfxHint())
      if (hintTimer.current) window.clearTimeout(hintTimer.current)
      hintTimer.current = window.setTimeout(() => setHintCell(null), 4000)
    },
    []
  )

  const useHint = useCallback(() => {
    if (!puzzle || won || paused || adOpen) return
    const target = firstUnfound(puzzle)
    if (!target) return
    if (hintsUsed >= FREE_HINTS_PER_GAME) {
      // gratuiti esauriti: sblocca l'aiuto con lo spot a premio
      setAdOpen(true)
      return
    }
    applyHint(target)
  }, [puzzle, won, paused, adOpen, hintsUsed, applyHint])

  // Chiusura dello spot: ricompensa solo se completato
  const handleAdFinish = useCallback(
    (result: { rewarded: boolean }) => {
      setAdOpen(false)
      if (!result.rewarded || !puzzle || won) return
      const target = firstUnfound(puzzle)
      if (target) {
        sfxReward()
        applyHint(target)
      }
    },
    [puzzle, won, applyHint]
  )

  const toggleMute = useCallback(() => {
    const next = !isMuted()
    setMuted(next)
    setMutedState(next)
    localStorage.setItem(MUTE_KEY, next ? '1' : '0')
  }, [])

  const foundCount = puzzle?.placements.filter((p) => p.found).length ?? 0
  const totalCount = puzzle?.placements.length ?? 0
  const seconds = Math.floor(elapsedMs / 1000)

  // ============ RENDER ============
  return (
    <div className="min-h-[100dvh]">
      {screen === 'menu' && (
        <MenuScreen
          muted={muted}
          onToggleMute={toggleMute}
          onOpenInfo={() => setInfoOpen(true)}
          onOpenStats={() => setScreen('stats')}
          onOpenUpload={() => setUploadOpen(true)}
          onPlay={() => setScreen('select')}
        />
      )}

      {screen === 'stats' && (
        <StatsScreen
          wordbanks={wordbanks}
          lang={lang}
          onLangChange={(code) => setLang(code)}
          stats={wordStats}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'select' && (
        <SelectScreen
          wordbanks={wordbanks}
          lang={lang}
          onLangChange={(code) => {
            setLang(code)
            setCategoryId(null)
            setSubcategoryId(null)
          }}
          categoryId={categoryId}
          onCategoryChange={(id) => {
            setCategoryId(id)
            setSubcategoryId(null)
          }}
          subcategoryId={subcategoryId}
          onSubcategoryChange={setSubcategoryId}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          bestTimes={bestTimes}
          onBack={() => setScreen('menu')}
          onStart={() => {
            const id = subcategoryId ?? categoryId
            if (id) startGame(id)
          }}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          puzzle={puzzle}
          loading={loadingRound}
          categoryName={categoryName}
          difficulty={difficulty}
          difficultyName={DIFFICULTY_LABELS[difficulty].name}
          timerText={formatTimerMs(elapsedMs)}
          paused={paused}
          muted={muted}
          hintCell={hintCell}
          freeHintsLeft={Math.max(0, FREE_HINTS_PER_GAME - hintsUsed)}
          hintNeedsAd={hintsUsed >= FREE_HINTS_PER_GAME}
          foundCount={foundCount}
          totalCount={totalCount}
          frozen={won || paused || adOpen}
          onSelection={handleSelection}
          onHint={useHint}
          onTogglePause={() => setPaused((p) => !p)}
          onToggleMute={toggleMute}
          onHome={() => {
            setScreen('select')
            setBestTimes(loadBest())
          }}
          onResume={() => setPaused(false)}
        />
      )}

      <InfoDialog open={infoOpen} onOpenChange={setInfoOpen} />

      {adOpen && <RewardedAdOverlay onFinish={handleAdFinish} />}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <WinDialog
        open={won}
        categoryName={categoryName}
        difficultyName={DIFFICULTY_LABELS[difficulty].name}
        seconds={seconds}
        score={score}
        hintsUsed={hintsUsed}
        isNewRecord={isNewRecord}
        bestTime={bestTimes[`${subcategoryId ?? categoryId}_${difficulty}`] ?? null}
        onReplay={() => {
          const id = subcategoryId ?? categoryId
          if (id) startGame(id)
        }}
        onHome={() => {
          setWon(false)
          setScreen('select')
          setBestTimes(loadBest())
        }}
      />
    </div>
  )
}
