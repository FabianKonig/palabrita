import { useLayoutEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { VerbDetail, WordHead } from "../../components/VerbDetail";
import { POS_LABEL } from "../../domain/dictionary";
import { LEVEL_ORDER } from "../../domain/types";
import { useAppData } from "../../hooks/useAppData";

const GENDER_LABEL = { m: "maskulin", f: "feminin", "m/f": "maskulin/feminin" };

export function VocabDetail() {
  const { id = "" } = useParams();
  const { vocab, topics, settings } = useAppData();
  const entry = vocab.get(id);

  // A new detail page always starts at the top. The window keeps the list's scroll
  // position across the route change, so without this a long verb opened from the
  // bottom of the list would show its end. Going back restores the list (Dictionary).
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
          <strong>Plural:</strong> {entry.plural}
        </p>
      )}
      {entry.adj && (
        <p>
          <strong>Formen:</strong>{" "}
          {[
            entry.adj.f && `feminin ${entry.adj.f}`,
            entry.adj.pl && `Plural ${entry.adj.pl}`,
            entry.adj.fpl && `feminin Plural ${entry.adj.fpl}`,
          ]
            .filter(Boolean)
            .join(" · ")}
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
        <VerbDetail vocab={entry}>{body}</VerbDetail>
      ) : (
        <>
          <WordHead vocab={entry} />
          {body}
        </>
      )}
    </div>
  );
}
