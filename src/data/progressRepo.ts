import type { Settings } from "../domain/types";
import { getDb } from "./db";
import { createSettings } from "./settingsRepo";

/**
 * Setzt den Lernfortschritt zurück (SPEC §10.3): löscht alle Karten und würfelt
 * `orderSeed` und `startedAt` neu. `maxLevel` und `theme` bleiben. Beides geschieht in
 * **einer** Transaktion, es bleibt also nie ein halber Zustand zurück. Gibt den neuen
 * Einstellungs-Datensatz zurück.
 */
export async function resetProgress(): Promise<Settings> {
  const db = await getDb();
  const tx = db.transaction(["cards", "settings"], "readwrite");
  const old = await tx.objectStore("settings").get("main");
  const fresh = createSettings();
  const next: Settings = old
    ? { ...fresh, maxLevel: old.maxLevel, theme: old.theme }
    : fresh;
  await Promise.all([
    tx.objectStore("cards").clear(),
    tx.objectStore("settings").put(next, "main"),
    tx.done,
  ]);
  return next;
}
