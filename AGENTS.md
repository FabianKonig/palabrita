# AGENTS.md

Hinweise für KI-Agenten, die in diesem Repo arbeiten.

## Projekt

**Palabrita**: Vokabel-Lern-App für Spanisch (Mexiko/Guatemala). Läuft komplett im Browser (PWA, offline-fähig), kein Backend. Fortschritt liegt in IndexedDB. Details: `README.md`, `docs/SPEC.md` (einzige Spezifikation: Teil A Anforderungen, Teil B Technik), `docs/TASKS.md` (offene Aufgaben). Weitere Dokumente: `docs/VOKABELN.md`, `docs/ABNAHME.md`, `docs/ERKLAERVIDEO.md` (Drehbuch des Erklärvideos).

Stack: React 19, TypeScript 6, Vite 8, vite-plugin-pwa, react-router-dom 7, idb, Vitest 5, ESLint, Prettier. Deployment als statische PWA auf GitHub Pages.

## Umgebung

- Entwickelt wird teils unter Windows 11 (PowerShell, Git Bash), teils in Linux-Umgebungen (z. B. Claude Code in der Cloud). Keine Annahmen über OS oder Shell treffen; Pfade und Befehle plattformneutral halten.
- **Node.js 24** (README verlangt Node 24; Vite 8 läuft mindestens mit Node 22.12)
- **npm** ist der einzige Paketmanager, `package-lock.json` ist maßgeblich
- **Python wird in diesem Projekt nicht genutzt.** Keine Python-Skripte, kein `python -c`, kein pip. Skripte stattdessen in TypeScript schreiben und mit `tsx` ausführen (`npx tsx scripts/<datei>.ts`) oder als Node-Einzeiler. **Einzige Ausnahme (Nutzer, 2026-11-20): die Erzeugung des Erklärvideos** (Sprachausgabe, Ton, Schnitt, `docs/ERKLAERVIDEO.md`). Dort ist Python erlaubt, aber nur für diese Erzeugung: nicht in `src/`, `public/`, Build oder CI, und Python-Umgebung sowie Modelle werden nicht eingecheckt.
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
- `scripts/` Vokabel-Validierung (`validate-vocab.ts` mit `validateVocab.ts`, `vocab.schema.json`), Icon-Erzeugung (`make-icons.ts`), Browser-Smoke-Test (`browser-smoke.ts`)
- `docs/` `SPEC.md`, `TASKS.md`, `VOKABELN.md`, `ABNAHME.md`
- `.github/workflows/pages.yml` Deployment auf GitHub Pages (Lint, Tests, Vokabelprüfung, Build, Veröffentlichung)

## Konventionen

- Sprache: Doku, UI-Texte und Commit-Nachrichten auf Deutsch. Bezeichner im Code auf Englisch, Kommentare Deutsch oder Englisch.
- Verbformen werden aus `tags` und `overrides` generiert, nicht von Hand in die JSON schreiben.
- Keine Tracker, kein Backend, keine externen Anfragen zur Laufzeit. Die App lädt nur ihre eigenen Dateien.
- Prettier-Konfiguration (`.prettierrc`) und ESLint (`eslint.config.js`) einhalten.
- Nicht committen: `dist/`, `node_modules/`.
- Arbeitsweise: kleine Commits auf einem Feature-Branch, kein Push ohne Rückfrage (es sei denn, es ist anders vorgegeben). Offene Aufgaben stehen in `docs/TASKS.md`: Ist etwas erledigt, kommt das Ergebnis in `docs/SPEC.md` und der Punkt verschwindet aus `docs/TASKS.md`. Bei Unklarheit eine Annahme treffen und unter „Hinweise“ in `docs/TASKS.md` festhalten.
- Neue Seiten: unter der Layout-Route in `src/App.tsx` anlegen, Inhalt in `.screen`, Überschrift als direktes `h1`-Kind von `.screen`. Das Logo oben rechts (`.corner-logo`) kommt dann automatisch an dieselbe Stelle; nur `/more` lässt es weg. Die Prüfung „Logo oben rechts“ in `scripts/browser-smoke.ts` (Abschnitt 8e6) listet die Seiten auf: neue Seiten dort ergänzen.

## Stand

- Es gibt noch keine Nutzer: Änderungen brauchen keine Abwärtskompatibilität und keine Migrationen (SPEC §2, Kompatibilität).
- Der Code entspricht `docs/SPEC.md`, soweit dort nichts als „noch nicht umgesetzt“ steht (Liste: `docs/TASKS.md`). Weicht der Code von der Spezifikation ab, nicht stillschweigend eines von beiden ändern, sondern mit dem Nutzer klären.
- Abnahme der Lernsitzung: `docs/ABNAHME.md`.
