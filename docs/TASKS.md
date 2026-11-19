# Palabrita – Offene Aufgaben

Diese Datei führt nur, was noch zu tun ist. Erledigtes steht in `docs/SPEC.md`, der Verlauf in der Git-Historie. Wird ein Punkt erledigt, kommt das Ergebnis in die Spezifikation und der Punkt hier raus.

## Spezifiziert, Umsetzung offen

Die Spezifikation steht, ein Agent kann direkt umsetzen.

- [ ] **Kartenauswahl und Lernmodell nach Anki** (spezifiziert 2026-11-19): SPEC §11, §12, §3.1, §10.2 und §14.1 („Für heute geschafft“). Umzusetzen:
  - Vokabeln: Feld `added` in `scripts/vocab.schema.json` als Pflicht (Muster `^\d{4}-\d{2}-\d{2}$`), in `scripts/validateVocab.ts` gültiges Kalenderdatum prüfen (mit Test), allen vorhandenen Vokabeln in `public/vocab/*.json` `"added": "2026-11-19"` geben (einmalig per `tsx`-Skript oder Node-Einzeiler, Feldreihenfolge wie in SPEC §4.2 hinter `topic`), danach `npm run validate:vocab`.
  - `domain/types.ts`: `Vocab.added`, `Card.introduced`, `Settings.orderSeed` und `Settings.startedAt`.
  - `domain/srs.ts`: Lernschritte 1 / 10 Min (`LEARN_STEPS_MIN`, `RELEARN_STEP_MIN` statt `STEP_MINUTES`), Wiederlernphase mit einem Schritt von 10 Min (`lapses > 0`), Bonus für überfällige Karten, `MAX_INTERVAL`, Vorab-Wiederholung entfernen (`isEarly`, Sonderfall in `previewIntervals`), `introduced` in `newCard`. `srs.test.ts` anpassen.
  - `domain/queue.ts`: `pickNext` nach §12.2 (Stufen 1 bis 4, `newLimit`, Mischung 4 zu 1, Gefährdung, Tagessperre, `position()`, Rückgabe `done`), `MAX_LEARNING`, `sessionSeen`, `newPass` und Durchlauf entfernen.
  - `queue.test.ts` neu schreiben. Die Hilfsfunktionen dürfen Karten nicht über `newCard(…, NOW)` mit `introduced = NOW` bauen, sonst zählen sie zum heutigen Limit. Mindestens diese Fälle:
    - Reihenfolge: fällige Lernkarte vor fälliger Wiederholung vor neuer Karte; vorgezogene Lernkarte (`due` in 15 Min) erst, wenn Stufe 1 und 2 leer sind; `due` in 25 Min → `done`.
    - Mischung: 10 fällige Wiederholungen, neue Karten verfügbar, `reviewsSinceNew` 0 bis 3 → `review`, 4 → `new`.
    - Limit: 20 heute eingeführte Karten → keine neue, `done` mit `moreNew = true`; `newLimit` 30 → neue Karte. Karten von gestern zählen nicht.
    - Tagessperre: DE→ES heute bewertet → ES→DE (neu oder fällige Wiederholung) nicht gewählt, auch bei Sitzungsrichtung nur ES→DE; gestern bewertet → frei; Lernkarte ES→DE trotz heute bewertetem Partner gewählt.
    - Position: zwei Seeds ergeben verschiedene Reihenfolgen, derselbe Seed immer dieselbe; die freigegebene ES→DE-Karte eines früheren Worts kommt vor DE→ES späterer Wörter; Niveaus gemischt.
    - Neuzugänge: `startedAt` am 2026-12-01, Vokabel mit `added` 2026-12-05 kommt vor allen anderen neuen Karten (auch vor freigegebenen ES→DE-Karten älterer Wörter), `added` 2026-12-01 oder früher nicht; nur innerhalb des Filters; untereinander nach Position.
    - Gefährdung: 1-Tages-Karte 3 Tage überfällig vor 30-Tages-Karte 3 Tage überfällig.
    - `lastShown`: wird übergangen, solange eine andere Karte aus Stufe 1 bis 3 da ist; einzige offene Lernkarte nach „Nochmal“ → erneut gezeigt, nicht `done`.
    - Keine Schleife: Simulation mit nur 2 Vokabeln, Richtung beide, immer „Gewusst“, Uhr läuft je Bewertung 8 s → nach höchstens 4 Bewertungen `done`, kein Wechsel DE→ES/ES→DE desselben Worts am selben Tag.
    - `null` nur bei leerer Auswahl; Auswahl mit Vokabeln, aber nichts mehr für heute → `done`.
  - `data/` (Einstellungen): `orderSeed` beim ersten Anlegen würfeln und `startedAt` setzen (`DEFAULT_SETTINGS` kann ihn nicht enthalten); `cardRepo.test.ts` (Vergleich mit `DEFAULT_SETTINGS`) anpassen.
  - `domain/stats.test.ts`: Card-Literal um `introduced` ergänzen (sonst bricht `npm run build`).
  - `features/study/Study.tsx`: `seen`/`newPass` und die Prüfung `changed` (Vorab-Gewusst nicht speichern) entfernen; `reviewsSinceNew` nach `kind` der bewerteten Karte führen; `newLimit` mit Tag führen und um 04:00 zurücksetzen; `orderSeed`, `startedAt` und `lastShown` übergeben; `done` von `null` unterscheiden (heute zeigt `!item` immer „Keine Karten“); Seite „Für heute geschafft“ mit „10 weitere neue Karten“.
  - `scripts/browser-smoke.ts`: 8i („Nochmal nach 5 Min“, nutzt Stufe 4 und eine nicht fällige Wiederholungskarte) auf 1 bzw. 10 Min umstellen, Vorlage um `introduced` ergänzen; 8k („Endlose Sitzung … ohne Fertig für heute“) ersetzen durch eine Prüfung von „Für heute geschafft“ und „10 weitere neue Karten“; Logo-Prüfung (8e6) um „Für heute geschafft“ ergänzen.
  - `docs/ABNAHME.md` nach der Umsetzung neu prüfen und umschreiben: Kriterien 1 („Std“ kommt nicht mehr vor), 2 bis 5 und 8, die Zahl der Prüfungen (Z. 5) und die manuelle Prüfung „Vorab-Wiederholung“ (Z. 22).

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
