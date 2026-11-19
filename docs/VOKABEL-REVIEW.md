# Vokabel-Review (feindliche Prüfung)

Stand: 18.11.2026 · Geprüft: alle **802 Einträge** in `public/vocab/*.json` (13 Themen), davon 250 Verben.

## Vorgehen

- Jeder Eintrag wurde einzeln gelesen: spanische Form mit Artikel, Genus, Plural, Wortart, alle deutschen Bedeutungen, Beispielsatz (Spanisch und Deutsch), Hinweis.
- Bei jedem Verb wurde die **vollständige, von der App erzeugte Konjugation** geprüft (Presente, Indefinido, Imperfecto, Futuro, Imperativo, Partizip, Gerundium; bei reflexiven Verben inklusive Pronomen und Akzent im Imperativ). Grundlage ist exakt das, was `conjugate()` ausgibt, nicht nur die JSON-Daten.
- Zusätzlich maschinell geprüft: Formen mit zwei Akzenten, Akzent im Futur-Stamm, Artikel ↔ Genus, fehlende Plurale.
- Regionaler Maßstab: Spanisch in Mexiko und Guatemala (wie in `docs/SPEC.md` vorgesehen).
- Websuche bei Zweifeln (siehe Quellen am Ende).

## Ergebnis auf einen Blick

| Kategorie | Anzahl |
| --- | --- |
| Gesichert korrekt (inkl. 5 nur ergänzte Einträge und 1 Grenzfall ohne Änderung) | 774 |
| Falsch, **korrigiert** (Korrektur steht unten und ist bereits in den JSON-Dateien umgesetzt) | 24 |
| Grenzfall, **nach Rückfrage geändert** | 4 |
| Unsicher (offen) | 0 |

Damit sind nach meiner Prüfung alle 802 Einträge korrekt.

## Falsch – mit korrekter Lösung (alle umgesetzt)

### Konjugation

| ID | Vokabel | Fehler (vorher) | Korrekt |
| --- | --- | --- | --- |
| v0646 | haber | Imperativ tú: **habe** (existiert nicht) | **he** (laut RAE; praktisch nur in „he aquí“) |
| v0691 | reír | Futur: **reíré, reírás, reirá …** (Akzent fälschlich aus dem Infinitiv übernommen) | **reiré, reirás, reirá, reiremos, reiréis, reirán** |
| v0711 | sonreír | Futur: **sonreíré …**; Indefinido 3. Sg.: **sonrio** | **sonreiré, sonreirás …**; **sonrió** (mehrsilbig, endet auf Vokal, trägt Akzent; nur das einsilbige *rio* ist ohne Akzent) |
| v0742 | ponerse | Imperativ tú: **póntete** (Pronomen doppelt) | **ponte** |
| v0751 | reunirse | Presente: **me reuno, te reunes, se reune, se reunen**; Imperativ: **réunete, réunase, réunanse** | **me reúno, te reúnes, se reúne, se reúnen**; **reúnete, reúnase, reúnanse** |

Ursache bei reír/sonreír war der Generator (`src/domain/conjugation/conjugate.ts`): Das Futur hing die Endungen an den Infinitiv mit Akzent an. Das ist jetzt im Generator behoben (`-ír` → `-ir` vor den Futurendungen). Dadurch ist der bisherige Futur-Override bei **oír** (v0650) überflüssig und wurde entfernt; die Formen *oiré, oirás …* bleiben unverändert richtig. Neue Tests decken das ab.

### Genus

| ID | Vokabel | Fehler | Korrekt |
| --- | --- | --- | --- |
| v0786 | el agua | gender **m** (der eigene Hinweis sagte schon „Feminin“) | gender **f**. *Agua* ist feminin; *el* steht nur wegen des betonten a- (el agua fría, las aguas). Der Validator (`scripts/validateVocab.ts`) erlaubt jetzt *el* + feminin bei Nomen mit betontem (h)a-, sonst hätte er die Korrektur abgelehnt. |

### Übersetzungen

| ID | Vokabel | Fehler | Korrekt |
| --- | --- | --- | --- |
| v0592 | el amigo | Bedeutung „Freundin“ beim maskulinen Nomen | nur „Freund“ (*la amiga* steht im Hinweis) |
| v0261 | el secador | Bedeutung „Wäscheständer“ (kein Beleg gefunden; Wäscheständer = *el tendedero*) | „Föhn, Haartrockner“; Hinweis: in Mexiko sagt man für den Föhn oft *la secadora (de pelo)* |
| v0058 | no se preocupe | Beispiel „no pasa nada“ als „es ist nichts passiert“ übersetzt | „Machen Sie sich keine Sorgen, das macht nichts.“ (*no pasa nada* = macht nichts / kein Problem) |
| v0673 | realizar | „Se realizará una feria“ → „findet ein **Markt** statt“ | „findet ein **Jahrmarkt** statt“ (*feria* = Jahrmarkt/Volksfest/Messe, Markt = *mercado*) |

### Spanische Beispielsätze

| ID | Vokabel | Vorher | Korrekt |
| --- | --- | --- | --- |
| v0104 | cero | La temperatura es cero grados. | La temperatura es **de** cero grados. |
| v0281 | cambiar | Quiero cambiar dólares **en** pesos. | Quiero cambiar dólares **a** pesos. |
| v0840 | bonito | Qué bonito está tu vestido. (Ausruf ohne Zeichen) | **¡**Qué bonito está tu vestido**!** / Wie schön dein Kleid ist! |
| v0925 | de todos modos | No sé si **llueve**, pero iré … / „… ob es regnet, aber ich gehe jedenfalls hin“ | No sé si **va a llover**, pero iré de todos modos. / „Ich weiß nicht, ob es regnen wird, aber ich gehe trotzdem hin.“ |
| v0703 | mover | ¿Puede mover su **coche**? | ¿Puede mover su **carro**? (die App selbst lehrt: in Mexiko/Guatemala *carro*) |
| v0209 | ¿A qué hora sale el camión? | … el camión a **Xela** (Xela liegt in Guatemala, dort ist *camión* ein Lkw; der Bus heißt *bus* oder *camioneta*) | … el camión a **Oaxaca** |

### Hinweise (inhaltlich falsch oder irreführend)

| ID | Vokabel | Vorher | Korrekt |
| --- | --- | --- | --- |
| v0400 | el terremoto | „sismo (stärkeres Beben)“ | *sismo* ist das allgemeine/fachliche Wort (Nachrichten, Servicio Sismológico Nacional), *temblor* umgangssprachlich meist für Beben ohne große Schäden, *terremoto* für ein schweres Beben |
| v0348 | el resfriado | „In Mexiko **und Guatemala** sagt man oft la gripa“ | Mexiko: *la gripa*; Guatemala: *la gripe* bzw. *el catarro* |
| v0262 | la secadora | „Der Haarföhn heißt el secador“ | ergänzt: in Mexiko ist *la secadora (de pelo)* auch der Föhn |
| v0131 | almorzar | ohne Hinweis, nur „zu Mittag essen“ | Hinweis ergänzt: In Guatemala Mittagessen; in Mexiko meist spätes, kräftiges Frühstück, Mittagessen = *la comida / comer* |
| v0877 | con | „Mit pronomen“ | „Mit Pronomen“ |

### Deutsche Übersetzung unidiomatisch

| ID | Vokabel | Vorher | Korrekt |
| --- | --- | --- | --- |
| v0102 | hoy | Heute scheint viel Sonne. | Heute ist es sehr sonnig. |
| v0382 | el sol | Heute scheint viel Sonne am Strand. | Heute ist es am Strand sehr sonnig. |
| v0824 | el nivel | Mein Spanischniveau ist grundlegend. | Mein Spanisch ist noch auf Grundniveau. |

## Grenzfälle (nach Rückfrage entschieden)

Diese Einträge waren keine klaren Fehler. Entschieden am 19.11.2026:

| ID | Vokabel | Punkt | Entscheidung |
| --- | --- | --- | --- |
| v0294 | la camisa | Bedeutung „Bluse“ (Standardwort ist *la blusa*, v0309) | **Geändert:** nur noch „Hemd“ |
| v0798 | la parte | Bedeutung „Seite“ (nur in Wendungen wie *por otra parte*) | **Geändert:** „Teil, Stelle“ |
| v0868 | siguiente | „Nos vemos la siguiente semana.“ (richtig, aber weniger idiomatisch) | **Geändert:** „Nos vemos la semana siguiente.“ |
| v0399 | el huracán | „La temporada de huracanes empieza en junio.“ (an Mexikos Pazifikküste schon ab 15. Mai) | **Geändert:** „La temporada de huracanes en el Caribe empieza en junio.“ / „Die Hurrikansaison in der Karibik beginnt im Juni.“ |
| v0157 | el pozole | „Der rote Pozole“ (deutsches Genus nicht kodifiziert) | **Unverändert:** spanisches Genus stimmt, „der“ ist plausibel; jetzt unter „Gesichert korrekt“ |

## Gesichert korrekt

Alle folgenden Einträge sind nach meiner Prüfung vollständig korrekt: spanische Form, Genus, Plural, Bedeutungen, Beispielsatz (beide Sprachen), Hinweis und, bei Verben, alle erzeugten Formen. Bei 5 Einträgen wurde nur etwas ergänzt (kursiv vermerkt).

Bemerkungen ohne Änderungsbedarf (geprüft, bewusst so gelassen):

- Impersonale Verben (llover, nevar, amanecer) und gustar/doler/encantar werden mit allen Personen konjugiert. Die Formen sind sprachlich korrekt (z. B. *lluevo* im übertragenen Sinn), werden im Alltag aber fast nur in der 3. Person verwendet; die Hinweise erklären das bereits bei gustar/doler.
- *reír* 3. Sg. Indefinido **rio** ohne Akzent ist korrekt (RAE-Orthografie 2010, einsilbig).
- *irse*: Imperativ vosotros **idos** ist korrekt (RAE akzeptiert inzwischen auch *iros*).
- *ir*: Imperativ nosotros **vamos** / *irse*: **vámonos** sind die üblichen bejahten Formen.
- *el chofer* (ohne Akzent) ist die mexikanische/guatemaltekische Form, *chófer* die spanische.
- Mexikanismen wie *camión* (Bus), *playera*, *chamarra*, *banqueta*, *regadera*, *descompuesto*, *ahorita*, *¿Mande?* sind korrekt eingeordnet.

<details>
<summary><b>Begrüßung & Höflichkeit</b> (39)</summary>

- v0001 **hola** – Hallo
- v0002 **buenos días** – Guten Morgen
- v0003 **gracias** – Danke
- v0004 **por favor** – Bitte
- v0026 **saludar** – grüßen, begrüßen
- v0027 **el saludo** – der Gruß
- v0028 **el señor** – der Herr, Herr
- v0029 **la señora** – die Frau, Frau (Anrede)
- v0030 **bienvenido** – willkommen
- v0031 **encantado** – erfreut, sehr angenehm
- v0032 **perdón** – Entschuldigung, Verzeihung
- v0033 **buenas tardes** – Guten Tag, Guten Nachmittag
- v0034 **buenas noches** – Guten Abend, Gute Nacht
- v0035 **adiós** – Auf Wiedersehen, Tschüss
- v0036 **hasta luego** – bis später, bis bald
- v0037 **de nada** – Bitte (Antwort auf Danke), gern geschehen
- v0038 **presentarse** – sich vorstellen
- v0039 **despedirse** – sich verabschieden
- v0040 **el favor** – der Gefallen, die Gefälligkeit
- v0041 **la despedida** – der Abschied, die Verabschiedung
- v0042 **amable** – freundlich, nett
- v0043 **igualmente** – gleichfalls, ebenso
- v0044 **con permiso** – Mit Ihrer Erlaubnis, Entschuldigung, darf ich vorbei
- v0045 **disculpe** – Entschuldigen Sie, Verzeihen Sie
- v0046 **lo siento** – es tut mir leid
- v0047 **mucho gusto** – freut mich, angenehm
- v0048 **¿Cómo se llama usted?** – Wie heißen Sie?
- v0049 **me llamo…** – ich heiße…
- v0050 **¿Cómo está usted?** – Wie geht es Ihnen?
- v0051 **hasta mañana** – bis morgen
- v0052 **nos vemos** – wir sehen uns, bis dann
- v0053 **¿Qué tal?** – Wie geht’s?, Was gibt’s?
- v0054 **agradecer** – danken, sich bedanken bei
- v0055 **el permiso** – die Erlaubnis, die Genehmigung
- v0056 **cortés** – höflich
- v0057 **que le vaya bien** – alles Gute, machen Sie es gut
- v0059 **a sus órdenes** – zu Ihren Diensten
- v0060 **¿Mande?** – Wie bitte?, Ja, bitte?
- v0061 **le agradezco mucho** – ich danke Ihnen sehr

</details>

<details>
<summary><b>Zahlen & Zeit</b> (40)</summary>

- v0076 **esperar** – warten
- v0077 **empezar** – anfangen, beginnen
- v0078 **durar** – dauern
- v0079 **tardar** – brauchen (zeitlich), sich verspäten
- v0080 **terminar** – beenden, enden
- v0081 **despertarse** – aufwachen
- v0082 **el día** – Tag
- v0083 **la semana** – Woche
- v0084 **el mes** – Monat
- v0085 **el año** – Jahr
- v0086 **la hora** – Stunde, Uhrzeit
- v0087 **la mañana** – Morgen, Vormittag
- v0088 **la tarde** – Nachmittag
- v0089 **la noche** – Nacht, Abend (spät)
- v0090 **el minuto** – Minute
- v0091 **el fin de semana** – Wochenende
- v0092 **el reloj** – Uhr, Armbanduhr
- v0093 **el lunes** – Montag
- v0094 **el sábado** – Samstag
- v0095 **el domingo** – Sonntag
- v0096 **el mediodía** – Mittag
- v0097 **el cumpleaños** – Geburtstag
- v0098 **uno** – eins, ein
- v0099 **dos** – zwei
- v0100 **tres** – drei
- v0101 **diez** – zehn
- v0103 **ahora** – jetzt
- v0105 **cinco** – fünf
- v0106 **veinte** – zwanzig
- v0107 **cien** – hundert
- v0108 **ayer** – gestern
- v0109 **temprano** – früh
- v0110 **mil** – tausend
- v0111 **primero** – erster
- v0112 **siempre** – immer
- v0113 **luego** – später, danach
- v0114 **¿Qué hora es?** – Wie spät ist es?
- v0115 **¿Qué día es hoy?** – Welcher Tag ist heute?
- v0116 **Son las tres.** – Es ist drei Uhr.
- v0117 **¿A qué hora abre?** – Um wie viel Uhr öffnet es?

</details>

<details>
<summary><b>Essen & Trinken</b> (49)</summary>

- v0007 **la comida** – Essen, Mahlzeit
- v0008 **el taco** – Taco
- v0009 **la tortilla** – Tortilla
- v0010 **el frijol** – Bohne
- v0023 **comer** – essen
- v0126 **beber** – trinken
- v0127 **pedir** – bestellen, bitten um
- v0128 **tomar** – trinken, nehmen
- v0129 **desayunar** – frühstücken
- v0130 **cenar** – zu Abend essen
- v0132 **cocinar** – kochen
- v0133 **probar** – probieren, kosten
- v0134 **preparar** – zubereiten
- v0135 **servir** – servieren, auftragen
- v0136 **hervir** – kochen, sieden
- v0138 **la leche** – Milch
- v0139 **el café** – Kaffee
- v0140 **el pan** – Brot
- v0141 **el arroz** – Reis
- v0142 **la carne** – Fleisch
- v0143 **el pollo** – Hähnchen, Huhn
- v0144 **el jugo** – Saft
- v0145 **la cerveza** – Bier
- v0146 **el huevo** – Ei
- v0147 **el queso** – Käse
- v0148 **el tamal** – Tamal
- v0149 **la sopa** – Suppe
- v0150 **la ensalada** – Salat
- v0151 **la cuenta** – Rechnung
- v0152 **la propina** – Trinkgeld
- v0153 **el mesero** – Kellner
- v0154 **el aguacate** – Avocado
- v0155 **el desayuno** – Frühstück
- v0156 **el pepián** – Pepián
- v0157 **el pozole** – Pozole
- v0158 **el elote** – Maiskolben
- v0159 **la masa** – Teig, Maisteig
- v0160 **la receta** – Rezept
- v0161 **el antojito** – Imbiss, Snack
- v0162 **delicioso** – köstlich, lecker
- v0163 **rico** – lecker, reich, gut
- v0164 **picante** – scharf
- v0165 **dulce** – süß
- v0166 **salado** – salzig, gesalzen
- v0167 **vegetariano** – vegetarisch
- v0168 **¡Buen provecho!** – Guten Appetit!
- v0169 **La cuenta, por favor.** – Die Rechnung, bitte.
- v0170 **¿Qué me recomienda?** – Was empfehlen Sie mir?
- v0171 **Tengo hambre.** – Ich habe Hunger.

</details>

<details>
<summary><b>Unterwegs & Transport</b> (41)</summary>

- v0005 **el autobús** – Bus
- v0006 **el carro** – Auto, Wagen
- v0025 **viajar** – reisen
- v0176 **llegar** – ankommen
- v0177 **salir** – abfahren, ausgehen, hinausgehen
- v0178 **subir** – einsteigen, hinaufsteigen
- v0179 **bajar** – aussteigen, hinuntergehen
- v0180 **volar** – fliegen
- v0181 **regresar** – zurückkehren, zurückfahren
- v0182 **manejar** – fahren, lenken
- v0183 **aterrizar** – landen
- v0184 **despegar** – starten, abheben
- v0185 **el taxi** – Taxi
- v0186 **el avión** – Flugzeug
- v0187 **el aeropuerto** – Flughafen
- v0188 **el tren** – Zug
- v0189 **el boleto** – Fahrkarte, Ticket
- v0190 **la estación** – Bahnhof, Station
- v0191 **la maleta** – Koffer
- v0192 **la parada** – Haltestelle
- v0193 **el vuelo** – Flug
- v0194 **la frontera** – Grenze
- v0195 **el pasajero** – Fahrgast, Passagier
- v0196 **el camión** – Bus, Lastwagen
- v0197 **el chofer** – Fahrer
- v0198 **el viaje** – Reise, Fahrt
- v0199 **la aduana** – Zoll, Zollbehörde
- v0200 **el retraso** – Verspätung
- v0201 **la camioneta** – Kleinbus, Chicken Bus
- v0202 **el trayecto** – Strecke, Fahrt
- v0203 **rápido** – schnell
- v0204 **lento** – langsam
- v0205 **directo** – direkt
- v0206 **lleno** – voll, besetzt
- v0207 **de ida y vuelta** – hin und zurück
- v0208 **retrasado** – verspätet
- v0210 **Un boleto a Antigua, por favor.** – Eine Fahrkarte nach Antigua, bitte.
- v0211 **¿Dónde está la parada?** – Wo ist die Haltestelle?
- v0212 **¿Este camión va al centro?** – Fährt dieser Bus ins Zentrum?
- v0213 **Lléveme al aeropuerto, por favor.** – Bringen Sie mich bitte zum Flughafen.
- v0214 **Perdí mi conexión.** – Ich habe meinen Anschluss verpasst.

</details>

<details>
<summary><b>Unterkunft</b> (38)</summary>

- v0011 **la habitación** – Zimmer, Raum
- v0012 **el hotel** – Hotel
- v0024 **vivir** – wohnen, leben
- v0226 **tener** – haben, besitzen
- v0227 **quedarse** – bleiben, übernachten
- v0228 **olvidar** – vergessen
- v0229 **reservar** – reservieren, buchen
- v0230 **funcionar** – funktionieren
- v0231 **limpiar** – putzen, reinigen
- v0232 **alojarse** – unterkommen, übernachten
- v0233 **la llave** – Schlüssel
- v0234 **el baño** – Bad, Badezimmer
- v0235 **la cama** – Bett
- v0236 **la puerta** – Tür
- v0237 **el wifi** – WLAN, Wi-Fi
- v0238 **la reservación** – Reservierung, Buchung
- v0239 **el hostal** – Hostal, einfache Pension
- v0240 **la contraseña** – Passwort
- v0241 **la recepción** – Rezeption
- v0242 **la toalla** – Handtuch
- v0243 **la ducha** – Dusche
- v0244 **el equipaje** – Gepäck
- v0245 **el ascensor** – Aufzug, Fahrstuhl _(Hinweis ergänzt: in Mexiko/Guatemala meist el elevador)_
- v0246 **el aire acondicionado** – Klimaanlage
- v0247 **el huésped** – Gast, Hotelgast
- v0248 **la almohada** – Kopfkissen
- v0249 **la sábana** – Bettlaken, Laken
- v0250 **el ventilador** – Ventilator
- v0251 **libre** – frei, verfügbar
- v0252 **ocupado** – besetzt, belegt
- v0253 **tranquilo** – ruhig
- v0254 **limpio** – sauber
- v0255 **descompuesto** – kaputt, defekt
- v0256 **incluido** – inklusive, inbegriffen
- v0257 **¿Tiene habitaciones libres?** – Haben Sie freie Zimmer?
- v0258 **La llave, por favor.** – Den Schlüssel, bitte.
- v0259 **¿Hay wifi en el hotel?** – Gibt es WLAN im Hotel?
- v0260 **Quisiera presentar una queja.** – Ich möchte mich beschweren.

</details>

<details>
<summary><b>Einkaufen & Geld</b> (40)</summary>

- v0013 **el mercado** – Markt
- v0014 **¿Cuánto cuesta?** – Was kostet das?
- v0276 **comprar** – kaufen
- v0277 **vender** – verkaufen
- v0278 **pagar** – bezahlen
- v0279 **costar** – kosten
- v0280 **regatear** – feilschen, handeln
- v0282 **gastar** – ausgeben
- v0283 **ahorrar** – sparen
- v0284 **mostrar** – zeigen
- v0285 **ofrecer** – anbieten
- v0286 **el dinero** – Geld
- v0287 **el precio** – Preis
- v0288 **la tienda** – Geschäft, Laden
- v0289 **el peso** – Peso
- v0290 **la moneda** – Münze
- v0291 **la tarjeta** – Karte, Kreditkarte
- v0292 **el efectivo** – Bargeld
- v0293 **la ropa** – Kleidung
- v0295 **el pantalón** – Hose
- v0296 **el zapato** – Schuh
- v0297 **el vestido** – Kleid
- v0298 **la talla** – Größe (Kleidung)
- v0299 **el descuento** – Rabatt, Preisnachlass
- v0300 **el recibo** – Quittung, Kassenbon
- v0301 **el cambio** – Wechselgeld
- v0302 **la ganga** – Schnäppchen
- v0303 **barato** – billig, günstig
- v0304 **caro** – teuer
- v0305 **rojo** – rot
- v0306 **azul** – blau
- v0307 **verde** – grün
- v0308 **negro** – schwarz
- v0309 **amarillo** – gelb
- v0310 **gratis** – gratis, kostenlos
- v0311 **¿Aceptan tarjeta?** – Nehmen Sie Karte?
- v0312 **¿Me hace un descuento?** – Geben Sie mir einen Rabatt?
- v0313 **Me lo llevo.** – Ich nehme es.
- v0314 **Solo estoy mirando.** – Ich schaue nur.
- v0315 **¿Tiene cambio de cien pesos?** – Haben Sie Wechselgeld für hundert Pesos?

</details>

<details>
<summary><b>Gesundheit & Notfall</b> (39)</summary>

- v0015 **la farmacia** – Apotheke
- v0016 **el médico** – Arzt
- v0326 **doler** – wehtun, schmerzen
- v0327 **sentirse** – sich fühlen
- v0328 **necesitar** – brauchen
- v0329 **ayudar** – helfen
- v0330 **toser** – husten
- v0331 **respirar** – atmen
- v0332 **vomitar** – sich übergeben, erbrechen
- v0333 **desmayarse** – ohnmächtig werden, in Ohnmacht fallen
- v0334 **la cabeza** – Kopf
- v0335 **la mano** – Hand
- v0336 **el brazo** – Arm
- v0337 **la pierna** – Bein
- v0338 **el dolor** – Schmerz, Schmerzen
- v0339 **la fiebre** – Fieber
- v0340 **la medicina** – Medizin, Medikament
- v0341 **el estómago** – Magen
- v0342 **la garganta** – Hals
- v0343 **el hospital** – Krankenhaus
- v0344 **la ambulancia** – Krankenwagen
- v0345 **la pastilla** – Tablette
- v0346 **la alergia** – Allergie
- v0347 **la tos** – Husten
- v0349 **la herida** – Wunde
- v0350 **la emergencia** – Notfall
- v0351 **el seguro** – Versicherung
- v0352 **enfermo** – krank
- v0353 **mareado** – schwindelig
- v0354 **alérgico** – allergisch
- v0355 **sano** – gesund
- v0356 **grave** – ernst, schwer
- v0357 **herido** – verletzt
- v0358 **¡Ayuda!** – Hilfe
- v0359 **Me duele la cabeza.** – Ich habe Kopfschmerzen
- v0360 **Me siento mal.** – Mir geht es schlecht
- v0361 **¿Dónde le duele?** – Wo tut es Ihnen weh
- v0362 **Llame a una ambulancia.** – Rufen Sie einen Krankenwagen
- v0363 **Tengo alergia a la penicilina.** – Ich bin allergisch gegen Penicillin

</details>

<details>
<summary><b>Natur & Wetter</b> (37)</summary>

- v0017 **el volcán** – Vulkan
- v0018 **la playa** – Strand
- v0376 **llover** – regnen
- v0377 **nevar** – schneien
- v0378 **brillar** – scheinen, glänzen
- v0379 **escalar** – klettern, besteigen
- v0380 **crecer** – wachsen
- v0381 **amanecer** – Tag werden, dämmern
- v0383 **la luna** – Mond
- v0384 **el mar** – Meer
- v0385 **el río** – Fluss
- v0386 **el árbol** – Baum
- v0387 **la lluvia** – Regen
- v0388 **la flor** – Blume
- v0389 **el viento** – Wind
- v0390 **el cielo** – Himmel
- v0391 **el lago** – See
- v0392 **la montaña** – Berg, Gebirge
- v0393 **la selva** – Dschungel, Urwald
- v0394 **la tortuga** – Schildkröte
- v0395 **el jaguar** – Jaguar
- v0396 **el quetzal** – Quetzal
- v0397 **la nube** – Wolke
- v0398 **la isla** – Insel
- v0401 **caliente** – heiß, warm
- v0402 **frío** – kalt
- v0403 **alto** – hoch, groß (Person)
- v0404 **húmedo** – feucht, schwül
- v0405 **nublado** – bewölkt
- v0406 **soleado** – sonnig
- v0407 **seco** – trocken
- v0408 **tropical** – tropisch
- v0409 **salvaje** – wild
- v0410 **templado** – mild, gemäßigt
- v0411 **Hace calor.** – Es ist heiß.
- v0412 **¿Qué tiempo hace?** – Wie ist das Wetter?
- v0425 **la estrella** – Stern

</details>

<details>
<summary><b>Orte & Wegbeschreibung</b> (42)</summary>

- v0426 **doblar** – abbiegen, biegen
- v0427 **cruzar** – überqueren, kreuzen
- v0428 **quedar** – liegen, sich befinden
- v0429 **seguir** – folgen, weitergehen, weiterfahren
- v0430 **perderse** – sich verlaufen, sich verirren
- v0431 **recorrer** – durchqueren, abfahren, bereisen
- v0432 **la ciudad** – Stadt
- v0433 **la calle** – Straße
- v0434 **la plaza** – Platz
- v0435 **el banco** – Bank
- v0436 **el parque** – Park
- v0437 **el centro** – Zentrum, Innenstadt
- v0438 **la iglesia** – Kirche
- v0439 **la dirección** – Adresse, Richtung
- v0440 **el mapa** – Karte, Stadtplan
- v0441 **la esquina** – Ecke, Straßenecke
- v0442 **la cuadra** – Häuserblock, Straßenblock
- v0443 **el barrio** – Stadtviertel, Viertel
- v0444 **el pueblo** – Dorf, Kleinstadt
- v0445 **la avenida** – Allee, Hauptstraße
- v0446 **el puente** – Brücke
- v0447 **el correo** – Post, Postamt
- v0448 **el edificio** – Gebäude
- v0449 **la biblioteca** – Bibliothek
- v0450 **la embajada** – Botschaft
- v0451 **la catedral** – Kathedrale, Dom
- v0452 **la banqueta** – Bürgersteig, Gehweg
- v0453 **la distancia** – Entfernung, Distanz
- v0454 **cerca** – nah, in der Nähe
- v0455 **lejos** – weit, weit weg
- v0456 **derecho** – geradeaus
- v0457 **allá** – dort, dorthin
- v0458 **enfrente** – gegenüber
- v0459 **al lado** – daneben, nebenan
- v0460 **detrás** – hinten, dahinter
- v0461 **hacia** – in Richtung, nach … hin
- v0462 **céntrico** – zentral gelegen, zentral
- v0463 **peatonal** – für Fußgänger
- v0464 **a la derecha** – rechts, nach rechts
- v0465 **a la izquierda** – links, nach links
- v0466 **¿Dónde queda…?** – Wo liegt …?, Wo befindet sich …?
- v0467 **¿Cómo llego a…?** – Wie komme ich zu …?

</details>

<details>
<summary><b>Kultur & Feste</b> (38)</summary>

- v0476 **celebrar** – feiern
- v0477 **bailar** – tanzen
- v0478 **cantar** – singen
- v0479 **jugar** – spielen
- v0480 **tocar** – spielen (Instrument), berühren
- v0481 **pintar** – malen
- v0482 **ganar** – gewinnen
- v0483 **rezar** – beten
- v0484 **la fiesta** – Fest, Party
- v0485 **la música** – Musik
- v0486 **el baile** – Tanz
- v0487 **la canción** – Lied
- v0488 **el partido** – Spiel (Wettkampf)
- v0489 **la bandera** – Flagge, Fahne
- v0490 **el desfile** – Umzug, Parade
- v0491 **el mariachi** – Mariachi (Musiker und Musikgruppe)
- v0492 **la marimba** – Marimba
- v0493 **la piñata** – Piñata
- v0494 **la máscara** – Maske
- v0495 **la artesanía** – Kunsthandwerk
- v0496 **el huipil** – Huipil (traditionelle Bluse der Maya-Frauen)
- v0497 **la ofrenda** – Opfergabe, Altargabe
- v0498 **la calavera** – Totenkopf
- v0499 **la posada** – Posada (Weihnachtsfest vor Heiligabend)
- v0500 **la procesión** – Prozession
- v0501 **la lucha libre** – Lucha libre (mexikanisches Wrestling)
- v0502 **tradicional** – traditionell
- v0503 **popular** – beliebt, volkstümlich
- v0504 **colorido** – bunt
- v0505 **religioso** – religiös
- v0506 **artesanal** – handwerklich, kunsthandwerklich
- v0507 **católico** – katholisch
- v0508 **¡Viva México!** – Es lebe Mexiko!
- v0509 **¡Feliz Navidad!** – Frohe Weihnachten!
- v0510 **¡Feliz Año Nuevo!** – Frohes neues Jahr!
- v0511 **¡Qué bonita música!** – Was für schöne Musik!
- v0512 **¿Hay una fiesta hoy?** – Gibt es heute ein Fest?
- v0513 **El Día de Muertos es el dos de noviembre.** – Der Día de Muertos ist am zweiten November.

</details>

<details>
<summary><b>Maya & Geschichte</b> (36)</summary>

- v0019 **la pirámide** – Pyramide
- v0020 **el maíz** – Mais
- v0526 **la historia** – Geschichte
- v0527 **el templo** – Tempel
- v0528 **la piedra** – Stein
- v0529 **el dios** – Gott
- v0530 **el rey** – König
- v0531 **el libro** – Buch
- v0532 **la lengua** – Sprache, Zunge
- v0533 **el calendario** – Kalender
- v0534 **la guerra** – Krieg
- v0535 **las ruinas** – Ruinen
- v0536 **el sacerdote** – Priester
- v0537 **la diosa** – Göttin
- v0538 **el jeroglífico** – Hieroglyphe, Schriftzeichen
- v0539 **el idioma** – Sprache
- v0540 **el conquistador** – Eroberer
- v0541 **el sacrificio** – Opfer, Opfergabe
- v0542 **la conquista** – Eroberung
- v0543 **el códice** – Kodex, Handschrift
- v0544 **el imperio** – Reich
- v0545 **la colonia** – Kolonie
- v0546 **construir** – bauen, errichten
- v0547 **conquistar** – erobern
- v0548 **adorar** – anbeten, verehren
- v0549 **gobernar** – regieren, herrschen
- v0550 **descubrir** – entdecken
- v0551 **desaparecer** – verschwinden
- v0552 **antiguo** – alt, antik
- v0553 **antes** – vorher, früher
- v0554 **entre** – zwischen, unter
- v0555 **sagrado** – heilig
- v0556 **durante** – während
- v0557 **maya** – Maya-, der Maya
- v0558 **¿Cuándo se construyó esta pirámide?** – Wann wurde diese Pyramide gebaut?
- v0559 **¡Qué antigua es esta ciudad!** – Was für eine alte Stadt!

</details>

<details>
<summary><b>Smalltalk & Alltag</b> (49)</summary>

- v0021 **¿Cómo te llamas?** – Wie heißt du?
- v0022 **hablar** – sprechen, reden
- v0576 **ser** – sein
- v0577 **estar** – sein, sich befinden
- v0578 **ir** – gehen, fahren
- v0579 **querer** – wollen, mögen
- v0580 **poder** – können, dürfen
- v0581 **hacer** – machen, tun
- v0582 **llamarse** – heißen, sich nennen
- v0583 **gustar** – gefallen, mögen
- v0584 **saber** – wissen, können
- v0585 **decir** – sagen, sprechen
- v0586 **venir** – kommen
- v0587 **ver** – sehen, ansehen
- v0588 **dar** – geben, schenken
- v0589 **entender** – verstehen
- v0590 **creer** – glauben, denken
- v0591 **la familia** – Familie
- v0593 **el hermano** – Bruder
- v0594 **la madre** – Mutter
- v0595 **el hijo** – Sohn, Kind
- v0596 **el pasatiempo** – Hobby, Freizeitbeschäftigung
- v0597 **la opinión** – Meinung
- v0598 **el sentimiento** – Gefühl, Empfindung
- v0599 **yo** – ich
- v0600 **usted** – Sie (höflich)
- v0601 **pero** – aber
- v0602 **porque** – weil
- v0603 **también** – auch
- v0604 **contento** – zufrieden, froh
- v0605 **cansado** – müde
- v0606 **tampoco** – auch nicht, ebenfalls nicht
- v0607 **aunque** – obwohl, auch wenn _(„auch wenn“ ergänzt)_
- v0608 **mientras** – während, solange
- v0609 **Soy de Alemania.** – Ich komme aus Deutschland.
- v0610 **No entiendo.** – Ich verstehe nicht.
- v0611 **¿De dónde es usted?** – Woher kommen Sie?
- v0612 **¿Me puede repetir?** – Können Sie das wiederholen?
- v0613 **Más despacio, por favor.** – Bitte langsamer.
- v0614 **¿Cómo se dice … en español?** – Wie sagt man … auf Spanisch?
- v0615 **¿Qué significa…?** – Was bedeutet …?
- v0616 **Me encanta cocinar.** – Ich liebe es zu kochen., Kochen gefällt mir sehr.
- v0617 **Tengo dos hermanos.** – Ich habe zwei Geschwister., Ich habe zwei Brüder.
- v0618 **¿A qué se dedica?** – Was machen Sie beruflich?
- v0619 **Estoy de acuerdo.** – Ich bin einverstanden.
- v0620 **No estoy de acuerdo.** – Ich bin nicht einverstanden.
- v0621 **En mi opinión…** – Meiner Meinung nach …
- v0622 **¡Qué pena!** – Wie schade!
- v0623 **Depende.** – Das kommt darauf an.

</details>

<details>
<summary><b>Grundwortschatz (häufigste Wörter)</b> (286)</summary>

- v0626 **poner** – legen, stellen, setzen
- v0627 **pensar** – denken, meinen
- v0628 **sentir** – fühlen, spüren, bedauern
- v0629 **conocer** – kennen, kennenlernen
- v0630 **encontrar** – finden, treffen
- v0631 **llevar** – tragen, bringen, mitnehmen
- v0632 **dejar** – lassen, verlassen, aufhören
- v0633 **pasar** – passieren, vorbeigehen, verbringen
- v0634 **volver** – zurückkehren, wiederkommen
- v0635 **traer** – bringen, mitbringen
- v0636 **leer** – lesen
- v0637 **escribir** – schreiben
- v0638 **abrir** – öffnen, aufmachen
- v0639 **mirar** – ansehen, anschauen
- v0640 **buscar** – suchen
- v0641 **trabajar** – arbeiten
- v0642 **entrar** – eintreten, hineingehen
- v0643 **preguntar** – fragen
- v0644 **recibir** – erhalten, empfangen
- v0645 **perder** – verlieren, verpassen
- v0647 **parecer** – scheinen, aussehen, vorkommen
- v0648 **deber** – müssen, sollen, schulden
- v0649 **contar** – erzählen, zählen
- v0650 **oír** – hören _(überflüssigen Futur-Override entfernt (Generator korrigiert))_
- v0651 **caer** – fallen, hinfallen
- v0652 **morir** – sterben
- v0653 **recordar** – sich erinnern, erinnern
- v0654 **tratar** – versuchen, behandeln
- v0655 **aparecer** – erscheinen, auftauchen
- v0656 **comenzar** – beginnen, anfangen
- v0657 **sacar** – herausnehmen, holen, machen
- v0658 **acabar** – beenden, enden, ausgehen
- v0659 **aceptar** – annehmen, akzeptieren
- v0660 **explicar** – erklären
- v0661 **permitir** – erlauben, ermöglichen
- v0662 **ocurrir** – geschehen, sich ereignen, einfallen
- v0663 **conseguir** – erreichen, bekommen, schaffen
- v0664 **comprender** – verstehen, begreifen
- v0665 **mantener** – halten, beibehalten, unterhalten
- v0666 **obtener** – erhalten, erlangen
- v0667 **convertir** – umwandeln, verwandeln
- v0668 **producir** – produzieren, herstellen, verursachen
- v0669 **resultar** – sich ergeben, sich herausstellen, sein
- v0670 **considerar** – betrachten, erwägen, halten für
- v0671 **formar** – bilden, gestalten
- v0672 **partir** – teilen, aufbrechen, abreisen
- v0674 **suponer** – annehmen, vermuten
- v0675 **lograr** – erreichen, gelingen
- v0676 **estudiar** – lernen, studieren
- v0677 **escuchar** – hören, zuhören
- v0678 **usar** – benutzen, verwenden
- v0679 **caminar** – gehen, spazieren, laufen
- v0680 **aprender** – lernen
- v0681 **cerrar** – schließen, zumachen
- v0682 **lavar** – waschen
- v0683 **correr** – rennen, laufen
- v0684 **responder** – antworten
- v0685 **preferir** – bevorzugen, lieber mögen
- v0686 **nacer** – geboren werden
- v0687 **intentar** – versuchen
- v0688 **repetir** – wiederholen
- v0689 **cuidar** – aufpassen auf, pflegen
- v0690 **llorar** – weinen
- v0692 **amar** – lieben
- v0693 **mandar** – schicken, senden
- v0694 **compartir** – teilen
- v0695 **decidir** – entscheiden, beschließen
- v0696 **reconocer** – erkennen, anerkennen
- v0697 **alcanzar** – erreichen, reichen
- v0698 **dirigir** – leiten, lenken
- v0699 **utilizar** – verwenden, nutzen
- v0700 **cumplir** – erfüllen, einhalten
- v0701 **imaginar** – sich vorstellen
- v0702 **elegir** – wählen, auswählen
- v0704 **soñar** – träumen
- v0705 **enseñar** – lehren, zeigen
- v0706 **escoger** – auswählen, aussuchen
- v0707 **entregar** – abgeben, aushändigen
- v0708 **cortar** – schneiden, abschneiden
- v0709 **ocupar** – belegen, einnehmen
- v0710 **sufrir** – leiden
- v0712 **gritar** – schreien, rufen
- v0713 **evitar** – vermeiden
- v0714 **mejorar** – verbessern, besser werden
- v0715 **perdonar** – verzeihen, entschuldigen
- v0716 **depender** – abhängen
- v0717 **discutir** – diskutieren, streiten
- v0718 **quitar** – wegnehmen, entfernen
- v0719 **mencionar** – erwähnen
- v0720 **avisar** – Bescheid geben, benachrichtigen
- v0721 **prometer** – versprechen
- v0722 **invitar** – einladen
- v0723 **acompañar** – begleiten
- v0724 **odiar** – hassen
- v0725 **pertenecer** – gehören zu, angehören
- v0726 **levantarse** – aufstehen, sich erheben
- v0727 **acostarse** – sich hinlegen, schlafen gehen
- v0728 **sentarse** – sich setzen
- v0729 **vestirse** – sich anziehen
- v0730 **ducharse** – duschen, sich duschen _(Hinweis ergänzt: in Mexiko meist bañarse)_
- v0731 **lavarse** – sich waschen
- v0732 **bañarse** – baden, sich baden _(Hinweis ergänzt: in Mexiko auch „duschen“)_
- v0733 **llamar** – rufen, anrufen
- v0734 **apagar** – ausschalten, löschen
- v0735 **encender** – anschalten, anzünden
- v0736 **regalar** – schenken
- v0737 **devolver** – zurückgeben, zurückbringen
- v0738 **visitar** – besuchen
- v0739 **contestar** – antworten, beantworten
- v0740 **descansar** – sich ausruhen, ausruhen
- v0741 **dormir** – schlafen
- v0743 **acordarse** – sich erinnern
- v0744 **guardar** – aufbewahren, speichern, wegräumen
- v0745 **besar** – küssen
- v0746 **divertirse** – sich amüsieren, Spaß haben
- v0747 **preocuparse** – sich Sorgen machen
- v0748 **quejarse** – sich beschweren, klagen
- v0749 **enojarse** – wütend werden, sich ärgern
- v0750 **casarse** – heiraten
- v0752 **acercarse** – sich nähern, herankommen
- v0753 **irse** – weggehen, gehen, abreisen
- v0754 **abrazar** – umarmen
- v0755 **tirar** – werfen, wegwerfen, ziehen
- v0756 **empujar** – schieben, drücken
- v0757 **pegar** – schlagen, kleben
- v0758 **romper** – zerbrechen, kaputt machen
- v0759 **prestar** – leihen, ausleihen
- v0760 **recoger** – abholen, aufheben, einsammeln
- v0761 **esconder** – verstecken
- v0762 **apoyar** – unterstützen, anlehnen
- v0763 **crear** – erschaffen, erstellen
- v0764 **conducir** – fahren, lenken
- v0765 **quitarse** – ausziehen, ablegen
- v0766 **faltar** – fehlen, versäumen
- v0767 **importar** – wichtig sein, ausmachen, importieren
- v0768 **interesar** – interessieren
- v0769 **molestar** – stören, ärgern
- v0770 **encantar** – begeistern, sehr gefallen
- v0771 **mentir** – lügen
- v0772 **medir** – messen
- v0773 **quemar** – verbrennen, anbrennen
- v0774 **sorprender** – überraschen
- v0775 **mudarse** – umziehen
- v0776 **el tiempo** – Zeit, Wetter
- v0777 **la vida** – Leben
- v0778 **la casa** – Haus, Zuhause
- v0779 **la gente** – Leute, Menschen
- v0780 **el trabajo** – Arbeit, Job
- v0781 **la mujer** – Frau, Ehefrau
- v0782 **el hombre** – Mann, Mensch
- v0783 **la cosa** – Sache, Ding
- v0784 **el mundo** – Welt
- v0785 **el país** – Land, Staat
- v0787 **el nombre** – Name
- v0788 **la persona** – Person, Mensch
- v0789 **el niño** – Junge, Kind
- v0790 **la niña** – Mädchen
- v0791 **el padre** – Vater
- v0792 **la cara** – Gesicht
- v0793 **el ojo** – Auge
- v0794 **el cuerpo** – Körper
- v0795 **la escuela** – Schule
- v0796 **el lugar** – Ort, Platz
- v0797 **el momento** – Moment, Augenblick
- v0799 **el caso** – Fall
- v0800 **la manera** – Art, Weise
- v0801 **la palabra** – Wort
- v0802 **el coche** – Auto, Wagen
- v0803 **la pregunta** – Frage
- v0804 **la respuesta** – Antwort
- v0805 **el grupo** – Gruppe
- v0806 **el final** – Ende, Schluss
- v0807 **la boca** – Mund
- v0808 **el pie** – Fuß
- v0809 **la carta** – Brief, Speisekarte
- v0810 **la película** – Film
- v0811 **el ejemplo** – Beispiel
- v0812 **el número** – Nummer, Zahl
- v0813 **la vez** – Mal
- v0814 **el lado** – Seite
- v0815 **la hija** – Tochter
- v0816 **el gobierno** – Regierung
- v0817 **la empresa** – Unternehmen, Firma
- v0818 **la sociedad** – Gesellschaft
- v0819 **el programa** – Programm, Sendung
- v0820 **la política** – Politik
- v0821 **la ley** – Gesetz
- v0822 **la economía** – Wirtschaft
- v0823 **el estado** – Staat, Bundesstaat, Zustand
- v0825 **el proyecto** – Projekt, Vorhaben
- v0826 **bueno** – gut
- v0827 **malo** – schlecht, schlimm
- v0828 **grande** – groß
- v0829 **pequeño** – klein
- v0830 **nuevo** – neu
- v0831 **viejo** – alt
- v0832 **mucho** – viel, sehr viel
- v0833 **poco** – wenig
- v0834 **mejor** – besser, beste
- v0835 **peor** – schlechter, schlimmer
- v0836 **largo** – lang
- v0837 **corto** – kurz
- v0838 **feliz** – glücklich, froh
- v0839 **triste** – traurig
- v0841 **feo** – hässlich
- v0842 **fácil** – leicht, einfach
- v0843 **difícil** – schwierig, schwer
- v0844 **el futuro** – Zukunft
- v0845 **la idea** – Idee, Einfall
- v0846 **joven** – jung
- v0847 **mismo** – gleich, selbe, selbst
- v0848 **mayor** – älter, größer, älteste
- v0849 **menor** – jünger, kleiner, geringer
- v0850 **importante** – wichtig
- v0851 **posible** – möglich
- v0852 **necesario** – notwendig, nötig
- v0853 **diferente** – anders, verschieden
- v0854 **igual** – gleich, egal
- v0855 **único** – einzig, einzigartig
- v0856 **solo** – allein, einsam
- v0857 **fuerte** – stark, laut, kräftig
- v0858 **débil** – schwach
- v0859 **listo** – bereit, schlau, fertig
- v0860 **claro** – klar, hell
- v0861 **el pasado** – Vergangenheit
- v0862 **la diferencia** – Unterschied
- v0863 **el resultado** – Ergebnis, Resultat
- v0864 **la necesidad** – Notwendigkeit, Bedürfnis, Not
- v0865 **la posibilidad** – Möglichkeit
- v0866 **cierto** – sicher, wahr, gewiss
- v0867 **propio** – eigen
- v0869 **último** – letzter, neuester
- v0870 **general** – allgemein
- v0871 **social** – sozial, gesellschaftlich
- v0872 **político** – politisch
- v0873 **la libertad** – Freiheit
- v0874 **la esperanza** – Hoffnung
- v0875 **el sentido** – Sinn, Bedeutung, Richtung
- v0876 **que** – dass, der/die/das (Relativpronomen)
- v0878 **sin** – ohne
- v0879 **para** – für, um zu
- v0880 **por** – durch, wegen, pro
- v0881 **muy** – sehr
- v0882 **más** – mehr, plus
- v0883 **bien** – gut, wohl
- v0884 **mal** – schlecht, schlimm
- v0885 **aquí** – hier, hierher
- v0886 **qué** – was, welche(r)
- v0887 **cómo** – wie
- v0888 **sobre** – über, auf
- v0889 **desde** – seit, von ... an
- v0890 **hasta** – bis, sogar
- v0891 **cuando** – wenn, als
- v0892 **donde** – wo
- v0893 **quién** – wer
- v0894 **cuánto** – wie viel
- v0895 **menos** – weniger, minus
- v0896 **ya** – schon, bereits, jetzt
- v0897 **nunca** – nie, niemals
- v0898 **nada** – nichts
- v0899 **segundo** – zweiter, Sekunde
- v0900 **según** – laut, gemäß
- v0901 **todavía** – noch, immer noch
- v0902 **casi** – fast, beinahe
- v0903 **quizás** – vielleicht
- v0904 **además** – außerdem, zudem
- v0905 **cada** – jeder, je
- v0906 **por ejemplo** – zum Beispiel
- v0907 **a veces** – manchmal
- v0908 **tener que + infinitivo** – müssen
- v0909 **hay que + infinitivo** – man muss, es ist nötig
- v0910 **ir a + infinitivo** – werden (Nahzukunft), vorhaben zu
- v0911 **tal vez** – vielleicht
- v0912 **otra vez** – noch einmal, wieder
- v0913 **¿Por qué?** – Warum?
- v0914 **por eso** – deshalb, darum
- v0915 **por lo menos** – wenigstens, mindestens
- v0916 **de repente** – plötzlich
- v0917 **de nuevo** – erneut, wieder
- v0918 **al final** – am Ende, schließlich
- v0919 **en seguida** – sofort, gleich
- v0920 **hace falta** – es fehlt, es ist nötig
- v0921 **de verdad** – wirklich, echt
- v0922 **sin embargo** – jedoch, trotzdem
- v0923 **a pesar de** – trotz
- v0924 **en cambio** – dagegen, hingegen

</details>

## Quellen der Websuche

- [El Financiero: Temblor, sismo y terremoto, ¿cuál es la diferencia?](https://www.elfinanciero.com.mx/ciencia/2022/09/15/temblor-sismo-y-terremoto-cual-es-la-diferencia/)
- [Expansión: Diferencia entre sismo y terremoto](https://politica.expansion.mx/mexico/2022/09/20/diferencia-entre-sismo-y-terremoto)
- [ADN40: Diferencia sismo/terremoto (SSN)](https://www.adn40.mx/mexico/diferencia-sismo-terremoto-sga)
- [AGN Guatemala: Influenza, resfriado o COVID-19](https://agn.gt/aumentan-casos-de-influenza-resfriado-o-covid-19) (Sprachgebrauch „gripe“, „catarro“ in Guatemala)
- [Prensa Libre: Thema Gripe](https://www.prensalibre.com/tema/gripe/)
- [Vocabulary.com: secador](https://www.vocabulary.com/dictionary/es/secador) (kein Beleg für „Wäscheständer“)
