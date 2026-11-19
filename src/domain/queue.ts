import { nextDayStart } from "./day";
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

/** Maximum number of cards in the learning phase at the same time (replaces the daily limit). */
export const MAX_LEARNING = 25;

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

export interface QueueInput {
  settings: Pick<Settings, "maxLevel">;
  vocab: Iterable<Vocab>;
  cards: Card[];
  now: number;
  filters?: QueueFilters;
}

export interface PickInput extends QueueInput {
  /** Card keys (`vocabId|dir`) already shown or rated in this pass. */
  sessionSeen: ReadonlySet<string>;
  /** Key of the card rated last, avoided while another card is available. */
  lastShown: string | null;
}

/**
 * Which rule of SPEC §12.1 chose the card:
 * learning (1), review (2), new (3), early-learning (4), pass (5, early review).
 */
export type PickKind =
  "learning" | "review" | "new" | "early-learning" | "pass";

export interface NextPick {
  kind: PickKind;
  item: QueueItem;
  /** True when a new pass starts: the caller clears sessionSeen. */
  newPass: boolean;
}

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

/** Own words (by createdAt) first, then static words by id. */
function compareNewOrder(a: Vocab, b: Vocab): number {
  const aUser = a.origin === "user";
  const bUser = b.origin === "user";
  if (aUser !== bUser) return aUser ? -1 : 1;
  if (aUser) return (a.createdAt ?? 0) - (b.createdAt ?? 0);
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function cardKey(vocabId: string, dir: Direction): string {
  return `${vocabId}|${dir}`;
}

const toItem = (card: Card): QueueItem => ({
  vocabId: card.vocabId,
  dir: card.dir,
  card,
});

/** Visibility and filter logic for pickNext. */
function scope(input: QueueInput) {
  const filters = input.filters ?? {};
  const dirs = allowedDirections(filters.direction ?? "both");
  const visible = new Map<string, Vocab>();
  for (const v of input.vocab) {
    if (isVisible(v, input.settings.maxLevel) && matchesFilters(v, filters))
      visible.set(v.id, v);
  }
  const cards = input.cards.filter(
    (c) => visible.has(c.vocabId) && dirs.includes(c.dir),
  );
  return { visible, dirs, cards };
}

/** Never learned, visible cards in new order (partner lock not applied). */
function newPairs(
  visible: Map<string, Vocab>,
  dirs: Direction[],
  allCards: Card[],
): { vocabId: string; dir: Direction }[] {
  const existing = new Set(allCards.map((c) => cardKey(c.vocabId, c.dir)));
  const pairs: { vocabId: string; dir: Direction }[] = [];
  for (const v of [...visible.values()].sort(compareNewOrder)) {
    for (const dir of dirs) {
      if (!existing.has(cardKey(v.id, dir))) pairs.push({ vocabId: v.id, dir });
    }
  }
  return pairs;
}

/**
 * Chooses the next card (SPEC §12.1). Pure: no clock, no database.
 * Returns null when there is no visible card at all.
 */
export function pickNext(input: PickInput): NextPick | null {
  const withoutLast = pick(input, input.lastShown);
  if (withoutLast) return withoutLast;
  // Nothing else available: show the last card again rather than an empty screen.
  return input.lastShown ? pick(input, null) : null;
}

function pick(input: PickInput, avoid: string | null): NextPick | null {
  const { now, sessionSeen } = input;
  const { visible, dirs, cards } = scope(input);
  const ok = (c: Card) => cardKey(c.vocabId, c.dir) !== avoid;
  const limit = nextDayStart(now);

  // 1. Learning cards that are due, most overdue first.
  const learningDue = cards
    .filter((c) => c.step !== undefined && c.due <= now && ok(c))
    .sort((a, b) => a.due - b.due);
  if (learningDue[0])
    return { kind: "learning", item: toItem(learningDue[0]), newPass: false };

  // 2. Reviews due today.
  const reviewDue = cards
    .filter((c) => c.step === undefined && c.due < limit && ok(c))
    .sort((a, b) => a.due - b.due);
  if (reviewDue[0])
    return { kind: "review", item: toItem(reviewDue[0]), newPass: false };

  // 3. Introduce a new card while fewer than MAX_LEARNING cards are in the learning phase.
  const learningCount = cards.filter((c) => c.step !== undefined).length;
  if (learningCount < MAX_LEARNING) {
    const byKey = new Map(
      input.cards.map((c) => [cardKey(c.vocabId, c.dir), c]),
    );
    const next = newPairs(visible, dirs, input.cards).find(
      ({ vocabId, dir }) => {
        if (cardKey(vocabId, dir) === avoid) return false;
        // Partner lock: es-de waits until de-es has left the learning phase,
        // but only when de-es is part of the current direction selection.
        if (dir === "es-de" && dirs.includes("de-es")) {
          const partner = byKey.get(cardKey(vocabId, "de-es"));
          if (!partner || partner.step !== undefined) return false;
        }
        return true;
      },
    );
    if (next)
      return {
        kind: "new",
        item: { vocabId: next.vocabId, dir: next.dir, card: null },
        newPass: false,
      };
  }

  // 4. Waiting learning cards are shown right away, earliest due first. Before the
  // early review (5), otherwise a couple of review cards would block all learning cards.
  const waiting = cards
    .filter((c) => c.step !== undefined && ok(c))
    .sort((a, b) => a.due - b.due);
  if (waiting[0])
    return { kind: "early-learning", item: toItem(waiting[0]), newPass: false };

  // 5. Early review of cards in the review phase, one pass per session.
  const reviewCards = cards
    .filter((c) => c.step === undefined && ok(c))
    .sort((a, b) => a.due - b.due);
  if (reviewCards.length > 0) {
    const unseen = reviewCards.filter(
      (c) => !sessionSeen.has(cardKey(c.vocabId, c.dir)),
    );
    const pool = unseen.length > 0 ? unseen : reviewCards;
    return {
      kind: "pass",
      item: toItem(pool[0]),
      newPass: unseen.length === 0,
    };
  }

  return null;
}
