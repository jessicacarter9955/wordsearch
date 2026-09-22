'use client'

import { Flag } from '@/components/game/flags'
import { GlossyIconButton, LetterBackground } from '@/components/game/decor'
import type { LanguageWords, Wordbank } from '@/lib/types'
import { THEMATIC_SLUGS } from '@/lib/types'
import { summarizeWordStats, type WordStats } from '@/lib/wordstats'
import { ArrowLeft, Check, ChevronDown, Sparkles, Target, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

interface StatsScreenProps {
  wordbanks: Wordbank[] | null
  lang: string
  onLangChange: (code: string) => void
  stats: WordStats
  onBack: () => void
}

/** Una riga-categoria espandibile con le parole trovate/trovabili */
function CategorySection({
  cat,
  found,
  open,
  onToggle,
}: {
  cat: LanguageWords['categories'][number]
  found: Record<string, number>
  open: boolean
  onToggle: () => void
}) {
  const foundCount = cat.words.filter((w) => found[w.text] !== undefined).length
  const pct = cat.words.length > 0 ? Math.round((foundCount / cat.words.length) * 100) : 0

  return (
    <div className="ws-glass overflow-hidden !rounded-2xl">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10"
      >
        <span className="text-2xl drop-shadow-[0_2px_2px_rgba(0,0,60,0.3)]">{cat.emoji}</span>
        <span className="flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-extrabold text-white drop-shadow-[0_1px_2px_rgba(0,0,60,0.4)]">
              {cat.name}
            </span>
            <span
              className={`text-xs font-extrabold tabular-nums ${
                foundCount > 0 ? 'text-emerald-300' : 'text-cyan-100/70'
              }`}
            >
              {foundCount}/{cat.words.length}
            </span>
          </span>
          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-[#0a2a8a]/70">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all"
              style={{ width: `${pct}%` }}
            />
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-cyan-100/80 transition-transform ${open ? 'rotate-180' : ''}`}
          strokeWidth={2.6}
        />
      </button>

      {open && (
        <div className="border-t border-white/15 bg-[#0a1e6b]/40 px-4 py-3">
          <ul className="flex flex-wrap gap-1.5">
            {cat.words.map((w) => {
              const n = found[w.text]
              const isFound = n !== undefined
              return (
                <li
                  key={w.text}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition ${
                    isFound
                      ? 'border-emerald-300/60 bg-emerald-400/25 text-white shadow-[0_0_8px_rgba(52,211,153,0.35)]'
                      : 'border-white/15 bg-white/5 text-white/40'
                  }`}
                >
                  {isFound ? (
                    <Check className="h-3 w-3 text-emerald-300" strokeWidth={3.5} />
                  ) : (
                    <X className="h-3 w-3 text-red-400/70" strokeWidth={3} />
                  )}
                  <span>{w.display.toLowerCase()}</span>
                  {isFound && n > 1 && (
                    <span className="rounded-full bg-emerald-400/40 px-1.5 text-[10px] font-extrabold tabular-nums text-emerald-100">
                      ×{n}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * Schermata statistiche: le parole trovate, quante volte e in che lingua.
 * Ogni lingua ha la sua bandiera; ✓ = trovata almeno una volta, ✗ = mai trovata.
 */
export function StatsScreen({ wordbanks, lang, onLangChange, stats, onBack }: StatsScreenProps) {
  const [wordsByLang, setWordsByLang] = useState<Record<string, LanguageWords>>({})
  const [openCats, setOpenCats] = useState<Set<number>>(new Set())
  const inflight = useRef<Set<string>>(new Set())

  // carica (una volta sola per lingua) tutte le parole del vocabolario
  useEffect(() => {
    if (wordsByLang[lang] || inflight.current.has(lang)) return
    inflight.current.add(lang)
    fetch(`/api/words?languageCode=${lang}`)
      .then((r) => r.json())
      .then((data: LanguageWords) =>
        setWordsByLang((prev) => ({ ...prev, [lang]: data }))
      )
      .catch(() =>
        // in caso di errore registriamo una lingua vuota per fermare lo spinner
        setWordsByLang((prev) => ({
          ...prev,
          [lang]: { code: lang, name: lang, categories: [] },
        }))
      )
      .finally(() => inflight.current.delete(lang))
  }, [lang, wordsByLang])

  const langWords = wordsByLang[lang]
  const found = stats[lang] ?? {}
  const summary = useMemo(() => summarizeWordStats(stats), [stats])

  const toggleCat = (id: number) =>
    setOpenCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // dividi le categorie come nella selezione: tematiche prima (nell'ordine scelto), poi classiche
  const thematic =
    langWords?.categories
      .filter((c) => isThematic(c.slug))
      .sort((a, b) => THEMATIC_SLUGS.indexOf(a.slug) - THEMATIC_SLUGS.indexOf(b.slug)) ?? []
  const classic = langWords?.categories.filter((c) => !isThematic(c.slug)) ?? []

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
            LE MIE PAROLE
          </h1>
        </div>

        {/* Riepilogo */}
        <div className="ws-glass mb-5 grid grid-cols-3 gap-2 px-4 py-4 text-center">
          <div>
            <div className="text-2xl font-extrabold tabular-nums text-cyan-200 drop-shadow-[0_2px_2px_rgba(0,0,60,0.4)] sm:text-3xl">
              {summary.unique}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-100/80 sm:text-xs">
              Parole trovate
            </div>
          </div>
          <div className="border-x border-white/20">
            <div className="text-2xl font-extrabold tabular-nums text-amber-200 drop-shadow-[0_2px_2px_rgba(0,0,60,0.4)] sm:text-3xl">
              {summary.total}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-100/80 sm:text-xs">
              Volte totali
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tabular-nums text-emerald-200 drop-shadow-[0_2px_2px_rgba(0,0,60,0.4)] sm:text-3xl">
              {summary.langs}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-100/80 sm:text-xs">
              Lingue
            </div>
          </div>
        </div>

        {/* Selettore lingua con bandiere */}
        {wordbanks && wordbanks.length > 1 && (
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {wordbanks.map((wb) => {
              const n = Object.keys(stats[wb.code] ?? {}).length
              const active = lang === wb.code
              return (
                <button
                  key={wb.code}
                  onClick={() => onLangChange(wb.code)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-bold transition ${
                    active
                      ? 'ws-btn'
                      : 'border-2 border-white/40 bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Flag code={wb.code} emoji={wb.emoji} className="h-4 w-6" />
                  <span>{wb.name}</span>
                  <span
                    className={`rounded-full px-1.5 text-[10px] font-extrabold tabular-nums ${
                      n > 0 ? 'bg-emerald-400/40 text-emerald-100' : 'bg-white/15 text-white/60'
                    }`}
                  >
                    {n}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Contenuto */}
        {summary.unique === 0 ? (
          <div className="ws-glass flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Target className="h-12 w-12 text-cyan-200/70" strokeWidth={1.8} />
            <p className="max-w-sm text-sm font-semibold leading-relaxed text-cyan-100/90">
              Ancora nessuna parola trovata. Gioca qualche partita: ogni parola che trovi nella
              griglia verrà ricordata qui, con la lingua e quante volte l&apos;hai trovata.
            </p>
          </div>
        ) : !langWords ? (
          <div className="ws-glass flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-cyan-200" />
            <p className="text-sm font-semibold text-cyan-100/80">Carico il vocabolario…</p>
          </div>
        ) : (
          <div className="space-y-5">
            {thematic.length > 0 && (
              <section>
                <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-extrabold uppercase tracking-widest text-cyan-100/90 drop-shadow-[0_1px_2px_rgba(0,0,60,0.4)]">
                  <Sparkles className="h-4 w-4" strokeWidth={2.6} /> I miei temi
                </h2>
                <div className="space-y-2">
                  {thematic.map((cat) => (
                    <CategorySection
                      key={cat.id}
                      cat={cat}
                      found={found}
                      open={openCats.has(cat.id)}
                      onToggle={() => toggleCat(cat.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {classic.length > 0 && (
              <section>
                <h2 className="mb-2 flex items-center gap-2 px-1 text-sm font-extrabold uppercase tracking-widest text-cyan-100/90 drop-shadow-[0_1px_2px_rgba(0,0,60,0.4)]">
                  Categorie classiche
                </h2>
                <div className="space-y-2">
                  {classic.map((cat) => (
                    <CategorySection
                      key={cat.id}
                      cat={cat}
                      found={found}
                      open={openCats.has(cat.id)}
                      onToggle={() => toggleCat(cat.id)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function isThematic(slug: string): boolean {
  return (THEMATIC_SLUGS as readonly string[]).includes(slug)
}
