import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Card, Settings } from "../domain/types";

export const DB_NAME = "palabrita";
export const DB_VERSION = 1;

export interface PalabritaDB extends DBSchema {
  settings: { key: string; value: Settings };
  cards: { key: [string, string]; value: Card };
}

let dbPromise: Promise<IDBPDatabase<PalabritaDB>> | null = null;

/** Two stores: settings and cards. */
export function getDb(): Promise<IDBPDatabase<PalabritaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PalabritaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("settings");
        db.createObjectStore("cards", { keyPath: ["vocabId", "dir"] });
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
