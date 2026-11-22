import { useState } from "react";
import { Link } from "react-router-dom";
import { isVideoHintDone, markVideoHintDone } from "../data/videoHintFlag";
import { PlayIcon } from "./icons";

/**
 * Hinweisleiste „Neu hier? Erklärvideo ansehen“ über der Tab-Leiste der Lernauswahl.
 * Bleibt, bis sie über ✕ weggetippt oder das Video geöffnet wurde (Merker pro Gerät).
 * `hidden`: solange die Begrüßungskarte darüber liegt, wird sie nicht gezeigt.
 */
export function VideoHint({ hidden = false }: { hidden?: boolean }) {
  const [done, setDone] = useState(() => isVideoHintDone());
  if (done || hidden) return null;

  function finish() {
    markVideoHintDone();
    setDone(true);
  }

  return (
    <aside className="video-hint" aria-label="Hinweis zum Erklärvideo">
      <Link to="/video" className="video-hint-link" onClick={finish}>
        <span className="video-hint-play" aria-hidden="true">
          <PlayIcon />
        </span>
        <span className="video-hint-text">
          <b>Neu hier? Erklärvideo ansehen</b>
          <small>Palabrita in einer Minute</small>
        </span>
      </Link>
      <button
        type="button"
        className="video-hint-close"
        aria-label="Hinweis schließen"
        onClick={finish}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </aside>
  );
}
