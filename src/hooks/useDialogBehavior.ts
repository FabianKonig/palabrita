import { useCallback, useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const HISTORY_FLAG = "palabritaOverlay";

/**
 * Gemeinsames Verhalten der Dialoge (Verb-Overlay, Auswahlfenster der Lernen-Seite):
 * - Öffnen legt einen History-Eintrag an, die Zurück-Taste (`popstate`) schließt nur den Dialog.
 * - Schließen per `requestClose` (Button, Escape, Hintergrund, Wischen, Auswahl) nimmt den Eintrag wieder weg.
 * - Escape schließt, Tab bleibt im Dialog (Elemente mit `tabindex="-1"` zählen nicht, wegen Roving-Tabindex).
 * - Fokus: beim Öffnen auf `initialFocus()` (sonst der Dialog selbst), beim Schließen zurück zum vorherigen Element.
 *
 * `onClose` darf sich bei jedem Render ändern. `requestClose` ist stabil (gut für `useSwipeToClose`).
 */
export function useDialogBehavior(
  dialog: RefObject<HTMLElement | null>,
  onClose: () => void,
  initialFocus?: () => HTMLElement | null | undefined,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const initialFocusRef = useRef(initialFocus);
  useEffect(() => {
    initialFocusRef.current = initialFocus;
  }, [initialFocus]);

  // History entry: back (popstate) closes the dialog.
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

  // Closing by button, Escape, backdrop or swipe removes our history entry; popstate then closes.
  const requestClose = useCallback(() => {
    if (window.history.state?.[HISTORY_FLAG]) window.history.back();
    else onCloseRef.current();
  }, []);

  // Focus: into the dialog on open, back to the previous element on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    (initialFocusRef.current?.() ?? dialog.current)?.focus();
    return () => previous?.focus();
  }, [dialog]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        requestClose();
        return;
      }
      if (e.key !== "Tab" || !dialog.current) return;
      const items = [
        ...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
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
    },
    [dialog, requestClose],
  );

  return { requestClose, onKeyDown };
}
