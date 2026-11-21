import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Brand } from "../../components/Brand";
import { PlayIcon } from "../../components/icons";
import type { WelcomeOutletContext } from "../../components/WelcomeOverlay";
import { useAppData } from "../../hooks/useAppData";
import { APP_VERSION } from "../../version";

const ENTRIES = [
  { to: "/settings", label: "Einstellungen" },
  { to: "/legend", label: "Legende" },
  { to: "/privacy", label: "Datenschutz" },
  { to: "/imprint", label: "Impressum" },
];

/** idle → confirm (Rückfrage) → working → done oder error. */
type ResetState = "idle" | "confirm" | "working" | "done" | "error";

/** „Lernfortschritt zurücksetzen“ mit Rückfrage, damit nichts versehentlich verloren geht. */
function ResetProgress() {
  const { resetProgress } = useAppData();
  const [state, setState] = useState<ResetState>("idle");
  const [error, setError] = useState("");
  const panel = useRef<HTMLDivElement>(null);

  // Auf kleinen Bildschirmen liegt die Rückfrage sonst unter der Tab-Leiste.
  useEffect(() => {
    if (state === "confirm")
      panel.current?.scrollIntoView({ block: "center", behavior: "auto" });
  }, [state]);

  async function confirmReset() {
    setState("working");
    try {
      await resetProgress();
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setState("error");
    }
  }

  const asking =
    state === "confirm" || state === "working" || state === "error";

  return (
    <section className="reset-progress">
      {!asking && (
        <button
          type="button"
          className="link-button"
          onClick={() => setState("confirm")}
        >
          Lernfortschritt zurücksetzen
        </button>
      )}
      {state === "done" && (
        <p className="notice" role="status">
          Der Lernfortschritt wurde zurückgesetzt. Du startest wieder bei null.
        </p>
      )}
      {asking && (
        <div
          ref={panel}
          className="panel reset-confirm"
          role="group"
          aria-labelledby="reset-title"
        >
          <h2 id="reset-title">Lernfortschritt zurücksetzen?</h2>
          <p>
            Alle gelernten Karten werden gelöscht, samt Bewertungen,
            Wiederholungen und Fälligkeiten. Du startest danach von vorne, mit
            neuer Reihenfolge der Vokabeln. Das lässt sich nicht rückgängig
            machen.
          </p>
          <p className="muted">
            Höchstes Niveau und Darstellung bleiben erhalten.
          </p>
          {state === "error" && (
            <p className="notice" role="alert">
              Zurücksetzen fehlgeschlagen: {error}
            </p>
          )}
          <div className="actions">
            <button
              type="button"
              className="btn btn-block btn-danger"
              onClick={() => void confirmReset()}
              disabled={state === "working"}
            >
              Endgültig zurücksetzen
            </button>
            <button
              type="button"
              className="btn btn-block secondary"
              onClick={() => setState("idle")}
              disabled={state === "working"}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export function More() {
  const { openWelcome } = useOutletContext<WelcomeOutletContext>();
  return (
    <div className="screen">
      <Brand onWordmarkClick={openWelcome} />
      <ul className="link-list">
        {ENTRIES.map((e) => (
          <li key={e.to}>
            <Link to={e.to}>{e.label}</Link>
          </li>
        ))}
        <li>
          <Link to="/video" className="link-featured">
            <span className="link-featured-text">
              <span>Erklärvideo</span>
              <small>Palabrita in einer Minute</small>
            </span>
            <span className="link-featured-play">
              <PlayIcon />
            </span>
          </Link>
        </li>
      </ul>
      <ResetProgress />
      <p className="muted app-version">Version: {APP_VERSION}</p>
    </div>
  );
}
