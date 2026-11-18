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
