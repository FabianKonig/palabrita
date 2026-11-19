import { useLayoutEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { VerbDetail, WordHead } from "../../components/VerbDetail";
import { adjectiveFormLines } from "../../domain/adjectiveForms";
import { POS_LABEL } from "../../domain/dictionary";
import { hasSlot, type FormSlot } from "../../domain/forms";
import { LEVEL_ORDER } from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";

const GENDER_LABEL = { m: "maskulin", f: "feminin", "m/f": "maskulin/feminin" };

/** Forms to highlight, handed over by a form hit of the dictionary (router state, this visit only). */
function highlightOf(state: unknown): FormSlot[] | undefined {
  const h = (state as { highlight?: unknown } | null)?.highlight;
  return Array.isArray(h) ? (h as FormSlot[]) : undefined;
}

/** A form of the detail page, marked as a hit (background and bold) if it was searched for. */
function HitText({ hit, children }: { hit: boolean; children: string }) {
  return hit ? <span className="form-hit">{children}</span> : <>{children}</>;
}

export function VocabDetail() {
  const { id = "" } = useParams();
  const highlight = highlightOf(useLocation().state);
  const { vocab, topics, settings } = useAppData();
  const entry = vocab.get(id);

  // A new detail page always starts at the top. The window keeps the list's scroll
  // position across the route change, so without this a long verb opened from the
  // bottom of the list would show its end. Going back restores the list (Dictionary).
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  // Form hit: scroll to the first highlighted form (after the reset to the top above).
  useLayoutEffect(() => {
    if (!highlight) return;
    document
      .querySelector(".form-hit")
      ?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [id, highlight, entry]);

  if (!entry) {
    return (
      <div className="screen">
        <Link to="/dictionary" className="back">
          ← Verzeichnis
        </Link>
        <h1>Nicht gefunden</h1>
        <p className="muted">Dieses Wort gibt es nicht.</p>
      </div>
    );
  }

  const topic = topics.find((t) => t.key === entry.topic)?.label ?? entry.topic;

  const body = (
    <>
      <p className="tags">
        <span className="badge">{POS_LABEL[entry.pos]}</span>
        <span className="badge">{entry.level}</span>
        <span className="badge">{topic}</span>
        {entry.gender && (
          <span className="badge">{GENDER_LABEL[entry.gender]}</span>
        )}
      </p>

      {LEVEL_ORDER[entry.level] > LEVEL_ORDER[settings.maxLevel] && (
        <p className="muted">
          Liegt über deinem Niveau ({settings.maxLevel}), wird derzeit nicht
          gelernt.
        </p>
      )}

      {entry.plural && (
        <p>
          <strong>Plural:</strong>{" "}
          <HitText hit={hasSlot(highlight, { kind: "plural" })}>
            {entry.plural}
          </HitText>
        </p>
      )}
      {entry.pos === "adj" && adjectiveFormLines(entry).length > 0 && (
        <p>
          <strong>Formen:</strong>{" "}
          {adjectiveFormLines(entry).map((line, i) => (
            <span key={line.label}>
              {i > 0 && " · "}
              {line.label}{" "}
              <HitText
                hit={line.keys.some((which) =>
                  hasSlot(highlight, { kind: "adj", which }),
                )}
              >
                {line.form}
              </HitText>
            </span>
          ))}
        </p>
      )}
      {entry.note && <p className="notice">{entry.note}</p>}

      <blockquote className="example-box">
        <span className="example">{entry.example.es}</span>
        <span className="example-de">{entry.example.de}</span>
      </blockquote>
    </>
  );

  return (
    <div className="screen">
      <Link to="/dictionary" className="back">
        ← Verzeichnis
      </Link>

      {entry.pos === "verb" ? (
        <VerbDetail vocab={entry} highlight={highlight}>
          {body}
        </VerbDetail>
      ) : (
        <>
          <WordHead vocab={entry} />
          {body}
        </>
      )}
    </div>
  );
}
