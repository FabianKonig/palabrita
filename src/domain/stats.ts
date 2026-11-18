import type { Card, CardStatus, Direction, Level, Vocab } from "./types";
import { isVisible } from "./types";

export type StatusCounts = Record<CardStatus, number>;
export type DirectionStats = Record<Direction, StatusCounts>;

function empty(): StatusCounts {
  return { new: 0, learning: 0, mature: 0 };
}

/**
 * Cards per maturity and direction, only for vocabulary visible at `maxLevel`.
 * "new" = visible vocabulary without a card in that direction (cards are created
 * on first review), plus stored cards that are still in state "new".
 */
export function computeStats(
  vocab: Iterable<Vocab>,
  cards: Card[],
  maxLevel: Level,
): DirectionStats {
  const result: DirectionStats = { "de-es": empty(), "es-de": empty() };
  const visible = new Map<string, Vocab>();
  for (const v of vocab) if (isVisible(v, maxLevel)) visible.set(v.id, v);

  const seen = new Set<string>();
  for (const c of cards) {
    if (!visible.has(c.vocabId)) continue;
    seen.add(`${c.vocabId}|${c.dir}`);
    result[c.dir][c.state] += 1;
  }
  for (const id of visible.keys()) {
    for (const dir of ["de-es", "es-de"] as const) {
      if (!seen.has(`${id}|${dir}`)) result[dir].new += 1;
    }
  }
  return result;
}
