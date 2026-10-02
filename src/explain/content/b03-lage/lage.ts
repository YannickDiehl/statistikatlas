// Reine Rechnungen und gemeinsame Bausteine des Bereichs B3 „Lage und Verteilung“ (ohne React, damit Tests und
// Inhalte sie direkt nutzen): Ordnung, Quantile wie mariposa 0.7.4 (Type 6), Häufigkeiten, Schiefe und Kurtosis
// wie w_skew() und w_kurtosis(), Spalten der Auswertungen. Referenzwerte in R: b03-lage.test.ts.
import type { SampleCtx, TokenNote } from '../../types';
import { ref, titleFor } from '../../../domain/learning';
import { columnById } from '../../../domain/survey';
import { sampleColumn, sampleColumnInfo, unitText } from '../../sample';
import { num } from '../../format';
import { describe } from '../../math';

/** Fachbegriff wie in der Karte (Regel 2). */
export const T = (id: string) => titleFor(ref(id));

/** Aufsteigend geordnete Kopie. */
export const sortAsc = (xs: readonly number[]) => [...xs].sort((a, b) => a - b);

/**
 * Quantil wie mariposa::w_quantile() ohne Gewichte (Type 6, SPSS HAVERAGE): Platz h = (n + 1) · p, zwischen den
 * Nachbarn auf Platz ⌊h⌋ und ⌊h⌋ + 1 linear eingeteilt; am Rand der kleinste bzw. größte Wert.
 */
export function quantile6(xs: readonly number[], p: number): number {
  const s = sortAsc(xs), n = s.length, h = (n + 1) * p, j = Math.floor(h), g = h - j;
  if (!n) return NaN;
  if (j < 1) return s[0];
  if (j >= n) return s[n - 1];
  return s[j - 1] + g * (s[j] - s[j - 1]);
}
export const median = (xs: readonly number[]) => quantile6(xs, 0.5);
/** Mittelwert und Standardabweichung (n − 1) aus describe() in src/explain/math.ts. */
export const mean = (xs: readonly number[]) => describe(xs).mean;
export const sdOf = (xs: readonly number[]) => describe(xs).sd;

/** Schiefe G₁ wie mariposa::w_skew() (Stichprobenkorrektur wie SPSS). */
export function skewness(xs: readonly number[]): number {
  const n = xs.length, m = mean(xs);
  const m2 = xs.reduce((a, v) => a + (v - m) ** 2, 0) / n, m3 = xs.reduce((a, v) => a + (v - m) ** 3, 0) / n;
  return m2 > 0 ? Math.sqrt(n * (n - 1)) / (n - 2) * m3 / m2 ** 1.5 : NaN;
}
/** Exzess-Kurtosis G₂ wie mariposa::w_kurtosis(excess = TRUE). */
export function excessKurtosis(xs: readonly number[]): number {
  const n = xs.length, m = mean(xs);
  const m2 = xs.reduce((a, v) => a + (v - m) ** 2, 0) / n, m4 = xs.reduce((a, v) => a + (v - m) ** 4, 0) / n;
  if (!(m2 > 0)) return NaN;
  const g2 = m4 / m2 ** 2 - 3;
  return ((n + 1) * g2 + 6) * (n - 1) / ((n - 2) * (n - 3));
}

/** Häufigkeiten: je beobachteter Wert (aufsteigend) die Zahl der Personen. */
export function counts(xs: readonly number[]): { value: number; n: number }[] {
  const m = new Map<number, number>();
  for (const v of xs) m.set(v, (m.get(v) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([value, n]) => ({ value, n }));
}

/** Spalte einer Rolle in der Auswertung (Spaltenwahl oder feste Spalten), sonst die Ersatzspalte. */
export const colOf = (c: SampleCtx, role = 'x', fallback = 'lernzeit') => c.columns[role]?.[0] ?? fallback;
/** Werte und Spalteninfo einer Rolle. */
export function column(c: SampleCtx, role = 'x', fallback = 'lernzeit') {
  const id = colOf(c, role, fallback), info = sampleColumnInfo(id);
  return { id, info, values: sampleColumn(c.rows, id), u: (v: number) => unitText(info, v) };
}
/** Wertelabel eines Codes („Abitur / fachgebundene Hochschulreife“), sonst die Zahl. */
export function labelOf(columnId: string, v: number): string {
  const k = columnById[columnId]?.categories?.find(c => c.value === v);
  return k ? k.label : num(v);
}
/** „3 („Fachhochschulreife“)“ bei Kategorien, sonst die Zahl mit Einheit. */
export function valueText(columnId: string, v: number): string {
  const k = columnById[columnId]?.categories?.find(c => c.value === v);
  return k ? `${num(v)} („${k.label}“)` : unitText(sampleColumnInfo(columnId), v);
}

/** Codelegende für describe() (Ergänzung zu src/domain/rTokens.ts), wie in den Pilotreitern. */
export const DESCRIBE_NOTE: TokenNote = {
  sym: 'describe()', term: T('describe'),
  kurz: 'Berechnet Kennwerte einer oder mehrerer Spalten. Welche, sagt show; N und Missing stehen immer dabei.',
  fehler: 'Ohne library(mariposa) meldet R: konnte Funktion "describe" nicht finden.',
};
/** Karte für einen Wert von show = … in describe(). */
export const showNote = (key: string, term: string, kurz: string): TokenNote => ({
  sym: `"${key}"`, term, kurz,
  fehler: `Groß geschrieben kennt describe() den Namen nicht: show = "${key.toUpperCase()}" ergibt Unknown \`show\` value. Richtig ist "${key}".`,
});
