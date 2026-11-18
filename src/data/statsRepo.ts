import { addDays, dayKey } from "../domain/day";
import type { Daily } from "../domain/types";
import { getDb } from "./db";

export async function getDaily(key: string): Promise<Daily | undefined> {
  const db = await getDb();
  return db.get("daily", key);
}

/**
 * Number of consecutive days with reviews, counted back from today.
 * If today has no review yet, counting starts yesterday (the streak only breaks
 * once yesterday was missed too).
 */
export function computeStreak(
  reviewedDays: ReadonlySet<string>,
  now: number,
): number {
  const today = dayKey(now);
  let cursor = reviewedDays.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (reviewedDays.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export async function getStreak(now: number): Promise<number> {
  const db = await getDb();
  const all = await db.getAll("daily");
  const days = new Set(all.filter((d) => d.reviewed > 0).map((d) => d.dayKey));
  return computeStreak(days, now);
}
