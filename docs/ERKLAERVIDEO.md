# Palabrita: Drehbuch Erklärvideo

Stand: 2026-11-20. Vom Nutzer abgestimmt sind Format, Länge, Bild, Einblendungen, Abspann und Ablauf. **Sprecher, spanische Stimme, Musik und Sprechtempo sind nach der ersten Version verworfen**; die Richtung der neuen Fassung steht unter „Festlegungen für die nächste Iteration“, Stimmen und Musik werden per Hörprobe ausgewählt. Gehört zur Aufgabe „Erklärvideo der App“ in `docs/TASKS.md`. Ist das Video fertig und eingebunden, kommen die Festlegungen in `docs/SPEC.md`.

## Erkenntnisse aus der ersten Version

Die erste Version wurde nach diesem Drehbuch automatisch erzeugt (Aufnahme, Sprecher, Musik, Schnitt). Der Nutzer ist mit mehreren Entscheidungen im Nachhinein nicht zufrieden; Stimmen und Musik sind die genannten Punkte. Urteil des Nutzers (2026-11-20):

- **Deutsche Stimme (Piper „Thorsten“): verworfen.** Extrem langweilig, zäh und mühsam anzuhören, einschläfernd und zu langsam. Nicht jugendlich, nicht peppig, keine Werbung, die Spaß macht. Die Stimme „Thorsten“ wird nicht mehr verwendet, auch nicht als Rückfall.
- **Spanische Stimme (männlich, mexikanisch gedacht, in Szene 3 und für spanische Wörter im Sprechertext): verworfen.** Klang überhaupt nicht gut. Die dort gewählte Stimme wird nicht wiederverwendet.
- **Möglicher Einfluss des Erzeugungswegs:** Die erste Version entstand ohne Python, mit Node (AGENTS.md: kein Python im Projekt). Ob die schlechte Qualität an den Stimmen selbst, an Piper allgemein oder an diesem Weg lag, ist ungeklärt. Der Nutzer vermutet, dass Thorsten allgemein nicht gut ist; Python hätte es vielleicht verbessert, das ist aber nur eine Vermutung.
- **Musik (per Skript erzeugte Marimba-Melodie): verworfen.** Zu langweilig. Das Video soll wie ein **modernes Erklär- und Werbevideo** wirken, Musik eingeschlossen. Modern ist hier das Ziel, nicht der Folklore-Ansatz der ersten Version.
- **Ton und Tempo insgesamt:** Gewünscht ist ein munteres, jugendliches Sprechen mit Schwung. Die Festlegung „ruhiges Tempo“ und „trocken, kein Werbegeschrei“ der ersten Version war zu zurückhaltend und ist überholt (siehe Tabelle unten).

## Festlegungen für die nächste Iteration (2026-11-20, mit dem Nutzer)

Stimmen und Musik werden nicht blind getauscht, sondern über Hörproben ausgewählt (Ablauf unten). Entschieden ist:

1. **Deutscher Sprecher:** junge Männerstimme, energiegeladen, sympathisch, zügiges Tempo (Werbe-Ton). Welche Stimme, entscheidet der Nutzer nach Hörproben.
2. **Spanische Stimme:** Geschlecht und Dialekt sind offen („egal, nach Hörproben“). Mexikanisches Spanisch bleibt bevorzugt, weil die App Mexiko/Guatemala behandelt. Gesprochen werden *el camión* (Szene 3) und die spanischen Wörter im Sprechertext. Die Hörproben dürfen auch eine mehrsprachige Stimme enthalten, die Deutsch und Spanisch ohne Stimmwechsel spricht.
3. **Lokal oder Cloud:** offen. Entscheidung fällt nach den Hörproben (lokal und Cloud werden beide probiert). Randbedingung: **möglichst nichts, was ein Konto braucht.** Bevorzugt Angebote ohne Anmeldung; keine Zahlungsdaten. Braucht ein Kandidat doch ein Konto oder einen Schlüssel, vorher mit dem Nutzer klären (Schlüssel nie im Chat, nur über die gesicherte Abfrage der Umgebung). Lizenz bzw. Nutzungsbedingungen müssen die Veröffentlichung des Videos erlauben; nicht ausdrücklich erlaubte Wege (z. B. inoffizielle Zugänge zu Diensten) scheiden aus.
4. **Erzeugungsweg:** **Python ist für die Videoerzeugung erlaubt** (Ausnahme zu AGENTS.md, dort vermerkt). Python bleibt auf die Erzeugung des Videos beschränkt: nicht in `src/`, nicht in `public/`, keine Änderung an `package.json`, CI oder Build. Eine Python-Umgebung (z. B. `venv`) und heruntergeladene Modelle werden nicht eingecheckt. Annahme: Wo es sinnvoll ist, bleiben Aufnahme (Playwright) und Orchestrierung in TypeScript; Python kommt nur dort hinzu, wo es die Stimme oder Musik besser macht.
5. **Musik:** **lizenzfreie Fertigmusik**, modern und energiegeladen wie in einem aktuellen Erklär- und Werbevideo, mit Aufbau (Einstieg, Schwung, Schlusspunkt). Vor der Verwendung wird für jeden Titel die Lizenz geprüft (muss die Veröffentlichung in einer öffentlichen Web-App erlauben, mit oder ohne Namensnennung; falls Namensnennung nötig ist, kommt sie auf die Video-Seite). Titel, Quelle und Lizenz werden festgehalten (in einer Hinweisdatei, wie `public/vocab/NOTICE.md` für die Vokabeln; Ort ist bei der Einbindung des Videos festzulegen). Stil und konkrete Titel sind offen: Der Nutzer wählt aus Hörproben.
6. **Sprechertext:** wird **neu geschrieben**, im munteren Werbe-Ton, gleicher Ablauf und gleiche Inhalte (Szenen und Einblendungen bleiben). Der Entwurf geht dem Nutzer zur Freigabe vor, bevor etwas erzeugt wird. Der Text steht unten in „Sprechertext am Stück“ und in der Ablauftabelle; der Ton ist freigegeben.

### Ablauf der nächsten Iteration

1. Neuen Sprechertext schreiben, Nutzer gibt frei.
2. Hörproben vorlegen: mehrere deutsche Stimmen (männlich, jung) und spanische Stimmen mit je ein bis zwei Sätzen des neuen Texts, dazu Musikausschnitte mit Lizenzangabe. Der Nutzer wählt.
3. Erst danach das ganze Video erzeugen (Aufnahme, Ton, Schnitt) und dem Nutzer zur Ansicht geben (Ablage: siehe „Automatische Erzeugung“).

## Eckdaten

| Punkt | Festlegung |
|---|---|
| Länge | höchstens 60 s, Ziel 58 s |
| Sprache | Deutsch, Sprecher duzt (wie die App) |
| Ton | **frech, munter, jugendlich**, Klang eines modernen Erklär- und Werbevideos mit Schwung und Spaß beim Zuhören (vom Nutzer freigegeben, 2026-11-20). Die erste Version (locker, trocken, Understatement, kein Werbegeschrei) wirkte zu zurückhaltend. Kurze Sätze und ein bisschen Witz bleiben. |
| Bild | echte Aufnahme der App, automatisch durchgeklickt. **Hochformat 9:16** (1080 × 1920), damit man es auf dem Handy ansehen kann, ohne den Bildschirm zu drehen. |
| Sprecher | **junge Männerstimme, energiegeladen, zügiges Tempo**, wie ein Sprecher in einer Werbung, die Spaß macht. Konkrete Stimme und Herkunft (lokal oder Cloud, möglichst ohne Konto) per Hörprobe offen. Verworfen: Piper „Thorsten“ und die spanische Stimme der ersten Version. |
| Musik | **lizenzfreie Fertigmusik**, modern und energiegeladen wie in einem aktuellen Erklär- und Werbevideo, mit Aufbau. Durchgehend, unter dem Sprecher leiser (Ducking), in den Sprechpausen etwas lauter, Schlusspunkt am Ende. Titel und Stil per Hörprobe offen; Lizenz je Titel vorher prüfen. Verworfen: die per Skript erzeugte Marimba-Melodie. |
| Höhepunkt | **Formsuche** (gebeugte Formen finden, SPEC §3.3a): längste Szene, zwei Beispiele, als einzige Szene angekündigt. |
| Texteinblendungen | **höchstens Stichworte, nur wo nötig**: drei Stück (Szenen 2, 6 und 8), weil das Bild der App den Rest auch ohne Ton erklärt. Keine Untertitel. |
| Abspann | Wortmarke und Slogan, **keine Adresse**. |

## Ablauf

Zeiten sind Richtwerte; die genauen Schnitte ergeben sich aus der Länge der gesprochenen Sätze. Klicks sind sichtbar (Tipp-Punkt, der kurz aufleuchtet).

| # | Zeit | Bild (Klickpfad) | Einblendung | Sprechertext |
|---|---|---|---|---|
| 1 | 0:00–0:05 | Begrüßungskarte schwebt über der Lernseite: „¡Bienvenido a Palabrita“. Tipp, Karte dreht sich: „Willkommen zu Palabrita“. Tipp, Karte verschwindet. Musik setzt mit dem ersten Bild ein. | – | „Una cerveza, por favor“ – und dann? Peinliches Schweigen? Muss nicht sein. Das ist Palabrita! |
| 2 | 0:05–0:10 | Lernseite. Thema öffnen, „Unterwegs & Transport“ wählen, „Starten“ tippen. | Über 800 Wörter | Über achthundert Wörter für Mexiko und Guatemala. Vom Markt bis zum Maya-Tempel! |
| 3 | 0:10–0:19 | Karte „Bus · Lastwagen“. „Umdrehen“: *el camión* / *los camiones*, Badge „maskulin“, Beispielsatz, Hinweis „In Mexiko bedeutet „camión“ auch Stadtbus …“. Tipp auf 🔊, man hört *el camión* (spanische Stimme). Kurzer Zoom auf den Hinweis. | – | Umdrehen, anhören, merken. Und Achtung: In Mexiko ist der camión auch der Bus. Du wartest auf einen Laster? Glückwunsch, du fährst Bus! |
| 4 | 0:19–0:26 | Buttons „Nochmal“ (1 Min) und „Gewusst“ (10 Min) kurz hervorgehoben. Tipp auf „Gewusst“. Zwei weitere Karten im Zeitraffer (umdrehen, bewerten). | – | Gewusst oder nochmal? Ehrlich sein! Palabrita merkt sich, wann du ein Wort vergessen würdest, und fragt genau davor nochmal. |
| 5 | 0:26–0:31 | Karte „können · dürfen“, umdrehen: *poder* mit grauer Zeile *(ue)*. Tipp auf „Konjugation“, die Formentabelle fährt von unten herein, kurz scrollen. | – | Konjugation? Gibt’s gratis dazu. Auch für die fiesen, unregelmäßigen Verben. |
| 6 | 0:31–0:45 | **Höhepunkt.** Tab „Verzeichnis“. Ins Suchfeld wird „fue“ getippt (Buchstabe für Buchstabe). Treffer: **fue** → ser, **fue** → ir, **fue** → irse, jeweils mit „3. Sg. Pretérito indefinido“; Zoom auf die Pfeilzeilen. Suchfeld leeren, „podemos“ tippen: **podemos** → poder, „1. Pl. Presente“. Zeile antippen: Detailseite von *poder*, die Zelle *podemos* ist in der Tabelle hervorgehoben, Zoom darauf. | Findet auch gebeugte Formen | Jetzt wird’s gut! Irgendwo „fue“ aufgeschnappt? Tipp es ein. Ser? Ir? Beides! Palabrita findet auch gebeugte Formen. Und „podemos“ führt direkt zu poder, Form schon markiert. Können wir das? Podemos! |
| 7 | 0:45–0:49 | Tab „Statistik“: Balken neu, lernend, gefestigt je Richtung (vorbereiteter Lernstand, siehe Erzeugung). | – | Die Statistik zeigt, was schon sitzt. Perfektes Angeber-Material. [kürzbar] |
| 8 | 0:49–0:55 | Tab „Mehr“ mit Markenkopf, dann ein Handy-Symbol mit Flugmodus-Zeichen über der weiter laufenden App. | Offline · ohne Konto · ohne Tracking | Läuft im Browser, auch offline. Kein Konto, kein Tracking. Nur du und die Wörter. |
| 9 | 0:55–0:58 | Große Wortmarke (Wimpel, „Palabrita“, Greca) auf ruhigem Hintergrund, darunter Slogan „Tu app de vocabulario de español“, keine Adresse. Musik klingt mit einem Schlussakkord aus. | – | Palabrita. Probier’s aus. ¡Vámonos! |

## Sprechertext am Stück

**Ton vom Nutzer freigegeben (2026-11-20)**, frech und munter, ohne die Zusätze „Die Cerveza ist erst der Anfang“ (Szene 2), „Ja, genau für die“ (Szene 5) und „Spanisch macht keine Gefangenen“ (Szene 6). Ablauf, Szenen und Inhalte wie zuvor. Für die Sprachausgabe; Pausen zwischen den Szenen ergeben sich aus dem Schnitt. Etwa 134 Wörter. Bei einem zügigen Sprecher (rund 3 Wörter je Sekunde) sind das rund 45 s reine Sprechzeit; der Rest sind Musikpausen und Schnitt. Wird es nach der Sprachausgabe zu lang, zuerst Szene 7 [kürzbar] streichen. Der Wortwitz in Szene 6 („podemos“ = „wir können“) braucht eine klar spanische Betonung von *podemos*; in der Hörprobe prüfen.

> „Una cerveza, por favor“ – und dann? Peinliches Schweigen? Muss nicht sein. Das ist Palabrita!
>
> Über achthundert Wörter für Mexiko und Guatemala. Vom Markt bis zum Maya-Tempel!
>
> Umdrehen, anhören, merken. Und Achtung: In Mexiko ist der camión auch der Bus. Du wartest auf einen Laster? Glückwunsch, du fährst Bus!
>
> Gewusst oder nochmal? Ehrlich sein! Palabrita merkt sich, wann du ein Wort vergessen würdest, und fragt genau davor nochmal.
>
> Konjugation? Gibt’s gratis dazu. Auch für die fiesen, unregelmäßigen Verben.
>
> Jetzt wird’s gut! Irgendwo „fue“ aufgeschnappt? Tipp es ein. Ser? Ir? Beides! Palabrita findet auch gebeugte Formen. Und „podemos“ führt direkt zu poder, Form schon markiert. Können wir das? Podemos!
>
> Die Statistik zeigt, was schon sitzt. Perfektes Angeber-Material. [kürzbar]
>
> Läuft im Browser, auch offline. Kein Konto, kein Tracking. Nur du und die Wörter.
>
> Palabrita. Probier’s aus. ¡Vámonos!

Die spanischen Wörter (*Una cerveza, por favor*, *camión*, *fue*, *ser*, *ir*, *podemos*, *poder*, *¡Vámonos!*) sollen spanisch ausgesprochen werden, nicht eingedeutscht. Die Formsuche-Szene (6) bleibt in jedem Fall vollständig, gekürzt wird nur an anderer Stelle.

## Automatische Erzeugung

- **Aufnahme:** Playwright mit der vorinstallierten Chromium-Version gegen `npm run preview`, Handy-Ansicht (z. B. 412 × 915 CSS-Pixel, Skalierung so, dass 1080 × 1920 entsteht), Videoaufnahme oder Einzelbilder je Szene. Tipp-Punkte und Zooms werden per eingeblendetem Overlay bzw. im Schnitt erzeugt, nicht in der App.
- **Vorbereiteter Lernstand:** Damit in Szene 3 bis 5 genau *el camión* und *poder* erscheinen und die Statistik (Szene 7) nicht leer ist, wird IndexedDB vor der Aufnahme mit einem passenden Zustand befüllt. Die App selbst wird dafür nicht geändert.
- **Aussprache in Szene 3:** Die Browser-Sprachausgabe klingt in einer automatisierten Aufnahme nicht mit. Das *el camión* wird deshalb getrennt mit einer spanischen Stimme erzeugt und an der Stelle des Tipps eingemischt. Welche Stimme, ist offen (die der ersten Version ist verworfen; Mexiko-Dialekt bleibt Wunsch).
- **Sprecher (Auswahl per Hörprobe):** Die Festlegung der ersten Version (Piper, „Thorsten“, spanische Wörter mit einer spanischen Piper-Stimme, Rückfall auf aussprachenahe Schreibung) ist **gestrichen**. Stimmen, Dienst und Umgang mit den spanischen Wörtern (Stimmwechsel oder mehrsprachige Stimme) werden nach „Festlegungen für die nächste Iteration“ ausgewählt; Python ist dafür erlaubt. Die Lizenz bzw. Nutzungsbedingungen des gewählten Modells oder Dienstes werden vor der Verwendung geprüft.
- **Musik (Auswahl per Hörprobe):** Die Festlegung der ersten Version (TypeScript-Skript mit Marimba-Melodie) ist **gestrichen**. Verwendet wird lizenzfreie Fertigmusik; sie wird im Schnitt auf die Länge gebracht (Schlusspunkt am Ende). Titel, Quelle und Lizenz werden festgehalten.
- **Schnitt:** `ffmpeg` (in der Cloud-Umgebung vorhanden) setzt Aufnahme, Sprecher, Musik (mit Ducking) und die drei Stichworte zusammen. Ausgabe MP4 (H.264/AAC), 1080 × 1920, Ziel unter 40 MB.
- **Ablage:** Das fertige Video wird nicht eingecheckt, sondern nur außerhalb des Repos abgelegt und dem Nutzer zur Ansicht gegeben (Regel in `docs/TASKS.md`).
