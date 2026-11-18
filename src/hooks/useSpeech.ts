import { useCallback, useEffect, useState } from "react";
import { pickVoice, speechText } from "../domain/speech";

export interface Speech {
  /** Voices were queried (or the wait timed out), so "no voice" is reliable. */
  checked: boolean;
  /** A Spanish voice is available. */
  available: boolean;
  speak: (es: string) => void;
}

const VOICE_WAIT_MS = 1500;

/** Web Speech API wrapper (SPEC §13). Voices load asynchronously (`voiceschanged`). */
export function useSpeech(): Speech {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [checked, setChecked] = useState(!supported);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const update = () => {
      const found = pickVoice(synth.getVoices());
      setVoice(found);
      if (found) setChecked(true);
    };
    update();
    const timer = window.setTimeout(() => setChecked(true), VOICE_WAIT_MS);
    synth.addEventListener("voiceschanged", update);
    return () => {
      window.clearTimeout(timer);
      synth.removeEventListener("voiceschanged", update);
      synth.cancel();
    };
  }, [supported]);

  const speak = useCallback(
    (es: string) => {
      const text = speechText(es);
      if (!voice || !text) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
      synth.speak(utterance);
    },
    [voice],
  );

  return { checked, available: voice !== null, speak };
}
