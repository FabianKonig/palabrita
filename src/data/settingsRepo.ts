import {
  DEFAULT_SETTINGS,
  type Settings,
  type SettingsPatch,
} from "../domain/types";
import { getDb } from "./db";

const KEY = "main";

/** Defaults plus a fresh random seed and the time of the first start (SPEC §10.2). */
function createSettings(): Settings {
  return {
    ...DEFAULT_SETTINGS,
    orderSeed: crypto.getRandomValues(new Uint32Array(1))[0],
    startedAt: Date.now(),
  };
}

/**
 * Reads the record and applies `change` in one readwrite transaction, so concurrent
 * calls run one after the other (same seed on first start, no lost updates).
 */
async function readModifyWrite(
  change: (stored: Settings) => Settings | null,
): Promise<Settings> {
  const db = await getDb();
  const tx = db.transaction("settings", "readwrite");
  const stored = await tx.store.get(KEY);
  const current = stored ?? createSettings();
  const next = change(current);
  if (next) await tx.store.put(next, KEY);
  else if (!stored) await tx.store.put(current, KEY);
  await tx.done;
  return next ?? current;
}

/** Returns the stored settings; creates them on first start. */
export function getSettings(): Promise<Settings> {
  return readModifyWrite(() => null);
}

/** Stores only maxLevel and theme from the patch and returns the saved record. */
export function saveSettings(patch: SettingsPatch): Promise<Settings> {
  return readModifyWrite((current) => {
    const next = { ...current };
    if (patch.maxLevel !== undefined) next.maxLevel = patch.maxLevel;
    if (patch.theme !== undefined) next.theme = patch.theme;
    return next;
  });
}
