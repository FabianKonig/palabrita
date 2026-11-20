import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { newCard, review } from "../domain/srs";
import { getAllCards, saveReview } from "./cardRepo";
import { closeDb } from "./db";
import { resetProgress } from "./progressRepo";
import { getSettings, saveSettings } from "./settingsRepo";

const NOW = new Date(2026, 0, 15, 10, 0).getTime();

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resetProgress", () => {
  it("deletes all cards of both directions", async () => {
    await saveReview(review(newCard("v1", "de-es", NOW), "good", NOW));
    await saveReview(review(newCard("v1", "es-de", NOW), "again", NOW));
    await saveReview(review(newCard("v2", "de-es", NOW), "good", NOW));
    expect(await getAllCards()).toHaveLength(3);

    await resetProgress();

    expect(await getAllCards()).toEqual([]);
  });

  it("keeps maxLevel and theme", async () => {
    await saveSettings({ maxLevel: "A2", theme: "dark" });
    const saved = await resetProgress();
    expect(saved).toMatchObject({ maxLevel: "A2", theme: "dark" });
    expect(await getSettings()).toEqual(saved);
  });

  it("starts over: new orderSeed and startedAt, stored and returned", async () => {
    const first = await getSettings();
    const newSeed = first.orderSeed === 7 ? 8 : 7;
    vi.spyOn(crypto, "getRandomValues").mockImplementation(((
      a: Uint32Array,
    ) => {
      a[0] = newSeed;
      return a;
    }) as never);
    const before = Date.now();

    const saved = await resetProgress();

    expect(saved.orderSeed).toBe(newSeed);
    expect(saved.orderSeed).not.toBe(first.orderSeed);
    expect(saved.startedAt).toBeGreaterThanOrEqual(before);
    expect(saved.startedAt).toBeLessThanOrEqual(Date.now());
    await closeDb(); // reload
    expect(await getSettings()).toEqual(saved);
  });

  it("works on an empty database (no cards, no settings yet) and creates defaults", async () => {
    const saved = await resetProgress();
    expect(saved).toMatchObject({ maxLevel: "B1", theme: "system" });
    expect(await getAllCards()).toEqual([]);
    expect(await getSettings()).toEqual(saved);
  });

  it("allows learning again afterwards: a card saved after the reset is the only one", async () => {
    await saveReview(review(newCard("v1", "de-es", NOW), "good", NOW));
    await resetProgress();
    await saveReview(review(newCard("v1", "de-es", NOW), "good", NOW));
    expect(await getAllCards()).toHaveLength(1);
  });
});
