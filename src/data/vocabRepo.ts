import type { Topic, Vocab } from "../domain/types";

interface VocabIndex {
  topics: Topic[];
}

let cache: Promise<{ vocab: Map<string, Vocab>; topics: Topic[] }> | null =
  null;

function url(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`Konnte ${path} nicht laden (${res.status})`);
  return (await res.json()) as T;
}

function isValidVocab(v: unknown): v is Vocab {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.es === "string" &&
    Array.isArray(o.de) &&
    o.de.length > 0 &&
    o.de.every((d) => typeof d === "string" && d.length > 0) &&
    (o.level === "A1" || o.level === "A2" || o.level === "B1")
  );
}

async function load() {
  const index = await fetchJson<VocabIndex>("vocab/index.json");
  const lists = await Promise.all(
    index.topics.map((t) => fetchJson<unknown[]>(`vocab/${t.file}`)),
  );

  const vocab = new Map<string, Vocab>();
  for (const list of lists) {
    for (const entry of list) {
      if (isValidVocab(entry)) vocab.set(entry.id, entry);
      else console.warn("Ungültige Vokabel übersprungen", entry);
    }
  }
  return { vocab, topics: index.topics };
}

/** All vocabulary from the static files, loaded once per page load. */
export function loadVocab(): Promise<{
  vocab: Map<string, Vocab>;
  topics: Topic[];
}> {
  if (!cache) {
    cache = load().catch((e) => {
      cache = null;
      throw e;
    });
  }
  return cache;
}
