# Palabrita – Offene Aufgaben

Diese Datei führt nur, was noch zu tun ist. Erledigtes steht in `docs/SPEC.md`, der Verlauf in der Git-Historie. Wird ein Punkt erledigt, kommt das Ergebnis in die Spezifikation und der Punkt hier raus.

## Anforderungen ohne Detailspezifikation

Für jeden Punkt zuerst die Spezifikation schreiben (mit dem Nutzer klären), dann umsetzen.

- [ ] **Überarbeitung der Kartenauswahl** (`pickNext`): SPEC §12.1a.
- [ ] **Bottom-Sheet per Wischgeste schließen** (Verb-Overlay): SPEC §14.1.
- [ ] **Formsuche** (gebeugte Formen im Verzeichnis finden): `docs/FORMSUCHE.md`, Einordnung in SPEC §3.3.
- [ ] **Deutsch-Suche, offene Fragen** (Treffer kenntlich machen, Prüfung beim Hinzufügen, mehrere Treffer): SPEC §3.3.

## Prüfungen und Entscheidungen des Nutzers

- [ ] **Manuelle Abnahme** auf dem Handy und mit echtem Lernstand: Liste am Ende von `docs/ABNAHME.md`.
- [ ] **Impressum:** Welche Pflichtangaben gelten für eine nicht-kommerzielle Lern-App (SPEC §14.2)?
- [ ] **Menschliche Prüfung der Vokabeln** (SPEC §17).
- [ ] **Lizenz des Repos:** Wird das Repo öffentlich, vorher die Herkunft der Vokabeln und eine `LICENSE`-Datei klären. Das ist eine Entscheidung des Nutzers, keine `LICENSE`-Datei eigenmächtig anlegen.

## Hinweise

- Bekannte Einschränkung: Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten für den Nutzer mehrdeutig. In v1 nicht behandelt.
- Verworfen: eine Docker-Image-Variante (GHCR, `docker compose pull` auf einem VPS). Nicht umsetzen, die App läuft über GitHub Pages.
- Annahmen, die ein Agent bei Unklarheit trifft, kommen als kurzer Eintrag in diesen Abschnitt.
