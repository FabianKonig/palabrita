import { Link, useOutletContext } from "react-router-dom";
import { Brand } from "../../components/Brand";
import type { WelcomeOutletContext } from "../../components/WelcomeOverlay";
import { APP_VERSION } from "../../version";

const ENTRIES = [
  { to: "/settings", label: "Einstellungen" },
  { to: "/legend", label: "Legende" },
  { to: "/privacy", label: "Datenschutz" },
  { to: "/imprint", label: "Impressum" },
];

export function More() {
  const { openWelcome } = useOutletContext<WelcomeOutletContext>();
  return (
    <div className="screen">
      <Brand onWordmarkClick={openWelcome} />
      <ul className="link-list">
        {ENTRIES.map((e) => (
          <li key={e.to}>
            <Link to={e.to}>{e.label}</Link>
          </li>
        ))}
      </ul>
      <p className="muted app-version">Version: {APP_VERSION}</p>
    </div>
  );
}
