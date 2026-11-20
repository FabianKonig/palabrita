# Palabrita: Drehbuch Erklärvideo

Stand: 2026-11-20. Vom Nutzer abgestimmt sind Format, Länge, Bild, Einblendungen, Abspann und Ablauf. **Sprecher, spanische Stimme, Musik und Sprechtempo sind nach der ersten Version verworfen und neu zu spezifizieren** (siehe „Erkenntnisse aus der ersten Version“). Gehört zur Aufgabe „Erklärvideo der App“ in `docs/TASKS.md`. Ist das Video fertig und eingebunden, kommen die Festlegungen in `docs/SPEC.md`.

## Erkenntnisse aus der ersten Version

Die erste Version wurde nach diesem Drehbuch automatisch erzeugt (Aufnahme, Sprecher, Musik, Schnitt). Der Nutzer ist mit mehreren Entscheidungen im Nachhinein nicht zufrieden; Stimmen und Musik sind die genannten Punkte. Urteil des Nutzers (2026-11-20):

- **Deutsche Stimme (Piper „Thorsten“): verworfen.** Extrem langweilig, zäh und mühsam anzuhören, einschläfernd und zu langsam. Nicht jugendlich, nicht peppig, keine Werbung, die Spaß macht. Die Stimme „Thorsten“ wird nicht mehr verwendet, auch nicht als Rückfall.
- **Spanische Stimme (männlich, mexikanisch gedacht, in Szene 3 und für spanische Wörter im Sprechertext): verworfen.** Klang überhaupt nicht gut. Die dort gewählte Stimme wird nicht wiederverwendet.
- **Möglicher Einfluss des Erzeugungswegs:** Die erste Version entstand ohne Python, mit Node (AGENTS.md: kein Python im Projekt). Ob die schlechte Qualität an den Stimmen selbst, an Piper allgemein oder an diesem Weg lag, ist ungeklärt. Der Nutzer vermutet, dass Thorsten allgemein nicht gut ist; Python hätte es vielleicht verbessert, das ist aber nur eine Vermutung.
- **Musik (per Skript erzeugte Marimba-Melodie): verworfen.** Zu langweilig. Das Video soll wie ein **modernes Erklär- und Werbevideo** wirken, Musik eingeschlossen. Modern ist hier das Ziel, nicht der Folklore-Ansatz der ersten Version.
- **Ton und Tempo insgesamt:** Gewünscht ist ein munteres, jugendliches Sprechen mit Schwung. Die Festlegung „ruhiges Tempo“ und „trocken, kein Werbegeschrei“ der ersten Version war zu zurückhaltend und ist überholt (siehe Tabelle unten).

### Für die nächste Iteration vorab klären

Bevor das Video neu erzeugt wird, müssen Stimmen und Musik **mit dem Nutzer genauer besprochen und hier spezifiziert** werden. Nicht einfach eine andere Stimme ausprobieren und das Ergebnis liefern. Zu entscheiden sind:

1. **Deutscher Sprecher:** Charakter (jung, energiegeladen, sympathisch; männlich oder weiblich), Sprechtempo, Betonung. Welche Stimme bzw. welcher Dienst, und ob lokal (kostenlos, ohne Cloud) weiterhin Pflicht ist oder ein besserer, ggf. kostenpflichtiger oder cloudbasierter Dienst erlaubt ist. Vermutlich lassen sich ohne die Pflicht „lokal“ natürlichere Stimmen finden; das ist beim Recherchieren zu prüfen.
2. **Spanische Stimme:** für *el camión* (Szene 3) und die spanischen Wörter im Sprechertext. Dialekt (Mexiko bevorzugt), natürlich klingend, passend zur deutschen Stimme.
3. **Erzeugungsweg:** Bleibt es bei „kein Python“ (AGENTS.md)? Falls die Stimmqualität daran hängt, ist das eine Entscheidung des Nutzers; AGENTS.md wird nicht stillschweigend geändert.
4. **Musik:** Stil eines modernen Werbe- und Erklärvideos (Genre, Tempo, Energie, Dynamik mit Aufbau und Schlusspunkt). Woher: selbst erzeugt (reicht der Anspruch?) oder lizenzfreie Fertigmusik (Lizenz vorher prüfen, muss die Veröffentlichung erlauben).
5. **Sprechertext:** Passt der Text zum neuen Ton? Der bisherige Text ist trocken und mit Understatement geschrieben; für einen peppigen Sprecher ggf. überarbeiten.
6. **Probehören vor dem Gesamtschnitt:** Stimmen und Musik zuerst als kurze Hörproben (je ein bis zwei Sätze, ein Musikausschnitt) dem Nutzer vorlegen und erst nach Freigabe das ganze Video erzeugen.

## Eckdaten

| Punkt | Festlegung |
|---|---|
| Länge | höchstens 60 s, Ziel 58 s |
| Sprache | Deutsch, Sprecher duzt (wie die App) |
| Ton | **überholt, neu festzulegen.** Erste Version: locker, trocken, Understatement, kein Werbegeschrei. Das wirkte zu zurückhaltend. Ziel jetzt: Klang eines modernen Erklär- und Werbevideos, jugendlich, munter, mit Schwung, Spaß beim Zuhören. Genaue Ausprägung (Wortwahl, Ausrufe, Witz) klärt die nächste Iteration. Kurze Sätze und ein bisschen Witz bleiben. |
| Bild | echte Aufnahme der App, automatisch durchgeklickt. **Hochformat 9:16** (1080 × 1920), damit man es auf dem Handy ansehen kann, ohne den Bildschirm zu drehen. |
| Sprecher | **offen, neu zu spezifizieren.** Verworfen: Piper „Thorsten“ (zäh, einschläfernd, nicht jugendlich) und die männliche spanische Stimme der ersten Version. Anforderung an die neue Stimme: jugendlich, peppig, in zügigem Tempo, wie ein Sprecher in einer Werbung, die Spaß macht. Stimme, Dienst und Erzeugungsweg: siehe „Für die nächste Iteration vorab klären“. |
| Musik | **offen, neu zu spezifizieren.** Verworfen: die per Skript erzeugte Marimba-Melodie (zu langweilig). Anforderung: moderne Musik wie in einem aktuellen Erklär- und Werbevideo, mit Energie und Aufbau. Weiter gelten: durchgehend, unter dem Sprecher leiser (Ducking), in den Sprechpausen etwas lauter, Schlusspunkt am Ende. Herkunft und Lizenz (selbst erzeugt oder Fertigmusik) sind zu klären. |
| Höhepunkt | **Formsuche** (gebeugte Formen finden, SPEC §3.3a): längste Szene, zwei Beispiele, als einzige Szene angekündigt. |
| Texteinblendungen | **höchstens Stichworte, nur wo nötig**: drei Stück (Szenen 2, 6 und 8), weil das Bild der App den Rest auch ohne Ton erklärt. Keine Untertitel. |
| Abspann | Wortmarke und Slogan, **keine Adresse**. |

## Ablauf

Zeiten sind Richtwerte; die genauen Schnitte ergeben sich aus der Länge der gesprochenen Sätze. Klicks sind sichtbar (Tipp-Punkt, der kurz aufleuchtet).

| # | Zeit | Bild (Klickpfad) | Einblendung | Sprechertext |
|---|---|---|---|---|
| 1 | 0:00–0:05 | Begrüßungskarte schwebt über der Lernseite: „¡Bienvenido a Palabrita“. Tipp, Karte dreht sich: „Willkommen zu Palabrita“. Tipp, Karte verschwindet. Musik setzt mit dem ersten Bild ein. | – | Mehr Spanisch als „Una cerveza, por favor“? Dann: Palabrita. |
| 2 | 0:05–0:10 | Lernseite. Thema öffnen, „Unterwegs & Transport“ wählen, „Starten“ tippen. | Über 800 Wörter | Über achthundert Wörter für Mexiko und Guatemala, vom Markt bis zum Maya-Tempel. |
| 3 | 0:10–0:19 | Karte „Bus · Lastwagen“. „Umdrehen“: *el camión* / *los camiones*, Badge „maskulin“, Beispielsatz, Hinweis „In Mexiko bedeutet „camión“ auch Stadtbus …“. Tipp auf 🔊, man hört *el camión* (spanische Stimme). Kurzer Zoom auf den Hinweis. | – | Umdrehen, anhören, dazulernen: In Mexiko ist der camión auch der Bus. Wer auf einen Lastwagen wartet, macht also alles richtig. |
| 4 | 0:19–0:26 | Buttons „Nochmal“ (1 Min) und „Gewusst“ (10 Min) kurz hervorgehoben. Tipp auf „Gewusst“. Zwei weitere Karten im Zeitraffer (umdrehen, bewerten). | – | Gewusst oder nochmal? Palabrita holt jedes Wort zurück, kurz bevor du es vergisst. |
| 5 | 0:26–0:31 | Karte „können · dürfen“, umdrehen: *poder* mit grauer Zeile *(ue)*. Tipp auf „Konjugation“, die Formentabelle fährt von unten herein, kurz scrollen. | – | Die Konjugation gibt’s gleich dazu. Auch für die unregelmäßigen Verben. Gerade für die. |
| 6 | 0:31–0:45 | **Höhepunkt.** Tab „Verzeichnis“. Ins Suchfeld wird „fue“ getippt (Buchstabe für Buchstabe). Treffer: **fue** → ser, **fue** → ir, **fue** → irse, jeweils mit „3. Sg. Pretérito indefinido“; Zoom auf die Pfeilzeilen. Suchfeld leeren, „podemos“ tippen: **podemos** → poder, „1. Pl. Presente“. Zeile antippen: Detailseite von *poder*, die Zelle *podemos* ist in der Tabelle hervorgehoben, Zoom darauf. | Findet auch gebeugte Formen | Unser Lieblingsteil: Irgendwo „fue“ gelesen? Eintippen. Palabrita findet auch gebeugte Formen. Ser oder ir? Beides. Spanisch eben. Und „podemos“ führt direkt zu poder, die Form schon markiert. |
| 7 | 0:45–0:49 | Tab „Statistik“: Balken neu, lernend, gefestigt je Richtung (vorbereiteter Lernstand, siehe Erzeugung). | – | Die Statistik zeigt, was schon sitzt. [kürzbar] |
| 8 | 0:49–0:55 | Tab „Mehr“ mit Markenkopf, dann ein Handy-Symbol mit Flugmodus-Zeichen über der weiter laufenden App. | Offline · ohne Konto · ohne Tracking | Läuft im Browser, auch offline. Kein Konto, kein Tracking. |
| 9 | 0:55–0:58 | Große Wortmarke (Wimpel, „Palabrita“, Greca) auf ruhigem Hintergrund, darunter Slogan „Tu app de vocabulario de español“, keine Adresse. Musik klingt mit einem Schlussakkord aus. | – | Palabrita. Probier’s aus. ¡Vámonos! |

## Sprechertext am Stück

Für die Sprachausgabe; Pausen zwischen den Szenen ergeben sich aus dem Schnitt. Etwa 113 Wörter. In der ersten Version lief das bei ruhigem Tempo (rund 2,3 Wörter je Sekunde) auf gut 50 s und war zu langsam; ein zügigerer Sprecher schafft den Text schneller, die gewonnene Zeit kann Musik und Bild bekommen. Der Text selbst ist ebenfalls zu prüfen, ob er zum neuen Ton passt. Wird es nach der Sprachausgabe zu lang, zuerst Szene 7 [kürzbar] streichen.

> Mehr Spanisch als „Una cerveza, por favor“? Dann: Palabrita.
>
> Über achthundert Wörter für Mexiko und Guatemala, vom Markt bis zum Maya-Tempel.
>
> Umdrehen, anhören, dazulernen: In Mexiko ist der camión auch der Bus. Wer auf einen Lastwagen wartet, macht also alles richtig.
>
> Gewusst oder nochmal? Palabrita holt jedes Wort zurück, kurz bevor du es vergisst.
>
> Die Konjugation gibt’s gleich dazu. Auch für die unregelmäßigen Verben. Gerade für die.
>
> Unser Lieblingsteil: Irgendwo „fue“ gelesen? Eintippen. Palabrita findet auch gebeugte Formen. Ser oder ir? Beides. Spanisch eben. Und „podemos“ führt direkt zu poder, die Form schon markiert.
>
> Die Statistik zeigt, was schon sitzt. [kürzbar]
>
> Läuft im Browser, auch offline. Kein Konto, kein Tracking.
>
> Palabrita. Probier’s aus. ¡Vámonos!

Die spanischen Wörter (*Una cerveza, por favor*, *camión*, *fue*, *ser*, *ir*, *podemos*, *poder*, *¡Vámonos!*) sollen spanisch ausgesprochen werden, nicht eingedeutscht. Die Formsuche-Szene (6) bleibt in jedem Fall vollständig, gekürzt wird nur an anderer Stelle.

## Automatische Erzeugung

- **Aufnahme:** Playwright mit der vorinstallierten Chromium-Version gegen `npm run preview`, Handy-Ansicht (z. B. 412 × 915 CSS-Pixel, Skalierung so, dass 1080 × 1920 entsteht), Videoaufnahme oder Einzelbilder je Szene. Tipp-Punkte und Zooms werden per eingeblendetem Overlay bzw. im Schnitt erzeugt, nicht in der App.
- **Vorbereiteter Lernstand:** Damit in Szene 3 bis 5 genau *el camión* und *poder* erscheinen und die Statistik (Szene 7) nicht leer ist, wird IndexedDB vor der Aufnahme mit einem passenden Zustand befüllt. Die App selbst wird dafür nicht geändert.
- **Aussprache in Szene 3:** Die Browser-Sprachausgabe klingt in einer automatisierten Aufnahme nicht mit. Das *el camión* wird deshalb getrennt mit einer spanischen Stimme erzeugt und an der Stelle des Tipps eingemischt. Welche Stimme, ist offen (die der ersten Version ist verworfen; Mexiko-Dialekt bleibt Wunsch).
- **Sprecher (offen):** Die Festlegung der ersten Version (Piper, deutsche Stimme „Thorsten“, spanische Wörter als Schnipsel mit einer spanischen Piper-Stimme, Rückfall auf aussprachenahe Schreibung) ist **gestrichen**. Neu zu spezifizieren: Stimmen, Dienst, Erzeugungsweg, Umgang mit den spanischen Wörtern im deutschen Text (Stimmwechsel oder eine mehrsprachige Stimme). Die Lizenz des gewählten Stimmmodells bzw. Dienstes wird vor der Verwendung geprüft (muss die Veröffentlichung des Videos erlauben). Siehe „Für die nächste Iteration vorab klären“.
- **Musik (offen):** Die Festlegung der ersten Version (TypeScript-Skript mit Marimba-Melodie) ist **gestrichen**. Neu zu spezifizieren: Stil, Herkunft und Erzeugungsweg. Länge passend zum Schnitt, Schlusspunkt am Ende.
- **Schnitt:** `ffmpeg` (in der Cloud-Umgebung vorhanden) setzt Aufnahme, Sprecher, Musik (mit Ducking) und die drei Stichworte zusammen. Ausgabe MP4 (H.264/AAC), 1080 × 1920, Ziel unter 40 MB.
- **Ablage:** Das fertige Video wird nicht eingecheckt, sondern nur außerhalb des Repos abgelegt und dem Nutzer zur Ansicht gegeben (Regel in `docs/TASKS.md`).
