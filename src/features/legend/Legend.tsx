import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageTitle } from "../../components/PageTitle";
import { NOTATIONS } from "./notations";

/** Router state of links to the legend from inside the app: "back" then returns to the origin. */
export const FROM_APP_STATE = { fromApp: true } as const;

export function Legend() {
  const location = useLocation();
  const navigate = useNavigate();
  // Opened from verb detail or word form: go back there, not to "Mehr".
  const fromApp = (location.state as { fromApp?: boolean } | null)?.fromApp;
  return (
    <div className="screen">
      {fromApp ? (
        <button
          type="button"
          className="back"
          onClick={() => void navigate(-1)}
        >
          ← Zurück
        </button>
      ) : (
        <Link to="/more" className="back">
          ← Mehr
        </Link>
      )}
      <PageTitle>Was bedeutet (e → ie)?</PageTitle>
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
