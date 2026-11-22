import { describe, expect, it } from "vitest";
import type { FlagStore } from "./localFlag";
import { isVideoHintDone, markVideoHintDone } from "./videoHintFlag";

function memoryStore(): FlagStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("Hinweisleiste Erklärvideo", () => {
  it("erscheint, solange sie nicht erledigt ist (auch bei Bestandsnutzern ohne den Schlüssel)", () => {
    expect(isVideoHintDone(memoryStore())).toBe(false);
  });

  it("bleibt nach dem Erledigen weg und nutzt einen eigenen Schlüssel", () => {
    const store = memoryStore();
    store.setItem("palabrita.welcomeSeen", "1");
    expect(isVideoHintDone(store)).toBe(false);
    markVideoHintDone(store);
    expect(isVideoHintDone(store)).toBe(true);
    expect([...store.data.keys()].sort()).toEqual([
      "palabrita.videoHintDone",
      "palabrita.welcomeSeen",
    ]);
  });

  it("ohne Speicher erscheint sie nie und wirft nicht", () => {
    expect(isVideoHintDone(null)).toBe(true);
    expect(() => markVideoHintDone(null)).not.toThrow();
  });

  it("wirft nicht, wenn der Speicher beim Lesen oder Schreiben fehlschlägt", () => {
    const broken: FlagStore = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(isVideoHintDone(broken)).toBe(true);
    expect(() => markVideoHintDone(broken)).not.toThrow();
  });
});
