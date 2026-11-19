import { describe, expect, it } from "vitest";
import { GENDER_LABEL } from "./gender";

describe("GENDER_LABEL", () => {
  it("spells out all three genders as on the detail page", () => {
    expect(GENDER_LABEL).toEqual({
      m: "maskulin",
      f: "feminin",
      "m/f": "maskulin/feminin",
    });
  });
});
