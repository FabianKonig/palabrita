import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { closeDb, getDb } from "./db";

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
});

describe("db", () => {
  it("creates the three stores of a fresh database", async () => {
    const db = await getDb();
    expect([...db.objectStoreNames].sort()).toEqual([
      "cards",
      "settings",
      "userVocab",
    ]);
  });
});
