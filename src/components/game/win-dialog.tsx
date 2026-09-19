'use client'

import { Button }from '@/components/ui/button'
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
  // Stelle: par = 20s per parola da trovare
  const wordCountHint = Math.max(1, Math.round(seconds / 20))
  const stars = seconds <= 120 ? 3 : seconds <= 200 ? 2 : 1

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm rounded-3xl border-stone-200 bg-white sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 text-6xl" aria-hidden="true">🎉</div>
          <DialogTitle className="text-2xl font-black text-stone-800">
            Hai vinto!
          </DialogTitle>
          <DialogDescription>
            Categoria <strong>{categoryName}</strong> · {difficultyName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2" aria-label={`${stars} stelle su 3`}>
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className={`h-10 w-10 ${
                i <= stars ? 'fill-amber-400 text-amber-400' : 'fill-stone-100 text-stone-300'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-stone-100 p-3">
            <Clock className="mx-auto mb-1 h-4 w-4 text-stone-500" />
            <div className="text-lg font-black text-stone-800">{formatTime(seconds)}</div>
            <div className="text-[11px] text-stone-500">tempo</div>
          </div>
          <div className="rounded-2xl bg-stone-100 p-3">
            <Trophy className="mx-auto mb-1 h-4 w-4 text-stone-500" />
            <div className="text-lg font-black text-stone-800">{score}</div>
            <div className="text-[11px] text-stone-500">punti</div>
          </div>
          <div className="rounded-2xl bg-stone-100 p-3">
            <Lightbulb className="mx-auto mb-1 h-4 w-4 text-stone-500" />
            <div className="text-lg font-black text-stone-800">{hintsUsed}</div>
            <div className="text-[11px] text-stone-500">aiuti</div>
          </div>
        </div>

        {isNewRecord ? (
          <p className="text-center text-sm font-bold text-amber-600">
            ⭐ Nuovo record per questa categoria!
          </p>
        ) : bestTime !== null ? (
          <p className="text-center text-xs text-stone-400">
            Record personale: {formatTime(bestTime)}
          </p>
        ) : null}

        <DialogFooter className="flex-row gap-2 sm:justify-center">
          <Button
            onClick={onReplay}
            className="gap-2 rounded-full bg-emerald-600 font-bold hover:bg-emerald-700"
          >
            <RotateCcw className="h-4 w-4" /> Rigioca
          </Button>
          <Button
            onClick={onHome}
            variant="outline"
            className="gap-2 rounded-full border-stone-300 font-bold"
          >
            <Home className="h-4 w-4" /> Cambia categoria
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
