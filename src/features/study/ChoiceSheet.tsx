import { useRef, useState } from "react";
import { useDialogBehavior } from "../../hooks/useDialogBehavior";
import { useSwipeToClose } from "../../hooks/useSwipeToClose";
import type { ChoiceOption } from "./studyChoices";

/**
 * Auswahlfenster von unten (SPEC §14.4): Einfachauswahl, ein Tipp wählt und schließt.
 * Wird nur bei „offen“ eingehängt. Dialog-Verhalten (History, Escape, Fokus) kommt aus `useDialogBehavior`.
 */
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
  const dialog = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === selected),
  );
  // Roving-Tabindex: nur diese Option ist per Tab erreichbar, Pfeiltasten verschieben sie.
  const [active, setActive] = useState(selectedIndex);

  const optionEls = () => [
    ...(list.current?.querySelectorAll<HTMLElement>('[role="radio"]') ?? []),
  ];

  const { requestClose, onKeyDown } = useDialogBehavior(dialog, onClose, () => {
    const el = optionEls()[selectedIndex];
    el?.scrollIntoView({ block: "nearest" });
    return el;
  });

  useSwipeToClose(dialog, backdrop, requestClose, list);

  function moveFocus(to: number) {
    const items = optionEls();
    const next = (to + items.length) % items.length;
    setActive(next);
    items[next]?.focus();
    items[next]?.scrollIntoView({ block: "nearest" });
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    const count = options.length;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      moveFocus(active + 1);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      moveFocus(active - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      moveFocus(0);
    } else if (e.key === "End") {
      e.preventDefault();
      moveFocus(count - 1);
    }
  }

  return (
    <div
      ref={backdrop}
      className="overlay-backdrop study-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialog}
        className="study-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-sheet-title"
        onKeyDown={onKeyDown}
      >
        <div className="study-grip" aria-hidden="true" />
        <h2 id="study-sheet-title">{title}</h2>
        <div
          ref={list}
          className="study-options"
          role="radiogroup"
          aria-labelledby="study-sheet-title"
          onKeyDown={onListKeyDown}
        >
          {options.map((o, i) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={o.value === selected}
              tabIndex={i === active ? 0 : -1}
              className="study-option"
              onClick={() => {
                onSelect(o.value);
                requestClose();
              }}
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
