# Palabrita: Drehbuch Erklärvideo

Stand: 2026-11-20. Gehört zur Aufgabe „Erklärvideo der App“ in `docs/TASKS.md`. Ist das Video fertig und eingebunden, kommen die Festlegungen in `docs/SPEC.md`. Diese Datei ist die einzige Quelle für das Video: Entscheidungen, Text, Ablauf, Gestaltung und technische Hinweise.

## Übergabe an einen neuen Agenten (Kurzfassung)

**Wo wir stehen.** Eine erste Version des Videos wurde schon erzeugt und vom Nutzer verworfen (Stimmen und Musik, siehe „Erkenntnisse“). Für die zweite Version sind Text, Länge, Ablauf, Einblendungen, Musikfavorit und Stimmfavorit festgelegt. **Das Video selbst ist noch nicht neu erzeugt.**

**Entschieden (alles vom Nutzer, 2026-11-20):**

- Länge höchstens 70 s, Ziel 67 s, Hochformat 9:16 (1080 × 1920). Ablauf und Zeiten: Abschnitt „Ablauf“.
- Sprechertext steht fest (Abschnitt „Sprechertext am Stück“), frech und munter im Werbe-Ton.
- **Eine einzige Stimme** spricht alles, auch die spanischen Wörter. Favorit: **Stimme „2a“** aus Qwen3-TTS (VoiceDesign), die für das ganze Video **geklont** wird. Notfalls zwei Stimmen (Deutsch, Spanisch), siehe „Entscheidungen“, Punkt 2.
- Musik: **„Vibrant Momentum“ von LolaMoore** (Freesound, CC BY 4.0, Namensnennung nötig).
- **Vier Einblendungen** mit freigegebener Gestaltung (Abschnitt „Einblendungen: Gestaltung“).
- Python ist für die Videoerzeugung erlaubt (Ausnahme in `AGENTS.md`).
- **Stimme 2a ist geklont und vom Nutzer freigegeben** (Hörprobe 2026-11-20): Klonmodus **„nur Stimmcharakter“** (`x_vector_only_mode=True`), weil die spanischen Wörter dort besser klingen; Tempo **1,25-fach** (ffmpeg `atempo=1.25`) passt. Die spanischen Wörter stören nicht, die Ausweichlösung mit zwei Stimmen ist damit nicht nötig.
- **Wartestand:** Die Lernen-Seite ist auf Kacheln und Auswahlfenster umgebaut (Stand siehe Abschnitt „Lernen-Seite: Stand für die Aufnahme“). Der Nutzer ändert Oberfläche und Aussehen **noch einmal** und sagt Bescheid. Mit der Aufnahme erst nach seiner Bestätigung beginnen.

**Als Nächstes zu tun (in dieser Reihenfolge):**

1. **Warten, bis der Nutzer die Lernen-Seite für fertig erklärt.** Bei der nächsten Änderung `main` mergen, den Abschnitt „Lernen-Seite: Stand für die Aufnahme“ und die Klickpfade der Szenen 1 und 2 prüfen und anpassen. Die Szenen 3 bis 9 sind von der Umgestaltung nicht betroffen (geprüft am 2026-11-20: Lernsitzung, Konjugation, Verzeichnis und „Mehr“ unverändert).
2. Alle neun Szenen mit der geklonten Stimme 2a im Modus „nur Stimmcharakter“ erzeugen (bisher nur Szene 1, 3 und 6 gehört und freigegeben), mit `atempo=1.25` beschleunigen. Sprechertext ändert sich nicht. Das lässt sich schon vor dem Merge machen, nur wenn der Nutzer es wünscht.
3. Danach das Video erzeugen (Aufnahme, Ton, Musik mit Ducking, Einblendungen, Abspann) und dem Nutzer zur Ansicht geben.
4. Erst nach seiner ausdrücklichen Bestätigung etwas einchecken.

**Regeln, die immer gelten:**

- **Nichts von dem, was bei der Erzeugung anfällt, wird ohne Rücksprache gepusht:** keine Videodatei, keine Audiodateien (Stimmproben, Musik), keine Modelle, keine Python-Umgebung, keine Zwischenstände. Grund: Große Dateien bleiben für immer in der Git-Historie. Details und `.gitignore`: `docs/TASKS.md`. Hörproben und Videos werden dem Nutzer direkt als Datei gezeigt.
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
| 3 | 0:13–0:22 | Karte „Bus · Lastwagen“. „Umdrehen“: *el camión* / *los camiones*, Badge „maskulin“, Beispielsatz, Hinweis „In Mexiko bedeutet „camión“ auch Stadtbus …“. Tipp auf 🔊, man hört *el camión* (vom Sprecher gesprochen). Kurzer Zoom auf den Hinweis. | – | Umdrehen, anhören, merken. Beispiel: „camión“. Lastwagen? Nein, in Mexiko heißt „camión“ nicht nur Lastwagen, sondern auch Bus. Palabrita sagt dir das, bevor du einsteigst. |
| 4 | 0:22–0:30 | Buttons „Nochmal“ (1 Min) und „Gewusst“ (10 Min) kurz hervorgehoben. Tipp auf „Gewusst“. Zwei weitere Karten im Zeitraffer (umdrehen, bewerten). | – | Gewusst oder nochmal? Ehrlich sein! Palabrita merkt sich, wann du ein Wort vergessen würdest, und fragt genau davor nochmal. |
| 5 | 0:30–0:35 | Karte „können · dürfen“, umdrehen: *poder* mit grauer Zeile *(ue)*. Tipp auf „Konjugation“, die Formentabelle fährt von unten herein, kurz scrollen. | – | Konjugation? Gibt’s gratis dazu. Auch für die fiesen, unregelmäßigen Verben. |
| 6 | 0:35–0:53 | **Höhepunkt.** Tab „Verzeichnis“. Ins Suchfeld wird „fue“ getippt (Buchstabe für Buchstabe). Treffer: **fue** → ser, **fue** → ir, **fue** → irse, jeweils mit „3. Sg. Pretérito indefinido“; Zoom auf die Pfeilzeilen. Suchfeld leeren, „podemos“ tippen: **podemos** → poder, „1. Pl. Presente“. Zeile antippen: Detailseite von *poder*, die Zelle *podemos* ist in der Tabelle hervorgehoben, Zoom darauf. | „Findet auch gebeugte Formen“ mit dem Etikett „podemos → poder ✓“ darunter (ca. 3 s, wenn der Sprecher „gebeugte Formen“ sagt); beim gesprochenen „Podemos!“ am Ende „Ja, wir können das!“ (ca. 1,5 s, genau im Moment des Worts, darf die Treffer-Karte überdecken) | Jetzt wird’s gut! Irgendwo „fue“ aufgeschnappt? Tipp es ein. Ser? Ir? Beides kann passen und erscheint in der Suche! Palabrita findet auch gebeugte Formen von Verben und zeigt dir den zugehörigen Infinitiv. Und „podemos“ führt direkt zu poder. Können wir das? Podemos! |
| 7 | 0:53–0:57 | Tab „Statistik“: Balken neu, lernend, gefestigt je Richtung (vorbereiteter Lernstand, siehe Erzeugung). | – | Die Statistik zeigt, was schon sitzt. Perfektes Angeber-Material. [kürzbar] |
| 8 | 0:57–1:03 | Tab „Mehr“ mit Markenkopf, dann ein Handy-Symbol mit Flugmodus-Zeichen über der weiter laufenden App. | „Offline“, „Ohne Konto“, „Ohne Tracking“ (drei Chips nacheinander) | Läuft im Browser, auch offline. Kein Konto, kein Tracking. Nur du und die Wörter. |
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
| 1 | 2 | „800+ Wörter. Mexiko & Guatemala“ | große Zahl „800+“ (104 px) mit weiß-gelbem Verlauf und türkisem Versatzschatten, darunter „Wörter.“ (weiß) und „Mexiko & Guatemala“ auf einem gelben Rechteck (schwarzer Text, leicht gekippt); liegt in der leeren unteren Hälfte der Lernen-Seite (y ca. 535–840, Position 125 px von unten; sie ist etwa 240 px hoch und berührt dann den Startblock nicht, eine leichte Überlagerung wäre erlaubt); erscheint zu Beginn der Szene, bevor die Kachel „Thema“ angetippt wird, damit sie nicht mit dem Auswahlfenster kollidiert |
| 2 | 6 | „Findet auch gebeugte Formen“ + „podemos → poder ✓“ | türkiser Kasten mit weißem Innenrand, „gebeugte Formen“ in Hellgelb, leicht gekippt; darunter ein kleines weißes Etikett mit magentafarbener Schrift „podemos → poder ✓“ (zeigt das Ergebnis der Suche) |
| 3 | 6, bei „Podemos!“ | „„Ja, wir können das!““ | magentafarbener Kasten (Verlauf nach `#e11d74`), „können“ in Hellgelb, kleiner Funken (✨) an der Ecke, stärker gekippt (-3°); größer (68 px) und darf den Bildschirm überragen |
| 4 | 8 | „Offline“, „Ohne Konto“, „Ohne Tracking“ | drei weiße Chips untereinander mit türkisem Kreis-Symbol (✈, ✓, ✓), leicht versetzt und gekippt |

**CSS des Entwurfs** (Maße in CSS-Pixel bei 412 px Breite; `.ov` ist der absolut positionierte Einblendungs-Container im Bild, `.frame` das 412 × 915 große Bild):

```css
:root{--tq:#0f766e;--mg:#be185d;--yl:#f5b800}
.ov{position:absolute;left:18px;right:18px;color:#fff;font-weight:900;
    font-family:"Inter Display","Inter",system-ui,sans-serif;letter-spacing:-.02em;line-height:1.02}
/* 1: Zahl (Szene 2) */
.o1{bottom:125px;transform:rotate(-2deg)}
.o1 .big{font-size:104px;background:linear-gradient(95deg,#fff 10%,#ffe27a 90%);-webkit-background-clip:text;color:transparent;
         filter:drop-shadow(0 6px 0 rgba(15,118,110,.9)) drop-shadow(0 14px 22px rgba(0,0,0,.35));display:block}
.o1 .sm{font-size:40px;margin-top:2px;text-shadow:0 3px 16px rgba(0,0,0,.45);display:block}
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

- **Aufnahme:** Playwright mit der vorinstallierten Chromium-Version gegen `npm run preview` (nach `npm run build`; `dist/` ist ignoriert), Handy-Ansicht (412 × 915 CSS-Pixel, Skalierung so, dass 1080 × 1920 entsteht), Videoaufnahme oder Einzelbilder je Szene. Tipp-Punkte und Zooms werden per eingeblendetem Overlay bzw. im Schnitt erzeugt, nicht in der App. Die Begrüßung (Szene 1) erscheint nur, wenn `localStorage` den Schlüssel `palabrita.welcomeSeen` nicht auf `"1"` hat (`src/data/welcomeFlag.ts`); für alle anderen Szenen den Schlüssel vorher setzen. Routen (HashRouter): `#/` (Lernen), `#/dictionary` (Verzeichnis), `#/dictionary/:id`, `#/stats`, `#/more`.
- **Vorbereiteter Lernstand:** Damit in Szene 3 bis 5 genau *el camión* und *poder* erscheinen und die Statistik (Szene 7) nicht leer ist, wird IndexedDB vor der Aufnahme mit einem passenden Zustand befüllt. Die App selbst wird dafür nicht geändert.
- **Aussprache in Szene 3:** Die Browser-Sprachausgabe klingt in einer automatisierten Aufnahme nicht mit. Das *el camión* spricht deshalb der Sprecher (dieselbe Stimme wie der übrige Text, bei der Ausweichlösung mit zwei Stimmen die spanische) und wird an der Stelle des Tipps eingemischt.
- **Sprecher:** Qwen3-TTS, geklonte Stimme 2a, siehe „Technische Hinweise zur Stimme“.
- **Musik:** „Vibrant Momentum“, siehe „Technische Hinweise zur Musik“. Das Stück ist länger als das Video (rund 2 min): ab dem Anfang schneiden, am Ende ausblenden (Fade), mit Ducking unter dem Sprecher.
- **Zeitpunkt der Einblendung „Ja, wir können das!“:** Aus der fertigen Sprecher-Aufnahme Wortzeiten lesen (z. B. Whisper mit `return_timestamps="word"`, Modell `openai/whisper-small`) und die Einblendung bei „Podemos“ starten. Für die anderen Einblendungen genügen die Szenengrenzen.
- **Schnitt:** `ffmpeg` (in der Cloud-Umgebung vorhanden) setzt Aufnahme, Sprecher, Musik (mit Ducking) und die vier Einblendungen zusammen. Ausgabe MP4 (H.264/AAC), 1080 × 1920, Ziel unter 40 MB.
- **Ablage:** Das fertige Video wird nicht eingecheckt, sondern nur außerhalb des Repos abgelegt und dem Nutzer zur Ansicht gegeben (Regel in `docs/TASKS.md`).

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

- Lernen-Seite: Der Nutzer ändert Oberfläche und Aussehen noch einmal und gibt Bescheid. Erst danach aufnehmen (siehe „Übergabe“).
- Alle neun Szenen im Modus „nur Stimmcharakter“ erzeugen (siehe „Übergabe“, Punkt 2).
- Ort der Hinweisdatei für Musik und Namensnennung (bei der Einbindung des Videos in die App).
- Video-Einbindung in die App (neue Seite im Tab „Mehr“): Anforderungen in `docs/TASKS.md`.
