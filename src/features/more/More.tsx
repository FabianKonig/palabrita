import { Link, useOutletContext } from "react-router-dom";
import { Brand } from "../../components/Brand";
import type { WelcomeOutletContext } from "../../components/WelcomeOverlay";
import { APP_VERSION } from "../../version";

interface Entry {
  to: string;
  label: string;
  /** false = comes with a later task, shown disabled. */
  enabled: boolean;
}

const ENTRIES: Entry[] = [
  { to: "/settings", label: "Einstellungen", enabled: true },
  { to: "/legend", label: "Legende", enabled: true },
  { to: "/privacy", label: "Datenschutz", enabled: true },
  { to: "/imprint", label: "Impressum", enabled: true },
];

export function More() {
  const { openWelcome } = useOutletContext<WelcomeOutletContext>();
  return (
    <div className="screen">
      <Brand onWordmarkClick={openWelcome} />
      <ul className="link-list">
        {ENTRIES.map((e) => (
          <li key={e.to}>
            {e.enabled ? (
              <Link to={e.to}>{e.label}</Link>
            ) : (
              <span aria-disabled="true">{e.label} (kommt bald)</span>
            )}
          </li>
        ))}
      </ul>
      <p className="muted app-version">Version: {APP_VERSION}</p>
    </div>
  );
}
