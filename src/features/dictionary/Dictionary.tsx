import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GermanText } from "../../components/Flashcard";
import { PageTitle } from "../../components/PageTitle";
import {
  POS_LABEL,
  clearCriterion,
  clearDropdownFilters,
  hasDropdownFilter,
  normalizeForSearch,
  topicOptions,
  searchVocab,
  type DictionaryCriterion,
  type DictionaryFilters,
} from "../../domain/dictionary";
import { EMPTY_FORM_INDEX, cachedFormIndex } from "../../domain/forms";
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

/** „+ 1 weitere Form“ / „+ 5 weitere Formen“ */
const moreForms = (n: number) =>
  `+ ${n} weitere ${n === 1 ? "Form" : "Formen"}`;

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
  const searchRef = useRef<HTMLInputElement>(null);
  // Ob die letzte Auswahl im Dropdown mit der Maus kam. Nur dann verschwindet der Fokusrahmen
  // direkt nach der Auswahl; per Tastatur bleibt der Fokus, damit man weiter navigieren kann.
  const pickedWithPointer = useRef(false);

  // Der Formenindex wird je Vokabelbestand einmal gebaut, und zwar erst, wenn eine Eingabe
  // lang genug für Formtreffer ist (SPEC §14.3): nicht je Tastendruck, nicht beim Öffnen.
  const wantsForms = normalizeForSearch(filters.query).length >= 2;
  const formIndex = useMemo(
    () => (wantsForms ? cachedFormIndex(vocab) : EMPTY_FORM_INDEX),
    [vocab, wantsForms],
  );
  const results = useMemo(
    () => searchVocab(vocab.values(), filters, formIndex),
    [vocab, filters, formIndex],
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

  // Statuszeile: je ein Chip für jedes Kriterium, das gerade wirkt (Filter und Suche).
  // Ein Tipp auf einen Chip entfernt genau dieses Kriterium.
  const topicLabel = topicChoices.find(([key]) => key === filters.topic)?.[1];
  const query = filters.query.trim();
  const activeChips: { criterion: DictionaryCriterion; label: string }[] = [];
  if (topicLabel) activeChips.push({ criterion: "topic", label: topicLabel });
  if (filters.level)
    activeChips.push({ criterion: "level", label: filters.level });
  if (filters.pos)
    activeChips.push({ criterion: "pos", label: POS_LABEL[filters.pos] });
  if (query) activeChips.push({ criterion: "query", label: `„${query}“` });
  const dropdownsActive = hasDropdownFilter(filters);
  const activeCount = [filters.topic, filters.level, filters.pos].filter(
    Boolean,
  ).length;

  // Gemeinsame Handler für die drei Dropdowns: Mausauswahl erkennen, Fokus nach Auswahl lösen.
  const dropdownInput = {
    onPointerDown: () => {
      pickedWithPointer.current = true;
    },
    onKeyDown: () => {
      pickedWithPointer.current = false;
    },
  };
  const afterPick = (el: HTMLSelectElement) => {
    if (pickedWithPointer.current) el.blur();
  };

  return (
    <div className="screen">
      <PageTitle brand>Verzeichnis</PageTitle>

      <section className="dict-section" aria-label="Wortliste">
        <div className="search-field">
          <input
            ref={searchRef}
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
          {filters.query !== "" && (
            <button
              type="button"
              className="search-clear"
              aria-label="Suchtext löschen"
              onClick={() => {
                set("query", "");
                searchRef.current?.focus();
              }}
            >
              ×
            </button>
          )}
        </div>

        <div className="dict-filter-caption muted">
          <span>Filtern nach</span>
          {activeCount > 0 && <span>{activeCount} aktiv</span>}
        </div>
        <div className="filters">
          <select
            className="field"
            aria-label="Thema"
            value={filters.topic}
            {...dropdownInput}
            onChange={(e) => {
              set("topic", e.target.value);
              afterPick(e.currentTarget);
            }}
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
            {...dropdownInput}
            onChange={(e) => {
              set("level", e.target.value as Level | "");
              afterPick(e.currentTarget);
            }}
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
            {...dropdownInput}
            onChange={(e) => {
              set("pos", e.target.value as Pos | "");
              afterPick(e.currentTarget);
            }}
          >
            <option value="">Alle Wortarten</option>
            {(Object.keys(POS_LABEL) as Pos[]).map((p) => (
              <option key={p} value={p}>
                {POS_LABEL[p]}
              </option>
            ))}
          </select>
        </div>

        {activeChips.length > 0 && (
          <div className="dict-status">
            <ul className="dict-chips" aria-label="Aktive Kriterien">
              {activeChips.map(({ criterion, label }) => (
                <li key={criterion}>
                  <button
                    type="button"
                    className="dict-chip"
                    aria-label={`${label} entfernen`}
                    onClick={() => update(clearCriterion(filters, criterion))}
                  >
                    {label}
                    <span className="dict-chip-x" aria-hidden="true">
                      ×
                    </span>
                  </button>
                </li>
              ))}
            </ul>
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

        <p className="muted count" aria-live="polite">
          {results.length} {results.length === 1 ? "Eintrag" : "Einträge"}
        </p>

        {results.length === 0 ? (
          <div className="panel center">
            <p>Keine Treffer.</p>
          </div>
        ) : (
          <ul className="link-list vocab-list">
            {results.map(({ vocab: v, form }) => (
              <li key={v.id}>
                {form ? (
                  <Link
                    to={`/dictionary/${encodeURIComponent(v.id)}`}
                    state={{ highlight: form.highlight }}
                    aria-label={`${form.form}, Form von ${v.es}, ${form.label}${
                      form.more > 0 ? `, ${moreForms(form.more)}` : ""
                    }`}
                  >
                    <span className="es">
                      <span className="form-word">{form.form}</span>
                      <span aria-hidden="true"> → </span>
                      <span className="form-base">{v.es}</span>
                    </span>
                    <span className="de">
                      <GermanText de={v.de} />
                    </span>
                    <span className="form-line">
                      <span className="meta">{v.level}</span>
                      <span className="form-label">
                        {form.label}
                        {form.more > 0 && ` ${moreForms(form.more)}`}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <Link to={`/dictionary/${encodeURIComponent(v.id)}`}>
                    <span className="es">{v.es}</span>
                    <span className="de">
                      <GermanText de={v.de} />
                    </span>
                    <span className="meta">{v.level}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
