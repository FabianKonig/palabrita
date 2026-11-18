import { NavLink } from "react-router-dom";

interface Tab {
  to: string;
  label: string;
  icon: string;
  /** false = target screen does not exist yet (comes with a later task). */
  enabled: boolean;
}

const TABS: Tab[] = [
  { to: "/", label: "Start", icon: "🏠", enabled: true },
  { to: "/study", label: "Lernen", icon: "🃏", enabled: true },
  { to: "/dictionary", label: "Verzeichnis", icon: "📖", enabled: true },
  { to: "/stats", label: "Statistik", icon: "📊", enabled: true },
  { to: "/more", label: "Mehr", icon: "⋯", enabled: true },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Hauptnavigation">
      {TABS.map((t) =>
        t.enabled ? (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === "/"}
            className={({ isActive }) => `tab${isActive ? " active" : ""}`}
          >
            <span className="icon" aria-hidden="true">
              {t.icon}
            </span>
            {t.label}
          </NavLink>
        ) : (
          <span
            key={t.to}
            className="tab"
            aria-disabled="true"
            title="Kommt bald"
          >
            <span className="icon" aria-hidden="true">
              {t.icon}
            </span>
            {t.label}
          </span>
        ),
      )}
    </nav>
  );
}
