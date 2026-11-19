# Palabrita: Spezifikation

Einzige Quelle der Wahrheit für Funktion und Technik der App. **Teil A** beschreibt, *was* die App tut (Anforderungen, Vokabel- und Verbformat). **Teil B** legt fest, *wie* sie gebaut ist (Stack, Datenmodell, Lernmodell, Deployment).

Begleitdokumente: `docs/TASKS.md` (offene Aufgaben), `docs/vocab-plan.md` (Themenplan und Kontingente der Vokabeln).

**Status:** Die neue Lernsitzung (zwei Bewertungen, endlose Sitzung, Verb-Overlay, T16 bis T20) ist umgesetzt. Die früheren Status-Hinweise „offen“ sind entfernt.

---

# Teil A: Anforderungen

## 1. Ziel

Eine Vokabel-Lern-App für Spanisch, mit Fokus auf Reise-Alltag, Kultur und Orte in Mexiko und Guatemala. Sie enthält 800 Startvokabeln mit Zusatzinfos, insbesondere zur Konjugation der Verben.

## 2. Entscheidungen aus der Anforderungsklärung

| Thema | Entscheidung |
|---|---|
| Plattform | Web-App als **PWA** (im Browser, aufs Handy installierbar, offline nutzbar) |
| Nutzer / Level | **Ein Nutzer pro Browser, keine Profile** (entschieden). Niveaustufen A1 bis B1 sind einstellbar. |
| Lernmodi v1 | **Karteikarten** und **Spaced Repetition** (zwei Bewertungsbuttons, endlose Sitzung, siehe §3.1) |
| Inhalte | Reise-Alltag, Kultur & Orte, Audio-Aussprache |
| Vokabeln | **800 Startvokabeln**, von Claude generiert, mit Zusatzinfos |
| Speicherung | **Nur lokal im Browser**, kein Server, kein Login |
| Design | Mexiko/Guatemala-Farbwelt, mobile-first |
| Länderunterscheidung | **Keine** (ein gemeinsames Vokabelset) |
| Eigene Vokabeln | Der Nutzer kann ein aufgeschnapptes Wort eingeben. Die App **sucht es online (de.wiktionary.org)**, zeigt einen editierbaren Vorschlag und fügt es nach Bestätigung der Vokabelliste hinzu. Das ist die **einzige Ausnahme** vom Offline-Prinzip, siehe §3.5. |
| Mehrere Übersetzungen | Eine Vokabel kann **1 bis 4 deutsche Wörter** haben (`de` ist eine Liste). Alle stehen auf der deutschen Kartenseite. |
| Kartenrichtung & SRS | **Getrennter SRS-Zustand je Richtung** (DE→ES und ES→DE sind je eigene Karten mit eigenem Intervall, Ease und Fälligkeit). Die Statistik zählt Karten je Richtung. |
| Niveau-Konfiguration | Es wird ein **maximales Niveau** (A1, A2, B1) eingestellt. Es werden nur Vokabeln dieses Niveaus **und darunter** angezeigt (neue Karten, fällige Karten, Verzeichnis). Die Einstellung wird **persistent in den Einstellungen** gespeichert. Wird das Niveau gesenkt, bleibt der Fortschritt höherer Karten erhalten, sie werden nur ausgeblendet. |
| Projektstruktur | Das Projekt liegt **direkt im Repo-Root** (`package.json`, `.github/workflows/`, `src/`, `public/` usw.). Dokumentation liegt in `docs/`. |
| PWA-Updates | **Hinweis mit Button**: Ein Banner „Neue Version verfügbar – neu laden“ erscheint. Es wird nicht mitten in einer Lernsitzung automatisch neu geladen (`registerType: 'prompt'`). |

Nicht in v1: Multiple-Choice-Quiz, Tipp-Abfrage, Cloud-Konten, Regionalismen-Filter (MX/GT), Sync zwischen Geräten.

## 3. Funktionale Anforderungen

### 3.1 Lernen

> Der Absatz beschreibt die Lernsitzung. Technische Details: §11 (Lernmodell), §12 (Kartenauswahl), §14.1 (Bedienung).

- **Karteikarten:** Vorderseite Deutsch, Rückseite Spanisch (Richtung im Tab „Lernen“ wählbar). Die Karte lässt sich per Tipp **beliebig oft** umdrehen. Hat eine Vokabel mehrere deutsche Wörter, stehen **alle** auf der deutschen Seite, getrennt durch „ · “ (z. B. *Auto · Wagen*). Das erste Wort ist die Hauptübersetzung. Bei Verben steht auf der spanischen Seite (egal in welcher Richtung) unter dem Wort in einer eigenen, kleineren grauen Zeile der Klammerzusatz der Notation (§5.1), z. B. *(ie)*, *(e → ie, -go, Pretérito/Futuro irr.)*, *(c → qu)*, *(irr.)*; regelmäßige Verben haben keine Zeile. Bei Nomen steht auf der spanischen Seite unter dem Singular (mit Artikel) der Plural in kleinerer grauer Schrift, z. B. *el saludo* / *los saludos*, sofern eine Pluralform hinterlegt ist. Aussprache und Suche nutzen weiter nur das Wort.
- **Bewertung mit zwei Buttons:** **Nochmal** (nicht gewusst) und **Gewusst**. Jeder Button zeigt, wann die Karte wiederkommt („5 Min“, „1 T“, „8 T“ …).
- **Endlose Sitzung:** Es gibt **kein Tageslimit** und kein „Fertig für heute“. Der Nutzer lernt so lange er will und beendet selbst über „Beenden“ (zeigt eine Zusammenfassung). Jede Bewertung wird sofort gespeichert. Ist alles durch, beginnt ein neuer Durchlauf.
- **Spaced Repetition:** Nicht gewusste Wörter kommen **nach Minuten** wieder, sicher gewusste immer seltener. Pro Karte werden Fälligkeit, Intervall, Ease-Faktor und Lernschritt gespeichert (§11).
- **Konjugation aus der Sitzung:** Bei Verben öffnet ein Klick auf „Konjugation“ (erst nach dem Aufdecken) ein Overlay mit der Formentabelle, ohne die Sitzung zu verlassen.
- **Audio-Aussprache:** Browser-Sprachausgabe (Web Speech API, `speechSynthesis`) mit Stimme `es-MX`, Fallback `es-ES`/`es`. Ein Lautsprecher-Button steht auf jeder Karte. Automatisches Vorlesen (einmal je Karte) lässt sich in der Lernsitzung manuell einschalten; es ist standardmäßig aus, gilt nur für diese Sitzung und wird nicht gespeichert. Wenn keine spanische Stimme verfügbar ist, erscheint ein Hinweis.
- **Filter:** nach Thema, Niveau (A1/A2/B1), Wortart (Verb, Nomen, …).

### 3.2 Einstellungen und Datensicherung
- Es gibt **keine Profile und kein Login**: Fortschritt und Einstellungen gelten für den Browser auf diesem Gerät.
- Einstellungen: **maximales Niveau** (A1/A2/B1, nur dieses und niedrigere Niveaus werden angezeigt, persistent gespeichert, jederzeit änderbar) und Theme (System/Hell/Dunkel). Die Version steht nicht hier, sondern unter „Mehr“ (unter „Einstellungen“ und „Legende“): Zeitstempel des HEAD-Commits zum Bauzeitpunkt (bei Deployment also des Merges auf `main`), beim Build aus Git in `vite.config.ts` eingesetzt, immer in UTC. Eine Einstellung „neue Karten pro Tag“ gibt es nicht mehr.
- Fortschritt exportieren und importieren (JSON-Datei), damit nichts verloren geht, wenn Browserdaten gelöscht werden. Import wahlweise **ersetzen** oder **zusammenführen**. Beim Zusammenführen gewinnt je Karte der Stand mit der neueren letzten Bewertung, die lokalen Einstellungen bleiben unverändert (Details: §10.1b). Ältere Exportdateien (mit `newPerDay`, ohne `step`) bleiben importierbar.

### 3.3 Übersicht und Statistik
- Die Lernen-Seite ist die Startseite (Tab „Lernen“, Route `/`). Sie zeigt keine Zähler und keine Serie. Sie bietet Thema, Niveau, Wortart und Richtung (nur für die Sitzung) und den Button „Starten“. Ohne Auswahl startet eine Sitzung über alle Themen.
- Statistik: gelernte Karten, Verteilung nach Reifegrad (neu, lernend, gefestigt), je Kartenrichtung und nur für das eingestellte Niveau.
- Durchsuchbares **Vokabelverzeichnis** mit Detailansicht inkl. aller Zusatzinfos.
- **Deutsch-Suche (Anforderung 2026-11-19):** Im Verzeichnis lässt sich nach einem deutschen Wort suchen. Die Suche findet alle Vokabeln, deren deutsche Übersetzung (alle `de`-Einträge) den Begriff enthält, und zeigt das spanische Wort, damit der Nutzer sieht, ob er es schon hat. Die Suche über `de` ist umgesetzt (§14). Offen für die Spezifikation: (a) soll der Treffer kenntlich machen, dass er über die deutsche Übersetzung kam (z. B. welche `de`-Form passt); (b) soll die Wortsuche unter „Neues Wort hinzufügen“ (§3.5) ebenfalls deutsche Eingaben gegen die eigene Datenbank prüfen und „Schon vorhanden: <spanisch>“ zeigen, bevor im Wörterbuch nachgeschlagen wird; (c) Verhalten bei mehreren Treffern und bei Wörtern außerhalb des eingestellten Niveaus.

### 3.4 PWA
- Web-Manifest, Icons, Service Worker (App-Shell und Vokabeldaten gecacht), komplett offline nutzbar (Ausnahme: das Nachschlagen eigener Wörter braucht Netz, siehe 3.5).

### 3.5 Eigene Vokabeln hinzufügen (Wortsuche)

Der Nutzer gibt ein spanisches Wort ein, das er irgendwo aufgeschnappt hat. Es wird nachgeschlagen und der Vokabelliste hinzugefügt. Danach lässt es sich wie jede andere Vokabel lernen.

**Ablauf (Screen `/add`):**
1. Eingabefeld „Spanisches Wort“ und Button „Nachschlagen“. Aufrufbar nur über den Button „Neues Wort hinzufügen“ **am Ende der Trefferliste im Verzeichnis**, der **immer** sichtbar ist (auch bei Treffern, z. B. um dasselbe Wort mit anderer Wortart als weitere Karte anzulegen). Ein Text im Suchfeld des Verzeichnisses wird übernommen.
2. **Nachschlagen** in der deutschen Wiktionary (`de.wiktionary.org`, MediaWiki-API, ohne Schlüssel). Nur auf Knopfdruck, es wird ausschließlich das eingegebene Wort gesendet. Findet die deutsche Wiktionary das Wort nicht, fragt die App `es.wiktionary.org` ab (nur Wortart und Genus, die deutsche Bedeutung trägt der Nutzer ein, die App weist darauf hin). Ergebnis: Wortart, deutsche Bedeutungen (maximal die ersten 4), bei Nomen Genus und Plural, falls vorhanden, ein Beispielsatz, falls vorhanden.
   - Gibt es mehrere Wortarten (z. B. *llama*: Nomen und Verbform), wählt der Nutzer eine.
   - Ist die Eingabe eine **gebeugte Form** (z. B. *puedo*), bietet die App die **Grundform** an (*poder*).
3. **Vorschau-Formular, vollständig editierbar:** spanisches Wort (mit Artikel bei Nomen), 1–4 deutsche Wörter (entfernen, ergänzen, ändern), Wortart, Genus/Plural, Hinweis, optionaler Beispielsatz. Bei **Verben** wählt der Nutzer die Tags (`ie`, `ue`, `go` …, siehe §5.1) und sieht die erzeugte Formentabelle als Kontrolle. Ohne Tags wird das Verb als regelmäßig behandelt. Solche Verben tragen den Hinweis „Formen automatisch erzeugt, nicht geprüft“.
4. **„Zur Vokabelliste hinzufügen“** speichert die Vokabel. Kein Treffer, kein Netz oder Fehler der Suche: das Formular erscheint leer zum **manuellen Ausfüllen** („Nichts gefunden, bitte selbst eintragen“). Die App funktioniert ohne Netz weiter, nur das Nachschlagen entfällt.
5. **Dublettenprüfung:** Existiert das spanische Wort (ohne Artikel, ohne Beachtung von Groß-/Kleinschreibung, **Akzente zählen**) mit **derselben Wortart** schon, erscheint „Schon vorhanden“ mit Link zur Vokabel, doppeltes Anlegen wird verhindert. Gibt es nur ein gleiches Wort anderer Wortart oder eines, das sich nur im Akzent unterscheidet (*papa/papá*, *te/té*, *el poder/poder*), erscheint der Warnhinweis „Ähnliches Wort vorhanden“ mit Link, Anlegen bleibt möglich.

**Eigenschaften eigener Vokabeln:**
- Sie liegen **nur im Browser** (IndexedDB), nicht in den statischen Dateien, und sind im **Export/Import** enthalten.
- ID: `u` plus zufälliger Teil (z. B. `u8k2m4qz`), damit zwischen Geräten keine Kollisionen entstehen. Feld `createdAt`.
- Thema: **„Eigene Wörter“** (eigener Filter). Niveau: **keins** (`level: null`). Eigene Wörter werden deshalb **unabhängig vom eingestellten Maximalniveau immer angezeigt**.
- In der Lernsitzung kommen neue eigene Wörter **vor** den neuen Standardvokabeln (nach `createdAt`), die Begrenzung gleichzeitiger Lernkarten (§12) gilt weiterhin.
- Eigene Wörter lassen sich in der Detailansicht **bearbeiten und löschen** (Löschen entfernt auch ihre Karten, mit Rückfrage).
- Der Beispielsatz ist bei eigenen Wörtern optional.

**Datenschutz und Offline-Prinzip:** Nur beim Nachschlagen verlässt das eingegebene Wort das Gerät und geht an `de.wiktionary.org`, bei Misserfolg an `es.wiktionary.org`. Der Service Worker cached diese Anfragen nicht. Keine Tracker, keine weiteren Dienste. Wiktionary-Inhalte stehen unter CC BY-SA, die README nennt die Quelle (Wiktionary de/es, CC BY-SA).

## 4. Vokabeln: Umfang und Datenmodell

### 4.1 Umfang (800 Einträge, Richtwert)
- Ca. 100 Verben, ca. 250 Nomen, ca. 80 Adjektive/Adverbien/sonstige Wörter (Zahlwörter, Präpositionen, Pronomen, Konjunktionen), ca. 70 Redewendungen und Floskeln. Die Aufteilung darf angepasst werden. Verbindlich ist der Plan in `docs/vocab-plan.md`.
- Die 25 Seed-Vokabeln (`v0001–v0025`) zählen zu den 800 und behalten ihre IDs.
- Themen: Begrüßung & Höflichkeit, Zahlen & Zeit, Essen & Trinken (inkl. mexikanische und guatemaltekische Gerichte), Transport & Bus, Unterkunft, Einkaufen & Geld, Gesundheit & Notfall, Wetter & Natur (Vulkane, Seen, Strand), Orte, Kultur & Feste, Maya-Welt, Smalltalk, Grundwortschatz (häufigste Wörter laut Frequenzlisten, viele Verben).
- Niveaus: A1 bis B1.
- Spanisch in der **lateinamerikanischen Variante**. Bei Abweichungen vom Spanien-Spanisch (z. B. *carro* statt *coche*, *camión* für Bus in Mexiko, *jugo* statt *zumo*) gilt die lateinamerikanische Form. Typische Mexikanismen oder Guatemaltekismen werden im Hinweisfeld genannt, aber nicht gefiltert.

### 4.2 Datenmodell (JSON-Datei, statisch ausgeliefert)

```json
{
  "id": "v0042",
  "de": ["können", "in der Lage sein"],
  "es": "poder",
  "pos": "verb",
  "level": "A1",
  "topic": "einkaufen",
  "example": { "es": "¿Puedo pagar con tarjeta?", "de": "Kann ich mit Karte bezahlen?" },
  "note": "Freitext, z. B. regionale Verwendung",
  "gender": null,
  "plural": null,
  "verb": {
    "tags": ["ue"],
    "reflexive": false,
    "overrides": {
      "indefinido": { "1s": "pude", "2s": "pudiste", "3s": "pudo", "1p": "pudimos", "2p": "pudisteis", "3p": "pudieron" },
      "futuro": { "stem": "podr" },
      "gerundio": "pudiendo"
    }
  }
}
```

Das Verb-Objekt enthält **nur** `tags`, `reflexive` und `overrides`. Der Infinitiv steht in `es`, die Endung (-ar/-er/-ir) ergibt sich daraus. Notation, `regularity`, Unregelmäßigkeitstypen und alle regelmäßigen Formen werden vom Konjugationsmodul **berechnet** (siehe §5.1), nicht gespeichert.

Regeln:
- `de` ist eine **Liste mit 1 bis 4 nichtleeren, voneinander verschiedenen Einträgen**. Das erste ist die Hauptübersetzung. Mehrere Einträge nur, wenn das Spanische wirklich mehrere gebräuchliche deutsche Entsprechungen hat (z. B. *carro*: `["Auto", "Wagen"]`), nicht für beliebige Synonyme. Der deutsche Beispielsatz `example.de` bleibt ein einzelner Text.
- Nomen: `gender` (`m`/`f`/`m/f`) und `plural`. Das Spanische erscheint mit Artikel (*el autobús*). Unregelmäßige Plurale werden gekennzeichnet.
- Adjektive: `es` steht in der maskulinen Singularform. Optional `adj: { "f": "...", "pl": "...", "fpl": "..." }` für Formen, die nicht der Standardbildung folgen (Standard: -o → -a/-os/-as, sonst +s/+es). Das Feld ist nur bei `pos: "adj"` erlaubt.
- Wortarten (`pos`): `verb`, `noun`, `adj`, `adv`, `num` (Zahlwörter), `phrase`, `other` (Präposition, Pronomen, Konjunktion u. ä.).
- Das Feld `topic` ist einer der 13 Themen-Schlüssel aus `public/vocab/index.json` (siehe §10.1).
- `verb` ist bei **jedem** Verb Pflicht (mindestens `{ "tags": [], "reflexive": false }` für ein regelmäßiges Verb) und bei allen anderen Wortarten leer.
- Jede Vokabel hat mindestens einen Beispielsatz (Spanisch plus Deutsch).

## 5. Zusatzinfos zu Verben: Notation der Unregelmäßigkeiten

Zu jedem Verb soll klar erkennbar sein, **ob und wie** es unregelmäßig ist. Die übliche Schreibweise in Wörterbüchern und Lehrbüchern ist ein **Klammerzusatz hinter dem Infinitiv**:

| Notation | Bedeutung | Beispiel |
|---|---|---|
| *(e → ie)* | Stammwechsel e → ie in den betonten Formen (yo, tú, él, ellos im Präsens), **nicht** bei nosotros/vosotros | *querer (e → ie)*: quiero, quieres, quiere, queremos, queréis, quieren |
| *(o → ue)*, *(u → ue)* | Stammwechsel o → ue (bei *jugar* u → ue), gleiche Formen | *poder (o → ue)*: puedo, podemos |
| *(e → i)* | Stammwechsel e → i (nur -ir-Verben), auch im Pretérito (3. Person) und Gerundio | *pedir (e → i)*: pido, pidió, pidiendo |
| *(e → ie, e → i)* | e → ie im Präsens, e → i im Pretérito/Gerundio | *sentir*: siento, sintió, sintiendo |
| *(o → ue, o → u)* | o → ue im Präsens, o → u im Pretérito/Gerundio | *dormir*: duermo, durmió, durmiendo |
| *(-go)* | 1. Person Singular Präsens mit -g- (Subjuntivo/Imperativ bauen darauf auf); weitere Abweichungen stehen als eigene Angaben | *hacer (-go)*: hago; *salir (-go)*: salgo |
| *(-zco)* | 1. Person Singular auf -zco | *conocer (-zco)*: conozco |
| *(-oy)* | 1. Person Singular auf -oy | *dar (-oy)*: doy; *estar*: estoy |
| *(i → y)* | -uir-Verben: i → y zwischen Vokalen | *construir (i → y)*: construyo, construyó |
| *(Pretérito irr.)*, *(Futuro irr.)*, *(Pretérito/Futuro irr.)* | Unregelmäßiger Stamm im Pretérito bzw. Futuro (Overrides) | *tener*: tuve; tendré |
| *(c → qu)*, *(z → c)*, *(g → gu)*, *(g → j)*, *(gu → gü)*, *(gu → g)*, *(c → z)* | **Orthographische Änderung** zur Erhaltung des Lautes, nicht wirklich unregelmäßig | *buscar*: busqué; *empezar*: empecé; *coger*: cojo |
| *(irr.)* | Stark unregelmäßig, Formen vollständig angeben | *ser*, *ir*, *haber* |

### 5.1 Verb-Datenformat (entschieden)

Pro Verb werden nur gespeichert: `tags`, `reflexive`, `overrides`. Alles andere berechnet das Konjugationsmodul. Eine Quelle der Wahrheit pro Verb.

**`tags`** (Array, feste Werte, Reihenfolge egal): `ie`, `ue`, `i`, `ie-i`, `ue-u`, `go`, `zco`, `oy`, `y`, `irr`. Sie entsprechen den Notationen der Tabelle oben. Das Modul erzeugt daraus die Formen:
- `ie`/`ue`/`i`/`ie-i`/`ue-u`: Stammwechsel im Presente (betonte Formen), bei `i`/`ie-i`/`ue-u` zusätzlich Pretérito (3. Person) und Gerundio. `ue` deckt auch *jugar* (u → ue) ab, mit einer Sonderregel im Modul.
- `go`/`zco`/`oy`: 1. Person Singular im Presente (*tengo*, *conozco*, *doy*). `go` und `zco` ändern auch den Stamm im Presente-Subjuntivo, der für den Imperativ gebraucht wird.
- `y`: -uir-Verben (*construyo*, *construyó*, *construyendo*).
- `irr`: stark unregelmäßig (*ser*, *ir*, *haber*). Es gibt keine Stammwechsel-Generierung, es gilt nur das regelmäßige Grundmuster. In `overrides` stehen wie bei allen Verben **nur die Formen, die vom Grundmuster abweichen** (beim Futuro von *ser* z. B. nichts, da *seré* regelmäßig gebildet wird). Das Konjugationsmodul wird für `irr`-Verben gegen die vollständige Referenzliste getestet, damit keine Form fehlt.
- **Rechtschreibänderungen** (*busqué*, *empecé*, *llegué*, *cojo*) braucht niemand zu taggen. Das Modul erkennt sie automatisch am Wortende und zeigt sie als `(c → qu)` usw.

**`overrides`** enthält nur Formen, die sich nicht aus den Tags ergeben (starke Pretérito-Stämme wie *pude*/*tuve*, unregelmäßige Futurstämme wie *podré*, unregelmäßige Imperative wie *ten*/*haz*):
- Zeitschlüssel: `presente`, `indefinido`, `imperfecto`, `futuro`, `imperativo`.
- Personenschlüssel: `1s` (yo), `2s` (tú), `3s` (él/ella/usted), `1p` (nosotros), `2p` (vosotros), `3p` (ustedes/ellos). Der Imperativ kennt nur `2s`, `3s`, `1p`, `2p`, `3p`.
- Eine Zeit kann **einzelne** Personen überschreiben (`{ "1s": "..." }`) oder, nur bei `futuro` (und `condicional`, falls später), den Stamm (`{ "stem": "podr" }`).
- `participio` und `gerundio` sind Strings.
- Ein Override ersetzt die berechnete Form. Es werden keine Formen wiederholt, die schon richtig generiert würden.

**Berechnet** (für UI und Statistik):
- `notation`: Infinitiv plus Klammerzusatz in fester Reihenfolge, z. B. *poder (ue)*, *tener (e → ie, -go, Pretérito/Futuro irr.)*, *buscar (c → qu)*, *ser (irr.)*.
- `regularity` (ein einzelner Wert, der „schwerste“ zutreffende): `irregular`, wenn das Tag `irr` gesetzt ist **oder** `overrides` für `indefinido`, `imperfecto` oder `futuro` existieren (starke Stämme wie *pude*, *tuve*, *podré*). Sonst `stem-change`, `yo-irregular`, `orthographic` oder `regular`. Overrides allein für `imperativo`, `participio` oder `gerundio` ändern `regularity` nicht.
- `irregularity_types`: Liste aller zutreffenden Typen: `stem-change`, `yo-irregular`, `orthographic`, `strong-stem` (Overrides auf `indefinido`/`imperfecto`/`futuro`), `irregular` (Tag `irr`). Mischformen sind möglich (*tener*: `yo-irregular`, `stem-change`, `strong-stem`). Die **Notation** (Klammerzusatz) bleibt davon unberührt und nennt nur die Tags, z. B. *poder (ue)*. Starke Stämme sieht man in der farbigen Formentabelle und am Etikett „unregelmäßig“.
- **Hervorhebung:** Jede Form, die vom regelmäßigen Muster abweicht, ist in der Tabelle farbig. Dazu vergleicht das Modul die endgültige Form mit der rein regelmäßigen. Dafür wird nichts gepflegt.

**Validierung (`npm run validate:vocab`):**
- Ein Verb ohne Tags und ohne Overrides ist regelmäßig. Ein Verb mit `overrides` oder Tags muss tatsächlich von der Regel abweichen.
- Ein Override, der der generierten Form entspricht, ist ein Fehler (Redundanz).
- Ein Tag muss zum Stamm passen (`ue` braucht ein `o` oder `u` im Stamm, `ie`/`i` ein `e`, `y` ein Verb auf -uir usw.).
- Schlüssel (Zeiten, Personen, Tags) müssen aus den erlaubten Listen stammen.
- `reflexive` muss zur Endung passen: `true` genau dann, wenn `es` auf *-se* endet.
- Bei Nomen mit Artikel in `es` muss der Artikel zu `gender` passen (*el* → `m`, *la* → `f`, *el/la* → `m/f`).
- `verb` ist bei `pos: "verb"` vorhanden, sonst nicht.
- Dubletten: gleiche normalisierte Form (ohne Artikel, **mit** Akzent) und gleiche Wortart sind ein Fehler. Gleiche Form bei anderer Wortart oder nur im Akzent verschieden ist eine **Warnung** (*papa/papá*).
- Das Konjugationsmodul wird zusätzlich gegen eine **Referenzliste bekannter Verben mit allen Formen** getestet (siehe unten).

Zusätzlich gilt für jedes Verb:
- **`regularity`** (berechnet) mit einem dieser Werte: `regular`, `stem-change` (Diphthongierung/Vokalschwächung), `yo-irregular` (nur 1. Person Singular), `orthographic` (Rechtschreibänderung), `irregular` (stark unregelmäßig, auch bei starken Stämmen, siehe oben). Mischformen werden über `irregularity_types` erfasst, z. B. *tener*: `yo-irregular`, `stem-change` und `strong-stem`.
- **Formen-Tabelle** in der Detailansicht: Presente, Pretérito indefinido, Imperfecto, Futuro, Participio, Gerundio, Imperativ. Die **unregelmäßigen Formen sind farblich hervorgehoben**. Die Tabelle zeigt immer alle sechs Personen: yo, tú, él/ella/usted, nosotros, vosotros (mit Hinweis „in Lateinamerika unüblich“), ustedes/ellos.
- **Regelmäßige Verben** bekommen nur das Etikett „regelmäßig (-ar/-er/-ir)“ und die Endungen. Die Formen werden **generiert** und müssen nicht einzeln gepflegt werden. Bei unregelmäßigen Verben stehen die Tags und die abweichenden Formen (`overrides`) im Datensatz. Das Konjugationsmodul wird durch Unit-Tests gegen bekannte Verben mit vollständigen Referenzformen abgesichert (*hablar, comer, vivir, poder, pedir, sentir, dormir, tener, conocer, construir, dar, ser, ir, buscar, empezar, llegar*; mindestens Presente, Pretérito, Futuro, Gerundio, Participio, Imperativ).
- **Reflexive Verben** werden mit *-se* geführt (*llamarse*) und mit Reflexivpronomen konjugiert.
- Kleine Erklärlegende („Was bedeutet (ie)?“) in der App, erreichbar über ein Info-Symbol.

## 6. Hinweise zur Variante Lateinamerika

- **Vosotros** wird in Lateinamerika nicht verwendet. Es gibt *ustedes* statt *vosotros*. Die vosotros-Form wird trotzdem **immer in den Formentabellen angezeigt** (Entscheidung des Nutzers, kein Schalter zum Ausblenden), aber als unüblich gekennzeichnet. *Ustedes* wird in der Tabelle zusammen mit der 3. Person Plural geführt.
- **Voseo:** In Guatemala wird *vos* statt *tú* verwendet (z. B. *vos tenés*). Das ist nicht Teil von v1 (kein Länderunterschied), aber ein Hinweisfeld pro Verb oder eine Infoseite „Voseo in Guatemala“ ist ein sinnvoller Zusatz.

## 7. Nicht-funktionale Anforderungen

- **Mobile-first**, große Touch-Flächen, einhändig bedienbar, Hell- und Dunkelmodus.
- **Design:** Mexiko/Guatemala-Farbwelt (kräftige Farben wie Türkis, Magenta, Gelb, Rot, dazu Muster aus Textil- bzw. Maya-Motiven als dezentes Element). Lesbarkeit und Kontrast haben Vorrang.
- Oberfläche auf **Deutsch**.
- **Barrierefreiheit:** ausreichender Kontrast, Tastaturbedienung, Labels für Screenreader.
- **Datenhaltung:** IndexedDB, Versionierung des Datenschemas, damit spätere Vokabelupdates den Fortschritt nicht zerstören (Vokabel-IDs bleiben stabil).
- Keine Tracker, keine externen Dienste, alles offline. **Einzige Ausnahme:** das Nachschlagen eigener Wörter (§3.5), nur auf Knopfdruck.

---

# Teil B: Technik

## 8. Stack (festgelegt)

| Bereich | Wahl |
|---|---|
| Build | Vite 8, TypeScript (strict) |
| UI | React 19, `react-router-dom` mit **HashRouter** |
| Styling | Plain CSS mit CSS-Variablen (`src/styles/`), kein UI-Framework. Hell/Dunkel via `prefers-color-scheme` und `data-theme` |
| Speicher | IndexedDB über `idb` |
| PWA | `vite-plugin-pwa`, `registerType: 'prompt'` |
| Tests | Vitest für reine Logik (`srs`, `conjugation`, `day`, `queue`) und für `data/` (`cardRepo`, `exportImport`) mit `fake-indexeddb`. Keine Komponenten-Tests; UI-Verhalten (Verzeichnis-Filter und Scrollposition, Schalter, Dropdowns, Richtung im Lernen-Tab) liegt in `features/dictionary/viewState` (Vitest) und im Browser-Smoke-Test (`scripts/browser-smoke.ts`). `src/styles/global.test.ts` schützt Dunkelmodus-Kontrast, Dropdown-Pfeil und Schalter, `features/legend/notations.test.ts` stellt sicher, dass die Legende jede erzeugte Notation erklärt. |
| Dev-Tools | `tsx` (führt `scripts/validate-vocab.ts` aus), `ajv` (JSON-Schema-Validierung der Vokabeln) |
| Lint | ESLint + `typescript-eslint` Defaults, Prettier Defaults |
| Node | 24.x |

Keine weiteren Runtime-Abhängigkeiten ohne Grund (State: React `useReducer`/Context, kein Redux/Zustand).

## 9. Projektstruktur (im Repo-Root)

```
package.json  vite.config.ts  tsconfig.json  index.html
.github/workflows/pages.yml  README.md  AGENTS.md
docs/                       # SPEC.md, TASKS.md, vocab-plan.md
public/
  vocab/<thema>.json        # Vokabeln je Thema
  vocab/index.json          # Liste der Themen-Dateien + Version
  icons/                    # PWA-Icons
scripts/
  validate-vocab.ts         # Aufruf von `npm run validate:vocab`
  validateVocab.ts          # Schema/ID/Dubletten/Verbformen (+ Test)
  vocabPlan.ts              # Kontingente je Thema (maßgeblich, siehe docs/vocab-plan.md)
  vocab.schema.json         # JSON-Schema der Vokabeldateien
  make-icons.ts             # PWA-Icons aus public/icons/logo.svg
  browser-smoke.ts          # End-to-End-Test im echten Browser
src/
  main.tsx  App.tsx  routes.tsx
  domain/                   # reine Logik, KEINE React/DOM-Imports
    types.ts                # Vocab, Card, Settings, ...
    srs.ts  srs.test.ts
    day.ts  day.test.ts     # Tageswechsel 04:00
    queue.ts                # Auswahl der nächsten Karte
    conjugation/            # Konjugationsmodul (+ Tests)
    lookup/                 # parseWiktionary, findDuplicate (+ Tests, fixtures/)
  data/
    vocabRepo.ts            # lädt/cached vocab JSON + eigene Vokabeln (userVocab)
    lookup.ts               # fetch an de.wiktionary.org (einziger Netzzugriff der App)
    db.ts                   # idb-Schema, Migrationen
    settingsRepo.ts  cardRepo.ts  statsRepo.ts
    exportImport.ts
  features/
    study/  dictionary/  add/  stats/  settings/  legend/  more/
  components/               # Flashcard, Speaker, VerbTable, UpdateBanner, ...
  hooks/                    # useSpeech, useSettings, ...
  styles/
```

Regel: `domain/` ist rein und testbar. `data/` kapselt IndexedDB. `features/` enthält Screens.

## 10. Datenmodell

### 10.1 Vokabeln (statisch, JSON)
Schema wie §4.2. TypeScript-Typen in `domain/types.ts`:

```ts
type Level = 'A1' | 'A2' | 'B1';
type Pos = 'verb' | 'noun' | 'adj' | 'adv' | 'num' | 'phrase' | 'other';
const LEVEL_ORDER: Record<Level, number> = { A1: 1, A2: 2, B1: 3 }; // immer hierüber vergleichen, nie per String
// isVisible(v, maxLevel) = v.level === null || LEVEL_ORDER[v.level] <= LEVEL_ORDER[maxLevel]  (einzige Sichtbarkeitsregel, in domain/)
interface Vocab {
  id: string;            // "v0042" (statisch) oder "u8k2m4qz" (eigen), stabil, nie wiederverwenden
  de: string[];          // 1–4 Einträge, [0] = Hauptübersetzung; es: Spanisch (Nomen mit Artikel)
  es: string; pos: Pos;
  level: Level | null;   // null nur bei eigenen Wörtern: immer sichtbar, unabhängig von maxLevel
  topic: string;         // einer der 12 Schlüssel, bei eigenen Wörtern 'eigene'
  origin?: 'user';       // gesetzt bei eigenen Wörtern (IndexedDB), fehlt bei statischen
  createdAt?: number;    // nur eigene Wörter (ms)
  verified?: false;      // nur eigene Verben: Formen ungeprüft (Hinweis in der UI)
  example: { es: string; de: string } | null;  // null nur bei eigenen Wörtern erlaubt
  note?: string | null; gender?: 'm'|'f'|'m/f'|null; plural?: string | null;
  adj?: { f?: string; pl?: string; fpl?: string } | null;  // nur pos 'adj', nur abweichende Formen
  verb?: VerbData | null;   // Format: §5.1. PFLICHT bei pos 'verb' (mindestens { tags: [], reflexive: false }), sonst null/fehlt
}
type VerbTag = 'ie'|'ue'|'i'|'ie-i'|'ue-u'|'go'|'zco'|'oy'|'y'|'irr';
type Tense = 'presente'|'indefinido'|'imperfecto'|'futuro'|'imperativo';
type Person = '1s'|'2s'|'3s'|'1p'|'2p'|'3p';
interface VerbData {
  tags: VerbTag[];
  reflexive: boolean;
  overrides?: Partial<Record<Tense, Partial<Record<Person, string>> & { stem?: string }>>
    & { participio?: string; gerundio?: string };
}
```
Berechnete Werte (`notation`, `regularity`, `irregularity_types`, alle Formen mit Abweichungs-Markierung) liefert `domain/conjugation` (`conjugate(vocab) → { notation, regularity, types, tenses: Record<Tense, {form, irregular}[]> , participio, gerundio }`), sie werden nicht in den Daten gespeichert.

`public/vocab/index.json`:
```json
{ "version": 1, "topics": [ { "key": "begruessung", "label": "Begrüßung & Höflichkeit", "file": "begruessung.json" }, ... ] }
```
Feste Themen-Schlüssel (13): `begruessung`, `zahlen-zeit`, `essen`, `transport`, `unterkunft`, `einkaufen`, `gesundheit`, `natur`, `orte`, `kultur`, `maya`, `smalltalk`, `grundwortschatz`. `Vocab.topic` ist immer einer dieser Schlüssel, die Labels (deutsch) kommen aus `index.json` und werden für die Filter genutzt. Jede Themendatei ist ein JSON-Array von `Vocab`. Der Loader lädt alle Dateien, validiert minimal (id, de, es, level) und liefert eine `Map<id, Vocab>`. `vocabRepo` führt statische und eigene Vokabeln (Store `userVocab`) zu einer Map zusammen. Das Thema `eigene` steht nicht in `index.json`, sondern ist in der App fest mit dem Label „Eigene Wörter“ hinterlegt.

### 10.1a Eigene Vokabeln und Wortsuche
- **Speicher:** Store `userVocab` (siehe §10.2). ID `'u' + 8 Zeichen base36 aus crypto.getRandomValues`, bei Kollision neu würfeln.
- **Modul `domain/lookup/`** (rein, ohne `fetch`): `parseWiktionary(wikitext, word) → LookupResult` mit `candidates: { pos, es, de: string[] (max. 4), gender?, plural?, example?, baseForm? }[]` und `inflectedOf?: string` (Grundform bei gebeugten Formen). Tests mit **echten, im Repo gespeicherten Antworten** (`src/domain/lookup/fixtures/*.json`, einmalig beim Entwickeln abgerufen) für mindestens: ein Nomen (*casa*), ein Verb (*poder*), eine gebeugte Form (*puedo*), ein Wort mit mehreren Wortarten (*llama*), ein unbekanntes Wort.
- **Modul `data/lookup.ts`:** `fetch('https://de.wiktionary.org/w/api.php?action=parse&page=<wort>&prop=wikitext&format=json&redirects=1&origin=*')`, Timeout 8 s, Fehler/Offline → `{ status: 'unavailable' }`, unbekannt → `{ status: 'notfound' }`. Findet `de.wiktionary.org` nichts (Seite fehlt oder kein spanischer Abschnitt, z. B. *palabra*), folgt ein Fallback auf `es.wiktionary.org` mit `parseEsWiktionary` (Wortart und Genus aus den Überschrift-Templates, Grundform bei Formen wie *puedo*; keine deutschen Bedeutungen, `de: []`). Die Antwort trägt `source: 'de' | 'es'`, bei `es` zeigt die App einen Hinweis. Fehler/Offline bei de bricht ohne Fallback mit `unavailable` ab. Die Parser sind tolerant: was nicht erkannt wird, bleibt leer und wird im Formular manuell ergänzt.
- **Dublettenprüfung** `findDuplicate(vocabMap, es, pos)` → `{ exact?: Vocab, similar: Vocab[] }`. Normalisierung: Kleinschreibung, ohne führenden Artikel `el|la|los|las|un|una`, **Akzente bleiben erhalten**. `exact` = gleiche normalisierte Form **und gleiche Wortart** (blockiert das Anlegen, Link zur Vokabel). `similar` = gleiche Form bei anderer Wortart, oder gleiche Form nur nach Entfernen der Akzente (*papa/papá*, *te/té*): Warnhinweis „Ähnliches Wort vorhanden“ mit Links, Anlegen bleibt möglich.
- **Service Worker:** Anfragen an `de.wiktionary.org` und `es.wiktionary.org` werden nicht gecacht und nicht abgefangen (kein Workbox-Route dafür). Sollte später eine CSP gesetzt werden, braucht `connect-src` diese Hosts.
- **Verben:** Tags wählt der Nutzer manuell, das Modul `conjugation` liefert die Vorschau. Kein automatisches Raten der Tags.

### 10.1b Export/Import (`data/exportImport.ts`)
Exportdatei: `{ schemaVersion, exportedAt, settings, cards, daily, userVocab }`.
- **Ersetzen:** alle lokalen Daten (Einstellungen, Cards, Daily, userVocab) werden durch die Datei ersetzt, nach Rückfrage.
- **Zusammenführen:** Einstellungen bleiben lokal unverändert. `cards`: pro Schlüssel `[vocabId, dir]` gewinnt der Stand mit dem größeren `lastReviewed` (bei Gleichstand der lokale; `null` verliert gegen einen Wert); nur in einer Seite vorhandene Karten bleiben. `daily`: je `dayKey` das Maximum von `newIntroduced` und `reviewed`. `userVocab`: per ID, bei Konflikt gewinnt der Eintrag mit dem größeren `createdAt`, bei Gleichstand der lokale.
- Import validiert `schemaVersion` und Struktur, lehnt unbekannte neuere Versionen mit Fehlermeldung ab und ändert bei Fehlern nichts (alles-oder-nichts in einer Transaktion).
- Das Feld `settings.newPerDay` in älteren Dateien wird **ignoriert** und nicht mehr verlangt. Karten ohne `step` sind gültig.

### 10.2 IndexedDB (`palabrita`, Version 1)

| Store | Key | Wert |
|---|---|---|
| `settings` | `'main'` (ein Datensatz) | `{ maxLevel: Level, direction: 'de-es'\|'es-de'\|'both', theme: 'system'\|'light'\|'dark' }` (Defaults: B1, both, system). Die Felder `newPerDay` und `autoSpeak` entfallen (vorhandene Datensätze mit diesen Feldern verursachen keinen Fehler; der Import ignoriert sie). |
| `cards` | `[vocabId, dir]` | `{ vocabId, dir: 'de-es'\|'es-de', due: number(ms), interval: number(Tage), ease: number, reps: number, lapses: number, lastReviewed: number\|null, state: 'new'\|'learning'\|'mature', step?: 0\|1 }`. `step` ist neu, siehe §11. |
| `daily` | `dayKey` | `{ dayKey: 'YYYY-MM-DD', newIntroduced: number, reviewed: number }` |
| `userVocab` | `id` | vollständiges `Vocab` mit `origin: 'user'`, `level: null`, `topic: 'eigene'`, `createdAt` |
| `meta` | `key` | `{ key: 'schemaVersion', value }` |

Index auf `cards`: `by-due` = `due`.

Es gibt **keine Profile** (entschieden, siehe §3.2): ein Nutzer pro Browser. `daily.newIntroduced` zählt neu eingeführte **Karten** (nicht Vokabeln) bei der ersten Bewertung. `daily.reviewed` zählt **jede gespeicherte Bewertung**, auch Wiederholungen derselben Karte am selben Tag. Ein „Gewusst“ bei der Vorab-Wiederholung (§11) ändert nichts an der Karte, wird **nicht gespeichert** und zählt **nicht**. Zwischen Geräten hilft nur Export/Import.

Eine Karte wird **erst beim ersten Lernen angelegt** (kein Vorab-Befüllen von 1000 Karten). „Neu“ = Vokabel ohne Card-Eintrag für diese Richtung.

**Alle fünf Stores werden schon in Version 1 angelegt**, auch `userVocab` (zunächst leer), damit für eigene Wörter keine Migration nötig ist. Das neue Feld `step` braucht **keine Migration**: bestehende Karten ohne `step` gelten als Wiederholungsphase.

Eine Serie (Streak) gibt es nicht. Weder Anzeige noch Berechnung sind vorhanden (entfernt, Anforderung 2026-11-19).

Migrationen laufen über `upgrade(db, oldVersion)` in `data/db.ts`. Vokabel-IDs bleiben stabil, Cards referenzieren nur `vocabId`. Nicht mehr vorhandene `vocabId`s werden beim Laden ignoriert (nicht gelöscht). Löscht der Nutzer ein **eigenes** Wort, werden auch seine Cards gelöscht (Rückfrage in der UI).

## 11. Lernmodell (`domain/srs.ts`)

**Tageswechsel (`domain/day.ts`):** `dayKey(now)` = lokales Datum von `now − 4 h`. `startOfDay(dayKey)` liefert 04:00 lokal. `addDays` rechnet in **Kalendertagen** auf dem `dayKey`, nicht mit `+ 24 h`, damit Zeitumstellungen nichts verschieben. Die Tageszähler zählen bis 04:00 zum Vortag.

Reine Funktion `review(card, grade, now): Card`. `Grade` ist `"again" | "good"` (Beschriftung: „Nochmal“, „Gewusst“). Die früheren Stufen `hard` und `easy` entfallen aus Typen, `GRADES`, UI und Tests.

**Neues Feld an `Card`** (`domain/types.ts`): `step?: 0 | 1`. Ist `step` gesetzt, ist die Karte in der **Lernphase** (Minutenabstände). Fehlt `step`, ist sie in der **Wiederholungsphase** (Tagesabstände). Bestehende Karten haben kein `step` und gelten damit als Wiederholungsphase, **keine DB-Migration nötig**.

Konstanten (`domain/srs.ts`): `STEP_MINUTES = [5, 30]`, `START_EASE = 2.5`, `MIN_EASE = 1.3`, `MAX_EASE = 3.0`, `EASE_LOSS = 0.2`, `EASE_GAIN = 0.05`, `GRADUATE_DAYS = 1`, `MATURE_INTERVAL = 21`.

**Lernphase** (neue Karte oder nach „Nochmal“ in der Wiederholungsphase). `due` ist hier ein exakter Zeitpunkt `now + Minuten`:

| Zustand | Nochmal | Gewusst |
|---|---|---|
| neu (nie bewertet) | Schritt 0, in 5 Min | Schritt 1, in 30 Min |
| Schritt 0 | Schritt 0, in 5 Min | Schritt 1, in 30 Min |
| Schritt 1 | Schritt 0, in 5 Min | **Abschluss**, Intervall 1 T |

Ein Wort muss also zweimal nacheinander gewusst werden, bevor es in den Tagesplan wechselt. Die Lernphase ändert die Ease nicht.

**Abschluss** = `step` entfernen, `interval` setzen, `reps += 1`, `due = startOfDay(addDays(dayKey(now), interval))` (04:00-Regel, Kalendertage über `addDays`). Die Basis ist immer **heute** (`dayKey(now)`), nicht das alte Fälligkeitsdatum. Überfällige Karten werden dadurch nicht „nachgerechnet“. Das gilt auch für „Gewusst“ in der Wiederholungsphase.

Randfälle der 04:00-Regel (kein Fehler): Ein Abschluss um 02:00 hat `dayKey` von gestern, die Karte ist dann heute 04:00 fällig, also in 2 Stunden, die Vorschau zeigt trotzdem „1 T“. Ein Abschluss um 23:00 ist morgen 04:00 fällig, also in 5 Stunden.

**Wiederholungsphase** (Karte ist fällig, `due < nextDayStart`):
- **Nochmal (Rückfall):** `lapses += 1`, `reps = 0`, `ease = max(MIN_EASE, ease − EASE_LOSS)`, `interval = 1` (gilt später als Abschlussintervall), `step = 0`, `due = now + 5 Min`. Danach durchläuft die Karte die Lernphase; ihr Abschluss ergibt `interval = 1 T`.
- **Gewusst:** `interval = max(interval + 1, round(interval × ease))` mit der Ease **vor** dieser Bewertung, danach `ease = min(MAX_EASE, ease + EASE_GAIN)`, `reps += 1`, `due` auf 04:00 des Fälligkeitstages.
- Die Schwierigkeit eines Wortes steckt allein in der Ease: Jedes „Nochmal“ senkt sie, jedes „Gewusst“ hebt sie leicht. Wörter, an denen der Nutzer oft scheitert, wachsen dadurch langsam (bei Ease 1,3 nur ×1,3), sichere Wörter immer schneller. Beispiel bei durchgehend „Gewusst“: ≈ 1, 3, 8, 21, 56 Tage.

**Vorab-Wiederholung** (Karte in der Wiederholungsphase, aber **noch nicht fällig**, siehe §12.2). Der Zeitplan darf durch Üben nicht aufgebläht werden:
- **Nochmal:** wie Rückfall oben (bewusst hart: `lapses += 1`, `reps = 0`, Ease −0,2, Intervall 1 T). Wer beim freiwilligen Durchlauf ein Wort nicht mehr weiß, hat es wirklich vergessen, auch wenn es eine Karte mit z. B. 56 Tagen Intervall war. Der Plan wird dadurch verkürzt, aber nie verlängert.
- **Gewusst:** Karte bleibt **vollständig unverändert**, auch `lastReviewed` (entschieden). Es wird nichts gespeichert, `daily.reviewed` zählt nicht, So kann reines Üben beim Zusammenführen (§10.1b) keinen echten, neueren Lernstand eines anderen Geräts verdrängen. In der Sitzung zählt es trotzdem zu „Geübt: N“ und die Karte kommt in `sessionSeen`.
- `review()` bekommt dafür keinen Zusatzparameter: „nicht fällig“ wird in der Funktion aus `card.due >= nextDayStart(now)` erkannt.

**Ease-Rundung:** Die Ease wird nach jeder Änderung auf 2 Dezimalstellen gerundet (gegen Gleitkomma-Rauschen wie 2,3499999) und danach auf `MIN_EASE`/`MAX_EASE` begrenzt. Bestehende Karten mit Ease über 3,0 (vom alten „Leicht“ mit +0,15) werden bei der nächsten Bewertung auf 3,0 gekappt. Das Intervall dieser einen Bewertung nutzt noch die ungekappte Ease.

`state`: `learning` solange `step` gesetzt ist oder `interval < 21`, sonst `mature`. (`new` nur für noch nicht gespeicherte Karten.)

`previewIntervals(card, now)` liefert je Button entweder Minuten oder Tage. `formatInterval` hat eine Minuten-Variante („5 Min“, „1 Std“ ab 60 Min, sonst Tage). Vorschau bei Vorab-Wiederholung: „Gewusst“ zeigt das unveränderte Fälligkeitsdatum.

**Jede Bewertung, die etwas ändert, wird gespeichert** (`saveReview`). Ausnahme: „Gewusst“ bei der Vorab-Wiederholung (siehe oben, wird nicht gespeichert). Ein „nur Üben, nicht gespeichert“-Verhalten (`practice`) gibt es nicht mehr.

## 12. Auswahl der nächsten Karte (`domain/queue.ts`)

### 12.1 `pickNext`

Eine Funktion **`pickNext(input): Pick`** ersetzt `buildQueue`. Sie ist **rein** (kein Zugriff auf Datenbank oder Uhr, `now` kommt als Parameter) und wird nach **jeder** Bewertung neu aufgerufen. Eingabe: Einstellungen (`maxLevel`, `direction`), Vokabeln, alle Cards, `now`, Sitzungsfilter (Thema, Niveau, Wortart, Richtung), `sessionSeen: Set<string>` (Kartenschlüssel `vocabId|dir`, siehe §12.2), `lastShown: string | null`.

Sichtbarkeit und Filter: Sichtbar sind nur Vokabeln mit `isVisible(v, settings.maxLevel)` (eigene Wörter mit `level: null` immer), danach Filter (Thema, Niveau, Wortart). Eigene Wörter wählt man über das Thema „Eigene Wörter“ (`eigene`); ein gesetzter Niveau-Filter A1/A2/B1 schließt sie aus. Erlaubte Richtungen: bei `both` beide, sonst nur die eingestellte (der Sitzungsfilter kann sie überschreiben). Karten ausgeblendeter Vokabeln oder Richtungen bleiben unverändert in der DB.

Priorität, die erste passende Stufe gewinnt:

1. **Lernkarten fällig:** Karten mit `step` gesetzt und `due <= now`, die am längsten überfällige zuerst.
2. **Wiederholungen fällig:** Karten ohne `step`, `due < nextDayStart(now)` mit `nextDayStart = startOfDay(addDays(dayKey(now), 1))` (04:00 des Folgetags, **exklusiv**: eine Karte mit `due` = morgen 04:00 ist heute **nicht** fällig), sortiert nach `due`.
3. **Neue Karte einführen**, wenn weniger als `MAX_LEARNING = 25` Karten gleichzeitig in der Lernphase sind (`step` gesetzt, sichtbar und im Filter). Das verhindert, dass 500 neue Wörter auf einmal „offen“ werden, und ersetzt das Tageslimit. Reihenfolge der neuen Karten: eigene Wörter zuerst nach `createdAt`, dann statische nach `id`, je Wort zuerst DE→ES.
   - **Partnerkarte:** Die Karte der zweiten Richtung (ES→DE) einer Vokabel wird erst eingeführt, wenn die erste Richtung die Lernphase abgeschlossen hat (kein `step`, Card existiert), damit sie die Lösung nicht verrät. Gibt es nur gesperrte Partnerkarten, wird Stufe 3 übersprungen.
   - Die Sperre gilt nur, wenn die Partnerkarte (DE→ES) in der aktuellen Richtungsauswahl liegt (Einstellung `direction` und Sitzungsfilter) **und noch nicht abgeschlossen ist** (keine Card oder Card mit `step`). Ist DE→ES ausgeschlossen (z. B. Richtung nur ES→DE), ist ES→DE nicht gesperrt. Eine existierende Card wird nie nachträglich gesperrt, die Sperre betrifft nur das **Einführen** neuer Karten.
4. **Wartende Lernkarte vorzeitig zeigen** (`step` gesetzt, `due > now`, noch nicht fällig): Die Lernkarte mit dem frühesten `due` wird **sofort** gezeigt, statt auf den Ablauf der 5 bzw. 30 Minuten zu warten. Die Stufe steht **vor** Stufe 5. Grund: Stünde die Vorab-Wiederholung davor, würden wenige Wiederholungskarten alle Lernkarten blockieren, bis deren Wartezeit abgelaufen ist. Bei schnellem Bewerten wiederholten sich dann nur zwei Wiederholungskarten (Fehler, behoben, Test „regression: rapid 'good' …“ in `queue.test.ts`). Es gibt **keinen Wartezähler und keinen „Jetzt zeigen“-Button** (entschieden). Folge: Bei wenigen Karten wirken die Minutenpausen kaum, der Nutzer sieht dieselben Karten schnell wieder. Das ist gewollt. Fällige Lernkarten (Stufe 1) und fällige Wiederholungen (Stufe 2) haben weiterhin Vorrang.
5. **Vorab-Wiederholung („von vorn“):** nur wenn keine Lernkarte mehr wartet, siehe §12.2.
6. Gibt es überhaupt keine sichtbare Karte (leeres Filterergebnis, Niveau zu niedrig): Hinweis „Keine Karten für diese Auswahl“ mit Link zur Filterauswahl. Das ist der **einzige** Fall, in dem die Sitzung leer ist.

Die Karte, die gerade bewertet wurde (`lastShown`), wird nie sofort wieder gewählt, wenn eine andere Karte zur Verfügung steht. Das gilt auch bei „Nochmal“ mit nur einer Restkarte: Dann greift Stufe 4 mit der frühesten **anderen** wartenden Lernkarte. Gibt es gar keine andere Karte, wird dieselbe Karte erneut gezeigt (der Sitzungsbildschirm bleibt nie leer).

`daily.newIntroduced` wird erhöht, wenn eine neue Karte **zum ersten Mal bewertet** (und damit angelegt) wird, nicht beim Anzeigen.

### 12.1a Überarbeitung der Kartenauswahl (Anforderung 2026-11-19, noch nicht umgesetzt, Detailspezifikation folgt)

Der Algorithmus, nach dem die nächste Karte angezeigt wird (`pickNext`, §12.1), soll **dringend überarbeitet** werden. Der bisherige Stand ist für den Nutzer nicht zufriedenstellend. Konkrete Mängel und Sollverhalten werden in der Detailspezifikation festgelegt. Bis dahin bleibt §12.1 gültig, und die Änderung darf die Regeln in §11 (SRS-Modell) nicht verletzen, solange nicht ausdrücklich anders beschlossen.

Offen für die Spezifikation: welche Reihenfolge und Mischung von fälligen, lernenden und neuen Karten gewünscht ist, wie stark „Nochmal“-Karten zurückkehren sollen, und ob sich die Auswahl je Richtung oder über beide Richtungen hinweg verhält.

### 12.2 Durchlauf („alles durch, dann von vorn“)

Sind Stufe 1–4 leer (nichts fällig, keine wartende Lernkarte, keine neuen Karten übrig), wird **vorzeitig wiederholt**:
- Kandidaten: alle sichtbaren, gefilterten Karten in der Wiederholungsphase, die noch **nicht** in `sessionSeen` stehen, sortiert nach `due` aufsteigend (am bald fälligsten zuerst).
- Jede gezeigte oder bewertete Karte kommt in `sessionSeen` (Stufen 1 bis 4 ebenfalls). Sind alle Kandidaten durch, wird `sessionSeen` geleert und der Durchlauf beginnt von vorn. Eine kurze Einblendung „Neuer Durchlauf“ ist optional.
- Bewertung dieser Karten nach der Regel **Vorab-Wiederholung** (§11), damit die Intervalle nicht verfälscht werden.
- `sessionSeen` lebt nur im Speicher der Sitzung (nicht gespeichert).

## 13. Audio (`hooks/useSpeech.ts`)

`speechSynthesis`; Stimmen laden über `voiceschanged`. Auswahl: `es-MX` → `es-US` → `es-*` → erste mit `lang` beginnend mit `es`. Nicht verfügbar: Hinweisbanner „Keine spanische Stimme gefunden“, Button deaktiviert. Gesprochen wird immer der spanische Text `es` **inklusive Artikel** (*el autobús*). Text in Klammern wird entfernt, bei Alternativen mit `/` (*el/la turista*) wird nur die erste gesprochen.

**Auto-Vorlesen** ist ein Schalter in der Lernsitzung (Standard aus, nur für diese Sitzung). Es liest **einmal je Karte** vor, nämlich wenn die spanische Seite zum ersten Mal sichtbar wird. Weiteres Hin- und Herdrehen löst es nicht erneut aus. Der 🔊-Button funktioniert, solange die spanische Seite sichtbar ist.

## 14. Routing und Screens

HashRouter. Routen: `/` Lernen (Auswahl und Sitzung), `/study` leitet auf `/` um, `/dictionary`, `/dictionary/:id`, `/add` (eigenes Wort nachschlagen und hinzufügen, optional `?q=<wort>`), `/stats`, `/settings`, `/legend`, `/privacy`, `/imprint`, `/more`. „Mehr“ in der Tab-Leiste führt zu Einstellungen, Legende, Datenschutz und Impressum.

**Darstellung mehrerer Übersetzungen:** Überall, wo die deutsche Seite erscheint (Karte, Verzeichnis, Detailansicht), werden alle `de`-Einträge mit „ · “ getrennt angezeigt, das erste hervorgehoben. Die Verzeichnissuche durchsucht alle `de`-Einträge und `es`. Die Einstellungen werden beim ersten Start mit Defaults angelegt.

Layout: mobile-first, untere Tab-Leiste (Lernen, Verzeichnis, Statistik, Mehr). Touch-Ziele ≥ 48 px.

**Logo:** Auf allen Seiten außer „Mehr“ steht oben rechts an derselben Stelle das Logo: drei Wimpel über dem Schriftzug „Palabrita“ (`components/Brand.tsx`, Komponente `Logo`, eingesetzt in `App.tsx` als `.corner-logo`). Neue Seiten bekommen es automatisch, wenn sie unter der Layout-Route liegen. Überschriften lassen rechts Platz dafür. Der Zurück-Link „← Mehr“ oben links steht in derselben Zeile, seine Mitte liegt auf der Mitte des Logos. In der Lernsitzung steht das Logo mittig in der Leiste, zwischen Zähler und „Beenden“; die Leiste hat gleich breite Spalten, damit das Logo exakt mittig bleibt. Der Markenkopf im Tab „Mehr“ nutzt die große Wortmarke.

### 14.2 Impressum und Datenschutz (umgesetzt 2026-11-19)

- Erreichbar über „Mehr“ (je ein Eintrag, eigene Seite, z. B. `/imprint` und `/privacy`). Gleiche Gestaltung wie die Legende, mit Zurück-Link „← Mehr“ (Klasse `back`).
- **Datenschutz:** beschreibt den tatsächlichen Stand. Kein Backend, kein Konto, kein Tracking, keine Analyse-Werkzeuge. Fortschritt und eigene Wörter liegen nur im Browser (IndexedDB) und verlassen das Gerät nicht, außer der Nutzer exportiert sie selbst. Einzige externe Anfragen: Wortsuche bei `de.wiktionary.org` (Fallback `es.wiktionary.org`), nur auf Knopfdruck (AGENTS.md). Das Hosting (GitHub Pages) erzeugt beim Abruf technisch übliche Zugriffsdaten beim Anbieter; der Hinweis darauf gehört hinein.
- **Impressum:** Angaben zum Betreiber (Name, Anschrift, Kontakt). Diese Angaben liefert der Nutzer, sie werden nicht erfunden. Offen: welche Pflichtangaben für eine nicht-kommerzielle Lern-App gelten.
- Umsetzung: `src/features/legal/` (`Imprint.tsx` unter `/imprint`, `Privacy.tsx` unter `/privacy`, Betreiberangaben zentral in `operator.ts`). Beide Seiten sind Teil der App und damit offline verfügbar. Die Datenschutzerklärung nennt Hosting (GitHub Pages), lokale Speicherung (§ 25 Abs. 2 Nr. 2 TDDDG, keine Einwilligung nötig), Wortsuche (Wiktionary, Einwilligung durch Knopfdruck, Art. 49 Abs. 1 lit. a DSGVO), Vorlesefunktion und Betroffenenrechte; Aufsichtsbehörde: HBDI. Das Impressum folgt § 5 DDG. Wiktionary-Lizenzhinweis (CC BY-SA) steht im Impressum. Neben dem Nachschlagen-Knopf (`Add.tsx`) stehen Hinweis auf IP-Adresse, USA und Einwilligung sowie der Link zur Datenschutzerklärung. Die Erklärung enthält eine Übersicht der Verarbeitungen und einen abgesetzten Widerspruchshinweis (Art. 21 Abs. 4 DSGVO). Ändern sich Hosting, Dienste oder Betreiberangaben, müssen beide Seiten angepasst werden.

### 14.1 Lernsitzung (`features/study/Study.tsx`)

**Begrüßung beim Erststart** (`components/WelcomeOverlay.tsx`, Flag in `data/welcomeFlag.ts`):
- Beim ersten Öffnen liegt über der Lernseite (`/`) eine schwebende Lernkarte. Vorderseite Spanisch („¡Bienvenido a“ über der Wortmarke „Palabrita“), Rückseite Deutsch („Willkommen zu“ über derselben Wortmarke). Die Wortmarke ist dieselbe Komponente wie der Markenkopf im Tab „Mehr“ (`components/Brand.tsx`). Der Rest der App ist solange `inert`.
- Erstes Tippen dreht die Karte um, zweites Tippen schließt das Overlay. Enter oder Leertaste wirken wie Tippen. Beim Erststart reagiert die Fläche neben der Karte nicht: es muss die Karte angetippt werden.
- Gemerkt wird das Schließen pro Gerät in `localStorage` (`palabrita.welcomeSeen`), nicht in IndexedDB. Export und Import sind davon nicht betroffen. Ist der Speicher nicht nutzbar, erscheint der Hinweis nicht.
- Erneut öffnen: Ein Tippen auf den ganzen Markenblock im Tab „Mehr“ (Wimpel, Schriftzug, Slogan und Widmung) zeigt dieselbe Karte, wieder Spanisch vorne. Umdrehen und Schließen funktionieren gleich, danach bleibt man auf „Mehr“. Ein Klick auf die Fläche neben der Karte schließt sie beim erneuten Öffnen sofort. Das speichert nichts, und der Erststart-Zustand ändert sich dadurch nicht. Die Karte liegt in `Layout` (`App.tsx`) über der App, die Unterseite bekommt `openWelcome` über den Router-Kontext.

**Karte umdrehen** (`components/Flashcard.tsx`):
- Klick/Tippen auf die Karte **wechselt** zwischen Vorder- und Rückseite, beliebig oft. `onFlip` wird zu `onToggle`.
- Beim Wechsel zu einer neuen Karte startet sie immer auf der Vorderseite.
- Sobald die Karte **einmal aufgedeckt** wurde (`revealed = true`), bleiben die Bewertungsbuttons sichtbar, auch wenn der Nutzer wieder auf die Vorderseite zurückdreht. Vor dem ersten Aufdecken steht statt der Buttons der Button „Umdrehen“ (er dreht ebenfalls um und setzt `revealed`).
- Der Hinweis „Tippen zum Umdrehen“ steht auf **beiden** Seiten. `aria-label` je Seite („Karte umdrehen“), zusätzlich `aria-pressed` bzw. gleichwertig; Tastatur (Enter/Leertaste) funktioniert, weil die Karte ein `button` bleibt.
- Die Flip-Optik (Klasse `flipped`) darf bleiben oder animiert werden. Pflicht ist nur das Verhalten. `prefers-reduced-motion` respektieren, falls animiert wird.

**Konjugation öffnen:**
- Gilt nur für Vokabeln mit `pos === "verb"`. Bei allen anderen Wörtern gibt es den Button nicht.
- Der Button **„Konjugation“** erscheint, sobald `revealed = true` ist (auf Vorder- und Rückseite). Vorher nicht, weil die Verbtabelle bei DE→ES die Lösung verrät.
- Klick öffnet ein **Overlay** (Bottom-Sheet auf dem Handy, zentrierter Dialog ab Tablet-Breite) **über** der Sitzung. Die Sitzung (Karte, Seite) bleibt unverändert und geht nicht verloren.
- Inhalt: Kopf mit Stichwort (`es`), deutschen Bedeutungen und 🔊, darunter die bestehende `VerbTable` samt Hinweis „Formen nicht geprüft“ bei eigenen Verben. Der Inhalt wird aus `features/dictionary/VocabDetail.tsx` in eine **gemeinsame Komponente** (`components/VerbDetail.tsx`) herausgezogen, die `VocabDetail` und das Overlay (`components/VerbOverlay.tsx`) beide nutzen. Kein duplizierter Code.
- Schließen: Button „Schließen“, Escape, Klick auf den Hintergrund und die **Zurück-Taste des Geräts** (Overlay erzeugt einen History-Eintrag, Zurück schließt nur das Overlay und verlässt nicht die Sitzung). Fokus wandert beim Öffnen ins Overlay, bleibt dort gefangen und kehrt beim Schließen zum Button zurück. `role="dialog"`, `aria-modal`, beschriftet.
- Solange das Overlay offen ist, sind Karte und Bewertungsbuttons darunter nicht bedienbar.
- **Wegwischen nach unten (Anforderung 2026-11-19, noch nicht umgesetzt, Detailspezifikation folgt):** Auf dem Handy lässt sich das Bottom-Sheet mit einer Wischgeste nach unten schließen, ohne ganz nach unten scrollen zu müssen. Das Sheet folgt dem Finger, schließt bei Überschreiten einer Schwelle und springt sonst zurück. Der Schließen-Button und alle anderen Schließwege bleiben erhalten. Offen: Wo die Geste beginnt (Griffleiste oben, Kopfbereich oder das ganze Sheet), wie es mit scrollbarem Inhalt zusammenspielt und ob es auf Tablets (zentrierter Dialog) entfällt.

**Sitzungsverhalten:**
- Oben immer sichtbar: Button **„Beenden“**, ohne Rückfrage. Er führt zur Zusammenfassung. Auch Wegnavigieren oder Schließen der App ist ohne Datenverlust möglich, weil jede Bewertung sofort gespeichert wird.
- Bewertungsbuttons „Nochmal“ und „Gewusst“ mit Vorschau des Wiedersehens (`previewIntervals`).
- Wer später wieder lernt, bekommt zuerst, was fällig ist (auch Minuten-Karten, die inzwischen überfällig sind), dann neue Wörter, dann Wiederholung des Restes (§12).
- Der Fortschrittsbalken „3 / 12“ entfällt (es gibt kein Ende). Stattdessen oben eine Zeile „Geübt: N“ (Zähler dieser Sitzung), in der Mitte das Logo (Wimpel über dem Schriftzug), rechts „Beenden“.
- **Zusammenfassung** („Sitzung beendet“): Oben mittig das Logo an exakt derselben Stelle wie in der Sitzungsleiste, darunter der Titel und zwei große Kacheln: links die Anzahl geübter Karten, rechts die Anzahl „Nochmal“ (eine Lerndauer gibt es nicht, entschieden), sowie die Buttons „Weiterlernen“ (frische Sitzung mit denselben Filtern) und „Beenden“ (zurück zur Filterauswahl, Filter zurückgesetzt). Die Texte „Fertig für heute“ und „Heute ist nichts fällig“ entfallen.

## 15. PWA

`vite-plugin-pwa` mit `registerType: 'prompt'`, Workbox-Precache für App-Shell und `vocab/*.json`. `UpdateBanner` über `useRegisterSW` (`needRefresh`), Button ruft `updateServiceWorker(true)`. Manifest: Name „Palabrita“, `display: standalone`, `lang: de`, Theme-Farbe Türkis. Icons 192/512/maskable aus SVG (`scripts/make-icons.ts`).

## 16. Test und Deployment

**Lokaler Test:**
- Voraussetzung: Node.js 24 und npm.
- `npm run dev` startet die App unter `http://localhost:5173` für die Entwicklung.
- `npm run build` und `npm run preview` (Port 4173) liefern die gebaute Version. Service Worker, Offline-Modus und Installierbarkeit lassen sich nur dort prüfen. Auf `localhost` funktioniert die PWA ohne HTTPS, Chrome/Edge zeigen ein Installations-Symbol.
- Optional: Ansicht im selben WLAN über `http://<PC-IP>:4173` (`vite preview --host`). Dort funktionieren Installation und Offline-Modus wegen fehlendem HTTPS meist nicht.

**Deployment (GitHub Pages):**
- Statische Auslieferung von `dist/` über GitHub Pages, `.github/workflows/pages.yml` (Lint, Tests, Vokabelprüfung, Build, Veröffentlichung; Start bei Push auf `main` und per `workflow_dispatch`). Erwartete URL: `https://fabiankonig.github.io/palabrita/`.
- **HTTPS ist Pflicht**, damit die PWA auf dem Handy installierbar ist; Pages liefert es mit. Die App läuft unter einem Unterpfad (`base: "./"`, Hash-Router, relative Manifest-Pfade).
- Pages setzt `Cache-Control: max-age=600`. Updates laufen über den `UpdateBanner` (Service Worker), nicht über Cache-Header.
- `README.md` enthält Einrichtung, Aktualisierung und die Installation auf dem Handy (Android/Chrome: „App installieren“; iPhone/Safari: Teilen, „Zum Home-Bildschirm“).

**Hinweis:** Der Lernfortschritt liegt je Gerät im Browser. PC und Handy sind nicht synchronisiert, daher gibt es Export und Import (§3.2).

## 17. Annahmen (gelten, solange nichts anderes entschieden wird)

- **Tageswechsel:** um 04:00 Uhr lokaler Zeit (Tageszähler zählen bis dahin zum Vortag), siehe §11.
- **Routing:** Hash-Router (`/#/...`), damit der statische Host keine SPA-Fallback-Regel braucht.
- **Tests:** Vitest für `srs.ts`, `queue.ts` und das Konjugationsmodul.
- **Icons/Logo:** einfaches SVG-Icon (Schriftzug oder Symbol in den Landesfarben) und daraus die PWA-Icons (192, 512, maskable).
- **Vokabeldateien:** mehrere Dateien nach Thema (`public/vocab/<thema>.json`), damit Fehler leicht korrigierbar sind. `npm run validate:vocab` prüft Schema, eindeutige IDs, Pflichtfelder (Beispielsatz), Dubletten über Themen hinweg und bei Verben die Regeln aus §5.1.
- **Vokabelqualität:** Es gibt keine externe Prüfung. Verbformen werden per Code erzeugt und getestet, Fehler in der JSON-Datei sind leicht korrigierbar. Eine menschliche Prüfung der Vokabeln steht aus.
- **Offene Punkte:** Logo (App-Name ist entschieden: **Palabrita**).

## 18. Qualitätsregeln für Agenten

- Jeder Task endet mit grünem `npm run build`, `npm run lint`, `npm test` (bei Vokabeländerungen zusätzlich `npm run validate:vocab`).
- UI-Text auf Deutsch, Code/Kommentare/Bezeichner auf Englisch.
- Kleine Commits pro Task auf Feature-Branch, kein Push ohne Rückfrage (es sei denn, es ist anders vorgegeben).
- Nach jedem Task `docs/TASKS.md` abhaken.
- Bei Unklarheit: Annahme treffen, in `docs/TASKS.md` unter „Notizen“ festhalten, weitermachen.
