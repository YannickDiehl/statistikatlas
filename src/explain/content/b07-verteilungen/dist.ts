// Rechnungen des Bereichs B7 „Verteilungsfamilien“, die im gemeinsamen Baukasten fehlen: Quantile von χ² und F,
// Dichten, Einzelwahrscheinlichkeiten, exakte Tests wie in R, Schiefe wie mariposa und Zahlformate. Kennwerte der Daten
// kommen aus src/explain/sample.ts und src/tasks/kit (sampleSeries, crosstab, chiSquare, onewayAnova, oneSampleT).
// Ohne React, damit Inhalte, Bilder und Tests sie teilen. Referenzwerte und R-Befehle stehen in b07-verteilungen.test.ts.
import { lgamma, pchisq, pf, pnorm, pt, qt } from '../../../tasks/kit/dist';
import { num } from '../../format';
import { countWithin } from '../../sample';

export { pchisq, pf, pnorm, pt, qt };

/** Quantil per Halbierung einer monoton steigenden Verteilungsfunktion auf [lo, hi]. */
function invert(cdf: (x: number) => number, p: number, lo: number, hi: number): number {
  while (cdf(hi) < p && hi < 1e6) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (cdf(m) < p) lo = m; else hi = m;
    if (hi - lo < 1e-12 * Math.max(1, hi)) break;
  }
  return (lo + hi) / 2;
}

/** Quantil der χ²-Verteilung mit df Freiheitsgraden (R: qchisq). */
export const qchisq = (p: number, df: number) => invert(x => pchisq(x, df), p, 0, Math.max(10, 4 * df));
/** Quantil der F-Verteilung (R: qf). */
export const qf = (p: number, df1: number, df2: number) => invert(x => pf(x, df1, df2), p, 0, 10);

/** Dichte der Standardnormalverteilung. */
export const dnorm = (z: number) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
/** Dichte der t-Verteilung. */
export const dt = (t: number, df: number) => Math.exp(lgamma((df + 1) / 2) - lgamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log1p(t * t / df));
/** Dichte der χ²-Verteilung. */
export const dchisq = (x: number, df: number) => x <= 0 ? 0 : Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.log(2) - lgamma(df / 2));
/** Dichte der F-Verteilung. */
export const dF = (f: number, d1: number, d2: number) => f <= 0 ? 0
  : Math.exp(lgamma((d1 + d2) / 2) - lgamma(d1 / 2) - lgamma(d2 / 2) + (d1 / 2) * Math.log(d1 / d2) + (d1 / 2 - 1) * Math.log(f) - ((d1 + d2) / 2) * Math.log1p(d1 * f / d2));

/** Binomialkoeffizient „n über k“; für kleine Zahlen exakt, sonst über lgamma. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n || !Number.isInteger(n) || !Number.isInteger(k)) return 0;
  if (n <= 60) { let r = 1; for (let i = 1; i <= Math.min(k, n - k); i++) r = r * (n - Math.min(k, n - k) + i) / i; return Math.round(r); }
  return Math.exp(lchoose(n, k));
}
const lchoose = (n: number, k: number) => lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);

/** P(X = k) der Binomialverteilung (R: dbinom). */
export function dbinom(k: number, n: number, p: number): number {
  if (k < 0 || k > n || !Number.isInteger(k)) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(lchoose(n, k) + k * Math.log(p) + (n - k) * Math.log1p(-p));
}

/** P(X = k) der hypergeometrischen Verteilung: K Erfolge unter N, n gezogen ohne Zurücklegen (R: dhyper(k, K, N − K, n)). */
export function dhyper(k: number, K: number, N: number, n: number): number {
  if (!Number.isInteger(k) || k < Math.max(0, n - (N - K)) || k > Math.min(n, K)) return 0;
  return Math.exp(lchoose(K, k) + lchoose(N - K, n - k) - lchoose(N, n));
}

/**
 * Zweiseitiger exakter p-Wert wie in R (binom.test, fisher.test): Summe aller Wahrscheinlichkeiten, die höchstens so
 * groß sind wie die des beobachteten Werts (mit R-Toleranz 1 + 10⁻⁷).
 */
function twoSided(probs: number[], observed: number): number {
  const d = probs[observed] * (1 + 1e-7);
  return Math.min(1, probs.reduce((a, p) => p <= d ? a + p : a, 0));
}

/** Zweiseitiger Binomialtest wie R binom.test(k, n, p0). */
export function binomTest(k: number, n: number, p0: number): number {
  if (p0 * n === k) return 1;
  return twoSided(Array.from({ length: n + 1 }, (_, i) => dbinom(i, n, p0)), k);
}

/** Exakter Test von Fisher für eine 2×2-Tabelle [[a, b], [c, d]], zweiseitig wie R fisher.test. */
export function fisherTest(t: number[][]): number {
  const [[a, b], [c, d]] = t, row1 = a + b, col1 = a + c, n = a + b + c + d;
  const lo = Math.max(0, row1 + col1 - n), hi = Math.min(row1, col1);
  if (hi === lo) return 1;
  const probs = Array.from({ length: hi - lo + 1 }, (_, i) => dhyper(lo + i, col1, n, row1));
  return twoSided(probs, a - lo);
}

/** Schiefe wie mariposa (describe, frequency): g₁ · √(n(n − 1)) / (n − 2). */
export function skewness(xs: readonly number[]): number {
  const n = xs.length, m = xs.reduce((a, b) => a + b, 0) / n;
  const m2 = xs.reduce((a, x) => a + (x - m) ** 2, 0) / n, m3 = xs.reduce((a, x) => a + (x - m) ** 3, 0) / n;
  return m2 > 0 ? m3 / m2 ** 1.5 * Math.sqrt(n * (n - 1)) / (n - 2) : 0;
}

/** Wie viele Werte höchstens k Standardabweichungen von der Mitte entfernt liegen (wie R: abs(x − mean(x)) <= k * sd(x)). */
export const within = (xs: readonly number[], mean: number, sd: number, k: number) => countWithin(xs, mean - k * sd, mean + k * sd);

/**
 * Wahrscheinlichkeit als Text mit zwei gültigen Ziffern: „0,35“, „0,013“, „0,0019“; sehr kleine als „weniger als 0,0001“.
 * Für p-Werte `pValue`.
 */
export function prob(v: number): string {
  if (v >= 0.1 || v === 0) return num(v);
  if (v < 0.0001) return 'weniger als 0,0001';
  return num(v, 1 - Math.floor(Math.log10(v)));
}
/** p-Wert wie in den Musterkarten: „≈ 0,54“, „≈ 0,013“, „< 0,001“. */
export const pValue = (p: number) => p < 0.001 ? '< 0,001' : `≈ ${prob(p)}`;
/** „in etwa 54 von 100“, „in etwa 1 von 100“, „in weniger als 1 von 100“, „in weniger als 1 von 1.000“. */
export const often = (p: number) => p >= 0.005 ? `in etwa ${Math.round(p * 100)} von 100` : p >= 0.001 ? 'in weniger als 1 von 100' : 'in weniger als 1 von 1.000';
/** Auf zwei Stellen gerundet, wie angezeigt (Rechnungen im Text gehen mit den sichtbaren Zahlen auf). */
export const shown2 = (v: number) => Math.round(v * 100) / 100;
/** Hochgestellte Zahl für Potenzen: 2 → „²“, 12 → „¹²“. */
export const sup = (n: number) => String(n).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
