// Rechnungen des Bereichs B10 „Mittelwerte vergleichen“ für die Reiter „Mit 200 Befragten“ und die Texte: Welch-t-Test,
// gepaarte Differenzen, einfaktorielle und zweifaktorielle ANOVA (Typ III), ANCOVA, Brown–Forsythe und Lilliefors.
// Alles wie mariposa 0.7.4; die Referenzwerte aus R stehen in ./b10-mittelwerte.test.ts.
import type { SampleCtx } from '../../types';
import { num } from '../../format';
import { describeGroups, onewayAnova, tTest } from '../../../tasks/kit/means';
import { levene, tryOls } from '../../../tasks/kit/ols';
import { pf, pnorm, pt } from '../../../tasks/kit/dist';

// ---------- Schreibweise ----------

/** Kleine Kennwerte (SE, Varianzanteile) mit drei gültigen Ziffern: 0,0583; ab 1 mit zwei Nachkommastellen. */
export function sig3(v: number): string {
  if (!Number.isFinite(v)) return '–';
  const a = Math.abs(v);
  if (a === 0 || a >= 1) return num(v);
  const digits = Math.min(8, 2 - Math.floor(Math.log10(a)));
  return num(v, digits);
}

/** p wie in den Leitplanken: „p ≈ 0,88“, zwei gültige Ziffern bei kleinen Werten („p ≈ 0,008“), „p < 0,001“. */
export function pText(p: number): string {
  if (!Number.isFinite(p)) return 'p nicht definiert';
  if (p < 0.001) return 'p < 0,001';
  if (p < 0.1) return `p ≈ ${num(p, Math.min(8, 1 - Math.floor(Math.log10(p))))}`;
  return `p ≈ ${num(p)}`;
}

/** „in etwa 3 von 100“, „in weniger als 1 von 100“, „in weniger als 1 von 1.000“ Stichproben. */
export function often(p: number): string {
  return p >= 0.01 ? `in etwa ${Math.round(p * 100)} von 100` : p >= 0.001 ? 'in weniger als 1 von 100' : 'in weniger als 1 von 1.000';
}

/** „=“, wenn die angezeigte Zahl (zwei Nachkommastellen) genau ist, sonst „≈“. */
export const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';

/** Schulabschlüsse des Lehrdatensatzes (Codes 0 bis 4) für Texte. */
export const ABSCHLUSS = ['ohne Schulabschluss', 'Hauptschulabschluss', 'Mittlerer Abschluss', 'Fachhochschulreife', 'Abitur'] as const;
/** Abschluss zum Code als Text, unbekannte Codes als „Code 7“. */
export const abschluss = (level: number) => ABSCHLUSS[level] ?? `Code ${level}`;

/** Freiheitsgrade mit einer Nachkommastelle, ganze Zahlen ohne: „175,8“, „198“. */
export const dfText = (df: number) => num(df, Math.abs(df - Math.round(df)) < 1e-9 ? 0 : 1);

// ---------- Spalten ----------

const col = (c: SampleCtx, role: string, fallback: string) => c.columns[role]?.[0] ?? fallback;
const values = (c: SampleCtx, column: string) => c.rows.map(r => r.values[column]);

// ---------- Welch-t-Test (Lernzeit nach Weiterbildung) ----------

/**
 * Welch-t-Test wie mariposa::t_test(x, group = g), in der Richtung von mariposa 0.7.4: Gruppe 0 minus Gruppe 1,
 * bei der Weiterbildung also ohne minus mit. null, wenn eine Gruppe nicht streut.
 */
export function welchFor(c: SampleCtx) {
  const x = col(c, 'x', 'lernzeit'), g = col(c, 'group', 'weiterbildung');
  const y = values(c, x), groups = values(c, g);
  const test = tTest(y, groups);
  if (!test) return null;
  const at = (level: number) => test.levels.indexOf(level);
  const i0 = at(0), i1 = at(1);
  const m0 = test.means[i0], m1 = test.means[i1], n0 = test.n[i0], n1 = test.n[i1];
  const diff = m0 - m1, t = diff / test.welch.se;
  // Effektgröße in derselben Richtung: Hedges' g = d · Korrektur (wie mariposa).
  const g0 = test.levels[0] === 0 ? test.g : -test.g;
  return { m0, m1, n0, n1, diff, se: test.welch.se, t, df: test.welch.df, p: test.welch.p, g: g0 };
}

// ---------- Gepaarte Differenzen (Wissenstest, Zeitpunkt 1 und 2) ----------

/** Gepaarte Rechnung wie atlas %>% mutate(differenz = y − x) %>% t_test(differenz, mu = 0). */
export function pairedFor(c: SampleCtx) {
  const xs = values(c, col(c, 'x', 'wissenstest')), ys = values(c, col(c, 'y', 'wissenstest_t2'));
  const n = xs.length, d = ys.map((v, i) => v - xs[i]);
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = (a: number[]) => { const m = mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
  const mx = mean(xs), my = mean(ys), dMean = mean(d), sx = sd(xs), sy = sd(ys), sdD = sd(d);
  const se = sdD / Math.sqrt(n), t = sdD > 0 ? dMean / se : NaN, df = n - 1;
  const r = sx > 0 && sy > 0 ? xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0) / ((n - 1) * sx * sy) : NaN;
  // Dieselben Werte wie zwei fremde Gruppen (Welch): so rechnet, wer die Paare übersieht.
  const v1 = sx * sx / n, v2 = sy * sy / n, seU = Math.sqrt(v1 + v2), tU = (my - mx) / seU;
  const dfU = (v1 + v2) ** 2 / (v1 * v1 / (n - 1) + v2 * v2 / (n - 1));
  return {
    n, mx, my, dMean, sx, sy, sdD, se, t, df, p: 2 * pt(-Math.abs(t), df), r,
    up: d.filter(v => v > 0).length, down: d.filter(v => v < 0).length, same: d.filter(v => v === 0).length,
    tU, dfU, pU: 2 * pt(-Math.abs(tU), dfU),
  };
}

// ---------- Einfaktorielle ANOVA (Lernzeit nach Schulabschluss) ----------

/** Einfaktorielle ANOVA wie mariposa::oneway_anova(x, group = g); F und p null, wenn innerhalb der Gruppen nichts streut. */
export function anovaFor(c: SampleCtx) {
  const x = col(c, 'x', 'lernzeit'), g = col(c, 'group', 'schulabschluss');
  const a = onewayAnova(values(c, x), values(c, g));
  if (!a) return null;
  const finite = a.msWithin > 1e-12;
  return { ...a, F: finite ? a.F : null, p: finite ? a.p : null, share: a.ssTotal > 0 ? a.ssBetween / a.ssTotal : null };
}

/** Kennwerte je Gruppe (Mittelwert, Standardabweichung, n), Gruppen aufsteigend nach Code. */
export function groupsFor(c: SampleCtx) {
  const x = col(c, 'x', 'lernzeit'), g = col(c, 'group', 'schulabschluss');
  return describeGroups(values(c, x), values(c, g));
}

// ---------- Zweifaktorielle ANOVA mit Typ-III-Quadratsummen ----------

/** Effektkodierung eines Faktors (wie contr.sum): je Stufe außer der letzten eine Spalte mit 1, −1 für die letzte, sonst 0. */
function effectCodes(g: number[]): number[][] {
  const levels = [...new Set(g)].sort((a, b) => a - b), last = levels[levels.length - 1];
  return levels.slice(0, -1).map(l => g.map(v => v === l ? 1 : v === last ? -1 : 0));
}

/** Fehlerquadratsumme einer linearen Regression ohne die Spalten `drop`; null, wenn das Modell nicht schätzbar ist. */
function sse(y: number[], cols: number[][], drop: Set<number> = new Set()): { sse: number; df: number } | null {
  const keep = cols.filter((_, j) => !drop.has(j));
  const fit = tryOls(y, keep);
  return fit ? { sse: fit.ssResidual, df: fit.dfResidual } : null;
}

export type TermTest = { name: string; ss: number; df: number; F: number; p: number; eta2p: number };

/**
 * Zweifaktorielle ANOVA wie mariposa::factorial_anova(dv = x, between = c(a, b), ss_type = 3): Effektkodierung,
 * Typ-III-Quadratsumme eines Terms = Fehlerquadratsumme ohne seine Spalten minus die des vollen Modells.
 */
export function factorialFor(c: SampleCtx, a = 'schulabschluss', b = 'weiterbildung') {
  const y = values(c, col(c, 'x', 'lernzeit')), ga = values(c, a), gb = values(c, b);
  const A = effectCodes(ga), B = effectCodes(gb), AB = A.flatMap(u => B.map(v => u.map((w, i) => w * v[i])));
  const cols = [...A, ...B, ...AB];
  const full = sse(y, cols);
  if (!full || full.sse < 1e-12) return null;
  const mse = full.sse / full.df;
  const term = (name: string, from: number, count: number): TermTest => {
    const without = sse(y, cols, new Set(Array.from({ length: count }, (_, k) => from + k)))!;
    const ss = without.sse - full.sse, F = (ss / count) / mse;
    return { name, ss, df: count, F, p: pf(F, count, full.df, false), eta2p: ss / (ss + full.sse) };
  };
  const cells = [...new Set(ga)].sort((p, q) => p - q).map(la => [...new Set(gb)].sort((p, q) => p - q).map(lb => {
    const v = y.filter((_, i) => ga[i] === la && gb[i] === lb);
    return { a: la, b: lb, n: v.length, mean: v.reduce((s, w) => s + w, 0) / v.length };
  }));
  return { a: term(a, 0, A.length), b: term(b, A.length, B.length), ab: term(`${a}:${b}`, A.length + B.length, AB.length), dfError: full.df, mse, cells };
}

// ---------- ANCOVA (Wissenstest nach Schulabschluss, bereinigt um Lernzeit und Alter) ----------

/**
 * ANCOVA wie mariposa::ancova(dv = x, between = group, covariate = c(y, z), ss_type = 3): ein Faktor ohne Interaktion,
 * F des Faktors = Vergleich mit dem Modell ohne ihn; bereinigte Mittel = Vorhersage bei den Mittelwerten der Kovariaten.
 * Ohne Bereinigung: die einfaktorielle ANOVA derselben Gruppen.
 */
export function ancovaFor(c: SampleCtx) {
  const y = values(c, col(c, 'x', 'wissenstest')), g = values(c, col(c, 'group', 'schulabschluss'));
  const covs = ['y', 'z'].map(role => c.columns[role]?.[0]).filter((v): v is string => !!v).map(id => values(c, id));
  const levels = [...new Set(g)].sort((a, b) => a - b);
  const dummies = levels.slice(1).map(l => g.map(v => v === l ? 1 : 0));
  const full = tryOls(y, [...dummies, ...covs]), plain = onewayAnova(y, g);
  if (!full || !plain) return null;
  // Ohne den Faktor: nur die Kovariaten (ohne Kovariaten nur die Konstante, dann ist das die Quadratsumme um den Mittelwert).
  const sseReduced = covs.length ? tryOls(y, covs)?.ssResidual : full.ssTotal;
  if (sseReduced === undefined || full.ssResidual < 1e-12) return null;
  const k = dummies.length, F = ((sseReduced - full.ssResidual) / k) / (full.ssResidual / full.dfResidual);
  const covMeans = covs.map(v => v.reduce((s, w) => s + w, 0) / v.length);
  const adjusted = levels.map((_, j) => full.coef[0] + (j > 0 ? full.coef[j] : 0) + covMeans.reduce((s, m, q) => s + full.coef[1 + k + q] * m, 0));
  const raw = plain.groups.map(gr => gr.mean);
  return {
    levels, raw, adjusted, F, df1: k, df2: full.dfResidual, p: pf(F, k, full.dfResidual, false),
    plainF: plain.F, plainP: plain.p, plainDf2: plain.dfWithin, slope: covs.length ? full.coef[1 + k] : NaN,
  };
}

// ---------- Brown–Forsythe (Levene mit Median) ----------

/** Levene-Test wie mariposa::levene_test(x, group = g, center = "median"), dazu die mittleren Abstände je Gruppe. */
export function leveneFor(c: SampleCtx, center: 'median' | 'mean' = 'median') {
  const x = values(c, col(c, 'x', 'lernzeit')), g = values(c, col(c, 'group', 'schulabschluss'));
  const test = levene(x, g, null, center);
  const levels = [...new Set(g)].sort((a, b) => a - b);
  const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const parts = levels.map(l => {
    const v = x.filter((_, i) => g[i] === l), z = center === 'median' ? median(v) : v.reduce((s, w) => s + w, 0) / v.length;
    return { level: l, center: z, distance: v.reduce((s, w) => s + Math.abs(w - z), 0) / v.length };
  });
  return { ...test, parts };
}

// ---------- Kolmogorov–Smirnov mit Lilliefors-Korrektur ----------

/**
 * KS-Abstand zur Normalverteilung mit geschätztem Mittelwert und geschätzter Standardabweichung und der
 * Lilliefors-Korrektur nach Dallal–Wilkinson, wie mariposa 0.7.4 (.lilliefors_test). null bei weniger als vier Werten
 * oder ohne Streuung.
 */
export function lilliefors(xs: number[]): { D: number; p: number } | null {
  const x = [...xs].sort((a, b) => a - b), n = x.length;
  if (n < 4) return null;
  const m = x.reduce((s, v) => s + v, 0) / n, s = Math.sqrt(x.reduce((a, v) => a + (v - m) ** 2, 0) / (n - 1));
  if (!(s > 0)) return null;
  const p = x.map(v => pnorm((v - m) / s));
  let plus = -Infinity, minus = -Infinity;
  p.forEach((q, i) => { plus = Math.max(plus, (i + 1) / n - q); minus = Math.max(minus, q - i / n); });
  const K = Math.max(plus, minus);
  const [Kd, nd] = n <= 100 ? [K, n] : [K * (n / 100) ** 0.49, 100];
  let pv = Math.exp(-7.01256 * Kd * Kd * (nd + 2.78019) + 2.99587 * Kd * Math.sqrt(nd + 2.78019) - 0.122119 + 0.974598 / Math.sqrt(nd) + 1.67997 / nd);
  if (pv > 0.1) {
    const KK = (Math.sqrt(n) - 0.01 + 0.85 / Math.sqrt(n)) * K;
    pv = KK <= 0.302 ? 1
      : KK <= 0.5 ? 2.76773 - 19.828315 * KK + 80.709644 * KK ** 2 - 138.55152 * KK ** 3 + 81.218052 * KK ** 4
      : KK <= 0.9 ? -4.901232 + 40.662806 * KK - 97.490286 * KK ** 2 + 94.029866 * KK ** 3 - 32.355711 * KK ** 4
      : KK <= 1.31 ? 6.198765 - 19.558097 * KK + 23.186922 * KK ** 2 - 12.234627 * KK ** 3 + 2.423045 * KK ** 4
      : 0;
  }
  return { D: K, p: Math.min(Math.max(pv, 0), 1) };
}

/** Normalitätsprüfung einer Spalte (Rolle x): KS-Abstand mit Lilliefors-p, Mittelwert und Standardabweichung. */
export function normalityFor(c: SampleCtx) {
  const xs = values(c, col(c, 'x', 'schlafdauer')), n = xs.length;
  const m = xs.reduce((s, v) => s + v, 0) / n, sd = Math.sqrt(xs.reduce((a, v) => a + (v - m) ** 2, 0) / (n - 1));
  const z = sd > 0 ? xs.map(v => (v - m) / sd) : [];
  return { test: lilliefors(xs), n, mean: m, sd, within1: z.filter(v => Math.abs(v) <= 1).length, within2: z.filter(v => Math.abs(v) <= 2).length };
}
