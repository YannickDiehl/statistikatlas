// Reiter der drei Begriffe der Werkstatt „Gerade“: Lineare Regression, Linearer Prädiktor, Residuen.
// Leitaufruf in R: linear_regression(wissenstest ~ lernzeit + alter) aus dem Katalog (Variante 0).
// Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptTabs, SampleCtx, TokenNote } from '../../types';
import { num } from '../../format';
import { sampleColumn, sampleColumnInfo } from '../../sample';
import { ref, titleFor } from '../../../domain/learning';
import { fitLine } from './fit';

const T = (id: string) => titleFor(ref(id));
const LZ_WT = 'lernzeit,wissenstest';

/** Gerade für die Spalten der Spaltenwahl (Standard: Lernzeit und Wissenstest). */
export function lineFor(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'lernzeit', y = c.columns.y?.[0] ?? 'wissenstest';
  return { x, y, fit: fitLine({ x: sampleColumn(c.rows, x), y: sampleColumn(c.rows, y) }) };
}
/** Satz zu R² für „Weiter“, aus den aktuellen Daten. */
function r2Sentence(c: SampleCtx): string {
  const { x, y, fit } = lineFor(c);
  if (fit.r2 === null || fit.b1 === null) return 'Wie viel der Streuung erfasst die Gerade? Das misst R², von 0 bis 1.';
  return `Wie viel der Streuung erfasst die Gerade? Für „${sampleColumnInfo(x).title}“ und „${sampleColumnInfo(y).title}“ sind es R² ≈ ${num(fit.r2)}, also ${num(fit.r2 * 100, 0)} %.`;
}

export const LINEAR_REGRESSION_TOKEN: TokenNote = {
  sym: 'linear_regression()', term: T('linear_regression'),
  kurz: 'Schätzt die Gerade nach kleinsten Quadraten. Links von ~ steht die Zielgröße, rechts stehen die Prädiktoren.',
  fehler: 'Ohne Tilde, etwa linear_regression(lernzeit, wissenstest), meldet mariposa: `formula` must be a formula such as `y ~ x1 + x2`.',
};
const STANDARDIZED: TokenNote = {
  sym: 'standardized =', term: 'Standardisierte Koeffizienten',
  kurz: 'TRUE ergänzt die Spalte Beta: die Steigungen, als hätte man alle Variablen vorher z-standardisiert.',
  fehler: 'Erwartet wird TRUE oder FALSE. Mit standardized = "ja" meldet R: Argument kann nicht als logischer Wert interpretiert werden.',
};
export const MODELL: TokenNote = {
  sym: 'modell', term: 'Gespeichertes Ergebnis',
  kurz: 'Unter diesem Namen liegt das geschätzte Modell. summary() und predict() greifen darauf zu.',
  fehler: 'Fehlt die Zeile modell <- …, meldet R bei summary(modell): Objekt \'modell\' nicht gefunden.',
};
const N_MAP = { match: 'N', atlas: 'n', explain: 'N zählt die Befragten mit gültigen Werten in allen Variablen des Modells, hier alle 200.' };

export const linearRegressionTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b13-gerade', variant: 'linear_regression', variable: LZ_WT,
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was macht die Steigung b₁?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 2,
        explain: 'Die Mitte x̄ wandert um eine Stunde mit, alle Abstände xᵢ − x̄ bleiben gleich. Zähler und Nenner in Schritt 2 ändern sich nicht.',
        kurz: 'Verschieben ändert die Lage der Geraden, nicht ihre Steigung.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was macht b₁?', options: ['verdoppelt sich', 'halbiert sich', 'bleibt gleich'], correct: 1, step: 2,
        explain: 'Jeder Abstand der Lernzeit verdoppelt sich. Der Zähler wird doppelt so groß, der Nenner viermal so groß. Je Stunde steigt die Gerade nur noch halb so stark.',
        kurz: 'Andere Einheit, andere Steigung.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 0.5 },
      },
      {
        question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was macht b₁?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1, step: 2,
        explain: 'Jeder Abstand yᵢ − ȳ dreht sein Vorzeichen, also auch jedes Produkt im Zähler. Der Nenner bleibt, und b₁ behält seinen Betrag.',
        kurz: 'Umpolen dreht die Richtung, nicht die Stärke.',
        tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
    ],
  },
  r: {
    entry: 'linear_regression', variant: 0,
    tokens: { linear_regression: LINEAR_REGRESSION_TOKEN, standardized: STANDARDIZED, modell: MODELL },
    outputMap: [
      { match: '0.518', atlas: 'b₁ der Lernzeit', step: 2, explain: 'B in der Zeile lernzeit ist die Steigung: je Stunde 0,52 Aufgaben mehr, bei gleichem Alter. Ohne Alter im Modell ist sie fast gleich.' },
      { match: '5.822', atlas: 'b₀', step: 3, explain: 'B in der Zeile (Intercept) ist der Achsenabschnitt bei 0 Stunden und Alter 0, also weit außerhalb der Daten. Ohne Alter im Modell wären es 6,1 Aufgaben bei 0 Stunden.' },
      { match: '0.006', atlas: 'b₂ des Alters', explain: 'Je Lebensjahr sagt das Modell 0,006 Aufgaben mehr voraus, bei gleicher Lernzeit: fast nichts.' },
      { match: 'Beta', atlas: 'standardisierte Steigung', explain: 'Beta misst die Steigung in Standardabweichungen beider Variablen. Mit nur einem Prädiktor wäre Beta gleich r.' },
      N_MAP,
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist die Steigung der Lernzeit je Stunde? Tippe sie an.', correct: '0.518',
      wrong: {
        Beta: 'Fast! 0.538 ist Beta, die Steigung in Standardabweichungen beider Variablen. Die Steigung je Stunde steht unter B in der Zeile lernzeit.',
        '5.822': 'Fast! Das ist der Achsenabschnitt b₀ in der Zeile (Intercept). Die Steigung steht in der Zeile lernzeit.',
        '0.006': 'Fast! Das ist die Steigung des Alters. Gefragt ist die Zeile lernzeit.',
        N: 'Fast! N ist die Zahl der Befragten. Die Steigung steht unter B in der Zeile lernzeit.',
      },
    },
  },
  next: {
    next: { id: 'explained_variance', why: r2Sentence },
    before: [
      { id: 'covariance', why: 'sₓᵧ, die gemittelte Summe der Abweichungsprodukte; sie steht im Zähler der Steigung.' },
      { id: 'variance', why: 'sₓ², die gemittelte Quadratsumme von x; sie steht im Nenner der Steigung.' },
      { id: 'linear', why: 'Die Gerade beschreibt nur gerade Muster.' },
    ],
    after: [
      { id: 'prediction', why: 'Mit Startwert und Steigung bekommt jede Person ihre Vorhersage.' },
      { id: 'residuals', why: 'Was die Gerade nicht trifft, und warum sie die Summe der Quadrate klein macht.' },
      { id: 'interaction', why: 'Wenn die Steigung von einer dritten Variable abhängt.' },
      { id: 'logistic_regression', why: 'Dieselbe Idee für Ja-Nein-Fragen, mit Wahrscheinlichkeiten.' },
    ],
    more: [
      { id: 'outliers_influence', why: 'Einzelne Personen am Rand können die Gerade kippen.' },
      { id: 'multicollinearity', why: 'Prädiktoren, die sich zu ähnlich sind, lassen sich schwer trennen.' },
      { id: 'confounding', why: 'Eine Steigung ist noch keine Wirkung.' },
    ],
  },
};

export const predictionTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b13-gerade', variant: 'prediction', variable: LZ_WT,
    think: [
      {
        question: 'Alle lösen zwei Aufgaben mehr. Was macht die Vorhersage für die gewählte Person?', options: ['bleibt gleich', 'steigt um 2 Aufgaben', 'verdoppelt sich'], correct: 1, step: 4,
        explain: 'ȳ steigt um 2, die Steigung bleibt (Schritt 2). Also steigt b₀ um 2 (Schritt 3) und mit ihm jede Vorhersage.',
        kurz: 'Die ganze Gerade rutscht um 2 Aufgaben nach oben.',
        tryIt: { label: 'alle zwei Aufgaben mehr', op: 'shift', column: 'y', value: 2 },
        expect: { change: 'plus', amount: 2 },
      },
      {
        question: 'Alle lernen doppelt so lange. Was macht die Vorhersage für die gewählte Person?', options: ['verdoppelt sich', 'bleibt gleich', 'halbiert sich'], correct: 1, step: 4,
        explain: 'Die Person lernt jetzt auch doppelt so lange. b₁ halbiert sich, b₀ bleibt (Schritt 3). Halbe Steigung mal doppelte Lernzeit ergibt dieselbe Vorhersage.',
        kurz: 'Die Vorhersage hängt nicht davon ab, in welcher Einheit du die Lernzeit misst.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'linear_regression', variant: 0,
    tokens: { linear_regression: LINEAR_REGRESSION_TOKEN, standardized: STANDARDIZED, modell: MODELL },
    outputMap: [
      { match: '9.180750', atlas: 'ŷ von P001', step: 4, explain: 'predict() zeigt die Vorhersage jeder Person. P001 lernt 6 Stunden und ist 41: 5,82 + 0,52 · 6 + 0,006 · 41 ≈ 9,19, mit allen Nachkommastellen 9,18 Aufgaben.' },
      { match: '5.822', atlas: 'b₀', step: 3, explain: 'Der Startwert des linearen Prädiktors in der Zeile (Intercept).' },
      { match: '0.518', atlas: 'b₁ der Lernzeit', step: 2, explain: 'Das Gewicht der Lernzeit: Es wird mit den Stunden einer Person malgenommen.' },
      { match: '0.006', atlas: 'b₂ des Alters', explain: 'Das Gewicht des Alters: Es wird mit den Lebensjahren einer Person malgenommen.' },
    ],
    check: {
      question: 'Welche Zahl ist die Vorhersage für die erste Person, P001? Tippe sie an.', correct: '9.180750',
      wrong: {
        '5.822': 'Fast! Das ist der Startwert b₀. Die Vorhersage für P001 steht ganz unten, unter der 1.',
        '0.518': 'Fast! Das ist das Gewicht der Lernzeit. Die Vorhersage für P001 steht ganz unten, unter der 1.',
      },
    },
  },
  next: {
    next: { id: 'residuals', why: 'Wie weit liegt die Vorhersage neben dem, was eine Person wirklich gelöst hat?' },
    before: [
      { id: 'linear_regression', why: 'Liefert Startwert b₀ und Steigung b₁.' },
      { id: 'dummy', why: 'So gehen Kategorien ohne Rangfolge in den Prädiktor ein.' },
    ],
    after: [
      { id: 'logit', why: 'In der logistischen Regression ist der lineare Prädiktor ein Logit.' },
      { id: 'interaction', why: 'Ein Produkt zweier Prädiktoren als weiteres Gewicht.' },
      { id: 'prediction_interval', why: 'Wie weit eine neue Person um ihre Vorhersage streuen kann.' },
    ],
    more: [
      { id: 'overfitting', why: 'Gute Vorhersagen für die eigenen Daten sind noch keine guten für neue Personen.' },
      { id: 'marginal_effects', why: 'Übersetzt Gewichte eines Logitmodells in Prozentpunkte.' },
    ],
  },
};

export const residualsTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b13-gerade', variant: 'residuals', variable: LZ_WT,
    think: [
      {
        question: 'Alle lösen zwei Aufgaben mehr. Was macht die Summe der quadrierten Residuen?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 5,
        explain: 'Die Gerade rutscht um 2 Aufgaben mit nach oben (Schritt 3). Jeder Abstand zur Geraden bleibt gleich (Schritt 5), also auch jedes Quadrat.',
        kurz: 'Verschieben ändert die Lage, nicht das Danebenliegen.',
        tryIt: { label: 'alle zwei Aufgaben mehr', op: 'shift', column: 'y', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Der Wissenstest wird umgepolt. Was macht die Summe der quadrierten Residuen?', options: ['wechselt das Vorzeichen', 'bleibt gleich', 'wird 0'], correct: 1, step: 6,
        explain: 'Jedes Residuum dreht sein Vorzeichen (Schritt 5). Im Quadrat ist das egal (Schritt 6), die Summe bleibt genau gleich.',
        kurz: 'Quadrate kennen kein Vorzeichen.',
        tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
      {
        question: 'Die gewählte Person lernt plötzlich 40 Stunden, ihr Wissenstest bleibt. Was macht die Summe der quadrierten Residuen?', options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 1, step: 6,
        explain: 'Bei 40 Stunden liegt sie weit unter der bisherigen Geraden. Die neue Gerade kippt etwas zu ihr hin, trifft sie aber nicht; ihr großes Residuum zählt im Quadrat.',
        kurz: 'Ein Punkt weit draußen vergrößert die Summe der Quadrate.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
    ],
  },
  r: {
    entry: 'linear_regression', variant: 0,
    tokens: { linear_regression: LINEAR_REGRESSION_TOKEN, standardized: STANDARDIZED, modell: MODELL },
    outputMap: [
      { match: '1368.215', atlas: 'Σeᵢ²', step: 6, explain: 'Sum of Squares in der Zeile Residual ist die Quadratsumme der Residuen. Mit der Lernzeit allein wären es 1.370,27.' },
      { match: '1931.875', atlas: 'Σ(yᵢ − ȳ)², ohne Gerade', explain: 'Total ist die Quadratsumme um ȳ, ganz ohne Gerade. Residual und Regression ergeben zusammen Total.' },
      { match: '2.635', atlas: 'Standardfehler der Schätzung', explain: 'Die Wurzel aus 1.368,22 / 197. Grob gesagt so viele Aufgaben liegt eine Person neben der Vorhersage.' },
      { match: '9.180750', atlas: 'ŷ von P001', step: 4, explain: 'Die Vorhersage für P001. Sie hat 12 Aufgaben gelöst, ihr Residuum ist also etwa +2,82.' },
    ],
    check: {
      question: 'Welche Zahl ist die Summe der quadrierten Residuen? Tippe sie an.', correct: '1368.215',
      wrong: {
        '1931.875': 'Fast! Das ist Total, die Quadratsumme ohne Gerade. Die Residuen stehen in der Zeile Residual.',
        '563.660': 'Fast! Das ist der Teil, den die Gerade erfasst, in der Zeile Regression. Die Residuen stehen in der Zeile Residual.',
      },
    },
  },
  next: {
    next: { id: 'explained_variance', why: r2Sentence },
    before: [
      { id: 'prediction', why: 'Die Vorhersage, von der aus jedes Residuum gemessen wird.' },
      { id: 'ss', why: 'Dieselbe Idee wie bei der Streuung: Abstände quadrieren und zusammenzählen.' },
    ],
    after: [
      { id: 'outliers_influence', why: 'Große Residuen zeigen ungewöhnliche Personen.' },
      { id: 'variance_assumption', why: 'Ob die Residuen überall gleich stark streuen.' },
      { id: 'overfitting', why: 'Kleine Residuen auf den eigenen Daten heißen nicht: gute Vorhersage für neue Personen.' },
    ],
    more: [
      { id: 'normal_distribution', why: 'Normalverteilt sein sollen die Fehler, nicht die Rohwerte.' },
      { id: 'partial_cor', why: 'Korreliert die Residuen zweier Regressionen.' },
    ],
  },
};
