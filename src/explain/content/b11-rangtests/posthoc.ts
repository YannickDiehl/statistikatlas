// Gemeinsame Rechnungen der Paarvergleiche nach der ANOVA (Tukey, Scheffé) auf dem Lehrdatensatz: Lernzeit nach
// Schulabschluss wie mariposa::oneway_anova(lernzeit, group = schulabschluss) %>% tukey_test() bzw. scheffe_test().
// Referenzwerte aus R in b11-rangtests.test.ts.
import type { SampleCtx } from '../../types';
import { baseSurvey } from '../../sample';
import { qtukey } from '../../../tasks/kit/means';
import { meanPairs, qf, type MeanPair } from './rank';

/** Kurznamen der Schulabschlüsse (Codes 0 bis 4) für Bilder und Listen. */
export const SCHOOL_SHORT = ['ohne', 'Haupt', 'Mittel', 'FHR', 'Abitur'] as const;
/** Wertelabels der Schulabschlüsse wie in der SPSS-Datei. */
export const SCHOOL = ['Ohne Schulabschluss', 'Haupt-/Volksschulabschluss', 'Mittlerer Abschluss', 'Fachhochschulreife', 'Abitur / fachgebundene Hochschulreife'] as const;

/** Tukey-Hürde in Stunden: Ein Paar ist auffällig, wenn |Differenz| größer ist (q_krit / √2 · SE). */
export const tukeyHurdle = (alpha: number, se: number, k: number, df: number) => qtukey(1 - alpha, k, df) / Math.SQRT2 * se;
/** Scheffé-Hürde in Stunden: √((k − 1) · F_krit) · SE. */
export const scheffeHurdle = (alpha: number, se: number, k: number, df: number) => Math.sqrt((k - 1) * qf(1 - alpha, k - 1, df)) * se;

export type PairsResult = NonNullable<ReturnType<typeof meanPairs>>;

/** Paarvergleiche für die aktuellen Daten (Spalten der Rollen x und group, sonst Lernzeit nach Schulabschluss). */
export function pairsOf(c: SampleCtx): PairsResult | null {
  const x = c.columns.x?.[0] ?? 'lernzeit', g = c.columns.group?.[0] ?? 'schulabschluss';
  return meanPairs(c.rows.map(r => r.values[x]), c.rows.map(r => r.values[g]));
}

let base: PairsResult | null = null;
/** Paarvergleiche für die Ausgangsdaten (Begriffskarten und ihre Bilder). */
export const basePairs = (): PairsResult => base ??= pairsOf({ rows: baseSurvey(), columns: {} })!;

/** „Ohne Schulabschluss − Abitur / fachgebundene Hochschulreife“, Richtung wie in R: frühere minus spätere Gruppe. */
export const pairLabel = (p: MeanPair) => `${SCHOOL[p.a] ?? p.a} − ${SCHOOL[p.b] ?? p.b}`;
export const pairShort = (p: MeanPair) => `${SCHOOL_SHORT[p.a] ?? p.a} − ${SCHOOL_SHORT[p.b] ?? p.b}`;

/** Fehlervarianz und Hürde für zwei Gruppen mit je 40 Personen (zum Vergleich über Datenstände hinweg). */
export const hurdle40 = (r: PairsResult, kind: 'tukey' | 'scheffe', alpha = 0.05) =>
  (kind === 'tukey' ? tukeyHurdle : scheffeHurdle)(alpha, Math.sqrt(r.mse * 2 / 40), r.k, r.df);
