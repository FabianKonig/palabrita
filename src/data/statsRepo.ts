import type { Daily } from "../domain/types";
import { getDb } from "./db";

export async function getDaily(key: string): Promise<Daily | undefined> {
  const db = await getDb();
  return db.get("daily", key);
}
