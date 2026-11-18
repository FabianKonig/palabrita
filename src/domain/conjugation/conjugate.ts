import type { Person, Tense, VerbData, VerbTag, Vocab } from "../types";
import { attachClitic } from "./accent";

export const PERSONS: readonly Person[] = ["1s", "2s", "3s", "1p", "2p", "3p"];
/** The imperative has no first person singular. */
export const IMPERATIVE_PERSONS: readonly Person[] = [
  "2s",
  "3s",
  "1p",
  "2p",
  "3p",
];
export const TENSES: readonly Tense[] = [
  "presente",
  "indefinido",
  "imperfecto",
  "futuro",
  "imperativo",
];

export type Regularity =
  "regular" | "orthographic" | "yo-irregular" | "stem-change" | "irregular";
export type IrregularityType =
  "stem-change" | "yo-irregular" | "orthographic" | "strong-stem" | "irregular";

export interface FormInfo {
  form: string;
  /** Differs from the purely regular pattern (highlighted in the UI). */
  irregular: boolean;
}
export interface PersonForm extends FormInfo {
  person: Person;
}

export interface Conjugation {
  /** Infinitive as stored (including -se for reflexive verbs). */
  infinitive: string;
  notation: string;
  /** Bracket part of the notation, e.g. "(ie)"; empty for regular verbs. */
  annotation: string;
  regularity: Regularity;
  types: IrregularityType[];
  /** Six persons per tense, five for the imperative (see IMPERATIVE_PERSONS). */
  tenses: Record<Tense, PersonForm[]>;
  participio: FormInfo;
  gerundio: FormInfo;
}

type Kind = "ar" | "er" | "ir";
type Pronouns = Record<Person, string>;

const REFLEXIVE: Pronouns = {
  "1s": "me",
  "2s": "te",
  "3s": "se",
  "1p": "nos",
  "2p": "os",
  "3p": "se",
};

const ENDINGS = {
  presente: {
    ar: ["o", "as", "a", "amos", "áis", "an"],
    er: ["o", "es", "e", "emos", "éis", "en"],
    ir: ["o", "es", "e", "imos", "ís", "en"],
  },
  indefinido: {
    ar: ["é", "aste", "ó", "amos", "asteis", "aron"],
    er: ["í", "iste", "ió", "imos", "isteis", "ieron"],
    ir: ["í", "iste", "ió", "imos", "isteis", "ieron"],
  },
  imperfecto: {
    ar: ["aba", "abas", "aba", "ábamos", "abais", "aban"],
    er: ["ía", "ías", "ía", "íamos", "íais", "ían"],
    ir: ["ía", "ías", "ía", "íamos", "íais", "ían"],
  },
  subjuntivo: {
    ar: ["e", "es", "e", "emos", "éis", "en"],
    er: ["a", "as", "a", "amos", "áis", "an"],
    ir: ["a", "as", "a", "amos", "áis", "an"],
  },
} satisfies Record<string, Record<Kind, string[]>>;
const FUTURE_ENDINGS = ["é", "ás", "á", "emos", "éis", "án"];

type StemTag = keyof typeof PRESENT_CHANGE;
const STEM_TAGS: StemTag[] = ["ie", "ue", "i", "ie-i", "ue-u"];
const YO_TAGS: VerbTag[] = ["go", "zco", "oy"];
/** Presente change per tag (stressed forms 1s, 2s, 3s, 3p). */
const PRESENT_CHANGE = {
  ie: "ie",
  ue: "ue",
  i: "i",
  "ie-i": "ie",
  "ue-u": "ue",
} as const;
/** Change in 3rd person indefinido and gerundio of -ir verbs. */
const PRETERITE_CHANGE = {
  ie: null,
  ue: null,
  i: "i",
  "ie-i": "i",
  "ue-u": "u",
} as const;

interface Parsed {
  /** Infinitive without -se. */
  base: string;
  stem: string;
  kind: Kind;
  reflexive: boolean;
}

function parse(es: string): Parsed {
  const reflexive = es.endsWith("rse");
  const base = reflexive ? es.slice(0, -2) : es;
  const m = /^(.*)(ar|er|ir|ír)$/.exec(base);
  if (!m) throw new Error(`Not a Spanish infinitive: "${es}"`);
  const kind = m[2] === "ír" ? "ir" : (m[2] as Kind);
  return { base, stem: m[1], kind, reflexive };
}

type Change = "ie" | "ue" | "i" | "u";

/** Replaces the last stem vowel (e for ie/i, o for ue/u; u for jugar). */
function changeVowel(stem: string, to: Change): string {
  let from = to === "ie" || to === "i" ? "e" : "o";
  if (to === "ue" && !stem.includes("o") && stem.includes("u")) from = "u";
  const at = stem.lastIndexOf(from);
  return at < 0 ? stem : stem.slice(0, at) + to + stem.slice(at + 1);
}

const isVowel = (c: string | undefined) => !!c && "aeiouáéíóú".includes(c);

/** Stem ends in a pronounced vowel (the u of gu/qu is silent). */
function vowelStem(p: Parsed, stem: string): boolean {
  if (p.base.endsWith("eír")) return false;
  const last = stem[stem.length - 1];
  if (!isVowel(last)) return false;
  return !(last === "u" && "gq".includes(stem[stem.length - 2] ?? "-"));
}

/** Joins stem and ending; with `ortho` applies the automatic spelling rules. */
function join(p: Parsed, stem: string, ending: string, ortho: boolean) {
  if (!ortho) return stem + ending;
  const b = p.base;
  const first = ending[0];
  if (first === "e" || first === "é") {
    if (b.endsWith("car") && stem.endsWith("c"))
      return `${stem.slice(0, -1)}qu${ending}`;
    if (b.endsWith("zar") && stem.endsWith("z"))
      return `${stem.slice(0, -1)}c${ending}`;
    if (b.endsWith("guar") && stem.endsWith("gu"))
      return `${stem.slice(0, -2)}gü${ending}`;
    if (b.endsWith("gar") && stem.endsWith("g")) return `${stem}u${ending}`;
  }
  if ("oaóá".includes(first)) {
    if (/(ger|gir)$/.test(b) && stem.endsWith("g"))
      return `${stem.slice(0, -1)}j${ending}`;
    if (b.endsWith("guir") && stem.endsWith("gu"))
      return stem.slice(0, -1) + ending;
    if (/c[ei]r$/.test(b) && /[^aeiouáéíóúz]c$/.test(stem))
      return `${stem.slice(0, -1)}z${ending}`;
  }
  if (/^(ió|ieron|iendo)/.test(ending) && vowelStem(p, stem))
    return `${stem}y${ending.slice(1)}`;
  if (
    /^(iste|imos|isteis|ido)$/.test(ending) &&
    "aeo".includes(stem[stem.length - 1] ?? "-")
  )
    return `${stem}í${ending.slice(1)}`;
  return stem + ending;
}

/** Labels of the automatic spelling changes of this verb, e.g. "c → qu". */
function orthographicLabels(p: Parsed, tags: ReadonlySet<VerbTag>): string[] {
  const b = p.base;
  const labels: string[] = [];
  if (b.endsWith("car")) labels.push("c → qu");
  if (b.endsWith("zar")) labels.push("z → c");
  if (b.endsWith("guar")) labels.push("gu → gü");
  else if (b.endsWith("gar")) labels.push("g → gu");
  if (/(ger|gir)$/.test(b)) labels.push("g → j");
  if (b.endsWith("guir")) labels.push("gu → g");
  if (/[^aeiouáéíóú]c[ei]r$/.test(b) && !tags.has("zco")) labels.push("c → z");
  if (p.kind !== "ar" && !tags.has("y") && vowelStem(p, p.stem))
    labels.push("i → y");
  return labels;
}

interface Table {
  presente: Record<Person, string>;
  indefinido: Record<Person, string>;
  imperfecto: Record<Person, string>;
  futuro: Record<Person, string>;
  imperativo: Partial<Record<Person, string>>;
  participio: string;
  gerundio: string;
}

const STRESSED: readonly Person[] = ["1s", "2s", "3s", "3p"];

/** Builds all forms from infinitive and tags. Without tags/ortho: the plain regular pattern. */
function generate(
  p: Parsed,
  tags: ReadonlySet<VerbTag>,
  ortho: boolean,
): Table {
  const { stem, kind, base } = p;
  const change = STEM_TAGS.find((t) => tags.has(t));
  const j = (s: string, e: string) => join(p, s, e, ortho);

  const presente = {} as Record<Person, string>;
  PERSONS.forEach((person, n) => {
    const ending = ENDINGS.presente[kind][n];
    const stressed = STRESSED.includes(person);
    let s = stem;
    if (change && stressed) s = changeVowel(s, PRESENT_CHANGE[change]);
    if (tags.has("y") && stressed) s += "y";
    if (person === "1s") {
      if (tags.has("oy")) {
        presente[person] = `${stem}oy`;
        return;
      }
      if (tags.has("go")) {
        // tener → tengo (no diphthong), decir → digo (the i stays)
        const g = change === "i" ? changeVowel(stem, "i") : stem;
        presente[person] =
          (g.endsWith("c") ? `${g.slice(0, -1)}g` : `${g}g`) + "o";
        return;
      }
      if (tags.has("zco") && stem.endsWith("c")) {
        presente[person] = `${stem.slice(0, -1)}zco`;
        return;
      }
    }
    presente[person] = j(s, ending);
  });

  const yoStem = presente["1s"].slice(0, -1);
  const pretChange = change ? PRETERITE_CHANGE[change] : null;
  const pretStem = (person: Person) =>
    kind === "ir" && pretChange && (person === "3s" || person === "3p")
      ? changeVowel(stem, pretChange)
      : stem;

  const indefinido = {} as Record<Person, string>;
  const imperfecto = {} as Record<Person, string>;
  const futuro = {} as Record<Person, string>;
  PERSONS.forEach((person, n) => {
    indefinido[person] = j(pretStem(person), ENDINGS.indefinido[kind][n]);
    imperfecto[person] = j(stem, ENDINGS.imperfecto[kind][n]);
    futuro[person] = base + FUTURE_ENDINGS[n];
  });

  // Present subjunctive, needed for the imperative (usted, nosotros, ustedes).
  const subjunctive = (person: Person): string => {
    const n = PERSONS.indexOf(person);
    if (tags.has("oy")) {
      // dar: dé, demos, den; estar: esté, estemos, estén
      const accented = /[aeiou]/.test(stem);
      if (person === "3s") return `${stem}é`;
      if (person === "1p") return `${stem}emos`;
      return `${stem}${accented ? "é" : "e"}n`;
    }
    let s: string;
    const weakForm = person === "1p" || person === "2p";
    if (tags.has("go") || tags.has("zco") || tags.has("y")) s = yoStem;
    else if (change === "ie-i" && weakForm) s = changeVowel(stem, "i");
    else if (change === "ue-u" && weakForm) s = changeVowel(stem, "u");
    else if (change === "i") s = yoStem;
    else if (change) s = weakForm ? stem : yoStem;
    else s = stem;
    return j(s, ENDINGS.subjuntivo[kind][n]);
  };

  const imperativo: Partial<Record<Person, string>> = {
    "2s": presente["3s"],
    "3s": subjunctive("3s"),
    "1p": subjunctive("1p"),
    "2p": `${base.slice(0, -1)}d`,
    "3p": subjunctive("3p"),
  };

  const gerundStem = pretStem("3s");
  return {
    presente,
    indefinido,
    imperfecto,
    futuro,
    imperativo,
    participio: j(stem, kind === "ar" ? "ado" : "ido"),
    gerundio: j(gerundStem, kind === "ar" ? "ando" : "iendo"),
  };
}

type Overrides = NonNullable<VerbData["overrides"]>;

function applyOverrides(table: Table, o: Overrides): Table {
  const out: Table = structuredClone(table);
  for (const tense of TENSES) {
    const spec = o[tense];
    if (!spec) continue;
    if (tense === "futuro" && spec.stem) {
      PERSONS.forEach((person, n) => {
        out.futuro[person] = spec.stem + FUTURE_ENDINGS[n];
      });
    }
    for (const person of tense === "imperativo"
      ? IMPERATIVE_PERSONS
      : PERSONS) {
      const form = spec[person];
      if (typeof form === "string" && form) out[tense][person] = form;
    }
  }
  if (o.participio) out.participio = o.participio;
  if (o.gerundio) out.gerundio = o.gerundio;
  return out;
}

/** Textbook notation of the vowel change per tag (e → ie, o → ue, ...). */
const STEM_LABEL: Record<StemTag, string> = {
  ie: "e → ie",
  ue: "o → ue",
  i: "e → i",
  "ie-i": "e → ie, e → i",
  "ue-u": "o → ue, o → u",
};

/** Labels of the tags, in fixed order: vowel change, yo form, -uir, irregular. */
function tagLabels(p: Parsed, tags: ReadonlySet<VerbTag>): string[] {
  const labels: string[] = [];
  const change = STEM_TAGS.find((t) => tags.has(t));
  if (change) {
    // jugar: u → ue
    const jugar =
      change === "ue" && !p.stem.includes("o") && p.stem.includes("u");
    labels.push(jugar ? "u → ue" : STEM_LABEL[change]);
  }
  if (tags.has("go")) labels.push("-go");
  if (tags.has("zco")) labels.push("-zco");
  if (tags.has("oy")) labels.push("-oy");
  if (tags.has("y")) labels.push("i → y");
  if (tags.has("irr")) labels.push("irr.");
  return labels;
}

export interface ConjugateOptions {
  /** false: only what the tags generate (for validation: is an override redundant?). */
  withOverrides?: boolean;
}

/**
 * All forms, notation and classification of a verb (SPEC §5.1).
 *
 * Imperative: tú = presente 3s, usted/nosotros/ustedes = present subjunctive, vosotros =
 * infinitive with -d. All of these derive from the tag-generated forms, not from
 * `presente` overrides; irregular imperatives (ten, haz, sé, ve) are `imperativo` overrides.
 */
export function conjugate(
  vocab: Pick<Vocab, "es" | "verb">,
  options: ConjugateOptions = {},
): Conjugation {
  const verb: VerbData = vocab.verb ?? { tags: [], reflexive: false };
  const p = parse(vocab.es);
  const tags = new Set(verb.tags);
  const overrides = options.withOverrides === false ? {} : verb.overrides;

  const plain = generate(p, new Set(), false);
  let table = generate(p, tags, true);
  if (overrides) table = applyOverrides(table, overrides);

  const attach = (tense: Tense, person: Person, form: string): string => {
    if (!p.reflexive) return form;
    if (tense !== "imperativo") return `${REFLEXIVE[person]} ${form}`;
    if (person === "2p")
      return form === "id" ? "idos" : attachClitic(form, "os", 1);
    if (person === "1p") return attachClitic(form, "nos", 1);
    return attachClitic(form, person === "2s" ? "te" : "se");
  };

  const tenses = {} as Record<Tense, PersonForm[]>;
  for (const tense of TENSES) {
    const persons = tense === "imperativo" ? IMPERATIVE_PERSONS : PERSONS;
    tenses[tense] = persons.map((person) => {
      const bare = table[tense][person] as string;
      return {
        person,
        form: attach(tense, person, bare),
        irregular: bare !== plain[tense][person],
      };
    });
  }

  // Classification
  const ortho = orthographicLabels(p, tags);
  const overridden = (t: Tense) =>
    !!overrides?.[t] && Object.keys(overrides[t] ?? {}).length > 0;
  const types: IrregularityType[] = [];
  if (STEM_TAGS.some((t) => tags.has(t)) || tags.has("y"))
    types.push("stem-change");
  if (YO_TAGS.some((t) => tags.has(t))) types.push("yo-irregular");
  if (ortho.length > 0) types.push("orthographic");
  if (
    overridden("indefinido") ||
    overridden("imperfecto") ||
    overridden("futuro")
  )
    types.push("strong-stem");
  if (tags.has("irr")) types.push("irregular");

  let regularity: Regularity = "regular";
  if (types.includes("irregular") || types.includes("strong-stem"))
    regularity = "irregular";
  else if (types.includes("stem-change")) regularity = "stem-change";
  else if (types.includes("yo-irregular")) regularity = "yo-irregular";
  else if (types.includes("orthographic")) regularity = "orthographic";

  const labels = [...tagLabels(p, tags), ...ortho];
  if (!tags.has("irr")) {
    const pret = overridden("indefinido");
    const fut = overridden("futuro");
    if (pret && fut) labels.push("Pretérito/Futuro irr.");
    else if (pret) labels.push("Pretérito irr.");
    else if (fut) labels.push("Futuro irr.");
  }
  const annotation = labels.length ? `(${labels.join(", ")})` : "";
  const notation = annotation ? `${vocab.es} ${annotation}` : vocab.es;

  return {
    infinitive: vocab.es,
    notation,
    annotation,
    regularity,
    types,
    tenses,
    participio: {
      form: table.participio,
      irregular: table.participio !== plain.participio,
    },
    gerundio: {
      form: table.gerundio,
      irregular: table.gerundio !== plain.gerundio,
    },
  };
}
