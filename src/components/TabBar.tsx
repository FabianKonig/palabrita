import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BookIcon, CardsIcon, ChartIcon, MoreIcon } from "./icons";

interface Tab {
  to: string;
  label: string;
  icon: ReactNode;
}

const TABS: Tab[] = [
  { to: "/", label: "Lernen", icon: <CardsIcon /> },
  {
    to: "/dictionary",
    label: "Verzeichnis",
    icon: <BookIcon />,
  },
  { to: "/stats", label: "Statistik", icon: <ChartIcon /> },
  { to: "/more", label: "Mehr", icon: <MoreIcon /> },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Hauptnavigation">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === "/"}
          className={({ isActive }) => `tab${isActive ? " active" : ""}`}
        >
          <span className="icon">{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
