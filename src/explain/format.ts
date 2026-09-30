import { parseNumber } from '../tasks/kit/numbers';

/** Deutsche Zahl mit höchstens `digits` Nachkommastellen und echtem Minuszeichen: 3,16 · −4 · 0,5. */
export function num(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return '–';
  const f = 10 ** digits;
  let r = Math.round(v * f) / f;
  if (r === 0) r = 0; // −0 vermeiden
  return r.toLocaleString('de-DE', { maximumFractionDigits: digits }).replace('-', '−');
}

/** Mit Vorzeichen: +4 · −2 · 0. */
export function signed(v: number, digits = 2): string {
  const t = num(v, digits);
  return t === '0' || t.startsWith('−') ? t : `+${t}`;
}

/** Negative Zahlen in Klammern, für Produkte und Summen: (−4) · 3. */
export function paren(v: number, digits = 2): string {
  const t = num(v, digits);
  return t.startsWith('−') ? `(${t})` : t;
}

/** Prozent mit einer Nachkommastelle: 33,3 %. */
export function pct(share: number, digits = 1): string {
  return `${num(share * 100, digits)} %`;
}

/** Ganze Zahl mit Tausenderpunkt: 5.225. */
export function count(v: number): string {
  return Math.round(v).toLocaleString('de-DE');
}

/** Liest eine Antwort aus einem Kontrollfeld: Zahl, „NA“ oder null für leer/unlesbar. */
export function parseAnswer(input: string): number | 'NA' | null {
  const t = input.trim();
  if (/^na$/i.test(t)) return 'NA';
  return parseNumber(t);
}

/** Toleranz für Kontrollfragen: Anzeige auf zwei Nachkommastellen. */
export const TOLERANCE = 0.011;

export const close = (a: number, b: number, tol = TOLERANCE) => Math.abs(a - b) <= tol + 1e-9;
