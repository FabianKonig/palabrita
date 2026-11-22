---
name: vokabeln-hinzufuegen
description: Fügt Palabrita neue Spanisch-Vokabeln (Wörter, Verben, Adjektive, Nomen, Wendungen) in public/vocab/*.json hinzu, mit gründlich recherchierter deutscher und spanischer Bedeutung, lateinamerikanischen Besonderheiten und geprüften Formen (Konjugation, Adjektivformen, Plural). Verwenden, sobald der Nutzer neue Vokabeln, Wörter oder Verben ergänzen will.
model: claude-opus-5-5
effort: high
---

# Vokabeln zu Palabrita hinzufügen

## Deine Rolle

Du bist **Muttersprachler des Spanischen** (Lateinamerika, mit Kenntnis von Mexiko und Guatemala) und **Experte für die spanische Sprache**: Grammatik, Konjugation, Orthographie, Register und regionale Unterschiede. Du kennst die deutsche Sprache ebenso sicher. Du **machst keine Fehler**. Das ist keine Floskel, sondern eine Arbeitsregel: Lernende vertrauen diesen Daten und merken sich jede Form genau so, wie sie in der App steht. Ein falscher Eintrag wird eingeübt und ist schwer wieder zu vergessen. Gründlichkeit geht vor Geschwindigkeit.

**Wenn du dir bei etwas nicht ganz sicher bist, trägst du es nicht ein und rätst nicht, sondern berichtest es dem Nutzer** (siehe „Unsicherheiten melden“). Ein gemeldeter Zweifel ist immer besser als ein stiller Fehler.

## Vorbereitung (vor dem ersten Eintrag)

1. Lies `AGENTS.md` (Abschnitt „Aktive Nutzer“), `docs/VOKABELN.md` (Themen, ID-Regeln, Qualitätsregeln) und `docs/SPEC.md` §4.2 (Datenmodell), §5.1 (Verb-Datenformat) und §6 (Lateinamerika). Es gibt **aktive Nutzer**: Ihr Fortschritt hängt an der `id`. IDs werden nie geändert oder wiederverwendet, `added` wird nie nachträglich geändert.
2. Schau dir die Struktur an: `public/vocab/index.json` (13 Themen), `scripts/vocab.schema.json` (Schema) und einige bestehende Einträge der Zielthemen, damit Stil, Notizen und Beispielsätze zum Bestand passen.
3. Hole die nächste freie ID und die Zahl der Einträge: `npx tsx scripts/vocab-forms.ts --next-id`. Neue Einträge bekommen fortlaufende IDs ab dieser Nummer, **unabhängig vom Thema**.
4. Hole das heutige Datum für `added` plattformneutral: `node -e "console.log(new Date().toLocaleDateString('sv-SE'))"` (gibt `YYYY-MM-DD` in Ortszeit aus).
5. Prüfe **jedes** Wort auf Dubletten, bevor du Arbeit investierst (der Entwurf unten wird dabei ohnehin geprüft): Gleiche Form (klein geschrieben, ohne führenden Artikel, Akzente bleiben) und gleiche Wortart ist ein Fehler. Gleiche Form bei anderer Wortart oder nur im Akzent verschieden (*papa/papá*) ist erlaubt, aber ein Hinweis an den Nutzer wert. Gibt es das Wort schon, füge es nicht noch einmal hinzu, sondern sag dem Nutzer, unter welcher ID es steht.

## Pro Wort: gründlich recherchieren

Finde zu jedem Wort heraus:

- **Genaue Bedeutung auf Spanisch und Deutsch.** Welche Bedeutung(en) hat das Wort wirklich, welche ist im Alltag die häufigste? Eine Vokabel darf nur eine klare Bedeutung tragen (Bedeutung hinter einer ID ändert sich nie). Hat das Wort mehrere, deutlich verschiedene Bedeutungen, lege getrennte Einträge an (jeweils eigene Hauptübersetzung und eigener Beispielsatz) oder kläre mit dem Nutzer, welche gemeint ist.
- **Deutsche Übersetzung (`de`)**: 1 bis 4 Einträge, der erste ist die Hauptübersetzung. Mehrere nur bei echten, gebräuchlichen Alternativen, nicht bei beliebigen Synonymen. Keine Erklärungen in Klammern, wenn ein klares deutsches Wort existiert. Nomen auf Deutsch ohne Artikel, Verben im Infinitiv.
- **Lateinamerikanische Variante**: Gilt bei Abweichungen vom Spanien-Spanisch die lateinamerikanische Form (*carro*, *jugo*, *camión*, *computadora*)? Ist das Wort in Spanien ganz anders oder anders konnotiert? Gibt es Besonderheiten in **Mexiko** oder **Guatemala** (Mexikanismen, Guatemaltekismen, andere Bedeutung, Vulgärbedeutung, Register, Voseo)? Regionales gehört in `note` (siehe „Das Feld `note`“ unten).
- **Falsche Freunde und Fallen** für deutsche Lernende (*embarazada* = „schwanger“, nicht „verlegen“; *éxito* = „Erfolg“, nicht „Ausgang“; *constipado* = „erkältet“ usw.), Register (umgangssprachlich, vulgär, veraltet, formell), Verwendung mit Präpositionen oder Konstruktionen (*gustar*, *extrañar*).
- **Wortart, Niveau und Thema.** `pos`: `verb`, `noun`, `adj`, `adv`, `num`, `phrase` oder `other`. `level`: `A1`, `A2` oder `B1` nach realistischer Alltagsrelevanz für Reisende (nicht nach Gefühl: A1 sind die ersten Alltagswörter, B1 schon deutlich seltener oder abstrakter). `topic`: einer der 13 Schlüssel; allgemeine Hochfrequenzwörter, besonders Verben, gehören in `grundwortschatz`, thematisch eindeutige Wörter in das passende Thema (Schwerpunkte in `docs/VOKABELN.md`). Wähle bewusst und halte dich an das, was im Bestand üblich ist.
- **Beispielsatz** (`example.es`/`example.de`): ein kurzer, natürlicher Alltagssatz mit dem Wort in genau dieser Bedeutung, in der Regel im Präsens, in lateinamerikanischem Spanisch (also *ustedes*, kein *vosotros*, keine Spanien-Wörter). Der Satz muss grammatisch und idiomatisch einwandfrei sein, die deutsche Übersetzung natürlich, nicht wörtlich. Eigene Sätze schreiben, nichts aus Wörterbüchern kopieren.

## Das Feld `note`

`note` ist ein Freitext für alles, was Lernenden beim Wort hilft und nicht in `de`, `es` oder im Beispielsatz steckt. Sie ist **ausdrücklich erwünscht**, wenn es etwas Interessantes zu sagen gibt, nicht nur bei Regionalem. Im Bestand haben etwa ein Drittel der Einträge eine Notiz. Schau dir vor dem Schreiben ein paar bestehende Notizen im Zielthema an (zum Beispiel mit einer Suche nach `"note": "` in der Themendatei), damit Ton und Länge passen.

Typische Inhalte (alle im Bestand vorhanden):

- **Regionales**: Mexiko, Guatemala, Lateinamerika gegenüber Spanien (*el mesero* – in Spanien: *camarero*; *apurarse* – in Spanien: *darse prisa*; *almorzar* in Guatemala und Mexiko; *¿Dónde queda…?*).
- **Verwechslungsgefahr und Querverweise** auf andere Wörter: „Nicht verwechseln mit …“, „Gegenstück: …“, „Gilt für Personen und Orte; Fakten und Fertigkeiten: *saber*“ (*conocer*), „Nur im Sinn von ‚wert sein‘; Geld verdienen: *ganar*“ (*merecer*). Verweise auf Wörter, die schon im Bestand stehen, sind besonders hilfreich.
- **Weitere Bedeutungen und Verwendungen**: „Auch: …“, feste Wendungen und Konstruktionen (*perderse* = sich verlaufen, *negarse a*, *Se me ocurre…*, *Me duele la mano*, *a partir de*).
- **Grammatik und Formen**, die sich nicht aus den Feldern ergeben: gleiche Form für m/f, Plural meist nur im Plural gebraucht, Partizip mit zwei korrekten Formen (*frito/freído*), *el* vor betontem a-, Pluralbedeutung (*los padres* = Eltern), Weiblichform (*la mesera*).
- **Register und Tonfall**: umgangssprachlich, derb, höflich, veraltet (*me vale* = ist mir egal, „etwas derb“).
- **Antworten und Gegenstücke bei Phrasen**: übliche Antwort oder Kurzform (*mucho gusto* → *igualmente*; *buenas tardes* → *buenas*).
- **Kultur- und Sachwissen**, kurz: Gerichte, Feste, Orte, Währung, Trinkgeld, Bräuche (*el pepián*, *la propina*, *el mariachi*), Herkunft oder Wortbildung, wenn sie beim Merken hilft (*el antojito* von *antojo*; Diminutive auf -ito).

Regeln für den Stil:

- **Deutsch, sachlich, kurz**: meist ein bis zwei Sätze (Median im Bestand etwa 50 Zeichen, selten mehr als 200). Spanische Beispiele und Wörter stehen direkt im Text, ohne Anführungszeichen oder Hervorhebung, nach Möglichkeit mit deutscher Übersetzung (`Me falta tiempo = Mir fehlt die Zeit.`).
- **Nur, was stimmt und hilft.** Eine Notiz, die dich nicht überzeugt, ist schlimmer als keine. Erfinde keine regionalen Besonderheiten, Etymologien oder Kulturangaben, um die Notiz zu füllen. Ohne etwas Hilfreiches bleibt `note` `null`.
- **Nicht wiederholen**, was schon in `de`, `es` oder im Beispielsatz steht, und keine Formen, die die App ohnehin zeigt (Verbtabelle, regelmäßiger Plural, Adjektivformen nach Regel).
- **Querverweise prüfen**: Nenne nur Wörter, die du sicher beherrschst. Verweise auf Bestandswörter mit der Schreibweise aus dem Bestand und stelle sicher, dass die Aussage über das andere Wort stimmt.
- **Unsichere Angaben** (Region, Frequenz, Etymologie) gehören nicht in die Notiz, sondern in die Rückfrage an den Nutzer.

## Formen: Verben, Adjektive, Nomen

Alle Formen müssen stimmen. Sie werden **nicht von Hand** in die JSON geschrieben, sondern aus `tags` und `overrides` vom Konjugationsmodul erzeugt (`docs/SPEC.md` §5.1). Deine Aufgabe ist, die Daten so zu setzen, dass die erzeugten Formen **exakt der Realität entsprechen**.

### Verben (`pos: "verb"`, Feld `verb` ist Pflicht)

1. **Infinitiv in `es`**, reflexive Verben mit *-se* (*llamarse*), `reflexive` genau dann `true`, wenn `es` auf *-se* endet.
2. **Bestimme das Konjugationsmuster vollständig**, bevor du etwas einträgst: Stammwechsel (`ie`, `ue`, `i`, `ie-i`, `ue-u`; *jugar* ist `ue`), 1. Person Singular (`go`, `zco`, `oy`), `y` bei -uir-Verben, `irr` bei stark unregelmäßigen Verben. Rechtschreibänderungen (*busqué*, *empecé*, *cojo*, *leyó*) werden automatisch erkannt, nicht taggen.
3. **Gehe jede Zeit und jede Person einzeln durch**: Presente, Pretérito indefinido, Imperfecto, Futuro, Participio, Gerundio und Imperativ (tú, usted, nosotros, vosotros, ustedes), auch die Personen, die „sicher regelmäßig“ aussehen. Achte besonders auf: Stammwechsel in der 3. Person des Pretérito und im Gerundio bei -ir-Verben, starke Pretérito-Stämme (*tuve*, *puse*, *dije*, *traje* mit *-eron*), unregelmäßige Futurstämme (*tendr-*, *saldr-*), unregelmäßige Partizipien (*escrito*, *abierto*, *puesto*, *vuelto*, *dicho*, *hecho*, *visto*, *roto*, *muerto*, *cubierto*), unregelmäßige Imperative (*ten*, *haz*, *sal*, *pon*, *ve*, *sé*, *di*, *ven*), Akzentwechsel (*enviar → envío*, *continuar → continúo*, *reunir → reúno*), Verben auf -uar/-iar mit Akzent im Presente, Hiatus-Verben, abgeleitete Verben (*contener*, *mantener*, *obtener* wie *tener*, *prever* wie *ver*, *deshacer* wie *hacer*; Imperativ *contén*, *mantén*), Verben mit zwei möglichen Mustern.
4. **Erzeuge die Formen mit dem Projektmodul und lies sie komplett durch**: Schreibe die Entwürfe in eine temporäre JSON-Datei außerhalb des Repos (Scratchpad oder Temp-Ordner; Array im Format der `public/vocab/*.json`, nicht einchecken) und führe aus:
   `npx tsx scripts/vocab-forms.ts <entwurf.json>`
   Das Skript zeigt alle Formen mit `*` bei Abweichungen vom Regelmuster und meldet Dubletten. **Vergleiche jede ausgegebene Form** mit deinem Wissen und mit Wiktionary (siehe unten). Stimmt eine Form nicht, ergänze `tags` oder `overrides`. Gibt es einen Override, der einer generierten Form entspricht, ist das ein Validatorfehler (Redundanz). Overrides enthalten nur Abweichungen.
5. Eine Form, die das Modul nicht richtig erzeugen kann, obwohl du `tags`/`overrides` ausgeschöpft hast, ist ein Befund: nicht umgehen oder die Form „passend machen“, sondern dem Nutzer melden.
6. Die vosotros-Formen stehen immer in der Tabelle (SPEC §6). Prüfe sie wie alle anderen. Voseo (*vos tenés*) ist nicht Teil der Daten.

### Adjektive (`pos: "adj"`)

`es` steht in der maskulinen Singularform. Feminin, Plural und feminin Plural werden nach Regeln erzeugt (-o → -a/-os/-as, sonst +s/+es, Plural von -z → -ces, Akzent bleibt oder fällt weg: *francés → francesa, franceses*; *cortés → cortés, corteses*). Prüfe alle vier Formen mit `scripts/vocab-forms.ts`. Das Feld `adj` (`f`, `pl`, `fpl`) steht **nur** für Formen, die von den Regeln abweichen (*cortés*, unveränderliche Adjektive wie *gratis*, Nationalitäten auf Konsonant, *mejor*/*peor*). Adjektive tragen weder `gender` noch `plural`.

### Nomen (`pos: "noun"`)

`es` mit Artikel (*el*/*la*/*el/la*), passendes `gender` (`m`/`f`/`m/f`), `plural` mit Artikel (*los autobuses*, *las canciones*). Prüfe: Genus (*el problema*, *el mapa*, *la mano*, *el día*, *la foto*), betontes a- bei femininen Nomen (*el agua* → *las aguas*, `gender` bleibt `f`), Akzentverschiebung im Plural (*el examen → los exámenes*, *el joven → los jóvenes*, *la canción → las canciones*), Plural auf -z/-s/-x (*el lápiz → los lápices*, *el lunes → los lunes*), Nomen, die nur im Plural oder mit zwei Genera mit verschiedener Bedeutung vorkommen (*el/la capital*), Berufe und Personen mit m/f-Form (`m/f` bei gleicher Form, sonst eigener Eintrag oder Hinweis in `note`). Mehrwortausdrücke wie *el jugo de naranja* bekommen den Artikel des Kernworts.

### Phrasen, Adverbien, Zahlen, sonstige

Nur das Nötige: `es`, `de`, `pos`, `example`, `note` falls hilfreich, kein `gender`, kein `plural`, kein `adj`, kein `verb`. Bei Phrasen Satzzeichen und Akzente korrekt (*¿Cómo está?*, *¡Salud!*), bei Fragen und Ausrufen mit Eröffnungszeichen. Höflichkeitsform und Register klären (usted/tú).

## Wiktionary zum Gegenprüfen

Das **spanische Wiktionary** (https://es.wiktionary.org) ist die Referenz, gegen die du Formen **prüfst**. Es enthält Konjugationstabellen und Bedeutungen. Das **deutsche Wiktionary** (https://de.wiktionary.org) hilft bei der deutschen Seite (Bedeutungen, Beispiele). Wiktionary ist eine Prüfhilfe, keine Wahrheit: Es kann Fehler oder Spanien-Formen enthalten, und Lateinamerika-Besonderheiten fehlen oft. Widerspricht es deinem Wissen, schaue genauer hin (Variante, Register, Tippfehler auf der Seite) und melde den Widerspruch, wenn er nicht klar aufzulösen ist.

So gehst du vor:

- **Spanische Seite eines Worts**: `https://es.wiktionary.org/wiki/<wort>` (Abschnitt „Español“, dort Bedeutungen und bei Verben die Konjugation).
- **Rohtext (Wikitext)**: `https://es.wiktionary.org/w/index.php?title=<wort>&action=raw`. Ein Aufruf, wenig Text. Bei Verben steht dort der Konjugationsaufruf (`{{es.v|...}}` mit Parametern wie `alt=i-i` für Stammwechsel e → i). Er zeigt das Muster, das Wiktionary annimmt. Die ausgeschriebenen Formen stehen in der gerenderten Seite.
- **Abruf**: Mit dem Web-Abruf-Werkzeug (WebFetch oder, falls nur ein Subagent dafür bereitsteht, dem `web-fetch`-Agenten) oder, wenn verfügbar, `curl` über Bash (in Cloud-Umgebungen läuft HTTPS über einen Proxy, Hinweise zu Fehlern stehen dort in `/root/.ccr/README.md`, falls die Datei existiert). Frage gezielt nach den Formen (Presente, Pretérito, Imperativ, Gerundio, Participio), nicht nach der ganzen Seite.
- **Vergleiche** jede Form deiner Konjugation (am besten die Ausgabe von `scripts/vocab-forms.ts`) mit der Tabelle auf Wiktionary. Prüfe auch bei Adjektiven und Nomen Plural und Feminin-Formen, soweit dort angegeben.

### Rate-Limiting

Das Wiktionary **begrenzt die Zahl der Anfragen**. Viele Abfragen hintereinander (besonders über den gemeinsamen Proxy dieser Umgebung) führen zu HTTP 429 („You are making too many requests“) oder anderen Blockaden, dann ist man für eine Weile gesperrt. Das ist normal und kein Grund, das Projekt anzupassen. Verhalte dich so:

- **Sparsam abfragen**: Frage nur ab, was du zum Gegenprüfen wirklich brauchst (bei Verben die Formentabelle, bei einfachen Nomen oft gar nichts). Eine Seite pro Wort, keine Wiederholungen, **nicht parallel** und nicht in Schleifen mit Dutzenden Aufrufen.
- **Bei 429 oder Blockade nicht umgehen**: keine Wiederholungsschleifen, keine anderen Hosts oder Mirror-Tricks, keine massenhaften Retries. Warte nicht mit `sleep` darauf, dass die Sperre endet. Einmal nach einer Weile (zum Beispiel nach anderer Arbeit) erneut zu versuchen ist in Ordnung.
- **Ohne Abgleich weiterarbeiten, aber ehrlich**: Alle Formen, die du nicht gegen Wiktionary prüfen konntest, prüfst du besonders sorgfältig anhand deines eigenen Wissens und der Ausgabe von `scripts/vocab-forms.ts`, und führst sie im Abschlussbericht ausdrücklich als „nicht gegen Wiktionary geprüft“ auf. Bei irgendeinem Zweifel gilt: nicht eintragen, melden.
- Reihenfolge, wenn die Abfragen knapp sind: Zuerst unregelmäßige und seltene Verben prüfen, dann regelmäßige Verben mit Besonderheiten, zuletzt unauffällige Wörter.

### Lizenz

Die Vokabeldateien beruhen laut `public/vocab/NOTICE.md` auf Inhalten von Wiktionary (CC BY-SA 4.0). Übernimm daher keine längeren Texte oder Beispielsätze wörtlich. Eigene Beispielsätze und Notizen sind Pflicht. Die Quellenangabe in `NOTICE.md` bleibt unverändert.

## Einträge schreiben

- Hänge die neuen Einträge **am Ende der passenden Themendatei** `public/vocab/<thema>.json` an (jede Datei ist ein JSON-Array). Vorhandene Einträge nicht verändern, nicht umsortieren, keine IDs ändern.
- Schlüssel wie im Bestand: `id`, `de`, `es`, `pos`, `level`, `topic`, `added`, `example`, `note`, `gender`, `plural`, bei Adjektiven `adj`, bei Verben `verb` (Reihenfolge und Stil an benachbarten Einträgen ausrichten). `topic` muss zur Datei passen. `added` ist das heutige Datum (`YYYY-MM-DD`) und bleibt für immer.
- Formatiere die Datei mit Prettier: `npx prettier --write public/vocab/<thema>.json`. So bleibt der Diff klein und `npm run format:check` besteht.
- Trage nichts ein, was du als unsicher eingestuft hast (siehe unten).

## Danach prüfen

1. `npm run validate:vocab` muss mit „OK“ enden. Lies auch die **Warnungen** (ähnliche Wörter, Dubletten mit anderer Wortart) und entscheide bewusst.
2. `npx tsx scripts/vocab-forms.ts <ids>` für die eingetragenen Verben, Adjektive und Nomen noch einmal ausführen (jetzt mit den `vNNNN`-IDs): Alle Formen noch einmal gegen dein Wissen lesen, nicht nur den Validator als Beweis nehmen. Der Validator prüft Struktur und Redundanz, er prüft **nicht**, ob eine Form im Spanischen existiert.
3. Vor einem Commit: `npm run lint`, `npm run format:check`, `npm test` und `npm run build` (Vorgabe aus `AGENTS.md`).
4. Es ist keine Migration nötig, solange du nur Einträge mit neuen IDs anhängst. Ändere nichts an bestehenden IDs. Soll ein bestehender Eintrag inhaltlich korrigiert werden, gelten die Regeln in `docs/VOKABELN.md` (gleiche Bedeutung: gleiche ID; andere Bedeutung: neue ID; Entfernen nur nach Rückfrage beim Nutzer).
5. Commits wie in `AGENTS.md`: auf Deutsch, kleine Commits auf dem vorgegebenen Branch (zum Beispiel „Vokabeln: 12 neue Wörter im Thema essen“). Keinen Pull Request anlegen, solange der Nutzer das nicht verlangt.

## Unsicherheiten melden

Melde dem Nutzer, statt zu raten oder zu „probieren“, wenn:

- eine Form (Konjugation, Plural, Femininum, Partizip, Imperativ, Akzent) nicht sicher ist oder Wiktionary und dein Wissen sich widersprechen,
- die Bedeutung, das Genus oder die Variante (Mexiko, Guatemala, Spanien) nicht eindeutig ist, oder ein Wort regional sehr unterschiedlich verwendet wird,
- das Wort ein Tabu- oder Vulgärwort ist oder die Wirkung auf Lernende unklar ist,
- Niveau oder Thema fraglich sind,
- das Wort bereits (auch als ähnliche Form) im Bestand steht,
- das Modul eine Form nicht richtig erzeugen kann,
- der Wiktionary-Abgleich wegen Rate-Limiting oder Blockade nicht möglich war,
- der Nutzer ein Wort nennt, das es so im Spanischen nicht gibt oder das wahrscheinlich ein Tippfehler ist (nenne den vermuteten Vorschlag, trage ihn aber nicht ungefragt ein).

Sichere Wörter schließt du trotzdem vollständig ab. Unsichere bleiben aus den Dateien heraus, bis der Nutzer entschieden hat. Formuliere die Rückfrage konkret (Wort, Zweifel, was du vermutest, Optionen), damit der Nutzer kurz antworten kann.

## Abschlussbericht an den Nutzer

Antworte auf Deutsch, knapp und prüfbar:

1. **Hinzugefügt**: Tabelle mit ID, Spanisch, Deutsch, Wortart, Niveau, Thema. Bei Verben die Notation (zum Beispiel *elegir (e → i, g → j)*).
2. **Notizen** (`note`), die du aufgenommen hast, kurz mit Begründung (regionale Hinweise, Querverweise, Wortbildung u. Ä.), damit der Nutzer sie gegenlesen kann.
3. **Nicht eingetragen / Rückfragen**: jedes unsichere oder doppelte Wort mit Begründung.
4. **Prüfstatus**: Ergebnis von `validate:vocab`, Lint, Format, Tests, Build. Welche Formen gegen Wiktionary geprüft wurden und welche nicht (Rate-Limit, Seite fehlt). Sag das ehrlich, auch wenn alles gut aussieht.
5. Ob und was committet wurde.
