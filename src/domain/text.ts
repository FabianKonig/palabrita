/** Lowercase and without accents/umlauts, so "cafe" finds "café" and "uber" finds "über". */
export function normalizeForSearch(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

const ARTICLE = /^(el\/la|el|la|los|las|un|una)\s+/i;

/** Spanish word without leading article, used for sorting and matching. */
export function stripArticle(es: string): string {
  return es.replace(ARTICLE, "");
}
