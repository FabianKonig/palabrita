import { useState } from "react";
import { Link } from "react-router-dom";
import {
  LEVEL_ORDER,
  type DirectionSetting,
  type Level,
  type Settings as SettingsData,
} from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";
import { DataBackup } from "./DataBackup";

const LEVELS = Object.keys(LEVEL_ORDER) as Level[];

const DIRECTIONS: { value: DirectionSetting; label: string }[] = [
  { value: "de-es", label: "Deutsch → Spanisch" },
  { value: "es-de", label: "Spanisch → Deutsch" },
  { value: "both", label: "Beide Richtungen" },
];

const THEMES: { value: SettingsData["theme"]; label: string }[] = [
  { value: "system", label: "Wie das Gerät" },
  { value: "light", label: "Hell" },
  { value: "dark", label: "Dunkel" },
];

export function Settings() {
  const { settings, updateSettings } = useAppData();
  const [error, setError] = useState<string | null>(null);

  function change(patch: Partial<SettingsData>) {
    setError(null);
    updateSettings(patch).catch((e: unknown) =>
      setError(e instanceof Error ? e.message : String(e)),
    );
  }

  return (
    <div className="screen">
      <p>
        <Link to="/more">← Mehr</Link>
      </p>
      <h1>Einstellungen</h1>
      {error && (
        <p className="notice" role="alert">
          Speichern fehlgeschlagen: {error}
        </p>
      )}

      <div className="settings-form">
        <label className="setting">
          <span>Höchstes Niveau</span>
          <select
            value={settings.maxLevel}
            onChange={(e) => change({ maxLevel: e.target.value as Level })}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <small className="muted">
            Ein niedrigeres Niveau blendet Vokabeln nur aus. Fortschritt bleibt
            erhalten.
          </small>
        </label>

        <label className="setting">
          <span>Richtung</span>
          <select
            value={settings.direction}
            onChange={(e) =>
              change({ direction: e.target.value as DirectionSetting })
            }
          >
            {DIRECTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <small className="muted">
            Der Fortschritt wird je Richtung getrennt gespeichert.
          </small>
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.autoSpeak}
            onChange={(e) => change({ autoSpeak: e.target.checked })}
          />
          Automatisch vorlesen
        </label>

        <label className="setting">
          <span>Darstellung</span>
          <select
            value={settings.theme}
            onChange={(e) =>
              change({ theme: e.target.value as SettingsData["theme"] })
            }
          >
            {THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <DataBackup />
    </div>
  );
}
