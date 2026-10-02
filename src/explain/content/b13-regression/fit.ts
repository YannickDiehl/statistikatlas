// Rechnungen des Bereichs B13 „Regression“: die Gerade der Werkstatt mit allen Zwischenschritten, dazu dünne Hüllen um
// die geprüften Modelle des Aufgaben-Baukastens (src/tasks/kit/ols.ts und logit.ts, wie mariposa). Inhalte, Bilder und
// Tests rechnen so dieselben Zahlen. Die Referenzwerte aus R stehen in b13-regression.test.ts.
import { relate, type Describe, type Pairs } from '../../math';
import { tryOls } from '../../../tasks/kit/ols';
import { linkinv, logistic as kitLogistic, averageMarginalEffects } from '../../../tasks/kit/logit';

export type { Pairs };

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

/** Gerade nach kleinsten Quadraten mit allen Zwischenergebnissen der Werkstatt (Mitten und Produkte aus `relate`). */
export function fitLine(d: Pairs): Fit {
  const { n, x, y, prod, cp } = relate(d.x, d.y);
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

/** Lineares Modell y = b₀ + b₁x₁ + … wie linear_regression() (Aufgaben-Baukasten); null, wenn nicht schätzbar. */
export interface Ols { b: number[]; yhat: number[]; sse: number; sst: number; r2: number }
export function ols(columns: number[][], y: number[]): Ols | null {
  const f = tryOls(y, columns);
  return f ? { b: f.coef, yhat: f.fitted, sse: f.ssResidual, sst: f.ssTotal, r2: f.r2 } : null;
}

/** Logistische Funktion: aus dem linearen Prädiktor η wird eine Wahrscheinlichkeit zwischen 0 und 1. */
export const invLogit = linkinv;

/**
 * Logistische Regression wie logistic_regression() (Aufgaben-Baukasten, mit Prüfung auf Separation); null, wenn das
 * Modell nicht schätzbar ist. `ame` sind die mittleren marginalen Effekte je Prädiktor wie marginal_effects().
 */
export interface Logit { b: number[]; p: number[]; deviance: number; nullDeviance: number; ame: number[] }
export function logistic(columns: number[][], y: number[]): Logit | null {
  const f = kitLogistic(y, columns, columns.map((_, j) => `x${j + 1}`));
  if (!f.ok) return null;
  return { b: f.coef, p: f.fitted, deviance: f.minus2LL, nullDeviance: f.minus2LLNull, ame: averageMarginalEffects(f).map(a => a.ame) };
}

/** Log-Likelihood von k Einsen unter n bei der Wahrscheinlichkeit p (Bernoulli, ohne Prädiktor). */
export const bernoulliLL = (k: number, n: number, p: number) => k * Math.log(p) + (n - k) * Math.log(1 - p);
