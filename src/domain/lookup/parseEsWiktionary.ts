import type { Pos } from "../types";
import type { LookupCandidate, LookupResult } from "./parseWiktionary";

/**
 * Part-of-speech templates of es.wiktionary (`{{sustantivo femenino|es}}`),
 * keyed by the first word of the template name.
 */
const POS_MAP: Record<string, Pos> = {
  sustantivo: "noun",
  verbo: "verb",
  adjetivo: "adj",
  adverbio: "adv",
  numeral: "num",
  locución: "phrase",
  interjección: "other",
  preposición: "other",
  conjunción: "other",
  pronombre: "other",
  artículo: "other",
};

/** Heading `==== {{sustantivo femenino|es}} ====` (any level from === to =====). */
const BLOCK_HEADING =
  /^={3,5}\s*\{\{([^|}]+)\|es(?:\|[^}]*)?\}\}\s*={3,5}\s*$/gm;

/**
 * Base form in a `=== Forma verbal ===` / `=== Forma flexiva ===` block:
 * `{{forma verbo|poder|…}}`, `{{f.v|casar|…}}` and similar.
 */
const INFLECTED_FORM =
  /^={3,5}\s*Forma\b[^\n]*\n[\s\S]*?\{\{(?:forma[ .][^|}]*|f\.[^|}]*)\|([^|}]+)/m;

/** The Spanish language section (`== {{lengua|es}} ==`) of a page, or "". */
function spanishSection(wikitext: string): string {
  const m = /^==\s*\{\{lengua\|es\}\}\s*==\s*$/m.exec(wikitext);
  if (!m) return "";
  const rest = wikitext.slice(m.index + m[0].length);
  const next = /^==[^=].*==\s*$/m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

function genderFrom(template: string): LookupCandidate["gender"] {
  const fem = /femenino/.test(template);
  const masc = /masculino/.test(template);
  if ((fem && masc) || /ambiguo|común/.test(template)) return "m/f";
  if (fem) return "f";
  if (masc) return "m";
  return undefined;
}

function articleFor(gender: LookupCandidate["gender"]): string {
  if (gender === "f") return "la ";
  if (gender === "m") return "el ";
  if (gender === "m/f") return "el/la ";
  return "";
}

/**
 * Reads an es.wiktionary page (wikitext) for a Spanish word. The Spanish
 * Wiktionary has no German translations, so candidates come with `de: []`
 * and the user adds the meaning in the form. Word class and gender are taken
 * from the heading templates.
 */
export function parseEsWiktionary(
  wikitext: string,
  word: string,
): LookupResult {
  const section = spanishSection(wikitext);
  const result: LookupResult = { candidates: [] };
  if (!section) return result;

  const base = INFLECTED_FORM.exec(section)?.[1];
  if (base) result.inflectedOf = base.trim();

  const seen = new Set<string>();
  for (const h of section.matchAll(BLOCK_HEADING)) {
    const template = h[1].trim();
    const pos = POS_MAP[template.split(/\s+/)[0]];
    if (!pos) continue;
    const gender = pos === "noun" ? genderFrom(template) : undefined;
    const es = `${articleFor(gender)}${word}`;
    const key = `${pos}|${es}`;
    // "verbo transitivo" and "verbo intransitivo" are one entry for learners.
    if (seen.has(key)) continue;
    seen.add(key);
    const candidate: LookupCandidate = { pos, es, de: [] };
    if (gender) candidate.gender = gender;
    result.candidates.push(candidate);
  }
  return result;
}
