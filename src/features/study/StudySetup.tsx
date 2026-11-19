import { useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { POS_LABEL, topicOptions } from "../../domain/dictionary";
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

/** Filters and direction before the session starts. Nothing is remembered. */
export function StudySetup({
  onStart,
}: {
  onStart: (filters: QueueFilters) => void;
}) {
  const { topics, settings } = useAppData();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  // Bei Maximalniveau A1 gibt es nur ein Niveau: nichts zu wählen (SPEC §3.3).
  const onlyA1 = settings.maxLevel === "A1";
  const [pos, setPos] = useState<Pos | "">("");
  const [direction, setDirection] = useState<DirectionSetting>("both");

  const topicChoices = topicOptions(topics);

  function start() {
    const filters: QueueFilters = {};
    if (topic) filters.topic = topic;
    if (level) filters.level = level;
    if (pos) filters.pos = pos;
    filters.direction = direction;
    onStart(filters);
  }

  return (
    <div className="screen">
      <PageTitle brand>Lernen</PageTitle>
      <div className="settings-form">
        <label className="setting">
          <span>Thema</span>
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="">Alle Themen</option>
            {topicChoices.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="setting">
          <span>Niveau</span>
          <select
            value={onlyA1 ? "A1" : level}
            disabled={onlyA1}
            onChange={(e) => setLevel(e.target.value as Level | "")}
          >
            {!onlyA1 && <option value="">Alle Niveaus</option>}
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
          <span>Richtung</span>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as DirectionSetting)}
          >
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
