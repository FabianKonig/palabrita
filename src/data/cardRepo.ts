import type { Card, Daily, Direction } from "../domain/types";
import { getDb } from "./db";

export async function getAllCards(): Promise<Card[]> {
  const db = await getDb();
  return db.getAll("cards");
}

export async function getCard(
  vocabId: string,
  dir: Direction,
): Promise<Card | undefined> {
  const db = await getDb();
  return db.get("cards", [vocabId, dir]);
}

/**
 * Stores a reviewed card and updates the daily counters in one transaction.
 * `wasNew` = the card did not exist before this review (counts towards newIntroduced).
 */
export async function saveReview(
  card: Card,
  wasNew: boolean,
  dayKey: string,
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["cards", "daily"], "readwrite");
  const daily: Daily = (await tx.objectStore("daily").get(dayKey)) ?? {
    dayKey,
    newIntroduced: 0,
    reviewed: 0,
  };
  daily.reviewed += 1;
  if (wasNew) daily.newIntroduced += 1;
  await Promise.all([
    tx.objectStore("cards").put(card),
    tx.objectStore("daily").put(daily),
    tx.done,
  ]);
}
