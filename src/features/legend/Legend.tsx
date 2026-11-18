import { Link } from "react-router-dom";
import { NOTATIONS } from "./notations";

export function Legend() {
  return (
    <div className="screen">
      <Link to="/more" className="back">
        ← Mehr
      </Link>
      <h1>Was bedeutet (e → ie)?</h1>
      <p className="muted">
        Hinter manchen Verben steht ein Klammerzusatz. Er zeigt, wie das Verb
        von der Regel abweicht. In den Formentabellen sind abweichende Formen
        farbig hervorgehoben.
      </p>
      <dl className="legend">
        {NOTATIONS.map((n) => (
          <div key={n.mark} className="legend-item">
            <dt>{n.mark}</dt>
            <dd>
              {n.meaning}
              <br />
              <em>{n.example}</em>
            </dd>
          </div>
        ))}
      </dl>
      <p className="muted">
        <strong>Vosotros</strong> wird in Lateinamerika nicht verwendet. Man
        sagt <em>ustedes</em>. Die Form steht trotzdem in jeder Tabelle.
      </p>
    </div>
  );
}
