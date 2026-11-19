import { describe, expect, it } from "vitest";
import { nextDayStart, startOfDay } from "./day";
import {
  cardKey,
  compareOrder,
  countIntroducedToday,
  LEARN_AHEAD_MIN,
  MORE_NEW_STEP,
  NEW_PER_DAY,
  pickNext,
  position,
  REVIEWS_PER_NEW,
  type NextPick,
  type PickInput,
} from "./queue";
import { review } from "./srs";
import type { Card, Direction, Settings, Vocab } from "./types";

const MIN = 60_000;
const DAY = 86_400_000;
const NOW = new Date(2026, 0, 15, 10, 0).getTime(); // dayKey 2026-01-15
const TODAY_4 = startOfDay("2026-01-15");
const TOMORROW_4 = startOfDay("2026-01-16");
const YESTERDAY = new Date(2026, 0, 14, 10, 0).getTime();
const LONG_AGO = new Date(2026, 0, 1, 10, 0).getTime();

const SETTINGS: Pick<Settings, "maxLevel" | "orderSeed" | "startedAt"> = {
  maxLevel: "B1",
  orderSeed: 1,
  startedAt: LONG_AGO,
};

function vocab(id: string, over: Partial<Vocab> = {}): Vocab {
  return {
    id,
    de: ["x"],
    es: id,
    pos: "noun",
    level: "A1",
    topic: "essen",
    added: "2026-01-01",
    example: { es: "a", de: "b" },
    ...over,
  };
}

/** Review card (no step), introduced long ago, last rated yesterday. */
function rev(
  vocabId: string,
  dir: Direction,
  due: number,
  over: Partial<Card> = {},
): Card {
  return {
    vocabId,
    dir,
    due,
    interval: 3,
    ease: 2.5,
    reps: 2,
    lapses: 0,
    lastReviewed: YESTERDAY,
    introduced: LONG_AGO,
    state: "learning",
    ...over,
  };
}

/** Partner card that locks nothing: not due, last rated before today. */
const released = (vocabId: string, dir: Direction) =>
  rev(vocabId, dir, TOMORROW_4 + 2 * DAY);

/** Learning card (new card in its learning steps), rated a minute ago. */
function learning(
  vocabId: string,
  dir: Direction,
  due: number,
  over: Partial<Card> = {},
): Card {
  return rev(vocabId, dir, due, {
    interval: 0,
    reps: 0,
    step: 0,
    lastReviewed: NOW - MIN,
    ...over,
  });
}

function pick(over: Partial<PickInput> = {}): NextPick | null {
  return pickNext({
    settings: SETTINGS,
    vocab: [],
    cards: [],
    now: NOW,
    filters: { direction: "both" },
    lastShown: null,
    reviewsSinceNew: 0,
    newLimit: NEW_PER_DAY,
    ...over,
  });
}

/** "vocabId:dir" of the picked card, or the kind for done/null. */
function id(p: NextPick | null): string {
  if (!p) return "null";
  if (p.kind === "done") return `done(${p.moreNew})`;
  return `${p.item.vocabId}:${p.item.dir}`;
}

/** Ids sorted by their position for the given seed. */
function byPosition(ids: string[], seed = SETTINGS.orderSeed): string[] {
  return [...ids].sort((a, b) => position(a, seed) - position(b, seed));
}

const ids = (n: number, prefix = "v") =>
  Array.from(
    { length: n },
    (_, i) => `${prefix}${String(i + 1).padStart(4, "0")}`,
  );

describe("constants", () => {
  it("match SPEC §12", () => {
    expect(NEW_PER_DAY).toBe(20);
    expect(REVIEWS_PER_NEW).toBe(4);
    expect(LEARN_AHEAD_MIN).toBe(20);
    expect(MORE_NEW_STEP).toBe(10);
  });
});

describe("stages", () => {
  it("due learning card before due review before new card", () => {
    const v = [vocab("a"), vocab("b"), vocab("c")];
    const l = learning("a", "de-es", NOW - MIN);
    const r = rev("b", "de-es", TODAY_4);
    const p1 = pick({ vocab: v, cards: [l, r] });
    expect(p1?.kind).toBe("learning");
    expect(id(p1)).toBe("a:de-es");
    const p2 = pick({ vocab: v, cards: [r] });
    expect(p2?.kind).toBe("review");
    expect(id(p2)).toBe("b:de-es");
    const p3 = pick({ vocab: v, cards: [] });
    expect(p3?.kind).toBe("new");
  });

  it("due learning cards: most overdue first", () => {
    const v = [vocab("a"), vocab("b")];
    const cards = [
      learning("a", "de-es", NOW - MIN),
      learning("b", "de-es", NOW - 5 * MIN),
    ];
    expect(id(pick({ vocab: v, cards }))).toBe("b:de-es");
  });

  it("learning card due in 15 min only when stage 1 and 2 are empty", () => {
    const v = [vocab("a"), vocab("b")];
    const ahead = learning("a", "de-es", NOW + 15 * MIN);
    // b has a due review: stage 2 wins
    const withReview = pick({
      vocab: v,
      cards: [ahead, rev("b", "de-es", TODAY_4), released("b", "es-de")],
    });
    expect(withReview?.kind).toBe("review");
    // b is new: stage 2 wins
    expect(pick({ vocab: v, cards: [ahead] })?.kind).toBe("new");
    // nothing else: learn ahead
    const only = pick({ vocab: [vocab("a")], cards: [ahead] });
    expect(only?.kind).toBe("learn-ahead");
    expect(id(only)).toBe("a:de-es");
  });

  it("learning card due in 25 min is not pulled ahead: done", () => {
    // Artificial card: review() never schedules more than 10 minutes.
    const p = pick({
      vocab: [vocab("a")],
      cards: [learning("a", "de-es", NOW + 25 * MIN)],
    });
    expect(p).toEqual({ kind: "done", moreNew: false });
  });
});

describe("mixing reviews and new cards", () => {
  const v = [...ids(10, "r").map((i) => vocab(i)), vocab("n")];
  const cards = ids(10, "r").flatMap((i) => [
    rev(i, "de-es", TODAY_4),
    released(i, "es-de"),
  ]);

  it("4 reviews, then 1 new card", () => {
    for (let n = 0; n < REVIEWS_PER_NEW; n++)
      expect(pick({ vocab: v, cards, reviewsSinceNew: n })?.kind).toBe(
        "review",
      );
    const p = pick({ vocab: v, cards, reviewsSinceNew: 4 });
    expect(p?.kind).toBe("new");
    expect(p && "item" in p && p.item.vocabId).toBe("n");
  });

  it("only one kind available: that kind", () => {
    expect(
      pick({ vocab: v.slice(0, 10), cards, reviewsSinceNew: 9 })?.kind,
    ).toBe("review");
    expect(pick({ vocab: v, cards: [], reviewsSinceNew: 0 })?.kind).toBe("new");
  });
});

describe("daily limit of new cards", () => {
  // 20 cards introduced and rated today, in the review phase and not due.
  const today = ids(20, "t").map((i) =>
    rev(i, "de-es", TOMORROW_4 + DAY, {
      introduced: TODAY_4 + 60 * MIN,
      lastReviewed: TODAY_4 + 60 * MIN,
    }),
  );
  // Their partners are locked (rated today), so extra vocabulary without cards is needed.
  const v = [...ids(20, "t").map((i) => vocab(i)), vocab("x1"), vocab("x2")];

  it("20 introduced today: no new card, done with moreNew", () => {
    expect(countIntroducedToday(today, NOW)).toBe(20);
    expect(pick({ vocab: v, cards: today })).toEqual({
      kind: "done",
      moreNew: true,
    });
  });

  it("newLimit 30: a new card again", () => {
    const p = pick({ vocab: v, cards: today, newLimit: 30 });
    expect(p?.kind).toBe("new");
    expect(["x1:de-es", "x1:es-de", "x2:de-es", "x2:es-de"]).toContain(id(p));
  });

  it("cards introduced yesterday do not count", () => {
    const old = today.map((c) => ({ ...c, introduced: YESTERDAY }));
    expect(countIntroducedToday(old, NOW)).toBe(0);
    expect(pick({ vocab: v, cards: old })?.kind).toBe("new");
  });

  it("only the locked partners left: done without moreNew", () => {
    expect(pick({ vocab: v.slice(0, 20), cards: today, newLimit: 30 })).toEqual(
      { kind: "done", moreNew: false },
    );
  });
});

describe("countIntroducedToday", () => {
  it("counts from today 04:00, not yesterday 03:59", () => {
    const cards = [
      rev("a", "de-es", TOMORROW_4, { introduced: TODAY_4 }),
      rev("b", "de-es", TOMORROW_4, { introduced: TODAY_4 - MIN }),
      rev("c", "es-de", TOMORROW_4, { introduced: NOW }),
    ];
    expect(countIntroducedToday(cards, NOW)).toBe(2);
  });
});

describe("daily lock of the partner card", () => {
  const ratedToday = (dir: Direction) =>
    rev("a", dir, TOMORROW_4 + 2 * DAY, { lastReviewed: NOW - 5 * MIN });

  it("de-es rated today: es-de (new) is not chosen, also with direction es-de", () => {
    const cards = [ratedToday("de-es")];
    expect(pick({ vocab: [vocab("a")], cards })).toEqual({
      kind: "done",
      moreNew: false,
    });
    expect(
      pick({ vocab: [vocab("a")], cards, filters: { direction: "es-de" } }),
    ).toEqual({ kind: "done", moreNew: false });
  });

  it("de-es rated today: es-de (due review) is not chosen", () => {
    const cards = [ratedToday("de-es"), rev("a", "es-de", TODAY_4)];
    expect(pick({ vocab: [vocab("a")], cards })?.kind).toBe("done");
    expect(
      pick({
        vocab: [vocab("a")],
        cards,
        filters: { direction: "es-de" },
      })?.kind,
    ).toBe("done");
  });

  it("de-es rated yesterday and not due: es-de is free", () => {
    const p = pick({ vocab: [vocab("a")], cards: [released("a", "de-es")] });
    expect(p?.kind).toBe("new");
    expect(id(p)).toBe("a:es-de");
  });

  it("learning cards are never locked", () => {
    const cards = [
      ratedToday("de-es"),
      learning("a", "es-de", NOW - MIN, { lastReviewed: NOW - 2 * MIN }),
    ];
    const p = pick({ vocab: [vocab("a")], cards });
    expect(p?.kind).toBe("learning");
    expect(id(p)).toBe("a:es-de");
  });
});

describe("review before new card", () => {
  // A has the first position of the two words.
  const [A, B] = byPosition(["w1", "w2"]);
  const v = [vocab(A), vocab(B)];
  const dueReview = rev(A, "de-es", TODAY_4); // graduated yesterday, due today

  it("due de-es review: the new card picks never es-de of this word", () => {
    for (const reviewsSinceNew of [0, 4, 7]) {
      const p = pick({ vocab: v, cards: [dueReview], reviewsSinceNew });
      expect(id(p)).not.toBe(`${A}:es-de`);
    }
    const p = pick({ vocab: v, cards: [dueReview], reviewsSinceNew: 4 });
    expect(p?.kind).toBe("new");
    expect(id(p)).toBe(`${B}:de-es`);
  });

  it("after rating de-es, es-de stays locked; the next day it is free", () => {
    const rated = review(dueReview, "good", NOW);
    expect(pick({ vocab: [vocab(A)], cards: [rated] })).toEqual({
      kind: "done",
      moreNew: false,
    });
    const nextDay = new Date(2026, 0, 16, 10, 0).getTime();
    expect(rated.due).toBeGreaterThan(nextDayStart(nextDay));
    const p = pick({ vocab: [vocab(A)], cards: [rated], now: nextDay });
    expect(p?.kind).toBe("new");
    expect(id(p)).toBe(`${A}:es-de`);
  });

  // Learning clause: rated 03:55 (still yesterday by the 04:00 rule), due 04:05, now 04:01.
  const at0401 = new Date(2026, 0, 15, 4, 1).getTime();
  const learningDeEs = learning(
    A,
    "de-es",
    new Date(2026, 0, 15, 4, 5).getTime(),
    {
      step: 1,
      lastReviewed: new Date(2026, 0, 15, 3, 55).getTime(),
    },
  );

  it("partner in the learning phase locks the new card", () => {
    const p = pick({ vocab: [vocab(A)], cards: [learningDeEs], now: at0401 });
    expect(p?.kind).toBe("learn-ahead");
    expect(id(p)).toBe(`${A}:de-es`);
  });

  it("the same situation with a partner that locks nothing: new es-de", () => {
    const p = pick({
      vocab: [vocab(A)],
      cards: [released(A, "de-es")],
      now: at0401,
    });
    expect(p?.kind).toBe("new");
    expect(id(p)).toBe(`${A}:es-de`);
  });

  it("direction es-de only: a due or learning de-es partner does not lock", () => {
    const filters = { direction: "es-de" as const };
    const p1 = pick({
      vocab: [vocab(A)],
      cards: [learningDeEs],
      now: at0401,
      filters,
    });
    expect(p1?.kind).toBe("new");
    expect(id(p1)).toBe(`${A}:es-de`);
    const p2 = pick({ vocab: [vocab(A)], cards: [dueReview], filters });
    expect(id(p2)).toBe(`${A}:es-de`);
  });
});

describe("compareOrder", () => {
  it("position, then vocabId, then de-es before es-de", () => {
    const k = (position: number, vocabId: string, dir: Direction) => ({
      position,
      vocabId,
      dir,
    });
    expect(compareOrder(k(1, "b", "es-de"), k(2, "a", "de-es"))).toBeLessThan(
      0,
    );
    expect(compareOrder(k(5, "a", "es-de"), k(5, "b", "de-es"))).toBeLessThan(
      0,
    );
    expect(compareOrder(k(5, "a", "de-es"), k(5, "a", "es-de"))).toBeLessThan(
      0,
    );
    expect(compareOrder(k(5, "a", "de-es"), k(5, "a", "de-es"))).toBe(0);
    // The two directions of one word lie next to each other.
    const sorted = [
      k(5, "b", "es-de"),
      k(5, "a", "es-de"),
      k(5, "b", "de-es"),
      k(5, "a", "de-es"),
    ].sort(compareOrder);
    expect(sorted.map((x) => `${x.vocabId}:${x.dir}`)).toEqual([
      "a:de-es",
      "a:es-de",
      "b:de-es",
      "b:es-de",
    ]);
  });
});

describe("due boundary at 04:00", () => {
  it("due tomorrow 04:00 is not due today, 03:59 is", () => {
    const filters = { direction: "de-es" as const };
    expect(
      pick({
        vocab: [vocab("a")],
        cards: [rev("a", "de-es", TOMORROW_4)],
        filters,
      }),
    ).toEqual({ kind: "done", moreNew: false });
    expect(
      pick({
        vocab: [vocab("a")],
        cards: [rev("a", "de-es", TOMORROW_4 - MIN)],
        filters,
      })?.kind,
    ).toBe("review");
  });
});

describe("position", () => {
  const all = ids(50);

  it("is fixed per seed and differs between seeds", () => {
    expect(position("v0042", 7)).toBe(position("v0042", 7));
    expect(byPosition(all, 1)).toEqual(byPosition(all, 1));
    expect(byPosition(all, 1)).not.toEqual(byPosition(all, 2));
    const p = position("v0042", 0xffffffff);
    expect(Number.isInteger(p) && p >= 0 && p <= 0xffffffff).toBe(true);
  });

  it("new cards follow the position, both directions of a word together", () => {
    const [first, second] = byPosition(["p1", "p2", "p3"]);
    const v = ["p1", "p2", "p3"].map((i) => vocab(i));
    expect(id(pick({ vocab: v }))).toBe(`${first}:de-es`);
    // released es-de of the first word comes before de-es of later words
    expect(id(pick({ vocab: v, cards: [released(first, "de-es")] }))).toBe(
      `${first}:es-de`,
    );
    expect(
      id(
        pick({
          vocab: v,
          cards: [released(first, "de-es"), released(first, "es-de")],
        }),
      ),
    ).toBe(`${second}:de-es`);
  });

  it("mixes the levels", () => {
    const levels = ["A1", "A2", "B1"] as const;
    const v = all.map((i, n) =>
      vocab(i, { level: levels[Math.floor(n / 17)] }),
    );
    const firstTen = byPosition(all)
      .slice(0, 10)
      .map((i) => v.find((x) => x.id === i)!.level);
    expect(new Set(firstTen).size).toBeGreaterThan(1);
  });

  it("does not cluster neighbouring ids (fmix32)", () => {
    const many = ids(800);
    let total = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const first = byPosition(many, seed).slice(0, 40);
      let pairs = 0;
      for (let i = 0; i < first.length; i++)
        for (let j = i + 1; j < first.length; j++)
          if (first[i].slice(0, -1) === first[j].slice(0, -1)) pairs++;
      total += pairs;
    }
    expect(total / 20).toBeLessThan(20);
  });
});

describe("newcomers", () => {
  const started = new Date(2026, 11, 1, 10, 0).getTime();
  const now = new Date(2026, 11, 10, 10, 0).getTime();
  const settings = { ...SETTINGS, startedAt: started };
  const old = ids(20, "o").map((i) => vocab(i, { added: "2026-11-19" }));

  it("an entry added after the first start comes before all other new cards", () => {
    const v = [
      ...old,
      vocab("late", { added: "2026-12-05" }),
      vocab("same", { added: "2026-12-01" }),
    ];
    // even before the released es-de card of an older word
    const [firstOld] = byPosition(old.map((x) => x.id));
    const cards = [
      rev(firstOld, "de-es", now + 3 * DAY, { lastReviewed: now - 3 * DAY }),
    ];
    const p = pick({ settings, vocab: v, cards, now });
    expect(id(p)).toBe("late:de-es");
    // without it, "same" (added on the day of the first start) is no newcomer
    const p2 = pick({
      settings,
      vocab: v.filter((x) => x.id !== "late"),
      cards,
      now,
    });
    expect(id(p2)).toBe(`${firstOld}:es-de`);
  });

  it("only within the filter", () => {
    const v = [...old, vocab("late", { added: "2026-12-05", topic: "orte" })];
    const p = pick({
      settings,
      vocab: v,
      now,
      filters: { direction: "both", topic: "essen" },
    });
    expect(id(p)).not.toBe("late:de-es");
    expect(id(p)).toBe(`${byPosition(old.map((x) => x.id))[0]}:de-es`);
  });

  it("several newcomers follow their position", () => {
    const fresh = ["n1", "n2", "n3", "n4"].map((i) =>
      vocab(i, { added: "2026-12-05" }),
    );
    const p = pick({ settings, vocab: [...old, ...fresh], now });
    expect(id(p)).toBe(`${byPosition(fresh.map((x) => x.id))[0]}:de-es`);
  });
});

describe("danger of due reviews", () => {
  it("1-day card 3 days overdue before 30-day card 3 days overdue", () => {
    // B gets the better position so that only the danger can decide.
    const [B, A] = byPosition(["d1", "d2"]);
    const v = [vocab(A), vocab(B)];
    const cards = [
      rev(A, "de-es", NOW - 3 * DAY, {
        interval: 1,
        lastReviewed: NOW - 4 * DAY,
      }),
      rev(B, "de-es", NOW - 3 * DAY, {
        interval: 30,
        lastReviewed: NOW - 33 * DAY,
      }),
    ];
    const p = pick({ vocab: v, cards, filters: { direction: "de-es" } });
    expect(p?.kind).toBe("review");
    expect(id(p)).toBe(`${A}:de-es`);
  });
});

describe("lastShown", () => {
  it("is skipped while another card of stage 1 to 3 is available", () => {
    const v = [vocab("a"), vocab("b")];
    const cards = [
      learning("a", "de-es", NOW - MIN),
      learning("b", "de-es", NOW + 5 * MIN),
    ];
    const p = pick({
      vocab: v,
      cards,
      lastShown: cardKey("a", "de-es"),
      filters: { direction: "de-es" },
    });
    expect(p?.kind).toBe("learn-ahead");
    expect(id(p)).toBe("b:de-es");
  });

  it("the only open learning card after 'again' is shown again, not done", () => {
    const l = review(
      rev("a", "de-es", NOW, { lastReviewed: null, introduced: NOW }),
      "again",
      NOW,
    );
    const p = pick({
      vocab: [vocab("a")],
      cards: [l],
      lastShown: cardKey("a", "de-es"),
    });
    expect(p?.kind).toBe("learn-ahead");
    expect(id(p)).toBe("a:de-es");
  });
});

describe("no loop", () => {
  it("2 words, both directions, always good, 8 s per rating: done after at most 4 ratings", () => {
    const v = [vocab("a"), vocab("b")];
    let cards: Card[] = [];
    let now = NOW;
    let lastShown: string | null = null;
    let reviewsSinceNew = 0;
    const shown: string[] = [];
    for (let i = 0; i < 10; i++) {
      const p = pick({ vocab: v, cards, now, lastShown, reviewsSinceNew });
      if (!p || p.kind === "done") break;
      const { item } = p;
      const base: Card = item.card ?? {
        vocabId: item.vocabId,
        dir: item.dir,
        due: now,
        interval: 0,
        ease: 2.5,
        reps: 0,
        lapses: 0,
        lastReviewed: null,
        introduced: now,
        state: "new",
      };
      const key = cardKey(item.vocabId, item.dir);
      cards = [
        ...cards.filter((c) => cardKey(c.vocabId, c.dir) !== key),
        review(base, "good", now),
      ];
      if (p.kind === "review") reviewsSinceNew++;
      if (p.kind === "new") reviewsSinceNew = 0;
      lastShown = key;
      shown.push(key);
      now += 8_000;
    }
    expect(shown.length).toBeLessThanOrEqual(4);
    expect(pick({ vocab: v, cards, now, lastShown, reviewsSinceNew })).toEqual({
      kind: "done",
      moreNew: false,
    });
    for (const w of ["a", "b"]) {
      const dirs = new Set(
        shown.filter((k) => k.startsWith(`${w}|`)).map((k) => k.split("|")[1]),
      );
      expect(dirs.size).toBeLessThanOrEqual(1);
    }
  });
});

describe("null and done", () => {
  it("null only for an empty selection", () => {
    expect(pick({ vocab: [] })).toBeNull();
    expect(
      pick({
        vocab: [vocab("a", { level: "B1" })],
        settings: { ...SETTINGS, maxLevel: "A1" },
      }),
    ).toBeNull();
    expect(
      pick({
        vocab: [vocab("a")],
        filters: { direction: "both", topic: "orte" },
      }),
    ).toBeNull();
  });

  it("vocabulary in the selection but nothing left for today: done", () => {
    const cards = [released("a", "de-es"), released("a", "es-de")];
    expect(pick({ vocab: [vocab("a")], cards })).toEqual({
      kind: "done",
      moreNew: false,
    });
  });
});
