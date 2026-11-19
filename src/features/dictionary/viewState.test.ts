import { beforeEach, describe, expect, it } from "vitest";
import { EMPTY_FILTERS } from "../../domain/dictionary";
import {
  getSavedFilters,
  getSavedScroll,
  isDictionaryArea,
  onNavigate,
  resetDictionaryView,
  saveFilters,
  saveScroll,
} from "./viewState";

const FILTERS = { ...EMPTY_FILTERS, query: "ayuda", level: "A1" as const };

beforeEach(resetDictionaryView);

describe("dictionary view state", () => {
  it("starts unfiltered at the top", () => {
    expect(getSavedFilters()).toEqual(EMPTY_FILTERS);
    expect(getSavedScroll()).toBe(0);
  });

  it("remembers filters and scroll position", () => {
    saveFilters(FILTERS);
    saveScroll(1234);
    expect(getSavedFilters()).toEqual(FILTERS);
    expect(getSavedScroll()).toBe(1234);
  });

  it.each(["/dictionary", "/dictionary/v0042", "/legend"])(
    "keeps filters and scroll on %s (reached from the dictionary)",
    (path) => {
      saveFilters(FILTERS);
      saveScroll(500);
      onNavigate(path);
      expect(isDictionaryArea(path)).toBe(true);
      expect(getSavedFilters()).toEqual(FILTERS);
      expect(getSavedScroll()).toBe(500);
    },
  );

  it.each(["/", "/stats", "/more", "/settings"])(
    "resets filters and scroll when switching to %s",
    (path) => {
      saveFilters(FILTERS);
      saveScroll(500);
      onNavigate(path);
      expect(isDictionaryArea(path)).toBe(false);
      expect(getSavedFilters()).toEqual(EMPTY_FILTERS);
      expect(getSavedScroll()).toBe(0);
    },
  );

  it("does not treat similar paths as the dictionary area", () => {
    expect(isDictionaryArea("/dictionaryx")).toBe(false);
  });
});
