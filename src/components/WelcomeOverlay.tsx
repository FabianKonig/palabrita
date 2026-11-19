import { useEffect, useState } from "react";

/** Spanisch auf der Vorderseite, Deutsch auf der Rückseite. */
const FRONT = "¡Bienvenido a Palabrita!";
const BACK = "Willkommen zu Palabrita!";
/** Kleine Zeile unter dem Haupttext, Spanisch vorne, Deutsch hinten. */
const FRONT_SUB = "Tu app de vocabulario de español";
const BACK_SUB = "Deine Spanisch-Vokabel-App";
/** Kleinste Zeile: Widmung, das Herz ersetzt das Wort „Liebe“. */
const FRONT_CREDIT = "Con";
const BACK_CREDIT = "Mit";
/** Dauer des Ausblendens, bevor das Overlay verschwindet. */
const CLOSE_MS = 250;

/** Rotes Herz als SVG, damit die Farbe überall gleich ist (kein Emoji, kein Textzeichen). */
function Heart() {
  return (
    <svg
      className="welcome-heart"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Herz"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/**
 * Erststart-Hinweis: eine Lernkarte schwebt über der Lernseite.
 * Erstes Tippen dreht sie um, zweites Tippen schließt das Overlay.
 * Der Aufrufer sperrt die Seite dahinter und speichert, dass der Hinweis gesehen wurde.
 */
export function WelcomeOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const [closing, setClosing] = useState(false);

  // Nach dem Ausblenden das Overlay entfernen.
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onDismiss, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closing, onDismiss]);

  function onTap() {
    if (!flipped) {
      setFlipped(true);
    } else {
      setClosing(true);
    }
  }

  return (
    <div
      className={`welcome-backdrop${closing ? " closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Begrüßung"
    >
      <button
        type="button"
        className={`welcome-card${flipped ? " flipped" : ""}`}
        onClick={onTap}
        disabled={closing}
      >
        <span className="welcome-inner">
          <span className="welcome-face" aria-hidden={flipped}>
            <span className="welcome-tag">Spanisch</span>
            <span className="welcome-text front">{FRONT}</span>
            <span className="welcome-sub">{FRONT_SUB}</span>
            <span className="welcome-credit">
              {FRONT_CREDIT} <Heart /> de Fabian König
            </span>
            <span className="welcome-hint">Tippen zum Umdrehen</span>
          </span>
          <span className="welcome-face back" aria-hidden={!flipped}>
            <span className="welcome-tag">Deutsch</span>
            <span className="welcome-text">{BACK}</span>
            <span className="welcome-sub">{BACK_SUB}</span>
            <span className="welcome-credit">
              {BACK_CREDIT} <Heart /> von Fabian König
            </span>
            <span className="welcome-hint">Tippen zum Schließen</span>
          </span>
        </span>
      </button>
    </div>
  );
}
