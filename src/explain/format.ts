import { near, numberReadings } from '../tasks/kit/numbers';

/**
 * Rundet auf `digits` Nachkommastellen, wie man es in der Schule lernt: eine 5 an der ersten wegfallenden Stelle
 * rundet vom Betrag her auf, auch bei negativen Zahlen (1,125 → 1,13 und −1,125 → −1,13). Binäres Rauschen
 * zählt nicht: 19,865 liegt im Rechner knapp darunter (19,864999…), wird aber wie die Dezimalzahl 19,865 zu 19,87.
 * Dafür wird der Betrag zuerst auf 15 gültige Ziffern gebracht und dann über den Exponenten verschoben, nicht malgenommen.
 */
export function round(v: number, digits = 2): number {
  if (!Number.isFinite(v) || v === 0) return v === 0 ? 0 : v;
  const [mantissa, exponent = '0'] = Math.abs(v).toPrecision(15).split('e');
  const shifted = Math.round(Number(`${mantissa}e${Number(exponent) + digits}`));
  const r = shifted >= 1e21 ? shifted / 10 ** digits : Number(`${shifted}e${-digits}`);
  return v < 0 && r !== 0 ? -r : r; // −0 vermeiden
}

/** Deutsche Zahl mit höchstens `digits` Nachkommastellen und echtem Minuszeichen: 3,16 · −4 · 0,5. */
export function num(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return '–';
  return round(v, digits).toLocaleString('de-DE', { maximumFractionDigits: digits }).replace('-', '−');
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

/** Zahl mit Einheit in Einzahl oder Mehrzahl, nach der angezeigten Zahl: „1 Punkt“, „0,71 Punkte“, „2 Stunden“. */
export function unit(v: number, one: string, many: string, digits = 2): string {
  const t = num(v, digits);
  return `${t} ${t === '1' || t === '−1' ? one : many}`;
}

/** Prozent mit einer Nachkommastelle: 33,3 %. */
export function pct(share: number, digits = 1): string {
  return `${num(share * 100, digits)} %`;
}

/** Feste Nachkommastellen, für Werte, die nebeneinander verglichen werden: 2,70 und 3,30. */
export function fixed(v: number, digits = 2): string {
  if (!Number.isFinite(v)) return '–';
  const t = round(v, digits).toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace('-', '−');
  return /^−0(,0+)?$/.test(t) ? t.slice(1) : t;
}

/** Ganze Zahl mit Tausenderpunkt: 5.225. */
export function count(v: number): string {
  return round(v, 0).toLocaleString('de-DE').replace('-', '−');
}

/**
 * Zahl in einer Datentabelle (Tabellen-Werkzeug): deutsches Komma, echtes Minus, alle Nachkommastellen der Daten
 * (höchstens sechs). Tausenderpunkte erst ab fünf Stellen, damit „3850“ nicht wie R-Schreibweise „3.850“ aussieht.
 */
export function cell(v: number): string {
  if (!Number.isFinite(v)) return '–';
  return round(v, 6).toLocaleString('de-DE', { maximumFractionDigits: 6, useGrouping: Math.abs(v) >= 10000 }).replace('-', '−');
}

/**
 * Liest eine Antwort aus einem Kontrollfeld: alle vertretbaren Lesarten einer Zahl („3.162“ ist
 * R-Schreibweise oder Tausenderpunkt, „+2“ wie in der Tabelle), „NA“ oder null für leer/unlesbar.
 */
export function parseAnswer(input: string): number[] | 'NA' | null {
  const t = input.trim();
  if (/^na$/i.test(t)) return 'NA';
  const readings = numberReadings(t);
  return readings.length ? readings.map(r => r.x) : null;
}

/** Toleranz für Kontrollfragen: Anzeige auf zwei Nachkommastellen. */
export const TOLERANCE = 0.011;

export const close = (a: number, b: number, tol = TOLERANCE) => near(a, b, tol);
