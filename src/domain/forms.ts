import { adjectiveForms, type AdjectiveFormKey } from "./adjectiveForms";
import { PERSONS, TENSES, TENSE_LABEL, conjugate } from "./conjugation";
import { normalizeForSearch, stripArticle } from "./text";
import type { Person, Tense, Vocab } from "./types";

/** Where a form stands: in a verb table, as noun plural or as an adjective form (SPEC §14.3). */
export type FormSlot =
  | { kind: "verb"; tense: Tense; person: Person }
  | { kind: "verb"; tense: "participio" | "gerundio" }
  | { kind: "plural" }
  | { kind: "adj"; which: AdjectiveFormKey };

/** One searchable form of a vocab entry. */
export interface FormEntry {
  /** As written in the table (with accents). */
  form: string;
  /** Lowercase, without accents (`normalizeForSearch`). */
  norm: string;
  slot: FormSlot;
  /** Position in table order (presente … gerundio, plural, f/pl/fpl). */
  order: number;
}

/** All forms per vocab id, in table order. Entries without forms are missing. */
export type FormIndex = ReadonlyMap<string, readonly FormEntry[]>;

export const EMPTY_FORM_INDEX: FormIndex = new Map();

/** Reflexive pronoun in front of a conjugated form (not part of the searched form). */
const LEADING_PRONOUN = /^(me|te|se|nos|os) /;

/** Forms of one vocab entry in table order (before removing forms equal to the headword). */
function formsOf(v: Vocab): { form: string; slot: FormSlot }[] {
  if (v.pos === "verb") {
    const c = conjugate(v);
    const reflexive = v.es.endsWith("rse");
    const out: { form: string; slot: FormSlot }[] = [];
    for (const tense of TENSES) {
      for (const { person, form } of c.tenses[tense]) {
        out.push({
          form:
            reflexive && tense !== "imperativo"
              ? form.replace(LEADING_PRONOUN, "")
              : form,
          slot: { kind: "verb", tense, person },
        });
      }
    }
    out.push({
      form: c.participio.form,
      slot: { kind: "verb", tense: "participio" },
    });
    out.push({
      form: c.gerundio.form,
      slot: { kind: "verb", tense: "gerundio" },
    });
    return out;
  }
  if (v.pos === "noun") {
    return v.plural
      ? [{ form: stripArticle(v.plural), slot: { kind: "plural" } }]
      : [];
  }
  if (v.pos === "adj") {
    const a = adjectiveForms(v);
    return (["f", "pl", "fpl"] as const).map((which) => ({
      form: a[which],
      slot: { kind: "adj", which },
    }));
  }
  return [];
}

/**
 * Builds all forms of all vocab entries once. Forms equal to the headword (normalized, without
 * article) are no forms of their own (amable f. Sg. = amable) and stay out.
 */
export function buildFormIndex(vocab: Iterable<Vocab>): FormIndex {
  const index = new Map<string, FormEntry[]>();
  for (const v of vocab) {
    let forms: { form: string; slot: FormSlot }[];
    try {
      forms = formsOf(v);
    } catch {
      continue; // invalid verb data: the validator reports it, the search skips it
    }
    const headword = normalizeForSearch(stripArticle(v.es));
    const entries: FormEntry[] = [];
    forms.forEach(({ form, slot }, order) => {
      const norm = normalizeForSearch(form);
      if (norm === "" || norm === headword) return;
      entries.push({ form, norm, slot, order });
    });
    if (entries.length > 0) index.set(v.id, entries);
  }
  return index;
}

function sameSlot(a: FormSlot, b: FormSlot): boolean {
  if (a.kind === "plural") return b.kind === "plural";
  if (a.kind === "adj") return b.kind === "adj" && a.which === b.which;
  if (b.kind !== "verb" || a.tense !== b.tense) return false;
  // Same tense: participio/gerundio have no person, all others have one.
  return !("person" in a && "person" in b) || a.person === b.person;
}

/** Is the slot among the given slots (the highlighted forms of a detail page)? */
export function hasSlot(
  slots: readonly FormSlot[] | undefined,
  slot: FormSlot,
): boolean {
  return (slots ?? []).some((s) => sameSlot(s, slot));
}

const indexCache = new WeakMap<object, FormIndex>();

/** The index for one vocabulary map, built on first use and kept for the lifetime of the map. */
export function cachedFormIndex(vocab: ReadonlyMap<string, Vocab>): FormIndex {
  let index = indexCache.get(vocab);
  if (!index) {
    index = buildFormIndex(vocab.values());
    indexCache.set(vocab, index);
  }
  return index;
}

const PERSON_NUMBER: Record<Person, { n: number; pl: boolean }> = {
  "1s": { n: 1, pl: false },
  "2s": { n: 2, pl: false },
  "3s": { n: 3, pl: false },
  "1p": { n: 1, pl: true },
  "2p": { n: 2, pl: true },
  "3p": { n: 3, pl: true },
};

/** "1./3. Sg.": persons of the same number share the number label, others follow with "/". */
function personsLabel(persons: Person[]): string {
  const sorted = PERSONS.filter((p) => persons.includes(p));
  const groups = [false, true]
    .map((pl) => sorted.filter((p) => PERSON_NUMBER[p].pl === pl))
    .filter((g) => g.length > 0);
  return groups
    .map(
      (g) =>
        `${g.map((p) => `${PERSON_NUMBER[p].n}.`).join("/")} ${
          PERSON_NUMBER[g[0]].pl ? "Pl." : "Sg."
        }`,
    )
    .join("/");
}

const ADJ_LABEL: Record<AdjectiveFormKey, string> = {
  f: "f. Sg.",
  pl: "m. Pl.",
  fpl: "f. Pl.",
};

/**
 * Label of one written form from all slots it stands in (SPEC §3.3a): "1. Pl. Presente · 1. Pl.
 * Imperativo", "1./3. Sg. Imperfecto", "Participio", "Plural", "f. Sg.", "Pl." (m. Pl. and f. Pl.).
 */
export function formLabel(slots: readonly FormSlot[]): string {
  const parts: string[] = [];
  for (const tense of TENSES) {
    const persons = slots.flatMap((s) =>
      s.kind === "verb" && "person" in s && s.tense === tense ? [s.person] : [],
    );
    if (persons.length > 0)
      parts.push(`${personsLabel(persons)} ${TENSE_LABEL[tense]}`);
  }
  if (slots.some((s) => s.kind === "verb" && s.tense === "participio"))
    parts.push("Participio");
  if (slots.some((s) => s.kind === "verb" && s.tense === "gerundio"))
    parts.push("Gerundio");
  if (slots.some((s) => s.kind === "plural")) parts.push("Plural");
  const adj = slots.flatMap((s) => (s.kind === "adj" ? [s.which] : []));
  for (const which of ["f", "pl", "fpl"] as const) {
    if (!adj.includes(which)) continue;
    if (which === "pl" && adj.includes("fpl")) parts.push("Pl.");
    else if (which === "fpl" && adj.includes("pl")) continue;
    else parts.push(ADJ_LABEL[which]);
  }
  return parts.join(" · ");
}
