import { describe, expect, it } from "vitest";
import { addDays, dayKey, startOfDay } from "./day";

describe("day", () => {
  it("belongs 03:59 to the previous day and 04:00 to the new day", () => {
    expect(dayKey(new Date(2026, 0, 15, 3, 59).getTime())).toBe("2026-01-14");
    expect(dayKey(new Date(2026, 0, 15, 4, 0).getTime())).toBe("2026-01-15");
    expect(dayKey(new Date(2026, 0, 15, 23, 59).getTime())).toBe("2026-01-15");
  });

  it("crosses month and year boundaries", () => {
    expect(dayKey(new Date(2026, 0, 1, 2, 0).getTime())).toBe("2025-12-31");
    expect(dayKey(new Date(2026, 2, 1, 3, 0).getTime())).toBe("2026-02-28");
  });

  it("startOfDay is 04:00 local", () => {
    expect(startOfDay("2026-01-15")).toBe(
      new Date(2026, 0, 15, 4, 0).getTime(),
    );
  });

  it("addDays works on calendar days", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30"); // across a typical DST change
  });
});
