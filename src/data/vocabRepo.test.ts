import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { newCard } from "../domain/srs";
import type { Vocab } from "../domain/types";
import { getAllCards } from "./cardRepo";
import { closeDb, getDb } from "./db";
import { deleteUserVocab, newUserId, saveUserVocab } from "./vocabRepo";

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
});

const base: Vocab = {
  id: "u1",
  de: ["Haus"],
  es: "la casa",
  pos: "noun",
  level: "A1",
  topic: "x",
  example: null,
};

describe("user vocabulary", () => {
  it("generates ids like u8k2m4qz", async () => {
    expect(await newUserId()).toMatch(/^u[0-9a-z]{8}$/);
  });

  it("stores user words with origin, no level and topic eigene, and keeps them after reload", async () => {
    const saved = await saveUserVocab(base);
    expect(saved).toMatchObject({
      origin: "user",
      level: null,
      topic: "eigene",
    });
    expect(typeof saved.createdAt).toBe("number");
    await closeDb();
    const db = await getDb();
    expect(await db.get("userVocab", "u1")).toEqual(saved);
  });

  it("keeps createdAt when a word is edited", async () => {
    const first = await saveUserVocab({ ...base, createdAt: 123 });
    const edited = await saveUserVocab({ ...first, de: ["Heim"] });
    expect(edited.createdAt).toBe(123);
  });

  it("deleting a word removes both of its cards but no others", async () => {
    await saveUserVocab(base);
    const db = await getDb();
    await db.put("cards", newCard("u1", "de-es", 0));
    await db.put("cards", newCard("u1", "es-de", 0));
    await db.put("cards", newCard("v1", "de-es", 0));
    await deleteUserVocab("u1");
    expect(await db.get("userVocab", "u1")).toBeUndefined();
    expect((await getAllCards()).map((c) => c.vocabId)).toEqual(["v1"]);
  });
});
