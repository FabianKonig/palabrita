import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { conjugate } from "../../domain/conjugation";
import type { Vocab } from "../../domain/types";
import { NOTATIONS } from "./notations";

/** Every single label the legend explains, e.g. "e → ie", "e → ie, e → i" and its parts. */
const EXPLAINED = new Set<string>();
for (const { mark } of NOTATIONS) {
  for (const [, inner] of mark.matchAll(/\(([^)]+)\)/g)) {
    EXPLAINED.add(inner);
    inner.split(", ").forEach((part) => EXPLAINED.add(part));
  }
}

const VOCAB_DIR = join(process.cwd(), "public", "vocab");
const verbs: Vocab[] = readdirSync(VOCAB_DIR)
  .filter((f) => f.endsWith(".json") && f !== "index.json")
  .flatMap((f) => {
    const data = JSON.parse(readFileSync(join(VOCAB_DIR, f), "utf8")) as
      Vocab[] | { entries: Vocab[] };
    return Array.isArray(data) ? data : data.entries;
  })
  .filter((v) => v.pos === "verb" && v.verb);

describe("legend", () => {
  it("explains every notation any verb of the vocabulary shows", () => {
    expect(verbs.length).toBeGreaterThan(50);
    const missing = new Set<string>();
    for (const v of verbs)
      for (const label of conjugate(v).labels)
        if (!EXPLAINED.has(label)) missing.add(`${label} (${v.es})`);
    expect([...missing]).toEqual([]);
  });

  it("explains all notations the app can generate (also for user words)", () => {
    const all = [
      "e → ie",
      "o → ue",
      "u → ue",
      "e → i",
      "e → ie, e → i",
      "o → ue, o → u",
      "-go",
      "-zco",
      "-oy",
      "i → y",
      "irr.",
      "Pretérito irr.",
      "Futuro irr.",
      "Pretérito/Futuro irr.",
      "c → qu",
      "z → c",
      "g → gu",
      "gu → gü",
      "g → j",
      "gu → g",
      "c → z",
    ];
    expect(all.filter((l) => !EXPLAINED.has(l))).toEqual([]);
  });

  it("describes (-go) as a yo form that other forms build on, not as the only irregularity", () => {
    const go = NOTATIONS.find((n) => n.mark === "(-go)");
    expect(go?.meaning).toMatch(/1\. Person Singular/);
    expect(go?.meaning).toMatch(/Subjuntivo/);
    expect(go?.meaning).not.toMatch(/Nur die 1\. Person/);
  });

  it("shows tener with its combined notation as the example", () => {
    const combo = NOTATIONS.find((n) => n.example.startsWith("tener ("));
    expect(combo?.example).toContain(
      "tener (e → ie, -go, Pretérito/Futuro irr.)",
    );
  });
});
