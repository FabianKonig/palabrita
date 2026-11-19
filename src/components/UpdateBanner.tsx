import { useRegisterSW } from "virtual:pwa-register/react";

/** Shown when a new app version is waiting; the click activates it and reloads. */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

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
