// Gemeinsame Helfer des Bereichs B5 „Zusammenhang“: Ränge, Paarvergleiche, Stärke nach Cohen, Zahlwörter.
// Reine Rechnung ohne React; die Referenzwerte stehen in ./b05-zusammenhang.test.ts.
import { num } from '../../format';
import { ref, titleFor } from '../../../domain/learning';

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

/** Zahl mit Einzahl oder Mehrzahl: „1 Paar ist“, „8 Paare sind“; `fmt` formatiert die Zahl (Standard: Tausenderpunkt, echtes Minus). */
export const pl = (n: number, one: string, many: string, fmt: (v: number) => string = int) => `${fmt(n)} ${Math.abs(n) === 1 ? one : many}`;

/** Zahlwörter für kleine Mengen („zwei Personen“). */
const WORDS = ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
export const word = (n: number) => WORDS[n] ?? String(n);

/** Platz eines Werts in der sortierten Reihe: erster und letzter belegter Platz, wie viele ihn teilen, mittlerer Rang. */
export function place(values: readonly number[], i: number) {
  const v = values[i], below = values.filter(w => w < v).length, same = values.filter(w => w === v).length;
  return { first: below + 1, last: below + same, same, rank: below + (same + 1) / 2 };
}
