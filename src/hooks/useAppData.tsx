import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { resetProgress } from "../data/progressRepo";
import { getSettings, saveSettings } from "../data/settingsRepo";
import { loadVocab } from "../data/vocabRepo";
import type { Settings, SettingsPatch, Topic, Vocab } from "../domain/types";

interface AppData {
  vocab: Map<string, Vocab>;
  topics: Topic[];
  settings: Settings;
  /** Persists the change and then shows the stored record. */
  updateSettings: (patch: SettingsPatch) => Promise<void>;
  /** Deletes all progress (SPEC §10.3) and shows the new settings record. */
  resetProgress: () => Promise<void>;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      vocab: Map<string, Vocab>;
      topics: Topic[];
      settings: Settings;
    };

const Ctx = createContext<AppData | null>(null);

/** Loads vocabulary and settings once and renders children when ready. */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadVocab(), getSettings()])
      .then(([{ vocab, topics }, settings]) => {
        if (cancelled) return;
        setState({ status: "ready", vocab, topics, settings });
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setState({
            status: "error",
            message: e instanceof Error ? e.message : String(e),
          });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // "system" = no attribute, the CSS then follows prefers-color-scheme.
  const theme = state.status === "ready" ? state.settings.theme : "system";
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  const updateSettings = useCallback(async (patch: SettingsPatch) => {
    const saved = await saveSettings(patch);
    setState((s) => (s.status === "ready" ? { ...s, settings: saved } : s));
  }, []);

  const resetAll = useCallback(async () => {
    const saved = await resetProgress();
    setState((s) => (s.status === "ready" ? { ...s, settings: saved } : s));
  }, []);

  const data = useMemo<AppData | null>(
    () =>
      state.status === "ready"
        ? {
            vocab: state.vocab,
            topics: state.topics,
            settings: state.settings,
            updateSettings,
            resetProgress: resetAll,
          }
        : null,
    [state, updateSettings, resetAll],
  );

  if (state.status === "loading")
    return <p className="screen center muted">Lade …</p>;
  if (state.status === "error") {
    return (
      <div className="screen">
        <h1>Fehler</h1>
        <p>Die Daten konnten nicht geladen werden: {state.message}</p>
      </div>
    );
  }
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export function useAppData(): AppData {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppData outside AppDataProvider");
  return v;
}
