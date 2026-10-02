// Gemeinsame Zahlen des Bereichs B2 „Datenwerkzeuge“: die ersten fünf Befragten des Lehrdatensatzes und
// ALLBUS-Aggregate (nur Häufigkeiten und Mittelwerte, ungewichtet). Alle Werte sind in R nachgerechnet,
// die Befehle und Zusicherungen stehen in ./b02-datenwerkzeuge.test.ts.
import type { SampleCtx } from '../../types';

/** P001 bis P005 aus dem Lehrdatensatz (createSurvey()), wie read_spss() sie liefert. */
export const FUENF = [
  { person: 'P001', erwerbstaetig: 1, einkommen: 4549, lernzeit: 6, wissenstest: 12 },
  { person: 'P002', erwerbstaetig: 1, einkommen: 3850, lernzeit: 8.3, wissenstest: 9 },
  { person: 'P003', erwerbstaetig: 0, einkommen: 2762, lernzeit: 6.3, wissenstest: 14 },
  { person: 'P004', erwerbstaetig: 1, einkommen: 4604, lernzeit: 10.5, wissenstest: 13 },
  { person: 'P005', erwerbstaetig: 1, einkommen: 1868, lernzeit: 6.8, wissenstest: 11 },
] as const;

/** Wertelabels von erwerbstaetig (src/domain/survey.ts). */
export const JA_NEIN: Record<number, string> = { 0: 'Nein', 1: 'Ja' };
export const FRAGE_ERWERBSTAETIG = 'Sind Sie gegenwärtig erwerbstätig?';

/**
 * ALLBUS 2023 (ZA8831, Version 1.3.0), ungewichtet: Größe des Datensatzes und das Vertrauen in den Bundestag
 * (pt03, Skala 1 bis 7) mit seinen Codes für fehlende Angaben. Nur Aggregate, keine Mikrodaten.
 */
export const ALLBUS = {
  befragte: 5246,
  spalten: 579,
  pt03: {
    gueltig: 3592,
    fehlend: 1654,
    summeGueltig: 14177,
    /** Mittelwert der gültigen Antworten 1 bis 7 */
    mittel: 3.946826,
    /** Mittelwert, wenn alle Codes als Zahlen mitzählen */
    mittelMitCodes: -0.762486,
    codes: [
      { code: -42, label: 'Datenfehler', n: 3 },
      { code: -11, label: 'Frage nicht gestellt (Split)', n: 1596 },
      { code: -9, label: 'keine Angabe', n: 55 },
    ],
  },
} as const;

/** Die Werte einer Spalte in den aktuellen Daten des Reiters. */
export const spalte = (c: SampleCtx, fallback: string) => {
  const id = c.columns.x?.[0] ?? fallback;
  return { id, values: c.rows.map(r => r.values[id]) };
};

/** Tiefgestellte Ziffern für Positionen: 200 → ₂₀₀. */
export const tief = (n: number) => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]);
