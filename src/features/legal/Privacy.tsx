import { Link } from "react-router-dom";
import { OPERATOR } from "./operator";

const EXT = { target: "_blank", rel: "noreferrer" } as const;

export function Privacy() {
  return (
    <div className="screen legal">
      <Link to="/more" className="back">
        ← Mehr
      </Link>
      <h1>Datenschutzerklärung</h1>
      <p className="muted">Stand: {OPERATOR.updated}</p>

      <h2>1. Das Wichtigste in Kürze</h2>
      <ul>
        <li>
          Palabrita läuft vollständig in deinem Browser. Es gibt kein Backend,
          kein Konto und keine Anmeldung.
        </li>
        <li>Lernfortschritt und Einstellungen bleiben auf deinem Gerät.</li>
        <li>
          Es gibt keine Cookies, keine Werbung, kein Tracking und keine
          Analyse-Werkzeuge. Ich habe keine Möglichkeit, dein Nutzungsverhalten
          zu sehen.
        </li>
        <li>
          Daten fließen nach außen nur beim Abruf der App (Hosting bei GitHub).
        </li>
      </ul>

      <h2>2. Übersicht der Verarbeitungen</h2>
      <ul>
        <li>
          <strong>Abruf der App (Hosting):</strong> IP-Adresse und technische
          Zugriffsdaten, bei GitHub. Zweck: Bereitstellung der App.
          Rechtsgrundlage: berechtigtes Interesse (Art. 6 Abs. 1 S. 1 lit. f
          DSGVO).
        </li>
        <li>
          <strong>Speicherung auf dem Gerät:</strong> Lernfortschritt,
          Einstellungen, App-Cache, nur auf deinem Gerät. Zweck: Funktion der
          App. Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG, Art. 6 Abs. 1 S. 1 lit.
          f DSGVO.
        </li>
        <li>
          <strong>Kontakt per E-Mail:</strong> E-Mail-Adresse und Nachricht.
          Zweck: Bearbeitung deines Anliegens. Rechtsgrundlage: Art. 6 Abs. 1 S.
          1 lit. f bzw. lit. b DSGVO.
        </li>
      </ul>
      <p>
        Betroffen sind die Nutzerinnen und Nutzer der App sowie Personen, die
        mir schreiben. Es werden keine besonderen Kategorien personenbezogener
        Daten verarbeitet.
      </p>

      <h2>3. Verantwortlicher</h2>
      <p>
        {OPERATOR.name}, {OPERATOR.street}, {OPERATOR.city}
        <br />
        E-Mail: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
        <br />
        Siehe auch das <Link to="/imprint">Impressum</Link>.
      </p>

      <h2>4. Hosting bei GitHub Pages</h2>
      <p>
        Die App wird als statische Webseite über GitHub Pages ausgeliefert (
        {OPERATOR.appUrl}). Anbieter ist die GitHub Inc., 88 Colin P. Kelly Jr.
        Street, San Francisco, CA 94107, USA (ein Unternehmen der Microsoft
        Corporation). Beim Abruf verarbeitet GitHub technisch notwendige
        Zugriffsdaten, insbesondere deine IP-Adresse, Datum und Uhrzeit, die
        angeforderte Datei, die Browserkennung und gegebenenfalls die
        Referrer-URL. Auf diese Daten habe ich keinen Zugriff.
      </p>
      <p>
        <strong>Zweck und Rechtsgrundlage:</strong> Auslieferung und sichere
        Bereitstellung der App, Art. 6 Abs. 1 S. 1 lit. f DSGVO (berechtigtes
        Interesse an einem zuverlässigen, kostenfreien und sicheren Betrieb).
        Die Verbindung ist per HTTPS verschlüsselt.
      </p>
      <p>
        <strong>Drittland:</strong> Die Verarbeitung kann in den USA erfolgen.
        GitHub stützt sich nach eigenen Angaben für Übermittlungen aus dem EWR
        auf den Angemessenheitsbeschluss zum EU-US Data Privacy Framework und
        auf Standardvertragsklauseln. Weitere Hinweise, auch zu Speicherdauern,
        stehen in der{" "}
        <a
          href="https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement"
          {...EXT}
        >
          Datenschutzerklärung von GitHub
        </a>
        .
      </p>

      <h2>5. Speicherung auf deinem Gerät</h2>
      <p>
        Die App speichert Lernfortschritt, Einstellungen und den Hinweis, dass
        die Begrüßung gezeigt wurde, in <em>IndexedDB</em> und im{" "}
        <em>lokalen Speicher</em> deines Browsers. Außerdem legt ein Service
        Worker die App-Dateien und Vokabeln in einem Cache ab, damit sie offline
        läuft. Diese Daten verlassen dein Gerät nicht. Ich erhalte sie nicht.
      </p>
      <p>
        <strong>Rechtsgrundlage:</strong> Das Speichern ist für die von dir
        gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG),
        daher ist keine Einwilligung nötig. Die zugehörige Verarbeitung beruht
        auf Art. 6 Abs. 1 S. 1 lit. f DSGVO.
      </p>
      <p>
        <strong>Löschung:</strong> Du kannst die Daten jederzeit über die
        Website-Daten deines Browsers löschen bzw. die installierte App
        entfernen.
      </p>

      <h2>6. Vorlesefunktion</h2>
      <p>
        Das Vorlesen nutzt die Sprachausgabe deines Browsers bzw.
        Betriebssystems. Palabrita übermittelt dafür keine Daten an Dritte. Je
        nach Gerät können Stimmen des Browser- oder Systemanbieters zum Einsatz
        kommen. Für diese gelten deren Datenschutzhinweise.
      </p>

      <h2>
        7. Keine Pflicht zur Bereitstellung, keine automatisierte Entscheidung
      </h2>
      <p>
        Du musst keine personenbezogenen Daten angeben, um die App zu nutzen.
        Eine automatisierte Entscheidungsfindung oder ein Profiling findet nicht
        statt.
      </p>

      <h2>8. Deine Rechte</h2>
      <p>
        Dir stehen nach der DSGVO insbesondere folgende Rechte zu: Auskunft
        (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der
        Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch
        (Art. 21) sowie das Recht, eine erteilte Einwilligung jederzeit mit
        Wirkung für die Zukunft zu widerrufen (Art. 7 Abs. 3). Da ich selbst
        keine personenbezogenen Daten von dir speichere, kann ich Auskunfts- und
        Löschwünsche nur für die Daten erfüllen, die mir vorliegen, z. B. deine
        E-Mail, wenn du mir schreibst. Für Daten bei GitHub bzw. Wikimedia wende
        dich bitte an diese Anbieter. Kontakt:{" "}
        <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>.
      </p>
      <p>
        <strong>
          Widerspruchsrecht: Du hast das Recht, aus Gründen, die sich aus deiner
          besonderen Situation ergeben, jederzeit gegen die Verarbeitung der
          dich betreffenden personenbezogenen Daten, die aufgrund von Art. 6
          Abs. 1 lit. e oder f DSGVO erfolgt, Widerspruch einzulegen. Das gilt
          auch für ein auf diese Bestimmungen gestütztes Profiling. Legst du
          Widerspruch ein, verarbeite ich die Daten nicht mehr, es sei denn, ich
          kann zwingende schutzwürdige Gründe nachweisen, die deine Interessen
          überwiegen, oder die Verarbeitung dient der Geltendmachung, Ausübung
          oder Verteidigung von Rechtsansprüchen.
        </strong>
      </p>
      <p>
        <strong>Beschwerderecht:</strong> Du kannst dich bei einer
        Datenschutzaufsichtsbehörde beschweren. Für mich zuständig ist der
        Hessische Beauftragte für Datenschutz und Informationsfreiheit,
        Gustav-Stresemann-Ring 1, 65189 Wiesbaden,{" "}
        <a href="https://datenschutz.hessen.de" {...EXT}>
          datenschutz.hessen.de
        </a>
        .
      </p>

      <h2>9. Kontakt per E-Mail</h2>
      <p>
        Wenn du mir schreibst, verarbeite ich deine E-Mail-Adresse und den
        Inhalt der Nachricht, um dein Anliegen zu bearbeiten (Art. 6 Abs. 1 S. 1
        lit. f bzw. lit. b DSGVO). Ich lösche sie, sobald das Anliegen erledigt
        ist und keine Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2>10. Änderungen</h2>
      <p>
        Ich passe diese Erklärung an, wenn sich die App oder die Rechtslage
        ändert. Es gilt die jeweils hier abrufbare Fassung.
      </p>
    </div>
  );
}
