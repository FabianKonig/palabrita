# Palabrita – Offene Aufgaben

Diese Datei führt nur, was noch zu tun ist. Erledigtes steht in `docs/SPEC.md`, der Verlauf in der Git-Historie. Wird ein Punkt erledigt, kommt das Ergebnis in die Spezifikation und der Punkt hier raus.

## Anforderungen ohne Detailspezifikation

Für jeden Punkt zuerst die Spezifikation schreiben (mit dem Nutzer klären), dann umsetzen.

- [ ] **Überarbeitung der Kartenauswahl** (`pickNext`): SPEC §12.1a.
- [ ] **Formsuche** (gebeugte Formen im Verzeichnis finden): `docs/FORMSUCHE.md`, Einordnung in SPEC §3.3.
- [ ] **Erklärvideo der App** (KI-erzeugt, zeigt alle Funktionen): Anforderung aufgenommen (2026-11-19), Spezifikation fehlt noch (Umfang, Länge, Format, Sprache, Erzeugungsweg, Ablage). Erst mit dem Nutzer klären, dann spezifizieren. Die App selbst bleibt davon unberührt.

## Prüfungen und Entscheidungen des Nutzers

- [ ] **Menschliche Prüfung der Vokabeln** (SPEC §17).
- [ ] **Subdomain für GitHub Pages anlegen**: Der Nutzer legt eine Subdomain an, die auf die GitHub-Pages-Seite des Projekts zeigt (DNS-Eintrag beim Domain-Anbieter, Custom Domain in den Pages-Einstellungen des Repos). Empfehlenswert ist zusätzlich eine `CNAME`-Datei unter `public/`, damit die Domain bei jedem Deploy erhalten bleibt (die Workflow-Datei `.github/workflows/pages.yml` ist dafür zu prüfen). Offen: gewünschter Subdomain-Name und Basis-Domain. Nach Umstellung Impressum und Datenschutz (Hosting-Angaben in `src/features/legal/`) prüfen.

## Hinweise

- Bekannte Einschränkung: Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten für den Nutzer mehrdeutig. In v1 nicht behandelt.
- Verworfen: eine Docker-Image-Variante (GHCR, `docker compose pull` auf einem VPS). Nicht umsetzen, die App läuft über GitHub Pages.
- Annahmen, die ein Agent bei Unklarheit trifft, kommen als kurzer Eintrag in diesen Abschnitt.
