/**
 * Reine Rechnung für den Reiter „Mit 200 Befragten“ (Spezifikation Lehrdatensatz und R, Abschnitte 5.3 und 5.4):
 * Kennwerte einer Spalte oder eines Spaltenpaars der 200 Befragten, die Datenänderungen der Vorhersagefragen
 * („Erst tippen, dann ausprobieren“) und die gekürzte Formel mit erstem, gewähltem und letztem Summanden.
 * Ohne React, damit Tests und Inhalte (src/explain/content) es direkt nutzen können.
 */
import { columnById, createSurvey, type SurveyRow } from '../domain/survey';
import type { BridgeCtx, FNode, SampleColumn, ThinkSample } from './types';
import { relate, series } from './math';
import { num } from './format';

/** Die Werte einer Spalte für alle Befragten, in der Reihenfolge der Daten (P001 bis P200). */
export function sampleColumn(rows: readonly SurveyRow[], column: string): number[] {
  return rows.map(r => r.values[column]);
}

/** Index des größten Werts (bei Gleichstand der erste). */
export function biggestIndex(values: readonly number[]): number {
  let best = 0;
  values.forEach((v, i) => { if (v > values[best]) best = i; });
  return best;
}

/**
 * Kennwerte einer Spalte: Summe, Mittelwert, Abweichungen, Quadrate, Quadratsumme, Varianz (n − 1), s und
 * `biggest`, der Index der Person mit dem größten Beitrag zur Quadratsumme.
 */
export function sampleSeries(rows: readonly SurveyRow[], column: string): { values: number[]; mean: number; ss: number; variance: number; sd: number; sum: number; dev: number[]; sq: number[]; biggest: number } {
  const values = sampleColumn(rows, column), s = series(values);
  return { values, mean: s.mean, ss: s.ss, variance: s.variance, sd: s.sd, sum: s.sum, dev: s.dev, sq: s.sq, biggest: biggestIndex(s.sq) };
}

/**
 * Kennwerte eines Spaltenpaars: Kovarianz, r (null, wenn eine Spalte nicht streut), beide Standardabweichungen,
 * die Abweichungsprodukte je Person und `biggest`, der Index des betragsgrößten Produkts.
 */
export function samplePairs(rows: readonly SurveyRow[], x: string, y: string): { cov: number; r: number | null; sx: number; sy: number; prod: number[]; biggest: number } {
  const s = relate(sampleColumn(rows, x), sampleColumn(rows, y));
  return { cov: s.cov, r: s.r, sx: s.x.sd, sy: s.y.sd, prod: s.prod, biggest: biggestIndex(s.prod.map(Math.abs)) };
}

/** Rundungsreste aus Gleitkommarechnungen entfernen (7,3 · 2 = 14,6 statt 14,600000000000001). */
const tidy = (v: number) => Number(v.toFixed(6));

/**
 * Ändert eine Spalte für die Vorhersagefragen und gibt neue Daten zurück (die alten bleiben unberührt):
 * - `shift`: alle um `value` verschieben (ohne Angabe um 1),
 * - `double`: alle mit `value` malnehmen (ohne Angabe mal 2),
 * - `outlier`: Person `person` (Index, ohne Angabe die erste) bekommt den Wert `value` (ohne Angabe das Doppelte des größten Werts),
 * - `constant`: alle bekommen `value` (ohne Angabe den Mittelwert),
 * - `reverse`: umpolen innerhalb des Wertebereichs der Spalte (Minimum + Maximum − Wert, „20 − Aufgaben“).
 * Ob die neuen Werte zur Spalte passen (Wertebereich, Schrittweite), prüft die Oberfläche (`fitsColumn`).
 */
export function applyOp(rows: readonly SurveyRow[], column: string, op: ThinkSample['tryIt']['op'], value?: number, person?: number): SurveyRow[] {
  const values = sampleColumn(rows, column), mean = values.reduce((a, b) => a + b, 0) / values.length;
  const c = columnById[column], lo = c?.min ?? Math.min(...values), hi = c?.max ?? Math.max(...values);
  const next = (v: number, i: number) => {
    switch (op) {
      case 'shift': return v + (value ?? 1);
      case 'double': return v * (value ?? 2);
      case 'outlier': return i === (person ?? 0) ? (value ?? 2 * Math.max(...values)) : v;
      case 'constant': return value ?? mean;
      case 'reverse': return lo + hi - v;
    }
  };
  return rows.map((r, i) => ({ ...r, values: { ...r.values, [column]: tidy(next(r.values[column], i)) } }));
}

/** Wie viele Werte zwischen `lo` und `hi` liegen (Grenzen eingeschlossen). */
export function countWithin(values: readonly number[], lo: number, hi: number): number {
  return values.filter(v => v >= lo - 1e-9 && v <= hi + 1e-9).length;
}

let base: SurveyRow[] | null = null;
/** Ausgangsdaten des Lehrdatensatzes (einmal erzeugt): Vergleich für „Deine Daten sind verändert“, Ersatz ohne eigene Daten. */
export const baseSurvey = (): SurveyRow[] => base ??= createSurvey();

/** Ob die Daten von den Ausgangsdaten abweichen (gleiche Personen, gleiche Werte in jeder Spalte). */
export function modifiedFrom(rows: readonly SurveyRow[], base: readonly SurveyRow[]): boolean {
  if (rows.length !== base.length) return true;
  return rows.some((r, i) => {
    const b = base[i];
    if (r.id !== b.id) return true;
    const keys = Object.keys(b.values);
    return keys.length !== Object.keys(r.values).length || keys.some(k => r.values[k] !== b.values[k]);
  });
}

/**
 * Gekürzte Summe für die Formel mit 200: erster Term, der Term der gewählten Person, letzter Term, dazwischen „…“.
 * Liegt die gewählte Person am Rand oder direkt daneben, fällt das überflüssige „…“ weg.
 */
export function abbreviated(values: readonly number[], who: number, term: (v: number) => string, sep = ' + '): string {
  const last = values.length - 1;
  const shown = [...new Set([0, Math.max(0, Math.min(who, last)), last])].sort((a, b) => a - b);
  const parts: string[] = [];
  shown.forEach((i, k) => {
    if (k > 0 && i - shown[k - 1] > 1) parts.push('…');
    parts.push(term(values[i]));
  });
  return parts.join(sep);
}

/**
 * Ob alle Werte einer Spalte zu ihr passen: im Wertebereich, auf der Schrittweite, bei Kategorien ein Antwortcode.
 * Die Oberfläche bietet „Ausprobieren“ nur an, wenn das Ergebnis passt (sonst lehnt der Datensatz die Werte ab).
 */
export function fitsColumn(rows: readonly SurveyRow[], column: string): boolean {
  const c = columnById[column];
  if (!c) return false;
  return rows.every(r => {
    const v = r.values[column];
    return Number.isFinite(v) && v >= c.min - 1e-9 && v <= c.max + 1e-9
      && (c.categories ? c.categories.some(k => k.value === v) : Math.abs(v / c.step - Math.round(v / c.step)) < 1e-6);
  });
}

/** Spalte mit Titel, Einheit und Fragetext (ohne äußere Anführungszeichen). */
export function sampleColumnInfo(id: string): SampleColumn {
  const c = columnById[id];
  return c ? { id, title: c.title, unit: c.unit, question: c.question } : { id, title: id.toUpperCase(), unit: '', question: '' };
}

/** Zahl mit Einheit der Spalte, höchstens zwei Nachkommastellen: „3,24 h“, quadriert „10,48 h²“, ohne Einheit nur die Zahl. */
export function unitText(col: SampleColumn, v: number, opts: { squared?: boolean; digits?: number } = {}): string {
  const t = num(v, opts.digits ?? 2), u = col.unit;
  if (!u) return t;
  return opts.squared ? `${t} ${u.includes('/') ? `(${u})²` : `${u}²`}` : `${t} ${u}`;
}

/**
 * Kontext der Brücke „Mit 200 Befragten“: `compute` ist die Rechnung der Werkstatt, angewandt auf die Werte aller
 * Befragten (Reihe: Spalte x; Paare: `{ x, y }`). `who` ist der Index der gewählten Person.
 */
export function bridgeContext<S>(compute: (d: any) => S, data: 'series' | 'pairs', rows: readonly SurveyRow[], x: string, y: string, who: number): BridgeCtx<S> {
  const values = sampleColumn(rows, x), col = sampleColumnInfo(x);
  const values2 = data === 'pairs' ? sampleColumn(rows, y) : undefined;
  return {
    s: compute(data === 'pairs' ? { x: values, y: values2 } : values),
    who: Math.max(0, Math.min(rows.length - 1, who)),
    names: rows.map(r => r.id),
    values, values2, col,
    col2: data === 'pairs' ? sampleColumnInfo(y) : undefined,
    u: (v, opts) => unitText(col, v, opts),
  };
}

/**
 * Gekürzte Summe als Formelknoten: erster, gewählter und letzter Summand, dazwischen „…“. Der Summand der gewählten
 * Person ist mit `m: 'who'` markiert (umrahmt); `sep` steht zwischen den Summanden (zum Beispiel ein an Schritt 4
 * gekoppeltes „+“).
 */
export function sumNodes(count: number, who: number, term: (i: number) => FNode[], sep: FNode[] = [' + ']): FNode[] {
  const last = count - 1, chosen = Math.max(0, Math.min(who, last));
  const shown = [...new Set([0, chosen, last])].sort((a, b) => a - b), out: FNode[] = [];
  shown.forEach((i, k) => {
    if (k > 0) out.push(...sep, ...(i - shown[k - 1] > 1 ? ['…', ...sep] : []));
    out.push(...(i === chosen ? [{ part: term(i), m: 'who' } as FNode] : term(i)));
  });
  return out;
}
