/**
 * Erststart-Hinweis: merkt sich pro Gerät, dass die Begrüßung geschlossen wurde.
 * Liegt in `localStorage`, nicht in IndexedDB, damit Export/Import und Datenmodell unberührt bleiben.
 */

const KEY = "palabrita.welcomeSeen";

export type WelcomeStore = Pick<Storage, "getItem" | "setItem">;

/** `null`, wenn der Browser den Speicher verweigert (z. B. blockierte Website-Daten). */
function defaultStore(): WelcomeStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * True, wenn die Begrüßung schon geschlossen wurde. Ohne lesbaren Speicher gilt sie als gesehen,
 * sonst würde sie bei jedem Öffnen erscheinen.
 */
export function isWelcomeSeen(
  store: WelcomeStore | null = defaultStore(),
): boolean {
  if (!store) return true;
  try {
    return store.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

/** Speichert, dass die Begrüßung geschlossen wurde. Schlägt das Schreiben fehl, bleibt es beim nächsten Start aus. */
export function markWelcomeSeen(
  store: WelcomeStore | null = defaultStore(),
): void {
  try {
    store?.setItem(KEY, "1");
  } catch {
    // Speicher nicht verfügbar: die Begrüßung erscheint dann beim nächsten Start erneut.
  }
}
