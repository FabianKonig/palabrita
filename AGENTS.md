# AGENTS.md

Hinweise für KI-Agenten, die in diesem Repo arbeiten.

## Projekt

**Palabrita**: Vokabel-Lern-App für Spanisch (Mexiko/Guatemala). Läuft komplett im Browser (PWA, offline-fähig), kein Backend. Fortschritt liegt in IndexedDB. Details: `README.md`, `docs/SPEC.md` (einzige Spezifikation: Teil A Anforderungen, Teil B Technik), `docs/TASKS.md` (offene Aufgaben).

Stack: React 19, TypeScript 6, Vite 8, vite-plugin-pwa, react-router-dom 7, idb, Vitest 5, ESLint, Prettier. Deployment als statische PWA auf GitHub Pages.

## Umgebung

- Entwickelt wird teils unter Windows 11 (PowerShell, Git Bash), teils in Linux-Umgebungen (z. B. Claude Code in der Cloud). Keine Annahmen über OS oder Shell treffen; Pfade und Befehle plattformneutral halten.
- **Node.js 24** (README verlangt Node 24; Vite 8 läuft mindestens mit Node 22.12)
- **npm** ist der einzige Paketmanager, `package-lock.json` ist maßgeblich
- **Python wird in diesem Projekt nicht genutzt.** Keine Python-Skripte, kein `python -c`, kein pip. Skripte stattdessen in TypeScript schreiben und mit `tsx` ausführen (`npx tsx scripts/<datei>.ts`) oder als Node-Einzeiler.
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
npm run validate:vocab              # Vokabeldateien prüfen
npm run validate:vocab -- --final   # zusätzlich: 500 Einträge laut Plan
```

Vor einem Commit mindestens `npm run lint`, `npm test` und `npm run build` ausführen; bei Änderungen an Vokabeln zusätzlich `npm run validate:vocab`.

## Struktur

- `src/` App-Code (`domain/` Fachlogik wie SRS/SM-2 und Konjugation, `features/`, `components/`, `hooks/`, `data/`, `styles/`)
- `public/vocab/` Vokabeln als JSON je Thema; Schema: `scripts/vocab.schema.json`, Plan: `docs/vocab-plan.md`
- `scripts/` Vokabel-Validierung (`validate-vocab.ts` mit `validateVocab.ts`, `vocabPlan.ts`, `vocab.schema.json`), Icon-Erzeugung (`make-icons.ts`), Browser-Smoke-Test (`browser-smoke.ts`)
- `docs/` `SPEC.md`, `TASKS.md`, `vocab-plan.md`
- `.github/workflows/pages.yml` Deployment auf GitHub Pages (Lint, Tests, Vokabelprüfung, Build, Veröffentlichung)

## Konventionen

- Sprache: Doku, UI-Texte und Commit-Nachrichten auf Deutsch.
- Verbformen werden aus `tags` und `overrides` generiert, nicht von Hand in die JSON schreiben.
- Keine Tracker, kein Backend. Einzige externe Anfragen: Wortsuche bei `de.wiktionary.org`, falls dort nichts gefunden wird, Fallback auf `es.wiktionary.org` (nur Wortart/Genus, keine deutsche Bedeutung). Nur auf Knopfdruck, nicht im Service-Worker-Cache.
- Prettier-Konfiguration (`.prettierrc`) und ESLint (`eslint.config.js`) einhalten.
- Nicht committen: `dist/`, `node_modules/`.

## Stand

- Lernsitzung, SRS und Warteschlange entsprechen dem Modell in `docs/SPEC.md` (§3.1, §11, §12, §14.1); T16 bis T20 sind erledigt. Abnahme: `docs/ABNAHME.md`.
