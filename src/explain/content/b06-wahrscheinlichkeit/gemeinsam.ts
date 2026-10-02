// Gemeinsame Zahlen und Rechnungen des Bereichs B6 „Wahrscheinlichkeit“. Alle Zahlen stammen aus dem Lehrdatensatz
// (200 Befragte, createSurvey()) und sind in R nachgerechnet; R-Befehle und Zusicherungen stehen in
// b06-wahrscheinlichkeit.test.ts. Die Texte der Begriffskarten sind fest, deshalb stehen die Zahlen hier als Konstanten.
import type { SampleCtx } from '../../types';
import { pnorm, qnorm } from '../../../tasks/kit/dist';
import { sampleColumn } from '../../sample';

/** Schulabschluss (Codes 0 bis 4) nach Weiterbildung (0 = nein, 1 = ja), wie crosstab(schulabschluss, weiterbildung). */
export const ABSCHLUSS = {
  labels: ['ohne Schulabschluss', 'Hauptschulabschluss', 'mittlerer Abschluss', 'Fachhochschulreife', 'Abitur'],
  /** Befragte je Code */
  count: [42, 40, 37, 41, 40],
  /** davon mit Weiterbildung */
  mit: [17, 12, 17, 17, 19],
  /** davon ohne Weiterbildung */
  ohne: [25, 28, 20, 24, 21],
  n: 200, mitWeiterbildung: 82, ohneWeiterbildung: 118,
} as const;

/** Haushaltsgröße 1 bis 5: Befragte je Wert. */
export const HAUSHALT = { values: [1, 2, 3, 4, 5], count: [47, 38, 35, 43, 37], n: 200 } as const;

/** Schlafdauer pro Nacht (Stunden): Mittelwert und Standardabweichung der 200, Zählungen für den Vergleich mit dem Modell. */
export const SCHLAF = {
  mean: 7.0825, sd: 0.8197584, n: 200, min: 5.1, max: 9.5, distinct: 38,
  /** weniger als 6 Stunden, höchstens 6 Stunden, zwischen 7 und 8 Stunden (Grenzen eingeschlossen) */
  below6: 18, atMost6: 22, from7to8: 90,
} as const;

/** Wissenstest (gelöste Aufgaben 0 bis 20): häufigster Wert und seine Anzahl. */
export const WISSEN = { mode: 11, modeCount: 32, n: 200 } as const;

/** Dichte der Normalverteilung. */
export const dnorm = (x: number, mu: number, sigma: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI));
/** P(X ≤ x) einer Normalverteilung. */
export const cdf = (x: number, mu: number, sigma: number) => pnorm((x - mu) / sigma);
/** p-Quantil einer Normalverteilung. */
export const quant = (p: number, mu: number, sigma: number) => mu + sigma * qnorm(p);

/** Reglerwert für μ: Die Startstellung 7,08 steht für den genauen Mittelwert 7,0825, damit Bild und Text dieselben Zahlen zeigen wie „Stell dir vor …“. */
export const sleepMu = (v: number) => Math.abs(v - SCHLAF.mean) < 0.005 ? SCHLAF.mean : v;

/** Normalmodell der Schlafdauer mit den Kennwerten der 200 Befragten. */
export const schlafModell = {
  f: (x: number) => dnorm(x, SCHLAF.mean, SCHLAF.sd),
  F: (x: number) => cdf(x, SCHLAF.mean, SCHLAF.sd),
  q: (p: number) => quant(p, SCHLAF.mean, SCHLAF.sd),
};

/** Mittelwert und Standardabweichung (n − 1) einer Liste; sd 0 bei weniger als zwei Werten. */
export function meanSd(xs: readonly number[]): { mean: number; sd: number } {
  const n = xs.length, mean = xs.reduce((a, b) => a + b, 0) / n;
  const sd = n > 1 ? Math.sqrt(xs.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)) : 0;
  return { mean, sd };
}

/** Werte einer Spalte der Auswertung: die Spalte der Rolle `role`, sonst `fallback`. */
export const column = (c: SampleCtx, role: string, fallback: string) => sampleColumn(c.rows, c.columns[role]?.[0] ?? fallback);

/** Wie viele Werte die Bedingung erfüllen. */
export const countIf = (xs: readonly number[], ok: (v: number) => boolean) => xs.filter(ok).length;

