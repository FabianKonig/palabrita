import { describe, expect, it } from "vitest";
import { adjectiveFormLines, adjectiveForms, pluralOf } from "./adjectiveForms";
import type { Vocab } from "./types";

const adj = (es: string, extra?: Vocab["adj"]) =>
  adjectiveForms({ es, adj: extra });
const forms = (es: string, extra?: Vocab["adj"]) => {
  const r = adj(es, extra);
  return [r.f, r.pl, r.fpl];
};

describe("adjectiveForms: rules", () => {
  it("1. -o: -a, -os, -as", () => {
    expect(forms("rojo")).toEqual(["roja", "rojos", "rojas"]);
    expect(forms("pequeño")).toEqual(["pequeña", "pequeños", "pequeñas"]);
  });

  it("2. unstressed -e or -a: feminine unchanged, plural +s", () => {
    expect(forms("amable")).toEqual(["amable", "amables", "amables"]);
    expect(forms("maya")).toEqual(["maya", "mayas", "mayas"]);
    expect(forms("turista")).toEqual(["turista", "turistas", "turistas"]);
  });

  it("3. stressed -í/-ú: plural +es; other stressed vowels: +s", () => {
    expect(forms("iraní")).toEqual(["iraní", "iraníes", "iraníes"]);
    expect(forms("hindú")).toEqual(["hindú", "hindúes", "hindúes"]);
    expect(pluralOf("sofá")).toBe("sofás");
    expect(pluralOf("café")).toBe("cafés");
    expect(pluralOf("dominó")).toBe("dominós");
  });

  it("4. unstressed -s/-x: invariable", () => {
    expect(forms("gratis")).toEqual(["gratis", "gratis", "gratis"]);
    expect(forms("tórax")).toEqual(["tórax", "tórax", "tórax"]);
  });

  it("5. -z: -ces", () => {
    expect(forms("feliz")).toEqual(["feliz", "felices", "felices"]);
  });

  it("6. other consonants: +es, feminine unchanged", () => {
    expect(forms("azul")).toEqual(["azul", "azules", "azules"]);
    expect(forms("popular")).toEqual(["popular", "populares", "populares"]);
    expect(forms("fácil")).toEqual(["fácil", "fáciles", "fáciles"]);
    expect(forms("débil")).toEqual(["débil", "débiles", "débiles"]);
    expect(forms("joven")).toEqual(["joven", "jóvenes", "jóvenes"]);
  });

  it("6. -ón, -án, -ín, -or: feminine +a", () => {
    expect(forms("trabajador")).toEqual([
      "trabajadora",
      "trabajadores",
      "trabajadoras",
    ]);
    expect(forms("llorón")).toEqual(["llorona", "llorones", "lloronas"]);
    expect(forms("alemán")).toEqual(["alemana", "alemanes", "alemanas"]);
    expect(forms("pequeñín")).toEqual([
      "pequeñina",
      "pequeñines",
      "pequeñinas",
    ]);
  });

  it("6. comparatives on -or are invariable in gender", () => {
    for (const w of ["mejor", "peor", "mayor", "menor", "anterior", "interior"])
      expect(adj(w).f).toBe(w);
    expect(forms("mejor")).toEqual(["mejor", "mejores", "mejores"]);
    expect(forms("mayor")).toEqual(["mayor", "mayores", "mayores"]);
  });

  it("stressed -s keeps its plural +es and loses the accent", () => {
    expect(forms("cortés")).toEqual(["cortés", "corteses", "corteses"]);
    expect(pluralOf("inglés")).toBe("ingleses");
    expect(pluralOf("país")).toBe("países");
  });

  it("sets and removes written accents with the stress staying on one vowel", () => {
    expect(forms("último")).toEqual(["última", "últimos", "últimas"]);
    expect(forms("frío")).toEqual(["fría", "fríos", "frías"]);
    expect(forms("alérgico")).toEqual(["alérgica", "alérgicos", "alérgicas"]);
    expect(forms("céntrico")).toEqual(["céntrica", "céntricos", "céntricas"]);
  });
});

describe("adjectiveForms: overrides from adj", () => {
  it("every field set replaces the generated form", () => {
    expect(forms("español", { f: "española" })).toEqual([
      "española",
      "españoles",
      "españolas",
    ]);
    expect(forms("rojo", { pl: "x", f: "y", fpl: "z" })).toEqual([
      "y",
      "x",
      "z",
    ]);
  });

  it("derives f. Pl. from adj.f when only f is set", () => {
    expect(forms("inglés", { f: "inglesa" })).toEqual([
      "inglesa",
      "ingleses",
      "inglesas",
    ]);
    expect(adj("cortés", { f: "cortés" }).fpl).toBe("corteses");
  });

  it("a set fpl wins over the derivation", () => {
    expect(adj("inglés", { f: "inglesa", fpl: "inglesitas" }).fpl).toBe(
      "inglesitas",
    );
  });

  it("without adj it works as before", () => {
    expect(adj("rojo", null)).toEqual(adj("rojo"));
  });
});

describe("adjectiveFormLines (Zeile „Formen“ der Detailseite)", () => {
  const lines = (es: string, extra?: Vocab["adj"]) =>
    adjectiveFormLines({ es, adj: extra }).map((l) => `${l.label} ${l.form}`);

  it("zeigt alle erzeugten Formen, auch ohne adj", () => {
    expect(lines("rojo")).toEqual([
      "feminin roja",
      "Plural rojos",
      "feminin Plural rojas",
    ]);
  });

  it("lässt Formen weg, die der Grundform gleichen", () => {
    expect(lines("azul")).toEqual(["Plural azules"]);
    expect(lines("amable")).toEqual(["Plural amables"]);
  });

  it("unveränderliche Adjektive haben keine Zeile", () => {
    expect(lines("gratis")).toEqual([]);
  });

  it("fasst m. und f. Plural zusammen, wenn sie gleich sind", () => {
    expect(adjectiveFormLines({ es: "azul" })[0].keys).toEqual(["pl", "fpl"]);
    expect(adjectiveFormLines({ es: "rojo" })[1].keys).toEqual(["pl"]);
  });
});
