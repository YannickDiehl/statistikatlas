/* Reliabilität wie mariposa 0.7.3: reliability() (Cronbachs α roh und standardisiert, McDonalds ω aus einem
 * Ein-Faktor-ML-Modell wie stats::factanal(), Trennschärfen, α und ω ohne Item) und row_means()/row_sums().
 * Fehlende Werte sind NaN (wie getaggte NA nach read_spss()). */

type Nums = ArrayLike<number>;

export type ItemTotal = {
  /** Skalenmittel ohne das Item (Summe der übrigen Itemmittel). */
  scaleMeanIfDeleted: number;
  /** Varianz der Summe der übrigen Items. */
  scaleVarIfDeleted: number;
  /** Trennschärfe: Korrelation des Items mit der Summe der übrigen Items. */
  corrected: number;
  alphaIfDeleted: number;
  /** ω ohne das Item: Modell neu geschätzt; NaN, wenn weniger als drei Items übrig bleiben. */
  omegaIfDeleted: number;
};

export type Reliability = {
  k: number;
  /** Fälle mit gültigen Werten auf allen Items (listenweise). */
  n: number;
  /** Summe der Gewichte der listenweise vollständigen Fälle (nur gewichtet). */
  weightedN: number | null;
  alpha: number;
  alphaStd: number;
  /** McDonalds ω (roh, Kovarianzmetrik) – das ω, das print() zeigt; NaN bei weniger als drei Items. */
  omega: number;
  omegaStd: number;
  /** Eine Einzigartigkeit liegt an der Grenze 0,005 von factanal (Heywood-Fall): ω ist dann kein sinnvoller Wert. */
  omegaBoundary: boolean;
  itemMeans: number[];
  itemSds: number[];
  cov: number[][];
  cor: number[][];
  items: ItemTotal[];
};

const sum = (a: ArrayLike<number>) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; };
const sumAll = (m: number[][]) => m.reduce((a, row) => a + sum(row), 0);
const sub = (m: number[][], idx: number[]) => idx.map(i => idx.map(j => m[i][j]));

/** Kovarianzmatrix wie stats::cov() bzw. mariposa .weighted_cov() (Nenner Σw − 1). */
function covariance(cols: Float64Array[], w: Float64Array | null): number[][] {
  const k = cols.length, n = cols[0]?.length ?? 0;
  const V1 = w ? sum(w) : n;
  const means = cols.map(c => { let s = 0; for (let i = 0; i < n; i++) s += (w ? w[i] : 1) * c[i]; return s / V1; });
  const out = cols.map(() => new Array<number>(k).fill(0));
  for (let a = 0; a < k; a++) for (let b = a; b < k; b++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += (w ? w[i] : 1) * (cols[a][i] - means[a]) * (cols[b][i] - means[b]);
    out[a][b] = out[b][a] = s / (V1 - 1);
  }
  return out;
}

function correlation(cov: number[][]): number[][] {
  const sd = cov.map((row, i) => Math.sqrt(row[i]));
  return cov.map((row, i) => row.map((c, j) => (i === j ? 1 : c / (sd[i] * sd[j]))));
}

/** Korrelation zweier Spalten wie stats::cor() bzw. mariposa .weighted_cor_vec(). */
function cor2(x: ArrayLike<number>, y: ArrayLike<number>, w: Float64Array | null): number {
  const n = x.length, V1 = w ? sum(w) : n;
  let mx = 0, my = 0;
  for (let i = 0; i < n; i++) { const wi = w ? w[i] : 1; mx += wi * x[i]; my += wi * y[i]; }
  mx /= V1; my /= V1;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    const wi = w ? w[i] : 1, dx = x[i] - mx, dy = y[i] - my;
    sxy += wi * dx * dy; sxx += wi * dx * dx; syy += wi * dy * dy;
  }
  if (sxx <= 0 || syy <= 0) return NaN;
  return sxy / Math.sqrt(sxx * syy);
}

const alphaOf = (cov: number[][]) => {
  const k = cov.length;
  return (k / (k - 1)) * (1 - cov.reduce((a, row, i) => a + row[i], 0) / sumAll(cov));
};

/** Inverse einer kleinen symmetrischen, positiv definiten Matrix (Gauß-Jordan mit Pivotsuche). */
function invert(m: number[][]): number[][] | null {
  const k = m.length, a = m.map((row, i) => [...row, ...row.map((_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < k; c++) {
    let p = c;
    for (let r = c + 1; r < k; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    if (Math.abs(a[p][c]) < 1e-14) return null;
    [a[c], a[p]] = [a[p], a[c]];
    const piv = a[c][c];
    for (let j = 0; j < 2 * k; j++) a[c][j] /= piv;
    for (let r = 0; r < k; r++) if (r !== c) {
      const f = a[r][c];
      if (f !== 0) for (let j = 0; j < 2 * k; j++) a[r][j] -= f * a[c][j];
    }
  }
  return a.map(row => row.slice(k));
}

export type OneFactor = { lambda: number[]; psi: number[]; omega: number; omegaStd: number; boundary: boolean };

/** Ein-Faktor-Maximum-Likelihood-Lösung auf der Korrelationsmatrix wie stats::factanal(factors = 1)
 *  (Einzigartigkeiten in [0,005; 1], Start (1 − 0,5/p) / diag(R⁻¹)), daraus ω wie mariposa .omega_one_factor():
 *  ω_std = (Σλ)² / ((Σλ)² + Σψ); ω roh mit λ·sd und ψ·Varianz aus der Kovarianzmatrix.
 *  Gelöst mit dem EM-Algorithmus bis zur Maschinengenauigkeit; factanal hört mit L-BFGS-B früher auf,
 *  daher weicht R in der sechsten bis achten Nachkommastelle ab. */
export function omegaOneFactor(cor: number[][], cov: number[][]): OneFactor {
  const p = cor.length, LOWER = 0.005;
  const nan: OneFactor = { lambda: [], psi: [], omega: NaN, omegaStd: NaN, boundary: false };
  if (p < 3) return nan;
  const inv = invert(cor);
  if (!inv) return nan;
  let psi = inv.map((row, i) => Math.min(1, Math.max(LOWER, (1 - 0.5 / p) / row[i])));
  let lambda = psi.map(s => Math.sqrt(Math.max(1 - s, 0.01)));
  for (let iter = 0; iter < 100000; iter++) {
    // E-Schritt über Woodbury: β = Σ⁻¹λ = (λ/ψ) / (1 + λ'Ψ⁻¹λ)
    const a = lambda.map((l, i) => l / psi[i]);
    const c = 1 + lambda.reduce((s, l, i) => s + l * a[i], 0);
    const beta = a.map(x => x / c);
    const sBeta = cor.map(row => row.reduce((s, r, j) => s + r * beta[j], 0));
    const ezz = 1 - beta.reduce((s, b, i) => s + b * lambda[i], 0) + beta.reduce((s, b, i) => s + b * sBeta[i], 0);
    const nextLambda = sBeta.map(x => x / ezz);
    const nextPsi = nextLambda.map((l, i) => Math.min(1, Math.max(LOWER, cor[i][i] - l * sBeta[i])));
    let change = 0;
    for (let i = 0; i < p; i++) change = Math.max(change, Math.abs(nextPsi[i] - psi[i]), Math.abs(nextLambda[i] - lambda[i]));
    lambda = nextLambda; psi = nextPsi;
    if (!Number.isFinite(change)) return nan;
    if (change < 1e-15) break;
  }
  if (sum(lambda) < 0) lambda = lambda.map(l => -l);
  const sl = sum(lambda), omegaStd = sl ** 2 / (sl ** 2 + sum(psi));
  const lr = lambda.map((l, i) => l * Math.sqrt(cov[i][i])), tr = psi.map((s, i) => s * cov[i][i]);
  const omega = sum(lr) ** 2 / (sum(lr) ** 2 + sum(tr));
  return { lambda, psi, omega, omegaStd, boundary: psi.some(s => s <= LOWER + 1e-4) };
}

/** mariposa::reliability(): listenweiser Ausschluss (bei Gewichten auch fehlende Gewichte), sonst wie in R.
 *  omega: false überspringt das Faktormodell (ω-Felder NaN), wenn nur α gebraucht wird. */
export function reliability(items: Nums[], w: Nums | null = null, { omega: withOmega = true }: { omega?: boolean } = {}): Reliability {
  const k = items.length, N = items[0]?.length ?? 0;
  const keep: number[] = [];
  rows: for (let i = 0; i < N; i++) {
    for (let j = 0; j < k; j++) if (!Number.isFinite(items[j][i])) continue rows;
    if (!w || Number.isFinite(w[i])) keep.push(i);
  }
  const n = keep.length;
  const cols = items.map(x => Float64Array.from(keep, i => x[i]));
  const ww = w ? Float64Array.from(keep, i => w[i]) : null;
  const weightedN = ww ? sum(ww) : null;
  if (n < 2 || k < 2) {
    return { k, n, weightedN, alpha: NaN, alphaStd: NaN, omega: NaN, omegaStd: NaN, omegaBoundary: false, itemMeans: [], itemSds: [], cov: [], cor: [], items: [] };
  }
  const cov = covariance(cols, ww), cor = correlation(cov);
  const alpha = alphaOf(cov);
  const off: number[] = [];
  for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) off.push(cor[a][b]);
  const meanR = sum(off) / off.length;
  const alphaStd = (k * meanR) / (1 + (k - 1) * meanR);
  const om = k >= 3 && withOmega ? omegaOneFactor(cor, cov) : null;
  const V1 = ww ? sum(ww) : n;
  const itemMeans = cols.map(c => { let s = 0; for (let i = 0; i < n; i++) s += (ww ? ww[i] : 1) * c[i]; return s / V1; });
  const itemSds = cov.map((row, i) => Math.sqrt(row[i]));
  const itemTotal: ItemTotal[] = items.map((_, i) => {
    const rest = [...Array(k).keys()].filter(j => j !== i), rc = sub(cov, rest);
    const total = Float64Array.from({ length: n }, (_, r) => rest.reduce((s, j) => s + cols[j][r], 0));
    const varRest = sumAll(rc);
    return {
      scaleMeanIfDeleted: rest.reduce((s, j) => s + itemMeans[j], 0),
      scaleVarIfDeleted: varRest,
      corrected: cor2(cols[i], total, ww),
      alphaIfDeleted: varRest > 0 && k - 1 > 1 ? alphaOf(rc) : NaN,
      omegaIfDeleted: k - 1 >= 3 && withOmega ? omegaOneFactor(sub(cor, rest), rc).omega : NaN,
    };
  });
  return {
    k, n, weightedN, alpha, alphaStd, omega: om ? om.omega : NaN, omegaStd: om ? om.omegaStd : NaN, omegaBoundary: om?.boundary ?? false,
    itemMeans, itemSds, cov, cor, items: itemTotal,
  };
}

function rowAggregate(items: Nums[], minValid: number | undefined, mean: boolean): Float64Array {
  const N = items[0]?.length ?? 0;
  return Float64Array.from({ length: N }, (_, i) => {
    let s = 0, valid = 0;
    for (const x of items) if (Number.isFinite(x[i])) { s += x[i]; valid++; }
    if (valid === 0 || (minValid !== undefined && valid < minValid)) return NaN;
    return mean ? s / valid : s;
  });
}

/** mariposa::row_means(): Mittel der gültigen Werte je Person; NaN ohne gültigen Wert oder mit weniger als min_valid. */
export const rowMeans = (items: Nums[], minValid?: number) => rowAggregate(items, minValid, true);
/** mariposa::row_sums(): Summe der gültigen Werte je Person; NaN ohne gültigen Wert oder mit weniger als min_valid. */
export const rowSums = (items: Nums[], minValid?: number) => rowAggregate(items, minValid, false);
