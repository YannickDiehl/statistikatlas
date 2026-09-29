/** Liest „37,9", „37.9", „1.656" (Tausenderpunkt), „5 246" und „−8". Gibt null zurück, wenn es keine Zahl ist. */
export function parseNumber(input: string): number | null {
  const s = input.trim().replace(/\s/g, '').replace(/[−–]/g, '-');
  if (!s) return null;
  let t = s;
  if (s.includes(',')) t = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) t = s.replace(/\./g, '');
  if (!/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return Number(t);
}

export const near = (value: number, target: number, tolerance: number) => Math.abs(value - target) <= tolerance + 1e-9;

export const de = (x: number, digits = 1) => Number.isFinite(x)
  ? x.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  : '–';
