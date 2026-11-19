import Ajv from "ajv";
import { adjectiveForms } from "../src/domain/adjectiveForms";
import { conjugate } from "../src/domain/conjugation";
import { findDuplicate } from "../src/domain/findDuplicate";
import type { Tense, VerbData, VerbTag, Vocab } from "../src/domain/types";
import schema from "./vocab.schema.json";

export interface VocabFile {
  /** File name, e.g. "essen.json". */
  file: string;
  data: unknown;
}

export interface ValidationReport {
  errors: string[];
  warnings: string[];
  /** Entries per topic (only schema-valid files). */
  counts: Record<string, number>;
  total: number;
}

/** A topic with fewer entries is not worth maintaining as its own topic. */
export const MIN_PER_TOPIC = 10;

export interface ValidateOptions {
  /** Minimum number of entries per topic file. */
  minPerTopic?: number;
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);
const schemaTopics: string[] = schema.definitions.vocab.properties.topic.enum;

const ARTICLE_GENDER: Record<string, Vocab["gender"]> = {
  el: "m",
  la: "f",
  "el/la": "m/f",
  los: "m",
  las: "f",
};

function infinitiveOf(es: string): { inf: string; kind: string; stem: string } {
  const inf = es.replace(/se$/, "");
  const kind = inf.slice(-2).replace("ír", "ir");
  return { inf, kind, stem: inf.slice(0, -2) };
}

type Flat = Map<string, string>;

function flatten(v: Pick<Vocab, "es" | "verb">, withOverrides: boolean): Flat {
  const c = conjugate(v, { withOverrides });
  const m: Flat = new Map();
  for (const [tense, forms] of Object.entries(c.tenses)) {
    for (const f of forms) m.set(`${tense}.${f.person}`, f.form);
  }
  m.set("participio", c.participio.form);
  m.set("gerundio", c.gerundio.form);
  return m;
}

function sameFlat(a: Flat, b: Flat): boolean {
  if (a.size !== b.size) return false;
  for (const [k, val] of a) if (b.get(k) !== val) return false;
  return true;
}

/** Verb rules from SPEC §5.1. Returns error messages. */
export function checkVerb(v: Vocab): string[] {
  const out: string[] = [];
  const verb = v.verb as VerbData;
  const { inf, kind, stem } = infinitiveOf(v.es);

  if (!/(ar|er|ir|ír)$/.test(inf))
    return [`Infinitiv "${v.es}" endet nicht auf -ar/-er/-ir`];
  if (verb.reflexive !== /se$/.test(v.es))
    out.push(
      `reflexive=${verb.reflexive} passt nicht zu "${v.es}" (true genau bei -se)`,
    );

  // Tags must fit the stem.
  for (const t of verb.tags) {
    const fit: Record<VerbTag, boolean> = {
      ie: /e/.test(stem),
      ue: /[ou]/.test(stem),
      i: /e/.test(stem) && kind === "ir",
      "ie-i": /e/.test(stem) && kind === "ir",
      "ue-u": /o/.test(stem) && kind === "ir",
      go: true,
      zco: /c(er|ir|ír)$/.test(inf),
      oy: /ar$/.test(inf),
      y: /uir$/.test(inf),
      irr: true,
    };
    if (!fit[t]) out.push(`Tag "${t}" passt nicht zum Stamm von "${v.es}"`);
  }

  const o = verb.overrides;
  if (verb.tags.includes("irr") && !o)
    out.push(`Tag "irr" ohne overrides (Formen müssen angegeben werden)`);

  if (o?.imperativo && "1s" in o.imperativo)
    out.push(`imperativo kennt keine Person "1s"`);

  // Tags must change something (irr is only a marker).
  try {
    const withTags = flatten({ es: v.es, verb }, false);
    for (const t of verb.tags) {
      if (t === "irr") continue;
      const without = flatten(
        { es: v.es, verb: { ...verb, tags: verb.tags.filter((x) => x !== t) } },
        false,
      );
      if (sameFlat(withTags, without))
        out.push(`Tag "${t}" hat bei "${v.es}" keine Wirkung`);
    }

    // Every single override must differ from the generated form.
    if (o) {
      const base = flatten(
        { es: v.es, verb: { ...verb, overrides: undefined } },
        true,
      );
      const single = (overrides: VerbData["overrides"]) =>
        flatten({ es: v.es, verb: { ...verb, overrides } }, true);
      for (const key of ["participio", "gerundio"] as const) {
        const val = o[key];
        if (val !== undefined && sameFlat(base, single({ [key]: val })))
          out.push(`Override ${key} "${val}" entspricht der generierten Form`);
      }
      for (const tense of Object.keys(o) as (
        Tense | "participio" | "gerundio"
      )[]) {
        if (tense === "participio" || tense === "gerundio") continue;
        const entries = Object.entries(o[tense] ?? {});
        for (const [k, val] of entries) {
          const one = single({ [tense]: { [k]: val } });
          if (sameFlat(base, one))
            out.push(
              `Override ${tense}.${k} "${val}" entspricht der generierten Form`,
            );
        }
      }
    }
  } catch (e) {
    out.push(`Formen konnten nicht erzeugt werden: ${(e as Error).message}`);
  }
  return out;
}

/**
 * Warnings for the `adj` field (SPEC §14.3): adjectives on -és/-ol need an explicit feminine
 * form (nationalities differ from rule 6), and `adj` must not repeat what the rules produce.
 */
export function checkAdjective(v: Vocab): string[] {
  if (v.pos !== "adj") return [];
  const out: string[] = [];
  const nationality = /(és|ol)$/.test(v.es);
  if (nationality && !v.adj?.f)
    out.push(
      `Adjektiv auf -és/-ol ohne adj.f: Regel 6 setzt das Feminin gleich der Grundform, bei Nationalitäten ist es -esa/-ola (ist die Femininform wirklich gleich, "adj": { "f": "${v.es}" } bestätigt das)`,
    );
  for (const key of ["f", "pl", "fpl"] as const) {
    const given = v.adj?.[key];
    if (!given) continue;
    // adj.f on -és/-ol is a confirmation, not a redundancy
    if (key === "f" && nationality) continue;
    const without = adjectiveForms({
      es: v.es,
      adj: { ...v.adj, [key]: undefined },
    });
    if (without[key] === given)
      out.push(
        `adj.${key} "${given}" entspricht der erzeugten Form (Eintrag überflüssig)`,
      );
  }
  return out;
}

/** Semantic checks for one schema-valid entry. */
function checkEntry(v: Vocab, file: string): string[] {
  const out: string[] = [];
  if (v.topic !== file.replace(/\.json$/, ""))
    out.push(`topic "${v.topic}" gehört nicht in ${file}`);

  if (v.de.some((d) => d !== d.trim()))
    out.push("de-Eintrag mit Leerzeichen am Rand");
  if (v.es !== v.es.trim()) out.push("es mit Leerzeichen am Rand");

  if (v.pos === "verb" && !v.verb) out.push("Verb ohne verb-Objekt");
  if (v.pos !== "verb" && v.verb) out.push("verb-Objekt bei Nicht-Verb");
  if (v.pos !== "adj" && v.adj) out.push("adj-Feld bei Nicht-Adjektiv");
  if (v.pos !== "noun" && (v.gender || v.plural))
    out.push("gender/plural bei Nicht-Nomen");

  if (v.pos === "noun") {
    const m = /^(el\/la|el|la|los|las)\s+\S/.exec(v.es);
    if (!m) out.push(`Nomen ohne Artikel: "${v.es}"`);
    else if (!v.gender) out.push("Nomen ohne gender");
    else if (
      ARTICLE_GENDER[m[1]] !== v.gender &&
      m[1] !== "los" &&
      m[1] !== "las" &&
      // el agua, el hambre: feminine nouns with stressed a- take el in the singular
      !(m[1] === "el" && v.gender === "f" && /^el h?[aá]/.test(v.es))
    )
      out.push(`Artikel "${m[1]}" passt nicht zu gender "${v.gender}"`);
  }

  if (v.pos === "verb" && v.verb) out.push(...checkVerb(v));
  return out;
}

/** Validates all vocabulary files together (cross-file checks included). */
export function validateVocab(
  files: VocabFile[],
  { minPerTopic = MIN_PER_TOPIC }: ValidateOptions = {},
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const counts: Record<string, number> = {};
  const all: { v: Vocab; file: string }[] = [];

  for (const { file, data } of files) {
    if (!validateSchema(data)) {
      for (const e of validateSchema.errors ?? [])
        errors.push(`${file}: Schema ${e.instancePath} ${e.message}`);
      continue;
    }
    const entries = data as unknown as Vocab[];
    const key = file.replace(/\.json$/, "");
    counts[key] = entries.length;
    for (const v of entries) {
      all.push({ v, file });
      for (const msg of checkEntry(v, file))
        errors.push(`${file} ${v.id} (${v.es}): ${msg}`);
      for (const msg of checkAdjective(v))
        warnings.push(`${file} ${v.id} (${v.es}): ${msg}`);
    }
  }

  // Unique IDs.
  const seen = new Map<string, string>();
  for (const { v, file } of all) {
    const prev = seen.get(v.id);
    if (prev) errors.push(`${file} ${v.id}: ID doppelt (auch in ${prev})`);
    else seen.set(v.id, file);
  }

  // Duplicates across all topics: same form + same pos = error, otherwise warning.
  const reported = new Set<string>();
  all.forEach(({ v }, i) => {
    const dup = findDuplicate(
      all.slice(i + 1).map((x) => x.v),
      v.es,
      v.pos,
    );
    if (dup.exact) {
      const key = `${v.id}|${dup.exact.id}`;
      if (!reported.has(key)) {
        reported.add(key);
        errors.push(
          `Dublette: ${v.id} "${v.es}" und ${dup.exact.id} "${dup.exact.es}" (${v.pos})`,
        );
      }
    }
    for (const s of dup.similar)
      warnings.push(
        `Ähnlich: ${v.id} "${v.es}" (${v.pos}) und ${s.id} "${s.es}" (${s.pos})`,
      );
  });

  // Every topic needs a minimum number of entries.
  for (const [topic, n] of Object.entries(counts)) {
    if (n < minPerTopic)
      errors.push(
        `${topic}: nur ${n} Einträge, mindestens ${minPerTopic} je Thema`,
      );
  }
  const total = all.length;

  return { errors, warnings, counts, total };
}

/** Index file: every topic has a key, a label and the file `<key>.json`; the keys match the schema. */
export function validateIndex(index: unknown): string[] {
  const out: string[] = [];
  const topics = (
    index as { topics?: { key: string; file: string; label: string }[] }
  )?.topics;
  if (!Array.isArray(topics)) return ["index.json: topics fehlt"];
  const seen = new Set<string>();
  for (const t of topics) {
    if (typeof t.key !== "string" || typeof t.label !== "string")
      out.push("index.json: Thema ohne key oder label");
    else if (seen.has(t.key)) out.push(`index.json: Thema ${t.key} doppelt`);
    else seen.add(t.key);
    if (t.file !== `${t.key}.json`)
      out.push(
        `index.json: ${t.key} zeigt auf ${t.file}, erwartet ${t.key}.json`,
      );
  }
  for (const key of schemaTopics)
    if (!seen.has(key)) out.push(`index.json: Thema ${key} fehlt`);
  for (const key of seen)
    if (!schemaTopics.includes(key))
      out.push(`index.json: Thema ${key} fehlt im Schema (topic-Liste)`);
  return out;
}
