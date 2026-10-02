// Begriffskarte „Komponenten & Faktoren“ (factor_model): Hauptkomponenten gegen ein gemeinsames Faktorenmodell, am
// Beispiel der fünf Fragen zur Methoden-Zuversicht. Zahlen aus R: b14-faktoren.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { fixed, num, pct } from '../../format';
import { methodenR, mlOneFactor, pca, pct1, SPALTEN } from './rechnen';
import { METHODEN_PCA, NO_PCA } from './efa';
import { EXTRACTION, ML, N_FACTORS, NONE, ROTATION } from './r-zeichen';

/** Ein gemeinsamer Faktor mit ML für die fünf Fragen (R: efa(…, extraction = "ml", n_factors = 1)). */
export const METHODEN_ML = {
  loadings: [0.8126905, 0.7954346, 0.7761573, 0.8202676, 0.7954613],
  communalities: [0.6604671, 0.6327186, 0.6024152, 0.6728405, 0.6327587],
  /** Summe der quadrierten Ladungen und ihr Anteil an 5 (R: Extraction Sums 3.201, 64.024 %). */
  ss: 3.2011999, share: 0.64024,
} as const;
const P = METHODEN_PCA, F = METHODEN_ML;
const h1 = P.loadings[0] ** 2;

/** Spanne „0,6 bis 0,67“ einer Liste. */
const span = (xs: readonly number[]) => `${num(Math.min(...xs))} bis ${num(Math.max(...xs))}`;

export const factorModel: ConceptCard = {
  concept: 'factor_model',
  wofuer: 'Zwei Wege führen von vielen Fragen zu wenigen Größen: Hauptkomponenten und gemeinsame Faktoren. Sie klingen ähnlich, rechnen aber mit verschiedenen Annahmen. Welcher passt, hängt davon ab, was du wissen willst.',
  kurz: 'Hauptkomponenten fassen die gesamte Streuung der Fragen zusammen, auch ihre Messfehler. Gemeinsame Faktoren erklären nur, was die Fragen teilen, und lassen jeder Frage einen eigenen Rest.',
  stellDirVor: {
    text: `Dieselben fünf Fragen zur Methoden-Zuversicht, dieselben 200 Befragten, zwei Modelle in R. Die erste Hauptkomponente bündelt ${pct1(P.eigen[0] / 5)} der Streuung. Ein gemeinsamer Faktor, geschätzt mit Maximum Likelihood, erklärt ${pct1(F.share)}. Bei Frage 1 sind es ${pct(h1, 0)} gegen ${pct(F.communalities[0], 0)}: Den Rest von ${pct(1 - F.communalities[0], 0)} rechnet das Faktorenmodell der Frage selbst zu, samt Messfehler.`,
    figures: [
      { label: 'Hauptkomponente', value: pct1(P.eigen[0] / 5) },
      { label: 'gemeinsamer Faktor', value: pct1(F.share) },
      { label: 'Frage 1, Komponente', value: pct(h1, 0) },
      { label: 'Frage 1, Faktor', value: pct(F.communalities[0], 0) },
    ],
  },
  heisst: {
    sym: 'R ≈ ΛΛ′ + Ψ', say: 'R ungefähr Lambda mal Lambda Strich plus Psi',
    fach: 'Die Hauptkomponentenanalyse zerlegt die Korrelationsmatrix exakt: R = VDV′. Das gemeinsame Faktorenmodell nimmt Z = ΛF + ε an und beschreibt R durch die Ladungen Λ und die Einzigartigkeiten Ψ auf der Diagonale: R ≈ ΛΛ′ + Ψ.',
  },
  bausteine: [
    {
      title: 'Alles zusammenfassen: Hauptkomponenten',
      was: 'Die Hauptkomponentenanalyse sucht die Richtung, in der die fünf Fragen zusammen am stärksten streuen. Sie nimmt dafür die ganze Streuung jeder Frage.',
      rechnung: `Erste Komponente: ${num(P.eigen[0])} von 5, also ${pct1(P.eigen[0] / 5)}.`,
      warum: 'So geht beim Verdichten möglichst wenig verloren. Das ist praktisch, wenn aus vielen Fragen wenige Zahlen werden sollen.',
      acht: 'Eine Komponente ist eine gewichtete Summe der Fragen, kein Merkmal hinter den Antworten. Messfehler stecken mit drin.',
      concept: 'eigenvalues',
    },
    {
      title: 'Nur das Gemeinsame erklären: Faktoren',
      was: 'Das Faktorenmodell nimmt an: Hinter allen Fragen steht ein gemeinsamer Faktor, dazu hat jede Frage einen eigenen Rest. Erklärt wird nur, was die Fragen teilen.',
      rechnung: `Gemeinsamer Faktor (ML): ${fixed(F.ss)} von 5, also ${pct1(F.share)}.`,
      warum: 'So trennt das Modell das Gemeinsame vom Eigenen jeder Frage. Das passt, wenn du ein Merkmal hinter den Antworten vermutest.',
      acht: 'Der eigene Rest ist nicht nur Messfehler. Er enthält auch, was nur diese eine Frage misst, etwa durch ihre besondere Formulierung.',
      concept: 'communality',
    },
    {
      title: 'Die beiden Ergebnisse vergleichen',
      was: `Die Komponente erfasst in der Regel mehr als der Faktor, hier ${pct1(P.eigen[0] / 5)} gegen ${pct1(F.share)}. Die Ladungen sind entsprechend etwas größer.`,
      rechnung: `Ladungen der Komponente ${span(P.loadings)}, des Faktors ${span(F.loadings)}.`,
      warum: 'Die Komponente rechnet auch die eigenen Reste der Fragen mit ein. Der Faktor lässt sie weg.',
      acht: 'Ein größerer Anteil heißt nicht, dass die Hauptkomponenten besser sind. Die beiden Modelle beantworten verschiedene Fragen.',
      concept: 'efa',
    },
  ],
  ausprobieren: [
    {
      question: 'Angenommen, die Fragen hätten keine Messfehler und keine Besonderheiten. Wie lägen Komponente und Faktor dann zueinander?',
      options: ['fast gleich', 'weit auseinander'], correct: 0, step: 3,
      explain: 'Ohne eigene Reste gibt es nichts, was die Komponente zusätzlich einrechnen könnte. Je kleiner die Einzigartigkeiten, desto näher liegen beide Lösungen.',
      kurz: 'Der Unterschied ist der eigene Rest der Fragen.',
    },
    {
      question: 'Du willst aus fünf Fragen eine Zahl je Person bilden, ohne ein Merkmal dahinter anzunehmen. Was passt?',
      options: ['Hauptkomponenten', 'gemeinsame Faktoren'], correct: 0, step: 1,
      explain: 'Die Hauptkomponentenanalyse verdichtet Daten ohne Annahme über ein Merkmal dahinter. Willst du ein solches Merkmal schätzen, passt das Faktorenmodell.',
      kurz: 'Verdichten oder ein Merkmal schätzen: Das entscheidet über das Modell.',
    },
  ],
  check: {
    question: 'Was erklärt ein gemeinsamer Faktor?',
    options: [
      'Nur den Teil der Streuung, den die Fragen miteinander teilen.',
      'Die gesamte Streuung aller Fragen, samt Messfehlern.',
      'Nur die Messfehler.',
      'Den Mittelwert der Fragen.',
    ],
    correct: 0,
    right: 'Genau. Der Faktor erklärt das Gemeinsame; der eigene Rest jeder Frage bleibt draußen.',
    diagnose: {
      1: 'Fast! Das macht die Hauptkomponentenanalyse. Der Faktor lässt jeder Frage einen eigenen Rest.',
      2: 'Noch nicht ganz. Die Messfehler stecken im eigenen Rest, nicht im Faktor.',
      3: 'Noch nicht ganz. Faktoren beschreiben Zusammenhänge zwischen Fragen, nicht die Lage der Antworten.',
    },
  },
  fuerDich: 'Steht in einer Studie „Faktorenanalyse“, ist manchmal eine Hauptkomponentenanalyse gemeint. Achte darauf, welches Modell gerechnet wurde: Davon hängen Ladungen, Kommunalitäten und erklärte Anteile ab.',
  genau: {
    kurz: 'Die Hauptkomponentenanalyse zerlegt die Korrelationsmatrix exakt, das Faktorenmodell nähert sie mit wenigen Faktoren und Einzigartigkeiten an. Darum unterscheiden sich Ladungen und erklärte Anteile.',
    paragraphs: [
      'Hauptkomponenten: R = VDV′ mit den Eigenvektoren V und den Eigenwerten D. Die Ladungen einer Komponente sind ihr Eigenvektor mal die Wurzel aus ihrem Eigenwert. Behält man alle Komponenten, ist alles erklärt; behält man wenige, bleibt ein Rest.',
      `Faktorenmodell: Die standardisierten Antworten Z sind ΛF + ε, Faktoren F und Reste ε sind unkorreliert. Dann gilt R ≈ ΛΛ′ + Ψ. Die Einzigartigkeit ψ einer Frage ist 1 minus ihre Kommunalität, für Frage 1 also 1 − ${num(F.communalities[0])} = ${num(1 - F.communalities[0])}.`,
      'Die Schätzung mit Maximum Likelihood setzt annähernd normalverteilte Antworten voraus und liefert einen Test der Modellpassung. Mit fünf Fragen lassen sich höchstens zwei ML-Faktoren schätzen; verlangst du mehr, bricht mariposa mit einer Meldung ab.',
      'Die Anteile der beiden Modelle liegen in der Regel so wie hier: Die Komponente erfasst mehr, weil sie auch die eigenen Reste einrechnet. Bei sehr zuverlässigen Fragen mit kleinen Resten rücken beide zusammen.',
    ],
  },
};

/** PCA und ML-Faktor der fünf Fragen in den aktuellen Daten; null, wenn eine Frage nicht streut. */
export function beideModelle(c: SampleCtx) {
  const R = methodenR(c);
  if (!R) return null;
  const ml = mlOneFactor(R);
  return ml ? { p: pca(R, 1), ml } : null;
}

export const factorModelTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...SPALTEN },
    kurz: 'Beide Modelle mit allen 200 Befragten: eine Hauptkomponente und ein gemeinsamer Faktor aus den fünf Fragen zur Methoden-Zuversicht.',
    value: c => beideModelle(c)?.ml.share ?? null,
    result: c => {
      const b = beideModelle(c);
      if (!b) return NO_PCA;
      const { p, ml } = b, hp = p.communalities;
      return {
        kurz: `Die erste Hauptkomponente bündelt ${pct1(p.share[0])} der Streuung, der gemeinsame Faktor erklärt ${pct1(ml.share)}. Den Rest rechnet das Faktorenmodell den einzelnen Fragen zu, samt Messfehler.`,
        fachlich: `Hauptkomponente: erster Eigenwert ${num(p.values[0])}, Kommunalitäten ${span(hp)}. Faktor (ML): Summe der quadrierten Ladungen ${fixed(ml.share * 5)}, Kommunalitäten ${span(ml.communalities)}, Einzigartigkeiten ${span(ml.uniqueness)}.`,
        zusatz: `Bei Frage 1 erfasst die Komponente ${pct(hp[0], 0)} der Streuung, der Faktor ${pct(ml.communalities[0], 0)}; ihr eigener Rest im Faktorenmodell ist ${num(ml.uniqueness[0])}.`,
      };
    },
    voraussetzung: 'Die ML-Schätzung setzt annähernd normalverteilte Antworten voraus, die Hauptkomponenten nicht. Beide brauchen Fragen, die streuen.',
    think: [
      {
        question: 'Frage 1 wird umgepolt, aus 7 wird 1. Was passiert mit dem Anteil, den der gemeinsame Faktor erklärt?',
        options: ['bleibt gleich', 'sinkt', 'steigt'], correct: 0,
        explain: 'Umpolen dreht nur das Vorzeichen der Korrelationen von Frage 1. Ihre Ladung wird negativ, ihr Quadrat und damit der erklärte Anteil bleiben gleich.',
        kurz: 'Auch im Faktorenmodell zählt das Vorzeichen einer Frage nicht für den Anteil.',
        tryIt: { label: 'Frage 1 umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Frage 2 wird umgepolt. Was passiert mit ihrem eigenen Rest im Faktorenmodell?',
        options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Der eigene Rest ist 1 minus die Kommunalität, und die hängt am Quadrat der Ladung. Das Vorzeichen fällt dabei weg.',
        kurz: 'Was eine Frage allein hat, hängt nicht an ihrer Polung.',
        tryIt: { label: 'Frage 2 umpolen', op: 'reverse', column: 'y' },
        expect: { change: 'same', measure: c => beideModelle(c)?.ml.uniqueness[1] ?? null },
      },
    ],
  },
  r: {
    entry: 'efa', variant: 1,
    tokens: { extraction: EXTRACTION, '"ml"': ML, n_factors: N_FACTORS, rotation: ROTATION, '"none"': NONE },
    outputMap: [
      { match: '64.0%', atlas: 'vom Faktor erklärter Anteil', step: 2, explain: 'Die Summe der quadrierten Ladungen, 3,20, geteilt durch 5. Mit einer Hauptkomponente wären es 71,2 %.' },
      { match: '1 factor', atlas: 'ein gemeinsamer Faktor', step: 2, explain: 'factor statt component: Hier rechnet R das Faktorenmodell, keine Hauptkomponenten.' },
      { match: 'ML/Unrotated', atlas: 'Maximum Likelihood, nicht gedreht', explain: 'ML ist die Schätzmethode. Mit nur einem Faktor gibt es nichts zu drehen.' },
      { match: 'KMO', atlas: 'KMO-Wert', explain: 'Derselbe Wert wie bei den Hauptkomponenten: Er hängt nur an den Korrelationen, nicht am Modell.' },
    ],
    check: {
      question: 'Woran erkennst du, dass hier gemeinsame Faktoren gerechnet wurden und keine Hauptkomponenten? Tippe es an.', correct: '1 factor',
      wrong: {
        '64.0%': 'Fast! Das ist der erklärte Anteil. Das Modell erkennst du an factor statt component.',
        KMO: 'Fast! Der KMO-Wert ist bei beiden Modellen gleich. Das Modell erkennst du an factor statt component.',
      },
    },
  },
  next: {
    next: { id: 'communality', why: 'Wie viel der Streuung einer Frage ein Modell erfasst; im Faktorenmodell ist der Rest die Einzigartigkeit.' },
    before: [
      { id: 'correlation_matrix', why: 'Beide Modelle gehen von den Korrelationen der Fragen aus.' },
      { id: 'eigenvalues', why: 'Die Hauptkomponenten kommen aus den Eigenwerten der Korrelationsmatrix.' },
    ],
    after: [
      { id: 'efa', why: 'Die Rechnung in R, mit extraction = "pca" oder "ml".' },
      { id: 'reliability', why: 'Omega nutzt ein Modell mit einem gemeinsamen Faktor.' },
    ],
    more: [{ id: 'measurement_error', why: 'Der eigene Rest einer Frage enthält ihren Messfehler.' }],
  },
};
