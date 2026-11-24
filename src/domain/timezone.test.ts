import { afterEach, describe, expect, it } from "vitest";
import { addDays, dayKey, diffDays, nextDayStart, startOfDay } from "./day";
import { newCard, review } from "./srs";
import type { Card } from "./types";
import { formatVersionStamp } from "./versionStamp";

/**
 * Zeitzonen (SPEC §11, „Zeitzonen und Reisen“). Die App nutzt immer die aktuelle Zeitzone des
 * Geräts. Diese Tests setzen `process.env.TZ` zur Laufzeit (Node wertet das bei jedem
 * `Date`-Zugriff neu aus), damit sie auf jedem Rechner und in der CI gleich laufen.
 */

const ZONES = [
  "Europe/Berlin", // Zielgruppe, Sommerzeit
  "America/Mexico_City", // UTC-6, seit 2022 ohne Sommerzeit
  "America/Guatemala", // UTC-6, ohne Sommerzeit
  "America/Cancun", // UTC-5
  "America/Hermosillo", // UTC-7 (Sonora)
  "America/Tijuana", // UTC-8, folgt der US-Sommerzeit
  "America/New_York",
  "Asia/Tokyo",
  "Pacific/Auckland", // UTC+12/+13, Sommerzeit auf der Südhalbkugel
] as const;

const originalTz = process.env.TZ;
afterEach(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

const setZone = (zone: string) => {
  process.env.TZ = zone;
};

const HOUR = 3_600_000;

describe.each(ZONES)("Tageswechsel in %s", (zone) => {
  it("trennt 03:59 und 04:00 lokale Zeit", () => {
    setZone(zone);
    expect(dayKey(new Date(2026, 0, 15, 3, 59).getTime())).toBe("2026-01-14");
    expect(dayKey(new Date(2026, 0, 15, 4, 0).getTime())).toBe("2026-01-15");
    expect(dayKey(new Date(2026, 6, 15, 3, 59).getTime())).toBe("2026-07-14");
    expect(dayKey(new Date(2026, 6, 15, 4, 0).getTime())).toBe("2026-07-15");
  });

  it("startOfDay und dayKey passen für jeden Tag von 2026 und 2027 zusammen (auch an Zeitumstellungen)", () => {
    setZone(zone);
    let key = "2026-01-01";
    let previousStart = startOfDay(addDays(key, -1));
    for (let i = 0; i < 730; i++) {
      const start = startOfDay(key);
      // 04:00 lokal gehört zum Tag selbst, die Millisekunde davor zum Vortag.
      expect(dayKey(start)).toBe(key);
      expect(dayKey(start - 1)).toBe(addDays(key, -1));
      // Ein Kalendertag ist 23 bis 25 Stunden lang (nie mehr, nie weniger).
      const length = start - previousStart;
      expect(length).toBeGreaterThanOrEqual(23 * HOUR);
      expect(length).toBeLessThanOrEqual(25 * HOUR);
      // addDays und diffDays sind Kalenderrechnung, unabhängig von der Zone.
      expect(diffDays(key, addDays(key, 1))).toBe(1);
      previousStart = start;
      key = addDays(key, 1);
    }
    expect(key).toBe("2028-01-01");
  });

  it("legt die Fälligkeit nach „Gewusst“ auf 04:00 lokal am Zieltag, auch über eine Zeitumstellung", () => {
    setZone(zone);
    const graduating = (now: number): Card => ({
      ...newCard("v", "de-es", now),
      step: 1,
    });
    // Abschluss an jedem Tag des Jahres 2026 um 23:00: Ziel ist jeweils der Folgetag 04:00.
    for (let day = 1; day <= 365; day++) {
      const now = new Date(2026, 0, day, 23, 0).getTime();
      const due = review(graduating(now), "good", now).due;
      expect(due).toBe(startOfDay(addDays(dayKey(now), 1)));
      expect(new Date(due).getHours()).toBe(4);
      expect(new Date(due).getMinutes()).toBe(0);
    }
  });
});

describe("Versionsstempel", () => {
  it.each(ZONES)("ist in %s immer dieselbe UTC-Angabe", (zone) => {
    setZone(zone);
    expect(formatVersionStamp("2026-11-18T23:20:06+00:00")).toBe(
      "18.11.2026, 23:20 UTC",
    );
  });
});

/**
 * Reisen: Gespeichert werden absolute Zeitpunkte, der Tag wird immer in der aktuellen Zone des
 * Geräts bestimmt. Wechselt die Zone, verschiebt sich, an welchem Tag ein gespeicherter
 * Zeitpunkt liegt. Das ist bewusst so (Option A, entschieden): die Tests halten das Verhalten
 * fest, damit eine spätere Änderung auffällt und nicht unbemerkt geschieht.
 */
describe("Reisen zwischen Zeitzonen (bekannte, bewusst akzeptierte Verschiebung)", () => {
  const graduate = (now: number): Card =>
    review({ ...newCard("v", "de-es", now), step: 1 }, "good", now);
  const isDueToday = (card: Card, now: number) => card.due < nextDayStart(now);

  it("Flug nach Westen: Eine Karte mit Intervall 1 T wird bis zu einen Tag früher fällig", () => {
    // Montag 23.11.2026, 21:00 in Berlin (20:00 UTC): „Gewusst“, fällig Dienstag 04:00 Berlin.
    setZone("Europe/Berlin");
    const rated = Date.parse("2026-11-23T20:00:00Z");
    const card = graduate(rated);
    expect(card.due).toBe(Date.parse("2026-11-24T03:00:00Z"));

    // Gleicher Moment später in Mexiko-Stadt (UTC-6): Montag 20:00, die Karte gilt als heute fällig.
    const later = Date.parse("2026-11-24T02:00:00Z");
    expect(isDueToday(card, later)).toBe(false); // noch in Berlin: erst morgen
    setZone("America/Mexico_City");
    expect(dayKey(later)).toBe("2026-11-23");
    expect(isDueToday(card, later)).toBe(true); // in Mexiko schon heute
  });

  it("Flug nach Osten: Die Fälligkeit bleibt am richtigen Datum, die Bewertung vom Vorabend zählt aber schon als „heute“", () => {
    // Montag 23.11.2026, 21:00 in Mexiko-Stadt (03:00 UTC Dienstag): fällig Dienstag 04:00 Mexiko.
    setZone("America/Mexico_City");
    const rated = Date.parse("2026-11-24T03:00:00Z");
    const card = graduate(rated);
    expect(card.due).toBe(Date.parse("2026-11-24T10:00:00Z"));

    // In Berlin (UTC+1) ist es Dienstag 09:00: Fälligkeit liegt am selben Datum (Dienstag).
    setZone("Europe/Berlin");
    const now = Date.parse("2026-11-24T08:00:00Z");
    expect(dayKey(now)).toBe("2026-11-24");
    expect(isDueToday(card, now)).toBe(true);
    expect(isDueToday(card, now - 24 * HOUR)).toBe(false);
    // Die Bewertung von Montag 21:00 Mexiko liegt in Berlin schon nach Dienstag 04:00:
    // sie zählt dort als „heute bewertet“ (Tageslimit und Tagessperre der Partnerkarte).
    expect(card.lastReviewed).toBeGreaterThanOrEqual(startOfDay(dayKey(now)));
  });
});
