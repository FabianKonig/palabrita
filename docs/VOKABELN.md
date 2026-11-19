# Vokabeln: Themen und Qualitätsregeln

Die Vokabeln liegen in 13 Themendateien `public/vocab/<thema>.json` (Liste: `public/vocab/index.json`). Spanisch in der lateinamerikanischen Variante (Mexiko/Guatemala). Es gibt keinen festen Gesamtumfang und keine Kontingente je Thema, Wortart oder Niveau. Der Validator (`npm run validate:vocab`) verlangt nur, dass jedes Thema mindestens 10 Einträge hat (sonst lohnt sich kein eigenes Thema). Regeln für Einträge: SPEC §4.2 und §5.1.

## IDs

IDs haben das Format `v` plus vier Ziffern, sind eindeutig und werden nie wiederverwendet. Neue Einträge bekommen die nächste freie Nummer, unabhängig vom Thema.

## Inhaltliche Schwerpunkte

- **begruessung:** Grüße je Tageszeit, Verabschiedung, Höflichkeit (*usted*, *con permiso*, *disculpe*), Vorstellen, Dank und Bitte. Viele Phrasen.
- **zahlen-zeit:** Grund- und Mehrstellige Zahlen bis in den vierstelligen Bereich (z. B. *cincuenta y cuatro*, *dos mil cuatrocientos ochenta y ocho*), Ordnungszahlen, Wochentage, Monate, Uhrzeit, Tageszeiten, Zeitadverbien (*hoy*, *mañana*, *ahora*).
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
- `added` (Pflicht) ist das Datum, an dem die Vokabel hinzugefügt wurde (`YYYY-MM-DD`), bei neuen Einträgen also das heutige Datum. Nie nachträglich ändern: Nutzer, die die App schon verwenden, bekommen Wörter mit einem Datum nach ihrem ersten Start zuerst als neue Karten (SPEC §12.1).
