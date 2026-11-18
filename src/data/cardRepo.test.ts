import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { dayKey } from "../domain/day";
import { newCard, review } from "../domain/srs";
import { DEFAULT_SETTINGS } from "../domain/types";
import { getAllCards, getCard, saveReview } from "./cardRepo";
import { closeDb } from "./db";
import { getSettings, saveSettings } from "./settingsRepo";
import { computeStreak, getDaily, getStreak } from "./statsRepo";

const NOW = new Date(2026, 0, 15, 10, 0).getTime();

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
});

describe("cardRepo", () => {
  it('keeps progress across a "reload" (closed and reopened connection)', async () => {
    const reviewed = review(newCard("v0001", "de-es", NOW), "good", NOW);
    await saveReview(reviewed, true, dayKey(NOW));

    await closeDb(); // simulates page reload: new connection, same database

    expect(await getCard("v0001", "de-es")).toEqual(reviewed);
    expect(await getCard("v0001", "es-de")).toBeUndefined();
    expect(await getAllCards()).toHaveLength(1);
  });

  it("counts reviewed and newIntroduced per day", async () => {
    const c = review(newCard("v1", "de-es", NOW), "good", NOW);
    await saveReview(c, true, "2026-01-15");
    await saveReview(review(c, "good", NOW), false, "2026-01-15");
    expect(await getDaily("2026-01-15")).toEqual({
      dayKey: "2026-01-15",
      newIntroduced: 1,
      reviewed: 2,
    });
  });

  it("overwrites the same card instead of duplicating it", async () => {
    const c = review(newCard("v1", "de-es", NOW), "good", NOW);
    await saveReview(c, true, "2026-01-15");
    await saveReview(review(c, "good", NOW), false, "2026-01-15");
    expect(await getAllCards()).toHaveLength(1);
  });
});

describe("settingsRepo", () => {
  it("creates defaults on first start and returns them again afterwards", async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toMatchObject({ maxLevel: "B1" });
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps changed settings after a reload", async () => {
    const changed = {
      maxLevel: "A1" as const,
      autoSpeak: true,
      direction: "es-de" as const,
      theme: "dark" as const,
    };
    await saveSettings(changed);
    await closeDb();
    expect(await getSettings()).toEqual(changed);
  });

  it("deletes no cards when settings change; directions stay separate", async () => {
    await saveReview(
      review(newCard("v1", "de-es", NOW), "good", NOW),
      true,
      dayKey(NOW),
    );
    await saveSettings({
      ...DEFAULT_SETTINGS,
      maxLevel: "A1",
      direction: "es-de",
    });
    await saveSettings({ ...DEFAULT_SETTINGS, direction: "both" });
    expect(await getCard("v1", "de-es")).toBeDefined();
    expect(await getCard("v1", "es-de")).toBeUndefined();
  });
});

describe("streak", () => {
  it("counts from today when today was learned", () => {
    const days = new Set([
      "2026-01-15",
      "2026-01-14",
      "2026-01-13",
      "2026-01-10",
    ]);
    expect(computeStreak(days, NOW)).toBe(3);
  });

  it("counts from yesterday when today is not learned yet", () => {
    expect(computeStreak(new Set(["2026-01-14", "2026-01-13"]), NOW)).toBe(2);
  });

  it("is 0 when yesterday was missed too", () => {
    expect(computeStreak(new Set(["2026-01-13"]), NOW)).toBe(0);
  });

  it("uses the 04:00 day rule", () => {
    const at0330 = new Date(2026, 0, 15, 3, 30).getTime(); // still the 14th
    expect(computeStreak(new Set(["2026-01-14"]), at0330)).toBe(1);
  });

  it("reads reviewed days from the database", async () => {
    await saveReview(
      review(newCard("v1", "de-es", NOW), "good", NOW),
      true,
      "2026-01-14",
    );
    await saveReview(
      review(newCard("v2", "de-es", NOW), "good", NOW),
      true,
      "2026-01-15",
    );
    expect(await getStreak(NOW)).toBe(2);
  });
});
