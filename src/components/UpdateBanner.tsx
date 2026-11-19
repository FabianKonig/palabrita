import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Intervall, in dem der Browser auf eine neue Version prüft, solange die App
 * geöffnet ist. Timer pausieren im Hintergrund; die Prüfung beim Zurückkehren
 * in den Vordergrund deckt den Rest ab.
 */
const UPDATE_CHECK_MS = 15 * 60 * 1000;

/**
 * Shown when a new app version is waiting; the click activates it and reloads.
 * Prüft periodisch und beim Zurückkehren in den Vordergrund, ob eine neue
 * Version bereitliegt, ohne dass die Seite neu geladen werden muss.
 */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      window.setInterval(() => void registration.update(), UPDATE_CHECK_MS);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          void registration.update();
        }
      });
    },
  });

  if (!needRefresh) return null;
  return (
    <div className="update-banner" role="status">
      <span className="update-banner-icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 4v5h-5" />
        </svg>
      </span>
      <span>Neue Version verfügbar.</span>
      <button
        type="button"
        className="btn"
        onClick={() => void updateServiceWorker(true)}
      >
        Aktualisieren
      </button>
    </div>
  );
}
