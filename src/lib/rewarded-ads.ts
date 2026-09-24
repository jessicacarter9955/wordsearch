/**
 * SISTEMA AIUTI + SPOT A PREMIO (rewarded ads) — versione web
 * ============================================================
 *
 * REGOLE DI GIOCO (concordate):
 *   1. Il contatore aiuti usati parte da 0 ad OGNI partita.
 *   2. I primi FREE_HINTS_PER_GAME aiuti sono gratuiti e immediati.
 *   3. Dal successivo, ogni aiuto richiede la visione di uno spot a premio.
 *   4. NESSUN ACCUMULO: lo spot sblocca UN solo aiuto, consumato subito —
 *      non esiste una "scorta" di aiuti bancabili guardando più spot.
 *
 * ARCHITETTURA (adapter):
 *   Qui il provider web è uno spot SIMULATO (RewardedAdOverlay in React).
 *   Quando arriverà una rete reale (AdSense for Games H5, GameDistribution,
 *   CrazyGames, Poki...) basterà implementare la stessa interfaccia
 *   `RewardedAdProvider` e sostituire `webAdProvider` qui sotto: il resto
 *   del gioco (gate, contatori, UI) non cambia.
 *   L'app mobile Flutter userà lo stesso contratto con AdMob rewarded.
 */

/** Aiuti gratuiti per partita prima che scatti lo spot a premio */
export const FREE_HINTS_PER_GAME = 3

/** Durata dello spot demo in secondi (le reti reali useranno la propria) */
export const AD_DURATION_SECONDS = 5

/** Esito della visualizzazione di uno spot a premio */
export interface RewardedAdResult {
  /** true = spot completato, ricompensa maturata */
  rewarded: boolean
}

/**
 * Contratto universale del provider di spot a premio.
 * `show()` apre lo spot e risolve quando il player lo chiude
 * (completato con ricompensa oppure interrotto).
 */
export interface RewardedAdProvider {
  readonly name: string
  show(): Promise<RewardedAdResult>
}
