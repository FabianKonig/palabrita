import { respell, isStressedOnLastSyllable } from "./conjugation/accent";
import type { Vocab } from "./types";

export interface AdjectiveForms {
  /** feminine singular */
  f: string;
  /** masculine plural */
  pl: string;
  /** feminine plural */
  fpl: string;
}

export type AdjectiveFormKey = keyof AdjectiveForms;

/** Comparatives on -or: the same form for both genders (SPEC §14.3, rule 6). */
const INVARIABLE_COMPARATIVES = new Set([
  "mejor",
  "peor",
  "mayor",
  "menor",
  "anterior",
  "posterior",
  "superior",
  "inferior",
  "exterior",
  "interior",
]);

/** Plural of a single word (SPEC §14.3, rules 1 to 6), stress kept on the same vowel. */
export function pluralOf(word: string): string {
  const last = word.slice(-1);
  if (last === "í" || last === "ú") return respell(word, 0, "es");
  if ("áéó".includes(last)) return respell(word, 0, "s");
  if ("aeiou".includes(last)) return word + "s";
  if (last === "s" || last === "x")
    return isStressedOnLastSyllable(word) ? respell(word, 0, "es") : word;
  if (last === "z") return respell(word, 1, "ces");
  return respell(word, 0, "es");
}

/** Feminine singular of a masculine singular by rule (SPEC §14.3, rules 1 to 6). */
function feminineOf(m: string): string {
  if (m.endsWith("o")) return respell(m, 1, "a");
  if (/(ón|án|ín|or)$/.test(m) && !INVARIABLE_COMPARATIVES.has(m))
    return respell(m, 0, "a");
  return m;
}

/**
 * All forms of an adjective: generated from `es` by rule, every field set in `adj` replaces
 * the generated form. f. Pl. is the plural of `adj.f` if only `f` is set, so a forgotten `fpl`
 * cannot produce a wrong form (order: `adj.fpl`, plural of `adj.f`, rule).
 */
export function adjectiveForms(v: Pick<Vocab, "es" | "adj">): AdjectiveForms {
  const f = v.adj?.f ?? feminineOf(v.es);
  return {
    f,
    pl: v.adj?.pl ?? pluralOf(v.es),
    fpl: v.adj?.fpl ?? pluralOf(f),
  };
}
