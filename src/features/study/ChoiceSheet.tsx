import { useEffect, useRef } from "react";
import type { ChoiceOption } from "./studyChoices";

/** Auswahlfenster von unten (Prototyp: Dialog-Logik noch nicht im gemeinsamen Hook). */
export function ChoiceSheet({
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  title: string;
  options: ChoiceOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(
      '[aria-checked="true"]',
    );
    el?.scrollIntoView({ block: "nearest" });
    el?.focus();
  }, []);
  return (
    <div
      className="overlay-backdrop study-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="study-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-sheet-title"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="study-grip" aria-hidden="true" />
        <h2 id="study-sheet-title">{title}</h2>
        <div
          ref={list}
          className="study-options"
          role="radiogroup"
          aria-labelledby="study-sheet-title"
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={o.value === selected}
              className="study-option"
              onClick={() => onSelect(o.value)}
            >
              <span className="study-radio" aria-hidden="true" />
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
