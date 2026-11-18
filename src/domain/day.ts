/** A day starts at 04:00 local time. */
export const DAY_START_HOUR = 4;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseKey(key: string): [number, number, number] {
  const [y, m, d] = key.split("-").map(Number);
  return [y, m, d];
}

/** Local date of (now - 4h) as 'YYYY-MM-DD'. */
export function dayKey(now: number): string {
  const d = new Date(now);
  d.setHours(d.getHours() - DAY_START_HOUR);
  return formatKey(d);
}

/** 04:00 local time of the given day key, in ms. */
export function startOfDay(key: string): number {
  const [y, m, d] = parseKey(key);
  return new Date(y, m - 1, d, DAY_START_HOUR, 0, 0, 0).getTime();
}

/** Adds calendar days to a day key (not 24h blocks, so DST changes do not shift anything). */
export function addDays(key: string, days: number): string {
  const [y, m, d] = parseKey(key);
  return formatKey(new Date(y, m - 1, d + days, 12, 0, 0, 0));
}

/** 04:00 of the day after the current day key: cards due strictly before are due today. */
export function nextDayStart(now: number): number {
  return startOfDay(addDays(dayKey(now), 1));
}

/** Calendar days from key a to key b (b - a). */
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = parseKey(a);
  const [by, bm, bd] = parseKey(b);
  return Math.round(
    (Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000,
  );
}
