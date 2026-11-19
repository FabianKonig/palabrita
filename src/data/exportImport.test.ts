import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Card } from "../domain/types";
import { closeDb, getDb } from "./db";
import {
  applyImport,
  buildExport,
  mergeCards,
  parseExport,
  SCHEMA_VERSION,
} from "./exportImport";

function card(
  vocabId: string,
  lastReviewed: number | null,
  interval = 1,
): Card {
  return {
    vocabId,
    dir: "de-es",
    due: 1000,
    interval,
    ease: 2.5,
    reps: 1,
    lapses: 0,
    lastReviewed,
    state: "learning",
  };
}

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
});

async function seed() {
  const db = await getDb();
  await db.put("settings", { ...DEFAULT_SETTINGS, maxLevel: "A2" }, "main");
  await db.put("cards", card("v1", 100, 6));
}

describe("export/import roundtrip", () => {
  it("restores everything after replace on an empty database", async () => {
    await seed();
    const text = JSON.stringify(await buildExport(0));
    await closeDb();
    globalThis.indexedDB = new IDBFactory();

    await applyImport(parseExport(text), "replace");
    const again = await buildExport(0);
    expect(again).toEqual(JSON.parse(text));
    expect(again.settings.maxLevel).toBe("A2");
  });

  it("replace removes local data that is not in the file", async () => {
    await seed();
    const file = parseExport(JSON.stringify(await buildExport(0)));
    const db = await getDb();
    await db.put("cards", card("local-only", 5));
    await applyImport(file, "replace");
    expect((await db.getAll("cards")).map((c) => c.vocabId)).toEqual(["v1"]);
  });
});

describe("merge rules", () => {
  it("cards: newer lastReviewed wins, tie keeps local, null loses", () => {
    const local = [card("a", 100, 1), card("b", 100, 1), card("c", null, 1)];
    const incoming = [
      card("a", 200, 9),
      card("b", 100, 9),
      card("c", 50, 9),
      card("d", 1, 9),
    ];
    const merged = new Map(
      mergeCards(local, incoming).map((c) => [c.vocabId, c]),
    );
    expect(merged.get("a")?.interval).toBe(9);
    expect(merged.get("b")?.interval).toBe(1);
    expect(merged.get("c")?.interval).toBe(9);
    expect(merged.get("d")?.interval).toBe(9);
    expect(merged.size).toBe(4);
  });

  it("cards: an incoming null does not beat a local value", () => {
    const merged = mergeCards([card("a", 10, 1)], [card("a", null, 9)]);
    expect(merged[0].interval).toBe(1);
  });

  it("merge keeps local settings", async () => {
    await seed();
    const file = parseExport(JSON.stringify(await buildExport(0)));
    file.settings = { ...file.settings, maxLevel: "B1", theme: "dark" };
    await applyImport(file, "merge");
    const db = await getDb();
    expect((await db.get("settings", "main"))?.maxLevel).toBe("A2");
  });
});

describe("parseExport validation", () => {
  const valid = () => ({
    schemaVersion: SCHEMA_VERSION,
    exportedAt: "x",
    settings: DEFAULT_SETTINGS,
    cards: [],
  });

  it("accepts a valid file", () => {
    expect(() => parseExport(JSON.stringify(valid()))).not.toThrow();
  });

  it("ignores the own-words list of files from older versions", () => {
    const file = parseExport(
      JSON.stringify({ ...valid(), userVocab: [{ id: "u1" }] }),
    );
    expect(file).not.toHaveProperty("userVocab");
  });

  it("accepts cards without step (review phase)", async () => {
    const file = parseExport(
      JSON.stringify({ ...valid(), cards: [card("v1", 100, 6)] }),
    );
    expect(file.cards[0].step).toBeUndefined();
    await applyImport(file, "replace");
    expect(await (await getDb()).getAll("cards")).toHaveLength(1);
  });

  it("rejects a card with an invalid step", () => {
    for (const step of [7, -1, "0", null]) {
      expect(() =>
        parseExport(
          JSON.stringify({
            ...valid(),
            cards: [{ ...card("v1", 100, 6), step }],
          }),
        ),
      ).toThrow(/Karten/);
    }
    for (const step of [0, 1]) {
      expect(() =>
        parseExport(
          JSON.stringify({
            ...valid(),
            cards: [{ ...card("v1", 100, 6), step }],
          }),
        ),
      ).not.toThrow();
    }
  });

  it("rejects broken JSON, newer versions and bad structure", () => {
    expect(() => parseExport("{")).toThrow(/JSON/);
    expect(() =>
      parseExport(JSON.stringify({ ...valid(), schemaVersion: 99 })),
    ).toThrow(/neueren/);
    expect(() =>
      parseExport(JSON.stringify({ ...valid(), cards: [{ vocabId: 1 }] })),
    ).toThrow(/Karten/);
    expect(() =>
      parseExport(JSON.stringify({ ...valid(), settings: { maxLevel: "C2" } })),
    ).toThrow(/Einstellungen/);
  });

  it("changes nothing when the file is invalid", async () => {
    await seed();
    expect(() => parseExport("[]")).toThrow();
    const db = await getDb();
    expect(await db.getAll("cards")).toHaveLength(1);
  });
});
