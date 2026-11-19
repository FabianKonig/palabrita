# Abnahme: Lernsitzung

Prüft das Modell aus `docs/SPEC.md` §3.1, §11, §12, §14.1 (Kartenauswahl und Lernmodell nach Anki, umgesetzt 2026-11-19).

**Prüfumgebung:** Linux (Cloud-Container), Node 24, `npm run build` + `vite preview` auf `http://localhost:4173`, Chromium (headless, DevTools-Protokoll, `scripts/browser-smoke.ts`, 79 Prüfungen). Dazu `npm run lint`, `npm test` (Vitest), `npm run build`, `npm run validate:vocab`.

| # | Kriterium | Ergebnis | Nachweis |
|---|---|---|---|
| 1 | Zwei Buttons „Nochmal“ / „Gewusst“ mit Vorschau (Min, T, Mon, J mit Dezimalkomma) | **bestanden** | `srs.test.ts` (`previewIntervals`, `formatInterval`: „1 Min“, „10 Min“, „29 T“, „2 Mon“, „1,2 J“, „2 J“), Smoke-Test: neue Karte zeigt „1 Min“ / „10 Min“ |
| 2 | Lernphase 1 / 10 Min, Wiederlernphase 10 Min, Rückfall, Wiederholungsphase mit Bonus für Verspätung, Ease 1,3 bis 3,0, `MAX_INTERVAL`, 04:00-Regel | **bestanden** | `srs.test.ts` (Tabellen aus §11, `introduced` bleibt, `lastReviewed` bei jeder Bewertung, 10 T + 3 T Verspätung → 29 T, nicht fällig gilt als pünktlich, Folge 1, 3, 8, 21, 56, `mature` ab 21 T) |
| 3 | Keine Vorab-Wiederholung: nicht fällige Wiederholungskarten kommen nie, fällig ist bis morgen 03:59 | **bestanden** | `queue.test.ts` (Grenze 04:00, „nichts mehr für heute“ → `done`) |
| 4 | `pickNext`: Stufen 1 bis 4, Mischung 4 zu 1, Tageslimit 20 über alle Sitzungen, Tagessperre samt „Wiederholung vor neuer Karte“, feste Zufallsreihenfolge (`position` mit `fmix32`), Neuzugänge zuerst, Gefährdung, `lastShown`, keine Schleife | **bestanden** | `queue.test.ts` (Durchmischung gemessen: im Mittel 9,4 Paare je Seed, höchstens 18) |
| 5 | „Für heute geschafft“ mit „10 weitere neue Karten“, Sitzung läuft mit denselben Zählern weiter | **bestanden** | Smoke-Test: 19 heute eingeführte Karten, die 20. neue Karte kommt sofort wieder (Stufe 3) und schließt ab, dann „Für heute geschafft“ mit Satz zum Limit; „10 weitere neue Karten“ zeigt eine neue Karte, „Geübt“ bleibt 2. Logo oben mittig wie in der Sitzung |
| 6 | Karte beliebig oft umdrehen, Buttons bleiben | **bestanden** | Smoke-Test (zweimal umdrehen) |
| 7 | Verb-Overlay: „Konjugation“ erst nach dem Aufdecken, Tabelle, Escape, gleiche Karte | **bestanden** (Zurück-Taste und Fokusfalle nicht automatisch geprüft, siehe unten) | Smoke-Test |
| 8 | „Nochmal“ bei einer neuen Karte kommt nach 1 Min wieder, vor neuen Karten | **bestanden** | Smoke-Test mit Uhr-Offset (`Date.now`, 2 Min), Ausgangslage mit einer nicht fälligen Wiederholungskarte |
| 9 | „Beenden“ zeigt Zusammenfassung, Neuladen behält Fortschritt | **bestanden** | Smoke-Test |
| 10 | Einstellungen ohne „Neue pro Tag“, Lernen-Seite ohne Zähler und Serie (Streak); `orderSeed` und `startedAt` werden beim ersten Start angelegt und lassen sich nicht überschreiben | **bestanden** | Smoke-Test, `cardRepo.test.ts` (gleichzeitige Aufrufe, untergeschobenes `orderSeed`) |

**Hinweise zum Verhalten** (kein Fehler, siehe SPEC):
- Die Zahl neuer Wörter wechselt bei vollem Limit zwischen 20 und 0 je Tag: zwei Tage neue Wörter (DE→ES), zwei Tage nur die Gegenrichtung ES→DE dieser Wörter (§3.1, Tagessperre).
- Der 10-Minuten-Schritt greift nur, wenn nach der ersten Bewertung einer Karte noch rund 75 Karten aus Stufe 1 und 2 folgen. In den ersten Wochen kommt eine neue Karte daher fast immer sofort wieder (Stufe 3) und schließt nach zweimal „Gewusst“ mit 1 T ab, obwohl die Vorschau „10 Min“ zeigt (§12.2, Stufe 3).

## Manuelle Abnahme

Zurück-Taste, Fokusfalle, Auto-Vorlesen und Bedienung auf dem Handy hat der Nutzer abgeschlossen (2026-11-19); diese Teile hat die Umstellung der Kartenauswahl nicht verändert. Die frühere Prüfung „Vorab-Wiederholung“ entfällt, weil es sie nicht mehr gibt.

Offen (Nutzer, auf dem Handy): „Für heute geschafft“ und „10 weitere neue Karten“ einmal im echten Ablauf über einen Tag (Tageslimit über mehrere Sitzungen, zweite Richtung eines Worts frühestens am Folgetag).
