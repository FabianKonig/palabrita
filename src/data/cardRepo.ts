import type { Card } from "../domain/types";
import { getDb } from "./db";

export async function getAllCards(): Promise<Card[]> {
  const db = await getDb();
  return db.getAll("cards");
}

/** Stores a reviewed card (one record per vocabulary entry and direction). */
export async function saveReview(card: Card): Promise<void> {
  const db = await getDb();
  await db.put("cards", card);
}
