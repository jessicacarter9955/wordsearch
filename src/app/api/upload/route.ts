import { NextRequest, NextResponse } from 'next/server'
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { rename } from 'fs/promises'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import path from 'path'

/**
 * POST /api/upload?filename=dizionario.pdf                  → file intero (legacy)
 * POST /api/upload?filename=dizionario.pdf&offset=N&last=1  → blocco N del file
 *
 * Il caricamento a BLOCCHI esiste perché il gioco viene servito tramite un
 * gateway/proxy esterno che rifiuta (502) le richieste singole troppo grandi
 * o troppo lente: il client divide il file in blocchi piccoli (default 4 MB,
 * ridotti automaticamente se un blocco fallisce) e li invia in sequenza.
 *
 * Protocollo blocchi:
 *   - offset=0   → (ri)inizia: il file temporaneo viene troncato/creato
 *   - offset>0   → scrive alla posizione esatta (un blocco ritentato dopo un
 *                  fallimento parziale sovrascrive i propri byte, mai duplicati)
 *   - last=1     → chiude: il file temporaneo .nome.part diventa uploads/nome
 *   - offset>0 senza .part esistente → 409 {restart:true}: il client riparte da 0
 *
 * Nessun buffering in memoria: ogni blocco va in streaming su disco.
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
    const sp = new URL(req.url).searchParams
    const filename = sanitize(sp.get('filename') ?? 'upload.bin')

    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true })
    }
    if (!req.body) {
      return NextResponse.json({ error: 'Corpo della richiesta vuoto' }, { status: 400 })
    }

    // ---- modalità a blocchi ----
    const offsetParam = sp.get('offset')
    if (offsetParam !== null) {
      const offset = Number(offsetParam)
      if (!Number.isInteger(offset) || offset < 0) {
        return NextResponse.json({ error: 'offset non valido' }, { status: 400 })
      }
      const isLast = sp.get('last') === '1'
      const partPath = path.join(UPLOAD_DIR, `.${filename}.part`)

      if (offset === 0) {
        // nuovo caricamento (o restart): trunca/crea il file temporaneo
        await pipeline(
          Readable.fromWeb(req.body as Parameters<typeof Readable.fromWeb>[0]),
          createWriteStream(partPath, { flags: 'w' })
        )
      } else {
        if (!existsSync(partPath)) {
          // il temporaneo è sparito (server riavviato?): il client deve ripartire da 0
          return NextResponse.json(
            { error: 'Caricamento precedente non trovato: ricomincia', restart: true },
            { status: 409 }
          )
        }
        // scrive alla posizione esatta: 'r+' non trunca, start posiziona
        await pipeline(
          Readable.fromWeb(req.body as Parameters<typeof Readable.fromWeb>[0]),
          createWriteStream(partPath, { flags: 'r+', start: offset })
        )
      }

      const written = statSync(partPath).size

      if (isLast) {
        const finalPath = path.join(UPLOAD_DIR, filename)
        await rename(partPath, finalPath)
        const size = statSync(finalPath).size
        console.log(`[upload] completato ${filename} a blocchi (${size} byte)`)
        return NextResponse.json({ ok: true, filename, size, complete: true })
      }

      return NextResponse.json({ ok: true, filename, received: written, complete: false })
    }

    // ---- modalità file intero (richiesta singola, senza proxy intermedi) ----
    const dest = path.join(UPLOAD_DIR, filename)
    await pipeline(
      Readable.fromWeb(req.body as Parameters<typeof Readable.fromWeb>[0]),
      createWriteStream(dest)
    )
    const size = statSync(dest).size
    console.log(`[upload] salvato ${filename} (${size} byte)`)
    return NextResponse.json({ ok: true, filename, size, complete: true })
  } catch (e) {
    console.error('[upload] errore:', e)
    return NextResponse.json({ error: 'Caricamento non riuscito' }, { status: 500 })
  }
}

/**
 * GET /api/upload — elenca i file caricati (nome, dimensione, data).
 * I temporanei .part (caricamenti in corso/interrotti) sono esclusi.
 */
export async function GET() {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({ files: [] }, { headers: { 'Cache-Control': 'no-store' } })
    }
    const files = readdirSync(UPLOAD_DIR)
      .filter((name) => !name.startsWith('.'))
      .map((name) => {
        const st = statSync(path.join(UPLOAD_DIR, name))
        return { name, size: st.size, modified: st.mtime.toISOString() }
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
