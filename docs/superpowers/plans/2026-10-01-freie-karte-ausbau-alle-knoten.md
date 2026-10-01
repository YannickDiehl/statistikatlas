# Freie Karte: Ausbau auf alle Knoten – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Jede Aufgabe läuft in einem eigenen Arbeitsverzeichnis (Worktree) auf einem eigenen Zweig; der Koordinator führt zusammen.

**Goal:** Alle Knoten der freien Karte werden im gebilligten Ton für mathe-ängstliche Bachelorstudierende erklärt, jeweils mit den Reitern „Verstehen“, „Mit 200 Befragten“, „In R“ und „Weiter“.

**Architecture:** Inhalte bleiben reines TypeScript in `src/explain/` (ohne React, in Node testbar), Oberfläche in `src/components/explain/`. Ein Fundament (F1 Ton und Vorlagen, F2 R global, F3 Reiter) legt Inhaltsmodell, Vorlagen und Prüfungen fest; danach schreiben 14 Bereichsagenten nur Inhaltsdateien in ihren Bereichsordnern, die eine zentrale Zuordnung automatisch einliest. Jede Zahl ist in R nachgerechnet und als Test festgehalten.

**Tech Stack:** React 19, TypeScript strict (tsc 7), Vite 8, node:test mit tsx, `renderToStaticMarkup` für Rendertests, headless Chrome über Playwright, R mit mariposa (Quellstand 0.7.4 per `pkgload::load_all`, installiert ist 0.7.3), haven.

**Spec:** `docs/superpowers/specs/2026-10-01-freie-karte-ausbau-alle-knoten-design.md` (führend), `docs/superpowers/specs/2026-10-01-freie-karte-lehrdatensatz-und-r-pilot-design.md`, `docs/superpowers/specs/2026-09-30-freie-karte-formelwerkstatt-pilot-design.md`. Gebilligte Beispiele: Tonbeispiel „Standardabweichung, Neu“ (Wortlaut in Aufgabe F1, Schritt 3) und Reiterbeispiel (Lehrdatensatz-Spezifikation, Abschnitt 5).

## Global Constraints

- Sprachleitfaden der Ausbau-Spezifikation, Abschnitt 2, für jeden sichtbaren Text; Regeln mit [Test] prüft `src/explain/style.test.ts`.
- Fachbegriff = Titel des verlinkten Begriffs in `src/domain/concepts.ts` (`titleFor(ref(id))`).
- Kein „·“ als Trenner neben Zahlen oder Formeln, „·“ nur als Malzeichen; echtes Minus „−“; höchstens zwei Nachkommastellen in Texten (R-Ausgaben behalten ihr Format); Toleranz der Zahlfragen 0,011.
- Nicht verwenden: „einfach“, „offensichtlich“, „trivial“, „natürlich“, „bekanntlich“, „leicht zu sehen“.
- Schrift im UI nie unter 13 px (`src/lib/typeScale.test.ts`).
- R-Code: `library(dplyr)`, `library(mariposa)`, `atlas <- read_spss("Statistikatlas-200-Befragte.sav")`, Pipe `%>%`, `mutate()`, `rec()` in `mutate()`; kein `d$`, kein `factor(`, kein `read.csv2`, kein `ifelse(`.
- mariposa-Referenzversion 0.7.4 in allen sichtbaren Angaben und Prüfskripten.
- Keine ALLBUS-Mikrodaten im Repository, im Build oder in Fixtures; nur Aggregate. ALLBUS-Datei: `~/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav` (nur lesen, Umgebungsvariable `ALLBUS_SAV`).
- Nicht verändern: `src/tasks/`, `src/domain/curriculum.ts`, Lernpfad-Komponenten.
- Gestrichene UI-Texte nicht wieder einbauen: Kopfzeilen-Untertitel „Politikwissenschaft · ALLBUS · mariposa“, Lernpfad-Intro „Zehn Sitzungen …“, Dateistatuszeile, „· STATISTIK IB“.

## Arbeitsweise für alle Aufgaben

- **Repo:** `/Users/yannickdiehl/Documents/Universität Marburg/Lehre/Methoden Ib B.A./Kartenkonzept/Statistikatlas-Prototyp` (Hauptzweig `main`, Integrationszweig `ausbau`). Jede Aufgabe bekommt vom Koordinator einen Worktree unter `$SCRATCH/wt/<aufgabe>` mit Symlink `node_modules`. Nur dort arbeiten; `node_modules` nie committen (`git add src docs scripts` statt `git add -A`).
- **Befehle** (im Worktree):
  - Tests: `ALLBUS_SAV="$HOME/Documents/Universität Marburg/Lehre/Methoden Ib B.A./ZA8831_v1-3-0.sav" node --import tsx --test src/domain/*.test.ts src/lib/*.test.ts src/sandbox/*.test.ts src/tasks/*.test.ts src/tasks/*/*.test.ts src/explain/*.test.ts src/explain/content/*/*.test.ts`
  - Typen: `node_modules/.bin/tsc --noEmit -p .`
  - Build: `PATH="$PWD/node_modules/.bin:$PATH" npm run build`
  - Dev-Server: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port <eigener Port> --strictPort` im Hintergrund, nach der Prüfung beenden.
  - Browser: `require('/Users/yannickdiehl/.npm/_npx/9833c18b2d85bc59/node_modules/playwright')`, `chromium.launch({ channel: 'chrome', headless: true })`. Skripte und Bildschirmfotos nur im eigenen Scratch-Ordner.
  - R: `Rscript`; mariposa 0.7.4 per `pkgload::load_all("~/Documents/SoftwareProjekte/RPakete/mariposa", export_all = FALSE, quiet = TRUE)`; Quellcode dort nur lesen.
- **Ports:** F1 5181, F2 5182, F3 5183, Prüfungen 5184–5189, B1–B14 5191–5204.
- **Commits:** kleine Commits mit englischer Betreffzeile im Stil des Repos; am Ende sind alle Tests, `tsc` und der Build grün.
- **Bericht an den Koordinator** (höchstens 300 Wörter): erledigt, Zuordnung je Begriff (bei Bereichsagenten), Dateien, Testanzahl, offene Punkte. Keine Bildschirmfotos einbetten.

---

### Aufgabe F1: Ton, Inhaltsmodell und Vorlagen

**Files:**
- Modify: `src/explain/types.ts`, `src/explain/registry.ts`, `src/explain/content/{mittel,streuung,zusammenhang,standardfehler,rekodieren}.ts`, `src/components/explain/{basics,pieces,Formelwerkstatt,FormelAlsSatz,Werkzeug}.tsx`, `src/explain.css`, `src/components/ConceptInspector.tsx`, `src/components/PackageInspector.tsx` (nur Einbindung über `explainFor`)
- Create: `src/explain/content/index.ts`, `src/explain/content/b01-messen/index.ts` … `src/explain/content/b14-faktoren/index.ts` (leere Bereichsindizes, Namen siehe unten), `src/explain/content/muster/p-wert.ts`, `src/explain/content/muster/dummy.ts`, `src/explain/content/muster/index.ts`, `src/components/explain/Begriffskarte.tsx`, `src/components/explain/TabellenWerkzeug.tsx`, `src/components/explain/pictures/kit.tsx`, `src/explain/style.ts`, `src/explain/style.test.ts`, `src/explain/AUTHORING.md`
- Test: `src/explain/content.test.ts` (anpassen), `src/explain/render.test.ts` (anpassen), `src/explain/style.test.ts`

**Bereichsordner (Name = Agent):** `b01-messen`, `b02-datenwerkzeuge`, `b03-lage`, `b04-umformen`, `b05-zusammenhang`, `b06-wahrscheinlichkeit`, `b07-verteilungen`, `b08-schaetzen`, `b09-testlogik`, `b10-mittelwerte`, `b11-rangtests`, `b12-kategorial-design`, `b13-regression`, `b14-faktoren`.

**Interfaces:**
- Consumes: bestehendes Inhaltsmodell (`Workshop`, `SentenceTemplate`, `RecodeTemplate`), `titleFor`, `ref`.
- Produces (verbindlich, Namen exakt so):

```ts
// src/explain/types.ts (Auszug; bestehende Typen bleiben, soweit nicht ersetzt)
export interface Step<S> {
  button: string;            // Zeichen auf dem Schrittknopf („xᵢ − x̄“)
  title: string;             // Handlung („Abstände messen“), Regel 1
  sym: string;               // Zeichen in „Das nennt man …“; '' wenn keins
  say?: string;              // Aussprache, Pflicht wenn sym nicht leer („x i minus x quer“)
  concept: string;           // verlinkter Begriff; sein Kartentitel ist der Fachbegriff
  links?: { id: string; label: string }[];
  perPerson: boolean;
  was: Text<S>;              // „Was passiert?“, ein bis zwei Sätze
  rechnung: Text<S>;         // Rechnung für die gewählte Person
  fach: Text<S>;             // „In der Fachsprache: …“
  warum: Text<S>;
  acht: Text<S>;             // „Aufgepasst“
  alltag?: string;           // optional
  check: Check<S>;           // Frage in Alltagssprache; Diagnosen beginnen mit „Fast!“
}
// Workshop<D, S>: `id: string` (beliebige Kennung), neues Pflichtfeld `mut: string` (Mut-Satz),
// neues Pflichtfeld `picture: string` (Schlüssel im Bild-Register `PICTURES` in Formelwerkstatt.tsx);
// `glyphs` bleibt für „Alle Zeichen auf einen Blick“.

export interface ThinkItem {
  question: string; options: string[]; correct: number;
  explain: string; kurz: string;
  step?: number;               // Formelschritt, auf den die Rückmeldung verweist
}

export interface ConceptCard {
  concept: string;
  wofuer: string;
  kurz: string;
  stellDirVor: { text: string; figures?: { label: string; value: string }[] };
  heisst: { sym?: string; say?: string; fach: string };
  bausteine: { title: string; was: string; rechnung?: string; warum: string; acht: string; concept?: string }[];
  ausprobieren: ThinkItem[];
  regler?: { label: string; min: number; max: number; step: number; initial: number; format: (v: number) => string; describe: (v: number) => string };
  check: { question: string; options: string[]; correct: number; right: string; diagnose: Partial<Record<number, string>> };
  fuerDich: string;
  genau: { kurz: string; paragraphs: string[] };
}

export interface TableTool {
  concept: string;
  wofuer: string; kurz: string; mut?: string;
  columns: { key: string; label: string }[];
  rows: Record<string, number | string | null>[];          // fünf Personen
  options: { id: string; label: string }[];                // Wahl, die die Operation verändert
  steps: { title: string; was: string; warum: string; acht: string; sym?: string; say?: string; fach: string; concept?: string }[];
  apply: (rows: TableTool['rows'], option: string) => { columns: TableTool['columns']; rows: TableTool['rows'] };
  rCode: (option: string) => string;
  check: { question: string; answer: (option: string) => number | 'NA'; right: string; diagnose: (option: string, v: number | 'NA') => string | null };
  think: ThinkItem[];
  genau: { kurz: string; paragraphs: string[] };
}

// Reiter (UI in F3, Typen schon hier)
export type SampleTab =
  | { kind: 'bridge'; workshop: string; variant: string; variable: string; think: ThinkSample[] }
  | { kind: 'analysis'; kurz: string; result: (c: SampleCtx) => { kurz: string; fachlich: string; zusatz?: string }; voraussetzung?: string; think: ThinkSample[] };
export interface SampleCtx { rows: import('../domain/survey').SurveyRow[]; columns: Record<string, string[]> }
export interface ThinkSample extends ThinkItem { tryIt: { label: string; op: 'shift' | 'double' | 'outlier' | 'constant'; column: 'x' | 'y'; value?: number } }
export interface TokenNote { sym: string; term: string; say?: string; kurz: string; fehler: string }
export interface RTab {
  entry: string;                         // Katalog-ID in mariposaCatalog
  variant: number;                       // Leitaufruf
  tokens?: Record<string, TokenNote>;    // Ergänzungen zur allgemeinen Codelegende (Funktion, Argumente)
  outputMap: { match: string; atlas: string; step?: number; explain: string }[]; // „SD“ ↔ „s, Schritt 6“
  check: { question: string; correct: string; wrong: Record<string, string> };   // Schlüssel = match
}
export interface NextTab { next: { id: string; why: string }; before: { id: string; why: string }[]; after: { id: string; why: string }[]; more?: { id: string; why: string }[] }
export interface ConceptTabs { sample?: SampleTab; r?: RTab; next: NextTab }

export type AnyWorkshop = Workshop<number[], Series> | Workshop<Pairs, PairStats> | Workshop<any, any>; // Pilot-Typen bleiben, neue Werkstätten bringen eigene D und S
export type AnySentence = SentenceTemplate<any, any>;
export type RecodeTemplate = typeof import('./content/rekodieren').rekodieren;

export type Explain =
  | { kind: 'werkstatt'; workshop: AnyWorkshop; variant: string }
  | { kind: 'satz'; template: AnySentence }
  | { kind: 'werkzeug'; template: RecodeTemplate }
  | { kind: 'tabelle'; tool: TableTool }
  | { kind: 'begriff'; card: ConceptCard };

export interface AreaIndex {
  explanations: Record<string, Explain>;
  tabs: Record<string, ConceptTabs>;
  stepCards?: Record<string, { workshop: string; variant: string; step: number }>;
}
```

```ts
// src/explain/content/index.ts
export const AREAS: Record<string, AreaIndex> = { muster, b01: b01Messen, …, b14: b14Faktoren };
// src/explain/registry.ts
export function explainFor(id: string): Explain | null;      // Pilot zuerst, dann AREAS
export function tabsFor(id: string): ConceptTabs | null;      // Pilot (F3) und AREAS
export function stepCardFor(id: string, anchor?: string): StepCard | null; // Pilot + AREAS.stepCards
export const WORKSHOPS: AnyWorkshop[];                        // Pilot + alle Werkstätten aus AREAS
```

```ts
// src/explain/style.ts – Prüfregeln, auch für Bereichsagenten
export const BANNED_WORDS: readonly string[];                 // Regel 5
export function sentences(text: string): string[];
export function styleProblems(text: string, opts?: { maxWords?: number; maxSentences?: number }): string[]; // leer = gut
```

- [ ] **Schritt 1: Sprachtests zuerst.** `src/explain/style.test.ts` mit Fällen: `styleProblems('Das ist einfach.')` meldet „einfach“; ein Satz mit 26 Wörtern meldet Satzlänge bei `maxWords: 25`; „Mittelwert · Varianz“ meldet den Mittelpunkt-Trenner, „3 · 4“ nicht; „-4“ (Bindestrich vor Zahl) meldet fehlendes echtes Minus; „Kurz gesagt“ mit drei Sätzen meldet bei `maxSentences: 2`. Laufen lassen, schlägt fehl (Modul fehlt).
- [ ] **Schritt 2: `style.ts` umsetzen**, Tests grün.
- [ ] **Schritt 3: Inhaltsmodell umstellen und die Streuung im neuen Ton schreiben.** `Step` wie oben; `streuung.ts` mit genau diesen Titeln und Texten (Gruppe B, Person A; Zahlen über `num()`, `signed()`, `paren()`):
  - `mut`: „Die Formel sieht nach viel aus. Sie besteht aber nur aus sechs kleinen Schritten, die du alle schon kannst: zusammenzählen, abziehen, malnehmen, teilen und am Ende die Wurzel ziehen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.“
  - `wofuer`: „Zwei Gruppen mit je fünf Personen sagen, wo sie sich politisch einordnen: von 1 (ganz links) bis 10 (ganz rechts). Beide Gruppen landen im Durchschnitt bei 5. Und doch sind sie ganz verschieden: In Gruppe A sind sich fast alle einig, in Gruppe B gehen die Meinungen weit auseinander. Die Standardabweichung macht diesen Unterschied sichtbar, mit einer einzigen Zahl.“
  - Varianten-`kurz` für `sd`: „Die Standardabweichung sagt dir, wie weit die Antworten typischerweise von der Mitte entfernt sind. Kleine Zahl: alle nah beieinander. Große Zahl: weit verstreut.“
  - Schritt 1 „Die Mitte finden“ (x̄, „x quer“): was „Wir zählen alle fünf Antworten zusammen und teilen durch fünf. So finden wir die Mitte der Gruppe.“; warum „Gleich messen wir, wie weit jede Person von der Mitte weg ist. Dafür brauchen wir zuerst die Mitte.“; acht „Hier teilst du durch alle fünf Personen. Das „n − 1“ aus der Formel kommt erst in Schritt 5 dran.“; fach „Summe aller Werte geteilt durch die Fallzahl n.“
  - Schritt 2 „Abstände messen“ (xᵢ − x̄, „x i minus x quer“): was „Für jede Person rechnen wir: ihre Antwort minus die Mitte. Das Ergebnis sagt, wie weit sie weg ist und auf welcher Seite.“; warum „Streuung bedeutet: Wie weit sind die Leute von der Mitte weg? Genau das messen wir hier, Person für Person.“; acht „Das Minus darf bleiben, es zeigt die Seite. Kleine Überraschung: Alle Abstände zusammen ergeben immer 0, links und rechts gleichen sich aus.“
  - Schritt 3 „Abstände quadrieren“ (( )², „hoch zwei“): was „Jeden Abstand nehmen wir mit sich selbst mal. Danach sind alle Zahlen positiv.“; warum „Zwei Gründe: Plus und Minus heben sich nicht mehr auf. Und wer weit weg ist, zählt stärker, denn 2 wird zu 4, aber 4 wird zu 16.“; acht „Im Taschenrechner Klammern setzen: (−4)² = 16. Ohne Klammern zeigt er −16. Ein Quadrat ist nie negativ, daran erkennst du den Fehler sofort.“
  - Schritt 4 „Alles zusammenzählen“ (Σ, „Sigma“): was „Wir zählen die fünf Quadrate zusammen.“; warum „So steckt die Streuung der ganzen Gruppe in einer Zahl.“; acht „Zusammengezählt werden die Quadrate, nicht die Abstände. Die Abstände allein ergäben immer 0.“; fach „Σ ist ein griechisches S und bedeutet: alles zusammenzählen, jede Person genau einmal.“
  - Schritt 5 „Gerecht teilen“ (s², „s Quadrat“): was „Wir teilen die Summe durch die Zahl der Personen minus eins, hier also durch 4.“; warum „Durch das Teilen werden große und kleine Gruppen vergleichbar. Und warum minus eins? Damit die Streuung nicht zu klein geschätzt wird. Mehr dazu steht unter „Genau genommen“.“; acht „Wer durch 5 teilt, bekommt 8 statt 10. Das passiert sehr vielen. Merksatz: Bei der Streuung teilst du durch n − 1.“ (Zahlen aus den Daten)
  - Schritt 6 „Zurück zur Skala“ (s): was „Wir ziehen die Wurzel. Damit machen wir das Quadrieren aus Schritt 3 wieder rückgängig.“; warum „Die 10 aus Schritt 5 ist in „Punkten zum Quadrat“, damit kann niemand etwas anfangen. Nach der Wurzel sind wir wieder in Punkten auf der Skala.“; acht „Nicht bei der 10 stehen bleiben. Das ist die Varianz. Die Standardabweichung ist ihre Wurzel.“
  - Kontrollfragen: „Wo liegt die Mitte dieser Gruppe?“, „Wie weit ist Person A von der Mitte weg? Mit Vorzeichen.“, „Was kommt heraus, wenn du (−4) mit sich selbst malnimmst?“, „Wie groß ist die Summe der fünf Quadrate?“, „Was kommt heraus, wenn du die Summe durch 4 teilst?“, „Und jetzt die Wurzel daraus? Zwei Nachkommastellen reichen.“; Diagnosen „Fast! Das ist die Summe. Jetzt noch durch 5 teilen.“, „Fast! Das Minus ist zu viel: Minus mal Minus ergibt Plus. Ein Quadrat ist nie negativ.“, „Fast! Du hast durch 5 geteilt. Bei der Streuung teilst du durch 4, also n − 1.“, „Fast! Das ist noch die Zahl vor der Wurzel.“, „Fast! Der Abstand stimmt, nur die Seite nicht. Rechne Antwort minus Mitte.“; allgemein „Noch nicht ganz. Schau oben in die Rechnung, sie zeigt jeden Zwischenschritt.“; richtig „Genau, {Wert}.“
  - Deutung `sd`: kurz „In Gruppe B liegen die Antworten typischerweise gut 3 Punkte von der Mitte entfernt. In Gruppe A sind es nur 0,71 Punkte: Dort sind sich fast alle einig. Gleicher Durchschnitt, ganz andere Gruppe.“ (aus den aktuellen Daten formuliert).
- [ ] **Schritt 4: Mittel, Zusammenhang, Standardfehler und Rekodieren** im selben Ton umschreiben (Titel als Handlung, Mut-Satz, „Das nennt man“, Aufgepasst, „Fast!“-Diagnosen). Zahlen und Diagnose-Logik bleiben; bestehende Inhaltstests anpassen, nicht abschwächen.
- [ ] **Schritt 5: Oberfläche.** `LearnCard` nach Spezifikation Abschnitt 3 (Kopf mit „Schritt k von n“ und Fortschritt „noch m kleine Schritte“, Titel, Was passiert?, Rechnung groß in Serifenschrift, Kasten „Das nennt man …“ mit Zeichen, Aussprache, „In der Fachsprache“, Links, Warum?, Aufgepasst, optional Wie im Alltag); Einstieg mit Mut-Kasten (`--wash`-Hintergrund, grüne Schrift); Schrittknöpfe zeigen „Schritt k“, Titel und Zeichen; Kontrollfrage „Probier es selbst“, Knopf „Nachsehen“, leere Eingabe meldet „Tippe zuerst eine Zahl ein, zum Beispiel 5 oder −4.“; Zeichenlegende als zugeklapptes `<details>` „Alle Zeichen auf einen Blick“ am Ende. Kompakt zeigt Was passiert?, Rechnung und Das nennt man.
- [ ] **Schritt 6: Werkstätten verallgemeinern.** `Workshop.id: string`, Bildauswahl über `PICTURES: Record<string, (p) => ReactNode>` in `Formelwerkstatt.tsx` (Schlüssel `mittel`, `streuung`, `zusammenhang`); `pictures/kit.tsx` mit wiederverwendbaren Bausteinen in Bildschirmpixeln (`useWidth`, Achse mit Ticks, ziehbarer Punkt mit 20-px-Trefferkreis und Slider-Rolle, Balken, Fläche unter einer Kurve, Linie, Gitterzelle), aus den bestehenden Bildern herausgelöst.
- [ ] **Schritt 7: Begriffskarte** (`Begriffskarte.tsx`, Typ `ConceptCard`) und **Tabellen-Werkzeug** (`TabellenWerkzeug.tsx`, Typ `TableTool`) mit je einem Muster: `muster/p-wert.ts` (Begriff `p_value`; Beispiel aus dem Lehrdatensatz: Unterschied der Lernzeit nach Weiterbildung, p = 0,876 aus `t_test`, in R nachgerechnet; Regler „Wie überraschend wäre das Ergebnis, wenn es keinen Unterschied gäbe?“) und `muster/dummy.ts` (Begriff `dummy`; fünf Personen mit `schulabschluss`, Wahl der Referenzkategorie, `mutate(… = rec(…))`). Beide in `muster/index.ts` als `AreaIndex` (Reiter-Inhalte füllt F3).
- [ ] **Schritt 8: Zuordnung** `content/index.ts` mit den 14 leeren Bereichsindizes (`{ explanations: {}, tabs: {} }`) und `muster`; `explainFor`, `tabsFor`, `stepCardFor`, `WORKSHOPS` lesen Pilot und `AREAS`. Doppelte Begriffs-IDs zwischen Bereichen werfen beim Laden einen Fehler (Test).
- [ ] **Schritt 9: Inhaltstests verallgemeinern.** `content.test.ts` läuft über **alle** registrierten Erklärungen (`WORKSHOPS`, alle `Explain` aus `AREAS`): alle Texte für alle Voreinstellungen × Begriffe × Personen ohne NaN/undefined/Infinity; `styleProblems` leer (Was passiert/Kurz gesagt/Warum mit `maxWords: 25`, Kurz gesagt mit `maxSentences: 2`); `say` vorhanden, wenn `sym` nicht leer; Fachbegriff = Kartentitel; jede Zahlfrage: richtige Antwort ohne Diagnose, Diagnosen beginnen mit „Fast!“; jede Begriffskarten-Frage hat genau eine richtige Option und für jede falsche Option eine „Fast!“- oder „Noch nicht ganz.“-Rückmeldung.
- [ ] **Schritt 10: Autorenleitfaden** `src/explain/AUTHORING.md`: Vorlagenwahl (Tabelle aus Spezifikation 4), Sprachleitfaden mit Beispielen „so nicht / so“ aus der Streuung, Dateikonventionen eines Bereichs (`content/<bereich>/<begriff>.ts`, `index.ts`, Bilder in `src/components/explain/pictures/<bereich>.tsx`, CSS in `src/explain/areas/<bereich>.css`, importiert von der Bilddatei), R-Nachrechnung als Test (`content/<bereich>/<bereich>.test.ts` mit festen Referenzwerten und dem R-Befehl im Kommentar), Browserprüfung (Skript aus F3).
- [ ] **Schritt 11:** Tests, `tsc`, Build grün; Browser: die sieben Pilotbegriffe und beide Muster öffnen ohne Konsolenfehler, Schrift ≥ 13 px. Commit, Bericht.

### Aufgabe F2: R global, `.sav`, R-Ausgaben

**Files:**
- Modify: `src/domain/mariposa.ts`, `src/domain/mariposaCatalog.ts`, `src/components/MariposaPanel.tsx`, `src/components/SurveyData.tsx`, `scripts/generate-mariposa-check.ts`, `scripts/verify-mariposa.R`, `MARIPOSA-ABDECKUNG.md`, Komponenten mit den Kleinfehlern (Spezifikation Lehrdatensatz, Abschnitt 9; nicht `ConceptInspector.tsx`/`PackageInspector.tsx`, ausgenommen eine Zeile, falls ein Kleinfehler nur dort liegt)
- Create: `src/domain/savWriter.ts`, `src/domain/savWriter.test.ts`, `src/domain/rTokens.ts`, `src/explain/rOutput.ts`, `src/explain/rOutput.test.ts`, `src/explain/fixtures/r-output/*.txt`, `src/explain/fixtures/r-output/catalog.json`, `scripts/capture-r-output.R`, `scripts/verify-sav.R`, `src/domain/mariposaCode.test.ts`

**Interfaces:**
- Produces:

```ts
// src/domain/mariposa.ts
export function startBlock(): string;   // library(dplyr)\nlibrary(mariposa)\n\natlas <- read_spss("Statistikatlas-200-Befragte.sav")
export function analysisCode(entry: AtlasEntry, s: RSettings, ranked?: boolean): string; // Startblock + Pipe-Aufruf
export function scriptFor(entry: AtlasEntry, s: RSettings): string;  // Skript zum Herunterladen, Kommentare in Klartext
export const SAV_NAME = 'Statistikatlas-200-Befragte.sav';
// src/domain/savWriter.ts
export function writeSav(rows: SurveyRow[]): Uint8Array;  // SPSS-Systemdatei, UTF-8, lange Namen, Variablen- und Wertelabels, Messniveau
// src/domain/rTokens.ts
export const RTOKENS: Record<string, TokenNote>;           // library, <-, read_spss, %>%, mutate, rec, summary, c, show, weights, group, use, conf.level, mu, by …
// src/explain/rOutput.ts – Druckformat mariposa 0.7.4
export function describeOutput(data: Record<string, number[]>, vars: string[], show: string[]): string;
export function pearsonOutput(x: number[], y: number[], xName: string, yName: string): string;
export function covOutput(name: string, value: number): string;      // dplyr/tibble 1 × 1
export function frequencyOutput(values: number[], labels: Record<number, string>, name: string, label?: string): string;
export const CATALOG_OUTPUT: Record<string, { code: string; output: string }>; // Schlüssel `${entryId}:${variant}`, aus catalog.json
```

- [ ] **Schritt 1: Codestil-Test zuerst.** `mariposaCode.test.ts`: für jedes Beispiel aus `exampleVariants()` beginnt `analysisCode` mit `startBlock()`, enthält `atlas %>%`, kein `d$`, kein `d <- `, kein `factor(`, kein `read.csv2`, kein `ifelse(`, kein `0.7.2`; `scriptFor` enthält keinen `stopifnot`. Schlägt fehl.
- [ ] **Schritt 2: 110 Vorlagen umstellen** (`{x}`-Platzhalter bleiben): `fn(d, …)` → `atlas %>%\n  fn(…)`; Spaltenzuweisungen → `mutate(…)`; Einheitsgewichte → `mutate(gewicht = 1)` mit Hinweis im Variantentext „Gewichte von 1 ändern nichts. So sieht der Aufruf mit Gewicht aus; im ALLBUS heißt das Gewicht wghtpew.“; Gruppen über Wertelabels der `.sav` (kein `factorCode`); wo eine Funktion einen Faktor braucht, `mutate(x = rec(x, rules = "…", as_factor = TRUE))` bzw. die von der R-Prüfung als nötig erkannte Form; Ergebnisobjekte bleiben, wo `summary()` folgt. Test grün.
- [ ] **Schritt 3: `.sav`-Schreiber.** Test zuerst: Rundreise mit kleinem Leser im Test (Kopf `$FL2`, Anzahl Variablen, lange Namen, Labels, Werte der ersten und letzten Person). Dann `writeSav`. Download „SPSS-Datei (.sav)“ im Datensatz-Dialog (Hauptknopf) und neben „CSV“; `verify-sav.R` liest mit `read_spss()` und `haven::read_sav()`, vergleicht alle 200 × 29 Werte mit der CSV und prüft Labels; ausführen und Ausgabe im Bericht nennen.
- [ ] **Schritt 4: Prüfstrecke auf 0.7.4 und `.sav`.** `generate-mariposa-check.ts` schreibt die `.sav` (über `writeSav`) und `start.R` = `startBlock()`; `verify-mariposa.R` prüft Version 0.7.4. Alle 110 Beispiele laufen gegen den Quellstand ohne `failed`; Warnungen im Bericht auflisten.
- [ ] **Schritt 5: R-Ausgaben.** `capture-r-output.R` erzeugt mit 0.7.4 (a) die Referenzausgaben der Leitaufrufe (`describe` mit `show = "mean"`, `c("mean","var")`, `c("mean","sd","var")`, `c("mean","sd","se")` auf `lernzeit`; `pearson_cor(lernzeit, wissenstest)`; `summarise(kovarianz = cov(lernzeit, wissenstest))`; `frequency(lernplanung5)`) für Ausgangsdaten, „alle + 1“ und „P002 = 40“ als Textdateien und (b) `catalog.json` mit Code und Ausgabe aller 110 Katalogbeispiele auf den Ausgangsdaten (Ausgabe per `capture.output(print(...))`, ANSI-Farben aus). Test zuerst: `rOutput.test.ts` vergleicht zeichengenau; dann `rOutput.ts`, bis grün.
- [ ] **Schritt 6: Version, Entwicklertexte, Kleinfehler.** `mariposaVersion = '0.7.4'`; „Geprüft an mariposa …“, „Der Atlas erklärt den Rechenweg … hier wird kein mariposa-Ergebnis berechnet“ und Hinweise auf Namespace/Quellstand aus dem Studierenden-UI entfernen (in `MARIPOSA-ABDECKUNG.md` für Lehrende festhalten); „· 5 Stufen · 5 Stufen“ nur einmal; Ergebnissätze mit Variablenname statt „X“ und zwei Nachkommastellen; `roleExplanation` mit Kurz gesagt vor dem Fachtext.
- [ ] **Schritt 7: Allgemeine Codelegende** `rTokens.ts` mit Fachbegriff, Aussprache (`<-` „bekommt“, `%>%` „und dann“), Kurz gesagt und typischem Fehler (zum Beispiel ohne `library(dplyr)`: „konnte Funktion "%>%" nicht finden“; `read_spss` mit falschem Pfad), Sprachleitfaden beachten (`styleProblems` im Test).
- [ ] **Schritt 8:** Tests, `tsc`, Build grün. Commit, Bericht (mit Ergebnis der R-Prüfstrecke und von `verify-sav.R`).

### Aufgabe F3: Reiter (nach Zusammenführung von F1 und F2)

**Files:**
- Create: `src/components/explain/{ExplainTabs,SampleTab,RTab,NextTab}.tsx`, `src/explain/sample.ts`, `src/explain/sample.test.ts`, `src/explain/content/pilot-tabs.ts`, `scripts/check-explanations.cjs`
- Modify: `src/explain/registry.ts` (Pilot-Reiter), `src/explain/content/muster/index.ts` (Reiter der Muster), `src/components/ConceptInspector.tsx`, `src/components/PackageInspector.tsx`, `src/components/MariposaPanel.tsx` (wird Teil von „In R“), `src/explain.css`
- Test: `src/explain/render.test.ts`, `src/explain/sample.test.ts`

**Interfaces:**
- Consumes: Typen aus F1 (`ConceptTabs`, `SampleTab`, `RTab`, `NextTab`, `ThinkSample`), `tabsFor`; aus F2 `analysisCode`, `RTOKENS`, `CATALOG_OUTPUT`, `describeOutput`, `pearsonOutput`, `covOutput`, `frequencyOutput`, `writeSav`, `SAV_NAME`.
- Produces:

```ts
// src/explain/sample.ts – reine Rechnung für „Mit 200 Befragten“
export function sampleSeries(rows: SurveyRow[], column: string): { values: number[]; mean: number; ss: number; variance: number; sd: number; sum: number; dev: number[]; sq: number[]; biggest: number };
export function samplePairs(rows: SurveyRow[], x: string, y: string): { cov: number; r: number | null; sx: number; sy: number; prod: number[] };
export function applyOp(rows: SurveyRow[], column: string, op: ThinkSample['tryIt']['op'], value?: number, person?: number): SurveyRow[];
export function abbreviated(values: number[], who: number, term: (v: number) => string): string; // erster, gewählter, letzter Term mit „…“
// scripts/check-explanations.cjs – Aufruf: BASE=http://127.0.0.1:<port> IDS=mean,sd OUT=<ordner> node scripts/check-explanations.cjs
// prüft je Begriff: öffnet über die Suche, alle Reiter per Tastatur, Konsolenfehler, kleinste Schrift, seitliches Überlaufen bei 1440 und 390 px; schreibt JSON nach OUT
```

- [ ] **Schritt 1:** `sample.test.ts` zuerst mit den Referenzwerten der Lernzeit (Summe 1.550,3; Mittelwert 7,7515; Quadratsumme 2.085,81955; s 3,237515; 141 von 200 innerhalb x̄ ± s; größter Beitrag P175 mit 18,4 h und (18,4 − 7,7515)² = 113,3906), Rundreise `applyOp` (`shift` lässt s gleich, `double` verdoppelt s, `outlier` mit 40 bei P002 ergibt s = 3,960). Dann `sample.ts`.
- [ ] **Schritt 2: Reiterleiste** `ExplainTabs` nach ARIA „Tabs“ (Pfeiltasten, Pos1/Ende, `hidden` statt Aushängen, Reiterwahl je Begriff für die Sitzung), Namen nach Vorlage (Spezifikation Ausbau Abschnitt 5). Rendertest: vier Reiter für `sd`, drei für `recode`, Reiter „Weiter“ für jeden registrierten Begriff.
- [ ] **Schritt 3: „Mit 200 Befragten“** (`SampleTab`): Brücke für Werkstätten nach Lehrdatensatz-Spezifikation 5.3 und 5.4 (Formel mit 200, Schrittzeilen, Person wählen, Punktdiagramm bzw. Streudiagramm, Deutung, Vorhersagen mit Ausprobieren und Rücksetzen auf dem gemeinsamen Lehrdatensatz, Hinweis bei veränderten Daten); Auswertung (`analysis`) für die übrigen Begriffe mit den vorhandenen Komponenten (`ColumnPicker`, `CasePicker`, `SurveyAnalysis`, `SurveyExperiment`, `Recipe`) unter Kurz gesagt und Deutung.
- [ ] **Schritt 4: „In R“** (`RTab`): `.sav`-Download, Leitaufruf mit antippbaren Zeichen (`RTOKENS` + `tokens`), „So antwortet R“ live (Leitaufrufe) oder aus `CATALOG_OUTPUT` mit Hinweis „Ausgabe für die Ausgangsdaten“ (bei veränderten Daten zusätzlich „Deine Daten sind verändert; R würde andere Zahlen zeigen.“), antippbare Zahlen nach `outputMap`, Kurz prüfen nach `check`, „Anderer Aufruf“ mit den Katalogvarianten, Kopieren, R-Skript.
- [ ] **Schritt 5: „Weiter“** (`NextTab`) mit Als Nächstes hervorgehoben; Fallback für Begriffe ohne `NextTab`-Text: bestehende Bezüge, Doppelungen zusammengeführt.
- [ ] **Schritt 6: Inhalte der Reiter** für die sieben Pilotbegriffe und die Muster (`pilot-tabs.ts`, `muster/index.ts`) mit dem Wortlaut des gebilligten Reiterbeispiels für `sd` und entsprechend für die übrigen; alle Zahlen aus den Daten.
- [ ] **Schritt 7: Einbindung** in `ConceptInspector` und `PackageInspector`: Begriffe mit `tabsFor(id)` zeigen Titel, Kurz gesagt, Reiter; die bisherigen Abschnitte wandern in die Reiter (Lehrdatensatz-Spezifikation 5.2); Begriffe ohne Reiter bleiben unverändert.
- [ ] **Schritt 8: `check-explanations.cjs`** schreiben und für die sieben Pilotbegriffe und die Muster laufen lassen: keine Fehler.
- [ ] **Schritt 9:** Tests, `tsc`, Build grün. Commit, Bericht.

### Aufgabe P1: Prüfung des Fundaments (zwei Agenten parallel, nur lesen)

- **P1a Fachlichkeit und Sprache:** alle Texte der Pilotbegriffe und Muster gegen Sprachleitfaden und Fachlichkeit; jede Zahl in R nachrechnen; R-Code gegen mariposa 0.7.4 ausführen; Befunde mit Datei, Zeile, Vorschlag.
- **P1b Code, Barrierefreiheit, Browser:** Diff `main..ausbau`; Reiter per Tastatur, Fokus, `hidden`, Zustandserhalt; `.sav`-Download; `check-explanations.cjs` bei 1920/1440/1280/1024/390; Schrift, Überlauf, Konsole.
- Koordinator arbeitet Befunde ein, Nachprüfung durch einen frischen Agenten.

### Aufgabe B1–B14: Bereichsinhalte (parallel, je ein Agent)

**Files (nur diese):** `src/explain/content/<bereich>/**`, `src/components/explain/pictures/<bereich>.tsx`, `src/explain/areas/<bereich>.css`, `src/explain/content/<bereich>/<bereich>.test.ts`. Gemeinsame Dateien nicht ändern; fehlt im Fundament etwas, im Bericht benennen und im eigenen Bereich überbrücken.

**Interfaces:**
- Consumes: `AUTHORING.md`, Typen aus `types.ts`, Bausteine aus `pictures/kit.tsx`, `style.ts`, `sample.ts`, `RTOKENS`, `CATALOG_OUTPUT`, Muster in `content/muster/`, die Pilotinhalte als Vorbild.
- Produces: `content/<bereich>/index.ts` als `AreaIndex` mit einer Erklärung (`explanations[id]`) und Reitern (`tabs[id]`) für **jeden** Begriff des Bereichs (Liste in der Ausbau-Spezifikation, Abschnitt 6); Detailbegriffe in B12 als `stepCards` oder Begriffskarten.

Schritte je Bereich:

- [ ] **Schritt 1: Zuordnung** jedes Begriffs zu einer Vorlage (Spezifikation Ausbau 4), Grenzfälle in einem Satz begründen; bestehende Inhalte des Begriffs lesen (`concepts.ts`, `learning.ts`, `explanations.ts`, `foundations/catalog.ts`, `mariposaCatalog.ts`), damit nichts Fachliches verloren geht.
- [ ] **Schritt 2: Referenzwerte in R** für jedes Beispiel (kleine Beispieldaten, Lehrdatensatz, ALLBUS-Aggregate) berechnen; R-Befehle in `content/<bereich>/<bereich>.test.ts` als Kommentar, Werte als Assertions. Test schlägt fehl, solange die Inhalte fehlen.
- [ ] **Schritt 3: Begriff für Begriff schreiben** (je Begriff eine Datei), nach jedem Begriff Tests laufen lassen und committen. Ton: Sprachleitfaden, Vorbild Streuung.
- [ ] **Schritt 4: Reiter je Begriff:** `next` immer; `sample`, wenn der Lehrdatensatz passt; `r`, wenn der Katalog einen Aufruf hat (`outputMap` gegen `CATALOG_OUTPUT` prüfen).
- [ ] **Schritt 5: Bilder** nur, wo nötig, aus `kit.tsx` zusammengesetzt; ziehbare Punkte mit Tastatur.
- [ ] **Schritt 6: Prüfen:** Tests (inklusive der allgemeinen Inhalts- und Sprachtests), `tsc`, Build; `check-explanations.cjs` für alle Begriffe des Bereichs bei 1440 und 390 px ohne Befund. Commit, Bericht mit Zuordnungstabelle.

### Aufgabe P2: Prüfung der Bereiche

- Fünf Begutachtungsagenten, je zwei bis drei Bereiche: Fachlichkeit und Sprache (jede Zahl in R, Ton, Fachbegriffe), Code und Browser (`check-explanations.cjs`, Tastatur, Bilder). Befunde mit Datei, Zeile, Vorschlag.
- Koordinator lässt Befunde von den Bereichsagenten (fortgesetzt) oder selbst einarbeiten; Nachprüfung.

### Aufgabe I: Zusammenführen

- [ ] Bereichszweige nacheinander in `ausbau` mergen (Konflikte sollte es nicht geben; sonst lösen).
- [ ] Gesamtprüfung: alle Tests mit `ALLBUS_SAV`, `tsc`, Build, Offline-Export, R-Prüfstrecke (110 Beispiele), `verify-sav.R`, `check-explanations.cjs` über **alle** Begriffe und Detailbegriffe bei 1440 und 390 px, die Browser-Prüfungen von Werkstatt und Werkbank.
- [ ] Abschlussprüfung durch einen frischen Agenten (Stichprobe von 20 Begriffen quer durch alle Bereiche: Ton, Fachlichkeit, Zahlen).
- [ ] `ausbau` per Fast-Forward nach `main`; README und `UMSETZUNG-Pruefstand.md` aktualisieren; Worktrees und Zweige aufräumen; Offline-Datei neu bauen.
