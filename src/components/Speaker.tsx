import { SpeakerIcon } from "./icons";
import { useSpeech } from "../hooks/useSpeech";

/** Speaker button for a Spanish text plus the "no voice" notice (SPEC §13). */
export function Speaker({ es }: { es: string }) {
  const speech = useSpeech();
  const showNotice = speech.checked && !speech.available;
  return (
    <>
      <button
        type="button"
        className="speak speak-inline"
        onClick={() => speech.speak(es)}
        disabled={!speech.available}
        aria-label="Aussprache anhören"
        title={
          speech.available ? "Aussprache anhören" : "Keine spanische Stimme"
        }
      >
        <SpeakerIcon />
      </button>
      {showNotice && (
        <p className="notice">
          Keine spanische Stimme gefunden. Die Aussprache ist nicht verfügbar.
        </p>
      )}
    </>
  );
}
