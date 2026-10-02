// Lernkarten zu den Zeichen im R-Code von efa() (Codelegende im Reiter „In R“). Die Fehlermeldungen sind die echten
// Meldungen von mariposa 0.7.4 (in R nachgeprüft, siehe b14-faktoren.test.ts).
import type { TokenNote } from '../../types';

export const EXTRACTION: TokenNote = {
  sym: 'extraction =', term: 'Extraktion',
  kurz: 'Wählt das Modell: "pca" für Hauptkomponenten, "ml" für gemeinsame Faktoren mit Maximum Likelihood.',
  fehler: 'Großbuchstaben kennt mariposa nicht: `extraction` must be one of "pca" or "ml". ✖ You supplied "PCA".',
};
export const PCA: TokenNote = {
  sym: '"pca"', term: 'Hauptkomponentenanalyse',
  kurz: 'Fasst die gesamte Streuung der Fragen in Komponenten zusammen. Eine Normalverteilung braucht sie nicht.',
  fehler: 'Ohne extraction rechnet efa() auch eine PCA, dreht sie aber mit Varimax. Schreib das Modell deshalb ausdrücklich hin.',
};
export const ML: TokenNote = {
  sym: '"ml"', term: 'Maximum Likelihood',
  kurz: 'Schätzt gemeinsame Faktoren und lässt jeder Frage einen eigenen Rest. summary() zeigt dazu einen Test der Modellpassung.',
  fehler: 'Bei fünf Fragen gehen höchstens zwei ML-Faktoren: `n_factors` = 3 is too many for ML extraction with 5 variables.',
};
export const N_FACTORS: TokenNote = {
  sym: 'n_factors =', term: 'Zahl der Komponenten',
  kurz: 'Wie viele Komponenten oder Faktoren R herauszieht. Ohne Angabe nimmt mariposa alle mit Eigenwert über 1, mindestens eine.',
  fehler: 'Mehr als es Fragen gibt, geht nicht: `n_factors` must be between 1 and 5 (number of variables).',
};
export const ROTATION: TokenNote = {
  sym: 'rotation =', term: 'Rotation',
  kurz: 'Dreht eine Lösung mit mehreren Komponenten, damit sie sich leichter deuten lässt. "none" heißt: nicht drehen.',
  fehler: 'Bei nur einer Komponente meldet mariposa: Only one component was extracted. The solution cannot be rotated.',
};
export const NONE: TokenNote = {
  sym: '"none"', term: 'Ohne Rotation',
  kurz: 'Die Lösung bleibt so, wie die Extraktion sie liefert.',
  fehler: 'Ohne rotation = "none" dreht efa() mit Varimax, sobald es mindestens zwei Komponenten gibt.',
};
export const VARIMAX: TokenNote = {
  sym: '"varimax"', term: 'Varimax-Rotation',
  kurz: 'Dreht die Achsen im rechten Winkel, bis jede Frage möglichst nur auf einer Komponente hoch lädt.',
  fehler: 'Ein Tippfehler bricht ab: `rotation` must be one of "varimax", "oblimin", "promax", or "none".',
};
/** Zeichen des Leitaufrufs efa:0 (eine Hauptkomponente, ungedreht). */
export const PCA_TOKENS = { extraction: EXTRACTION, '"pca"': PCA, n_factors: N_FACTORS, rotation: ROTATION, '"none"': NONE };
