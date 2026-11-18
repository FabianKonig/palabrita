import { describe, expect, it } from "vitest";
import bonito from "./fixtures/es-bonito.json";
import chevere from "./fixtures/es-chevere.json";
import hablar from "./fixtures/es-hablar.json";
import palabra from "./fixtures/es-palabra.json";
import puedo from "./fixtures/es-puedo.json";
import { parseEsWiktionary } from "./parseEsWiktionary";

/** Real API responses saved once from es.wiktionary.org. */
function text(json: unknown): string {
  return (json as { parse: { wikitext: { "*": string } } }).parse.wikitext["*"];
}

describe("parseEsWiktionary", () => {
  it("palabra: feminine noun with article, interjection as other, no German", () => {
    const r = parseEsWiktionary(text(palabra), "palabra");
    expect(r.candidates).toEqual([
      { pos: "noun", es: "la palabra", de: [], gender: "f" },
      { pos: "other", es: "palabra", de: [] },
    ]);
  });

  it("ignores other languages on the page (mwl section of palabra)", () => {
    const r = parseEsWiktionary(text(palabra), "palabra");
    expect(r.candidates).toHaveLength(2);
  });

  it("hablar: transitive and intransitive verb become one candidate", () => {
    const r = parseEsWiktionary(text(hablar), "hablar");
    expect(r.candidates).toEqual([{ pos: "verb", es: "hablar", de: [] }]);
  });

  it("bonito: adjective and masculine noun", () => {
    const r = parseEsWiktionary(text(bonito), "bonito");
    expect(r.candidates.map((c) => [c.pos, c.es, c.gender])).toEqual([
      ["adj", "bonito", undefined],
      ["noun", "el bonito", "m"],
    ]);
  });

  it("chévere: adjective, adverb and noun (regional word)", () => {
    const r = parseEsWiktionary(text(chevere), "chévere");
    expect(r.candidates.map((c) => c.pos)).toEqual(["adj", "adv", "noun"]);
  });

  it("puedo: inflected form points to the base verb", () => {
    const r = parseEsWiktionary(text(puedo), "puedo");
    expect(r.inflectedOf).toBe("poder");
    expect(r.candidates).toEqual([]);
  });

  it("returns nothing for pages without a Spanish section", () => {
    expect(parseEsWiktionary("", "x")).toEqual({ candidates: [] });
    expect(
      parseEsWiktionary(
        "== {{lengua|an}} ==\n=== {{sustantivo femenino|an}} ===",
        "x",
      ),
    ).toEqual({ candidates: [] });
  });
});
