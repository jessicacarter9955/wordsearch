import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/words?categoryId=1&count=8
 * Estrae a sorte `count` parole dalla categoria richiesta.
 * Ogni chiamata restituisce un set diverso: ogni partita è diversa.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = Number(searchParams.get('categoryId'))
    const count = Math.min(Number(searchParams.get('count')) || 8, 12)

    if (!categoryId || Number.isNaN(categoryId)) {
      return NextResponse.json({ error: 'categoryId mancante' }, { status: 400 })
    }

    const category = await db.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, emoji: true },
    })
    if (!category) {
      return NextResponse.json({ error: 'Categoria inesistente' }, { status: 404 })
    }

    const words = await db.word.findMany({
      where: { categoryId },
      select: { id: true, text: true, difficulty: true },
    })

    // Shuffle Fisher-Yates: ogni partita ha parole diverse
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[words[i], words[j]] = [words[j], words[i]]
    }

    return NextResponse.json({
      category,
      words: words.slice(0, count),
    })
  } catch {
    return NextResponse.json(
      { error: 'Impossibile caricare le parole' },
      { status: 500 }
    )
  }
}
