import { describe, expect, it } from "vitest";
import {
  isWelcomeSeen,
  markWelcomeSeen,
  type WelcomeStore,
} from "./welcomeFlag";

function memoryStore(): WelcomeStore & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe("Erststart-Begrüßung", () => {
  it("wird beim ersten Start gezeigt", () => {
    expect(isWelcomeSeen(memoryStore())).toBe(false);
  });

  it("gilt nach dem Schließen als gesehen und bleibt es", () => {
    const store = memoryStore();
    markWelcomeSeen(store);
    expect(isWelcomeSeen(store)).toBe(true);
    expect(isWelcomeSeen(store)).toBe(true);
  });

  it("ohne Speicher gilt sie als gesehen, damit sie nie blockiert", () => {
    expect(isWelcomeSeen(null)).toBe(true);
    expect(() => markWelcomeSeen(null)).not.toThrow();
  });

  it("wirft nicht, wenn der Speicher beim Lesen oder Schreiben fehlschlägt", () => {
    const broken: WelcomeStore = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(isWelcomeSeen(broken)).toBe(true);
    expect(() => markWelcomeSeen(broken)).not.toThrow();
  });
});
