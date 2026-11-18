import type { Pos, Vocab } from "../types";

export interface DuplicateResult {
  /** Same normalized form and same part of speech: blocks creating. */
  exact?: Vocab;
  /** Other part of speech, or the same word only without accents: warning. */
  similar: Vocab[];
}

/** Lowercase, leading article removed, accents kept. */
export function normalizeEs(es: string): string {
  return es
    .trim()
    .toLowerCase()
    .replace(/^(el\/la|el|la|los|las|un|una)\s+/, "");
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
}

export function findDuplicate(
  vocab: Iterable<Vocab>,
  es: string,
  pos: Pos,
): DuplicateResult {
  const target = normalizeEs(es);
  const targetPlain = stripAccents(target);
  const result: DuplicateResult = { similar: [] };
  for (const v of vocab) {
    const form = normalizeEs(v.es);
    if (form === target) {
      if (v.pos === pos) result.exact ??= v;
      else result.similar.push(v);
    } else if (stripAccents(form) === targetPlain) {
      result.similar.push(v);
    }
  }
  return result;
}
