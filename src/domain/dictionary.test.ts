import { describe, expect, it } from "vitest";
import {
  changeFilter,
  EMPTY_FILTERS,
  findExisting,
  matchesQuery,
  normalizeForSearch,
  searchVocab,
  topicOptions,
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
  it("shows all levels, the maximum level does not matter", () => {
    expect(ids(searchVocab(VOCAB, EMPTY_FILTERS))).toHaveLength(5);
    expect(
      ids(searchVocab(VOCAB, { ...EMPTY_FILTERS, query: "poder" })),
    ).toEqual(["3"]);
  });

  it("sorts by Spanish headword without article, ignoring input order", () => {
    const sorted = ids(searchVocab([...VOCAB].reverse(), EMPTY_FILTERS));
    expect(sorted).toEqual(["1", "2", "5", "4", "3"]);
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

  it("a concrete level filter excludes user words (level null)", () => {
    const r = searchVocab(VOCAB, { ...EMPTY_FILTERS, level: "A1" });
    expect(ids(r)).not.toContain("5");
  });

  it("ignores the filters while a search text is set", () => {
    const r = searchVocab(VOCAB, {
      ...EMPTY_FILTERS,
      query: "können",
      pos: "noun",
      topic: "essen",
      level: "B1",
    });
    expect(ids(r)).toEqual(["3"]);
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

describe("findExisting", () => {
  const list = [
    v({ id: "1", es: "el coche", de: ["Auto", "Wagen"], level: "B1" }),
    v({ id: "2", es: "la autopista", de: ["Autobahn"] }),
    v({
      id: "3",
      es: "mi palabra",
      de: ["Wort"],
      level: null,
      topic: "eigene",
    }),
  ];

  it("finds German input, including words above any level, with the matching de entry", () => {
    const r = findExisting(list, "Auto");
    expect(r.total).toBe(2);
    expect(r.items.map((h) => h.vocab.id)).toEqual(["1", "2"]);
    expect(r.items[0].viaDe).toBe("Auto");
    expect(r.items[1].viaDe).toBeUndefined(); // "autopista" matches via es
  });

  it("finds Spanish input without viaDe", () => {
    const r = findExisting(list, "palabra");
    expect(r.items).toEqual([{ vocab: list[2], viaDe: undefined }]);
  });

  it("is accent and umlaut insensitive", () => {
    expect(findExisting(list, "COCHE").total).toBe(1);
    expect(
      findExisting([v({ id: "u", es: "sobre", de: ["über"] })], "uber").total,
    ).toBe(1);
  });

  it("returns nothing for input shorter than 2 characters", () => {
    expect(findExisting(list, "a")).toEqual({ items: [], total: 0 });
    expect(findExisting(list, "  ")).toEqual({ items: [], total: 0 });
  });

  it("limits the items but reports the total", () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      v({ id: String(i), es: "casa" + i, de: ["Haus"] }),
    );
    const r = findExisting(many, "haus", 5);
    expect(r.items).toHaveLength(5);
    expect(r.total).toBe(8);
  });

  it("no match, no items", () => {
    expect(findExisting(list, "xyz")).toEqual({ items: [], total: 0 });
  });
});

describe("topicOptions", () => {
  const topics = [
    { key: "begruessung", label: "Begrüßung" },
    { key: "essen", label: "Essen" },
    { key: "grundwortschatz", label: "Grundwortschatz (häufigste Wörter)" },
  ];

  it("puts Grundwortschatz first, then the other topics, own words last", () => {
    expect(topicOptions(topics).map(([key]) => key)).toEqual([
      "grundwortschatz",
      "begruessung",
      "essen",
      "eigene",
    ]);
  });

  it("keeps the labels", () => {
    expect(topicOptions(topics)[0]).toEqual([
      "grundwortschatz",
      "Grundwortschatz (häufigste Wörter)",
    ]);
    expect(topicOptions(topics).at(-1)).toEqual(["eigene", "Eigene Wörter"]);
  });

  it("works without a Grundwortschatz topic", () => {
    expect(topicOptions([topics[0]]).map(([key]) => key)).toEqual([
      "begruessung",
      "eigene",
    ]);
  });
});

describe("changeFilter", () => {
  it("typing a search text resets all filters", () => {
    const f = {
      ...EMPTY_FILTERS,
      topic: "essen",
      level: "A2",
      pos: "verb",
    } as const;
    expect(changeFilter(f, "query", "casa")).toEqual({
      query: "casa",
      topic: "",
      level: "",
      pos: "",
    });
  });

  it("choosing a filter clears the search text", () => {
    const f = { ...EMPTY_FILTERS, query: "casa" };
    expect(changeFilter(f, "level", "A1")).toMatchObject({
      query: "",
      level: "A1",
    });
    expect(changeFilter(f, "topic", "essen")).toMatchObject({
      query: "",
      topic: "essen",
    });
    expect(changeFilter(f, "pos", "noun")).toMatchObject({
      query: "",
      pos: "noun",
    });
  });

  it("setting a filter back to all keeps the search text; blank text keeps the filters", () => {
    const f = { ...EMPTY_FILTERS, query: "casa", level: "" as const };
    expect(changeFilter(f, "pos", "")).toMatchObject({ query: "casa" });
    const g = { ...EMPTY_FILTERS, topic: "essen" };
    expect(changeFilter(g, "query", "  ")).toMatchObject({ topic: "essen" });
  });
});
