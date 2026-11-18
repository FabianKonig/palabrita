import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  matchesQuery,
  normalizeForSearch,
  searchVocab,
} from "./dictionary";
import type { Vocab } from "./types";

function v(partial: Partial<Vocab> & Pick<Vocab, "id" | "es">): Vocab {
  return {
    de: ["x"],
    pos: "noun",
    level: "A1",
    topic: "essen",
    example: null,
    ...partial,
  };
}

const VOCAB: Vocab[] = [
  v({ id: "1", es: "el café", de: ["Kaffee", "Café"], topic: "essen" }),
  v({ id: "2", es: "la casa", de: ["Haus"], topic: "unterkunft" }),
  v({
    id: "3",
    es: "poder",
    de: ["können"],
    pos: "verb",
    level: "A2",
    topic: "smalltalk",
    verb: { tags: ["ue"], reflexive: false },
  }),
  v({ id: "4", es: "el pasado", de: ["Vergangenheit"], level: "B1" }),
  v({ id: "5", es: "mi palabra", de: ["Wort"], level: null, topic: "eigene" }),
];

const ids = (list: Vocab[]) => list.map((x) => x.id);

describe("normalizeForSearch", () => {
  it("ignores case, accents and umlauts", () => {
    expect(normalizeForSearch("  CAFÉ ")).toBe("cafe");
    expect(normalizeForSearch("Über")).toBe("uber");
  });
});

describe("matchesQuery", () => {
  it("matches es and every de entry, accent-insensitive", () => {
    const cafe = VOCAB[0];
    expect(matchesQuery(cafe, "cafe")).toBe(true);
    expect(matchesQuery(cafe, "kaff")).toBe(true);
    expect(matchesQuery(cafe, "café")).toBe(true); // second de entry
    expect(matchesQuery(cafe, "tee")).toBe(false);
  });
  it("empty query matches everything", () => {
    expect(matchesQuery(VOCAB[0], "  ")).toBe(true);
  });
});

describe("searchVocab", () => {
  it("hides vocab above maxLevel but always shows user words", () => {
    expect(ids(searchVocab(VOCAB, "A1", EMPTY_FILTERS))).toEqual([
      "1",
      "2",
      "5",
    ]);
    expect(ids(searchVocab(VOCAB, "B1", EMPTY_FILTERS))).toHaveLength(5);
  });

  it("sorts by Spanish headword without article, ignoring input order", () => {
    const sorted = ids(searchVocab([...VOCAB].reverse(), "B1", EMPTY_FILTERS));
    expect(sorted).toEqual(["1", "2", "5", "4", "3"]);
  });

  it("filters by topic, level and pos", () => {
    const f = EMPTY_FILTERS;
    expect(ids(searchVocab(VOCAB, "B1", { ...f, topic: "essen" }))).toEqual([
      "1",
      "4",
    ]);
    expect(ids(searchVocab(VOCAB, "B1", { ...f, level: "A2" }))).toEqual(["3"]);
    expect(ids(searchVocab(VOCAB, "B1", { ...f, pos: "verb" }))).toEqual(["3"]);
  });

  it("a concrete level filter excludes user words (level null)", () => {
    const r = searchVocab(VOCAB, "B1", { ...EMPTY_FILTERS, level: "A1" });
    expect(ids(r)).not.toContain("5");
  });

  it("combines query and filters", () => {
    const r = searchVocab(VOCAB, "B1", {
      ...EMPTY_FILTERS,
      query: "können",
      pos: "verb",
    });
    expect(ids(r)).toEqual(["3"]);
  });

  it("does not search words hidden by maxLevel", () => {
    const r = searchVocab(VOCAB, "A1", { ...EMPTY_FILTERS, query: "poder" });
    expect(r).toEqual([]);
  });
});
