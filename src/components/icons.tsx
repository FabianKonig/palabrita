import type { ReactNode } from "react";

/** Linien-Icons (24×24, currentColor). Dekorativ, daher aria-hidden. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="svg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const CardsIcon = () => (
  <Icon>
    <rect x="4" y="5" width="16" height="14" rx="3" />
    <path d="M8 10h8M8 14h5" />
  </Icon>
);
export const BookIcon = () => (
  <Icon>
    <path d="M4 5h6a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H4zM20 5h-4a3 3 0 0 0-3 3" />
    <path d="M20 5v12h-4" />
  </Icon>
);
export const ChartIcon = () => (
  <Icon>
    <path d="M5 20V10M12 20V4M19 20v-7" />
  </Icon>
);
export const MoreIcon = () => (
  <Icon>
    <circle cx="6" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="18" cy="12" r="1.2" />
  </Icon>
);
export const SpeakerIcon = () => (
  <Icon>
    <path d="M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6" />
  </Icon>
);

/** Gefülltes Play-Dreieck (Wiedergabe), dekorativ. */
export const PlayIcon = () => (
  <svg
    className="svg-icon"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
);
