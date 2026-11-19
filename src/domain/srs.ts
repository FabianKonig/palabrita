import { addDays, dayKey, diffDays, startOfDay } from "./day";
import type { Card, CardStatus, Direction, Grade } from "./types";

/** Minutes of the learning steps 0 and 1 of a new card (SPEC §11). */
export const LEARN_STEPS_MIN = [1, 10] as const;
/** Minutes of the single relearning step after a lapse. */
export const RELEARN_STEP_MIN = 10;
export const START_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const EASE_LOSS = 0.2;
export const EASE_GAIN = 0.05;
export const GRADUATE_DAYS = 1;
export const MATURE_INTERVAL = 21;
export const MAX_INTERVAL = 36500;

const MINUTE = 60_000;

/** A card that was never rated; `introduced` is the time of its first rating. */
export function newCard(vocabId: string, dir: Direction, now: number): Card {
  return {
    vocabId,
    dir,
    due: now,
    interval: 0,
    ease: START_EASE,
    reps: 0,
    lapses: 0,
    lastReviewed: null,
    introduced: now,
    state: "new",
  };
}

/** Rounds to 2 decimals (floating point noise) and keeps the ease within its bounds. */
function clampEase(ease: number): number {
  const rounded = Math.round(ease * 100) / 100;
  return Math.min(MAX_EASE, Math.max(MIN_EASE, rounded));
}

function stateFor(step: 0 | 1 | undefined, interval: number): CardStatus {
  return step !== undefined || interval < MATURE_INTERVAL
    ? "learning"
    : "mature";
}

/** Sets the learning step, due in the given number of minutes. */
function toStep(card: Card, step: 0 | 1, minutes: number, now: number): Card {
  return {
    ...card,
    step,
    due: now + minutes * MINUTE,
    lastReviewed: now,
    state: "learning",
  };
}

/** Review phase with the given interval, due at 04:00 counted from today. */
function withInterval(card: Card, interval: number, now: number): Card {
  return {
    ...card,
    interval,
    due: startOfDay(addDays(dayKey(now), interval)),
    lastReviewed: now,
    state: stateFor(undefined, interval),
  };
}

/** Leaves the learning or relearning phase with at least GRADUATE_DAYS. */
function graduate(card: Card, now: number): Card {
  const { step: _step, ...rest } = card;
  void _step;
  return {
    ...withInterval(rest, Math.max(GRADUATE_DAYS, card.interval), now),
    reps: card.reps + 1,
  };
}

/**
 * Review with two grades (SPEC §11). A card with `step` is in the learning phase
 * (relearning when `lapses > 0`); a card without `step` and never reviewed is new
 * and follows the learning table as well. Every rating sets `lastReviewed = now`.
 */
export function review(card: Card, grade: Grade, now: number): Card {
  const isNew = card.step === undefined && card.lastReviewed === null;

  if (card.step !== undefined && card.lapses > 0) {
    // Relearning: one step of 10 minutes.
    if (grade === "again") return toStep(card, 1, RELEARN_STEP_MIN, now);
    return graduate(card, now);
  }

  if (card.step !== undefined || isNew) {
    if (grade === "again") return toStep(card, 0, LEARN_STEPS_MIN[0], now);
    if (card.step === 1) return graduate(card, now);
    return toStep(card, 1, LEARN_STEPS_MIN[1], now);
  }

  if (grade === "again") {
    // Lapse: into the relearning phase.
    return {
      ...toStep(card, 1, RELEARN_STEP_MIN, now),
      lapses: card.lapses + 1,
      reps: 0,
      ease: clampEase(card.ease - EASE_LOSS),
      interval: 1,
    };
  }

  // A card that is not due yet counts as on time (late = 0).
  const late = Math.max(0, diffDays(dayKey(card.due), dayKey(now)));
  const interval = Math.min(
    MAX_INTERVAL,
    Math.max(
      card.interval + 1,
      Math.round((card.interval + late / 2) * card.ease),
    ),
  );
  return {
    ...withInterval(card, interval, now),
    ease: clampEase(card.ease + EASE_GAIN),
    reps: card.reps + 1,
  };
}

/** Time until the card is shown again: minutes in the learning phase, otherwise days. */
export type Interval = { minutes: number } | { days: number };

/** Preview for the two buttons. */
export function previewIntervals(
  card: Card,
  now: number,
): Record<Grade, Interval> {
  const preview = (grade: Grade): Interval => {
    const next = review(card, grade, now);
    if (next.step !== undefined)
      return { minutes: Math.max(1, Math.round((next.due - now) / MINUTE)) };
    return { days: next.interval };
  };
  return { again: preview("again"), good: preview("good") };
}

export function formatInterval(interval: Interval): string {
  if ("minutes" in interval) {
    const m = interval.minutes;
    return m < 60 ? `${m} Min` : `${Math.round(m / 60)} Std`;
  }
  const days = interval.days;
  if (days < 30) return `${days} T`;
  if (days < 365) return `${Math.round(days / 30)} Mon`;
  const years = Math.round((days / 365) * 10) / 10;
  return `${String(years).replace(".", ",")} J`;
}
