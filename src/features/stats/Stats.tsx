import { useEffect, useState } from "react";
import { PageTitle } from "../../components/PageTitle";
import { getAllCards } from "../../data/cardRepo";
import { computeStats, type DirectionStats } from "../../domain/stats";
import { useAppData } from "../../hooks/useAppData";

const DIR_LABEL = {
  "de-es": "Deutsch → Spanisch",
  "es-de": "Spanisch → Deutsch",
} as const;

export function Stats() {
  const { vocab, settings } = useAppData();
  const [data, setData] = useState<DirectionStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllCards()
      .then((cards) => {
        if (cancelled) return;
        setData(computeStats(vocab.values(), cards, settings.maxLevel));
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [vocab, settings.maxLevel]);

  if (error)
    return (
      <div className="screen">
        <p>Fehler: {error}</p>
      </div>
    );
  if (!data) return <p className="screen center muted">Lade …</p>;

  return (
    <div className="screen">
      <PageTitle brand>Statistik</PageTitle>
      <p className="muted">
        Gezählt werden Vokabeln bis Niveau {settings.maxLevel}.
      </p>
      {(Object.keys(DIR_LABEL) as (keyof typeof DIR_LABEL)[]).map((dir) => {
        const s = data[dir];
        const total = s.new + s.learning + s.mature;
        return (
          <section key={dir} className="panel stat-block">
            <h2>{DIR_LABEL[dir]}</h2>
            <div
              className="stat-bar"
              role="img"
              aria-label={`${s.new} neu, ${s.learning} lernend, ${s.mature} gefestigt`}
            >
              {total > 0 && (
                <>
                  <div className="seg-new" style={{ flex: s.new }} />
                  <div className="seg-learning" style={{ flex: s.learning }} />
                  <div className="seg-mature" style={{ flex: s.mature }} />
                </>
              )}
            </div>
            <dl className="stat-list">
              <dt>Neu</dt>
              <dd>{s.new}</dd>
              <dt>Lernend</dt>
              <dd>{s.learning}</dd>
              <dt>Gefestigt</dt>
              <dd>{s.mature}</dd>
            </dl>
          </section>
        );
      })}
    </div>
  );
}
