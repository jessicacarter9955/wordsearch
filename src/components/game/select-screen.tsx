'use client'

import { GlossyIconButton, LetterBackground } from '@/components/game/decor'
import { Skeleton } from '@/components/ui/skeleton'
import { DIFFICULTY_LABELS, type Difficulty } from '@/lib/game-engine'
import type { Wordbank } from '@/lib/types'
import { ArrowLeft, Play, Trophy } from 'lucide-react'

interface SelectScreenProps {
  wordbanks: Wordbank[] | null
  lang: string
  onLangChange: (code: string) => void
  categoryId: number | null
  onCategoryChange: (id: number) => void
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  bestTimes: Record<string, number>
  onBack: () => void
  onStart: () => void
}

/**
 * Selezione categoria e difficoltà: pannelli di vetro sullo stesso
 * sfondo blu con lettere del menu, con la lista categorie del database.
 */
export function SelectScreen({
  wordbanks,
  lang,
  onLangChange,
  categoryId,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  bestTimes,
  onBack,
  onStart,
}: SelectScreenProps) {
  const activeBank = wordbanks?.find((w) => w.code === lang)

  return (
    <div className="ws-bg relative min-h-[100dvh] overflow-hidden pb-10">
      <LetterBackground />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 py-5 sm:px-6">
        {/* Barra superiore */}
        <div className="mb-5 flex items-center gap-3">
          <GlossyIconButton onClick={onBack} label="Torna al menu">
            <ArrowLeft className="h-6 w-6" strokeWidth={2.6} />
          </GlossyIconButton>
          <h1 className="text-2xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,60,0.4)] sm:text-3xl">
            SCEGLI CATEGORIA
          </h1>
        </div>

        {/* Lingua */}
        {wordbanks && wordbanks.length > 1 && (
          <div className="mb-4 flex justify-center gap-2">
            {wordbanks.map((wb) => (
              <button
                key={wb.code}
                onClick={() => onLangChange(wb.code)}
                className={`rounded-full px-5 py-1.5 text-sm font-bold transition ${
                  lang === wb.code
                    ? 'ws-btn'
                    : 'border-2 border-white/40 bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {wb.emoji} {wb.name}
              </button>
            ))}
          </div>
        )}

        {/* Griglia categorie */}
        {wordbanks === null ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-3xl bg-white/15" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {activeBank?.categories.map((cat) => {
              const best = bestTimes[`${cat.id}_${difficulty}`]
              const active = cat.id === categoryId
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  aria-pressed={active}
                  className={`ws-glass relative flex h-28 flex-col items-center justify-center gap-1 p-3 text-center transition-all ${
                    active
                      ? 'scale-[1.04] !border-white shadow-[0_0_18px_rgba(255,255,255,0.55)]'
                      : 'hover:scale-[1.02] hover:border-white/80'
                  }`}
                >
                  <span className="text-3xl drop-shadow-[0_2px_2px_rgba(0,0,60,0.3)]">{cat.emoji}</span>
                  <span className="text-sm font-extrabold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,60,0.4)]">
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-semibold text-cyan-100/90">{cat.wordCount} parole</span>
                  {best !== undefined && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-400/90 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 shadow">
                      <Trophy className="h-3 w-3" />
                      {Math.floor(best / 60)}:{String(best % 60).padStart(2, '0')}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Difficoltà */}
        <h2 className="mb-3 mt-6 text-lg font-extrabold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,60,0.4)]">
          DIFFICOLTÀ
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => {
            const info = DIFFICULTY_LABELS[d]
            const active = d === difficulty
            return (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                aria-pressed={active}
                className={`ws-glass flex flex-col items-center gap-0.5 px-2 py-3 transition-all ${
                  active
                    ? 'scale-[1.03] !border-white shadow-[0_0_18px_rgba(255,255,255,0.55)]'
                    : 'hover:border-white/80'
                }`}
              >
                <span className="text-sm font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,60,0.4)]">
                  {info.name}
                </span>
                <span className="text-[10px] font-semibold leading-tight text-cyan-100/90">
                  {info.desc.split('·')[0].trim()} · {info.desc.split('·')[1]?.trim()}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bottone GIOCA */}
        <div className="mt-7 flex justify-center">
          <button
            onClick={onStart}
            disabled={!categoryId}
            aria-label="Inizia la partita"
            className="ws-btn-play flex h-20 items-center gap-3 px-10 text-xl font-extrabold tracking-wide"
          >
            <Play className="h-8 w-8 fill-white drop-shadow-[0_2px_3px_rgba(0,0,50,0.45)]" strokeWidth={1.5} />
            GIOCA
          </button>
        </div>
        {!categoryId && wordbanks && (
          <p className="mt-3 text-center text-sm font-semibold text-cyan-100/80">
            Seleziona una categoria per iniziare
          </p>
        )}
      </div>
    </div>
  )
}
