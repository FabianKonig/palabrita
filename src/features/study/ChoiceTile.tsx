export type TileTone = "turquoise" | "yellow" | "magenta" | "neutral";

/** Kachel der Lernen-Seite: Beschriftung, Wert, optional Untertext. Öffnet ein Auswahlfenster. */
export function ChoiceTile({
  label,
  value,
  sub,
  fullValue,
  tone,
  disabled = false,
  onOpen,
}: {
  label: string;
  value: string;
  sub?: string;
  fullValue?: string;
  tone: TileTone;
  disabled?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={`study-tile study-tile-${tone}`}
      disabled={disabled}
      aria-haspopup={disabled ? undefined : "dialog"}
      aria-label={
        disabled
          ? `${label}: ${fullValue ?? value}`
          : `${label}: ${fullValue ?? value}, ändern`
      }
      onClick={onOpen}
    >
      <span className="study-tile-top">
        <span className="study-tile-label">{label}</span>
        {!disabled && (
          <span className="study-tile-pen" aria-hidden="true">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
            </svg>
          </span>
        )}
      </span>
      <span className="study-tile-bottom">
        <span className="study-tile-value">{value}</span>
        {sub && <span className="study-tile-sub">{sub}</span>}
      </span>
    </button>
  );
}
