#!/usr/bin/env node
/**
 * EXPORT SUPABASE — genera supabase/seed-wordbank.sql da data/wordbank.json
 * ==========================================================================
 * Uso:   node scripts/export-wordbank-sql.mjs
 * Poi:   psql $DATABASE_URL -f supabase/schema.sql -f supabase/seed-wordbank.sql
 *        (oppure incolla i due file nella SQL Editor del dashboard Supabase)
 *
 * Le normalizzazioni (maiuscolo, solo lettere, œ→OE, ß→SS, accenti mantenuti)
 * sono identiche a quelle di prisma/seed.ts e src/lib/game-engine.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'supabase/seed-wordbank.sql')

const normalizeWord = (w) =>
  w.toUpperCase().replace(/Œ/g, 'OE').replace(/Æ/g, 'AE').replace(/[^\p{L}\p{N}]/gu, '')
const normalizeDisplay = (w) =>
  w.toUpperCase().replace(/Œ/g, 'OE').replace(/Æ/g, 'AE')
const diff = (len) => (len <= 5 ? 'easy' : len <= 8 ? 'medium' : 'hard')
const esc = (s) => `'${String(s).replace(/'/g, "''")}'`
const n = (v) => (v === undefined || v === null ? 'null' : esc(v))

const data = JSON.parse(readFileSync(resolve(root, 'data/wordbank.json'), 'utf8'))

const out = []
out.push('-- ============================================================')
out.push('-- CRUCIPUZZLE — SEED SUPABASE (generato automaticamente)')
out.push('-- Fonte: data/wordbank.json — NON modificare a mano')
out.push('-- Generato da scripts/export-wordbank-sql.mjs')
out.push('-- ============================================================')
out.push('begin;')
out.push('')
out.push('delete from public.words;')
out.push('delete from public.categories;')
out.push('delete from public.languages;')
out.push('')

// ---- lingue (id espliciti 1..N) ----
const langIds = new Map()
const langRows = []
data.languages.forEach((l, i) => {
  const id = i + 1
  langIds.set(l.code, id)
  langRows.push(`(${id}, ${esc(l.code)}, ${esc(l.name)}, ${esc(l.emoji)}, ${id})`)
})
out.push('insert into public.languages (id, code, name, emoji, sort_order) values')
out.push('  ' + langRows.join(',\n  ') + ';')
out.push('')

// ---- categorie + parole ----
let nextId = 1
const catRows = []
const wordRows = []

for (const [catIndex, cat] of data.categories.entries()) {
  for (const langCode of Object.keys(cat.names)) {
    const languageId = langIds.get(langCode)
    if (!languageId) continue

    const rootId = nextId++
    catRows.push(
      `(${rootId}, ${languageId}, null, ${esc(cat.slug)}, ${esc(cat.names[langCode])}, ` +
        `${n(cat.descriptions?.[langCode] ?? '')}, ${esc(cat.emoji)}, ${esc(cat.color)}, ` +
        `${cat.isNew}, ${catIndex})`
    )

    // parole dirette (liste legacy)
    for (const w of cat.words?.[langCode] ?? []) {
      const text = normalizeWord(w)
      if (!text) continue
      wordRows.push(`(${rootId}, ${esc(text)}, null, ${esc(diff(text.length))}, null)`)
    }

    // sottocategorie
    for (const [subIndex, sub] of (cat.subcategories ?? []).entries()) {
      if (!sub.names[langCode]) continue
      const subId = nextId++
      catRows.push(
        `(${subId}, ${languageId}, ${rootId}, ${esc(`${cat.slug}--${sub.slug}`)}, ` +
          `${esc(sub.names[langCode])}, '', ${esc(sub.emoji)}, ${esc(cat.color)}, ` +
          `${cat.isNew}, ${subIndex})`
      )
      const seen = new Set()
      sub.entries.forEach((entry, entryIndex) => {
        const natural = entry[langCode]
        if (!natural) return
        const text = normalizeWord(natural)
        if (!text || seen.has(text)) return
        seen.add(text)
        const display = normalizeDisplay(natural)
        const conceptKey = `${cat.slug}.${sub.slug}.${entryIndex}`
        wordRows.push(
          `(${subId}, ${esc(text)}, ${display !== text ? esc(display) : 'null'}, ` +
            `${esc(diff(text.length))}, ${esc(conceptKey)})`
        )
      })
    }
  }
}

// insert categorie a blocchi da 50
for (let i = 0; i < catRows.length; i += 50) {
  out.push('insert into public.categories (id, language_id, parent_id, slug, name, description, emoji, color, is_new, sort_order) values')
  out.push('  ' + catRows.slice(i, i + 50).join(',\n  ') + ';')
  out.push('')
}

// insert parole a blocchi da 100
for (let i = 0; i < wordRows.length; i += 100) {
  out.push('insert into public.words (category_id, text, display, difficulty, concept_key) values')
  out.push('  ' + wordRows.slice(i, i + 100).join(',\n  ') + ';')
  out.push('')
}

// ---- allinea le sequenze identity dopo gli id espliciti ----
out.push("select setval(pg_get_serial_sequence('public.categories', 'id'), (select coalesce(max(id), 1) from public.categories));")
out.push("select setval(pg_get_serial_sequence('public.words', 'id'), (select coalesce(max(id), 1) from public.words));")
out.push('')
out.push('commit;')
out.push('')

writeFileSync(OUT, out.join('\n'), 'utf8')
console.log(`✅ Generato ${OUT}`)
console.log(`   ${catRows.length} categorie, ${wordRows.length} parole, ${data.languages.length} lingue`)
