'use client'

import { lineBetween, type Puzzle, type Vec } from '@/lib/game-engine'
import { WORD_COLORS } from '@/lib/types'
import { sfxTick, sfxWrong } from '@/lib/sfx'
import { useCallback, useRef, useState } from 'react'

interface GameBoardProps {
  puzzle: Puzzle
  onSelection: (cells: Vec[]) => 'found' | 'miss'
  hintCell: Vec | null
  frozen: boolean
}

/**
 * Griglia interattiva dentro il pannello bianco con glow ciano:
 * celle quadrate senza bordi, lettere navy in font pesante arrotondato,
 * selezione con pointer events (mouse + touch) e barre SVG arrotondate.
 */
export function GameBoard({ puzzle, onSelection, hintCell, frozen }: GameBoardProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [dragStart, setDragStart] = useState<Vec | null>(null)
  const [dragCurrent, setDragCurrent] = useState<Vec | null>(null)
  const [missCells, setMissCells] = useState<Vec[]>([])

  const cellFromEvent = useCallback(
    (clientX: number, clientY: number): Vec | null => {
      const el = gridRef.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      const c = Math.floor(((clientX - rect.left) / rect.width) * puzzle.cols)
      const r = Math.floor(((clientY - rect.top) / rect.height) * puzzle.rows)
      if (r < 0 || r >= puzzle.rows || c < 0 || c >= puzzle.cols) return null
      return { r, c }
    },
    [puzzle.cols, puzzle.rows]
  )

  const previewCells: Vec[] =
    dragStart && dragCurrent ? (lineBetween(dragStart, dragCurrent) ?? [dragStart]) : []

  const handlePointerDown = (e: React.PointerEvent) => {
    if (frozen || !e.isPrimary || e.button === 1 || e.button === 2) return
    const cell = cellFromEvent(e.clientX, e.clientY)
    if (!cell) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragStart(cell)
    setDragCurrent(cell)
    sfxTick()
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (frozen || !dragStart || !e.isPrimary) return
    const cell = cellFromEvent(e.clientX, e.clientY)
    if (!cell) return
    if (!dragCurrent || cell.r !== dragCurrent.r || cell.c !== dragCurrent.c) {
      setDragCurrent(cell)
      sfxTick()
    }
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!dragStart || !e.isPrimary) return
    const cell = cellFromEvent(e.clientX, e.clientY) ?? dragCurrent
    const cells = cell ? (lineBetween(dragStart, cell) ?? [dragStart]) : [dragStart]
    setDragStart(null)
    setDragCurrent(null)

    if (cells.length > 1) {
      const result = onSelection(cells)
      if (result === 'miss') {
        setMissCells(cells)
        sfxWrong()
        window.setTimeout(() => setMissCells([]), 380)
      }
    }
  }

  const isPreview = (r: number, c: number) =>
    previewCells.some((v) => v.r === r && v.c === c)
  const isMiss = (r: number, c: number) =>
    missCells.some((v) => v.r === r && v.c === c)
  const isHint = (r: number, c: number) =>
    hintCell?.r === r && hintCell?.c === c

  // Coordinate SVG: ogni cella = 100 unità
  const center = (v: Vec) => ({ x: v.c * 100 + 50, y: v.r * 100 + 50 })

  return (
    <div className="ws-grid-panel relative p-2 sm:p-3">
      <div
        ref={gridRef}
        role="grid"
        aria-label="Griglia del crucipuzzle"
        className="relative mx-auto aspect-square w-full max-w-[min(86vw,540px)] select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Barre delle parole trovate + anteprima selezione */}
        <svg
          viewBox={`0 0 ${puzzle.cols * 100} ${puzzle.rows * 100}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {puzzle.placements.map((p, i) =>
            p.found ? (
              <line
                key={p.word}
                x1={center(p.cells[0]).x}
                y1={center(p.cells[0]).y}
                x2={center(p.cells[p.cells.length - 1]).x}
                y2={center(p.cells[p.cells.length - 1]).y}
                stroke={WORD_COLORS[i % WORD_COLORS.length]}
                strokeWidth={72}
                strokeLinecap="round"
                opacity={0.45}
              />
            ) : null
          )}
          {previewCells.length > 1 && (
            <line
              x1={center(previewCells[0]).x}
              y1={center(previewCells[0]).y}
              x2={center(previewCells[previewCells.length - 1]).x}
              y2={center(previewCells[previewCells.length - 1]).y}
              stroke="rgba(0, 130, 255, 0.42)"
              strokeWidth={74}
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Celle */}
        <div
          className="absolute inset-0 grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${puzzle.cols}, 1fr)`,
            gridTemplateRows: `repeat(${puzzle.rows}, 1fr)`,
          }}
        >
          {puzzle.grid.map((row, r) =>
            row.map((letter, c) => {
              const preview = isPreview(r, c)
              const miss = isMiss(r, c)
              const hint = isHint(r, c)
              return (
                <div
                  key={`${r}-${c}`}
                  role="gridcell"
                  aria-label={`Riga ${r + 1} colonna ${c + 1}: ${letter}`}
                  className={`flex items-center justify-center font-extrabold leading-none transition-colors duration-150 ${
                    miss ? 'text-red-600' : 'text-[#0a192f]'
                  } ${hint ? 'animate-pulse rounded-xl ring-4 ring-amber-400' : ''}`}
                  style={{
                    fontSize: 'clamp(0.95rem, min(4vw, 5.2vh), 1.85rem)',
                    textShadow: preview ? '0 1px 0 rgba(255,255,255,0.8)' : undefined,
                  }}
                >
                  {letter}
                </div>
              )
            })
          )}
        </div>

        {/* Lampeggio errore sull'intera griglia */}
        {missCells.length > 0 && (
          <div className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl ring-4 ring-red-400/80" />
        )}
      </div>
    </div>
  )
}
