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
- Gerundet wird wie in der Schule: Eine 5 an der ersten wegfallenden Stelle rundet vom Betrag her auf, auch bei negativen Zahlen (1,125 → 1,13 und −1,125 → −1,13, also „9 − 10,13 = −1,13“). Binäres Rauschen zählt nicht: 19,865 wird zu 19,87, obwohl der Rechner 19,864999… speichert (`round()` in `format.ts`). R selbst rundet `round(-1.125, 2)` auf gerade Ziffer (−1.12); im Text gilt die Schulregel.
- Zahl mit Einheit über `unit(v, 'Punkt', 'Punkte')`: Bei genau 1 steht die Einzahl („1 Punkt“, „1 Stunde“), sonst die Mehrzahl („0,71 Punkte“). `c.u(v)` in der Brücke kennt die Einzahl der ausgeschriebenen Einheiten des Lehrdatensatzes von selbst („1 Jahr“, „1 Person“, „1 Aufgabe“).
- In Datentabellen (Tabellen-Werkzeug) schreibt die Oberfläche Zahlen selbst deutsch (`cell()`: „8,3“, „−9“, „3850“); du gibst Zahlen als Zahlen an, Texte wie „NA(a)“ als Text.
- „≈“, wo gerundet wird. Rechnungen im Text gehen mit den sichtbaren Zahlen auf; wenn nicht, sag es („Mit allen Nachkommastellen kommt R auf 0,16.“).
- Anrede „du“. Fünf Beispielpersonen heißen „Fünf Beispielpersonen“ oder „fünf Personen“, ohne „(fiktiv)“.
- Aussprache (`say`) ohne Anführungszeichen schreiben: `say: 'x quer'`. Die Oberfläche setzt „sprich „x quer““.
- Ordnungszahlen als Wort schreiben: „das erste Quartil“, „in der fünften Welle“, „der dritte Schritt“. `sentences()` (src/explain/style.ts) trennt „1. Quartil“ sonst als Satzende, und die Satzzählung der Tests stimmt nicht mehr.

---

## 2a. Fachliche Leitplanken

Der Ton allein macht eine Erklärung nicht richtig. Diese Deutungsfehler passieren am häufigsten; die Begutachtung prüft sie.

- **p-Wert immer mit Bedingung:** „Gäbe es keinen Unterschied (Zusammenhang), käme … in etwa k von 100 Stichproben vor.“ Nie „Wahrscheinlichkeit, dass die Nullhypothese stimmt“, nie „Wahrscheinlichkeit, dass das Ergebnis Zufall ist“. Das gilt auch in `rechnung`, `explain` und Rückmeldungen, die für sich allein stehen.
- **Konfidenzintervall:** „Bei wiederholten Zufallsstichproben enthielten etwa 95 % solcher Intervalle den wahren Wert“; im Alltagston „plausible Werte“. Nie „liegt mit 95 % Wahrscheinlichkeit“.
- **Keine Ursachenwörter** bei Beobachtungsdaten (Lehrdatensatz, ALLBUS): „hängt zusammen mit“, „geht einher mit“, „unterscheidet sich“; nicht „Einfluss“, „wirkt“, „führt zu“. Ausnahmen nur in B12 (Kausalität, Zufallszuteilung).
- **Mitte:** Im Atlas heißt x̄ „die Mitte“. Den Median nennst du „mittlerer Wert der Reihe nach“, nie nur „die Mitte“.
- **Standardabweichung:** „typischer Abstand“ nur zusammen mit dem Hinweis, dass s kein durchschnittlicher Abstand ist (unter „Genau genommen“ oder in der Fachsprache). In Aussagen über die 200 lieber datenwahr („141 von 200 liegen höchstens s entfernt“) oder „grob gesagt“.
- **„signifikant“** nur zusammen mit α; neben p immer die Größe des Effekts.
- **Richtung aus dem Vorzeichen:** Eine Deutung, die eine Richtung nennt („wer mehr lernt, löst mehr“), leitet sie aus dem Vorzeichen des Ergebnisses ab, nie aus den Spaltennamen. Nach „Umpolen“ oder eigenen Daten kann sich die Richtung drehen.
- **Richtung von R:** Wo R eine Differenz meldet (t-Test: Gruppe 0 minus Gruppe 1), rechnest und nennst du sie im Text in derselben Richtung („ohne minus mit Weiterbildung“).
- **Faustregeln** (Cohen, n > 30) als Faustregel kennzeichnen.
- **Lehrdatensatz:** Befunde sind synthetisch, keine Aussagen über Deutschland. Wer die 200 sind, steht in Abschnitt 8.2.
- **Wie im Alltag:** Ein Vergleich darf keine falsche Lesart nahelegen. Gegenbeispiel: r „wie eine Prozentangabe“ legt „r = 0,5 heißt 50 %“ nahe.
- **Nachkommastellen:** höchstens zwei, außer bei kleinen Kennwerten wie SE oder p: Dort so viele, dass zwei gültige Ziffern sichtbar sind („0,013“); p unter 0,001 als „p < 0,001“.
- **Rückmeldungen auf Auswahlfragen:** „Fast!“ für jede Antwort, hinter der ein typischer Denkfehler steht (auch „groß und wichtig“ beim p-Wert); „Noch nicht ganz.“ nur für Antworten ohne erkennbaren Denkfehler.

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
| `dataNote` | optional: Hinweis neben den Voreinstellungen; ohne ihn steht „Fünf Beispielpersonen. Die Punkte im Bild lassen sich ziehen.“ (die Zahl aus `names`). Setze ihn, wenn die Daten keine Personen sind oder sich nicht ziehen lassen. Der erste Reiter heißt trotzdem „Verstehen (5 Personen)“, solange `table.rowHead` fehlt |
| `names`, `bounds`, `presets` | Personen A bis E, Wertebereich für Ziehen und Pfeiltasten, Voreinstellungen (die erste ist der Start) |
| `compute(d)` | rechnet die Kennwerte `S` aus den Daten `D`; lege dort alle Zahlen ab, die Texte und Diagnosen brauchen |
| `glyphs` | Zeichenübersicht am Ende: `sym`, `say`, `term`, `plain`, `step` |
| `steps` | die Schritte (siehe unten) |
| `numeric(c, lastStep)` | eingesetzte Formel als `FNode[]`; `{ part: […], m: k }` koppelt einen Teil an Schritt k |
| `table` | Rechentabelle: Spalten mit `from` (erscheint ab Schritt), `active` (hervorgehoben), `cell`, `sum`; optional `rowHead`, der Kopf der ersten Spalte (ohne Angabe „Person“). Sind die Zeilen keine Personen (Abschlüsse, Zellen einer Kreuztabelle), setze ihn: Dann heißt der erste Reiter „Verstehen“ ohne Personenzahl |
| `captions` | Bildunterschrift je Schritt |
| `think` | Denkfragen mit `step` und optional `tryIt` (setzt passende Daten; bleibt innerhalb von `bounds`). Erklärt die Werkstatt mehrere Begriffe: `onlyFor` zeigt eine Frage nur auf diesen Karten, `tryFor` das Ausprobieren nur dort (es meldet die letzte Kennzahl der Variante; passt die nicht zur Frage, lass es dort weg), `questionFor` und `stepFor` ändern Frage und Schritt je Karte. Vorbild: `content/b06-wahrscheinlichkeit/erwartung.ts` |
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

Eine Schrittkarte (`stepCards[<id>] = { workshop, variant, step }`) zeigt auf eine registrierte Werkstatt, auf einen ihrer Begriffe und auf einen Schritt zwischen 1 und dessen `lastStep`. Der Begriff muss als diese Werkstatt erklärt sein, denn „Werkstatt öffnen“ springt dorthin. Die Rendertests zeigen jede Schrittkarte einmal an. Eine Schrittkarte darf Reiter haben (`tabs[<id>]`, mindestens „Weiter“; Vorbild `STEP_TABS` in `content/b12-kategorial-design/rechenbausteine.ts`). Sie ist in Ausführlich und Kompakt gleich lang, der Rendertest nimmt sie von „Kompakt kürzer“ aus. Ohne Reiter „Mit 200 Befragten“ stehen die bisherigen Teile „Mit deinen Daten“ zugeklappt als „Weitere Übung“ am Ende von „Verstehen“.

Bisherige Übungen der Karte (FoundationLab: Verteilungs-, Stichproben-, Test-, Modell- und Faktorlabor) stehen unter einer neuen Erklärung zugeklappt als „Weitere Übung“ am Ende von „Verstehen“, nicht mehr direkt unter der Erklärung.

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
  assert.ok(close(pFor(0.07), 0.880639, 1e-6), 'p bei 0,07 h wie in R');
});
```

- Rechne dabei die Werte zusätzlich im Test aus den Daten nach (`createSurvey()`, `src/tasks/kit/means.ts`, `src/tasks/kit/dist.ts`), damit eine Änderung des Lehrdatensatzes auffällt.
- **ALLBUS nur als Aggregat** (Häufigkeiten, Mittelwerte), nie Mikrodaten im Repository, im Build oder in Fixtures. Die Datei liest du nur in R oder in Tests über `process.env.ALLBUS_SAV`. Im sichtbaren Text nennst du das Jahr und, ob gewichtet wurde („ALLBUS 2023, ungewichtet“).
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

Pipe `%>%`, Spalten mit `mutate()`, Umkodieren mit `rec()` in `mutate()`. Nicht: `d$`, `d <- `, `factor(`, `ifelse(`, `read.csv2`. Codes in Regeln ausdrücklich nennen statt `else=0` (sonst werden fehlende Angaben still zu 0). Die Inhaltstests prüfen den R-Code jedes Tabellen-Werkzeugs auf diese Punkte. Einzige Ausnahme ist `replace()` aus Basis-R, um einzelnen Personen zum Üben eine Lücke oder einen Code einzusetzen (`missing`, `missing_tools`, `data_export`; mariposa hat dafür keine Funktion). Dazu gehört ein Kommentar „zum Üben“ im Code; die Karte „Wert ersetzen“ aus der allgemeinen Codelegende (`RTOKENS.replace`) steht dann im Reiter „In R“ hinter dem Zeichen und im Tabellen-Werkzeug unter dem Code.

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
- jede Erklärung rendert in Ausführlich und Kompakt (Kompakt kürzer); jede Schrittkarte rendert und springt zu einer registrierten Werkstatt;
- jede registrierte Erklärung hat Reiter mit `next`; alle Reitertexte, Vorhersagen und R-Zuordnungen prüft `src/explain/tabs.test.ts` (Abschnitt 8.5), die Reiterleiste in beiden Inspectors `src/explain/render.test.ts`.

Selbst prüfen kannst du einzelne Texte mit `styleProblems(text, { maxWords: 25, maxSentences: 2 })` aus `src/explain/style.ts`.

---

## 8. Reiter

Jeder Begriff bekommt die Reiterleiste (Spezifikation Ausbau, Abschnitt 5; Lehrdatensatz, Abschnitt 5). Unter Titel und „Kurz gesagt“ stehen die Reiter:

| Reiter | Name | Wann | Feld in `tabs[<id>]` |
|---|---|---|---|
| Verstehen | „Verstehen (5 Personen)“ für Werkstätten mit Personen (Zahl aus `names`), „Werkzeug“ für Werkzeuge, sonst „Verstehen“ | immer; zeigt deine Erklärung (Abschnitt 3) | – |
| Mit 200 Befragten | fest | wenn der Lehrdatensatz eine passende Variable hat | `sample` |
| In R | fest | wenn der Katalog einen mariposa-Aufruf hat (oder ein dplyr-Aufruf sinnvoll ist) | `r` |
| Weiter | fest | **immer** (der Test verlangt `next` für jede registrierte Erklärung) | `next` |

Du trägst die Reiter im Index deines Bereichs ein, im selben Commit wie die Erklärung: `tabs: { validity: { next: … }, … }` (Typ `ConceptTabs`, `src/explain/types.ts`). „Kurz gesagt“ über den Reitern kommt aus deiner Erklärung; die Vorlagen lassen ihren eigenen Kasten dann weg. Die Reiter bleiben eingehängt (Zustand bleibt beim Wechsel erhalten), der gewählte Reiter gilt je Begriff für die Sitzung. Am Ende von „Verstehen“ führt „Weiter mit 200 Befragten“ in den Reiter `sample` und setzt dort denselben Schritt.

**Rangwege:** Ein Rechenweg mit `basis: 'ranks'` (etwa Spearman unter Korrelation) zeigt keine Reiter. Brücke, Vorhersagen und Leitaufruf rechnen mit Rohwerten; Zahlen dazu wären für die Rangfassung falsch. Der Weg zeigt seine Erklärung ohne Reiter und darunter die bisherige Ansicht „Mit dem Lehrdatensatz (200 Befragte)“ mit rangbasierten Zahlen. Verweise in der Erklärung deshalb nicht auf einen Reiter („im Reiter „Mit 200 Befragten““), sondern auf den Teil („im Teil mit den 200 Befragten“).

Vorbilder: `src/explain/content/pilot-tabs.ts` (sieben Pilotbegriffe, Brücken der Pilot-Werkstätten) und `src/explain/content/muster/index.ts` (`p_value` und `dummy`: Auswertung und Katalog-Leitaufruf).

### 8.1 Weiter (`NextTab`)

```ts
next: {
  next: { id: 'se', why: seSentence },   // Funktion (c: SampleCtx) => string, rechnet mit den aktuellen Daten: „… 3,24 / √200 ≈ 0,23 h.“
  before: [{ id: 'variance', why: 'Die Varianz s², deren Wurzel s ist.' }],   // „Das geht voraus“
  after: [{ id: 'z', why: 'Misst Abstände zur Mitte in Standardabweichungen.' }], // „Daraus entsteht“
  more: [{ id: 'describe', why: 'Mittelwert, Standardabweichung und mehr auf einen Blick.' }], // zugeklappt
}
```

- `next` steht hervorgehoben oben („Als Nächstes“). Jedes `why` ist ein Satz, höchstens zwei, je höchstens 25 Wörter, ohne den Titel des Ziels zu wiederholen (der steht fett darüber).
- Nennt ein `why` Zahlen aus den Daten, schreib es als Funktion `c => …` (Typ `SampleCtx`: `c.rows`, Spalten der Spaltenwahl in `c.columns.x`, `c.columns.y`); dann stimmt es auch nach „Ausprobieren“. Vorbild: der Satz zum Standardfehler in `pilot-tabs.ts` (`seSentence`). Feste Zahlen in festen Sätzen veralten.
- Alle `id` gibt es in `concepts.ts`; kein Ziel steht zweimal, auch „Als Nächstes“ nicht noch einmal in `before`, `after` oder `more`; kein Verweis auf den Begriff selbst.
- Lässt du `before` oder `after` leer (`[]`), füllt der Reiter die Liste aus den Bezügen der Karte. Alle übrigen Bezüge der Karte stehen zugeklappt unter „Weitere Verwendungen und Rechenwege“. Jedes Ziel erscheint im ganzen Reiter höchstens einmal; Ziele aus der Karte, die schon weiter oben stehen, fallen weg (`nextLists` in `src/explain/relations.ts`).

### 8.2 Mit 200 Befragten (`SampleTab`)

**Der Lehrdatensatz:** 200 synthetische Befragte, Erwachsene von 18 bis 75 Jahren, keine Studierenden. Spalten, Fragetexte, Einheiten und Wertebereiche stehen in `src/domain/survey.ts` (`surveyColumns`). Übernimm die Zeitbezüge wörtlich: Lernzeit „in den letzten sieben Tagen“, Weiterbildung „in den letzten zwölf Monaten“, Wissenstest „Wie viele Aufgaben haben Sie in diesem Test richtig gelöst?“ (0 bis 20). Kein „fiktiv“ im Text; dass die Daten synthetisch sind, sagt der Datensatz-Dialog. Nenne die Menschen „Befragte“ oder „Personen“. Spaltentitel kommen in Texte nur über `c.col.title` bzw. `sampleColumnInfo(id).title`: Dort ist der Mittelpunkt der Datensatztitel schon durch ein Komma ersetzt („Wissenstest, Zeitpunkt 2“).

Zwei Arten:

**`bridge`** (nur für Werkstätten): dieselbe Formel mit allen 200 Befragten, Schritt für Schritt, mit Person, Bild, Deutung und Vorhersagen.

```ts
sample: { kind: 'bridge', workshop: 'streuung', variant: 'sd', variable: 'lernzeit', think: [ … ] }
```

`variable` ist die Spalte, für die deine Vorhersagefragen geschrieben sind, bei Paaren `'x,y'` (zum Beispiel `'lernzeit,wissenstest'`). Sind andere Spalten gewählt, rechnet die Brücke mit ihnen und bietet für die Vorhersagen den Wechsel an. Die Brücke selbst gehört zur Werkstatt: `Workshop.bridge` (Typ `Bridge<S>`), nur wenn die Daten eine Spalte (`number[]`) oder ein Paar (`{ x, y }`) sind; `compute` rechnet dann die 200. Felder:

| Feld | Inhalt |
|---|---|
| `data` | `'series'` (Punktdiagramm) oder `'pairs'` (Streudiagramm) |
| `numeric(c, lastStep)` | eingesetzte Formel mit 200 als `FNode[]`; die Summe gekürzt mit `sumNodes(n, c.who, i => […])` aus `src/explain/sample.ts` (erster, gewählter, letzter Summand, dazwischen „…“; der gewählte ist umrahmt); darunter die Zwischenergebnisse („= √( 2.085,82 / 199 ) ≈ √10,48 ≈ 3,24 h“) |
| `lines[k]` | je Schritt `all(c)` („Schritt k für alle 200“) und `person(c)` („Vorgerechnet für P002“), je ein bis zwei kurze Sätze |
| `metrics(c, variant)` | Kennzahlen mit Einheit; die letzte ist das Ergebnis (sie erscheint auch in „vorher … jetzt …“ nach dem Ausprobieren) |
| `interpret(c, variant)` | `kurz` (Aussage über Menschen, höchstens drei Sätze), `fachlich`, `zusatz` (eine datenwahre Aussage, zum Beispiel „141 von 200 Befragten lernen zwischen 4,51 und 10,99 Stunden.“) |
| `voraussetzung(c, variant)` | wann das Ergebnis gilt |
| `picture(c, step)` | was das Bild in Schritt `step` zeigt (`BridgePicture`): `center` (x̄ bzw. [x̄, ȳ]), `deviation`, `band` ([x̄ − s, x̄ + s]), `contributions` (Beiträge aller 200, etwa die Quadrate in Schritt 4), `quadrants` |
| `value(c, variant)` | das Ergebnis als Zahl (s, r, x̄ …) oder null; daran prüft der Test deine Vorhersagen |

Der Kontext `c` (`BridgeCtx<S>`): `c.s` sind die Kennwerte deiner Werkstatt für alle 200, `c.who` die gewählte Person, `c.names` P001 bis P200, `c.values` (und `c.values2`) die Spaltenwerte, `c.col`/`c.col2` Titel, Einheit, Frage, Skalenniveau (`scale`) und `likert`, `c.u(v)` Zahl mit Einheit („3,24 h“, `{ squared: true }` → „10,48 h²“). Texte hängen von den Daten ab: nach „Ausprobieren“ und eigenen Änderungen stimmen sie trotzdem. Schreib sie für jede Spalte, die die Spaltenwahl für deinen Begriff anbietet (Titel, Einheit und Skalenniveau aus `c.col`), nicht nur für die Lernzeit; der Test rechnet alle diese Spalten durch. Proben und Rechnungen im Text gehen mit den sichtbaren, gerundeten Zahlen auf („3,24 · 3,24 ≈ 10,5, bis auf Rundung die 10,48“).

**`analysis`** (alle übrigen Begriffe): Kurz gesagt, Ergebnis mit Deutung, Voraussetzung, mindestens eine Vorhersagefrage.

```ts
sample: {
  kind: 'analysis', columns: { x: 'lernzeit', group: 'weiterbildung' },   // optional: feste Spalten je Rolle
  kurz: 'Dieselbe Frage mit allen 200 Befragten: …',
  result: c => ({ kurz: '…', fachlich: '…', zusatz: '…' }),              // c.rows, c.columns.x?.[0] …
  voraussetzung: '…',
  think: [ … ],
}
```

Ohne `columns` gelten die Spalten der Spaltenwahl (`c.columns.x`, `c.columns.y`) und die Rollen der R-Einstellungen (`group`, `items` …), und oben steht die Spaltenwahl. Dann wirkt auch „Ausprobieren“ auf die gewählte Spalte: Der Test rechnet `result` und jede Vorhersage für jede Spalte durch, die die Spaltenwahl anbietet. Sprechen Fragen oder Beschriftungen von einer bestimmten Spalte („40 Stunden“, „Wissenstest umpolen“), setze `columns`. Mit `columns` rechnet der Reiter immer mit diesen Spalten. Welche Spalten die Spaltenwahl anbietet, bestimmen die Rollen im Katalog; für Katalogbegriffe ohne Rollen, die mit Zahlen rechnen (Erwartungswert, Vorhersage, Residuen …), nur passende Spalten (`compatible()` in `src/domain/survey.ts`). Unter der Deutung zeigt der Inspector bei Begriffen der Karte die bisherigen Auswertungen (Fallwahl, Formel mit Zahlen, Verteilung, Experiment), am Ende zugeklappt den Baukasten. `result` muss für die Ausgangsdaten und für jede Vorhersage lesbar bleiben (der Test rechnet alle durch). `value: c => …` gibt das Ergebnis als Zahl (p, SE …) für die Prüfung der Vorhersagen.

**Vorhersagen (`ThinkSample`)**, für beide Arten: Frage, Antworten, `correct`, `explain` (Begründung mit Verweis auf den Schritt), `kurz`, `tryIt`, `expect` und nur in Brücken `step` (der Formelschritt, den die Antwort markiert; in einer Auswertung gibt es keine Schritte, der Test lehnt `step` dort ab):

| `op` | wirkt auf die Spalte `column` (`'x'` oder `'y'`) |
|---|---|
| `shift` | alle um `value` (sonst 1) |
| `double` | alle mal `value` (sonst 2) |
| `outlier` | die gewählte Person bekommt `value` |
| `constant` | alle bekommen `value` (sonst den Mittelwert) |
| `reverse` | umpolen: Minimum + Maximum − Wert |

`label` beschreibt die Änderung („alle doppelt so lange“), die Oberfläche setzt „Ausprobieren:“ davor. Das Ergebnis muss zur Spalte passen (Wertebereich, Schrittweite, Antwortcodes): Der Test wendet jede Änderung auf die Ausgangsdaten an und prüft das mit `fitsColumn`. Die Rechnung steckt in `applyOp` (`src/explain/sample.ts`), Kennwerte für deine Tests liefern `sampleSeries`, `samplePairs`, `countWithin`.

**`expect`: Was die markierte Antwort behauptet, rechnet der Test nach.** Er wendet `tryIt` auf die Ausgangsdaten und auf die Daten nach jeder anderen Vorhersage des Reiters an, bei `outlier` für jede der 200 Personen, und vergleicht die Ergebniszahl (`Bridge.value` bzw. `analysis.value`, oder `expect.measure` für eine eigene Zahl) vorher und nachher:

| `expect` | heißt |
|---|---|
| `{ change: 'same' }` | bleibt gleich |
| `{ change: 'factor', factor: 2 }` | verdoppelt sich (4: vervierfacht) |
| `{ change: 'plus', amount: 1 }` | steigt um genau 1 |
| `{ change: 'sign' }` | wechselt das Vorzeichen |
| `{ change: 'up', atLeast?, atMost? }`, `'down'` | steigt bzw. sinkt, wahlweise um mindestens oder höchstens so viel („ein wenig“: `atMost`) |
| `{ change: 'weaker', atLeast?, atMost? }`, `'stronger'` | der Betrag sinkt bzw. steigt (für r: der Zusammenhang wird schwächer), wahlweise um mindestens oder höchstens so viel |
| `{ change: 'equals', value: 200, measure: c => … }` | ist danach genau dieser Wert |

**Die Worte der markierten Antwort müssen zu `expect` passen** (`answerFits` in `tabs.test.ts`). So prüft der Test die Antwort selbst, nicht nur, was du in `expect` einträgst. Unbekannte Worte fallen durch; dann ergänzt du die Tabelle dort und hier:

| Wort in der Antwort | verlangt |
|---|---|
| „bleibt gleich“, „bleibt genau gleich“, „gar nicht“ | `same` |
| „verdoppelt“, „vervierfacht“, „halbiert“ | `factor` 2, 4, 0,5 |
| „steigt um 1 …“ | `plus` mit diesem Betrag |
| „steigt“, „wird größer“ bzw. „sinkt“, „wird kleiner“ | `up` (oder `plus`, `factor` > 1) bzw. `down` (oder `factor` < 1) |
| „schwächer“ bzw. „stärker“ | `weaker` bzw. `stronger` |
| „Vorzeichen“ | `sign` |
| eine Zahl, „keine“, „lauter …“ | `equals` |
| „deutlich“, „spürbar“, „stark“ | eine Untergrenze `atLeast` |
| „kaum“, „ein wenig“, „etwas“, „fast gleich“ | eine Obergrenze `atMost` |

„kaum oder deutlich“ zusammen sagt nur die Richtung. Gilt die Behauptung nicht für jede Person und jeden Datenstand, formuliere die Antwort vorsichtiger (Vorbild Pearson: „er wird schwächer, je nach ihrem Wissenstest kaum oder deutlich“ statt „ja, deutlich“; die alte Fassung fällt im Test durch) und halte im Bereichstest fest, was R dazu sagt. Ein Ablenker wie „bleibt fast gleich“ ist willkommen, wenn er einen typischen Denkfehler zeigt (Vorbild: s beim Ausreißer).

### 8.3 In R (`RTab`)

```ts
r: {
  entry: 't_test', variant: 0,                   // Leitaufruf: Katalogvariante (src/domain/mariposaCatalog.ts)
  tokens: { t_test: { sym: 't_test()', term: 't-Test', kurz: '…', fehler: '…' } },
  outputMap: [{ match: 'p', atlas: 'p-Wert', step: 3, explain: '…' }],
  check: { question: 'Welche Zahl in der Ausgabe ist der p-Wert? Tippe sie an.', correct: 'p', wrong: { t: 'Fast! …' } },
}
```

- **Leitaufruf:** die Katalogvariante `entry`/`variant`. Der Reiter zeigt immer genau den in R erfassten Aufruf: `analysisCode()` mit den Ausgangsspalten der Variante (`initialRSettings(entry, variant)`, `catalogLead()` in `RTab.tsx`). Spaltenwahl, R-Einstellungen und „Anderer Aufruf“ ändern ihn nicht; nur `live`-Aufrufe folgen der Spaltenwahl. „Aufruf kopieren“ und „R-Skript“ geben denselben Aufruf heraus. Deshalb dürfen `outputMap`, `check` und `tokens` von den Ausgangsspalten sprechen („47,5 % in der Zeile Abitur“). „So antwortet R“ zeigt die in R erfasste Ausgabe für die Ausgangsdaten (`CATALOG_OUTPUT[`${entry}:${variant}`]`, nachgeladen) mit dem Hinweis „Ausgabe für die Ausgangsdaten“ und, nach Datenänderungen, „Deine Daten sind verändert; R würde andere Zahlen zeigen.“ Hat die Variante im Katalog einen Hinweis (`note`, etwa „Gewichte von 1 ändern nichts …“), steht er unter dem Code. Gehört der Aufruf zu einem anderen Begriff (p-Wert → `t_test`), trag dessen Katalog-ID ein.
- **„Anderer Aufruf“** listet die eigenen Katalogaufrufe des Begriffs, wenn es welche gibt, auch wenn der Leitaufruf zu einem anderen Begriff gehört (Labels führt mit `to_labelled()` und listet `var_label()`, `val_labels()` …); sonst die weiteren Varianten des Leitaufrufs. `others: '<Katalog-ID>'` legt die Liste selbst fest, `others: ''` lässt sie weg.
- **`summary: true`:** Der Leitaufruf speichert sein Ergebnis (`ergebnis <- atlas %>% efa(…)`) und druckt `summary(ergebnis)`; die Ausgabe liegt unter `CATALOG_OUTPUT[`${entry}:${variant}:summary`]`. Erfasst ist das bisher für `efa` (Ladungen, Eigenwerte, Kommunalitäten; `SUMMARY_ENTRIES` in `src/domain/mariposa.ts`, neu erfassen mit `scripts/capture-r-output.R`). Vorbild: `content/b14-faktoren/loadings.ts`.
- **„Kurz gesagt“** im Reiter wählt die Oberfläche nach dem Leitaufruf (`rKurz()` in `src/explain/registry.ts`): eigener Aufruf „In R rechnet mariposa dieselbe Zahl.“, bei Werkzeugen „In R erledigt mariposa denselben Schritt, für alle 200 Befragten auf einmal.“, fremder Aufruf „Der Begriff steckt in diesem Aufruf und in seiner Ausgabe.“; dahinter steht immer der Hinweis zum Antippen. Passt keiner (Import, Export, Codebuch), schreib einen eigenen Satz in `kurz` (genau ein Satz).
- **`live`** gibt es nur für die Leitaufrufe, deren Druck der Atlas selbst nachbaut (`describe` mit `show`, `pearson_cor`, `cov`, `frequency`, `rec_frequency` = `rec(x, rules = "rev")` mit den gespiegelten Wertelabels und danach `frequency()`); dann folgt die Ausgabe den Daten. Ohne Angabe folgt er der Spaltenwahl; mit `live: { fn: 'frequency', x: 'schulabschluss' }` rechnet er immer mit dieser Spalte (etwa für Wertelabels). Für B3 (`describe`, `frequency`) kann das passen; sonst nimm die Katalogvariante.
- **Ausgabe ansehen:** `node --import tsx -e "import('./src/explain/catalogOutput.ts').then(m => console.log(m.CATALOG_OUTPUT['t_test:0'].output))"`. Leere Ausgaben (Zuweisungen, Schreibfunktionen) taugen nicht als Leitaufruf mit `outputMap`.
- **`tokens`** ergänzen die allgemeine Codelegende (`RTOKENS` in `src/domain/rTokens.ts`): Schlüssel ist das Zeichen, wie es im Code steht (Funktionen ohne Klammern, Argumente ohne „=“, Zeichenketten mit Anführungszeichen: `'"sd"'`). Spalten, `atlas` und mariposa-Funktionen bekommen ohne eigene Karte eine aus ihren Metadaten. `term` ist der Fachbegriff (Kartentitel, wo es einen Begriff gibt), `kurz` höchstens zwei Sätze, `fehler` ein typischer Fehler mit der echten Meldung von R oder mariposa 0.7.4 (in R nachprüfen, nicht raten).
- **`outputMap`:** `match` findet eine Stelle in der Ausgabe, in dieser Reihenfolge: (1) „match = Zahl“ oder „match < Zahl“, auch mit Klammer („r = 0.539“, „mean=3.26“, „t(175.8) = 0.156“, „p < 0.001“); (2) `match` als Spaltenkopf in einer Zeile ohne eigene Werte, darunter die erste Zahl unter dem Kopf („SD“ über „3.238“, „N“ in der Häufigkeitstabelle, „95% CI Lower“ über der unteren Grenze, „Sig.“ über „<.001“; ganze Zahlen mit Prozentzeichen wie „95%“ oder „25%“ zählen zur Beschriftung, Zahlen mit führendem Punkt wie „.021“ in Tabellenspalten als Zahl); (3) sonst der Text selbst („200 × 4“, „<dbl>“). Die deutsche Lesart neben der Zahl behält bei Werten unter 0,1 zwei gültige Ziffern („.021“ ↔ „0,021“). Die Stelle wird antippbar und zeigt „SD 3.238 ↔ s ≈ 3,24, Schritt 6: Zurück zur Skala“ mit `explain`. `atlas` ist der Name im Atlas (Zeichen oder Begriff), `step` der Schritt, zu dem „Schritt k ansehen“ springt: in der Brücke, sonst in „Verstehen“ (Schritte der Werkstatt, Bausteine der Begriffskarte, Schritte des Tabellen-Werkzeugs). Hat dein Begriff keine Schritte (Formel als Satz, Schrittkarte), lass `step` weg; der Test prüft, dass es Schritt k gibt. Ob eine Stelle gefunden wird, prüfst du mit `locate(output, match)` aus `src/explain/rRead.ts`.
- **`check`** („Kurz prüfen“): Die Antworten sind die Stellen aus `outputMap` und `wrong`, in der Reihenfolge der Ausgabe. `correct` ist ein `match` aus `outputMap`; jeder Schlüssel in `wrong` muss in der Ausgabe vorkommen, jede Rückmeldung beginnt mit „Fast!“. Die richtige Rückmeldung baut die Oberfläche: „Genau, SD 3.238 ist s.“

### 8.4 Was du nicht tun musst

Download der `.sav`-Datei, Startblock, Kopieren, R-Skript, „Anderer Aufruf“, Hilfe, Personenwahl, Bilder der Brücke, Hinweis bei veränderten Daten, Rücksetzen und die Zusammenführung doppelter Bezüge übernimmt die Oberfläche.

### 8.5 Was `src/explain/tabs.test.ts` prüft

- jede registrierte Erklärung hat `tabs[id].next`; Ziele existieren; kein Ziel doppelt, auch nicht mit den Bezügen der Karte; Ton jedes `why` (auch in `more`), auch der rechnenden für veränderte Daten;
- Brücke: Werkstatt mit `bridge` und `value`, Schrittzeilen für jeden Schritt, alle Texte für alle 200 Personen und nach jeder Vorhersage ohne `NaN` und im Ton des Sprachleitfadens; dieselben Texte für jede Spalte, die die Spaltenwahl anbietet (kein „·“ aus Spaltentiteln); bei Paaren passt jede Richtungsangabe zum Vorzeichen, auch nach „Umpolen“;
- Vorhersagen: jede passt zur Spalte, die Worte der markierten Antwort passen zu `expect`, und `expect` stimmt für jede Person und jeden Datenstand (siehe 8.2), bei Auswertungen ohne `columns` für jede wählbare Spalte; `expect.measure` gilt auch in Brücken; Gegenprobe mit der alten Pearson-Antwort „ja, deutlich“;
- Auswertung: `result` für die Ausgangsdaten und nach jeder Vorhersage, Ton, mindestens eine Vorhersage, kein `step`;
- In R: Katalogeintrag und erfasste Ausgabe vorhanden (mit `summary` unter „…:summary“), erfasster Code gleich dem Katalogcode; jede `outputMap`-Stelle wird gefunden, jedes `step` gibt es; `check` mit „Fast!“-Rückmeldungen; jedes Zeichen aus `tokens` kommt im Leitaufruf vor; „Kurz gesagt“ im Ton des Sprachleitfadens; hat der Katalog Aufrufe zum Begriff, gibt es `r`.

Dazu prüft `src/explain/render.test.ts`: Code und Ausgabe in „In R“ haben je genau einen Tabstopp (Pfeiltasten wandern), Rangwege rendern ohne Reiterleiste; jeder Katalog-Leitaufruf zeigt mit den Standardspalten und nach einer anderen Spaltenwahl genau den erfassten Code, kopiert und als R-Skript denselben, mit dem Hinweis der Variante.

## 9. Prüfen vor dem Commit

Im eigenen Arbeitsverzeichnis:

```
ALLBUS_SAV="$HOME/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav" node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts src/explain/*.test.ts src/explain/content/*/*.test.ts
node_modules/.bin/tsc --noEmit -p .
PATH="$PWD/node_modules/.bin:$PATH" npm run build
```

**Browser:** Dev-Server auf deinem Port starten (`node node_modules/vite/bin/vite.js --host 127.0.0.1 --port <port> --strictPort`, im Hintergrund), dann das Prüfskript für alle Begriffe deines Bereichs:

```
BASE=http://127.0.0.1:<port> IDS=validity,nominal OUT=<scratch-ordner> node scripts/check-explanations.cjs
```

Es öffnet jeden Begriff über die Suche der Karte (`/?ansicht=karte`, Suchfeld „Begriff im Netzwerk finden“; findet die Suche ihn nicht eindeutig, über das Atlas-Werkzeug `open_atlas_concept` und meldet das als Hinweis) und prüft:

- gleich nach dem Öffnen: Die Reiterleiste ist im sichtbaren Teil des Inspectors (auf dem Telefon im Blatt unter dem Kopf), alle Reiter liegen ganz in der Leiste, nichts ist abgeschnitten, kein Wort einer Beschriftung bricht mitten im Wort um, und die Leiste überdeckt mit Rahmen und Schatten nichts, was über ihr steht („Kurz gesagt“);
- Tastatur: Pfeil rechts durch alle Reiter, Pfeil links, Ende, Pos1; jedes Panel hat Inhalt, die anderen sind verborgen;
- in jedem Reiter, alle Abschnitte aufgeklappt: Konsolenfehler und -warnungen (Meldungen beim Laden zählen zum ersten Begriff), Schrift unter 13 px, seitliches Überlaufen von Seite und Inspector, Steuerelemente ohne zugänglichen Namen, übersprungene Überschriftenebenen (h2 → h4);
- Tabulatortaste durch jeden Reiter (bis zu 30 Stopps): Kein Fokus liegt mit Ober- oder Unterkante unter einem klebenden Element (Reiterleiste, stehende Formel, Kopf des Blatts);
- Zustand: Ein gewählter Schritt bleibt nach einem Reiterwechsel erhalten;
- „Weiter“: kein Ziel doppelt;
- Fokus: „Schritt k ansehen“ in „In R“ zeigt Schritt k mit dem Fokus dort, nicht unter der Leiste; nach „Zu … wechseln“, nach „Ausprobieren“ und „Ausgangsdaten wiederherstellen“ (im Reiter und mit „Zurücksetzen“ in der Kopfzeile) und nach dem Link „Als Nächstes“ liegt der Fokus nicht auf der Seite; im Reiter „Mit 200 Befragten“ steht genau ein Knopf „Ausgangsdaten wiederherstellen“;
- Text in Bildern: Kein SVG-Text ist am Bildrand abgeschnitten oder liegt über einem anderen Text desselben Bildes; keine Knopfbeschriftung läuft über ihren Knopf hinaus (Schrittknöpfe bei 360 bis 390 px).

Weitere Variablen: `SIZES=1920,1440,1280,1024,390` (Standard `1440,390`), `MODE=kompakt` für die Ansicht Kompakt, `SHOTS=1` für Bildschirmfotos je Reiter nach `<OUT>/shots`. Prüfe vor dem Bericht beide Ansichten bei allen fünf Breiten, nacheinander: Zwei Läufe gleichzeitig führen zu Zeitüberschreitungen. Je Begriff schreibt es `<OUT>/<id>.json` (alle Messungen), dazu `<OUT>/summary.json` (nur Befunde) und eine JSON-Zeile je Begriff und Breite auf die Konsole; bei einem Befund endet es mit Code 1. Danach den Server beenden.

**Tests schreiben:** Gib jeder Zusicherung eine Meldung mit (`assert.ok(x, 'was fehlt')`). Ohne Meldung liest node:test bei einem Fehlschlag die Quelle nach, und mit tsx kann der Testlauf dann hängen bleiben, statt den Fehler zu melden.

Checkliste je Begriff:

1. Vorlage nach Abschnitt 1 gewählt, Grenzfall begründet.
2. Bestehende Inhalte gelesen (`concepts.ts`, `learning.ts`, `explanations.ts`, `foundations/catalog.ts`, `mariposaCatalog.ts`), nichts Fachliches verloren; Feinheiten unter „Genau genommen“.
3. Ton wie in der Streuung: Handlung als Titel, Mut-Satz, Das nennt man …, Aufgepasst, „Fast!“-Diagnosen, Aussage über Menschen.
4. Jede Zahl in R nachgerechnet und im Bereichstest festgehalten.
4a. Jede Vorhersage mit `expect` (8.2); Deutungen nennen ihre Richtung aus dem Vorzeichen, nicht aus Spaltennamen.
5. Tests, `tsc`, Build grün; Browserprüfung ohne Befund.
