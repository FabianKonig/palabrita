import { describe, expect, it } from "vitest";
import { backdropFactor, shouldCloseOnRelease } from "./swipeClose";

describe("shouldCloseOnRelease", () => {
  it("schließt ab 30 % der Höhe, auch ohne Tempo", () => {
    expect(shouldCloseOnRelease(300, 1000, 0)).toBe(true);
    expect(shouldCloseOnRelease(299, 1000, 0)).toBe(false);
  });

  it("schließt bei schnellem kurzem Wisch", () => {
    expect(shouldCloseOnRelease(60, 1000, 0.8)).toBe(true);
  });

  it("schließt nicht bei Zucken (zu kurz) oder langsamem kurzem Zug", () => {
    expect(shouldCloseOnRelease(10, 1000, 2)).toBe(false);
    expect(shouldCloseOnRelease(100, 1000, 0.2)).toBe(false);
  });

  it("schließt nie bei Zug nach oben oder ohne Höhe", () => {
    expect(shouldCloseOnRelease(-200, 1000, 2)).toBe(false);
    expect(shouldCloseOnRelease(0, 1000, 2)).toBe(false);
    expect(shouldCloseOnRelease(100, 0, 2)).toBe(false);
  });
});

describe("backdropFactor", () => {
  it("blendet mit der Zugweite aus und bleibt in 0..1", () => {
    expect(backdropFactor(0, 400)).toBe(1);
    expect(backdropFactor(200, 400)).toBe(0.5);
    expect(backdropFactor(800, 400)).toBe(0);
    expect(backdropFactor(-50, 400)).toBe(1);
  });
});
