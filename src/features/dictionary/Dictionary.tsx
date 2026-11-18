import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GermanText } from "../../components/Flashcard";
import {
  EMPTY_FILTERS,
  POS_LABEL,
  searchVocab,
  type DictionaryFilters,
} from "../../domain/dictionary";
import { LEVEL_ORDER, type Level, type Pos } from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";

const LEVELS = (Object.keys(LEVEL_ORDER) as Level[]).sort(
  (a, b) => LEVEL_ORDER[a] - LEVEL_ORDER[b],
);

export function Dictionary() {
  const { vocab, topics, settings } = useAppData();
  const [filters, setFilters] = useState<DictionaryFilters>(EMPTY_FILTERS);

  const results = useMemo(
    () => searchVocab(vocab.values(), settings.maxLevel, filters),
    [vocab, settings.maxLevel, filters],
  );

  const set = <K extends keyof DictionaryFilters>(
    key: K,
    value: DictionaryFilters[K],
  ) => setFilters((f) => ({ ...f, [key]: value }));

  const query = filters.query.trim();
  const topicOptions = [
    ...new Map(topics.map((t) => [t.key, t.label])).entries(),
    ["eigene", "Eigene Wörter"] as const,
  ];

  return (
    <div className="screen">
      <h1>Verzeichnis</h1>

      <input
        type="search"
        className="field"
        placeholder="Suchen (Spanisch oder Deutsch)"
        aria-label="Suchen"
        value={filters.query}
        onChange={(e) => set("query", e.target.value)}
      />

      <div className="filters">
        <select
          className="field"
          aria-label="Thema"
          value={filters.topic}
          onChange={(e) => set("topic", e.target.value)}
        >
          <option value="">Alle Themen</option>
          {topicOptions.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="field"
          aria-label="Niveau"
          value={filters.level}
          onChange={(e) => set("level", e.target.value as Level | "")}
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
        <select
          className="field"
          aria-label="Wortart"
          value={filters.pos}
          onChange={(e) => set("pos", e.target.value as Pos | "")}
        >
          <option value="">Alle Wortarten</option>
          {(Object.keys(POS_LABEL) as Pos[]).map((p) => (
            <option key={p} value={p}>
              {POS_LABEL[p]}
            </option>
          ))}
        </select>
      </div>

      <p className="muted count" aria-live="polite">
        {results.length} {results.length === 1 ? "Eintrag" : "Einträge"}
      </p>

      <Link
        className="btn"
        to={`/add${query ? `?q=${encodeURIComponent(query)}` : ""}`}
      >
        Wort hinzufügen
      </Link>

      {results.length === 0 ? (
        <div className="panel center">
          <p>Keine Treffer.</p>
        </div>
      ) : (
        <ul className="link-list vocab-list">
          {results.map((v) => (
            <li key={v.id}>
              <Link to={`/dictionary/${encodeURIComponent(v.id)}`}>
                <span className="es">{v.es}</span>
                <span className="de">
                  <GermanText de={v.de} />
                </span>
                <span className="meta">{v.level ?? "eigen"}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
