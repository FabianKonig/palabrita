import type { Card, Settings, Vocab } from "../domain/types";
import { DEFAULT_SETTINGS } from "../domain/types";
import { getDb } from "./db";

export const SCHEMA_VERSION = 1;

export interface ExportFile {
  schemaVersion: number;
  exportedAt: string;
  settings: Settings;
  cards: Card[];
  userVocab: Vocab[];
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
    STATES.includes(c.state as string)
  );
}

function validUserVocab(v: unknown): v is Vocab {
  return (
    isObj(v) &&
    typeof v.id === "string" &&
    typeof v.es === "string" &&
    Array.isArray(v.de) &&
    v.de.length > 0 &&
    v.de.every((d) => typeof d === "string") &&
    typeof v.pos === "string" &&
    typeof v.topic === "string"
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
  const userVocab = raw.userVocab;
  if (!Array.isArray(userVocab) || !userVocab.every(validUserVocab))
    throw new Error("Die eigenen Wörter in der Datei sind ungültig.");
  return {
    schemaVersion: raw.schemaVersion,
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
    settings: {
      maxLevel: raw.settings.maxLevel,
      theme: raw.settings.theme,
    },
    cards: raw.cards,
    userVocab,
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
    userVocab: await db.getAll("userVocab"),
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

/** Per id; larger createdAt wins, ties keep the local entry. */
export function mergeUserVocab(local: Vocab[], incoming: Vocab[]): Vocab[] {
  const map = new Map(local.map((v) => [v.id, v]));
  for (const v of incoming) {
    const mine = map.get(v.id);
    if (!mine || (v.createdAt ?? 0) > (mine.createdAt ?? 0)) map.set(v.id, v);
  }
  return [...map.values()];
}

/** Applies an already validated file in one transaction (all or nothing). */
export async function applyImport(
  file: ExportFile,
  mode: ImportMode,
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["settings", "cards", "userVocab"], "readwrite");
  const cards = tx.objectStore("cards");
  const userVocab = tx.objectStore("userVocab");

  let nextCards: Card[];
  let nextVocab: Vocab[];
  if (mode === "replace") {
    nextCards = file.cards;
    nextVocab = file.userVocab;
    await tx.objectStore("settings").put(file.settings, "main");
    await Promise.all([cards.clear(), userVocab.clear()]);
  } else {
    nextCards = mergeCards(await cards.getAll(), file.cards);
    nextVocab = mergeUserVocab(await userVocab.getAll(), file.userVocab);
  }
  await Promise.all([
    ...nextCards.map((c) => cards.put(c)),
    ...nextVocab.map((v) => userVocab.put(v)),
  ]);
  await tx.done;
}
