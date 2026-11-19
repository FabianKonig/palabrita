import { useCallback, useEffect, useRef } from "react";
import { useSwipeToClose } from "../hooks/useSwipeToClose";
import type { Vocab } from "../domain/types";
import { VerbDetail } from "./VerbDetail";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const HISTORY_FLAG = "palabritaOverlay";

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
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // History entry: back (popstate) closes the overlay.
  useEffect(() => {
    if (!window.history.state?.[HISTORY_FLAG]) {
      window.history.pushState(
        { ...window.history.state, [HISTORY_FLAG]: true },
        "",
      );
    }
    const onPop = () => onCloseRef.current();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Closing by button, Escape or backdrop removes our history entry; popstate then closes.
  const requestClose = useCallback(() => {
    if (window.history.state?.[HISTORY_FLAG]) window.history.back();
    else onCloseRef.current();
  }, []);

  // Phones: dragging the sheet down closes it.
  useSwipeToClose(dialog, backdrop, requestClose);

  // Focus: into the dialog on open, back to the previous element on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      requestClose();
      return;
    }
    if (e.key !== "Tab" || !dialog.current) return;
    const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === dialog.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

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
