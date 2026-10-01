/**
 * Reine Rechnung für den Reiter „Mit 200 Befragten“ (Spezifikation Lehrdatensatz und R, Abschnitte 5.3 und 5.4):
 * Kennwerte einer Spalte oder eines Spaltenpaars der 200 Befragten, die Datenänderungen der Vorhersagefragen
 * („Erst tippen, dann ausprobieren“) und die gekürzte Formel mit erstem, gewähltem und letztem Summanden.
 * Ohne React, damit Tests und Inhalte (src/explain/content) es direkt nutzen können.
 */
import type { SurveyRow } from '../domain/survey';
import type { ThinkSample } from './types';
import { relate, series } from './math';

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
 * - `constant`: alle bekommen `value` (ohne Angabe den Mittelwert).
 * Ob die neuen Werte zur Spalte passen (Wertebereich, Schrittweite), prüft die Oberfläche.
 */
export function applyOp(rows: readonly SurveyRow[], column: string, op: ThinkSample['tryIt']['op'], value?: number, person?: number): SurveyRow[] {
  const values = sampleColumn(rows, column), mean = values.reduce((a, b) => a + b, 0) / values.length;
  const next = (v: number, i: number) => {
    switch (op) {
      case 'shift': return v + (value ?? 1);
      case 'double': return v * (value ?? 2);
      case 'outlier': return i === (person ?? 0) ? (value ?? 2 * Math.max(...values)) : v;
      case 'constant': return value ?? mean;
    }
  };
  return rows.map((r, i) => ({ ...r, values: { ...r.values, [column]: tidy(next(r.values[column], i)) } }));
}

/** Wie viele Werte zwischen `lo` und `hi` liegen (Grenzen eingeschlossen). */
export function countWithin(values: readonly number[], lo: number, hi: number): number {
  return values.filter(v => v >= lo - 1e-9 && v <= hi + 1e-9).length;
}

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
