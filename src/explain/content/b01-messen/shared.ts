// Gemeinsame Helfer des Bereichs B1 „Messen und Skalen“: die fünf Beispielpersonen aus dem Lehrdatensatz,
// Werte und Kategorien einer Spalte als Text und kleine Rechnungen für die Reiter „Mit 200 Befragten“.
// Alle Zahlen sind in R nachgerechnet, siehe b01-messen.test.ts.
import { columnById } from '../../../domain/survey';
import { mean as weightedMean } from '../../../tasks/kit/means';
import { num } from '../../format';
import { relate } from '../../math';
import { sampleColumn, sampleColumnInfo } from '../../sample';
import type { SampleCtx } from '../../types';

/** P001 bis P005 aus dem Lehrdatensatz (createSurvey()), wie in R: atlas %>% filter(id %in% c("P001", …, "P005")). */
export const FUENF = [
  { id: 'P001', lernzeit: 6, wissenstest: 12, einkommen: 4549 },
  { id: 'P002', lernzeit: 8.3, wissenstest: 9, einkommen: 3850 },
  { id: 'P003', lernzeit: 6.3, wissenstest: 14, einkommen: 2762 },
  { id: 'P004', lernzeit: 10.5, wissenstest: 13, einkommen: 4604 },
  { id: 'P005', lernzeit: 6.8, wissenstest: 11, einkommen: 1868 },
] as const;

/** Mittelwert aller gültigen Werte, wahlweise gewichtet (Rechnung aus src/tasks/kit/means.ts). */
export const mean = (xs: readonly number[], w: readonly number[] | null = null) => weightedMean(xs, w);

/** Wie num(), aber Gleitkomma-Halbe wie in der Ausgabe von R aufgerundet: 1,985 → „1,99“ (num() zeigte „1,98“). */
export const numR = (v: number, digits = 2) => num(v + Math.sign(v) * 1e-9, digits);

/** Pearson-r zweier gleich langer Reihen (relate aus src/explain/math.ts); null, wenn eine nicht streut. */
export const pearson = (xs: readonly number[], ys: readonly number[]): number | null => relate(xs, ys).r;

/** Spalte einer Rolle der Auswertung (`x`, `y`, `group`), sonst die Vorgabe. */
export const role = (c: SampleCtx, key: string, fallback: string) => c.columns[key]?.[0] ?? fallback;

/** Wertelabel eines Codes, wenn die Spalte Kategorien hat („Abitur / fachgebundene Hochschulreife“). */
export const labelOf = (column: string, code: number) => columnById[column]?.categories?.find(k => k.value === code)?.label;

/** Ein Wert als Text: Kategorie mit Label („„Männlich“ (Code 0)“), sonst Zahl mit Einheit („6 h“). */
export function valueText(column: string, v: number): string {
  const label = labelOf(column, v), unit = sampleColumnInfo(column).unit;
  if (label !== undefined) return `„${label}“ (Code ${num(v)})`;
  return unit ? `${num(v)} ${unit}` : num(v);
}

/** Kleine Ziffern für Indizes: 200 → ₂₀₀. */
export const sub = (n: number) => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]);

/** Wie viele Werte einer Spalte gültig (endliche Zahlen) sind. */
export const validCount = (c: SampleCtx, column: string) => sampleColumn(c.rows, column).filter(Number.isFinite).length;

/** Zahl der Befragten je Code einer Spalte mit Kategorien, in der Reihenfolge der Codes. */
export function countsByCode(c: SampleCtx, column: string): { code: number; label: string; n: number }[] {
  const values = sampleColumn(c.rows, column);
  return (columnById[column]?.categories ?? []).map(k => ({ code: k.value, label: k.label, n: values.filter(v => v === k.value).length }));
}

/** Liste in Worten: „a“, „a und b“, „a, b und c“. */
export const listText = (items: string[]) => items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;

/** Median einer Reihe: Mittel der beiden mittleren Werte der Reihe nach (bei Kategorien: beide Codes). */
export function middle(values: readonly number[]): [number, number] {
  const s = [...values].sort((a, b) => a - b), n = s.length;
  return n % 2 ? [s[(n - 1) / 2], s[(n - 1) / 2]] : [s[n / 2 - 1], s[n / 2]];
}
