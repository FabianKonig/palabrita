# Abnahme: Lernsitzung

Prüft das Modell aus `docs/SPEC.md` §3.1, §11, §12, §14.1.

**Prüfumgebung:** Linux (Cloud-Container), Node 24, `npm run build` + `vite preview` auf `http://localhost:4173`, Chromium (headless, DevTools-Protokoll, `scripts/browser-smoke.ts`, 58 Prüfungen; die beiden Wortsuche-Prüfungen brauchen Netz zu de.wiktionary.org und schlagen ohne Netz oder bei Rate-Limits (HTTP 429) fehl, im Cloud-Container ohne Zugang zu Wiktionary also 56 von 58 bestanden). Dazu `npm run lint`, `npm test` (Vitest), `npm run build`, `npm run validate:vocab`.

| # | Kriterium | Ergebnis | Nachweis |
|---|---|---|---|
| 1 | Zwei Buttons „Nochmal“ / „Gewusst“ mit Vorschau (Min, Std, T) | **bestanden** | `srs.test.ts` (`previewIntervals`, `formatInterval`), Smoke-Test bewertet mit „Gewusst“ |
| 2 | Lernphase, Rückfall, Wiederholungsphase, Ease 1,3 bis 3,0, 03:59/04:00 | **bestanden** | `srs.test.ts` (Tabelle aus §11, Ease-Kappung 3,4 auf 3,0, Intervallfolge 1, 3, 8, 21, 56) |
| 3 | Vorab-Wiederholung: „Gewusst“ ändert nichts, „Nochmal“ ist harter Rückfall | **teilweise**: Logik per Unit-Test (`review` gibt dieselbe Karte zurück, Rückfall 1 T, `lapses` +1, `reps` 0). Dass `Study.tsx` dann nicht speichert und nur „Geübt: N“ steigt, folgt aus dem Code (`updated !== base`), ein eigener Browser-Test dafür fehlt | `srs.test.ts` |
| 4 | `pickNext`: Stufen 1 bis 5, `MAX_LEARNING` 25, Partnerkarten, `lastShown`, Durchlauf | **bestanden** | `queue.test.ts` |
| 5 | Endlose Sitzung: kein Tageslimit, kein „Fertig für heute“, kein Wartezähler | **bestanden** | Smoke-Test: 20 Bewertungen hintereinander, „Geübt: 20“ |
| 6 | Karte beliebig oft umdrehen, Buttons bleiben | **bestanden** | Smoke-Test (zweimal umdrehen) |
| 7 | Verb-Overlay: „Konjugation“ erst nach dem Aufdecken, Tabelle, Escape, gleiche Karte | **bestanden** (Zurück-Taste und Fokusfalle nicht automatisch geprüft, siehe unten) | Smoke-Test |
| 8 | „Nochmal“ kommt nach 5 Min wieder, vor neuen Karten | **bestanden** | Smoke-Test mit Uhr-Offset (`Date.now`), Ausgangslage mit einer Karte in der Wiederholphase |
| 9 | „Beenden“ zeigt Zusammenfassung, Neuladen behält Fortschritt | **bestanden** | Smoke-Test |
| 10 | Export und Import (Ersetzen, Zusammenführen, Karten ohne `step`) | **bestanden** | `exportImport.test.ts` |
| 11 | Einstellungen ohne „Neue pro Tag“, Lernen-Seite ohne Zähler und Serie (Streak) | **bestanden** | Smoke-Test |

## Offen, manuell durch den Nutzer

- [ ] Zurück-Taste des Geräts schließt nur das Verb-Overlay, die Sitzung bleibt
- [ ] Tab-Taste bleibt im Overlay gefangen, Fokus kehrt zum Button „Konjugation“ zurück
- [ ] Auto-Vorlesen spricht je Karte genau einmal (mit spanischer Stimme hörbar), nach Einschalten im Lernen-Schalter
- [ ] Vorab-Wiederholung auf einem Gerät mit echtem Lernstand: „Gewusst“ lässt Intervall und Fälligkeit unverändert
- [ ] Bedienung auf dem Handy: Bottom-Sheet, Buttons gut erreichbar
