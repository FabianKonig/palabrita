import { describe, expect, it } from "vitest";
import type { Vocab } from "../types";
import casa from "./fixtures/casa.json";
import llama from "./fixtures/llama.json";
import poder from "./fixtures/poder.json";
import puedo from "./fixtures/puedo.json";
import unknown from "./fixtures/zzzxqwk.json";
import { findDuplicate } from "./findDuplicate";
import { parseWiktionary } from "./parseWiktionary";

const FIXTURES: Record<string, unknown> = {
  casa,
  llama,
  poder,
  puedo,
  zzzxqwk: unknown,
};

/** Real API responses saved once from de.wiktionary.org. */
function fixture(name: string): string {
  const json = FIXTURES[name] as { parse?: { wikitext: { "*": string } } };
  return json.parse?.wikitext["*"] ?? "";
}

describe("parseWiktionary", () => {
  it("casa: noun with article, gender, plural and up to 4 German words", () => {
    const r = parseWiktionary(fixture("casa"), "casa");
    expect(r.inflectedOf).toBeUndefined();
    expect(r.candidates).toHaveLength(1);
    const c = r.candidates[0];
    expect(c.pos).toBe("noun");
    expect(c.es).toBe("la casa");
    expect(c.gender).toBe("f");
    expect(c.plural).toBe("las casas");
    expect(c.de).toEqual(["Haus", "Wohnung", "Haushalt", "Heim"]);
  });

  it("poder: verb with translation and example", () => {
    const r = parseWiktionary(fixture("poder"), "poder");
    expect(r.candidates).toHaveLength(1);
    const c = r.candidates[0];
    expect(c.pos).toBe("verb");
    expect(c.es).toBe("poder");
    expect(c.de).toEqual(["können"]);
    expect(c.example).toEqual({
      es: "Puedo ayudarte a aprender a jugar al ajedrez.",
      de: "Ich kann dir helfen, Schach spielen zu lernen.",
    });
    // other languages (Catalan, Occitan) on the same page are ignored
    expect(c.de).not.toContain("dürfen");
  });

  it("puedo: inflected form points to the base form", () => {
    const r = parseWiktionary(fixture("puedo"), "puedo");
    expect(r.candidates).toEqual([]);
    expect(r.inflectedOf).toBe("poder");
  });

  it("llama: only the Spanish section counts, not Quechua", () => {
    const r = parseWiktionary(fixture("llama"), "llama");
    expect(r.candidates).toHaveLength(1);
    expect(r.candidates[0].pos).toBe("noun");
    expect(r.candidates[0].de).toEqual(["Lama"]);
  });

  it("returns several candidates for several parts of speech", () => {
    const text = [
      "== sol ({{Sprache|Spanisch}}) ==",
      "=== {{Wortart|Substantiv|Spanisch}}, {{m}} ===",
      "{{Bedeutungen}}",
      ":[1] die [[Sonne]]",
      "",
      "=== {{Wortart|Adjektiv|Spanisch}} ===",
      "{{Bedeutungen}}",
      ":[1] ''Kosename:'' [[sonnig]]",
      "",
    ].join("\n");
    const r = parseWiktionary(text, "sol");
    expect(r.candidates.map((c) => c.pos)).toEqual(["noun", "adj"]);
    expect(r.candidates[0].es).toBe("el sol");
    expect(r.candidates[0].de).toEqual(["Sonne"]);
    expect(r.candidates[1].de).toEqual(["sonnig"]);
  });

  it("unknown word: no candidates", () => {
    expect(parseWiktionary(fixture("zzzxqwk"), "zzzxqwk").candidates).toEqual(
      [],
    );
    expect(parseWiktionary("", "x")).toEqual({ candidates: [] });
  });
});

function v(id: string, es: string, pos: Vocab["pos"]): Vocab {
  return { id, es, pos, de: ["x"], level: "A1", topic: "t", example: null };
}

describe("findDuplicate", () => {
  const all = [
    v("1", "la casa", "noun"),
    v("2", "la papa", "noun"),
    v("3", "poder", "verb"),
    v("4", "el poder", "noun"),
  ];

  it("exact: same form and part of speech, article and case ignored", () => {
    expect(findDuplicate(all, "Casa", "noun").exact?.id).toBe("1");
    expect(findDuplicate(all, "el casa", "noun").exact?.id).toBe("1");
  });

  it("similar: other part of speech", () => {
    const r = findDuplicate(all, "poder", "adj");
    expect(r.exact).toBeUndefined();
    expect(r.similar.map((s) => s.id)).toEqual(["3", "4"]);
  });

  it("similar: differs only by accent (papa/papá), both ways", () => {
    expect(findDuplicate(all, "papá", "noun").similar.map((s) => s.id)).toEqual(
      ["2"],
    );
    expect(findDuplicate(all, "papá", "noun").exact).toBeUndefined();
  });

  it("nothing found", () => {
    expect(findDuplicate(all, "gato", "noun")).toEqual({ similar: [] });
  });
});
