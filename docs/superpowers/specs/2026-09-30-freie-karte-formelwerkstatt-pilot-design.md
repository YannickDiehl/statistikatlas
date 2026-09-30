# Freie Karte: Formelwerkstatt (Pilot) – Designspezifikation

Stand: 30. September 2026. Grundlage: Brainstorming mit dem Dozenten am 30. September 2026. Gezeigt und gebilligt wurden klickbare Entwürfe: Standardabweichung (kurz, ausführlich und mit „Kurz gesagt“), Chi² (Stufe 1), Standardfehler (Stufe 2) und Rekodieren (Stufe 3). Die Inhalte der Pilotbegriffe stehen im Wortlaut in `2026-09-30-freie-karte-formelwerkstatt/` (eine Datei je Werkstatt beziehungsweise Vorlage). Die Beispielzahlen sind in R nachgerechnet (Basisfunktionen und mariposa 0.7.3 auf ZA8831 v1.3.0).

## 1. Ziel

Die freie Karte soll ihre Erklärungen so aufbauen, dass jede und jeder Studierende die Mathematik einer Formel Schritt für Schritt versteht **und lernt, mit der Formel zu denken**. Die Formel wird dabei nicht ausgeblendet, sondern ist das Werkzeug zum Navigieren. Fachbegriffe bleiben vollständig erhalten; jede Erklärung ergänzt sie um ein „Kurz gesagt“ in einfachen Worten. Der Sandbox-Charakter des Atlas bleibt: Studierende verändern selbst Daten und sehen die Formel reagieren.

Der Pilot setzt das Muster für eine zusammenhängende Kette um (Mittelwert → Varianz und Standardabweichung → Kovarianz → Pearson) sowie je ein Beispiel der beiden Vorlagen für die übrigen Begriffe (Standardfehler, Rekodieren). Danach wird mit Studierenden ausprobiert und über den Ausbau entschieden.

## 2. Ausgangslage (Befund vom 30. September 2026)

- Der Inspector stellt die Formel vor die Bedeutung. Fragen nach typischen Missverständnissen gibt es nur für 8 Begriffe, und sie stehen ganz unten (`deepQuestions`/`deepCopy`).
- Der Ton schwankt: Die Grundlagen-Texte sind präzise, aber dicht; mariposa-Einträge sind im Telegrammstil geschrieben („Zwei Merkmale derselben Personen kreuzen.“).
- Viele Bezüge wiederholen dasselbe Label (Mittelwert 15-mal „liefert einen Baustein“, p-Wert 29-mal derselbe Satz).
- Zugänglichkeit: Die Formeln haben keine vorlesbare Fassung; die Beschriftungen der Bezüge sind 11 px groß.
- Die Karte rechnet mit 200 synthetischen Befragten, der Lernpfad mit dem echten ALLBUS. Das bleibt im Pilot so (siehe Abschnitt 11).

## 3. Entscheidungen des Dozenten

| Frage | Entscheidung |
|---|---|
| Leitidee | Formel lesen lernen: Die Formel bleibt stehen und ist der Navigator. Man liest sie von innen nach außen; jedes Zeichen ist eine Handlung mit einem Bild. |
| Fachsprache | Fachbegriffe immer nennen, möglichst genau so, wie der Begriff in der Karte heißt. Dazu **immer** ein „Kurz gesagt“ in einfachen Worten. |
| Ausführlichkeit | Schritt für Schritt, mit vorgerechnetem Beispiel, Vergleich aus dem Alltag, Begründung, typischem Fehler und einer Kontrollfrage je Schritt. |
| Sandbox | Jede Werkstatt ist veränderbar: Punkte ziehen, Werte setzen, Regeln schreiben. |
| Staffelung | Drei Stufen: Formelwerkstatt, Formel als Satz, Werkzeug (Abschnitt 5). |
| Anzeige | Umschalter „Kompakt / Ausführlich“, Standard „Ausführlich“, die Wahl merkt sich der Browser. (Vom Assistenten vorgeschlagen; der Dozent hat nicht widersprochen. Beim Review zu bestätigen.) |
| Schreibweise | Kein Mittelpunkt „·“ als Trennzeichen in der Nähe von Formeln oder Zahlen, weil er als Malzeichen gelesen wird. Schrittangaben stehen getrennt vom Zeichen („Schritt 6“ über „√“). |
| Umfang | Pilot zuerst (dieses Dokument), Auswertung, dann Ausbau. |

## 4. Umfang des Pilots

**Im Pilot**

| Werkstatt | Stufe | Begriffe in der Karte (`id`) | Schritte |
|---|---|---|---|
| Arithmetisches Mittel | 1 | `mean` | 2: Σ, ÷ n |
| Streuung | 1 | `variance` (endet nach Schritt 5), `sd` (endet nach Schritt 6) | 6: x̄, xᵢ − x̄, ( )², Σ, ÷ (n − 1), √ |
| Zusammenhang | 1 | `covariance` (endet nach Schritt 5), `pearson` (endet nach Schritt 6) | 6: x̄ und ȳ, Abweichungen, Abweichungsprodukt, Σ, ÷ (n − 1), ÷ (sₓ · sᵧ) |
| Standardfehler | 2 | `se` | Vorlage „Formel als Satz“ |
| Rekodieren & Umpolen | 3 | `recode` | Vorlage „Werkzeug“ |

Die Begriffe, die Schritte dieser Werkstätten sind, erhalten eine **Schrittkarte** (Abschnitt 6.4): die Rechenbegriffe der Detailansicht `sum`, `deviation`, `squared_deviation`, `df`, `crossproduct`, `crossproduct_sum`, `sd_product` und der Kartenpunkt `ss` („Quadratsumme der Abweichungen“).

**Nicht im Pilot:** alle übrigen Begriffe; die Anbindung der Karte an den ALLBUS des Lernpfads; eine Listenansicht der Karte; das Aufräumen der Bezugs-Labels und der Entwicklernotizen außerhalb der Pilotbegriffe; der z-Rechenweg zu Pearson als eigene Werkstatt (er bleibt über den vorhandenen Routenwähler erreichbar).

## 5. Die drei Stufen

### 5.1 Stufe 1: Formelwerkstatt

Für Kernformeln. Bausteine in dieser Reihenfolge:

1. **Wofür?** Eine politische Frage, die die Formel beantwortet.
2. **Kurz gesagt / Fachlich** für die ganze Formel.
3. **Die Zeichen, bevor es losgeht:** eine Legende mit Zeichen, Aussprache („x quer“), Fachbegriff und einfacher Erklärung; ein Klick springt zum Schritt, in dem das Zeichen gebraucht wird.
4. **Formel** symbolisch (groß) und darunter mit eingesetzten Zahlen, beide gekoppelt: Der Teil des aktuellen Schritts ist hervorgehoben, erledigte Teile sind voll sichtbar, spätere gedämpft. Jedes Zeichen ist anklickbar. Die symbolische Formel hat eine vorlesbare Fassung (`aria-label`).
5. **Schrittnavigation:** Knöpfe mit „Schritt n“ klein über dem Zeichen, dazu Vor und Zurück.
6. **Lernkarte je Schritt:** Fachbegriff (mit Link zum Begriff), Zeichen, **Kurz gesagt**, *Fachlich in einem Satz*, **Vorgerechnet** für eine wählbare Person oder Zelle, *Wie im Alltag*, *Warum steht das in der Formel?*, *Typischer Fehler*.
7. **Rechentabelle:** eine Zeile je Person, eine Spalte je Schritt; die Spalten erscheinen mit dem Schritt, die Spalte des aktuellen Schritts ist hervorgehoben. Eine Summenzeile zeigt, was die Formel summiert, und macht Invarianten sichtbar (zum Beispiel ist die Summe der Abweichungen immer 0).
8. **Das Bild dazu:** eine Zeichnung je Werkstatt (Abschnitt 7.3), mit ziehbaren Punkten.
9. **Kurz prüfen:** eine Rechenfrage zum aktuellen Schritt mit Eingabefeld und gezielter Rückmeldung für typische Fehler (Abschnitt 7.4); bei richtiger Antwort „Weiter zu Schritt n + 1“.
10. **Was heißt das Ergebnis?** Kurz gesagt und fachlich, mitlaufend mit den Daten.
11. **Mit der Formel denken:** 3–4 Denkfragen über Grenzfälle mit Auswahlantworten. Die Antwort markiert den zuständigen Formelteil, bietet „Ausprobieren“ an (setzt passende Daten) und endet mit „Kurz gesagt“.
12. **Genau genommen:** ausklappbar, beginnt mit „Kurz gesagt“, dann die präzise Fassung (zum Beispiel n − 1, Annahmen, Grenzen).

### 5.2 Stufe 2: Formel als Satz

Vorlage für alle übrigen Begriffe mit Formel. Kein Schrittnavigator und keine Rechentabelle. Bausteine: Wofür?; Kennzahlen; Zeichenlegende; Formel mit anklickbaren Zeichen und mit eingesetzten Zahlen; Kurz gesagt / Fachlich; **Als Satz gelesen** (die Formel als deutscher Satz, dessen Satzteile mit den Zeichen gekoppelt sind); **Vorgerechnet** in 2–4 kleinen Schritten; Typischer Fehler; **ein Regler je Zeichen** mit Kurzbefehlen (zum Beispiel „n mal 4“); eine Kontrollfrage; Was heißt das Ergebnis?; eine Denkfrage; Genau genommen.

### 5.3 Stufe 3: Werkzeug

Für Begriffe ohne echte Formel (Einlesen, Rekodieren, Labels, Missing-Codes …). Bausteine: Wofür? mit Kurz gesagt / Fachlich; **Die Fachbegriffe**; **Die Zeichen der Regel** (die Syntax des Werkzeugs, mit Aussprache); Voreinstellungen und ein freies Eingabefeld mit Prüfung; **So liest das Werkzeug deine Eingabe** (jede Regel in Worten); **Vorgerechnet für eine Person** als Durchlauf mit nummerierten Schritten und abschließendem Kurz gesagt; **Vorher und nachher** (Zuordnung mit Häufigkeiten); Hinweise, wo Antworten verloren gehen oder umgedeutet werden (Codes ohne Regel, von else erfasste fehlende Werte), jeweils mit Kurz gesagt; Kennzahl vorher/nachher; R-Code im Stil des Lernpfads; Typische Fehler; eine Kontrollfrage; zwei Denkfragen; Genau genommen.

## 6. Aufbau im Inspector

### 6.1 Breite und Umschalter

- Der Inspector hat oben einen Umschalter **Kompakt / Ausführlich** (Segmentknopf, Standard Ausführlich). Gespeichert wird er unter `statistikatlas.erklaerung.v1` in `localStorage`; jeder Zugriff steht in `try/catch`. Ohne Speicher gilt „Ausführlich“.
- **Ausführlich** verbreitert den Inspector auf dem Desktop: ab 1280 px auf `min(720px, 55vw)`, zwischen 1100 und 1280 px auf 560 px. Kompakt behält 408 px (beziehungsweise 380 px). Unter 760 px bleibt die bestehende Bodenschublade in voller Breite. Minimap, Attribution und Kartenhinweise rücken mit, wie heute bei `.has-inspector`.
- Alle Werkstatt-Bausteine funktionieren von 360 px bis 720 px Breite. SVG-Zeichnungen skalieren über `viewBox`; die Rechentabelle scrollt waagerecht in einem eigenen Container.

### 6.2 Reihenfolge für Begriffe der Stufe 1 (`mean`, `variance`, `sd`, `covariance`, `pearson`)

| Ausführlich | Kompakt |
|---|---|
| Kopf (Eyebrow, Titel, Umschalter) | Kopf |
| Wofür? + Kurz gesagt / Fachlich | Kurz gesagt / Fachlich |
| Formelwerkstatt, Bausteine 3–12 | Formel (gekoppelt), Schrittnavigation, je Schritt nur Fachbegriff + Kurz gesagt, das Bild |
| „Mit dem Lehrdatensatz (200 Befragte)“: bestehende Spaltenwahl, Fallwahl, eingesetzte Formel, Ergebnis, Bedingungen | wie Ausführlich |
| In R (bestehendes `MariposaPanel`) | wie Ausführlich |
| Einordnung & Anwendungen, Von hier aus weiter (bestehend) | wie Ausführlich |
| Baukasten und Experimentieren (bestehende Aufklapper) | wie Ausführlich |

Für diese Begriffe entfallen `CalculationSteps` („Rechenschritte & Zeichen verstehen“; ersetzt durch Zeichenlegende und Schritte) und der alte Tiefen-Aufklapper (`deepQuestions`/`deepCopy`; Inhalt geht in Denkfragen und „Genau genommen“ auf). Die bisherige Einleitung (`introduction()`) wird durch Wofür? und Kurz gesagt ersetzt. Der Link „Bezüge in der Karte zeigen“ bleibt im Kopf.

### 6.3 Stufe 2 und 3 im `PackageInspector`

Für `se` und `recode` rendert der `PackageInspector` zuerst die jeweilige Vorlage (Abschnitte 5.2 und 5.3). Danach folgen die vorhandenen Abschnitte: Was sagt das Ergebnis? (entfällt, wenn die Vorlage es abdeckt), Voraussetzungen & Einordnung, R (`MariposaPanel`), Fachlich nachlesen, Von hier aus weiter. Die vorhandenen Notizen (`notes`) dieser beiden Einträge werden gesichtet: Entwicklerhinweise wandern nach „Genau genommen“ oder entfallen. Der `PrincipleLab` „se“ wird durch die Regler der Vorlage ersetzt.

### 6.4 Schrittkarten für Rechenbegriffe

Öffnet man einen Rechenbegriff, der ein Schritt einer Pilot-Werkstatt ist (Tabelle in Abschnitt 4), zeigt der Inspector oben dessen **Schrittkarte**: Fachbegriff, Zeichen, Kurz gesagt, Fachlich, Vorgerechnet, Wie im Alltag, Warum, Typischer Fehler, dazu „Ist Schritt n von … (Werkstatt öffnen)“. Der Link öffnet den Begriff der Werkstatt und springt zu diesem Schritt. Die übrigen Abschnitte bleiben unverändert. Gehört ein Rechenbegriff zu mehreren Werkstätten (`deviation` ist Schritt 2 der Streuung und Schritt 2 des Zusammenhangs), gilt die Werkstatt, von der aus man gekommen ist (`contextAnchor`), sonst die erste in Tabellenreihenfolge. Zuordnung: `sum` → Mittel 1; `deviation` → Streuung 2, Zusammenhang 2; `squared_deviation` → Streuung 3; `ss` → Streuung 4; `df` → Streuung 5 (Zeichen n − 1); `crossproduct` → Zusammenhang 3; `crossproduct_sum` → Zusammenhang 4; `sd_product` → Zusammenhang 6. `ss` ist ein Kartenpunkt und bekommt die Schrittkarte zusätzlich zu seinem bisherigen Inhalt.

### 6.5 Verweise aus der Lernkarte

Jede Lernkarte verlinkt ihren Fachbegriff. Ist der Begriff ein Kartenpunkt (`mapIds`), heißt der Link „Begriff öffnen“ und zeigt ihn zusätzlich in der Karte; ist er ein Rechenbegriff der Detailansicht (`detailIds`), heißt er „Begriff öffnen“ und öffnet nur den Inspector. Die Navigation nutzt das vorhandene `onSelect` und bleibt damit in Zurück/Vorwärts.

## 7. Verhalten

### 7.1 Zustand

- Je Werkstatt: aktueller Schritt, gewählte Person beziehungsweise Zelle, Beispieldaten. Beim Öffnen gilt Schritt 1 (oder der Schritt aus einer Schrittkarte), Person A, Grunddaten.
- Der Zustand ist lokal und wird beim Wechsel des Begriffs zurückgesetzt. Er gehört nicht zum Verlauf (Zurück/Vorwärts) und wird nicht gespeichert. Ausnahme: der Umschalter Kompakt/Ausführlich.
- „Ausgangsdaten wiederherstellen“ setzt die Beispieldaten zurück. Die Beispieldaten sind vom Lehrdatensatz der 200 Befragten getrennt; Änderungen hier verändern ihn nicht und umgekehrt.

### 7.2 Beispieldaten

Jede Stufe-1-Werkstatt rechnet mit **fünf Beispielpersonen A bis E** (eigene kleine Daten, damit man jede Zahl von Hand nachrechnen kann). Die Fragen sind echte ALLBUS-2023-Fragen, die Werte sind ausgedachte Beispiele. Der Text sagt „Fünf Beispielpersonen“ und behauptet nicht, es seien ALLBUS-Daten (kein Zusatz „fiktiv“).

| Werkstatt | Variable(n) | Voreinstellungen |
|---|---|---|
| Mittel, Streuung | Links-rechts-Selbsteinstufung (`pa01`, 1–10) | Gruppe A 4 5 5 5 6 (x̄ = 5, s ≈ 0,71); Gruppe B 1 3 5 7 9 (x̄ = 5, s ≈ 3,16) |
| Zusammenhang | Vertrauen in den Bundestag (`pt03`, 1–7) als x, in die Bundesregierung (`pt12`, 1–7) als y | gleichläufig x 2 3 4 5 6, y 2 5 3 6 4 (Kovarianz 1,25, sₓ = sᵧ ≈ 1,58, r = 0,5); gegenläufig y 6 3 5 2 4 (r = −0,5); gekrümmt y 5 3 2 3 5 (r = 0) |

Stufe 2 und 3 verwenden **aggregierte** ALLBUS-Zahlen (keine Mikrodaten): politisches Interesse `pa02a`, ungewichtet, gültige n = 5.225; umgepolt Mittelwert 3,30, s = 0,94; Häufigkeiten 1: 527, 2: 1.542, 3: 2.303, 4: 663, 5: 190, fehlend: 21.

### 7.3 Bilder

- **Mittel:** Zahlenstrahl 1–10 mit fünf ziehbaren Punkten und der Mitte als Stützpunkt einer Wippe; die Abweichungen erscheinen als Hebel links und rechts, die sich ausgleichen.
- **Streuung:** Zahlenstrahl mit einer Zeile je Person, Mittelwert als gestrichelte Linie, Abweichungen als Pfeile mit Vorzeichen (ab Schritt 2), darunter Quadrate mit Kästchenraster (ab 3), Summenklammer (ab 4), typisches Quadrat (ab 5), dessen Seite s ist und als Band x̄ ± s auf den Zahlenstrahl zurückwandert (ab 6).
- **Zusammenhang:** Streudiagramm 1–7 × 1–7 mit fünf ziehbaren Punkten, Mittelwertlinien x̄ und ȳ als Achsenkreuz (ab 1), Abweichungen als waagerechte und senkrechte Strecken (ab 2), **Rechtecke** zwischen Punkt und Achsenkreuz, deren Fläche das Abweichungsprodukt ist; Rechtecke in den Quadranten rechts oben und links unten zählen positiv, die anderen negativ (ab 3); Summenbalken aus positiven und negativen Flächen (ab 4); durchschnittliches Rechteck (ab 5); Vergleich mit dem Rechteck sₓ · sᵧ, dem größtmöglichen Wert, als Anteil r (ab 6).
- **Standardfehler:** keine eigene Zeichnung (Stufe 2).
- **Rekodieren:** Vorher-nachher-Zuordnung mit Linien, deren Dicke der Häufigkeit entspricht; problematische Wege farbig (keine Regel: Warnfarbe; fehlende Angabe wird gültiger Wert: Hinweisfarbe).

Farben bleiben in der Atlas-Palette. Hervorhebung des aktiven Formelteils: Hintergrund `--wash`, Schrift `--green`. Positive Beiträge grün, negative in einem gedeckten Braunrot, das nicht mit dem Auswahl-Rot der Karte oder den Bezugsfarben Blau/Orange/Violett verwechselt werden kann. Farbe ist nie der einzige Träger: Vorzeichen stehen immer als „+“/„−“ daneben.

### 7.4 Kontrollfragen

- Eingabe als Text; akzeptiert werden Komma und Punkt, „−“ und „-“. Leere oder nicht lesbare Eingaben erzeugen eine Fehlermeldung direkt am Feld und werden nicht bewertet.
- Richtig ist eine Antwort, wenn sie vom Sollwert höchstens 0,011 abweicht (Anzeige auf zwei Nachkommastellen); bei Rekodieren wird ein Code oder „NA“ erwartet.
- Jede Frage hat Diagnosen für erkennbare Fehler (zum Beispiel −4² statt (−4)², durch n statt n − 1, Wurzel vergessen, Vorzeichen vertauscht, durch B statt E geteilt, Summe statt Mittelwert, durch n statt √n). Die Diagnosen stehen in den Inhaltsdateien; sonst gibt es einen allgemeinen Hinweis auf Tabelle und Lernkarte.
- Die Rückmeldung steht in einer `aria-live`-Region.

### 7.5 Zahlen und Schreibweise

- Deutsche Zahlschreibweise, echtes Minuszeichen „−“ (wie `de()` im Aufgaben-Kit), Rundung erst für die Anzeige auf höchstens zwei Nachkommastellen, „≈“, wo gerundet wird.
- Kein „·“ als Trennzeichen in Beschriftungen mit Formeln oder Zahlen; „·“ steht nur für Multiplikation.
- Fachbegriff in der Lernkarte = Titel des verlinkten Begriffs (zum Beispiel „Korrigierte Stichprobenvarianz“), gängige Kurzform als Zusatz („auch: Varianz s²“).
- Kurz gesagt: höchstens zwei Sätze, ohne Fachwörter, die nicht direkt daneben erklärt sind.
- Anrede „du“, wie im Lernpfad.

## 8. Architektur

### 8.1 Dateien

```
src/explain/
  types.ts            Inhaltsmodell (Abschnitt 8.2)
  math.ts             reine Rechenfunktionen für die Beispiele (Mittel, Abweichungen, Varianz, Kovarianz, r, SE)
  rules.ts            Parser und Auswertung der rec()-Regeln (Stufe 3)
  format.ts           de(), Vorzeichen, Klammerung negativer Zahlen, Eingabe-Parser
  registry.ts         Zuordnung Begriff → Werkstatt/Vorlage/Schritt
  content/
    mittel.ts         Stufe 1
    streuung.ts       Stufe 1 (variance, sd)
    zusammenhang.ts   Stufe 1 (covariance, pearson)
    standardfehler.ts Stufe 2
    rekodieren.ts     Stufe 3
  *.test.ts
src/components/explain/
  ExplainMode.tsx         Umschalter und Hook useExplainMode()
  KurzGesagt.tsx
  GlyphLegend.tsx
  WorkshopFormula.tsx     symbolische und eingesetzte Formel, gekoppelt
  StepNav.tsx
  LearnCard.tsx           auch als Schrittkarte (6.4)
  WorkTable.tsx
  CheckQuestion.tsx
  ThinkQuestions.tsx
  Formelwerkstatt.tsx     Stufe-1-Hülle
  FormelAlsSatz.tsx       Stufe-2-Hülle
  Werkzeug.tsx            Stufe-3-Hülle
  pictures/Wippe.tsx, Streuungsbild.tsx, Rechteckbild.tsx, Zuordnung.tsx
src/explain.css
```

`ConceptInspector` und `PackageInspector` fragen `registry.ts` und rendern bei einem Treffer die Hülle; sonst bleibt alles wie heute.

### 8.2 Inhaltsmodell

```ts
type Tier = 'werkstatt' | 'satz' | 'werkzeug';
interface Glyph { sym: string; say?: string; term: string; plain: string; step?: number; concept?: string }
interface Check<S> { question(s: S): string; answer(s: S): number | 'NA'; diagnose(s: S, v: number | 'NA'): string | null }
interface Step<S> {
  sym: string;                 // „xᵢ − x̄“
  concept: string;             // verlinkter Begriff, liefert den Fachbegriff
  also?: string;               // „auch: Varianz s²“
  kurz(s: S): string; fachlich: string;
  vorgerechnet(s: S): string;  // für die gewählte Person/Zelle
  alltag: string; warum: string; fehler(s: S): string;
  check: Check<S>;
}
interface Workshop<D, S> {
  id: string; tier: 'werkstatt'; concepts: Record<string, { lastStep: number }>;
  wofuer: string; kurz: string; fachlich: string;
  glyphs: Glyph[]; presets: { label: string; data: D }[];
  compute(d: D, who: number): S; steps: Step<S>[];
  formula: { symbolic: FormulaPart[]; ariaLabel: string; numeric(s: S): FormulaPart[] };
  table: { columns: { head: string; step: number; cell(s: S, row: number): string }[]; sums(s: S): (string | null)[] };
  interpret(s: S): { kurz: string; fachlich: string };
  think: { question: string; options: string[]; correct: number; step: number; explain(s: S): string; kurz: string; tryIt?: { label: string; apply(d: D): D } }[];
  genau: { kurz: string; paragraphs(s: S): string[] };
}
```

`FormulaPart` ist ein Textstück mit Schrittnummer (oder ohne), damit symbolische und eingesetzte Formel dieselbe Hervorhebung nutzen. Stufe 2 und 3 haben eigene, kleinere Schnittstellen nach demselben Prinzip.

### 8.3 Nebenläufigkeit mit dem Lernpfad

Parallel arbeiten Agenten auf den Zweigen `etappe34-*` und `lernpfad-etappe-3-4` an den Sitzungen 6–10. Die Umsetzung dieses Pilots geschieht auf dem Zweig `freie-karte-formelwerkstatt` und wird erst nach der Zusammenführung von Etappe 3–4 auf `main` gebracht (oder vorher auf den dann aktuellen Stand von `main` gebracht). Berührungspunkte mit dem Lernpfad sind gering: `styles.css` (neue Breitenregeln) und die Inspector-Komponenten. `src/tasks/` und `curriculum.ts` werden nicht verändert.

## 9. Fehlerbehandlung

- Unbekannte Begriffe oder fehlende Inhalte: Der Inspector fällt auf die heutige Darstellung zurück.
- Ungültige Eingaben (Kontrollfrage, Regelfeld): Meldung am Feld, kein Weiterrechnen; die Meldung verschwindet bei der nächsten Eingabe.
- Division durch null in den Beispielen (alle Werte gleich): s = 0 wird angezeigt; r ist dann nicht definiert und wird als „nicht definiert, weil eine Standardabweichung 0 ist“ erklärt, nicht als Zahl.
- Speicher nicht verfügbar: Umschalter funktioniert für die Sitzung, Standard Ausführlich.

## 10. Prüfung

- **Inhaltstests** (`src/explain/*.test.ts`, `pnpm test`): jede Werkstatt hat alle Bausteine; jeder Schritt hat alle Felder; `concept` existiert in `concepts.ts` beziehungsweise in den Katalogen; der angezeigte Fachbegriff entspricht dem Titel; kein „ · “ als Trenner in Titeln, Schrittknöpfen, Legenden und Überschriften (erlaubt nur zwischen Zahlen oder Zeichen als Multiplikation); jedes Kurz gesagt hat höchstens zwei Sätze.
- **Rechentests:** `math.ts` gegen die bestehenden Funktionen in `statistics.ts` und gegen die Referenzwerte in Abschnitt 7.2 (aus R); Invarianten (Summe der Abweichungen 0, ΣE = n, r = Kovarianz / (sₓ · sᵧ)).
- **Diagnosetests:** Für jede Kontrollfrage lösen die typischen Fehlantworten ihre Diagnose aus, die richtige Antwort keine.
- **Regeltests** (`rules.ts`): „rev“, Bereiche, Listen, Labels mit Semikolon, else, NA=, copy, erste passende Regel gewinnt, ungültige Syntax; Verhalten an den in R geprüften Fällen (mariposa 0.7.3): `else=0` erfasst fehlende Werte; Codes ohne Regel werden NA (in 0.7.3 ohne, ab 0.7.4 mit Warnung; der Hinweistext der Werkstatt nennt beides).
- **Build:** `tsc --noEmit`, `vite build`, Offline-Export.
- **Browser:** Mit `scripts/qa-visual.mjs` oder Playwright: je Pilotbegriff Ausführlich und Kompakt bei 1400, 1100 und 390 px; Schritte durchklicken, Punkte ziehen, Kontrollfragen richtig und falsch beantworten, Tastaturbedienung der Punkte (Pfeiltasten), Zurück/Vorwärts.

## 11. Pilot-Auswertung

- 5–8 Studierende (gemischte Vorkenntnisse) arbeiten je eine Werkstatt laut denkend durch, dazu Standardfehler und Rekodieren.
- Beobachtet werden: Wo wird gestoppt oder zurückgesprungen? Welche Kontrollfragen misslingen, welche Diagnosen greifen? Wird Kompakt gewählt? Wie lange dauert eine Werkstatt?
- Entscheidungsgrundlage für den Ausbau: Verständnis von „Kurz gesagt“ und Bild, Nutzen der Rechentabelle, Länge. Danach folgen die übrigen Kernformeln (etwa 15–17) und die Vorlagen für die übrigen Begriffe, außerdem die Anbindung an den ALLBUS (Vorschlag B) und das Aufräumen der Texte (Vorschlag C).

## 12. Nicht Teil dieser Spezifikation

Werkstätten für weitere Formeln; Listenansicht der Karte; ALLBUS-Anbindung der Karte; Überarbeitung der Bezugs-Labels (Mittelpunkt als Trenner in Begriffsnamen wie „Chi-Quadrat · Unabhängigkeit“, wiederholte Labels) außerhalb der Pilotbegriffe; Änderungen am Lernpfad.

## 13. Beim Review zu bestätigen

1. Umschalter Kompakt/Ausführlich mit Standard Ausführlich, und dass Ausführlich den Inspector auf dem Desktop verbreitert.
2. Beispielpersonen A–E mit echten ALLBUS-Fragen und ausgedachten Werten, gekennzeichnet als „Fünf Beispielpersonen“.
3. Aggregierte ALLBUS-Zahlen (Mittelwert, Standardabweichung, Häufigkeiten von `pa02a`) fest im Atlas für Standardfehler und Rekodieren.
4. Der R-Code der Rekodier-Werkstatt im Lernpfad-Stil (`read_spss()`, ALLBUS, Pipe), während das `MariposaPanel` darunter weiter den Lehrdatensatz nutzt.
5. Wegfall von „Rechenschritte & Zeichen verstehen“ und des alten Tiefen-Aufklappers für die Pilotbegriffe.
6. Zusammenhang-Werkstatt über die Kovarianz; der Weg über z-Werte nur als Hinweis in „Genau genommen“.
7. Referenzversion von mariposa für die Studierenden in diesem Semester: 0.7.3 (CRAN) oder 0.7.4. Davon hängen Hinweistexte und Parser der Rekodier-Werkstatt ab (Warnung bei Codes ohne Regel, Kommalisten, Missing-Typen).
