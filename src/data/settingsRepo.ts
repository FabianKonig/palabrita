import { DEFAULT_SETTINGS, type Settings } from "../domain/types";
import { getDb } from "./db";

const KEY = "main";

/** Returns the stored settings; creates them with defaults on first start. */
export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const stored = await db.get("settings", KEY);
  if (stored) return { ...DEFAULT_SETTINGS, ...stored };
  await db.put("settings", { ...DEFAULT_SETTINGS }, KEY);
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDb();
  await db.put("settings", settings, KEY);
}
