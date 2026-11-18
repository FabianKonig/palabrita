import type { Pos } from "../types";

export interface LookupCandidate {
  pos: Pos;
  /** Spanish headword, nouns with article ("la casa"). */
  es: string;
  /** 1-4 German translations. */
  de: string[];
  gender?: "m" | "f" | "m/f";
  plural?: string;
  example?: { es: string; de: string };
}

export interface LookupResult {
  candidates: LookupCandidate[];
  /** Base form when the word is an inflected form (puedo → poder). */
  inflectedOf?: string;
}

const MAX_DE = 4;

const POS_MAP: Record<string, Pos> = {
  Substantiv: "noun",
  Verb: "verb",
  Adjektiv: "adj",
  Adverb: "adv",
  Numerale: "num",
  Redewendung: "phrase",
  Wortverbindung: "phrase",
  Sprichwort: "phrase",
  Grußformel: "phrase",
  Interjektion: "other",
  Präposition: "other",
  Konjunktion: "other",
  Pronomen: "other",
  Artikel: "other",
  Partikel: "other",
};

const INFLECTED = /^(Konjugierte Form|Deklinierte Form|Verb, flektierte Form)/;

/** Wikitext → plain text: links, templates, italics and HTML removed. */
export function cleanWikitext(text: string): string {
  return text
    .replace(/<ref[^>]*>.*?<\/ref>/gs, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\{\{[^{}]*\}\}/g, "")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/'{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** The Spanish language section of a Wiktionary page, or "". */
function spanishSection(wikitext: string): string {
  const m = /^==\s*[^=\n]+\(\{\{Sprache\|Spanisch\}\}\)\s*==\s*$/m.exec(
    wikitext,
  );
  if (!m) return "";
  const rest = wikitext.slice(m.index + m[0].length);
  const next = /^==[^=].*==\s*$/m.exec(rest);
  return next ? rest.slice(0, next.index) : rest;
}

/** Heading line of a part-of-speech block: `=== {{Wortart|Substantiv|Spanisch}}, {{f}} ===`. */
const BLOCK_HEADING =
  /^===\s*\{\{Wortart\|([^|}]+)\|Spanisch\}\}(.*?)===\s*$/gm;

function genderFrom(text: string): LookupCandidate["gender"] {
  const heading = /\{\{(mf|m f|m\/f|m|f)\}\}/.exec(text);
  const table = /\|\s*Genus\s*=\s*([a-z /]+)/.exec(text);
  const raw = (heading?.[1] ?? table?.[1] ?? "").replace(/\s+/g, "").trim();
  if (raw === "m") return "m";
  if (raw === "f") return "f";
  if (raw === "mf" || raw === "m/f") return "m/f";
  return undefined;
}

function germanFromTranslations(block: string): string[] {
  const out: string[] = [];
  for (const line of block.split("\n")) {
    if (!/^\*\s*\{\{de\}\}\s*:/.test(line)) continue;
    for (const m of line.matchAll(/\{\{Ü\|de\|([^}|]+)/g)) {
      const w = m[1].trim();
      if (w && !out.includes(w)) out.push(w);
    }
  }
  return out;
}

function germanFromMeanings(block: string, pos: Pos): string[] {
  const m = /\{\{Bedeutungen\}\}\s*\n((?::.*\n?)+)/.exec(block);
  if (!m) return [];
  const out: string[] = [];
  for (const line of m[1].split("\n")) {
    // Drop context labels like ''Wirtschaft:'' before cleaning.
    let text = cleanWikitext(
      line.replace(/^:\s*\[[^\]]*\]/, "").replace(/''[^'\n]*:''/g, ""),
    );
    if (pos === "noun") text = text.replace(/^(der|die|das|ein|eine)\s+/i, "");
    if (text && !out.includes(text)) out.push(text);
  }
  return out;
}

function exampleFrom(block: string): LookupCandidate["example"] {
  const m = /\{\{Beispiele\}\}\s*\n([\s\S]*?)(?:\n\n|\n====|$)/.exec(block);
  if (!m) return undefined;
  const lines = m[1].split("\n");
  const first = lines.findIndex((l) => /^:\[\d+\]\s*\S/.test(l));
  if (first < 0 || /Beispiele fehlen/.test(lines[first])) return undefined;
  const es = cleanWikitext(lines[first].replace(/^:\[[^\]]*\]/, ""));
  const de = cleanWikitext((lines[first + 1] ?? "").replace(/^::/, ""));
  return es && de ? { es, de } : undefined;
}

function articleFor(gender: LookupCandidate["gender"]): string {
  if (gender === "f") return "la ";
  if (gender === "m") return "el ";
  if (gender === "m/f") return "el/la ";
  return "";
}

/**
 * Reads a de.wiktionary page (wikitext) for a Spanish word. Tolerant: whatever
 * is not recognised stays empty and is filled in by hand in the form.
 */
export function parseWiktionary(wikitext: string, word: string): LookupResult {
  const section = spanishSection(wikitext);
  const result: LookupResult = { candidates: [] };
  if (!section) return result;

  const headings = [...section.matchAll(BLOCK_HEADING)];
  headings.forEach((h, i) => {
    const end = headings[i + 1]?.index ?? section.length;
    const block = section.slice(h.index + h[0].length, end);
    const kind = h[1].trim();

    if (INFLECTED.test(kind)) {
      const base =
        /\{\{Grundformverweis[^|}]*\|([^}|]+)/.exec(block)?.[1] ??
        /\*[^\n]*'''\[\[([^\]|]+)/.exec(block)?.[1];
      if (base && !result.inflectedOf) result.inflectedOf = base.trim();
      return;
    }

    const pos = POS_MAP[kind];
    if (!pos) return;

    const gender = pos === "noun" ? genderFrom(h[2] + "\n" + block) : undefined;
    const plural =
      pos === "noun"
        ? /\|\s*Plural\s*=\s*([^\n|}]+)/.exec(block)?.[1]?.trim()
        : undefined;
    let de = germanFromTranslations(block);
    if (de.length === 0) de = germanFromMeanings(block, pos);
    de = de.slice(0, MAX_DE);

    const candidate: LookupCandidate = {
      pos,
      es: `${articleFor(gender)}${word}`,
      de,
    };
    if (gender) candidate.gender = gender;
    // Same style as the static data: plural with its article ("las casas").
    if (plural)
      candidate.plural = `${gender === "f" ? "las" : "los"} ${plural}`;
    const example = exampleFrom(block);
    if (example) candidate.example = example;
    result.candidates.push(candidate);
  });
  return result;
}
