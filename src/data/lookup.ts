import { parseEsWiktionary } from "../domain/lookup/parseEsWiktionary";
import {
  parseWiktionary,
  type LookupResult,
} from "../domain/lookup/parseWiktionary";

export type LookupResponse =
  | {
      status: "ok";
      result: LookupResult;
      /** de = with German meanings, es = only word class/gender (no German). */
      source: "de" | "es";
    }
  | { status: "notfound" }
  | { status: "unavailable" };

const TIMEOUT_MS = 8000;

type WikitextResponse =
  | { status: "ok"; text: string }
  | { status: "notfound" }
  | { status: "unavailable" };

async function fetchWikitext(
  host: string,
  page: string,
  fetchImpl: typeof fetch,
): Promise<WikitextResponse> {
  const url =
    `https://${host}/w/api.php?action=parse&prop=wikitext&format=json&redirects=1&origin=*&page=` +
    encodeURIComponent(page);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchImpl(url, { signal: controller.signal });
    if (!res.ok) return { status: "unavailable" };
    const json = (await res.json()) as {
      error?: { code?: string };
      parse?: { wikitext?: { "*"?: string } };
    };
    if (json.error?.code === "missingtitle") return { status: "notfound" };
    const text = json.parse?.wikitext?.["*"];
    if (typeof text !== "string") return { status: "notfound" };
    return { status: "ok", text };
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(timer);
  }
}

function found(result: LookupResult): boolean {
  return result.candidates.length > 0 || !!result.inflectedOf;
}

/**
 * Looks a Spanish word up on de.wiktionary.org (with German meanings). If that
 * has no Spanish entry, es.wiktionary.org is tried for word class and gender.
 * This is the only network access of the app and only happens on an explicit
 * user action.
 */
export async function lookupWord(
  word: string,
  fetchImpl: typeof fetch = fetch,
): Promise<LookupResponse> {
  const page = word.trim();
  if (!page) return { status: "notfound" };

  const de = await fetchWikitext("de.wiktionary.org", page, fetchImpl);
  if (de.status === "unavailable") return { status: "unavailable" };
  if (de.status === "ok") {
    const result = parseWiktionary(de.text, page);
    if (found(result)) return { status: "ok", result, source: "de" };
  }

  const es = await fetchWikitext("es.wiktionary.org", page, fetchImpl);
  if (es.status === "ok") {
    const result = parseEsWiktionary(es.text, page);
    if (found(result)) return { status: "ok", result, source: "es" };
  }
  return { status: "notfound" };
}
