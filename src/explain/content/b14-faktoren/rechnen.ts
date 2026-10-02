// Rechnungen des Bereichs B14 „Skalen und Faktorenanalyse“ für die Reiter „Mit 200 Befragten“: Korrelationsmatrix,
// Hauptkomponenten wie mariposa::efa(extraction = "pca"), Varimax wie mariposa (zyklisch, Kaiser-normiert, SPSS),
// ein gemeinsamer Faktor wie mariposa::efa(extraction = "ml", n_factors = 1) und Cronbachs Alpha wie mariposa::reliability().
// Referenzwerte aus R stehen in b14-faktoren.test.ts.
import type { SampleCtx } from '../../types';
import type { SurveyRow } from '../../../domain/survey';
import { reliability, symEigen, omegaOneFactor } from '../../../tasks/kit/reliability';
import { fixed } from '../../format';

/** Die fünf Fragen zur Methoden-Zuversicht im Lehrdatensatz (Likert, 1 bis 7). */
export const METHODEN = ['methoden1', 'methoden2', 'methoden3', 'methoden4', 'methoden5'] as const;
/** Die Fragen kurz, wie sie in Texten heißen. */
export const FRAGE = ['Frage 1', 'Frage 2', 'Frage 3', 'Frage 4', 'Frage 5'] as const;
/** Die Fragetexte ohne Anführungszeichen. */
export const FRAGETEXT = [
  'Ich kann eine statistische Fragestellung formulieren.',
  'Ich kann passende Variablen auswählen.',
  'Ich kann ein statistisches Ergebnis erklären.',
  'Ich kann Voraussetzungen eines Verfahrens prüfen.',
  'Ich kann einen Analyseweg begründen.',
] as const;
/** Feste Spalten der Reiter: x ist Frage 1, y ist Frage 2; gerechnet wird immer mit allen fünf Fragen. */
export const SPALTEN = { x: 'methoden1', y: 'methoden2' } as const;

export type Matrix = number[][];

/** Spalten der fünf Fragen aus den aktuellen Daten. */
export const itemColumns = (rows: readonly SurveyRow[], ids: readonly string[] = METHODEN): number[][] => ids.map(id => rows.map(r => r.values[id]));

const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
/** Varianz mit n − 1. */
export const variance = (xs: readonly number[]) => { const m = mean(xs); return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1); };

/** Pearson-Korrelationsmatrix; null, wenn eine Spalte nicht streut (dann ist keine Korrelation definiert). */
export function corMatrix(cols: readonly number[][]): Matrix | null {
  const means = cols.map(mean), n = cols[0]?.length ?? 0;
  const dev = cols.map((c, j) => c.map(x => x - means[j]));
  const ss = dev.map(d => d.reduce((a, x) => a + x * x, 0));
  if (n < 3 || ss.some(s => !(s > 1e-12))) return null;
  return dev.map((a, i) => dev.map((b, j) => i === j ? 1 : a.reduce((s, x, k) => s + x * b[k], 0) / Math.sqrt(ss[i] * ss[j])));
}

/** Eigenwerte absteigend mit ihren Eigenvektoren (Spalten), aus dem Jacobi-Verfahren. */
export function eigenSorted(R: Matrix): { values: number[]; vectors: Matrix } {
  const { values, vectors } = symEigen(R);
  const order = values.map((_, i) => i).sort((a, b) => values[b] - values[a]);
  return { values: order.map(i => values[i]), vectors: R.map((_, row) => order.map(i => vectors[row][i])) };
}

/** Spalten mit negativer Summe umdrehen, wie mariposa (.efa_reflect): Eine Komponente ist nur bis aufs Vorzeichen bestimmt. */
export function reflect(L: Matrix): Matrix {
  const m = L[0]?.length ?? 0, flip = Array.from({ length: m }, (_, j) => L.reduce((s, row) => s + row[j], 0) < 0);
  return L.map(row => row.map((v, j) => flip[j] ? -v : v));
}

export type Pca = { values: number[]; loadings: Matrix; communalities: number[]; share: number[] };

/** Hauptkomponenten wie mariposa::efa(extraction = "pca"): Ladungen = Eigenvektor · √Eigenwert, Spalten gespiegelt. */
export function pca(R: Matrix, m: number): Pca {
  const { values, vectors } = eigenSorted(R), p = R.length;
  const loadings = reflect(vectors.map(row => row.slice(0, m).map((v, j) => v * Math.sqrt(Math.max(values[j], 0)))));
  return { values, loadings, communalities: loadings.map(row => row.reduce((s, l) => s + l * l, 0)), share: values.map(v => v / p) };
}

/**
 * Varimax wie mariposa (.efa_varimax, SPSS): Zeilen durch √Kommunalität teilen, jedes Faktorpaar zyklisch um
 * atan2(X, Y) / 4 drehen, bis das Kriterium um höchstens 1e−5 wächst (höchstens 25 Durchgänge), zurückskalieren,
 * Spalten mit negativer Summe spiegeln und nach Quadratsummen ordnen. `angle` ist der gesamte Drehwinkel bei zwei Faktoren.
 */
export function varimax(L: Matrix, maxit = 25, eps = 1e-5): { loadings: Matrix; iterations: number; angle: number } {
  const n = L.length, m = L[0].length;
  const h = L.map(row => Math.sqrt(row.reduce((s, v) => s + v * v, 0)) || 1);
  let A = L.map((row, i) => row.map(v => v / h[i]));
  let T: Matrix = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => i === j ? 1 : 0));
  const criterion = (A: Matrix) => {
    let sv = 0;
    for (let j = 0; j < m; j++) {
      let s2 = 0, s4 = 0;
      for (let i = 0; i < n; i++) { const a2 = A[i][j] ** 2; s2 += a2; s4 += a2 * a2; }
      sv += n * s4 - s2 * s2;
    }
    return sv / (n * n);
  };
  let old = NaN, iterations = 0;
  for (let it = 1; it <= maxit; it++) {
    iterations = it;
    const sv = criterion(A);
    if (it > 1 && sv - old <= eps) break;
    old = sv;
    for (let j = 0; j < m - 1; j++) for (let k = j + 1; k < m; k++) {
      let a = 0, b = 0, C = 0, D = 0;
      for (let i = 0; i < n; i++) {
        const u = A[i][j] ** 2 - A[i][k] ** 2, v = 2 * A[i][j] * A[i][k];
        a += u; b += v; C += u * u - v * v; D += 2 * u * v;
      }
      const X = D - 2 * a * b / n, Y = C - (a * a - b * b) / n, angle = Math.atan2(X, Y) / 4;
      if (Math.abs(Math.sin(angle)) <= 1e-15) continue;
      const cs = Math.cos(angle), sn = Math.sin(angle);
      A = A.map(row => { const r = [...row]; r[j] = row[j] * cs + row[k] * sn; r[k] = -row[j] * sn + row[k] * cs; return r; });
      T = T.map(row => { const r = [...row]; r[j] = row[j] * cs + row[k] * sn; r[k] = -row[j] * sn + row[k] * cs; return r; });
    }
  }
  let R = A.map((row, i) => row.map(v => v * h[i]));
  const flip = Array.from({ length: m }, (_, j) => R.reduce((s, row) => s + row[j], 0) < 0);
  R = R.map(row => row.map((v, j) => flip[j] ? -v : v));
  T = T.map(row => row.map((v, j) => flip[j] ? -v : v));
  const ss = Array.from({ length: m }, (_, j) => R.reduce((s, row) => s + row[j] ** 2, 0));
  const order = ss.map((_, j) => j).sort((a, b) => ss[b] - ss[a]);
  return { loadings: R.map(row => order.map(j => row[j])), iterations, angle: m === 2 ? Math.atan2(T[1][0], T[0][0]) : NaN };
}

export type OneFactorMl = { loadings: number[]; uniqueness: number[]; communalities: number[]; share: number };

/** Ein gemeinsamer Faktor mit Maximum Likelihood auf der Korrelationsmatrix (wie factanal, über src/tasks/kit/reliability.ts). */
export function mlOneFactor(R: Matrix): OneFactorMl | null {
  const f = omegaOneFactor(R, R);
  if (!f.lambda.length || f.lambda.some(l => !Number.isFinite(l))) return null;
  const communalities = f.lambda.map(l => l * l);
  return { loadings: f.lambda, uniqueness: f.psi, communalities, share: communalities.reduce((a, b) => a + b, 0) / R.length };
}

export type Alpha = { alpha: number; k: number; itemVars: number[]; sumItemVar: number; totalVar: number; alphaStd: number };

/** Cronbachs Alpha wie mariposa::reliability(): k / (k − 1) · (1 − Σ sⱼ² / sₓ²). */
export function cronbach(cols: readonly number[][]): Alpha {
  const r = reliability(cols as number[][], null, { omega: false });
  const itemVars = cols.map(variance), n = cols[0].length;
  const total = Array.from({ length: n }, (_, i) => cols.reduce((s, c) => s + c[i], 0));
  return { alpha: r.alpha, k: cols.length, itemVars, sumItemVar: itemVars.reduce((a, b) => a + b, 0), totalVar: variance(total), alphaStd: r.alphaStd };
}

// Kennwerte der fünf Fragen für die Reiter (aus den aktuellen Daten) ------------------------------------------------

/** Korrelationsmatrix der fünf Fragen in den aktuellen Daten; null, wenn eine Frage nicht streut. */
export const methodenR = (c: SampleCtx | readonly SurveyRow[]) => corMatrix(itemColumns('rows' in c ? c.rows : c));
/** Hauptkomponenten der fünf Fragen (m Komponenten); null, wenn eine Frage nicht streut. */
export function methodenPca(c: SampleCtx | readonly SurveyRow[], m = 1): Pca | null {
  const R = methodenR(c);
  return R ? pca(R, m) : null;
}
/** Zahl der Komponenten mit Eigenwert über 1 (Kaiser-Kriterium). */
export const aboveOne = (values: readonly number[]) => values.filter(v => v > 1).length;
/** Anteil als Prozent mit einer festen Nachkommastelle wie in R („64,0 %“ für Variance explained: 64.0%). */
export const pct1 = (share: number) => `${fixed(share * 100, 1)} %`;
