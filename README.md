# Palabrita

Vokabel-Lern-App für Spanisch (lateinamerikanische Variante, Mexiko und Guatemala) mit Karteikarten, Wiederholungsplan (Spaced Repetition mit „Nochmal“ und „Gewusst“, endlose Sitzung), Aussprache und Verbtabellen. Läuft komplett im Browser, ist als PWA installierbar und funktioniert offline.

Der Lernfortschritt liegt im Browser (IndexedDB), je Gerät getrennt. Zum Sichern oder Umziehen gibt es **Einstellungen → Daten sichern** (Export/Import als JSON-Datei).

## Lokal testen

Voraussetzung: Node.js 24 und npm (`node -v`, `npm -v`).

```powershell
npm install
npm run dev        # Entwicklung: http://localhost:5173
npm run build      # Produktions-Build nach dist/
npm run preview    # gebaute Version: http://localhost:4173
```

Service Worker, Offline-Betrieb und Installierbarkeit lassen sich nur mit `build` + `preview` prüfen. Auf `localhost` funktioniert die PWA ohne HTTPS, Chrome/Edge zeigen ein Installations-Symbol in der Adressleiste. Im selben WLAN (z. B. vom Handy) geht `npm run preview -- --host`, dort fehlt aber HTTPS, daher sind Installation und Offline-Modus meist nicht verfügbar.

Weitere Befehle:

```powershell
npm test                      # Unit-Tests (SRS, Konjugation, Export/Import, ...)
npm run lint                  # ESLint
npm run validate:vocab        # Vokabeldateien prüfen (Schema, IDs, Dubletten, Verbformen)
```

## Deployment (GitHub Pages)

Die App liegt als statische Dateien (`dist/`) auf GitHub Pages (HTTPS inklusive, kein eigener Server). Der Workflow `.github/workflows/pages.yml` führt Lint, Tests, Vokabelprüfung und Build aus und veröffentlicht danach `dist/`.

Einmalige Einrichtung:
1. Repo auf GitHub: *Settings → Pages → Build and deployment → Source: GitHub Actions*.
2. Unter *Actions → Pages → Run workflow* den Workflow starten.
3. Die URL steht im Deploy-Job (erwartet: `https://fabiankonig.github.io/palabrita/`).

Aktualisieren: Jeder Push auf `main` startet den Workflow und veröffentlicht die neue Version (nur bei grünem Lint, Tests und Vokabelprüfung). Zusätzlich lässt er sich unter *Actions → Pages → Run workflow* manuell starten.

Der Lernfortschritt (IndexedDB) ist an die Adresse (Origin) gebunden. Eine neue Adresse startet leer; Export und Import in den Einstellungen übertragen ihn.

## Installation auf dem Handy

- **Android (Chrome):** Seite öffnen, Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.
- **iPhone (Safari):** Seite in **Safari** öffnen, Teilen-Symbol → „Zum Home-Bildschirm“. Andere Browser auf dem iPhone können keine Web-Apps installieren.

## Daten und Datenschutz

- Alles läuft im Browser, es gibt kein Backend, keine Tracker und keine Konten.
- Quelle der Vokabeln: [Wiktionary](https://de.wiktionary.org) und [spanische Wiktionary](https://es.wiktionary.org), Inhalte unter CC BY-SA.
- Sichern: **Einstellungen → Daten sichern** exportiert Einstellungen und Karten. Beim Import gibt es „Zusammenführen“ (die Karte mit dem neueren Lernstand gewinnt) und „Ersetzen“.

## Projektaufbau

Siehe `docs/SPEC.md` (Anforderungen und Technik, eine Datei), `docs/TASKS.md` (offene Aufgaben), `docs/VOKABELN.md` (Themen und Qualitätsregeln der Vokabeln), `docs/FORMSUCHE.md` (Anforderung Formsuche) und `docs/ABNAHME.md` (Abnahmeprotokoll). Hinweise für KI-Agenten: `AGENTS.md`. Vokabeln liegen als JSON je Thema in `public/vocab/`, Verbformen werden aus `tags` und `overrides` generiert (`src/domain/conjugation`).

## Lizenz und Quellen

- **Code:** Alle Rechte vorbehalten. Der Quellcode steht ohne Lizenz im Repository. Er ist einsehbar, darf aber nicht kopiert, verändert oder weiterverbreitet werden (ausgenommen das Ansehen und Forken innerhalb von GitHub laut GitHub-Nutzungsbedingungen).
- **Vokabeln und Testdaten:** Die Vokabellisten in `public/vocab/` stammen aus bzw. beruhen auf [Wiktionary](https://de.wiktionary.org) und [Wiktionary (spanisch)](https://es.wiktionary.org). Die Inhalte stehen unter [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de). Urheber sind die jeweiligen Wiktionary-Mitwirkenden (Versionsgeschichte der einzelnen Seiten). Die Inhalte wurden ausgewählt, gekürzt, ergänzt und umstrukturiert. Für diese Dateien gilt weiterhin CC BY-SA 4.0 (Weitergabe unter gleichen Bedingungen), die Code-Regelung oben gilt für sie nicht. Siehe auch `public/vocab/NOTICE.md`.
