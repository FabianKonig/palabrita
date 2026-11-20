# Palabrita – Offene Aufgaben

Diese Datei führt nur, was noch zu tun ist. Erledigtes steht in `docs/SPEC.md`, der Verlauf in der Git-Historie. Wird ein Punkt erledigt, kommt das Ergebnis in die Spezifikation und der Punkt hier raus.

## Spezifiziert, Umsetzung offen

Die Spezifikation steht, ein Agent kann direkt umsetzen.

Derzeit nichts.

## Anforderungen ohne Detailspezifikation

Für jeden Punkt zuerst die Spezifikation schreiben (mit dem Nutzer klären), dann umsetzen.

- [ ] **Erklärvideo der App** (KI-erzeugt, zeigt alle Funktionen): Anforderung aufgenommen (2026-11-19), Spezifikation fehlt noch (Umfang, Länge, Format, Sprache, Erzeugungsweg, Ablage). Erst mit dem Nutzer klären, dann spezifizieren. Die App selbst bleibt davon unberührt.
  - Festgelegt (2026-11-19): Das Video wird **in der App eingebettet**, als neue Kachel im Tab „Mehr“ mit eigener Seite (nativer `<video controls>`-Player, ohne externe Dienste, kein YouTube-Embed). Gehostet wird es auf GitHub Pages als Datei unter `public/` (kurzes Video, grob 10 bis 40 MB, Dateien über 50 MB vermeiden).
  - Festgelegt: Das Video muss sich **per URL direkt verschicken** lassen: Wer den Link öffnet, sieht im Browser sofort das Video. Der Router ist ein `HashRouter`, die Video-Seite ist also unter `<Basis-URL>/#/video` direkt aufrufbar; die Video-Datei selbst ist zusätzlich direkt unter ihrer Datei-URL abrufbar (Standard-Player des Browsers). Welche der beiden URLs als „Teilen-Link“ gilt, ist in der Spezifikation festzulegen.
  - **Regel für Agenten: Die Videodatei nie selbst ins Repository einchecken** (kein `git add`, kein Commit, kein Push, auch nicht auf einem Feature-Branch). Ein Agent legt sie nur außerhalb des Repos ab (z. B. im Scratchpad oder in einem von `.gitignore` erfassten Ordner) und zeigt sie dem Nutzer zur Ansicht. Erst nach ausdrücklicher Bestätigung des Nutzers wird sie ins Repository geladen. Grund: Jede eingecheckte Version bleibt für immer in der Git-Historie, das Repo würde sonst viel zu groß. Auch Zwischenstände und verworfene Versionen gehören nicht hinein.
  - Drehbuch steht (2026-11-19, mit dem Nutzer abgestimmt): `docs/ERKLAERVIDEO.md`. Höchstens 60 s, Deutsch, Hochformat 9:16, höchstens drei Stichwort-Einblendungen, keine Adresse im Abspann, Höhepunkt Formsuche.
  - **Stimmen und Musik der ersten Version verworfen (2026-11-20):** Die erste Version (Piper „Thorsten“, spanische Piper-Stimme, per Skript erzeugte Marimba-Musik) gefällt dem Nutzer nicht: Die deutsche Stimme ist langweilig, zäh und einschläfernd, die spanische Stimme klingt schlecht, die Musik ist zu langweilig. Gewünscht ist ein modernes Erklär- und Werbevideo mit jugendlichem, peppigem Sprecher und moderner Musik. Diese Festlegungen sind in `docs/ERKLAERVIDEO.md` gestrichen. **Nächster Schritt ist nicht das Erzeugen, sondern die Spezifikation von deutscher Stimme, spanischer Stimme, Musik, Ton und Erzeugungsweg gemeinsam mit dem Nutzer** (Fragenliste: Abschnitt „Für die nächste Iteration vorab klären“ in `docs/ERKLAERVIDEO.md`, inklusive der Frage, ob „kein Python“ und „nur lokale Stimmen“ bestehen bleiben). Danach Hörproben vorlegen, erst nach Freigabe das Video erzeugen.
  - Offen für die Spezifikation: Das Video wird bewusst nicht vorab gecacht (`globPatterns` in `vite.config.ts` kennt kein `mp4`/`webm`), es ist also offline nicht abspielbar; entscheiden, ob das so bleibt. Neue Seite nach AGENTS.md anlegen (Layout-Route, `scripts/browser-smoke.ts` 8e6 ergänzen).

## Prüfungen und Entscheidungen des Nutzers

- [ ] **Vor dem Livegang: Hinweis „keine Nutzer“ aufheben.** Sobald es die ersten echten Nutzer gibt, also deren Daten (IndexedDB, `localStorage`) erhalten bleiben müssen, gilt die Freiheit von Migrationen nicht mehr. Dann diese Stellen ändern: SPEC §2 (Zeile „Kompatibilität“), SPEC §10.2 (Satz zu Migrationen) und `AGENTS.md` (Abschnitt „Stand“). Danach festlegen, wie Änderungen an Datenbank und Datenformaten künftig migriert werden (z. B. Versionssprung in `data/db.ts` mit Upgrade-Schritt und Tests).

## Hinweise

- Bekannte Einschränkung: Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten für den Nutzer mehrdeutig. In v1 nicht behandelt.
- Verworfen: eine Docker-Image-Variante (GHCR, `docker compose pull` auf einem VPS). Nicht umsetzen, die App läuft über GitHub Pages.
- Annahmen, die ein Agent bei Unklarheit trifft, kommen als kurzer Eintrag in diesen Abschnitt.
- Annahme (Formsuche, 2026-11-19): Eine Formzeile in der Verzeichnisliste zeigt unten in einer Zeile zuerst das Niveau-Kennzeichen und daneben die Bezeichnung („1. Pl. Presente + 1 weitere Form“). So steht das Kennzeichen wie bei normalen Zeilen als letzte Zeile links, und die Zeile hat genau drei Zeilen (SPEC §3.3a nennt das Kennzeichen bei Zeile 2).
- Annahme (Formsuche): Der Formenindex wird erst gebaut, wenn der Suchtext mindestens 2 Zeichen hat (nicht beim Öffnen des Verzeichnisses). Gemessen mit 6-fach gedrosselter CPU: einmalig etwa 100 ms, jeder weitere Tastendruck liegt bei der Bildschirmfrequenz; auf einem echten Handy nicht geprüft.
- Annahme (Kartenauswahl, Test der Klausel „Lernphase“, 2026-11-19): „Dieselbe Lage ohne die DE→ES-Karte“ ist in `queue.test.ts` als DE→ES-Karte umgesetzt, die nichts sperrt (Wiederholungskarte, nicht fällig, vor heute bewertet). Ganz ohne DE→ES-Karte wäre DE→ES selbst eine neue Karte und käme vor ES→DE desselben Worts.
- Annahme (Browser-Smoke-Test, Logo auf „Für heute geschafft“): Die Seite hat nach SPEC §14 kein Ecken-Logo, sondern das Logo oben mittig wie die Zusammenfassung. Geprüft wird das deshalb nicht in der Liste von 8e6, sondern in 8k (gleiche Stelle wie in der Sitzung, kein Ecken-Logo, keine Tab-Leiste).
- Annahme (Lernfortschritt zurücksetzen, 2026-11-20): Zurückgesetzt werden alle Karten sowie `orderSeed` und `startedAt` (Start wie beim ersten Mal, neue Reihenfolge). Höchstes Niveau, Darstellung und der Hinweis „Begrüßung gesehen“ bleiben, weil sie keine Lernfortschritte sind. Bedienung als Button mit Rückfrage direkt im Tab „Mehr“, keine eigene Seite. Siehe SPEC §3.2, §10.3, §14.
