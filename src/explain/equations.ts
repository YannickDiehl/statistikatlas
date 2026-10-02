/**
 * Prüfhilfe für Rechnungen im Text (AUTHORING §2, Schreibweise: „Rechnungen im Text gehen mit den sichtbaren Zahlen
 * auf“). Findet ganze Gleichungen „a − b = c“, „a + b = c“, „a · b = c“, „a / b = c“ und „a² = c“ mit deutschen Zahlen
 * („12 − 10,13 = +1,87“, „(−1,04) · (+1,87)“) und meldet die, deren Ergebnis nicht aus den gezeigten Teilen folgt:
 * gerundet auf die Stellen des Ergebnisses, wie in der Schule. „≈“ prüft sie nicht, das sagt die Rundung selbst an.
 * Teile längerer Rechnungen („200 · 199 / 2 = 19.900“) und Prozentangaben („103 / 200 = 51,5 %“) zählen nicht.
 */
import { round } from './format';

const NUM = String.raw`[+−]?(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d+)?`;
const N = String.raw`\(${NUM}\)|${NUM}`;
// Davor kein weiteres Rechenzeichen und keine Zahl, danach keine Fortsetzung der Zahl, kein „%“ und kein weiteres Rechenzeichen.
const START = String.raw`(?<![\d,.)(]|[\d)] |[−+·/×] )`, END = String.raw`(?!\d|[.,]\d| ?%| [·/+−×] )`;
const BINARY = new RegExp(`${START}(${N}) ([−+·/]) (${N}) = (${N})${END}`, 'g');
const SQUARE = new RegExp(`${START}(${N})² = (${N})${END}`, 'g');

const value = (t: string) => Number(t.replace(/[()]/g, '').replace(/\./g, '').replace(',', '.').replace('−', '-').replace('+', ''));
const decimals = (t: string) => (t.replace(/[()]/g, '').split(',')[1] ?? '').length;

/** Gleichungen im Text, die mit den gezeigten Zahlen nicht aufgehen (leer, wenn alle stimmen). */
export function equationsThatFail(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(BINARY)) {
    const a = value(m[1]), b = value(m[3]), op = m[2];
    const exact = op === '−' ? a - b : op === '+' ? a + b : op === '·' ? a * b : a / b;
    if (Math.abs(round(exact, decimals(m[4])) - value(m[4])) > 1e-9) out.push(m[0]);
  }
  for (const m of text.matchAll(SQUARE)) {
    const a = value(m[1]);
    if (Math.abs(round(a * a, decimals(m[2])) - value(m[2])) > 1e-9) out.push(m[0]);
  }
  return out;
}
