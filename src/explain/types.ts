/**
 * Inhaltsmodell der Erklärungen in der freien Karte (Spezifikation
 * docs/superpowers/specs/2026-09-30-freie-karte-formelwerkstatt-pilot-design.md, Abschnitt 8.2).
 * Inhalte sind reines TypeScript ohne React, damit sie in Node getestet werden können.
 */

/** Kontext zum Füllen der Texte: Kennwerte der Beispieldaten und gewählte Person/Zelle. */
export type Ctx<S> = { s: S; who: number; names: readonly string[] };
export type Text<S> = string | ((c: Ctx<S>) => string);
export const txt = <S,>(t: Text<S>, c: Ctx<S>): string => typeof t === 'function' ? t(c) : t;

/**
 * Formelknoten. `m` koppelt einen Teil an einen Schritt (Zahl, Stufe 1) oder an ein
 * Zeichen (Text, Stufe 2); gekoppelte Teile werden hervorgehoben und sind anklickbar.
 */
export type FNode =
  | string
  | { part: FNode[]; m: number | string }
  | { frac: FNode[]; den: FNode[]; m: number | string }
  | { root: FNode[]; m: number | string }
  | { big: string; m: number | string }
  | { sub: string }
  | { br: true };

export interface Glyph { sym: string; say?: string; term: string; plain: string; step: number }

export interface Check<S> {
  question: Text<S>;
  answer: (c: Ctx<S>) => number | 'NA';
  /** Rückmeldung für eine erkennbare Fehlantwort, sonst null. */
  diagnose: (c: Ctx<S>, v: number | 'NA') => string | null;
}

export interface Step<S> {
  /** Zeichen auf dem Schrittknopf, zum Beispiel „xᵢ − x̄“. */
  button: string;
  /** Zeichen in der Lernkarte. */
  sym: string;
  /** Verlinkter Begriff; sein Titel in concepts.ts ist der Fachbegriff. */
  concept: string;
  also?: string;
  kurz: Text<S>;
  fachlich: Text<S>;
  /** Überschrift über „Vorgerechnet“; Personenwahl nur, wenn `perPerson`. */
  perPerson: boolean;
  vorgerechnet: Text<S>;
  alltag: string;
  warum: string;
  fehler: Text<S>;
  check: Check<S>;
}

export interface Column<S> {
  head: string;
  from: number;
  active: number[];
  cell: (c: Ctx<S>, row: number) => string;
  /** Eintrag der Summenzeile; ab `sumFrom` (sonst „…“). */
  sum?: (c: Ctx<S>) => string;
  sumFrom?: number;
  sumNote?: string;
}
export interface Line<S> { from: number; step: number; text: (c: Ctx<S>) => string }

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

export interface Variant<S> {
  lastStep: number;
  kurz: string;
  fachlich: string;
  symbolic: FNode[];
  aria: string;
  metrics: Metric<S>[];
  interpret: (c: Ctx<S>) => { kurz: string; fachlich: string };
  genau: { kurz: string; paragraphs: (c: Ctx<S>) => string[] };
}

export interface Workshop<D, S> {
  id: 'mittel' | 'streuung' | 'zusammenhang';
  wofuer: string;
  names: readonly string[];
  bounds: { min: number; max: number };
  presets: { id: string; label: string; data: D }[];
  compute: (d: D) => S;
  glyphs: Glyph[];
  steps: Step<S>[];
  numeric: (c: Ctx<S>, lastStep: number) => FNode[];
  table: { columns: Column<S>[]; lines: Line<S>[] };
  captions: Partial<Record<number, string>>;
  think: Think<D, S>[];
  variants: Record<string, Variant<S>>;
}

// Stufe 2: Formel als Satz ------------------------------------------------------------

export interface SentenceGlyph { key: string; sym: string; say: string; term: string; plain: string; concept: string }
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
  worked: (s: S) => { title: string; text: string }[];
  fehler: string;
  sliders: Slider[];
  quick: { label: string; mark: string; apply: (v: V) => V }[];
  compare: (s: S) => string;
  check: { question: string; answer: number; tolerance: number; right: string; diagnose: (v: number) => string };
  interpret: (s: S) => { kurz: string; fachlich: string };
  think: { question: string; options: string[]; correct: number; mark: string; explain: string; kurz: string; hint: string };
  genau: { kurz: string; paragraphs: string[] };
}
