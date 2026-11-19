import { useLayoutEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GermanText } from "../../components/Flashcard";
import { PageTitle } from "../../components/PageTitle";
import {
  POS_LABEL,
  topicOptions,
  searchVocab,
  type DictionaryFilters,
} from "../../domain/dictionary";
import { LEVEL_ORDER, type Level, type Pos } from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";
import {
  getSavedFilters,
  getSavedScroll,
  saveFilters,
  saveScroll,
} from "./viewState";

const LEVELS = (Object.keys(LEVEL_ORDER) as Level[]).sort(
  (a, b) => LEVEL_ORDER[a] - LEVEL_ORDER[b],
);

export function Dictionary() {
  const { vocab, topics, settings } = useAppData();
  const navigate = useNavigate();

  // Back from a detail page (back button or the tab/link „Verzeichnis“): return to the
  // scroll position of the list.
  useLayoutEffect(() => {
    window.scrollTo(0, getSavedScroll());
  }, []);
  // Layout effect on purpose: its cleanup runs synchronously when the list unmounts, before
  // the detail page scrolls to the top. With a passive effect the scroll event of that
  // reset could still be recorded here as position 0 (race, seen in ~70 % of the visits).
  useLayoutEffect(() => {
    const onScroll = () => {
      saveScroll(window.scrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [filters, setFilters] = useState<DictionaryFilters>(getSavedFilters);

  const results = useMemo(
    () => searchVocab(vocab.values(), settings.maxLevel, filters),
    [vocab, settings.maxLevel, filters],
  );

  const set = <K extends keyof DictionaryFilters>(
    key: K,
    value: DictionaryFilters[K],
  ) =>
    setFilters((f) => {
      const next = { ...f, [key]: value };
      saveFilters(next);
      return next;
    });

  const topicChoices = topicOptions(topics);

  return (
    <div className="screen">
      <PageTitle>Verzeichnis</PageTitle>

      <section className="dict-section" aria-labelledby="dict-list">
        <h2 id="dict-list">Wörter</h2>
        <input
          type="search"
          className="field"
          placeholder="Suchen (Spanisch oder Deutsch)"
          aria-label="Suchen"
          value={filters.query}
          onChange={(e) => set("query", e.target.value)}
          enterKeyHint="search"
          onKeyDown={(e) => {
            // Such-Taste der mobilen Tastatur: Tastatur schließen
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
        />

        <div className="filters">
          <select
            className="field"
            aria-label="Thema"
            value={filters.topic}
            onChange={(e) => set("topic", e.target.value)}
          >
            <option value="">Alle Themen</option>
            {topicChoices.map(([key, label]) => (
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

        {/* Immer sichtbar. Ein vorhandener Suchtext wird auf die Hinzufügen-Seite übernommen. */}
        <button
          type="button"
          className="btn dict-add"
          onClick={() => {
            const q = filters.query.trim();
            void navigate(`/add${q ? `?q=${encodeURIComponent(q)}` : ""}`);
          }}
        >
          Neues Wort hinzufügen
        </button>
      </section>
    </div>
  );
}
