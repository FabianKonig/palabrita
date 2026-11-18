# Palabrita – Offene Aufgaben

Spezifikation: `docs/SPEC.md` (Soll-Zustand der neuen Lernsitzung: §3.1, §11, §12, §14.1).

Reihenfolge einhalten. Jeder Task ist einzeln lauffähig und committbar. Abhaken nach Abschluss: `[x]`. Annahmen und Besonderheiten unter „Notizen“ festhalten.

**Ausgangslage:** Der Code bildet noch das frühere Modell ab (SM-2 mit mehreren Bewertungsstufen, `buildQueue`, Tageslimit „neue Karten pro Tag“, feste Sitzungsliste). T16–T20 stellen auf das Modell der Spec um. Vor Beginn je Task prüfen, was im Code schon vorhanden ist.

### [x] T16 – SRS und Warteschlange
`domain/types.ts` (`Grade` = again/good, `Card.step`, `newPerDay` entfernen), `domain/srs.ts` (Lernmodell SPEC §11, `previewIntervals`, `formatInterval` mit Minuten), `domain/queue.ts` (`pickNext`, `queueCounts`, `MAX_LEARNING`; `buildQueue` entfällt). Bestehende Tests anpassen (nicht löschen), neue laut „Tests“ unten.

### [x] T17 – Lernsitzung und Umdrehen
`Study.tsx` dynamisch (kein festes Array, „Bewertet: N“, „Beenden“, Zusammenfassung, kein `practice`, kein Wartezähler), `Flashcard.tsx` mit `onToggle`, Auto-Vorlesen einmal je Karte (SPEC §13, §14.1).

### [x] T18 – Verb-Overlay
`components/VerbDetail.tsx` aus `features/dictionary/VocabDetail.tsx` herausziehen, `components/VerbOverlay.tsx` (Dialog/Bottom-Sheet, Escape, Zurück-Taste, Fokusfalle), Button „Konjugation“ erst nach dem Aufdecken (SPEC §14.1).

### [x] T19 – Startseite, Einstellungen, Import
`Home.tsx` („Fällig · Neu verfügbar · Serie“), `Settings.tsx` und `data/exportImport.ts` (`newPerDay` entfernen und beim Import ignorieren), Texte in `StudySetup.tsx` und `Legend.tsx` auf Reste von „Schwer/Gut/Leicht“, „Heute fällig“, „Neue pro Tag“ prüfen. `docs/vocab-plan.md` und `README.md` auf diese Begriffe prüfen.

### [x] T20 – Smoke-Test und Abnahme
`scripts/browser-smoke.ts` um die fünf Checks unten erweitern (bestehende Checks mit „Gut“ bzw. Tageslimit anpassen), danach Abnahmeprotokoll aktualisieren (neue Datei `docs/ABNAHME.md`, die alte liegt im Archiv).

### [x] T21 – Verzeichnisliste ohne verschachtelte Kästchen
**Problem:** `.link-list a, .link-list span` in `src/styles/global.css` trifft jedes `span` in der Liste. In der Verzeichnisliste bekommen dadurch `.es`, `.de`, die inneren Spans von `GermanText` (`.first`, `.rest`) und `.meta` jeweils Rahmen, Hintergrund, Rundung und `min-height: 48px`. Ergebnis: mehrere Rechtecke pro Eintrag. Das ist ein Selektorfehler, kein Design.

**Soll (vom Nutzer bestätigt, Stand 2026-11-18):**
1. Pro Eintrag genau ein Rechteck (die Zeile selbst). Innen nur Typografie, keine Kästchen, keine Chips.
2. Spanisch fett (`.es`, bleibt). Deutsch normal. Erste Übersetzung in Textfarbe (`var(--text)`), weitere grau (`var(--muted)`), getrennt mit „ · “ (SPEC §3 „Darstellung mehrerer Übersetzungen“). Heute ist `.vocab-list .de` komplett grau, das ändern.
3. Niveau (`.meta`: „A1“ … oder „eigen“) bleibt kleiner grauer Text rechts, ohne Kasten.
4. Selektor zentral beheben: nur direkte Kinder der Listenelemente tragen die Kartenoptik (`.link-list > li > a`, `.link-list > li > span`; das deaktivierte `span[aria-disabled="true"]` in „Mehr“ bleibt Karte). Danach „Mehr“ und „Wort hinzufügen“ (`Add.tsx`, nutzt `link-list`) im Browser prüfen, dass sich dort optisch nichts verschlechtert.
5. Keine Änderung an Markup-Reihenfolge, Routing, Suche, `GermanText` oder der Lernkarte (`.flashcard .word .first/.rest` bleiben).

**Randfälle (manuell prüfen, Viewport 360 px und 390 px, hell/dunkel):**
- Ein Eintrag mit drei Übersetzungen (`rico`: lecker · reich · gut) und der längste Eintrag (53 Zeichen deutsch): umbricht sauber, `.meta` bleibt rechts bzw. rutscht in eine eigene Zeile, nichts läuft über den Rand. Die Zeilenhöhe darf wachsen (`min-height: 48px` bleibt als Mindestmaß, Touch-Ziel ≥ 48 px).
- Eintrag mit nur einer Übersetzung: kein führendes oder abschließendes „ · “.
- Eigene Wörter (`level` fehlt, „eigen“), Ein-Wort-Einträge ohne Leerzeichen, sehr lange Wörter: kein horizontales Scrollen.
- Leere Trefferliste: Panel „Keine Treffer.“ unverändert. Der Button „Wort hinzufügen“ steht jetzt immer über der Liste (Stand main 9b754a8) und ist ein `.btn`, kein `link-list`-Eintrag; er darf von der Selektor-Änderung nicht berührt werden.
- Fokusring (`:focus-visible`) liegt weiter um die ganze Zeile, nicht um innere Teile.
- Kontrast: grau (`--muted`) auf `--surface` weiter ≥ 4,5 : 1 in beiden Themes.

**Abnahme:** `npm run lint`, `npm test`, `npm run build`; Screenshot der Verzeichnisliste (Mobil, hell und dunkel) vorher/nachher. Falls der Smoke-Test Selektoren der Liste nutzt, anpassen.

## Betroffene Dateien

| Datei | Änderung |
|---|---|
| `src/domain/types.ts` | `Grade` nur `again`/`good`, `Card.step?`, `Settings.newPerDay` und Default entfernen |
| `src/domain/srs.ts` | Lernmodell, `previewIntervals`, `formatInterval` (Minuten) |
| `src/domain/queue.ts` | `pickNext`, `MAX_LEARNING`; altes `buildQueue` und `newPerDay`-Logik entfernen |
| `src/features/study/Study.tsx` | dynamische Sitzung, Umdrehen, „Beenden“, Zusammenfassung |
| `src/components/Flashcard.tsx` | `onToggle`, Hinweis auf beiden Seiten |
| `src/components/VerbDetail.tsx` (neu) | gemeinsame Verbansicht (Kopf + `VerbTable`) |
| `src/components/VerbOverlay.tsx` (neu) | Dialog/Bottom-Sheet um `VerbDetail` (Fokusfalle, Escape, History-Eintrag) |
| `src/features/study/StudySetup.tsx`, `src/features/legend/Legend.tsx` | Texte anpassen |
| `src/features/dictionary/VocabDetail.tsx` | nutzt `VerbDetail` |
| `src/features/settings/Settings.tsx`, `src/data/exportImport.ts` | siehe T19 (`Home.tsx` ist entfernt, die Lernen-Seite ist die Startseite) |
| `src/data/cardRepo.ts` | `saveReview` unverändert nutzbar; `reviewed` zählt jede gespeicherte Bewertung. „Gewusst“ bei Vorab-Wiederholung wird gar nicht gespeichert (`review()` gibt die Karte unverändert zurück, Aufrufer überspringt `saveReview`) |

## Tests und Abnahme

Unit-Tests (Vitest, `npm test` grün; die bestehenden SRS-/Queue-Tests werden angepasst, nicht gelöscht):
- `review`: komplette Tabelle aus SPEC §11 (neu, Schritt 0/1, Abschluss, Rückfall, „Gewusst“ in der Wiederholungsphase, Vorab-Wiederholung inkl. „Gewusst ändert nichts“), Ease-Minimum 1,3 und -Maximum 3,0, Grenzfall 03:59/04:00, Intervallfolge bei nur „Gewusst“ wächst monoton.
- `pickNext`: Prioritäten 1–6, Lernkarte nach 5 Min wird vor neuen Karten gewählt, `MAX_LEARNING` (25) deckelt neue Karten (bei 25 Lernkarten wird keine 26. neue Karte eingeführt, bei 24 schon), Partnerkarte erst nach Abschluss der ersten Richtung, `lastShown` wird nicht sofort wiederholt, Durchlauf beginnt nach dem Ende von vorn, leere Auswahl.
- Import: Datei mit `newPerDay` und Karten ohne `step` lässt sich importieren.
- Partnerkarte: Richtung nur ES→DE führt ES→DE-Karten ein, ohne dass DE→ES existiert (keine Selbstsperre). Bei Richtung `both` bleibt ES→DE gesperrt, bis DE→ES abgeschlossen ist.
- Vorab-Wiederholung „Gewusst“: Karte unverändert (auch `lastReviewed`), `daily.reviewed` und Serie ändern sich nicht, nur der Sitzungszähler „Bewertet“ steigt.
- Vorab-Wiederholung „Nochmal“ auf eine Karte mit großem Intervall: Rückfall auf 1 T, `lapses += 1`, `reps = 0`.
- Ease-Kappung: Karte mit Ease 3,4 wird bei „Gewusst“ auf 3,0 gekappt, das Intervall nutzt noch 3,4.
- `pickNext` mit Wiederholungskarten und wartender Lernkarte liefert eine Vorab-Wiederholung (Stufe 4 nur ohne Wiederholungskarten). Sind alle sichtbaren Karten in der Lernphase und keine fällig, liefert `pickNext` sofort die Lernkarte mit dem frühesten `due` (kein Wartezähler); `lastShown` wird dabei gemieden, solange eine andere da ist.

Browser-Smoke-Test (`scripts/browser-smoke.ts`):
1. Karte zweimal umdrehen, Vorderseite erscheint wieder, Bewertungsbuttons bleiben sichtbar.
2. Bei einem Verb: „Konjugation“ erst nach dem Aufdecken sichtbar, Overlay zeigt die Tabelle, Escape schließt, die Sitzung steht auf derselben Karte.
3. Mehr als 25 neue Karten (z. B. 30) hintereinander mit „Gewusst“ bewerten: es erscheint nie „Fertig für heute“, kein Wartezähler, der Zähler zeigt „Bewertet: 30“. Die Karten 26 bis 30 sind wartende Lernkarten, die sofort gezeigt werden (SPEC §12.1 Stufe 4).
4. „Nochmal“ drücken, Karte erscheint nach Zeitsprung (Uhr im Test setzen) von 5 Min wieder vor neuen Karten. Ausgangslage: mindestens eine Karte in der Wiederholphase, sonst wird die Karte wegen Stufe 4 ohnehin sofort wieder gezeigt. Zeitsprung per `Page.addScriptToEvaluateOnNewDocument` (Offset auf `Date.now`), das Skript nutzt das DevTools-Protokoll, nicht Playwright.
5. „Beenden“ zeigt die Zusammenfassung, Neuladen behält den Fortschritt.

## Entscheidungen

Bestätigt vom Nutzer (Stand 2026-11-17): Partnerkarten-Sperre nur innerhalb der aktuellen Richtungsauswahl, harter Rückfall bei „Nochmal“ in der Vorab-Wiederholung, Stufe 4 nur ohne Wiederholungskarten, wartende Lernkarten werden sofort statt per Wartezähler gezeigt (Stand 2026-11-18), Fälligkeitsbasis „heute“, Ease-Rundung auf 2 Stellen und Kappung alter Ease-Werte. Keine Lerndauer in der Zusammenfassung (Stand 2026-11-18).

Noch änderbare Vorschläge, als Konstanten leicht anpassbar: Schritte 5/30 Min (zwei „Gewusst“ nacheinander bis zum Tagesplan), Abschlussintervall 1 Tag, `MAX_LEARNING = 15`, Ease −0,2 je „Nochmal“ und +0,05 je „Gewusst“ (Grenzen 1,3 bis 3,0). Wachsen die Intervalle zu schnell oder zu langsam, ist `EASE_GAIN` der erste Stellhebel. Bewusst nicht enthalten: ein dritter Button „Kenne ich schon“, mit dem eine neue Karte ohne Lernschritte direkt abgeschlossen würde. Falls gewünscht, ist das eine spätere Erweiterung.

## Umstellung auf GitHub Pages (T22–T25)

**Kontext und Entscheidungen (Stand 2026-11-18, vom Nutzer bestätigt):**

- Ziel: Die App soll ohne eigenen VPS auf dem Handy nutzbar sein. Statt Docker + Traefik (siehe SPEC §16) wird `dist/` über **GitHub Pages** ausgeliefert (kostenlos, HTTPS inklusive). Erwartete URL: `https://fabiankonig.github.io/palabrita/`.
- **Keine Codeänderung an der App nötig.** Geprüft: `base: "./"` in `vite.config.ts`, `HashRouter` (`src/App.tsx`), Vokabelabruf über `import.meta.env.BASE_URL` (`src/data/vocabRepo.ts`), `start_url`/`scope` im Manifest relativ (`./`). Die App läuft damit unter jedem Unterpfad.
- Der Workflow läuft bei **jedem Push auf `main`** (auch ohne Pull-Request) und per Knopfdruck (`workflow_dispatch`). Er veröffentlicht nur, wenn Lint, Tests und Vokabelprüfung grün sind.
- **Voraussetzung (offen):** Das Repo ist **privat**. GitHub Pages für private Repos gibt es nur mit bezahltem Plan (Pro/Team/Enterprise Cloud); die Seite ist dann trotzdem öffentlich erreichbar (Zugriffsschutz nur bei Enterprise Cloud). Ob Pages freigeschaltet ist, prüft der Nutzer unter *Settings → Pages*. Fallbacks siehe T23.
- Docker-Dateien (`Dockerfile`, `nginx.conf`, `docker-compose.yml`) bleiben zunächst bestehen und werden erst in T25 entfernt, nachdem der Nutzer bestätigt hat, dass die App über Pages auf dem Handy läuft. Die Git-Historie bewahrt sie.
- Eine Docker-Image-Variante (GHCR, `docker compose pull` auf dem VPS) wurde erwogen und **verworfen**. Nicht umsetzen.
- Lernfortschritt (IndexedDB) ist an den Origin gebunden. Eine neue Adresse startet leer; Export/Import (SPEC §3.2) überträgt ihn.
- Lizenz: Die Wortsuche und evtl. Vokabelinhalte stützen sich auf Wiktionary (CC BY-SA, Namensnennung steht im README). Wird das Repo öffentlich gemacht, vorher Herkunft der Vokabeln und `LICENSE`-Datei klären (eigene Entscheidung des Nutzers, nicht eigenmächtig hinzufügen).

**Regeln für den ausführenden Agenten:** Branch `claude/adoring-mayer-oyc770`, Commits auf Deutsch, keinen Pull-Request erstellen, nicht auf `main` pushen. Tasks in Reihenfolge, nach Abschluss `[x]`. T23 und T24 sind Schritte des Nutzers; der Agent führt sie nicht aus, sondern gibt dem Nutzer die Anleitung und wartet auf Rückmeldung. Kein Python (siehe `AGENTS.md`).

### [x] T22 – Pages-Workflow anlegen
Neue Datei `.github/workflows/pages.yml`:

- Trigger: `push` auf `main`, `workflow_dispatch`.
- `permissions`: `contents: read`, `pages: write`, `id-token: write`. `concurrency: { group: pages, cancel-in-progress: true }`.
- Job `build`: `actions/checkout`, `actions/setup-node` (Node 24, `cache: npm`), `npm ci`, `npm run lint`, `npm test`, `npm run validate:vocab`, `npm run build`, `actions/upload-pages-artifact` mit `path: dist`.
- Job `deploy` (`needs: build`): `environment: github-pages`, `actions/deploy-pages`.
- Aktionen auf die aktuelle Hauptversion festlegen (vorher prüfen, welche existiert). Keine Secrets nötig.

**Prüfen (lokal):** `npm run lint`, `npm test`, `npm run validate:vocab`, `npm run build` laufen durch. `dist/index.html`, `dist/manifest.webmanifest` und `dist/sw.js` enthalten nur relative Pfade (kein führendes `/`). Zusätzlich `dist/` unter einem Unterpfad ausliefern (z. B. Ordner `palabrita/` mit statischem Server) und prüfen, dass Start, Vokabelladen und Service-Worker-Registrierung dort funktionieren. YAML-Syntax prüfen (z. B. mit `npx --yes yaml-lint` oder `node -e` mit dem `yaml`-Paket aus `node_modules`, falls vorhanden).

### [x] T23 – Pages freischalten (Nutzer)
1. *Settings → Pages* im Repo öffnen. Wird Pages angeboten? Wenn ja: *Build and deployment → Source: GitHub Actions*.
2. Wenn Pages für das private Repo **nicht** angeboten wird, entscheidet der Nutzer: (a) GitHub-Plan upgraden, (b) Repo öffentlich machen (Lizenz-Hinweis oben), (c) **Cloudflare Pages** statt GitHub Pages: Repo verbinden, Build-Befehl `npm run build`, Ausgabeordner `dist`, Umgebungsvariable `NODE_VERSION=24`. Die App läuft dort unter `*.pages.dev` ohne Codeänderung; dann entfällt `pages.yml` (T22 zurücknehmen) und T25 bleibt gleich.
3. Branch auf `main` mergen (ohne Pull-Request möglich, z. B. lokal oder per Merge-Button). Unter *Actions* prüfen, dass der Lauf grün ist; die URL steht im Deploy-Job.

### [x] T24 – Auf dem Handy installieren und prüfen (Nutzer)
1. URL im Handy-Browser öffnen. Android/Chrome: „App installieren“. iPhone: in Safari Teilen → „Zum Home-Bildschirm“.
2. Einmal mit Internet öffnen (Service Worker cacht die App), dann Flugmodus: Start, Lernen, Vokabeln müssen offline laufen.
3. Falls bereits unter einer anderen Adresse gelernt wurde: dort exportieren, hier importieren (Einstellungen).
4. Nutzer meldet „läuft“ oder Fehler. Erst danach T25.

### [x] T25 – Docker entfernen und Doku anpassen
Nur ausführen, wenn der Nutzer T24 bestätigt hat.

- Löschen: `Dockerfile`, `nginx.conf`, `docker-compose.yml` (und `.dockerignore`, falls vorhanden).
- `README.md`: Abschnitt „Deployment auf dem Linux-VPS (Docker + Traefik)“ durch „Deployment (GitHub Pages)“ ersetzen: Workflow, Einmal-Einrichtung (T23), Update = Push auf `main`, Installation auf dem Handy, Hinweis zu IndexedDB pro Origin. Der Satz zu Preview/Handy im WLAN bleibt.
- `AGENTS.md`: Stack-Zeile („Deployment per Docker (nginx) hinter Traefik“) und Strukturzeile mit den Docker-Dateien aktualisieren; `.github/workflows/pages.yml` aufführen.
- `docs/SPEC.md`: §2 Zeile „Projektstruktur“ und §9 (Zeile mit `Dockerfile  docker-compose.yml  nginx.conf`) anpassen, §16 „Deployment“ auf GitHub Pages umschreiben (Traefik-/nginx-Angaben entfallen; Hinweis: Pages setzt `Cache-Control: max-age=600`, Updates laufen über den `UpdateBanner`, nicht über Cache-Header), §17 Hash-Router-Begründung („damit nginx keine SPA-Fallback-Regel braucht“) auf „damit der statische Host keine Fallback-Regel braucht“ ändern.
- Danach `grep -rniE "docker|nginx|traefik" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git .` ausführen; Treffer in der Historie des Dokuments (`docs/TASKS.md`, diese Notiz) sind in Ordnung.
- `npm run lint`, `npm test`, `npm run build` müssen grün bleiben.

## Notizen

- **T16:** Weil `Settings.newPerDay` und `buildQueue` entfielen, wurden Study, Home, Settings und Import schon im T16-Commit minimal angepasst (T17/T19 bauen darauf auf).
- **Zuständigkeit `pickNext`:** Die Funktion liefert `{ kind, item, newPass } | null`. Bei `newPass` leert der Aufrufer `sessionSeen`. `Study` trägt jede bewertete Karte in `sessionSeen` ein (auch „Gewusst“ bei Vorab-Wiederholung). `lastShown` wird nur gemieden, solange eine andere Karte da ist (zweiter Durchlauf ohne Vermeidung).
- **Stufe 4 vs. 5:** Im Code wird Stufe 5 vor Stufe 4 geprüft (4 nur, wenn keine Karte der Wiederholungsphase da ist), das entspricht SPEC §12.1.
- **`queueCounts`:** Lernkarten zählen als fällig bei `due <= now`, Wiederholungen bei `due < nextDayStart`; „Neu verfügbar“ zählt alle noch nie gelernten sichtbaren Karten ohne Partnerkarten-Sperre und ohne Deckel.
- **`Study`:** Karten werden einmal geladen und im Speicher fortgeschrieben; nach jeder Bewertung wird `pickNext` mit aktueller Uhrzeit aufgerufen. „Weiterlernen“ startet frisch mit denselben Filtern, „Zur Filterauswahl“ erscheint bei leerer Auswahl.
- **Vorschau bei Vorab-Wiederholung:** „Gewusst“ zeigt die verbleibenden Kalendertage bis zum unveränderten Fälligkeitsdatum. `formatInterval` zeigt ab 60 Min „N Std“ (gerundet).
- **Overlay:** Im Overlay ist der Legendenlink der `VerbTable` ausgeblendet (`legendLink={false}`), weil er die Sitzung verlassen würde. Der History-Eintrag wird nur angelegt, wenn nicht schon einer da ist (React StrictMode).
- **Auto-Vorlesen:** einmal je Kartenanzeige (Schlüssel aus Bewertungszähler und Karte), erst wenn die spanische Seite sichtbar und eine Stimme verfügbar ist.
- **Smoke-Test:** Browsersuche unter Linux per `SMOKE_BROWSER` oder `/opt/pw-browsers/chromium`; Testdaten für den 5-Min-Check werden per rohem IndexedDB-Zugriff angelegt (Karte v0001 DE→ES in der Wiederholphase, nicht fällig). Die Wortsuche-Checks brauchen Netz zu de.wiktionary.org und liefen hier durch.
- **Nicht automatisch getestet:** Zurück-Taste und Fokusfalle des Overlays, Auto-Vorlesen, UI-Verhalten „Gewusst“ bei Vorab-Wiederholung (nur über `review`-Unit-Test).

## Hinweise
- Bekannte Einschränkung: Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten für den Nutzer mehrdeutig. In v1 nicht behandelt.
