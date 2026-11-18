import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BookIcon, CardsIcon, ChartIcon, HomeIcon, MoreIcon } from "./icons";

interface Tab {
  to: string;
  label: string;
  icon: ReactNode;
  /** false = target screen does not exist yet (comes with a later task). */
  enabled: boolean;
}

const TABS: Tab[] = [
  { to: "/", label: "Start", icon: <HomeIcon />, enabled: true },
  { to: "/study", label: "Lernen", icon: <CardsIcon />, enabled: true },
  {
    to: "/dictionary",
    label: "Verzeichnis",
    icon: <BookIcon />,
    enabled: true,
  },
  { to: "/stats", label: "Statistik", icon: <ChartIcon />, enabled: true },
  { to: "/more", label: "Mehr", icon: <MoreIcon />, enabled: true },
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
            <span className="icon">{t.icon}</span>
            {t.label}
          </NavLink>
        ) : (
          <span
            key={t.to}
            className="tab"
            aria-disabled="true"
            title="Kommt bald"
          >
            <span className="icon">{t.icon}</span>
            {t.label}
          </span>
        ),
      )}
    </nav>
  );
}
