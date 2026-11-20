import { useCallback, useEffect, useRef } from "react";

const GUARD_FLAG = "palabritaSessionGuard";
/** Flag der Dialoge (`useDialogBehavior`). Ihr Eintrag erbt auch unser Flag, da er den Zustand übernimmt. */
const OVERLAY_FLAG = "palabritaOverlay";

function guardIsCurrent(): boolean {
  return Boolean(window.history.state?.[GUARD_FLAG]);
}

function pushGuard() {
  window.history.pushState({ ...window.history.state, [GUARD_FLAG]: true }, "");
}

/**
 * Die Zurück-Taste (Android, Browser-Pfeil, Wischgeste unter iOS) soll in der Lernsitzung nicht die Seite
 * verlassen, sondern wie der Button „Beenden“ wirken. Das geht in jedem Browser über die History-API
 * (`pushState` und `popstate`), also ohne Chrome-Besonderheiten.
 *
 * - Beim Einhängen legt der Hook einen zusätzlichen History-Eintrag („Wächter“) an. Zurück entfernt nur ihn.
 * - `onBack` wird dann aufgerufen. Gibt es `true` zurück, bleibt der Nutzer auf der Seite (z. B. Sitzung →
 *   Zusammenfassung): Der Hook legt sofort einen neuen Wächter an, damit auch die nächste Zurück-Taste
 *   abgefangen wird. Bei `false` wurde die Sitzung verlassen, es gibt keinen Wächter mehr.
 * - Dialoge über der Sitzung (Verb-Overlay) legen einen eigenen Eintrag oben auf den Wächter. Zurück schließt dann
 *   nur den Dialog: Wir erkennen das daran, dass der Wächter nach dem `popstate` noch der aktuelle Eintrag ist.
 *
 * `requestBack` löst dasselbe aus wie die Zurück-Taste, nur per Button: Es nimmt den Wächter weg
 * (`history.back()`), das `popstate` ruft dann `onBack`. So bleibt die History auch beim Button sauber.
 * Ohne Wächter ruft es `onBack` direkt auf.
 *
 * `onBack` darf sich bei jedem Render ändern.
 */
export function useSessionBackGuard(onBack: () => boolean) {
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    // Nach Neuladen oder Zurück aus einem späteren Eintrag steht der Wächter schon: nicht doppelt anlegen.
    if (!guardIsCurrent()) pushGuard();
    const onPop = () => {
      // Ein Dialog wurde geschlossen, der Wächter liegt wieder oben: nicht unsere Sache.
      if (guardIsCurrent()) return;
      if (onBackRef.current()) pushGuard();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const requestBack = useCallback(() => {
    if (guardIsCurrent() && !window.history.state?.[OVERLAY_FLAG]) {
      window.history.back();
    } else {
      onBackRef.current();
    }
  }, []);

  return { requestBack };
}

/**
 * Ein übrig gebliebener Wächter (Neuladen mitten in der Sitzung, oder Zurück aus einem späteren Eintrag) steht dann
 * auf der Filterauswahl, wo niemand auf ihn achtet. Er wird beim Einhängen entwertet: Das Flag fällt aus dem
 * Zustand des aktuellen Eintrags, ohne zu navigieren. Der Eintrag bleibt als gewöhnlicher Eintrag stehen, im
 * seltenen Neuladen-Fall kostet das eine zusätzliche Zurück-Taste. Ein `history.back()` wäre riskant: Es müsste
 * genau auf dem Eintrag darunter landen und kann nach einem Neuladen woanders hinführen.
 */
export function useDropStaleGuard() {
  useEffect(() => {
    const state = window.history.state;
    if (state?.[GUARD_FLAG] && !state[OVERLAY_FLAG]) {
      window.history.replaceState({ ...state, [GUARD_FLAG]: false }, "");
    }
  }, []);
}
