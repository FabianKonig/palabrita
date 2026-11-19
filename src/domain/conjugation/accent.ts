const ACCENT: Record<string, string> = {
  a: "á",
  e: "é",
  i: "í",
  o: "ó",
  u: "ú",
};
const ACCENTED = "áéíóú";
const VOWELS = "aeiouáéíóúü";
const WEAK = "iuü";

/** Indices of letters that act as vowels (silent u in que/qui/gue/gui is skipped). */
function vowelIndices(word: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < word.length; i++) {
    const c = word[i];
    if (!VOWELS.includes(c)) continue;
    if (c === "u" && i > 0) {
      const prev = word[i - 1];
      const next = word[i + 1] ?? "";
      if (prev === "q" || (prev === "g" && "eéií".includes(next) && next))
        continue;
    }
    out.push(i);
  }
  return out;
}

/** Vowel groups forming one syllable nucleus (diphthong = unstressed weak + any vowel). */
function nuclei(word: string): number[][] {
  const result: number[][] = [];
  let prev = -2;
  for (const i of vowelIndices(word)) {
    const cur = result[result.length - 1];
    const joins = WEAK.includes(word[prev]) || WEAK.includes(word[i]);
    if (cur && i === prev + 1 && joins) cur.push(i);
    else result.push([i]);
    prev = i;
  }
  return result;
}

/** Index of the stressed vowel (Spanish stress rules), or -1 without vowels. */
export function stressedIndex(word: string): number {
  const groups = nuclei(word);
  if (groups.length === 0) return -1;
  let n = groups.findIndex((g) => g.some((i) => ACCENTED.includes(word[i])));
  if (n < 0) {
    const natural = "aeiouns".includes(word[word.length - 1]);
    n = natural ? Math.max(groups.length - 2, 0) : groups.length - 1;
  }
  const group = groups[n];
  return (
    group.find((i) => ACCENTED.includes(word[i])) ??
    group.find((i) => "aeo".includes(word[i])) ??
    group[group.length - 1]
  );
}

/**
 * Attaches an enclitic pronoun (dropping `drop` trailing letters first) and adds the
 * written accent if the stress would otherwise move: llama+te → llámate.
 */
export function attachClitic(word: string, clitic: string, drop = 0): string {
  const stressed = stressedIndex(word);
  const combined = word.slice(0, word.length - drop) + clitic;
  if (stressed < 0 || [...combined].some((c) => ACCENTED.includes(c)))
    return combined;
  if (stressedIndex(combined) === stressed) return combined;
  return (
    combined.slice(0, stressed) +
    ACCENT[combined[stressed]] +
    combined.slice(stressed + 1)
  );
}

const PLAIN: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
};

/** Does the stress of the word fall on its last syllable (written accent or natural stress)? */
export function isStressedOnLastSyllable(word: string): boolean {
  const stressed = stressedIndex(word);
  if (stressed < 0) return false;
  const last = nuclei(word).at(-1) ?? [];
  return last.includes(stressed);
}

/**
 * Replaces the last `drop` letters of `word` with `suffix` and keeps the stress on the same
 * vowel: the written accent is removed if the new word does not need it and added if it does
 * (joven+es → jóvenes, cortés+es → corteses, fácil+es → fáciles, iraní+es → iraníes).
 */
export function respell(word: string, drop: number, suffix: string): string {
  const stressed = stressedIndex(word);
  const base = word.slice(0, word.length - drop);
  if (stressed < 0 || stressed >= base.length) return base + suffix;
  const plain =
    base.slice(0, stressed) +
    (PLAIN[base[stressed]] ?? base[stressed]) +
    base.slice(stressed + 1);
  const combined = plain + suffix;
  if (stressedIndex(combined) === stressed) return combined;
  return (
    combined.slice(0, stressed) +
    ACCENT[combined[stressed]] +
    combined.slice(stressed + 1)
  );
}
