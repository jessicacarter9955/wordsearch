import { NextRequest, NextResponse } from 'next/server'
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import path from 'path'

/**
 * POST /api/upload?filename=dizionario.pdf
 * Carica un file inviato come corpo raw della richiesta e lo salva in
 * uploads/ SENZA alcun limite di dimensione: il body viene trasmesso in
 * streaming su disco (nessun buffering in memoria), quindi anche un PDF
 * da vari GB passa senza problemi.
 *
 * Il client usa XMLHttpRequest (con evento progress) e invia il File
 * direttamente come body, evitando il multipart che verrebbe bufferizzato.
 *
 * Un file con lo stesso nome viene sostituito (comodo per ricaricare una
 * versione più recente dello stesso dizionario).
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

/** Nome file sicuro: solo lettere, cifre, punto, trattini */
function sanitize(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9._ -]/g, '_').replace(/\s+/g, ' ').trim()
  return (clean || 'upload.bin').slice(0, 150)
}

export async function POST(req: NextRequest) {
  try {
    const raw = new URL(req.url).searchParams.get('filename') ?? 'upload.bin'
    const filename = sanitize(raw)

    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    if (!req.body) {
      return NextResponse.json({ error: 'Corpo della richiesta vuoto' }, { status: 400 })
    }

    const dest = path.join(UPLOAD_DIR, filename)

    // Streaming puro: web stream -> node stream -> file su disco.
    // pipeline() fa backpressure, quindi la memoria resta piatta anche
    // con file enormi.
    await pipeline(
      Readable.fromWeb(req.body as Parameters<typeof Readable.fromWeb>[0]),
      createWriteStream(dest)
    )

    const size = statSync(dest).size
    console.log(`[upload] salvato ${filename} (${size} byte)`)

    return NextResponse.json({
      ok: true,
      filename,
      size,
      path: `uploads/${filename}`,
    })
  } catch (e) {
    console.error('[upload] errore:', e)
    return NextResponse.json(
      { error: 'Caricamento non riuscito' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload — elenca i file già caricati (nome, dimensione, data).
 * Utile per vedere cosa è disponibile prima di chiedere l'analisi.
 */
export async function GET() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }
    const files = readdirSync(UPLOAD_DIR)
      .map((name) => {
        const st = statSync(path.join(UPLOAD_DIR, name))
        return {
          name,
          size: st.size,
          modified: st.mtime.toISOString(),
        }
      })
      .sort((a, b) => b.modified.localeCompare(a.modified))

    return NextResponse.json({ files }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json(
      { error: 'Impossibile elencare i file caricati' },
      { status: 500 }
    )
  }
}
