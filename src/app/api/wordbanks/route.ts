import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/wordbanks
 * Restituisce le lingue con le rispettive categorie (solo radici), le
 * sottocategorie e il numero di PAROLE DISTINTE (una parola presente in più
 * sottocategorie conta una sola volta nella categoria padre).
 * È la "vetrina" del vocabolario: la schermata di selezione la usa per i tile.
 */
export async function GET() {
  try {
    const languages = await db.language.findMany({
      orderBy: { id: 'asc' },
      include: {
        categories: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          include: { words: { select: { text: true } } },
        },
      },
    })

    return NextResponse.json(
      languages.map((lang) => {
        const roots = lang.categories.filter((c) => c.parentId === null)
        return {
          code: lang.code,
          name: lang.name,
          emoji: lang.emoji,
          categories: roots.map((cat) => {
            const children = lang.categories.filter((c) => c.parentId === cat.id)
            // Conteggio parole distinte: categoria + tutte le sottocategorie
            const texts = new Set<string>()
            for (const w of cat.words) texts.add(w.text)
            for (const child of children) {
              for (const w of child.words) texts.add(w.text)
            }
            return {
              id: cat.id,
              slug: cat.slug,
              name: cat.name,
              description: cat.description,
              emoji: cat.emoji,
              color: cat.color,
              wordCount: texts.size,
              isNew: cat.isNew,
              subcategories: children.map((child) => {
                const subTexts = new Set(child.words.map((w) => w.text))
                return {
                  id: child.id,
                  slug: child.slug,
                  name: child.name,
                  emoji: child.emoji,
                  wordCount: subTexts.size,
                }
              }),
            }
          }),
        }
      })
    )
  } catch {
    return NextResponse.json(
      { error: 'Impossibile caricare i vocabolari' },
      { status: 500 }
    )
  }
}
