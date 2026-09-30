import { pf, pt, ptukey, qnorm, qt } from './dist';

/* Mittelwertvergleiche wie mariposa 0.7.3: t_test(), oneway_anova(), tukey_test() und pearson_cor() mit mehreren Variablen.
 * Fehlende Werte sind NaN (wie getaggte NA nach read_spss()). Gewichte wirken wie in mariposa als Häufigkeitsgewichte:
 * Summen der Gewichte ersetzen die Fallzahl (Freiheitsgrade, Standardfehler), gedruckte n sind round(Σw). */

type Nums = ArrayLike<number>;

const ok = (x: number) => Number.isFinite(x);
const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);

/** Studentisierte Spannweite: Quantil wie R qtukey() (nranges = 1), Sekantenverfahren aus nmath/qtukey.c mit eps = 0,0001. */
export function qtukey(p: number, nmeans: number, df: number): number {
  if (!(p >= 0 && p <= 1) || !(df >= 2) || !(nmeans >= 2)) return NaN;
  if (p === 0) return 0;
  if (p === 1) return Infinity;
  const eps = 0.0001, maxiter = 50;
  let x0 = qinv(p, nmeans, df);
  let valx0 = ptukey(x0, nmeans, df) - p;
  let x1 = valx0 > 0 ? Math.max(0, x0 - 1) : x0 + 1;
  let valx1 = ptukey(x1, nmeans, df) - p;
  let ans = 0;
  for (let iter = 1; iter < maxiter; iter++) {
    ans = x1 - (valx1 * (x1 - x0)) / (valx1 - valx0);
    valx0 = valx1;
    x0 = x1;
    if (ans < 0) ans = 0;
    valx1 = ptukey(ans, nmeans, df) - p;
    x1 = ans;
    if (Math.abs(x1 - x0) < eps) return ans;
  }
  return ans;
}

/** Startwert für qtukey() (Algorithmus AS 190.2, wie in R). */
function qinv(p: number, c: number, v: number): number {
  const p0 = 0.322232421088, q0 = 0.993484626060e-01, p1 = -1.0, q1 = 0.588581570495, p2 = -0.342242088547, q2 = 0.531103462366;
  const p3 = -0.204231210125, q3 = 0.103537752850, p4 = -0.453642210148e-04, q4 = 0.38560700634e-02;
  const c1 = 0.8832, c2 = 0.2368, c3 = 1.214, c4 = 1.208, c5 = 1.4142, vmax = 120.0;
  const ps = 0.5 - 0.5 * p;
  const yi = Math.sqrt(Math.log(1.0 / (ps * ps)));
  let t = yi + ((((yi * p4 + p3) * yi + p2) * yi + p1) * yi + p0) / ((((yi * q4 + q3) * yi + q2) * yi + q1) * yi + q0);
  if (v < vmax) t += (t * t * t + t) / v / 4.0;
  let q = c1 - c2 * t;
  if (v < vmax) q += -c3 / v + c4 * t / v;
  return t * (q * Math.log(c - 1.0) + c5);
}

/* ---------- Gruppen ---------- */

/** Kennwerte einer Gruppe. n = Fälle (ungewichtet) bzw. round(Σw) wie in mariposa; sumW = Σw (ungewichtet = n). */
export type GroupStat = { level: number; cases: number; n: number; sumW: number; mean: number; sd: number; se: number; ci: [number, number] };

/** Summen einer Gruppe: Σw, gewichteter Mittelwert, Σw(x − m)². */
function moments(x: number[], w: number[] | null) {
  const sw = w ? sum(w) : x.length;
  const mean = (w ? sum(x.map((v, i) => v * w[i])) : sum(x)) / sw;
  const ss = sum(x.map((v, i) => (w ? w[i] : 1) * (v - mean) ** 2));
  return { sw, mean, ss };
}

function groupStat(level: number, x: number[], w: number[] | null, conf: number): GroupStat {
  const { sw, mean, ss } = moments(x, w);
  const sd = Math.sqrt(ss / (sw - 1)), se = sd / Math.sqrt(sw), half = qt((1 + conf) / 2, sw - 1) * se;
  return { level, cases: x.length, n: w ? Math.round(sw) : x.length, sumW: sw, mean, sd, se, ci: [mean - half, mean + half] };
}

type Split = { levels: number[]; ys: number[][]; ws: number[][] | null };

/** Teilt die gültigen Fälle nach Gruppe. order 'sorted' wie factor() (ANOVA, Tukey), 'first' wie unique() (t_test). */
function split(y: Nums, g: Nums, w: Nums | null, order: 'sorted' | 'first', positiveWeights: boolean): Split {
  const index = new Map<number, number>(), ys: number[][] = [], ws: number[][] = [], levels: number[] = [];
  for (let i = 0; i < y.length; i++) {
    if (!ok(y[i]) || !ok(g[i])) continue;
    if (w && (!ok(w[i]) || (positiveWeights && w[i] <= 0))) continue;
    let k = index.get(g[i]);
    if (k === undefined) { k = levels.length; index.set(g[i], k); levels.push(g[i]); ys.push([]); ws.push([]); }
    ys[k].push(y[i]);
    if (w) ws[k].push(w[i]);
  }
  if (order === 'sorted') {
    const perm = levels.map((_, k) => k).sort((a, b) => levels[a] - levels[b]);
    return { levels: perm.map(k => levels[k]), ys: perm.map(k => ys[k]), ws: w ? perm.map(k => ws[k]) : null };
  }
  return { levels, ys, ws: w ? ws : null };
}

/** Mittelwerte (bei 0/1-Variablen: Anteile) je Gruppe wie in oneway_anova() – Gruppen aufsteigend, Gewichte > 0. */
export function describeGroups(y: Nums, g: Nums, w: Nums | null = null, conf = 0.95): GroupStat[] {
  const s = split(y, g, w, 'sorted', true);
  return s.levels.map((level, k) => groupStat(level, s.ys[k], s.ws ? s.ws[k] : null, conf));
}

/** Gewichteter (oder einfacher) Mittelwert aller gültigen Werte. */
export function mean(y: Nums, w: Nums | null = null): number {
  let s = 0, sw = 0;
  for (let i = 0; i < y.length; i++) {
    if (!ok(y[i]) || (w && !ok(w[i]))) continue;
    const wi = w ? w[i] : 1;
    s += wi * y[i];
    sw += wi;
  }
  return s / sw;
}

/* ---------- t-Test ---------- */

export type TRow = { t: number; df: number; p: number; se: number; ci: [number, number] };
export type TTest = {
  /** Reihenfolge wie mariposa: die Gruppe, die unter den gültigen Fällen zuerst vorkommt, steht vorn; diff = means[0] − means[1]. */
  levels: [number, number];
  n: [number, number];
  sumW: [number, number];
  means: [number, number];
  diff: number;
  /** Welch (ungleiche Varianzen) – mariposas Standard (var.equal = FALSE) und die Zeile in der Kurzausgabe. */
  welch: TRow;
  /** Gleiche Varianzen (Student) – die Zeile „Equal variances“ in summary(). */
  student: TRow;
  d: number;
  g: number;
  glass: number;
};

function tRow(diff: number, se: number, df: number, conf: number): TRow {
  const t = diff / se, half = qt((1 + conf) / 2, df) * se;
  return { t, df, p: 2 * pt(-Math.abs(t), df), se, ci: [diff - half, diff + half] };
}

/** Zweistichproben-t-Test wie mariposa::t_test(y, group = g, weights = w): Welch und Student, zweiseitig, mu = 0.
 *  null, wenn die Gruppenvariable nicht genau zwei Werte hat oder eine Gruppe zu klein ist (mariposa bricht dann ab). */
export function tTest(y: Nums, g: Nums, w: Nums | null = null, conf = 0.95): TTest | null {
  const s = split(y, g, w, 'first', false);
  if (s.levels.length !== 2) return null;
  const [x1, x2] = s.ys, [w1, w2] = s.ws ?? [null, null];
  const a = moments(x1, w1), b = moments(x2, w2);
  if (a.sw <= 1 || b.sw <= 1 || (!w && (x1.length < 2 || x2.length < 2))) return null;
  const v1 = a.ss / (a.sw - 1), v2 = b.ss / (b.sw - 1), diff = a.mean - b.mean;
  const pooled = ((a.sw - 1) * v1 + (b.sw - 1) * v2) / (a.sw + b.sw - 2);
  const seStudent = Math.sqrt(pooled * (1 / a.sw + 1 / b.sw));
  // t.test() bricht bei (fast) konstanten Daten ab – mariposa damit auch.
  if (!w && seStudent < 10 * Number.EPSILON * Math.max(Math.abs(a.mean), Math.abs(b.mean))) return null;
  const s1 = v1 / a.sw, s2 = v2 / b.sw, seWelch = Math.sqrt(s1 + s2);
  const dfWelch = (s1 + s2) ** 2 / (s1 ** 2 / (a.sw - 1) + s2 ** 2 / (b.sw - 1));
  // Effektstärken wie .t_test_cohens_d(): gepoolte SD über Σw − 2, Hedges-Korrektur mit (effektiven) Fallzahlen.
  const d = diff / Math.sqrt((a.ss + b.ss) / (a.sw + b.sw - 2));
  const kish = (ws: number[]) => sum(ws) ** 2 / sum(ws.map(v => v * v));
  const nEff = w1 && w2 ? kish(w1) + kish(w2) : x1.length + x2.length;
  return {
    levels: [s.levels[0], s.levels[1]],
    n: w ? [Math.round(a.sw), Math.round(b.sw)] : [x1.length, x2.length],
    sumW: [a.sw, b.sw],
    means: [a.mean, b.mean],
    diff,
    welch: tRow(diff, seWelch, dfWelch, conf),
    student: tRow(diff, seStudent, a.sw + b.sw - 2, conf),
    d,
    g: d * (1 - 3 / (4 * (nEff - 2) - 1)),
    glass: diff / Math.sqrt(v1),
  };
}

export type OneSample = { n: number; mean: number; t: number; df: number; p: number; ci: [number, number] };

/** Einstichproben-t-Test wie mariposa::t_test(y) ohne group: Mittelwert (bei 0/1: Anteil) mit Konfidenzintervall. */
export function oneSampleT(y: Nums, w: Nums | null = null, mu = 0, conf = 0.95): OneSample | null {
  const x: number[] = [], ws: number[] = [];
  for (let i = 0; i < y.length; i++) if (ok(y[i]) && (!w || ok(w[i]))) { x.push(y[i]); if (w) ws.push(w[i]); }
  const m = moments(x, w ? ws : null);
  if (m.sw <= 1 || (!w && x.length < 2)) return null;
  const se = Math.sqrt(m.ss / (m.sw - 1)) / Math.sqrt(m.sw), df = m.sw - 1, t = (m.mean - mu) / se, half = qt((1 + conf) / 2, df) * se;
  return { n: w ? Math.round(m.sw) : x.length, mean: m.mean, t, df, p: 2 * pt(-Math.abs(t), df), ci: [m.mean - half, m.mean + half] };
}

/* ---------- Einfaktorielle ANOVA ---------- */

export type Anova = {
  levels: number[];
  groups: GroupStat[];
  ssBetween: number;
  ssWithin: number;
  ssTotal: number;
  dfBetween: number;
  /** Ungewichtet N − k; gewichtet floor(Σw) − k wie mariposa. */
  dfWithin: number;
  msBetween: number;
  msWithin: number;
  F: number;
  p: number;
  eta2: number;
  epsilon2: number;
  omega2: number;
  /** Welchs Test (in summary() unter „Assumption Tests“). */
  welch: { F: number; df1: number; df2: number; p: number };
};

/** Einfaktorielle ANOVA wie mariposa::oneway_anova(y, group = g, weights = w). null bei weniger als zwei Gruppen oder ohne Rest-Freiheitsgrade. */
export function onewayAnova(y: Nums, g: Nums, w: Nums | null = null, conf = 0.95): Anova | null {
  const s = split(y, g, w, 'sorted', true);
  const k = s.levels.length;
  if (k < 2) return null;
  const m = s.ys.map((x, j) => moments(x, s.ws ? s.ws[j] : null));
  const swAll = sum(m.map(v => v.sw));
  const grand = sum(m.map(v => v.sw * v.mean)) / swAll;
  const ssBetween = sum(m.map(v => v.sw * (v.mean - grand) ** 2));
  const ssWithin = sum(m.map(v => v.ss));
  const dfBetween = k - 1, dfWithin = (w ? Math.floor(swAll) : swAll) - k;
  if (dfWithin < 1) return null;
  const msBetween = ssBetween / dfBetween, msWithin = ssWithin / dfWithin, F = msBetween / msWithin, ssTotal = ssBetween + ssWithin;
  // Welch wie oneway.test(var.equal = FALSE) bzw. .anova_welch_weighted(): Gewichte Σw / Varianz.
  const vars = m.map(v => v.ss / (v.sw - 1)), wt = m.map((v, j) => v.sw / vars[j]), swt = sum(wt);
  const mw = sum(wt.map((x, j) => x * m[j].mean)) / swt;
  const den = sum(wt.map((x, j) => (1 - x / swt) ** 2 / (m[j].sw - 1)));
  const welchF = sum(wt.map((x, j) => x * (m[j].mean - mw) ** 2)) / (k - 1) / (1 + 2 * (k - 2) / (k * k - 1) * den);
  const welchDf2 = (k * k - 1) / (3 * den);
  return {
    levels: s.levels,
    groups: s.levels.map((level, j) => groupStat(level, s.ys[j], s.ws ? s.ws[j] : null, conf)),
    ssBetween, ssWithin, ssTotal, dfBetween, dfWithin, msBetween, msWithin, F,
    p: pf(F, dfBetween, dfWithin, false),
    eta2: ssBetween / ssTotal,
    epsilon2: Math.max(0, (ssBetween - dfBetween * msWithin) / ssTotal),
    omega2: Math.max(0, (ssBetween - dfBetween * msWithin) / (ssTotal + msWithin)),
    welch: { F: welchF, df1: k - 1, df2: welchDf2, p: pf(welchF, k - 1, welchDf2, false) },
  };
}

/* ---------- Tukey HSD ---------- */

/** Ein Paarvergleich; diff = Mittelwert von a − Mittelwert von b, in mariposas Reihenfolge und Beschriftung. */
export type TukeyRow = { a: number; b: number; label: string; diff: number; se: number; lower: number; upper: number; p: number };

/** Tukey-HSD wie mariposa::tukey_test() nach oneway_anova().
 *  Ungewichtet über TukeyHSD(aov()): Paare „2-1“, „3-1“, … (spätere minus frühere Gruppe).
 *  Gewichtet über mariposas eigene Formel: Paare „1 - 2“, „1 - 3“, … (frühere minus spätere), df = Σw − k ohne Abrunden. */
export function tukeyHSD(y: Nums, g: Nums, w: Nums | null = null, conf = 0.95): TukeyRow[] | null {
  const s = split(y, g, w, 'sorted', true);
  const k = s.levels.length;
  if (k < 2) return null;
  const m = s.ys.map((x, j) => moments(x, s.ws ? s.ws[j] : null));
  const df = sum(m.map(v => v.sw - 1));
  if (df < 1) return null;
  const mse = sum(m.map(v => v.ss)) / df, q = qtukey(conf, k, df), rows: TukeyRow[] = [];
  const row = (i: number, j: number, label: string): TukeyRow => {
    const diff = m[i].mean - m[j].mean, se = Math.sqrt(mse * (1 / m[i].sw + 1 / m[j].sw)), half = (q / Math.SQRT2) * se;
    return { a: s.levels[i], b: s.levels[j], label, diff, se, lower: diff - half, upper: diff + half, p: ptukey((Math.abs(diff) / se) * Math.SQRT2, k, df, false) };
  };
  if (!w) {
    for (let j = 0; j < k; j++) for (let i = j + 1; i < k; i++) rows.push(row(i, j, `${s.levels[i]}-${s.levels[j]}`));
  } else {
    for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) rows.push(row(i, j, `${s.levels[i]} - ${s.levels[j]}`));
  }
  return rows;
}

/* ---------- Pearson-Korrelation und Korrelationsmatrix ---------- */

/** r mit p, n und Fisher-z-Intervall wie in pearson_cor(); n gewichtet = round(Σw). Nicht berechenbar: r = NaN. */
export type Cor = { r: number; p: number; n: number; df: number; ci: [number, number] };

export function pearsonTest(x: Nums, y: Nums, w: Nums | null = null, conf = 0.95): Cor {
  const xs: number[] = [], ys: number[] = [], ws: number[] = [];
  for (let i = 0; i < x.length; i++) {
    if (!ok(x[i]) || !ok(y[i]) || (w && (!ok(w[i]) || w[i] <= 0))) continue;
    xs.push(x[i]); ys.push(y[i]); ws.push(w ? w[i] : 1);
  }
  const n = xs.length, none: Cor = { r: NaN, p: NaN, n, df: NaN, ci: [NaN, NaN] };
  if (n < 3) return none;
  const sw = sum(ws), mx = sum(xs.map((v, i) => ws[i] * v)) / sw, my = sum(ys.map((v, i) => ws[i] * v)) / sw;
  let sxy = 0, sxx = 0, syy = 0;
  xs.forEach((v, i) => { sxy += ws[i] * (v - mx) * (ys[i] - my); sxx += ws[i] * (v - mx) ** 2; syy += ws[i] * (ys[i] - my) ** 2; });
  const nEff = w ? sw : n, nReport = w ? Math.round(sw) : n;
  let r = sxy / Math.sqrt(sxx * syy);
  if (!Number.isFinite(r)) return { ...none, n: nReport };
  r = Math.max(-1, Math.min(1, r));
  const df = nEff - 2;
  if (Math.abs(r) === 1) return { r, p: 0, n: nReport, df, ci: [r, r] };
  const t = r * Math.sqrt(df / (1 - r * r));
  const z = 0.5 * Math.log((1 + r) / (1 - r)), half = qnorm((1 + conf) / 2) / Math.sqrt(nEff - 3);
  const back = (v: number) => (Math.exp(2 * v) - 1) / (Math.exp(2 * v) + 1);
  return { r, p: 2 * pt(-Math.abs(t), df), n: nReport, df, ci: [back(z - half), back(z + half)] };
}

export type CorMatrix = { r: number[][]; p: number[][]; n: number[][]; ci: [number, number][][] };

/** Korrelationsmatrix wie pearson_cor(v1, v2, …): paarweiser Fallausschluss, jede Zelle mit eigenem n.
 *  Diagonale: r = 1, p = 0, n = gültige Werte der Variable (gewichtet round(Σw)). */
export function corMatrix(vars: Nums[], w: Nums | null = null, conf = 0.95): CorMatrix {
  const k = vars.length;
  const grid = <T,>(f: (i: number, j: number) => T) => Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => f(i, j)));
  const cells = grid((i, j) => (i < j ? pearsonTest(vars[i], vars[j], w, conf) : null));
  const cell = (i: number, j: number) => cells[Math.min(i, j)][Math.max(i, j)]!;
  const diagN = (x: Nums) => {
    let c = 0;
    for (let i = 0; i < x.length; i++) if (ok(x[i]) && (!w || !Number.isNaN(w[i]))) c += w ? w[i] : 1;
    return w ? Math.round(c) : c;
  };
  return {
    r: grid((i, j) => (i === j ? 1 : cell(i, j).r)),
    p: grid((i, j) => (i === j ? 0 : cell(i, j).p)),
    n: grid((i, j) => (i === j ? diagN(vars[i]) : cell(i, j).n)),
    ci: grid((i, j) => (i === j ? [1, 1] as [number, number] : cell(i, j).ci)),
  };
}
