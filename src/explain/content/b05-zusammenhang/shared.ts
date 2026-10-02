// Gemeinsame Helfer des Bereichs B5 „Zusammenhang“: Ränge, Paarvergleiche, Stärke nach Cohen, Zahlwörter.
// Reine Rechnung ohne React; die Referenzwerte stehen in ./b05-zusammenhang.test.ts.
import { num } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { sampleColumn } from '../../sample';
import type { SampleCtx } from '../../types';

/** Titel eines Begriffs der Karte (Regel 2). */
export const T = (id: string) => titleFor(ref(id));

/** Ganze Zahl mit Tausenderpunkt und echtem Minus: 6.954, −1.654. */
export const int = (v: number) => num(v, 0);

/** „≈“, wenn die angezeigte Zahl gerundet ist, sonst „=“. */
export const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';

/** Betrag, gerundet wie angezeigt: 0,4999… gilt als 0,5. */
export const shown = (v: number) => Math.round(Math.abs(v) * 100) / 100;

/** Stärke eines Betrags nach der Faustregel von Cohen (ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark), gebeugt. */
export function strength(v: number): string {
  const a = shown(v);
  return a >= 1 ? 'perfekter' : a >= 0.5 ? 'starker' : a >= 0.3 ? 'mittelstarker' : a >= 0.1 ? 'schwacher' : 'sehr schwacher';
}

/** Zahlwörter für kleine Mengen („zwei Personen“). */
const WORDS = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
export const word = (n: number) => WORDS[n] ?? String(n);

/** Mittlere Ränge wie R `rank()`: kleinster Wert Rang 1, gleiche Werte teilen sich den Mittelwert ihrer Plätze. */
export function ranks(values: readonly number[]): number[] {
  const order = values.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const out = new Array<number>(values.length);
  for (let k = 0; k < order.length;) {
    let e = k;
    while (e + 1 < order.length && order[e + 1][0] === order[k][0]) e++;
    for (let m = k; m <= e; m++) out[order[m][1]] = (k + e) / 2 + 1;
    k = e + 1;
  }
  return out;
}

/** Platz eines Werts in der sortierten Reihe: erster und letzter belegter Platz, wie viele ihn teilen, mittlerer Rang. */
export function place(values: readonly number[], i: number) {
  const v = values[i], below = values.filter(w => w < v).length, same = values.filter(w => w === v).length;
  return { first: below + 1, last: below + same, same, rank: below + (same + 1) / 2 };
}

/** Pearson-r zweier Reihen; null, wenn eine Reihe nicht streut. */
export function pearsonOf(xs: readonly number[], ys: readonly number[]): number | null {
  const n = xs.length, mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  xs.forEach((x, i) => { sxy += (x - mx) * (ys[i] - my); sxx += (x - mx) ** 2; syy += (ys[i] - my) ** 2; });
  return sxx > 1e-12 && syy > 1e-12 ? sxy / Math.sqrt(sxx * syy) : null;
}

/** Spalte einer Rolle im Reiter „Mit 200 Befragten“ (feste Spalten oder Spaltenwahl), sonst der Vorgabewert. */
export const roleColumn = (c: SampleCtx, role: string, fallback: string) => c.columns[role]?.[0] ?? fallback;
/** Werte einer Rolle für alle Befragten. */
export const roleValues = (c: SampleCtx, role: string, fallback: string) => sampleColumn(c.rows, roleColumn(c, role, fallback));
