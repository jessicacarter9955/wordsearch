'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookOpen, CheckCircle2, FileText, Loader2, UploadCloud, XCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface UploadedFile {
  name: string
  size: number
  modified: string
}

type Phase = 'idle' | 'uploading' | 'done' | 'error'

/** Dimensione iniziale dei blocchi; si dimezza automaticamente se il
 *  gateway rifiuta/interrompe una richiesta (502/timeout), fino al minimo */
const START_CHUNK = 4 * 1024 * 1024 // 4 MB
const MIN_CHUNK = 256 * 1024 // 256 KB

/** Formatta i byte in modo leggibile (KB/MB/GB con una cifra decimale) */
function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

class UploadError extends Error {
  restart?: boolean
  constructor(message: string, restart = false) {
    super(message)
    this.restart = restart
  }
}

/** Invia un singolo blocco come corpo raw. XHR = evento di avanzamento. */
function sendChunk(
  filename: string,
  blob: Blob,
  offset: number,
  last: boolean,
  onChunkProgress: (loaded: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(
      'POST',
      `/api/upload?filename=${encodeURIComponent(filename)}&offset=${offset}&last=${last ? 1 : 0}`
    )
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onChunkProgress(e.loaded)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let restart = false
      try {
        restart = Boolean(JSON.parse(xhr.responseText)?.restart)
      } catch {
        /* corpo non JSON: resta un errore semplice */
      }
      reject(new UploadError(`Errore ${xhr.status}`, restart))
    }
    xhr.onerror = () => reject(new UploadError('Errore di rete durante il caricamento'))
    xhr.onabort = () => reject(new UploadError('Caricamento annullato'))
    xhr.send(blob)
  })
}

/**
 * Carica un file a BLOCCHI: il gateway esterno che serve il gioco rifiuta
 * le richieste singole troppo grandi (502), quindi il file viene spezzato.
 * - ogni blocco confermato avanza l'offset
 * - su errore: 2 tentativi alla stessa dimensione, poi dimezza (min 256 KB)
 *   — così un limite di dimensione O un timeout del proxy vengono entrambi
 *   aggirati automaticamente
 * - 409 restart → riparte da 0 (temporaneo perso lato server)
 */
async function uploadChunked(
  file: File,
  onProgress: (sent: number, total: number) => void
): Promise<void> {
  const filename = file.name
  let chunkSize = START_CHUNK
  let offset = 0
  const failsAtSize = new Map<number, number>()

  // file vuoto: un solo blocco (vuoto) che chiude subito
  if (file.size === 0) {
    await sendChunk(filename, new Blob([]), 0, true, () => {})
    return
  }

  while (offset < file.size) {
    const end = Math.min(offset + chunkSize, file.size)
    const last = end >= file.size
    const blob = file.slice(offset, end)

    try {
      await sendChunk(filename, blob, offset, last, (loaded) =>
        onProgress(offset + loaded, file.size)
      )
      offset = end
      onProgress(offset, file.size)
      failsAtSize.clear() // un blocco andato a buon fine azzera i conteggi
    } catch (e) {
      const err = e as UploadError
      if (err.restart) {
        offset = 0 // il server ha perso il temporaneo: ricomincia
        continue
      }
      const fails = (failsAtSize.get(chunkSize) ?? 0) + 1
      failsAtSize.set(chunkSize, fails)
      if (fails >= 2 && chunkSize > MIN_CHUNK) {
        chunkSize = Math.max(MIN_CHUNK, Math.floor(chunkSize / 2))
      } else if (fails >= 5) {
        throw new UploadError(
          'Caricamento interrotto più volte: controlla la connessione e riprova'
        )
      }
      // pausa breve prima di ritentare (backoff)
      await new Promise((r) => setTimeout(r, 900))
    }
  }
}

/**
 * Dialog per caricare il dizionario PDF (o qualunque file) direttamente
 * dal gioco: drag & drop oppure selezione, barra di avanzamento live e
 * NESSUN limite di dimensione — il file viaggia a blocchi in streaming.
 */
export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })
  const [result, setResult] = useState<{ filename: string; size: number } | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState<UploadedFile[]>([])

  // elenco dei file già caricati (refresh a ogni apertura)
  const refreshList = useCallback(() => {
    fetch('/api/upload')
      .then((r) => r.json())
      .then((d: { files?: UploadedFile[] }) => setFiles(d.files ?? []))
      .catch(() => setFiles([]))
  }, [])

  useEffect(() => {
    if (open) refreshList()
  }, [open, refreshList])

  // quando il dialog si chiude, ripristina lo stato per la prossima apertura
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setPhase('idle')
        setResult(null)
        setErrorMsg('')
        setProgress({ loaded: 0, total: 0 })
        setDragOver(false)
      }
      onOpenChange(next)
    },
    [onOpenChange]
  )

  const startUpload = useCallback(
    (file: File) => {
      setPhase('uploading')
      setProgress({ loaded: 0, total: file.size })
      setResult(null)
      setErrorMsg('')
      uploadChunked(file, (loaded, total) => setProgress({ loaded, total }))
        .then(async () => {
          // il nome sul server è sanitizzato: riprendilo dalla lista
          refreshList()
          setResult({ filename: file.name, size: file.size })
          setPhase('done')
        })
        .catch((e: Error) => {
          setErrorMsg(e.message)
          setPhase('error')
        })
    },
    [refreshList]
  )

  const onPick = useCallback(
    (list: FileList | null) => {
      const file = list?.[0]
      if (file) startUpload(file)
    },
    [startUpload]
  )

  const pct = progress.total > 0 ? Math.min(100, (progress.loaded / progress.total) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-[#0a5adf]">
            <BookOpen className="h-5 w-5 text-[#0a86ff]" />
            Carica il dizionario
          </DialogTitle>
          <DialogDescription>
            Trascina qui il PDF <em>5 Language Visual Dictionary</em> (o qualunque
            file): l&apos;assistente potrà poi analizzarlo per aggiungere nuove
            categorie di parole al gioco.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Zona drag & drop */}
          {phase !== 'uploading' && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                onPick(e.dataTransfer.files)
              }}
              className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                dragOver
                  ? 'border-[#0a86ff] bg-[#0a86ff]/10 scale-[1.01]'
                  : 'border-stone-300 bg-stone-50 hover:border-[#0a86ff]/60 hover:bg-blue-50/50'
              }`}
            >
              <UploadCloud
                className={`h-10 w-10 ${dragOver ? 'text-[#0a86ff]' : 'text-stone-400'}`}
                strokeWidth={1.8}
              />
              <span className="text-sm font-bold text-stone-700">
                Trascina il file qui, oppure clicca per sceglierlo
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                Nessun limite di dimensione · inviato a blocchi · PDF, immagini, qualunque formato
              </span>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  onPick(e.target.files)
                  e.target.value = ''
                }}
              />
            </button>
          )}

          {/* Avanzamento */}
          {phase === 'uploading' && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-700">
                <Loader2 className="h-4 w-4 animate-spin text-[#0a86ff]" />
                Caricamento in corso…
                <span className="ml-auto tabular-nums text-[#0a5adf]">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-[width] duration-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-right text-xs font-semibold tabular-nums text-stone-500">
                {fmt(progress.loaded)} / {fmt(progress.total)}
              </p>
            </div>
          )}

          {/* Successo */}
          {phase === 'done' && result && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              <div className="text-sm">
                <p className="font-extrabold text-emerald-800">File caricato!</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-semibold text-emerald-700">
                  <FileText className="h-3.5 w-3.5" />
                  {result.filename} · {fmt(result.size)}
                </p>
                <p className="mt-2 rounded-xl bg-white/70 p-2 text-xs leading-relaxed text-emerald-900">
                  Ora scrivi all&apos;assistente quale parte analizzare (es.{' '}
                  <em>&laquo;estrai le parole della pagina 10&raquo;</em>): le
                  parole nuove diventeranno categorie del gioco.
                </p>
              </div>
            </div>
          )}

          {/* Errore */}
          {phase === 'error' && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
              <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-500" />
              <div>
                <p className="font-extrabold text-red-700">Caricamento non riuscito</p>
                <p className="mt-0.5 font-semibold text-red-600">{errorMsg}</p>
                <button
                  type="button"
                  onClick={() => setPhase('idle')}
                  className="mt-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  Riprova
                </button>
              </div>
            </div>
          )}

          {/* File già caricati */}
          {files.length > 0 && (
            <section>
              <h3 className="mb-1.5 text-xs font-extrabold uppercase tracking-wider text-stone-500">
                File caricati
              </h3>
              <ul className="space-y-1.5">
                {files.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-[#0a86ff]" />
                    <span className="truncate">{f.name}</span>
                    <span className="ml-auto shrink-0 tabular-nums text-stone-500">
                      {fmt(f.size)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[11px] leading-relaxed text-stone-400">
                Ricaricare un file con lo stesso nome lo sostituisce con la
                versione nuova.
              </p>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
