'use client'

import { GameBoard } from '@/components/game/game-board'
import { LetterBackground, SpeakerIcon } from '@/components/game/decor'
import { Skeleton } from '@/components/ui/skeleton'
import { WORD_COLORS } from '@/lib/types'
import type { Difficulty, Puzzle, Vec } from '@/lib/game-engine'
import { Home, Lightbulb, Pause, Play, Timer } from 'lucide-react'

interface GameScreenProps {
  puzzle: Puzzle | null
  loading: boolean
  categoryName: string
  difficulty: Difficulty
  difficultyName: string
  timerText: string
  paused: boolean
  muted: boolean
  hintCell: Vec | null
  foundCount: number
  totalCount: number
  frozen: boolean
  onSelection: (cells: Vec[]) => 'found' | 'miss'
  onHint: () => void
  onTogglePause: () => void
  onToggleMute: () => void
  onHome: () => void
  onResume: () => void
}

/**
 * Schermata di gioco: header con timer pill e bottoni squircle,
 * pannello parole di vetro e griglia bianca con bordo ciano luminoso,
 * disposti in colonna centrata come nell'originale.
 */
export function GameScreen({
  puzzle,
  loading,
  categoryName,
  difficultyName,
  timerText,
  paused,
  muted,
  hintCell,
  foundCount,
  totalCount,
  frozen,
  onSelection,
  onHint,
  onTogglePause,
  onToggleMute,
  onHome,
  onResume,
}: GameScreenProps) {
  return (
    <div className="ws-bg-game relative min-h-[100dvh] overflow-hidden">
      <LetterBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col px-3 py-4 sm:px-4">
        {/* Header: timer + bottoni */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="ws-timer flex items-center gap-2.5 px-5 py-2.5">
            <Timer className="h-6 w-6 text-white" strokeWidth={2.5} />
            <span className="text-2xl font-extrabold tabular-nums tracking-wide text-white">
              {timerText}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              aria-label={muted ? 'Attiva audio' : 'Disattiva audio'}
              className="ws-btn flex h-14 w-14 items-center justify-center"
            >
              <SpeakerIcon muted={muted} size="h-6 w-6" />
            </button>
            <button
              onClick={onTogglePause}
              disabled={frozen && !paused}
              aria-label={paused ? 'Riprendi' : 'Pausa'}
              className="ws-btn flex h-14 w-14 items-center justify-center"
            >
              {paused ? <Play className="h-6 w-6" strokeWidth={2.6} /> : <Pause className="h-6 w-6" strokeWidth={2.6} />}
            </button>
            <button
              onClick={onHint}
              disabled={frozen}
              aria-label="Aiuto: rivela la prima lettera di una parola"
              className="ws-btn flex h-14 w-14 items-center justify-center !border-amber-200/90 text-amber-200"
            >
              <Lightbulb className="h-6 w-6" strokeWidth={2.6} />
            </button>
            <button
              onClick={onHome}
              aria-label="Esci e torna al menu"
              className="ws-btn flex h-14 w-14 items-center justify-center"
            >
              <Home className="h-6 w-6" strokeWidth={2.6} />
            </button>
          </div>
        </div>

        {/* Titolo categoria + contatore */}
        <div className="mb-2 flex items-baseline justify-between px-1">
          <span className="text-sm font-extrabold uppercase tracking-wider text-white drop-shadow-[0_1px_2px_rgba(0,0,60,0.4)]">
            {categoryName}
          </span>
          <span className="text-xs font-bold text-cyan-100/90">
            {foundCount}/{totalCount} · {difficultyName}
          </span>
        </div>

        {/* Pannello parole */}
        <div className="ws-glass mb-3 px-5 py-4">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {puzzle?.placements.map((p, i) => (
              <li
                key={p.word}
                className={`text-lg font-bold text-white transition-all sm:text-xl ${
                  p.found ? 'line-through decoration-[3px] opacity-45' : 'drop-shadow-[0_2px_2px_rgba(0,0,60,0.45)]'
                }`}
                style={
                  p.found
                    ? { textDecorationColor: WORD_COLORS[i % WORD_COLORS.length] }
                    : undefined
                }
              >
                {p.word.toLowerCase()}
              </li>
            ))}
          </ul>
        </div>

        {/* Griglia */}
        <div className="relative">
          {loading || !puzzle ? (
            <Skeleton className="aspect-square w-full rounded-3xl bg-white/20" />
          ) : (
            <GameBoard
              puzzle={puzzle}
              onSelection={onSelection}
              hintCell={hintCell}
              frozen={frozen}
            />
          )}

          {/* Overlay pausa */}
          {paused && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 rounded-3xl bg-[#0055ff]/60 backdrop-blur-[3px]">
              <div className="ws-glass px-10 py-8 text-center">
                <div className="text-3xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,60,0.4)]">
                  PAUSA
                </div>
                <button
                  onClick={onResume}
                  className="ws-btn-play mt-5 flex h-14 items-center gap-2 px-8 text-base font-extrabold"
                >
                  <Play className="h-5 w-5 fill-white" strokeWidth={2} />
                  RIPRENDI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
