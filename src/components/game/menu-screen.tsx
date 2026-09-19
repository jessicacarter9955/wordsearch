'use client'

import { GlossyIconButton, LetterBackground, SpeakerIcon } from '@/components/game/decor'
import { Info, Play } from 'lucide-react'

interface MenuScreenProps {
  muted: boolean
  onToggleMute: () => void
  onOpenInfo: () => void
  onPlay: () => void
}

/** Testo bubble: contorno bianco + estrusione dietro, riempimento sfumato sopra */
function BubbleText({ text, className }: { text: string; className: string }) {
  return (
    <span className={`relative inline-block ${className}`} aria-hidden="true">
      <span className="ws-logo-stroke absolute inset-0">{text}</span>
      <span className="ws-logo-fill relative">{text}</span>
    </span>
  )
}

/**
 * Menu principale: replica del layout del menu del gioco —
 * sfondo blu con griglia di lettere sfocate, bottoni agli angoli in alto,
 * placca-logo centrale con lente d'ingrandimento e grande bottone PLAY.
 */
export function MenuScreen({ muted, onToggleMute, onOpenInfo, onPlay }: MenuScreenProps) {
  return (
    <div className="ws-bg relative flex min-h-[100dvh] flex-col overflow-hidden">
      <LetterBackground />

      {/* Bottoni d'angolo in alto */}
      <div className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <GlossyIconButton onClick={onOpenInfo} label="Informazioni sul vocabolario">
          <Info className="h-7 w-7" strokeWidth={2.6} />
        </GlossyIconButton>
        <GlossyIconButton onClick={onToggleMute} label={muted ? 'Attiva audio' : 'Disattiva audio'}>
          <SpeakerIcon muted={muted} />
        </GlossyIconButton>
      </div>

      {/* Placca del logo (78% larghezza, top ~32% come nell'originale) */}
      <div className="relative z-10 flex flex-1 items-start justify-center px-6 pt-[21vh]">
        <div className="ws-plaque relative flex w-[min(80vw,540px)] items-center px-7 py-8 pr-24 sm:px-10 sm:py-10 sm:pr-28">
          <div className="w-full text-center leading-none">
            <BubbleText text="WORD" className="text-[clamp(1.2rem,5vw,2.2rem)] font-extrabold tracking-[0.22em]" />
            <div className="mt-4">
              <BubbleText text="SEARCH" className="text-[clamp(3rem,13.5vw,6rem)] font-extrabold tracking-wide" />
            </div>
          </div>

          {/* Lente d'ingrandimento con bordo metallico conic e maniglia */}
          <div
            aria-hidden="true"
            className="absolute -right-7 top-1/2 -translate-y-1/2 rotate-[38deg] sm:-right-10"
          >
            <div
              className="relative h-24 w-24 rounded-full p-[10px] shadow-[0_10px_20px_rgba(0,0,60,0.5)] sm:h-28 sm:w-28"
              style={{
                background:
                  'conic-gradient(from 220deg, #f1f5f9 0%, #94a3b8 22%, #f8fafc 45%, #64748b 68%, #e2e8f0 85%, #cbd5e1 100%)',
              }}
            >
              <div className="relative h-full w-full rounded-full bg-gradient-to-br from-white/85 via-sky-50/40 to-sky-100/25 shadow-[inset_0_3px_10px_rgba(255,255,255,0.95),inset_0_-6px_12px_rgba(30,58,138,0.35)]">
                {/* riflesso a mezzaluna */}
                <div className="absolute left-[12%] top-[10%] h-[26%] w-[42%] -rotate-12 rounded-full bg-white/90 blur-[2px]" />
                {/* piccolo bagliore in basso a destra */}
                <div className="absolute bottom-[16%] right-[18%] h-[14%] w-[22%] rounded-full bg-white/50 blur-[3px]" />
              </div>
            </div>
            {/* maniglia metallica */}
            <div className="absolute -bottom-14 left-1/2 flex -translate-x-1/2 flex-col items-center">
              <div
                className="h-3.5 w-7 rounded-md"
                style={{ background: 'linear-gradient(180deg,#e2e8f0,#64748b)' }}
              />
              <div
                className="h-16 w-5 rounded-full shadow-[0_4px_10px_rgba(0,0,60,0.55)]"
                style={{
                  background:
                    'linear-gradient(90deg,#475569 0%,#0f172a 40%,#334155 55%,#1e293b 100%)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottone PLAY */}
      <div className="relative z-10 flex justify-center pb-[9vh] pt-8">
        <button
          onClick={onPlay}
          aria-label="Gioca"
          className="ws-btn-play flex h-[clamp(8.5rem,32vw,10rem)] w-[clamp(8.5rem,32vw,10rem)] items-center justify-center"
        >
          <Play
            className="h-[45%] w-[45%] translate-x-[6%] fill-white drop-shadow-[0_4px_5px_rgba(0,0,50,0.55)]"
            strokeWidth={1.2}
          />
        </button>
      </div>
    </div>
  )
}
