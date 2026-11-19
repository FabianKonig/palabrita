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

/** Thema, Niveau und Wortart: jeder gesetzte Filter muss passen (UND). */
function matchesFilters(v: Vocab, filters: DictionaryFilters): boolean {
  if (filters.topic && v.topic !== filters.topic) return false;
  if (filters.level && v.level !== filters.level) return false;
  if (filters.pos && v.pos !== filters.pos) return false;
  return true;
}

/**
 * All vocabulary (the dictionary ignores maxLevel). Search text and filters combine: the
 * search runs inside the filtered list. Without a search text the result is sorted by
 * Spanish headword, with one it is ranked by match quality.
 */
export function searchVocab(
  vocab: Iterable<Vocab>,
  filters: DictionaryFilters,
): Vocab[] {
  const candidates = [...vocab].filter((v) => matchesFilters(v, filters));
  const q = normalizeForSearch(filters.query);
  if (!q) return candidates.sort(compareHeadword);
  return candidates
    .flatMap((vocab) => {
      const match = matchVocab(vocab, q);
      return match ? [{ vocab, match }] : [];
    })
    .sort(compareMatches)
    .map((m) => m.vocab);
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

/** Setzt nur Thema, Niveau und Wortart zurück. Der Suchtext bleibt. */
export function clearDropdownFilters(
  filters: DictionaryFilters,
): DictionaryFilters {
  return { ...filters, topic: "", level: "", pos: "" };
}

/** Is any dropdown filter set? (The search text is not counted.) */
export function hasDropdownFilter(filters: DictionaryFilters): boolean {
  return filters.topic !== "" || filters.level !== "" || filters.pos !== "";
}
