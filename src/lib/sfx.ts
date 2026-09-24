/**
 * EFFETTI SONORI PROCEDURALI — implementazione originale
 * Piccoli beep generati al volo con la Web Audio API:
 * nessun file audio, nessun asset esterno.
 */

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function setMuted(value: boolean) {
  muted = value
}

export function isMuted() {
  return muted
}

function tone(freq: number, start: number, duration: number, volume = 0.15, type: OscillatorType = 'sine') {
  const ac = getCtx()
  if (!ac || muted) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = ac.currentTime + start
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

/** tick mentre si trascina la selezione */
export function sfxTick() {
  tone(660, 0, 0.05, 0.05, 'triangle')
}

/** parola trovata */
export function sfxFound() {
  tone(523.25, 0, 0.12, 0.15, 'triangle')
  tone(659.25, 0.09, 0.12, 0.15, 'triangle')
  tone(783.99, 0.18, 0.22, 0.15, 'triangle')
}

/** selezione sbagliata */
export function sfxWrong() {
  tone(196, 0, 0.15, 0.1, 'sawtooth')
  tone(155.56, 0.1, 0.2, 0.08, 'sawtooth')
}

/** vittoria */
export function sfxWin() {
  const notes = [523.25, 587.33, 659.25, 783.99, 1046.5]
  notes.forEach((n, i) => tone(n, i * 0.11, 0.3, 0.16, 'triangle'))
}

/** suggerimento */
export function sfxHint() {
  tone(880, 0, 0.08, 0.1, 'sine')
  tone(1174.66, 0.08, 0.12, 0.1, 'sine')
}

/** ricompensa ottenuta dopo lo spot a premio */
export function sfxReward() {
  const notes = [659.25, 783.99, 987.77, 1318.51]
  notes.forEach((n, i) => tone(n, i * 0.09, 0.22, 0.14, 'triangle'))
}
