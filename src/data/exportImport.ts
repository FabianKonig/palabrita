import type { Card, Settings } from "../domain/types";
import { DEFAULT_SETTINGS } from "../domain/types";
import { getDb } from "./db";

export const SCHEMA_VERSION = 1;

export interface ExportFile {
  schemaVersion: number;
  exportedAt: string;
  settings: Settings;
  cards: Card[];
}

export type ImportMode = "merge" | "replace";

const LEVELS = ["A1", "A2", "B1"];
const DIRS = ["de-es", "es-de"];
const STATES = ["new", "learning", "mature"];

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function isNum(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function validSettings(s: unknown): s is Settings {
  return (
    isObj(s) &&
    LEVELS.includes(s.maxLevel as string) &&
    ["system", "light", "dark"].includes(s.theme as string)
  );
}

function validCard(c: unknown): c is Card {
  return (
    isObj(c) &&
    typeof c.vocabId === "string" &&
    DIRS.includes(c.dir as string) &&
    isNum(c.due) &&
    isNum(c.interval) &&
    isNum(c.ease) &&
    isNum(c.reps) &&
    isNum(c.lapses) &&
    (c.lastReviewed === null || isNum(c.lastReviewed)) &&
    STATES.includes(c.state as string) &&
    (c.step === undefined || c.step === 0 || c.step === 1)
  );
}

/** Parses and validates an export file. Throws an Error with a German message. */
export function parseExport(text: string): ExportFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Die Datei ist kein gültiges JSON.");
  }
  if (!isObj(raw)) throw new Error("Unerwartetes Dateiformat.");
  if (!isNum(raw.schemaVersion))
    throw new Error("Die Datei enthält keine schemaVersion.");
  if (raw.schemaVersion > SCHEMA_VERSION)
    throw new Error(
      `Die Datei stammt von einer neueren Version (${raw.schemaVersion}). Bitte die App aktualisieren.`,
    );
  if (!validSettings(raw.settings))
    throw new Error("Die Einstellungen in der Datei sind ungültig.");
  if (!Array.isArray(raw.cards) || !raw.cards.every(validCard))
    throw new Error("Die Karten in der Datei sind ungültig.");
  return {
    schemaVersion: raw.schemaVersion,
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
    settings: {
      maxLevel: raw.settings.maxLevel,
      theme: raw.settings.theme,
    },
    cards: raw.cards,
  };
}

export async function buildExport(now = Date.now()): Promise<ExportFile> {
  const db = await getDb();
  const stored = await db.get("settings", "main");
  const settings = stored
    ? {
        maxLevel: stored.maxLevel,
        theme: stored.theme,
      }
    : DEFAULT_SETTINGS;
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date(now).toISOString(),
    settings,
    cards: await db.getAll("cards"),
  };
}

const cardKey = (c: Card) => `${c.vocabId}|${c.dir}`;

/** Newer lastReviewed wins; ties keep the local card; null loses against a value. */
export function mergeCards(local: Card[], incoming: Card[]): Card[] {
  const map = new Map(local.map((c) => [cardKey(c), c]));
  for (const c of incoming) {
    const mine = map.get(cardKey(c));
    if (!mine) map.set(cardKey(c), c);
    else if ((c.lastReviewed ?? -Infinity) > (mine.lastReviewed ?? -Infinity))
      map.set(cardKey(c), c);
  }
  return [...map.values()];
}

/** Applies an already validated file in one transaction (all or nothing). */
export async function applyImport(
  file: ExportFile,
  mode: ImportMode,
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["settings", "cards"], "readwrite");
  const cards = tx.objectStore("cards");

  let nextCards: Card[];
  if (mode === "replace") {
    nextCards = file.cards;
    await tx.objectStore("settings").put(file.settings, "main");
    await cards.clear();
  } else {
    nextCards = mergeCards(await cards.getAll(), file.cards);
  }
  await Promise.all(nextCards.map((c) => cards.put(c)));
  await tx.done;
}
