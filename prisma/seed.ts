/**
 * SEED DEL VOCABOLARIO — alimentato da data/wordbank.json
 * ========================================================
 * Il JSON è la fonte unica dei dati (stesso formato usato per l'export
 * Supabase). Questo script lo carica nel DB SQLite via Prisma.
 *
 * Regole di normalizzazione (condivise col motore di gioco):
 *   text    = MAIUSCOLO, solo lettere Unicode, senza spazi/apostrofi,
 *             accenti mantenuti (É Ü Ñ...), œ→OE, ß→SS
 *   display = forma naturale maiuscola CON spazi ("TENDINE D'ACHILLE"),
 *             salvata solo quando differisce da text
 *
 * La difficoltà è calcolata automaticamente dalla lunghezza:
 *   <= 5 lettere  -> easy | 6-8 -> medium | >= 9 -> hard
 */
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { normalizeDisplay, normalizeWord } from '../src/lib/game-engine'

const db = new PrismaClient()

function diff(len: number): string {
  if (len <= 5) return 'easy'
  if (len <= 8) return 'medium'
  return 'hard'
}

interface WordbankEntry {
  it?: string
  en?: string
  fr?: string
  de?: string
  es?: string
}

interface WordbankSubcategory {
  slug: string
  emoji: string
  names: Record<string, string>
  entries: WordbankEntry[]
}

interface WordbankCategory {
  slug: string
  emoji: string
  color: string
  isNew: boolean
  names: Record<string, string>
  descriptions?: Record<string, string>
  words?: Record<string, string[]>
  subcategories?: WordbankSubcategory[]
}

interface WordbankFile {
  version: number
  languages: { code: string; name: string; emoji: string }[]
  categories: WordbankCategory[]
}

function loadWordbank(): WordbankFile {
  const p = path.resolve(process.cwd(), 'data/wordbank.json')
  if (!fs.existsSync(p)) {
    throw new Error(`"${p}" non trovato: lancia lo script dalla root del progetto`)
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

async function main() {
  console.log('🌱 Seed del vocabolario da data/wordbank.json...')

  const wordbank = loadWordbank()

  // Pulizia (ri-eseguibile in sicurezza)
  await db.word.deleteMany()
  await db.category.deleteMany()
  await db.language.deleteMany()

  const langIds = new Map<string, number>()
  for (const lang of wordbank.languages) {
    const created = await db.language.create({
      data: { code: lang.code, name: lang.name, emoji: lang.emoji },
    })
    langIds.set(lang.code, created.id)
  }

  let totalWords = 0

  for (const [catIndex, cat] of wordbank.categories.entries()) {
    const sortOrder = catIndex
    const langs = Object.keys(cat.names)

    for (const langCode of langs) {
      const languageId = langIds.get(langCode)
      if (!languageId) continue

      const category = await db.category.create({
        data: {
          languageId,
          slug: cat.slug,
          name: cat.names[langCode],
          description: cat.descriptions?.[langCode] ?? '',
          emoji: cat.emoji,
          color: cat.color,
          isNew: cat.isNew,
          sortOrder,
        },
      })

      // Parole "dirette" della categoria (liste legacy)
      const directWords = cat.words?.[langCode] ?? []
      if (directWords.length > 0) {
        await db.word.createMany({
          data: directWords.map((w) => {
            const text = normalizeWord(w)
            return { categoryId: category.id, text, difficulty: diff(text.length) }
          }),
        })
        totalWords += directWords.length
      }

      // Sottocategorie (categorie figlie)
      for (const [subIndex, sub] of (cat.subcategories ?? []).entries()) {
        const subName = sub.names[langCode]
        if (!subName) continue

        const subCategory = await db.category.create({
          data: {
            languageId,
            parentId: category.id,
            slug: `${cat.slug}--${sub.slug}`,
            name: subName,
            description: '',
            emoji: sub.emoji,
            color: cat.color,
            isNew: cat.isNew,
            sortOrder: subIndex,
          },
        })

        // Dedupe per testo dentro la stessa sottocategoria
        const seen = new Set<string>()
        const rows: { categoryId: number; text: string; display?: string; difficulty: string }[] = []
        for (const entry of sub.entries) {
          const natural = entry[langCode as keyof WordbankEntry]
          if (!natural) continue
          const text = normalizeWord(natural)
          if (!text || seen.has(text)) continue
          seen.add(text)
          const display = normalizeDisplay(natural)
          rows.push({
            categoryId: subCategory.id,
            text,
            display: display !== text ? display : undefined,
            difficulty: diff(text.length),
          })
        }
        if (rows.length > 0) {
          await db.word.createMany({ data: rows })
          totalWords += rows.length
        }
      }
    }
    console.log(
      `  ✅ ${cat.slug} (${langs.join(',')})${cat.subcategories ? ` — ${cat.subcategories.length} sottocategorie` : ''}`
    )
  }

  console.log(`🎉 Fatto! ${totalWords} parole nel vocabolario.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
