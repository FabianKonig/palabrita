import { describe, expect, it } from "vitest";
import {
  clearCriterion,
  clearDropdownFilters,
  EMPTY_FILTERS,
  hasDropdownFilter,
  matchesQuery,
  normalizeForSearch,
  searchVocab as searchRows,
  topicOptions,
  type DictionaryFilters,
} from "./dictionary";
import { buildFormIndex } from "./forms";
import type { Vocab } from "./types";

function v(partial: Partial<Vocab> & Pick<Vocab, "id" | "es">): Vocab {
  return {
    de: ["x"],
    pos: "noun",
    level: "A1",
    topic: "essen",
    added: "2026-11-19",
    example: { es: "Ejemplo.", de: "Beispiel." },
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
];

const ids = (list: Vocab[]) => list.map((x) => x.id);

/** Plain search (headword and German): the vocab of the rows, form hits are tested in forms.test.ts. */
const searchVocab = (list: Vocab[], filters: DictionaryFilters) =>
  searchRows(list, filters, buildFormIndex(list)).map((r) => r.vocab);

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
  it("shows all levels, the maximum level does not matter", () => {
    expect(ids(searchVocab(VOCAB, EMPTY_FILTERS))).toHaveLength(4);
    expect(
      ids(searchVocab(VOCAB, { ...EMPTY_FILTERS, query: "poder" })),
    ).toEqual(["3"]);
  });

  it("sorts by Spanish headword without article, ignoring input order", () => {
    const sorted = ids(searchVocab([...VOCAB].reverse(), EMPTY_FILTERS));
    expect(sorted).toEqual(["1", "2", "4", "3"]);
  });

  it("sorts el/la words by the word after the article", () => {
    const list = [
      v({ id: "a", es: "el/la turista", gender: "m/f" }),
      v({ id: "b", es: "la casa" }),
      v({ id: "c", es: "el/la estudiante", gender: "m/f" }),
    ];
    expect(ids(searchVocab(list, EMPTY_FILTERS))).toEqual(["b", "c", "a"]);
  });

  it("filters by topic, level and pos", () => {
    const f = EMPTY_FILTERS;
    expect(ids(searchVocab(VOCAB, { ...f, topic: "essen" }))).toEqual([
      "1",
      "4",
    ]);
    expect(ids(searchVocab(VOCAB, { ...f, level: "A2" }))).toEqual(["3"]);
    expect(ids(searchVocab(VOCAB, { ...f, pos: "verb" }))).toEqual(["3"]);
  });

  it("searches inside the filtered list (search and filters combine)", () => {
    // "a" matches "la casa" (2) and "el pasado" (4); level B1 leaves only "el pasado"
    expect(
      ids(searchVocab(VOCAB, { ...EMPTY_FILTERS, query: "a", level: "B1" })),
    ).toEqual(["4"]);
    expect(
      ids(
        searchVocab(VOCAB, {
          ...EMPTY_FILTERS,
          query: "a",
          topic: "unterkunft",
        }),
      ),
    ).toEqual(["2"]);
    // "können" is a verb, so a noun filter leaves nothing
    expect(
      ids(
        searchVocab(VOCAB, { ...EMPTY_FILTERS, query: "können", pos: "noun" }),
      ),
    ).toEqual([]);
    expect(
      ids(
        searchVocab(VOCAB, { ...EMPTY_FILTERS, query: "können", pos: "verb" }),
      ),
    ).toEqual(["3"]);
  });

  it("finds words above any level via the German translation", () => {
    const r = searchVocab(VOCAB, { ...EMPTY_FILTERS, query: "vergangen" });
    expect(ids(r)).toEqual(["4"]);
  });
});

describe("searchVocab ranking", () => {
  const list = [
    v({ id: "contains", es: "el coche cama", de: ["Mietauto"] }),
    v({ id: "starts", es: "la autopista", de: ["Autobahn"] }),
    v({ id: "equal", es: "el carro", de: ["Auto", "Wagen"] }),
    v({ id: "esEqual", es: "auto", de: ["selbst"] }),
    v({ id: "esArticle", es: "el auto", de: ["Wagen"] }),
  ];
  const rank = (q: string) =>
    ids(searchVocab(list, { ...EMPTY_FILTERS, query: q }));

  it("whole entry before prefix before substring", () => {
    expect(rank("auto")).toEqual([
      "esEqual",
      "esArticle",
      "equal",
      "starts",
      "contains",
    ]);
  });

  it("a Spanish equal match beats a German equal match on the same rank", () => {
    expect(rank("auto").indexOf("esEqual")).toBeLessThan(
      rank("auto").indexOf("equal"),
    );
  });

  it("ties are alphabetical by headword without article", () => {
    const t = [
      v({ id: "z", es: "la zeta", de: ["Test"] }),
      v({ id: "a", es: "el alfa", de: ["Test"] }),
    ];
    expect(ids(searchVocab(t, { ...EMPTY_FILTERS, query: "test" }))).toEqual([
      "a",
      "z",
    ]);
  });

  it("without a search text it stays alphabetical", () => {
    expect(ids(searchVocab(list, EMPTY_FILTERS))).toEqual([
      "esEqual",
      "esArticle",
      "starts",
      "equal",
      "contains",
    ]);
  });
});

describe("topicOptions", () => {
  const topics = [
    { key: "begruessung", label: "Begrüßung" },
    { key: "essen", label: "Essen" },
    { key: "grundwortschatz", label: "Grundwortschatz (häufigste Wörter)" },
  ];

  it("puts Grundwortschatz first, then the other topics in order", () => {
    expect(topicOptions(topics).map(([key]) => key)).toEqual([
      "grundwortschatz",
      "begruessung",
      "essen",
    ]);
  });

  it("keeps the labels", () => {
    expect(topicOptions(topics)[0]).toEqual([
      "grundwortschatz",
      "Grundwortschatz (häufigste Wörter)",
    ]);
  });

  it("works without a Grundwortschatz topic", () => {
    expect(topicOptions([topics[0]]).map(([key]) => key)).toEqual([
      "begruessung",
    ]);
  });
});

describe("dropdown helpers", () => {
  it("clears only topic, level and pos and keeps the search text", () => {
    const f = {
      query: "casa",
      topic: "essen",
      level: "A2",
      pos: "verb",
    } as const;
    expect(clearDropdownFilters({ ...f })).toEqual({
      query: "casa",
      topic: "",
      level: "",
      pos: "",
    });
  });

  it("removes exactly one criterion and keeps the others", () => {
    const all: DictionaryFilters = {
      query: "casa",
      topic: "comida",
      level: "A1",
      pos: "noun",
    };
    expect(clearCriterion(all, "level")).toEqual({ ...all, level: "" });
    expect(clearCriterion(all, "topic")).toEqual({ ...all, topic: "" });
    expect(clearCriterion(all, "pos")).toEqual({ ...all, pos: "" });
    expect(clearCriterion(all, "query")).toEqual({ ...all, query: "" });
    expect(
      clearCriterion({ ...EMPTY_FILTERS, query: "casa" }, "query"),
    ).toEqual(EMPTY_FILTERS);
  });

  it("knows whether a dropdown filter is set (search text does not count)", () => {
    expect(hasDropdownFilter(EMPTY_FILTERS)).toBe(false);
    expect(hasDropdownFilter({ ...EMPTY_FILTERS, query: "casa" })).toBe(false);
    expect(hasDropdownFilter({ ...EMPTY_FILTERS, pos: "noun" })).toBe(true);
  });
});
