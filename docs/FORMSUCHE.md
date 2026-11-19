# Palabrita – Anforderung: Formsuche im Verzeichnis

**Status:** Anforderung aufgenommen (2026-11-19), noch nicht spezifiziert. Die Spezifikation folgt; danach Aufnahme in `docs/SPEC.md` und Aufgaben in `docs/TASKS.md`.

**Anlass:** Während der Reise in Mexiko stößt der Nutzer auf Wörter, die er nicht versteht. Oft sind es gebeugte Formen (z. B. *podemos*), deren Grundform er kennt oder lernen will. Die Verzeichnissuche soll solche Formen finden und zur Grundform führen.

## 1. Ziel

Die Suche im Verzeichnis findet auch **gebeugte Formen** aller Vokabeln, die in der lokalen Datenbank stehen. Ein Treffer zeigt, dass es sich um eine Form handelt, zu welchem Wort sie gehört und welche Form es ist. Von dort geht es in die Konjugation bzw. in die Detailansicht.

## 2. Anforderungen

### 2.1 Gebeugte Formen finden
- Die Suche durchsucht neben den Grundformen (`es`) auch alle Formen, die aus der Datenbank bekannt sind:
  - **Verben:** alle Formen, die die Konjugation erzeugt (Präsens, Indefinido, Imperfecto, Futuro, Imperativ, Partizip, Gerundium; die Formen werden aus `tags` und `overrides` erzeugt, nicht gespeichert). Die Suche nutzt dieselbe Erzeugung wie die Konjugationsansicht.
  - **Nomen:** Pluralform (`plural`).
  - **Adjektive:** feminine und pluralische Formen (`adj.f`, `adj.pl`, `adj.fpl`).
- Beispiel: Suche *Podemos* → Treffer **poder**, Form: 1. Person Plural Präsens („wir können“).

### 2.2 Treffer darstellen
- Formtreffer erscheinen **direkt in der Trefferliste**, nicht versteckt.
- Ein Formtreffer ist **visuell als gebeugte Form erkennbar** (z. B. kleines Kennzeichen „Form“ bzw. „gebeugt“), ohne die Liste unübersichtlich zu machen.
- Jeder Formtreffer zeigt:
  - die gefundene Form (fett, wie eingegeben oder normalisiert),
  - die Grundform, die zur Vokabelkarte führt,
  - die grammatische Bezeichnung der Form in Deutsch (z. B. „1. Pl. Präsens“, „Pl. f.“, „Plural“).
- Antippen öffnet die Detailansicht der Grundform. Bei Verben geht es zur Konjugation, bei Nomen und Adjektiven zur Plural- bzw. Femininform.

### 2.3 Mehrdeutigkeit
- Eine Form kann zu mehreren Wörtern gehören. Alle Treffer werden gezeigt, jeweils mit ihrer Bezeichnung.
- Beispiele: *vamos* (ir, Präsens 1. Pl. und Imperativ 1. Pl.), *fue* (ser und ir, Indefinido 3. Sg.).
- Grundformen (direkte Treffer) stehen vor Formtreffern.

### 2.4 Gilt für alle Wortarten
- Dieselbe Logik für Verben, Nomen und Adjektive, also auch für „Substantiv im Plural“ und „Adjektiv feminin Plural“ usw.
- Beispiele: *canciones* → **canción** (Pl.); *buenas* → **bueno** (f. Pl.).

### 2.5 Sonstiges
- Die Suche funktioniert **offline**, ohne Netzanfrage. Alle Formen liegen lokal vor bzw. werden aus den lokalen Daten erzeugt.
- Die Suche bleibt schnell (Trefferanzeige beim Tippen, keine spürbare Verzögerung auf dem Handy).
- Die Suche ist für Mobilgeräte gebaut: Touch-Ziele ≥ 48 px, Hell- und Dunkelmodus, kein horizontales Scrollen.
- Keine neuen externen Anfragen, kein Tracking.

## 3. Beispiele (Soll)

| Eingabe | Erwarteter Treffer | Anzeige (sinngemäß) |
|---|---|---|
| `podemos` | poder | Form: 1. Pl. Präsens („wir können“) |
| `vamos` | ir | Form: 1. Pl. Präsens („wir gehen“) |
| `vamos` | ir | Form: 1. Pl. Imperativ („gehen wir!“) |
| `fue` | ser | Form: 3. Sg. Indefinido („war“) |
| `fue` | ir | Form: 3. Sg. Indefinido („ging“) |
| `canciones` | canción | Form: Plural („Lied“, Pl.) |
| `buenas` | bueno | Form: feminin Plural („gut“, f. Pl.) |
| `Poder` (Grundform) | poder | Grundform, kein Formhinweis |

*Die deutschen Bezeichnungen der Formen sind Beispiele und werden in der Spezifikation festgelegt.*

## 4. Offene Fragen für die Spezifikation

1. **Umfang der Verbformen:** Reicht die Konjugation der Zeiten aus §2.1, oder kommen Pronomen-Formen dazu (*me*, *te*, *se*; *dámelo*)?
2. **Schreibweise:** Ist die Suche unabhängig von Akzenten und Groß-/Kleinschreibung (*canción* ↔ *cancion*)? Vorschlag: ja.
3. **Niveaufilter:** Gilt das eingestellte maximale Niveau (SPEC §3.1) auch für Formtreffer? Vorschlag: ja, wie beim Verzeichnis.
4. **Vollständigkeit der Daten:** Für welche Adjektive und Nomen sind Formen hinterlegt (`adj`, `plural`)? Fehlende Formen müssen ergänzt oder erzeugt werden. Die Spezifikation legt fest, ob Nomen-/Adjektivformen aus Regeln erzeugt werden.
5. **Kennzeichnung:** Welche Bezeichnung und welches Symbol zeigt den Formtreffer (Text „Form“, Icon, Farbe), und wie sieht das im Hell- und Dunkelmodus aus?
6. **Reihenfolge und Begrenzung:** Wie viele Formtreffer werden angezeigt, und wie werden sie sortiert (Grundform zuerst, dann nach Wortart oder Niveau)?
7. **Lernen aus der Suche:** Soll aus einem Formtreffer direkt die Karte gelernt bzw. zur Lernsitzung hinzugefügt werden können, oder reicht die Verlinkung zur Konjugation?

## 5. Technische Hinweise (vorläufig)

- Der Formenindex wird aus den vorhandenen Vokabeldaten (`public/vocab/`) und der bestehenden Konjugationslogik (`src/domain/conjugation/`) gebaut. Die Formen dürfen nicht von Hand in JSON geschrieben werden (AGENTS.md).
- Die Suchlogik gehört in die Domäne (`src/domain/`) und wird mit Vitest getestet. Die Anzeige liegt im Verzeichnis (`src/features/dictionary/`).
- Akzentnormalisierung ist vorhanden (`src/domain/conjugation/accent.ts`) und kann wiederverwendet werden.
- Bei Änderungen an Vokabeldaten: `npm run validate:vocab`.
- Abnahme vor dem Commit: `npm run lint`, `npm test`, `npm run build`.
