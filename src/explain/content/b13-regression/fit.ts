// Rechnungen des Bereichs B13 „Regression“: Gerade nach kleinsten Quadraten, lineare Modelle mit mehreren
// Prädiktoren und logistische Regression. Reines TypeScript, damit Inhalte, Bilder und Tests dieselben Zahlen
// rechnen. Die Referenzwerte aus R stehen in b13-regression.test.ts.
import { describe, type Describe } from '../../math';

/** Wertepaare: x (Prädiktor) und y (Zielgröße) je Person. */
export type Pairs = { x: number[]; y: number[] };

/** Kennwerte einer Regressionsgeraden ŷ = b₀ + b₁ · x nach kleinsten Quadraten. */
export interface Fit {
  n: number;
  xs: number[];
  ys: number[];
  x: Describe;
  y: Describe;
  /** Abweichungsprodukte (xᵢ − x̄)(yᵢ − ȳ) und ihre Summe. */
  prod: number[];
  cp: number;
  /** Quadrierte Abstände der x-Werte und ihre Summe Σ(xᵢ − x̄)². */
  xsq: number[];
  sxx: number;
  /** Steigung und Achsenabschnitt; null, wenn alle denselben x-Wert haben. */
  b1: number | null;
  b0: number | null;
  /** Zum Weiterrechnen: ohne Steigung eine waagerechte Gerade durch ȳ. */
  slope: number;
  icpt: number;
  /** b₁ · xᵢ je Person (Teil der Vorhersage ohne Startwert). */
  b1x: number[];
  yhat: number[];
  e: number[];
  e2: number[];
  /** Quadratsumme der Residuen und Quadratsumme der y-Werte um ȳ. */
  sse: number;
  sst: number;
  /** 1 − SSE / SST; null, wenn y nicht streut. */
  r2: number | null;
  /** Summe der Beträge der Residuen (typischer Fehler: ohne Quadrat). */
  absSum: number;
  above: number;
  below: number;
  /** Index der Person mit dem größten quadrierten Residuum. */
  biggest: number;
}

const tiny = 1e-9;

export function fitLine(d: Pairs): Fit {
  const x = describe(d.x), y = describe(d.y), n = d.x.length;
  const prod = x.dev.map((dx, i) => dx * y.dev[i] || 0);
  const cp = prod.reduce((a, b) => a + b, 0);
  const xsq = x.sq, sxx = x.ss;
  const b1 = sxx > tiny ? cp / sxx : null;
  const slope = b1 ?? 0, icpt = y.mean - slope * x.mean;
  const b0 = b1 === null ? null : icpt;
  const b1x = d.x.map(v => slope * v);
  const yhat = d.x.map(v => icpt + slope * v);
  const e = d.y.map((v, i) => { const r = v - yhat[i]; return Math.abs(r) < 1e-10 ? 0 : r; });
  const e2 = e.map(r => r * r);
  const sse = e2.reduce((a, b) => a + b, 0), sst = y.ss;
  let biggest = 0;
  e2.forEach((v, i) => { if (v > e2[biggest]) biggest = i; });
  return {
    n, xs: [...d.x], ys: [...d.y], x, y, prod, cp, xsq, sxx, b1, b0, slope, icpt, b1x, yhat, e, e2, sse, sst,
    r2: sst > tiny ? 1 - sse / sst : null,
    absSum: e.reduce((a, r) => a + Math.abs(r), 0),
    above: e.filter(r => r > tiny).length,
    below: e.filter(r => r < -tiny).length,
    biggest,
  };
}

/** Löst A · b = v (Gauß mit Spaltenpivot); null, wenn A singulär ist. */
export function solve(A: number[][], v: number[]): number[] | null {
  const n = v.length, M = A.map((row, i) => [...row, v[i]]);
  for (let k = 0; k < n; k++) {
    let p = k;
    for (let i = k + 1; i < n; i++) if (Math.abs(M[i][k]) > Math.abs(M[p][k])) p = i;
    if (Math.abs(M[p][k]) < 1e-12) return null;
    [M[k], M[p]] = [M[p], M[k]];
    for (let i = k + 1; i < n; i++) {
      const f = M[i][k] / M[k][k];
      for (let j = k; j <= n; j++) M[i][j] -= f * M[k][j];
    }
  }
  const b = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * b[j];
    b[i] = s / M[i][i];
  }
  return b;
}

/** Lineares Modell mit Achsenabschnitt: y = b₀ + b₁x₁ + … nach kleinsten Quadraten (Normalgleichungen). */
export interface Ols { b: number[]; yhat: number[]; sse: number; sst: number; r2: number }
export function ols(columns: number[][], y: number[]): Ols | null {
  const n = y.length, X = y.map((_, i) => [1, ...columns.map(c => c[i])]), k = X[0].length;
  // Spalten zentrieren hält die Normalgleichungen auch bei vielen Prädiktoren gut lösbar.
  const means = Array.from({ length: k }, (_, j) => j === 0 ? 0 : X.reduce((a, r) => a + r[j], 0) / n);
  const Z = X.map(r => r.map((v, j) => j === 0 ? 1 : v - means[j]));
  const A = Array.from({ length: k }, (_, a) => Array.from({ length: k }, (_, b) => Z.reduce((s, r) => s + r[a] * r[b], 0)));
  const v = Array.from({ length: k }, (_, a) => Z.reduce((s, r, i) => s + r[a] * y[i], 0));
  const bz = solve(A, v);
  if (!bz) return null;
  const b = [bz[0] - bz.slice(1).reduce((s, bj, j) => s + bj * means[j + 1], 0), ...bz.slice(1)];
  const yhat = X.map(r => r.reduce((s, xj, j) => s + xj * b[j], 0));
  const my = y.reduce((a, c) => a + c, 0) / n;
  const sse = y.reduce((s, yi, i) => s + (yi - yhat[i]) ** 2, 0), sst = y.reduce((s, yi) => s + (yi - my) ** 2, 0);
  return { b, yhat, sse, sst, r2: 1 - sse / sst };
}

/** Logistische Funktion: aus dem linearen Prädiktor η wird eine Wahrscheinlichkeit zwischen 0 und 1. */
export const invLogit = (eta: number) => 1 / (1 + Math.exp(-eta));
/** Logit: der natürliche Logarithmus der Odds p / (1 − p). */
export const logitOf = (p: number) => Math.log(p / (1 - p));

/** Logistische Regression nach Maximum Likelihood (Newton-Verfahren), mit Achsenabschnitt. */
export interface Logit { b: number[]; p: number[]; ll: number; deviance: number; converged: boolean }
export function logistic(columns: number[][], y: number[], iterations = 50): Logit | null {
  const n = y.length, X = y.map((_, i) => [1, ...columns.map(c => c[i])]), k = X[0].length;
  let b = new Array<number>(k).fill(0), converged = false;
  for (let it = 0; it < iterations; it++) {
    const p = X.map(r => invLogit(r.reduce((s, xj, j) => s + xj * b[j], 0)));
    const g = Array.from({ length: k }, (_, a) => X.reduce((s, r, i) => s + r[a] * (y[i] - p[i]), 0));
    const H = Array.from({ length: k }, (_, a) => Array.from({ length: k }, (_, c) => X.reduce((s, r, i) => s + r[a] * r[c] * p[i] * (1 - p[i]), 0)));
    const step = solve(H, g);
    if (!step) return null;
    b = b.map((bj, j) => bj + step[j]);
    if (Math.max(...step.map(Math.abs)) < 1e-10) { converged = true; break; }
  }
  const p = X.map(r => invLogit(r.reduce((s, xj, j) => s + xj * b[j], 0)));
  const ll = y.reduce((s, yi, i) => s + (yi === 1 ? Math.log(p[i]) : Math.log(1 - p[i])), 0);
  return { b, p, ll, deviance: -2 * ll, converged };
}

/** Log-Likelihood von k Einsen unter n bei der Wahrscheinlichkeit p (Bernoulli, ohne Prädiktor). */
export const bernoulliLL = (k: number, n: number, p: number) => k * Math.log(p) + (n - k) * Math.log(1 - p);
