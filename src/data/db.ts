import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Card, Daily, Settings, Vocab } from "../domain/types";

export const DB_NAME = "palabrita";
export const DB_VERSION = 2;

export interface PalabritaDB extends DBSchema {
  settings: { key: string; value: Settings };
  cards: {
    key: [string, string];
    value: Card;
    indexes: { "by-due": number };
  };
  daily: { key: string; value: Daily };
  userVocab: { key: string; value: Vocab };
}

let dbPromise: Promise<IDBPDatabase<PalabritaDB>> | null = null;

/** Four stores. Version 1 also created an unused `meta` store, version 2 drops it. */
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
        }
        if (oldVersion === 1) {
          // The store was never written to; the schema version lives in the export file.
          (db as unknown as IDBDatabase).deleteObjectStore("meta");
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
