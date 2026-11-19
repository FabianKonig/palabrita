import { useEffect, useState } from "react";
import { Credit, TAGLINE_ES, Wordmark } from "./Brand";

/** Vorderseite Spanisch, Rückseite Deutsch. Der Schriftzug „Palabrita“ steht in der Mitte. */
const FRONT_LEAD = "¡Bienvenido a";
const BACK_LEAD = "Willkommen zu";
/** Kleine Zeile unter dem Schriftzug, Spanisch vorne, Deutsch hinten. */
const FRONT_SUB = TAGLINE_ES;
const BACK_SUB = "Deine Spanisch-Vokabel-App";
/** Kleinste Zeile: Widmung, das Herz ersetzt das Wort „Liebe“. */
const FRONT_CREDIT = "Con";
const BACK_CREDIT = "Mit";
/** Dauer des Ausblendens, bevor das Overlay verschwindet. */
const CLOSE_MS = 250;

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
            <span className="welcome-lead">{FRONT_LEAD}</span>
            <Wordmark />
            <span className="welcome-sub">{FRONT_SUB}</span>
            <Credit lead={FRONT_CREDIT} tail="de Fabian König" />
            <span className="welcome-hint">Tippen zum Umdrehen</span>
          </span>
          <span className="welcome-face back" aria-hidden={!flipped}>
            <span className="welcome-tag">Deutsch</span>
            <span className="welcome-lead">{BACK_LEAD}</span>
            <Wordmark />
            <span className="welcome-sub">{BACK_SUB}</span>
            <Credit lead={BACK_CREDIT} tail="von Fabian König" />
            <span className="welcome-hint">Tippen zum Schließen</span>
          </span>
        </span>
      </button>
    </div>
  );
}
