import { useState } from "react";
import { POS_LABEL } from "../../domain/dictionary";
import type { QueueFilters } from "../../domain/queue";
import {
  LEVEL_ORDER,
  type DirectionSetting,
  type Level,
  type Pos,
} from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";

const LEVELS = (Object.keys(LEVEL_ORDER) as Level[]).sort(
  (a, b) => LEVEL_ORDER[a] - LEVEL_ORDER[b],
);

const DIRECTION_LABEL: Record<DirectionSetting, string> = {
  "de-es": "Deutsch → Spanisch",
  "es-de": "Spanisch → Deutsch",
  both: "Beide Richtungen",
};

/** Filters before the session starts. The direction applies to this session only. */
export function StudySetup({
  onStart,
}: {
  onStart: (filters: QueueFilters) => void;
}) {
  const { topics, settings } = useAppData();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  const [pos, setPos] = useState<Pos | "">("");
  // "" = as in the settings
  const [direction, setDirection] = useState<DirectionSetting | "">("");

  const topicOptions = [
    ...new Map(topics.map((t) => [t.key, t.label])).entries(),
    ["eigene", "Eigene Wörter"] as const,
  ];

  function start() {
    const filters: QueueFilters = {};
    if (topic) filters.topic = topic;
    if (level) filters.level = level;
    if (pos) filters.pos = pos;
    if (direction) filters.direction = direction;
    onStart(filters);
  }

  return (
    <div className="screen">
      <h1>Lernen</h1>
      <div className="settings-form">
        <label className="setting">
          <span>Thema</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">Alle Themen</option>
            {topicOptions.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="setting">
          <span>Niveau</span>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as Level | "")}
          >
            <option value="">Alle Niveaus</option>
            {LEVELS.filter(
              (l) => LEVEL_ORDER[l] <= LEVEL_ORDER[settings.maxLevel],
            ).map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="setting">
          <span>Wortart</span>
          <select
            value={pos}
            onChange={(e) => setPos(e.target.value as Pos | "")}
          >
            <option value="">Alle Wortarten</option>
            {(Object.keys(POS_LABEL) as Pos[]).map((p) => (
              <option key={p} value={p}>
                {POS_LABEL[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="setting">
          <span>Richtung (nur für diese Sitzung)</span>
          <select
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as DirectionSetting | "")
            }
          >
            <option value="">
              Wie in den Einstellungen ({DIRECTION_LABEL[settings.direction]})
            </option>
            {(Object.keys(DIRECTION_LABEL) as DirectionSetting[]).map((d) => (
              <option key={d} value={d}>
                {DIRECTION_LABEL[d]}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-block" onClick={start}>
          Starten
        </button>
      </div>
    </div>
  );
}
