import { describe, expect, it } from "vitest";
import type { Vocab } from "../src/domain/types";
import { checkVerb, validateIndex, validateVocab } from "./validateVocab";
import { TOPICS, TOTAL_TARGET, topicTotal } from "./vocabPlan";

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
  validateVocab([{ file, data: list }]);

describe("plan", () => {
  it("has 13 topics with unique, non-overlapping ID ranges and 803 entries", () => {
    expect(TOPICS).toHaveLength(13);
    expect(TOTAL_TARGET).toBe(803);
    for (let i = 1; i < TOPICS.length; i++)
      expect(TOPICS[i].idStart).toBeGreaterThan(TOPICS[i - 1].idEnd);
    expect(TOPICS[0].idStart).toBe(26);
  });

  it("level quotas add up to the topic total", () => {
    for (const t of TOPICS) {
      const levels = t.levels.A1 + t.levels.A2 + t.levels.B1;
      expect(levels, t.key).toBe(topicTotal(t));
    }
  });

  it("index must list every planned topic with its file", () => {
    const good = {
      topics: TOPICS.map((t) => ({ key: t.key, label: t.label, file: t.file })),
    };
    expect(validateIndex(good)).toEqual([]);
    expect(
      validateIndex({ topics: good.topics.slice(1) }).length,
    ).toBeGreaterThan(0);
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

  it("ID must be inside the reserved range unless it is a seed ID", () => {
    expect(run([entry({ id: "v0900" })]).errors.join()).toMatch(/außerhalb/);
    expect(run([entry({ id: "v0010" })]).errors).toEqual([]);
  });

  it("entry must sit in the file of its topic", () => {
    expect(run([entry({ topic: "essen" })]).errors.join()).toMatch(
      /gehört nicht in/,
    );
  });

  it("final mode requires the planned quantities", () => {
    const r = validateVocab([{ file: "begruessung.json", data: [entry()] }], {
      final: true,
    });
    expect(r.errors.join()).toMatch(/Plan 40/);
    expect(r.errors.join()).toMatch(/Ziel 803/);
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
