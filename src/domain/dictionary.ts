import type { Level, Pos, Vocab } from "./types";

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

/** Lowercase and without accents/umlauts, so "cafe" finds "café" and "uber" finds "über". */
export function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

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

function matchAll(vocab: Iterable<Vocab>, q: string) {
  const out: { vocab: Vocab; match: Match }[] = [];
  for (const v of vocab) {
    const match = matchVocab(v, q);
    if (match) out.push({ vocab: v, match });
  }
  return out.sort(compareMatches);
}

/**
 * All vocabulary (the dictionary ignores maxLevel). With a search text only the text counts
 * and the result is ranked by match quality; the filters are ignored (the UI resets them).
 * Without a search text: filtered and sorted by Spanish headword.
 */
export function searchVocab(
  vocab: Iterable<Vocab>,
  filters: DictionaryFilters,
): Vocab[] {
  const q = normalizeForSearch(filters.query);
  if (q) return matchAll(vocab, q).map((m) => m.vocab);
  const out: Vocab[] = [];
  for (const v of vocab) {
    if (filters.topic && v.topic !== filters.topic) continue;
    if (filters.level && v.level !== filters.level) continue;
    if (filters.pos && v.pos !== filters.pos) continue;
    out.push(v);
  }
  return out.sort(compareHeadword);
}

const ARTICLE = /^(el\/la|el|la|los|las|un|una)\s+/i;

/** Spanish word without leading article, used for sorting and matching. */
function stripArticle(es: string): string {
  return es.replace(ARTICLE, "");
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

/**
 * Change one filter field. Search text and filters exclude each other: typing a search text
 * resets topic, level and pos to "all", choosing a filter (anything but "all") clears the text.
 */
export function changeFilter<K extends keyof DictionaryFilters>(
  filters: DictionaryFilters,
  key: K,
  value: DictionaryFilters[K],
): DictionaryFilters {
  const next = { ...filters, [key]: value };
  if (key === "query") {
    return normalizeForSearch(String(value))
      ? { ...next, topic: "", level: "", pos: "" }
      : next;
  }
  return value === "" ? next : { ...next, query: "" };
}
