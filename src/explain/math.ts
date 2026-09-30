/** Kennwerte einer kleinen Beispielreihe (Werkstätten Mittel und Streuung). */
export interface Describe {
  n: number;
  sum: number;
  mean: number;
  dev: number[];
  sq: number[];
  ss: number;
  variance: number;
  sd: number;
  mad: number;
}

export function describe(xs: readonly number[]): Describe {
  const n = xs.length;
  const sum = xs.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const dev = xs.map(x => x - mean);
  const sq = dev.map(d => d * d);
  const ss = sq.reduce((a, b) => a + b, 0);
  const variance = n > 1 ? ss / (n - 1) : NaN;
  return { n, sum, mean, dev, sq, ss, variance, sd: Math.sqrt(variance), mad: dev.reduce((a, d) => a + Math.abs(d), 0) / n };
}

/** Kennwerte eines kleinen Wertepaar-Beispiels (Werkstatt Zusammenhang). */
export interface Relate {
  n: number;
  x: Describe;
  y: Describe;
  prod: number[];
  cp: number;
  pos: number;
  neg: number;
  cov: number;
  sxy: number;
  /** null, wenn eine Standardabweichung 0 ist. */
  r: number | null;
}

export function relate(xs: readonly number[], ys: readonly number[]): Relate {
  const x = describe(xs), y = describe(ys), n = xs.length;
  const prod = x.dev.map((d, i) => d * y.dev[i] || 0); // || 0: −0 als 0
  const cp = prod.reduce((a, b) => a + b, 0);
  const cov = cp / (n - 1);
  const sxy = x.sd * y.sd;
  return {
    n, x, y, prod, cp,
    pos: prod.filter(p => p > 0).reduce((a, b) => a + b, 0),
    neg: prod.filter(p => p < 0).reduce((a, b) => a + b, 0),
    cov, sxy, r: sxy > 1e-12 ? cov / sxy : null,
  };
}

export const standardError = (s: number, n: number) => s / Math.sqrt(n);

/** Beispielreihe mit ihren Werten, für die Texte der Werkstätten. */
export type Series = Describe & { xs: number[] };
export const series = (xs: readonly number[]): Series => ({ ...describe(xs), xs: [...xs] });

/** Wertepaare mit ihren Werten, für die Werkstatt Zusammenhang. */
export type Pairs = { x: number[]; y: number[] };
export type PairStats = Relate & { xs: number[]; ys: number[] };
export const pairStats = (d: Pairs): PairStats => ({ ...relate(d.x, d.y), xs: [...d.x], ys: [...d.y] });
