import { describe, expect, it } from "vitest";
import { computeStats } from "./stats";
import type { Card, Vocab } from "./types";

function v(id: string, level: Vocab["level"]): Vocab {
  return {
    id,
    de: ["x"],
    es: id,
    pos: "noun",
    level,
    topic: "t",
    example: null,
  };
}

function c(vocabId: string, dir: Card["dir"], state: Card["state"]): Card {
  return {
    vocabId,
    dir,
    due: 0,
    interval: 1,
    ease: 2.5,
    reps: 1,
    lapses: 0,
    lastReviewed: 1,
    state,
  };
}

describe("computeStats", () => {
  const vocab = [v("a", "A1"), v("b", "A2"), v("c", "B1"), v("u", null)];

  it("counts unseen cards as new, per direction", () => {
    const s = computeStats(vocab, [c("a", "de-es", "learning")], "B1");
    expect(s["de-es"]).toEqual({ new: 3, learning: 1, mature: 0 });
    expect(s["es-de"]).toEqual({ new: 4, learning: 0, mature: 0 });
  });

  it("only counts vocabulary up to maxLevel (user words always)", () => {
    const cards = [c("c", "de-es", "mature"), c("b", "de-es", "mature")];
    const s = computeStats(vocab, cards, "A2");
    expect(s["de-es"]).toEqual({ new: 2, learning: 0, mature: 1 });
  });

  it("ignores cards of vocabulary that no longer exists", () => {
    const s = computeStats(vocab, [c("gone", "de-es", "mature")], "B1");
    expect(s["de-es"].mature).toBe(0);
  });
});
