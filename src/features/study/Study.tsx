import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "../../components/Brand";
import { SpeakerIcon } from "../../components/icons";
import { Flashcard } from "../../components/Flashcard";
import { VerbOverlay } from "../../components/VerbOverlay";
import { getAllCards, saveReview } from "../../data/cardRepo";
import { dayKey } from "../../domain/day";
import {
  cardKey,
  countIntroducedToday,
  MORE_NEW_STEP,
  NEW_PER_DAY,
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
import {
  useDropStaleGuard,
  useSessionBackGuard,
} from "../../hooks/useSessionBackGuard";
import { StudySetup } from "./StudySetup";

const GRADE_BUTTONS: { grade: Grade; label: string }[] = [
  { grade: "again", label: "Nochmal" },
  { grade: "good", label: "Gewusst" },
];

/** Raised limit of new cards; only valid on the day it was set (SPEC §12.1). */
interface NewLimit {
  day: string;
  value: number;
}

interface Session {
  cards: Card[];
  rated: number;
  /** Number of "again" ratings in this session. */
  again: number;
  /** Review cards rated since the last new card (SPEC §12.2, stage 2). */
  reviewsSinceNew: number;
  newLimit: NewLimit | null;
  /** Key of the card rated last. */
  lastShown: string | null;
  pick: NextPick | null;
}

/** Limit that applies at `now`: a raised limit from an earlier day falls back to NEW_PER_DAY. */
function limitAt(newLimit: NewLimit | null, now: number): number {
  return newLimit && newLimit.day === dayKey(now)
    ? newLimit.value
    : NEW_PER_DAY;
}

/** Shows the filter setup first, then the session itself. */
export function Study() {
  const [filters, setFilters] = useState<QueueFilters | null>(null);
  useDropStaleGuard();
  if (!filters) return <StudySetup onStart={setFilters} />;
  return <StudySession filters={filters} onBack={() => setFilters(null)} />;
}

/** Summary, "Für heute geschafft" and "Keine Karten": logo centred at the top. */
function EndScreen({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="screen center">
      {/* Gleiche Leiste wie in der Sitzung: das Logo steht an derselben Stelle. */}
      <div className="session-bar session-end-bar">
        <span />
        <Logo />
        <span />
      </div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

function ResultTiles({ rated, again }: { rated: number; again: number }) {
  return (
    // Das Ergebnis ist das Wichtigste auf der Seite: zwei große Kacheln.
    <div className="result-tiles">
      <div className="result-tile">
        <span className="result-num">{rated}</span>
        <span className="result-label">
          {rated === 1 ? "Karte geübt" : "Karten geübt"}
        </span>
      </div>
      <div className="result-tile again">
        <span className="result-num">{again}</span>
        <span className="result-label">davon „Nochmal“</span>
      </div>
    </div>
  );
}

function StudySession({
  filters,
  onBack,
}: {
  filters: QueueFilters;
  onBack: () => void;
}) {
  const { vocab, settings } = useAppData();
  const { maxLevel, orderSeed, startedAt } = settings;
  const [session, setSession] = useState<Session | null>(null);
  // Automatisches Vorlesen ist nur für diese Sitzung manuell einschaltbar und startet immer aus.
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [flipped, setFlipped] = useState(false);
  // Becomes true with the first reveal of a card: the rating buttons stay until the next card.
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [conjugation, setConjugation] = useState(false);
  const spoken = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const speech = useSpeech();

  const pick = session?.pick;
  const item = pick && pick.kind !== "done" ? pick.item : undefined;
  const entry = item ? vocab.get(item.vocabId) : undefined;
  // The Spanish side is visible on the front of es-de cards and on the back of de-es cards.
  const spanishVisible = item ? item.dir === "es-de" || flipped : false;
  const { available, speak } = speech;
  const spanish = entry?.es;
  const shownKey = item ? cardKey(item.vocabId, item.dir) : null;
  // Distinguishes showing the same card twice in a row.
  const instance = session ? `${session.rated}|${shownKey}` : null;

  // Zurück-Taste des Geräts = Button „Beenden“: in der Sitzung führt sie zur Zusammenfassung, auf jeder
  // Abschlussseite (Zusammenfassung, „Für heute geschafft“, „Keine Karten“) zurück zur Filterauswahl.
  const inSession =
    session !== null && !error && !finished && pick?.kind !== "done" && !!entry;
  const { requestBack } = useSessionBackGuard(() => {
    if (inSession) {
      setFinished(true);
      return true;
    }
    onBack();
    return false;
  });

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
        const pick = pickNext({
          settings: { maxLevel, orderSeed, startedAt },
          vocab: vocab.values(),
          cards,
          now: Date.now(),
          filters,
          lastShown: null,
          reviewsSinceNew: 0,
          newLimit: NEW_PER_DAY,
        });
        setSession({
          cards,
          rated: 0,
          again: 0,
          reviewsSinceNew: 0,
          newLimit: null,
          lastShown: null,
          pick,
        });
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [maxLevel, orderSeed, startedAt, vocab, filters]);

  /** pickNext with the state of this session. */
  function next(s: Omit<Session, "pick">, now: number): NextPick | null {
    return pickNext({
      settings: { maxLevel, orderSeed, startedAt },
      vocab: vocab.values(),
      cards: s.cards,
      now,
      filters,
      lastShown: s.lastShown,
      reviewsSinceNew: s.reviewsSinceNew,
      newLimit: limitAt(s.newLimit, now),
    });
  }

  if (error)
    return (
      <div className="screen">
        <p>Fehler: {error}</p>
      </div>
    );
  if (!session) return <p className="screen center muted">Lade …</p>;

  if (finished) {
    return (
      <EndScreen title="Sitzung beendet">
        <ResultTiles rated={session.rated} again={session.again} />
        <div className="actions">
          <button type="button" className="btn btn-block" onClick={requestBack}>
            Beenden
          </button>
        </div>
      </EndScreen>
    );
  }

  if (pick?.kind === "done") {
    const moreNew = pick.moreNew;
    const moreCards = () => {
      const now = Date.now();
      const current = limitAt(session.newLimit, now);
      const raised: NewLimit = {
        day: dayKey(now),
        value:
          Math.max(current, countIntroducedToday(session.cards, now)) +
          MORE_NEW_STEP,
      };
      const base = { ...session, newLimit: raised };
      setSession({ ...base, pick: next(base, now) });
      setFlipped(false);
      setRevealed(false);
    };
    return (
      <EndScreen title="Für heute geschafft">
        <ResultTiles rated={session.rated} again={session.again} />
        <p className="muted">
          {moreNew
            ? "Für heute ist alles erledigt. Das Limit für neue Karten ist erreicht."
            : "Für heute ist alles erledigt. Heute sind in dieser Auswahl keine weiteren neuen Karten verfügbar."}
        </p>
        <div className="actions">
          {moreNew && (
            <button type="button" className="btn btn-block" onClick={moreCards}>
              10 weitere neue Karten
            </button>
          )}
          <button
            type="button"
            className={moreNew ? "btn btn-block secondary" : "btn btn-block"}
            onClick={requestBack}
          >
            Beenden
          </button>
        </div>
      </EndScreen>
    );
  }

  if (!item || !entry) {
    return (
      <EndScreen title="Keine Karten für diese Auswahl">
        <p className="muted">Bitte Filter oder Niveau anpassen.</p>
        <button type="button" className="btn" onClick={requestBack}>
          Zur Filterauswahl
        </button>
      </EndScreen>
    );
  }

  async function onGrade(grade: Grade) {
    if (busy.current || !session || !item || !pick || pick.kind === "done")
      return;
    busy.current = true;
    try {
      // eslint-disable-next-line react-hooks/purity -- läuft im Event-Handler, nicht beim Rendern
      const now = Date.now();
      const base = item.card ?? newCard(item.vocabId, item.dir, now);
      const updated = review(base, grade, now);
      await saveReview(updated);

      const key = cardKey(item.vocabId, item.dir);
      const rest = {
        cards: [
          ...session.cards.filter((c) => cardKey(c.vocabId, c.dir) !== key),
          updated,
        ],
        rated: session.rated + 1,
        again: session.again + (grade === "again" ? 1 : 0),
        reviewsSinceNew:
          pick.kind === "review"
            ? session.reviewsSinceNew + 1
            : pick.kind === "new"
              ? 0
              : session.reviewsSinceNew,
        newLimit: session.newLimit,
        lastShown: key,
      };
      setSession({ ...rest, pick: next(rest, now) });
      setFlipped(false);
      setRevealed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      busy.current = false;
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
          <p className="session-count">
            <span className="session-count-num">{session.rated}</span>
            <span className="session-count-label">Geübt</span>
          </p>
          <Logo />
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
            // Neue Karte = neues Element: sie startet ohne Rückdrehen auf der Vorderseite.
            key={`${shownKey}:${session.rated}`}
            vocab={entry}
            dir={item.dir}
            flipped={flipped}
            onToggle={() => {
              setFlipped(!flipped);
              setRevealed(true);
            }}
            // Der Lautsprecher steht auf der spanischen Seite und dreht sich mit ihr.
            spanishAction={
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
                <SpeakerIcon />
              </button>
            }
          />
        </div>

        <label className="switch">
          <input
            role="switch"
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
          />
          <span>Automatisch vorlesen</span>
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
