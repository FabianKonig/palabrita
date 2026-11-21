# Palabrita: Drehbuch Erklärvideo

Stand: 2026-11-21. Gehört zur Aufgabe „Erklärvideo der App“ in `docs/TASKS.md`. Ist das Video fertig und eingebunden, kommen die Festlegungen in `docs/SPEC.md`. Diese Datei ist die einzige Quelle für das Video: Entscheidungen, Text, Ablauf, Gestaltung und technische Hinweise.

## Übergabe an einen neuen Agenten (Kurzfassung)

**Wo wir stehen.** Eine erste Version des Videos wurde schon erzeugt und vom Nutzer verworfen (Stimmen und Musik, siehe „Erkenntnisse“). Für die zweite Version sind Text, Länge, Ablauf, Einblendungen, Musik und Stimme festgelegt. **Die erste vollständige Fassung der zweiten Version wurde am 2026-11-21 erzeugt** (67,2 s, 1080 × 1920, rund 7 MB) und dem Nutzer als Datei in den Chat geschickt. Sie liegt nicht im Repo; der Nutzer hat sie bei der Übergabe noch nicht gesehen. Annahmen und Rezept: Abschnitt „Erzeugte Fassung (2026-11-21)“.

**Entschieden (alles vom Nutzer, 2026-11-20):**

- Länge höchstens 70 s, Ziel 67 s, Hochformat 9:16 (1080 × 1920). Ablauf und Zeiten: Abschnitt „Ablauf“.
- Sprechertext steht fest (Abschnitt „Sprechertext am Stück“), frech und munter im Werbe-Ton.
- **Eine einzige Stimme** spricht alles, auch die spanischen Wörter. Favorit: **Stimme „2a“** aus Qwen3-TTS (VoiceDesign), die für das ganze Video **geklont** wird. Notfalls zwei Stimmen (Deutsch, Spanisch), siehe „Entscheidungen“, Punkt 2.
- Musik: **„Vibrant Momentum“ von LolaMoore** (Freesound, CC BY 4.0, Namensnennung nötig).
- **Vier Einblendungen** mit freigegebener Gestaltung (Abschnitt „Einblendungen: Gestaltung“).
- Python ist für die Videoerzeugung erlaubt (Ausnahme in `AGENTS.md`).
- **Stimme 2a ist geklont und vom Nutzer freigegeben** (Hörprobe 2026-11-20): Klonmodus **„nur Stimmcharakter“** (`x_vector_only_mode=True`), weil die spanischen Wörter dort besser klingen; Tempo **1,25-fach** (ffmpeg `atempo=1.25`) passt. Die spanischen Wörter stören nicht, die Ausweichlösung mit zwei Stimmen ist damit nicht nötig.
- **Lernen-Seite:** Der Nutzer plant vorerst keine weiteren Änderungen an der Oberfläche (2026-11-21). Die Aufnahme beruht auf dem Stand `main` bei `f3c34e5` (Abschnitt „Lernen-Seite: Stand für die Aufnahme“). Ändert sich die App sichtbar (Lernen-Seite, Lernsitzung, Verzeichnis, Statistik, „Mehr“), ist die Aufnahme neu zu erzeugen.

**Als Nächstes zu tun (in dieser Reihenfolge):**

1. **Der Nutzer sieht die Fassung an und sagt, was zu ändern ist** (Bild, Ton, Tempo, Einblendungen, Musiklautstärke, Länge). Keine Änderungen ohne seine Rückmeldung.
2. Änderungen umsetzen. Dafür die Schritte aus „Erzeugte Fassung (2026-11-21)“ wiederholen; die Skripte dazu liegen im Repo in **`scripts/video/`** (Aufrufreihenfolge und Voraussetzungen: `scripts/video/README.md`). Ein Probelauf aus dem Repo-Ordner hat am 2026-11-21 ein gleichwertiges Video ergeben (Bildähnlichkeit zur ersten Fassung über 0,97; die Stimme klingt bei jeder Erzeugung leicht anders).
3. Das Video dem Nutzer wieder als Datei schicken.
4. Erst nach seiner ausdrücklichen Bestätigung etwas einchecken (Videodatei und Einbindung in die App: `docs/TASKS.md`).

**Regeln, die immer gelten:**

- **Nichts von dem, was bei der Erzeugung anfällt, wird ohne Rücksprache gepusht** (die Skripte in `scripts/video/` sind Text und eingecheckt, das Erzeugte nicht): keine Videodatei, keine Audiodateien (Stimmproben, Musik), keine Modelle, keine Python-Umgebung, keine Zwischenstände. Grund: Große Dateien bleiben für immer in der Git-Historie. Details und `.gitignore`: `docs/TASKS.md`. Hörproben und Videos werden dem Nutzer direkt als Datei gezeigt.
- Offene Entscheidungen oder Unklarheiten: mit dem Nutzer klären, nicht raten.
- Der **Referenzclip der Stimme 2a** liegt nicht im Repo und lässt sich nicht neu erzeugen (VoiceDesign würfelt bei jedem Aufruf eine neue Stimme). Hat der neue Agent ihn nicht, den Nutzer um die Datei `stimme_2a_Szene1.wav` bitten (24 kHz, mono, rund 7 s). Gibt es sie nicht mehr, neue Kandidaten erzeugen und den Nutzer wählen lassen (technische Hinweise unten).

## Erkenntnisse aus der ersten Version

Die erste Version wurde nach einer früheren Fassung dieses Drehbuchs automatisch erzeugt (Aufnahme, Sprecher, Musik, Schnitt). Der Nutzer ist mit mehreren Entscheidungen im Nachhinein nicht zufrieden (2026-11-20):

- **Deutsche Stimme (Piper „Thorsten“): verworfen.** Extrem langweilig, zäh und mühsam anzuhören, einschläfernd und zu langsam. Nicht jugendlich, nicht peppig, keine Werbung, die Spaß macht. „Thorsten“ wird nicht mehr verwendet, auch nicht als Rückfall.
- **Spanische Stimme (männlich, mexikanisch gedacht): verworfen.** Klang überhaupt nicht gut.
- **Möglicher Einfluss des Erzeugungswegs:** Die erste Version entstand ohne Python, mit Node. Ob die schlechte Qualität an den Stimmen, an Piper oder an diesem Weg lag, ist ungeklärt.
- **Musik (per Skript erzeugte Marimba-Melodie): verworfen.** Zu langweilig. Das Video soll wie ein **modernes Erklär- und Werbevideo** wirken, Musik eingeschlossen.
- **Ton und Tempo:** Der ruhige, trockene Ton der ersten Version war zu zurückhaltend. Gewünscht ist munteres, jugendliches Sprechen mit Schwung.

## Entscheidungen für die zweite Version (2026-11-20, mit dem Nutzer)

1. **Sprecher:** junge Männerstimme, energiegeladen, sympathisch, zügiges Tempo (rund 3 Wörter je Sekunde). **Eine einzige Stimme spricht den gesamten Text**, auch die spanischen Wörter (der Nutzer findet das leichter verständlich). Favorit nach der Hörprobe: **Stimme „2a“** (Qwen3-TTS VoiceDesign, siehe „Technische Hinweise“); sie wird für alle Szenen geklont, damit sie durchgehend gleich klingt.
2. **Spanische Wörter und Sätze:** kein zweiter Sprecher, kein Stimmwechsel. Die Stimme muss Deutsch und Spanisch können und die spanischen Stellen (*Una cerveza, por favor*, *camión*, *fue*, *ser*, *ir*, *podemos*, *poder*, *¡Vámonos!*) richtig, möglichst mexikanisch aussprechen, auch mitten im deutschen Satz. **Ausweichlösung (Nutzer):** Klappt das nicht überzeugend oder gibt es zu wenige Kandidaten, ist der Nutzer bereit, auf **zwei Stimmen** auszuweichen, eine für Deutsch, eine für Spanisch (Spanisch: Geschlecht und Dialekt offen, Mexiko bevorzugt, Klangfarbe und Energie passend zum deutschen Sprecher). Die Ein-Stimmen-Lösung bleibt die erste Wahl; auch bei zwei Stimmen wählt der Nutzer nach Hörprobe.
3. **Lokal oder Cloud, Konten:** Der Nutzer wollte erst Hörproben, dann entscheiden. Bisher wurde nur lokal erzeugt (Qwen3-TTS läuft lokal auf der CPU, ohne Konto) und das Ergebnis gefällt. Randbedingung bleibt: **möglichst nichts, was ein Konto braucht**, keine Zahlungsdaten. Braucht ein Kandidat doch ein Konto oder einen Schlüssel, vorher mit dem Nutzer klären (Schlüssel nie im Chat, nur über die gesicherte Abfrage der Umgebung). Lizenz bzw. Nutzungsbedingungen müssen die Veröffentlichung des Videos erlauben; inoffizielle Zugänge zu Diensten scheiden aus.
4. **Erzeugungsweg:** **Python ist für die Videoerzeugung erlaubt** (Ausnahme zu `AGENTS.md`, dort vermerkt), aber nur dafür: nicht in `src/`, `public/`, Build oder CI. Python-Umgebung (`.venv/` oder `.video-work/`, beide in `.gitignore`) und Modelle werden nicht eingecheckt. Aufnahme (Playwright) und Orchestrierung bleiben, wo sinnvoll, in TypeScript.
5. **Musik:** lizenzfreie Fertigmusik, modern und energiegeladen, mit Aufbau. Gewählt: „Vibrant Momentum“ (Details unten). Die Lizenz wird vor der Verwendung auf der Originalseite geprüft; die Namensnennung kommt auf die Video-Seite in der App. Titel, Quelle und Lizenz werden in einer Hinweisdatei festgehalten (wie `public/vocab/NOTICE.md` für die Vokabeln; Ort bei der Einbindung festlegen).
6. **Sprechertext:** neu geschrieben, im munteren Werbe-Ton, vom Nutzer freigegeben (Abschnitt „Sprechertext am Stück“). Änderungen nur nach Rücksprache.
7. **Länge:** Der Nutzer erlaubt bis zu **70 s** (vorher 60 s). Ziel 67 s (Szene 2 ist mit dem neuen Auswahlfenster zwei Sekunden länger geworden); der Agent darf innerhalb von 70 s entscheiden, wenn der Schnitt es verlangt.
8. **Einblendungen:** vier Stück, Gestaltung freigegeben (Abschnitt „Einblendungen: Gestaltung“).
9. **Git:** Nichts aus der Erzeugung ohne Rücksprache einchecken oder pushen (siehe oben).

## Eckdaten

| Punkt | Festlegung |
|---|---|
| Länge | **höchstens 70 s, Ziel 67 s** (Nutzer, 2026-11-20; vorher 60 s). Szene 7 ist kürzbar (spart rund 4 s). |
| Sprache | Deutsch, Sprecher duzt (wie die App) |
| Ton | **frech, munter, jugendlich**, Klang eines modernen Erklär- und Werbevideos mit Schwung und Spaß beim Zuhören. Kurze Sätze und ein bisschen Witz. |
| Bild | echte Aufnahme der App, automatisch durchgeklickt. **Hochformat 9:16** (1080 × 1920), damit man es auf dem Handy ansehen kann, ohne den Bildschirm zu drehen. |
| Sprecher | **Eine junge, energiegeladene Männerstimme für den ganzen Text**, auch für die spanischen Wörter. Stimme „2a“ (Qwen3-TTS), geklont im Modus „nur Stimmcharakter“, Tempo 1,25-fach; vom Nutzer freigegeben (2026-11-20). Ausweichlösung zwei Stimmen (nicht nötig): „Entscheidungen“, Punkt 2. Verworfen: Piper „Thorsten“ und die spanische Stimme der ersten Version. |
| Musik | **„Vibrant Momentum“ von LolaMoore** (Freesound, CC BY 4.0, rund 2 min), modern und energiegeladen. Durchgehend, unter dem Sprecher leiser (Ducking), in den Sprechpausen etwas lauter, am Ende ausgeblendet oder mit Schlusspunkt. Verworfen: die per Skript erzeugte Marimba-Melodie. |
| Höhepunkt | **Formsuche** (gebeugte Formen finden, SPEC §3.3a): längste Szene, zwei Beispiele, als einzige Szene angekündigt. |
| Texteinblendungen | **Höchstens Stichworte, nur wo nötig**: vier Stück (Szene 2, Szene 6 zweimal, Szene 8). Die zweite in Szene 6 übersetzt die Pointe: „Ja, wir können das!“, erscheint genau beim gesprochenen „Podemos“. Spanische Stellen sonst nicht übersetzen (nicht „Una cerveza, por favor“, nicht „¡Vámonos!“). Keine Untertitel. Gestaltung: „Einblendungen: Gestaltung“. |
| Abspann | Wortmarke und Slogan, **keine Adresse**. |

## Lernen-Seite: Stand für die Aufnahme

Stand: `main` bei Commit `f3c34e5` (PR #29 bis #34, 2026-11-20). Die Produktspezifikation der Seite steht in `docs/SPEC.md` §14.4 (Kacheln und Auswahlfenster) und §3.3, die des Verzeichnisses in §14.5; hier steht nur, was die Aufnahme braucht. **Der Nutzer erwartet noch eine Änderung an Oberfläche und Aussehen der Lernen-Seite und sagt Bescheid.** Dann diesen Abschnitt, den Klickpfad der Szenen 1 und 2 und die Einblendung der Szene 2 prüfen und die Koordinaten neu messen (Playwright, Handy-Ansicht 412 × 915, `boundingBox()`). Mit der Aufnahme erst beginnen, wenn der Nutzer die Lernen-Seite für fertig erklärt.

**Aussehen im Standardzustand** (Überschrift „Lernen“, Logo oben rechts, darunter der Satz „Wähle aus, was du heute lernen möchtest.“ in Grau): Vier Kacheln in zwei Spalten und zwei Zeilen, jede mit farbigem Balken oben, Beschriftung in Versalien, Stiftsymbol und Wert: **Thema** (Türkis, „Alle Themen“), **Niveau** (Gelb, „Alle Niveaus“), **Wortart** (Magenta, „Alle Wortarten“), **Richtung** (Grau, „Beide Richtungen“, Untertext „mal so, mal so“). Darunter der Startblock: eine Zusammenfassung („Alle Themen · Alle Niveaus · Alle Wortarten · Beide Richtungen“, alle Teile in derselben grauen, nicht fetten Schrift; umbrochen wird nur zwischen den Kriterien, der Punkt „·“ bleibt am Zeilenende, hier also zwei Zeilen) und der große Button „Starten“. **Die untere Hälfte der Seite bis zur Tab-Leiste ist leer**; dort haben die Einblendungen Platz.

**Maße im Standardzustand** (CSS-Pixel bei 412 × 915, gemessen):

| Element | Bereich |
|---|---|
| Überschrift „Lernen“ | x 16–396, y 20–52 |
| Satz unter der Überschrift | x 16–396, y 72–94 |
| Kachel Thema | x 16–200, y 114–238 |
| Kachel Niveau | x 212–396, y 114–238 |
| Kachel Wortart | x 16–200, y 250–374 |
| Kachel Richtung | x 212–396, y 250–374 |
| Startblock (Zusammenfassung und Button) | y ca. 390–523 |
| Zusammenfassung (zwei Zeilen) | y 404–443 |
| Button „Starten“ | x 30–382, y 453–509 |
| leere Fläche | y ca. 535–840 |
| Tab-Leiste | y 847–915 |

**Auswahlfenster „Thema“** (nach Tipp auf die Kachel): Es **erscheint ohne Öffnungsanimation** (SPEC §14.4) und füllt x 0–412, y 201–915 (der Hintergrund dahinter wird abgedunkelt). Es enthält die Überschrift „Thema“ und 14 Optionen als Auswahlliste (Alle Themen, Grundwortschatz, Begrüßung & Höflichkeit, Zahlen & Zeit, Essen & Trinken, **Unterwegs & Transport**, Unterkunft, …). „Unterwegs & Transport“ liegt ohne Scrollen bei x 16–396, y 556–608. Die Auswahl schließt das Fenster sofort; die Kachel zeigt dann „Unterwegs & Transport“ (in zwei Zeilen), die Zusammenfassung lautet „Unterwegs & Transport · Alle Niveaus · Alle Wortarten · Beide Richtungen“ (nicht fett). Weil die Seite keine Übergänge hat, kann der Schnitt einen kurzen Übergang (Zoom oder Wisch) setzen, wenn es besser aussieht (Annahme).

**Verzeichnis (Szene 6):** Seit PR #33 sind die drei Filter keine Browser-Dropdowns mehr, sondern Knöpfe, die dasselbe Auswahlfenster öffnen (SPEC §14.5). Sie sehen aus wie die früheren Dropdowns; die Seite mit dem Suchtext „podemos“ ist pixelgleich zum früheren Stand (Bildvergleich 2026-11-20). In Szene 6 wird kein Filter benutzt, die Szene bleibt unverändert. Treffer-Karte „podemos → poder“ bei x 16–396, y 430–521.

## Ablauf

Die Lernen-Seite (Szene 1 und 2) kann sich noch einmal ändern (siehe „Lernen-Seite: Stand für die Aufnahme“). Zeiten sind Richtwerte; die genauen Schnitte ergeben sich aus der Länge der gesprochenen Sätze. Die Zeiten sind für 67 s ausgelegt (Szene 6 bekommt viel Raum, weil Bild und Sprechertext dort am dichtesten sind). Klicks sind sichtbar (Tipp-Punkt, der kurz aufleuchtet).

| # | Zeit | Bild (Klickpfad) | Einblendung | Sprechertext |
|---|---|---|---|---|
| 1 | 0:00–0:06 | Begrüßungskarte schwebt über der Lernseite: „¡Bienvenido a Palabrita“. Tipp, Karte dreht sich: „Willkommen zu Palabrita“. Tipp, Karte verschwindet. Musik setzt mit dem ersten Bild ein. | – | „Una cerveza, por favor“ – und dann? Peinliches Schweigen? Muss nicht sein. Das ist Palabrita! |
| 2 | 0:06–0:13 | Lernseite im Standardzustand (4 Kacheln, Startblock, untere Hälfte leer). Kachel „Thema“ antippen, das Auswahlfenster erscheint (ohne Animation), „Unterwegs & Transport“ antippen, das Fenster schließt, Kachel und Zusammenfassung zeigen das Thema, „Starten“ tippen. | „800+ Wörter. Mexiko & Guatemala“ (ca. 3 s, gleich zu Beginn der Szene, solange die ruhige Seite zu sehen ist; danach erst die Kachel antippen) | Über achthundert Wörter für Mexiko und Guatemala. Vom Markt bis zum Maya-Tempel! |
| 3 | 0:13–0:25 | Karte „Bus · Lastwagen“. „Umdrehen“: *el camión* / *los camiones*, Badge „maskulin“, Beispielsatz, Hinweis „In Mexiko bedeutet „camión“ auch Stadtbus …“. Tipp auf 🔊, man hört *el camión* (vom Sprecher gesprochen). Kurzer Zoom auf den Hinweis. | – | Umdrehen, anhören, merken. Beispiel: „camión“. Lastwagen? Nein, in Mexiko heißt „camión“ nicht nur Lastwagen, sondern auch Bus. Palabrita sagt dir das, bevor du einsteigst. |
| 4 | 0:25–0:33 | Buttons „Nochmal“ (1 Min) und „Gewusst“ (10 Min) kurz hervorgehoben. Tipp auf „Gewusst“. Zwei weitere Karten im Zeitraffer (umdrehen, bewerten). | – | Gewusst oder nochmal? Ehrlich sein! Palabrita merkt sich, wann du ein Wort vergessen würdest, und fragt genau davor nochmal. |
| 5 | 0:33–0:38 | Karte „fliegen“, umdrehen: *volar* mit grauer Zeile *(ue)* (ein unregelmäßiges Verb aus dem Thema Transport; *poder* gehört zu „Smalltalk & Alltag“ und käme in dieser Sitzung nicht vor). Tipp auf „Konjugation“, die Formentabelle erscheint von unten, kurz scrollen. | – | Konjugation? Gibt’s gratis dazu. Auch für die fiesen, unregelmäßigen Verben. |
| 6 | 0:38–0:54 | **Höhepunkt.** Harter Schnitt zum Tab „Verzeichnis“ (in der Lernsitzung gibt es keine Tab-Leiste). Ins Suchfeld wird „fue“ getippt (Buchstabe für Buchstabe). Treffer: **fue** → ser, **fue** → ir, **fue** → irse, jeweils mit „3. Sg. Pretérito indefinido“; Zoom auf die Pfeilzeilen. Suchfeld leeren, „podemos“ tippen: **podemos** → poder, „1. Pl. Presente“. Zeile antippen: Detailseite von *poder*, die Zelle *podemos* ist in der Tabelle hervorgehoben, Zoom darauf. | „Findet auch gebeugte Formen“ mit dem Etikett „podemos → poder ✓“ darunter (ca. 3 s, wenn der Sprecher „gebeugte Formen“ sagt); beim gesprochenen „Podemos!“ am Ende „Ja, wir können das!“ (ca. 1,5 s, genau im Moment des Worts, darf die Treffer-Karte überdecken) | Jetzt wird’s gut! Irgendwo „fue“ aufgeschnappt? Tipp es ein. Ser? Ir? Beides kann passen und erscheint in der Suche! Palabrita findet auch gebeugte Formen von Verben und zeigt dir den zugehörigen Infinitiv. Und „podemos“ führt direkt zu poder. Können wir das? Podemos! |
| 7 | 0:54–0:58 | Tab „Statistik“: Balken neu, lernend, gefestigt je Richtung (vorbereiteter Lernstand, siehe Erzeugung). | – | Die Statistik zeigt, was schon sitzt. Perfektes Angeber-Material. [kürzbar] |
| 8 | 0:58–1:03 | Tab „Mehr“ mit Markenkopf, dann ein Handy-Symbol mit Flugmodus-Zeichen über der weiter laufenden App. | „Offline“, „Ohne Konto“, „Ohne Tracking“ (drei Chips nacheinander) | Läuft im Browser, auch offline. Kein Konto, kein Tracking. Nur du und die Wörter. |
| 9 | 1:03–1:07 | Große Wortmarke (Wimpel, „Palabrita“, Greca) auf ruhigem Hintergrund, darunter Slogan „Tu app de vocabulario de español“, keine Adresse. Musik klingt aus. | – | Palabrita. Probier’s aus. ¡Vámonos! |

## Sprechertext am Stück

**Vom Nutzer freigegeben (2026-11-20).** Der Text wurde in mehreren Runden mit dem Nutzer geschärft: Ton frech und munter, Szene 3 mit der Erklärung statt des Camión-Witzes (Variante B), in Szene 6 der Satz mit dem zugehörigen Infinitiv. Gestrichen wurden bewusst die Zusätze „Die Cerveza ist erst der Anfang“ (Szene 2), „Ja, genau für die“ (Szene 5) und „Spanisch macht keine Gefangenen“ (Szene 6). Etwa 148 Wörter, bei zügigem Tempo (rund 3 Wörter je Sekunde) rund 49 s reine Sprechzeit; der Rest sind Pausen, Musik und Schnitt. Wird es nach der Sprachausgabe zu lang, zuerst Szene 7 [kürzbar] streichen. Der Wortwitz in Szene 6 („podemos“ = „wir können“) braucht eine klar spanische Betonung von *podemos*. Szene 6 hat 42 Wörter und ist am dichtesten; läuft der Sprecher dem Bild voraus, bekommt die Szene mehr Zeit (Zeitbudget bis 70 s).

> „Una cerveza, por favor“ – und dann? Peinliches Schweigen? Muss nicht sein. Das ist Palabrita!
>
> Über achthundert Wörter für Mexiko und Guatemala. Vom Markt bis zum Maya-Tempel!
>
> Umdrehen, anhören, merken. Beispiel: „camión“. Lastwagen? Nein, in Mexiko heißt „camión“ nicht nur Lastwagen, sondern auch Bus. Palabrita sagt dir das, bevor du einsteigst.
>
> Gewusst oder nochmal? Ehrlich sein! Palabrita merkt sich, wann du ein Wort vergessen würdest, und fragt genau davor nochmal.
>
> Konjugation? Gibt’s gratis dazu. Auch für die fiesen, unregelmäßigen Verben.
>
> Jetzt wird’s gut! Irgendwo „fue“ aufgeschnappt? Tipp es ein. Ser? Ir? Beides kann passen und erscheint in der Suche! Palabrita findet auch gebeugte Formen von Verben und zeigt dir den zugehörigen Infinitiv. Und „podemos“ führt direkt zu poder. Können wir das? Podemos!
>
> Die Statistik zeigt, was schon sitzt. Perfektes Angeber-Material. [kürzbar]
>
> Läuft im Browser, auch offline. Kein Konto, kein Tracking. Nur du und die Wörter.
>
> Palabrita. Probier’s aus. ¡Vámonos!

Die spanischen Wörter (*Una cerveza, por favor*, *camión*, *fue*, *ser*, *ir*, *podemos*, *poder*, *¡Vámonos!*) sollen vom selben Sprecher spanisch ausgesprochen werden, nicht eingedeutscht. Die Formsuche-Szene (6) bleibt in jedem Fall vollständig, gekürzt wird nur an anderer Stelle.

## Einblendungen: Gestaltung

Vom Nutzer nach einem Screenshot-Entwurf freigegeben (2026-11-20: „gefällt mir sehr gut, kann so bleiben“), danach in drei Punkten korrigiert (der Nutzer zog Elemente der ersten Entwurfsfassung vor): in Szene 2 steht „800+ Wörter. Mexiko & Guatemala“ mit gelbem Rechteck, in Szene 6 gehört das Etikett „podemos → poder ✓“ unter „Findet auch gebeugte Formen“, und „Ja, wir können das!“ darf größer sein und den Bildschirm überdecken. Vorgabe des Nutzers: coole, moderne Einblendungen wie in aktueller Werbung, **mitreißend, aber nicht nach Clickbait**; höchstens ein minimaler Hauch davon. Der Entwurf zeigt vier Einblendungen auf echten App-Bildern (Handy-Ansicht 412 × 915 CSS-Pixel, Skalierung 2; für das Video mal 2,62, damit 1080 × 1920 entsteht). Das Entwurfsbild selbst ist eine Binärdatei und liegt nicht im Repo; die folgenden Angaben und das CSS reichen zum Nachbauen.

**Gestaltungsprinzipien**

- Schrift: **Inter Display**, Gewicht 900 (in der Erzeugungsumgebung installiert; sonst „Inter“, dann `system-ui`), enge Laufweite (-0.02 em), Zeilenhöhe 1.02.
- Farben aus dem Markenbild der App: Türkis `#0f766e`, Magenta `#be185d`, Gelb `#f5b800`, dazu ein warmes Hellgelb `#ffe27a` für Betonungen. Text weiß, Betonung gelb. Keine Großbuchstaben-Schlagzeilen, kein Rot, keine Pfeile, kein Dauerblinken.
- Leichte Schräglage (-1 bis -3°), große Rundungen, weiche Schatten. Das ist der „minimale Hauch Clickbait“.
- **Position:** Einblendungen liegen im unteren Drittel über der Tab-Leiste (etwa 120 bis 210 px Abstand von unten, Rand 18 px). Sie dürfen verdecken, was schon erklärt ist oder gerade nicht wichtig ist: bei „Ja, wir können das!“ die Treffer-Karte (der Bildschirm wurde vorher erklärt, die Einblendung erscheint nur im Moment des Worts „Podemos“). Dort, wo die App gezeigt werden soll, bleibt sie sichtbar: bei „Findet auch gebeugte Formen“ die Treffer-Karte, in Szene 8 die Menüeinträge.
- Animation (Annahme, vom Nutzer nicht festgelegt): kurzes Hereinspringen mit leichtem Überschwingen (rund 0,25 s), ausblenden in rund 0,2 s. Verweildauer: Szene 2 etwa 3 s (zu Beginn der Szene, bevor das Auswahlfenster geöffnet wird), Szene 6 „Findet auch gebeugte Formen“ etwa 3 s, „Ja, wir können das!“ etwa 1,5 s (der Nutzer hielt 2 s für „einen Tacken zu lang“; kürzer genügt, solange man den Text lesen kann), Szene 8 drei Chips nacheinander (je etwa 0,3 s versetzt) insgesamt rund 4 s.

**Die vier Einblendungen**

| # | Szene | Text | Aufbau |
|---|---|---|---|
| 1 | 2 | „800+ Wörter. Mexiko & Guatemala“ | große Zahl „800+“ (84 px bei der Aufnahme mit 412 × 732, im Entwurf bei 412 × 915 waren es 104 px) mit weiß-gelbem Verlauf und türkisem Versatzschatten, darunter „Wörter.“ (weiß) und „Mexiko & Guatemala“ auf einem gelben Rechteck (schwarzer Text, leicht gekippt); liegt in der leeren unteren Hälfte der Lernen-Seite (y ca. 535–840, Position 125 px von unten; sie ist etwa 240 px hoch und berührt dann den Startblock nicht, eine leichte Überlagerung wäre erlaubt); erscheint zu Beginn der Szene, bevor die Kachel „Thema“ angetippt wird, damit sie nicht mit dem Auswahlfenster kollidiert |
| 2 | 6 | „Findet auch gebeugte Formen“ + „podemos → poder ✓“ | türkiser Kasten mit weißem Innenrand, „gebeugte Formen“ in Hellgelb, leicht gekippt; darunter ein kleines weißes Etikett mit magentafarbener Schrift „podemos → poder ✓“ (zeigt das Ergebnis der Suche) |
| 3 | 6, bei „Podemos!“ | „„Ja, wir können das!““ | magentafarbener Kasten (Verlauf nach `#e11d74`), „können“ in Hellgelb, kleiner Funken (✨) an der Ecke, stärker gekippt (-3°); größer (68 px) und darf den Bildschirm überragen |
| 4 | 8 | „Offline“, „Ohne Konto“, „Ohne Tracking“ | drei weiße Chips untereinander mit türkisem Kreis-Symbol (✈, ✓, ✓), leicht versetzt und gekippt |

**CSS des Entwurfs** (Maße in CSS-Pixel bei 412 px Breite; `.ov` ist der absolut positionierte Einblendungs-Container im Bild, `.frame` das 412 × 915 große Bild):

```css
:root{--tq:#0f766e;--mg:#be185d;--yl:#f5b800}
.ov{position:absolute;left:18px;right:18px;color:#fff;font-weight:900;
    font-family:"Inter Display","Inter",system-ui,sans-serif;letter-spacing:-.02em;line-height:1.02}
/* 1: Zahl (Szene 2) */
.o1{bottom:70px;transform:rotate(-2deg)}
.o1 .big{font-size:84px;background:linear-gradient(95deg,#fff 10%,#ffe27a 90%);-webkit-background-clip:text;color:transparent;
         filter:drop-shadow(0 6px 0 rgba(15,118,110,.9)) drop-shadow(0 14px 22px rgba(0,0,0,.35));display:block}
.o1 .sm{font-size:32px;margin-top:2px;text-shadow:0 3px 16px rgba(0,0,0,.45);display:block}
.o1 .sm b{background:var(--yl);color:#12201e;padding:0 10px;border-radius:10px;display:inline-block;transform:rotate(1.5deg);margin-left:6px}
/* Verlauf unter der Einblendung, damit sie lesbar bleibt (Szene 2 und „Ja, wir können das!“) */
.dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,20,18,0) 40%,rgba(8,20,18,.55) 100%)}
/* 2: Kasten (Szene 6, Formen) */
.o2{bottom:150px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.pill{background:linear-gradient(100deg,var(--tq),#0b5f59);padding:16px 22px 18px;border-radius:22px;font-size:40px;
      box-shadow:0 12px 30px rgba(0,0,0,.35),0 0 0 3px rgba(255,255,255,.9) inset;transform:rotate(-1.5deg)}
.pill em{font-style:normal;color:#ffe27a}
.tag{font-size:20px;font-weight:800;background:#fff;color:var(--mg);padding:6px 12px;border-radius:999px;letter-spacing:0;
     box-shadow:0 6px 16px rgba(0,0,0,.25);transform:rotate(2deg);margin-left:14px}
/* 3: Aufschrei (Szene 6, Podemos) */
.o3{bottom:210px;text-align:center;transform:rotate(-3deg)}
.o3 .q{display:inline-block;font-size:68px;color:#fff;background:linear-gradient(100deg,var(--mg),#e11d74);padding:14px 26px 18px;
       border-radius:26px;box-shadow:0 14px 34px rgba(0,0,0,.4);line-height:1.04;position:relative}
.o3 .q i{font-style:normal;color:#ffe27a}
.o3 .spark{position:absolute;right:-12px;top:-26px;font-size:46px;transform:rotate(14deg)}
/* 4: Chips (Szene 8) */
.o4{bottom:118px;display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.chip{display:inline-flex;gap:10px;align-items:center;font-size:30px;background:rgba(255,255,255,.95);color:#12201e;
      padding:12px 20px;border-radius:999px;box-shadow:0 10px 26px rgba(0,0,0,.25);letter-spacing:-.01em;transform:rotate(-1deg)}
.chip .ic{width:34px;height:34px;border-radius:50%;background:var(--tq);color:#fff;display:grid;place-items:center;font-size:20px}
.chip:nth-child(2){transform:rotate(1deg);margin-left:20px}.chip:nth-child(3){margin-left:6px}
```

Die HTML-Struktur dazu: `.o1` enthält `<span class="big">800+</span><span class="sm">Wörter. <b>Mexiko &amp; Guatemala</b></span>`; `.o2` enthält `<div class="pill">Findet auch <em>gebeugte Formen</em></div><div class="tag">podemos → poder ✓</div>`; `.o3` enthält `<div class="q"><span class="spark">✨</span>„Ja, wir <i>können</i> das!“</div>`; `.o4` enthält drei `.chip` mit `<span class="ic">…</span>Text`. Szene 2 und „Ja, wir können das!“ haben zusätzlich den Verlauf `.dim` unter der Einblendung, „Findet auch gebeugte Formen“ bewusst nicht, damit die Treffer-Karte hell bleibt.

## Automatische Erzeugung

- **Aufnahme:** Playwright mit der vorinstallierten Chromium-Version gegen `npm run preview` (nach `npm run build`; `dist/` ist ignoriert), Handy-Ansicht **412 × 732 CSS-Pixel mit Skalierung 1080 / 412 (rund 2,62)**, das ergibt genau 9:16 bzw. 1080 × 1919 und wird auf 1080 × 1920 aufgefüllt. (Die frühere Angabe „412 × 915“ war nicht 9:16; 915 px Höhe gelten nur für die Entwurfsbilder der Einblendungen.) Tipp-Punkte, Hervorhebungen und Einblendungen werden als Ebene über die App gelegt, nicht in der App. Die Begrüßung (Szene 1) erscheint nur, wenn `localStorage` den Schlüssel `palabrita.welcomeSeen` nicht auf `"1"` hat (`src/data/welcomeFlag.ts`); für alle anderen Szenen den Schlüssel vorher setzen. Routen (HashRouter): `#/` (Lernen), `#/dictionary` (Verzeichnis), `#/dictionary/:id`, `#/stats`, `#/more`.
- **Vorbereiteter Lernstand:** Damit in Szene 3 bis 5 nacheinander *el camión*, *el taxi*, *el avión* und *volar* erscheinen und die Statistik (Szene 7) nicht leer ist, wird IndexedDB vor der Aufnahme befüllt (Details: „Erzeugte Fassung“). Die App selbst wird nicht geändert.
- **Aussprache in Szene 3:** Die Browser-Sprachausgabe klingt in einer automatisierten Aufnahme nicht mit. Das *el camión* spricht deshalb der Sprecher (dieselbe Stimme wie der übrige Text, bei der Ausweichlösung mit zwei Stimmen die spanische) und wird an der Stelle des Tipps eingemischt.
- **Sprecher:** Qwen3-TTS, geklonte Stimme 2a, siehe „Technische Hinweise zur Stimme“.
- **Musik:** „Vibrant Momentum“, siehe „Technische Hinweise zur Musik“. Das Stück ist länger als das Video (rund 2 min): ab dem Anfang schneiden, am Ende ausblenden (Fade), mit Ducking unter dem Sprecher.
- **Zeitpunkt der Einblendung „Ja, wir können das!“:** Aus der fertigen Sprecher-Aufnahme Wortzeiten lesen (z. B. Whisper mit `return_timestamps="word"`, Modell `openai/whisper-small`) und die Einblendung bei „Podemos“ starten. Für die anderen Einblendungen genügen die Szenengrenzen.
- **Schnitt:** `ffmpeg` (in der Cloud-Umgebung vorhanden) setzt Aufnahme, Sprecher, Musik (mit Ducking) und die vier Einblendungen zusammen. Ausgabe MP4 (H.264/AAC), 1080 × 1920, Ziel unter 40 MB.
- **Ablage:** Das fertige Video wird nicht eingecheckt, sondern nur außerhalb des Repos abgelegt und dem Nutzer zur Ansicht gegeben (Regel in `docs/TASKS.md`).

## Erzeugte Fassung (2026-11-21)

**Ergebnis:** `palabrita_erklaervideo_v2.mp4`, 67,2 s, 1080 × 1920, H.264/AAC, rund 7 MB, Lautheit -16 LUFS, Spitze -1,9 dB. Dem Nutzer als Datei geschickt, nicht im Repo. Der Ton wurde nur gemessen, nicht gehört (Agent ohne Gehör); die Bilder wurden an Einzelbildern geprüft.

**Zeitplan** (aus den echten Längen der Sprecherclips): Jede Szene beginnt mit 0,4 s Vorlauf, danach spricht der Sprecher. Szenenstart in s: 0, 6,0, 13,4, 25,1, 32,7, 38,1, 54,1, 58,1, 63,4; Ende 67,2. Die Sprecherclips sind (nach Tempo 1,25) 5,0 / 4,2 / 10,8 / 6,9 / 4,4 / 15,0 / 3,4 / 4,4 / 2,6 s lang.

**Annahmen, die der Agent getroffen hat** (der Nutzer hat sie noch nicht bestätigt):

- **Aufnahmeformat 412 × 732 statt 412 × 915**, damit das Video wirklich 9:16 ist und den Bildschirm füllt. Dadurch ist die leere Fläche unter dem Startblock der Lernen-Seite nur noch etwa y 535–664 hoch; die Einblendung „800+“ ist deshalb kleiner (84 px) und liegt 70 px über dem unteren Rand.
- **Szene 5 zeigt *volar* („fliegen“) statt *poder*.** *poder* liegt im Thema „Smalltalk & Alltag“, in der Sitzung „Unterwegs & Transport“ kommt es nicht vor. *volar* ist unregelmäßig (Stammwechsel o → ue) wie *poder*.
- **Statt Zoom Hervorhebungen:** Eine pulsierende magentafarbene Umrandung markiert den Hinweis auf der Karte (Szene 3), die Bewertungsknöpfe (Szene 4) und die Treffer „fue → ir“ und „fue → irse“ (Szene 6). In Szene 6 wird die Trefferliste nach unten gescrollt, damit mehrere Zeilen zu sehen sind.
- **Szene 6 beginnt mit hartem Schnitt** zum Verzeichnis, weil die Lernsitzung keine Tab-Leiste hat.
- **Szene 3: *el camión*** hört man, weil der Sprecher das Wort in „Beispiel: camión“ sagt; der Tipp auf das Lautsprecher-Symbol wird auf dieses Wort gelegt. Es gibt keinen eigenen Clip.
- **Handy-Symbol in Szene 8:** ein einfaches Symbol (Telefon mit durchgestrichenem Flugzeug), erscheint kurz am Szenenanfang über dem Markenkopf. Die drei Chips erscheinen nacheinander bei „offline“, „Kein Konto“ und „Tracking“.
- **Abspann:** Markenkopf der „Mehr“-Seite (Wimpel, Wortmarke, Greca, Slogan) auf ruhigem Hintergrund, Tab-Leiste, Menü und Widmung ausgeblendet, 1,3-fach vergrößert; keine Adresse.
- **Musik:** ab dem Anfang des Stücks, 0,6 s Einblendung, 3,2 s Ausblendung, Lautstärke 0,42, abgesenkt unter dem Sprecher (`sidechaincompress`, Schwelle 0,012, Verhältnis 14, 12 ms/500 ms). Mischverhältnis Musik : Sprecher = 0,9 : 1,45. Falls die Musik zu leise oder zu laut ist, diese Werte ändern.

**Rezept zum Nachbauen.** Die Skripte zu jedem Schritt liegen in `scripts/video/` (README dort; Nutzer-Entscheidung 2026-11-21: Python, Shell und CommonJS sind für das Video erlaubt, sonst nirgends). Erzeugtes, Python-Umgebung und Modelle werden nicht eingecheckt:

1. **Stimme:** Alle neun Szenen mit Qwen3-TTS Base im Modus „nur Stimmcharakter“ erzeugen (Referenzclip `stimme_2a_Szene1.wav` mit dem Referenztext von Szene 1). Danach je Clip: Stille am Rand abschneiden (`silenceremove`), `atempo=1.25`, `loudnorm=I=-18:TP=-2`.
2. **Wortzeiten:** Whisper `openai/whisper-small` mit `return_timestamps="word"` auf jedem Clip. Daraus die Ankerzeiten für Tipps und Einblendungen (z. B. „Kamion“ in Szene 3, „Tipp“, „gebeugte“, „Podemos“ in Szene 6; Whisper schreibt spanische Wörter deutsch, deshalb nach Anfangsbuchstaben suchen). Die Szenenlängen ergeben sich aus den Clip-Längen.
3. **Lernstand und Kartenfolge:** `orderSeed = 125947` bewirkt im Thema „Unterwegs & Transport“ (alle Niveaus, beide Richtungen) die Folge *el camión*, *el taxi*, *el avión*, *volar* (die Folge ergibt sich aus der Hash-Position in `position()` in `src/domain/queue.ts`; gefunden durch Durchprobieren von Seeds). `startedAt` = jetzt, damit keine „Neuzugänge“ vorgezogen werden, `maxLevel` B1, `theme` light. Für die Statistik rund 120 weitere Karten aus anderen Themen (A1-Vokabeln aus Grundwortschatz, Begrüßung, Zahlen & Zeit, Essen, Smalltalk, Orte): 80 gefestigt und 40 lernend in Richtung DE → ES, 55 gefestigt und 35 lernend in Richtung ES → DE, alle in der Zukunft fällig, alle früher als heute eingeführt. Das Statistikbild zeigt dann etwa 682 neu, 43 lernend, 80 gefestigt (DE → ES). Die Datenbank `palabrita` (Version 1, Speicher `settings` und `cards`) wird per `indexedDB` direkt befüllt, dann die Seite neu laden. `localStorage` `palabrita.welcomeSeen` bleibt ungesetzt, damit die Begrüßungskarte (Szene 1) erscheint.
4. **Sprachausgabe-Attrappe** (Init-Skript): `speechSynthesis.getVoices` liefert eine Stimme `es-MX`, `speak`/`cancel` tun nichts, `SpeechSynthesisUtterance` ist ein einfacher Ersatz. Sonst zeigt die Karte „Keine spanische Stimme gefunden“ und der Lautsprecher ist deaktiviert.
5. **Aufnahme:** Chromium (Playwright) mit Viewport 412 × 732 und `deviceScaleFactor` 1080/412. Bildaufnahme per CDP-Screencast (`Page.startScreencast`, JPEG Qualität 92, `maxWidth` 1080, `maxHeight` 1920, `everyNthFrame` 2); jedes Bild wird mit dem Zeitstempel der Aufnahme gespeichert. Ein Zeitplan führt alle Aktionen (Tippen, Scrollen, Einblenden) zu festen Zeiten seit dem Seitenstart aus. Ein Tipp = Tipp-Punkt (CSS-Ebene, 0,6 s) und 140 ms später der echte Klick. Die Ebene (`#fx`) enthält Tipp-Punkte, Hervorhebungen und die Einblendungen (CSS aus „Einblendungen: Gestaltung“).
6. **Bild:** Die Bilder mit ihren Zeitstempeln per ffmpeg-`concat` zu einem Video mit 30 Bildern pro Sekunde zusammensetzen (`scale` auf 1080 × 1920, Hintergrund `#f3f6f5`, `libx264` CRF 19).
7. **Ton:** Sprecherclips mit `adelay` an den Szenenstart (+ 0,4 s) legen, Musik zuschneiden und absenken, mischen, `loudnorm=I=-16:TP=-1.5`, AAC 192 kbit/s. Mit dem Bild zu MP4 vereinen (`+faststart`).

## Technische Hinweise zur Stimme (Qwen3-TTS)

Ergebnis der Recherche und Hörproben vom 2026-11-20 (Cloud-Umgebung: 4 CPUs, 15 GB RAM, keine GPU; PyPI, Hugging Face und `download.pytorch.org` sind erreichbar, es musste kein Host freigeschaltet werden).

- **Modelle:** `Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign` (Stimme per Textbeschreibung) und `Qwen/Qwen3-TTS-12Hz-1.7B-Base` (Stimme aus einem Referenzclip klonen). Lizenz **Apache-2.0**, Deutsch und Spanisch unter den 10 Sprachen.
- **Installation (in einer Umgebung außerhalb von Git):** `python3 -m venv .venv`, dann `.venv/bin/pip install --extra-index-url https://download.pytorch.org/whl/cpu torch torchaudio qwen-tts soundfile`. Beim Start erscheinen harmlose Warnungen („flash-attn is not installed“, „sox not found“).
- **Laden und Erzeugen auf der CPU:** `Qwen3TTSModel.from_pretrained(name, device_map="cpu", dtype=torch.float32)`, `torch.set_num_threads(4)`. Rechenzeit rund 4 bis 7 Sekunden je Sekunde Sprache. API: `generate_voice_design(text, instruct, language="German")`; zum Klonen `create_voice_clone_prompt(ref_audio=..., ref_text=..., x_vector_only_mode=False)` und `generate_voice_clone(text, language="German", voice_clone_prompt=prompt)`. `x_vector_only_mode=True` übernimmt nur den Stimmcharakter (ohne Referenztext) und ist die Rückfalloption, falls der volle Modus (ICL) schlecht klingt.
- **VoiceDesign würfelt bei jedem Aufruf eine neue Stimme**, auch bei gleicher Beschreibung. Deshalb wird eine gewählte Stimme geklont (oder der Zufall mit einem festen Seed fixiert).
- **Klon-Ergebnis (2026-11-20):** Beide Klonmodi erzeugten alle Szenen. Im Modus „volle Referenz“ (ICL, `x_vector_only_mode=False`) lagen die neun Szenen bei 68,6 s Sprache (rund 2,2 Wörter je Sekunde) und die spanischen Stellen waren schlechter. Der Modus „nur Stimmcharakter“ (`x_vector_only_mode=True`) klang laut Nutzer bei den spanischen Wörtern besser und wurde gewählt. Beschleunigt wird mit ffmpeg `atempo=1.25` (Tonhöhe bleibt); damit sind die neun Szenen rund 55 s lang. Der Nutzer fand Stimme und Tempo passend. Eine Klonung aller neun Szenen dauerte auf der CPU rund 5 Minuten (jede Szene rund 4,5 s Rechenzeit je Sekunde Sprache).
- **Stimme 2a:** entstand mit der englischen Beschreibung („A young adult man in his mid twenties with a clear, slightly deeper voice. Very upbeat, fast-paced and playful, like a charismatic host of a modern app commercial or a popular YouTube explainer. Smiling, cheeky and energetic, never sleepy or monotone. Natural Mexican Spanish pronunciation for the Spanish words.“) und dem Text von Szene 1 als Referenz: „„Una cerveza, por favor“ – und dann? Peinliches Schweigen? Muss nicht sein. Das ist Palabrita!“ Der Nutzer hörte darin „Una cerveza, por favor“ „ganz gut“. Eine automatische Rückübersetzung (Whisper) verstand den Satzanfang schlechter; das Gehör des Nutzers zählt.
- **Referenzclip nicht im Repo.** Der Clip `stimme_2a_Szene1.wav` liegt nur in der Sitzung bzw. beim Nutzer (siehe „Übergabe“).
- **Prüfhilfen, kein Ersatz fürs Anhören:** Grundtonhöhe (`librosa.pyin`) und Rückübersetzung mit Whisper (`openai/whisper-small`, Sprache „de“), um grobe Fehler zu finden (ausgelassene oder deutsch ausgesprochene spanische Wörter).
- **Geprüft und verworfen:**
  - **Kokoro-82M:** Die Modellkarte nennt nur Englisch, kein Deutsch (Blogvergleiche behaupten teils das Gegenteil).
  - **Chatterbox Multilingual V3** (MIT, 23 Sprachen): läuft nur mit der GitHub-Version des Pakets (`t3_model="v3"`), auf der CPU nur mit Patch von `torch.load` (`map_location`) und `setuptools<81` (für das Wasserzeichen-Modul). Die Standardstimme klang höher, ließ „Una cerveza, por favor“ aus und sprach die spanischen Wörter deutsch aus („Poda“, „warmonos“). Das eingebaute Wasserzeichen nicht entfernen.
  - **NVIDIA Magpie TTS Multilingual:** Lizenz „other“ (NVIDIA Open Model License), nicht weiter geprüft.
  - **Coqui XTTS-v2:** nicht kommerzielle Lizenz (CPML), ungeeignet.
  - **Piper:** in der ersten Version verworfen (Thorsten).

## Technische Hinweise zur Musik

- **Gewählt: „Vibrant Momentum“** (LolaMoore, Freesound-Sound 762602, rund 120 s). Seite: `https://freesound.org/people/LolaMoore/sounds/762602`, Vorschau-MP3: `https://cdn.freesound.org/previews/762/762602_16085454-hq.mp3` (rund 190 kbps, Lautheit rund -15,7 LUFS). Lizenz laut Openverse: **CC BY 4.0**, also Namensnennung nötig, kommerzielle Nutzung erlaubt. Die Lizenz vor der Verwendung auf der Freesound-Seite prüfen. Der Original-Download bei Freesound braucht ein Konto: ohne Rücksprache mit dem Nutzer keines anlegen, die Vorschau-MP3 reicht für Hörproben.
- **Namensnennung (Vorschlag):** „Musik: „Vibrant Momentum“ von LolaMoore (Freesound), CC BY 4.0“ auf der Video-Seite in der App und in der Hinweisdatei.
- **Weitere gehörte Titel (nicht gewählt):** „Arcade Aroma“ (Touda, Sound 614130, CC0), „Path To Victory“ (UNIVERSFIELD, 704530, CC BY 4.0), „Stagepop“ (kjartan_abel, 610677, CC BY 4.0).
- **Suche:** Die Openverse-API (`https://api.openverse.org/v1/audio/?q=…&license=cc0,by`) ist erreichbar und liefert Lizenz, Dauer, Tags und Download-URL. Nicht erreichbar oder blockiert in dieser Umgebung: Pixabay, Chosic, Musopen (403), Uppbeat und Wikimedia-Upload (429).

## Offen

- Rückmeldung des Nutzers zur ersten Fassung (Bild, Ton, Tempo, Einblendungen, Musik).
- Ort der Hinweisdatei für Musik und Namensnennung (bei der Einbindung des Videos in die App).
- Video-Einbindung in die App (neue Seite im Tab „Mehr“): Anforderungen in `docs/TASKS.md`.
