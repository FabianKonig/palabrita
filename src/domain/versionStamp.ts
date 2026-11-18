/** Text, wenn der Zeitstempel nicht ermittelt werden kann (z. B. ohne Git-Verlauf). */
export const UNKNOWN_VERSION = "unbekannt";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Formatiert einen ISO-8601-Zeitstempel als `TT.MM.JJJJ, HH:MM UTC`.
 * Immer in UTC, damit alle Nutzer weltweit dieselbe Angabe sehen.
 */
export function formatVersionStamp(isoDate: string | null | undefined): string {
  if (!isoDate) return UNKNOWN_VERSION;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return UNKNOWN_VERSION;
  return (
    `${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}, ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
  );
}
