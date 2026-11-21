export type Level = "A1" | "A2" | "B1";
export type Pos = "verb" | "noun" | "adj" | "adv" | "num" | "phrase" | "other";

/** Always compare levels through this map, never as strings. */
export const LEVEL_ORDER: Record<Level, number> = { A1: 1, A2: 2, B1: 3 };

export type VerbTag =
  "ie" | "ue" | "i" | "ie-i" | "ue-u" | "go" | "zco" | "oy" | "y" | "irr";
export type Tense =
  "presente" | "indefinido" | "imperfecto" | "futuro" | "imperativo";
export type Person = "1s" | "2s" | "3s" | "1p" | "2p" | "3p";

export interface VerbData {
  tags: VerbTag[];
  reflexive: boolean;
  overrides?: Partial<
    Record<Tense, Partial<Record<Person, string>> & { stem?: string }>
  > & {
    participio?: string;
    gerundio?: string;
  };
}

export interface Vocab {
  id: string;
  /** 1-4 entries, [0] is the main translation. */
  de: string[];
  es: string;
  pos: Pos;
  level: Level;
  /** One of the topic keys in public/vocab/index.json. */
  topic: string;
  /** Date the entry joined the vocabulary ('YYYY-MM-DD'), never changed (SPEC §4.2). */
  added: string;
  example: { es: string; de: string };
  note?: string | null;
  gender?: "m" | "f" | "m/f" | null;
  plural?: string | null;
  adj?: { f?: string; pl?: string; fpl?: string } | null;
  verb?: VerbData | null;
}

/** The single visibility rule. */
export function isVisible(v: Pick<Vocab, "level">, maxLevel: Level): boolean {
  return LEVEL_ORDER[v.level] <= LEVEL_ORDER[maxLevel];
}

export type Direction = "de-es" | "es-de";
export type DirectionSetting = Direction | "both";
export type CardStatus = "new" | "learning" | "mature";
export type Grade = "again" | "good";

// Settings und Card sind gespeicherte Nutzerdaten (IndexedDB). Es gibt aktive Nutzer: Änderungen
// an den Feldern brauchen eine Migration (SPEC §10.4, DB_VERSION in data/db.ts).
export interface Settings {
  maxLevel: Level;
  theme: "system" | "light" | "dark";
  /** Random unsigned 32-bit integer for the order of new cards (SPEC §12.1). */
  orderSeed: number;
  /** First creation of the settings record in ms (SPEC §12.1, Neuzugang). */
  startedAt: number;
}

/** The two fields a user can change (SPEC §10.2). */
export type SettingsPatch = Partial<Pick<Settings, "maxLevel" | "theme">>;

export const DEFAULT_SETTINGS: Omit<Settings, "orderSeed" | "startedAt"> = {
  maxLevel: "B1",
  theme: "system",
};

export interface Card {
  vocabId: string;
  dir: Direction;
  /** Due timestamp in ms. */
  due: number;
  /** Interval in days. */
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  lastReviewed: number | null;
  /** First rating in ms, never changed afterwards; counts for the daily limit of new cards. */
  introduced: number;
  state: CardStatus;
  /** Set while the card is in the learning phase (minute steps), absent in the review phase. */
  step?: 0 | 1;
}

export interface Topic {
  key: string;
  label: string;
  file: string;
}
