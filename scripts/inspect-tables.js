// Inspect actual SQLite table columns via raw query
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  try {
    const tables = await db.$queryRawUnsafe(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    )
    console.log('TABLES:', tables.map((t) => t.name).join(', '))
    for (const t of ['Category', 'Word', 'Language']) {
      const info = await db.$queryRawUnsafe(`PRAGMA table_info(${t})`)
      console.log(`\n${t} columns:`, info.map((c) => c.name).join(', '))
    }
    const counts = await db.$queryRawUnsafe('SELECT COUNT(*) as c FROM Word')
    console.log('\nWord count:', counts[0].c)
  } catch (e) {
    console.error('ERROR:', e.message)
  } finally {
    await db.$disconnect()
  }
}
main()
