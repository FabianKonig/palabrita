# Palabrita: Spezifikation

Einzige Quelle der Wahrheit für Funktion und Technik der App. **Teil A** beschreibt, *was* die App tut (Anforderungen, Vokabel- und Verbformat). **Teil B** legt fest, *wie* sie gebaut ist (Stack, Datenmodell, Lernmodell, Deployment).

Begleitdokumente: `docs/TASKS.md` (offene Aufgaben), `docs/VOKABELN.md` (Themen und Qualitätsregeln der Vokabeln), `docs/ABNAHME.md` (Abnahmeprotokoll der Lernsitzung).

---

# Teil A: Anforderungen

## 1. Ziel

Eine Vokabel-Lern-App für Spanisch, mit Fokus auf Reise-Alltag, Kultur und Orte in Mexiko und Guatemala. Sie enthält über 800 Startvokabeln mit Zusatzinfos, insbesondere zur Konjugation der Verben.

## 2. Entscheidungen aus der Anforderungsklärung

| Thema | Entscheidung |
|---|---|
| Plattform | Web-App als **PWA** (im Browser, aufs Handy installierbar, offline nutzbar) |
| Nutzer / Level | **Ein Nutzer pro Browser, keine Profile** (entschieden). Niveaustufen A1 bis B1 sind einstellbar. |
| Lernmodi v1 | **Karteikarten** und **Spaced Repetition** (zwei Bewertungsbuttons, endlose Sitzung, siehe §3.1) |
| Inhalte | Reise-Alltag, Kultur & Orte, Audio-Aussprache |
| Vokabeln | **Über 800 Startvokabeln**, von Claude generiert, mit Zusatzinfos, ohne festen Gesamtumfang |
| Speicherung | **Nur lokal im Browser**, kein Server, kein Login |
| Design | Mexiko/Guatemala-Farbwelt, mobile-first |
| Länderunterscheidung | **Keine** (ein gemeinsames Vokabelset) |
| Mehrere Übersetzungen | Eine Vokabel kann **1 bis 4 deutsche Wörter** haben (`de` ist eine Liste, §4.2). |
| Kartenrichtung & SRS | **Getrennter SRS-Zustand je Richtung** (DE→ES und ES→DE sind je eigene Karten mit eigenem Intervall, Ease und Fälligkeit). Die Statistik zählt Karten je Richtung. |
| Niveau-Konfiguration | Ein **maximales Niveau** (A1, A2, B1) wird persistent in den Einstellungen gespeichert, siehe §3.2. Höhere Niveaus werden beim Lernen und in der Statistik ausgeblendet (das Verzeichnis zeigt sie, §3.3), ihr Fortschritt bleibt erhalten. |
| Projektstruktur | Das Projekt liegt **direkt im Repo-Root**, Dokumentation in `docs/` (§9). |
| PWA-Updates | **Hinweis mit Button**: Ein Banner „Neue Version verfügbar.“ mit Button „Aktualisieren“ erscheint. Es wird nie automatisch neu geladen, auch nicht mitten in einer Lernsitzung (§15). |

Nicht in v1: Multiple-Choice-Quiz, Tipp-Abfrage, Cloud-Konten, Regionalismen-Filter (MX/GT), Sync zwischen Geräten, eine dritte Bewertung „Kenne ich schon“ (würde eine neue Karte ohne Lernschritte direkt abschließen, kann später ergänzt werden).

## 3. Funktionale Anforderungen

### 3.1 Lernen

> Der Absatz beschreibt die Lernsitzung. Technische Details: §11 (Lernmodell), §12 (Kartenauswahl), §14.1 (Bedienung).

- **Karteikarten:** Vorderseite Deutsch, Rückseite Spanisch (Richtung im Tab „Lernen“ für die Sitzung wählbar). Die Karte lässt sich per Tipp **beliebig oft** umdrehen. Hat eine Vokabel mehrere deutsche Wörter, stehen **alle** auf der deutschen Seite, getrennt durch „ · “ (z. B. *Auto · Wagen*). Das erste Wort ist die Hauptübersetzung. Die Rückseite zeigt zusätzlich den Beispielsatz (Spanisch und Deutsch) und, falls vorhanden, den Hinweis (`note`). Bei Verben steht auf der spanischen Seite (egal in welcher Richtung) unter dem Wort in einer eigenen, kleineren grauen Zeile der Klammerzusatz der Notation (§5.1), z. B. *(ie)*, *(e → ie, -go, Pretérito/Futuro irr.)*, *(c → qu)*, *(irr.)*; regelmäßige Verben haben keine Zeile. Bei Nomen steht auf der spanischen Seite unter dem Singular (mit Artikel) der Plural in kleinerer grauer Schrift, z. B. *el saludo* / *los saludos*, sofern eine Pluralform hinterlegt ist. Aussprache und Suche nutzen weiter nur das Wort.
- **Bewertung mit zwei Buttons:** **Nochmal** (nicht gewusst) und **Gewusst**. Jeder Button zeigt, wann die Karte wiederkommt („5 Min“, „1 T“, „8 T“ …).
- **Endlose Sitzung:** Es gibt **kein Tageslimit** und kein „Fertig für heute“. Der Nutzer lernt so lange er will und beendet selbst über „Beenden“ (zeigt eine Zusammenfassung). Jede Bewertung wird sofort gespeichert. Ist alles durch, beginnt ein neuer Durchlauf.
- **Spaced Repetition:** Nicht gewusste Wörter kommen **nach Minuten** wieder, sicher gewusste immer seltener. Pro Karte werden Fälligkeit, Intervall, Ease-Faktor und Lernschritt gespeichert (§11).
- **Konjugation aus der Sitzung:** Bei Verben öffnet ein Klick auf „Konjugation“ (erst nach dem Aufdecken) ein Overlay mit der Formentabelle, ohne die Sitzung zu verlassen.
- **Audio-Aussprache:** Browser-Sprachausgabe (Web Speech API), spanische Stimme bevorzugt `es-MX`. Ein Lautsprecher-Button steht auf der Karte, sobald die spanische Seite sichtbar ist. Automatisches Vorlesen ist ein Schalter der Lernsitzung (Standard aus, nicht gespeichert). Details und Stimmenwahl: §13.
- **Filter:** nach Thema, Niveau (A1/A2/B1), Wortart (Verb, Nomen, …).

### 3.2 Einstellungen
- Es gibt **keine Profile und kein Login**: Fortschritt und Einstellungen gelten für den Browser auf diesem Gerät.
- Einstellungen: **maximales Niveau** (A1/A2/B1, nur dieses und niedrigere Niveaus werden gelernt und in der Statistik gezählt, das Verzeichnis zeigt dagegen alle Wörter, §3.3; persistent gespeichert, jederzeit änderbar) und Theme (System/Hell/Dunkel). Die Version steht nicht hier, sondern unter „Mehr“ unterhalb der Einträge: Zeitstempel des HEAD-Commits zum Bauzeitpunkt (bei Deployment also des Merges auf `main`), beim Build aus Git in `vite.config.ts` eingesetzt, Format `TT.MM.JJJJ, HH:MM UTC`, immer in UTC.

### 3.3 Übersicht und Statistik
- Die Lernen-Seite ist die Startseite (Tab „Lernen“, Route `/`). Sie zeigt keine Zähler und keine Serie (Streak). Sie bietet Thema, Niveau, Wortart und Richtung (nur für die Sitzung, steht bei jedem Aufruf auf „Beide Richtungen“, wird nicht gespeichert) und den Button „Starten“. Das Niveau-Dropdown bietet „Alle Niveaus“ und die Niveaus bis zum Maximalniveau. Ist das Maximalniveau A1, gibt es nur dieses eine Niveau: Das Dropdown zeigt dann nur „A1“ (ohne „Alle Niveaus“), ist ausgewählt und deaktiviert (ausgegraut). Ohne Auswahl startet eine Sitzung über alle Themen.
- Statistik: Verteilung der Karten nach Reifegrad (neu, lernend, gefestigt), je Kartenrichtung und nur für das eingestellte Niveau.
- Durchsuchbares **Vokabelverzeichnis** (alphabetisch nach spanischem Stichwort ohne Artikel) mit Detailansicht inkl. aller Zusatzinfos.
- **Verzeichnissuche (Spanisch und Deutsch):** Das Suchfeld findet jede Vokabel, deren `es` oder einer der `de`-Einträge den Begriff enthält, ohne Beachtung von Groß-/Kleinschreibung, Akzenten und Umlauten (*cafe* findet *café*). So sieht der Nutzer zu einem deutschen Wort, ob er das spanische schon hat. Filter, Suchtext und Scrollposition bleiben erhalten, solange der Nutzer im Bereich des Verzeichnisses bleibt (Detailseite, Legende), ein Wechsel auf einen anderen Tab setzt sie zurück. Festlegungen (Anforderung 2026-11-19):
  - **Alle Wörter, unabhängig vom Maximalniveau:** Liste, Suche und Detailseite des Verzeichnisses zeigen **immer alle** Vokabeln (alle Niveaus). Das Niveau-Dropdown des Verzeichnisses bietet immer A1, A2 und B1. Das Maximalniveau (§3.2) steuert nur Lernen und Kartenauswahl (§12) sowie die Statistik, nicht das Verzeichnis. Ein Wort über dem Maximalniveau sieht in der Liste aus wie jedes andere (das Niveau-Kennzeichen zeigt B1 usw.). Die Detailseite eines solchen Worts trägt unter den Kennzeichen den Hinweis „Liegt über deinem Niveau (B1), wird derzeit nicht gelernt.“
  - **Suchtext und Filter wirken zusammen (UND):** Die Suche läuft innerhalb der gefilterten Liste. Thema, Niveau und Wortart lassen sich unabhängig von Suchtext setzen und ändern; der Suchtext wird dabei nie geleert. Die Suchfunktion in `domain/` berücksichtigt Filter und Suchtext gleichzeitig.
  - **Statuszeile:** Unter den Dropdowns steht in einem grünen Feld, was gerade wirkt: je ein kleiner, umrandeter Chip pro aktivem Kriterium, z. B. „Verb“, „A1“ und „„ir““ (der Suchtext in Anführungszeichen). Solange etwas aktiv ist, steht dort der Button „Filter löschen“. Gibt es Dropdown-Filter, setzt er nur Thema, Niveau und Wortart auf „Alle …“ zurück; der Suchtext bleibt. Ist nur ein Suchtext gesetzt, leert der Button das Suchfeld. Ohne Filter und ohne Suchtext entfällt die Zeile.
  - **Filter-Übersicht:** Über den Dropdowns steht die Beschriftung „Filtern nach“ mit der Anzahl gesetzter Filter („2 aktiv“). Die Dropdowns sind immer bedienbar, auch während einer Suche.
  - **Reihenfolge:** Ohne Suchtext alphabetisch nach spanischem Stichwort ohne Artikel. Mit Suchtext nach **Trefferqualität**: je Vokabel zählt der beste Treffer über `es` und alle `de`-Einträge (normalisiert wie oben; beim spanischen Stichwort zählt es mit und ohne führenden Artikel): Eintrag ist gleich dem Suchtext (Stufe 0), Eintrag beginnt damit (Stufe 1), Eintrag enthält ihn (Stufe 2). Gleiche Stufe: Treffer über `es` vor reinem `de`-Treffer, danach alphabetisch. So steht bei „Auto“ das Wort mit der Übersetzung „Auto“ vor „Autobahn“ und „Mietauto“.
  - **Keine Kennzeichnung des Treffers:** Es wird nicht markiert, ob ein Treffer über `es` oder über `de` kam. Jede Zeile zeigt ohnehin Spanisch und alle deutschen Übersetzungen (§14).
  - **Mehrere Treffer:** Alle werden gezeigt, es gibt keine Begrenzung. Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten beim Lernen mehrdeutig. Das ist eine bekannte Einschränkung der Karten, nicht der Suche, und in v1 nicht behandelt.
- **Formsuche** (gebeugte Formen finden): §3.3a, noch nicht umgesetzt.

### 3.3a Formsuche im Verzeichnis (festgelegt 2026-11-19, noch nicht umgesetzt)

**Anlass:** Auf der Reise stößt der Nutzer auf gebeugte Formen (*podemos*, *fue*, *canciones*, *buenas*), deren Grundform er kennt oder lernen will. Die Verzeichnissuche (§3.3) findet deshalb zusätzlich gebeugte Formen und führt zur Grundform. Technische Umsetzung: §14.3.

**Welche Formen gesucht werden:**
- **Verben:** alle Formen, die die Konjugationstabelle zeigt (§5, `domain/conjugation`): Presente, Pretérito indefinido, Imperfecto, Futuro (je 6 Personen, **einschließlich vosotros**), Imperativo (5 Personen), Participio, Gerundio. Die Formen werden zur Laufzeit aus derselben Erzeugung wie die Tabelle gewonnen, nie gespeichert.
- **Reflexive Verben** werden **ohne vorangestelltes Pronomen** gesucht: *levanto* findet *levantarse*. Die Eingabe *me levanto* ist kein Formtreffer, weil keine Form im Index das Pronomen enthält. Imperativformen mit **angehängtem** Pronomen, wie die Tabelle sie zeigt (*levántate*, *siéntese*, *presentémonos*), werden gefunden. Gibt es ein Verb mit und ohne *-se* als eigene Vokabeln (*ir* und *irse*), erscheinen bei gleicher Form **beide**, je mit eigener Zeile (*vamos*, *va*, *fue* → *ir* und *irse*). Das ist gewollt.
- **Nomen:** die Pluralform aus `plural`, ohne Artikel (*canciones* → *la canción*). Nomen ohne hinterlegten Plural (*el dinero*, *la ropa*) haben keine Formen. Nomen-Plurale werden nicht erzeugt.
- **Adjektive:** feminin Singular, maskulin Plural und feminin Plural. Sie werden **nach Regeln erzeugt** (§4.2, §14.3), `adj` in der JSON überschreibt nur Abweichungen. Formen, die der Grundform gleichen (*amable* f. Sg. = *amable*), sind keine eigenen Formen.
- Andere Wortarten haben keine Formen. Gesucht wird nur über die spanische Seite.

**Wann eine Form trifft:** Eingabe und Form werden normalisiert wie in der Verzeichnissuche (Groß-/Kleinschreibung, Akzente und Umlaute egal: *cancion* findet *canciones*, *podia* findet *podía*). Eine Form trifft, wenn sie
- der Eingabe **gleicht** (Formstufe 0), ab **2 Zeichen** Eingabe, damit kurze Formen wie *va*, *ve* und *es* gefunden werden, oder
- mit der Eingabe **beginnt** (Formstufe 1), erst ab **3 Zeichen** Eingabe.

„Enthält“ gilt für Formen nicht. Bei 1 Zeichen gibt es keine Formtreffer. Leerzeichen in der Eingabe sind gewöhnliche Zeichen: Nomen-Plurale aus mehreren Wörtern werden auch mit Leerzeichen gefunden (*fines de* und *fines de semana* → *el fin de semana*). Die bisherige Suche über Grundform und Deutsch (§3.3, Stufen 0 bis 2) bleibt unverändert.

**Eine Zeile je Wort:** Jede Vokabel erscheint höchstens einmal in der Trefferliste. Passt sie sowohl über Grundform/Deutsch (beste Stufe G) als auch über Formen (beste Formstufe F), ist sie ein **Formtreffer nur, wenn F < G** gilt (die Form passt genauer). Sonst ist sie ein normaler Treffer und sieht aus wie bisher. Beispiele: *come* → *comer* ist Formtreffer (Form gleich, Grundform nur Anfang); *pod* → *poder* ist normaler Treffer (beides Anfang); *poder* → normaler Treffer ohne Formhinweis.

**Reihenfolge** (Entscheidung 2026-11-19: genaue Formen nach genauen Grundformen, damit kurze Formen nicht unter vielen Teilwort-Treffern verschwinden; bei *es* gibt es 148 normale Treffer, bei *ve* 76):
1. normale Treffer der Stufe 0 (Grundform oder Deutsch gleich der Eingabe),
2. Formtreffer der Formstufe 0 (Form gleich der Eingabe),
3. alle übrigen normalen Treffer (Stufen 1 und 2),
4. Formtreffer der Formstufe 1 (Form beginnt mit der Eingabe).

Innerhalb der Gruppen 1 und 3 gilt die Reihenfolge aus §3.3, innerhalb der Gruppen 2 und 4 alphabetisch nach spanischem Stichwort ohne Artikel. Beispiele: Bei *es* steht *ser* ganz oben, vor *escalar*, *la escuela* usw. Bei *fue* stehen *ser* und *ir* vor *fuerte* (die Grundform beginnt nur mit „fue“). Bei *ve* stehen *ir* und *ver* vor *convertir*, *vender* usw. Es gibt keine Begrenzung der Trefferzahl (wie §3.3).

**Filter und Niveau:** Thema, Niveau und Wortart wirken wie bei der normalen Suche (UND, §3.3) und beziehen sich auf die Vokabel. Wie das ganze Verzeichnis zeigt die Formsuche **alle Niveaus**, unabhängig vom Maximalniveau. Die Statuszeile und die Trefferzahl („N Wörter“ o. Ä.) zählen Formtreffer wie andere Zeilen mit.

**Darstellung eines Formtreffers** (kein Chip, kein Icon, Kennzeichen ist der Pfeil):
- Zeile 1: die gefundene Form **fett**, so geschrieben, wie sie in der Tabelle steht (mit Akzenten, nicht die Eingabe), dann „→“ und die Grundform `es` (mit Artikel bei Nomen). Beispiel: **podemos** → poder; **canciones** → la canción.
- Zeile 2: die deutschen Übersetzungen wie in jeder Zeile (§14), Niveau-Kennzeichen wie bisher.
- Zeile 3, klein und grau: die Bezeichnung der Form. Passen weitere, andere Formen desselben Wortes, folgt „+ 1 weitere Form“ bzw. „+ N weitere Formen“ (N = Anzahl weiterer verschiedener Schreibungen, die auf derselben Formstufe treffen; Akzentvarianten wie *levanto*/*levantó* sind verschiedene Formen).
- **Welche Form gezeigt wird:** unter den Formen auf der besten Formstufe zuerst die, deren Schreibung **mit Akzenten** (nur Groß-/Kleinschreibung egal) zur Eingabe passt, also ihr gleicht bzw. mit ihr beginnt. Unter mehreren solchen bzw. wenn keine so passt, gilt die Tabellenreihenfolge (Presente, Indefinido, Imperfecto, Futuro, Imperativo, Participio, Gerundio; je Zeitform 1. Sg. bis 3. Pl.; bei Adjektiven f. Sg., m. Pl., f. Pl.). Beispiele: *compre* zeigt **compre** (3. Sg. Imperativo) + 1 weitere Form, *compré* zeigt **compré** (1. Sg. Pretérito indefinido) + 1 weitere Form. Das ist wichtig, weil es in den Daten rund 245 solcher Akzentpaare gibt (*saludo*/*saludó*, *pago*/*pagó* …).
- Die Zeile bleibt ein Touch-Ziel ≥ 48 px, bricht auf schmalen Bildschirmen um (kein horizontales Scrollen) und ist in Hell und Dunkel lesbar. Für Screenreader lautet die Zeile sinngemäß „podemos, Form von poder, 1. Pl. Presente“.

**Bezeichnungen (grammatisch kurz):**
- Verben: Person und Zeitform, Zeitformen mit denselben Namen wie in der Tabelle. Personen: 1. Sg. (yo), 2. Sg. (tú), 3. Sg. (él/ella/usted), 1. Pl. (nosotros), 2. Pl. (vosotros), 3. Pl. (ustedes/ellos). Beispiele: „1. Pl. Presente“, „3. Sg. Pretérito indefinido“, „2. Sg. Imperativo“, „3. Sg. Imperativo“ (usted), „Participio“, „Gerundio“.
- Gleiche Schreibung an mehreren Stellen zählt als **eine** Form mit zusammengefasster Bezeichnung. Innerhalb einer Zeitform werden die Personen in Tabellenreihenfolge mit „/“ verbunden. Personen gleicher Zahl teilen sich die Zahlangabe („1./3. Sg. Imperfecto“ bei *podía*, „1./2. Pl. …“), bei verschiedener Zahl steht jede Angabe vollständig („3. Sg./2. Pl. …“). Verschiedene Zeitformen werden in Tabellenreihenfolge mit „ · “ getrennt („1. Pl. Presente · 1. Pl. Imperativo“ bei *vamos*).
- Nomen: „Plural“.
- Adjektive: „f. Sg.“, „m. Pl.“, „f. Pl.“. Sind m. Pl. und f. Pl. gleich (*amables*), heißt es „Pl.“.

**Antippen:** öffnet die Detailseite der Grundform (`/dictionary/:id`, Zurück-Verhalten und erhaltene Filter wie §3.3). Dort werden **alle Formen hervorgehoben, die auf der besten Formstufe getroffen haben** (bei *vamos* beide Zellen; bei *pued* alle Formen von *poder* mit diesem Anfang: *puedo, puedes, puede, pueden, pueda, puedan*; bei *levanto* sowohl *levanto* als auch *levantó*). Die Seite scrollt so, dass die erste hervorgehobene Stelle sichtbar ist. Hervorhebung: Hintergrund in Akzentfarbe **und** Fettdruck (nicht nur Farbe), Kontrast in Hell und Dunkel ausreichend. Bei Nomen wird die Pluralzeile, bei Adjektiven die betreffende Form in der Zeile „Formen“ hervorgehoben. Ein normaler Treffer öffnet die Detailseite ohne Hervorhebung. Die Hervorhebung gilt nur für diesen Aufruf (Router-Zustand), ein direkter Aufruf der URL zeigt keine.

**Detailseite der Adjektive:** Die Zeile „Formen“ zeigt künftig **immer** die erzeugten Formen (bisher nur, wenn `adj` gesetzt war), im bisherigen Wortlaut „feminin … · Plural … · feminin Plural …“. Formen, die der Grundform gleichen, entfallen; sind m. und f. Plural gleich, steht nur „Plural …“. Bei unveränderlichen Adjektiven (*gratis*) entfällt die Zeile.

**Nicht Teil der Formsuche:** Pronomen vor oder in der Form (*me levanto*, *dámelo*), verneinte Imperative, zusammengesetzte Zeiten, Subjuntivo (außer dort, wo er im Imperativ steckt), Lernen aus der Suche (kein „Jetzt lernen“, das Wort wird über die normale Sitzung gelernt), Formsuche in der Lernsitzung.

**Soll-Beispiele** (Abnahme und Tests):

| Eingabe | Treffer | Art | Bezeichnung |
|---|---|---|---|
| `podemos` | poder | Form | 1. Pl. Presente |
| `vamos` | ir | Form | 1. Pl. Presente · 1. Pl. Imperativo |
| `vamos` | irse | Form | 1. Pl. Presente |
| `fue` | ser, ir, irse (je eine Zeile) | Form | 3. Sg. Pretérito indefinido |
| `fue` | fuerte | normal, steht nach ser/ir/irse | – |
| `va` | ir, irse (je eine Zeile) | Form | 3. Sg. Presente |
| `ve` | ir | Form | 2. Sg. Imperativo |
| `ve` | ver | Form, steht vor convertir, vender … | 3. Sg. Presente · 2. Sg. Imperativo |
| `es` | ser | Form, steht als erste Zeile | 3. Sg. Presente |
| `podia` | poder | Form | 1./3. Sg. Imperfecto |
| `come` | comer | Form | 3. Sg. Presente · 2. Sg. Imperativo |
| `pod` | poder | normal (keine Formzeile, F = G) | – |
| `pued` | poder | Form: **puedo** | 1. Sg. Presente + 5 weitere Formen |
| `levanto` | levantarse | Form: **levanto** | 1. Sg. Presente + 1 weitere Form |
| `levantó` | levantarse | Form: **levantó** | 3. Sg. Pretérito indefinido + 1 weitere Form |
| `levantate` | levantarse | Form | 2. Sg. Imperativo |
| `me levanto` | – (kein Formtreffer) | – | – |
| `compre` | comprar | Form: **compre** | 3. Sg. Imperativo + 1 weitere Form |
| `canciones` | la canción | Form | Plural |
| `fines de` | el fin de semana | Form | Plural |
| `buenas` | bueno | Form | f. Pl. |
| `amables` | amable | Form | Pl. |
| `pu` | – (2 Zeichen: nur genaue Formen, keine Form heißt „pu“) | – | – |
| `v` | – (1 Zeichen: keine Formtreffer) | – | – |

Beispiele mit Wörtern, die es (noch) nicht in den Daten gibt, prüfen die Tests mit eigenen Testvokabeln.

### 3.4 PWA
- Web-Manifest, Icons, Service Worker (App-Shell und Vokabeldaten gecacht), komplett offline nutzbar.

## 4. Vokabeln: Umfang und Datenmodell

### 4.1 Umfang
- Es gibt keinen festen Gesamtumfang und keine Kontingente je Thema, Wortart oder Niveau, die Liste darf wachsen. Jedes Thema hat mindestens 10 Einträge (der Validator prüft das). Themenschwerpunkte: `docs/VOKABELN.md`.
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
- Adjektive: `es` steht in der maskulinen Singularform. Feminin- und Pluralformen werden nach Regeln erzeugt (§14.3, Standard: -o → -a/-os/-as, sonst +s/+es). Optional `adj: { "f": "...", "pl": "...", "fpl": "..." }` nur für Formen, die von diesen Regeln abweichen. Das Feld ist nur bei `pos: "adj"` erlaubt.
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
| *(i → y)* | i → y zwischen Vokalen: bei -uir-Verben (Tag `y`) im Presente, Pretérito und Gerundio, bei -eer/-aer/-oír (automatisch) nur im Pretérito (3. Person) und Gerundio | *construir (i → y)*: construyo, construyó; *leer (i → y)*: leyó, leyendo |
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
- **Rechtschreibänderungen** (*busqué*, *empecé*, *llegué*, *cojo*) braucht niemand zu taggen. Das Modul erkennt sie automatisch am Wortende und zeigt sie als `(c → qu)` usw. Dazu gehört auch `(i → y)` bei Verben auf -eer, -aer und -oír (*leer*, *creer*, *caer*, *oír*: *leyó*, *leyendo*). Bei -uir-Verben steht `(i → y)` dagegen für das Tag `y`.

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
- Ein Verb ohne Tags und ohne Overrides ist regelmäßig.
- Ein Override, der der generierten Form entspricht, ist ein Fehler (Redundanz).
- Ein Tag muss zum Stamm passen (`ue` braucht ein `o` oder `u` im Stamm, `ie`/`i` ein `e`, `y` ein Verb auf -uir usw.).
- Schlüssel (Zeiten, Personen, Tags) müssen aus den erlaubten Listen stammen.
- `reflexive` muss zur Endung passen: `true` genau dann, wenn `es` auf *-se* endet.
- Bei Nomen muss der Artikel in `es` zu `gender` passen (*el* → `m`, *la* → `f`, *el/la* → `m/f`). Ausnahme: *el* vor betontem a- bei femininen Nomen (*el agua*). *los*/*las* sind frei.
- `verb` ist bei `pos: "verb"` vorhanden, sonst nicht.
- Ein Tag muss eine Wirkung haben (die erzeugten Formen ändern sich, `irr` ausgenommen). `irr` braucht `overrides`.
- Alle Einträge: `id` im Format `v` plus vier Ziffern, eindeutig. IDs werden nie wiederverwendet, `topic` passt zur Datei, keine Leerzeichen am Rand, `gender`/`plural` nur bei Nomen, `adj` nur bei Adjektiven. Nomen brauchen Artikel und `gender`.
- Dubletten über alle Themen (`domain/findDuplicate.ts`): verglichen wird klein geschrieben und ohne führenden Artikel (*el/la, el, la, los, las, un, una*), Akzente bleiben erhalten. Gleiche Form und gleiche Wortart sind ein Fehler. Gleiche Form bei anderer Wortart oder nur im Akzent verschieden ist eine **Warnung** (*papa/papá*, *te/té*).
- Themen: Jedes Thema hat mindestens 10 Einträge. `index.json` führt jedes Thema des Schemas (Feld `topic`) mit der Datei `<key>.json`.
- Das Konjugationsmodul wird zusätzlich gegen eine **Referenzliste bekannter Verben mit allen Formen** getestet (siehe unten).

Zusätzlich gilt für jedes Verb:
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
- Keine Tracker, keine externen Dienste, alles offline.

---

# Teil B: Technik

## 8. Stack (festgelegt)

| Bereich | Wahl |
|---|---|
| Build | Vite 8, TypeScript (strict) |
| UI | React 19, `react-router-dom` mit **HashRouter** (`/#/...`, damit der statische Host keine SPA-Fallback-Regel braucht) |
| Styling | Plain CSS mit CSS-Variablen (`src/styles/`), kein UI-Framework. Hell/Dunkel via `prefers-color-scheme` und `data-theme` |
| Speicher | IndexedDB über `idb` |
| PWA | `vite-plugin-pwa`, `registerType: 'prompt'` |
| Tests | Vitest (`npm test`) für reine Logik in `domain/` (SRS, Tageswechsel, Warteschlange, Konjugation, Dublettenprüfung, Statistik, Verzeichnissuche, Sprachausgabe, Versionsstempel), für `data/` (Karten, Vokabeln, Begrüßungs-Flag) mit `fake-indexeddb` und für den Vokabel-Validator. Keine Komponenten-Tests. UI-Verhalten (Verzeichnis-Filter und Scrollposition in `features/dictionary/viewState`, Schalter, Dropdowns, Richtung im Lernen-Tab) deckt der Browser-Smoke-Test (`scripts/browser-smoke.ts`, braucht `npm run build` und `npm run preview`) ab. `src/styles/global.test.ts` schützt Dunkelmodus-Kontrast, Dropdown-Pfeil und Schalter, `features/legend/notations.test.ts` stellt sicher, dass die Legende jede erzeugte Notation erklärt. |
| Dev-Tools | `tsx` (führt `scripts/*.ts` aus), `ajv` (JSON-Schema-Validierung der Vokabeln), `sharp` (PWA-Icons aus dem SVG) |
| Lint | ESLint (`@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, jeweils Empfehlungen), Prettier Defaults |
| Node | 24.x |

Keine weiteren Runtime-Abhängigkeiten ohne Grund (State: React `useReducer`/Context, kein Redux/Zustand).

## 9. Projektstruktur (im Repo-Root)

```
package.json  vite.config.ts  tsconfig.json  index.html
.github/workflows/pages.yml  README.md  AGENTS.md
docs/                       # SPEC.md, TASKS.md, VOKABELN.md, ABNAHME.md
public/
  vocab/<thema>.json        # Vokabeln je Thema
  vocab/index.json          # Liste der Themen-Dateien
  vocab/NOTICE.md           # Quellen- und Lizenzhinweis (Wiktionary, CC BY-SA)
  icons/                    # Logo-SVG und PWA-Icons
scripts/
  validate-vocab.ts         # Aufruf von `npm run validate:vocab`
  validateVocab.ts          # Schema/ID/Dubletten/Verbformen (+ Test)
  vocab.schema.json         # JSON-Schema der Vokabeldateien
  make-icons.ts             # PWA-Icons aus public/icons/logo.svg
  browser-smoke.ts          # End-to-End-Test im echten Browser
src/
  main.tsx  App.tsx         # App.tsx: HashRouter, Routen, Layout
  version.ts                # Versionsstempel (__APP_VERSION__ aus vite.config.ts)
  domain/                   # reine Logik, KEINE React/DOM-Imports (Tests liegen daneben)
    types.ts                # Vocab, Card, Settings, ...
    srs.ts                  # Lernmodell
    day.ts                  # Tageswechsel 04:00
    queue.ts                # Auswahl der nächsten Karte
    dictionary.ts           # Verzeichnissuche, Filter, Wortart-Labels
    findDuplicate.ts        # Dublettenprüfung (Vokabel-Validator)
    stats.ts                # Statistik
    speech.ts               # Stimmenwahl, Sprechtext
    versionStamp.ts         # Formatierung des Versionsstempels
    conjugation/            # Konjugationsmodul
  data/
    vocabRepo.ts            # lädt/cached vocab JSON
    db.ts                   # idb-Schema (settings, cards)
    settingsRepo.ts  cardRepo.ts
    welcomeFlag.ts          # Begrüßung gesehen (localStorage)
  features/
    study/  dictionary/  stats/  settings/  legend/  legal/  more/
  components/               # Flashcard, Speaker, VerbTable, VerbDetail, VerbOverlay, WelcomeOverlay, Brand, TabBar, UpdateBanner, ...
  hooks/                    # useAppData (Vokabeln + Einstellungen als Kontext), useSpeech
  styles/                   # global.css
```

Regel: `domain/` ist rein und testbar. `data/` kapselt IndexedDB. `features/` enthält Screens.

## 10. Datenmodell

### 10.1 Vokabeln (statisch, JSON)
Schema wie §4.2. TypeScript-Typen in `domain/types.ts`:

```ts
type Level = 'A1' | 'A2' | 'B1';
type Pos = 'verb' | 'noun' | 'adj' | 'adv' | 'num' | 'phrase' | 'other';
const LEVEL_ORDER: Record<Level, number> = { A1: 1, A2: 2, B1: 3 }; // immer hierüber vergleichen, nie per String
// isVisible(v, maxLevel) = LEVEL_ORDER[v.level] <= LEVEL_ORDER[maxLevel]  (einzige Sichtbarkeitsregel, in domain/)
interface Vocab {
  id: string;            // "v0042", stabil, nie wiederverwenden
  de: string[];          // 1–4 Einträge, [0] = Hauptübersetzung; es: Spanisch (Nomen mit Artikel)
  es: string; pos: Pos;
  level: Level;          // A1, A2 oder B1
  topic: string;         // einer der 13 Schlüssel (siehe unten)
  example: { es: string; de: string };  // Pflicht
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
{ "topics": [ { "key": "begruessung", "label": "Begrüßung & Höflichkeit", "file": "begruessung.json" }, ... ] }
```
Feste Themen-Schlüssel (13): `begruessung`, `zahlen-zeit`, `essen`, `transport`, `unterkunft`, `einkaufen`, `gesundheit`, `natur`, `orte`, `kultur`, `maya`, `smalltalk`, `grundwortschatz`. `Vocab.topic` ist immer einer dieser Schlüssel, die Labels (deutsch) kommen aus `index.json` und werden für die Filter genutzt. Jede Themendatei ist ein JSON-Array von `Vocab`. Der Loader lädt alle Dateien einmal je Seitenaufruf, validiert minimal (id, de, es, level, ungültige Einträge werden mit Warnung übersprungen) und liefert eine `Map<id, Vocab>`. `vocabRepo` lädt alle statischen Vokabeln in eine Map.

### 10.2 IndexedDB (`palabrita`, Version 1)

| Store | Key | Wert |
|---|---|---|
| `settings` | `'main'` (ein Datensatz) | `{ maxLevel: Level, theme: 'system'\|'light'\|'dark' }` (Defaults: B1, system). Die Richtung ist keine Einstellung, sondern gilt nur für die Sitzung (§3.3). |
| `cards` | `[vocabId, dir]` | `{ vocabId, dir: 'de-es'\|'es-de', due: number(ms), interval: number(Tage), ease: number, reps: number, lapses: number, lastReviewed: number\|null, state: 'new'\|'learning'\|'mature', step?: 0\|1 }`. `step`: siehe §11. |

Es gibt **keine Profile** (entschieden, siehe §3.2): ein Nutzer pro Browser. Zwischen Geräten gibt es keine Übertragung des Fortschritts. Eine Karte wird nur gespeichert, wenn die Bewertung sie ändert (nicht bei „Gewusst“ in der Vorab-Wiederholung, §11).

Eine Karte wird **erst beim ersten Lernen angelegt** (kein Vorab-Befüllen von 1000 Karten). „Neu“ = Vokabel ohne Card-Eintrag für diese Richtung.

Beide Stores werden beim Anlegen erzeugt. Es gibt keine Migrationen: Das Projekt hat noch keine Nutzer, das Schema ist die Version 1 (`data/db.ts`). Ein früher angelegter Store `userVocab` wird nicht mehr gelesen und nicht gelöscht. Vokabel-IDs bleiben stabil, Cards referenzieren nur `vocabId`. Nicht mehr vorhandene `vocabId`s werden beim Laden ignoriert (nicht gelöscht).

## 11. Lernmodell (`domain/srs.ts`)

**Tageswechsel (`domain/day.ts`):** `dayKey(now)` = lokales Datum von `now − 4 h`. `startOfDay(dayKey)` liefert 04:00 lokal. `addDays` rechnet in **Kalendertagen** auf dem `dayKey`, nicht mit `+ 24 h`, damit Zeitumstellungen nichts verschieben.

Reine Funktion `review(card, grade, now): Card`. `Grade` ist `"again" | "good"` (Beschriftung: „Nochmal“, „Gewusst“).

**Phase einer Karte** (`Card.step?: 0 | 1`, `domain/types.ts`): Ist `step` gesetzt, ist die Karte in der **Lernphase** (Minutenabstände). Fehlt `step`, ist sie in der **Wiederholungsphase** (Tagesabstände).

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
- **Gewusst:** `interval = max(interval + 1, round(interval × ease))` mit der Ease **vor** dieser Bewertung, danach `ease = min(MAX_EASE, ease + EASE_GAIN)`, `reps += 1`, `due = startOfDay(addDays(dayKey(now), interval))`, also 04:00 des Tages „heute + neues Intervall“ (nicht vom alten Fälligkeitsdatum aus gerechnet).
- Die Schwierigkeit eines Wortes steckt allein in der Ease: Jedes „Nochmal“ senkt sie, jedes „Gewusst“ hebt sie leicht. Wörter, an denen der Nutzer oft scheitert, wachsen dadurch langsam (bei Ease 1,3 nur ×1,3), sichere Wörter immer schneller. Beispiel bei durchgehend „Gewusst“: ≈ 1, 3, 8, 21, 56 Tage.

**Vorab-Wiederholung** (Karte in der Wiederholungsphase, aber **noch nicht fällig**, siehe §12.2). Der Zeitplan darf durch Üben nicht aufgebläht werden:
- **Nochmal:** wie Rückfall oben (bewusst hart: `lapses += 1`, `reps = 0`, Ease −0,2, Intervall 1 T). Wer beim freiwilligen Durchlauf ein Wort nicht mehr weiß, hat es wirklich vergessen, auch wenn es eine Karte mit z. B. 56 Tagen Intervall war. Der Plan wird dadurch verkürzt, aber nie verlängert.
- **Gewusst:** Karte bleibt **vollständig unverändert**, auch `lastReviewed` (entschieden). Es wird nichts gespeichert. In der Sitzung zählt es trotzdem zu „Geübt: N“ und die Karte kommt in `sessionSeen`.
- `review()` bekommt dafür keinen Zusatzparameter: „nicht fällig“ wird in der Funktion aus `card.due >= nextDayStart(now)` erkannt.

**Ease-Rundung:** Die Ease wird nach jeder Änderung auf 2 Dezimalstellen gerundet (gegen Gleitkomma-Rauschen wie 2,3499999) und danach auf `MIN_EASE`/`MAX_EASE` begrenzt.

`state`: `learning` solange `step` gesetzt ist oder `interval < 21`, sonst `mature`. (`new` nur für noch nicht gespeicherte Karten.)

`previewIntervals(card, now)` liefert je Button entweder Minuten oder Tage. `formatInterval` hat eine Minuten-Variante („5 Min“, „1 Std“ ab 60 Min). Bei Tagen: „1 T“ bis „29 T“, ab 30 Tagen Monate („2 Mon“, auf ganze Monate gerundet), ab 365 Tagen Jahre („1,2 J“, eine Nachkommastelle). Vorschau bei Vorab-Wiederholung: „Gewusst“ zeigt das unveränderte Fälligkeitsdatum.

**Jede Bewertung, die etwas ändert, wird gespeichert** (`saveReview`). Ausnahme: „Gewusst“ bei der Vorab-Wiederholung (siehe oben).

## 12. Auswahl der nächsten Karte (`domain/queue.ts`)

### 12.1 `pickNext`

Die Funktion **`pickNext(input)`** wählt die nächste Karte. Sie ist **rein** (kein Zugriff auf Datenbank oder Uhr, `now` kommt als Parameter) und wird nach **jeder** Bewertung neu aufgerufen. Eingabe: Einstellungen (`maxLevel`), Vokabeln, alle Cards, `now`, Sitzungsfilter (Thema, Niveau, Wortart, Richtung), `sessionSeen: Set<string>` (Kartenschlüssel `vocabId|dir`, siehe §12.2), `lastShown: string | null`. Rückgabe: `{ kind, item, newPass }` oder `null` (keine sichtbare Karte). `kind` nennt die Stufe (`learning`, `review`, `new`, `early-learning`, `pass`), bei `newPass` leert der Aufrufer `sessionSeen`.

Sichtbarkeit und Filter: Sichtbar sind nur Vokabeln mit `isVisible(v, settings.maxLevel)` danach Filter (Thema, Niveau, Wortart). Erlaubte Richtungen: bei der Sitzungsrichtung `both` (Standard) beide, sonst nur die gewählte. Karten ausgeblendeter Vokabeln oder Richtungen bleiben unverändert in der DB.

Priorität, die erste passende Stufe gewinnt:

1. **Lernkarten fällig:** Karten mit `step` gesetzt und `due <= now`, die am längsten überfällige zuerst.
2. **Wiederholungen fällig:** Karten ohne `step`, `due < nextDayStart(now)` mit `nextDayStart = startOfDay(addDays(dayKey(now), 1))` (04:00 des Folgetags, **exklusiv**: eine Karte mit `due` = morgen 04:00 ist heute **nicht** fällig), sortiert nach `due`.
3. **Neue Karte einführen**, wenn weniger als `MAX_LEARNING = 25` Karten gleichzeitig in der Lernphase sind (`step` gesetzt, sichtbar und im Filter). Das verhindert, dass 500 neue Wörter auf einmal „offen“ werden, und ersetzt das Tageslimit. Reihenfolge der neuen Karten: nach `id` der Vokabel, je Wort zuerst DE→ES.
   - **Partnerkarte:** Die Karte der zweiten Richtung (ES→DE) einer Vokabel wird erst eingeführt, wenn die erste Richtung die Lernphase abgeschlossen hat (kein `step`, Card existiert), damit sie die Lösung nicht verrät. Gibt es nur gesperrte Partnerkarten, wird Stufe 3 übersprungen.
   - Die Sperre gilt nur, wenn die Partnerkarte (DE→ES) in der Sitzungsrichtung liegt **und noch nicht abgeschlossen ist** (keine Card oder Card mit `step`). Ist DE→ES ausgeschlossen (z. B. Richtung nur ES→DE), ist ES→DE nicht gesperrt. Eine existierende Card wird nie nachträglich gesperrt, die Sperre betrifft nur das **Einführen** neuer Karten.
4. **Wartende Lernkarte vorzeitig zeigen** (`step` gesetzt, `due > now`, noch nicht fällig): Die Lernkarte mit dem frühesten `due` wird **sofort** gezeigt, statt auf den Ablauf der 5 bzw. 30 Minuten zu warten. Die Stufe steht **vor** Stufe 5. Grund: Stünde die Vorab-Wiederholung davor, würden wenige Wiederholungskarten alle Lernkarten blockieren, bis deren Wartezeit abgelaufen ist (Regressionstest „rapid 'good' …“ in `queue.test.ts`). Es gibt **keinen Wartezähler und keinen „Jetzt zeigen“-Button** (entschieden). Folge: Bei wenigen Karten wirken die Minutenpausen kaum, der Nutzer sieht dieselben Karten schnell wieder. Das ist gewollt. Fällige Lernkarten (Stufe 1) und fällige Wiederholungen (Stufe 2) haben weiterhin Vorrang.
5. **Vorab-Wiederholung („von vorn“):** nur wenn keine Lernkarte mehr wartet, siehe §12.2.
6. Gibt es überhaupt keine sichtbare Karte (leeres Filterergebnis, Niveau zu niedrig): Hinweis „Keine Karten für diese Auswahl“ mit Link zur Filterauswahl. Oben mittig steht das Logo wie auf der Zusammenfassung (§14.1), die Tab-Leiste ist ausgeblendet. Das ist der **einzige** Fall, in dem die Sitzung leer ist.

Die Karte, die gerade bewertet wurde (`lastShown`), wird nie sofort wieder gewählt, wenn eine andere Karte zur Verfügung steht. Das gilt auch bei „Nochmal“ mit nur einer Restkarte: Dann greift Stufe 4 mit der frühesten **anderen** wartenden Lernkarte. Gibt es gar keine andere Karte, wird dieselbe Karte erneut gezeigt (der Sitzungsbildschirm bleibt nie leer).

Eine neue Karte wird erst **beim ersten Bewerten** angelegt (§10.2), nicht beim Anzeigen.

### 12.1a Überarbeitung der Kartenauswahl (Anforderung 2026-11-19, noch nicht umgesetzt, Detailspezifikation folgt)

Der Algorithmus, nach dem die nächste Karte angezeigt wird (`pickNext`, §12.1), soll **dringend überarbeitet** werden. Der bisherige Stand ist für den Nutzer nicht zufriedenstellend. Konkrete Mängel und Sollverhalten werden in der Detailspezifikation festgelegt. Bis dahin bleibt §12.1 gültig, und die Änderung darf die Regeln in §11 (SRS-Modell) nicht verletzen, solange nicht ausdrücklich anders beschlossen.

Offen für die Spezifikation: welche Reihenfolge und Mischung von fälligen, lernenden und neuen Karten gewünscht ist, wie stark „Nochmal“-Karten zurückkehren sollen, und ob sich die Auswahl je Richtung oder über beide Richtungen hinweg verhält.

### 12.2 Durchlauf („alles durch, dann von vorn“)

Sind Stufe 1–4 leer (nichts fällig, keine wartende Lernkarte, keine neuen Karten übrig), wird **vorzeitig wiederholt**:
- Kandidaten: alle sichtbaren, gefilterten Karten in der Wiederholungsphase, die noch **nicht** in `sessionSeen` stehen, sortiert nach `due` aufsteigend (am bald fälligsten zuerst).
- Jede **bewertete** Karte kommt in `sessionSeen` (auch bei Stufen 1 bis 4). Eine nur angezeigte, nicht bewertete Karte zählt nicht. Sind alle Kandidaten durch, wird `sessionSeen` geleert und der Durchlauf beginnt von vorn. Eine kurze Einblendung „Neuer Durchlauf“ ist optional.
- Bewertung dieser Karten nach der Regel **Vorab-Wiederholung** (§11), damit die Intervalle nicht verfälscht werden.
- `sessionSeen` lebt nur im Speicher der Sitzung (nicht gespeichert).

## 13. Audio (`hooks/useSpeech.ts`)

`speechSynthesis`; Stimmen laden über `voiceschanged`. Auswahl: `es-MX` → `es-US` → `es-*` → erste mit `lang` beginnend mit `es`. Nicht verfügbar: Hinweisbanner „Keine spanische Stimme gefunden“, Button deaktiviert. Gesprochen wird immer der spanische Text `es` **inklusive Artikel** (*el autobús*). Text in Klammern wird entfernt, bei Alternativen mit `/` (*el/la turista*) wird nur die erste gesprochen.

**Auto-Vorlesen** ist ein Schalter in der Lernsitzung (Standard aus, nur für diese Sitzung). Es liest **einmal je Karte** vor, nämlich wenn die spanische Seite zum ersten Mal sichtbar wird. Weiteres Hin- und Herdrehen löst es nicht erneut aus. Der 🔊-Button funktioniert, solange die spanische Seite sichtbar ist.

## 14. Routing und Screens

HashRouter. Routen: `/` Lernen (Auswahl und Sitzung), `/dictionary`, `/dictionary/:id`, `/stats`, `/settings`, `/legend`, `/privacy`, `/imprint`, `/more`. Unbekannte Pfade leiten auf `/` um.

**Tab „Mehr“:** Markenkopf (Wortmarke, Slogan, Widmung, siehe §14.1 zum erneuten Öffnen der Begrüßung), darunter die Einträge Einstellungen, Legende, Datenschutz und Impressum, darunter die Version (§3.2). Die Seiten dieser Einträge haben den Zurück-Link „← Mehr“ (Klasse `back`). Ausnahme **Legende**: Wird sie aus der App geöffnet (ⓘ in der Verbtabelle, „Was bedeuten sie?“ im Wortformular), steht dort „← Zurück“ und führt zur vorherigen Seite (Router-Zustand `fromApp`), damit Filter und Verzeichnisbereich (§3.3) erhalten bleiben. Nur über „Mehr → Legende“ steht „← Mehr“.

**Darstellung mehrerer Übersetzungen:** Überall, wo die deutsche Seite erscheint (Karte, Verzeichnis, Detailansicht), werden alle `de`-Einträge mit „ · “ getrennt angezeigt, das erste hervorgehoben. Die Verzeichnissuche: §3.3. Die Einstellungen werden beim ersten Start mit Defaults angelegt.

Layout: mobile-first, untere Tab-Leiste (Lernen, Verzeichnis, Statistik, Mehr). Touch-Ziele ≥ 48 px.

**Logo:** Auf allen Seiten außer „Mehr“ steht oben rechts an derselben Stelle das Logo: drei Wimpel über dem Schriftzug „Palabrita“ (`components/Brand.tsx`, Komponente `Logo`, eingesetzt in `App.tsx` als `.corner-logo`). Neue Seiten bekommen es automatisch, wenn sie unter der Layout-Route liegen. Überschriften lassen rechts Platz dafür. Der Zurück-Link „← Mehr“ oben links steht in derselben Zeile, seine Mitte liegt auf der Mitte des Logos. In der Lernsitzung steht das Logo mittig in der Leiste, zwischen Zähler und „Beenden“; die Leiste hat gleich breite Spalten, damit das Logo exakt mittig bleibt. Auf der Zusammenfassung und beim Hinweis „Keine Karten für diese Auswahl“ steht es oben mittig in einer gleich hohen Leiste, ebenfalls ohne Ecken-Logo. Der Markenkopf im Tab „Mehr“ nutzt die große Wortmarke.

### 14.1 Lernsitzung (`features/study/Study.tsx`)

**Begrüßung beim Erststart** (`components/WelcomeOverlay.tsx`, Flag in `data/welcomeFlag.ts`):
- Beim ersten Öffnen liegt über der Lernseite (`/`) eine schwebende Lernkarte. Vorderseite Spanisch („¡Bienvenido a“ über der Wortmarke „Palabrita“), Rückseite Deutsch („Willkommen zu“ über derselben Wortmarke). Die Wortmarke ist dieselbe Komponente wie der Markenkopf im Tab „Mehr“ (`components/Brand.tsx`). Der Rest der App ist solange `inert`.
- Erstes Tippen dreht die Karte um, zweites Tippen schließt das Overlay. Enter oder Leertaste wirken wie Tippen. Beim Erststart reagiert die Fläche neben der Karte nicht: es muss die Karte angetippt werden.
- Gemerkt wird das Schließen pro Gerät in `localStorage` (`palabrita.welcomeSeen`), nicht in IndexedDB. Ist der Speicher nicht nutzbar, erscheint der Hinweis nicht.
- Erneut öffnen: Ein Tippen auf den ganzen Markenblock im Tab „Mehr“ (Wimpel, Schriftzug, Slogan und Widmung) zeigt dieselbe Karte, wieder Spanisch vorne. Umdrehen und Schließen funktionieren gleich, danach bleibt man auf „Mehr“. Ein Klick auf die Fläche neben der Karte schließt sie beim erneuten Öffnen sofort. Das speichert nichts, und der Erststart-Zustand ändert sich dadurch nicht. Die Karte liegt in `Layout` (`App.tsx`) über der App, die Unterseite bekommt `openWelcome` über den Router-Kontext.

**Karte umdrehen** (`components/Flashcard.tsx`):
- Klick/Tippen auf die Karte **wechselt** zwischen Vorder- und Rückseite, beliebig oft (`onToggle` in `Flashcard`).
- Beim Wechsel zu einer neuen Karte startet sie immer auf der Vorderseite.
- Sobald die Karte **einmal aufgedeckt** wurde (`revealed = true`), bleiben die Bewertungsbuttons sichtbar, auch wenn der Nutzer wieder auf die Vorderseite zurückdreht. Vor dem ersten Aufdecken steht statt der Buttons der Button „Umdrehen“ (er dreht ebenfalls um und setzt `revealed`).
- Der Hinweis „Tippen zum Umdrehen“ steht auf **beiden** Seiten. `aria-label` je Seite („Karte umdrehen“), zusätzlich `aria-pressed` bzw. gleichwertig; Tastatur (Enter/Leertaste) funktioniert, weil die Karte ein `button` bleibt.
- Die Flip-Optik (Klasse `flipped`) darf bleiben oder animiert werden. Pflicht ist nur das Verhalten. `prefers-reduced-motion` respektieren, falls animiert wird.

**Konjugation öffnen:**
- Gilt nur für Vokabeln mit `pos === "verb"`. Bei allen anderen Wörtern gibt es den Button nicht.
- Der Button **„Konjugation“** erscheint, sobald `revealed = true` ist (auf Vorder- und Rückseite). Vorher nicht, weil die Verbtabelle bei DE→ES die Lösung verrät.
- Klick öffnet ein **Overlay** (Bottom-Sheet auf dem Handy, zentrierter Dialog ab Tablet-Breite) **über** der Sitzung. Die Sitzung (Karte, Seite) bleibt unverändert und geht nicht verloren.
- Inhalt: Kopf mit Stichwort (`es`), deutschen Bedeutungen und 🔊, darunter die `VerbTable`. Der Inhalt ist eine **gemeinsame Komponente** (`components/VerbDetail.tsx`), die `VocabDetail` und das Overlay (`components/VerbOverlay.tsx`) beide nutzen. Kein duplizierter Code.
- Schließen: Button „Schließen“, Escape, Klick auf den Hintergrund und die **Zurück-Taste des Geräts** (Overlay erzeugt einen History-Eintrag, Zurück schließt nur das Overlay und verlässt nicht die Sitzung). Fokus wandert beim Öffnen ins Overlay, bleibt dort gefangen und kehrt beim Schließen zum Button zurück. `role="dialog"`, `aria-modal`, beschriftet.
- Solange das Overlay offen ist, sind Karte und Bewertungsbuttons darunter nicht bedienbar.
- **Wegwischen nach unten (nur Handy-Breite, unter 700 px):** Das Bottom-Sheet folgt dem Finger, wenn man von beliebiger Stelle des Sheets nach unten zieht (`hooks/useSwipeToClose.ts`, Touch-Ereignisse). Die Geste greift nur, wenn der Inhalt ganz oben steht, sonst scrollt der Inhalt (`overscroll-behavior: contain` verhindert Pull-to-Refresh). Nach etwa 8 px Zug beginnt das Ziehen, mehrere Finger brechen ab. Beim Loslassen schließt das Sheet, wenn es mindestens 30 % seiner Höhe heruntergezogen wurde oder schnell genug (ab 0,5 px/ms und mindestens 24 px, Flick); sonst federt es zurück. Entscheidung in `components/swipeClose.ts` (Unit-Test). Das Schließen gleitet in 200 ms aus dem Bild, der Hintergrund blendet mit der Zugweite aus; bei `prefers-reduced-motion` geschieht beides ohne Animation. Geschlossen wird über denselben Weg wie der Schließen-Button (History-Eintrag, Zurück-Taste). Oben am Sheet steht eine dezente Griffleiste als Hinweis (nur Handy-Breite). Ab 700 px (zentrierter Dialog) gibt es Griffleiste und Geste nicht (Annahme). Schließen-Button, Escape, Hintergrund und Zurück-Taste bleiben erhalten.

**Sitzungsverhalten:**
- Oben immer sichtbar: Button **„Beenden“**, ohne Rückfrage. Er führt zur Zusammenfassung. Auch Wegnavigieren oder Schließen der App ist ohne Datenverlust möglich, weil jede Bewertung sofort gespeichert wird.
- Bewertungsbuttons „Nochmal“ und „Gewusst“ mit Vorschau des Wiedersehens (`previewIntervals`).
- **Navigation:** Die Sitzung (Zähler „Geübt“, gewählte Filter und Richtung, `sessionSeen`) lebt nur im Speicher der Lernen-Seite. Wechselt der Nutzer in einen anderen Tab und kommt zurück, beginnt er wieder bei der Filterauswahl, der Zähler ist zurückgesetzt. Bewertungen gehen dabei nicht verloren, weil jede sofort gespeichert wird (§11).
- Wer später wieder lernt, bekommt zuerst, was fällig ist (auch Minuten-Karten, die inzwischen überfällig sind), dann neue Wörter, dann Wiederholung des Restes (§12).
- Es gibt keinen Fortschrittsbalken (die Sitzung hat kein Ende). Oben steht links der Zähler dieser Sitzung: die Zahl groß, darunter klein „GEÜBT“ (gestapelt, ohne Hintergrund). Er ist höchstens so hoch wie der Button „Beenden“ (40 px), damit die Leiste nicht höher wird. In der Mitte das Logo (Wimpel über dem Schriftzug), rechts „Beenden“.
- **Zusammenfassung** („Sitzung beendet“): Oben mittig das Logo an exakt derselben Stelle wie in der Sitzungsleiste, darunter der Titel und zwei große Kacheln: links die Anzahl geübter Karten, rechts die Anzahl „Nochmal“ (eine Lerndauer gibt es nicht, entschieden), darunter nur der Button „Beenden“ (zurück zur Filterauswahl, Filter zurückgesetzt). Ein Button „Weiterlernen“ gibt es nicht (entschieden 2026-11-19).

### 14.2 Impressum und Datenschutz

- Erreichbar über „Mehr“ (je ein Eintrag, eigene Seite unter `/imprint` und `/privacy`). Gleiche Gestaltung wie die Legende.
- **Datenschutz:** beschreibt den tatsächlichen Stand. Kein Backend, kein Konto, kein Tracking, keine Analyse-Werkzeuge. Fortschritt liegt nur im Browser (IndexedDB) und verlässt das Gerät nicht. Es gibt keine externen Anfragen außer dem Abruf der App. Das Hosting (GitHub Pages) erzeugt beim Abruf technisch übliche Zugriffsdaten beim Anbieter; der Hinweis darauf gehört hinein.
- **Impressum:** Angaben zum Betreiber (Name, Anschrift, Kontakt). Diese Angaben liefert der Nutzer, sie werden nicht erfunden. Der Nutzer hat entschieden (2026-11-19): Das Impressum ist in dieser Form ausreichend.
- Umsetzung: `src/features/legal/` (`Imprint.tsx` unter `/imprint`, `Privacy.tsx` unter `/privacy`, Betreiberangaben zentral in `operator.ts`). Beide Seiten sind Teil der App und damit offline verfügbar. Die Datenschutzerklärung nennt Hosting (GitHub Pages), lokale Speicherung (§ 25 Abs. 2 Nr. 2 TDDDG, keine Einwilligung nötig), Vorlesefunktion, E-Mail-Kontakt und Betroffenenrechte; Aufsichtsbehörde: HBDI. Das Impressum folgt § 5 DDG. Wiktionary-Lizenzhinweis (CC BY-SA) steht im Impressum. Die Erklärung enthält eine Übersicht der Verarbeitungen und einen abgesetzten Widerspruchshinweis (Art. 21 Abs. 4 DSGVO). Ändern sich Hosting, Dienste oder Betreiberangaben, müssen beide Seiten angepasst werden.

### 14.3 Formsuche: Umsetzung (festgelegt 2026-11-19, noch nicht umgesetzt)

Verhalten: §3.3a. Hier steht, wie es gebaut wird. Es gibt keine neue Seite und keine neue Route.

**Domäne (rein, ohne React/DOM, mit Vitest getestet):**
- `domain/adjectiveForms.ts`: `adjectiveForms(v: Vocab): { f: string; pl: string; fpl: string }` erzeugt die Formen eines Adjektivs aus `es` nach den Regeln unten. Jedes in `v.adj` gesetzte Feld ersetzt die erzeugte Form. Die Detailseite (§3.3a) und der Formenindex nutzen beide nur diese Funktion.
- `domain/forms.ts`: Formenindex und Formsuche.
  - `FormSlot` beschreibt, wo eine Form steht: `{ kind: 'verb'; tense: Tense; person: Person }`, `{ kind: 'verb'; tense: 'participio' | 'gerundio' }`, `{ kind: 'plural' }`, `{ kind: 'adj'; which: 'f' | 'pl' | 'fpl' }`.
  - `buildFormIndex(vocab: Iterable<Vocab>): FormIndex` erzeugt je Vokabel alle Formen mit Slot, Originalschreibung und normalisierter Schreibung (`normalizeForSearch` aus `domain/dictionary.ts`). Verben über `conjugate()` (`domain/conjugation`), also exakt die Formen der Tabelle. Bei reflexiven Verben wird außerhalb des Imperativs das vorangestellte Pronomen (`me`, `te`, `se`, `nos`, `os` plus Leerzeichen) entfernt. Imperativ, Participio und Gerundio bleiben, wie `conjugate()` sie liefert. Nomen: `plural` ohne Artikel (Artikel-Regel wie `stripArticle` in `dictionary.ts`). Adjektive: `adjectiveForms()`. Formen, die normalisiert der normalisierten Grundform (ohne Artikel) gleichen, kommen nicht in den Index.
  - `formLabel(slots: FormSlot[]): string` erzeugt die Bezeichnung aus §3.3a, einschließlich des Zusammenfassens („1./3. Sg. Imperfecto“, „ · “ zwischen Zeitformen, „Pl.“ bei gleichen Adjektiv-Pluralen). Die Zeitformnamen kommen aus derselben Quelle wie in `components/VerbTable.tsx` (`TENSE_LABEL`). Diese Tabelle wird dafür in die Domäne verschoben (z. B. `domain/conjugation/labels.ts`) und von beiden genutzt.
  - Die Suche gruppiert die Indexeinträge einer Vokabel nach Originalform. Eine „Form“ im Sinne von „+ N weitere Formen“ ist eine verschiedene Originalschreibung mit allen ihren Slots.
- `domain/dictionary.ts`: `searchVocab` (bzw. eine Nachfolgefunktion) liefert statt `Vocab[]` Zeilen `{ vocab: Vocab; form?: { form: string; label: string; more: number; highlight: FormSlot[] } }`. Ohne `form` ist es ein normaler Treffer. Sie bekommt den Formenindex als Parameter. Ablauf: Filter wie bisher, dann je Vokabel die Grundstufe G (bisherige Logik) und die Formstufe F (Formstufe 0 ab 2 Zeichen, Formstufe 1 ab 3 Zeichen normalisierter Eingabe; Leerzeichen zählen als Zeichen), Einordnung und Sortierung nach §3.3a. `highlight` enthält die Slots aller Formen, die auf Stufe F getroffen haben. Für die Auswahl der gezeigten Form (§3.3a) wird zusätzlich die Eingabe nur kleingeschrieben, aber mit Akzenten, mit der kleingeschriebenen Originalform verglichen. Ohne Suchtext bleibt alles wie bisher.
- Performance: Der Index wird **einmal je Vokabelbestand** gebaut (beim ersten Gebrauch im Verzeichnis, gemerkt z. B. per `useMemo` über der Vokabel-Map aus `useAppData`), nicht je Tastendruck. Rund 800 Vokabeln ergeben etwa 8 400 Einträge. Ein linearer Durchlauf je Eingabe genügt, ein Präfixbaum ist nicht nötig. Die Eingabe bleibt ohne spürbare Verzögerung (kein Debounce nötig, auf dem Handy zu prüfen).

**Bildungsregeln der Adjektive** (`adjectiveForms`; die Betonung bleibt auf derselben Silbe, Akzente werden nach den spanischen Regeln gesetzt oder entfernt, dafür `domain/conjugation/accent.ts` nutzen bzw. erweitern):
1. Endet auf **-o**: f. -a, m. Pl. -os, f. Pl. -as (*rojo* → *roja, rojos, rojas*).
2. Endet auf **unbetontes -e oder -a**: f. gleich, Pl. +s (*amable* → *amables*, *maya* → *mayas*, *turista* → *turistas*).
3. Endet auf **betontes -í oder -ú**: f. gleich, Pl. +es (*iraní* → *iraníes*, *hindú* → *hindúes*). Auf andere betonte Vokale (-á, -é, -ó): f. gleich, Pl. +s.
4. Endet auf **unbetontes -s oder -x**: unveränderlich (*gratis*).
5. Endet auf **-z**: f. gleich, Pl. -ces (*feliz* → *felices*).
6. Endet auf einen anderen **Konsonanten**: Pl. +es mit Akzentanpassung (*azul* → *azules*, *cortés* → *corteses*, *joven* → *jóvenes*, *fácil* → *fáciles*). Feminin gleich der Grundform (*cortés*, *azul*, *fácil*), **außer** bei -ón, -án, -ín und -or: dort f. +a, f. Pl. +as, mit Akzentanpassung (*trabajador* → *trabajadora*, *llorón* → *llorona*, *alemán* → *alemana, alemanes, alemanas*). Davon ausgenommen und geschlechtsunveränderlich sind die Komparative auf -or: *mejor, peor, mayor, menor, anterior, posterior, superior, inferior, exterior, interior*.
7. **Nationalitäten auf -és und -ol** (*inglés* → *inglesa*, *español* → *española*) bilden das Feminin anders als Regel 6 (die für *cortés* richtig ist). Ihre Feminin-Formen stehen in `adj` (`f` und `fpl`). Ebenso alle anderen Ausnahmen: Sie werden über `adj` überschrieben, nicht per Regel erzeugt.

Beim Umsetzen werden die erzeugten Formen aller Adjektive in `public/vocab/` durchgesehen. Falsche Formen werden über `adj` korrigiert, die Regeln werden nicht für Einzelfälle verbogen. `npm run validate:vocab` meldet zusätzlich eine **Warnung**, wenn ein `adj`-Feld dieselbe Form enthält, die die Regel ohnehin erzeugt (überflüssiger Eintrag).

**Oberfläche:**
- `features/dictionary/Dictionary.tsx`: rendert Formzeilen nach §3.3a (drei Zeilen, Pfeil „→“, Bezeichnung und „+ N weitere Formen“ klein und grau). Die Zeile ist wie jede Zeile ein Link. Formtreffer übergeben beim Navigieren den Router-Zustand `{ highlight: FormSlot[] }`, zusätzlich zu dem Zustand, den das Verzeichnis für Zurück und Filter schon nutzt (`viewState`). `aria-label` der Zeile wie in §3.3a.
- `features/dictionary/VocabDetail.tsx`: liest `highlight` aus dem Router-Zustand und gibt es an `VerbDetail`/`VerbTable` (neue optionale Prop) bzw. an die Plural- und Formenzeile weiter. Hervorgehobene Formen bekommen eine eigene Klasse (z. B. `form-hit`, Hintergrund aus einem Farb-Token, Fettdruck). Nach dem ersten Rendern scrollt die Seite die erste hervorgehobene Stelle in den sichtbaren Bereich (`scrollIntoView({ block: 'center' })`). Die Zeile „Formen“ der Adjektive nutzt `adjectiveForms()` (§3.3a).
- `components/VerbOverlay.tsx` (Lernsitzung) bekommt keine Hervorhebung.
- CSS in `styles/global.css`: Token für die Hervorhebung in Hell und Dunkel. `src/styles/global.test.ts` prüft deren Kontrast wie bei den übrigen Farben.

**Tests:**
- Vitest: alle Soll-Beispiele aus §3.3a (mit den echten Vokabeldaten oder mit Testvokabeln), die Regel F < G, Mindestlängen (1 Zeichen: nichts; 2 Zeichen: nur Formstufe 0; ab 3: beide), Nomen-Plurale mit Leerzeichen, Akzent- und Großschreibung, Auswahl der gezeigten Form bei Akzentpaaren (*compre*/*compré*, *levanto*/*levantó*), Sortierung in den vier Gruppen aus §3.3a, Zusammenspiel mit Filtern, Bezeichnungen samt Zusammenfassen (auch gemischte Zahl, per Testvokabel), „+ 1 weitere Form“ / „+ N weitere Formen“, reflexive Verben (ohne Pronomen, Imperativ mit Pronomen, *ir* und *irse* nebeneinander), vosotros-Formen. Für `adjectiveForms` je Regel mindestens ein Beispiel, die Komparative, Akzentfälle (*joven, cortés, alemán, iraní* per Testvokabel) und dass `adj` überschreibt (*español* per Testvokabel).
- Browser-Smoke-Test (`scripts/browser-smoke.ts`): Im Verzeichnis „podemos“ eingeben, die Zeile „podemos → poder“ mit „1. Pl. Presente“ erscheint. Antippen öffnet die Detailseite von *poder*, die Zelle *podemos* ist hervorgehoben und sichtbar. Zurück: Suchtext und Filter sind erhalten. Eine Adjektiv-Detailseite zeigt die Zeile „Formen“.

**Nach der Umsetzung:** In §3.3, §3.3a und hier den Vermerk „noch nicht umgesetzt“ entfernen, §9 (neue Dateien) und die Testzeile in §8 ergänzen und den Punkt aus `docs/TASKS.md` streichen. Weicht die Umsetzung an einer Stelle von dieser Spezifikation ab, wird das mit dem Nutzer geklärt.

## 15. PWA

`vite-plugin-pwa` mit `registerType: 'prompt'`, Workbox-Precache für App-Shell und `vocab/*.json`. `UpdateBanner` über `useRegisterSW` (`needRefresh`), Button ruft `updateServiceWorker(true)`. Manifest: Name „Palabrita“, `display: standalone`, `lang: de`, Theme-Farbe Türkis. Icons 192/512/maskable aus SVG (`scripts/make-icons.ts`).

## 16. Test und Deployment

Befehle, lokaler Test (`npm run dev`, `npm run build` + `npm run preview`), Einrichtung von GitHub Pages und die Installation auf dem Handy stehen in der `README.md`. Festlegungen:

- Service Worker, Offline-Modus und Installierbarkeit lassen sich nur mit `build` + `preview` prüfen (`localhost` braucht kein HTTPS).
- Statische Auslieferung von `dist/` über GitHub Pages, `.github/workflows/pages.yml` (Lint, Tests, Vokabelprüfung, Build, Veröffentlichung; Start bei Push auf `main` und per `workflow_dispatch`). Erwartete URL: `https://fabiankonig.github.io/palabrita/`.
- **HTTPS ist Pflicht**, damit die PWA auf dem Handy installierbar ist; Pages liefert es mit. Die App läuft unter einem Unterpfad (`base: "./"`, Hash-Router, relative Manifest-Pfade).
- Pages setzt `Cache-Control: max-age=600`. Updates laufen über den `UpdateBanner` (Service Worker), nicht über Cache-Header.
- Der Lernfortschritt liegt je Gerät und je Origin im Browser. PC und Handy sind nicht synchronisiert, und es gibt keine Übertragung zwischen ihnen.

## 17. Annahmen und offene Punkte

- **Offene Punkte:** siehe `docs/TASKS.md`.
