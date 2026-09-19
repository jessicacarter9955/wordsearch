import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/wordbanks
 * Restituisce le lingue con le rispettive categorie e il numero di parole.
 * È la "vetrina" del vocabolario: la home del gioco la usa per i tile.
 */
export async function GET() {
  try {
    const languages = await db.language.findMany({
      orderBy: { id: 'asc' },
      include: {
        categories: {
          orderBy: { id: 'asc' },
          include: { _count: { select: { words: true } } },
        },
      },
    })

    return NextResponse.json(
      languages.map((lang) => ({
        code: lang.code,
        name: lang.name,
        emoji: lang.emoji,
        categories: lang.categories.map((cat) => ({
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          emoji: cat.emoji,
          color: cat.color,
          wordCount: cat._count.words,
        })),
      }))
    )
  } catch {
    return NextResponse.json(
      { error: 'Impossibile caricare i vocabolari' },
      { status: 500 }
    )
  }
}
