// Aggregate aus dem ALLBUS 2023 (ZA8831, v1.3.0) für den Bereich B14, ungewichtet, nur Kennwerte (keine Mikrodaten):
// Vertrauen in fünf Institutionen (pt03 Bundestag, pt12 Bundesregierung, pt15 Parteien, pt06 katholische Kirche,
// pt07 evangelische Kirche; 1 gar kein bis 7 großes Vertrauen), Befragte mit gültigen Angaben bei allen fünf Fragen.
// R-Befehle und Prüfung gegen die Datei: b14-faktoren.test.ts (läuft mit ALLBUS_SAV).
import { num } from '../../format';

export const VERTRAUEN = {
  /** Listenweise vollständige Fälle; die Fragen wurden nur einem Teil der Befragten gestellt (Split). */
  n: 3333,
  items: ['pt03', 'pt12', 'pt15', 'pt06', 'pt07'] as const,
  names: ['Bundestag', 'Bundesregierung', 'Parteien', 'katholische Kirche', 'evangelische Kirche'] as const,
  short: ['Bundestag', 'Regierung', 'Parteien', 'kath. Kirche', 'ev. Kirche'] as const,
  /** Korrelationen innerhalb der Politik (Bundestag–Regierung, Bundestag–Parteien, Regierung–Parteien), der Kirchen und dazwischen. */
  rPolitik: [0.7895817, 0.6757566, 0.7076423],
  rKirche: 0.7188024,
  rQuer: [0.2586649, 0.3489551],
  eigen: [2.9219141, 1.2518745, 0.3408948, 0.2789437, 0.2063728],
  /** Hauptkomponenten, zwei Komponenten, ungedreht (mariposa: gespiegelt auf positive Spaltensummen). */
  unrotated: [[0.8433806, -0.3469028], [0.8400864, -0.3907181], [0.8256293, -0.2860410], [0.6181754, 0.6949669], [0.6641336, 0.6434857]],
  /** Dieselbe Lösung nach Varimax (mariposa wie SPSS, Kaiser-normiert, drei Durchgänge). */
  rotated: [[0.8962963, 0.1681830], [0.9173876, 0.1296370], [0.8482711, 0.2095696], [0.1401630, 0.9194967], [0.2067410, 0.9013354]],
  communalities: [0.8316325, 0.8584057, 0.7634833, 0.8651198, 0.8551473],
  /** Anteile in Prozent: ungedreht (Eigenwerte) und gedreht (Quadratsummen der gedrehten Ladungen). */
  shareUnrotated: [58.43828, 25.03749],
  shareRotated: [48.538, 34.938],
  total: 83.47577,
  /** Drehwinkel der Varimax-Lösung in Grad (Achsen im Uhrzeigersinn). */
  angle: 32.986,
  /** Cronbachs Alpha aller fünf Vertrauensfragen. */
  alpha: 0.817,
} as const;

/** „0,68 bis 0,79“ */
export const range = (xs: readonly number[]) => `${num(Math.min(...xs))} bis ${num(Math.max(...xs))}`;
