import { useMemo } from "react";
import { conjugate } from "../domain/conjugation";
import type { Direction, Vocab } from "../domain/types";

/** All German entries joined with " · ", the first one highlighted. */
export function GermanText({ de }: { de: string[] }) {
  const [first, ...rest] = de;
  return (
    <span>
      <span className="first">{first}</span>
      {rest.length > 0 && (
        <span className="rest">{` · ${rest.join(" · ")}`}</span>
      )}
    </span>
  );
}

interface Props {
  vocab: Vocab;
  dir: Direction;
  flipped: boolean;
  onToggle: () => void;
}

/** Front: German (de-es) or Spanish (es-de). Tap toggles between front and back, as often as wanted. */
export function Flashcard({ vocab, dir, flipped, onToggle }: Props) {
  const dirLabel =
    dir === "de-es" ? "Deutsch → Spanisch" : "Spanisch → Deutsch";
  const german = <GermanText de={vocab.de} />;
  const annotation = useMemo(() => {
    if (vocab.pos !== "verb") return "";
    try {
      return conjugate(vocab).annotation;
    } catch {
      return "";
    }
  }, [vocab]);
  /** Spanish headword; verbs get the conjugation hint (e.g. "(ie)") on its own line. */
  const spanish = (
    <>
      <span className="word">{vocab.es}</span>
      {annotation && <span className="annotation">{annotation}</span>}
    </>
  );

  return (
    <button
      type="button"
      className={`flashcard${flipped ? " flipped" : ""}`}
      onClick={onToggle}
      aria-pressed={flipped}
      aria-label={
        flipped ? "Rückseite, Karte umdrehen" : "Vorderseite, Karte umdrehen"
      }
    >
      <span className="dir">{dirLabel}</span>
      {!flipped ? (
        <>
          {dir === "de-es" ? <span className="word">{german}</span> : spanish}
          <span className="hint">Tippen zum Umdrehen</span>
        </>
      ) : (
        <>
          {dir === "de-es" ? spanish : <span className="word">{german}</span>}
          {vocab.example && (
            <>
              <span className="example">{vocab.example.es}</span>
              <span className="example-de">{vocab.example.de}</span>
            </>
          )}
          {vocab.note && <span className="badge">{vocab.note}</span>}
          <span className="hint">Tippen zum Umdrehen</span>
        </>
      )}
    </button>
  );
}
