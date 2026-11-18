import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Flashcard } from "../../components/Flashcard";
import { VerbOverlay } from "../../components/VerbOverlay";
import { getAllCards, saveReview } from "../../data/cardRepo";
import { dayKey } from "../../domain/day";
import {
  cardKey,
  pickNext,
  type NextPick,
  type QueueFilters,
} from "../../domain/queue";
import {
  formatInterval,
  newCard,
  previewIntervals,
  review,
} from "../../domain/srs";
import type { Card, Grade } from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";
import { useSpeech } from "../../hooks/useSpeech";
import { StudySetup } from "./StudySetup";

const GRADE_BUTTONS: { grade: Grade; label: string }[] = [
  { grade: "again", label: "Nochmal" },
  { grade: "good", label: "Gewusst" },
];

interface Session {
  cards: Card[];
  seen: Set<string>;
  last: string | null;
  rated: number;
  /** Number of "again" ratings in this session. */
  again: number;
  pick: NextPick | null;
}

/** Shows the filter setup first, then the session itself. */
export function Study() {
  const [filters, setFilters] = useState<QueueFilters | null>(null);
  if (!filters) return <StudySetup onStart={setFilters} />;
  return <StudySession filters={filters} onBack={() => setFilters(null)} />;
}

function StudySession({
  filters,
  onBack,
}: {
  filters: QueueFilters;
  onBack: () => void;
}) {
  const { vocab, settings, updateSettings } = useAppData();
  const { maxLevel, direction, autoSpeak } = settings;
  const [session, setSession] = useState<Session | null>(null);
  const [flipped, setFlipped] = useState(false);
  // Becomes true with the first reveal of a card: the rating buttons stay until the next card.
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [conjugation, setConjugation] = useState(false);
  // Bumped by "Weiterlernen": starts a fresh session with the same filters.
  const [round, setRound] = useState(0);
  const spoken = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const speech = useSpeech();

  const item = session?.pick?.item;
  const entry = item ? vocab.get(item.vocabId) : undefined;
  // The Spanish side is visible on the front of es-de cards and on the back of de-es cards.
  // The Spanish side is visible on the front of es-de cards and on the back of de-es cards.
  const spanishVisible = item ? item.dir === "es-de" || flipped : false;
  const { available, speak } = speech;
  const spanish = entry?.es;
  const shownKey = item ? cardKey(item.vocabId, item.dir) : null;
  // Distinguishes showing the same card twice in a row.
  const instance = session ? `${session.rated}|${shownKey}` : null;

  // Auto-speak once per card: when the Spanish side becomes visible for the first time.
  useEffect(() => {
    if (!autoSpeak || !available || !spanish || !spanishVisible) return;
    if (spoken.current === instance) return;
    spoken.current = instance;
    speak(spanish);
  }, [autoSpeak, available, spanish, spanishVisible, speak, instance]);

  useEffect(() => {
    let cancelled = false;
    getAllCards()
      .then((cards) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const pick = pickNext({
          settings: { maxLevel, direction },
          vocab: vocab.values(),
          cards,
          now: Date.now(),
          filters,
          sessionSeen: seen,
          lastShown: null,
        });
        setSession({ cards, seen, last: null, rated: 0, again: 0, pick });
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [maxLevel, direction, vocab, filters, round]);

  if (error)
    return (
      <div className="screen">
        <p>Fehler: {error}</p>
      </div>
    );
  if (!session) return <p className="screen center muted">Lade …</p>;

  if (finished) {
    return (
      <div className="screen center">
        <h1>Sitzung beendet</h1>
        <p>
          {session.rated} {session.rated === 1 ? "Karte" : "Karten"} bewertet,
          davon {session.again}× „Nochmal“.
        </p>
        <div className="actions">
          <button
            type="button"
            className="btn btn-block"
            onClick={() => {
              setSession(null);
              setFinished(false);
              setFlipped(false);
              setRevealed(false);
              setRound(round + 1);
            }}
          >
            Weiterlernen
          </button>
          <Link className="btn btn-block secondary" to="/">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  if (!item || !entry) {
    return (
      <div className="screen center">
        <h1>Keine Karten für diese Auswahl</h1>
        <p className="muted">Bitte Filter oder Niveau anpassen.</p>
        <button type="button" className="btn" onClick={onBack}>
          Zur Filterauswahl
        </button>
      </div>
    );
  }

  async function onGrade(grade: Grade) {
    if (busy.current || !session || !item) return;
    busy.current = true;
    try {
      // eslint-disable-next-line react-hooks/purity -- läuft im Event-Handler, nicht beim Rendern
      const now = Date.now();
      const base = item.card ?? newCard(item.vocabId, item.dir, now);
      const updated = review(base, grade, now);
      // Early review with "good" leaves the card untouched: nothing to store.
      const changed = updated !== base;
      if (changed) await saveReview(updated, item.card === null, dayKey(now));

      const key = cardKey(item.vocabId, item.dir);
      const cards = changed
        ? [
            ...session.cards.filter((c) => cardKey(c.vocabId, c.dir) !== key),
            updated,
          ]
        : session.cards;
      const seen = session.pick?.newPass ? new Set<string>() : session.seen;
      seen.add(key);
      const pick = pickNext({
        settings: { maxLevel, direction },
        vocab: vocab.values(),
        cards,
        now,
        filters,
        sessionSeen: seen,
        lastShown: key,
      });
      setSession({
        cards,
        seen,
        last: key,
        rated: session.rated + 1,
        again: session.again + (grade === "again" ? 1 : 0),
        pick,
      });
      setFlipped(false);
      setRevealed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      busy.current = false;
    }
  }

  async function onToggleAutoSpeak(value: boolean) {
    try {
      await updateSettings({ autoSpeak: value });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // eslint-disable-next-line react-hooks/purity -- Vorschau der Intervalle braucht die aktuelle Zeit
  const now = Date.now();
  const previews = previewIntervals(
    item.card ?? newCard(item.vocabId, item.dir, now),
    now,
  );

  return (
    <>
      <div className="screen" inert={conjugation}>
        <div className="session-bar">
          <p className="progress">Bewertet: {session.rated}</p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => setFinished(true)}
          >
            Beenden
          </button>
        </div>

        {speech.checked && !speech.available && (
          <p className="notice" role="status">
            Keine spanische Stimme gefunden. Die Aussprache ist nicht verfügbar.
          </p>
        )}

        <div className="card-wrap">
          <Flashcard
            vocab={entry}
            dir={item.dir}
            flipped={flipped}
            onToggle={() => {
              setFlipped(!flipped);
              setRevealed(true);
            }}
          />
          {spanishVisible && (
            <button
              type="button"
              className="speak"
              onClick={() => speak(entry.es)}
              disabled={!speech.available}
              aria-label="Aussprache anhören"
              title={
                speech.available
                  ? "Aussprache anhören"
                  : "Keine spanische Stimme"
              }
            >
              🔊
            </button>
          )}
        </div>

        <label className="toggle">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => void onToggleAutoSpeak(e.target.checked)}
          />
          Automatisch vorlesen
        </label>

        <div className="actions">
          {!revealed ? (
            <button
              type="button"
              className="btn btn-block"
              onClick={() => {
                setFlipped(!flipped);
                setRevealed(true);
              }}
            >
              Umdrehen
            </button>
          ) : (
            <div className="grades">
              {GRADE_BUTTONS.map(({ grade, label }) => (
                <button
                  key={grade}
                  type="button"
                  className={`grade grade-${grade}`}
                  onClick={() => void onGrade(grade)}
                >
                  {label}
                  <small>{formatInterval(previews[grade])}</small>
                </button>
              ))}
            </div>
          )}
          {revealed && entry.pos === "verb" && (
            <button
              type="button"
              className="btn btn-block secondary conj-btn"
              onClick={() => setConjugation(true)}
            >
              Konjugation
            </button>
          )}
        </div>
      </div>
      {conjugation && (
        <VerbOverlay vocab={entry} onClose={() => setConjugation(false)} />
      )}
    </>
  );
}
