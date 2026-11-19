import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { lookupWord } from "../../data/lookup";
import { newUserId } from "../../data/vocabRepo";
import { findExisting, POS_LABEL } from "../../domain/dictionary";
import type {
  LookupCandidate,
  LookupResult,
} from "../../domain/lookup/parseWiktionary";
import { useAppData } from "../../hooks/useAppData";
import {
  draftFromCandidate,
  EMPTY_DRAFT,
  vocabFromDraft,
  WordForm,
  type Draft,
} from "./WordForm";

type Step =
  | { kind: "input" }
  | { kind: "loading" }
  | { kind: "choose"; result: LookupResult; notice?: string }
  | { kind: "form"; draft: Draft; notice?: string };

const ES_NOTICE =
  "Nur in der spanischen Wiktionary gefunden: Wortart und Genus sind vorausgefüllt, die deutsche Bedeutung bitte selbst eintragen.";

/** Look a word up, edit the suggestion, add it to the vocabulary. */
export function Add() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { saveWord, vocab } = useAppData();
  const [word, setWord] = useState(params.get("q") ?? "");
  const [step, setStep] = useState<Step>({ kind: "input" });
  // Vorabprüfung (SPEC §3.5): offline gegen alle Vokabeln, nur ein Hinweis.
  const existing = useMemo(
    () => findExisting(vocab.values(), word),
    [vocab, word],
  );

  async function search(w: string) {
    const query = w.trim();
    if (!query) return;
    setStep({ kind: "loading" });
    const res = await lookupWord(query);
    if (res.status === "unavailable") {
      setStep({
        kind: "form",
        draft: { ...EMPTY_DRAFT, es: query },
        notice:
          "Das Nachschlagen ist gerade nicht möglich (kein Netz?). Bitte selbst eintragen.",
      });
    } else if (res.status === "notfound") {
      setStep({
        kind: "form",
        draft: { ...EMPTY_DRAFT, es: query },
        notice:
          "Nichts gefunden (weder in der deutschen noch in der spanischen Wiktionary), bitte selbst eintragen.",
      });
    } else if (res.result.candidates.length === 1 && !res.result.inflectedOf) {
      setStep({
        kind: "form",
        draft: draftFromCandidate(res.result.candidates[0]),
        notice: res.source === "es" ? ES_NOTICE : undefined,
      });
    } else {
      setStep({
        kind: "choose",
        result: res.result,
        notice: res.source === "es" ? ES_NOTICE : undefined,
      });
    }
  }

  function pick(c: LookupCandidate, notice?: string) {
    setStep({ kind: "form", draft: draftFromCandidate(c), notice });
  }

  async function submit(d: Draft) {
    const saved = await saveWord(
      vocabFromDraft(d, await newUserId(), Date.now()),
    );
    navigate(`/dictionary/${encodeURIComponent(saved.id)}`);
  }

  return (
    <div className="screen">
      <Link to="/dictionary" className="back">
        ← Verzeichnis
      </Link>
      <h1>Wort hinzufügen</h1>

      <form
        className="add-search"
        onSubmit={(e) => {
          e.preventDefault();
          void search(word);
        }}
      >
        <input
          className="field"
          aria-label="Spanisches Wort"
          placeholder="Spanisches Wort"
          value={word}
          autoCapitalize="none"
          onChange={(e) => setWord(e.target.value)}
        />
        <button
          type="submit"
          className="btn"
          disabled={step.kind === "loading" || !word.trim()}
        >
          Nachschlagen
        </button>
      </form>
      {existing.total > 0 && (
        <div className="notice existing" role="status">
          <p>Schon vorhanden:</p>
          <ul className="existing-list">
            {existing.items.map(({ vocab: v, viaDe }) => (
              <li key={v.id}>
                <Link to={`/dictionary/${encodeURIComponent(v.id)}`}>
                  <span>
                    {v.es}
                    {viaDe && <span className="via">{` (${viaDe})`}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {existing.total > existing.items.length && (
            <p>… und {existing.total - existing.items.length} weitere</p>
          )}
        </div>
      )}
      <p className="muted legend-hint">
        Beim Nachschlagen wird dieses Wort samt deiner IP-Adresse an
        de.wiktionary.org gesendet, falls es dort fehlt, an es.wiktionary.org
        (Wikimedia Foundation, USA; dort gilt möglicherweise kein gleichwertiger
        Datenschutz). Mit Tippen auf „Nachschlagen“ willigst du darin ein. Du
        kannst es auch direkt{" "}
        <button
          type="button"
          className="link-button"
          onClick={() =>
            setStep({
              kind: "form",
              draft: { ...EMPTY_DRAFT, es: word.trim() },
            })
          }
        >
          selbst eintragen
        </button>
        . Mehr dazu in der <Link to="/privacy">Datenschutzerklärung</Link>.
      </p>

      {step.kind === "loading" && <p className="muted">Suche …</p>}

      {step.kind === "choose" && (
        <div className="panel">
          {step.notice && (
            <p className="notice" role="status">
              {step.notice}
            </p>
          )}
          {step.result.inflectedOf && (
            <p>
              Das ist eine gebeugte Form. Grundform:{" "}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const base = step.result.inflectedOf ?? "";
                  setWord(base);
                  void search(base);
                }}
              >
                {step.result.inflectedOf} nachschlagen
              </button>
            </p>
          )}
          {step.result.candidates.length > 0 && (
            <>
              <p>Welche Wortart meinst du?</p>
              <ul className="link-list">
                {step.result.candidates.map((c, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      className="choice"
                      onClick={() => pick(c, step.notice)}
                    >
                      <strong>{POS_LABEL[c.pos]}</strong>: {c.es} –{" "}
                      {c.de.join(", ") || "?"}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {step.kind === "form" && (
        <>
          {step.notice && (
            <p className="notice" role="status">
              {step.notice}
            </p>
          )}
          <WordForm
            key={JSON.stringify(step.draft)}
            initial={step.draft}
            submitLabel="Zur Vokabelliste hinzufügen"
            onSubmit={submit}
          />
        </>
      )}
    </div>
  );
}
