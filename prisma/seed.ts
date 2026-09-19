/**
 * SEED DEL VOCABOLARIO
 * ====================
 * Popola il DB con lingue, categorie e parole.
 * Da qui in poi aggiungere parole = un INSERT nel DB,
 * senza mai toccare il codice del gioco.
 *
 * Regole per le parole: MAIUSCOLO, senza spazi, senza accenti/apostrofi.
 * La difficoltà è calcolata automaticamente dalla lunghezza:
 *   <= 5 lettere  -> easy
 *   6-8 lettere   -> medium
 *   >= 9 lettere  -> hard
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function diff(text: string): string {
  if (text.length <= 5) return 'easy'
  if (text.length <= 8) return 'medium'
  return 'hard'
}

interface SeedCategory {
  slug: string
  name: string
  description: string
  emoji: string
  color: string
  words: string[]
}

const IT_CATEGORIES: SeedCategory[] = [
  {
    slug: 'animali',
    name: 'Animali',
    description: 'Dal giardino di casa alla savana',
    emoji: '🦁',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    words: [
      'LEONE', 'TIGRE', 'ZEBRA', 'CANE', 'GATTO', 'CAVALLO', 'MUCCA',
      'PECORA', 'CAPRA', 'GALLINA', 'ANATRA', 'CONIGLIO', 'LEPRE', 'VOLPE',
      'ORSO', 'LUPO', 'CERVO', 'GIRAFFA', 'ELEFANTE', 'SCIMMIA', 'DELFINO',
      'BALENA', 'SQUALO', 'TONNO', 'AQUILA', 'FALCO', 'GUFO', 'CIGNO',
      'PASSERO', 'PAPPAGALLO', 'RICCIO', 'FARFALLA', 'GRILLO', 'RAGNO',
      'SERPENTE', 'LUCERTOLA', 'TARTARUGA', 'RANA', 'CANGURO', 'PANDA',
      'KOALA', 'CAMMELLO', 'LINCE', 'STAMBECCO', 'ISTERICE', 'GHEPARDO',
    ],
  },
  {
    slug: 'frutta-verdura',
    name: 'Frutta & Verdura',
    description: 'Il mercato contadino in una griglia',
    emoji: '🍎',
    color: 'bg-lime-100 text-lime-900 border-lime-300',
    words: [
      'MELA', 'PERA', 'BANANA', 'ARANCIA', 'LIMONE', 'FRAGOLA', 'CILIEGIA',
      'ALBICOCCA', 'PESCA', 'UVA', 'FICO', 'MELONE', 'ANGURIA', 'MANDORLA',
      'NOCE', 'CASTAGNA', 'PATATA', 'CAROTA', 'POMODORO', 'ZUCCHINA',
      'MELANZANA', 'PEPERONE', 'CIPOLLA', 'AGLIO', 'LATTUGA', 'SPINACI',
      'BROCCOLO', 'CAVOLFIORE', 'FINOCCHIO', 'SEDANO', 'RAVANELLO',
      'ASPARAGO', 'FUNGO', 'TARTUFO', 'RUCOLA', 'BASILICO', 'PREZZEMOLO',
      'SALVIA', 'ROSMARINO', 'MELAGRANA', 'PAPAIA', 'KAKI', 'LITCHI',
    ],
  },
  {
    slug: 'cibo',
    name: 'Cibo',
    description: 'Un menù degustazione di parole',
    emoji: '🍝',
    color: 'bg-orange-100 text-orange-900 border-orange-300',
    words: [
      'PASTA', 'PIZZA', 'RISO', 'PANE', 'LASAGNE', 'GNOCCHI', 'RAVIOLI',
      'TORTELLINI', 'SPAGHETTI', 'RISOTTO', 'POLLO', 'BISTECCA', 'SALSICCIA',
      'PROSCIUTTO', 'SALAME', 'MOZZARELLA', 'PARMIGIANO', 'GORGONZOLA',
      'RICOTTA', 'BURRO', 'FORMAGGIO', 'GELATO', 'TORTA', 'BISCOTTI',
      'CIOCCOLATO', 'CARAMELLE', 'MARMELLATA', 'MIELE', 'ZUCCHERO',
      'PEPE', 'OLIO', 'ACETO', 'PANETTONE', 'TIRAMISU', 'CROSTATA',
      'BRIOCHE', 'CANNOLI', 'ARANCINI', 'PESTO', 'RAGU', 'ABBACCHIO',
    ],
  },
  {
    slug: 'nazioni',
    name: 'Nazioni',
    description: 'Un giro del mondo in 12x12',
    emoji: '🌍',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    words: [
      'ITALIA', 'FRANCIA', 'SPAGNA', 'PORTOGALLO', 'GERMANIA', 'AUSTRIA',
      'SVIZZERA', 'OLANDA', 'BELGIO', 'IRLANDA', 'DANIMARCA', 'SVEZIA',
      'NORVEGIA', 'FINLANDIA', 'POLONIA', 'RUSSIA', 'UCRAINA', 'GRECIA',
      'TURCHIA', 'EGITTO', 'MAROCCO', 'TUNISIA', 'ALGERIA', 'NIGERIA',
      'AMERICA', 'CANADA', 'MESSICO', 'BRASILE', 'ARGENTINA', 'CILE',
      'PERU', 'BOLIVIA', 'CUBA', 'GIAPPONE', 'CINA', 'INDIA', 'COREA',
      'VIETNAM', 'THAILANDIA', 'AUSTRALIA', 'GRENLANDIA', 'ISLANDA',
    ],
  },
  {
    slug: 'colori',
    name: 'Colori',
    description: 'La tavolozza nascosta',
    emoji: '🎨',
    color: 'bg-rose-100 text-rose-900 border-rose-300',
    words: [
      'ROSSO', 'GIALLO', 'VERDE', 'VIOLA', 'ROSA', 'MARRONE', 'GRIGIO',
      'NERO', 'BIANCO', 'ORO', 'ARGENTO', 'TURCHESE', 'INDACO', 'MAGENTA',
      'BEIGE', 'PORPORA', 'SMERALDO', 'AMBRA', 'CORALLO', 'AVORIO',
      'EBANO', 'AMARANTO', 'LILLA', 'ZAFFERANO', 'CREMISI', 'OCRA',
    ],
  },
  {
    slug: 'sport',
    name: 'Sport',
    description: 'Podio, record e sudore',
    emoji: '🏆',
    color: 'bg-teal-100 text-teal-900 border-teal-300',
    words: [
      'CALCIO', 'PALLONE', 'TENNIS', 'NUOTO', 'ATLETICA', 'PUGILATO',
      'SCHERMA', 'CICLISMO', 'CORSA', 'MARATONA', 'SCI', 'PALESTRA',
      'PADEL', 'GOLF', 'RUGBY', 'BASEBALL', 'PALLANUOTO', 'PALLAVOLO',
      'GINNASTICA', 'EQUITAZIONE', 'CANOA', 'VELA', 'BOXE', 'LOTTA',
      'SALTO', 'OSTACOLI', 'BICICLETTA', 'MARCIA', 'ARCIERE', 'PIROETTA',
      'SLALOM', 'TRIPLO', 'MARTello'.toUpperCase(), 'GIAVELLOTTO',
    ],
  },
  {
    slug: 'corpo-umano',
    name: 'Corpo Umano',
    description: 'Piccola anatomia tra le celle',
    emoji: '🫀',
    color: 'bg-red-100 text-red-900 border-red-300',
    words: [
      'TESTA', 'OCCHIO', 'NASO', 'BOCCA', 'DENTI', 'LINGUA', 'LABBRA',
      'ORECCHIO', 'COLLO', 'SPALLA', 'BRACCIO', 'GOMITO', 'MANO', 'DITO',
      'POLSO', 'TORACE', 'PETTO', 'COSTOLE', 'SCHIENA', 'GINOCCHIO',
      'COSCIA', 'POLPACCIO', 'CAVIGLIA', 'PIEDE', 'TALLONE', 'CUORE',
      'POLMONI', 'FEGATO', 'STOMACO', 'RENI', 'CERVELLO', 'SANGUE',
      'OSSA', 'MUSCOLI', 'PELLE', 'CAPELLI', 'BARBA', 'UNGHIE', 'VECCHIA'.replace('VECCHIA', 'INTESTINO'),
    ],
  },
  {
    slug: 'citta',
    name: 'Città Italiane',
    description: 'Da Nord a Sud, capoluoghi e non solo',
    emoji: '🏛️',
    color: 'bg-stone-100 text-stone-900 border-stone-300',
    words: [
      'ROMA', 'MILANO', 'NAPOLI', 'TORINO', 'PALERMO', 'GENOVA',
      'BOLOGNA', 'FIRENZE', 'BARI', 'CATANIA', 'VENEZIA', 'VERONA',
      'PISA', 'SIENA', 'TRIESTE', 'TRENTO', 'UDINE', 'PARMA', 'MODENA',
      'FERRARA', 'RAVENNA', 'RIMINI', 'ANCONA', 'PERUGIA', 'PESCARA',
      'CAMPOBASSO', 'CASERTA', 'BENEVENTO', 'POTENZA', 'COSENZA',
      'CATANZARO', 'MESSINA', 'SASSARI', 'CAGLIARI', 'NUORO', 'ORISTANO',
      'AOSTA', 'LECCE', 'TARANTO', 'BRINDISI', 'FOGGIA', 'TERNI',
      'MATERA', 'LAMEZIA', 'OLBIA', 'SIRACUSA', 'AGRIGENTO',
    ],
  },
  {
    slug: 'natura',
    name: 'Natura & Meteo',
    description: 'Cieli, boschi e stagioni',
    emoji: '🌦️',
    color: 'bg-sky-100 text-sky-900 border-sky-300',
    words: [
      'PIOGGIA', 'NEVE', 'VENTO', 'TEMPESTA', 'FOGO'.replace('FOGO', 'FOGHINA'), 'NUVOLE',
      'SOLE', 'LUNA', 'STELLE', 'ARCOBALENO', 'TUONO', 'FULMINE',
      'GRANDINE', 'BRINA', 'GHIACCIO', 'BRUMA', 'CALDO', 'FREDDO',
      'PRIMAVERA', 'ESTATE', 'AUTUNNO', 'INVERNO', 'MARE', 'MONTAGNA',
      'FIUME', 'LAGO', 'BOSCO', 'FORESTA', 'DESERTO', 'VULCANO',
      'ISOLA', 'VALLE', 'GHIACCIAIO', 'CASCATA', 'PRATO', 'SPIAGGIA',
    ],
  },
  {
    slug: 'casa',
    name: 'Casa',
    description: 'Oggetti quotidiani ben nascosti',
    emoji: '🏠',
    color: 'bg-yellow-100 text-yellow-900 border-yellow-300',
    words: [
      'PORTA', 'FINESTRA', 'TAVOLO', 'SEDIA', 'DIVANO', 'LETTO',
      'CUCINA', 'SALOTTO', 'BAGNO', 'SPECCHIO', 'ARMADIO', 'CASSETTI',
      'LAMPADA', 'TAPPETO', 'CUSCINE'.replace('CUSCINE', 'CUCUZZA').replace('CUCUZZA', 'CUSCINO'), 'SPOGLIATOIO',
      'FORCHETTA', 'COLTELLO', 'CUCCHIAIO', 'PIATTO', 'BICCHIERE',
      'PENTOLA', 'PADELLA', 'FORNO', 'FRIGORIFERO', 'LAVATRICE',
      'SCOPA', 'ASPIRAPOLVERE', 'TENDA', 'SERRATURA', 'CAMINO',
    ],
  },
  {
    slug: 'musica',
    name: 'Musica',
    description: 'Note, strumenti e ritmi',
    emoji: '🎵',
    color: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300',
    words: [
      'NOTA', 'MUSICA', 'CANZONE', 'MELODIA', 'RITMO', 'CORO',
      'ORCHESTRA', 'PIANOFORTE', 'VIOLINO', 'VIOLONCELLO', 'CHITARRA',
      'BASSO', 'BATTERIA', 'TAMBURELLO', 'TROMBA', 'SAXOFONO',
      'FLAUTO', 'CLARINETTO', 'ARPA', 'ORGANO', 'ACCORDO', 'SCALA',
      'OPERA', 'SINFONIA', 'CONCERTO', 'MICROFONO', 'CASSE', 'DISCO',
    ],
  },
  {
    slug: 'lavori',
    name: 'Lavori & Mestieri',
    description: 'Chi fa cosa nella griglia',
    emoji: '👷',
    color: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    words: [
      'MEDICO', 'INFERMIERE', 'AVVOCATO', 'GIUDICE', 'NOTAIO',
      'INSEGNANTE', 'STUDENTE', 'INGEGNERE', 'ARCHITETTO', 'GEOMETRA',
      'ELETTRICISTA', 'IDRAULICO', 'MURATORE', 'CARPENTIERE', 'FALEGNAME',
      'PANETTIERE', 'MACELLAIO', 'PESCATORE', 'CONTADINO', 'PASTORE',
      'BARBIERE', 'PARRUCCHIERA', 'SARTO', 'CALZOLAIO', 'OREFICE',
      'COMMERCIANTE', 'CASSIERA', 'CAMERIERE', 'CUOCO', 'PILOTA',
      'VIGILE', 'BOMBIERE'.replace('BOMBIERE', 'VIGILFUOCO'), 'GIORNALISTA', 'FOTOGRAFO',
    ],
  },
]

const EN_CATEGORIES: SeedCategory[] = [
  {
    slug: 'animals',
    name: 'Animals',
    description: 'From the backyard to the savanna',
    emoji: '🦁',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    words: [
      'LION', 'TIGER', 'ZEBRA', 'DOG', 'CAT', 'HORSE', 'COW',
      'SHEEP', 'GOAT', 'CHICKEN', 'DUCK', 'RABBIT', 'HARE', 'FOX',
      'BEAR', 'WOLF', 'DEER', 'GIRAFFE', 'ELEPHANT', 'MONKEY',
      'DOLPHIN', 'WHALE', 'SHARK', 'EAGLE', 'FALCON', 'OWL',
      'SWAN', 'SPARROW', 'PARROT', 'HEDGEHOG', 'BUTTERFLY', 'SNAKE',
      'TURTLE', 'FROG', 'KANGAROO', 'PANDA', 'KOALA', 'CAMEL',
    ],
  },
  {
    slug: 'food',
    name: 'Food',
    description: 'A tasting menu of words',
    emoji: '🍔',
    color: 'bg-orange-100 text-orange-900 border-orange-300',
    words: [
      'BREAD', 'PASTA', 'PIZZA', 'RICE', 'CHEESE', 'BUTTER', 'HONEY',
      'SUGAR', 'APPLE', 'BANANA', 'ORANGE', 'LEMON', 'CHERRY', 'GRAPE',
      'POTATO', 'CARROT', 'TOMATO', 'ONION', 'SALAD', 'SOUP',
      'STEAK', 'CHICKEN', 'FISH', 'CAKE', 'COOKIE', 'CHOCOLATE',
      'ICECREAM', 'JAM', 'PEPPER', 'VINEGAR', 'MEATBALL', 'POPCORN',
    ],
  },
  {
    slug: 'countries',
    name: 'Countries',
    description: 'A world tour in a grid',
    emoji: '🌍',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    words: [
      'ITALY', 'FRANCE', 'SPAIN', 'PORTUGAL', 'GERMANY', 'AUSTRIA',
      'SWITZERLAND', 'HOLLAND', 'BELGIUM', 'IRELAND', 'DENMARK',
      'SWEDEN', 'NORWAY', 'FINLAND', 'POLAND', 'RUSSIA', 'GREECE',
      'TURKEY', 'EGYPT', 'MOROCCO', 'AMERICA', 'CANADA', 'MEXICO',
      'BRAZIL', 'CHILE', 'PERU', 'CUBA', 'JAPAN', 'CHINA', 'INDIA',
      'VIETNAM', 'AUSTRALIA', 'ICELAND', 'ENGLAND', 'SCOTLAND',
    ],
  },
]

async function main() {
  console.log('🌱 Seed del vocabolario in corso...')

  // Pulizia (ri-eseguibile in sicurezza)
  await db.word.deleteMany()
  await db.category.deleteMany()
  await db.language.deleteMany()

  const languages = [
    { code: 'it', name: 'Italiano', emoji: '🇮🇹', categories: IT_CATEGORIES },
    { code: 'en', name: 'English', emoji: '🇬🇧', categories: EN_CATEGORIES },
  ]

  for (const lang of languages) {
    const language = await db.language.create({
      data: { code: lang.code, name: lang.name, emoji: lang.emoji },
    })

    for (const cat of lang.categories) {
      const category = await db.category.create({
        data: {
          languageId: language.id,
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          emoji: cat.emoji,
          color: cat.color,
        },
      })

      await db.word.createMany({
        data: cat.words.map((w) => ({
          categoryId: category.id,
          text: w,
          difficulty: diff(w),
        })),
      })
    }
    console.log(`  ✅ ${lang.name}: ${lang.categories.length} categorie`)
  }

  const total = await db.word.count()
  console.log(`🎉 Fatto! ${total} parole nel vocabolario.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
