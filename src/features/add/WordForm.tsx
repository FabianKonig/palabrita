import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { VerbTable } from "../../components/VerbTable";
import { POS_LABEL } from "../../domain/dictionary";
import { findDuplicate } from "../../domain/lookup/findDuplicate";
import type { LookupCandidate } from "../../domain/lookup/parseWiktionary";
import type { Pos, Vocab, VerbTag } from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";

const VERB_TAGS: VerbTag[] = [
  "ie",
  "ue",
  "i",
  "ie-i",
  "ue-u",
  "go",
  "zco",
  "oy",
  "y",
  "irr",
];

export interface Draft {
  es: string;
  de: string[];
  pos: Pos;
  gender: "" | "m" | "f" | "m/f";
  plural: string;
  note: string;
  exampleEs: string;
  exampleDe: string;
  tags: VerbTag[];
  reflexive: boolean;
}

export const EMPTY_DRAFT: Draft = {
  es: "",
  de: [""],
  pos: "noun",
  gender: "",
  plural: "",
  note: "",
  exampleEs: "",
  exampleDe: "",
  tags: [],
  reflexive: false,
};

export function draftFromCandidate(c: LookupCandidate): Draft {
  return {
    ...EMPTY_DRAFT,
    es: c.es,
    de: c.de.length ? c.de : [""],
    pos: c.pos,
    gender: c.gender ?? "",
    plural: c.plural ?? "",
    exampleEs: c.example?.es ?? "",
    exampleDe: c.example?.de ?? "",
    reflexive: /se$/.test(c.es),
  };
}

export function draftFromVocab(v: Vocab): Draft {
  return {
    es: v.es,
    de: v.de.length ? v.de : [""],
    pos: v.pos,
    gender: v.gender ?? "",
    plural: v.plural ?? "",
    note: v.note ?? "",
    exampleEs: v.example?.es ?? "",
    exampleDe: v.example?.de ?? "",
    tags: v.verb?.tags ?? [],
    reflexive: v.verb?.reflexive ?? false,
  };
}

/** Builds the vocabulary entry from the form (id/createdAt come from the caller). */
export function vocabFromDraft(
  d: Draft,
  id: string,
  createdAt?: number,
): Vocab {
  const v: Vocab = {
    id,
    es: d.es.trim(),
    de: d.de
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4),
    pos: d.pos,
    level: null,
    topic: "eigene",
    origin: "user",
    example:
      d.exampleEs.trim() && d.exampleDe.trim()
        ? { es: d.exampleEs.trim(), de: d.exampleDe.trim() }
        : null,
  };
  if (createdAt !== undefined) v.createdAt = createdAt;
  if (d.note.trim()) v.note = d.note.trim();
  if (d.pos === "noun") {
    if (d.gender) v.gender = d.gender;
    if (d.plural.trim()) v.plural = d.plural.trim();
  }
  if (d.pos === "verb") {
    v.verb = { tags: d.tags, reflexive: d.reflexive };
    v.verified = false;
  }
  return v;
}

export function validateDraft(d: Draft): string | null {
  if (!d.es.trim()) return "Bitte das spanische Wort eintragen.";
  if (d.de.map((s) => s.trim()).filter(Boolean).length === 0)
    return "Bitte mindestens ein deutsches Wort eintragen.";
  return null;
}

interface Props {
  initial: Draft;
  submitLabel: string;
  /** Id of the word being edited (excluded from the duplicate check). */
  editingId?: string;
  onSubmit: (draft: Draft) => Promise<void>;
}

/** Editable form for a user word, with duplicate warning and verb preview. */
export function WordForm({ initial, submitLabel, editingId, onSubmit }: Props) {
  const { vocab } = useAppData();
  const [d, setD] = useState<Draft>(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setD((x) => ({ ...x, [key]: value }));

  const dup = useMemo(() => {
    if (!d.es.trim()) return null;
    const others = [...vocab.values()].filter((v) => v.id !== editingId);
    return findDuplicate(others, d.es, d.pos);
  }, [vocab, d.es, d.pos, editingId]);

  const preview = useMemo(
    () =>
      d.pos === "verb" && d.es.trim() ? vocabFromDraft(d, "preview") : null,
    [d],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    const problem = validateDraft(d);
    if (problem) return setError(problem);
    if (dup?.exact) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit(d);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  function setDe(i: number, value: string) {
    set(
      "de",
      d.de.map((x, j) => (j === i ? value : x)),
    );
  }

  return (
    <form className="settings-form" onSubmit={(e) => void submit(e)}>
      <label className="setting">
        <span>Spanisch (Nomen mit Artikel)</span>
        <input
          value={d.es}
          onChange={(e) => set("es", e.target.value)}
          autoCapitalize="none"
        />
      </label>

      <fieldset className="setting">
        <legend>Deutsch (1–4 Wörter)</legend>
        {d.de.map((w, i) => (
          <div className="de-row" key={i}>
            <input
              aria-label={`Deutsch ${i + 1}`}
              value={w}
              onChange={(e) => setDe(i, e.target.value)}
            />
            {d.de.length > 1 && (
              <button
                type="button"
                className="btn-small"
                aria-label={`Deutsch ${i + 1} entfernen`}
                onClick={() =>
                  set(
                    "de",
                    d.de.filter((_, j) => j !== i),
                  )
                }
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {d.de.length < 4 && (
          <button
            type="button"
            className="btn-small"
            onClick={() => set("de", [...d.de, ""])}
          >
            + Weiteres deutsches Wort
          </button>
        )}
      </fieldset>

      <label className="setting">
        <span>Wortart</span>
        <select
          value={d.pos}
          onChange={(e) => set("pos", e.target.value as Pos)}
        >
          {(Object.keys(POS_LABEL) as Pos[]).map((p) => (
            <option key={p} value={p}>
              {POS_LABEL[p]}
            </option>
          ))}
        </select>
      </label>

      {dup?.exact && (
        <p className="notice" role="alert">
          Schon vorhanden:{" "}
          <Link to={`/dictionary/${encodeURIComponent(dup.exact.id)}`}>
            {dup.exact.es}
          </Link>
          . Doppeltes Anlegen ist nicht möglich.
        </p>
      )}
      {dup && !dup.exact && dup.similar.length > 0 && (
        <p className="notice" role="status">
          Ähnliches Wort vorhanden:{" "}
          {dup.similar.map((s, i) => (
            <span key={s.id}>
              {i > 0 && ", "}
              <Link to={`/dictionary/${encodeURIComponent(s.id)}`}>{s.es}</Link>
            </span>
          ))}
          . Anlegen ist trotzdem möglich.
        </p>
      )}

      {d.pos === "noun" && (
        <>
          <label className="setting">
            <span>Genus</span>
            <select
              value={d.gender}
              onChange={(e) => set("gender", e.target.value as Draft["gender"])}
            >
              <option value="">unbekannt</option>
              <option value="m">maskulin</option>
              <option value="f">feminin</option>
              <option value="m/f">maskulin/feminin</option>
            </select>
          </label>
          <label className="setting">
            <span>Plural</span>
            <input
              value={d.plural}
              onChange={(e) => set("plural", e.target.value)}
            />
          </label>
        </>
      )}

      {d.pos === "verb" && (
        <fieldset className="setting">
          <legend>
            Unregelmäßigkeiten (<Link to="/legend">Was bedeuten sie?</Link>)
          </legend>
          <div className="tag-grid">
            {VERB_TAGS.map((t) => (
              <label key={t} className="toggle">
                <input
                  type="checkbox"
                  checked={d.tags.includes(t)}
                  onChange={(e) =>
                    set(
                      "tags",
                      e.target.checked
                        ? [...d.tags, t]
                        : d.tags.filter((x) => x !== t),
                    )
                  }
                />
                {t}
              </label>
            ))}
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={d.reflexive}
              onChange={(e) => set("reflexive", e.target.checked)}
            />
            reflexiv (-se)
          </label>
          <small className="muted">
            Ohne Auswahl wird das Verb als regelmäßig behandelt.
          </small>
        </fieldset>
      )}

      {preview && <VerbTable vocab={preview} />}

      <label className="setting">
        <span>Hinweis (optional)</span>
        <input value={d.note} onChange={(e) => set("note", e.target.value)} />
      </label>
      <label className="setting">
        <span>Beispielsatz Spanisch (optional)</span>
        <input
          value={d.exampleEs}
          onChange={(e) => set("exampleEs", e.target.value)}
        />
      </label>
      <label className="setting">
        <span>Beispielsatz Deutsch (optional)</span>
        <input
          value={d.exampleDe}
          onChange={(e) => set("exampleDe", e.target.value)}
        />
      </label>

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-block"
        disabled={busy || !!dup?.exact}
      >
        {submitLabel}
      </button>
    </form>
  );
}
