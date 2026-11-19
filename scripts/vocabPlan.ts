import type { Level } from "../src/domain/types";

/** Quota per topic and word class group. `misc` = adj, adv, num, other. */
export interface TopicPlan {
  key: string;
  label: string;
  file: string;
  /** Reserved ID range (inclusive) for new entries, e.g. 26..75 = v0026..v0075. */
  idStart: number;
  idEnd: number;
  quota: { verb: number; noun: number; misc: number; phrase: number };
  levels: Record<Level, number>;
}

/** The Seed vocabulary keeps its IDs wherever they are. */
export const SEED_ID_MAX = 25;

function plan(
  index: number,
  key: string,
  label: string,
  quota: [number, number, number, number],
  levels: [number, number, number],
  size = 50,
): TopicPlan {
  const idStart = SEED_ID_MAX + 1 + index * 50;
  return {
    key,
    label,
    file: `${key}.json`,
    idStart,
    idEnd: idStart + size - 1,
    quota: {
      verb: quota[0],
      noun: quota[1],
      misc: quota[2],
      phrase: quota[3],
    },
    levels: { A1: levels[0], A2: levels[1], B1: levels[2] },
  };
}

/** Totals include the Seed entries that live in the topic file. */
export const TOPICS: TopicPlan[] = [
  plan(0, "begruessung", "Begrüßung & Höflichkeit", [4, 6, 6, 24], [16, 16, 8]),
  plan(1, "zahlen-zeit", "Zahlen & Zeit", [6, 16, 16, 4], [17, 17, 8]),
  plan(2, "essen", "Essen & Trinken", [12, 28, 6, 4], [20, 20, 10]),
  plan(3, "transport", "Unterwegs & Transport", [10, 20, 6, 6], [17, 17, 8]),
  plan(4, "unterkunft", "Unterkunft", [8, 22, 6, 4], [15, 17, 8]),
  plan(5, "einkaufen", "Einkaufen & Geld", [10, 18, 8, 6], [17, 17, 8]),
  plan(6, "gesundheit", "Gesundheit & Notfall", [8, 20, 6, 6], [16, 16, 8]),
  plan(7, "natur", "Natur & Wetter", [6, 22, 10, 2], [16, 16, 8]),
  plan(8, "orte", "Orte & Wegbeschreibung", [6, 22, 10, 4], [17, 17, 8]),
  plan(9, "kultur", "Kultur & Feste", [8, 18, 6, 6], [15, 15, 8]),
  plan(10, "maya", "Maya & Geschichte", [6, 22, 6, 2], [14, 14, 8]),
  plan(11, "smalltalk", "Smalltalk & Alltag", [16, 8, 10, 16], [20, 20, 10]),
  plan(
    12,
    "grundwortschatz",
    "Grundwortschatz (häufigste Wörter)",
    [150, 60, 70, 20],
    [120, 120, 60],
    300,
  ),
];

export const TOPIC_KEYS = TOPICS.map((t) => t.key);

export function topicTotal(t: TopicPlan): number {
  return t.quota.verb + t.quota.noun + t.quota.misc + t.quota.phrase;
}

export const TOTAL_TARGET = TOPICS.reduce((n, t) => n + topicTotal(t), 0);
