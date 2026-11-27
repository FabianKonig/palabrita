# AGENTS.md

Hinweise für KI-Agenten, die in diesem Repo arbeiten.

## Projekt

**Palabrita**: Vokabel-Lern-App für Spanisch (Mexiko/Guatemala). Läuft komplett im Browser (PWA, offline-fähig), kein Backend. Fortschritt liegt in IndexedDB. Details: `README.md`, `docs/SPEC.md` (einzige Spezifikation: Teil A Anforderungen, Teil B Technik), `docs/TASKS.md` (offene Aufgaben). Weitere Dokumente: `docs/VOKABELN.md`, `docs/ABNAHME.md`, `docs/ERKLAERVIDEO.md` (Drehbuch, Entscheidungen, Gestaltung und Übergabe für das Erklärvideo; vor Arbeiten am Video zuerst lesen).

Stack: React 19, TypeScript 6, Vite 8, vite-plugin-pwa, react-router-dom 7, idb, Vitest 5, ESLint, Prettier. Deployment als statische PWA auf GitHub Pages.

## Umgebung

- Entwickelt wird teils unter Windows 11 (PowerShell, Git Bash), teils in Linux-Umgebungen (z. B. Claude Code in der Cloud). Keine Annahmen über OS oder Shell treffen; Pfade und Befehle plattformneutral halten.
- **Node.js 24** (README verlangt Node 24; Vite 8 läuft mindestens mit Node 22.12)
- **npm** ist der einzige Paketmanager, `package-lock.json` ist maßgeblich
- **Python wird in diesem Projekt nicht genutzt.** Keine Python-Skripte, kein `python -c`, kein pip. Skripte stattdessen in TypeScript schreiben und mit `tsx` ausführen (`npx tsx scripts/<datei>.ts`) oder als Node-Einzeiler. **Einzige Ausnahme (Nutzer, 2026-11-20 und 2026-11-21): die Erzeugung des Erklärvideos** (Sprachausgabe, Ton, Aufnahme, Schnitt, `docs/ERKLAERVIDEO.md`). Dafür sind Python, Shell und CommonJS erlaubt, aber nur im Ordner `scripts/video/` und nur für das Video, sonst nirgends (nicht in `src/`, `public/`, Build oder CI). Python-Umgebung (`.venv/`), Modelle und alles Erzeugte (`.video-work/`) werden nicht eingecheckt.
- Pakete kommen von der öffentlichen npm-Registry. Eine lokale `.npmrc` wird nicht committet (steht in `.gitignore`).

## Befehle

```powershell
npm install
npm run dev                         # http://localhost:5173
npm run build                       # tsc --noEmit + vite build -> dist/
npm run preview                     # http://localhost:4173 (PWA/Offline nur hier prüfbar)
npm test                            # vitest run
npm run lint                        # eslint .
npm run format                      # prettier --write .
npm run format:check                # prettier --check . (wie in der CI)
npm run validate:vocab              # Vokabeldateien prüfen
npx tsx scripts/browser-smoke.ts    # Browser-Smoke-Test, braucht laufendes `npm run preview -- --port 4173` (Details im Kopf der Datei)
```

Vor einem Commit mindestens `npm run lint`, `npm run format:check`, `npm test` und `npm run build` ausführen; bei Änderungen an Vokabeln zusätzlich `npm run validate:vocab`.

## Struktur

- `src/` App-Code (`domain/` Fachlogik wie Lernmodell, Warteschlange und Konjugation, `features/`, `components/`, `hooks/`, `data/`, `styles/`). Verzeichnisbaum: `docs/SPEC.md` §9.
- `src/features/legal/` Impressum und Datenschutz (Betreiberangaben in `operator.ts`; bei Änderung von Hosting oder externen Diensten Texte prüfen)
- `public/vocab/` Vokabeln als JSON je Thema (`NOTICE.md`: Quellen- und Lizenzhinweis); Schema: `scripts/vocab.schema.json`, Themen und Regeln: `docs/VOKABELN.md`
- `scripts/` Vokabel-Validierung (`validate-vocab.ts` mit `validateVocab.ts`, `vocab.schema.json`), Icon-Erzeugung (`make-icons.ts`), Browser-Smoke-Test (`browser-smoke.ts`), Formen-Ausgabe zum Gegenprüfen neuer Vokabeln (`vocab-forms.ts`)
- `.claude/skills/vokabeln-hinzufuegen/` Skill zum Hinzufügen neuer Vokabeln (Modell Opus 5.5, Effort hoch; Vorgehen, Wiktionary-Abgleich, Berichtspflicht bei Unsicherheit). Bei Vokabeln diesen Skill nutzen.
- `scripts/video/` Skripte zur Erzeugung des Erklärvideos (Python, Shell, CommonJS; eigene `README.md`; von ESLint ausgenommen)
- `docs/` `SPEC.md`, `TASKS.md`, `VOKABELN.md`, `ABNAHME.md`
- `.github/workflows/ci.yml` Prüfung jedes Pull Requests (Job `check`: Lint, Format, Tests, Vokabelprüfung, Build; Pflicht-Check im Ruleset für `main`)
- `.github/workflows/pages.yml` Deployment auf GitHub Pages nach dem Merge auf `main` (nur Build und Veröffentlichung, ohne Tests; Regeln: `docs/SPEC.md` §16)

## Konventionen

- Sprache: Doku, UI-Texte und Commit-Nachrichten auf Deutsch. Bezeichner im Code auf Englisch, Kommentare Deutsch oder Englisch.
- Verbformen werden aus `tags` und `overrides` generiert, nicht von Hand in die JSON schreiben.
- Keine Tracker, kein Backend, keine externen Anfragen zur Laufzeit. Die App lädt nur ihre eigenen Dateien.
- Prettier-Konfiguration (`.prettierrc`) und ESLint (`eslint.config.js`) einhalten.
- Nicht committen: `dist/`, `node_modules/`.
- Arbeitsweise: kleine Commits auf einem Feature-Branch, kein Push ohne Rückfrage (es sei denn, es ist anders vorgegeben). Offene Aufgaben stehen in `docs/TASKS.md`: Ist etwas erledigt, kommt das Ergebnis in `docs/SPEC.md` und der Punkt verschwindet aus `docs/TASKS.md`. Bei Kleinigkeiten, die das Ergebnis nicht wesentlich ändern, eine Annahme treffen und unter „Hinweise“ in `docs/TASKS.md` festhalten; sonst nachfragen (siehe „Rückfragen“).
- **`main` ist geschützt** (Ruleset `protect-main-branch`, Details und Folgen: `docs/SPEC.md` §16): kein direkter Push auf `main`, nur Pull Requests, nur Squash-Merge, Pflicht-Check `check` (`ci.yml`), Branch muss aktuell sein, Bypass-Liste leer, Auto-merge aus. Das Deployment (`pages.yml`) führt nach dem Merge **keine Tests** mehr aus, die Prüfung geschieht allein im PR. Deshalb: den Check nie überspringen oder abschwächen (kein `paths`-Filter, kein Umbenennen des Jobs `check`, keine Tests aus `ci.yml` entfernen), das Ruleset nicht umgehen. Gemergt wird nur auf ausdrückliche Freigabe des Nutzers für den jeweiligen PR (dann darf der Agent selbst mergen, per Squash und erst bei grünem `check`); ohne Freigabe nicht mergen. Ist ein PR veraltet, Branch aktualisieren und CI neu abwarten. Nach einem Merge wird der Branch gelöscht: weiterarbeiten auf einem neuen Branch von aktuellem `main`.
- Zeit: Der Tag ist immer der Kalendertag in der aktuellen Zeitzone des Geräts, Wechsel um 04:00 (`src/domain/day.ts`). Keine Zonenlogik einführen und `day.ts` nicht ändern, ohne SPEC §11 „Zeitzonen und Reisen“ und `src/domain/timezone.test.ts` zu beachten; eine andere Tageslogik ist eine Datenmodelländerung (siehe unten, Berichtspflicht).
- Neue Seiten: unter der Layout-Route in `src/App.tsx` anlegen, Inhalt in `.screen`, Überschrift als direktes `h1`-Kind von `.screen`. Das Logo oben rechts (`.corner-logo`) kommt dann automatisch an dieselbe Stelle; nur `/more` lässt es weg. Die Prüfung „Logo oben rechts“ in `scripts/browser-smoke.ts` (Abschnitt 8e6) listet die Seiten auf: neue Seiten dort ergänzen.

## Rückfragen

Rückfragen an den Nutzer sind jederzeit erwünscht (vom Nutzer festgelegt, 2026-11-27; er muss das nicht in jedem Prompt wiederholen). Ist eine Anfrage, eine Anforderung oder eine Umsetzung nicht ganz klar, vor der Umsetzung nachfragen, statt zu raten: alles klären, was nötig ist, damit genau feststeht, was umgesetzt werden soll. Rückfragen konkret formulieren (worum es geht, was unklar ist, Optionen mit Empfehlung), damit der Nutzer kurz antworten kann. Nur Kleinigkeiten, die das Ergebnis nicht wesentlich ändern, selbst entscheiden und als Annahme unter „Hinweise“ in `docs/TASKS.md` festhalten.

## Aktive Nutzer: Abwärtskompatibilität und Migrationen (wichtig)

**Es gibt aktive Nutzer** (seit 2026-11-21, vom Nutzer festgelegt; vorher galt „keine Nutzer, keine Migrationen“). Ihr Lernfortschritt und ihre Einstellungen liegen nur in ihrem Browser (IndexedDB, `localStorage`) und dürfen durch ein Update nicht verloren gehen. Vollständige Regeln: `docs/SPEC.md` §10.4, Entscheidung in §2 (Kompatibilität).

- **Vor jeder Änderung an Datenmodell, Schema, Speicherformaten, Vokabel-IDs, Routen oder Adresse prüfen**, ob Bestandsdaten betroffen sind (Liste in SPEC §10.4). Das gilt auch für scheinbar kleine Änderungen, etwa ein neues Pflichtfeld in `Settings` oder `Card`.
- **Ziel:** Bestandsnutzer laden die neue Version über den Banner „Aktualisieren“ und behalten Fortschritt und Einstellungen. Wenn es möglich und mit vertretbarem Aufwand umsetzbar ist, Code oder Daten so ändern, dass das gilt: `DB_VERSION` in `src/data/db.ts` erhöhen, Upgrade-Schritt ergänzen (bestehende Schritte nie ändern), Test mit Daten im alten Format.
- **Vokabeln:** IDs nie ändern oder wiederverwenden, die Bedeutung eines Eintrags unter derselben ID nicht ändern, `added` nie nachträglich ändern (`docs/VOKABELN.md`).
- **Berichten statt entscheiden:** Ist eine Migration nicht einfach umsetzbar, würde sie einen extrem großen Umbau erzwingen oder lässt sich Datenverlust nicht vermeiden, **vor der Umsetzung dem Nutzer berichten** (was ändert sich, wen betrifft es, wie aufwendig wäre die Migration, Alternativen). Der Nutzer entscheidet, ob der Aufwand betrieben wird oder ein Breaking Change stattfindet; den spezifizieren wir dann gemeinsam. Nie stillschweigend einen Breaking Change einbauen und nie stillschweigend einen sehr großen Umbau betreiben.
- Das genaue Migrationsverfahren ist noch nicht ausgearbeitet (`docs/TASKS.md`); der Standardweg steht in SPEC §10.4.

## Stand

- Der Hinweis „Es gibt noch keine Nutzer“ gilt nicht mehr. Siehe Abschnitt „Aktive Nutzer“ oben.
- Der Code entspricht `docs/SPEC.md`, soweit dort nichts als „noch nicht umgesetzt“ steht (Liste: `docs/TASKS.md`). Weicht der Code von der Spezifikation ab, nicht stillschweigend eines von beiden ändern, sondern mit dem Nutzer klären.
- Abnahme der Lernsitzung: `docs/ABNAHME.md`.
