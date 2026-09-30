// Gewichtete logistische Regression wie mariposa 0.7.3 `logistic_regression(..., weights = w)` (Tests: logit.test.ts).
// Die Schätzung folgt R's glm.fit() Schritt für Schritt (binomial, Logit-Link): Start bei mustart = (w·y + ½)/(w + 1),
// IRLS mit höchstens 25 Schritten, Abbruch bei |dev − devold|/(|dev| + 0,1) < 1e−8. Die Standardfehler stammen – wie in
// summary.glm() – aus den Arbeitsgewichten des letzten Schritts. −2LL = Devianz (mariposa), Pseudo-R² mit N = Σw.
// Vorhergesagte Wahrscheinlichkeiten wie predict(type = "response"); AME wie mariposa 0.7.3 marginal_effects():
// zentrale Differenz mit h = sd(x)·1e−4 (ungewichtete sd der Modellfälle), gewichtet gemittelt, SE per Delta-Methode.

import { pnorm, pchisq, qnorm } from './dist';
import { wls, type Matrix } from './linalg';

const DBL_EPSILON = 2.220446049250313e-16;
const THRESH = 30;
const MTHRESH = -30;
const INVEPS = 1 / DBL_EPSILON;

/** plogis mit den Schranken von R's logit_linkinv (C): |η| > 30 wird abgeschnitten. */
export function linkinv(eta: number): number {
  const tmp = eta < MTHRESH ? DBL_EPSILON : eta > THRESH ? INVEPS : Math.exp(eta);
  return tmp / (1 + tmp);
}
/** dμ/dη wie R's logit_mu_eta (C). */
function muEta(eta: number): number {
  const opexp = 1 + Math.exp(eta);
  return eta > THRESH || eta < MTHRESH ? DBL_EPSILON : Math.exp(eta) / (opexp * opexp);
}
const linkfun = (mu: number) => Math.log(mu / (1 - mu));
/** Devianzbeitrag wie R's binomial_dev_resids (C) für y ∈ {0, 1}. */
const devResid = (y: number, mu: number, w: number) => 2 * w * (y === 1 ? Math.log(1 / mu) : Math.log(1 / (1 - mu)));

export type LogitProblem = 'too-few' | 'not-binary' | 'one-outcome' | 'invalid-weight' | 'collinear' | 'separation' | 'no-convergence';

/** Erklärungen statt Zahlen, wenn sich ein Modell nicht (sinnvoll) schätzen lässt. */
export const LOGIT_PROBLEMS: Record<LogitProblem, string> = {
  'too-few': 'Zu wenige vollständige Fälle für so viele Prädiktoren – das Modell lässt sich nicht schätzen.',
  'not-binary': 'Die abhängige Variable ist nicht 0/1 kodiert. Die logistische Regression braucht genau die Werte 0 und 1.',
  'one-outcome': 'Unter den vollständigen Fällen kommt nur ein Ausgang vor (alle 0 oder alle 1). Ohne beide Ausgänge gibt es nichts zu erklären.',
  'invalid-weight': 'Das Gewicht enthält negative Werte; damit lässt sich kein Modell schätzen.',
  'collinear': 'Die Prädiktoren sind perfekt voneinander abhängig (kollinear) – ihre Effekte lassen sich nicht trennen.',
  'separation': 'Die Prädiktoren trennen die beiden Ausgänge (fast) vollständig: Vorhergesagte Wahrscheinlichkeiten laufen gegen 0 oder 1, die Koeffizienten gegen unendlich. R warnt dann oft „fitted probabilities numerically 0 or 1 occurred“ – die Zahlen taugen nicht zum Übersetzen.',
  'no-convergence': 'Die Schätzung kommt nach 25 Schritten nicht zur Ruhe (R warnt „algorithm did not converge“). Die Zahlen wären nicht verlässlich.',
};

export type Classification = {
  /** gewichtete (bzw. gezählte) Fälle mit y = 0 und y = 1, ungerundet; mariposa druckt sie gerundet */
  n0: number; n1: number; correct0: number; correct1: number;
  /** Prozent richtig je Ausgang und insgesamt (Schwelle 0,5) */
  pct0: number; pct1: number; overall: number;
};

export type LogitFit = {
  ok: true;
  /** '(Intercept)' und die Namen der Prädiktoren */
  terms: string[];
  coef: number[]; se: number[]; wald: number[]; z: number[]; p: number[]; expB: number[]; ciLower: number[]; ciUpper: number[];
  vcov: Matrix;
  /** Fälle im Modell (listenweiser Ausschluss) */
  cases: number;
  /** N wie mariposa: round(Σw) mit Gewicht, sonst Fallzahl */
  n: number;
  sumW: number;
  minus2LL: number; minus2LLNull: number;
  omnibus: { chi2: number; df: number; p: number };
  coxSnell: number; nagelkerke: number; mcfadden: number;
  classification: Classification;
  iterations: number;
  /** Modellmatrix (mit Konstante), 0/1-Ausgang, Priorgewichte und vorhergesagte p der Modellfälle – für AME */
  X: Matrix; y: number[]; w: number[]; fitted: number[];
  conf: number;
};
export type LogitFailure = { ok: false; problem: LogitProblem };
export type LogitResult = LogitFit | LogitFailure;

type Nums = ArrayLike<number>;

/** Logistische Regression y ~ Konstante + x₁ + … (+ Gewicht). Fehlende Werte (NaN) fallen listenweise heraus. */
export function logistic(y: Nums, xs: Nums[], names: string[], w: Nums | null = null, { conf = 0.95, maxit = 25 } = {}): LogitResult {
  const rows: number[] = [];
  for (let i = 0; i < y.length; i++) {
    if (!Number.isFinite(y[i]) || xs.some(x => !Number.isFinite(x[i])) || (w && !Number.isFinite(w[i]))) continue;
    rows.push(i);
  }
  const p = xs.length + 1;
  if (rows.length < xs.length + 2) return { ok: false, problem: 'too-few' };
  const Y = rows.map(i => y[i]);
  if (Y.some(v => v !== 0 && v !== 1)) return { ok: false, problem: 'not-binary' };
  const W = rows.map(i => (w ? w[i] : 1));
  if (W.some(v => v < 0)) return { ok: false, problem: 'invalid-weight' };
  const X: Matrix = rows.map(i => [1, ...xs.map(x => x[i])]);
  const good = W.map(v => v > 0);
  if (new Set(Y.filter((_, i) => good[i])).size < 2) return { ok: false, problem: 'one-outcome' };

  // glm.fit: Start, IRLS, Konvergenzkriterium wie in R
  let mu = Y.map((v, i) => (W[i] * v + 0.5) / (W[i] + 1));
  let eta = mu.map(linkfun);
  mu = eta.map(linkinv);
  let devold = Y.reduce((s, v, i) => s + devResid(v, mu[i], W[i]), 0);
  let coef: number[] = [];
  let xtwxInv: Matrix = [];
  let conv = false, iterations = 0, dev = devold;
  for (let iter = 1; iter <= maxit; iter++) {
    iterations = iter;
    const z: number[] = [], ww: number[] = [];
    for (let i = 0; i < Y.length; i++) {
      const me = muEta(eta[i]);
      z.push(eta[i] + (Y[i] - mu[i]) / me);
      ww.push(good[i] ? (W[i] * me * me) / (mu[i] * (1 - mu[i])) : 0);
    }
    try {
      const step = wls(X, z, ww);
      coef = step.coef;
      xtwxInv = step.xtwxInv;
    } catch {
      return { ok: false, problem: 'collinear' };
    }
    eta = X.map(row => row.reduce((s, v, k) => s + v * coef[k], 0));
    mu = eta.map(linkinv);
    dev = Y.reduce((s, v, i) => s + devResid(v, mu[i], W[i]), 0);
    if (Math.abs(dev - devold) / (Math.abs(dev) + 0.1) < 1e-8) { conv = true; break; }
    devold = dev;
  }
  if (!conv) return { ok: false, problem: 'no-convergence' };
  // R warnt erst unterhalb von 10·ε („fitted probabilities numerically 0 or 1 occurred“). Bei vollständiger Trennung konvergiert
  // glm() aber oft schon vorher auf riesige Koeffizienten ohne Warnung – deshalb gilt hier schon 1e−10 als Trennung.
  const eps = 1e-10;
  if (mu.some((m, i) => good[i] && (m > 1 - eps || m < eps))) return { ok: false, problem: 'separation' };

  const se = xtwxInv.map((row, j) => Math.sqrt(row[j]));
  const zc = qnorm(1 - (1 - conf) / 2);
  const zval = coef.map((b, j) => b / se[j]);
  const sumW = W.reduce((s, v) => s + v, 0);
  const wy = W.reduce((s, v, i) => s + v * Y[i], 0);
  const wtdmu = wy / sumW;
  const minus2LLNull = Y.reduce((s, v, i) => s + devResid(v, wtdmu, W[i]), 0);
  const nInternal = w ? sumW : rows.length;
  const coxSnell = 1 - Math.exp((dev - minus2LLNull) / nInternal);
  const coxSnellMax = 1 - Math.exp(-minus2LLNull / nInternal);
  const nOk = good.filter(Boolean).length;
  const df = (nOk - 1) - (nOk - p);
  let n0 = 0, n1 = 0, c0 = 0, c1 = 0;
  for (let i = 0; i < Y.length; i++) {
    const hit = mu[i] >= 0.5 ? 1 : 0;
    if (Y[i] === 0) { n0 += W[i]; if (hit === 0) c0 += W[i]; } else { n1 += W[i]; if (hit === 1) c1 += W[i]; }
  }
  return {
    ok: true,
    terms: ['(Intercept)', ...names],
    coef, se, z: zval, wald: zval.map(v => v * v), p: zval.map(v => 2 * pnorm(-Math.abs(v))),
    expB: coef.map(Math.exp), ciLower: coef.map((b, j) => Math.exp(b - zc * se[j])), ciUpper: coef.map((b, j) => Math.exp(b + zc * se[j])),
    vcov: xtwxInv,
    cases: rows.length, n: w ? Math.round(sumW) : rows.length, sumW,
    minus2LL: dev, minus2LLNull,
    omnibus: { chi2: minus2LLNull - dev, df, p: pchisq(minus2LLNull - dev, df, false) },
    coxSnell, nagelkerke: coxSnell / coxSnellMax, mcfadden: 1 - dev / minus2LLNull,
    classification: {
      n0, n1, correct0: c0, correct1: c1,
      pct0: n0 > 0 ? (c0 / n0) * 100 : NaN, pct1: n1 > 0 ? (c1 / n1) * 100 : NaN, overall: ((c0 + c1) / (n0 + n1)) * 100,
    },
    iterations, X, y: Y, w: W, fitted: mu, conf,
  };
}

/** Linearer Prädiktor (Logit) für ein Profil: Konstante + Σ B·x (x ohne Konstante, in der Reihenfolge der Prädiktoren). */
export const logitOf = (fit: LogitFit, x: number[]) => fit.coef[0] + x.reduce((s, v, k) => s + v * fit.coef[k + 1], 0);
/** Vorhergesagte Wahrscheinlichkeit wie predict(modell, newdata, type = "response"). */
export const predictProb = (fit: LogitFit, x: number[]) => linkinv(logitOf(fit, x));

export type Ame = { term: string; ame: number; se: number; z: number; p: number; ciLower: number; ciUpper: number };

/** Durchschnittliche marginale Effekte wie mariposa 0.7.3 marginal_effects() (alle Prädiktoren numerisch). */
export function averageMarginalEffects(fit: LogitFit): Ame[] {
  const { X, w, coef, vcov } = fit;
  const sw = w.reduce((s, v) => s + v, 0);
  const zc = qnorm(1 - (1 - fit.conf) / 2);
  return fit.terms.slice(1).map((term, k) => {
    const col = k + 1;
    const x = X.map(r => r[col]);
    const mean = x.reduce((s, v) => s + v, 0) / x.length;
    let h = Math.sqrt(x.reduce((s, v) => s + (v - mean) ** 2, 0) / (x.length - 1));
    if (!Number.isFinite(h) || h === 0) h = 1;
    h *= 1e-4;
    const scale = 2 * h;
    let sum = 0;
    const grad = new Array<number>(coef.length).fill(0);
    for (let i = 0; i < X.length; i++) {
      const xa = X[i].map((v, j) => (j === col ? v + h : v)), xb = X[i].map((v, j) => (j === col ? v - h : v));
      const ma = linkinv(xa.reduce((s, v, j) => s + v * coef[j], 0)), mb = linkinv(xb.reduce((s, v, j) => s + v * coef[j], 0));
      sum += w[i] * (ma - mb);
      const da = w[i] * ma * (1 - ma), db = w[i] * mb * (1 - mb);
      for (let j = 0; j < coef.length; j++) grad[j] += xa[j] * da - xb[j] * db;
    }
    const ame = sum / sw / scale;
    const g = grad.map(v => v / sw / scale);
    const se = Math.sqrt(g.reduce((s, gi, i) => s + gi * vcov[i].reduce((t, v, j) => t + v * g[j], 0), 0));
    const z = ame / se;
    return { term, ame, se, z, p: 2 * pnorm(Math.abs(z), false), ciLower: ame - zc * se, ciUpper: ame + zc * se };
  });
}
