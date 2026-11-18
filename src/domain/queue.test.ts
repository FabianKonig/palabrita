import { describe, expect, it } from "vitest";
import { startOfDay } from "./day";
import {
  cardKey,
  MAX_LEARNING,
  pickNext,
  queueCounts,
  type PickInput,
} from "./queue";
import { newCard, review } from "./srs";
import type { Card, Settings, Vocab } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const NOW = new Date(2026, 0, 15, 10, 0).getTime(); // dayKey 2026-01-15
const TOMORROW_4 = new Date(2026, 0, 16, 4, 0).getTime();
const MIN = 60_000;

function vocab(id: string, over: Partial<Vocab> = {}): Vocab {
  return {
    id,
    de: ["x"],
    es: id,
    pos: "noun",
    level: "A1",
    topic: "essen",
    example: { es: "a", de: "b" },
    ...over,
  };
}

function settings(over: Partial<Settings> = {}): Settings {
  return { ...DEFAULT_SETTINGS, ...over };
}

/** Card in the review phase. */
function card(vocabId: string, dir: Card["dir"], due: number): Card {
  return {
    ...newCard(vocabId, dir, NOW),
    due,
    interval: 3,
    reps: 2,
    lastReviewed: NOW - 1,
    state: "learning",
  };
}

/** Card in the learning phase. */
function learning(
  vocabId: string,
  dir: Card["dir"],
  due: number,
  step: 0 | 1 = 0,
): Card {
  return { ...card(vocabId, dir, due), interval: 1, reps: 0, step };
}

const pick = (over: Partial<PickInput> = {}) =>
  pickNext({
    settings: settings(),
    vocab: [],
    cards: [],
    now: NOW,
    sessionSeen: new Set(),
    lastShown: null,
    ...over,
  });

const id = (p: ReturnType<typeof pick>) =>
  p ? `${p.item.vocabId}:${p.item.dir}` : null;

const many = (n: number) =>
  Array.from({ length: n }, (_, i) =>
    vocab(`v${String(i + 1).padStart(3, "0")}`),
  );

describe("pickNext priorities", () => {
  it("1: due learning cards first, most overdue first", () => {
    const v = many(4);
    const p = pick({
      vocab: v,
      settings: settings({ direction: "de-es" }),
      cards: [
        card("v001", "de-es", startOfDay("2026-01-14")), // review due
        learning("v002", "de-es", NOW - MIN),
        learning("v003", "de-es", NOW - 10 * MIN),
      ],
    });
    expect(id(p)).toBe("v003:de-es");
    expect(p?.kind).toBe("learning");
  });

  it("2: due reviews sorted by due, before new cards", () => {
    const v = many(3);
    const p = pick({
      vocab: v,
      settings: settings({ direction: "de-es" }),
      cards: [
        card("v001", "de-es", startOfDay("2026-01-15")),
        card("v002", "de-es", startOfDay("2026-01-10")),
      ],
    });
    expect(id(p)).toBe("v002:de-es");
    expect(p?.kind).toBe("review");
  });

  it("due boundary: due = tomorrow 04:00 is not due, 03:59 is", () => {
    const v = many(2);
    const cards = [
      card("v001", "de-es", TOMORROW_4),
      card("v002", "de-es", TOMORROW_4 - MIN),
    ];
    const s = settings({ direction: "de-es" });
    expect(id(pick({ vocab: v, cards, settings: s }))).toBe("v002:de-es");
    expect(queueCounts({ vocab: v, cards, settings: s, now: NOW }).due).toBe(1);
  });

  it("a learning card after 5 min comes before new cards", () => {
    const v = many(3);
    const cards = [learning("v001", "de-es", NOW + 5 * MIN)];
    const s = settings({ direction: "de-es" });
    // before the wait is over: a new card is introduced
    expect(id(pick({ vocab: v, cards, settings: s }))).toBe("v002:de-es");
    // after 5 minutes the learning card wins over the new card
    const later = pick({ vocab: v, cards, settings: s, now: NOW + 5 * MIN });
    expect(id(later)).toBe("v001:de-es");
    expect(later?.kind).toBe("learning");
  });

  it("3: new cards: own words first (createdAt), then static by id", () => {
    const v = [
      vocab("v0001"),
      vocab("u1", {
        level: null,
        origin: "user",
        createdAt: 200,
        topic: "eigene",
      }),
      vocab("u0", {
        level: null,
        origin: "user",
        createdAt: 100,
        topic: "eigene",
      }),
    ];
    const s = settings({ maxLevel: "A1", direction: "de-es" });
    const order: string[] = [];
    let cards: Card[] = [];
    for (let i = 0; i < 3; i++) {
      const p = pick({ vocab: v, settings: s, cards });
      order.push(id(p)!);
      cards = [...cards, learning(p!.item.vocabId, p!.item.dir, NOW + MIN)];
    }
    expect(order).toEqual(["u0:de-es", "u1:de-es", "v0001:de-es"]);
  });

  it("MAX_LEARNING caps new cards: 25 learning -> no 26th, 24 -> new one", () => {
    expect(MAX_LEARNING).toBe(25);
    const v = many(30);
    const s = settings({ direction: "de-es" });
    const mk = (n: number) =>
      v.slice(0, n).map((x) => learning(x.id, "de-es", NOW + 20 * MIN));
    expect(pick({ vocab: v, settings: s, cards: mk(24) })?.kind).toBe("new");
    const full = pick({ vocab: v, settings: s, cards: mk(25) });
    expect(full?.kind).toBe("early-learning"); // stage 4, no new card
    expect(full?.item.card).not.toBeNull();
  });

  it("4: waiting learning cards are shown right away, earliest due first, lastShown avoided", () => {
    const v = many(15);
    const cards = v.map((x, i) => learning(x.id, "de-es", NOW + (i + 1) * MIN));
    const s = settings({ direction: "de-es" });
    expect(id(pick({ vocab: v, settings: s, cards }))).toBe("v001:de-es");
    const p = pick({
      vocab: v,
      settings: s,
      cards,
      lastShown: cardKey("v001", "de-es"),
    });
    expect(id(p)).toBe("v002:de-es");
    expect(p?.kind).toBe("early-learning");
  });

  it("4 before 5: a waiting learning card beats an early review", () => {
    const v = many(15);
    const cards = [
      ...v.slice(0, 14).map((x) => learning(x.id, "de-es", NOW + 20 * MIN)),
      card("v015", "de-es", TOMORROW_4 + 1000), // not due
    ];
    const p = pick({
      vocab: v,
      settings: settings({ direction: "de-es" }),
      cards,
    });
    expect(p?.kind).toBe("early-learning");
    expect(id(p)).toBe("v001:de-es");
  });

  it("regression: rapid 'good' on learning cards never falls back to two review cards", () => {
    // Bug: the two graduated review cards (stage 5) ran before the learning cards
    // (stage 4), so only those two alternated for the whole session.
    const v = many(40);
    const s = settings({ direction: "de-es" });
    // 25 learning cards in step 1, due in 30 min, plus 2 graduated review cards.
    let cards: Card[] = [
      ...v
        .slice(0, MAX_LEARNING)
        .map((x, i) => learning(x.id, "de-es", NOW + (30 * MIN + i * 1000), 1)),
      card("v030", "de-es", TOMORROW_4 + 1000),
      card("v031", "de-es", TOMORROW_4 + 2000),
    ];
    let now = NOW + 40 * MIN; // all learning cards are due now
    let last: string | null = null;
    const picked: string[] = [];
    for (let i = 0; i < 2 * MAX_LEARNING; i++) {
      const p = pick({ vocab: v, cards, settings: s, now, lastShown: last });
      expect(p).not.toBeNull();
      expect(p?.kind).not.toBe("pass");
      const key = cardKey(p!.item.vocabId, p!.item.dir);
      picked.push(key);
      // "Gewusst" on a card in step 1 graduates it; a new card is stored as a learning card.
      const base = p!.item.card ?? newCard(p!.item.vocabId, p!.item.dir, now);
      const next = review(base, "good", now);
      cards = [...cards.filter((c) => cardKey(c.vocabId, c.dir) !== key), next];
      last = key;
      now += 1000;
    }
    // The two review cards were never picked, while learning cards were available.
    expect(picked).not.toContain("v030:de-es");
    expect(picked).not.toContain("v031:de-es");
  });

  it("5 only when no learning card is waiting: the pass takes over", () => {
    const v = many(2);
    const cards = [
      card("v001", "de-es", TOMORROW_4 + 1000),
      card("v002", "de-es", TOMORROW_4 + 2000),
    ];
    const p = pick({
      vocab: v,
      cards,
      settings: settings({ direction: "de-es" }),
    });
    expect(p?.kind).toBe("pass");
  });

  it("5: pass over early reviews by due, skips sessionSeen, starts over at the end", () => {
    const v = many(2);
    const cards = [
      card("v001", "de-es", TOMORROW_4 + 5000),
      card("v002", "de-es", TOMORROW_4 + 1000),
    ];
    const s = settings({ direction: "de-es" });
    expect(id(pick({ vocab: v, cards, settings: s }))).toBe("v002:de-es");
    const seen = new Set([cardKey("v002", "de-es")]);
    expect(id(pick({ vocab: v, cards, settings: s, sessionSeen: seen }))).toBe(
      "v001:de-es",
    );
    seen.add(cardKey("v001", "de-es"));
    const wrapped = pick({ vocab: v, cards, settings: s, sessionSeen: seen });
    expect(id(wrapped)).toBe("v002:de-es");
    expect(wrapped?.newPass).toBe(true);
  });

  it("lastShown is not repeated immediately when another card exists", () => {
    const v = many(2);
    const cards = [
      card("v001", "de-es", TOMORROW_4 + 1000),
      card("v002", "de-es", TOMORROW_4 + 5000),
    ];
    const p = pick({
      vocab: v,
      cards,
      settings: settings({ direction: "de-es" }),
      lastShown: cardKey("v001", "de-es"),
    });
    expect(id(p)).toBe("v002:de-es");
  });

  it("a single card is shown again when there is no other one", () => {
    const v = many(1);
    const cards = [learning("v001", "de-es", NOW + 5 * MIN)];
    const p = pick({
      vocab: v,
      cards,
      settings: settings({ direction: "de-es" }),
      lastShown: cardKey("v001", "de-es"),
    });
    expect(id(p)).toBe("v001:de-es");
  });

  it("6: empty selection returns null", () => {
    expect(pick({ vocab: [] })).toBeNull();
    expect(
      pick({ vocab: many(2), filters: { topic: "gibtesnicht" } }),
    ).toBeNull();
  });
});

describe("partner cards", () => {
  const v = [vocab("v001"), vocab("v002")];

  it("both: ES->DE stays locked until DE->ES left the learning phase", () => {
    const s = settings({ direction: "both" });
    // v001 de-es still learning: next new card is v002 de-es, not v001 es-de
    let cards: Card[] = [learning("v001", "de-es", NOW + 5 * MIN)];
    expect(id(pick({ vocab: v, settings: s, cards }))).toBe("v002:de-es");
    // v001 de-es graduated: v001 es-de may be introduced (first new in order)
    cards = [card("v001", "de-es", TOMORROW_4 + 1000)];
    expect(id(pick({ vocab: v, settings: s, cards }))).toBe("v001:es-de");
  });

  it("only locked partner cards: stage 3 is skipped", () => {
    const one = [vocab("v001")];
    const s = settings({ direction: "both" });
    const cards = [learning("v001", "de-es", NOW + 5 * MIN)];
    const p = pick({ vocab: one, settings: s, cards });
    expect(p?.kind).toBe("early-learning");
  });

  it("direction es-de only: no self lock without a de-es card", () => {
    const p = pick({ vocab: v, settings: settings({ direction: "es-de" }) });
    expect(id(p)).toBe("v001:es-de");
    expect(p?.kind).toBe("new");
  });

  it("session filter direction overrides the setting for the lock", () => {
    const p = pick({
      vocab: v,
      settings: settings({ direction: "both" }),
      filters: { direction: "es-de" },
    });
    expect(id(p)).toBe("v001:es-de");
  });
});

describe("visibility and filters", () => {
  it("filters by maxLevel", () => {
    const v = [vocab("v1", { level: "A1" }), vocab("v2", { level: "B1" })];
    const a = pick({
      vocab: v,
      settings: settings({ maxLevel: "A1", direction: "de-es" }),
    });
    expect(id(a)).toBe("v1:de-es");
    expect(
      queueCounts({
        vocab: v,
        cards: [],
        now: NOW,
        settings: settings({ maxLevel: "A1", direction: "de-es" }),
      }).fresh,
    ).toBe(1);
  });

  it("ignores cards of hidden vocab, hidden directions and unknown ids", () => {
    const v = [vocab("v1", { level: "B1" }), vocab("v2")];
    const s = settings({ maxLevel: "A1", direction: "de-es" });
    const cards = [
      card("v1", "de-es", 0),
      card("v2", "es-de", 0),
      card("gone", "de-es", 0),
    ];
    expect(queueCounts({ vocab: v, cards, now: NOW, settings: s }).due).toBe(0);
    expect(id(pick({ vocab: v, cards, settings: s }))).toBe("v2:de-es");
  });

  it("level filter excludes user words, topic filter selects them", () => {
    const v = [
      vocab("v1"),
      vocab("u1", {
        level: null,
        origin: "user",
        createdAt: 1,
        topic: "eigene",
      }),
    ];
    const s = settings({ direction: "de-es" });
    expect(id(pick({ vocab: v, settings: s, filters: { level: "A1" } }))).toBe(
      "v1:de-es",
    );
    expect(
      id(pick({ vocab: v, settings: s, filters: { topic: "eigene" } })),
    ).toBe("u1:de-es");
  });

  it("filters by pos", () => {
    const v = [
      vocab("v1"),
      vocab("v2", { pos: "verb", verb: { tags: [], reflexive: false } }),
    ];
    const s = settings({ direction: "de-es" });
    expect(id(pick({ vocab: v, settings: s, filters: { pos: "verb" } }))).toBe(
      "v2:de-es",
    );
    expect(id(pick({ vocab: v, settings: s, filters: { pos: "noun" } }))).toBe(
      "v1:de-es",
    );
  });
});

describe("queueCounts", () => {
  it("counts due learning cards, due reviews and uncapped new cards", () => {
    const v = many(30);
    const cards = [
      learning("v001", "de-es", NOW - MIN), // due
      learning("v002", "de-es", NOW + 20 * MIN), // waiting, not counted
      card("v003", "de-es", startOfDay("2026-01-15")), // due
      card("v004", "de-es", TOMORROW_4), // not due
    ];
    const c = queueCounts({
      vocab: v,
      cards,
      now: NOW,
      settings: settings({ direction: "de-es" }),
    });
    expect(c).toEqual({ due: 2, fresh: 26 });
  });
});
