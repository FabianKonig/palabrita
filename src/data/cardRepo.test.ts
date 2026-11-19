import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it } from "vitest";
import { newCard, review } from "../domain/srs";
import {
  DEFAULT_SETTINGS,
  type Settings,
  type SettingsPatch,
} from "../domain/types";
import { getAllCards, saveReview } from "./cardRepo";
import { closeDb, getDb } from "./db";
import { getSettings, saveSettings } from "./settingsRepo";

const NOW = new Date(2026, 0, 15, 10, 0).getTime();

async function getCard(vocabId: string, dir: "de-es" | "es-de") {
  return (await getDb()).get("cards", [vocabId, dir]);
}

beforeEach(async () => {
  await closeDb();
  globalThis.indexedDB = new IDBFactory();
});

describe("cardRepo", () => {
  it('keeps progress across a "reload" (closed and reopened connection)', async () => {
    const reviewed = review(newCard("v0001", "de-es", NOW), "good", NOW);
    await saveReview(reviewed);

    await closeDb(); // simulates page reload: new connection, same database

    expect(await getCard("v0001", "de-es")).toEqual(reviewed);
    expect(await getCard("v0001", "es-de")).toBeUndefined();
    expect(await getAllCards()).toHaveLength(1);
  });

  it("overwrites the same card instead of duplicating it", async () => {
    const c = review(newCard("v1", "de-es", NOW), "good", NOW);
    await saveReview(c);
    await saveReview(review(c, "good", NOW));
    expect(await getAllCards()).toHaveLength(1);
  });
});

describe("settingsRepo", () => {
  const withoutSeed = ({
    orderSeed: _seed,
    startedAt: _started,
    ...rest
  }: Settings) => {
    void _seed;
    void _started;
    return rest;
  };

  it("creates defaults with seed and start time on first start and returns them again", async () => {
    const before = Date.now();
    const first = await getSettings();
    expect(withoutSeed(first)).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toMatchObject({ maxLevel: "B1" });
    expect(Number.isInteger(first.orderSeed)).toBe(true);
    expect(first.orderSeed).toBeGreaterThanOrEqual(0);
    expect(first.orderSeed).toBeLessThanOrEqual(0xffffffff);
    expect(first.startedAt).toBeGreaterThanOrEqual(before);
    expect(first.startedAt).toBeLessThanOrEqual(Date.now());
    await closeDb();
    expect(await getSettings()).toEqual(first);
  });

  it("two concurrent getSettings on an empty database give the same orderSeed", async () => {
    const [a, b] = await Promise.all([getSettings(), getSettings()]);
    expect(a.orderSeed).toBe(b.orderSeed);
    expect(a.startedAt).toBe(b.startedAt);
    expect((await getSettings()).orderSeed).toBe(a.orderSeed);
  });

  it("keeps changed settings after a reload, returns the stored record", async () => {
    const first = await getSettings();
    const saved = await saveSettings({ maxLevel: "A1" });
    expect(saved).toEqual({ ...first, maxLevel: "A1" });
    await saveSettings({ theme: "dark" });
    await closeDb();
    expect(await getSettings()).toEqual({
      ...first,
      maxLevel: "A1",
      theme: "dark",
    });
  });

  it("saveSettings keeps orderSeed and startedAt, also on an empty database", async () => {
    const saved = await saveSettings({ maxLevel: "A1" });
    expect(saved.maxLevel).toBe("A1");
    const again = await saveSettings({ theme: "light" });
    expect(again.orderSeed).toBe(saved.orderSeed);
    expect(again.startedAt).toBe(saved.startedAt);
    expect(await getSettings()).toEqual(again);
  });

  it("two concurrent saveSettings keep both changes", async () => {
    await getSettings();
    await Promise.all([
      saveSettings({ maxLevel: "A2" }),
      saveSettings({ theme: "dark" }),
    ]);
    expect(await getSettings()).toMatchObject({
      maxLevel: "A2",
      theme: "dark",
    });
  });

  it("an orderSeed or startedAt slipped into the patch at runtime is not stored", async () => {
    const first = await getSettings();
    const patch = {
      maxLevel: "A1",
      orderSeed: 42,
      startedAt: 1,
    } as unknown as SettingsPatch;
    const saved = await saveSettings(patch);
    expect(saved).toEqual({ ...first, maxLevel: "A1" });
    expect(await getSettings()).toEqual(saved);
  });

  it("deletes no cards when settings change", async () => {
    await saveReview(review(newCard("v1", "de-es", NOW), "good", NOW));
    await saveSettings({ maxLevel: "A1" });
    await saveSettings(DEFAULT_SETTINGS);
    expect(await getCard("v1", "de-es")).toBeDefined();
    expect(await getCard("v1", "es-de")).toBeUndefined();
  });
});
