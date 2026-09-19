'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Database, Globe, Layers, Puzzle } from 'lucide-react'

interface InfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Spiega l'architettura del vocabolario: la risposta a
 * "ma le parole dove stanno? C'è un database?"
 */
export function InfoDialog({ open, onOpenChange }: InfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black text-stone-800">
            <Database className="h-5 w-5 text-emerald-600" />
            Come funziona il vocabolario
          </DialogTitle>
          <DialogDescription>
            Le parole <strong>non sono scritte nel codice del gioco</strong>:
            vivono in un vero database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-relaxed text-stone-600">
          <section>
            <h3 className="mb-1 flex items-center gap-2 font-bold text-stone-800">
              <Database className="h-4 w-4 text-emerald-600" /> Il database
            </h3>
            <p>
              Un database SQLite (via Prisma ORM) con tre tabelle collegate:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-stone-900 p-3 text-xs leading-relaxed text-emerald-300">
{`languages (lingue: it, en)
   └── categories (Animali, Cibo, Sport…)
          └── words (LEONE, GATTO, … con difficoltà)`}
            </pre>
            <p className="mt-2">
              Ogni lingua ha le sue categorie, ogni categoria le sue parole.
              La difficoltà è calcolata dalla lunghezza (≤5 facile · 6-8 media · 9+ difficile).
            </p>
          </section>

          <section>
            <h3 className="mb-1 flex items-center gap-2 font-bold text-stone-800">
              <Globe className="h-4 w-4 text-emerald-600" /> Le API
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">GET /api/wordbanks</code>{' '}
                — la home chiede lingue e categorie con i conteggi.
              </li>
              <li>
                <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">GET /api/words?categoryId=1&amp;count=8</code>{' '}
                — a ogni partita il server estrae a sorte le parole: ogni sfida è diversa.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-1 flex items-center gap-2 font-bold text-stone-800">
              <Layers className="h-4 w-4 text-emerald-600" /> Aggiungere parole
            </h3>
            <p>
              Basta un insert nel database, <em>senza toccare una riga di codice</em>:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-stone-900 p-3 text-xs leading-relaxed text-emerald-300">
{`INSERT INTO words (categoryId, text, difficulty)
VALUES (1, 'GIRAFFA', 'medium');`}
            </pre>
            <p className="mt-2">
              La parola comparirà automaticamente nelle prossime partite
              della categoria. Con Prisma Studio (<code className="rounded bg-stone-100 px-1 text-xs">bunx prisma studio</code>)
              puoi gestire tutto da interfaccia grafica.
            </p>
          </section>

          <section className="rounded-2xl bg-amber-50 p-3 text-amber-900">
            <h3 className="mb-1 flex items-center gap-2 font-bold">
              <Puzzle className="h-4 w-4" /> Curiosità sull&apos;originale
            </h3>
            <p className="text-[13px]">
              Nel gioco commerciale che hai linkato le parole sono
              <strong> hardcodate in JavaScript</strong> dentro il file del motore
              (un array per lingua). La versione con database (Supabase) è una
              variante successiva. Qui abbiamo l&apos;architettura DB fin dall&apos;inizio,
              con la stessa logica a tre livelli.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
