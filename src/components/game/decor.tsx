'use client'

import { Volume2 } from 'lucide-react'

/**
 * Decorazioni condivise: sfondo con griglia regolare di lettere sfocate
 * e bottone squircle glossy. La griglia di lettere è generata da una
 * stringa fissa (deterministica) per evitare mismatch di hydration.
 */

/** Sequenza mescolata fissa per un aspetto variato ma deterministico */
const SHUFFLED = 'LTBDHOGAQCNVSEMIRUZFP'

function lettersFor(count: number): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(SHUFFLED[i % SHUFFLED.length])
  }
  return out
}

/** Griglia regolare di lettere semi-trasparenti (come la texture dell'originale) */
export function LetterBackground() {
  const CELL = 80 // dimensione cella in px
  const cols = Math.ceil(1400 / CELL)
  const rows = Math.ceil(1400 / CELL)
  const letters = lettersFor(cols * rows)

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
          gridAutoRows: `${CELL}px`,
        }}
      >
        {letters.map((ch, i) => (
          <span
            key={i}
            className="flex items-center justify-center font-extrabold text-white/[0.11]"
            style={{ fontSize: `${CELL * 0.62}px`, lineHeight: 1 }}
          >
            {ch}
          </span>
        ))}
      </div>
    </div>
  )
}

interface GlossyIconButtonProps {
  onClick?: () => void
  label: string
  children: React.ReactNode
  className?: string
}

/** Bottone squircle glossy con icona lucide */
export function GlossyIconButton({ onClick, label, children, className = '' }: GlossyIconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`ws-btn flex h-14 w-14 items-center justify-center ${className}`}
    >
      {children}
    </button>
  )
}

/** Altoparlante con diagonale rossa quando muto (come nell'originale) */
export function SpeakerIcon({ muted, size = 'h-7 w-7' }: { muted: boolean; size?: string }) {
  if (!muted) return <Volume2 className={size} strokeWidth={2.6} />
  return (
    <span className="relative inline-flex">
      <Volume2 className={size} strokeWidth={2.6} />
      <span
        aria-hidden="true"
        className="absolute left-[-12%] top-[-8%] h-[116%] w-[124%] origin-center rotate-[-38deg] rounded-full border-[3.5px] border-red-500 shadow-[0_0_6px_rgba(239,68,68,0.7)]"
      />
    </span>
  )
}
