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
| Lernmodi v1 | **Karteikarten** und **Spaced Repetition** (zwei Bewertungsbuttons, Ablauf nach dem Vorbild von Anki mit höchstens 20 neuen Karten pro Tag, siehe §3.1) |
| Inhalte | Reise-Alltag, Kultur & Orte, Audio-Aussprache |
| Vokabeln | **Über 800 Startvokabeln**, von Claude generiert, mit Zusatzinfos, ohne festen Gesamtumfang |
| Speicherung | **Nur lokal im Browser**, kein Server, kein Login |
| Design | Mexiko/Guatemala-Farbwelt, mobile-first |
| Länderunterscheidung | **Keine** (ein gemeinsames Vokabelset) |
| Mehrere Übersetzungen | Eine Vokabel kann **1 bis 4 deutsche Wörter** haben (`de` ist eine Liste, §4.2). |
| Kartenrichtung & SRS | **Getrennter SRS-Zustand je Richtung** (DE→ES und ES→DE sind je eigene Karten mit eigenem Intervall, Ease und Fälligkeit). Die Statistik zählt Karten je Richtung. |
| Niveau-Konfiguration | Ein **maximales Niveau** (A1, A2, B1) wird persistent in den Einstellungen gespeichert, siehe §3.2. Höhere Niveaus werden beim Lernen und in der Statistik ausgeblendet (das Verzeichnis zeigt sie, §3.3), ihr Fortschritt bleibt erhalten. |
| Projektstruktur | Das Projekt liegt **direkt im Repo-Root**, Dokumentation in `docs/` (§9). |
| Kompatibilität | **Es gibt aktive Nutzer** (seit 2026-11-21, vom Nutzer festgelegt; vorher galt „keine Nutzer, keine Migrationen“). Ihr Lernfortschritt und ihre Einstellungen liegen nur auf ihren Geräten und dürfen durch eine neue Version nicht verloren gehen. Änderungen an Datenmodell, Schema, Formaten und Vokabel-IDs müssen so umgesetzt werden, dass Bestandsnutzer die neue Version über „Aktualisieren“ (§15) laden und weiternutzen können, sofern möglich und mit vertretbarem Aufwand. Ist eine Migration nicht einfach umsetzbar, wird das dem Nutzer berichtet, bevor etwas umgesetzt wird; ein Breaking Change gilt nur, wenn der Nutzer ihn ausdrücklich entscheidet. Regeln und Ablauf: §10.4. |
| Erklärvideo | Ein KI-erzeugtes Video erklärt die App. Es ist **in der App eingebettet** (Seite `/#/video`, Eintrag im Tab „Mehr“, Hinweisleiste auf der Lernauswahl §14.1), ohne externen Dienst, lädt erst beim Abspielen und ist nicht offline verfügbar (§14.6). |
| PWA-Updates | **Hinweis mit Button**: Ein Banner „Neue Version verfügbar.“ mit Button „Aktualisieren“ erscheint. Es wird nie automatisch neu geladen, auch nicht mitten in einer Lernsitzung (§15). |

Nicht in v1: Multiple-Choice-Quiz, Tipp-Abfrage, Cloud-Konten, Regionalismen-Filter (MX/GT), Sync zwischen Geräten, eine dritte Bewertung „Kenne ich schon“ (würde eine neue Karte ohne Lernschritte direkt abschließen, kann später ergänzt werden).

## 3. Funktionale Anforderungen

### 3.1 Lernen

> Der Absatz beschreibt die Lernsitzung. Technische Details: §11 (Lernmodell), §12 (Kartenauswahl), §14.1 (Bedienung).

- **Karteikarten:** Vorderseite Deutsch, Rückseite Spanisch (Richtung im Tab „Lernen“ für die Sitzung wählbar). Die Karte lässt sich per Tipp **beliebig oft** umdrehen. Hat eine Vokabel mehrere deutsche Wörter, stehen **alle** auf der deutschen Seite, getrennt durch „ · “ (z. B. *Auto · Wagen*). Das erste Wort ist die Hauptübersetzung. Die Rückseite zeigt zusätzlich den Beispielsatz (Spanisch und Deutsch) und, falls vorhanden, den Hinweis (`note`). Bei Verben steht auf der spanischen Seite (egal in welcher Richtung) unter dem Wort in einer eigenen, kleineren grauen Zeile der Klammerzusatz der Notation (§5.1), z. B. *(ie)*, *(e → ie, -go, Pretérito/Futuro irr.)*, *(c → qu)*, *(irr.)*; regelmäßige Verben haben keine Zeile. Bei Nomen steht auf der spanischen Seite unter dem Singular (mit Artikel) der Plural in kleinerer grauer Schrift, z. B. *el saludo* / *los saludos*, sofern eine Pluralform hinterlegt ist. Ist bei einem Nomen `gender` gesetzt, steht auf der spanischen Seite unter dem Plural (also ganz unten, nach Singular und Plural) ein kleines Badge mit dem Genus in ausgeschriebener Form: „maskulin“ (`m`), „feminin“ (`f`) oder „maskulin/feminin“ (`m/f`, z. B. *el/la turista*). Die Wortwahl ist dieselbe wie auf der Detailseite im Wörterbuch. Das Badge zeigt das Genus unabhängig vom Artikel, also auch bei *el agua* „feminin“. Es erscheint auf der spanischen Seite jeder Richtung und bei Verben nicht. Aussprache und Suche nutzen weiter nur das Wort.
- **Bewertung mit zwei Buttons:** **Nochmal** (nicht gewusst) und **Gewusst**. Jeder Button zeigt, wann die Karte wiederkommt („1 Min“, „10 Min“, „1 T“, „8 T“ …).
- **Tagespensum wie bei Anki:** Pro Tag kommen die fälligen Wiederholungen und **höchstens 20 neue Karten** (gezählt über alle Sitzungen; jede Richtung eines Worts ist eine eigene Karte, im Mittel sind das also etwa 10 neue Wörter pro Tag). Die Zahl schwankt von Tag zu Tag: Wer täglich das volle Limit lernt und immer „Gewusst“ wählt, bekommt an Tag 1 und 2 je 20 neue Wörter (nur DE→ES), an Tag 3 und 4 nur die Gegenrichtung ES→DE dieser Wörter (keine neuen Wörter), dann wieder zwei Tage mit je 20 neuen Wörtern usw. (Folge der Tagessperre und der Reihenfolge, §12.1). Wurde eine Richtung eines Worts heute schon gelernt, kommt die andere frühestens am nächsten Tag; bei einem neuen Wort kommt die zweite Richtung in der Regel am übernächsten Tag (§12.1, Tagessperre). Neue Wörter kommen in einer zufälligen, aber festen Reihenfolge über alle Themen und Niveaus. Wörter, die nach dem ersten Start der App zum Bestand hinzukommen, kommen vor allen anderen neuen Wörtern, damit man sie schnell lernt. Ist alles erledigt, erscheint „Für heute geschafft“. Wer weiterlernen will, tippt dort auf „10 weitere neue Karten“ (bis zu 10, beliebig oft, solange es heute verfügbare neue Karten gibt). Der Nutzer kann jederzeit über „Beenden“ aufhören (zeigt eine Zusammenfassung). Jede Bewertung wird sofort gespeichert. Ein Tageslimit als Einstellung gibt es nicht.
- **Spaced Repetition:** Nicht gewusste Wörter kommen **nach Minuten** wieder (1 bzw. 10 Min; ist sonst nichts mehr zu tun, kommen sie wie bei Anki früher, §12.2 Stufe 3), die andere Richtung eines Worts frühestens am nächsten Tag, sicher gewusste immer seltener. Pro Karte werden Fälligkeit, Intervall, Ease-Faktor und Lernschritt gespeichert (§11).
- **Konjugation aus der Sitzung:** Bei Verben öffnet ein Klick auf „Konjugation“ (erst nach dem Aufdecken) ein Overlay mit der Formentabelle, ohne die Sitzung zu verlassen.
- **Audio-Aussprache:** Browser-Sprachausgabe (Web Speech API), spanische Stimme bevorzugt `es-MX`. Ein Lautsprecher-Button ist auf die spanische Seite der Karte aufgedruckt (oben rechts) und dreht sich mit ihr: bei ES→DE ist er von Anfang an auf der Vorderseite, bei DE→ES erscheint er erst mit dem Umdrehen auf der Rückseite. Automatisches Vorlesen ist ein Schalter der Lernsitzung (Standard aus, nicht gespeichert). Details und Stimmenwahl: §13.
- **Filter:** nach Thema, Niveau (A1/A2/B1), Wortart (Verben, Nomen, …; die Wortart steht in Filtern im Plural, §14.4).

### 3.2 Einstellungen
- Es gibt **keine Profile und kein Login**: Fortschritt und Einstellungen gelten für den Browser auf diesem Gerät.
- **Lernfortschritt zurücksetzen** (Anforderung 2026-11-20): Unter „Mehr“ gibt es den Eintrag „Lernfortschritt zurücksetzen“. Damit startet der Nutzer von vorne: Alle Karten werden gelöscht, also alles, was zum Lernstand gehört (welche Karten schon gelernt sind, Lernphase und Reifegrad, wie oft eine Karte bewertet wurde und wie oft „Nochmal“, Intervall, Ease, Fälligkeit, letzte Bewertung, Zeitpunkt der Einführung und damit das Tageslimit neuer Karten). Nach dem Zurücksetzen ist jede Vokabel wieder „neu“, die Statistik steht auf null. **Es bleiben** Höchstes Niveau und Darstellung (Einstellungen, keine Lernfortschritte) sowie der Hinweis „Begrüßung gesehen“ (§14.1). **Neu gewürfelt** werden die Reihenfolge der neuen Karten (`orderSeed`) und der Startzeitpunkt (`startedAt`), damit der Nutzer wirklich wie bei einem ersten Start beginnt (§12.1, Neuzugang). Wegen der Endgültigkeit gibt es eine Rückfrage (§14). Umsetzung: §10.3.
- Einstellungen: **maximales Niveau** (A1/A2/B1, nur dieses und niedrigere Niveaus werden gelernt und in der Statistik gezählt, das Verzeichnis zeigt dagegen alle Wörter, §3.3; persistent gespeichert, jederzeit änderbar) und Theme (System/Hell/Dunkel). Die Version steht nicht hier, sondern unter „Mehr“ unterhalb der Einträge: Zeitstempel des HEAD-Commits zum Bauzeitpunkt (bei Deployment also des Merges auf `main`), beim Build aus Git in `vite.config.ts` eingesetzt, Format `TT.MM.JJJJ, HH:MM UTC`, immer in UTC.

### 3.3 Übersicht und Statistik
- Die Lernen-Seite ist die Startseite (Tab „Lernen“, Route `/`). Sie zeigt keine Zähler und keine Serie (Streak). Sie bietet Thema, Niveau, Wortart und Richtung (nur für die Sitzung, steht bei jedem Aufruf auf „Beide Richtungen“, wird nicht gespeichert) und den Button „Starten“. Die vier Auswahlen sind keine Dropdowns mehr, sondern vier Kacheln, die je ein Auswahlfenster von unten öffnen (Einfachauswahl, Wortarten im Plural, Aufbau und Verhalten: §14.4). Die Niveau-Auswahl bietet „Alle Niveaus“ und die Niveaus bis zum Maximalniveau. Ist das Maximalniveau A1, gibt es nur dieses eine Niveau: Die Kachel zeigt dann „A1“ (ohne „Alle Niveaus“) und ist deaktiviert (ausgegraut, nicht antippbar). Ohne Auswahl startet eine Sitzung über alle Themen.
- Statistik: Verteilung der Karten nach Reifegrad (neu, lernend, gefestigt), je Kartenrichtung und nur für das eingestellte Niveau.
- Durchsuchbares **Vokabelverzeichnis** (alphabetisch nach spanischem Stichwort ohne Artikel) mit Detailansicht inkl. aller Zusatzinfos.
- **Verzeichnissuche (Spanisch und Deutsch):** Das Suchfeld findet jede Vokabel, deren `es` oder einer der `de`-Einträge den Begriff enthält, ohne Beachtung von Groß-/Kleinschreibung, Akzenten und Umlauten (*cafe* findet *café*). So sieht der Nutzer zu einem deutschen Wort, ob er das spanische schon hat. Filter, Suchtext und Scrollposition bleiben erhalten, solange der Nutzer im Bereich des Verzeichnisses bleibt (Detailseite, Legende), ein Wechsel auf einen anderen Tab setzt sie zurück. Festlegungen (Anforderung 2026-11-19):
  - **Alle Wörter, unabhängig vom Maximalniveau:** Liste, Suche und Detailseite des Verzeichnisses zeigen **immer alle** Vokabeln (alle Niveaus). Die Niveau-Auswahl des Verzeichnisses bietet **immer** „Alle Niveaus“, A1, A2 und B1, auch bei Maximalniveau A1 (anders als die Lernen-Seite, die nur Niveaus bis zum Maximalniveau anbietet; festgelegt 2026-11-20). Das Maximalniveau (§3.2) steuert nur Lernen und Kartenauswahl (§12) sowie die Statistik, nicht das Verzeichnis. Ein Wort über dem Maximalniveau sieht in der Liste aus wie jedes andere (das Niveau-Kennzeichen zeigt B1 usw.). Die Detailseite eines solchen Worts trägt unter den Kennzeichen den Hinweis „Liegt über deinem Niveau (B1), wird derzeit nicht gelernt.“
  - **Suchtext und Filter wirken zusammen (UND):** Die Suche läuft innerhalb der gefilterten Liste. Thema, Niveau und Wortart lassen sich unabhängig von Suchtext setzen und ändern; der Suchtext wird dabei nie geleert. Die Suchfunktion in `domain/` berücksichtigt Filter und Suchtext gleichzeitig.
  - **Statuszeile:** Unter den Filterknöpfen steht in einem grünen Feld, was gerade wirkt: je ein kleiner, umrandeter Chip pro aktivem Kriterium, z. B. „Verben“, „A1“ und „„ir““ (der Suchtext in Anführungszeichen). Ein Tipp auf einen Chip entfernt genau dieses Kriterium: Der Filterknopf zeigt wieder „Alle …“ bzw. das Suchfeld ist leer, die übrigen Kriterien bleiben. Ist es der letzte Chip, verschwindet die ganze Zeile. Solange etwas aktiv ist, steht dort der Button „Filter löschen“. Gibt es Filter (Thema, Niveau, Wortart), setzt er nur diese auf „Alle …“ zurück; der Suchtext bleibt. Ist nur ein Suchtext gesetzt, leert der Button das Suchfeld. Ohne Filter und ohne Suchtext entfällt die Zeile.
  - **Filter-Übersicht:** Über den Filterknöpfen steht die Beschriftung „Filtern nach“ mit der Anzahl gesetzter Filter („2 aktiv“). Die Filterknöpfe sind immer bedienbar, auch während einer Suche.
  - **Filter öffnen ein Auswahlfenster (festgelegt 2026-11-20):** Thema, Niveau und Wortart sind keine Browser-Dropdowns (`<select>`), sondern drei Knöpfe im Aussehen eines Dropdowns (Pille mit Pfeil rechts, zeigt den gewählten Wert oder „Alle Themen“, „Alle Niveaus“, „Alle Wortarten“). Ein Tipp öffnet dasselbe Auswahlfenster wie auf der Lernen-Seite (`ChoiceSheet`, Aufbau und Verhalten: §14.4, Einzelheiten zum Verzeichnis: §14.5). Die Wortart steht überall als Filterkriterium im **Plural** (Knopf, Fenster, Chip), wie auf der Lernen-Seite.
  - **Reihenfolge:** Ohne Suchtext alphabetisch nach spanischem Stichwort ohne Artikel. Mit Suchtext nach **Trefferqualität**: je Vokabel zählt der beste Treffer über `es` und alle `de`-Einträge (normalisiert wie oben; beim spanischen Stichwort zählt es mit und ohne führenden Artikel): Eintrag ist gleich dem Suchtext (Stufe 0), Eintrag beginnt damit (Stufe 1), Eintrag enthält ihn (Stufe 2). Gleiche Stufe: Treffer über `es` vor reinem `de`-Treffer, danach alphabetisch. So steht bei „Auto“ das Wort mit der Übersetzung „Auto“ vor „Autobahn“ und „Mietauto“.
  - **Keine Kennzeichnung des Treffers:** Es wird nicht markiert, ob ein Treffer über `es` oder über `de` kam. Jede Zeile zeigt ohnehin Spanisch und alle deutschen Übersetzungen (§14).
  - **Mehrere Treffer:** Alle werden gezeigt, es gibt keine Begrenzung. Gehört ein deutsches Wort zu mehreren spanischen Vokabeln, sind die DE→ES-Karten beim Lernen mehrdeutig. Das ist eine bekannte Einschränkung der Karten, nicht der Suche, und in v1 nicht behandelt.
- **Formsuche** (gebeugte Formen finden): §3.3a.

### 3.3a Formsuche im Verzeichnis (festgelegt und umgesetzt 2026-11-19)

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
- Themen: Begrüßung & Höflichkeit, Zahlen & Zeit, Essen & Trinken (inkl. mexikanische und guatemaltekische Gerichte), Transport & Bus, Unterkunft, Einkaufen & Geld, Gesundheit & Notfall, Wetter & Natur (Vulkane, Seen, Strand), Orte, Kultur & Feste, Maya-Welt, Smalltalk, Grundwortschatz (nach Frequenzlisten, viele Verben).
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
  "added": "2026-11-19",
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
- `added` ist **Pflicht**: das Datum (`YYYY-MM-DD`), an dem die Vokabel zum Bestand kam. Alle Vokabeln des Startbestands haben `2026-11-19`. Eine neue Vokabel bekommt das Datum, an dem sie hinzugefügt wird. Das Datum wird danach nie geändert, auch nicht bei Korrekturen am Eintrag. Der Validator prüft Format und gültiges Kalenderdatum. Das Feld steuert, welche neuen Wörter beim Lernen zuerst kommen (§12.1, Neuzugänge).

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
- **Formen-Tabelle** in der Detailansicht: Presente, Pretérito indefinido, Imperfecto, Futuro, Participio, Gerundio, Imperativ. Die **unregelmäßigen Formen sind farblich hervorgehoben**. Die Tabelle zeigt immer alle sechs Personen: yo, tú, él/ella/usted, nosotros, vosotros, ustedes/ellos.
- **Regelmäßige Verben** bekommen nur das Etikett „regelmäßig (-ar/-er/-ir)“ und die Endungen. Die Formen werden **generiert** und müssen nicht einzeln gepflegt werden. Bei unregelmäßigen Verben stehen die Tags und die abweichenden Formen (`overrides`) im Datensatz. Das Konjugationsmodul wird durch Unit-Tests gegen bekannte Verben mit vollständigen Referenzformen abgesichert (*hablar, comer, vivir, poder, pedir, sentir, dormir, tener, conocer, construir, dar, ser, ir, buscar, empezar, llegar*; mindestens Presente, Pretérito, Futuro, Gerundio, Participio, Imperativ).
- **Reflexive Verben** werden mit *-se* geführt (*llamarse*) und mit Reflexivpronomen konjugiert.
- Kleine Erklärlegende („Was bedeutet (ie)?“) in der App, erreichbar über ein Info-Symbol.

## 6. Hinweise zur Variante Lateinamerika

- **Vosotros** wird in Lateinamerika nicht verwendet. Es gibt *ustedes* statt *vosotros*. Die vosotros-Form wird trotzdem **immer in den Formentabellen angezeigt**, ohne Kennzeichnung als unüblich (Entscheidung des Nutzers: Die Anmerkung entfällt, kein Schalter zum Ausblenden). *Ustedes* wird in der Tabelle zusammen mit der 3. Person Plural geführt.
- **Voseo:** In Guatemala wird *vos* statt *tú* verwendet (z. B. *vos tenés*). Das ist nicht Teil von v1 (kein Länderunterschied), aber ein Hinweisfeld pro Verb oder eine Infoseite „Voseo in Guatemala“ ist ein sinnvoller Zusatz.

## 7. Nicht-funktionale Anforderungen

- **Mobile-first**, große Touch-Flächen, einhändig bedienbar, Hell- und Dunkelmodus.
- **Design:** Mexiko/Guatemala-Farbwelt (kräftige Farben wie Türkis, Magenta, Gelb, Rot, dazu Muster aus Textil- bzw. Maya-Motiven als dezentes Element). Lesbarkeit und Kontrast haben Vorrang.
- Oberfläche auf **Deutsch**.
- **Barrierefreiheit:** ausreichender Kontrast, Tastaturbedienung, Labels für Screenreader.
- **Touch-Verhalten:** Kein farbiges Antipp-Rechteck (Chrome Android, Safari iOS: `-webkit-tap-highlight-color: transparent` auf `html`), Hover-Stile nur bei echtem Hover (`@media (hover: hover)`). Fokus in Suchfeld, Filterknöpfen (Verzeichnis) und Dropdowns (Einstellungen) türkis, ebenso bei den Auswahloptionen im Auswahlfenster der Lernen-Seite (§14.4). Sonstiger Tastaturfokus magenta, auch bei den Kacheln und dem Button „Starten“ der Lernen-Seite.
- **Datenhaltung:** IndexedDB, Versionierung des Datenschemas, damit spätere Vokabelupdates den Fortschritt nicht zerstören (Vokabel-IDs bleiben stabil). Es gibt aktive Nutzer: Schemaänderungen brauchen eine Migration (§10.4).
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
| Tests | Vitest (`npm test`) für reine Logik in `domain/` (SRS, Tageswechsel, Warteschlange, Konjugation, Dublettenprüfung, Statistik, Verzeichnissuche, Formsuche und Formenindex, Adjektivformen, Sprachausgabe, Versionsstempel) und die reinen Hilfsfunktionen der Lernen-Seite (`features/study/studyChoices.test.ts`), für `data/` (Karten, Vokabeln, Begrüßungs-Flag) mit `fake-indexeddb` und für den Vokabel-Validator (auch die `adj`-Warnungen). Keine Komponenten-Tests. UI-Verhalten (Verzeichnis-Filter und Scrollposition in `features/dictionary/viewState`, Formzeilen und Hervorhebung der Formsuche, Schalter, Dropdowns der Einstellungen, Filterknöpfe und Auswahlfenster im Verzeichnis, Kacheln und Auswahlfenster und Richtung im Lernen-Tab) deckt der Browser-Smoke-Test (`scripts/browser-smoke.ts`, braucht `npm run build` und `npm run preview`) ab. `src/styles/global.test.ts` schützt Dunkelmodus-Kontrast, Dropdown-Pfeil (Einstellungen und Filterknöpfe), Schalter, den Kontrast der Formhervorhebung und die Maße der Kacheln und Optionen auf der Lernen-Seite, `features/legend/notations.test.ts` stellt sicher, dass die Legende jede erzeugte Notation erklärt. |
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
  video/                    # Erklärvideo, Vorschaubild, NOTICE.md mit Namensnennung der Musik (§14.6)
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
    dictionary.ts           # Verzeichnissuche (inkl. Formsuche), Filter, Wortart-Labels
    forms.ts                # Formenindex, Bezeichnungen der Formen (Formsuche)
    adjectiveForms.ts       # Adjektivformen nach Regeln (Detailseite, Formenindex)
    gender.ts               # Genus-Bezeichnungen (Badge in der Lernkarte, Detailseite)
    text.ts                 # normalizeForSearch, stripArticle
    findDuplicate.ts        # Dublettenprüfung (Vokabel-Validator)
    stats.ts                # Statistik
    speech.ts               # Stimmenwahl, Sprechtext
    versionStamp.ts         # Formatierung des Versionsstempels
    conjugation/            # Konjugationsmodul (conjugate, accent, labels)
  data/
    vocabRepo.ts            # lädt/cached vocab JSON
    db.ts                   # idb-Schema (settings, cards)
    settingsRepo.ts  cardRepo.ts
    progressRepo.ts         # Lernfortschritt zurücksetzen (§10.3)
    localFlag.ts            # Ja/Nein-Merker in localStorage (Grundlage der beiden folgenden)
    welcomeFlag.ts          # Begrüßung gesehen (localStorage)
    videoHintFlag.ts        # Hinweisleiste Erklärvideo erledigt (localStorage)
  features/
    study/  dictionary/  stats/  settings/  legend/  legal/  more/  video/
  components/               # Flashcard, Speaker, VerbTable, VerbDetail, VerbOverlay, WelcomeOverlay, VideoHint, Brand, TabBar, UpdateBanner, ...
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
  added: string;         // 'YYYY-MM-DD', Pflicht, §4.2
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
| `settings` | `'main'` (ein Datensatz) | `{ maxLevel: Level, theme: 'system'\|'light'\|'dark', orderSeed: number, startedAt: number }` (Defaults: B1, system). `orderSeed` ist eine zufällige vorzeichenlose 32-Bit-Ganzzahl (`crypto.getRandomValues(new Uint32Array(1))[0]`), `startedAt` der Zeitpunkt (ms) des ersten Anlegens (§12.1). Beide sind Pflichtfelder; `DEFAULT_SETTINGS` enthält sie nicht. `DEFAULT_SETTINGS` hat den Typ `Omit<Settings, 'orderSeed' | 'startedAt'>`. `getSettings(): Promise<Settings>` setzt beide, wenn es den Datensatz zum ersten Mal anlegt. **Anlegen und Mischen sind atomar:** `getSettings` und `saveSettings` lesen und schreiben jeweils in **einer** `readwrite`-Transaktion auf `settings` (`get`, dann bei Bedarf `put` in derselben Transaktion). IndexedDB führt solche Transaktionen nacheinander aus; zwei gleichzeitige Aufrufe beim ersten Start ergeben daher denselben `orderSeed`, und zwei schnelle Änderungen hintereinander gehen nicht verloren. `saveSettings(patch: Partial<Pick<Settings, 'maxLevel' | 'theme'>>): Promise<Settings>` liest den gespeicherten Datensatz (legt ihn wie `getSettings` bei Bedarf an), übernimmt aus `patch` nur die Felder `maxLevel` und `theme` (nicht per Spread, damit auch ein zur Laufzeit untergeschobenes `orderSeed` oder `startedAt` nicht gespeichert wird), speichert und gibt das Ergebnis zurück, alles in derselben Transaktion. Der React-Zustand der Einstellungen (`updateSettings` in `hooks/useAppData.tsx`) wird aus diesem Rückgabewert gesetzt, nicht aus dem alten Zustand plus Patch. `updateSettings` hat denselben Parametertyp wie `saveSettings` (`Partial<Pick<Settings, 'maxLevel' | 'theme'>>`, nicht `Partial<Settings>`). `orderSeed` und `startedAt` lassen sich damit schon vom Typ her nicht überschreiben. Die Richtung ist keine Einstellung, sondern gilt nur für die Sitzung (§3.3). |
| `cards` | `[vocabId, dir]` | `{ vocabId, dir: 'de-es'\|'es-de', due: number(ms), interval: number(Tage), ease: number, reps: number, lapses: number, lastReviewed: number\|null, introduced: number(ms, erste Bewertung), state: 'new'\|'learning'\|'mature', step?: 0\|1 }`. `step`: siehe §11. |

Es gibt **keine Profile** (entschieden, siehe §3.2): ein Nutzer pro Browser. Zwischen Geräten gibt es keine Übertragung des Fortschritts. Jede Bewertung wird gespeichert (§11).

Eine Karte wird **erst beim ersten Lernen angelegt** (kein Vorab-Befüllen von 1000 Karten). „Neu“ = Vokabel ohne Card-Eintrag für diese Richtung.

Beide Stores werden beim Anlegen erzeugt. Das Schema ist die Version 1 (`data/db.ts`) und der Ausgangspunkt für alle Migrationen (§10.4). Das Schema darf nicht mehr ohne Migration geändert werden. Alle bisherigen Nutzer haben mit dem Stand von `main` bei `0ddd381` gestartet (Nutzer, 2026-11-21), ihre Datensätze haben also alle Felder aus dieser Tabelle. Datensätze früherer Entwicklungsstände (ohne `orderSeed`, `startedAt`, `Card.introduced`) gibt es nicht bei Nutzern und werden nicht ergänzt; `getSettings` gibt einen vorhandenen Datensatz unverändert zurück. Ein früher angelegter Store `userVocab` wird nicht mehr gelesen und nicht gelöscht. Vokabel-IDs bleiben stabil, Cards referenzieren nur `vocabId`. Nicht mehr vorhandene `vocabId`s werden beim Laden ignoriert (nicht gelöscht).

### 10.3 Lernfortschritt zurücksetzen (`data/progressRepo.ts`)

`resetProgress(): Promise<Settings>` setzt den Lernfortschritt zurück (§3.2) und gibt den neuen Einstellungs-Datensatz zurück. Alles geschieht in **einer** `readwrite`-Transaktion über `cards` und `settings`, es bleibt also nie ein halber Zustand zurück (Karten gelöscht, Einstellungen alt, oder umgekehrt):

- `cards`: `clear()`, alle Datensätze beider Richtungen.
- `settings`: Der Datensatz `main` wird ersetzt durch `{ ...createSettings(), maxLevel, theme }`: `maxLevel` und `theme` aus dem bisherigen Datensatz (ohne bisherigen Datensatz die Defaults), `orderSeed` und `startedAt` neu wie beim ersten Anlegen (§10.2, `createSettings` in `settingsRepo.ts`).
- Der React-Zustand (`resetProgress` in `hooks/useAppData.tsx`) wird aus dem Rückgabewert gesetzt, nicht aus dem alten Zustand. Karten halten die Oberflächen nicht im Speicher: Die Lernsitzung lädt sie beim Start, die Statistik beim Öffnen; beide sind beim Zurücksetzen (Tab „Mehr“) nicht offen.
- `localStorage` (`palabrita.welcomeSeen`, `palabrita.videoHintDone`) und der Service Worker bleiben unberührt, ebenso die Vokabeldateien.
- Tests: `data/progressRepo.test.ts`.

### 10.4 Bestehende Nutzer: Kompatibilität und Migrationen (festgelegt 2026-11-21)

Seit 2026-11-21 nutzen die ersten echten Nutzer die App (Entscheidung des Nutzers). Ihre Daten liegen nur auf ihrem Gerät und lassen sich weder von uns reparieren noch neu erzeugen. Jede Änderung am Code oder an den Daten muss deshalb daraufhin geprüft werden, ob sie bestehende Daten oder gespeicherte Zustände unbrauchbar macht.

**Grundsatz.** Wenn es möglich ist und mit vertretbarem Aufwand umsetzbar, wird Code oder Datenformat so geändert, dass Bestandsnutzer die neue Version laden (Banner „Aktualisieren“, §15) und ihren Lernfortschritt und ihre Einstellungen behalten. Ein Datenverlust ist kein Normalfall, sondern eine Entscheidung des Nutzers.

**Was als Nutzerdaten und gespeicherter Zustand gilt:**

- IndexedDB `palabrita`: Store `settings` (`main`) und Store `cards` (§10.2). Dazu zählen `orderSeed` und `startedAt`: Sie bestimmen die Reihenfolge neuer Karten und welche Vokabeln als „neu“ gelten (§12.1).
- `localStorage`: `palabrita.welcomeSeen` und `palabrita.videoHintDone` (§14.1). Neue Schlüssel gelten ab dem Anlegen ebenso.
- Vokabel-IDs: Karten verweisen nur über `vocabId` auf die Vokabeln (§10.1). Die Bedeutung hinter einer ID muss gleich bleiben.
- Die Adresse der App (Origin): Daten sind daran gebunden (§16). Ein Wechsel von Domain, Pfad oder Protokoll lässt Bestandsnutzer mit leerem Speicher zurück.
- Hash-Routen (`/#/...`): Nutzer können Links teilen und speichern (z. B. `/#/video`). Routen nicht ohne Weiterleitung umbenennen oder entfernen.
- Der Service Worker und sein Cache: Ein Fehler im Update-Pfad (§15) kann Bestandsnutzer auf einer alten Version festhalten.

**Breaking Change** heißt: Nach dem Update ginge für einen Bestandsnutzer Fortschritt oder Einstellung verloren, würde falsch angezeigt, oder die App liefe nicht mehr. Typische Auslöser:

- Felder in `Settings` oder `Card` umbenennen, entfernen, ihren Typ oder ihre Bedeutung ändern oder neue Pflichtfelder einführen (alte Datensätze haben sie nicht).
- Stores oder Schlüssel (`keyPath`) ändern, umbenennen oder löschen.
- Vokabel-IDs ändern, wiederverwenden oder die Bedeutung eines Eintrags unter derselben ID ändern. Entfernte Vokabeln bleiben als verwaiste Karten liegen und werden ignoriert (§10.2); das ist erlaubt, geht aber nur bewusst.
- Das Lernmodell so ändern, dass vorhandene Kartenwerte (`ease`, `interval`, `state`, `step`, §11) anders gelesen werden.
- `localStorage`-Schlüssel ändern; Origin oder Routen ändern (siehe oben).

**Umsetzung von Migrationen (Standardweg):**

- Datenbank: `DB_VERSION` in `data/db.ts` erhöhen und für den Sprung einen Schritt in `upgrade(db, oldVersion, …)` ergänzen. Bestehende Schritte nie ändern oder entfernen, denn Nutzer können von jeder früheren Version aus springen. Die Version nie senken.
- Neue Felder: Wo möglich beim Upgrade in den vorhandenen Datensätzen befüllen oder beim Lesen tolerant mit einem Standardwert behandeln.
- Test mit einer Datenbank im alten Format (mit `fake-indexeddb`), die nach dem Upgrade alle alten Daten unverändert liefert (`data/db.test.ts` ist der Ort).
- Mehrere offene Tabs: Eine alte Version, die in einem anderen Tab offen ist, kann das Upgrade blockieren (`blocked`/`blocking` der `idb`-Optionen). Eine alte Code-Version kann eine Datenbank mit neuerer Version nicht öffnen (`VersionError`). Einen Deploy nach einem Versionssprung zurückzunehmen ist darum nicht folgenlos.
- Vokabeldaten: Regeln in `docs/VOKABELN.md` (IDs, `added`).
- Danach SPEC (dieser Abschnitt und §10.2) und die Tests nachziehen; ein Sprung der Datenbankversion wird in §10.2 festgehalten.

**Ablauf bei Änderungen, die Daten betreffen:**

1. Prüfen, ob die Änderung Bestandsdaten berührt (Liste oben). Wenn nicht, normal weiterarbeiten.
2. Wenn ja: die Änderung so bauen, dass Bestandsnutzer nichts verlieren (Migration, tolerantes Lesen, Weiterleitung).
3. **Berichten (Pflicht), bevor umgesetzt wird,** wenn eine Migration nicht einfach machbar ist, einen extrem großen Umbau erzwingen würde, oder sich Datenverlust nicht vermeiden lässt. Der Bericht nennt: was sich ändern soll, wen und was es betrifft, wie aufwendig eine Migration wäre, Alternativen. **Der Nutzer entscheidet,** ob der Aufwand betrieben wird oder ein Breaking Change stattfindet. Ein Breaking Change wird dann gemeinsam mit dem Nutzer spezifiziert (z. B. Ankündigung, Übergang); kein Agent entscheidet ihn allein.
4. Nicht stillschweigend einen Breaking Change einbauen, und auch nicht stillschweigend einen sehr großen Umbau betreiben, nur um ihn zu vermeiden.

Offen: Ein genaueres Verfahren (z. B. Aufbau der Upgrade-Schritte, Hinweis an Nutzer bei einem Breaking Change) ist noch nicht spezifiziert. Es wird mit dem Nutzer festgelegt, sobald die erste Änderung es braucht (`docs/TASKS.md`).

## 11. Lernmodell (`domain/srs.ts`)

Vorbild ist das **klassische Anki-Verfahren** (SM-2-Variante) mit dessen Standardeinstellungen (entschieden 2026-11-19). Bewusste Abweichungen von Anki stehen am Ende des Abschnitts.

**Tageswechsel (`domain/day.ts`):** `dayKey(now)` = lokales Datum von `now − 4 h`. `startOfDay(dayKey)` liefert 04:00 lokal. `addDays` rechnet in **Kalendertagen** auf dem `dayKey`, nicht mit `+ 24 h`, damit Zeitumstellungen nichts verschieben. `diffDays(a, b)` = Anzahl Kalendertage von `a` nach `b`.

Reine Funktion `review(card, grade, now): Card`. `Grade` ist `"again" | "good"` (Beschriftung: „Nochmal“, „Gewusst“). **Jede Bewertung setzt `lastReviewed = now`**, in allen Phasen (Tagessperre und Gefährdung in §12 hängen daran).

**Phase einer Karte** (`Card.step?: 0 | 1`, `domain/types.ts`): Ist `step` gesetzt, ist die Karte in der **Lernphase** (Minutenabstände). Fehlt `step`, ist sie in der **Wiederholungsphase** (Tagesabstände), mit einer Ausnahme: Eine Karte ohne `step` mit `lastReviewed === null` ist **neu** (frisch aus `newCard`, noch nie bewertet) und wird nach der Zeile „neu“ der Lernphase bewertet, nie nach der Formel der Wiederholungsphase. Gespeicherte Karten haben immer `lastReviewed`, weil jede Bewertung ihn setzt. Eine Lernkarte mit `lapses > 0` ist in der **Wiederlernphase** (nach einem Rückfall); in die Lernphase kommt eine Karte nur als neue Karte oder durch einen Rückfall, daher genügt `lapses` zur Unterscheidung.

Konstanten (`domain/srs.ts`): `LEARN_STEPS_MIN = [1, 10]`, `RELEARN_STEP_MIN = 10`, `START_EASE = 2.5`, `MIN_EASE = 1.3`, `MAX_EASE = 3.0`, `EASE_LOSS = 0.2`, `EASE_GAIN = 0.05`, `GRADUATE_DAYS = 1`, `MATURE_INTERVAL = 21`, `MAX_INTERVAL = 36500`.

**Lernphase** (neue Karte, `lapses = 0`). `due` ist hier ein exakter Zeitpunkt `now + Minuten × 60 000`:

| Zustand | Nochmal | Gewusst |
|---|---|---|
| neu (nie bewertet) | Schritt 0, in 1 Min | Schritt 1, in 10 Min |
| Schritt 0 | Schritt 0, in 1 Min | Schritt 1, in 10 Min |
| Schritt 1 | Schritt 0, in 1 Min | **Abschluss**, Intervall 1 T |

**Wiederlernphase** (nach einem Rückfall, `lapses > 0`, immer Schritt 1, wie Ankis einzelner Wiederlernschritt von 10 Min):

| Zustand | Nochmal | Gewusst |
|---|---|---|
| Schritt 1 | Schritt 1, in 10 Min | **Abschluss**, Intervall 1 T |

Ein neues Wort muss also zweimal nacheinander gewusst werden, bevor es in den Tagesplan wechselt, ein vergessenes einmal. Lern- und Wiederlernphase ändern die Ease nicht.

**Abschluss** = `step` entfernen, `interval = max(GRADUATE_DAYS, interval)` (nach einem Rückfall ist `interval` schon 1), `reps += 1`, `due = startOfDay(addDays(dayKey(now), interval))` (04:00-Regel, Kalendertage über `addDays`). Die Basis ist immer **heute** (`dayKey(now)`), nicht das alte Fälligkeitsdatum. Das gilt auch für „Gewusst“ in der Wiederholungsphase.

Randfälle der 04:00-Regel (kein Fehler): Ein Abschluss um 02:00 hat `dayKey` von gestern, die Karte ist dann heute 04:00 fällig, also in 2 Stunden, die Vorschau zeigt trotzdem „1 T“. Ein Abschluss um 23:00 ist morgen 04:00 fällig, also in 5 Stunden.

**Wiederholungsphase:**
- **Nochmal (Rückfall):** `lapses += 1`, `reps = 0`, `ease = max(MIN_EASE, ease − EASE_LOSS)`, `interval = 1` (gilt später als Abschlussintervall), `step = 1`, `due = now + RELEARN_STEP_MIN × 60 000`. Danach durchläuft die Karte die Wiederlernphase.
- **Gewusst:** Verspätung `late = max(0, diffDays(dayKey(card.due), dayKey(now)))` (ganze Tage, die die Karte schon überfällig ist). Neues Intervall `interval = min(MAX_INTERVAL, max(interval + 1, round((interval + late / 2) × ease)))` mit der Ease **vor** dieser Bewertung (wie Anki v3: die halbe Verspätung zählt mit, ohne Abrunden, weil das Wort auch nach längerer Zeit noch gewusst wurde). Beispiel: Intervall 10, Ease 2,5, 3 Tage überfällig: `round(11,5 × 2,5) = 29` T. Danach `ease = min(MAX_EASE, ease + EASE_GAIN)`, `reps += 1`, `due = startOfDay(addDays(dayKey(now), interval))`.
- Die Schwierigkeit eines Wortes steckt allein in der Ease: Jedes „Nochmal“ senkt sie um 0,2, jedes „Gewusst“ hebt sie um 0,05. Bei 80 % Erfolg bleibt sie gleich, darüber wächst das Wort schneller, darunter langsamer; ein „Nochmal“ ist nach 4 × „Gewusst“ ausgeglichen. Beispiel bei durchgehend „Gewusst“ und pünktlichem Lernen: ≈ 1, 3, 8, 21, 56 Tage.
- Eine Wiederholungskarte, die noch nicht fällig ist, wählt `pickNext` nie aus (§12, es gibt keine Vorab-Wiederholung). Wird `review()` trotzdem für sie aufgerufen, gilt sie als pünktlich (`late = 0`).

**Vorgezogene Lernkarten** (§12, bis 20 Min vor `due`) werden ganz normal bewertet, „Gewusst“ zählt als Schritt. Es gibt dafür keine Sonderregel.

**Ease-Rundung:** Die Ease wird nach jeder Änderung auf 2 Dezimalstellen gerundet (gegen Gleitkomma-Rauschen wie 2,3499999) und danach auf `MIN_EASE`/`MAX_EASE` begrenzt.

`state`: `learning` solange `step` gesetzt ist oder `interval < 21`, sonst `mature`. (`new` nur für noch nicht gespeicherte Karten.)

`introduced`: Zeitpunkt der ersten Bewertung (ms). `newCard(vocabId, dir, now)` setzt ihn, `review()` ändert ihn nie. Er zählt für das Tageslimit neuer Karten (§12).

`previewIntervals(card, now)` liefert je Button entweder Minuten oder Tage. `formatInterval` hat eine Minuten-Variante („1 Min“, „10 Min“; ab 60 Min „1 Std“, das kommt bei den heutigen Lernschritten nicht vor und bleibt als Reserve). Bei Tagen: „1 T“ bis „29 T“, ab 30 Tagen Monate („2 Mon“, auf ganze Monate gerundet), ab 365 Tagen Jahre („1,2 J“, auf eine Nachkommastelle gerundet, mit **Dezimalkomma**; ist die Nachkommastelle 0, entfällt sie: „2 J“).

**Jede Bewertung wird gespeichert** (`saveReview`).

**Bewusste Abweichungen von Anki:**
- **Zwei Buttons** statt vier (kein „Schwer“, kein „Einfach“). Damit die Ease nicht nur sinken kann („Ease-Hölle“), hebt „Gewusst“ sie um 0,05 (Anki: unverändert), mit Obergrenze 3,0 (Anki: keine).
- **Mindestintervall bei „Gewusst“** ist `interval + 1`. Anki nimmt mindestens das Intervall von „Schwer“ plus 1 Tag; den Button gibt es hier nicht. Unterschied nur bei niedriger Ease und kleinem Intervall (Intervall 1, Ease 1,3: hier 2 T, in Anki 3 T).
- **Keine Zufallsstreuung** der Intervalle (Ankis „Fuzz“).
- **Keine Sonderbehandlung oft vergessener Wörter** (Ankis „Leech“-Markierung). Sie wirken sich nur über die Ease aus.

## 12. Auswahl der nächsten Karte (`domain/queue.ts`)

Vorbild ist die **Warteschlange von Anki** (v3) mit Standardeinstellungen (entschieden 2026-11-19): fällige Lernkarten zuerst, dann fällige Wiederholungen gemischt mit höchstens 20 neuen Karten pro Tag in fester Zufallsreihenfolge (Ankis Einfügereihenfolge „zufällig“), dann Lernkarten bis 20 Minuten vorgezogen, dann „Für heute geschafft“. Bewusste Abweichungen stehen am Ende von §12.2.

Konstanten (`domain/queue.ts`): `NEW_PER_DAY = 20`, `REVIEWS_PER_NEW = 4`, `LEARN_AHEAD_MIN = 20` (entschieden 2026-11-19, bleibt wie bei Anki), `MORE_NEW_STEP = 10` (Button „10 weitere neue Karten“).

### 12.1 Begriffe

- **Sichtbarkeit und Filter:** Sichtbar sind nur Vokabeln mit `isVisible(v, settings.maxLevel)`, danach wirken die Sitzungsfilter (Thema, Niveau, Wortart). Erlaubte Richtungen: bei der Sitzungsrichtung `both` (Standard) beide, sonst nur die gewählte. Karten ausgeblendeter Vokabeln oder Richtungen bleiben unverändert in der DB und werden in der Sitzung nicht gezeigt; sie warten, bis ein Filter sie wieder einschließt.
- **Kartenarten:** *Lernkarte* = Card mit `step`. *Wiederholungskarte* = gespeicherte Card ohne `step`. *Neue Karte* = sichtbare Vokabel im Filter ohne Card für diese Richtung.
- **Fällig:** Eine Lernkarte ist fällig bei `due <= now`. Eine Wiederholungskarte ist fällig bei `due < nextDayStart(now)` mit `nextDayStart = startOfDay(addDays(dayKey(now), 1))` (04:00 des Folgetags, **exklusiv**: eine Karte mit `due` = morgen 04:00 ist heute **nicht** fällig).
- **Tageslimit neue Karten:** `NEW_PER_DAY = 20`. Gezählt werden alle gespeicherten Karten mit `introduced >= startOfDay(dayKey(now))`, also über alle Sitzungen, Filter, Richtungen und Niveaus. Diese Zahl („eingeführt heute“) liefert die exportierte reine Funktion `countIntroducedToday(cards, now): number` in `domain/queue.ts`; `pickNext` und der Button „10 weitere neue Karten“ in `Study.tsx` nutzen beide diese Funktion. Jede Richtung zählt als eigene Karte. Eine angezeigte, aber nicht bewertete neue Karte zählt nicht (sie wird erst beim ersten Bewerten angelegt, §10.2). Das geltende Limit `newLimit` hält die Sitzung: Start `NEW_PER_DAY`. Der Button „10 weitere neue Karten“ (§14.1) setzt `newLimit = max(newLimit, eingeführt heute) + 10`, erlaubt also immer 10 weitere Karten, auch in einer zweiten Sitzung am selben Tag, in der schon mehr als 20 eingeführt wurden. Tatsächlich kommen bis zu 10: weniger, wenn es weniger nicht gesperrte neue Kandidaten gibt. Das erhöhte Limit gilt nur in dieser Sitzung und nur für den Tag, an dem es gesetzt wurde: Wechselt `dayKey(now)` während der Sitzung (04:00), rechnet der Aufrufer wieder mit `NEW_PER_DAY`. Es wird nicht gespeichert.
- **Partnerkarte:** die Karte der anderen Richtung derselben Vokabel. Maßgeblich ist die gespeicherte Card, unabhängig von Filter und Sitzungsrichtung.
- **Tagessperre** (wie Ankis „Geschwister zurückstellen“): Eine neue Karte oder eine Wiederholungskarte ist heute gesperrt, wenn ihre Partnerkarte heute schon bewertet wurde (`partner.lastReviewed >= startOfDay(dayKey(now))`). Das gilt unabhängig von der Sitzungsrichtung, also auch in einer Sitzung nur ES→DE. Für Lernkarten gilt die Sperre nicht, sie würden sonst stehen bleiben.
  - **Wiederholung vor neuer Karte:** Eine neue Karte ist außerdem gesperrt, wenn ihre Partnerkarte eine heute fällige Wiederholungskarte ist oder in der Lernphase steckt (`step` gesetzt) **und die Richtung der Partnerkarte in der Sitzungsrichtung liegt** (die Wiederholung also in dieser Sitzung drankommen kann). So verdrängt eine neue Karte in einer Sitzung, in der die Wiederholung drankommen kann, nie eine fällige Wiederholung ihres Worts. In einer Sitzung nur ES→DE sperrt eine fällige DE→ES-Karte die neue ES→DE-Karte dagegen nicht, sonst kämen dort neue Karten nie dran; die erste Sperrregel (Partner heute bewertet) gilt dort weiter. Folge: Wird dort die neue ES→DE-Karte bewertet, ist die fällige DE→ES-Wiederholung für heute gesperrt und kommt einen Tag später. Beispiel: DE→ES schließt an Tag 1 ab (1 T). An Tag 2 ist DE→ES fällig, die neue ES→DE-Karte deshalb gesperrt; nach der Wiederholung greift die erste Sperrregel. An Tag 3 ist DE→ES nicht fällig (Intervall jetzt etwa 3 T), ES→DE ist frei. Die zweite Richtung eines neuen Worts kommt also in der Regel am **übernächsten** Tag nach der Einführung. Zur Klausel „in der Lernphase“: Sie wirkt praktisch nur kurz nach 04:00. Wurde die Lernkarte heute bewertet, sperrt schon die erste Regel; wurde sie vor 04:00 bewertet, ist sie spätestens 10 Min danach fällig und kommt in Stufe 1 vor jeder neuen Karte. Übrig bleibt das Fenster, in dem sie vor 04:00 bewertet wurde und noch nicht fällig ist (z. B. bewertet 03:55, fällig 04:05, `now` 04:01). Die Klausel bleibt trotzdem (entschieden 2026-11-19): So stecken nie beide Richtungen eines Worts gleichzeitig in der Lernphase.
  - Eine gesperrte Wiederholungskarte bleibt fällig und kommt am nächsten Tag; ihr Intervall rechnet ab dem Tag, an dem sie bewertet wird (§11). Randfall (kein Fehler): „Heute“ beginnt um 04:00. Wurde eine Richtung um 03:55 bewertet, ist die andere ab 04:00 frei.
- **Position** einer Vokabel (wie Ankis Einfügereihenfolge „zufällig“): eine feste Pseudo-Zufallszahl `position(vocabId, orderSeed)`, als reine Funktion in `domain/queue.ts`, verbindlich so berechnet: 32-Bit-FNV-1a (Startwert `0x811c9dc5`, Primzahl `0x01000193`, über `charCodeAt`) über `` `${orderSeed}|${vocabId}` ``, danach der Avalanche-Schritt `fmix32` von MurmurHash3 (`h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16`), Ergebnis als vorzeichenlose 32-Bit-Zahl (`>>> 0`). Der Avalanche-Schritt ist nötig: FNV-1a allein gibt IDs, die sich nur in der letzten Ziffer unterscheiden, fast dieselbe Zahl, und weil benachbarte IDs fast immer dasselbe Thema haben, kämen die Wörter themenweise in Klumpen (gemessen mit den 804 echten IDs von `v0001` bis `v0926` über 200 Zufalls-Seeds: unter den ersten 40 neuen Wörtern rund 100 Paare aus derselben Zehnergruppe von IDs statt etwa 8 bei echtem Zufall; mit `fmix32` etwa 8). Beide Richtungen einer Vokabel haben dieselbe Position. **Reihenfolge neuer Karten:** zuerst die Neuzugänge (unten), danach alle übrigen; innerhalb jeder Gruppe nach Position aufsteigend, dann nach `vocabId`, dann DE→ES vor ES→DE (die beiden Richtungen eines Worts liegen also immer beieinander). So sind die Wörter über alle Themen und Niveaus gemischt, die Reihenfolge ist aber je Installation fest. Die zweite Richtung eines Worts steht dadurch vor allen späteren Wörtern (nur Neuzugänge stehen noch davor): Sobald die Tagessperre sie freigibt (in der Regel am übernächsten Tag), ist sie unter den ersten neuen Karten. Eine eigene Regel „ES→DE erst nach DE→ES“ gibt es nicht; die Tagessperre mit „Wiederholung vor neuer Karte“ deckt das ab.
- **Neuzugang:** eine Vokabel, die nach dem ersten Start der App zum Bestand kam: `v.added > dayKey(settings.startedAt)` (Vergleich der Datumstexte `YYYY-MM-DD`). Das ist eine bewusste Näherung auf Tagesebene: `added` ist ein Datum ohne Uhrzeit und Zeitzone, `dayKey` das lokale Datum mit 04:00-Regel. Ein Wort, das am Tag des ersten Starts hinzukommt, ist kein Neuzugang; für einen neuen Nutzer sind dann ohnehin alle Wörter neu. Wer die App neu installiert, hat also keine Neuzugänge und bekommt die normale gemischte Reihenfolge. Wer sie schon nutzt, bekommt später ergänzte Wörter als nächste neue Karten, innerhalb des Filters und des Maximalniveaus (ein neues B1-Wort erscheint nur, wer B1 lernt). Fällige Wiederholungen, die Mischung 4 zu 1 und das Tageslimit gelten unverändert. Randfall (bewusst akzeptiert): Wer die App zwischen 00:00 und 04:00 zum ersten Mal startet, hat wegen der 04:00-Regel als `dayKey(startedAt)` den Vortag; Wörter mit `added` vom Kalendertag des ersten Starts gelten dann als Neuzugänge. Das ändert nur ihre Reihenfolge, nicht ihre Anzahl.
- **Gefährdung** einer fälligen Wiederholungskarte: `diffDays(dayKey(lastReviewed), dayKey(now)) / interval`, also vergangene Tage im Verhältnis zum geplanten Abstand. Größer = gefährdeter. Beispiel: Eine 1-Tages-Karte, die 3 Tage überfällig ist (4/1 = 4), kommt vor einer 30-Tages-Karte, die 3 Tage überfällig ist (33/30 = 1,1). `lastReviewed` ist bei Wiederholungskarten immer gesetzt.

### 12.2 `pickNext`

Die Funktion **`pickNext(input)`** wählt die nächste Karte. Sie ist **rein und deterministisch** (kein Zugriff auf Datenbank, Uhr oder Zufall) und wird nach **jeder** Bewertung neu aufgerufen.

Eingabe: Einstellungen (`maxLevel`, `orderSeed`, `startedAt`), Vokabeln, alle Cards, `now`, Sitzungsfilter (Thema, Niveau, Wortart, Richtung), `lastShown: string | null` (Kartenschlüssel `vocabId|dir` der zuletzt bewerteten Karte), `reviewsSinceNew: number` (Anzahl der Wiederholungskarten, die in dieser Sitzung seit der letzten neuen Karte bewertet wurden, Start 0), `newLimit: number` (geltendes Tageslimit, §12.1).

Rückgabe:
- `{ kind, item }` mit `kind` = `learning` | `review` | `new` | `learn-ahead` (die Stufe unten),
- `{ kind: 'done', moreNew: boolean }`, wenn für heute alles erledigt ist; `moreNew` ist wahr, wenn es ohne Tageslimit noch eine neue Karte gäbe (beide Sperrregeln aus §12.1 beachtet),
- `null`, wenn die Auswahl keine einzige sichtbare Vokabel enthält (leeres Filterergebnis, Niveau zu niedrig). Das zeigt den Hinweis „Keine Karten für diese Auswahl“ (§14.1).

Typen in `domain/queue.ts`:

```ts
type PickKind = 'learning' | 'review' | 'new' | 'learn-ahead';
type NextPick = { kind: PickKind; item: QueueItem } | { kind: 'done'; moreNew: boolean };
interface PickInput {
  settings: Pick<Settings, 'maxLevel' | 'orderSeed' | 'startedAt'>;
  vocab: Iterable<Vocab>; cards: Card[]; now: number; filters?: QueueFilters;
  lastShown: string | null; reviewsSinceNew: number; newLimit: number;
}
function pickNext(input: PickInput): NextPick | null;
function countIntroducedToday(cards: Card[], now: number): number;   // §12.1, Tageslimit
function position(vocabId: string, orderSeed: number): number;       // §12.1, Position
function compareOrder(a: OrderKey, b: OrderKey): number;             // Gleichstand, unten
type OrderKey = { position: number; vocabId: string; dir: Direction };
```

`QueueItem` und `QueueFilters` bleiben wie bisher.

**Gleichstand:** Jede Sortierung der Stufen unten endet mit Position der Vokabel, dann `vocabId`, dann DE→ES vor ES→DE. So ist die Reihenfolge immer eindeutig. Dieser Vergleich ist die exportierte reine Funktion `compareOrder` (oben), die alle Sortierungen nutzen; so lässt er sich mit frei gewählten Positionswerten testen.

Priorität, die erste Stufe mit einem Kandidaten gewinnt:

1. **Fällige Lernkarten** (`learning`), die am längsten überfällige zuerst (`due` aufsteigend).
2. **Fällige Wiederholungen und neue Karten, gemischt im Verhältnis 4 zu 1** (`review` bzw. `new`):
   - Wiederholungs-Kandidaten: fällig und nicht gesperrt, sortiert nach Gefährdung absteigend.
   - Neue Kandidaten: nicht gesperrt (beide Sperrregeln aus §12.1) und Tageslimit (`eingeführt heute < newLimit`) noch nicht erreicht. Gewählt wird der erste Kandidat in der **Reihenfolge neuer Karten** (§12.1: Neuzugänge zuerst, dann nach Position). Bei „Alle Niveaus“ sind also A1, A2 und B1 gemischt (bis zum Maximalniveau), bei einem gewählten Niveau kommen nur dessen Wörter, in derselben festen Reihenfolge.
   - Gibt es beide: eine neue Karte, wenn `reviewsSinceNew >= REVIEWS_PER_NEW` (`= 4`), sonst eine Wiederholung. Bei einem Rückstau kommen also 4 Wiederholungen, 1 neue, 4 Wiederholungen usw. Gibt es nur eine Art, kommt diese.
   - Der Aufrufer zählt `reviewsSinceNew` nach jeder bewerteten Karte der Art `review` um 1 hoch und setzt es nach jeder bewerteten Karte der Art `new` auf 0. Lernkarten zählen nicht.
3. **Lernkarten vorziehen** (`learn-ahead`): Lernkarten mit `due <= now + LEARN_AHEAD_MIN` (`= 20` Min), die früheste zuerst. Sie werden normal bewertet (§11). Weil kein Lernschritt länger als 10 Min ist, betrifft das jede Lernkarte: Solange noch Lernkarten im Filter offen sind, ist die Sitzung nicht fertig. **Folge (bewusst, wie Anki):** Sind nur noch wenige Lernkarten offen, kommen sie sofort wieder, obwohl die Vorschau „1 Min“ bzw. „10 Min“ zeigt. Eine neue Karte kann dann mit zweimal „Gewusst“ in wenigen Sekunden abgeschlossen sein. Das betrifft **die meisten neuen Karten**: Der 10-Minuten-Schritt greift für eine Karte nur, wenn nach ihrer ersten Bewertung noch mindestens 10 Minuten Sitzung aus Stufe 1 und 2 folgen, bei etwa 8 s je Karte also rund 75 weitere Karten. Sonst kommt sie vorher über diese Stufe ein zweites Mal und schließt mit 1 T ab; die Vorschau „10 Min“ beschreibt dann nicht, wann die Karte wiederkommt. Beispiele (immer „Gewusst“, 8 s je Karte): Am ersten Tag (nur 20 neue Karten) und auch bei 40 Wiederholungen plus 20 neuen Karten (Stufe 2 nach etwa 8 Min leer) läuft keine einzige neue Karte über Stufe 1. Erst bei vielen Wiederholungen, etwa 100 am Tag (nach rund drei Monaten mit vollem Limit), bleibt der Schritt für die ersten neuen Karten des Tages erhalten, für die letzten nicht. Wer langsamer lernt, hat ihn öfter. `LEARN_AHEAD_MIN` bleibt trotzdem 20 (entschieden 2026-11-19): Ein Wert unter 10 würde `done` liefern, obwohl noch Lernkarten offen sind, und bräuchte einen Bildschirm „Komm in X Minuten wieder“. Den gibt es nicht.
4. **Für heute geschafft** (`done`): keine Karte aus Stufe 1 bis 3. Fällige Wiederholungskarten, die die Tagessperre zurückhält (Partnerkarte heute bewertet, §12.1), zählen nicht als offen: `done` erscheint trotzdem, die Seite erwähnt sie nicht (bewusst, entschieden 2026-11-19), und sie kommen am nächsten Tag.

**`lastShown`:** Die zuletzt bewertete Karte wird in Stufe 1 bis 3 übergangen, solange irgendeine andere Karte aus Stufe 1 bis 3 in Frage kommt. Gibt es keine andere, wird sie erneut gezeigt (z. B. die letzte offene Lernkarte nach „Nochmal“), statt `done` zu liefern. Als Ablauf: `pickNext` wertet die Stufen 1 bis 3 zuerst ohne die Karte `lastShown` aus. Ergibt das eine Karte, ist sie das Ergebnis, auch wenn `lastShown` in einer früheren Stufe läge. Nur wenn das `done` ergäbe, wird noch einmal mit ihr ausgewertet. Praktisch betrifft das nur Stufe 3, weil eine gerade bewertete Karte nicht sofort fällig ist.

Eine neue Karte wird erst **beim ersten Bewerten** angelegt (§10.2), nicht beim Anzeigen. Es gibt keine Grenze für gleichzeitig offene Lernkarten (früher `MAX_LEARNING`) und keine Vorab-Wiederholung nicht fälliger Karten (früher „Durchlauf“); das Tageslimit ersetzt beides.

**Bewusste Abweichungen von Anki:**
- Neue Karten kommen in **fester Zufallsreihenfolge** (in Anki die Einfügereihenfolge „zufällig“, Standard ist „der Reihe nach“). Später ergänzte Wörter (Neuzugänge, §12.1) kommen vor allen übrigen neuen Wörtern, in Anki dagegen ans Ende der Reihe.
- Die Mischung ist fest **4 Wiederholungen zu 1 neuen Karte** (Anki verteilt die neuen Karten gleichmäßig nach der Anzahl).
- Wiederholungen kommen nach **Gefährdung** (Anki mit SM-2: nach Fälligkeit).
- Die **Tagessperre** der Partnerkarte ist immer aktiv (in Anki eine Einstellung).
- **Kein Tageslimit für Wiederholungen** (Anki: 200).
- „10 weitere neue Karten“ entspricht Ankis „Limit für neue Karten heute erhöhen“, gilt aber nur für die laufende Sitzung.

## 13. Audio (`hooks/useSpeech.ts`)

`speechSynthesis`; Stimmen laden über `voiceschanged`. Auswahl: `es-MX` → `es-US` → `es-*` → erste mit `lang` beginnend mit `es`. Nicht verfügbar: Hinweisbanner „Keine spanische Stimme gefunden“, Button deaktiviert. Gesprochen wird immer der spanische Text `es` **inklusive Artikel** (*el autobús*). Text in Klammern wird entfernt, bei Alternativen mit `/` (*el/la turista*) wird nur die erste gesprochen.

**Auto-Vorlesen** ist ein Schalter in der Lernsitzung (Standard aus, nur für diese Sitzung). Es liest **einmal je Karte** vor, nämlich wenn die spanische Seite zum ersten Mal sichtbar wird. Weiteres Hin- und Herdrehen löst es nicht erneut aus. Der 🔊-Button liegt auf der spanischen Seite der Karte (§14.1) und funktioniert, solange diese Seite zu sehen ist; ein Tipp darauf dreht die Karte nicht um.

## 14. Routing und Screens

HashRouter. Routen: `/` Lernen (Auswahl und Sitzung), `/dictionary`, `/dictionary/:id`, `/stats`, `/settings`, `/legend`, `/privacy`, `/imprint`, `/video` (Erklärvideo, §14.6), `/more`. Unbekannte Pfade leiten auf `/` um.

**Tab „Mehr“:** Markenkopf (Wortmarke, Slogan, Widmung, siehe §14.1 zum erneuten Öffnen der Begrüßung), darunter die Einträge Einstellungen, Legende, Datenschutz, Impressum und Erklärvideo (hervorgehoben durch ein gelbes Play-Symbol, §14.6), darunter der Eintrag „Lernfortschritt zurücksetzen“ (kein Link auf eine neue Seite, sondern ein Button in roter Schrift, §3.2), darunter die Version (§3.2). **Zurücksetzen:** Ein Tipp auf den Eintrag blendet ihn aus und zeigt an derselben Stelle eine Rückfrage („Lernfortschritt zurücksetzen?“, Erklärung, was gelöscht wird und dass es sich nicht rückgängig machen lässt, Hinweis, dass Niveau und Darstellung bleiben) mit den Buttons „Endgültig zurücksetzen“ (rot) und „Abbrechen“. Die Rückfrage scrollt in den sichtbaren Bereich. „Abbrechen“ schließt sie, ohne etwas zu ändern. Nach „Endgültig zurücksetzen“ (beide Buttons währenddessen gesperrt) steht stattdessen die Meldung „Der Lernfortschritt wurde zurückgesetzt. Du startest wieder bei null.“ (`role="status"`, gelber Kasten mit 12 px Abstand unter dem Eintrag), der Eintrag ist wieder bedienbar. Schlägt das Speichern fehl, bleibt die Rückfrage mit der Fehlermeldung stehen (`role="alert"`). Die Seiten dieser Einträge haben den Zurück-Link „← Mehr“ (Klasse `back`). Ausnahme **Legende**: Wird sie aus der App geöffnet (ⓘ in der Verbtabelle), steht dort „← Zurück“ und führt zur vorherigen Seite (Router-Zustand `fromApp`), damit Filter und Verzeichnisbereich (§3.3) erhalten bleiben. Nur über „Mehr → Legende“ steht „← Mehr“.

**Darstellung mehrerer Übersetzungen:** Überall, wo die deutsche Seite erscheint (Karte, Verzeichnis, Detailansicht), werden alle `de`-Einträge mit „ · “ getrennt angezeigt, das erste hervorgehoben. Die Verzeichnissuche: §3.3. Die Einstellungen werden beim ersten Start mit Defaults angelegt.

Layout: mobile-first, untere Tab-Leiste (Lernen, Verzeichnis, Statistik, Mehr). Touch-Ziele ≥ 48 px.

**Logo:** Auf allen Seiten außer „Mehr“ steht oben rechts an derselben Stelle das Logo: drei Wimpel über dem Schriftzug „Palabrita“ (`components/Brand.tsx`, Komponente `Logo`, eingesetzt in `App.tsx` als `.corner-logo`). Neue Seiten bekommen es automatisch, wenn sie unter der Layout-Route liegen. Überschriften lassen rechts Platz dafür. Der Zurück-Link „← Mehr“ oben links steht in derselben Zeile, seine Mitte liegt auf der Mitte des Logos. In der Lernsitzung steht das Logo mittig in der Leiste, zwischen Zähler und „Beenden“; die Leiste hat gleich breite Spalten, damit das Logo exakt mittig bleibt. Auf der Zusammenfassung, auf „Für heute geschafft“ und beim Hinweis „Keine Karten für diese Auswahl“ steht es oben mittig in einer gleich hohen Leiste, ebenfalls ohne Ecken-Logo. Der Markenkopf im Tab „Mehr“ nutzt die große Wortmarke.

### 14.1 Lernsitzung (`features/study/Study.tsx`)

**Begrüßung beim Erststart** (`components/WelcomeOverlay.tsx`, Flag in `data/welcomeFlag.ts`):
- Beim ersten Öffnen liegt über der Lernseite (`/`) eine schwebende Lernkarte. Vorderseite Spanisch („¡Bienvenido a“ über der Wortmarke „Palabrita“), Rückseite Deutsch („Willkommen zu“ über derselben Wortmarke). Die Wortmarke ist dieselbe Komponente wie der Markenkopf im Tab „Mehr“ (`components/Brand.tsx`). Der Rest der App ist solange `inert`.
- Erstes Tippen dreht die Karte um, zweites Tippen schließt das Overlay. Enter oder Leertaste wirken wie Tippen. Beim Erststart reagiert die Fläche neben der Karte nicht: es muss die Karte angetippt werden.
- Gemerkt wird das Schließen pro Gerät in `localStorage` (`palabrita.welcomeSeen`), nicht in IndexedDB. Ist der Speicher nicht nutzbar, erscheint der Hinweis nicht.
- Erneut öffnen: Ein Tippen auf den ganzen Markenblock im Tab „Mehr“ (Wimpel, Schriftzug, Slogan und Widmung) zeigt dieselbe Karte, wieder Spanisch vorne. Umdrehen und Schließen funktionieren gleich, danach bleibt man auf „Mehr“. Ein Klick auf die Fläche neben der Karte schließt sie beim erneuten Öffnen sofort. Das speichert nichts, und der Erststart-Zustand ändert sich dadurch nicht. Die Karte liegt in `Layout` (`App.tsx`) über der App, die Unterseite bekommt `openWelcome` über den Router-Kontext.

**Hinweisleiste „Neu hier? Erklärvideo ansehen“** (`components/VideoHint.tsx`, Flag in `data/videoHintFlag.ts`, festgelegt 2026-11-22):
- Auf der Lernauswahl (`StudySetup`, nicht in der Sitzung und nicht auf den Abschlussseiten) schwebt über der Tab-Leiste eine weiße Leiste mit gelbem Rand (2 px, `--yellow`): links der gelbe Play-Kreis (44 px, wie im Eintrag in „Mehr“, §14.6), daneben fett „Neu hier? Erklärvideo ansehen“ und klein grau „Palabrita in einer Minute“, rechts ein ✕ (48 px Tippfläche, `aria-label` „Hinweis schließen“). Die Leiste ist ein `aside` („Hinweis zum Erklärvideo“). Sie blendet in 400 ms von unten ein.
- Sie erscheint erst, wenn keine Begrüßungskarte mehr darüber liegt (`welcomeVisible` im Router-Kontext, §14.1 oben), also bei neuen Nutzern direkt nach dem Schließen der Karte. **Bestandsnutzer sehen sie einmalig ebenfalls** (Entscheidung des Nutzers), weil der Schlüssel bei ihnen fehlt.
- Ein Tipp auf die Leiste öffnet `/video`; ein Tipp auf ✕ blendet sie aus. Beides merkt sich pro Gerät in `localStorage` (`palabrita.videoHintDone` = `"1"`, nicht in IndexedDB), danach erscheint sie nie wieder. Ohne die Aktion bleibt sie auf der Lernauswahl stehen, auch nach Neuladen. Ist der Speicher nicht nutzbar, erscheint sie nicht. Die erneut geöffnete Begrüßungskarte (Tab „Mehr“) zeigt sie nicht und ändert das Flag nicht.
- Lage: `position: fixed` mit Abstand 14 px über der Tab-Leiste, höchstens 560 px breit, `z-index` unter dem Auswahlfenster. Liegt der Update-Banner (§15) an derselben Stelle, rückt die Leiste darüber. Die Seite bekommt unten zusätzlichen Platz, damit beim Scrollen nichts verdeckt bleibt. **Bei Bildschirmen bis 700 px Höhe** (kleine Handys) schwebt sie nicht, sondern steht im Fluss unter dem „Starten“-Block, weil sie sonst den Button verdeckt; sie blendet dann nur ein.
- Bestandsnutzer (§10.4): neuer `localStorage`-Schlüssel, kein Eingriff in IndexedDB, Vokabeln oder Routen. Keine Migration nötig.
- Tests: `data/videoHintFlag.test.ts`; `scripts/browser-smoke.ts` 1b/1c (fehlt bei offener Begrüßung, erscheint danach mit Link `#/video`, schwebt auf hohen und steht auf niedrigen Bildschirmen im Fluss, ✕ und Link setzen `palabrita.videoHintDone`, bleibt danach weg).

**Karte umdrehen** (`components/Flashcard.tsx`):
- Klick/Tippen auf die Karte **wechselt** zwischen Vorder- und Rückseite, beliebig oft (`onToggle` in `Flashcard`).
- Beim Wechsel zu einer neuen Karte startet sie immer auf der Vorderseite.
- Sobald die Karte **einmal aufgedeckt** wurde (`revealed = true`), bleiben die Bewertungsbuttons sichtbar, auch wenn der Nutzer wieder auf die Vorderseite zurückdreht. Vor dem ersten Aufdecken steht statt der Buttons der Button „Umdrehen“ (er dreht ebenfalls um und setzt `revealed`).
- **Lautsprecher auf der Karte:** Der 🔊-Button (`.speak`) gehört zur spanischen Seite (`spanishAction` von `Flashcard`: Vorderseite bei ES→DE, Rückseite bei DE→ES) und steht dort oben rechts. Er dreht sich beim Umdrehen mit, als wäre er auf die Karte gedruckt, und ist vorher nicht zu sehen (bei DE→ES kein Lautsprecher auf der deutschen Vorderseite). Ein Button darf nicht in einem Button liegen. Deshalb ist der Umdreh-Button (`.flashcard-toggle`, `aria-label`, `aria-pressed`) eine unsichtbare, kartengroße Fläche **hinter** den Kartenseiten; die Seiten lassen Klicks durch (`pointer-events: none`), nur der Lautsprecher fängt seine eigenen Klicks (`pointer-events: auto`). Die verdeckte Seite ist `inert`, ihr Lautsprecher ist also weder anklickbar noch per Tab erreichbar. Ein Tipp auf den Lautsprecher spricht das Wort und dreht die Karte nicht um.
- Der Hinweis „Tippen zum Umdrehen“ steht auf **beiden** Seiten. `aria-label` je Seite („Karte umdrehen“), zusätzlich `aria-pressed` bzw. gleichwertig; Tastatur (Enter/Leertaste) funktioniert, weil die Karte ein `button` bleibt.
- Die Karte dreht sich beim Umdrehen als 3D-Drehung um die senkrechte Achse (`rotateY`, Klasse `flipped`), wie die Begrüßungskarte, nur schneller (350 ms statt 700 ms, gleiche Easing-Kurve). Beide Seiten liegen dafür gleichzeitig im DOM (eine Grid-Zelle, Karte so hoch wie die höhere Seite); die verdeckte Seite ist `aria-hidden`. Bei einer neuen Karte wird `Flashcard` neu eingehängt (`key` in `Study.tsx`), damit sie ohne Rückdrehen auf der Vorderseite startet und die Antwort nicht aufblitzt. `prefers-reduced-motion`: kein Drehen, die Seite wechselt sofort (globale Regel).

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
- **Zurück-Taste des Geräts (entschieden 2026-11-20):** Sie wirkt wie der Button „Beenden“ der jeweiligen Seite und verlässt die Lernen-Seite nicht (vorher sprang sie zum zuletzt geöffneten Tab). In der laufenden Sitzung führt sie zur Zusammenfassung, auf jeder Abschlussseite („Sitzung beendet“, „Für heute geschafft“, „Keine Karten für diese Auswahl“) zurück zur Filterauswahl. Danach verhält sich Zurück auf der Filterauswahl wie üblich. Umgesetzt mit der History-API, also in allen Browsern gleich (Chrome, Firefox, Safari, Edge; Android-Zurück, Browser-Pfeil und Wischgeste unter iOS): `hooks/useSessionBackGuard.ts` legt beim Start der Sitzung einen zusätzlichen History-Eintrag („Wächter“) an; Zurück entfernt ihn (`popstate`) und löst die Aktion von „Beenden“ aus. Geht die Seite danach weiter, entsteht sofort ein neuer Wächter, damit auch die nächste Zurück-Taste abgefangen wird. Die Buttons „Beenden“ und „Zur Filterauswahl“ auf den Abschlussseiten nehmen den Wächter über `history.back()` selbst weg, die History wächst nicht. Ein offenes Verb-Overlay (§14.1) legt seinen Eintrag oben auf den Wächter: Zurück schließt nur das Overlay. Ein übrig gebliebener Wächter (Neuladen mitten in der Sitzung) wird beim Öffnen der Filterauswahl entwertet, ohne zu navigieren (`useDropStaleGuard`); im seltenen Neuladen-Fall kostet das eine zusätzliche Zurück-Taste (Annahme). Beim Browser-Pfeil „Vor“ gibt es dieselbe Besonderheit.
- Bewertungsbuttons „Nochmal“ und „Gewusst“ mit Vorschau des Wiedersehens (`previewIntervals`).
- **Navigation:** Die Sitzung (Zähler „Geübt“, gewählte Filter und Richtung, `reviewsSinceNew`, `newLimit`, §12.2) lebt nur im Speicher der Lernen-Seite. Wechselt der Nutzer in einen anderen Tab und kommt zurück, beginnt er wieder bei der Filterauswahl, der Zähler ist zurückgesetzt. Bewertungen gehen dabei nicht verloren, weil jede sofort gespeichert wird (§11).
- Wer später wieder lernt, bekommt zuerst fällige Lernkarten (auch Minuten-Karten, die inzwischen überfällig sind), dann fällige Wiederholungen gemischt mit neuen Karten bis zum Tageslimit (§12).
- Es gibt keinen Fortschrittsbalken. Oben steht links der Zähler dieser Sitzung: die Zahl groß, darunter klein „GEÜBT“ (gestapelt, ohne Hintergrund). Er ist höchstens so hoch wie der Button „Beenden“ (40 px), damit die Leiste nicht höher wird. In der Mitte das Logo (Wimpel über dem Schriftzug), rechts „Beenden“.
- **Zusammenfassung** („Sitzung beendet“): Oben mittig das Logo an exakt derselben Stelle wie in der Sitzungsleiste, darunter der Titel und zwei große Kacheln: links die Anzahl geübter Karten, rechts die Anzahl „Nochmal“ (eine Lerndauer gibt es nicht, entschieden), darunter nur der Button „Beenden“ (zurück zur Filterauswahl, Filter zurückgesetzt). Ein Button „Weiterlernen“ gibt es nicht (entschieden 2026-11-19).
- **„Für heute geschafft“** (`pickNext` liefert `done`, §12.2): Aufbau wie die Zusammenfassung (Logo oben mittig, die zwei Kacheln mit den Zahlen dieser Sitzung, auch wenn sie 0 sind), Titel „Für heute geschafft“. Darunter ein Satz: bei `moreNew` „Für heute ist alles erledigt. Das Limit für neue Karten ist erreicht.“, sonst „Für heute ist alles erledigt. Heute sind in dieser Auswahl keine weiteren neuen Karten verfügbar.“ Buttons: „10 weitere neue Karten“ (nur bei `moreNew`, Hauptbutton: erhöht `newLimit` nach §12.1 und ruft `pickNext` mit frischem `now` neu auf; die Sitzung läuft mit denselben Zählern weiter) und „Beenden“ (zurück zur Filterauswahl, wie auf der Zusammenfassung). Die Seite kann auch direkt beim Starten erscheinen, wenn für heute nichts mehr ansteht. Die Tab-Leiste ist ausgeblendet wie in der Sitzung.
- **„Keine Karten für diese Auswahl“** (`pickNext` liefert `null`, §12.2): Hinweis mit Link zur Filterauswahl. Oben mittig steht das Logo wie auf der Zusammenfassung, die Tab-Leiste ist ausgeblendet. Er erscheint nur, wenn die Auswahl gar keine sichtbare Vokabel enthält. Enthält sie Vokabeln, für heute aber nichts mehr, erscheint stattdessen „Für heute geschafft“.

### 14.2 Impressum und Datenschutz

- Erreichbar über „Mehr“ (je ein Eintrag, eigene Seite unter `/imprint` und `/privacy`). Gleiche Gestaltung wie die Legende.
- **Datenschutz:** beschreibt den tatsächlichen Stand. Kein Backend, kein Konto, kein Tracking, keine Analyse-Werkzeuge. Fortschritt liegt nur im Browser (IndexedDB) und verlässt das Gerät nicht. Es gibt keine externen Anfragen außer dem Abruf der App. Das Hosting (GitHub Pages) erzeugt beim Abruf technisch übliche Zugriffsdaten beim Anbieter; der Hinweis darauf gehört hinein.
- **Impressum:** Angaben zum Betreiber (Name, Anschrift, Kontakt). Diese Angaben liefert der Nutzer, sie werden nicht erfunden. Der Nutzer hat entschieden (2026-11-19): Das Impressum ist in dieser Form ausreichend.
- Der Abschnitt „Löschung“ in der Datenschutzerklärung nennt zusätzlich „Mehr → Lernfortschritt zurücksetzen“ (§3.2).
- Umsetzung: `src/features/legal/` (`Imprint.tsx` unter `/imprint`, `Privacy.tsx` unter `/privacy`, Betreiberangaben zentral in `operator.ts`). Beide Seiten sind Teil der App und damit offline verfügbar. Die Datenschutzerklärung nennt Hosting (GitHub Pages), lokale Speicherung (§ 25 Abs. 2 Nr. 2 TDDDG, keine Einwilligung nötig), Vorlesefunktion, E-Mail-Kontakt und Betroffenenrechte; Aufsichtsbehörde: HBDI. Das Impressum folgt § 5 DDG. Wiktionary-Lizenzhinweis (CC BY-SA) steht im Impressum. Die Erklärung enthält eine Übersicht der Verarbeitungen und einen abgesetzten Widerspruchshinweis (Art. 21 Abs. 4 DSGVO). Ändern sich Hosting, Dienste oder Betreiberangaben, müssen beide Seiten angepasst werden.

### 14.3 Formsuche: Umsetzung (festgelegt und umgesetzt 2026-11-19)

Verhalten: §3.3a. Hier steht, wie es gebaut wird. Es gibt keine neue Seite und keine neue Route.

**Domäne (rein, ohne React/DOM, mit Vitest getestet):**
- `domain/adjectiveForms.ts`: `adjectiveForms(v: Vocab): { f: string; pl: string; fpl: string }` erzeugt die Formen eines Adjektivs aus `es` nach den Regeln unten. Jedes in `v.adj` gesetzte Feld ersetzt die erzeugte Form. **Ableitung von f. Pl.:** Ist `adj.f` gesetzt und `adj.fpl` nicht, wird f. Pl. als Plural von `adj.f` gebildet (Pluralregeln unten, angewandt auf die Femininform: *inglesa* → *inglesas*, *española* → *españolas*, *cortés* → *corteses*). Ein vergessenes `fpl` führt so nicht zu einer falschen Form. Reihenfolge: `adj.fpl`, sonst Plural von `adj.f`, sonst Regel. Die Detailseite (§3.3a) und der Formenindex nutzen beide nur diese Funktion. Dazu gehören `pluralOf(word)` (Plural eines Wortes), `adjectiveFormLines(v)` (die Einträge der Zeile „Formen“ der Detailseite: ohne Formen gleich der Grundform, „Plural“ zusammengefasst, wenn m. und f. Plural gleich sind) und in `domain/conjugation/accent.ts` die Funktionen `respell` (Endung ersetzen, Betonung auf demselben Vokal halten, Akzent setzen oder entfernen) und `isStressedOnLastSyllable`.
- `domain/forms.ts`: Formenindex und Formsuche.
  - `FormSlot` beschreibt, wo eine Form steht: `{ kind: 'verb'; tense: Tense; person: Person }`, `{ kind: 'verb'; tense: 'participio' | 'gerundio' }`, `{ kind: 'plural' }`, `{ kind: 'adj'; which: 'f' | 'pl' | 'fpl' }`.
  - `buildFormIndex(vocab: Iterable<Vocab>): FormIndex` erzeugt je Vokabel alle Formen mit Slot, Originalschreibung und normalisierter Schreibung (`normalizeForSearch` aus `domain/dictionary.ts`). Verben über `conjugate()` (`domain/conjugation`), also exakt die Formen der Tabelle. Bei reflexiven Verben wird außerhalb des Imperativs das vorangestellte Pronomen (`me`, `te`, `se`, `nos`, `os` plus Leerzeichen) entfernt. Imperativ, Participio und Gerundio bleiben, wie `conjugate()` sie liefert. Nomen: `plural` ohne Artikel (Artikel-Regel wie `stripArticle` in `dictionary.ts`). Adjektive: `adjectiveForms()`. Formen, die normalisiert der normalisierten Grundform (ohne Artikel) gleichen, kommen nicht in den Index.
  - `formLabel(slots: FormSlot[]): string` erzeugt die Bezeichnung aus §3.3a, einschließlich des Zusammenfassens („1./3. Sg. Imperfecto“, „ · “ zwischen Zeitformen, „Pl.“ bei gleichen Adjektiv-Pluralen). Die Zeitformnamen kommen aus derselben Quelle wie in `components/VerbTable.tsx` (`TENSE_LABEL`). Diese Tabelle wird dafür in die Domäne verschoben (z. B. `domain/conjugation/labels.ts`) und von beiden genutzt.
  - `hasSlot(slots, slot)` prüft, ob ein Slot unter den hervorzuhebenden Slots ist (Detailseite). `cachedFormIndex(vocab)` baut den Index je Vokabel-Map einmal (`WeakMap`). `FormIndex` ist eine `Map` von Vokabel-ID auf die Formen in Tabellenreihenfolge.
  - `normalizeForSearch` und `stripArticle` liegen in `domain/text.ts` (`dictionary.ts` exportiert `normalizeForSearch` weiter), damit sich `forms.ts` und `dictionary.ts` nicht gegenseitig importieren.
  - Die Suche gruppiert die Indexeinträge einer Vokabel nach Originalform. Eine „Form“ im Sinne von „+ N weitere Formen“ ist eine verschiedene Originalschreibung mit allen ihren Slots.
- `domain/dictionary.ts`: `searchVocab` (bzw. eine Nachfolgefunktion) liefert statt `Vocab[]` Zeilen `{ vocab: Vocab; form?: { form: string; label: string; more: number; highlight: FormSlot[] } }`. Ohne `form` ist es ein normaler Treffer. Sie bekommt den Formenindex als dritten Parameter (Pflicht; ohne Formen `EMPTY_FORM_INDEX`). Ablauf: Filter wie bisher, dann je Vokabel die Grundstufe G (bisherige Logik) und die Formstufe F (Formstufe 0 ab 2 Zeichen, Formstufe 1 ab 3 Zeichen normalisierter Eingabe; Leerzeichen zählen als Zeichen), Einordnung und Sortierung nach §3.3a. `highlight` enthält die Slots aller Formen, die auf Stufe F getroffen haben. Für die Auswahl der gezeigten Form (§3.3a) wird zusätzlich die Eingabe nur kleingeschrieben, aber mit Akzenten, mit der kleingeschriebenen Originalform verglichen. Ohne Suchtext bleibt alles wie bisher.
- Performance: Der Index wird **einmal je Vokabelbestand** gebaut (beim ersten Gebrauch im Verzeichnis, gemerkt z. B. per `useMemo` über der Vokabel-Map aus `useAppData`), nicht je Tastendruck. Rund 800 Vokabeln ergeben etwa 8 400 Einträge. Ein linearer Durchlauf je Eingabe genügt, ein Präfixbaum ist nicht nötig. Die Eingabe bleibt ohne spürbare Verzögerung (kein Debounce nötig, auf dem Handy zu prüfen).

**Bildungsregeln der Adjektive** (`adjectiveForms`; die Betonung bleibt auf derselben Silbe, Akzente werden nach den spanischen Regeln gesetzt oder entfernt, dafür `domain/conjugation/accent.ts` nutzen bzw. erweitern):
1. Endet auf **-o**: f. -a, m. Pl. -os, f. Pl. -as (*rojo* → *roja, rojos, rojas*).
2. Endet auf **unbetontes -e oder -a**: f. gleich, Pl. +s (*amable* → *amables*, *maya* → *mayas*, *turista* → *turistas*).
3. Endet auf **betontes -í oder -ú**: f. gleich, Pl. +es (*iraní* → *iraníes*, *hindú* → *hindúes*). Auf andere betonte Vokale (-á, -é, -ó): f. gleich, Pl. +s.
4. Endet auf **unbetontes -s oder -x**: unveränderlich (*gratis*).
5. Endet auf **-z**: f. gleich, Pl. -ces (*feliz* → *felices*).
6. Endet auf einen anderen **Konsonanten**: Pl. +es mit Akzentanpassung (*azul* → *azules*, *cortés* → *corteses*, *joven* → *jóvenes*, *fácil* → *fáciles*). Feminin gleich der Grundform (*cortés*, *azul*, *fácil*), **außer** bei -ón, -án, -ín und -or: dort f. +a, f. Pl. +as, mit Akzentanpassung (*trabajador* → *trabajadora*, *llorón* → *llorona*, *alemán* → *alemana, alemanes, alemanas*). Davon ausgenommen und geschlechtsunveränderlich sind die Komparative auf -or: *mejor, peor, mayor, menor, anterior, posterior, superior, inferior, exterior, interior*.
7. **Nationalitäten auf -és und -ol** (*inglés* → *inglesa*, *español* → *española*) bilden das Feminin anders als Regel 6 (die für *cortés* richtig ist). Ihre Femininform steht in `adj.f`, f. Pl. wird daraus abgeleitet (siehe `adjectiveForms` oben). Ebenso alle anderen Ausnahmen: Sie werden über `adj` überschrieben, nicht per Regel erzeugt.

Beim Umsetzen werden die erzeugten Formen aller Adjektive in `public/vocab/` durchgesehen. Falsche Formen werden über `adj` korrigiert, die Regeln werden nicht für Einzelfälle verbogen. `npm run validate:vocab` meldet zusätzlich zwei **Warnungen** (keine Fehler):
- **Fehlende Femininform:** Ein Adjektiv endet auf -és oder -ol und hat kein `adj.f`. Regel 6 würde dann das Feminin gleich der Grundform setzen, was für Nationalitäten falsch ist (Regel 7). Ist die Femininform wirklich gleich (*cortés*), wird sie ausdrücklich eingetragen (`"adj": { "f": "cortés" }`) und gilt damit als bestätigt. Beim Umsetzen bekommt *cortés* diesen Eintrag.
- **Überflüssiger Eintrag:** Ein `adj`-Feld enthält dieselbe Form, die ohne dieses Feld ohnehin entstünde (nach Regel bzw. bei `fpl` durch Ableitung aus `f`). Ausgenommen ist `adj.f` bei Adjektiven auf -és und -ol (Bestätigung, siehe oben).

**Oberfläche:**
- `features/dictionary/Dictionary.tsx`: rendert Formzeilen nach §3.3a (drei Zeilen, Pfeil „→“, Bezeichnung und „+ N weitere Formen“ klein und grau). Die Zeile ist wie jede Zeile ein Link. Formtreffer übergeben beim Navigieren den Router-Zustand `{ highlight: FormSlot[] }`, zusätzlich zu dem Zustand, den das Verzeichnis für Zurück und Filter schon nutzt (`viewState`). `aria-label` der Zeile wie in §3.3a.
- `features/dictionary/VocabDetail.tsx`: liest `highlight` aus dem Router-Zustand und gibt es an `VerbDetail`/`VerbTable` (neue optionale Prop) bzw. an die Plural- und Formenzeile weiter. Hervorgehobene Formen bekommen eine eigene Klasse (z. B. `form-hit`, Hintergrund aus einem Farb-Token, Fettdruck). Nach dem ersten Rendern scrollt die Seite die erste hervorgehobene Stelle in den sichtbaren Bereich (`scrollIntoView({ block: 'center' })`). Die Zeile „Formen“ der Adjektive nutzt `adjectiveForms()` (§3.3a).
- `components/VerbOverlay.tsx` (Lernsitzung) bekommt keine Hervorhebung.
- CSS in `styles/global.css`: Token für die Hervorhebung in Hell und Dunkel. `src/styles/global.test.ts` prüft deren Kontrast wie bei den übrigen Farben.

**Tests:**
- Vitest: alle Soll-Beispiele aus §3.3a (mit den echten Vokabeldaten oder mit Testvokabeln), die Regel F < G, Mindestlängen (1 Zeichen: nichts; 2 Zeichen: nur Formstufe 0; ab 3: beide), Nomen-Plurale mit Leerzeichen, Akzent- und Großschreibung, Auswahl der gezeigten Form bei Akzentpaaren (*compre*/*compré*, *levanto*/*levantó*), Sortierung in den vier Gruppen aus §3.3a, Zusammenspiel mit Filtern, Bezeichnungen samt Zusammenfassen (auch gemischte Zahl, per Testvokabel), „+ 1 weitere Form“ / „+ N weitere Formen“, reflexive Verben (ohne Pronomen, Imperativ mit Pronomen, *ir* und *irse* nebeneinander), vosotros-Formen. Für `adjectiveForms` je Regel mindestens ein Beispiel, die Komparative, Akzentfälle (*joven, cortés, alemán, iraní* per Testvokabel) dass `adj` überschreibt (*español* per Testvokabel) und die Ableitung von f. Pl. aus `adj.f` (*inglés* nur mit `f` ergibt *inglesas*; ein gesetztes `fpl` hat Vorrang). Für den Vokabel-Validator: beide Warnungen zu `adj` (fehlende Femininform bei -és/-ol, überflüssiger Eintrag samt Ausnahme für bestätigtes `adj.f`).
- Browser-Smoke-Test (`scripts/browser-smoke.ts`): Im Verzeichnis „podemos“ eingeben, die Zeile „podemos → poder“ mit „1. Pl. Presente“ erscheint. Antippen öffnet die Detailseite von *poder*, die Zelle *podemos* ist hervorgehoben und sichtbar. Zurück: Suchtext und Filter sind erhalten. Eine Adjektiv-Detailseite zeigt die Zeile „Formen“.


### 14.4 Lernen-Seite: Kacheln und Auswahlfenster (festgelegt und umgesetzt 2026-11-20)

Ersetzt die vier Dropdowns von `features/study/StudySetup.tsx` (Route `/`) durch vier Kacheln mit Auswahlfenster. Verhalten kurz: §3.3. Der Entwurf („Entwurf B“, Standardzustand und Auswahlfenster) liegt nicht im Repo; bei Abweichungen gilt dieser Abschnitt.

**Ziel:** Die Seite wird ruhiger und lesbarer. Alle vier Auswahlen sind ohne Wischen erreichbar, der Standardzustand passt auf 390 × 844 px (Tab-Leiste eingerechnet) ohne Scrollen. Die Funktionen bleiben: Thema, Niveau, Wortart, Richtung, Starten. Es gilt **Einfachauswahl** (ein Wert je Feld). Mehrfachauswahl ist nicht Teil dieser Umsetzung.

**Unverändert (gilt weiter):**
- Keine Zähler und keine Serie auf der Seite (§3.3).
- Filter nur für die Sitzung, nichts wird gespeichert (kein `localStorage`, keine Datenbank, keine Änderung an `QueueFilters`). Bei jedem Aufruf stehen Thema, Niveau und Wortart auf „alle“ und die Richtung auf `both`. Ein Tabwechsel setzt alles zurück (§14.1, Navigation). Dasselbe gilt für den Rückweg aus einer Sitzung („Zur Filterauswahl“): `StudySetup` wird dabei neu eingehängt, alles steht wieder auf den Standardwerten (entschieden 2026-11-20). `Study.tsx` bleibt unverändert.
- Startlogik: `topic`, `level` und `pos` nur bei gesetztem Wert, `direction` immer, dann `onStart(filters)`.
- Seitenstruktur nach AGENTS.md: Inhalt in `.screen`, Überschrift als direktes `h1`-Kind (`PageTitle brand`, „Lernen“). Das Logo oben rechts kommt aus dem Layout, nicht selbst einbauen.
- Keine Änderungen an `domain/queue.ts`, `data/`, `domain/srs.ts`, `domain/dictionary.ts` und an der Sitzung in `Study.tsx`.
- Die Klassen `.setting`, `.settings-form`, `.seg` bleiben (Einstellungen nutzen sie). `select.field` entfällt seit §14.5 (das Verzeichnis nutzt `.field-btn`).

**Optionen je Feld** (Reihenfolge wie bisher):
- **Thema:** „Alle Themen“ (Wert `""`), dann `topicOptions(topics)` (Grundwortschatz zuerst).
- **Niveau:** „Alle Niveaus“ (`""`) plus die Niveaus bis einschließlich `settings.maxLevel` in der Reihenfolge von `LEVEL_ORDER` (A1, A2, B1). Bei Maximalniveau A2 also „Alle Niveaus“, A1, A2.
- **Wortart:** „Alle Wortarten“ (`""`), dann die Plural-Labels aus `POS_LABEL_PLURAL` in dessen Reihenfolge (Verben, Nomen, Adjektive, Adverbien, Zahlen, Redewendungen, Sonstiges). `POS_LABEL` (Einzahl) bleibt nur für das Kennzeichen der Detailseite; Filter (Lernen-Seite und Verzeichnis) zeigen den Plural.
- **Richtung:** `de-es` „Deutsch → Spanisch“, `es-de` „Spanisch → Deutsch“, `both` „Beide Richtungen“ (wie `DIRECTION_LABEL`).

#### Aufbau der Seite

Drei Teile: Kopf, Kachelraster, Startblock. Die Tab-Leiste bleibt unverändert.

```
Lernen                         [Logo oben rechts]
┌──────────────┬──────────────┐
│ THEMA    (✎) │ NIVEAU   (✎) │
│ Alle Themen  │ Alle Niveaus │
├──────────────┼──────────────┤
│ WORTART  (✎) │ RICHTUNG (✎) │
│ Alle Wortart…│ Beide Richt… │
│              │ mal so, mal… │
└──────────────┴──────────────┘

[ Zusammenfassung ]
[      Starten      ]
───────── Tab-Leiste ─────────
```

Die Skizze ist schematisch: Sie kürzt die Werte mit „…“ ab. Maßgeblich ist der Umbruch auf bis zu zwei Zeilen (siehe „Lange Werte“).

Der Kopf enthält den Titel, das Logo und darunter einen kurzen Satz: „Wähle aus, was du heute lernen möchtest.“ (`p.study-lead`, 1 rem, `--muted`, eine Zeile; festgelegt 2026-11-20). Der Satz steht 20 px unter der Überschrift (`margin-top: 20px`; der Überschriftenabstand von 16 px fällt mit diesem Außenabstand zusammen, es zählt der größere Wert) und das Kachelraster 20 px unter dem Satz (`margin-top: 20px` auf `.study-grid`), oben und unten ist der Abstand also gleich. Der Satz ist reiner Text, kein `aria-live`, keine Interaktion. Der Startblock folgt im Abstand von 16 px direkt auf das Kachelraster, der Rest der Seite bleibt leer (nichts wird aufgefüllt oder nach unten gezogen). Die Seite nutzt wie die anderen Tabs die Spalte mit `max-width: 560px`; Logo und Überschriftenabstand (`.screen:not(.center) > h1`) bleiben.

**Kachelraster:**
- Zwei Spalten gleicher Breite, Abstand 12 px, zwei Zeilen.
- Jede Kachel ist ein `<button type="button">` mit `aria-haspopup="dialog"` und dem Namen „<Feld>: <voller Wert>, ändern“, z. B. „Thema: Alle Themen, ändern“, „Richtung: Beide Richtungen, ändern“.
- Mindesthöhe 124 px, Innenabstand 14 px, Radius `--radius`, Schatten `--shadow`. **Maße und Radien kommen aus den Tokens** (`--radius` = 22 px, `--radius-sm` = 16 px), nicht aus festen Pixelwerten.
- Oben ein 6 px hoher Farbbalken in der Akzentfarbe (absolut, volle Breite).
- Inhalt in einer Spalte, Abstand 8 px, Verteilung „space-between“:
  - Zeile oben: Beschriftung in Versalien (0,72 rem, Gewicht 700, Buchstabenabstand 0,08 em, `--muted`) links, rechts ein Stiftsymbol (Inline-SVG, 13 px) in einem Kreis von 26 px in der Tönung der Kachel.
  - Unten: Wert in `--font-head`, 1,12 rem, Gewicht 800; darunter optional eine Zeile in 0,8 rem und `--muted`.
- **Lange Werte:** Der Wert bricht auf bis zu zwei Zeilen um, danach folgt „…“ (`line-clamp`). Der Untertext ist einzeilig mit „…“. Die Kachel wächst über 124 px hinaus, wenn der Inhalt es braucht (`min-height`); die Zeile des Rasters wächst dann für beide Kacheln. Der volle Wert steht immer im Namen der Kachel. Lange einzelne Wörter (z. B. „Grundwortschatz“ bei 390 px Breite) werden automatisch getrennt (`hyphens: auto` mit `lang="de"`, dazu `overflow-wrap: anywhere` als Rückfall, damit nichts abgeschnitten wird); die Schrift wird dafür nicht verkleinert (entschieden 2026-11-20).

| Kachel | Beschriftung | Akzentfarbe (Balken) | Tönung (Kreis) |
|---|---|---|---|
| Thema | THEMA | `--turquoise` | `--turquoise-soft` |
| Niveau | NIVEAU | `--yellow` | `--yellow-soft` |
| Wortart | WORTART | `--magenta` | `--magenta-soft` |
| Richtung | RICHTUNG | `--muted` | `--surface-2` |

| Feld | Wert (Standard) | Wert (gesetzt) | Untertext |
|---|---|---|---|
| Thema | Alle Themen | Name des Themas, z. B. „Zahlen & Zeit“ | keiner |
| Niveau | Alle Niveaus | „A1“, „A2“, „B1“ | keiner |
| Wortart | Alle Wortarten | Plural-Label, z. B. „Verben“ | keiner |
| Richtung | Beide Richtungen | „DE → ES“ bzw. „ES → DE“ | „Vorderseite Deutsch“ bzw. „Vorderseite Spanisch“; bei „Beide“: „mal so, mal so“ |

**Maximalniveau A1:** Die Niveau-Kachel ist deaktiviert (`disabled`), zeigt „A1“, hat keinen Untertext und **kein Stiftsymbol**. Ihr Name lautet „Niveau: A1“ (ohne „ändern“), sie hat kein `aria-haspopup`. Darstellung wie andere deaktivierte Bedienelemente (Deckkraft 0,55, Cursor `not-allowed`). Das Auswahlfenster lässt sich nicht öffnen. Intern bleibt `level` leer (Filter wie heute: bei A1 gibt es ohnehin nur A1).

**Startblock:**
- Karte in `--surface` (im Dunkelmodus also nicht weiß), Radius `--radius`, Schatten `--shadow`, Innenabstand 14 px, 10 px zwischen Zusammenfassung und Button. Im Dokumentfluss (kein `position: fixed`).
- **Zusammenfassung** in 0,85 rem, `--muted`, Format `<Thema> · <Niveau> · <Wortart> · <Richtung>`. Der Themenname ist nicht fett, alle vier Teile haben dieselbe Schrift. Jedes Kriterium steht als Ganzes in einer Zeile (`white-space: nowrap` je Teil, `.study-summary-part`): Passt es nicht mehr hinter das vorige, rutscht es komplett in die nächste Zeile, mitten in einem Kriterium wird nie umbrochen. Der Trennpunkt „·“ gehört zum vorangehenden Kriterium und steht nie am Zeilenanfang (festgelegt 2026-11-20). Der Niveau-Teil heißt „Alle Niveaus“ oder „Niveau A2“, bei Maximalniveau A1 „Niveau A1“ (passt zur Kachel). Die Richtung steht ausgeschrieben („Deutsch → Spanisch“). Beispiele: „Alle Themen · Alle Niveaus · Alle Wortarten · Beide Richtungen“; „Zahlen & Zeit · Niveau A2 · Verben · Deutsch → Spanisch“. Kein `aria-live`.
- **Button „Starten“** (`.btn.btn-block`; weichen die Maße von `.btn` ab, per Zusatzklasse): Höhe mindestens 56 px, volle Breite, Radius 999 px, Hintergrund `--btn-bg`, Schrift `--on-btn`, 1,05 rem, Gewicht 700. Immer vorhanden (wird nie ausgeblendet); auf kleinen Bildschirmen erreicht man ihn durch Scrollen (siehe Größen).

**Größen:** Richtwerte: Kopfzeile etwa 40 px, Satz darunter etwa 22 px (je 20 px Abstand oben und unten), Kacheln je 124 px, Zeilenabstand 12 px, Abstand zum Startblock 16 px, Startblock etwa 130 px. Auf 390 × 844 px braucht der Inhalt damit rund 510 px von etwa 730 nutzbaren (Polster unten für die Tab-Leiste steckt schon in `.screen`), es bleibt Leerraum unter dem Startblock (so entschieden). Auf kleinen Bildschirmen (z. B. 360 × 640 px) darf die Seite scrollen; der Startknopf ist am Ende erreichbar.

#### Auswahlfenster

Jede Kachel öffnet ein Auswahlfenster von unten, eines je Feld. Es wird nur bei „offen“ eingehängt (der Wisch-Hook braucht das Element beim Einhängen).

- **Hintergrund:** wie das Verb-Overlay (`.overlay-backdrop`, `z-index` 50, `rgb(0 0 0 / 0.5)`), damit der Hook beim Ziehen die Farbe nicht umschaltet. Am Bildschirmrand unten ausgerichtet, **auch ab 700 px** (die Regel des Verb-Overlays, die ab 700 px zentriert, wird dafür mit einer eigenen Modifier-Klasse überschrieben). Tippen auf den Hintergrund schließt ohne Änderung. Die Tab-Leiste liegt darunter.
- **Fenster** (`.study-sheet`): volle Breite, höchstens 560 px, zentriert; Höhe höchstens 78 % der Bildschirmhöhe (`dvh`, mit `vh` als Rückfall); obere Ecken 28 px Radius; Hintergrund `--surface`; Schatten nach oben (`0 -10px 30px rgb(0 0 0 / 0.18)`, als Literal in `global.css` wie beim Verb-Overlay); Innenabstand oben 10 px, seitlich und unten 16 px (unten plus Safe-Area). `overscroll-behavior: contain`. Layout: Spalte (Flex) mit Griff, Überschrift und Optionsliste; nur die Optionsliste scrollt (`min-height: 0`, `flex: 1`), Griff und Überschrift bleiben stehen.
- **Griff:** Maße wie `.overlay-grip` (40 × 5 px, abgerundet, zentriert, gleiche Farbe), 10 px Abstand darunter. `.overlay-grip` selbst hat einen negativen oberen Außenabstand für 20 px Innenabstand und passt deshalb hier nicht: `.study-sheet` bekommt eine eigene Griff-Klasse ohne negativen Abstand. Ab 700 px ausgeblendet (dort wischt nichts).
- **Überschrift:** Name des Feldes („Thema“, „Niveau“, „Wortart“, „Richtung“), 1,2 rem, Gewicht 800, `--font-head`.
- **Optionsliste:** `role="radiogroup"` (beschriftet über die Überschrift), vertikal, Abstand 6 px, `overflow-y: auto` und `overscroll-behavior: contain`, wenn sie nicht passt. Beim Öffnen wird die gewählte Option in den sichtbaren Bereich gescrollt (`scrollIntoView({ block: "nearest" })`).
- **Option:** `role="radio"` mit `aria-checked`, Mindesthöhe 52 px, Innenabstand seitlich 14 px, Abstand zum Kreis 12 px, Rahmen 1,5 px `--border`, Radius `--radius-sm`, Hintergrund `--surface`, Schrift 1 rem, Gewicht 600.
  - Kreis links: 20 px, Rahmen 2 px `--border`, Hintergrund `--surface`.
  - Gewählte Option: Rahmen `--turquoise`, Hintergrund `--turquoise-soft`, Kreis mit 6 px Rahmen in `--turquoise`.
  - Fokus: 3 px türkis (`--turquoise`), Abstand 2 px (nicht magenta, §7). Hover nur unter `@media (hover: hover)`.
- **Auswahl:** Ein Tipp (oder Leertaste/Enter) setzt den Wert und schließt das Fenster sofort. Es gibt keinen Bestätigungsknopf und keinen Schließen-Knopf (entschieden).
- **Schließen ohne Änderung:** Tippen auf den Hintergrund, Escape (`stopPropagation`), Wischen nach unten (nur Handy) und die Zurück-Taste des Geräts.
- **Zurück-Taste:** Wie beim Verb-Overlay (§14.1) legt das Öffnen einen History-Eintrag an; „Zurück“ (`popstate`) schließt nur das Fenster, Schließen per Auswahl, Escape, Hintergrund oder Wischen nimmt den Eintrag mit `history.back()` wieder weg. Die Logik (History-Eintrag, Escape, Fokusfalle, Fokus zurückgeben) wird nicht doppelt geschrieben, sondern aus `VerbOverlay.tsx` in einen gemeinsamen Hook gezogen (`hooks/useDialogBehavior.ts`), den beide nutzen; das Verhalten des Verb-Overlays bleibt unverändert. Der Hook braucht zwei Erweiterungen gegenüber dem heutigen Code: (1) einen Parameter für das Element, das beim Öffnen den Fokus erhält (Verb-Overlay: der Dialog selbst, Auswahlfenster: die gewählte Option); (2) eine Tab-Behandlung, die Roving-Tabindex versteht. Die heutige Liste fokussierbarer Elemente in `VerbOverlay` (`button:not([disabled])`, `[tabindex]:not([tabindex="-1"])`) zählt auch Buttons mit `tabindex="-1"`; mit Roving-Tabindex würde Tab das Fenster sonst verlassen. Die Optionen dürfen `<button role="radio">` sein, wenn die Fokusfalle Elemente mit `tabindex="-1"` ausschließt. Keine Öffnungsanimation und keine Scroll-Sperre der Seite (wie beim Verb-Overlay); `prefers-reduced-motion` greift ohnehin global.
- **Wischen nach unten (Pflicht auf dem Handy, unter 700 px):** über `hooks/useSwipeToClose.ts` wie im Verb-Overlay (Schwellen und Verhalten: §14.1). **Hook-Erweiterung:** Der Hook prüft heute `scrollTop` des Sheets selbst. Hier scrollt aber nur die Optionsliste. Deshalb bekommt er einen **optionalen vierten Parameter** `scroller?: RefObject<HTMLElement | null>`: Ist er gesetzt, zählt dessen `scrollTop` für „ganz oben“, sonst wie bisher das des Sheets. Das Verb-Overlay ändert sich nicht. Steht die Liste ganz oben, zieht der Wisch das Fenster; ist sie nach unten gescrollt, scrollt sie normal weiter. Der `onClose` an den Hook muss stabil sein (`useCallback`). Die Entscheidung „Inhalt ganz oben?“ (`scrollTop` des Scrollers, falls gesetzt, sonst des Sheets, `<= 0`) steht als kleine reine Funktion in `components/swipeClose.ts`, damit sie sich in `swipeClose.test.ts` testen lässt.

**Tastatur und Barrierefreiheit:**
- Das Fenster ist ein Dialog: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` auf die Überschrift.
- Beim Öffnen erhält die gewählte Option den Fokus, sonst die erste. Roving-Tabindex: nur diese Option ist per Tab erreichbar. Tab und Umschalt+Tab bleiben im Fenster (Fokusfalle, praktisch auf der Liste).
- Pfeil auf/ab (und links/rechts) bewegen **nur den Fokus** zwischen den Optionen (am Ende springt er an den Anfang bzw. umgekehrt); Pos1/Ende springen zur ersten bzw. letzten Option. Leertaste oder Enter wählen aus. (Das weicht von nativen Radio-Buttons ab, bei denen der Pfeil auswählt, weil hier die Auswahl das Fenster schließt.)
- Beim Schließen, auch nach einer Auswahl, kehrt der Fokus zur Kachel zurück, die das Fenster geöffnet hat. `StudySetup` gibt ihn ausdrücklich zurück (Referenz auf die Kachel), er hängt nicht nur am vorherigen Fokus: Safari fokussiert Buttons beim Tippen nicht.
- Kacheln und „Starten“ haben den normalen magentafarbenen Tastaturfokus.

#### Umsetzung im Code

- `features/study/StudySetup.tsx`: komplett neu aufgebaut. Zustand lokal (`useState`): `topic` (`""` = alle), `level` (`""` oder `Level`), `pos` (`""` oder `Pos`), `direction` (`DirectionSetting`, Standard `"both"`) und welches Fenster offen ist (`"topic" | "level" | "pos" | "direction" | null`). Das Fenster merkt sich nichts außerhalb der Komponente. Props (`onStart`) bleiben.
- Neue Dateien in `features/study/`: `ChoiceTile.tsx` (Kachel) und `ChoiceSheet.tsx` (Auswahlfenster, Props etwa: Titel, Optionen `{ value, label }`, gewählter Wert, `onSelect`, `onClose`). Eine einzige Datei ist auch in Ordnung, wenn sie übersichtlich bleibt.
- Reine Hilfsfunktionen ohne React (in `features/study/studyChoices.ts` o. Ä.), mit Vitest getestet: Niveau-Optionen aus `maxLevel`, Kachelwerte und Untertexte, Zusammenfassung, Aufbau des `QueueFilters`-Objekts (`topic`/`level`/`pos` nur bei gesetztem Wert, `direction` immer).
- `styles/global.css`: neue Klassen mit Präfix `study-` (`.study-grid`, `.study-tile`, `.study-start`, `.study-sheet`, `.study-option` usw.), nur Farb-Tokens, keine Hex-Werte. Die Literale `rgb(0 0 0 / …)` für Hintergrund und Schatten sind wie beim Verb-Overlay erlaubt. Dunkelmodus über die vorhandenen Tokens (`global.test.ts` prüft deren Kontrast).
- `hooks/useSwipeToClose.ts`: optionaler Parameter `scroller` (siehe oben).
- `src/styles/global.test.ts`: Die Regel zum Dropdown-Pfeil gilt seit §14.5 für `.setting select, .field-btn` (Einstellungen und Filterknöpfe des Verzeichnisses). Optional: Test, dass `.study-tile` mindestens 124 px und `.study-option` mindestens 52 px hoch sind.

**Tests:**
- Vitest: die reinen Hilfsfunktionen (alle Maximalniveaus A1/A2/B1, Kachelwerte und Untertexte je Richtung, Zusammenfassung inkl. Maximalniveau A1, Filterobjekt in allen Kombinationen). Test der reinen „ganz oben?“-Funktion für die Wisch-Logik mit und ohne `scroller` (`components/swipeClose.test.ts`).
- Browser-Smoke-Test (`scripts/browser-smoke.ts`): Die Prüfungen zur Lernen-Seite arbeiten mit Kacheln statt Dropdowns (Hilfsfunktionen `openTile`, `chooseOption`, `choose`); alle Stellen mit einem Dropdown auf der Lernen-Seite sind umgebaut. Geprüft werden: Kacheln öffnen das Fenster; Auswahl schließt es, setzt die Kachel und die Zusammenfassung; Richtung „ES → DE“ zeigt „Vorderseite Spanisch“; bei Maximalniveau A1 ist die Niveau-Kachel deaktiviert, zeigt „A1“ und lässt sich nicht öffnen; bei A2 nur „Alle Niveaus“, A1, A2; Grundwortschatz steht direkt nach „Alle Themen“; Escape schließt das Fenster, der Fokus kehrt zur Kachel zurück; nach Neuladen steht die Richtung wieder auf „Beide“; „Starten“ übergibt die Filter und startet die Sitzung. Die Prüfung „Logo oben rechts“ (8e6) listet `""` schon.
- Wischgeste, Zurück-Taste und Breiten ab 700 px lassen sich im Smoke-Test nur schwer prüfen: mit Playwright und Touch-Emulation (Chromium ist in der Cloud-Umgebung vorhanden) oder manuell.

**Manuelle Prüfung:**
1. Standardzustand bei 390 × 844 px: kein Scrollen, Logo oben rechts, Titel „Lernen“ im Wortmarkenstil.
2. Jede Kachel öffnet ihr Fenster, Auswahl schließt es, Kachel und Zusammenfassung zeigen den neuen Wert.
3. Maximalniveau A1: Niveau-Kachel deaktiviert, „A1“, Zusammenfassung „Niveau A1“. A2: Fenster mit „Alle Niveaus“, A1, A2.
4. Escape, Hintergrund und Zurück-Taste schließen; Tab, Pfeiltasten, Leertaste und Enter funktionieren; der Fokus kehrt zur Kachel zurück.
5. Wischen nach unten schließt das Fenster; bei gescrollter Themenliste scrollt der Wisch die Liste, ab dem Anfang der Liste zieht er das Fenster. Der Hintergrund springt dabei nicht in der Farbe.
6. Ab 700 px: Fenster unten, kein Griff, kein Wischen.
7. Dunkelmodus (Systemeinstellung und `data-theme="dark"`): Text und Kacheln gut lesbar.
8. Starten übergibt dieselben Filter wie vorher; Tabwechsel und zurück setzt alle Filter auf die Standardwerte.

**Nicht Teil dieser Umsetzung:** Mehrfachauswahl; eine Vorschau-Karte oder andere Illustration; Änderungen an Statistik, Einstellungen und „Mehr“ (das Verzeichnis folgte später, §14.5); Erinnerung der letzten Auswahl über Sitzungen hinweg (widerspricht §3.3).

**Festlegungen (2026-11-20, aus der Prüfung der ersten Vorlage):** Tokens statt der in der Vorlage genannten 20/14 px; Hintergrund wie das Verb-Overlay statt `rgb(18 32 30 / 0.4)`; `useSwipeToClose` bekommt den optionalen `scroller`; Zurück-Taste schließt das Fenster; Fenster bleibt ab 700 px unten, ohne Griff; Zusammenfassung „Niveau A1“ bei Maximalniveau A1; deaktivierte Niveau-Kachel ohne „ändern“, `aria-haspopup` und Stift; kein Schließen-Knopf; Pfeiltasten bewegen nur den Fokus; keine Animation und keine Scroll-Sperre; gewählte Option wird sichtbar gescrollt; lange Werte brechen auf zwei Zeilen um.

### 14.5 Verzeichnis: Filter mit Auswahlfenster (festgelegt und umgesetzt 2026-11-20)

Die drei Browser-Dropdowns im Verzeichnis (`features/dictionary/Dictionary.tsx`) sind durch Knöpfe ersetzt, die das Auswahlfenster aus §14.4 öffnen. Verhalten kurz: §3.3.

- **Knopf:** `<button type="button" class="field field-btn">` in `.filters`, gleiche Maße und gleicher Pfeil wie das frühere Dropdown (`.field-btn` teilt sich die Pfeil-Regel mit `.setting select`, siehe `global.css`). Text links, einzeilig mit Auslassungspunkten. `aria-haspopup="dialog"`, Name wie bei den Kacheln: „Thema: Alle Themen, ändern“. Tastaturfokus türkis (wie das Suchfeld).
- **Optionen:** dieselben Hilfsfunktionen wie auf der Lernen-Seite (`topicChoices`, `levelOptions`, `posChoices` aus `features/study/studyChoices.ts`). Thema: „Alle Themen“, dann `topicOptions(topics)` (Grundwortschatz zuerst). **Niveau: immer „Alle Niveaus“, A1, A2, B1** (`levelOptions()` ohne Argument bietet alle Niveaus, unabhängig von `settings.maxLevel`; die Lernen-Seite übergibt das Maximalniveau). Wortart: „Alle Wortarten“, dann die Plural-Labels (`POS_LABEL_PLURAL`).
- **Auswahl:** setzt den Filter sofort (Einfachauswahl) und schließt das Fenster. Suchtext, Statuszeile, Chips, „Filter löschen“ und die gespeicherten Filter (`viewState`) bleiben unverändert. Der Chip der Wortart zeigt den Plural („Verben“). Für „Alle …“ (leerer Wert) gibt es keinen Chip.
- **Fokus:** Nach dem Schließen (auch nach einer Auswahl) bekommt der Knopf, der das Fenster geöffnet hat, den Fokus zurück (ausdrücklich über eine Referenz, wie bei den Kacheln). Das frühere Lösen des Fokus nach einer Mausauswahl (`pickedWithPointer`) entfällt.
- **Zurück-Taste, Escape, Hintergrund, Wischen:** wie §14.4. Das Fenster hängt nur bei „offen“ im Verzeichnis; Scrollposition und Filter der Liste bleiben dabei erhalten.
- **Browser-Smoke-Test:** Hilfsfunktionen `filterExpr`, `filterText` und `chooseFilter`. Geprüft werden: drei Knöpfe statt `<select>`; Niveau-Auswahl bietet auch bei Maximalniveau A1 „Alle Niveaus“, A1, A2, B1; Themenliste mit Grundwortschatz nach „Alle Themen“; Escape gibt den Fokus an den Knopf zurück; Wortart im Plural bei Knopf und Chip; Suche, Filter, Chips und Scrollposition wie zuvor.

### 14.6 Erklärvideo (festgelegt und umgesetzt 2026-11-21)

Das KI-erzeugte Erklärvideo (Inhalt, Entscheidungen und Erzeugung: `docs/ERKLAERVIDEO.md`) ist als eigene Seite in die App eingebunden. Es gibt keinen externen Dienst und kein Backend; das Video ist eine Datei der App wie die Vokabeln.

- **Dateien:** `public/video/palabrita-erklaervideo.mp4` (1080 × 1920, rund 67 s, rund 7 MB), `public/video/palabrita-erklaervideo-poster.jpg` (Vorschaubild, ein Bild aus dem Video) und `public/video/NOTICE.md` (Hinweis mit der Namensnennung der Musik, wie `public/vocab/NOTICE.md`). Neue Fassungen des Videos nur nach ausdrücklicher Bestätigung des Nutzers einchecken (Regel in `docs/ERKLAERVIDEO.md`).
- **Eintrag im Tab „Mehr“:** als letzter Link der Liste, nach „Impressum“ und über „Lernfortschritt zurücksetzen“ (§14). Er sieht aus wie die anderen Einträge (weiße Fläche, 56 px hoch, normale Schrift) und führt auf `/video`. Rechts steht ein gelber Kreis (`--yellow`, 38 px) mit dunklem Play-Dreieck (`PlayIcon` in `components/icons.tsx`, Farbe fest `#12201e`, damit es im Dunkelmodus lesbar bleibt). Hinter „Erklärvideo“ steht klein und grau „Palabrita in einer Minute“ (in derselben Zeile; reicht der Platz nicht, bricht es darunter um). Der Eintrag heißt für Screenreader „Erklärvideo Palabrita in einer Minute“, das Symbol ist dekorativ.
- **Seite `/video`** (`features/video/Video.tsx`, Layout-Route, Logo oben rechts, Zurück-Link „← Mehr“): Überschrift „Erklärvideo“, ein Satz („In gut einer Minute siehst du, wie Palabrita funktioniert: Lernen, Verzeichnis, Formsuche und Statistik.“), der Player, die Zeile „Sprecher und Stimme sind KI-erzeugt.“ und die Namensnennung der Musik. Keine Angaben zu Länge oder Format.
- **Player:** nativer `<video controls playsInline>` im Hochformat (9:16, schwarzer Rahmen mit den Ecken der Karten). Seine Breite ist höchstens `62vh * 9 / 16` und höchstens die Spaltenbreite, damit Bild und Bedienleiste auf einen Bildschirm passen. **`preload="none"`**: Die Datei wird erst beim Abspielen geladen, wer die Seite nur öffnet, lädt nur das Vorschaubild (`poster`). Schlägt das Laden fehl (typisch: ohne Netz), erscheint unter dem Player „Das Video lässt sich gerade nicht laden. Prüfe deine Internetverbindung und versuche es noch einmal.“ (`role="alert"`); sobald das Video läuft, verschwindet der Hinweis.
- **Namensnennung (CC BY 4.0):** unter dem Player, derselbe Text wie in `public/video/NOTICE.md`: „Musik: ‚Vibrant Momentum (Energetic Track for Engaging Content)‘ von LolaMoore, Lizenz CC BY 4.0. Für das Video gekürzt, ein- und ausgeblendet und in der Lautstärke angepasst.“ „LolaMoore“ verlinkt auf `https://freesound.org/people/LolaMoore/sounds/762602`, „CC BY 4.0“ auf `https://creativecommons.org/licenses/by/4.0/` (beide `target="_blank" rel="noreferrer"`). Das sind Links, die erst bei einem Tipp geöffnet werden; die App stellt beim Anzeigen keine externe Anfrage. Dieselbe Angabe steht in den Metadaten der MP4-Datei (`title`, `copyright`, `comment`, gesetzt von `scripts/video/07-zusammenbau.cjs`). Ändert sich die Musik, müssen die Seite, `NOTICE.md` und die Metadaten angepasst werden.
- **Teilen:** Der Link zum Teilen ist die Seite (`<Basis-URL>/#/video`, Entscheidung des Nutzers), nicht die Datei. Er funktioniert direkt, weil der Router ein `HashRouter` ist. Die Datei bleibt zusätzlich unter `<Basis-URL>/video/palabrita-erklaervideo.mp4` abrufbar, gilt aber nicht als Teilen-Link, weil dort die Namensnennung fehlt. Eine Teilen-Schaltfläche gibt es nicht.
- **Offline:** Das Video muss nicht offline abspielbar sein (Entscheidung des Nutzers). Weder Video noch Vorschaubild stehen im Precache (§15). Die Seite selbst ist offline erreichbar und zeigt dann das Vorschaubild nur, wenn es zuvor geladen wurde; abspielen geht nicht.
- **Datenschutz:** Der Abruf von Video und Vorschaubild geht an dasselbe Hosting wie die App (GitHub Pages). Die Texte in §14.2 bleiben richtig („keine externen Anfragen außer dem Abruf der App“).
- **Bestandsnutzer (§10.4):** Neue Route und neue Dateien, kein Eingriff in IndexedDB, `localStorage`, Vokabeln oder bestehende Routen. Keine Migration nötig.
- **Tests:** `scripts/browser-smoke.ts` 8e6 (Logo auf `#/video`) und 8e7/8e7a: Reihenfolge, Höhe und Beschriftung der Einträge in „Mehr“, Überschrift, Zurück-Link, Player (`controls`, `preload="none"`, Quelle, Vorschaubild), Namensnennung samt Links, keine Anfrage nach der Videodatei vor dem Abspielen, kein `mp4`/`jpg` im Precache des Service Workers.

## 15. PWA

`vite-plugin-pwa` mit `registerType: 'prompt'`, Workbox-Precache für App-Shell und `vocab/*.json` (nicht für `video/`, §14.6: `globPatterns` in `vite.config.ts` kennt weder `mp4` noch `jpg`). `UpdateBanner` über `useRegisterSW` (`needRefresh`), Button ruft `updateServiceWorker(true)`. Der Banner prüft auf neue Versionen alle 15 Minuten solange die App geöffnet ist (`registration.update()`) und beim Zurückkehren in den Vordergrund (`visibilitychange`). Aktiv wird die neue Version nach Klick auf „Aktualisieren“ oder, wenn keine Seite der alten Version mehr offen ist, beim nächsten Start. Manifest: Name „Palabrita“, `display: standalone`, `lang: de`, Theme-Farbe Türkis. Icons 192/512/maskable aus SVG (`scripts/make-icons.ts`).

## 16. Test und Deployment

Befehle, lokaler Test (`npm run dev`, `npm run build` + `npm run preview`), Einrichtung von GitHub Pages und die Installation auf dem Handy stehen in der `README.md`. Festlegungen:

- Service Worker, Offline-Modus und Installierbarkeit lassen sich nur mit `build` + `preview` prüfen (`localhost` braucht kein HTTPS).
- **Prüfen im Pull Request, Deployment nach dem Merge:** `.github/workflows/ci.yml` läuft auf jedem Pull Request gegen `main` (Job `check`: Lint, Format-Check, Tests, Vokabelprüfung, Build; bewusst ohne `paths`-Filter). `.github/workflows/pages.yml` läuft bei Push auf `main` und per `workflow_dispatch` und führt nur `npm ci`, `npm run build` und die Veröffentlichung aus, ohne Tests. Der Build bleibt, weil der Versionsstempel (§3) aus dem HEAD-Commit auf `main` stammt und ein Artefakt aus dem PR den falschen Zeitstempel hätte. Dass die ausgelassenen Prüfungen nach dem Merge nicht nötig sind, sichert das Ruleset für `main` (nächster Punkt). Ein direkter Push auf `main` oder ein gelockertes Ruleset hebt diese Garantie auf.
- **Schutz von `main`** (Einstellungen auf GitHub, nicht im Repo hinterlegt; vom Nutzer eingerichtet, 2026-11-23):
  - *Settings → Rules → Rulesets*, Ruleset **`protect-main-branch`**, Enforcement **Active**, Ziel: Standardbranch `main`, **Bypass-Liste leer** (auch der Repo-Eigentümer kann nicht an der Regel vorbei pushen).
  - Regeln: Löschen und Force-Push verboten; **Require a pull request before merging** (0 Freigaben nötig, nur **Squash** als Merge-Methode); **Require status checks to pass** mit dem Pflicht-Check `check` (aus `ci.yml`) und **„Require branches to be up to date before merging“**; **Require linear history**.
  - *Settings → General → Pull Requests*: nur Squash-Merge erlaubt (Merge-Commits und Rebase-Merge aus), „Always suggest updating pull request branches“ und „Automatically delete head branches“ an. **Auto-merge ist nicht aktiviert**: Jeder Merge geschieht von Hand durch den Nutzer.
  - *Settings → Environments → `github-pages`*: Deployment nur von `main`.
  - Damit ist der im PR geprüfte Stand inhaltlich der Stand, der auf `main` landet. Das ist die Voraussetzung dafür, dass `pages.yml` keine Tests mehr ausführt.
  - **Folgen für die Arbeit (auch für Agenten):** Auf `main` kann nicht direkt gepusht werden, jede Änderung läuft über einen Pull Request. Ist ein PR „veraltet“ (`main` hat sich bewegt), den Branch aktualisieren (Button „Update branch“ oder `update_pull_request_branch`) und die CI neu abwarten, erst dann ist er mergbar. Nach einem Merge wird der Head-Branch gelöscht; weitere Arbeit beginnt auf einem neuen Branch von aktuellem `main`. Das Ruleset ändern, lockern oder umgehen darf nur der Nutzer; im Notfall setzt er das Enforcement kurz auf „Disabled“ und danach wieder auf „Active“.
- Statische Auslieferung von `dist/` über GitHub Pages (Workflows siehe oben). Adresse: `https://palabrita.fabiankonig.de/` (Custom Domain). Die Subdomain zeigt per DNS-CNAME auf `fabiankonig.github.io`; die Zuordnung zum Repo legt die Custom-Domain-Einstellung unter Settings → Pages fest, `public/CNAME` hält sie bei jedem Deploy fest. Die alte Adresse `https://fabiankonig.github.io/palabrita/` leitet per 301 dorthin weiter. Der Lernfortschritt ist an die Adresse gebunden (Origin): Auf der neuen Adresse startet er leer, der alte Stand auf `github.io` ist dort nicht sichtbar. Die Hauptdomain `fabiankonig.de` ist bei GitHub verifiziert (TXT-Eintrag `_github-pages-challenge-FabianKonig.fabiankonig.de` beim DNS-Anbieter, dauerhaft belassen); die Verifizierung gilt für den Account und verhindert, dass andere Pages-Seiten unter dieser Domain anlegen.
- **HTTPS ist Pflicht**, damit die PWA auf dem Handy installierbar ist; Pages liefert es mit. Die App läuft unter einem Unterpfad (`base: "./"`, Hash-Router, relative Manifest-Pfade).
- Pages setzt `Cache-Control: max-age=600`. Updates laufen über den `UpdateBanner` (Service Worker), nicht über Cache-Header.
- Der Lernfortschritt liegt je Gerät und je Origin im Browser. PC und Handy sind nicht synchronisiert, und es gibt keine Übertragung zwischen ihnen.

## 17. Annahmen und offene Punkte

- **Offene Punkte:** siehe `docs/TASKS.md`.
