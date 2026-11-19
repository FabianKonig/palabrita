import { describe, expect, it } from "vitest";
import type { Vocab } from "./types";
import { findDuplicate } from "./findDuplicate";

function v(id: string, es: string, pos: Vocab["pos"]): Vocab {
  return {
    id,
    es,
    pos,
    de: ["x"],
    level: "A1",
    topic: "t",
    added: "2026-11-19",
    example: { es: "a", de: "b" },
  };
}

describe("findDuplicate", () => {
  const all = [
    v("1", "la casa", "noun"),
    v("2", "la papa", "noun"),
    v("3", "poder", "verb"),
    v("4", "el poder", "noun"),
  ];

  it("exact: same form and part of speech, article and case ignored", () => {
    expect(findDuplicate(all, "Casa", "noun").exact?.id).toBe("1");
    expect(findDuplicate(all, "el casa", "noun").exact?.id).toBe("1");
  });

  it("similar: other part of speech", () => {
    const r = findDuplicate(all, "poder", "adj");
    expect(r.exact).toBeUndefined();
    expect(r.similar.map((s) => s.id)).toEqual(["3", "4"]);
  });

  it("similar: differs only by accent (papa/papá), both ways", () => {
    expect(findDuplicate(all, "papá", "noun").similar.map((s) => s.id)).toEqual(
      ["2"],
    );
    expect(findDuplicate(all, "papá", "noun").exact).toBeUndefined();
  });

  it("nothing found", () => {
    expect(findDuplicate(all, "gato", "noun")).toEqual({ similar: [] });
  });
});
