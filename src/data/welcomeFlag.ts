/**
 * Erststart-Hinweis: merkt sich pro Gerät, dass die Begrüßung geschlossen wurde.
 * Liegt in `localStorage`, nicht in IndexedDB, damit das Datenmodell unberührt bleibt.
 */
import {
  defaultFlagStore,
  isFlagSet,
  setFlag,
  type FlagStore,
} from "./localFlag";

const KEY = "palabrita.welcomeSeen";

export type WelcomeStore = FlagStore;

/**
 * True, wenn die Begrüßung schon geschlossen wurde. Ohne lesbaren Speicher gilt sie als gesehen,
 * sonst würde sie bei jedem Öffnen erscheinen.
 */
export function isWelcomeSeen(
  store: WelcomeStore | null = defaultFlagStore(),
): boolean {
  return isFlagSet(KEY, store);
}

/** Speichert, dass die Begrüßung geschlossen wurde. Schlägt das Schreiben fehl, bleibt es beim nächsten Start aus. */
export function markWelcomeSeen(
  store: WelcomeStore | null = defaultFlagStore(),
): void {
  setFlag(KEY, store);
}
