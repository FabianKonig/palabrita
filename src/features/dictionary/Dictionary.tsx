import { useLayoutEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GermanText } from "../../components/Flashcard";
import { PageTitle } from "../../components/PageTitle";
import {
  POS_LABEL,
  clearDropdownFilters,
  hasDropdownFilter,
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
  const { vocab, topics } = useAppData();

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
    () => searchVocab(vocab.values(), filters),
    [vocab, filters],
  );

  const update = (next: DictionaryFilters) => {
    setFilters(next);
    saveFilters(next);
  };
  const set = <K extends keyof DictionaryFilters>(
    key: K,
    value: DictionaryFilters[K],
  ) => update({ ...filters, [key]: value });

  const topicChoices = topicOptions(topics);

  // Statuszeile: nennt alle Kriterien, die gerade wirken (Filter und Suche).
  const topicLabel = topicChoices.find(([key]) => key === filters.topic)?.[1];
  const query = filters.query.trim();
  const activeParts = [
    topicLabel,
    filters.level || undefined,
    filters.pos ? POS_LABEL[filters.pos] : undefined,
    query ? `Suchwort „${query}“` : undefined,
  ].filter((part): part is string => Boolean(part));
  const dropdownsActive = hasDropdownFilter(filters);
  const activeCount = [filters.topic, filters.level, filters.pos].filter(
    Boolean,
  ).length;

  return (
    <div className="screen">
      <PageTitle brand>Verzeichnis</PageTitle>

      <section className="dict-section" aria-label="Wortliste">
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

        {activeParts.length > 0 && (
          <div className="dict-status">
            <span>Aktiv: {activeParts.join(" · ")}</span>
            <button
              type="button"
              className="dict-status-clear"
              onClick={() =>
                // Gibt es Dropdown-Filter, werden nur sie gelöscht. Bei reinem Suchtext
                // leert der Knopf das Suchfeld.
                update(
                  dropdownsActive
                    ? clearDropdownFilters(filters)
                    : { ...filters, query: "" },
                )
              }
            >
              Filter löschen
            </button>
          </div>
        )}

        <div className="dict-filter-caption muted">
          <span>Filtern nach</span>
          {activeCount > 0 && <span>{activeCount} aktiv</span>}
        </div>
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
            {LEVELS.map((l) => (
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
                  <span className="meta">{v.level}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
