# Palabrita – Offene Aufgaben

Diese Datei führt nur, was noch zu tun ist. Erledigtes steht in `docs/SPEC.md`, der Verlauf in der Git-Historie. Wird ein Punkt erledigt, kommt das Ergebnis in die Spezifikation und der Punkt hier raus.

## Spezifiziert, Umsetzung offen

Die Spezifikation steht, ein Agent kann direkt umsetzen.

- [ ] **Kartenauswahl und Lernmodell nach Anki** (spezifiziert 2026-11-19): SPEC §11, §12, §3.1, §10.2 und §14.1 („Für heute geschafft“). Umzusetzen:
  - `domain/srs.ts`: Lernschritte 1 / 10 Min, Wiederlernphase mit einem Schritt von 10 Min (`lapses > 0`), Bonus für überfällige Karten, `MAX_INTERVAL`, Vorab-Wiederholung entfernen, `introduced` in `newCard`. `srs.test.ts` anpassen.
  - `domain/types.ts`: `Card.introduced`.
  - `domain/queue.ts`: `pickNext` nach §12.2 (Stufen 1 bis 4, Tageslimit 20, Mischung 4 zu 1, Gefährdung, Tagessperre, Zufallsgeber als Parameter, Rückgabe `done`), `MAX_LEARNING`, `sessionSeen` und Durchlauf entfernen. `queue.test.ts` neu schreiben, dabei die Fälle aus dem Gespräch abdecken: kein Wiedersehen derselben Reihenfolge, keine Schleife mit zwei Wörtern, ES→DE nie am selben Tag wie DE→ES.
  - `features/study/Study.tsx`: `reviewsSinceNew`, `extraNew`, Seite „Für heute geschafft“.
  - `scripts/browser-smoke.ts`: Prüfung „Nochmal nach 5 Min“ auf 1 bzw. 10 Min umstellen, „Für heute geschafft“ und „10 weitere neue Wörter“ prüfen.
  - `docs/ABNAHME.md`: Kriterien 2 bis 5 und 8 beziehen sich auf das alte Modell und werden nach der Umsetzung neu geprüft und umgeschrieben.

## Anforderungen ohne Detailspezifikation

Für jeden Punkt zuerst die Spezifikation schreiben (mit dem Nutzer klären), dann umsetzen.

- [ ] **Erklärvideo der App** (KI-erzeugt, zeigt alle Funktionen): Anforderung aufgenommen (2026-11-19), Spezifikation fehlt noch (Umfang, Länge, Format, Sprache, Erzeugungsweg, Ablage). Erst mit dem Nutzer klären, dann spezifizieren. Die App selbst bleibt davon unberührt.

## Prüfungen und Entscheidungen des Nutzers

- [ ] **Vor dem Livegang: Hinweis „keine Nutzer“ aufheben.** Sobald es die ersten echten Nutzer gibt, also deren Daten (IndexedDB, `localStorage`) erhalten bleiben müssen, gilt die Freiheit von Migrationen nicht mehr. Dann diese Stellen ändern: SPEC §2 (Zeile „Kompatibilität“), SPEC §10.2 (Satz zu Migrationen) und `AGENTS.md` (Abschnitt „Stand“). Danach festlegen, wie Änderungen an Datenbank und Datenformaten künftig migriert werden (z. B. Versionssprung in `data/db.ts` mit Upgrade-Schritt und Tests).

- [ ] **Subdomain für GitHub Pages anlegen**: Der Nutzer legt eine Subdomain an, die auf die GitHub-Pages-Seite des Projekts zeigt (DNS-Eintrag beim Domain-Anbieter, Custom Domain in den Pages-Einstellungen des Repos). Empfehlenswert ist zusätzlich eine `CNAME`-Datei unter `public/`, damit die Domain bei jedem Deploy erhalten bleibt (die Workflow-Datei `.github/workflows/pages.yml` ist dafür zu prüfen). Offen: gewünschter Subdomain-Name und Basis-Domain. Nach Umstellung Impressum und Datenschutz (Hosting-Angaben in `src/features/legal/`) prüfen.

## Hinweise

- Bekannte Einschränkung: Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten für den Nutzer mehrdeutig. In v1 nicht behandelt.
- Verworfen: eine Docker-Image-Variante (GHCR, `docker compose pull` auf einem VPS). Nicht umsetzen, die App läuft über GitHub Pages.
- Annahmen, die ein Agent bei Unklarheit trifft, kommen als kurzer Eintrag in diesen Abschnitt.
- Annahme (Formsuche, 2026-11-19): Eine Formzeile in der Verzeichnisliste zeigt unten in einer Zeile zuerst das Niveau-Kennzeichen und daneben die Bezeichnung („1. Pl. Presente + 1 weitere Form“). So steht das Kennzeichen wie bei normalen Zeilen als letzte Zeile links, und die Zeile hat genau drei Zeilen (SPEC §3.3a nennt das Kennzeichen bei Zeile 2).
- Annahme (Formsuche): Der Formenindex wird erst gebaut, wenn der Suchtext mindestens 2 Zeichen hat (nicht beim Öffnen des Verzeichnisses). Gemessen mit 6-fach gedrosselter CPU: einmalig etwa 100 ms, jeder weitere Tastendruck liegt bei der Bildschirmfrequenz; auf einem echten Handy nicht geprüft.
- Annahme (Kartenauswahl, 2026-11-19): „10 weitere neue Wörter“ gilt nur für die laufende Sitzung und wird nicht gespeichert. Wer am selben Tag eine neue Sitzung beginnt, sieht nach den fälligen Karten wieder „Für heute geschafft“ und tippt den Button erneut.
- Annahme (Kartenauswahl): Bei gleicher Gefährdung zweier Wiederholungen entscheidet der Zufall, nicht das Fälligkeitsdatum.
