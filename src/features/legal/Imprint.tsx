import { Link } from "react-router-dom";
import { OPERATOR } from "./operator";

export function Imprint() {
  return (
    <div className="screen legal">
      <Link to="/more" className="back">
        ← Mehr
      </Link>
      <h1>Impressum</h1>
      <p className="muted">Angaben gemäß § 5 DDG</p>
      <p>
        {OPERATOR.name}
        <br />
        {OPERATOR.street}
        <br />
        {OPERATOR.city}
      </p>
      <h2>Kontakt</h2>
      <p>
        E-Mail: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
      </p>
      <h2>Datenschutz</h2>
      <p>
        Informationen zur Verarbeitung personenbezogener Daten stehen in der{" "}
        <Link to="/privacy">Datenschutzerklärung</Link>.
      </p>
      <h2>Haftung für Inhalte</h2>
      <p>
        Die Inhalte dieser App wurden mit Sorgfalt erstellt. Für Richtigkeit,
        Vollständigkeit und Aktualität, insbesondere der Vokabeln, Beispielsätze
        und Verbformen, kann keine Gewähr übernommen werden. Als Diensteanbieter
        bin ich nach § 7 Abs. 1 DDG für eigene Inhalte nach den allgemeinen
        Gesetzen verantwortlich. Nach den §§ 8 bis 10 DDG bin ich nicht
        verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
        überwachen. Bei Bekanntwerden von Rechtsverletzungen entferne ich
        entsprechende Inhalte umgehend.
      </p>
      <h2>Haftung für Links</h2>
      <p>
        Die App verlinkt auf externe Seiten (z. B. die Wiktionary als Quelle der
        Vokabeln). Auf deren Inhalte habe ich keinen Einfluss. Für sie ist stets
        der jeweilige Anbieter verantwortlich. Bei Bekanntwerden von
        Rechtsverletzungen entferne ich solche Links umgehend.
      </p>
      <h2>Urheberrecht und Quellen</h2>
      <p>
        Die von mir erstellten Inhalte und Werke unterliegen dem deutschen
        Urheberrecht. Der Quellcode ist nicht zur Vervielfältigung oder
        Weiterverbreitung freigegeben. Die Vokabeln beruhen auf Inhalten aus der{" "}
        <a href="https://de.wiktionary.org" target="_blank" rel="noreferrer">
          deutschen
        </a>{" "}
        bzw.{" "}
        <a href="https://es.wiktionary.org" target="_blank" rel="noreferrer">
          spanischen Wiktionary
        </a>{" "}
        und stehen unter der Lizenz{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/deed.de"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-SA
        </a>
        . Urheber sind die jeweiligen Autorinnen und Autoren der Wiktionary.
      </p>
      <p className="muted">Stand: {OPERATOR.updated}</p>
    </div>
  );
}
