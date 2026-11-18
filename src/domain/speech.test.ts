import { describe, expect, it } from "vitest";
import { pickVoice, speechText } from "./speech";

describe("speechText", () => {
  it("keeps the article", () => {
    expect(speechText("el autobús")).toBe("el autobús");
  });
  it("removes text in parentheses", () => {
    expect(speechText("la casa (de campo)")).toBe("la casa");
    expect(speechText("tomar (algo) prestado")).toBe("tomar prestado");
  });
  it("speaks only the first alternative", () => {
    expect(speechText("el/la turista")).toBe("el turista");
    expect(speechText("bueno/a")).toBe("bueno");
  });
});

describe("pickVoice", () => {
  const v = (lang: string) => ({ lang });
  it("prefers es-MX, then es-US, then other es-*", () => {
    expect(pickVoice([v("es-ES"), v("es-US"), v("es-MX")])).toEqual(v("es-MX"));
    expect(pickVoice([v("es-ES"), v("es-US")])).toEqual(v("es-US"));
    expect(pickVoice([v("en-US"), v("es-ES")])).toEqual(v("es-ES"));
  });
  it("accepts underscore and bare codes", () => {
    expect(pickVoice([v("en"), v("es_MX")])).toEqual(v("es_MX"));
    expect(pickVoice([v("en"), v("es")])).toEqual(v("es"));
  });
  it("returns null without Spanish voice", () => {
    expect(pickVoice([v("en-US"), v("de-DE")])).toBeNull();
    expect(pickVoice([])).toBeNull();
  });
});
