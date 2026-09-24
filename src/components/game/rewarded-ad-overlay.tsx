'use client'

import { AD_DURATION_SECONDS } from '@/lib/rewarded-ads'
import { Check, Clapperboard, Gift, Play, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface RewardedAdOverlayProps {
  /** Chiamato alla chiusura dello spot: rewarded=true solo se completato */
  onFinish: (result: { rewarded: boolean }) => void
}

type Phase = 'playing' | 'confirm-close' | 'ready'

/** Lettere del mini-brand animato dentro lo spot demo */
const SPOT_LETTERS = [
  { ch: 'C', left: '8%', top: '18%', size: '2.6rem', delay: '0s' },
  { ch: 'R', left: '78%', top: '12%', size: '3.4rem', delay: '0.6s' },
  { ch: 'U', left: '16%', top: '64%', size: '3rem', delay: '1.1s' },
  { ch: 'Z', left: '68%', top: '58%', size: '2.4rem', delay: '0.3s' },
  { ch: '!', left: '46%', top: '20%', size: '2rem', delay: '1.6s' },
]

/**
 * Player dello spot a premio — VERSIONE DEMO WEB.
 * Simula il flusso di una rete rewarded (countdown, chiusura anticipata
 * senza ricompensa, claim alla fine). Il contratto `RewardedAdProvider`
 * in lib/rewarded-ads.ts resta identico quando si aggancerà l'SDK reale
 * (AdSense for Games / GameDistribution / AdMob su mobile).
 *
 * Il componente va MONTATO solo quando lo spot deve partire (condizionale
 * nel parent): ogni mount è una visualizzazione nuova a contatori puliti.
 */
export function RewardedAdOverlay({ onFinish }: RewardedAdOverlayProps) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [phase, setPhaseState] = useState<Phase>('playing')
  // mirror della fase per il timer: il countdown si congela mentre il
  // pannello "chiudi senza ricompensa?" è aperto e riprende dallo stesso punto
  const phaseRef = useRef<Phase>('playing')

  const setPhase = (p: Phase) => {
    phaseRef.current = p
    setPhaseState(p)
  }

  // Countdown dello spot: accumula solo in fase 'playing' e si ferma a fine spot
  useEffect(() => {
    let acc = 0
    let last = Date.now()
    const id = window.setInterval(() => {
      const now = Date.now()
      const dt = now - last
      last = now
      if (phaseRef.current !== 'playing') return
      acc += dt
      if (acc >= AD_DURATION_SECONDS * 1000) {
        window.clearInterval(id)
        setElapsedMs(AD_DURATION_SECONDS * 1000)
        setPhase('ready')
        return
      }
      setElapsedMs(acc)
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  const totalMs = AD_DURATION_SECONDS * 1000
  const remaining = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000))
  const progress = Math.min(1, elapsedMs / totalMs)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#020217]/96 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Spot a premio"
    >
      {/* Barra superiore: etichetta pubblicitaria + countdown + chiudi */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-white/30 bg-white/10 px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-white/90">
            Pubblicità
          </span>
          <span className="hidden text-xs font-bold uppercase tracking-wider text-white/60 sm:inline">
            Spot a premio
          </span>
        </div>

        {phase === 'playing' && (
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold tabular-nums text-white">
            Ricompensa in {remaining}s
          </span>
        )}

        {phase !== 'ready' && (
          <button
            onClick={() => setPhase('confirm-close')}
            aria-label="Chiudi lo spot"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="h-5 w-5" strokeWidth={2.8} />
          </button>
        )}
      </div>

      {/* Schermo dello "spot" */}
      <div className="flex flex-1 items-center justify-center px-4 pb-2 sm:px-6">
        <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-white/15 bg-gradient-to-br from-[#1718d3] via-[#1e3a8a] to-[#033ed2] shadow-[0_0_60px_rgba(5,162,251,0.35)]">
          {/* contenuto demo dello spot */}
          <div className="ws-ad-shine" />
          {SPOT_LETTERS.map((l) => (
            <span
              key={l.ch + l.top}
              className="ws-ad-letter"
              style={{ left: l.left, top: l.top, fontSize: l.size, animationDelay: l.delay }}
            >
              {l.ch}
            </span>
          ))}

          {phase !== 'ready' && (
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/85 shadow-[0_0_25px_rgba(255,255,255,0.45)]">
                <Play className="ml-1 h-8 w-8 fill-white text-white" />
              </div>
              <p className="text-xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,60,0.5)] sm:text-2xl">
                SPOT DIMOSTRATIVO
              </p>
              <p className="max-w-md text-xs font-semibold leading-relaxed text-white/75 sm:text-sm">
                Placeholder del video pubblicitario: qui la rete reale
                (AdSense for Games, GameDistribution, CrazyGames...) mostrerà
                il proprio contenuto a premio.
              </p>
            </div>
          )}

          {/* Schermata ricompensa pronta */}
          {phase === 'ready' && (
            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.75)]">
                <Check className="h-9 w-9 text-[#022c22]" strokeWidth={3.2} />
              </div>
              <p className="text-xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,60,0.5)] sm:text-2xl">
                RICOMPENSA SBLOCCATA!
              </p>
              <p className="text-sm font-bold text-emerald-200">
                L&apos;aiuto è pronto — ritiralo qui sotto
              </p>
            </div>
          )}

          {/* Watermark angolo */}
          <span className="absolute bottom-2 right-3 z-10 text-[10px] font-bold uppercase tracking-widest text-white/45">
            demo · rewarded
          </span>
        </div>
      </div>

      {/* Zona inferiore: progresso / claim / conferma chiusura */}
      <div className="px-4 pb-6 sm:px-6">
        <div className="mx-auto w-full max-w-2xl">
          {phase === 'playing' && (
            <>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400 shadow-[0_0_10px_rgba(0,221,255,0.8)] transition-[width] duration-100 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs font-bold text-white/70">
                <Clapperboard className="h-3.5 w-3.5" />
                Guarda lo spot fino alla fine per ottenere l&apos;aiuto
              </p>
            </>
          )}

          {phase === 'ready' && (
            <button
              onClick={() => onFinish({ rewarded: true })}
              className="ws-btn-play mx-auto flex h-14 items-center gap-2.5 px-8 text-lg font-extrabold"
              autoFocus
            >
              <Gift className="h-6 w-6" strokeWidth={2.4} />
              OTTIENI L&apos;AIUTO
            </button>
          )}

          {phase === 'confirm-close' && (
            <div className="ws-glass mx-auto flex flex-col items-center gap-3 px-6 py-5 text-center">
              <p className="text-lg font-extrabold text-white">
                Chiudi senza ricompensa?
              </p>
              <p className="text-sm font-semibold text-white/75">
                Se esci ora dallo spot non otterrai l&apos;aiuto.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setPhase('playing')}
                  className="ws-btn-play flex h-11 items-center gap-2 px-6 text-sm font-extrabold"
                >
                  <Play className="h-4 w-4 fill-white" />
                  CONTINUA A GUARDARE
                </button>
                <button
                  onClick={() => onFinish({ rewarded: false })}
                  className="ws-btn flex h-11 items-center px-5 text-sm font-extrabold !border-white/40 text-white/85"
                >
                  Chiudi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
