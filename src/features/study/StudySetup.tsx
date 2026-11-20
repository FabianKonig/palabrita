import { useEffect, useRef, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { POS_LABEL_PLURAL } from "../../domain/dictionary";
import type { QueueFilters } from "../../domain/queue";
import type { DirectionSetting, Level, Pos } from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";
import { ChoiceSheet } from "./ChoiceSheet";
import { ChoiceTile } from "./ChoiceTile";
import {
  buildFilters,
  directionChoices,
  directionTile,
  levelOptions,
  posChoices,
  summary,
  topicChoices,
  type ChoiceField,
} from "./studyChoices";

/** Filters and direction before the session starts. Nothing is remembered. */
export function StudySetup({
  onStart,
}: {
  onStart: (filters: QueueFilters) => void;
}) {
  const { topics, settings } = useAppData();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<Level | "">("");
  const [pos, setPos] = useState<Pos | "">("");
  const [direction, setDirection] = useState<DirectionSetting>("both");
  const [open, setOpen] = useState<ChoiceField | null>(null);
  // Nach dem Schließen (auch nach einer Auswahl) bekommt die Kachel den Fokus zurück, die das Fenster geöffnet hat.
  const tileRefs = useRef<
    Partial<Record<ChoiceField, HTMLButtonElement | null>>
  >({});
  const prevOpen = useRef<ChoiceField | null>(null);
  useEffect(() => {
    if (prevOpen.current && !open) tileRefs.current[prevOpen.current]?.focus();
    prevOpen.current = open;
  }, [open]);

  const onlyA1 = settings.maxLevel === "A1";
  const topicOpts = topicChoices(topics);
  const levelOpts = levelOptions(settings.maxLevel);
  const posOpts = posChoices();
  const dir = directionTile(direction);
  const topicLabel =
    topicOpts.find((o) => o.value === topic)?.label ?? "Alle Themen";
  const posLabel = pos ? POS_LABEL_PLURAL[pos] : "Alle Wortarten";
  const sum = summary({
    topicLabel,
    level,
    maxLevel: settings.maxLevel,
    posLabel,
    direction,
  });

  const sheet: Record<
    ChoiceField,
    {
      title: string;
      options: typeof topicOpts;
      selected: string;
      set: (v: string) => void;
    }
  > = {
    topic: {
      title: "Thema",
      options: topicOpts,
      selected: topic,
      set: setTopic,
    },
    level: {
      title: "Niveau",
      options: levelOpts,
      selected: level,
      set: (v) => setLevel(v as Level | ""),
    },
    pos: {
      title: "Wortart",
      options: posOpts,
      selected: pos,
      set: (v) => setPos(v as Pos | ""),
    },
    direction: {
      title: "Richtung",
      options: directionChoices(),
      selected: direction,
      set: (v) => setDirection(v as DirectionSetting),
    },
  };

  return (
    <div className="screen">
      <PageTitle brand>Lernen</PageTitle>
      <div className="study-grid">
        <ChoiceTile
          ref={(el) => {
            tileRefs.current.topic = el;
          }}
          label="Thema"
          value={topicLabel}
          tone="turquoise"
          onOpen={() => setOpen("topic")}
        />
        <ChoiceTile
          ref={(el) => {
            tileRefs.current.level = el;
          }}
          label="Niveau"
          value={onlyA1 ? "A1" : level || "Alle Niveaus"}
          tone="yellow"
          disabled={onlyA1}
          onOpen={() => setOpen("level")}
        />
        <ChoiceTile
          ref={(el) => {
            tileRefs.current.pos = el;
          }}
          label="Wortart"
          value={posLabel}
          tone="magenta"
          onOpen={() => setOpen("pos")}
        />
        <ChoiceTile
          ref={(el) => {
            tileRefs.current.direction = el;
          }}
          label="Richtung"
          value={dir.value}
          fullValue={dir.full}
          sub={dir.sub}
          tone="neutral"
          onOpen={() => setOpen("direction")}
        />
      </div>
      <div className="study-start">
        <p className="study-summary">
          <strong>{sum.topic}</strong>
          {sum.rest}
        </p>
        <button
          type="button"
          className="btn btn-block study-start-btn"
          onClick={() =>
            onStart(buildFilters({ topic, level, pos, direction }))
          }
        >
          Starten
        </button>
      </div>
      {open && (
        <ChoiceSheet
          title={sheet[open].title}
          options={sheet[open].options}
          selected={sheet[open].selected}
          onSelect={(v) => {
            // Wert setzen und Fenster sofort schließen; den History-Eintrag räumt `ChoiceSheet` danach selbst ab.
            sheet[open].set(v);
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
