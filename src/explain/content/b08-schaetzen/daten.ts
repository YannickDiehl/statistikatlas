// Gemeinsame Zahlen und Rechnungen des Bereichs B8 „Stichprobe und Schätzen“. ALLBUS 2023 nur als Aggregat
// (Häufigkeiten, Mittelwerte, Standardabweichungen, ungewichtet, wenn nicht anders gesagt); der Lehrdatensatz wird aus
// den aktuellen Daten gerechnet. Alle Referenzwerte und R-Befehle stehen in b08-schaetzen.test.ts.
import type { SampleCtx } from '../../types';
import { num } from '../../format';
import { sampleColumn } from '../../sample';

/** ALLBUS 2023 (ZA8831): Zahl der Befragten, davon in den neuen Bundesländern (eastwest = 2), Anteil Ost mit wghtpew. */
export const ALLBUS = { befragte: 5246, ost: 1679, ostGewichtet: 0.1683825 } as const;

/** ALLBUS 2023, Vertrauen in den Bundestag (pt03), 1 = gar kein Vertrauen bis 7 = großes Vertrauen, gültige Angaben. */
export const VERTRAUEN = { n: 3592, mean: 3.946826, sd: 1.625373, gewichtet: 4.013856, ost: 3.666382, west: 4.08213 } as const;

/** ALLBUS 2023, politisches Interesse (pa02a, umgepolt 1 bis 5): gültige Angaben, Mittelwert, s, „stark“ oder „sehr stark“. */
export const INTERESSE = { n: 5225, mean: 3.297225, sd: 0.93954, stark: 2069 } as const;

/** ALLBUS 2023, Personen im Haushalt einschließlich der befragten Person (dh04), gültige Angaben, ungewichtet. */
export const HAUSHALT = { groessen: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12], anzahl: [1181, 2287, 772, 647, 195, 40, 11, 6, 4, 1] } as const;
export const HAUSHALT_N = HAUSHALT.anzahl.reduce((a, b) => a + b, 0);

// ---------- Kleine Rechnungen ----------

export const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
/** Standardabweichung mit n − 1 (wie sd() in R). */
export const sd1 = (xs: readonly number[]) => { const m = mean(xs); return Math.sqrt(xs.reduce((a, v) => a + (v - m) ** 2, 0) / (xs.length - 1)); };
/** Standardabweichung einer ganzen Grundgesamtheit (geteilt durch N), σ. */
export const sdN = (xs: readonly number[]) => { const m = mean(xs); return Math.sqrt(xs.reduce((a, v) => a + (v - m) ** 2, 0) / xs.length); };
/** Schiefe aus den Momenten der Werte selbst (g1 = m3 / m2^1,5); 0 bei konstanten Werten. */
export function skew(xs: readonly number[]): number {
  const m = mean(xs), m2 = mean(xs.map(v => (v - m) ** 2)), m3 = mean(xs.map(v => (v - m) ** 3));
  return m2 > 0 ? m3 / m2 ** 1.5 : 0;
}
/** Median (mittlerer Wert der Reihe nach; bei gerader Zahl das Mittel der beiden mittleren). */
export function median(xs: readonly number[]): number {
  const s = [...xs].sort((a, b) => a - b), k = s.length >> 1;
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
}

/** Spalte x der Auswertung (fest oder aus der Spaltenwahl). */
export const columnX = (c: SampleCtx, fallback: string) => sampleColumn(c.rows, c.columns.x?.[0] ?? fallback);

/** Wie angezeigt gerundet (zwei Nachkommastellen), damit Rechnungen im Text mit den sichtbaren Zahlen aufgehen. */
export const shown = (v: number) => Math.round(v * 100) / 100;

/** Kleine Kennwerte (SE, Hebelwert) mit zwei gültigen Ziffern: 0,027 · 0,0081; ab 0,1 zwei Nachkommastellen. */
export function small(v: number): string {
  if (!(Math.abs(v) > 0) || Math.abs(v) >= 0.1) return num(v);
  return num(v, Math.min(8, 1 - Math.floor(Math.log10(Math.abs(v)))));
}

/** Ganze Zahl aus einem Reglerwert, der zwischen den Stufen liegen kann (der Inhaltstest prüft auch Zwischenwerte). */
export const stufe = <T,>(steps: readonly T[], v: number): T => steps[Math.max(0, Math.min(steps.length - 1, Math.round(v)))];

// ---------- Verteilungen der Stichprobenergebnisse ----------

/**
 * Binomialverteilung: P(K = k) für k = 0 … n. Rechnet vom wahrscheinlichsten k aus nach beiden Seiten und normiert,
 * damit auch n = 10.000 ohne Unterlauf bleibt. π = 0 oder 1 ergibt eine Spitze bei 0 bzw. n.
 */
export function binomial(n: number, p: number): number[] {
  const out = new Array<number>(n + 1).fill(0);
  if (p <= 0) { out[0] = 1; return out; }
  if (p >= 1) { out[n] = 1; return out; }
  const mode = Math.min(n, Math.floor((n + 1) * p)), r = p / (1 - p);
  out[mode] = 1;
  for (let k = mode; k < n; k++) out[k + 1] = out[k] * (n - k) / (k + 1) * r;
  for (let k = mode; k > 0; k--) out[k - 1] = out[k] * k / (n - k + 1) / r;
  const total = out.reduce((a, b) => a + b, 0);
  return out.map(v => v / total);
}

/**
 * Anteil der Stichproben (n Ziehungen mit Zurücklegen aus `N` Personen, `ones` davon mit 1), deren Anteil mehr als
 * 5 Prozentpunkte neben ones / N liegt. Ganzzahlig verglichen: |N · k − ones · n| · 20 > N · n.
 */
export function outside5(n: number, ones: number, N: number): number {
  const pmf = binomial(n, ones / N);
  return pmf.reduce((a, p, k) => Math.abs(N * k - ones * n) * 20 > N * n ? a + p : a, 0);
}

/** Mittlere 95 % der Anteile: 2,5-%- und 97,5-%-Quantil (wie qbinom in R) und die Wahrscheinlichkeit dazwischen. */
export function middle95(n: number, p: number): { lo: number; hi: number; prob: number } {
  const pmf = binomial(n, p);
  let cum = 0, lo = -1, hi = -1;
  for (let k = 0; k <= n; k++) {
    cum += pmf[k];
    if (lo < 0 && cum >= 0.025 * (1 - 64 * Number.EPSILON)) lo = k;
    if (hi < 0 && cum >= 0.975 * (1 - 64 * Number.EPSILON)) { hi = k; break; }
  }
  if (hi < 0) hi = n;
  const prob = pmf.slice(lo, hi + 1).reduce((a, b) => a + b, 0);
  return { lo: lo / n, hi: hi / n, prob };
}

/**
 * Exakte Verteilung der mittleren Haushaltsgröße von n unabhängig gezogenen Befragten (ALLBUS 2023 als Grundgesamtheit):
 * n-fache Faltung der Häufigkeiten. `probs[i]` gehört zur Summe `n + i`, der Mittelwert ist Summe / n.
 */
export function haushaltMittel(n: number): { sums: number[]; probs: number[] } {
  const max = Math.max(...HAUSHALT.groessen), one = new Array<number>(max + 1).fill(0);
  HAUSHALT.groessen.forEach((g, i) => { one[g] = HAUSHALT.anzahl[i] / HAUSHALT_N; });
  let dist = one;
  for (let k = 1; k < n; k++) {
    const next = new Array<number>(dist.length + max).fill(0);
    dist.forEach((p, s) => { if (p > 0) one.forEach((q, g) => { if (q > 0) next[s + g] += p * q; }); });
    dist = next;
  }
  const sums: number[] = [], probs: number[] = [];
  dist.forEach((p, s) => { if (s >= n && s <= max * n) { sums.push(s); probs.push(p); } });
  return { sums, probs };
}

/** Kennwerte der Haushaltsgrößen als Grundgesamtheit: Mittelwert μ, σ (geteilt durch N) und Schiefe. */
export const HAUSHALT_KENNWERTE = (() => {
  const w = HAUSHALT.anzahl.map(a => a / HAUSHALT_N), g = HAUSHALT.groessen;
  const mu = g.reduce((a, v, i) => a + v * w[i], 0), m2 = g.reduce((a, v, i) => a + (v - mu) ** 2 * w[i], 0), m3 = g.reduce((a, v, i) => a + (v - mu) ** 3 * w[i], 0);
  return { mu, sigma: Math.sqrt(m2), skew: m3 / m2 ** 1.5, bisZwei: (HAUSHALT.anzahl[0] + HAUSHALT.anzahl[1]) / HAUSHALT_N, abFuenf: HAUSHALT.anzahl.slice(4).reduce((a, b) => a + b, 0) / HAUSHALT_N };
})();

// ---------- Gerade für das Vorhersageintervall ----------

/** Einfache lineare Regression y auf x: Achsenabschnitt a, Steigung b, sₑ (n − 2), Mittelwerte, Quadratsumme von x. */
export function gerade(xs: readonly number[], ys: readonly number[]) {
  const n = xs.length, mx = mean(xs), my = mean(ys);
  const ssx = xs.reduce((a, v) => a + (v - mx) ** 2, 0), sxy = xs.reduce((a, v, i) => a + (v - mx) * (ys[i] - my), 0);
  const b = ssx > 0 ? sxy / ssx : NaN, a = my - b * mx;
  const sse = ys.reduce((acc, y, i) => acc + (y - a - b * xs[i]) ** 2, 0);
  return { n, a, b, mx, my, ssx, se: Math.sqrt(sse / (n - 2)), residuals: ys.map((y, i) => y - a - b * xs[i]) };
}
