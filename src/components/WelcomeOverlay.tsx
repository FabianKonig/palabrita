import { useEffect, useState, type MouseEvent } from "react";
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

/** Kontext, den die Layout-Route an Unterseiten weitergibt (z. B. Tab „Mehr“). */
export interface WelcomeOutletContext {
  /** Öffnet die Begrüßungskarte erneut. Speichert nichts. */
  openWelcome: () => void;
  /** True, solange die Erststart-Begrüßung über der Lernseite liegt. */
  welcomeVisible: boolean;
}

/**
 * Begrüßungskarte: eine Lernkarte schwebt über der aktuellen Seite.
 * Erstes Tippen dreht sie um, zweites Tippen schließt das Overlay.
 * Beim Erststart speichert der Aufrufer, dass der Hinweis gesehen wurde;
 * wird die Karte über den Markenkopf erneut geöffnet, passiert dabei nichts weiter.
 * Der Aufrufer sperrt die Seite dahinter.
 */
export function WelcomeOverlay({
  onDismiss,
  closeOnBackdrop = false,
}: {
  onDismiss: () => void;
  /** Nur beim erneuten Öffnen: ein Klick auf die Fläche neben der Karte schließt sofort. */
  closeOnBackdrop?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [closing, setClosing] = useState(false);

  // Nach dem Ausblenden das Overlay entfernen.
  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(onDismiss, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closing, onDismiss]);

  function close() {
    setClosing(true);
  }

  function onTap() {
    if (!flipped) {
      setFlipped(true);
    } else {
      close();
    }
  }

  // Erststart: die Fläche tut nichts, es muss die Karte angetippt werden.
  function onBackdropClick(e: MouseEvent<HTMLDivElement>) {
    if (closeOnBackdrop && e.target === e.currentTarget) close();
  }

  return (
    <div
      className={`welcome-backdrop${closing ? " closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Begrüßung"
      onClick={onBackdropClick}
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
