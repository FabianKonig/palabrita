import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Card, Daily, Settings, Vocab } from "../domain/types";

export const DB_NAME = "palabrita";
export const DB_VERSION = 1;

export interface PalabritaDB extends DBSchema {
  settings: { key: string; value: Settings };
  cards: {
    key: [string, string];
    value: Card;
    indexes: { "by-due": number };
  };
  daily: { key: string; value: Daily };
  userVocab: { key: string; value: Vocab };
  meta: { key: string; value: { key: string; value: unknown } };
}

let dbPromise: Promise<IDBPDatabase<PalabritaDB>> | null = null;

/** All five stores are created in version 1 (userVocab stays empty until T9a). */
export function getDb(): Promise<IDBPDatabase<PalabritaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PalabritaDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("settings");
          const cards = db.createObjectStore("cards", {
            keyPath: ["vocabId", "dir"],
          });
          cards.createIndex("by-due", "due");
          db.createObjectStore("daily", { keyPath: "dayKey" });
          db.createObjectStore("userVocab", { keyPath: "id" });
          db.createObjectStore("meta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

/** Closes the cached connection (used by tests to start with a fresh database). */
export async function closeDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}
