/** Liest „37,9“, „37.9“, „1.656“ (Tausenderpunkt), „5 246“ und „−8“. Gibt null zurück, wenn es keine Zahl ist. */
export function parseNumber(input: string): number | null {
  const s = input.trim().replace(/\s/g, '').replace(/[−–]/g, '-');
  if (!s) return null;
  let t = s;
  if (s.includes(',')) t = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) t = s.replace(/\./g, '');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return Number(t);
}

/** Alle vertretbaren Lesarten einer eingetippten Zahl, mit der Zahl ihrer Nachkommastellen (für die Toleranz).
 *  „3.765“ ist mehrdeutig: So druckt R eine Dezimalzahl, im Deutschen ist es ein Tausenderpunkt. Dann gibt es beide Lesarten,
 *  die aus R zuerst – Statistik-Eingaben (t, F, b, Exp(B) …) prüfen gegen jede Lesart, Zählungen bleiben bei parseNumber(). */
export function numberReadings(input: string): { x: number; decimals: number }[] {
  const s = input.trim().replace(/\s/g, '').replace(/[−–]/g, '-').replace(/%$/, '');
  const x = parseNumber(s);
  if (x === null) return [];
  if (s.includes(',')) return [{ x, decimals: s.split(',')[1].length }];
  if (/^-?\d{1,3}\.\d{3}$/.test(s)) return [{ x: Number(s), decimals: 3 }, ...(/^-?[1-9]/.test(s) ? [{ x, decimals: 0 }] : [])];
  if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) return [{ x, decimals: 0 }];
  return [{ x, decimals: (s.split('.')[1] ?? '').length }];
}

/** Halbe Einheit der letzten eingegebenen Stelle – so weit darf eine gerundete Eingabe vom genauen Wert abweichen. */
export const halfUnit = (decimals: number) => 0.5 * 10 ** -decimals + 1e-9;

export const near = (value: number, target: number, tolerance: number) => Math.abs(value - target) <= tolerance + 1e-9;

/** Deutsche Schreibweise mit echtem Minuszeichen (−0,350 statt -0,350); nicht berechenbare Werte als „–“. */
export const de = (x: number, digits = 1) => Number.isFinite(x)
  ? x.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace('-', '−')
  : '–';
