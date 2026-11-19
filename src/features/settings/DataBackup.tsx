import { useRef, useState } from "react";
import {
  applyImport,
  buildExport,
  parseExport,
  type ExportFile,
  type ImportMode,
} from "../../data/exportImport";

/** Export and import of all local data (the only way to move between devices). */
export function DataBackup() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<ExportFile | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function onExport() {
    setError(null);
    try {
      const file = await buildExport();
      const blob = new Blob([JSON.stringify(file, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `palabrita-${file.exportedAt.slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Export erstellt.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onFile(file: File | undefined) {
    setError(null);
    setMessage(null);
    setPending(null);
    setConfirmReplace(false);
    if (!file) return;
    try {
      setPending(parseExport(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function onApply(mode: ImportMode) {
    if (!pending) return;
    try {
      await applyImport(pending, mode);
      // Settings and vocabulary are held in memory: reload to pick up the new data.
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <section className="backup">
      <h2>Daten sichern</h2>
      <p className="muted">
        Fortschritt und Einstellungen liegen nur in diesem Browser. Mit Export
        und Import lassen sie sich sichern oder auf ein anderes Gerät
        übertragen.
      </p>
      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <div className="backup-actions">
        <button type="button" className="btn" onClick={() => void onExport()}>
          Exportieren
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => input.current?.click()}
        >
          Importieren …
        </button>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            void onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {pending && (
        <div className="panel">
          <p>Datei gelesen: {pending.cards.length} Karten. Wie importieren?</p>
          {!confirmReplace ? (
            <div className="backup-actions">
              <button
                type="button"
                className="btn"
                onClick={() => void onApply("merge")}
              >
                Zusammenführen
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setConfirmReplace(true)}
              >
                Ersetzen …
              </button>
            </div>
          ) : (
            <>
              <p className="notice">
                Alle lokalen Daten (auch Einstellungen) werden durch die Datei
                ersetzt. Wirklich ersetzen?
              </p>
              <div className="backup-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => void onApply("replace")}
                >
                  Ja, ersetzen
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setConfirmReplace(false)}
                >
                  Abbrechen
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
