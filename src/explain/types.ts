/**
 * Inhaltsmodell der Erklärungen in der freien Karte. Grundlage: Spezifikation
 * docs/superpowers/specs/2026-10-01-freie-karte-ausbau-alle-knoten-design.md (führend, Abschnitte 2–4) und
 * docs/superpowers/specs/2026-09-30-freie-karte-formelwerkstatt-pilot-design.md (Abschnitt 8.2).
 * Inhalte sind reines TypeScript ohne React, damit sie in Node getestet werden können.
 * Wie man damit schreibt, steht in src/explain/AUTHORING.md.
 */
import type { TokenNote } from '../domain/rTokens';
import type { Pairs, PairStats, Series } from './math';

/** Kontext zum Füllen der Texte: Kennwerte der Beispieldaten und gewählte Person/Zelle. */
export type Ctx<S> = { s: S; who: number; names: readonly string[] };
/** Fester Text oder Text aus den aktuellen Beispieldaten. */
export type Text<S> = string | ((c: Ctx<S>) => string);
export const txt = <S,>(t: Text<S>, c: Ctx<S>): string => typeof t === 'function' ? t(c) : t;

/**
 * Formelknoten. `m` koppelt einen Teil an einen Schritt (Zahl, Werkstatt) oder an ein
 * Zeichen (Text, Formel als Satz); gekoppelte Teile werden hervorgehoben und sind anklickbar.
 */
export type FNode =
  | string
  | { part: FNode[]; m: number | string }
  | { frac: FNode[]; den: FNode[]; m: number | string }
  | { root: FNode[]; m: number | string }
  | { big: string; m: number | string }
  | { sub: string }
  | { br: true };

/** Eintrag in „Alle Zeichen auf einen Blick“; `step` ist der Schritt, in dem das Zeichen gebraucht wird. */
export interface Glyph { sym: string; say?: string; term: string; plain: string; step: number }

/** Zahlfrage „Probier es selbst“. Die richtige Antwort bekommt keine Diagnose; Diagnosen beginnen mit „Fast!“. */
export interface Check<S> {
  /** Frage in Alltagssprache („Wo liegt die Mitte dieser Gruppe?“). */
  question: Text<S>;
  answer: (c: Ctx<S>) => number | 'NA';
  /** Rückmeldung für eine erkennbare Fehlantwort („Fast! …“), sonst null (dann folgt der allgemeine Hinweis). */
  diagnose: (c: Ctx<S>, v: number | 'NA') => string | null;
}

/** Ein Schritt der Werkstatt, angezeigt als Lernkarte (Spezifikation Ausbau, Abschnitt 3). */
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

/** Spalte der Rechentabelle: erscheint ab Schritt `from`, ist in den Schritten `active` hervorgehoben. */
export interface Column<S> {
  head: string;
  from: number;
  active: number[];
  cell: (c: Ctx<S>, row: number) => string;
  /** Eintrag der Summenzeile; ab `sumFrom` (sonst „…“). */
  sum?: (c: Ctx<S>) => string;
  sumFrom?: number;
  sumNote?: string;
  /** Farbe einer Zelle nach Vorzeichen, zum Beispiel für negative Produkte. */
  tone?: (c: Ctx<S>, row: number) => 'pos' | 'neg' | undefined;
}
/** Rechenzeile unter der Tabelle, ab Schritt `from`, hervorgehoben in Schritt `step`. */
export interface Line<S> { from: number; step: number; text: (c: Ctx<S>) => string }

/** Denkfrage „Mit der Formel denken“; `tryIt` setzt passende Beispieldaten. */
export interface Think<D, S> {
  question: string;
  /** Abweichende Frage für einzelne Begriffe (zum Beispiel s² statt s). */
  questionFor?: Partial<Record<string, string>>;
  options: string[];
  correct: number;
  step: number;
  /** Schritt, wenn der Begriff früher endet (zum Beispiel Kovarianz statt Pearson). */
  stepFor?: Partial<Record<string, number>>;
  explain: Text<S>;
  kurz: string;
  tryIt?: { label: string; apply: (d: D) => D };
}

export interface Metric<S> { label: string; value: (c: Ctx<S>) => string }

/** Ein Begriff, den eine Werkstatt erklärt (zum Beispiel `variance` endet nach Schritt 5, `sd` nach Schritt 6). */
export interface Variant<S> {
  lastStep: number;
  kurz: string;
  fachlich: string;
  symbolic: FNode[];
  aria: string;
  metrics: Metric<S>[];
  /** „Was heißt das Ergebnis?“: `kurz` ist eine Aussage über Menschen (Regel 9), `fachlich` die genaue Fassung. */
  interpret: (c: Ctx<S>) => { kurz: string; fachlich: string };
  /** Verweis unter der Deutung, zum Beispiel von der Varianz zur Standardabweichung. */
  next?: { id: string; label: string };
  genau: { kurz: string; paragraphs: (c: Ctx<S>) => string[] };
}

/**
 * Werkstatt (Vorlage 1): Formel als Navigator, Lernkarte je Schritt, Rechentabelle, Bild, Ausprobieren.
 * `D` sind die Beispieldaten (zum Beispiel fünf Werte), `S` die daraus berechneten Kennwerte.
 */
export interface Workshop<D, S> {
  /** Beliebige, eindeutige Kennung („streuung“); Schrittkarten verweisen darauf. */
  id: string;
  wofuer: string;
  /** Mut-Satz zu Beginn (Regel 6): Formel in kleine bekannte Handlungen zerlegen, R rechnet später. */
  mut: string;
  /** Schlüssel im Bild-Register `PICTURES` (src/components/explain/pictures/register.ts), Bild mit `forWorkshop`. */
  picture: string;
  /** Hinweis neben den Voreinstellungen; ohne Angabe „Fünf Beispielpersonen. Die Punkte im Bild lassen sich ziehen.“ (Zahl aus `names`). */
  dataNote?: string;
  names: readonly string[];
  bounds: { min: number; max: number };
  presets: { id: string; label: string; data: D }[];
  compute: (d: D) => S;
  /** Für „Alle Zeichen auf einen Blick“ am Ende der Werkstatt. */
  glyphs: Glyph[];
  steps: Step<S>[];
  numeric: (c: Ctx<S>, lastStep: number) => FNode[];
  table: { columns: Column<S>[]; lines: Line<S>[] };
  captions: Partial<Record<number, string>>;
  think: Think<D, S>[];
  variants: Record<string, Variant<S>>;
  /**
   * Brücke „Mit 200 Befragten“ (Reiter, Spezifikation Lehrdatensatz 5.3): dieselbe Formel mit allen 200 Befragten.
   * Nur für Werkstätten, deren Daten eine Spalte (`number[]`) oder ein Spaltenpaar (`Pairs`) sind; `compute`
   * rechnet dann auch die 200. Ohne Brücke bekommt der Begriff im Reiter eine Auswertung (`analysis`).
   */
  bridge?: Bridge<S>;
}

// Brücke „Mit 200 Befragten“ ------------------------------------------------------------

/** Spalte des Lehrdatensatzes, wie die Brücke sie nennt (Titel, Einheit, Fragetext aus src/domain/survey.ts). */
export interface SampleColumn { id: string; title: string; unit: string; question: string }

/** Kontext der Brücke: Kennwerte der Werkstatt auf allen 200 Befragten, die gewählte Person und die Spalten. */
export interface BridgeCtx<S> {
  /** `workshop.compute` mit den Werten aller 200 (Reihe) bzw. `{ x, y }` (Paare). */
  s: S;
  /** Index der gewählten Person (0 bis 199). */
  who: number;
  /** Kennungen der Befragten, P001 bis P200. */
  names: readonly string[];
  /** Werte der Spalte x aller 200; bei Paaren `values2` für y. */
  values: number[];
  values2?: number[];
  col: SampleColumn;
  col2?: SampleColumn;
  /** Zahl mit der Einheit der Spalte x und höchstens zwei Nachkommastellen („3,24 h“); `squared` für Varianzen („10,48 h²“). */
  u: (v: number, opts?: { squared?: boolean; digits?: number }) => string;
}

/** Was das Bild der 200 in einem Schritt zeigt; die Oberfläche zeichnet Punkt- bzw. Streudiagramm selbst. */
export interface BridgePicture {
  /** Mittelwertlinie (Reihe) oder Achsenkreuz aus x̄ und ȳ (Paare), gestrichelt. */
  center?: number | [number, number];
  /** Abstand der gewählten Person zur Mitte als Strecke (Reihe) bzw. Rechteck (Paare). */
  deviation?: boolean;
  /** Band, zum Beispiel x̄ ± s. */
  band?: [number, number];
  /** Rechenbeiträge aller 200 (zum Beispiel die Quadrate in Schritt 4), absteigend als schmale Balken. */
  contributions?: { label: string; values: number[] };
  /** Paare: Plus- und Minusflächen färben (Punkte nach dem Vorzeichen ihres Produkts). */
  quadrants?: boolean;
}

/**
 * Brücke einer Werkstatt zu den 200 Befragten. Texte sind Funktionen des Kontexts, damit sie nach
 * „Ausprobieren“ und nach eigenen Datenänderungen stimmen. Vorbild: src/explain/content/pilot-tabs.ts.
 */
export interface Bridge<S> {
  /** Eine Spalte (Punktdiagramm) oder zwei (Streudiagramm). */
  data: 'series' | 'pairs';
  /** Eingesetzte Formel mit 200, gekürzt auf ersten, gewählten und letzten Summanden (Helfer `sumNodes`). */
  numeric: (c: BridgeCtx<S>, lastStep: number) => FNode[];
  /** Je Schritt der Werkstatt zwei Zeilen: „Schritt k für alle 200“ und „Vorgerechnet für P002“. */
  lines: { all: (c: BridgeCtx<S>) => string; person: (c: BridgeCtx<S>) => string }[];
  /** Kennzahlen über der Formel (n, Mittelwert, Ergebnis) mit Einheit und zwei Nachkommastellen; die letzte ist das Ergebnis. */
  metrics: (c: BridgeCtx<S>, variant: string) => { label: string; value: string }[];
  /** „Was heißt das Ergebnis?“: Aussage über Menschen, Fachsprache und eine datenwahre Zusatzaussage. */
  interpret: (c: BridgeCtx<S>, variant: string) => { kurz: string; fachlich: string; zusatz?: string };
  /** Voraussetzung, unter der das Ergebnis gilt. */
  voraussetzung: (c: BridgeCtx<S>, variant: string) => string;
  picture: (c: BridgeCtx<S>, step: number) => BridgePicture;
}

// Formel als Satz (Vorlage 2) ---------------------------------------------------------

/**
 * Zeichen der Formel als Satz. Mit `concept` ist `term` der Titel dieses Begriffs in concepts.ts (Regel 2, geprüft)
 * und die Karte verlinkt ihn; ohne `concept` (kein passender Begriff in der Karte) steht `term` frei da.
 */
export interface SentenceGlyph { key: string; sym: string; say: string; term: string; plain: string; concept?: string }
export interface Slider { key: string; label: string; min: number; max: number; step: number; log?: boolean; format: (v: number) => string }

export interface SentenceTemplate<V extends Record<string, number>, S> {
  concept: string;
  wofuer: string;
  kurz: string;
  fachlich: string;
  initial: V;
  compute: (v: V) => S;
  metrics: { label: string; value: (s: S) => string }[];
  glyphs: SentenceGlyph[];
  symbolic: FNode[];
  aria: string;
  numeric: (s: S) => FNode[];
  sentence: (string | { m: string; t: string })[];
  /** „Vorgerechnet“ in Mini-Schritten; `title` ist eine Handlung. */
  worked: (s: S) => { title: string; text: string }[];
  /** „Aufgepasst“: der typische Fehler, ermutigend formuliert. */
  fehler: string;
  sliders: Slider[];
  quick: { label: string; mark: string; apply: (v: V) => V }[];
  compare: (s: S) => string;
  /** `right` beginnt mit „Genau“, `diagnose` mit „Fast!“ (erkennbarer Fehler) oder „Noch nicht ganz.“. */
  check: { question: string; answer: number; tolerance: number; right: string; diagnose: (v: number) => string };
  interpret: (s: S) => { kurz: string; fachlich: string };
  think: { question: string; options: string[]; correct: number; mark: string; explain: string; kurz: string; hint: string };
  genau: { kurz: string; paragraphs: string[] };
  /** Optionales Bild über den Reglern; Schlüssel im Bild-Register, Bild mit `forSentence`. */
  picture?: string;
}

// Begriffskarte und Tabellen-Werkzeug (Vorlagen 3 und 4) ------------------------------

/** Denkfrage mit Vorhersage: erst tippen, dann nachsehen. */
export interface ThinkItem {
  question: string; options: string[]; correct: number;
  explain: string; kurz: string;
  step?: number;               // Formelschritt, auf den die Rückmeldung verweist
}

/** Begriffskarte für Begriffe ohne Rechenkern (Spezifikation Ausbau, Abschnitt 4). */
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
  /** Optionales Bild nach „Stell dir vor …“, mit dem Regler darunter; Schlüssel im Bild-Register, Bild mit `forCard`. */
  picture?: string;
}

/** Tabellen-Werkzeug: fünf Personen vorher, die Operation in Schritten, nachher, der mariposa-Aufruf. */
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
  /** Optionales Bild nach der Tabelle „Nachher“; Schlüssel im Bild-Register, Bild mit `forTable`. */
  picture?: string;
}

// Reiter (Oberfläche in F3, Typen schon hier) ------------------------------------------

/**
 * Reiter „Mit 200 Befragten“. `bridge` für Werkstätten mit `Workshop.bridge` (Formel mit 200, Schritte, Person, Bild);
 * `variable` ist die Spalte, für die die Vorhersagefragen geschrieben sind (bei Paaren die Spalte x).
 * `analysis` für alle übrigen Begriffe: Kurz gesagt, Ergebnis mit Deutung aus den aktuellen Daten, Voraussetzung,
 * mindestens eine Vorhersagefrage. Ohne `columns` gelten die Spalten der Spaltenwahl (x, y) und der R-Einstellungen
 * (Rollen wie `group`), und oben steht die Spaltenwahl; mit `columns` (Rolle → Spalten-ID) rechnet der Reiter fest damit.
 */
export type SampleTab =
  | { kind: 'bridge'; workshop: string; variant: string; variable: string; think: ThinkSample[] }
  | { kind: 'analysis'; kurz: string; result: (c: SampleCtx) => { kurz: string; fachlich: string; zusatz?: string }; voraussetzung?: string; think: ThinkSample[]; columns?: Record<string, string> };
/** Daten der Auswertung: die aktuellen 200 Befragten und die Spalten je Rolle (`x`, `y`, `group`, …). */
export interface SampleCtx { rows: import('../domain/survey').SurveyRow[]; columns: Record<string, string[]> }
/**
 * Vorhersagefrage mit „Ausprobieren“: `op` ändert die Spalte `column` (Rolle x oder y) im gemeinsamen Lehrdatensatz.
 * `shift` um `value` (sonst 1), `double` mal `value` (sonst 2), `outlier`: die gewählte Person bekommt `value`,
 * `constant`: alle bekommen `value` (sonst den Mittelwert), `reverse`: umpolen (Minimum + Maximum − Wert).
 * `step` verweist auf den Formelschritt. Rechnung: src/explain/sample.ts (`applyOp`).
 */
export interface ThinkSample extends ThinkItem { tryIt: { label: string; op: 'shift' | 'double' | 'outlier' | 'constant' | 'reverse'; column: 'x' | 'y'; value?: number } }
/** Lernkarte zu einem Zeichen im R-Code (Codelegende); eine Quelle für Katalog und Erklärungen (src/domain/rTokens.ts). */
export type { TokenNote };
/**
 * Leitaufruf, dessen Ausgabe der Atlas selbst aus den aktuellen Daten druckt (src/explain/rOutput.ts), also auch
 * nach „Ausprobieren“: `describe(x, show = …)` (show aus mean, sd, se, var, min, max, range), `pearson_cor(x, y)`,
 * `summarise(kovarianz = cov(x, y))`, `frequency(x)` und `frequency()` nach `rec()` mit umgepolten Codes.
 */
export type LiveCall =
  | { fn: 'describe'; show: string[] }
  | { fn: 'pearson_cor' }
  | { fn: 'cov' }
  | { fn: 'frequency' }
  | { fn: 'rec_frequency' };
/**
 * Reiter „In R“. Leitaufruf ist die Katalogvariante `entry`/`variant` mit der in R erfassten Ausgabe für die
 * Ausgangsdaten (CATALOG_OUTPUT), oder `live`, dann druckt der Atlas die Ausgabe selbst; `entry` nennt dann nur die
 * Katalogvarianten unter „Anderer Aufruf“ ('' für keine).
 * `outputMap`: `match` findet eine Zahl in der Ausgabe, zuerst als „match = Zahl“ („r = 0.539“, „mean=3.26“), sonst
 * als Spaltenkopf mit der Zahl darunter („SD“ über 3.238), sonst den Text selbst. `atlas` ist der Begriff im Atlas
 * („s“), `step` der Formelschritt, `explain` ein Satz zur Verbindung.
 * `check` („Kurz prüfen“): `correct` und die Schlüssel von `wrong` sind `match`-Werte; `wrong` beginnt mit „Fast!“.
 */
export interface RTab {
  entry: string;                         // Katalog-ID in mariposaCatalog
  variant: number;                       // Leitaufruf
  live?: LiveCall;
  tokens?: Record<string, TokenNote>;    // Ergänzungen zur allgemeinen Codelegende (Funktion, Argumente)
  outputMap: { match: string; atlas: string; step?: number; explain: string }[]; // „SD“ ↔ „s, Schritt 6“
  check: { question: string; correct: string; wrong: Record<string, string> };   // Schlüssel = match
}
/**
 * Reiter „Weiter“: `next` steht hervorgehoben oben („Als Nächstes“), dann „Das geht voraus“ (`before`) und
 * „Daraus entsteht“ (`after`), je Ziel ein Satz. Leere Listen füllt die Oberfläche aus den Bezügen der Karte,
 * doppelte Ziele zusammengeführt; `more` und die übrigen Bezüge stehen zugeklappt darunter.
 */
export interface NextTab { next: { id: string; why: string }; before: { id: string; why: string }[]; after: { id: string; why: string }[]; more?: { id: string; why: string }[] }
export interface ConceptTabs { sample?: SampleTab; r?: RTab; next: NextTab }

// Zuordnung -----------------------------------------------------------------------------

export type AnyWorkshop = Workshop<number[], Series> | Workshop<Pairs, PairStats> | Workshop<any, any>; // Pilot-Typen bleiben, neue Werkstätten bringen eigene D und S
export type AnySentence = SentenceTemplate<any, any>;
export type RecodeTemplate = typeof import('./content/rekodieren').rekodieren;

/** Welche Vorlage ein Begriff bekommt. Bei `werkstatt` ist `variant` der Begriff, zum Beispiel „sd“. */
export type Explain =
  | { kind: 'werkstatt'; workshop: AnyWorkshop; variant: string }
  | { kind: 'satz'; template: AnySentence }
  | { kind: 'werkzeug'; template: RecodeTemplate }
  | { kind: 'tabelle'; tool: TableTool }
  | { kind: 'begriff'; card: ConceptCard };

/**
 * Inhalt eines Bereichs (src/explain/content/<bereich>/index.ts). Schlüssel sind Begriffs-IDs der Karte;
 * `stepCards` macht einen Rechenbegriff zur Schrittkarte einer Werkstatt (Werkstatt-ID, Begriff, Schritt).
 */
export interface AreaIndex {
  explanations: Record<string, Explain>;
  tabs: Record<string, ConceptTabs>;
  stepCards?: Record<string, { workshop: string; variant: string; step: number }>;
}
