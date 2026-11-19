# Palabrita – Offene Aufgaben

Diese Datei führt nur, was noch zu tun ist. Erledigtes steht in `docs/SPEC.md`, der Verlauf in der Git-Historie. Wird ein Punkt erledigt, kommt das Ergebnis in die Spezifikation und der Punkt hier raus.

## Anforderungen ohne Detailspezifikation

Für jeden Punkt zuerst die Spezifikation schreiben (mit dem Nutzer klären), dann umsetzen.

- [ ] **Überarbeitung der Kartenauswahl** (`pickNext`): SPEC §12.1a.
- [ ] **Formsuche** (gebeugte Formen im Verzeichnis finden): `docs/FORMSUCHE.md`, Einordnung in SPEC §3.3.

## Prüfungen und Entscheidungen des Nutzers

- [ ] **Menschliche Prüfung der Vokabeln** (SPEC §17).

## Hinweise

- Bekannte Einschränkung: Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten für den Nutzer mehrdeutig. In v1 nicht behandelt.
- Verworfen: eine Docker-Image-Variante (GHCR, `docker compose pull` auf einem VPS). Nicht umsetzen, die App läuft über GitHub Pages.
- Annahme (Vorabprüfung beim Hinzufügen, SPEC §3.5): Mindestlänge 2 Zeichen und höchstens 5 angezeigte Treffer hat der Nutzer nicht festgelegt, sie verhindern eine fast immer volle Liste bei 1 Zeichen. Bei Bedarf anpassen.
- Annahmen, die ein Agent bei Unklarheit trifft, kommen als kurzer Eintrag in diesen Abschnitt.
