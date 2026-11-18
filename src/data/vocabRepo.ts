import type { Topic, Vocab } from "../domain/types";
import { getDb } from "./db";

interface VocabIndex {
  version: number;
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
    (o.level === null ||
      o.level === "A1" ||
      o.level === "A2" ||
      o.level === "B1")
  );
}

async function load() {
  const index = await fetchJson<VocabIndex>("vocab/index.json");
  // Several topics may point to the same file (seed.json in T1-T9), so load each file once.
  const files = [...new Set(index.topics.map((t) => t.file))];
  const lists = await Promise.all(
    files.map((f) => fetchJson<unknown[]>(`vocab/${f}`)),
  );

  const vocab = new Map<string, Vocab>();
  for (const list of lists) {
    for (const entry of list) {
      if (isValidVocab(entry)) vocab.set(entry.id, entry);
      else console.warn("Ungültige Vokabel übersprungen", entry);
    }
  }

  // User words (store exists from schema version 1, empty until T9a).
  const db = await getDb();
  for (const u of await db.getAll("userVocab")) vocab.set(u.id, u);

  return { vocab, topics: index.topics };
}

/** `u` + 8 base36 characters from crypto.getRandomValues; re-rolled on collision. */
export async function newUserId(): Promise<string> {
  const db = await getDb();
  for (;;) {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    const id = "u" + [...bytes].map((b) => (b % 36).toString(36)).join("");
    if (!(await db.get("userVocab", id))) return id;
  }
}

/** Creates or overwrites a user word (origin, level and topic are enforced). */
export async function saveUserVocab(v: Vocab): Promise<Vocab> {
  const db = await getDb();
  const saved: Vocab = {
    ...v,
    origin: "user",
    level: null,
    topic: "eigene",
    createdAt: v.createdAt ?? Date.now(),
  };
  await db.put("userVocab", saved);
  return saved;
}

/** Deletes a user word together with both of its cards. */
export async function deleteUserVocab(id: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["userVocab", "cards"], "readwrite");
  await Promise.all([
    tx.objectStore("userVocab").delete(id),
    tx.objectStore("cards").delete([id, "de-es"]),
    tx.objectStore("cards").delete([id, "es-de"]),
    tx.done,
  ]);
}

/** Static and user vocabulary merged into one map, loaded once per page load. */
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
