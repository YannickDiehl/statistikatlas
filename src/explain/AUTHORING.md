# Erklärungen schreiben: Leitfaden für die Bereiche

Dieser Leitfaden ist die Arbeitsgrundlage für alle, die Begriffe der freien Karte erklären (Bereichsagenten B1 bis B14 und alle, die später nachbessern). Er fasst die verbindliche Spezifikation `docs/superpowers/specs/2026-10-01-freie-karte-ausbau-alle-knoten-design.md` (Abschnitte 2 bis 4) zusammen und sagt, in welche Dateien was gehört.

Das Vorbild für Ton und Aufbau ist die Werkstatt **Streuung** (`src/explain/content/streuung.ts`). Der Dozent hat ihren Wortlaut mit „Perfekt! So für alles umsetzen“ gebilligt. Lies sie, bevor du den ersten Begriff schreibst. Die Muster der beiden neuen Vorlagen stehen in `src/explain/content/muster/` (`p-wert.ts` als Begriffskarte, `dummy.ts` als Tabellen-Werkzeug).

Publikum: Bachelorstudierende der Politikwissenschaft, viele mit Angst vor Mathematik. Sie sollen sich abgeholt fühlen, ohne dass Fachbegriffe oder Genauigkeit verloren gehen.

---

## 1. Welche Vorlage?

| Vorlage | `kind` | Wann | Kern | Muster |
|---|---|---|---|---|
| **Werkstatt** | `werkstatt` | Rechnung mit höchstens etwa sechs Schritten auf kleinen Beispieldaten (5 bis 8 Werte oder eine kleine Tabelle) | Formel als Navigator, Lernkarte je Schritt, Rechentabelle, Bild, Ausprobieren | `content/streuung.ts`, `content/mittel.ts`, `content/zusammenhang.ts` |
| **Formel als Satz** | `satz` | Formel, die man besser als Satz liest und mit Reglern erkundet (Intervalle, Prüfgrößen, Effektmaße) | Satz mit antippbaren Teilen, ein Regler je Zeichen, Vorgerechnet in Mini-Schritten | `content/standardfehler.ts` |
| **Werkzeug** | `tabelle` | Datenoperation mit mariposa (Labels, Umkodieren, Dummys, fehlende Werte, Import) | Fünf Personen vorher, die Operation in Schritten, nachher, der mariposa-Aufruf; eine Wahl verändert die Tabelle | `content/muster/dummy.ts` |
| **Begriffskarte** | `begriff` | Begriff ohne Rechenkern (Kausalität, Validität, Fehlerarten, p-Wert-Deutung, Skalenniveaus) | Stell dir vor …, Bausteine im Lernkartenformat, Ausprobieren, Probier es selbst, Was heißt das für dich? | `content/muster/p-wert.ts` |

`werkzeug` (Typ `RecodeTemplate`) ist die Sonderanfertigung für `recode` mit eigenem Regelparser. Neue Werkzeuge schreibst du als `tabelle` (Typ `TableTool`).

**Grenzfälle:** Entscheide nach dem, was Studierende tun sollen. Rechnen sie etwas Schritt für Schritt nach: Werkstatt. Verändern sie Zahlen und beobachten eine Formel: Formel als Satz. Verändern sie Daten: Werkzeug. Verstehen sie eine Idee: Begriffskarte. Begründe jeden Grenzfall in einem Satz in deinem Bericht.

Rechenbegriffe, die ein Schritt einer Werkstatt sind (zum Beispiel `add` oder `sqrt` in B12), bekommen eine **Schrittkarte** über `stepCards` statt einer eigenen Erklärung (Abschnitt 4).

---

## 2. Sprachleitfaden

Regeln mit [Test] prüft `src/explain/style.ts` automatisch (über die Inhaltstests, Abschnitt 7). Die übrigen prüft die Begutachtung. Alle Beispiele stammen aus der Streuung. „So nicht“ ist der frühere Pilotwortlaut, außer bei Regel 3: Dort ist es der gebilligte Wortlaut, den die Regel auf zwei Sätze kürzt.

### Regel 1: Erst die Handlung, dann der Name [Test]

Schritte heißen nach dem, was man tut. Der Fachbegriff folgt im Kasten „Das nennt man …“ mit Zeichen und Aussprache.

- So nicht: Schritt „Σ“ mit dem Kopf „Fachbegriff: Quadratsumme der Abweichungen“.
- So: Schritt „Alles zusammenzählen“; darunter „Das nennt man **Quadratsumme der Abweichungen** Σ, sprich „Sigma““.

Jeder Schritt hat `title`, `concept` (liefert den Fachbegriff) und `sym`; hat er kein Zeichen, steht `sym: ''`. Mit Zeichen ist `say` Pflicht.

### Regel 2: Fachbegriffe bleiben vollständig [Test]

Der Fachbegriff ist der Titel des verlinkten Begriffs in `src/domain/concepts.ts`. Du schreibst ihn nicht selbst hin, er kommt aus `concept`. Dazu kommt ein Satz „In der Fachsprache: …“ (`fach`), der genau ist.

- So: „Das nennt man **Korrigierte Stichprobenvarianz** s², sprich „s Quadrat“. In der Fachsprache: Die Quadratsumme geteilt durch die Freiheitsgrade n − 1 ergibt die Varianz s².“

### Regel 3: Kurz gesagt in höchstens zwei Sätzen [Test]

In Alltagswörtern, ohne Fachwort, das nicht daneben erklärt ist.

- So nicht (gebilligter Wortlaut, aber drei Sätze): „Die Standardabweichung sagt dir, wie weit die Antworten typischerweise von der Mitte entfernt sind. Kleine Zahl: alle nah beieinander. Große Zahl: weit verstreut.“
- So (dieselben Wörter, zwei Sätze): „Die Standardabweichung sagt dir, wie weit die Antworten typischerweise von der Mitte entfernt sind. Kleine Zahl: alle nah beieinander; große Zahl: weit verstreut.“

Datumsangaben und Ordnungszahlen vor Monaten und Ähnlichem („am 3. Oktober“, „der 20. Bundestag“, „im 3. Semester“) zählt der Test nicht als Satzende.

### Regel 4: Kurze Sätze, du-Form, aktive Verben, ein Gedanke pro Satz [Test: höchstens 25 Wörter]

Richtwert 20 Wörter je Satz in „Was passiert?“, „Kurz gesagt“ und „Warum?“.

- So nicht: „Das Quadrat macht jede Abweichung positiv, sodass sich nichts mehr aufhebt.“
- So: „Zwei Gründe: Plus und Minus heben sich nicht mehr auf. Und wer weit weg ist, zählt stärker, denn 2 wird zu 4, aber 4 wird zu 16.“

### Regel 5: Keine Abwertung des Schwierigen [Test]

Nicht „einfach“, „offensichtlich“, „trivial“, „natürlich“, „bekanntlich“, „leicht zu sehen“, auch nicht gebeugt oder abgeleitet („einfacher“, „offensichtlicher“, „trivialerweise“, „Natürliche …“). Erlaubt sind nur die Fachbegriffe in `ALLOWED_TERMS` (`src/explain/style.ts`): „einfache Zufallsstichprobe“, „einfache Zufallsauswahl“, „einfache lineare Regression“, „natürlicher Logarithmus“, „natürliche Zahl“, „natürliches Experiment“. Fehlt ein Fachbegriff, nenne ihn im Bericht.

- So nicht: „Warum nicht einfach die Abweichungen addieren, ohne Quadrat?“
- So: „Warum zählen wir nicht die Abstände selbst zusammen, ohne Quadrat?“

### Regel 6: Mut statt Prüfungsgefühl [Test für „Fast!“ und „Genau“]

- **Mut-Satz** zu Beginn jeder Werkstatt (`mut`): Die Formel in kleine, bekannte Handlungen zerlegen, daran erinnern, dass R rechnet. Vorbild: „Die Formel sieht nach viel aus. Sie besteht aber nur aus sechs kleinen Schritten, die du alle schon kannst: zusammenzählen, abziehen, malnehmen, teilen und am Ende die Wurzel ziehen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.“
- **Fortschritt** zeigt die Oberfläche selbst („Schritt 2 von 6, noch 4 kleine Schritte“).
- Fehler heißen **Aufgepasst** (`acht`), ermutigend formuliert.
  - So nicht: „Typischer Fehler: Durch n statt durch n − 1 teilen. Das ergäbe 40 / 5 = 8 statt 10.“
  - So: „Wer durch 5 teilt, bekommt 8 statt 10. Das passiert sehr vielen. Merksatz: Bei der Streuung teilst du durch n − 1.“
- **Rückmeldungen:** auf einen erkennbaren Fehler „Fast! …“, allgemein „Noch nicht ganz. …“, richtig „Genau, …“.
  - So nicht: „Du hast durch n = 5 geteilt. Die Formel teilt durch die Freiheitsgrade n − 1 = 4.“
  - So: „Fast! Du hast durch 5 geteilt. Bei der Streuung teilst du durch 4, also n − 1.“
  - Die Werkstatt setzt „Genau, {Wert}.“ und „Noch nicht ganz. Schau oben in die Rechnung, sie zeigt jeden Zwischenschritt.“ selbst; du schreibst nur die Diagnosen.
- **Kontrollfragen in Alltagssprache.**
  - So nicht: „Wie groß ist die Varianz s²?“
  - So: „Was kommt heraus, wenn du die Summe durch 4 teilst?“

### Regel 7: Zeichen erst, wenn sie gebraucht werden

Kein Zeichenblock vor dem ersten Schritt. Jedes Zeichen erscheint in dem Schritt, der es braucht; die Übersicht aller Zeichen (`glyphs`) zeigt die Oberfläche zugeklappt am Ende („Alle Zeichen auf einen Blick“).

### Regel 8: Konkret vor abstrakt

Erst Menschen und Zahlen (fünf Beispielpersonen, Lehrdatensatz, ALLBUS-Häufigkeiten), dann Bild, dann Zeichen, dann Fachbegriff.

- So nicht: „Zwei Gruppen stufen sich auf der Links-rechts-Skala ein. Beide haben denselben Mittelwert 5.“
- So: „Zwei Gruppen mit je fünf Personen sagen, wo sie sich politisch einordnen: von 1 (ganz links) bis 10 (ganz rechts). Beide Gruppen landen im Durchschnitt bei 5. Und doch sind sie ganz verschieden: …“

### Regel 9: Ergebnisse als Aussage über Menschen

Mit Einheit und höchstens zwei Nachkommastellen.

- So nicht: „Diese Gruppe ist sich eher uneinig, ähnlich wie Gruppe B.“
- So: „In Gruppe B liegen die Antworten typischerweise gut 3 Punkte von der Mitte entfernt. In Gruppe A sind es nur 0,71 Punkte: Dort sind sich fast alle einig. Gleicher Durchschnitt, ganz andere Gruppe.“

### Regel 10: Genauigkeit nach hinten, nicht weg

Feinheiten (Erwartungstreue, Annahmen, Grenzfälle, Rechenwege) stehen unter „Genau genommen“. Dort darfst du länger und fachlicher schreiben; die Regeln 5 und 11 gelten trotzdem.

- So: In „Warum?“ steht „Und warum minus eins? Damit die Streuung nicht zu klein geschätzt wird. Mehr dazu steht unter „Genau genommen“.“ Die Herleitung über die Freiheitsgrade steht unter „Genau genommen“.

### Regel 11: Kein Mittelpunkt als Trenner, echtes Minus [Test]

„·“ steht nur für „mal“: zwischen Zahlen und Zeichen („3 · 4“, „sₓ · sᵧ“) und zwischen einer Zahl und einem Wort („2 · Abstand“, „Summe · 2“). Nie als Trenner („Mittelwert · Varianz“, „Lernplanung · 5 Stufen“, „Schritt 2 · …“). Zwischen zwei Wörtern schreibst du „mal“ („Breite mal Höhe“), weil der Test „Wort · Wort“ als Trenner meldet.

Minus ist immer das echte „−“, nie der Bindestrich: „−4“ statt „-4“, „n − 1“ statt „n - 1“ oder „n-1“, „1 − α“ statt „1 - α“. Als Gedankenstrich dient „–“. Wörter mit Bindestrich („t-Test“, „z-Wert“, „Links-rechts-Skala“) bleiben erlaubt. `num()`, `signed()` und `paren()` setzen das richtige Minus von selbst.

### Regel 12: Beispiele aus der Lebenswelt

Wahlabsicht, Vertrauen in den Bundestag, Lernzeit, Miete. Keine Würfel- oder Urnenbeispiele, wo ein Beispiel aus den Daten passt.

### Schreibweise

- Deutsche Zahlen mit `num(v)` (höchstens zwei Nachkommastellen, echtes Minus), `signed(v)` für „+4“/„−4“, `paren(v)` für „(−4)“ in Produkten, `count(v)` für „5.225“, `fixed(v)` für feste Stellen, `pct(v)` für Prozent (alle in `src/explain/format.ts`). R-Ausgaben behalten ihr Format („p = 0.876“) und werden so gekennzeichnet („R meldet …“).
- Zahl mit Einheit über `unit(v, 'Punkt', 'Punkte')`: Bei genau 1 steht die Einzahl („1 Punkt“, „1 Stunde“), sonst die Mehrzahl („0,71 Punkte“).
- „≈“, wo gerundet wird. Rechnungen im Text gehen mit den sichtbaren Zahlen auf; wenn nicht, sag es („Mit allen Nachkommastellen kommt R auf 0,16.“).
- Anrede „du“. Fünf Beispielpersonen heißen „Fünf Beispielpersonen“ oder „fünf Personen“, ohne „(fiktiv)“.
- Aussprache (`say`) ohne Anführungszeichen schreiben: `say: 'x quer'`. Die Oberfläche setzt „sprich „x quer““.

---

## 3. Die Vorlagen im Einzelnen

Alle Typen stehen in `src/explain/types.ts`. Inhalte sind reines TypeScript ohne React. Texte, die von den Daten abhängen, sind Funktionen `(c: Ctx<S>) => string` (Typ `Text<S>`); `c.s` sind die Kennwerte, `c.who` die gewählte Person, `c.names` ihre Namen.

### 3.1 Werkstatt (`Workshop<D, S>`)

Aufbau auf dem Bildschirm (Spezifikation Ausbau, Abschnitt 3): Wofür, Kurz gesagt, Mut-Satz, Beispieldaten, Formel mit Schrittknöpfen, Lernkarte je Schritt, Rechentabelle, Bild, Probier es selbst, Was heißt das Ergebnis?, Mit der Formel denken, Genau genommen, Alle Zeichen auf einen Blick. Kompakt zeigt in der Lernkarte nur Was passiert?, Rechnung und Das nennt man.

| Feld | Inhalt |
|---|---|
| `id` | eindeutige Kennung, zum Beispiel `'zstand'`; Schrittkarten verweisen darauf |
| `wofuer` | Situation und Frage, konkret (Regel 8) |
| `mut` | Mut-Satz (Regel 6) |
| `picture` | Schlüssel deines Bildes im Register (Abschnitt 5), gebaut mit `forWorkshop` |
| `dataNote` | optional: Hinweis neben den Voreinstellungen; ohne ihn steht „Fünf Beispielpersonen. Die Punkte im Bild lassen sich ziehen.“ (die Zahl aus `names`). Setze ihn, wenn die Daten keine Personen sind oder sich nicht ziehen lassen |
| `names`, `bounds`, `presets` | Personen A bis E, Wertebereich für Ziehen und Pfeiltasten, Voreinstellungen (die erste ist der Start) |
| `compute(d)` | rechnet die Kennwerte `S` aus den Daten `D`; lege dort alle Zahlen ab, die Texte und Diagnosen brauchen |
| `glyphs` | Zeichenübersicht am Ende: `sym`, `say`, `term`, `plain`, `step` |
| `steps` | die Schritte (siehe unten) |
| `numeric(c, lastStep)` | eingesetzte Formel als `FNode[]`; `{ part: […], m: k }` koppelt einen Teil an Schritt k |
| `table` | Rechentabelle: Spalten mit `from` (erscheint ab Schritt), `active` (hervorgehoben), `cell`, `sum` |
| `captions` | Bildunterschrift je Schritt |
| `think` | Denkfragen mit `step` und optional `tryIt` (setzt passende Daten; bleibt innerhalb von `bounds`) |
| `variants` | je erklärtem Begriff: `lastStep`, `kurz`, `fachlich`, `symbolic`, `aria` (vorlesbare Formel), `metrics`, `interpret`, `next`, `genau` |

Ein Schritt (`Step<S>`):

| Feld | Inhalt | Regel |
|---|---|---|
| `button` | Zeichen auf dem Schrittknopf („xᵢ − x̄“) | |
| `title` | Handlung („Abstände messen“) | 1 |
| `sym`, `say` | Zeichen in „Das nennt man …“ und seine Aussprache; `''` ohne Zeichen | 1 |
| `concept` | verlinkter Begriff, liefert den Fachbegriff | 2 |
| `links` | weitere Begriffe des Schritts | |
| `perPerson` | Rechnung hängt von der gewählten Person ab (zeigt die Personenwahl) | |
| `was` | Was passiert? ein bis zwei Sätze | 4 |
| `rechnung` | die Rechnung für die gewählte Person, groß und in Serifenschrift; kurz, eher Formel als Satz | |
| `fach` | „In der Fachsprache: …“ (ohne diesen Vorspann schreiben) | 2 |
| `warum` | Warum? | 4 |
| `acht` | Aufgepasst: der typische Fehler, ermutigend | 6 |
| `alltag` | nur, wo ein Vergleich wirklich hilft | |
| `check` | `question` in Alltagssprache, `answer`, `diagnose` (nur „Fast! …“ oder `null`) | 6 |

Kontrollfragen: Richtig ist eine Antwort mit höchstens 0,011 Abstand (`TOLERANCE`); `'NA'` ist eine erlaubte Antwort, wenn etwas nicht definiert ist. `diagnose(c, v)` bekommt jede Lesart der Eingabe und liefert für die richtige Antwort `null`.

### 3.2 Formel als Satz (`SentenceTemplate<V, S>`)

Vorbild `content/standardfehler.ts`. `worked` sind Mini-Schritte mit einer Handlung als Titel; `fehler` erscheint als „Aufgepasst“; `check.right` beginnt mit „Genau“, `check.diagnose(v)` liefert immer einen Text, der mit „Fast!“ (erkennbarer Fehler) oder „Noch nicht ganz.“ beginnt. Je Zeichen ein Regler (`sliders`, `log: true` für Fallzahlen), `quick` für Kurzbefehle wie „n mal 4“. Optional `picture` (mit `forSentence`): Es steht über den Reglern und bekommt die Reglerwerte.

Die Zeichen (`glyphs`) erscheinen in der Karte „Das nennt man …“. Mit `concept` ist `term` der Titel dieses Begriffs in `concepts.ts` (Regel 2, der Test vergleicht beides), und die Karte verlinkt ihn. Gibt es keinen passenden Begriff in der Karte, lass `concept` weg; dann steht `term` ohne Link da (Beispiel: „Fallzahl“ n beim Standardfehler).

Der Test rechnet jede Formel als Satz bei den Startwerten, nach jedem Kurzbefehl (einmal und zweimal) und mit jedem Regler an beiden Enden durch; keine Zahl darf dort `NaN` werden.

### 3.3 Tabellen-Werkzeug (`TableTool`)

Vorbild `content/muster/dummy.ts`. Fünf Personen (`rows`, am besten echte Befragte aus dem Lehrdatensatz), eine Wahl (`options`), die die Operation verändert, die Operation in zwei bis vier `steps`, `apply(rows, option)` für die Tabelle nachher (neue Spalten hebt die Oberfläche hervor und nennt sie in einer vorgelesenen Zeile), `rCode(option)` mit dem mariposa-Aufruf (Abschnitt 6), eine Zahlfrage (`check`) und Denkfragen (`think`). Optional `picture` (mit `forTable`): Es steht nach der Tabelle „Nachher“. Kompakt zeigt Kurz gesagt, die Wahl, die Schritte mit Was passiert? und Das nennt man, beide Tabellen, das Bild und den R-Code.

Ein Schritt ohne `concept` und ohne `sym` zeigt nur „In der Fachsprache: …“, ohne „Das nennt man“; mit `concept` steht der Fachbegriff aus der Karte da.

### 3.4 Begriffskarte (`ConceptCard`)

Vorbild `content/muster/p-wert.ts`. Reihenfolge: `wofuer`, `kurz`, `stellDirVor` (ein konkretes Beispiel mit Zahlen aus dem Lehrdatensatz oder aus ALLBUS-Aggregaten, optional `figures` als Kennzahlen), `heisst` (Zeichen, Aussprache, „In der Fachsprache“), zwei bis vier `bausteine` (Was passiert?, optional Rechnung, Warum?, Aufgepasst, `concept` als Link), `ausprobieren` (Denkfragen mit Vorhersage; `step` verweist auf einen Baustein), optional `regler` (`describe(v)` erklärt den Wert in einem Satz über Menschen), `check` (Auswahlfrage: genau eine richtige Antwort, `right` beginnt mit „Genau“, für **jede** falsche Antwort eine Rückmeldung in `diagnose`, die mit „Fast!“ oder „Noch nicht ganz.“ beginnt), `fuerDich` (Was heißt das für dich?), `genau`.

Optional `picture` (mit `forCard`): Das Bild steht nach „Stell dir vor …“ (Regel 8: erst Zahlen, dann Bild, dann Fachbegriff) und bekommt den aktuellen Wert des Reglers; der Regler steht dann direkt unter dem Bild statt unter „Ausprobieren“. Kompakt zeigt das Bild mit Regler. Vorbild: die t-Verteilung des p-Werts in `src/components/explain/pictures/muster.tsx`.

---

## 4. Dateien eines Bereichs

Du änderst nur Dateien deines Bereichs. Gemeinsame Dateien (`types.ts`, `registry.ts`, `style.ts`, `format.ts`, `content/index.ts`, `kit.tsx`, `explain.css`, die Inspector-Komponenten) bleiben unangetastet. Fehlt dir etwas im Fundament, überbrücke es in deinem Bereich und nenne es im Bericht.

```
src/explain/content/<bereich>/
  <begriff>.ts            je Begriff eine Datei (zum Beispiel validity.ts), exportiert die Erklärung
  index.ts                AreaIndex des Bereichs; wird automatisch eingelesen
  <bereich>.test.ts       R-Nachrechnung mit festen Referenzwerten (Abschnitt 6)
src/components/explain/pictures/<bereich>.tsx   Bilder deines Bereichs, für alle Vorlagen (Abschnitt 5)
src/explain/areas/<bereich>.css                 eigene Stile, falls nötig
```

`<bereich>` ist der Ordnername: `b01-messen`, `b02-datenwerkzeuge`, `b03-lage`, `b04-umformen`, `b05-zusammenhang`, `b06-wahrscheinlichkeit`, `b07-verteilungen`, `b08-schaetzen`, `b09-testlogik`, `b10-mittelwerte`, `b11-rangtests`, `b12-kategorial-design`, `b13-regression`, `b14-faktoren`.

Der Index trägt jede Erklärung unter ihrer Begriffs-ID ein:

```ts
// src/explain/content/b01-messen/index.ts
import type { AreaIndex } from '../../types';
import { validity } from './validity';
import { skalen } from './skalen';

export const b01Messen: AreaIndex = {
  explanations: {
    validity: { kind: 'begriff', card: validity },
    nominal: { kind: 'werkstatt', workshop: skalen, variant: 'nominal' },
  },
  tabs: {},          // Reiter je Begriff (Abschnitt 8)
  stepCards: {},     // Rechenbegriff → { workshop: '<Werkstatt-ID>', variant: '<Begriff>', step: k }
};
```

Eine Werkstatt, die mehrere Begriffe erklärt, steht einmal je Begriff im Index (mit derselben `workshop`-Konstante); `variant` ist immer der Begriff selbst, und `workshop.variants` hat einen Eintrag dafür. Ein Begriff darf nur in **einem** Bereich vorkommen.

Eine Schrittkarte (`stepCards[<id>] = { workshop, variant, step }`) zeigt auf eine registrierte Werkstatt, auf einen ihrer Begriffe und auf einen Schritt zwischen 1 und dessen `lastStep`. Der Begriff muss als diese Werkstatt erklärt sein, denn „Werkstatt öffnen“ springt dorthin. Die Rendertests zeigen jede Schrittkarte einmal an.

Beim Laden scheitert die Zuordnung mit einer Fehlermeldung, die Begriff und Bereich nennt: bei doppelten IDs, doppelten Werkstatt-Kennungen, einem falschen `variant`, einer Schrittkarte auf eine unbekannte Werkstatt, einen unbekannten Begriff oder einen Schritt außerhalb, einem Sprungziel ohne diese Werkstatt und bei Reitern für einen fremden Begriff. Die IDs der Pilotbegriffe (`mean`, `variance`, `sd`, `covariance`, `pearson`, `se`, `recode`, die Muster `p_value` und `dummy`) und ihre Schrittkarten (`sum`, `deviation`, `squared_deviation`, `ss`, `df`, `crossproduct`, `crossproduct_sum`, `sd_product`) sind vergeben. Reiter für `ss` darf B4 trotzdem eintragen (`tabs.ss`).

---

## 5. Bilder

Jede Vorlage kann ein Bild zeigen: Werkstätten immer (`Workshop.picture` ist Pflicht), Begriffskarten, Formel als Satz und Tabellen-Werkzeuge optional (`picture?`). Das Feld ist ein Schlüssel im Bild-Register `PICTURES` (`src/components/explain/pictures/register.ts`).

**Eintragen, ohne gemeinsame Dateien zu ändern:** Jeder Bereich hat schon seine Bilddatei `src/components/explain/pictures/<bereich>.tsx` mit einem leeren Objekt `pictures`. Trag dort deine Bilder ein; `pictures/areas.ts` liest die Datei ein, und `register.ts` führt alle Bereiche zum Register zusammen. Ein Schlüssel muss über alle Bereiche eindeutig sein (doppelte Schlüssel lassen das Laden scheitern), am besten mit deinem Bereich als Vorsilbe, etwa `b07-normal`.

Jedes Bild baust du mit der Hilfsfunktion seiner Vorlage. Sie legt fest, welche Werte das Bild bekommt; ein Bild der falschen Art erscheint nicht, und der Rendertest meldet es.

| Vorlage | Hilfsfunktion | Das Bild bekommt | Es steht |
|---|---|---|---|
| Werkstatt | `forWorkshop` | `PictureProps`: `workshop`, `data`, `s`, `step`, `who`, `setData`, `pickWho` | im Abschnitt „Das Bild dazu“ (in der breiten Werkbank links unter der Formel) |
| Begriffskarte | `forCard` | `CardPictureProps`: `card`, `value` (Wert des Reglers, ohne Regler `null`) | nach „Stell dir vor …“, der Regler direkt darunter |
| Formel als Satz | `forSentence` | `SentencePictureProps`: `template`, `values` (Reglerwerte), `s` (Kennwerte), `mark` (markiertes Zeichen) | über den Reglern |
| Tabellen-Werkzeug | `forTable` | `TablePictureProps`: `tool`, `option`, `before`, `after` (je `columns` und `rows`) | nach der Tabelle „Nachher“ |

Beispiel einer Begriffskarte mit Normalverteilung, deren Rand der Regler verschiebt:

```tsx
// src/components/explain/pictures/b07-verteilungen.tsx
import { AreaUnder, Axis, Curve, forCard, forWorkshop, linear, useWidth, type Picture } from './kit';

function Normal({ cut }: { cut: number }) {
  const [box, W] = useWidth();
  const x = linear([-4, 4], [40, W - 20]), y = linear([0, 0.42], [190, 20]);
  const f = (z: number) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  return <div ref={box}><svg className="xw-svg" width={W} height={230} viewBox={`0 0 ${W} 230`} role="img" aria-label={`Standardnormalverteilung, rechter Rand ab z = ${cut} markiert`}>
    <AreaUnder f={f} from={cut} to={4} x={x} y={y} tone="neg" />
    <Curve f={f} from={-4} to={4} x={x} y={y} />
    <Axis scale={x} ticks={[-3, -2, -1, 0, 1, 2, 3]} at={190} from={40} to={W - 20} title="z" />
  </svg></div>;
}

export const pictures: Record<string, Picture> = {
  'b07-normal': forCard(p => <Normal cut={p.value ?? 1.96} />),          // ConceptCard: picture: 'b07-normal'
  'b07-binomial': forWorkshop(p => <Binomial s={p.s} step={p.step} />),   // Workshop: picture: 'b07-binomial'
};
```

Vollständige Vorbilder: `pictures/pilot.tsx` (Werkstätten mit ziehbaren Punkten) und `pictures/muster.tsx` (t-Verteilung mit beiden Rändern zur Begriffskarte p-Wert). Ein Werkstattbild zeigt mit `step`, was bis zu diesem Schritt passiert ist, und meldet gezogene Werte mit `setData`.

Bausteine in `src/components/explain/pictures/kit.tsx` (alle in Bildschirmpixeln, Beispiele in `pictures/pilot.tsx`):

| Baustein | Zweck |
|---|---|
| `useWidth()` | misst die Breite (300 bis 640 px); `ref` an das umschließende `<div>` |
| `linear(domain, range)` | Datenwert → Pixel, mit `invert` |
| `useDrag(onMove)`, `DragPoint`, `keyStep`, `clamp` | ziehbare Punkte mit 20-px-Trefferkreis, Rolle „slider“, Pfeiltasten, Pos1 und Ende |
| `Axis` | Achse mit Ticks, waagerecht oder senkrecht, mit Titel |
| `Bar` | Balken, positiv grün, negativ braunrot, mit Beschriftung |
| `Curve`, `AreaUnder` | Kurve einer Funktion und Fläche darunter (Dichten, p-Wert-Ränder) |
| `MarkLine` | gestrichelte Bezugslinie (Mittelwert, kritischer Wert) |
| `GridCell` | Zelle einer Kreuztabelle oder Matrix, mit zweiter Zeile |

Regeln: Schrift nur über die Klasse `xw-t` (14 px), nie über `font-size`-Attribute und nie unter 13 px. Farbe ist nie der einzige Träger: Vorzeichen stehen als „+“/„−“ daneben. Jedes ziehbare Element ist per Tastatur bedienbar und hat einen Namen (`label`, bei zwei Achsen `valueText` und `describedBy`). Das `<svg>` hat `role="img"` mit `aria-label` oder, wenn es ziehbare Punkte enthält, `role="group"`.

**Eigene Stile** gehören nach `src/explain/areas/<bereich>.css`; `src/main.tsx` lädt alle Dateien dieses Ordners von selbst. Importiere die CSS-Datei **nicht** aus der Bilddatei: Die Rendertests laufen in Node, und dort bricht ein CSS-Import ab. Klassen beginnen mit deinem Bereich (`.b07-…`), Farben kommen aus den Atlas-Variablen (`--green`, `--xw-neg`, `--wash`, `--line`, `--muted`, `--ink`). `src/lib/typeScale.test.ts` prüft auch deine CSS-Datei auf Schrift unter 13 px.

---

## 6. Zahlen und R

**Jede Zahl** in Texten, Beispielen und Kontrollfragen ist in R nachgerechnet und als Test festgehalten (`content/<bereich>/<bereich>.test.ts`). Der R-Befehl steht im Kommentar, die Werte als Zusicherung. Vorbild: `content/muster/muster.test.ts`.

Die Daten für R: den Lehrdatensatz als `Statistikatlas-200-Befragte.sav` aus dem Atlas (Datensatz-Dialog, Knopf „SPSS-Datei (.sav)“) oder per Skript aus `createSurvey()` mit `writeSav()` aus `src/domain/savWriter.ts` (Aufgabe F2). Gelesen wird wie im R-Code der Studierenden mit `read_spss()`. Eine CSV aus `createSurvey()` liefert dieselben Werte, aber keine Wertelabels.

```ts
/*
 *   pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)
 *   library(dplyr)
 *   atlas <- read_spss("Statistikatlas-200-Befragte.sav")
 *   atlas %>% t_test(lernzeit, group = weiterbildung)   # t(175.8) = 0.156, p = 0.876
 */
test('B9: p-Wert der Lernzeit nach Weiterbildung wie in R', () => {
  assert.ok(close(pFor(0.07), 0.880639, 1e-6));
});
```

- Rechne dabei die Werte zusätzlich im Test aus den Daten nach (`createSurvey()`, `src/tasks/kit/means.ts`, `src/tasks/kit/dist.ts`), damit eine Änderung des Lehrdatensatzes auffällt.
- **ALLBUS nur als Aggregat** (Häufigkeiten, Mittelwerte), nie Mikrodaten im Repository, im Build oder in Fixtures. Die Datei liest du nur in R oder in Tests über `process.env.ALLBUS_SAV`.
- mariposa-Referenzversion ist **0.7.4** (Quellstand per `pkgload::load_all`), in allen sichtbaren Angaben.
- Höchstens zwei Nachkommastellen in Texten; R-Ausgaben behalten ihr Format und werden als R-Ausgabe kenntlich gemacht.

**R-Code** im Stil des Lernpfads (Spezifikation Lehrdatensatz, Abschnitt 7):

```r
library(dplyr)
library(mariposa)

atlas <- read_spss("Statistikatlas-200-Befragte.sav")

atlas <- atlas %>%
  mutate(abitur = rec(schulabschluss, rules = "4=1; 0,1,2,3=0"))
```

Pipe `%>%`, Spalten mit `mutate()`, Umkodieren mit `rec()` in `mutate()`. Nicht: `d$`, `d <- `, `factor(`, `ifelse(`, `read.csv2`. Codes in Regeln ausdrücklich nennen statt `else=0` (sonst werden fehlende Angaben still zu 0). Die Inhaltstests prüfen den R-Code jedes Tabellen-Werkzeugs auf diese Punkte.

---

## 7. Was die Tests automatisch prüfen

`src/explain/content.test.ts` und `src/explain/render.test.ts` laufen über **alle** registrierten Erklärungen, auch deine:

- alle Texte für alle Voreinstellungen, Begriffe und Personen ohne `NaN`, `undefined`, `Infinity`;
- `styleProblems` leer für jeden sichtbaren Text, auch Antwortoptionen, Rückmeldungen, Beschriftungen von Kennzahlen, Reglern und Kurzbefehlen (Regeln 5 und 11); „Was passiert?“ und „Warum?“ mit höchstens 25 Wörtern je Satz; „Kurz gesagt“ (Variante, Genau genommen, Denkfragen) mit höchstens zwei Sätzen; die Deutung mit höchstens drei;
- jede Erklärung gehört zu einem Begriff in `concepts.ts`, jeder `concept`- und `links`-Verweis existiert; bei Werkstätten ist `variant` der Begriff selbst;
- Formel als Satz: Zeichen mit `concept` tragen dessen Titel als `term` (Regel 2); alle Texte bleiben bei jedem Kurzbefehl und an beiden Enden jedes Reglers lesbar;
- `say` vorhanden, wenn `sym` nicht leer ist;
- Zahlfragen: die richtige Antwort bekommt keine Diagnose, jede Diagnose beginnt mit „Fast!“, und mindestens eine typische Fehlantwort löst eine aus. Der Test probiert dafür Zahlen aus deinen Kennwerten `S` und ihre Abwandlungen (Vorzeichen, mal und durch 2, ±1, mal 4/5 und 5/4, durch 4 und 5, Quadrat, Wurzel). Lege deshalb in `compute` die Zwischenergebnisse ab, die deine Diagnosen prüfen;
- Begriffskarten: zwei bis vier Bausteine, genau eine richtige Antwort, für jede falsche eine Rückmeldung mit „Fast!“ oder „Noch nicht ganz.“, mindestens eine mit „Fast!“;
- Tabellen-Werkzeuge: fünf Personen, jede Wahl liefert eine vollständige Tabelle, R-Code im Lernpfad-Stil;
- jede Werkstatt hat ein Bild im Register, und jeder `picture`-Schlüssel gehört zu einem Bild der passenden Art (`forWorkshop`, `forCard`, `forSentence`, `forTable`);
- jede Erklärung rendert in Ausführlich und Kompakt (Kompakt kürzer); jede Schrittkarte rendert und springt zu einer registrierten Werkstatt.

Selbst prüfen kannst du einzelne Texte mit `styleProblems(text, { maxWords: 25, maxSentences: 2 })` aus `src/explain/style.ts`.

---

## 8. Reiter

Jeder Begriff bekommt Reiter (Spezifikation Ausbau, Abschnitt 5; Oberfläche aus Aufgabe F3). Trag sie unter `tabs[<id>]` ein (Typ `ConceptTabs`):

- `next` (immer): `next` als Nächstes, `before` (Das geht voraus), `after` (Daraus entsteht), optional `more`; je Ziel ein Satz `why`.
- `sample` (wenn der Lehrdatensatz eine passende Variable hat): `bridge` für Werkstätten (Werkstatt-ID, Begriff, Variable, Vorhersagefragen), sonst `analysis` (Kurz gesagt, Ergebnis aus den Daten, Voraussetzung, mindestens eine Vorhersagefrage `ThinkSample`).
- `r` (wenn der Katalog einen mariposa-Aufruf hat): Katalog-ID und Leitaufruf, Ergänzungen zur Codelegende (`tokens`, Typ `TokenNote`), `outputMap` („SD“ ↔ „s, Schritt 6“; gegen die in R erfasste Ausgabe prüfen) und eine Kurz-prüfen-Frage.

Die genaue Bedeutung der Felder und Beispiele für die Pilotbegriffe liefert F3 (`src/explain/content/pilot-tabs.ts`).

---

## 9. Prüfen vor dem Commit

Im eigenen Arbeitsverzeichnis:

```
ALLBUS_SAV="$HOME/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav" node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts src/explain/*.test.ts src/explain/content/*/*.test.ts
node_modules/.bin/tsc --noEmit -p .
PATH="$PWD/node_modules/.bin:$PATH" npm run build
```

**Browser:** Dev-Server auf deinem Port starten (`node node_modules/vite/bin/vite.js --host 127.0.0.1 --port <port> --strictPort`), dann das Prüfskript aus F3 für alle Begriffe deines Bereichs:

```
BASE=http://127.0.0.1:<port> IDS=validity,nominal OUT=<scratch-ordner> node scripts/check-explanations.cjs
```

Es öffnet jeden Begriff über die Suche der Karte (`/?ansicht=karte`, Suchfeld „Begriff im Netzwerk finden“), geht alle Reiter durch und meldet Konsolenfehler, Schrift unter 13 px und seitliches Überlaufen bei 1440 und 390 px. Danach den Server beenden.

Checkliste je Begriff:

1. Vorlage nach Abschnitt 1 gewählt, Grenzfall begründet.
2. Bestehende Inhalte gelesen (`concepts.ts`, `learning.ts`, `explanations.ts`, `foundations/catalog.ts`, `mariposaCatalog.ts`), nichts Fachliches verloren; Feinheiten unter „Genau genommen“.
3. Ton wie in der Streuung: Handlung als Titel, Mut-Satz, Das nennt man …, Aufgepasst, „Fast!“-Diagnosen, Aussage über Menschen.
4. Jede Zahl in R nachgerechnet und im Bereichstest festgehalten.
5. Tests, `tsc`, Build grün; Browserprüfung ohne Befund.
