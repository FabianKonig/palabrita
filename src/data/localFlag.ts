/**
 * Einfache Ja/Nein-Merker pro Gerät in `localStorage` (nicht in IndexedDB, damit das
 * Datenmodell unberührt bleibt). Gemeinsame Grundlage für Begrüßung und Video-Hinweis.
 */

export type FlagStore = Pick<Storage, "getItem" | "setItem">;

/** `null`, wenn der Browser den Speicher verweigert (z. B. blockierte Website-Daten). */
export function defaultFlagStore(): FlagStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * True, wenn der Merker gesetzt ist. Ohne lesbaren Speicher gilt er als gesetzt,
 * sonst würde der zugehörige Hinweis bei jedem Öffnen erscheinen.
 */
export function isFlagSet(key: string, store: FlagStore | null): boolean {
  if (!store) return true;
  try {
    return store.getItem(key) === "1";
  } catch {
    return true;
  }
}

/** Setzt den Merker. Schlägt das Schreiben fehl, erscheint der Hinweis beim nächsten Start erneut. */
export function setFlag(key: string, store: FlagStore | null): void {
  try {
    store?.setItem(key, "1");
  } catch {
    // Speicher nicht verfügbar.
  }
}
