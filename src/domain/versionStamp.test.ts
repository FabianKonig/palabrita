import { describe, expect, it } from "vitest";
import { formatVersionStamp, UNKNOWN_VERSION } from "./versionStamp";

describe("formatVersionStamp", () => {
  it("formatiert UTC-Zeitstempel als TT.MM.JJJJ, HH:MM UTC", () => {
    expect(formatVersionStamp("2026-11-18T23:20:06+00:00")).toBe(
      "18.11.2026, 23:20 UTC",
    );
  });

  it("gibt bei unterschiedlichen Offsets dieselbe UTC-Angabe aus", () => {
    // Derselbe Moment, einmal als Berliner Zeit (+01:00) und einmal als
    // Mexiko-Zeit (-06:00) geschrieben.
    const berlin = formatVersionStamp("2026-11-19T00:20:06+01:00");
    const mexico = formatVersionStamp("2026-11-18T17:20:06-06:00");
    expect(berlin).toBe("18.11.2026, 23:20 UTC");
    expect(mexico).toBe(berlin);
  });

  it("füllt Tag, Monat und Stunde mit führender Null auf", () => {
    expect(formatVersionStamp("2026-01-02T03:04:00Z")).toBe(
      "02.01.2026, 03:04 UTC",
    );
  });

  it("liefert den Platzhalter bei fehlendem oder ungültigem Datum", () => {
    expect(formatVersionStamp(null)).toBe(UNKNOWN_VERSION);
    expect(formatVersionStamp(undefined)).toBe(UNKNOWN_VERSION);
    expect(formatVersionStamp("kein datum")).toBe(UNKNOWN_VERSION);
  });
});
