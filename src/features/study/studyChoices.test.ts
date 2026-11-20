import { describe, expect, it } from "vitest";
import type { DirectionSetting, Level, Pos } from "../../domain/types";
import {
  DIRECTION_LABEL,
  buildFilters,
  directionChoices,
  directionTile,
  levelOptions,
  posChoices,
  summary,
  topicChoices,
} from "./studyChoices";

describe("levelOptions", () => {
  it("bietet bei Maximalniveau B1 alle Niveaus", () => {
    expect(levelOptions("B1").map((o) => o.label)).toEqual([
      "Alle Niveaus",
      "A1",
      "A2",
      "B1",
    ]);
  });

  it("bietet bei Maximalniveau A2 nur Alle Niveaus, A1, A2", () => {
    expect(levelOptions("A2").map((o) => o.label)).toEqual([
      "Alle Niveaus",
      "A1",
      "A2",
    ]);
  });

  it("bietet bei Maximalniveau A1 nur A1, ohne Alle Niveaus", () => {
    expect(levelOptions("A1")).toEqual([{ value: "A1", label: "A1" }]);
  });

  it("nutzt für Alle Niveaus den leeren Wert", () => {
    expect(levelOptions("B1")[0].value).toBe("");
  });
});

describe("topicChoices", () => {
  const topics = [
    { key: "essen", label: "Essen & Trinken" },
    { key: "grundwortschatz", label: "Grundwortschatz" },
    { key: "natur", label: "Natur & Wetter" },
  ];

  it("beginnt mit Alle Themen, dann Grundwortschatz, dann der Rest", () => {
    expect(topicChoices(topics)).toEqual([
      { value: "", label: "Alle Themen" },
      { value: "grundwortschatz", label: "Grundwortschatz" },
      { value: "essen", label: "Essen & Trinken" },
      { value: "natur", label: "Natur & Wetter" },
    ]);
  });
});

describe("posChoices", () => {
  it("nutzt die Plural-Labels in fester Reihenfolge", () => {
    expect(posChoices().map((o) => o.label)).toEqual([
      "Alle Wortarten",
      "Verben",
      "Nomen",
      "Adjektive",
      "Adverbien",
      "Zahlen",
      "Redewendungen",
      "Sonstiges",
    ]);
  });
});

describe("Richtung", () => {
  it("bietet die drei Richtungen mit ausgeschriebenen Namen", () => {
    expect(directionChoices()).toEqual([
      { value: "de-es", label: "Deutsch → Spanisch" },
      { value: "es-de", label: "Spanisch → Deutsch" },
      { value: "both", label: "Beide Richtungen" },
    ]);
  });

  it("zeigt auf der Kachel Wert und Untertext je Richtung", () => {
    expect(directionTile("both")).toEqual({
      value: "Beide Richtungen",
      full: "Beide Richtungen",
      sub: "mal so, mal so",
    });
    expect(directionTile("de-es")).toEqual({
      value: "DE → ES",
      full: "Deutsch → Spanisch",
      sub: "Vorderseite Deutsch",
    });
    expect(directionTile("es-de")).toEqual({
      value: "ES → DE",
      full: "Spanisch → Deutsch",
      sub: "Vorderseite Spanisch",
    });
  });
});

describe("summary", () => {
  const base = {
    topicLabel: "Alle Themen",
    level: "" as Level | "",
    maxLevel: "B1" as Level,
    posLabel: "Alle Wortarten",
    direction: "both" as DirectionSetting,
  };

  it("fasst die Standardwerte zusammen", () => {
    const s = summary(base);
    expect(s.topic + s.rest).toBe(
      "Alle Themen · Alle Niveaus · Alle Wortarten · Beide Richtungen",
    );
  });

  it("schreibt Niveau und Richtung aus", () => {
    const s = summary({
      ...base,
      topicLabel: "Zahlen & Zeit",
      level: "A2",
      posLabel: "Verben",
      direction: "de-es",
    });
    expect(s.topic).toBe("Zahlen & Zeit");
    expect(s.topic + s.rest).toBe(
      "Zahlen & Zeit · Niveau A2 · Verben · Deutsch → Spanisch",
    );
  });

  it("zeigt bei Maximalniveau A1 immer Niveau A1", () => {
    const s = summary({ ...base, maxLevel: "A1" });
    expect(s.rest).toContain("· Niveau A1 ·");
  });

  it("nutzt für die Richtung DIRECTION_LABEL", () => {
    for (const d of Object.keys(DIRECTION_LABEL) as DirectionSetting[]) {
      expect(summary({ ...base, direction: d }).rest).toContain(
        DIRECTION_LABEL[d],
      );
    }
  });
});

describe("buildFilters", () => {
  const topics = ["", "essen"];
  const levels: (Level | "")[] = ["", "A1"];
  const poses: (Pos | "")[] = ["", "verb"];
  const directions: DirectionSetting[] = ["de-es", "es-de", "both"];

  it("setzt topic, level und pos nur bei gesetztem Wert, direction immer", () => {
    for (const topic of topics)
      for (const level of levels)
        for (const pos of poses)
          for (const direction of directions) {
            const f = buildFilters({ topic, level, pos, direction });
            expect("topic" in f).toBe(topic !== "");
            expect("level" in f).toBe(level !== "");
            expect("pos" in f).toBe(pos !== "");
            expect(f.direction).toBe(direction);
            if (topic) expect(f.topic).toBe(topic);
            if (level) expect(f.level).toBe(level);
            if (pos) expect(f.pos).toBe(pos);
          }
  });
});
