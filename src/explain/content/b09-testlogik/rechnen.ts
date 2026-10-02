// Rechnungen des Bereichs B9 „Testlogik“: Schlafdauer gegen sieben Stunden (t-Test einer Stichprobe), Lernzeit nach
// Weiterbildung (Welch wie mariposa, Richtung ohne minus mit), Weiterbildung gegen 50 % (exakter Binomialtest wie
// binom.test und Normalnäherung), Dunn-Vergleiche mit Holm, grobe Teststärke mit der Normalverteilung und das
// Mischen der Weiterbildungsangaben (Nullverteilung). Rein, ohne React; Referenzwerte aus R in b09-testlogik.test.ts.
import type { SampleCtx } from '../../types';
import type { SurveyRow } from '../../../domain/survey';
import { num } from '../../format';
import { sampleColumn } from '../../sample';
import { oneSampleT, tTest } from '../../../tasks/kit/means';
import { lgamma, pnorm, pt, qnorm, qt } from '../../../tasks/kit/dist';

/** Zahl mit höchstens zwei Nachkommastellen, kleine Werte (unter 0,1) mit zwei gültigen Ziffern: 0,16 · 0,013 · 0,0019. */
export function small(v: number): string {
  if (!Number.isFinite(v) || v === 0 || Math.abs(v) >= 0.1) return num(v);
  return num(v, Math.max(2, 1 - Math.floor(Math.log10(Math.abs(v)))));
}
/** p wie im Atlas: „≈ 0,16“, „≈ 0,013“, unter 0,001 „< 0,001“ (für „p ≈ …“ und „p < …“). */
export const pShown = (p: number) => p < 0.001 ? '< 0,001' : `≈ ${small(p)}`;
/** „in etwa 16 von 100“, unter 0,5 von 100 „in weniger als 1 von 100“. */
export function outOf100(share: number): string {
  const k = Math.round(share * 100);
  return k < 1 ? 'in weniger als 1 von 100' : k >= 100 ? 'in fast allen 100 von 100' : `in etwa ${k} von 100`;
}

// Schlafdauer gegen sieben Stunden ---------------------------------------------------------------------------

/** Vergleichswert der Nullhypothese: im Mittel sieben Stunden Schlaf pro Nacht. */
export const MU0 = 7;
/** Schlafdauer der 200 Befragten (in R: t.test(schlafdauer, mu = 7), siehe b09-testlogik.test.ts). */
export const SCHLAF = { n: 200, mean: 7.0825, sd: 0.81975836, se: 0.05796567, t: 1.4232562, df: 199, p: 0.15622776, lo: 6.9681942, hi: 7.1968058, mehr: 101, weniger: 88 } as const;

/** t-Test einer Stichprobe gegen `mu` für die Spalte x (Standard: Schlafdauer); null, wenn die Spalte nicht streut. */
export function schlafTest(c: SampleCtx, mu = MU0) {
  const xs = sampleColumn(c.rows, c.columns.x?.[0] ?? 'schlafdauer'), r = oneSampleT(xs, null, mu);
  if (!r || !Number.isFinite(r.t)) return null;
  const sd = Math.sqrt(xs.reduce((a, v) => a + (v - r.mean) ** 2, 0) / (xs.length - 1));
  return { ...r, sd, se: sd / Math.sqrt(r.n), c: qt(0.975, r.df), cOne: qt(0.95, r.df), mehr: xs.filter(v => v > mu).length, weniger: xs.filter(v => v < mu).length };
}

/** p des t-Tests einer Stichprobe mit den Kennwerten der Schlafdauer gegen einen anderen Vergleichswert μ₀. */
export const schlafP = (mu0: number) => 2 * pt(-Math.abs((SCHLAF.mean - mu0) / SCHLAF.se), SCHLAF.df);

// Lernzeit nach Weiterbildung --------------------------------------------------------------------------------

/**
 * Welch-t-Test der Spalte x nach der Gruppe (Standard: Lernzeit nach Weiterbildung) in der Richtung von mariposa:
 * Gruppe 0 minus Gruppe 1, also ohne minus mit Weiterbildung. Dazu beide einseitigen p-Werte, die Breite der
 * Nullverteilung beim Mischen (s · √(1/n₁ + 1/n₀) mit s über alle Befragten) und Cohens d mit gepoolter Streuung.
 */
export function gruppenTest(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'lernzeit', g = c.columns.group?.[0] ?? 'weiterbildung';
  const ys = sampleColumn(c.rows, x), gs = sampleColumn(c.rows, g);
  const part = (k: number) => ys.filter((_, i) => gs[i] === k);
  const ohne = part(0), mit = part(1), mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
  const ss = (v: number[]) => { const m = mean(v); return v.reduce((a, b) => a + (b - m) ** 2, 0); };
  const test = tTest(ys, gs);
  if (!test || ohne.length < 2 || mit.length < 2) return null;
  const d = mean(ohne) - mean(mit), se = test.welch.se, df = test.welch.df, t = d / se;
  const right = pt(t, df, false), left = pt(t, df, true), two = 2 * Math.min(left, right);
  const all = ss(ys) / (ys.length - 1), sp = Math.sqrt((ss(ohne) + ss(mit)) / (ys.length - 2));
  return {
    nOhne: ohne.length, nMit: mit.length, ohne: mean(ohne), mit: mean(mit), d, se, df, t, two, right, left,
    perm: Math.sqrt(all) * Math.sqrt(1 / ohne.length + 1 / mit.length), sAll: Math.sqrt(all), sp, cohen: d / sp, hedges: d / sp * (1 - 3 / (4 * ys.length - 9)),
    studentDf: ys.length - 2,
  };
}

/** Grobe Teststärke eines zweiseitigen Tests mit der Normalverteilung: Abstand δ in Standardfehlern, Niveau α. */
export const powerZ = (delta: number, alpha: number) => { const z = qnorm(1 - alpha / 2); return pnorm(delta - z) + pnorm(-delta - z); };
/** Angenommener wahrer Unterschied in der Lernzeit für Fehlerarten und Teststärke: eine Stunde. */
export const DELTA_H = 1;

// Weiterbildung gegen 50 % -----------------------------------------------------------------------------------

/** Wahrscheinlichkeit von genau k Treffern unter n bei Trefferwahrscheinlichkeit p (über lgamma wie in R). */
export function dbinom(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log1p(-p));
}
/** Zweiseitiger exakter Binomialtest wie binom.test(): alle Anzahlen, die höchstens so wahrscheinlich sind wie k. */
export function binomExact(k: number, n: number, p = 0.5): number {
  const d = dbinom(k, n, p) * (1 + 1e-7);
  let total = 0;
  for (let i = 0; i <= n; i++) { const q = dbinom(i, n, p); if (q <= d) total += q; }
  return Math.min(1, total);
}
/** Normalnäherung desselben Tests ohne Stetigkeitskorrektur: z = (k − n·p) / √(n·p·(1 − p)). */
export function binomApprox(k: number, n: number, p = 0.5) {
  const z = (k - n * p) / Math.sqrt(n * p * (1 - p));
  return { z, p: 2 * pnorm(-Math.abs(z)) };
}
/** Weiterbildung in den aktuellen Daten: Ja-Anzahl, n, exakter und genäherter p-Wert gegen 50 %. */
export function anteilTest(c: SampleCtx) {
  const xs = sampleColumn(c.rows, c.columns.x?.[0] ?? 'weiterbildung'), n = xs.length, k = xs.filter(v => v === 1).length;
  return { k, n, exact: binomExact(k, n), ...binomApprox(k, n) };
}
/** Ja-Anzahl bei n Befragten mit (abgerundet) demselben Anteil von 41 % wie im Lehrdatensatz. */
export const jaBei = (n: number) => Math.floor(n * 41 / 100);

// Mehrere Vergleiche -----------------------------------------------------------------------------------------

/** Ränge mit Durchschnittsrängen bei Bindungen (rank(ties.method = "average")). */
function ranks(v: number[]): number[] {
  const order = v.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]), r = new Array<number>(v.length);
  for (let i = 0; i < order.length;) {
    let j = i;
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
    for (let k = i; k <= j; k++) r[order[k][1]] = (i + j) / 2 + 1;
    i = j + 1;
  }
  return r;
}
/** Holm-Korrektur wie p.adjust(method = "holm"). */
export function holm(ps: number[]): number[] {
  const m = ps.length, order = ps.map((p, i) => [p, i] as const).sort((a, b) => a[0] - b[0]), out = new Array<number>(m);
  let max = 0;
  order.forEach(([p, i], k) => { max = Math.max(max, Math.min(1, (m - k) * p)); out[i] = max; });
  return out;
}
/** Dunn-Vergleiche aller Gruppenpaare wie mariposa::dunn_test (Rangmittel, Bindungskorrektur), unkorrigiert und nach Holm. */
export function dunn(c: SampleCtx) {
  const ys = sampleColumn(c.rows, c.columns.x?.[0] ?? 'finanzlage'), gs = sampleColumn(c.rows, c.columns.group?.[0] ?? 'schulabschluss');
  const N = ys.length, r = ranks(ys), levels = [...new Set(gs)].sort((a, b) => a - b);
  const counts = new Map<number, number>();
  ys.forEach(v => counts.set(v, (counts.get(v) ?? 0) + 1));
  const ties = [...counts.values()].reduce((a, t) => a + t ** 3 - t, 0) / (12 * (N - 1));
  const stat = levels.map(l => { const idx = gs.map((g, i) => g === l ? i : -1).filter(i => i >= 0); return { n: idx.length, mean: idx.reduce((a, i) => a + r[i], 0) / idx.length }; });
  const pairs: { a: number; b: number; z: number; p: number }[] = [];
  for (let i = 0; i < levels.length; i++) for (let j = i + 1; j < levels.length; j++) {
    const se = Math.sqrt((N * (N + 1) / 12 - ties) * (1 / stat[i].n + 1 / stat[j].n)), z = (stat[i].mean - stat[j].mean) / se;
    pairs.push({ a: levels[i], b: levels[j], z, p: 2 * pnorm(-Math.abs(z)) });
  }
  const adj = holm(pairs.map(p => p.p));
  return { pairs: pairs.map((p, k) => ({ ...p, holm: adj[k] })), raw: pairs.filter(p => p.p < 0.05).length, holmCount: adj.filter(p => p < 0.05).length };
}
/** Chance auf mindestens einen Fehlalarm bei m unabhängigen Tests zum Niveau α. */
export const familyError = (m: number, alpha = 0.05) => 1 - (1 - alpha) ** m;

// Nullverteilung durch Mischen ------------------------------------------------------------------------------

/** Kleiner, fester Zufallsgenerator (mulberry32): dieselbe Folge in jedem Browser und im Test. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const MIX = new Map<string, number[]>();
/** Höchstzahl der Mischungen (Regler der Begriffskarte „Nullverteilung“). */
export const MIX_MAX = 2000;
/**
 * Unterschiede „ohne minus mit Weiterbildung“ nach `count`-maligem zufälligem Neuverteilen der Weiterbildungsangaben
 * auf die Befragten (Gruppengrößen bleiben). Feste Folge (Startwert 2026), damit Bild, Text und Test übereinstimmen;
 * die ersten k Mischungen sind bei jedem `count` dieselben.
 */
export function mischen(rows: readonly SurveyRow[], count: number): number[] {
  const key = `${rows.length}:${rows[0]?.id}:${rows[0]?.values.lernzeit}`;
  let all = MIX.get(key);
  if (!all) {
    const ys = sampleColumn(rows, 'lernzeit'), gs = sampleColumn(rows, 'weiterbildung');
    const n = ys.length, nMit = gs.filter(g => g === 1).length, total = ys.reduce((a, b) => a + b, 0), rnd = mulberry32(2026);
    const idx = ys.map((_, i) => i);
    all = [];
    for (let k = 0; k < MIX_MAX; k++) {
      let sumMit = 0;
      for (let i = 0; i < nMit; i++) { const j = i + Math.floor(rnd() * (n - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; sumMit += ys[idx[i]]; }
      all.push((total - sumMit) / (n - nMit) - sumMit / nMit);
    }
    MIX.set(key, all);
  }
  return all.slice(0, Math.max(0, Math.min(MIX_MAX, Math.round(count))));
}
