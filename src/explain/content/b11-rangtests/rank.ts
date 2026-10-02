// Rangrechnungen des Bereichs B11 „Rangtests und Paarvergleiche“, ohne React: Mann–Whitney-U, Kruskal–Wallis,
// Wilcoxon (verbunden), Friedman, Dunn, paarweiser Wilcoxon, Holm und Scheffé, gerechnet wie mariposa 0.7.4
// (ungewichtet; Normal- bzw. χ²-Näherung mit Bindungskorrektur, z wie in SPSS aus der kleineren Summe).
// Die Referenzwerte aus R stehen in b11-rangtests.test.ts.
import type { SurveyRow } from '../../../domain/survey';
import { averageRanks } from '../../../domain/descriptive';
import { pchisq, pf, pnorm } from '../../../tasks/kit/dist';
import { tukeyHSD, onewayAnova } from '../../../tasks/kit/means';

const sum = (a: readonly number[]) => a.reduce((s, v) => s + v, 0);

/** Mittlere Ränge wie R rank() (ties.method = "average"): Gleichstände teilen sich ihre Plätze. Gemeinsame Rechnung aus domain/descriptive.ts. */
export const midRanks = (values: readonly number[]): number[] => averageRanks([...values]);

/** Bindungsterm Σ(t³ − t) über alle Gruppen gleicher Werte (0 ohne Gleichstände). */
export function tieTerm(values: readonly number[]): number {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return sum([...counts.values()].map(t => t ** 3 - t));
}

/** Zweiseitiger p-Wert eines z-Werts aus der Standardnormalverteilung. */
export const pTwoNormal = (z: number) => 2 * pnorm(-Math.abs(z));

// Mann–Whitney-U ------------------------------------------------------------------------

export interface MannWhitney {
  n1: number; n2: number;
  /** Ränge aller Werte, erst Gruppe 1, dann Gruppe 2. */
  ranks: number[];
  R1: number; R2: number; mean1: number; mean2: number;
  U1: number; U2: number; U: number;
  /** Erwartung n₁n₂ / 2 und Streuung von U (mit Bindungskorrektur). */
  E: number; sd: number;
  /** z aus dem kleineren U (wie SPSS und mariposa, nie positiv), p zweiseitig, r = |z| / √N; NaN, wenn alle Werte gleich sind. */
  z: number; p: number; r: number;
}

/** Mann–Whitney-U wie mariposa::mann_whitney(…, alternative = "two.sided"): Gruppe 1 ist der kleinere Code. */
export function mannWhitney(x1: readonly number[], x2: readonly number[]): MannWhitney {
  const n1 = x1.length, n2 = x2.length, N = n1 + n2, all = [...x1, ...x2], ranks = midRanks(all);
  const R1 = sum(ranks.slice(0, n1)), R2 = sum(ranks.slice(n1));
  const U1 = R1 - n1 * (n1 + 1) / 2, U2 = R2 - n2 * (n2 + 1) / 2, U = Math.min(U1, U2), E = n1 * n2 / 2;
  const variance = n1 * n2 * ((N + 1) - tieTerm(all) / (N * (N - 1))) / 12, sd = Math.sqrt(variance);
  const z = variance > 1e-12 ? (U - E) / sd : NaN;
  return { n1, n2, ranks, R1, R2, mean1: R1 / n1, mean2: R2 / n2, U1, U2, U, E, sd, z, p: pTwoNormal(z), r: Math.abs(z) / Math.sqrt(N) };
}

// Kruskal–Wallis ------------------------------------------------------------------------

export interface KruskalWallis {
  N: number; k: number;
  /** Ränge je Gruppe, in der Reihenfolge der Werte. */
  ranks: number[][];
  n: number[]; R: number[]; mean: number[];
  /** Mitte aller Ränge (N + 1) / 2, Abstände der mittleren Ränge davon, gewichtete Quadrate nⱼ(R̄ⱼ − R̄)² und ihre Summe. */
  grand: number; dev: number[]; weighted: number[]; ss: number;
  /** H ohne und mit Bindungskorrektur (wie kruskal.test), Korrekturfaktor C = 1 − Σ(t³ − t) / (N³ − N). */
  Hraw: number; C: number; H: number; df: number; p: number; eps2: number;
}

/** Kruskal–Wallis wie mariposa::kruskal_wallis (stats::kruskal.test): H mit Bindungskorrektur, χ² mit k − 1 Freiheitsgraden. */
export function kruskalWallis(groups: readonly (readonly number[])[]): KruskalWallis {
  const all = groups.flat(), N = all.length, k = groups.length, flat = midRanks(all);
  const ranks: number[][] = [];
  let at = 0;
  for (const g of groups) { ranks.push(flat.slice(at, at + g.length)); at += g.length; }
  const n = groups.map(g => g.length), R = ranks.map(sum), mean = R.map((r, j) => r / n[j]), grand = (N + 1) / 2;
  const dev = mean.map(m => m - grand), weighted = dev.map((d, j) => n[j] * d * d), ss = sum(weighted);
  const Hraw = 12 / (N * (N + 1)) * ss, C = 1 - tieTerm(all) / (N ** 3 - N), H = C > 1e-12 ? Hraw / C : NaN, df = k - 1;
  return { N, k, ranks, n, R, mean, grand, dev, weighted, ss, Hraw, C, H, df, p: pchisq(H, df, false), eps2: H / (N - 1) };
}

// Wilcoxon (verbunden) ------------------------------------------------------------------

export interface SignedRank {
  /** Differenzen y − x je Person. */
  d: number[];
  /** Rang des Betrags je Person (NaN bei Differenz 0, die fällt weg). */
  rank: number[];
  /** Rang mit Vorzeichen (0 bei Differenz 0). */
  signed: number[];
  n: number; nPos: number; nNeg: number; nZero: number;
  Wpos: number; Wneg: number;
  /** Erwartung n(n + 1) / 4 und Streuung (mit Bindungskorrektur) der Rangsumme. */
  E: number; sd: number;
  /** z aus der kleineren Rangsumme (wie SPSS und mariposa, nie positiv), p zweiseitig, r = |z| / √n. */
  z: number; p: number; r: number;
}

/** Wilcoxon-Vorzeichen-Rang-Test wie mariposa::wilcoxon_test(x, y): d = y − x, Nulldifferenzen fallen weg. */
export function signedRank(x: readonly number[], y: readonly number[]): SignedRank {
  const d = x.map((v, i) => y[i] - v), keep = d.map((v, i) => [v, i] as const).filter(([v]) => v !== 0);
  const absRanks = midRanks(keep.map(([v]) => Math.abs(v)));
  const rank = d.map(() => NaN), signed = d.map(() => 0);
  keep.forEach(([v, i], k) => { rank[i] = absRanks[k]; signed[i] = Math.sign(v) * absRanks[k]; });
  const n = keep.length, nPos = d.filter(v => v > 0).length, nNeg = d.filter(v => v < 0).length;
  const Wpos = sum(signed.filter(v => v > 0)), Wneg = -sum(signed.filter(v => v < 0));
  const E = n * (n + 1) / 4, variance = n * (n + 1) * (2 * n + 1) / 24 - tieTerm(keep.map(([v]) => Math.abs(v))) / 48, sd = Math.sqrt(Math.max(0, variance));
  // Alle Paare gleich: mariposa meldet wie SPSS z = 0 und p = 1.
  const z = n === 0 || variance <= 1e-12 ? 0 : -Math.abs((Wpos - E) / sd);
  return { d, rank, signed, n, nPos, nNeg, nZero: d.length - n, Wpos, Wneg, E, sd, z, p: pTwoNormal(z), r: n ? Math.abs(z) / Math.sqrt(n) : 0 };
}

// Friedman ------------------------------------------------------------------------------

export interface Friedman {
  N: number; k: number;
  /** Ränge innerhalb jeder Person (Zeile). */
  ranks: number[][];
  R: number[]; meanRanks: number[];
  /** Erwartete Rangsumme N(k + 1) / 2, Abstände, Quadrate und ihre Summe. */
  E: number; dev: number[]; sq: number[]; ss: number;
  /** Q ohne und mit Bindungskorrektur (wie friedman.test), Kendalls W = Q / (N(k − 1)). */
  Qraw: number; Q: number; df: number; p: number; W: number;
}

/** Friedman-Test wie mariposa::friedman_test (stats::friedman.test): Ränge je Person, χ² mit k − 1 Freiheitsgraden. */
export function friedman(rows: readonly (readonly number[])[]): Friedman {
  const N = rows.length, k = rows[0]?.length ?? 0, ranks = rows.map(r => midRanks(r));
  const R = Array.from({ length: k }, (_, j) => sum(ranks.map(r => r[j]))), meanRanks = R.map(r => r / N);
  const E = N * (k + 1) / 2, dev = R.map(r => r - E), sq = dev.map(d => d * d), ss = sum(sq);
  const Qraw = 12 / (N * k * (k + 1)) * ss, ties = sum(rows.map(r => tieTerm(r)));
  const den = N * k * (k + 1) - ties / (k - 1), Q = den > 1e-12 ? 12 * ss / den : NaN, df = k - 1;
  return { N, k, ranks, R, meanRanks, E, dev, sq, ss, Qraw, Q, df, p: pchisq(Q, df, false), W: Q / (N * (k - 1)) };
}

// Paarvergleiche ------------------------------------------------------------------------

/** Holm-Korrektur wie p.adjust(p, "holm"): kleinstes p mal m, das nächste mal m − 1 …, nie kleiner als das vorige, höchstens 1. */
export function holm(p: readonly number[]): number[] {
  const m = p.length, order = p.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]), out = new Array<number>(m);
  let run = 0;
  order.forEach(([v, i], k) => { run = Math.max(run, Math.min(1, (m - k) * v)); out[i] = run; });
  return out;
}

export interface PairRow { i: number; j: number; z: number; p: number; pAdj: number }

/** Dunn-Vergleiche wie mariposa::dunn_test(p_adjust = "holm"): gemeinsame Ränge aller Gruppen, z = (R̄ᵢ − R̄ⱼ) / SE. */
export function dunn(groups: readonly (readonly number[])[]) {
  const kw = kruskalWallis(groups), all = groups.flat(), N = all.length;
  const tie = tieTerm(all) / (12 * (N - 1)), pairs: PairRow[] = [];
  for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
    const se = Math.sqrt((N * (N + 1) / 12 - tie) * (1 / kw.n[i] + 1 / kw.n[j])), z = se > 1e-12 ? (kw.mean[i] - kw.mean[j]) / se : NaN;
    pairs.push({ i, j, z, p: pTwoNormal(z), pAdj: NaN });
  }
  holm(pairs.map(r => r.p)).forEach((v, k) => { pairs[k].pAdj = v; });
  return { kw, pairs };
}

/** Paarweiser Wilcoxon wie mariposa::pairwise_wilcoxon(p_adjust = "holm") für Messungen derselben Personen. */
export function pairwiseWilcoxon(columns: readonly (readonly number[])[]) {
  const pairs: (PairRow & { test: SignedRank })[] = [];
  for (let i = 0; i < columns.length; i++) for (let j = i + 1; j < columns.length; j++) {
    const test = signedRank(columns[i], columns[j]);
    pairs.push({ i, j, z: test.z, p: test.p, pAdj: NaN, test });
  }
  holm(pairs.map(r => r.p)).forEach((v, k) => { pairs[k].pAdj = v; });
  return pairs;
}

/** Quantil der F-Verteilung (wie qf), durch Halbieren auf pf. */
export function qf(prob: number, df1: number, df2: number): number {
  let lo = 0, hi = 1;
  while (pf(hi, df1, df2) < prob) hi *= 2;
  for (let k = 0; k < 200 && hi - lo > 1e-12 * Math.max(1, hi); k++) { const mid = (lo + hi) / 2; if (pf(mid, df1, df2) < prob) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

export interface MeanPair { a: number; b: number; diff: number; se: number; pTukey: number; F: number; pScheffe: number }

/**
 * Paarvergleiche nach der einfaktoriellen ANOVA wie mariposa::tukey_test() und scheffe_test(): Paare in der
 * Reihenfolge von mariposa (frühere minus spätere Gruppe, „Ohne Schulabschluss − Haupt-/Volksschulabschluss“ …),
 * gemeinsame Fehlervarianz MSE, Tukey über die studentisierte Spannweite, Scheffé über (k − 1) · F.
 */
export function meanPairs(y: readonly number[], g: readonly number[]) {
  const a = onewayAnova(y, g), t = tukeyHSD(y, g);
  if (!a || !t) return null;
  const k = a.levels.length, mse = a.msWithin, df = a.dfWithin, pairs: MeanPair[] = [];
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
    const ni = a.groups[i].n, nj = a.groups[j].n, diff = a.groups[i].mean - a.groups[j].mean, se = Math.sqrt(mse * (1 / ni + 1 / nj));
    const tuk = t.find(r => r.a === a.levels[j] && r.b === a.levels[i])!;
    const F = diff * diff / ((k - 1) * mse * (1 / ni + 1 / nj));
    pairs.push({ a: a.levels[i], b: a.levels[j], diff, se, pTukey: tuk.p, F, pScheffe: pf(F, k - 1, df, false) });
  }
  return { anova: a, k, mse, df, pairs };
}

// Lehrdatensatz -------------------------------------------------------------------------

/** Werte einer Spalte, aufgeteilt nach den Codes einer Gruppenspalte (aufsteigend, wie mariposa die Gruppen ordnet). */
export function byGroup(rows: readonly SurveyRow[], x: string, group: string): { codes: number[]; values: number[][] } {
  const codes = [...new Set(rows.map(r => r.values[group]))].sort((a, b) => a - b);
  return { codes, values: codes.map(c => rows.filter(r => r.values[group] === c).map(r => r.values[x])) };
}

/** Werte mehrerer Spalten, eine Liste je Spalte (Messungen derselben Personen). */
export const columnsOf = (rows: readonly SurveyRow[], ids: readonly string[]) => ids.map(id => rows.map(r => r.values[id]));

