import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getSettings, saveSettings } from "../data/settingsRepo";
import { deleteUserVocab, loadVocab, saveUserVocab } from "../data/vocabRepo";
import type { Settings, Topic, Vocab } from "../domain/types";

interface AppData {
  vocab: Map<string, Vocab>;
  topics: Topic[];
  settings: Settings;
  /** Applies the change at once and persists it. */
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  /** Creates or edits a user word; returns the stored word. */
  saveWord: (v: Vocab) => Promise<Vocab>;
  /** Deletes a user word including its cards. */
  removeWord: (id: string) => Promise<void>;
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
  const latest = useRef<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadVocab(), getSettings()])
      .then(([{ vocab, topics }, settings]) => {
        if (cancelled) return;
        latest.current = settings;
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

  const updateSettings = useCallback(async (patch: Partial<Settings>) => {
    if (!latest.current) return;
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setState((s) => (s.status === "ready" ? { ...s, settings: next } : s));
    await saveSettings(next);
  }, []);

  const saveWord = useCallback(async (v: Vocab) => {
    const saved = await saveUserVocab(v);
    setState((s) =>
      s.status === "ready"
        ? { ...s, vocab: new Map(s.vocab).set(saved.id, saved) }
        : s,
    );
    return saved;
  }, []);

  const removeWord = useCallback(async (id: string) => {
    await deleteUserVocab(id);
    setState((s) => {
      if (s.status !== "ready") return s;
      const vocab = new Map(s.vocab);
      vocab.delete(id);
      return { ...s, vocab };
    });
  }, []);

  const data = useMemo<AppData | null>(
    () =>
      state.status === "ready"
        ? {
            vocab: state.vocab,
            topics: state.topics,
            settings: state.settings,
            updateSettings,
            saveWord,
            removeWord,
          }
        : null,
    [state, updateSettings, saveWord, removeWord],
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
