import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/words?categoryId=1&count=8&maxLen=10   → round di gioco
 * GET /api/words?languageCode=it                  → vocabolario completo (statistiche)
 *
 * Modalità round (categoryId):
 * - Se la categoria ha sottocategorie (è una radice), il mazzo include le
 *   parole di tutta la famiglia, DEDUPLICATE per testo.
 * - Se la categoria è una sottocategoria, il mazzo è solo il suo gruppo
 *   (es. Persone > Mano).
 * - `maxLen` (opzionale) filtra in anticipo le parole troppo lunghe per la
 *   griglia della difficoltà scelta, così il campione è tutto giocabile.
 * - Ogni chiamata restituisce un set diverso: ogni partita è diversa.
 *
 * Modalità statistiche (languageCode): tutte le parole della lingua, una
 * sezione per categoria radice con le parole della famiglia deduplicate.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const languageCode = searchParams.get('languageCode')

    // ---- modalità vocabolario completo (schermata statistiche) ----
    if (languageCode) {
      const language = await db.language.findUnique({
        where: { code: languageCode },
        include: {
          categories: {
            orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
            include: { words: { select: { text: true } } },
          },
        },
      })
      if (!language) {
        return NextResponse.json({ error: 'Lingua inesistente' }, { status: 404 })
      }
      return NextResponse.json({
        code: language.code,
        name: language.name,
        categories: language.categories
          .filter((c) => c.parentId === null)
          .map((cat) => {
            const children = language.categories.filter((c) => c.parentId === cat.id)
            const texts = new Set<string>()
            for (const w of cat.words) texts.add(w.text)
            for (const child of children) {
              for (const w of child.words) texts.add(w.text)
            }
            return {
              id: cat.id,
              slug: cat.slug,
              name: cat.name,
              emoji: cat.emoji,
              words: Array.from(texts),
            }
          }),
      })
    }

    const categoryId = Number(searchParams.get('categoryId'))
    const count = Math.min(Number(searchParams.get('count')) || 8, 12)
    const maxLen = Number(searchParams.get('maxLen')) || undefined
    const minLen = Math.max(3, Number(searchParams.get('minLen')) || 3)

    if (!categoryId || Number.isNaN(categoryId)) {
      return NextResponse.json({ error: 'categoryId mancante' }, { status: 400 })
    }

    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: { select: { name: true } },
        children: { select: { id: true } },
      },
    })
    if (!category) {
      return NextResponse.json({ error: 'Categoria inesistente' }, { status: 404 })
    }

    // Categoria + eventuali figlie (il vocabolario ha 2 livelli: radice -> sottocategoria)
    const ids = [category.id, ...category.children.map((c) => c.id)]

    let words = await db.word.findMany({
      where: { categoryId: { in: ids } },
      select: { id: true, text: true, display: true, difficulty: true },
    })

    // Filtro lunghezza + dedupe per testo (la stessa parola può comparire in
    // più sottocategorie della stessa categoria padre)
    const seen = new Set<string>()
    words = words.filter((w) => {
      if (w.text.length < minLen) return false
      if (maxLen && w.text.length > maxLen) return false
      if (seen.has(w.text)) return false
      seen.add(w.text)
      return true
    })

    // Shuffle Fisher-Yates: ogni partita ha parole diverse
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[words[i], words[j]] = [words[j], words[i]]
    }

    // Nome con contesto: "Persone · Mano" per le sottocategorie
    const name = category.parent ? `${category.parent.name} · ${category.name}` : category.name

    return NextResponse.json({
      category: { name },
      words: words.slice(0, count).map((w) => ({
        id: w.id,
        text: w.text,
        display: w.display ?? w.text,
        difficulty: w.difficulty,
      })),
    })
  } catch {
    return NextResponse.json(
      { error: 'Impossibile caricare le parole' },
      { status: 500 }
    )
  }
}
