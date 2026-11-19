import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { openDB } from "idb";
import { beforeEach, describe, expect, it } from "vitest";
import { closeDb, DB_NAME, getDb } from "./db";

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
});

describe("db", () => {
  it("creates the four stores of a fresh database", async () => {
    const db = await getDb();
    expect([...db.objectStoreNames].sort()).toEqual([
      "cards",
      "daily",
      "settings",
      "userVocab",
    ]);
  });

  it("upgrades a version 1 database: drops the unused meta store, keeps data", async () => {
    const old = await openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore("settings");
        db.createObjectStore("cards", { keyPath: ["vocabId", "dir"] });
        db.createObjectStore("daily", { keyPath: "dayKey" });
        db.createObjectStore("userVocab", { keyPath: "id" });
        db.createObjectStore("meta", { keyPath: "key" });
      },
    });
    await old.put("settings", { maxLevel: "A2", theme: "dark" }, "main");
    old.close();

    const db = await getDb();
    expect([...db.objectStoreNames] as string[]).not.toContain("meta");
    expect(await db.get("settings", "main")).toEqual({
      maxLevel: "A2",
      theme: "dark",
    });
  });
});
