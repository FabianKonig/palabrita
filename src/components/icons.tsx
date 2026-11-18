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

export const HomeIcon = () => (
  <Icon>
    <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
  </Icon>
);
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
