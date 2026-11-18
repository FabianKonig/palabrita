import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCards } from "../../data/cardRepo";
import { getStreak } from "../../data/statsRepo";
import { queueCounts } from "../../domain/queue";
import { useAppData } from "../../hooks/useAppData";

interface Summary {
  due: number;
  fresh: number;
  streak: number;
}

export function Home() {
  const { vocab, settings } = useAppData();
  const { maxLevel, direction } = settings;
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    Promise.all([getAllCards(), getStreak(now)]).then(([cards, streak]) => {
      if (cancelled) return;
      const { due, fresh } = queueCounts({
        settings: { maxLevel, direction },
        vocab: vocab.values(),
        cards,
        now,
      });
      setSummary({ due, fresh, streak });
    });
    return () => {
      cancelled = true;
    };
  }, [maxLevel, direction, vocab]);

  return (
    <div className="screen">
      <h1>Palabrita</h1>
      <div className="panel">
        <p className="stats-line">
          {summary
            ? `Fällig: ${summary.due} · Neu verfügbar: ${summary.fresh} · Serie: ${summary.streak} ${summary.streak === 1 ? "Tag" : "Tage"}`
            : "Lade …"}
        </p>
        <Link className="btn btn-block" to="/study">
          Lernen
        </Link>
      </div>
    </div>
  );
}
