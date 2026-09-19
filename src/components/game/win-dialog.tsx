'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatTime } from '@/lib/game-engine'
import { Clock, Home, Lightbulb, RotateCcw, Star, Trophy } from 'lucide-react'

interface WinDialogProps {
  open: boolean
  categoryName: string
  difficultyName: string
  seconds: number
  score: number
  hintsUsed: number
  isNewRecord: boolean
  bestTime: number | null
  onReplay: () => void
  onHome: () => void
}

export function WinDialog({
  open,
  categoryName,
  difficultyName,
  seconds,
  score,
  hintsUsed,
  isNewRecord,
  bestTime,
  onReplay,
  onHome,
}: WinDialogProps) {
  const stars = seconds <= 120 ? 3 : seconds <= 200 ? 2 : 1

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm rounded-[2rem] border-[#88ccff] bg-[#0066ff] sm:max-w-md [&>button]:border-white/30 [&>button]:text-white hover:[&>button]:bg-white/10">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-1 text-6xl" aria-hidden="true">🏆</div>
          <DialogTitle className="text-3xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,60,0.4)]">
            HAI VINTO!
          </DialogTitle>
          <DialogDescription className="text-sm font-bold text-cyan-100">
            {categoryName} · {difficultyName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-3" aria-label={`${stars} stelle su 3`}>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={`h-11 w-11 drop-shadow-[0_3px_4px_rgba(0,0,60,0.4)] ${
                i <= stars
                  ? 'fill-amber-300 text-amber-300 [filter:drop-shadow(0_0_10px_rgba(252,211,77,0.7))]'
                  : 'fill-white/10 text-white/25'
              }`}
              strokeWidth={2}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="ws-glass !rounded-2xl px-2 py-3">
            <Clock className="mx-auto mb-1 h-4 w-4 text-cyan-100" />
            <div className="text-lg font-extrabold tabular-nums text-white">{formatTime(seconds)}</div>
            <div className="text-[11px] font-semibold text-cyan-100/80">tempo</div>
          </div>
          <div className="ws-glass !rounded-2xl px-2 py-3">
            <Trophy className="mx-auto mb-1 h-4 w-4 text-cyan-100" />
            <div className="text-lg font-extrabold tabular-nums text-white">{score}</div>
            <div className="text-[11px] font-semibold text-cyan-100/80">punti</div>
          </div>
          <div className="ws-glass !rounded-2xl px-2 py-3">
            <Lightbulb className="mx-auto mb-1 h-4 w-4 text-cyan-100" />
            <div className="text-lg font-extrabold tabular-nums text-white">{hintsUsed}</div>
            <div className="text-[11px] font-semibold text-cyan-100/80">aiuti</div>
          </div>
        </div>

        {isNewRecord ? (
          <p className="text-center text-sm font-extrabold text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,60,0.4)]">
            ⭐ Nuovo record per questa categoria!
          </p>
        ) : bestTime !== null ? (
          <p className="text-center text-xs font-semibold text-cyan-100/70">
            Record personale: {formatTime(bestTime)}
          </p>
        ) : null}

        <DialogFooter className="flex-row gap-3 sm:justify-center">
          <button
            onClick={onReplay}
            className="ws-btn-play flex h-13 items-center gap-2 px-7 py-3 text-base font-extrabold tracking-wide"
          >
            <RotateCcw className="h-5 w-5" strokeWidth={2.5} /> RIGIOCA
          </button>
          <button
            onClick={onHome}
            className="ws-btn flex items-center gap-2 px-6 py-3 text-base font-extrabold tracking-wide"
          >
            <Home className="h-5 w-5" strokeWidth={2.5} /> MENU
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
