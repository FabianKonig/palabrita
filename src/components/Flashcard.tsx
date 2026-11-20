import { useMemo, type ReactNode } from "react";
import { conjugate } from "../domain/conjugation";
import { GENDER_LABEL } from "../domain/gender";
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
  /** Sits on the Spanish side of the card (e.g. the speaker button) and turns with it. */
  spanishAction?: ReactNode;
}

/** Front: German (de-es) or Spanish (es-de). Tap turns the card around (3D flip), as often as wanted. */
export function Flashcard({
  vocab,
  dir,
  flipped,
  onToggle,
  spanishAction,
}: Props) {
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
  /**
   * Spanish headword. Nouns show the plural in smaller type below the singular, then the
   * gender badge (maskulin, feminin, maskulin/feminin); verbs get the conjugation hint
   * (e.g. "(ie)") on its own line.
   */
  const spanish = (
    <>
      <span className="word">{vocab.es}</span>
      {vocab.pos === "noun" && vocab.plural && (
        <span className="plural">{vocab.plural}</span>
      )}
      {vocab.pos === "noun" && vocab.gender && (
        <span className="gender">{GENDER_LABEL[vocab.gender]}</span>
      )}
      {annotation && <span className="annotation">{annotation}</span>}
    </>
  );

  const sides = [
    {
      key: "front",
      content:
        dir === "de-es" ? <span className="word">{german}</span> : spanish,
      back: false,
    },
    {
      key: "back",
      content: (
        <>
          {dir === "de-es" ? spanish : <span className="word">{german}</span>}
          {vocab.example && (
            <>
              <span className="example">{vocab.example.es}</span>
              <span className="example-de">{vocab.example.de}</span>
            </>
          )}
          {vocab.note && <span className="badge">{vocab.note}</span>}
        </>
      ),
      back: true,
    },
  ];

  // Both faces are always rendered (stacked in one grid cell), so the card can turn around
  // like the welcome card. The hidden face is aria-hidden and inert (no focus, no clicks).
  // The toggle is a button *behind* the faces: the faces let clicks through, only the
  // spanishAction (a button itself, so it must not sit inside the toggle) catches its own.
  const spanishOnBack = dir === "de-es";
  return (
    <div className={`flashcard${flipped ? " flipped" : ""}`}>
      <button
        type="button"
        className="flashcard-toggle"
        onClick={onToggle}
        aria-pressed={flipped}
        aria-label={
          flipped ? "Rückseite, Karte umdrehen" : "Vorderseite, Karte umdrehen"
        }
      />
      <div className="flashcard-inner">
        {sides.map(({ key, content, back }) => (
          <div
            key={key}
            className={`flashcard-face${back ? " back" : ""}`}
            aria-hidden={back !== flipped}
            inert={back !== flipped}
          >
            <span className="dir">{dirLabel}</span>
            {content}
            {back === spanishOnBack && spanishAction}
            <span className="hint">Tippen zum Umdrehen</span>
          </div>
        ))}
      </div>
    </div>
  );
}
