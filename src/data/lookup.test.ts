import { describe, expect, it } from "vitest";
import casa from "../domain/lookup/fixtures/casa.json";
import esPalabra from "../domain/lookup/fixtures/es-palabra.json";
import esPuedo from "../domain/lookup/fixtures/es-puedo.json";
import unknown from "../domain/lookup/fixtures/zzzxqwk.json";
import { lookupWord } from "./lookup";

const MISSING = { error: { code: "missingtitle" } };

function fakeFetch(body: unknown, ok = true): typeof fetch {
  return (() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(body),
    })) as unknown as typeof fetch;
}

/** Answers per host and records the requested URLs. */
function perHost(
  bodies: Record<string, unknown>,
  seen: string[] = [],
): typeof fetch {
  return ((url: string) => {
    seen.push(url);
    const host = new URL(url).host;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(bodies[host] ?? MISSING),
    });
  }) as unknown as typeof fetch;
}

describe("lookupWord", () => {
  it("finds a word on de.wiktionary.org", async () => {
    const r = await lookupWord("casa", fakeFetch(casa));
    expect(r.status).toBe("ok");
    if (r.status === "ok") {
      expect(r.source).toBe("de");
      expect(r.result.candidates[0].es).toBe("la casa");
    }
  });

  it("reports notfound when neither wiktionary has the word", async () => {
    expect(await lookupWord("zzzxqwk", fakeFetch(unknown))).toEqual({
      status: "notfound",
    });
    expect(await lookupWord("zzzxqwk", perHost({}))).toEqual({
      status: "notfound",
    });
  });

  it("falls back to es.wiktionary.org when de has no page (palabra)", async () => {
    const r = await lookupWord(
      "palabra",
      perHost({ "es.wiktionary.org": esPalabra }),
    );
    expect(r.status).toBe("ok");
    if (r.status === "ok") {
      expect(r.source).toBe("es");
      expect(r.result.candidates[0]).toMatchObject({
        es: "la palabra",
        gender: "f",
        de: [],
      });
    }
  });

  it("falls back when de has a page without a Spanish section", async () => {
    const italianOnly = {
      parse: {
        wikitext: { "*": "== casa ({{Sprache|Italienisch}}) ==\n" },
      },
    };
    const r = await lookupWord(
      "puedo",
      perHost({
        "de.wiktionary.org": italianOnly,
        "es.wiktionary.org": esPuedo,
      }),
    );
    expect(r.status).toBe("ok");
    if (r.status === "ok") {
      expect(r.source).toBe("es");
      expect(r.result.inflectedOf).toBe("poder");
    }
  });

  it("does not ask es.wiktionary.org when de already has the word", async () => {
    const seen: string[] = [];
    await lookupWord("casa", perHost({ "de.wiktionary.org": casa }, seen));
    expect(seen).toHaveLength(1);
  });

  it("reports unavailable on network error and bad status", async () => {
    const failing = (() =>
      Promise.reject(new Error("offline"))) as typeof fetch;
    expect(await lookupWord("casa", failing)).toEqual({
      status: "unavailable",
    });
    expect(await lookupWord("casa", fakeFetch({}, false))).toEqual({
      status: "unavailable",
    });
  });

  it("sends only the typed word, to the two wiktionary hosts", async () => {
    const seen: string[] = [];
    await lookupWord("palabra", perHost({}, seen));
    expect(seen).toHaveLength(2);
    expect(seen[0]).toMatch(/^https:\/\/de\.wiktionary\.org\/w\/api\.php\?/);
    expect(seen[1]).toMatch(/^https:\/\/es\.wiktionary\.org\/w\/api\.php\?/);
    for (const u of seen) expect(u).toContain("page=palabra");
  });
});
