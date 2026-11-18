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
  /** null only for user words: always visible. */
  level: Level | null;
  topic: string;
  origin?: "user";
  createdAt?: number;
  verified?: false;
  example: { es: string; de: string } | null;
  note?: string | null;
  gender?: "m" | "f" | "m/f" | null;
  plural?: string | null;
  adj?: { f?: string; pl?: string; fpl?: string } | null;
  verb?: VerbData | null;
}

/** The single visibility rule. */
export function isVisible(v: Pick<Vocab, "level">, maxLevel: Level): boolean {
  return v.level === null || LEVEL_ORDER[v.level] <= LEVEL_ORDER[maxLevel];
}

export type Direction = "de-es" | "es-de";
export type DirectionSetting = Direction | "both";
export type CardStatus = "new" | "learning" | "mature";
export type Grade = "again" | "good";

export interface Settings {
  maxLevel: Level;
  autoSpeak: boolean;
  direction: DirectionSetting;
  theme: "system" | "light" | "dark";
}

export const DEFAULT_SETTINGS: Settings = {
  maxLevel: "B1",
  autoSpeak: false,
  direction: "both",
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
  state: CardStatus;
  /** Set while the card is in the learning phase (minute steps), absent in the review phase. */
  step?: 0 | 1;
}

export interface Daily {
  dayKey: string;
  newIntroduced: number;
  reviewed: number;
}

export interface Topic {
  key: string;
  label: string;
  file: string;
}
