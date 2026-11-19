import { dayKey, diffDays, nextDayStart, startOfDay } from "./day";
import type {
  Card,
  Direction,
  DirectionSetting,
  Level,
  Pos,
  Settings,
  Vocab,
} from "./types";
import { isVisible } from "./types";

/** Daily limit of new cards, counted over all sessions (SPEC §12.1). */
export const NEW_PER_DAY = 20;
/** Reviews between two new cards while both are available (SPEC §12.2, stage 2). */
export const REVIEWS_PER_NEW = 4;
/** Learning cards due within this many minutes may be shown early (stage 3). */
export const LEARN_AHEAD_MIN = 20;
/** Button "10 weitere neue Karten" (SPEC §14.1). */
export const MORE_NEW_STEP = 10;

const MINUTE = 60_000;

export interface QueueFilters {
  topic?: string;
  level?: Level;
  pos?: Pos;
  /** Card direction of this session, default both. */
  direction?: DirectionSetting;
}

export interface QueueItem {
  vocabId: string;
  dir: Direction;
  /** null = new card, not yet stored. */
  card: Card | null;
}

/** The stage of SPEC §12.2 that chose the card. */
export type PickKind = "learning" | "review" | "new" | "learn-ahead";

export type NextPick =
  { kind: PickKind; item: QueueItem } | { kind: "done"; moreNew: boolean };

export interface PickInput {
  settings: Pick<Settings, "maxLevel" | "orderSeed" | "startedAt">;
  vocab: Iterable<Vocab>;
  cards: Card[];
  now: number;
  filters?: QueueFilters;
  /** Key (`vocabId|dir`) of the card rated last, avoided while another card is available. */
  lastShown: string | null;
  /** Review cards rated in this session since the last new card. */
  reviewsSinceNew: number;
  /** Daily limit of new cards that applies in this session. */
  newLimit: number;
}

/** Sort key for ties: position, then vocabId, then de-es before es-de. */
export type OrderKey = { position: number; vocabId: string; dir: Direction };

const ALL_DIRS: Direction[] = ["de-es", "es-de"];

function allowedDirections(setting: DirectionSetting): Direction[] {
  return setting === "both" ? ALL_DIRS : [setting];
}

function matchesFilters(v: Vocab, f: QueueFilters): boolean {
  if (f.topic && v.topic !== f.topic) return false;
  if (f.level && v.level !== f.level) return false;
  if (f.pos && v.pos !== f.pos) return false;
  return true;
}

const otherDir = (dir: Direction): Direction =>
  dir === "de-es" ? "es-de" : "de-es";

export function cardKey(vocabId: string, dir: Direction): string {
  return `${vocabId}|${dir}`;
}

/** Number of stored cards first rated today (from 04:00), over all filters and directions. */
export function countIntroducedToday(cards: Card[], now: number): number {
  const start = startOfDay(dayKey(now));
  return cards.filter((c) => c.introduced >= start).length;
}

/**
 * Fixed pseudo-random position of a vocabulary entry (SPEC §12.1): 32-bit FNV-1a over
 * `${orderSeed}|${vocabId}`, then the MurmurHash3 finaliser fmix32, unsigned.
 */
export function position(vocabId: string, orderSeed: number): number {
  const text = `${orderSeed}|${vocabId}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Tie-break shared by all sorts in pickNext. */
export function compareOrder(a: OrderKey, b: OrderKey): number {
  if (a.position !== b.position) return a.position < b.position ? -1 : 1;
  if (a.vocabId !== b.vocabId) return a.vocabId < b.vocabId ? -1 : 1;
  if (a.dir !== b.dir) return a.dir === "de-es" ? -1 : 1;
  return 0;
}

type CardPick = Extract<NextPick, { item: QueueItem }>;

const toItem = (card: Card): QueueItem => ({
  vocabId: card.vocabId,
  dir: card.dir,
  card,
});

/**
 * Chooses the next card (SPEC §12.2). Pure: no clock, no database, no randomness.
 * Returns null when the selection contains no visible vocabulary at all.
 */
export function pickNext(input: PickInput): NextPick | null {
  const { settings, now, lastShown, reviewsSinceNew, newLimit } = input;
  const filters = input.filters ?? {};
  const dirs = allowedDirections(filters.direction ?? "both");

  const visible = new Map<string, Vocab>();
  for (const v of input.vocab) {
    if (isVisible(v, settings.maxLevel) && matchesFilters(v, filters))
      visible.set(v.id, v);
  }
  if (visible.size === 0) return null;

  const todayStart = startOfDay(dayKey(now));
  const tomorrowStart = nextDayStart(now);
  const today = dayKey(now);
  const startedKey = dayKey(settings.startedAt);

  const positions = new Map<string, number>();
  const pos = (vocabId: string): number => {
    let p = positions.get(vocabId);
    if (p === undefined) {
      p = position(vocabId, settings.orderSeed);
      positions.set(vocabId, p);
    }
    return p;
  };
  const order = (vocabId: string, dir: Direction): OrderKey => ({
    position: pos(vocabId),
    vocabId,
    dir,
  });
  const byOrder = (a: Card, b: Card) =>
    compareOrder(order(a.vocabId, a.dir), order(b.vocabId, b.dir));

  // All stored cards count as partners, independent of filter and session direction.
  const byKey = new Map(input.cards.map((c) => [cardKey(c.vocabId, c.dir), c]));
  const partnerOf = (vocabId: string, dir: Direction) =>
    byKey.get(cardKey(vocabId, otherDir(dir)));

  const reviewedToday = (c: Card) =>
    c.lastReviewed !== null && c.lastReviewed >= todayStart;
  const isDueReview = (c: Card) =>
    c.step === undefined && c.due < tomorrowStart;
  /** Daily lock: the partner card was rated today. */
  const lockedToday = (vocabId: string, dir: Direction) => {
    const partner = partnerOf(vocabId, dir);
    return partner !== undefined && reviewedToday(partner);
  };
  /** New cards also wait for a due review or a learning partner in this session. */
  const newLocked = (vocabId: string, dir: Direction) => {
    if (lockedToday(vocabId, dir)) return true;
    const partner = partnerOf(vocabId, dir);
    return (
      partner !== undefined &&
      dirs.includes(partner.dir) &&
      (partner.step !== undefined || isDueReview(partner))
    );
  };

  const sessionCards = input.cards.filter(
    (c) => visible.has(c.vocabId) && dirs.includes(c.dir),
  );

  // New candidates (both locks applied), newcomers first, then by position.
  const isNewcomer = (v: Vocab) => v.added > startedKey;
  const newCandidates: { vocabId: string; dir: Direction; fresh: boolean }[] =
    [];
  for (const v of visible.values()) {
    for (const dir of dirs) {
      if (byKey.has(cardKey(v.id, dir)) || newLocked(v.id, dir)) continue;
      newCandidates.push({ vocabId: v.id, dir, fresh: isNewcomer(v) });
    }
  }
  newCandidates.sort(
    (a, b) =>
      Number(b.fresh) - Number(a.fresh) ||
      compareOrder(order(a.vocabId, a.dir), order(b.vocabId, b.dir)),
  );
  const newAllowed = countIntroducedToday(input.cards, now) < newLimit;

  const danger = (c: Card) =>
    diffDays(dayKey(c.lastReviewed ?? c.due), today) / Math.max(1, c.interval);

  const stages = (avoid: string | null): CardPick | null => {
    const ok = (vocabId: string, dir: Direction) =>
      cardKey(vocabId, dir) !== avoid;

    // 1. Due learning cards, most overdue first.
    const learningDue = sessionCards
      .filter(
        (c) => c.step !== undefined && c.due <= now && ok(c.vocabId, c.dir),
      )
      .sort((a, b) => a.due - b.due || byOrder(a, b));
    if (learningDue[0])
      return { kind: "learning", item: toItem(learningDue[0]) };

    // 2. Due reviews mixed with new cards, 4 to 1.
    const reviews = sessionCards
      .filter(
        (c) =>
          isDueReview(c) &&
          !lockedToday(c.vocabId, c.dir) &&
          ok(c.vocabId, c.dir),
      )
      .sort((a, b) => danger(b) - danger(a) || byOrder(a, b));
    const next = newAllowed
      ? newCandidates.find((n) => ok(n.vocabId, n.dir))
      : undefined;
    const newPick: CardPick | undefined = next && {
      kind: "new",
      item: { vocabId: next.vocabId, dir: next.dir, card: null },
    };
    const reviewPick: CardPick | undefined = reviews[0] && {
      kind: "review",
      item: toItem(reviews[0]),
    };
    if (newPick && reviewPick)
      return reviewsSinceNew >= REVIEWS_PER_NEW ? newPick : reviewPick;
    const single = reviewPick ?? newPick;
    if (single) return single;

    // 3. Learning cards due within LEARN_AHEAD_MIN, earliest first.
    const ahead = sessionCards
      .filter(
        (c) =>
          c.step !== undefined &&
          c.due <= now + LEARN_AHEAD_MIN * MINUTE &&
          ok(c.vocabId, c.dir),
      )
      .sort((a, b) => a.due - b.due || byOrder(a, b));
    if (ahead[0]) return { kind: "learn-ahead", item: toItem(ahead[0]) };

    return null;
  };

  // lastShown is only shown again when nothing else is left.
  const picked = stages(lastShown) ?? (lastShown ? stages(null) : null);
  if (picked) return picked;
  return { kind: "done", moreNew: newCandidates.length > 0 };
}
