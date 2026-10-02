// Gemeinsame Helfer des Bereichs B4 „Umformen“: Personen, Zahlen mit Einheit, Sätze über die Spalte der Brücke und
// die Kennwerte der Werkstätten Zentrieren und Standardisieren. Ton nach src/explain/content/streuung.ts.
import type { BridgeCtx } from '../../types';
import { series, type Series } from '../../math';
import { num, unit } from '../../format';

export const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
/** Name der gewählten Person (Werkstatt: A bis E, Brücke: P001 bis P200). */
export const P = (c: { names: readonly string[]; who: number }) => c.names[c.who];
/** „≈“, wenn die angezeigte Zahl gerundet ist, sonst „=“. */
export const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';
/** Stunden in Sätzen über Menschen: „1 Stunde“, „0,55 Stunden“. */
export const hours = (v: number) => unit(v, 'Stunde', 'Stunden');
/** Standardabweichungen in Sätzen: „1 Standardabweichung“, „1,5 Standardabweichungen“. */
export const sds = (v: number) => unit(v, 'Standardabweichung', 'Standardabweichungen');
/** Wie angezeigt gerundet (zwei Nachkommastellen), damit Proben mit den sichtbaren Zahlen aufgehen. */
export const shown = (v: number) => Math.round(v * 100) / 100;
/** Summe gerundeter Werte als Text: „−1,5 − 0,5 + 0,5 + 0,5 + 1“. */
export function sumText(values: readonly number[]): string {
  return values.map((v, i) => i === 0 ? num(v) : `${v < -1e-9 && num(v) !== '0' ? '−' : '+'} ${num(Math.abs(v))}`).join(' ');
}

// ---------- Brücke: Sätze für jede Spalte ----------

type BC = BridgeCtx<unknown>;
export const N = (c: BC) => c.values.length;
export const lernzeit = (c: BC) => c.col.id === 'lernzeit';
/** Menge in Sätzen über Menschen: bei der Lernzeit „3,24 Stunden“, sonst mit der Einheit der Spalte. */
export const amount = (c: BC, v: number) => lernzeit(c) ? hours(v) : c.u(v);
/** „Lernzeiten“ oder „Werte von „Alter““. */
export const valuesOf = (c: BC) => lernzeit(c) ? 'Lernzeiten' : `Werte von „${c.col.title}“`;
/** Skalenniveau der Spalte in einem Satz (für „Voraussetzung“). */
export const scaleNote = (c: BC) => c.col.likert ? `Für „${c.col.title}“ nimmst du gleich große Abstände zwischen den Antwortstufen an.`
  : c.col.scale === 'metric' ? `„${c.col.title}“ ist metrisch: Gleiche Zahlenabstände bedeuten gleich viel.`
  : c.col.scale === 'ordinal' ? `„${c.col.title}“ ist geordnet; gleiche Abstände zwischen den Stufen sind hier eine Annahme.`
  : `„${c.col.title}“ hat nur die Werte 0 und 1; der Mittelwert ist der Anteil der Einsen.`;
/** Lage zur Mitte: „0,55 h über der Mitte“, „genau auf der Mitte“. */
export const toMiddle = (c: BC, d: number) => Math.abs(d) < 0.005 ? 'genau auf der Mitte' : `${c.u(Math.abs(d))} ${d > 0 ? 'über' : 'unter'} der Mitte`;

// ---------- Kennwerte der Werkstätten Zentrieren und Standardisieren ----------

/**
 * Kennwerte einer Reihe für Zentrieren und Standardisieren: alles aus `series` (Mitte, Abweichungen, Quadrate,
 * Quadratsumme, s), dazu s mit n statt n − 1 (`sdN`, für die Diagnose), z-Werte und die Werte selbst durch s
 * (`raw`, für die Diagnose), beide null, wenn s = 0 ist. `below`/`above` zählen Werte unter und über der Mitte.
 */
export type ZStats = Series & {
  sdN: number; z: number[] | null; raw: number[] | null; zMean: number | null; zSd: number | null;
  below: number; above: number; minAt: number; maxAt: number;
};
export function zstats(xs: readonly number[]): ZStats {
  const s = series(xs), ok = s.n > 1 && s.sd > 1e-9;
  const z = ok ? s.dev.map(d => d / s.sd) : null;
  let minAt = 0, maxAt = 0;
  s.xs.forEach((x, i) => { if (x < s.xs[minAt]) minAt = i; if (x > s.xs[maxAt]) maxAt = i; });
  return {
    ...s, sdN: Math.sqrt(s.ss / s.n), z, raw: ok ? s.xs.map(x => x / s.sd) : null, zMean: ok ? 0 : null, zSd: ok ? 1 : null,
    below: s.dev.filter(d => d < -1e-9).length, above: s.dev.filter(d => d > 1e-9).length, minAt, maxAt,
  };
}

/** Größte Verschiebung (2 oder 1, sonst 0), die alle Werte innerhalb der Grenzen lässt; bevorzugt nach oben. */
export const shiftWithin = (d: number[], lo: number, hi: number) => {
  const up = hi - Math.max(...d), down = Math.min(...d) - lo;
  return up >= 2 ? 2 : down >= 2 ? -2 : up >= 1 ? 1 : down >= 1 ? -1 : 0;
};
