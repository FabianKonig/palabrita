import { describe, expect, it } from "vitest";
import { startOfDay } from "./day";
import {
  EASE_GAIN,
  formatInterval,
  MAX_EASE,
  MIN_EASE,
  newCard,
  previewIntervals,
  review,
  STEP_MINUTES,
} from "./srs";
import type { Card } from "./types";

const NOW = new Date(2026, 0, 15, 10, 0).getTime(); // dayKey 2026-01-15
const MIN = 60_000;

/** A card in the review phase, due today by default. */
function reviewCard(over: Partial<Card> = {}): Card {
  return {
    ...newCard("v", "de-es", NOW),
    interval: 6,
    reps: 3,
    ease: 2.5,
    lastReviewed: NOW - 86_400_000,
    due: startOfDay("2026-01-15"),
    state: "learning",
    ...over,
  };
}

/** A card that graduated and is not due before 2026-01-20. */
const early = (over: Partial<Card> = {}) =>
  reviewCard({ due: startOfDay("2026-01-20"), interval: 57, ...over });

describe("learning phase", () => {
  it("new card: again -> step 0 in 5 min, good -> step 1 in 30 min", () => {
    const n = newCard("v", "de-es", NOW);
    const a = review(n, "again", NOW);
    expect(a).toMatchObject({ step: 0, due: NOW + 5 * MIN, state: "learning" });
    expect(a.lastReviewed).toBe(NOW);
    expect(a.ease).toBe(2.5);
    const g = review(n, "good", NOW);
    expect(g).toMatchObject({ step: 1, due: NOW + 30 * MIN });
    expect(STEP_MINUTES).toEqual([5, 30]);
  });

  it("step 0: again stays at step 0, good goes to step 1", () => {
    const s0 = review(newCard("v", "de-es", NOW), "again", NOW);
    expect(review(s0, "again", NOW)).toMatchObject({ step: 0 });
    expect(review(s0, "good", NOW)).toMatchObject({ step: 1 });
  });

  it("step 1: again -> step 0, good graduates with interval 1 day", () => {
    const s1 = review(newCard("v", "de-es", NOW), "good", NOW);
    expect(review(s1, "again", NOW)).toMatchObject({
      step: 0,
      due: NOW + 5 * MIN,
    });
    const done = review(s1, "good", NOW);
    expect(done.step).toBeUndefined();
    expect("step" in done).toBe(false);
    expect(done).toMatchObject({ interval: 1, reps: 1, state: "learning" });
    expect(done.due).toBe(startOfDay("2026-01-16"));
  });

  it("learning phase leaves ease and lapses alone", () => {
    let c = newCard("v", "de-es", NOW);
    c = review(review(review(c, "again", NOW), "good", NOW), "again", NOW);
    expect(c.ease).toBe(2.5);
    expect(c.lapses).toBe(0);
  });

  it("graduation uses the 04:00 rule: 02:00 -> due today 04:00, preview still 1 T", () => {
    const night = new Date(2026, 0, 15, 2, 0).getTime(); // dayKey 2026-01-14
    const s1 = { ...newCard("v", "de-es", night), step: 1 as const };
    const done = review(s1, "good", night);
    expect(done.due).toBe(startOfDay("2026-01-15"));
    expect(previewIntervals(s1, night).good).toEqual({ days: 1 });
  });
});

describe("review phase", () => {
  it("good: interval = max(interval + 1, round(interval * ease)), ease +0.05", () => {
    const r = review(reviewCard(), "good", NOW);
    expect(r.interval).toBe(15);
    expect(r.ease).toBe(2.55);
    expect(r.reps).toBe(4);
    expect(r.due).toBe(startOfDay("2026-01-30"));
    expect(r.step).toBeUndefined();
  });

  it("good uses at least interval + 1 and bases the date on today, not on the old due", () => {
    const r = review(
      reviewCard({ interval: 1, ease: 1.3, due: 0 }),
      "good",
      NOW,
    );
    expect(r.interval).toBe(2);
    expect(r.due).toBe(startOfDay("2026-01-17"));
  });

  it("again: lapse into learning step 0, ease -0.2, interval 1, reps 0", () => {
    const r = review(reviewCard(), "again", NOW);
    expect(r).toMatchObject({
      step: 0,
      due: NOW + 5 * MIN,
      lapses: 1,
      reps: 0,
      ease: 2.3,
      interval: 1,
      state: "learning",
    });
    // finishing the relearning gives 1 day
    const s1 = review(r, "good", NOW);
    const done = review(s1, "good", NOW);
    expect(done.interval).toBe(1);
    expect(done.due).toBe(startOfDay("2026-01-16"));
    expect(done.lapses).toBe(1);
  });

  it("ease stays within 1.3 and 3.0", () => {
    // Each lapse/success happens on a due review card (the learning phase leaves ease alone).
    let c = reviewCard();
    for (let i = 0; i < 20; i++)
      c = review(reviewCard({ ease: c.ease }), "again", NOW);
    expect(c.ease).toBe(MIN_EASE);
    let g = reviewCard({ ease: 2.9 });
    for (let i = 0; i < 20; i++)
      g = review(reviewCard({ ease: g.ease }), "good", NOW);
    expect(g.ease).toBe(MAX_EASE);
  });

  it("rounds the ease to 2 decimals", () => {
    let c = reviewCard({ ease: 2.35 });
    c = review(c, "good", NOW);
    expect(c.ease).toBe(2.4);
    expect(EASE_GAIN).toBe(0.05);
  });

  it("boundary: due 03:59 tomorrow is due (regular review), 04:00 is early", () => {
    const tomorrow4 = startOfDay("2026-01-16");
    const due = review(reviewCard({ due: tomorrow4 - MIN }), "good", NOW);
    expect(due.interval).toBe(15);
    const e = reviewCard({ due: tomorrow4 });
    expect(review(e, "good", NOW)).toBe(e);
  });

  it("state becomes mature at 21 days", () => {
    expect(review(reviewCard({ interval: 9 }), "good", NOW).state).toBe(
      "mature",
    ); // round(9 * 2.5) = 23
    expect(review(reviewCard({ interval: 8 }), "good", NOW).state).toBe(
      "learning",
    ); // 20
  });

  it("only good: intervals grow monotonically (about 1, 3, 8, 21, 56)", () => {
    // Each rating happens on the day the card is due.
    let t = NOW;
    let c = review(newCard("v", "de-es", t), "good", t);
    t = c.due;
    c = review(c, "good", t);
    const seq = [c.interval];
    for (let i = 0; i < 6; i++) {
      t = c.due;
      c = review(c, "good", t);
      seq.push(c.interval);
    }
    expect(seq.slice(0, 5)).toEqual([1, 3, 8, 21, 56]);
    for (let i = 1; i < seq.length; i++)
      expect(seq[i]).toBeGreaterThan(seq[i - 1]);
  });
});

describe("early review", () => {
  it("good changes nothing, not even lastReviewed, and returns the same card", () => {
    const c = early();
    const r = review(c, "good", NOW);
    expect(r).toBe(c);
    expect(r.lastReviewed).toBe(c.lastReviewed);
  });

  it("again is a hard lapse: lapses +1, reps 0, interval 1, ease -0.2", () => {
    const r = review(early({ ease: 2.5, reps: 7 }), "again", NOW);
    expect(r).toMatchObject({
      step: 0,
      lapses: 1,
      reps: 0,
      interval: 1,
      ease: 2.3,
      due: NOW + 5 * MIN,
    });
  });

  it("checks the learning phase before the early check", () => {
    // step set, due far in the future must still follow the learning table
    const c = { ...early(), step: 1 as const };
    const r = review(c, "good", NOW);
    expect(r.step).toBeUndefined();
    expect(r.interval).toBe(57); // max(GRADUATE_DAYS, interval)
  });
});

describe("previewIntervals and formatInterval", () => {
  it("shows minutes in the learning phase", () => {
    const p = previewIntervals(newCard("v", "de-es", NOW), NOW);
    expect(p).toEqual({ again: { minutes: 5 }, good: { minutes: 30 } });
  });

  it("shows days in the review phase", () => {
    const p = previewIntervals(reviewCard(), NOW);
    expect(p.good).toEqual({ days: 15 });
    expect(p.again).toEqual({ minutes: 5 });
  });

  it("early review: good shows the unchanged due date", () => {
    const p = previewIntervals(early(), NOW);
    expect(p.good).toEqual({ days: 5 });
  });

  it("formats minutes, hours and days", () => {
    expect(formatInterval({ minutes: 5 })).toBe("5 Min");
    expect(formatInterval({ minutes: 60 })).toBe("1 Std");
    expect(formatInterval({ days: 1 })).toBe("1 T");
    expect(formatInterval({ days: 60 })).toBe("2 Mon");
  });
});
