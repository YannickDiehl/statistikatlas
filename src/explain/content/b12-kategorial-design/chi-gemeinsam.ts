// Gemeinsame Rechnung der beiden χ²-Werkstätten (Anpassung und Unabhängigkeit): beobachtet O, erwartet E,
// Abweichung, Quadrat, Beitrag (O − E)² / E, Summe χ², Freiheitsgrade und p (χ²-Verteilung, wie chisq.test in R).
import { num } from '../../format';
import { pchisq } from '../../../tasks/kit/dist';

export interface ChiParts {
  o: number[]; e: number[]; dev: number[]; sq: number[]; part: number[];
  n: number; sumSq: number; chi2: number; df: number; p: number; minE: number;
}

/** Rechnet die Schritte 2 bis 6 aus beobachteten und erwarteten Häufigkeiten. */
export function chiParts(o: number[], e: number[], df: number): ChiParts {
  const dev = o.map((x, i) => x - e[i]), sq = dev.map(d => d * d), part = sq.map((q, i) => e[i] > 0 ? q / e[i] : 0);
  const chi2 = part.reduce((a, b) => a + b, 0), n = o.reduce((a, b) => a + b, 0);
  return { o, e, dev, sq, part, n, sumSq: sq.reduce((a, b) => a + b, 0), chi2, df, p: pchisq(chi2, df, false), minE: Math.min(...e) };
}

/** Deutsche Zahl zurück in eine Zahl („1.234,5“ → 1234.5, „−3“ → −3). */
const parse = (t: string) => Number(t.replace(/\./g, '').replace(',', '.').replace('−', '-'));
/** Beitrag zu χ²: zwei Nachkommastellen, unter 0,1 zwei gültige Ziffern („0,025“). */
export const partText = (v: number) => num(v, v > 0 && v < 0.1 ? 3 : 2);
/** „=“, wenn die angezeigte Zahl genau stimmt, sonst „≈“. */
export const eqFor = (shown: string, v: number) => Math.abs(parse(shown) - v) < 1e-9 ? '=' : '≈';

/**
 * Die Summe der Beiträge, wie angezeigt: `terms` „0,1 + 0 + 0,23 + 0,025 + 0“, `sign` „=“ oder „≈“, `line` mit dem
 * Ergebnis. Gehen die sichtbaren Zahlen nicht genau auf, nennt `note`, was mit allen Nachkommastellen herauskommt.
 */
export function partSum(c: ChiParts): { terms: string; sign: string; line: string; note: string } {
  const shown = c.part.map(partText), exact = shown.every((t, i) => eqFor(t, c.part[i]) === '=') && eqFor(num(c.chi2), c.chi2) === '=';
  const visible = shown.reduce((a, t) => a + parse(t), 0), terms = shown.join(' + '), sign = exact ? '=' : '≈';
  const note = num(visible) === num(c.chi2) ? '' : ` Die gerundeten Beiträge ergäben ${num(visible)}; mit allen Nachkommastellen sind es ${num(c.chi2)}.`;
  return { terms, sign, line: `${terms} ${sign} ${num(c.chi2)}`, note };
}

/** Prozentanteil eines Beitrags an χ², ohne Nachkommastellen. */
export const shareOf = (part: number, chi2: number) => chi2 > 0 ? `${Math.round(part / chi2 * 100)} %` : '0 %';
