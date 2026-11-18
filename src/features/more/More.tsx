import { Link } from "react-router-dom";

interface Entry {
  to: string;
  label: string;
  /** false = comes with a later task, shown disabled. */
  enabled: boolean;
}

const ENTRIES: Entry[] = [
  { to: "/settings", label: "Einstellungen", enabled: true },
  { to: "/legend", label: "Legende", enabled: true },
];

export function More() {
  return (
    <div className="screen">
      <h1>Mehr</h1>
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
    </div>
  );
}
