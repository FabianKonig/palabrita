import { useRef } from "react";
import { useDialogBehavior } from "../hooks/useDialogBehavior";
import { useSwipeToClose } from "../hooks/useSwipeToClose";
import type { Vocab } from "../domain/types";
import { VerbDetail } from "./VerbDetail";

/**
 * Dialog (bottom sheet on phones) with the conjugation table, shown above the study session.
 * Opening adds a history entry, so the device back button only closes the overlay.
 */
export function VerbOverlay({
  vocab,
  onClose,
}: {
  vocab: Vocab;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const { requestClose, onKeyDown } = useDialogBehavior(dialog, onClose);

  // Phones: dragging the sheet down closes it.
  useSwipeToClose(dialog, backdrop, requestClose);

  return (
    <div
      ref={backdrop}
      className="overlay-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={dialog}
        className="overlay-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verb-overlay-title"
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <div className="overlay-grip" aria-hidden="true" />
        <VerbDetail
          vocab={vocab}
          titleId="verb-overlay-title"
          legendLink={false}
        />
        <button type="button" className="btn btn-block" onClick={requestClose}>
          Schließen
        </button>
      </div>
    </div>
  );
}
