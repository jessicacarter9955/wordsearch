// Diagnose why the wordbanks DB query fails
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
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
    console.log('OK — languages:', languages.length)
    for (const l of languages) {
      console.log(` - ${l.code} (${l.name}): ${l.categories.length} categories`)
    }
  } catch (e) {
    console.error('DB ERROR:', e.message)
    console.error('FULL:', e)
  } finally {
    await db.$disconnect()
  }
}
main()
