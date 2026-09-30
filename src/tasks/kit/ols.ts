// Gewichtete lineare Regression wie mariposa 0.7.3 linear_regression() (Tests: ols.test.ts), dazu Kennwerte je Gruppe
// wie describe(), der Levene-Test wie levene_test() und DFBETA für den „Wackeltest“.
//
// mariposa (R/linear_regression.R, .lm_core) rechnet mit Gewichten wie SPSS WEIGHT BY (Frequenzgewichte):
//   listwise: y, alle Prädiktoren und das Gewicht vorhanden; lm(…, weights = w) liefert die Koeffizienten,
//   SS_res = Σ w e², SS_tot = Σ w (y − ȳ_w)², R² = 1 − SS_res/SS_tot,
//   df_res = Σw − rank (nicht ganzzahlig), df_tot = Σw − 1, df_reg = k (Prädiktoren ohne Konstante),
//   σ = √(SS_res/df_res) („Std. Error of Estimate“), SE_j = σ·√[(XᵀWX)⁻¹]_jj, t = B/SE, p = 2·P(T > |t|; df_res),
//   KI = B ± t(1 − α/2; df_res)·SE, adj. R² = 1 − (1 − R²)·df_tot/df_res, F = (SS_reg/k)/(SS_res/df_res),
//   ausgegebenes N = round(Σw), Beta = B·sd_w(x)/sd_w(y) mit Nenner Σw − 1.
// Ohne Gewicht gilt lm() unverändert: df_res = n − p, N = n.
import { pf, pt, qt } from './dist';
import { wls, type Matrix } from './linalg';

type Nums = ArrayLike<number>;

export type OlsFit = {
  terms: string[];
  coef: number[];
  se: number[];
  t: number[];
  p: number[];
  ciLower: number[];
  ciUpper: number[];
  /** Standardisierte Koeffizienten; für die Konstante NaN. */
  beta: number[];
  weighted: boolean;
  /** Zahl der verwendeten Fälle (ungewichtet). */
  n: number;
  /** Σw, ohne Gewicht = n. */
  sumW: number;
  /** Was mariposa als N druckt: round(Σw) mit Gewicht, sonst n. */
  nPrinted: number;
  dfModel: number;
  dfResidual: number;
  dfTotal: number;
  ssRegression: number;
  ssResidual: number;
  ssTotal: number;
  r2: number;
  adjR2: number;
  F: number;
  pF: number;
  /** Standardfehler der Schätzung (σ). */
  sigma: number;
  yMean: number;
  vcov: Matrix;
  level: number;
  /** Fallnummern (Zeilen der Datei) der verwendeten Fälle; X, y, w, fitted und residuals stehen in dieser Reihenfolge. */
  rows: number[];
  X: Matrix;
  y: number[];
  w: number[];
  fitted: number[];
  residuals: number[];
};

export type OlsOptions = {
  /** Namen der Prädiktoren (ohne Konstante). */
  names?: string[];
  /** Konfidenzniveau, Standard 0,95. */
  level?: number;
  /** Zusätzliche Fallauswahl (wie filter()); nur Fälle mit keep(i) werden verwendet. */
  keep?: (i: number) => boolean;
};

/** Kern: Schätzung auf einer fertigen Designmatrix (erste Spalte = Konstante). Wirft Error('singular') bzw. Error('too few cases'). */
function fitDesign(X: Matrix, y: number[], w: number[] | null, terms: string[], level: number, rows: number[]): OlsFit {
  const p = terms.length, k = p - 1, n = y.length;
  // mariposa: „Insufficient observations for the number of predictors.“
  if (n < k + 2) throw new Error('too few cases');
  const ww = w ?? y.map(() => 1);
  const { coef, xtwxInv, fitted, residuals, rss } = wls(X, y, w ?? undefined);
  const sumW = ww.reduce((a, b) => a + b, 0);
  const yMean = y.reduce((a, v, i) => a + ww[i] * v, 0) / sumW;
  const ssTotal = y.reduce((a, v, i) => a + ww[i] * (v - yMean) ** 2, 0);
  const ssResidual = rss;
  const ssRegression = ssTotal - ssResidual;
  const dfResidual = w ? sumW - p : n - p;
  const dfTotal = w ? sumW - 1 : n - 1;
  const msResidual = ssResidual / dfResidual;
  const sigma = Math.sqrt(msResidual);
  const vcov = xtwxInv.map(row => row.map(v => v * msResidual));
  const se = vcov.map((row, j) => Math.sqrt(row[j]));
  const t = coef.map((b, j) => b / se[j]);
  const pv = t.map(v => 2 * pt(-Math.abs(v), dfResidual));
  const crit = qt(1 - (1 - level) / 2, dfResidual);
  const r2 = ssRegression / ssTotal;
  const F = (ssRegression / k) / msResidual;
  const sdY = Math.sqrt(ssTotal / (sumW - 1));
  const beta = terms.map((_, j) => {
    if (j === 0) return NaN;
    const mx = X.reduce((a, row, i) => a + ww[i] * row[j], 0) / sumW;
    const sdX = Math.sqrt(X.reduce((a, row, i) => a + ww[i] * (row[j] - mx) ** 2, 0) / (sumW - 1));
    return coef[j] * sdX / sdY;
  });
  return {
    terms, coef, se, t, p: pv,
    ciLower: coef.map((b, j) => b - crit * se[j]), ciUpper: coef.map((b, j) => b + crit * se[j]),
    beta, weighted: w !== null, n, sumW, nPrinted: w ? Math.round(sumW) : n,
    dfModel: k, dfResidual, dfTotal, ssRegression, ssResidual, ssTotal,
    r2, adjR2: 1 - (1 - r2) * dfTotal / dfResidual, F, pF: pf(F, k, dfResidual, false),
    sigma, yMean, vcov, level, rows, X, y, w: ww, fitted, residuals,
  };
}

/** linear_regression(y ~ x1 + … , weights = w): listwise über y, alle x und w (NaN = fehlend).
 *  Wirft Error('singular') bei kollinearem Design (z. B. alle vier Dummies) und Error('too few cases'). */
export function ols(y: Nums, xs: Nums[], w: Nums | null = null, opts: OlsOptions = {}): OlsFit {
  const names = opts.names ?? xs.map((_, j) => `x${j + 1}`);
  const rows: number[] = [], X: Matrix = [], yy: number[] = [], ww: number[] = [];
  for (let i = 0; i < y.length; i++) {
    if (opts.keep && !opts.keep(i)) continue;
    if (!Number.isFinite(y[i]) || (w && !Number.isFinite(w[i])) || xs.some(x => !Number.isFinite(x[i]))) continue;
    rows.push(i); X.push([1, ...xs.map(x => x[i])]); yy.push(y[i]); if (w) ww.push(w[i]);
  }
  return fitDesign(X, yy, w ? ww : null, ['(Intercept)', ...names], opts.level ?? 0.95, rows);
}

/** Wie ols(), aber null statt Fehler, wenn das Modell nicht schätzbar ist (kollinear, zu wenige Fälle). */
export function tryOls(y: Nums, xs: Nums[], w: Nums | null = null, opts: OlsOptions = {}): OlsFit | null {
  try { return ols(y, xs, w, opts); } catch { return null; }
}

/** Linearer Prädiktor B0 + Σ Bj·xj für eine Zeile x (ohne Konstante). */
export const predict = (fit: OlsFit, x: number[]) => fit.coef[0] + x.reduce((a, v, j) => a + fit.coef[j + 1] * v, 0);

/** Vorhersage mit Standardfehler und Konfidenzintervall des Erwartungswerts (wie predict(…, interval = "confidence")). */
export function predictCi(fit: OlsFit, x: number[]): { fit: number; se: number; lower: number; upper: number } {
  const x0 = [1, ...x];
  const v = x0.reduce((a, xi, i) => a + xi * x0.reduce((b, xj, j) => b + fit.vcov[i][j] * xj, 0), 0);
  const se = Math.sqrt(v), crit = qt(1 - (1 - fit.level) / 2, fit.dfResidual), value = predict(fit, x);
  return { fit: value, se, lower: value - crit * se, upper: value + crit * se };
}

/** Neuschätzung ohne einige der verwendeten Fälle (Positionen in fit.rows). Wirft wie ols(). */
export function refitWithout(fit: OlsFit, drop: Iterable<number>): OlsFit {
  const skip = new Set(drop);
  const keep = fit.rows.map((_, i) => i).filter(i => !skip.has(i));
  return fitDesign(keep.map(i => fit.X[i]), keep.map(i => fit.y[i]), fit.weighted ? keep.map(i => fit.w[i]) : null,
    fit.terms, fit.level, keep.map(i => fit.rows[i]));
}

/** DFBETA wie R dfbeta(lm(…, weights = w)): Änderung der Koeffizienten β̂ − β̂₍₋ᵢ₎, wenn Fall i fehlt (exakt, ohne Neuschätzung):
 *  (XᵀWX)⁻¹ xᵢ wᵢ eᵢ / (1 − hᵢᵢ) mit hᵢᵢ = wᵢ xᵢᵀ(XᵀWX)⁻¹xᵢ. Positiv heißt: Der Fall zieht den Koeffizienten nach oben.
 *  Zeile i gehört zu fit.rows[i]. */
export function dfbeta(fit: OlsFit): number[][] {
  // (XᵀWX)⁻¹ = vcov / σ²
  const inv = fit.vcov.map(row => row.map(v => v / fit.sigma ** 2));
  // wie lm.influence(): winzige gewichtete Residuen gelten als 0, Hebelwerte ab 1 − 10·eps als 1 (DFBETA dann 0)
  const wr = fit.residuals.map((e, i) => Math.sqrt(fit.w[i]) * e);
  const med = [...wr].map(Math.abs).sort((a, b) => a - b), m = med.length >> 1;
  const cut = 100 * Number.EPSILON * (med.length % 2 ? med[m] : (med[m - 1] + med[m]) / 2);
  return fit.X.map((x, i) => {
    const ax = inv.map(row => row.reduce((a, v, j) => a + v * x[j], 0));
    const h = fit.w[i] * x.reduce((a, v, j) => a + v * ax[j], 0);
    const e = Math.abs(wr[i]) < cut ? 0 : wr[i];
    const f = h >= 1 - 10 * Number.EPSILON ? 0 : Math.sqrt(fit.w[i]) * e / (1 - h);
    return ax.map(v => v * f);
  });
}

/** Wackeltest für einen Koeffizienten: ohne die k Fälle, die ihn am stärksten nach oben ziehen (größtes DFBETA), und ohne die k,
 *  die ihn am stärksten nach unten ziehen. NaN, wenn das Modell ohne diese Fälle nicht schätzbar ist. */
export function wobble(fit: OlsFit, term: number, k = 5, db: number[][] = dfbeta(fit)): { withoutUp: number; withoutDown: number } {
  // wie R order(…, decreasing = TRUE)[1:k] bzw. order(…)[1:k]: Gleichstände in Fallreihenfolge
  const pairs = db.map((row, i) => [row[term], i] as const);
  const up = [...pairs].sort((a, b) => b[0] - a[0] || a[1] - b[1]).slice(0, k).map(([, i]) => i);
  const down = [...pairs].sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, k).map(([, i]) => i);
  const refit = (drop: number[]) => { try { return refitWithout(fit, drop).coef[term]; } catch { return NaN; } };
  return { withoutUp: refit(up), withoutDown: refit(down) };
}

/* ---------- Kennwerte je Gruppe (describe) und Levene-Test ---------- */

export type GroupStat = { value: number; n: number; sumW: number; mean: number; sd: number };

/** Mittelwert und SD je Gruppe wie group_by(g) %>% describe(x, weights = w): SD mit Nenner Σw − 1 (ohne Gewicht n − 1);
 *  bei einem Fall (oder Σw ≤ 1) NaN wie mariposa. Gruppen aufsteigend nach Wert. */
export function groupStats(x: Nums, g: Nums, w: Nums | null = null): GroupStat[] {
  const by = new Map<number, { xs: number[]; ws: number[] }>();
  for (let i = 0; i < x.length; i++) {
    if (!Number.isFinite(x[i]) || !Number.isFinite(g[i]) || (w && !Number.isFinite(w[i]))) continue;
    const e = by.get(g[i]) ?? { xs: [], ws: [] };
    e.xs.push(x[i]); e.ws.push(w ? w[i] : 1); by.set(g[i], e);
  }
  return [...by.entries()].sort((a, b) => a[0] - b[0]).map(([value, { xs, ws }]) => {
    const sumW = ws.reduce((a, b) => a + b, 0);
    const mean = xs.reduce((a, v, i) => a + ws[i] * v, 0) / sumW;
    const ss = xs.reduce((a, v, i) => a + ws[i] * (v - mean) ** 2, 0);
    const sd = xs.length <= 1 || (w && sumW <= 1) ? NaN : Math.sqrt(ss / (w ? sumW - 1 : xs.length - 1));
    return { value, n: xs.length, sumW, mean, sd };
  });
}

/** Mittelwert und SD über alle gültigen Fälle wie describe(x, weights = w). */
export function describeOne(x: Nums, w: Nums | null = null): { n: number; sumW: number; mean: number; sd: number } {
  const [s] = groupStats(x, Float64Array.from({ length: x.length }, () => 0), w);
  return s ? { n: s.n, sumW: s.sumW, mean: s.mean, sd: s.sd } : { n: 0, sumW: 0, mean: NaN, sd: NaN };
}

export type LeveneResult = { F: number; df1: number; df2: number; p: number; groups: number };

/** Levene-Test wie mariposa levene_test(x, group = g, weights = w, center = …) (perform_single_levene_test):
 *  z = |x − Zentrum der Gruppe| (Zentrum: gewichteter Mittelwert, bei center = "median" der ungewichtete Median),
 *  dann einfaktorielle (gewichtete) ANOVA auf z: df1 = G − 1, df2 = Σw − G (ohne Gewicht n − G).
 *  NaN, wenn x konstant ist oder weniger als zwei Gruppen vorkommen (mariposa bricht dann ab). */
export function levene(x: Nums, g: Nums, w: Nums | null = null, center: 'mean' | 'median' = 'mean'): LeveneResult {
  const none = { F: NaN, df1: NaN, df2: NaN, p: NaN, groups: 0 };
  const distinct = new Set<number>();
  for (let i = 0; i < x.length; i++) if (Number.isFinite(x[i])) distinct.add(x[i]);
  if (distinct.size <= 1) return none;
  const groups = new Map<number, { xs: number[]; ws: number[] }>();
  for (let i = 0; i < x.length; i++) {
    if (!Number.isFinite(x[i]) || !Number.isFinite(g[i]) || (w && !Number.isFinite(w[i]))) continue;
    const e = groups.get(g[i]) ?? { xs: [], ws: [] };
    e.xs.push(x[i]); e.ws.push(w ? w[i] : 1); groups.set(g[i], e);
  }
  const G = groups.size;
  if (G < 2) return { ...none, groups: G };
  const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  let sw = 0, swz = 0;
  const parts = [...groups.values()].map(({ xs, ws }) => {
    const gw = ws.reduce((a, b) => a + b, 0);
    const c = center === 'median' ? median(xs) : xs.reduce((a, v, i) => a + ws[i] * v, 0) / gw;
    const z = xs.map(v => Math.abs(v - c));
    const zm = z.reduce((a, v, i) => a + ws[i] * v, 0) / gw;
    sw += gw; swz += zm * gw;
    return { z, ws, gw, zm };
  });
  const zAll = swz / sw;
  const ssBetween = parts.reduce((a, q) => a + q.gw * (q.zm - zAll) ** 2, 0);
  const ssWithin = parts.reduce((a, q) => a + q.z.reduce((b, v, i) => b + q.ws[i] * (v - q.zm) ** 2, 0), 0);
  const df1 = G - 1, df2 = sw - G;
  const F = (ssBetween / df1) / (ssWithin / df2);
  return { F, df1, df2, p: pf(F, df1, df2, false), groups: G };
}
