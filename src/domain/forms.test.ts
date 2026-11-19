import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  searchVocab,
  type DictionaryFilters,
  type SearchRow,
} from "./dictionary";
import {
  buildFormIndex,
  cachedFormIndex,
  formLabel,
  hasSlot,
  type FormSlot,
} from "./forms";
import type { Vocab } from "./types";

const dir = join(process.cwd(), "public/vocab");
const REAL: Vocab[] = readdirSync(dir)
  .filter((f) => f.endsWith(".json") && f !== "index.json")
  .flatMap((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as Vocab[]);
const REAL_INDEX = buildFormIndex(REAL);

const search = (query: string, filters: Partial<DictionaryFilters> = {}) =>
  searchVocab(REAL, { ...EMPTY_FILTERS, ...filters, query }, REAL_INDEX);
const names = (rows: SearchRow[]) => rows.map((r) => r.vocab.es);
const row = (rows: SearchRow[], es: string) =>
  rows.find((r) => r.vocab.es === es);

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
const verb = (id: string, es: string, extra: Partial<Vocab["verb"]> = {}) =>
  v({
    id,
    es,
    pos: "verb",
    verb: { tags: [], reflexive: es.endsWith("se"), ...extra },
  });
const own = (
  vocab: Vocab[],
  query: string,
  f: Partial<DictionaryFilters> = {},
) =>
  searchVocab(vocab, { ...EMPTY_FILTERS, ...f, query }, buildFormIndex(vocab));

describe("Soll-Beispiele aus SPEC §3.3a (echte Vokabeln)", () => {
  it("podemos → poder, 1. Pl. Presente", () => {
    const rows = search("podemos");
    expect(names(rows)).toEqual(["poder"]);
    expect(rows[0].form).toMatchObject({
      form: "podemos",
      label: "1. Pl. Presente",
      more: 0,
    });
  });

  it("vamos → ir (zwei Stellen) und irse, je eine Zeile", () => {
    const rows = search("vamos");
    expect(names(rows)).toEqual(["ir", "irse"]);
    expect(rows[0].form?.label).toBe("1. Pl. Presente · 1. Pl. Imperativo");
    expect(rows[0].form?.highlight).toHaveLength(2);
    expect(rows[1].form?.label).toBe("1. Pl. Presente");
  });

  it("fue → ser, ir, irse vor fuerte (normaler Treffer)", () => {
    const rows = search("fue");
    expect(names(rows).slice(0, 3).sort()).toEqual(["ir", "irse", "ser"]);
    for (const r of rows.slice(0, 3))
      expect(r.form?.label).toBe("3. Sg. Pretérito indefinido");
    expect(names(rows).indexOf("fuerte")).toBeGreaterThan(2);
    expect(row(rows, "fuerte")?.form).toBeUndefined();
  });

  it("va → ir und irse", () => {
    const rows = search("va");
    expect(names(rows).slice(0, 2)).toEqual(["ir", "irse"]);
    expect(rows[0].form?.label).toBe("3. Sg. Presente");
    expect(rows[1].form?.label).toBe("3. Sg. Presente");
  });

  it("ve → ir (2. Sg. Imperativo), ver vor convertir und vender", () => {
    const rows = search("ve");
    expect(row(rows, "ir")?.form?.label).toBe("2. Sg. Imperativo");
    expect(row(rows, "ver")?.form?.label).toBe(
      "3. Sg. Presente · 2. Sg. Imperativo",
    );
    const list = names(rows);
    expect(list.indexOf("ver")).toBeLessThan(list.indexOf("convertir"));
    expect(list.indexOf("ver")).toBeLessThan(list.indexOf("vender"));
  });

  it("es → ser als erste Zeile", () => {
    const rows = search("es");
    expect(names(rows)[0]).toBe("ser");
    expect(rows[0].form?.label).toBe("3. Sg. Presente");
  });

  it("podia → poder, 1./3. Sg. Imperfecto", () => {
    const [r] = search("podia");
    expect(r.vocab.es).toBe("poder");
    expect(r.form).toMatchObject({
      form: "podía",
      label: "1./3. Sg. Imperfecto",
    });
  });

  it("come → comer (Formtreffer, die Grundform beginnt nur damit)", () => {
    const [r] = search("come");
    expect(r.vocab.es).toBe("comer");
    expect(r.form?.label).toBe("3. Sg. Presente · 2. Sg. Imperativo");
  });

  it("pod → poder ist ein normaler Treffer (F = G)", () => {
    const [r] = search("pod");
    expect(r.vocab.es).toBe("poder");
    expect(r.form).toBeUndefined();
  });

  it("pued → puedo + 5 weitere Formen, alle Formen mit diesem Anfang hervorgehoben", () => {
    const r = row(search("pued"), "poder");
    expect(r?.form).toMatchObject({
      form: "puedo",
      label: "1. Sg. Presente",
      more: 5,
    });
    const forms = r?.form?.highlight.map((s) =>
      s.kind === "verb" && "person" in s ? `${s.tense}.${s.person}` : s.kind,
    );
    expect(forms).toEqual([
      "presente.1s",
      "presente.2s",
      "presente.3s",
      "presente.3p",
      "imperativo.2s",
      "imperativo.3s",
      "imperativo.3p",
    ]);
  });

  it("levanto / levantó → levantarse, je +1 weitere Form", () => {
    const [a] = search("levanto");
    expect(a.vocab.es).toBe("levantarse");
    expect(a.form).toMatchObject({
      form: "levanto",
      label: "1. Sg. Presente",
      more: 1,
    });
    expect(a.form?.highlight).toHaveLength(2);
    const [b] = search("levantó");
    expect(b.form).toMatchObject({
      form: "levantó",
      label: "3. Sg. Pretérito indefinido",
      more: 1,
    });
  });

  it("levantate findet den Imperativ mit angehängtem Pronomen", () => {
    const [r] = search("levantate");
    expect(r.vocab.es).toBe("levantarse");
    expect(r.form).toMatchObject({
      form: "levántate",
      label: "2. Sg. Imperativo",
    });
  });

  it("me levanto ist kein Formtreffer", () => {
    expect(search("me levanto")).toEqual([]);
  });

  it("compre zeigt compre, compré zeigt compré (je + 1 weitere Form)", () => {
    const [a] = search("compre");
    expect(a.vocab.es).toBe("comprar");
    expect(a.form).toMatchObject({
      form: "compre",
      label: "3. Sg. Imperativo",
      more: 1,
    });
    const [b] = search("compré");
    expect(b.form).toMatchObject({
      form: "compré",
      label: "1. Sg. Pretérito indefinido",
      more: 1,
    });
    expect(search("COMPRÉ")[0].form?.form).toBe("compré");
  });

  it("canciones → la canción, Plural", () => {
    const [r] = search("canciones");
    expect(r.vocab.es).toBe("la canción");
    expect(r.form).toMatchObject({ form: "canciones", label: "Plural" });
    expect(search("cancion")[0].form).toBeUndefined();
  });

  it("fines de und fines de semana → el fin de semana (Leerzeichen sind Zeichen)", () => {
    for (const q of ["fines de", "fines de semana"]) {
      const [r] = search(q);
      expect(r.vocab.es).toBe("el fin de semana");
      expect(r.form).toMatchObject({
        form: "fines de semana",
        label: "Plural",
      });
    }
  });

  it("buenas → bueno, f. Pl.; amables → amable, Pl.", () => {
    const rows = search("buenas");
    expect(rows[0].vocab.es).toBe("bueno");
    expect(rows[0].form?.label).toBe("f. Pl.");
    const [r] = search("amables");
    expect(r.vocab.es).toBe("amable");
    expect(r.form?.label).toBe("Pl.");
  });

  it("pu (2 Zeichen) und v (1 Zeichen) liefern keine Formtreffer", () => {
    expect(search("pu").every((r) => !r.form)).toBe(true);
    expect(search("v").every((r) => !r.form)).toBe(true);
  });

  it("ignoriert Akzente, Groß-/Kleinschreibung und Umlaute der Eingabe", () => {
    expect(search("PODÍA")[0].form?.form).toBe("podía");
    expect(search("  podemos ")[0].vocab.es).toBe("poder");
  });
});

describe("Mindestlängen und F < G", () => {
  const list = [
    verb("1", "pedir", { tags: ["i"] }), // pido, pides, pide …
    verb("2", "hablar", { overrides: { presente: { "1s": "pi" } } }),
  ];

  it("1 Zeichen: keine Formtreffer", () => {
    expect(own(list, "p").filter((r) => r.form)).toEqual([]);
  });

  it("2 Zeichen: nur Formen, die gleich der Eingabe sind", () => {
    const rows = own(list, "pi");
    expect(rows.map((r) => r.vocab.es)).toEqual(["hablar"]); // pido (Anfang) zählt nicht
    expect(rows[0].form?.form).toBe("pi");
  });

  it("ab 3 Zeichen: auch Formen, die mit der Eingabe beginnen", () => {
    const rows = own(list, "pid");
    expect(rows.map((r) => r.vocab.es)).toEqual(["pedir"]);
    // 10 verschiedene Formen beginnen mit "pid" (pido … pidiendo): eine gezeigt, 9 weitere
    expect(rows[0].form).toMatchObject({ form: "pido", more: 9 });
  });

  it("zwei Zeichen mit Anfang findet nur über Grundform/Deutsch", () => {
    const l = [v({ id: "1", es: "el pie", plural: "los pies" })];
    expect(own(l, "pi")[0].form).toBeUndefined(); // normaler Treffer (Anfang)
    expect(own(l, "pies")[0].form?.label).toBe("Plural");
  });

  it("Formtreffer nur, wenn die Form besser passt als Grundform/Deutsch", () => {
    const l = [
      verb("1", "comer"),
      v({ id: "2", es: "la come", de: ["Essen"], plural: "las comes" }),
    ];
    // "come": comer: F=0 (come), G=1 (comer beginnt damit) → Formtreffer
    expect(own(l, "come").find((r) => r.vocab.id === "1")?.form).toBeDefined();
    // "la come" hat G=0, F=0 für... Form "comes" ist F=1 → normaler Treffer
    expect(
      own(l, "come").find((r) => r.vocab.id === "2")?.form,
    ).toBeUndefined();
  });

  it("deutsche Übersetzung gleich der Eingabe hat Vorrang (G = 0)", () => {
    const l = [v({ id: "1", es: "el pan", de: ["pan"], plural: "los panes" })];
    expect(own(l, "pan")[0].form).toBeUndefined();
  });
});

describe("Sortierung in vier Gruppen", () => {
  const list = [
    // Gruppe 4 (Form beginnt mit der Eingabe), absichtlich nicht in Ausgabereihenfolge
    verb("f1b", "contar", { tags: ["ue"] }),
    verb("f1a", "andar", { overrides: { presente: { "1s": "cuentazo" } } }),
    v({ id: "n2", es: "la sobrecuenta", de: ["Zuschlag"] }), // G=2
    v({ id: "n1", es: "la cuentagotas", de: ["Pipette"] }), // G=1
    verb("f0", "hablar", { overrides: { presente: { "1s": "cuent" } } }), // Form gleich
    v({ id: "n0", es: "la cuent", de: ["Rechnung"] }), // G=0
  ];
  it("normal 0, Form 0, übrige normale, Form 1", () => {
    const rows = own(list, "cuent");
    expect(rows.map((r) => r.vocab.id)).toEqual([
      "n0",
      "f0",
      "n1",
      "n2",
      "f1a",
      "f1b",
    ]);
    expect(rows.map((r) => Boolean(r.form))).toEqual([
      false,
      true,
      false,
      false,
      true,
      true,
    ]);
  });

  it("innerhalb der Formgruppen alphabetisch nach Stichwort ohne Artikel", () => {
    const l = [
      v({ id: "z", es: "el zorro", plural: "los vez" }),
      v({ id: "a", es: "la abeja", plural: "las vez" }),
    ];
    expect(own(l, "vez").map((r) => r.vocab.id)).toEqual(["a", "z"]);
  });
});

describe("Zusammenspiel mit Filtern", () => {
  it("Formtreffer wirken mit Thema, Niveau und Wortart (UND)", () => {
    const poder = REAL.find((x) => x.es === "poder") as Vocab;
    expect(
      search("podemos", { pos: "verb", level: poder.level }).map(
        (r) => r.vocab.es,
      ),
    ).toEqual(["poder"]);
    expect(search("podemos", { pos: "noun" })).toEqual([]);
    expect(search("podemos", { topic: "maya" })).toEqual([]);
  });

  it("zeigt Formen von Vokabeln über dem Maximalniveau (alle Niveaus)", () => {
    const l = [verb("1", "poder", { tags: ["ue"] })];
    l[0].level = "B1";
    expect(own(l, "podemos")).toHaveLength(1);
  });
});

describe("Auswahl der gezeigten Form, +N weitere Formen", () => {
  it("gleiche Schreibung an mehreren Stellen zählt als eine Form", () => {
    // ir: vamos (Presente 1p, Imperativo 1p) → mehr = 0
    expect(row(search("vamos"), "ir")?.form?.more).toBe(0);
  });

  it("Akzentvarianten sind verschiedene Formen: + 1 weitere Form", () => {
    expect(row(search("saludo"), "saludar")?.form?.more).toBe(1);
  });

  it("ohne Akzentwunsch gilt die Tabellenreihenfolge", () => {
    const l = [verb("1", "hablar")];
    // "hable": Presente? nein: hable = 1s Subj nicht in Tabelle; Imperativ 3s "hable"; "hablé" Indefinido 1s
    const r = own(l, "hable")[0];
    expect(r.form?.form).toBe("hable");
    expect(r.form?.more).toBe(1);
    expect(own(l, "hablé")[0].form?.form).toBe("hablé");
    // Eingabe ohne passende Akzentschreibung ("hablè") → Tabellenreihenfolge: Indefinido vor Imperativo
    expect(own(l, "hablè")[0].form?.form).toBe("hablé");
  });
});

describe("Bezeichnungen (formLabel)", () => {
  const verbSlot = (
    tense: "presente" | "indefinido" | "imperfecto" | "futuro" | "imperativo",
    person: "1s" | "2s" | "3s" | "1p" | "2p" | "3p",
  ): FormSlot => ({ kind: "verb", tense, person });

  it("fasst Personen gleicher Zahl zusammen", () => {
    expect(
      formLabel([verbSlot("imperfecto", "1s"), verbSlot("imperfecto", "3s")]),
    ).toBe("1./3. Sg. Imperfecto");
    expect(
      formLabel([verbSlot("presente", "1p"), verbSlot("presente", "2p")]),
    ).toBe("1./2. Pl. Presente");
  });

  it("gemischte Zahl: jede Angabe vollständig, Tabellenreihenfolge", () => {
    expect(
      formLabel([verbSlot("presente", "2p"), verbSlot("presente", "3s")]),
    ).toBe("3. Sg./2. Pl. Presente");
  });

  it("verbindet Zeitformen in Tabellenreihenfolge mit ·", () => {
    expect(
      formLabel([verbSlot("imperativo", "1p"), verbSlot("presente", "1p")]),
    ).toBe("1. Pl. Presente · 1. Pl. Imperativo");
  });

  it("Participio, Gerundio, Plural und Adjektive", () => {
    expect(formLabel([{ kind: "verb", tense: "participio" }])).toBe(
      "Participio",
    );
    expect(formLabel([{ kind: "verb", tense: "gerundio" }])).toBe("Gerundio");
    expect(formLabel([{ kind: "plural" }])).toBe("Plural");
    expect(formLabel([{ kind: "adj", which: "f" }])).toBe("f. Sg.");
    expect(formLabel([{ kind: "adj", which: "pl" }])).toBe("m. Pl.");
    expect(formLabel([{ kind: "adj", which: "fpl" }])).toBe("f. Pl.");
    expect(
      formLabel([
        { kind: "adj", which: "pl" },
        { kind: "adj", which: "fpl" },
      ]),
    ).toBe("Pl.");
  });

  it("gemischte Zahl in der Suche (Testvokabel mit gleicher Schreibung)", () => {
    const l = [
      verb("1", "hablar", {
        overrides: { presente: { "3s": "zzz", "2p": "zzz" } },
      }),
    ];
    expect(own(l, "zzz")[0].form?.label).toBe("3. Sg./2. Pl. Presente");
  });
});

describe("Verben im Index", () => {
  it("reflexive Verben: ohne Pronomen, Imperativ mit angehängtem Pronomen", () => {
    const l = [verb("1", "levantarse")];
    expect(own(l, "levanto")[0].form?.label).toBe("1. Sg. Presente");
    expect(own(l, "me levanto")).toEqual([]);
    expect(own(l, "se levanta")).toEqual([]);
    expect(own(l, "levantaos")[0].form?.label).toBe("2. Pl. Imperativo");
    expect(own(l, "levantemonos")[0].form?.form).toBe("levantémonos");
    expect(own(l, "levantese")[0].form?.form).toBe("levántese");
  });

  it("vosotros-Formen sind Teil der Suche", () => {
    expect(row(search("podéis"), "poder")?.form?.label).toBe("2. Pl. Presente");
    expect(row(search("hablabais"), "hablar")?.form?.label).toBe(
      "2. Pl. Imperfecto",
    );
  });

  it("Participio und Gerundio", () => {
    expect(row(search("hablado"), "hablar")?.form?.label).toBe("Participio");
    expect(row(search("hablando"), "hablar")?.form?.label).toBe("Gerundio");
  });

  it("ein Verb ohne gültigen Infinitiv bricht den Index nicht ab", () => {
    const index = buildFormIndex([verb("1", "xyz"), verb("2", "hablar")]);
    expect(index.has("1")).toBe(false);
    expect(index.has("2")).toBe(true);
  });
});

describe("Nomen und Adjektive im Index", () => {
  it("Nomen ohne Plural und andere Wortarten haben keine Formen", () => {
    const l = [
      v({ id: "1", es: "el dinero" }),
      v({ id: "2", es: "hoy", pos: "adv" }),
      v({ id: "3", es: "la ropa", plural: "" }),
    ];
    expect(buildFormIndex(l).size).toBe(0);
  });

  it("Plural gleich Singular ist keine Form", () => {
    const index = buildFormIndex([
      v({ id: "1", es: "el lunes", plural: "los lunes" }),
    ]);
    expect(index.size).toBe(0);
  });

  it("Adjektive: Formen gleich der Grundform entfallen, Überschreiben per adj", () => {
    const l = [
      v({ id: "1", es: "amable", pos: "adj" }),
      v({ id: "2", es: "español", pos: "adj", adj: { f: "española" } }),
    ];
    const index = buildFormIndex(l);
    // m. Pl. und f. Pl. haben dieselbe Schreibung, f. Sg. entfällt
    expect(index.get("1")?.map((e) => [e.form, e.slot])).toEqual([
      ["amables", { kind: "adj", which: "pl" }],
      ["amables", { kind: "adj", which: "fpl" }],
    ]);
    expect(index.get("2")?.map((e) => e.form)).toEqual([
      "española",
      "españoles",
      "españolas",
    ]);
    expect(own(l, "espanolas")[0].form?.label).toBe("f. Pl.");
  });

  it("der Index wird je Vokabelbestand nur einmal gebaut", () => {
    const map = new Map(REAL.map((x) => [x.id, x]));
    expect(cachedFormIndex(map)).toBe(cachedFormIndex(map));
  });
});

describe("hasSlot", () => {
  const slots: FormSlot[] = [
    { kind: "verb", tense: "presente", person: "1p" },
    { kind: "verb", tense: "participio" },
    { kind: "adj", which: "pl" },
  ];
  it("compares kind, tense and person", () => {
    expect(
      hasSlot(slots, { kind: "verb", tense: "presente", person: "1p" }),
    ).toBe(true);
    expect(
      hasSlot(slots, { kind: "verb", tense: "presente", person: "2p" }),
    ).toBe(false);
    expect(
      hasSlot(slots, { kind: "verb", tense: "imperativo", person: "1p" }),
    ).toBe(false);
    expect(hasSlot(slots, { kind: "verb", tense: "participio" })).toBe(true);
    expect(hasSlot(slots, { kind: "verb", tense: "gerundio" })).toBe(false);
    expect(hasSlot(slots, { kind: "adj", which: "pl" })).toBe(true);
    expect(hasSlot(slots, { kind: "adj", which: "f" })).toBe(false);
    expect(hasSlot(slots, { kind: "plural" })).toBe(false);
    expect(hasSlot([{ kind: "plural" }], { kind: "plural" })).toBe(true);
    expect(hasSlot(undefined, { kind: "plural" })).toBe(false);
  });
});
