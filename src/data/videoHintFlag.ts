/**
 * Hinweisleiste „Neu hier? Erklärvideo ansehen“: merkt sich pro Gerät, dass sie erledigt ist
 * (über ✕ weggetippt oder das Video geöffnet). Liegt in `localStorage`, nicht in IndexedDB.
 */
import {
  defaultFlagStore,
  isFlagSet,
  setFlag,
  type FlagStore,
} from "./localFlag";

const KEY = "palabrita.videoHintDone";

/** True, wenn die Leiste nicht mehr erscheinen soll. Ohne lesbaren Speicher erscheint sie nie. */
export function isVideoHintDone(
  store: FlagStore | null = defaultFlagStore(),
): boolean {
  return isFlagSet(KEY, store);
}

/** Speichert, dass die Leiste erledigt ist. */
export function markVideoHintDone(
  store: FlagStore | null = defaultFlagStore(),
): void {
  setFlag(KEY, store);
}
