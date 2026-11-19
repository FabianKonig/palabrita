import { describe, expect, it } from "vitest";
import { startOfDay } from "./day";
import {
  EASE_GAIN,
  formatInterval,
  LEARN_STEPS_MIN,
  MAX_EASE,
  MAX_INTERVAL,
  MIN_EASE,
  newCard,
  previewIntervals,
  RELEARN_STEP_MIN,
  review,
} from "./srs";
import type { Card } from "./types";

const NOW = new Date(2026, 0, 15, 10, 0).getTime(); // dayKey 2026-01-15
const MIN = 60_000;
const INTRODUCED = new Date(2026, 0, 1, 9, 0).getTime();

/** A card in the review phase, due today by default. */
function reviewCard(over: Partial<Card> = {}): Card {
  return {
    ...newCard("v", "de-es", INTRODUCED),
    interval: 6,
    reps: 3,
    ease: 2.5,
    lastReviewed: NOW - 6 * 86_400_000,
    due: startOfDay("2026-01-15"),
    state: "learning",
    ...over,
  };
}

/** A card in the learning phase (new card, lapses 0). */
function learningCard(step: 0 | 1, over: Partial<Card> = {}): Card {
  return {
    ...newCard("v", "de-es", INTRODUCED),
    step,
    lastReviewed: NOW - MIN,
    due: NOW,
    state: "learning",
    ...over,
  };
}

describe("constants", () => {
  it("learning steps 1 / 10 min, relearning 10 min", () => {
    expect(LEARN_STEPS_MIN).toEqual([1, 10]);
    expect(RELEARN_STEP_MIN).toBe(10);
    expect(EASE_GAIN).toBe(0.05);
  });
});

describe("learning phase (lapses 0)", () => {
  const cases: [string, Card, Partial<Card>, Partial<Card>][] = [
    [
      "new (never reviewed)",
      newCard("v", "de-es", NOW),
      { step: 0, due: NOW + 1 * MIN },
      { step: 1, due: NOW + 10 * MIN },
    ],
    [
      "step 0",
      learningCard(0),
      { step: 0, due: NOW + 1 * MIN },
      { step: 1, due: NOW + 10 * MIN },
    ],
    [
      "step 1",
      learningCard(1),
      { step: 0, due: NOW + 1 * MIN },
      { interval: 1, due: startOfDay("2026-01-16"), reps: 1 },
    ],
  ];

  for (const [name, card, again, good] of cases) {
    it(`${name}: again and good follow the table`, () => {
      const a = review(card, "again", NOW);
      expect(a).toMatchObject({ ...again, state: "learning", lapses: 0 });
      const g = review(card, "good", NOW);
      expect(g).toMatchObject(good);
      for (const r of [a, g]) {
        expect(r.ease).toBe(card.ease);
        expect(r.lastReviewed).toBe(NOW);
        expect(r.introduced).toBe(card.introduced);
      }
    });
  }

  it("graduation removes step and goes to the review phase", () => {
    const done = review(learningCard(1), "good", NOW);
    expect("step" in done).toBe(false);
    expect(done).toMatchObject({ interval: 1, state: "learning" });
  });

  it("newCard without step and lastReviewed null follows the learning table, not the formula", () => {
    const n = newCard("v", "de-es", NOW);
    expect(n.step).toBeUndefined();
    expect(n.lastReviewed).toBeNull();
    expect(n.introduced).toBe(NOW);
    const g = review(n, "good", NOW);
    expect(g).toMatchObject({ step: 1, due: NOW + 10 * MIN, interval: 0 });
    expect(g.reps).toBe(0);
  });

  it("introduced never changes over a series of ratings", () => {
    let c = newCard("v", "de-es", NOW);
    let t = NOW;
    for (const grade of ["again", "good", "good", "again", "good", "good"]) {
      t += 5 * MIN;
      c = review(c, grade as "again" | "good", t);
      expect(c.introduced).toBe(NOW);
      expect(c.lastReviewed).toBe(t);
    }
  });

  it("graduation uses the 04:00 rule: 02:00 -> due today 04:00, preview still 1 T", () => {
    const night = new Date(2026, 0, 15, 2, 0).getTime(); // dayKey 2026-01-14
    const s1 = learningCard(1, { lastReviewed: night - MIN, due: night });
    const done = review(s1, "good", night);
    expect(done.due).toBe(startOfDay("2026-01-15"));
    expect(previewIntervals(s1, night).good).toEqual({ days: 1 });
  });
});

describe("relearning phase (lapses > 0)", () => {
  const relearn = (over: Partial<Card> = {}) =>
    learningCard(1, { lapses: 1, interval: 1, ease: 2.3, ...over });

  it("again stays at step 1 in 10 min, ease unchanged", () => {
    const r = review(relearn(), "again", NOW);
    expect(r).toMatchObject({
      step: 1,
      due: NOW + 10 * MIN,
      ease: 2.3,
      lapses: 1,
      lastReviewed: NOW,
    });
  });

  it("good graduates with 1 day", () => {
    const r = review(relearn(), "good", NOW);
    expect("step" in r).toBe(false);
    expect(r).toMatchObject({
      interval: 1,
      due: startOfDay("2026-01-16"),
      ease: 2.3,
      lapses: 1,
      lastReviewed: NOW,
    });
  });
});

describe("review phase", () => {
  it("again (lapse): lapses +1, reps 0, ease -0.2, interval 1, step 1, due in 10 min", () => {
    const r = review(reviewCard(), "again", NOW);
    expect(r).toMatchObject({
      step: 1,
      due: NOW + 10 * MIN,
      lapses: 1,
      reps: 0,
      ease: 2.3,
      interval: 1,
      state: "learning",
      lastReviewed: NOW,
    });
    // Relearning: one "good" gives 1 day.
    const done = review(r, "good", NOW + 10 * MIN);
    expect(done).toMatchObject({ interval: 1, lapses: 1 });
    expect(done.due).toBe(startOfDay("2026-01-16"));
  });

  it("good: interval = round(interval * ease), ease +0.05, base is today", () => {
    const r = review(reviewCard(), "good", NOW);
    expect(r.interval).toBe(15);
    expect(r.ease).toBe(2.55);
    expect(r.reps).toBe(4);
    expect(r.due).toBe(startOfDay("2026-01-30"));
    expect(r.step).toBeUndefined();
    expect(r.lastReviewed).toBe(NOW);
  });

  it("good uses at least interval + 1 (interval 1, ease 1.3 -> 2 T)", () => {
    const r = review(
      reviewCard({ interval: 1, ease: 1.3, due: startOfDay("2026-01-15") }),
      "good",
      NOW,
    );
    expect(r.interval).toBe(2);
    expect(r.due).toBe(startOfDay("2026-01-17"));
  });

  it("bonus for late cards: interval 10, ease 2.5, 3 days overdue -> 29 T, counted from today", () => {
    const r = review(
      reviewCard({ interval: 10, ease: 2.5, due: startOfDay("2026-01-12") }),
      "good",
      NOW,
    );
    expect(r.interval).toBe(29);
    expect(r.due).toBe(startOfDay("2026-02-13"));
  });

  it("a card that is not due counts as on time (late = 0)", () => {
    const r = review(
      reviewCard({ interval: 10, ease: 2.5, due: startOfDay("2026-01-20") }),
      "good",
      NOW,
    );
    expect(r.interval).toBe(25);
    expect(r.due).toBe(startOfDay("2026-02-09"));
  });

  it("ease is rounded to 2 decimals", () => {
    expect(review(reviewCard({ ease: 2.35 }), "good", NOW).ease).toBe(2.4);
    expect(review(reviewCard({ ease: 2.35 }), "again", NOW).ease).toBe(2.15);
  });

  it("ease stays within 1.3 and 3.0", () => {
    let c = reviewCard();
    for (let i = 0; i < 20; i++)
      c = review(reviewCard({ ease: c.ease }), "again", NOW);
    expect(c.ease).toBe(MIN_EASE);
    let g = reviewCard({ ease: 2.9 });
    for (let i = 0; i < 20; i++)
      g = review(reviewCard({ ease: g.ease }), "good", NOW);
    expect(g.ease).toBe(MAX_EASE);
  });

  it("MAX_INTERVAL caps the interval", () => {
    const r = review(reviewCard({ interval: 30000, ease: 3.0 }), "good", NOW);
    expect(r.interval).toBe(MAX_INTERVAL);
  });

  it("state becomes mature at 21 days", () => {
    expect(review(reviewCard({ interval: 9 }), "good", NOW).state).toBe(
      "mature",
    ); // round(9 * 2.5) = 23
    expect(review(reviewCard({ interval: 8 }), "good", NOW).state).toBe(
      "learning",
    ); // 20
  });

  it("only good, on time: about 1, 3, 8, 21, 56 days, mature from 21", () => {
    let t = NOW;
    let c = review(newCard("v", "de-es", t), "good", t);
    t += 10 * MIN;
    c = review(c, "good", t);
    const seq = [c.interval];
    const states = [c.state];
    for (let i = 0; i < 4; i++) {
      t = c.due;
      c = review(c, "good", t);
      seq.push(c.interval);
      states.push(c.state);
    }
    expect(seq).toEqual([1, 3, 8, 21, 56]);
    expect(states).toEqual([
      "learning",
      "learning",
      "learning",
      "mature",
      "mature",
    ]);
  });
});

describe("previewIntervals and formatInterval", () => {
  it("new card: 1 Min / 10 Min", () => {
    const p = previewIntervals(newCard("v", "de-es", NOW), NOW);
    expect(p).toEqual({ again: { minutes: 1 }, good: { minutes: 10 } });
  });

  it("step 1: 1 Min / 1 T; relearning: 10 Min / 1 T", () => {
    expect(previewIntervals(learningCard(1), NOW)).toEqual({
      again: { minutes: 1 },
      good: { days: 1 },
    });
    expect(
      previewIntervals(learningCard(1, { lapses: 2, interval: 1 }), NOW),
    ).toEqual({ again: { minutes: 10 }, good: { days: 1 } });
  });

  it("review phase: 10 Min / days", () => {
    const p = previewIntervals(reviewCard(), NOW);
    expect(p).toEqual({ again: { minutes: 10 }, good: { days: 15 } });
  });

  it("formats minutes, hours, days, months and years with a decimal comma", () => {
    expect(formatInterval({ minutes: 1 })).toBe("1 Min");
    expect(formatInterval({ minutes: 10 })).toBe("10 Min");
    expect(formatInterval({ minutes: 60 })).toBe("1 Std");
    expect(formatInterval({ days: 1 })).toBe("1 T");
    expect(formatInterval({ days: 29 })).toBe("29 T");
    expect(formatInterval({ days: 60 })).toBe("2 Mon");
    expect(formatInterval({ days: 438 })).toBe("1,2 J");
    expect(formatInterval({ days: 730 })).toBe("2 J");
  });
});
