# Themenplan Vokabeln

Maßgeblich im Code ist `scripts/vocabPlan.ts` (der Validator prüft dagegen). Dieses Dokument erklärt den Plan.

**Ziel:** 800 Einträge in 13 Themendateien `public/vocab/<thema>.json`. Spanisch in der lateinamerikanischen Variante (Mexiko/Guatemala).

## Kontingent je Thema

Die Zahlen enthalten die Seed-Vokabeln, die bereits in der Datei stehen. `misc` = Adjektive, Adverbien, Zahlwörter, Sonstiges (`adj`, `adv`, `num`, `other`).

| Thema (Schlüssel) | ID-Bereich | Verben | Nomen | misc | Phrasen | Summe | A1 / A2 / B1 |
|---|---|---|---|---|---|---|---|
| `begruessung` Begrüßung & Höflichkeit | v0026–v0075 | 4 | 6 | 6 | 24 | 40 | 16 / 16 / 8 |
| `zahlen-zeit` Zahlen & Zeit | v0076–v0125 | 6 | 16 | 16 | 4 | 42 | 17 / 17 / 8 |
| `essen` Essen & Trinken | v0126–v0175 | 12 | 28 | 6 | 4 | 50 | 20 / 20 / 10 |
| `transport` Unterwegs & Transport | v0176–v0225 | 10 | 20 | 6 | 6 | 42 | 17 / 17 / 8 |
| `unterkunft` Unterkunft | v0226–v0275 | 8 | 20 | 6 | 4 | 38 | 15 / 15 / 8 |
| `einkaufen` Einkaufen & Geld | v0276–v0325 | 10 | 18 | 8 | 6 | 42 | 17 / 17 / 8 |
| `gesundheit` Gesundheit & Notfall | v0326–v0375 | 8 | 20 | 6 | 6 | 40 | 16 / 16 / 8 |
| `natur` Natur & Wetter | v0376–v0425 | 6 | 22 | 10 | 2 | 40 | 16 / 16 / 8 |
| `orte` Orte & Wegbeschreibung | v0426–v0475 | 6 | 22 | 10 | 4 | 42 | 17 / 17 / 8 |
| `kultur` Kultur & Feste | v0476–v0525 | 8 | 18 | 6 | 6 | 38 | 15 / 15 / 8 |
| `maya` Maya & Geschichte | v0526–v0575 | 6 | 22 | 6 | 2 | 36 | 14 / 14 / 8 |
| `smalltalk` Smalltalk & Alltag | v0576–v0625 | 16 | 8 | 10 | 16 | 50 | 20 / 20 / 10 |
| `grundwortschatz` Grundwortschatz (häufigste Wörter) | v0626–v0925 | 150 | 60 | 70 | 20 | 300 | 120 / 120 / 60 |
| **Summe** | | **250** | **280** | **166** | **104** | **800** | **320 / 320 / 160** |

Hinweise zum Plan:
- Die ID-Bereiche haben je 50 Plätze (Thema grundwortschatz: 300, die häufigsten Wörter laut Frequenzlisten), die Themen brauchen höchstens 50. Neue Einträge nutzen aufsteigende IDs im Bereich ihres Themas, Lücken sind erlaubt, IDs werden nie wiederverwendet.
- Die Seed-Vokabeln `v0001–v0025` behalten ihre IDs und stehen im Thema, zu dem sie gehören (ihre IDs liegen deshalb außerhalb des Bereichs). *tener* (zuvor `v9001`) hat die neue ID `v0226` im Bereich von `unterkunft`.
- Die Aufteilung nach Wortart weicht leicht vom Richtwert in `docs/SPEC.md` §4.1 ab (100 / 220 / 96 / 84 statt 100 / 250 / 80 / 70), das ist dort ausdrücklich erlaubt.
- Der Validator meldet Abweichungen vom Plan als Warnung. Mit `npm run validate:vocab -- --final` müssen die Summen je Thema und insgesamt (800) stimmen.

## Inhaltliche Schwerpunkte

- **begruessung:** Grüße je Tageszeit, Verabschiedung, Höflichkeit (*usted*, *con permiso*, *disculpe*), Vorstellen, Dank und Bitte. Viele Phrasen.
- **zahlen-zeit:** Zahlen 0–1000, Ordnungszahlen, Wochentage, Monate, Uhrzeit, Tageszeiten, Zeitadverbien (*hoy*, *mañana*, *ahora*).
- **essen:** Grundnahrungsmittel, Getränke (*jugo*, *café*), mexikanische und guatemaltekische Gerichte (*tamal*, *pozole*, *pepián*, *frijoles*), Restaurant (*la cuenta*, *la propina*), Verben (*comer*, *beber*, *pedir*, *probar*).
- **transport:** Bus (*camión*, *chicken bus* im Hinweis), Taxi, Flug, Ticket, Haltestelle, Grenze, Verben des Reisens.
- **unterkunft:** Hotel, Reservierung, Zimmer, Schlüssel, Check-in, Hostal, Wi-Fi, Probleme im Zimmer.
- **einkaufen:** Markt, Preis, Geld (*peso*, *quetzal*), Feilschen, Bezahlen, Größen, Farben, Kleidung.
- **gesundheit:** Körperteile, Beschwerden, Arzt, Apotheke, Notruf, Versicherung, Allergien.
- **natur:** Vulkane, Seen (*lago de Atitlán*), Strand, Dschungel, Wetter, Tiere, Jahreszeiten (*época de lluvias*).
- **orte:** Stadt, Straße, Plaza, Kirche, Richtungsangaben (*a la derecha*, *derecho*), Entfernungen, Verben der Bewegung.
- **kultur:** Feste (*Día de Muertos*, *Semana Santa*), Musik, Handwerk, Textilien, Religion, Kunst, Sport.
- **maya:** Pyramiden, Ruinen (*Tikal*, *Chichén Itzá*), Götter und Kalender, *popol vuh*, Sprachen, Geschichte der Kolonialzeit.
- **smalltalk:** Alltagsverben (*querer*, *poder*, *saber*, *ir*, *ser*, *estar*), Meinungen, Familie, Herkunft, Hobbys, Gefühle, Verständigungsfragen (*¿Me puede repetir?*).

## Qualitätsregeln für Einträge

- `de` ist eine Liste mit 1–4 Einträgen, mehrere nur bei echten Alternativen.
- Nomen immer mit Artikel (*el*/*la*/*el/la*) und `gender`, `plural` wo sinnvoll. Unregelmäßige Plurale und Akzentwechsel (*el canción → las canciones*) beachten.
- Jede Vokabel hat einen kurzen, natürlichen Beispielsatz (`example.es` und `example.de`) in Alltagssprache, in der Regel im Präsens.
- Verben: nur `tags`, `reflexive`, `overrides` nach `docs/SPEC.md` §5.1. Overrides nur für Formen, die vom Generator abweichen (der Validator meldet Redundanz). Verbformen im Zweifel mit `npm run validate:vocab` prüfen.
- Regionale Besonderheiten (Mexikanismen, Guatemaltekismen) im Feld `note`.
- Keine Dubletten über Themen hinweg (gleiche Form und gleiche Wortart).
