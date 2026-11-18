import { addDays, dayKey, diffDays, nextDayStart, startOfDay } from "./day";
import type { Card, CardStatus, Direction, Grade } from "./types";

/** Minutes until a card is shown again in learning step 0 and 1. */
export const STEP_MINUTES = [5, 30] as const;
export const START_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_EASE = 3.0;
export const EASE_LOSS = 0.2;
export const EASE_GAIN = 0.05;
export const GRADUATE_DAYS = 1;
export const MATURE_INTERVAL = 21;

export const GRADES: Grade[] = ["again", "good"];

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

/** Card is in the review phase but not due today (SPEC §11, early review). */
function isEarly(card: Card, now: number): boolean {
  return card.step === undefined && card.due >= nextDayStart(now);
}

function isNeverReviewed(card: Card): boolean {
  return card.step === undefined && card.lastReviewed === null;
}

/** Enters (or restarts) the learning phase at the given step. */
function toStep(card: Card, step: 0 | 1, now: number): Card {
  return {
    ...card,
    step,
    due: now + STEP_MINUTES[step] * 60_000,
    lastReviewed: now,
    state: "learning",
  };
}

/** Lapse: hard fall back into the learning phase (also used for early review). */
function lapse(card: Card, now: number): Card {
  return {
    ...toStep(card, 0, now),
    lapses: card.lapses + 1,
    reps: 0,
    ease: clampEase(card.ease - EASE_LOSS),
    interval: 1,
  };
}

function withInterval(card: Card, interval: number, now: number): Card {
  return {
    ...card,
    interval,
    due: startOfDay(addDays(dayKey(now), interval)),
    lastReviewed: now,
  };
}

/**
 * Review with two grades (SPEC §11). Order of checks: learning phase first (step set,
 * or never reviewed), then early review (not due yet), then regular review.
 * Returns the same object when nothing changes (early review with "good").
 */
export function review(card: Card, grade: Grade, now: number): Card {
  // Learning phase, including brand new cards.
  if (card.step !== undefined || isNeverReviewed(card)) {
    if (grade === "again") return toStep(card, 0, now);
    if (card.step === 1) {
      const interval = Math.max(GRADUATE_DAYS, card.interval);
      const { step: _step, ...rest } = card;
      void _step;
      return {
        ...withInterval(rest, interval, now),
        reps: card.reps + 1,
        state: stateFor(undefined, interval),
      };
    }
    return toStep(card, 1, now);
  }

  if (grade === "again") return lapse(card, now);

  // Early review with "good": the card stays exactly as it is.
  if (isEarly(card, now)) return card;

  const interval = Math.max(
    card.interval + 1,
    Math.round(card.interval * card.ease),
  );
  return {
    ...withInterval(card, interval, now),
    ease: clampEase(card.ease + EASE_GAIN),
    reps: card.reps + 1,
    state: stateFor(undefined, interval),
  };
}

/** Time until the card is shown again: minutes in the learning phase, otherwise days. */
export type Interval = { minutes: number } | { days: number };

/** Preview for the two buttons. Early review "good" shows the unchanged due date. */
export function previewIntervals(
  card: Card,
  now: number,
): Record<Grade, Interval> {
  const preview = (grade: Grade): Interval => {
    const next = review(card, grade, now);
    if (next === card)
      return { days: Math.max(0, diffDays(dayKey(now), dayKey(card.due))) };
    if (next.step !== undefined)
      return { minutes: Math.max(1, Math.round((next.due - now) / 60_000)) };
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
  return `${Math.round((days / 365) * 10) / 10} J`;
}
