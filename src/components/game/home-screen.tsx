'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DIFFICULTY_LABELS, type Difficulty } from '@/lib/game-engine'
import type { Wordbank } from '@/lib/types'
import { BookOpenText, Clock, Play, Trophy } from 'lucide-react'

interface HomeScreenProps {
  wordbanks: Wordbank[] | null
  lang: string
  onLangChange: (code: string) => void
  categoryId: number | null
  onCategoryChange: (id: number) => void
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  bestTimes: Record<string, number>
  onOpenInfo: () => void
  onStart: () => void
}

export function HomeScreen({
  wordbanks,
  lang,
  onLangChange,
  categoryId,
  onCategoryChange,
  difficulty,
  onDifficultyChange,
  bestTimes,
  onOpenInfo,
  onStart,
}: HomeScreenProps) {
  const activeBank = wordbanks?.find((w) => w.code === lang)
  const selectedCat = activeBank?.categories.find((c) => c.id === categoryId)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
      {/* Titolo */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight text-stone-800 sm:text-5xl">
          Crucipuzzle
        </h1>
        <p className="mt-2 text-base text-stone-500">
          Trova le parole nascoste nella griglia — trascina sulle lettere
        </p>
        <button
          onClick={onOpenInfo}
          className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm font-medium text-stone-600 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700"
        >
          <BookOpenText className="h-4 w-4" />
          Come funziona il vocabolario?
        </button>
      </header>

      {/* Selettore lingua */}
      {wordbanks && wordbanks.length > 1 && (
        <div className="mb-6 flex justify-center gap-2">
          {wordbanks.map((wb) => (
            <button
              key={wb.code}
              onClick={() => onLangChange(wb.code)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                lang === wb.code
                  ? 'bg-stone-800 text-white shadow'
                  : 'bg-white text-stone-600 border border-stone-300 hover:border-stone-400'
              }`}
            >
              {wb.emoji} {wb.name}
            </button>
          ))}
        </div>
      )}

      {/* Categorie */}
      {wordbanks === null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <section aria-label="Categorie">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-400">
            Scegli una categoria
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {activeBank?.categories.map((cat) => {
              const best = bestTimes[`${cat.id}_${difficulty}`]
              const active = cat.id === categoryId
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  aria-pressed={active}
                  className={`group relative flex h-28 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 text-center transition-all ${
                    cat.color
                  } ${active ? 'scale-[1.03] shadow-lg ring-4 ring-emerald-300' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
                >
                  <span className="text-3xl transition-transform group-hover:scale-110">
                    {cat.emoji}
                  </span>
                  <span className="text-sm font-bold leading-tight">{cat.name}</span>
                  <span className="text-[11px] opacity-70">{cat.wordCount} parole</span>
                  {best !== undefined && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      <Trophy className="h-3 w-3" />
                      {Math.floor(best / 60)}:{String(best % 60).padStart(2, '0')}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Difficoltà */}
      <section aria-label="Difficoltà" className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-stone-400">
          Livello di difficoltà
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => {
            const info = DIFFICULTY_LABELS[d]
            const active = d === difficulty
            return (
              <button
                key={d}
                onClick={() => onDifficultyChange(d)}
                aria-pressed={active}
                className={`flex flex-col items-start gap-0.5 rounded-2xl border-2 p-4 text-left transition-all ${
                  active
                    ? 'border-emerald-500 bg-emerald-50 shadow-md'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                }`}
              >
                <span className={`text-base font-bold ${active ? 'text-emerald-800' : 'text-stone-700'}`}>
                  {info.name}
                </span>
                <span className="flex items-center gap-1 text-xs text-stone-500">
                  <Clock className="h-3 w-3" /> {info.desc}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          disabled={!categoryId}
          onClick={onStart}
          className="h-14 gap-2 rounded-full bg-emerald-600 px-10 text-lg font-bold shadow-lg transition hover:bg-emerald-700 disabled:opacity-40"
        >
          <Play className="h-5 w-5" />
          {selectedCat ? `Gioca con ${selectedCat.name}` : 'Gioca'}
        </Button>
      </div>

      {!categoryId && wordbanks && (
        <p className="mt-3 text-center text-sm text-stone-400">
          Seleziona una categoria per iniziare
        </p>
      )}
    </div>
  )
}
