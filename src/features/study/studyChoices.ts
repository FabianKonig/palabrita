import { POS_LABEL_PLURAL, topicOptions } from "../../domain/dictionary";
import type { QueueFilters } from "../../domain/queue";
import {
  LEVEL_ORDER,
  type DirectionSetting,
  type Level,
  type Pos,
} from "../../domain/types";

export type ChoiceField = "topic" | "level" | "pos" | "direction";
export type ChoiceOption = { value: string; label: string };

export const DIRECTION_LABEL: Record<DirectionSetting, string> = {
  "de-es": "Deutsch → Spanisch",
  "es-de": "Spanisch → Deutsch",
  both: "Beide Richtungen",
};

const DIRECTION_SHORT: Record<DirectionSetting, string> = {
  "de-es": "DE → ES",
  "es-de": "ES → DE",
  both: "Beide Richtungen",
};

const DIRECTION_SUB: Record<DirectionSetting, string> = {
  "de-es": "Vorderseite Deutsch",
  "es-de": "Vorderseite Spanisch",
  both: "mal so, mal so",
};

const LEVELS = (Object.keys(LEVEL_ORDER) as Level[]).sort(
  (a, b) => LEVEL_ORDER[a] - LEVEL_ORDER[b],
);

export function levelOptions(maxLevel: Level): ChoiceOption[] {
  const levels = LEVELS.filter((l) => LEVEL_ORDER[l] <= LEVEL_ORDER[maxLevel]);
  if (maxLevel === "A1") return levels.map((l) => ({ value: l, label: l }));
  return [
    { value: "", label: "Alle Niveaus" },
    ...levels.map((l) => ({ value: l, label: l })),
  ];
}

export function topicChoices(
  topics: readonly { key: string; label: string }[],
): ChoiceOption[] {
  return [
    { value: "", label: "Alle Themen" },
    ...topicOptions(topics).map(([value, label]) => ({ value, label })),
  ];
}

export function posChoices(): ChoiceOption[] {
  return [
    { value: "", label: "Alle Wortarten" },
    ...(Object.keys(POS_LABEL_PLURAL) as Pos[]).map((p) => ({
      value: p,
      label: POS_LABEL_PLURAL[p],
    })),
  ];
}

export function directionChoices(): ChoiceOption[] {
  return (Object.keys(DIRECTION_LABEL) as DirectionSetting[]).map((d) => ({
    value: d,
    label: DIRECTION_LABEL[d],
  }));
}

export function directionTile(d: DirectionSetting): {
  value: string;
  full: string;
  sub: string;
} {
  return {
    value: DIRECTION_SHORT[d],
    full: DIRECTION_LABEL[d],
    sub: DIRECTION_SUB[d],
  };
}

export function summary(parts: {
  topicLabel: string;
  level: Level | "";
  maxLevel: Level;
  posLabel: string;
  direction: DirectionSetting;
}): { topic: string; rest: string } {
  const level =
    parts.maxLevel === "A1"
      ? "Niveau A1"
      : parts.level
        ? `Niveau ${parts.level}`
        : "Alle Niveaus";
  return {
    topic: parts.topicLabel,
    rest: ` · ${level} · ${parts.posLabel} · ${DIRECTION_LABEL[parts.direction]}`,
  };
}

export function buildFilters(s: {
  topic: string;
  level: Level | "";
  pos: Pos | "";
  direction: DirectionSetting;
}): QueueFilters {
  const f: QueueFilters = {};
  if (s.topic) f.topic = s.topic;
  if (s.level) f.level = s.level;
  if (s.pos) f.pos = s.pos;
  f.direction = s.direction;
  return f;
}
