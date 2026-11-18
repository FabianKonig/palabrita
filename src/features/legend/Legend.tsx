import { Link } from "react-router-dom";

const NOTATIONS: { mark: string; meaning: string; example: string }[] = [
  {
    mark: "(ie)",
    meaning:
      "Stammvokal e → ie in den betonten Formen (yo, tú, él, ellos im Präsens), nicht bei nosotros/vosotros.",
    example: "querer: quiero, quieres, quiere, queremos, queréis, quieren",
  },
  {
    mark: "(ue)",
    meaning: "Stammvokal o → ue (bei jugar u → ue), gleiche Formen wie (ie).",
    example: "poder: puedo, podemos",
  },
  {
    mark: "(i)",
    meaning:
      "Stammvokal e → i bei -ir-Verben, auch im Pretérito (3. Person) und im Gerundio.",
    example: "pedir: pido, pidió, pidiendo",
  },
  {
    mark: "(ie, i)",
    meaning: "e → ie im Präsens, e → i im Pretérito (3. Person) und Gerundio.",
    example: "sentir: siento, sintió, sintiendo",
  },
  {
    mark: "(ue, u)",
    meaning: "o → ue im Präsens, o → u im Pretérito (3. Person) und Gerundio.",
    example: "dormir: duermo, durmió, durmiendo",
  },
  {
    mark: "(go)",
    meaning: "Nur die 1. Person Singular ist unregelmäßig, mit -g-.",
    example: "tener: tengo; hacer: hago; salir: salgo",
  },
  {
    mark: "(zco)",
    meaning: "Nur die 1. Person Singular, auf -zco.",
    example: "conocer: conozco",
  },
  {
    mark: "(oy)",
    meaning: "1. Person Singular auf -oy.",
    example: "dar: doy; estar: estoy",
  },
  {
    mark: "(y)",
    meaning: "Verben auf -uir: y vor a, e, o.",
    example: "construir: construyo, construyes",
  },
  {
    mark: "(c → qu), (z → c), (g → gu), (g → j), (gu → gü)",
    meaning:
      "Rechtschreibänderung, damit der Laut erhalten bleibt. Nicht wirklich unregelmäßig.",
    example: "buscar: busqué; empezar: empecé; llegar: llegué; coger: cojo",
  },
  {
    mark: "(irr.)",
    meaning: "Stark unregelmäßig, die Formen weichen deutlich ab.",
    example: "ser, ir, haber",
  },
];

export function Legend() {
  return (
    <div className="screen">
      <Link to="/more" className="back">
        ← Mehr
      </Link>
      <h1>Was bedeutet (ie)?</h1>
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
