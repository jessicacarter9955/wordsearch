/**
 * Bandiere SVG minimali per i 6 linguaggi del gioco.
 * Le emoji-bandiera non rendering su Windows: SVG = aspetto coerente ovunque.
 *viewBox 24x16, angoli arrotondati gestiti dal contenitore.
 */

function svg(children: React.ReactNode) {
  return (
    <svg viewBox="0 0 24 16" preserveAspectRatio="none" className="block h-full w-full" aria-hidden="true">
      {children}
    </svg>
  )
}

const FLAGS: Record<string, React.ReactNode> = {
  it: svg(
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#009246" />
      <rect x="16" width="8" height="16" fill="#ce2b37" />
    </>
  ),
  en: svg(
    <>
      <rect width="24" height="16" fill="#012169" />
      <path d="M0,0 L24,16 M24,0 L0,16" stroke="#ffffff" strokeWidth="3.4" />
      <path d="M0,0 L24,16 M24,0 L0,16" stroke="#C8102E" strokeWidth="1.7" />
      <path d="M12,0 V16 M0,8 H24" stroke="#ffffff" strokeWidth="5.6" />
      <path d="M12,0 V16 M0,8 H24" stroke="#C8102E" strokeWidth="3.2" />
    </>
  ),
  es: svg(
    <>
      <rect width="24" height="16" fill="#aa151b" />
      <rect y="4" width="24" height="8" fill="#f1bf00" />
    </>
  ),
  fr: svg(
    <>
      <rect width="24" height="16" fill="#fff" />
      <rect width="8" height="16" fill="#002395" />
      <rect x="16" width="8" height="16" fill="#ed2939" />
    </>
  ),
  de: svg(
    <>
      <rect width="24" height="16" fill="#000" />
      <rect y="5.34" width="24" height="5.33" fill="#dd0000" />
      <rect y="10.67" width="24" height="5.33" fill="#ffce00" />
    </>
  ),
  pt: svg(
    <>
      <rect width="24" height="16" fill="#da291c" />
      <rect width="9.6" height="16" fill="#046a38" />
      <circle cx="9.6" cy="8" r="3.4" fill="none" stroke="#ffe900" strokeWidth="1.6" />
      <circle cx="9.6" cy="8" r="0.9" fill="#ffe900" />
    </>
  ),
}

interface FlagProps {
  code: string
  /** fallback emoji se la lingua non ha una bandiera SVG */
  emoji?: string
  className?: string
}

export function Flag({ code, emoji, className = 'h-4 w-6' }: FlagProps) {
  const flag = FLAGS[code]
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 overflow-hidden rounded-[3px] leading-none ring-1 ring-white/50 shadow-[0_1px_2px_rgba(0,0,50,0.4)] ${className}`}
    >
      {flag ?? <span className="text-[0.85em]">{emoji}</span>}
    </span>
  )
}
