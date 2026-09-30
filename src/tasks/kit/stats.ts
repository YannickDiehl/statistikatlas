import { isMissingCode, type SavVariable } from '../../sandbox/readSav';

/** Werte einer Variable; fehlende Codes (Missing-Bereich, NA) werden NaN – wie getaggte NA nach read_spss(). */
export function validValues(v: SavVariable): Float64Array {
  return Float64Array.from(v.values, x => (isMissingCode(v, x) ? NaN : x));
}

export type Table = { rows: number[]; cols: number[]; cells: number[][]; n: number };
type Nums = ArrayLike<number>;

const usable = (x: Nums, y: Nums, w: Nums | null, i: number) =>
  Number.isFinite(x[i]) && Number.isFinite(y[i]) && (w === null || w[i] > 0);

/** Kreuztabelle über alle Fälle mit gültigem x und y (und Gewicht > 0), Zeilen = x, Spalten = y.
 *  Die Kategorien stammen aus den vollständigen Paaren. (mariposa 0.7.3 bildet sie je Variable und liefert NA, wenn eine
 *  Kategorie nur bei fehlendem Partner vorkommt – auf dem ALLBUS kommt das bei keiner Aufgabe vor.) */
export function crosstab(x: Nums, y: Nums, w: Nums | null = null): Table {
  const rowSet = new Set<number>(), colSet = new Set<number>();
  for (let i = 0; i < x.length; i++) if (usable(x, y, w, i)) { rowSet.add(x[i]); colSet.add(y[i]); }
  const rows = [...rowSet].sort((a, b) => a - b), cols = [...colSet].sort((a, b) => a - b);
  const ri = new Map(rows.map((r, k) => [r, k])), ci = new Map(cols.map((c, k) => [c, k]));
  const cells = rows.map(() => cols.map(() => 0));
  let n = 0;
  for (let i = 0; i < x.length; i++) {
    if (!usable(x, y, w, i)) continue;
    const add = w ? w[i] : 1;
    cells[ri.get(x[i])!][ci.get(y[i])!] += add;
    n += add;
  }
  return { rows, cols, cells, n };
}

/** R-Rundung (IEC 60559): bei genau ,5 zur geraden Zahl. */
export function roundHalfEven(v: number): number {
  const r = Math.round(v);
  return Math.abs(v % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}

/** mariposa rundet gewichtete Zellen vor χ² und Gamma auf ganze Zahlen (wie SPSS); Zeilen und Spalten, die dabei leer werden, fallen weg (wie mariposa ab 0.7.4). */
export function roundTable(t: Table): Table {
  const rounded = t.cells.map(row => row.map(roundHalfEven));
  const keepRow = rounded.map(row => row.some(c => c > 0));
  const keepCol = t.cols.map((_, j) => rounded.some(row => row[j] > 0));
  const cells = rounded.filter((_, i) => keepRow[i]).map(row => row.filter((_, j) => keepCol[j]));
  return { rows: t.rows.filter((_, i) => keepRow[i]), cols: t.cols.filter((_, j) => keepCol[j]), cells, n: cells.flat().reduce((a, b) => a + b, 0) };
}

export function chiSquare(cells: number[][]): { chi2: number; df: number; n: number } {
  const rowSum = cells.map(r => r.reduce((a, b) => a + b, 0));
  const colSum = cells[0]?.map((_, j) => cells.reduce((a, r) => a + r[j], 0)) ?? [];
  const n = rowSum.reduce((a, b) => a + b, 0);
  let chi2 = 0;
  cells.forEach((row, i) => row.forEach((o, j) => {
    const e = rowSum[i] * colSum[j] / n;
    chi2 += (o - e) ** 2 / e;
  }));
  return { chi2, df: (cells.length - 1) * (colSum.length - 1), n };
}

const tableFor = (x: Nums, y: Nums, w: Nums | null) => (w ? roundTable(crosstab(x, y, w)) : crosstab(x, y));

/** Cramér-V wie mariposa::cramers_v(): χ² ohne Korrektur, gewichtet auf gerundeten Zellen. */
export function cramersV(x: Nums, y: Nums, w: Nums | null = null): number {
  const t = tableFor(x, y, w), { chi2, n } = chiSquare(t.cells);
  return Math.sqrt(chi2 / (n * Math.min(t.rows.length - 1, t.cols.length - 1)));
}

/** Phi wie mariposa::phi(): √(χ²/n), ohne Vorzeichen, auch für größere Tabellen. */
export function phi(x: Nums, y: Nums, w: Nums | null = null): number {
  const t = tableFor(x, y, w);
  if (Math.min(t.rows.length, t.cols.length) < 2) return NaN;
  const { chi2, n } = chiSquare(t.cells);
  return Math.sqrt(chi2 / n);
}

/** Summe aller Zellen rechts unterhalb (dir = 1) bzw. links unterhalb (dir = -1) von (i, j). */
function below(cells: number[][], i: number, j: number, dir: 1 | -1): number {
  let s = 0;
  for (let k = i + 1; k < cells.length; k++) {
    for (let l = dir === 1 ? j + 1 : 0; dir === 1 ? l < cells[k].length : l < j; l++) s += cells[k][l];
  }
  return s;
}

/** Goodman-Kruskal-Gamma wie mariposa::goodman_gamma(): konkordante gegen diskordante Paare, gewichtet auf gerundeten Zellen. */
export function gamma(x: Nums, y: Nums, w: Nums | null = null): number {
  const { cells } = tableFor(x, y, w);
  let p = 0, q = 0;
  cells.forEach((row, i) => row.forEach((o, j) => { p += o * below(cells, i, j, 1); q += o * below(cells, i, j, -1); }));
  return (p - q) / (p + q);
}

/** Kendall Tau-b wie mariposa::kendall_tau(); mit Gewichten zählt jedes Paar √(wᵢ·wⱼ) – über Zellsummen von √w und w. */
export function tauB(x: Nums, y: Nums, w: Nums | null = null): number {
  const s = crosstab(x, y, w ? Float64Array.from({ length: x.length }, (_, i) => Math.sqrt(w[i])) : null);
  const W = w ? crosstab(x, y, w).cells : s.cells;
  const S = s.cells, sum = (m: number[][]) => m.flat().reduce((a, b) => a + b, 0);
  const tot = (sum(S) ** 2 - sum(W)) / 2;
  const tx = S.reduce((a, row, i) => a + (row.reduce((b, c) => b + c, 0) ** 2 - W[i].reduce((b, c) => b + c, 0)) / 2, 0);
  const ty = (S[0] ?? []).reduce((a, _, j) => {
    const cs = S.reduce((b, row) => b + row[j], 0), cw = W.reduce((b, row) => b + row[j], 0);
    return a + (cs ** 2 - cw) / 2;
  }, 0);
  let c = 0, d = 0;
  S.forEach((row, i) => row.forEach((v, j) => { c += v * below(S, i, j, 1); d += v * below(S, i, j, -1); }));
  return (c - d) / Math.sqrt((tot - tx) * (tot - ty));
}

function ranks(v: number[]): number[] {
  const order = v.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  const out = new Array<number>(v.length);
  for (let k = 0; k < order.length;) {
    let e = k;
    while (e + 1 < order.length && order[e + 1][0] === order[k][0]) e++;
    for (let m = k; m <= e; m++) out[order[m][1]] = (k + e) / 2 + 1;
    k = e + 1;
  }
  return out;
}

function pairs(x: Nums, y: Nums, w: Nums | null) {
  const xs: number[] = [], ys: number[] = [], ws: number[] = [];
  for (let i = 0; i < x.length; i++) if (usable(x, y, w, i)) { xs.push(x[i]); ys.push(y[i]); ws.push(w ? w[i] : 1); }
  return { xs, ys, ws };
}

/** Pearson-r, gewichtet wie mariposa::pearson_cor(weights = …). */
export function pearson(x: Nums, y: Nums, w: Nums | null = null): number {
  const { xs, ys, ws } = pairs(x, y, w);
  const sw = ws.reduce((a, b) => a + b, 0);
  const mx = xs.reduce((a, v, i) => a + ws[i] * v, 0) / sw, my = ys.reduce((a, v, i) => a + ws[i] * v, 0) / sw;
  let sxy = 0, sxx = 0, syy = 0;
  xs.forEach((v, i) => { sxy += ws[i] * (v - mx) * (ys[i] - my); sxx += ws[i] * (v - mx) ** 2; syy += ws[i] * (ys[i] - my) ** 2; });
  return sxy / Math.sqrt(sxx * syy);
}

/** Spearman-ρ wie mariposa::spearman_rho(): Gewichte dienen nur der Fallauswahl, gerechnet wird ungewichtet. */
export function spearman(x: Nums, y: Nums, w: Nums | null = null): number {
  const { xs, ys } = pairs(x, y, w);
  return pearson(ranks(xs), ranks(ys));
}

export type MeasureId = 'V' | 'phi' | 'gamma' | 'tau' | 'rho' | 'r';
export const MEASURES: Record<MeasureId, { label: string; fn: (x: Nums, y: Nums, w: Nums | null) => number; r: string }> = {
  V: { label: 'Cramér-V', fn: cramersV, r: 'cramers_v' },
  phi: { label: 'Phi', fn: phi, r: 'phi' },
  gamma: { label: 'Gamma', fn: gamma, r: 'goodman_gamma' },
  tau: { label: 'Tau-b', fn: tauB, r: 'kendall_tau' },
  rho: { label: 'Spearman-ρ', fn: spearman, r: 'spearman_rho' },
  r: { label: 'Pearson-r', fn: pearson, r: 'pearson_cor' },
};

/** Kleiner, reproduzierbarer Zufallsgenerator (mulberry32). */
export function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Zufalls-V: Mittel von V, wenn y zufällig unter den Fällen vertauscht wird – so groß wird V schon ohne jeden Zusammenhang. */
export function permutationV(x: Nums, y: Nums, w: Nums | null, runs = 20, seed = 2023): number {
  const { xs, ys, ws } = pairs(x, y, w);
  const next = random(seed), shuffled = [...ys];
  let total = 0;
  for (let r = 0; r < runs; r++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    total += cramersV(xs, shuffled, w ? ws : null);
  }
  return total / runs;
}
