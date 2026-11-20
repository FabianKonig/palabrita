import type { FormEntry, FormIndex, FormSlot } from "./forms";
import { formLabel } from "./forms";
import { normalizeForSearch, stripArticle } from "./text";

import type { Level, Pos, Vocab } from "./types";

export { normalizeForSearch };

export interface DictionaryFilters {
  /** Free text, matched against `es` and all `de` entries. */
  query: string;
  /** Topic key, "" = all. */
  topic: string;
  /** Level, "" = all. */
  level: Level | "";
  /** Part of speech, "" = all. */
  pos: Pos | "";
}

export const EMPTY_FILTERS: DictionaryFilters = {
  query: "",
  topic: "",
  level: "",
  pos: "",
};

export const POS_LABEL: Record<Pos, string> = {
  verb: "Verb",
  noun: "Nomen",
  adj: "Adjektiv",
  adv: "Adverb",
  num: "Zahl",
  phrase: "Redewendung",
  other: "Sonstiges",
};

/** Match quality: the entry equals the query (0), starts with it (1) or contains it (2). */
type Rank = 0 | 1 | 2;

function rankOf(text: string, q: string): Rank | null {
  if (text === q) return 0;
  if (text.startsWith(q)) return 1;
  return text.includes(q) ? 2 : null;
}

interface Match {
  rank: Rank;
  /** The Spanish headword matches (with or without its article). */
  viaEs: boolean;
}

/** Best match of a vocab entry against an already normalized, non-empty query. */
function matchVocab(v: Vocab, q: string): Match | null {
  const es = [v.es, stripArticle(v.es)].map(normalizeForSearch);
  const esRanks = es.map((t) => rankOf(t, q)).filter((r) => r !== null);
  const esRank = esRanks.length ? Math.min(...esRanks) : null;
  let deRank: Rank | null = null;
  for (const d of v.de) {
    const r = rankOf(normalizeForSearch(d), q);
    if (r !== null && (deRank === null || r < deRank)) deRank = r;
  }
  if (esRank === null && deRank === null) return null;
  return {
    rank: Math.min(esRank ?? 2, deRank ?? 2) as Rank,
    viaEs: esRank !== null,
  };
}

export function matchesQuery(v: Vocab, query: string): boolean {
  const q = normalizeForSearch(query);
  return !q || matchVocab(v, q) !== null;
}

/** Order for search results: match quality, then Spanish hit before German-only hit, then alphabetical. */
function compareMatches(
  a: { vocab: Vocab; match: Match },
  b: { vocab: Vocab; match: Match },
): number {
  return (
    a.match.rank - b.match.rank ||
    Number(b.match.viaEs) - Number(a.match.viaEs) ||
    compareHeadword(a.vocab, b.vocab)
  );
}

/** Thema, Niveau und Wortart: jeder gesetzte Filter muss passen (UND). */
function matchesFilters(v: Vocab, filters: DictionaryFilters): boolean {
  if (filters.topic && v.topic !== filters.topic) return false;
  if (filters.level && v.level !== filters.level) return false;
  if (filters.pos && v.pos !== filters.pos) return false;
  return true;
}

/** The form that matched a search text, shown in the row of its headword (SPEC §3.3a). */
export interface FormHit {
  /** The form as written in the table (with accents). */
  form: string;
  /** Label of the form, e.g. "1. Pl. Presente". */
  label: string;
  /** Number of other written forms that matched on the same stage. */
  more: number;
  /** Slots of all forms that matched on the best form stage (highlighted on the detail page). */
  highlight: FormSlot[];
}

/** A row of the result list: a normal hit (without `form`) or a form hit. */
export interface SearchRow {
  vocab: Vocab;
  form?: FormHit;
}

/** Minimum length of the search text for form stage 0 (form equals the text) and 1 (form starts with it). */
const FORM_MIN_EQUAL = 2;
const FORM_MIN_PREFIX = 3;

/** Best form stage of a vocab entry (0 equal, 1 starts with) and the form to show. */
function matchForms(
  entries: readonly FormEntry[] | undefined,
  q: string,
  typed: string,
): { stage: 0 | 1; hit: FormHit } | null {
  if (!entries || q.length < FORM_MIN_EQUAL) return null;
  let hits = entries.filter((e) => e.norm === q);
  let stage: 0 | 1 = 0;
  if (hits.length === 0 && q.length >= FORM_MIN_PREFIX) {
    hits = entries.filter((e) => e.norm.startsWith(q));
    stage = 1;
  }
  if (hits.length === 0) return null;

  // One entry per written form, in table order (entries are in table order already).
  const byForm = new Map<string, FormEntry[]>();
  for (const e of hits) byForm.set(e.form, [...(byForm.get(e.form) ?? []), e]);
  const forms = [...byForm.entries()];
  // The form that matches the typed text with its accents comes first (compre / compré).
  const exact = ([form]: [string, FormEntry[]]) => {
    const lower = form.normalize("NFC").toLowerCase();
    return stage === 0 ? lower === typed : lower.startsWith(typed);
  };
  const [form, slots] = forms.find(exact) ?? forms[0];
  return {
    stage,
    hit: {
      form,
      label: formLabel(slots.map((e) => e.slot)),
      more: forms.length - 1,
      highlight: hits.map((e) => e.slot),
    },
  };
}

/**
 * All vocabulary (the dictionary ignores maxLevel). Search text and filters combine: the
 * search runs inside the filtered list. Without a search text the result is sorted by
 * Spanish headword, with one it is ranked by match quality. Inflected forms (SPEC §3.3a)
 * also match, via `formIndex`: a vocab entry is a form hit only if its form matches better
 * than its headword or German text, and appears once. Four groups: exact normal hits, exact
 * form hits, other normal hits, form hits by prefix.
 */
export function searchVocab(
  vocab: Iterable<Vocab>,
  filters: DictionaryFilters,
  formIndex: FormIndex,
): SearchRow[] {
  const candidates = [...vocab].filter((v) => matchesFilters(v, filters));
  const q = normalizeForSearch(filters.query);
  if (!q) return candidates.sort(compareHeadword).map((vocab) => ({ vocab }));

  const typed = filters.query.normalize("NFC").trim().toLowerCase();
  const ranked: { row: SearchRow; group: number; match: Match | null }[] = [];
  for (const vocab of candidates) {
    const match = matchVocab(vocab, q);
    const forms = matchForms(formIndex.get(vocab.id), q, typed);
    if (forms && (!match || forms.stage < match.rank)) {
      ranked.push({
        row: { vocab, form: forms.hit },
        group: forms.stage === 0 ? 1 : 3,
        match: null,
      });
    } else if (match) {
      ranked.push({ row: { vocab }, group: match.rank === 0 ? 0 : 2, match });
    }
  }
  return ranked
    .sort(
      (a, b) =>
        a.group - b.group ||
        (a.match && b.match
          ? compareMatches(
              { vocab: a.row.vocab, match: a.match },
              { vocab: b.row.vocab, match: b.match },
            )
          : compareHeadword(a.row.vocab, b.row.vocab)),
    )
    .map((r) => r.row);
}

function compareHeadword(a: Vocab, b: Vocab): number {
  return stripArticle(a.es).localeCompare(stripArticle(b.es), "es");
}

/** Topic dropdown entries: Grundwortschatz first, the rest in file order. */
export function topicOptions(
  topics: readonly { key: string; label: string }[],
): [string, string][] {
  const entries = [...new Map(topics.map((t) => [t.key, t.label])).entries()];
  const core = entries.filter(([key]) => key === "grundwortschatz");
  const rest = entries.filter(([key]) => key !== "grundwortschatz");
  return [...core, ...rest];
}

/** Setzt nur Thema, Niveau und Wortart zurück. Der Suchtext bleibt. */
export function clearDropdownFilters(
  filters: DictionaryFilters,
): DictionaryFilters {
  return { ...filters, topic: "", level: "", pos: "" };
}

/** Ein Kriterium der Statuszeile: Thema, Niveau, Wortart oder der Suchtext. */
export type DictionaryCriterion = "topic" | "level" | "pos" | "query";

/** Entfernt genau ein Kriterium (Chip in der Statuszeile). Die übrigen bleiben. */
export function clearCriterion(
  filters: DictionaryFilters,
  criterion: DictionaryCriterion,
): DictionaryFilters {
  return { ...filters, [criterion]: "" };
}

/** Is any dropdown filter set? (The search text is not counted.) */
export function hasDropdownFilter(filters: DictionaryFilters): boolean {
  return filters.topic !== "" || filters.level !== "" || filters.pos !== "";
}
