import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, type Card, type Vocab } from "../domain/types";
import { closeDb, getDb } from "./db";
import {
  applyImport,
  buildExport,
  mergeCards,
  mergeDaily,
  mergeUserVocab,
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

function word(id: string, createdAt: number, es = id): Vocab {
  return {
    id,
    de: ["x"],
    es,
    pos: "noun",
    level: null,
    topic: "eigene",
    origin: "user",
    createdAt,
    example: null,
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
  await db.put("daily", {
    dayKey: "2026-01-15",
    newIntroduced: 2,
    reviewed: 5,
  });
  await db.put("userVocab", word("u1", 10));
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
    expect(again.userVocab).toHaveLength(1);
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

  it("daily: maximum per counter and day", () => {
    const merged = mergeDaily(
      [{ dayKey: "d1", newIntroduced: 5, reviewed: 1 }],
      [
        { dayKey: "d1", newIntroduced: 2, reviewed: 7 },
        { dayKey: "d2", newIntroduced: 1, reviewed: 1 },
      ],
    );
    expect(merged.find((d) => d.dayKey === "d1")).toEqual({
      dayKey: "d1",
      newIntroduced: 5,
      reviewed: 7,
    });
    expect(merged).toHaveLength(2);
  });

  it("userVocab: larger createdAt wins, tie keeps local", () => {
    const merged = mergeUserVocab(
      [word("a", 10, "local"), word("b", 10, "local")],
      [word("a", 20, "new"), word("b", 10, "other"), word("c", 1)],
    );
    const by = new Map(merged.map((v) => [v.id, v.es]));
    expect(by.get("a")).toBe("new");
    expect(by.get("b")).toBe("local");
    expect(by.has("c")).toBe(true);
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
    daily: [],
    userVocab: [],
  });

  it("accepts a valid file", () => {
    expect(() => parseExport(JSON.stringify(valid()))).not.toThrow();
  });

  it("imports an old file with newPerDay, direction and cards without step", async () => {
    const old = {
      ...valid(),
      settings: { ...DEFAULT_SETTINGS, newPerDay: 25, direction: "es-de" },
      cards: [card("v1", 100, 6)],
    };
    const file = parseExport(JSON.stringify(old));
    expect(file.settings).not.toHaveProperty("newPerDay");
    expect(file.settings).not.toHaveProperty("direction");
    expect(file.cards[0].step).toBeUndefined();
    await applyImport(file, "replace");
    const db = await getDb();
    expect(await db.getAll("cards")).toHaveLength(1);
    expect(await db.get("settings", "main")).not.toHaveProperty("newPerDay");
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
