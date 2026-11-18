import { isVisible, type Level, type Pos, type Vocab } from "./types";

export interface DictionaryFilters {
  /** Free text, matched against `es` and all `de` entries. */
  query: string;
  /** Topic key, "" = all. */
  topic: string;
  /** Level, "" = all. User words (level null) match no concrete level. */
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

export function matchesQuery(v: Vocab, query: string): boolean {
  const q = normalizeForSearch(query);
  if (!q) return true;
  return [v.es, ...v.de].some((t) => normalizeForSearch(t).includes(q));
}

/** Visible (up to maxLevel) and filtered vocabulary, sorted by Spanish headword. */
export function searchVocab(
  vocab: Iterable<Vocab>,
  maxLevel: Level,
  filters: DictionaryFilters,
): Vocab[] {
  const out: Vocab[] = [];
  for (const v of vocab) {
    if (!isVisible(v, maxLevel)) continue;
    if (filters.topic && v.topic !== filters.topic) continue;
    if (filters.level && v.level !== filters.level) continue;
    if (filters.pos && v.pos !== filters.pos) continue;
    if (!matchesQuery(v, filters.query)) continue;
    out.push(v);
  }
  return out.sort((a, b) => headword(a).localeCompare(headword(b), "es"));
}

/** Spanish word without leading article, used for sorting. */
function headword(v: Vocab): string {
  return v.es.replace(/^(el|la|los|las|un|una)\s+/i, "");
}

/** Topic dropdown entries: Grundwortschatz first, the rest in file order, own words last. */
export function topicOptions(
  topics: readonly { key: string; label: string }[],
): [string, string][] {
  const entries = [...new Map(topics.map((t) => [t.key, t.label])).entries()];
  const core = entries.filter(([key]) => key === "grundwortschatz");
  const rest = entries.filter(([key]) => key !== "grundwortschatz");
  return [...core, ...rest, ["eigene", "Eigene Wörter"]];
}
