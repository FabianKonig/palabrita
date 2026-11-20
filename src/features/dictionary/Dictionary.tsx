import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GermanText } from "../../components/Flashcard";
import { PageTitle } from "../../components/PageTitle";
import {
  POS_LABEL_PLURAL,
  clearCriterion,
  clearDropdownFilters,
  hasDropdownFilter,
  normalizeForSearch,
  searchVocab,
  type DictionaryCriterion,
  type DictionaryFilters,
} from "../../domain/dictionary";
import { EMPTY_FORM_INDEX, cachedFormIndex } from "../../domain/forms";
import type { Level, Pos } from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";
import { ChoiceSheet } from "../study/ChoiceSheet";
import {
  levelOptions,
  posChoices,
  topicChoices,
  type ChoiceOption,
} from "../study/studyChoices";
import {
  getSavedFilters,
  getSavedScroll,
  saveFilters,
  saveScroll,
} from "./viewState";

/** Die drei Filter, die je ein Auswahlfenster öffnen (SPEC §3.3). */
type FilterField = "topic" | "level" | "pos";

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
  // Welches Auswahlfenster offen ist. Nach dem Schließen (auch nach einer Auswahl) bekommt der Filterknopf
  // den Fokus zurück, der das Fenster geöffnet hat (Safari fokussiert Buttons beim Tippen nicht).
  const [open, setOpen] = useState<FilterField | null>(null);
  const buttonRefs = useRef<
    Partial<Record<FilterField, HTMLButtonElement | null>>
  >({});
  const prevOpen = useRef<FilterField | null>(null);
  useEffect(() => {
    if (prevOpen.current && !open)
      buttonRefs.current[prevOpen.current]?.focus();
    prevOpen.current = open;
  }, [open]);

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

  // Die Optionen stammen aus den Hilfsfunktionen der Lernen-Seite. Im Verzeichnis stehen immer alle
  // Niveaus zur Wahl, unabhängig vom Maximalniveau (SPEC §3.3): `levelOptions()` ohne Argument.
  const topicOpts = topicChoices(topics);
  const sheets: Record<
    FilterField,
    {
      title: string;
      options: ChoiceOption[];
      selected: string;
      set: (v: string) => void;
    }
  > = {
    topic: {
      title: "Thema",
      options: topicOpts,
      selected: filters.topic,
      set: (v) => set("topic", v),
    },
    level: {
      title: "Niveau",
      options: levelOptions(),
      selected: filters.level,
      set: (v) => set("level", v as Level | ""),
    },
    pos: {
      title: "Wortart",
      options: posChoices(),
      selected: filters.pos,
      set: (v) => set("pos", v as Pos | ""),
    },
  };
  // Statuszeile: je ein Chip für jedes Kriterium, das gerade wirkt (Filter und Suche).
  // Ein Tipp auf einen Chip entfernt genau dieses Kriterium.
  // Nur bei gesetztem Thema: „Alle Themen“ (Wert "") ist kein Kriterium und bekommt keinen Chip.
  const topicLabel = filters.topic
    ? topicOpts.find((o) => o.value === filters.topic)?.label
    : undefined;
  const posLabel = filters.pos ? POS_LABEL_PLURAL[filters.pos] : undefined;
  const query = filters.query.trim();
  const activeChips: { criterion: DictionaryCriterion; label: string }[] = [];
  if (topicLabel) activeChips.push({ criterion: "topic", label: topicLabel });
  if (filters.level)
    activeChips.push({ criterion: "level", label: filters.level });
  if (posLabel) activeChips.push({ criterion: "pos", label: posLabel });
  if (query) activeChips.push({ criterion: "query", label: `„${query}“` });
  const dropdownsActive = hasDropdownFilter(filters);
  const activeCount = [filters.topic, filters.level, filters.pos].filter(
    Boolean,
  ).length;

  // Anzeigetext der Filterknöpfe: der gewählte Wert oder „Alle …“.
  const buttonValue: Record<FilterField, string> = {
    topic: topicLabel ?? "Alle Themen",
    level: filters.level || "Alle Niveaus",
    pos: posLabel ?? "Alle Wortarten",
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
          {(Object.keys(sheets) as FilterField[]).map((field) => (
            <button
              key={field}
              ref={(el) => {
                buttonRefs.current[field] = el;
              }}
              type="button"
              className="field field-btn"
              aria-haspopup="dialog"
              aria-label={`${sheets[field].title}: ${buttonValue[field]}, ändern`}
              onClick={() => setOpen(field)}
            >
              {buttonValue[field]}
            </button>
          ))}
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
      {open && (
        <ChoiceSheet
          title={sheets[open].title}
          options={sheets[open].options}
          selected={sheets[open].selected}
          onSelect={(v) => {
            // Wert setzen und Fenster sofort schließen; den History-Eintrag räumt `ChoiceSheet` danach selbst ab.
            sheets[open].set(v);
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
