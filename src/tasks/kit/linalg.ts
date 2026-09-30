// Kleine dichte lineare Algebra für die Regressionsaufgaben (Tests: linalg.test.ts).

export type Matrix = number[][]; // zeilenweise

export function transpose(a: Matrix): Matrix {
  const cols = a[0]?.length ?? 0;
  return Array.from({ length: cols }, (_, j) => a.map(row => row[j]));
}

export function matMul(a: Matrix, b: Matrix): Matrix {
  const inner = b.length, cols = b[0]?.length ?? 0;
  if (a.some(row => row.length !== inner)) throw new Error('dimension mismatch');
  return a.map(row => {
    const out = new Array<number>(cols).fill(0);
    for (let k = 0; k < inner; k++) {
      const v = row[k];
      if (v === 0) continue;
      const bk = b[k];
      for (let j = 0; j < cols; j++) out[j] += v * bk[j];
    }
    return out;
  });
}

/** Relativer Pivot-Schwellenwert: Restvarianz einer Spalte unter 1e−10 ihres Diagonalelements gilt als kollinear. */
const PIVOT_TOL = 1e-10;

/** Cholesky-Zerlegung A = L·Lᵀ; wirft Error('singular'), wenn A nicht (numerisch) positiv definit ist. */
function cholesky(a: Matrix): Matrix {
  const n = a.length;
  if (a.some(row => row.length !== n)) throw new Error('dimension mismatch');
  const L: Matrix = a.map(() => new Array<number>(n).fill(0));
  for (let j = 0; j < n; j++) {
    let d = a[j][j];
    for (let k = 0; k < j; k++) d -= L[j][k] * L[j][k];
    if (!Number.isFinite(d) || !(a[j][j] > 0) || d <= PIVOT_TOL * a[j][j]) throw new Error('singular');
    const ljj = Math.sqrt(d);
    L[j][j] = ljj;
    for (let i = j + 1; i < n; i++) {
      let s = a[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      L[i][j] = s / ljj;
    }
  }
  return L;
}

/** Löst L·Lᵀ·x = b durch Vorwärts- und Rückwärtseinsetzen. */
function cholSolve(L: Matrix, b: number[]): number[] {
  const n = L.length;
  const y = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    let s = b[i];
    for (let k = 0; k < i; k++) s -= L[i][k] * y[k];
    y[i] = s / L[i][i];
  }
  const x = new Array<number>(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = y[i];
    for (let k = i + 1; k < n; k++) s -= L[k][i] * x[k];
    x[i] = s / L[i][i];
  }
  return x;
}

/** Löst A·x = b für symmetrisch positiv definites A (Cholesky); wirft Error('singular'). */
export function solveSPD(a: Matrix, b: number[]): number[] {
  if (b.length !== a.length) throw new Error('dimension mismatch');
  return cholSolve(cholesky(a), b);
}

/** Inverse einer symmetrisch positiv definiten Matrix (Cholesky); wirft Error('singular'). */
export function invertSPD(a: Matrix): Matrix {
  const L = cholesky(a);
  const n = a.length;
  const cols = Array.from({ length: n }, (_, j) => cholSolve(L, Array.from({ length: n }, (_, i) => (i === j ? 1 : 0))));
  // symmetrisieren (Spalte j = Zeile j bis auf Rundung)
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (cols[j][i] + cols[i][j]) / 2));
}

/** Gewichtete kleinste Quadrate: minimiert Σ w_i (y_i − x_i·β)². X enthält die Konstante, wenn gewünscht.
 *  Rechnet über (XᵀWX)⁻¹ mit Cholesky; wirft Error('singular') bei kollinearem Design. */
export function wls(X: Matrix, y: number[], w?: number[]): { coef: number[]; xtwxInv: Matrix; fitted: number[]; residuals: number[]; rss: number } {
  const n = X.length, p = X[0]?.length ?? 0;
  if (y.length !== n || (w && w.length !== n) || X.some(row => row.length !== p)) throw new Error('dimension mismatch');
  if (p === 0 || n < p) throw new Error('singular');
  if (y.some(v => !Number.isFinite(v)) || X.some(row => row.some(v => !Number.isFinite(v)))) throw new Error('non-finite value');
  if (w && w.some(v => !Number.isFinite(v) || v < 0)) throw new Error('invalid weight');
  const xtwx: Matrix = Array.from({ length: p }, () => new Array<number>(p).fill(0));
  const xtwy = new Array<number>(p).fill(0);
  for (let i = 0; i < n; i++) {
    const wi = w ? w[i] : 1;
    if (wi === 0) continue;
    const xi = X[i];
    for (let j = 0; j < p; j++) {
      const wx = wi * xi[j];
      xtwy[j] += wx * y[i];
      for (let k = 0; k <= j; k++) xtwx[j][k] += wx * xi[k];
    }
  }
  for (let j = 0; j < p; j++) for (let k = j + 1; k < p; k++) xtwx[j][k] = xtwx[k][j];
  const xtwxInv = invertSPD(xtwx);
  const coef = xtwxInv.map(row => row.reduce((s, v, k) => s + v * xtwy[k], 0));
  // eine Nachiteration gegen Rundungsfehler der Normalgleichungen
  const fitted0 = X.map(row => row.reduce((s, v, k) => s + v * coef[k], 0));
  const g = new Array<number>(p).fill(0);
  for (let i = 0; i < n; i++) {
    const wr = (w ? w[i] : 1) * (y[i] - fitted0[i]);
    for (let j = 0; j < p; j++) g[j] += X[i][j] * wr;
  }
  const delta = xtwxInv.map(row => row.reduce((s, v, k) => s + v * g[k], 0));
  for (let j = 0; j < p; j++) coef[j] += delta[j];
  const fitted = X.map(row => row.reduce((s, v, k) => s + v * coef[k], 0));
  const residuals = y.map((v, i) => v - fitted[i]);
  const rss = residuals.reduce((s, r, i) => s + (w ? w[i] : 1) * r * r, 0);
  return { coef, xtwxInv, fitted, residuals, rss };
}
