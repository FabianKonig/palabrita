import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "src/styles/global.css"), "utf8");

/** Dark theme variables: the `prefers-color-scheme` block and the forced `data-theme` block. */
function darkBlocks(): string[] {
  const auto =
    /@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\[data-theme="light"\]\) \{([^}]*)\}/.exec(
      css,
    );
  const forced = /:root\[data-theme="dark"\] \{([^}]*)\}/.exec(css);
  return [auto?.[1], forced?.[1]].filter((b): b is string => !!b);
}

const variable = (block: string, name: string) =>
  new RegExp(`${name}:\\s*#([0-9a-fA-F]{6})`).exec(block)?.[1] ?? "";

const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe("dark theme: reduced contrast (not black on white-ish)", () => {
  it("is defined both for the system setting and for the forced theme", () => {
    expect(darkBlocks()).toHaveLength(2);
  });

  it("uses a dark gray background, not near-black", () => {
    for (const block of darkBlocks()) {
      expect(luminance(variable(block, "--bg"))).toBeGreaterThan(0.015);
      expect(luminance(variable(block, "--surface"))).toBeGreaterThan(0.025);
    }
  });

  it("uses softened text, not near-white", () => {
    for (const block of darkBlocks()) {
      expect(luminance(variable(block, "--text"))).toBeLessThan(0.75);
    }
  });

  it("keeps text readable: contrast between 7:1 and 12:1 (WCAG AAA, but not harsh)", () => {
    for (const block of darkBlocks()) {
      const ratio = contrast(
        variable(block, "--text"),
        variable(block, "--bg"),
      );
      expect(ratio).toBeGreaterThan(7);
      expect(ratio).toBeLessThan(12);
      const muted = contrast(
        variable(block, "--muted"),
        variable(block, "--bg"),
      );
      expect(muted).toBeGreaterThan(4.5);
    }
  });

  it("uses identical values in both dark blocks", () => {
    const [auto, forced] = darkBlocks().map((b) =>
      [...b.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => `${m[1]}:${m[2]}`),
    );
    expect(forced).toEqual(auto);
  });
});

describe("form controls", () => {
  it("dropdowns have their own arrow with an inset from the right edge", () => {
    const rule =
      /select\.field,\s*\.setting select \{([^}]*)\}/.exec(css)?.[1] ?? "";
    expect(rule).toMatch(/appearance:\s*none/);
    expect(rule).toMatch(/background-image:\s*url\(/);
    expect(rule).toMatch(/background-position:\s*right (1[2-9]|2\d)px center/);
    expect(rule).toMatch(/padding-right:\s*(4\d|5\d)px/);
  });

  it("the auto-read toggle is styled as a switch", () => {
    expect(css).toMatch(/\.switch input \{[^}]*appearance:\s*none/);
    expect(css).toMatch(/\.switch input:checked \{/);
    expect(css).toMatch(/\.switch input::after \{/);
  });
});
