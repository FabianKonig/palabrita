import { describe, expect, it } from "vitest";
import type { Vocab } from "../src/domain/types";
import {
  checkVerb,
  MIN_PER_TOPIC,
  validateIndex,
  validateVocab,
} from "./validateVocab";

function entry(over: Partial<Vocab> & Record<string, unknown> = {}): Vocab {
  return {
    id: "v0050",
    de: ["Haus"],
    es: "la casa",
    pos: "noun",
    level: "A1",
    topic: "begruessung",
    example: { es: "Mi casa es tu casa.", de: "Mein Haus ist dein Haus." },
    gender: "f",
    plural: "casas",
    ...over,
  } as Vocab;
}

function verb(over: Partial<Vocab> = {}): Vocab {
  return entry({
    id: "v0051",
    es: "hablar",
    de: ["sprechen"],
    pos: "verb",
    gender: null,
    plural: null,
    verb: { tags: [], reflexive: false },
    ...over,
  });
}

const run = (list: Vocab[], file = "begruessung.json") =>
  validateVocab([{ file, data: list }], { minPerTopic: 0 });

describe("index", () => {
  const keys = [
    "begruessung",
    "zahlen-zeit",
    "essen",
    "transport",
    "unterkunft",
    "einkaufen",
    "gesundheit",
    "natur",
    "orte",
    "kultur",
    "maya",
    "smalltalk",
    "grundwortschatz",
  ];
  const good = {
    topics: keys.map((key) => ({ key, label: key, file: `${key}.json` })),
  };

  it("accepts an index with every topic of the schema and matching file names", () => {
    expect(validateIndex(good)).toEqual([]);
  });

  it("rejects missing, duplicate, unknown topics and wrong file names", () => {
    expect(validateIndex({ topics: good.topics.slice(1) })).toHaveLength(1);
    expect(
      validateIndex({ topics: [...good.topics, good.topics[0]] }),
    ).toHaveLength(1);
    expect(
      validateIndex({
        topics: [
          ...good.topics,
          { key: "neu", label: "Neu", file: "neu.json" },
        ],
      }),
    ).toHaveLength(1);
    expect(
      validateIndex({
        topics: good.topics.map((t, i) => (i ? t : { ...t, file: "x.json" })),
      }),
    ).toHaveLength(1);
  });
});

describe("validateVocab", () => {
  it("accepts a correct noun and verb", () => {
    expect(run([entry(), verb()]).errors).toEqual([]);
  });

  it("schema: missing example, empty de, 5 de entries, unknown topic", () => {
    const bad = [
      { ...entry(), example: undefined },
      entry({ id: "v0052", de: [""] }),
      entry({ id: "v0053", de: ["a", "b", "c", "d", "e"] }),
      entry({ id: "v0054", topic: "nix" as never }),
      entry({ id: "v0055", de: ["a", "a"] }),
    ];
    const r = run(bad as Vocab[]);
    expect(r.errors.length).toBeGreaterThanOrEqual(5);
  });

  it("duplicate IDs and duplicate words across files", () => {
    const r = validateVocab([
      { file: "begruessung.json", data: [entry()] },
      { file: "essen.json", data: [entry({ topic: "essen" })] },
    ]);
    expect(r.errors.some((e) => e.includes("ID doppelt"))).toBe(true);
    expect(r.errors.some((e) => e.startsWith("Dublette"))).toBe(true);
  });

  it("accent-only and other-pos duplicates are warnings", () => {
    const r = run([
      entry({ id: "v0050", es: "la papa", plural: "papas" }),
      entry({
        id: "v0051",
        es: "el papá",
        gender: "m",
        plural: "papás",
        de: ["Papa"],
      }),
    ]);
    expect(r.errors).toEqual([]);
    expect(r.warnings.some((w) => w.startsWith("Ähnlich"))).toBe(true);
  });

  it("noun article must fit gender and must exist", () => {
    expect(run([entry({ gender: "m" })]).errors.join()).toMatch(
      /passt nicht zu gender/,
    );
    expect(run([entry({ es: "casa" })]).errors.join()).toMatch(/ohne Artikel/);
  });

  it("el before a feminine noun with stressed a- (el agua) is allowed", () => {
    expect(
      run([entry({ es: "el agua", plural: "las aguas", de: ["Wasser"] })])
        .errors,
    ).toEqual([]);
    expect(
      run([entry({ es: "el libro", plural: "los libros" })]).errors.join(),
    ).toMatch(/passt nicht zu gender/);
  });

  it("verb object exists exactly for verbs", () => {
    expect(run([verb({ verb: null })]).errors.join()).toMatch(
      /Verb ohne verb-Objekt/,
    );
    expect(
      run([entry({ verb: { tags: [], reflexive: false } })]).errors.join(),
    ).toMatch(/Nicht-Verb/);
  });

  it("entry must sit in the file of its topic", () => {
    expect(run([entry({ topic: "essen" })]).errors.join()).toMatch(
      /gehört nicht in/,
    );
  });

  it("a topic needs a minimum number of entries", () => {
    const few = validateVocab([{ file: "begruessung.json", data: [entry()] }]);
    expect(few.errors.join()).toMatch(/nur 1 Einträge, mindestens 10/);
    const enough = Array.from({ length: MIN_PER_TOPIC }, (_, i) =>
      entry({
        id: `v${String(i + 1).padStart(4, "0")}`,
        es: `la x${"a".repeat(i + 1)}`,
      }),
    );
    expect(
      validateVocab([{ file: "begruessung.json", data: enough }]).errors,
    ).toEqual([]);
  });
});

describe("checkVerb (SPEC §5.1)", () => {
  it("accepts poder with real tags and overrides", () => {
    const v = verb({
      es: "poder",
      verb: {
        tags: ["ue"],
        reflexive: false,
        overrides: {
          indefinido: {
            "1s": "pude",
            "2s": "pudiste",
            "3s": "pudo",
            "1p": "pudimos",
            "2p": "pudisteis",
            "3p": "pudieron",
          },
          futuro: { stem: "podr" },
          gerundio: "pudiendo",
        },
      },
    });
    expect(checkVerb(v)).toEqual([]);
  });

  it("flags a redundant override", () => {
    const v = verb({
      verb: {
        tags: [],
        reflexive: false,
        overrides: { presente: { "1s": "hablo" } },
      },
    });
    expect(checkVerb(v).join()).toMatch(/entspricht der generierten Form/);
  });

  it("accepts a real override that differs", () => {
    const v = verb({
      es: "tener",
      verb: {
        tags: ["go", "ie"],
        reflexive: false,
        overrides: { futuro: { stem: "tendr" }, imperativo: { "2s": "ten" } },
      },
    });
    expect(checkVerb(v)).toEqual([]);
  });

  it("flags tags that do not fit the stem", () => {
    expect(
      checkVerb(verb({ verb: { tags: ["ue"], reflexive: false } })).join(),
    ).toMatch(/passt nicht zum Stamm/);
    expect(
      checkVerb(verb({ verb: { tags: ["y"], reflexive: false } })).join(),
    ).toMatch(/passt nicht zum Stamm/);
    expect(
      checkVerb(
        verb({ es: "pensar", verb: { tags: ["i"], reflexive: false } }),
      ).join(),
    ).toMatch(/passt nicht zum Stamm/);
  });

  it("reflexive must match -se", () => {
    expect(
      checkVerb(
        verb({ es: "llamarse", verb: { tags: [], reflexive: false } }),
      ).join(),
    ).toMatch(/reflexive/);
    expect(
      checkVerb(verb({ es: "llamarse", verb: { tags: [], reflexive: true } })),
    ).toEqual([]);
  });

  it("irr needs overrides; imperative has no 1s", () => {
    expect(
      checkVerb(
        verb({ es: "ser", verb: { tags: ["irr"], reflexive: false } }),
      ).join(),
    ).toMatch(/irr/);
    expect(
      checkVerb(
        verb({
          verb: {
            tags: [],
            reflexive: false,
            overrides: { imperativo: { "1s": "x" } },
          },
        }),
      ).join(),
    ).toMatch(/1s/);
  });
});

describe("adj-Warnungen (SPEC §14.3)", () => {
  const adj = (es: string, extra?: Vocab["adj"], id = "v0060") =>
    entry({
      id,
      es,
      de: ["x"],
      pos: "adj",
      gender: null,
      plural: null,
      adj: extra,
    });
  const warnings = (v: Vocab) => run([v]).warnings;

  it("warnt bei -és/-ol ohne adj.f (Regel 6 wäre für Nationalitäten falsch)", () => {
    expect(warnings(adj("inglés")).join("\n")).toMatch(/inglés.*adj\.f/);
    expect(warnings(adj("español")).join("\n")).toMatch(/español.*adj\.f/);
    expect(warnings(adj("cortés", { pl: "corteses" })).join("\n")).toMatch(
      /adj\.f/,
    );
  });

  it("adj.f bestätigt die Femininform: keine Warnung, auch wenn sie der Regel gleicht", () => {
    expect(warnings(adj("cortés", { f: "cortés" }))).toEqual([]);
    expect(warnings(adj("inglés", { f: "inglesa" }))).toEqual([]);
    expect(run([adj("español", { f: "española" })]).errors).toEqual([]);
  });

  it("warnt bei überflüssigen adj-Einträgen, die der Regel gleichen", () => {
    expect(warnings(adj("rojo", { f: "roja" })).join("\n")).toMatch(
      /adj\.f "roja".*überflüssig/,
    );
    expect(warnings(adj("rojo", { pl: "rojos" })).join("\n")).toMatch(
      /adj\.pl/,
    );
    expect(warnings(adj("joven", { pl: "jóvenes" })).join("\n")).toMatch(
      /adj\.pl/,
    );
  });

  it("fpl ist überflüssig, wenn er der Ableitung aus adj.f gleicht", () => {
    expect(
      warnings(adj("inglés", { f: "inglesa", fpl: "inglesas" })).join("\n"),
    ).toMatch(/adj\.fpl "inglesas"/);
    // abweichender fpl ist gewollt
    expect(
      warnings(adj("inglés", { f: "inglesa", fpl: "inglesitas" })),
    ).toEqual([]);
  });

  it("ein abweichender Eintrag ist keine Warnung", () => {
    expect(warnings(adj("bueno", { pl: "buenazos" }))).toEqual([]);
    expect(warnings(adj("rojo"))).toEqual([]);
  });

  it("andere Wortarten werden nicht geprüft", () => {
    expect(warnings(entry())).toEqual([]);
  });
});
