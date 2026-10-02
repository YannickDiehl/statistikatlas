// Rechenhilfen des Bereichs B12 (Kategoriale Tests, Design): exakte Binomial- und Fisher-Wahrscheinlichkeiten wie in R,
// McNemar wie mariposa 0.7.4, der Münzwurf für die Zufallszuteilung und Zahlen aus dem Lehrdatensatz.
// Alle Referenzwerte stehen mit ihren R-Befehlen in b12-kategorial-design.test.ts.
import type { SurveyRow } from '../../../domain/survey';
import { lgamma, pchisq } from '../../../tasks/kit/dist';

/** log des Binomialkoeffizienten „n über k“. */
export const lchoose = (n: number, k: number) => lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1);

/** P(K = k) bei n Versuchen mit Wahrscheinlichkeit p (dbinom in R). */
export function dbinom(k: number, n: number, p: number): number {
  if (!Number.isInteger(k) || k < 0 || k > n) return 0;
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(lchoose(n, k) + k * Math.log(p) + (n - k) * Math.log1p(-p));
}

/** P(K ≤ k) (pbinom in R). */
export function pbinom(k: number, n: number, p: number): number {
  let s = 0;
  for (let i = 0; i <= Math.min(k, n); i++) s += dbinom(i, n, p);
  return Math.min(1, s);
}

/**
 * Exakter Binomialtest gegen p₀ = 0,5, zweiseitig wie mariposa 0.7.4 (und binom.test bei 0,5):
 * p = 2 · min(P(K ≤ k), P(K ≥ k)), höchstens 1.
 */
export function binomTestHalf(k: number, n: number): number {
  const lower = pbinom(k, n, 0.5), upper = 1 - pbinom(k - 1, n, 0.5);
  return Math.min(1, 2 * Math.min(lower, upper));
}

/** P(X = x) der hypergeometrischen Verteilung: x Treffer, wenn k aus m Treffern und n Nieten gezogen werden (dhyper in R). */
export function dhyper(x: number, m: number, n: number, k: number): number {
  if (!Number.isInteger(x) || x < Math.max(0, k - n) || x > Math.min(k, m)) return 0;
  return Math.exp(lchoose(m, x) + lchoose(n, k - x) - lchoose(m + n, k));
}

/** Kleinster und größter möglicher Wert einer Zelle bei festen Rändern (dhyper wie oben). */
export const hyperRange = (m: number, n: number, k: number): [number, number] => [Math.max(0, k - n), Math.min(k, m)];

/**
 * Fisher-Test, zweiseitig wie fisher.test in R: Summe der Wahrscheinlichkeiten aller Tabellen mit denselben Rändern,
 * die höchstens so wahrscheinlich sind wie die beobachtete (relativer Spielraum 1e−7). `x` ist die Zelle, die in der
 * Verteilung dhyper(x, m, n, k) läuft.
 */
export function fisherFromCell(x: number, m: number, n: number, k: number): number {
  const [lo, hi] = hyperRange(m, n, k), d0 = dhyper(x, m, n, k) * (1 + 1e-7);
  let s = 0;
  for (let i = lo; i <= hi; i++) { const d = dhyper(i, m, n, k); if (d <= d0) s += d; }
  return Math.min(1, s);
}

/** Fisher-Test für eine Vierfeldertafel [[a, b], [c, d]] (Zeilen, Spalten). */
export function fisher2x2(t: number[][]): number {
  const [[a, b], [c, d]] = t;
  return fisherFromCell(a, a + c, b + d, a + b);
}

/** Odds Ratio wie mariposa 0.7.4: (a · d) / (b · c), null bei b · c = 0. */
export const oddsRatio = (t: number[][]) => t[0][1] * t[1][0] === 0 ? null : (t[0][0] * t[1][1]) / (t[0][1] * t[1][0]);

/** McNemar wie mariposa 0.7.4: mit Korrektur (|b − c| − 1)² / (b + c), ohne (b − c)² / (b + c); null ohne Wechsel. */
export function mcnemar(b: number, c: number, correct = true): { chi2: number; p: number } | null {
  if (b + c <= 0) return null;
  const chi2 = (correct ? (Math.abs(b - c) - 1) ** 2 : (b - c) ** 2) / (b + c);
  return { chi2, p: pchisq(chi2, 1, false) };
}

/**
 * Münzwurf für die Zufallszuteilung: derselbe Zufallsgenerator wie der Lehrdatensatz (src/domain/survey.ts),
 * Gruppe A (1) bei einer Zufallszahl unter 0,5. Gleicher Startwert, gleiche Zuteilung, in R wie im Atlas.
 */
export function coin(seed: number, n = 200): number[] {
  let state = seed >>> 0;
  return Array.from({ length: n }, () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296 < 0.5 ? 1 : 0;
  });
}

/** Werte einer Spalte des Lehrdatensatzes. */
export const column = (rows: readonly SurveyRow[], id: string) => rows.map(r => r.values[id]);

/** Vierfeldertafel zweier 0/1-Spalten: [[x=0,y=0], [x=0,y=1]], [[x=1,y=0], [x=1,y=1]]. */
export function fourfold(rows: readonly SurveyRow[], x: string, y: string): number[][] {
  const t = [[0, 0], [0, 0]];
  for (const r of rows) { const a = r.values[x], b = r.values[y]; if ((a === 0 || a === 1) && (b === 0 || b === 1)) t[a][b]++; }
  return t;
}

/** Häufigkeiten der Codes `codes` in einer Spalte. */
export const counts = (rows: readonly SurveyRow[], id: string, codes: readonly number[]) => codes.map(k => rows.filter(r => r.values[id] === k).length);

/** p als Text: „p ≈ 0,013“ (zwei gültige Ziffern), „p < 0,001“, „p ≈ 1“ (ab 0,995), „p = 1“. */
export function pText(p: number): string {
  if (p >= 1 - 1e-9) return 'p = 1';
  if (p >= 0.995) return 'p ≈ 1';
  if (p < 0.001) return 'p < 0,001';
  const digits = p >= 0.0995 ? 2 : p >= 0.00995 ? 3 : 4;
  return `p ≈ ${p.toLocaleString('de-DE', { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
}

/**
 * Wie oft der Zufall allein so etwas liefert, als ganze Wendung: „in etwa 44 von 100 Stichproben“, „in etwa 13 von
 * 1.000 Stichproben“, „in weniger als 1 von 1.000 Stichproben“, „in praktisch allen Stichproben“, „in allen Stichproben“.
 */
export function often(p: number): string {
  if (p >= 1 - 1e-9) return 'in allen Stichproben';
  if (p >= 0.995) return 'in praktisch allen Stichproben';
  if (p >= 0.095) return `in etwa ${Math.round(p * 100)} von 100 Stichproben`;
  if (p >= 0.0005) return `in etwa ${Math.round(p * 1000)} von 1.000 Stichproben`;
  return 'in weniger als 1 von 1.000 Stichproben';
}

/** „Niemand“, „Eine Person“, „46 Befragte“ mit passendem Verb: `wer(1, 'wechselt', 'wechseln')` → „Eine Person wechselt“. */
export const wer = (k: number, one: string, many: string) => k === 0 ? `Niemand ${one}` : k === 1 ? `Eine Person ${one}` : `${k} Befragte ${many}`;
