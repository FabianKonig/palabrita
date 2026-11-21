# Skripte für das Erklärvideo

Alles hier dient **nur** der Erzeugung des Erklärvideos (`docs/ERKLAERVIDEO.md` ist die Quelle für Entscheidungen, Text, Ablauf und Gestaltung). Python, Shell und CommonJS sind hier ausdrücklich erlaubt (Nutzer, 2026-11-21), aber nirgends sonst im Projekt. Die Skripte gehören nicht zur App, zur CI oder zum Build; ESLint überspringt diesen Ordner.

**Nichts von dem, was die Skripte erzeugen, wird eingecheckt** (Audio, Bilder, Video, Modelle, Python-Umgebung). Alles landet in `.video-work/` (in `.gitignore`), die Umgebung in `.venv/`. Vor jedem Push mit dem Nutzer sprechen (`docs/ERKLAERVIDEO.md`, „Regeln, die immer gelten“).

## Voraussetzungen

- Node.js mit Playwright und Chromium (in der Cloud-Umgebung vorinstalliert: `NODE_PATH=$(npm root -g)`), `ffmpeg`, `ffprobe`, `curl`.
- Python-Umgebung für Stimme und Wortzeiten (CPU reicht):

```bash
python3 -m venv .venv
.venv/bin/pip install --extra-index-url https://download.pytorch.org/whl/cpu -r scripts/video/requirements.txt
```

- Die App gebaut und laufend: `npm run build`, dann `npm run preview -- --port 4173` (andere Adresse: `VIDEO_BASE`).
- Der Referenzclip der Stimme liegt im Repo: `scripts/video/ref/stimme_2a_Szene1.wav` (24 kHz, mono, 6,8 s, 326 KB, mit Zustimmung des Nutzers eingecheckt). Er lässt sich nicht neu erzeugen (VoiceDesign würfelt bei jedem Aufruf neu). Eine Datei gleichen Namens in `.video-work/ref/` hat Vorrang. Für eine andere Stimme mit `01-stimme-wuerfeln.py` Kandidaten erzeugen und den Nutzer wählen lassen.

## Reihenfolge (alles aus dem Repo-Wurzelordner)

| Schritt | Aufruf | Ergebnis |
|---|---|---|
| Musik laden | `scripts/video/00-musik-laden.sh` | `.video-work/music/vibrant-momentum.mp3` |
| Stimme klonen | `.venv/bin/python scripts/video/02-stimme-erzeugen.py` | `.video-work/clone/xvec_s1.wav` bis `s9` |
| Audio aufbereiten | `scripts/video/03-audio-aufbereiten.sh` | `.video-work/audio/s1.wav` bis `s9` (Tempo 1,25) |
| Wortzeiten | `.venv/bin/python scripts/video/04-wortzeiten.py` | `.video-work/build/words.json` |
| Zeitplan | `node scripts/video/05-zeitplan.cjs` | `.video-work/build/timeline.json` (Länge muss unter 70 s bleiben) |
| Aufnahme | `NODE_PATH=$(npm root -g) node scripts/video/06-aufnahme.cjs` | Bilder und `frames.json` in `.video-work/build/` |
| Zusammenbau | `node scripts/video/07-zusammenbau.cjs` | `.video-work/build/palabrita_erklaervideo.mp4` (mit Namensnennung der Musik in den Metadaten) und `palabrita_erklaervideo_poster.jpg` (Vorschaubild) |

Der Sprechertext steht in `sprechertext.json` und muss mit `docs/ERKLAERVIDEO.md` („Sprechertext am Stück“) übereinstimmen. Ändert sich der Text, beides anpassen und ab „Stimme klonen“ neu laufen lassen. Mit `VIDEO_WORK=<Ordner>` lässt sich ein anderer Arbeitsordner wählen.

## Dateien

- `lib/paths.cjs`: Pfade und Adresse der App. `lib/effects.cjs`: Lernstand, Sprachausgabe-Attrappe und Effektebene (Tipp-Punkte, Hervorhebungen, Einblendungen mit dem freigegebenen CSS).
- `seed-suchen.cjs`: Hilfsprogramm, das den `orderSeed` 125947 gefunden hat (Kartenfolge camión, taxi, avión, volar im Thema „Unterwegs & Transport“). Nur nötig, wenn sich Vokabeln oder die Kartenauswahl ändern.
- `01-stimme-wuerfeln.py`: neue Stimm-Kandidaten (VoiceDesign), nur wenn der Referenzclip fehlt.

## Grenzen der Reproduzierbarkeit

- Die Stimme ist nicht deterministisch: Mit demselben Referenzclip klingt jede Erzeugung leicht anders (Betonung, Pausen), die Stimme bleibt dieselbe.
- Die Aufnahme ist bis auf wenige Millisekunden Zeitversatz reproduzierbar. Ändert sich das Aussehen der App (Lernen-Seite, Lernsitzung, Verzeichnis, Statistik, „Mehr“), müssen die Abschnitte „Lernen-Seite: Stand für die Aufnahme“ und der Ablauf in `docs/ERKLAERVIDEO.md` geprüft und die Aufnahme neu erzeugt werden.
- Die Skripte laufen auf der CPU in grob 10 bis 15 Minuten für die Stimme (neun Szenen), 70 s für die Aufnahme und etwa 1 Minute für den Zusammenbau.
