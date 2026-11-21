# Palabrita – Offene Aufgaben

Diese Datei führt nur, was noch zu tun ist. Erledigtes steht in `docs/SPEC.md`, der Verlauf in der Git-Historie. Wird ein Punkt erledigt, kommt das Ergebnis in die Spezifikation und der Punkt hier raus.

## Prüfungen und Entscheidungen des Nutzers

- [ ] **Migrationsverfahren ausarbeiten.** Die ersten echten Nutzer sind gestartet (2026-11-21); der Hinweis „keine Nutzer“ ist aufgehoben (`AGENTS.md`, SPEC §2, §10.2, §10.4). Der Standardweg steht in SPEC §10.4 (Versionssprung in `data/db.ts` mit Upgrade-Schritt und Test mit altem Format). Noch offen und mit dem Nutzer zu klären, sobald die erste datenberührende Änderung ansteht: genauer Aufbau der Upgrade-Schritte, Umgang mit `blocked`/`blocking` bei mehreren offenen Tabs, Hinweis an Nutzer bei einem Breaking Change. Bis dahin gilt: Änderungen, die Bestandsdaten berühren, nach SPEC §10.4 bauen oder dem Nutzer berichten.

## Hinweise

- Festgelegt (Nutzer, 2026-11-21): Alle bisherigen Nutzer haben mit dem Stand von `main` bei `0ddd381` gestartet. Ihre Datenbank ist damit Version 1 (`data/db.ts`) mit allen Feldern aus SPEC §10.2 (`orderSeed`, `startedAt`, `Card.introduced`). Das ist der Ausgangspunkt für Migrationen; Datensätze früherer Entwicklungsstände müssen nicht berücksichtigt werden.
- Bekannte Einschränkung: Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten für den Nutzer mehrdeutig. In v1 nicht behandelt.
- Verworfen: eine Docker-Image-Variante (GHCR, `docker compose pull` auf einem VPS). Nicht umsetzen, die App läuft über GitHub Pages.
- Annahmen, die ein Agent bei Unklarheit trifft, kommen als kurzer Eintrag in diesen Abschnitt.
- Annahme (Formsuche, 2026-11-19): Eine Formzeile in der Verzeichnisliste zeigt unten in einer Zeile zuerst das Niveau-Kennzeichen und daneben die Bezeichnung („1. Pl. Presente + 1 weitere Form“). So steht das Kennzeichen wie bei normalen Zeilen als letzte Zeile links, und die Zeile hat genau drei Zeilen (SPEC §3.3a nennt das Kennzeichen bei Zeile 2).
- Annahme (Formsuche): Der Formenindex wird erst gebaut, wenn der Suchtext mindestens 2 Zeichen hat (nicht beim Öffnen des Verzeichnisses). Gemessen mit 6-fach gedrosselter CPU: einmalig etwa 100 ms, jeder weitere Tastendruck liegt bei der Bildschirmfrequenz; auf einem echten Handy nicht geprüft.
- Annahme (Kartenauswahl, Test der Klausel „Lernphase“, 2026-11-19): „Dieselbe Lage ohne die DE→ES-Karte“ ist in `queue.test.ts` als DE→ES-Karte umgesetzt, die nichts sperrt (Wiederholungskarte, nicht fällig, vor heute bewertet). Ganz ohne DE→ES-Karte wäre DE→ES selbst eine neue Karte und käme vor ES→DE desselben Worts.
- Annahme (Browser-Smoke-Test, Logo auf „Für heute geschafft“): Die Seite hat nach SPEC §14 kein Ecken-Logo, sondern das Logo oben mittig wie die Zusammenfassung. Geprüft wird das deshalb nicht in der Liste von 8e6, sondern in 8k (gleiche Stelle wie in der Sitzung, kein Ecken-Logo, keine Tab-Leiste).
- Annahme (Lernfortschritt zurücksetzen, 2026-11-20): Zurückgesetzt werden alle Karten sowie `orderSeed` und `startedAt` (Start wie beim ersten Mal, neue Reihenfolge). Höchstes Niveau, Darstellung und der Hinweis „Begrüßung gesehen“ bleiben, weil sie keine Lernfortschritte sind. Bedienung als Button mit Rückfrage direkt im Tab „Mehr“, keine eigene Seite. Siehe SPEC §3.2, §10.3, §14.
