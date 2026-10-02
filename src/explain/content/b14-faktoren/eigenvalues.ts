// Begriffskarte „Eigenwerte“: wie viel der gesamten Streuung eine Komponente bündelt, am Beispiel der fünf Fragen zur
// Methoden-Zuversicht; der Regler zeigt fünf Fragen mit gleicher Korrelation r (erster Eigenwert 1 + 4r, sonst 1 − r).
// Zahlen aus R: b14-faktoren.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { aboveOne, methodenPca, pct1, SPALTEN } from './rechnen';
import { METHODEN_PCA, NO_PCA } from './efa';
import { PCA_TOKENS } from './r-zeichen';

const E = METHODEN_PCA.eigen;
/** Eigenwerte von fünf Fragen, die paarweise alle mit r korrelieren. */
export const equalCorrelation = (r: number) => [1 + 4 * r, 1 - r, 1 - r, 1 - r, 1 - r];

export const eigenvalues: ConceptCard = {
  concept: 'eigenvalues',
  picture: 'b14-eigen',
  wofuer: 'Fünf Fragen bringen zusammen eine Streuung von 5 mit, eine je Frage. Wie viel davon lässt sich in einer einzigen Komponente bündeln? Der Eigenwert gibt die Antwort, für jede Komponente einzeln.',
  kurz: 'Ein Eigenwert sagt dir, wie viel der gesamten Streuung eine Komponente bündelt, gemessen in Fragen. Ein Eigenwert von 3,56 heißt: so viel wie dreieinhalb Fragen.',
  stellDirVor: {
    text: `Bei den fünf Fragen zur Methoden-Zuversicht im Lehrdatensatz ist der erste Eigenwert ${num(E[0])}. Die übrigen vier sind klein: ${E.slice(1).map(v => num(v)).join('; ')}. Mit allen Nachkommastellen ergeben alle fünf zusammen genau 5. Die erste Komponente bündelt also ${num(E[0])} / 5 ≈ ${pct1(E[0] / 5)} der Streuung.`,
    figures: [
      { label: 'erster Eigenwert', value: num(E[0]) },
      { label: 'zweiter Eigenwert', value: num(E[1]) },
      { label: 'alle fünf zusammen', value: '5' },
      { label: 'Anteil der ersten', value: pct1(E[0] / 5) },
    ],
  },
  heisst: {
    sym: 'dₖ', say: 'd k',
    fach: 'Der Eigenwert dₖ ist die Varianz der k-ten Hauptkomponente der Korrelationsmatrix R; alle Eigenwerte zusammen ergeben die Zahl der Variablen. Die Gleichung R · vₖ = dₖ · vₖ steht unter „Genau genommen“.',
  },
  bausteine: [
    {
      title: 'Die gesamte Streuung zählen',
      was: 'Wir rechnen mit standardisierten Fragen: Jede hat die Varianz 1. Fünf Fragen bringen zusammen also eine Streuung von 5 mit.',
      warum: 'So lassen sich Fragen mit verschiedenen Skalen vergleichen. Und jeder Eigenwert lässt sich in „Fragen“ lesen.',
      acht: 'Die 5 ist keine Antwortstufe, sondern die Zahl der Fragen. Mit zehn Fragen wäre die gesamte Streuung 10.',
      concept: 'z',
    },
    {
      title: 'Die stärkste Richtung suchen',
      was: 'Die erste Komponente ist die gewichtete Summe der Fragen mit der größten Varianz, bei Gewichten, deren Quadrate zusammen 1 ergeben. Diese Varianz ist der erste Eigenwert.',
      rechnung: `d₁ = ${num(E[0])}, also ${num(E[0])} / 5 ≈ ${pct1(E[0] / 5)} der Streuung.`,
      warum: 'Hängen die Fragen eng zusammen, gehen sie gemeinsam nach oben und unten. Dann erfasst eine Richtung fast alles.',
      acht: 'Der Eigenwert ist kein Prozentwert. Erst geteilt durch die Zahl der Fragen wird daraus ein Anteil.',
      concept: 'factor_model',
    },
    {
      title: 'Den Rest verteilen',
      was: 'Jede weitere Komponente sucht die stärkste Richtung im Rest. Ihre Eigenwerte werden immer kleiner, und alle zusammen ergeben 5.',
      rechnung: `d₂ = ${num(E[1])}, d₃ = ${num(E[2])}, d₄ = ${num(E[3])}, d₅ = ${num(E[4])}; mit allen Nachkommastellen zusammen mit d₁ genau 5.`,
      warum: 'So wird die ganze Streuung ohne Doppelungen aufgeteilt, denn die Komponenten sind unkorreliert.',
      acht: 'Kleine Eigenwerte heißen nicht, dass die Fragen schlecht sind. Sie zeigen, dass nach der ersten Komponente wenig Gemeinsames übrig ist.',
      concept: 'dimensionality',
    },
  ],
  ausprobieren: [
    {
      question: 'Alle fünf Fragen hängen perfekt zusammen, r = 1. Wie groß wird der erste Eigenwert?',
      options: ['1', '5', '2,5'], correct: 1, step: 2,
      explain: '1 + 4 · 1 = 5. Die erste Komponente bündelt dann die ganze Streuung, für die übrigen bleibt 0. Schieb den Regler nach rechts: Der erste Eigenwert nähert sich 5.',
      kurz: 'Perfekter Zusammenhang: eine Komponente nimmt alles.',
    },
    {
      question: 'Die Fragen hängen gar nicht zusammen, r = 0. Wie viele Eigenwerte liegen über 1?',
      options: ['keiner', 'einer', 'alle fünf'], correct: 0, step: 3,
      explain: 'Dann ist jeder Eigenwert genau 1, keiner liegt darüber. Es gibt nichts Gemeinsames zu bündeln.',
      kurz: 'Ohne Zusammenhang bündelt keine Komponente mehr als eine Frage.',
    },
    {
      question: 'Kann bei fünf Fragen ein Eigenwert größer als 5 werden?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Nein. Alle fünf Eigenwerte sind nicht negativ und ergeben zusammen 5. Keine Komponente kann mehr als die ganze Streuung bündeln.',
      kurz: 'Die Summe der Eigenwerte ist die Zahl der Fragen.',
    },
  ],
  regler: {
    label: 'Wie eng hängen fünf Fragen zusammen? Korrelation jedes Paars',
    min: 0, max: 0.95, step: 0.01, initial: 0.64,
    format: v => `r = ${num(v)}`,
    describe: v => `Korrelieren alle Paare mit r = ${num(v)}, ist der erste Eigenwert 1 + 4 · ${num(v)} = ${num(1 + 4 * v)}. Die erste Komponente bündelt ${pct1((1 + 4 * v) / 5)}, die anderen vier je ${num(1 - v)}.`,
  },
  check: {
    question: 'Bei zehn Fragen hat eine Komponente den Eigenwert 2,5. Was heißt das?',
    options: [
      'Sie bündelt 25 % der gesamten Streuung.',
      'Sie bündelt 2,5 % der gesamten Streuung.',
      'Sie bündelt 50 % der gesamten Streuung.',
      'Zweieinhalb Fragen sind überflüssig.',
    ],
    correct: 0,
    right: 'Genau. 2,5 von 10: Die Komponente bündelt so viel wie zweieinhalb Fragen, also 25 %.',
    diagnose: {
      1: 'Fast! Der Eigenwert ist kein Prozentwert. Teile durch die Zahl der Fragen: 2,5 / 10 = 25 %.',
      2: 'Fast! Du hast durch 5 geteilt. Bei zehn Fragen ist die gesamte Streuung 10.',
      3: 'Noch nicht ganz. Der Eigenwert sagt, wie viel eine Komponente bündelt, nicht, welche Fragen man streichen kann.',
    },
  },
  fuerDich: 'In R steht der Anteil der ersten Komponente hinter „Variance explained“. Mal die Zahl der Fragen ergibt den Eigenwert: 0,712 · 5 ≈ 3,56. Den ganzen Verlauf zeigt summary() in der Tabelle „Total Variance Explained“.',
  genau: {
    kurz: 'Eigenwerte gehören zur Zerlegung der Korrelationsmatrix. Als erklärte Anteile gelten sie nur für die Hauptkomponentenanalyse.',
    paragraphs: [
      'Formal gilt R · vₖ = dₖ · vₖ: Die Korrelationsmatrix R mal den Eigenvektor vₖ ergibt dasselbe wie dₖ mal vₖ. Der Eigenvektor vₖ (Länge 1, seine Quadrate ergeben zusammen 1) enthält die Gewichte der Fragen, der Eigenwert dₖ die Varianz der Komponente. Die Ladungen sind vₖ mal √dₖ.',
      'Für ein gemeinsames Faktorenmodell sind die Eigenwerte der ursprünglichen Korrelationsmatrix nicht die erklärten Varianzen. Dort erklärt der Faktor bei den fünf Fragen 64,0 % statt 71,2 %.',
      'Haben alle Paare dieselbe Korrelation r, ist der erste Eigenwert 1 + (k − 1) · r und alle anderen 1 − r. Das nutzt der Regler. In echten Daten sind die Korrelationen nie ganz gleich; bei den fünf Fragen liegen sie zwischen 0,61 und 0,68, im Mittel bei 0,64, und 1 + 4 · 0,64 = 3,56 trifft den echten ersten Eigenwert fast genau.',
      'Die Regel „Eigenwert über 1“ ist eine Faustregel, keine automatische Bestimmung der Dimensionen. Negative Eigenwerte kann eine echte Korrelationsmatrix nicht haben; tauchen sie auf, etwa nach paarweisem Ausschluss fehlender Werte, ist die Matrix in sich widersprüchlich.',
    ],
  },
};

const pcaOf = (c: SampleCtx) => methodenPca(c, 1);

export const eigenvaluesTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { ...SPALTEN },
    kurz: 'Die Eigenwerte der fünf Fragen zur Methoden-Zuversicht, mit allen 200 Befragten.',
    value: c => pcaOf(c)?.values[0] ?? null,
    result: c => {
      const p = pcaOf(c);
      if (!p) return NO_PCA;
      const rest = p.values.slice(1), n = aboveOne(p.values);
      return {
        kurz: `Der erste Eigenwert ist ${num(p.values[0])}: Die erste Komponente bündelt ${pct1(p.share[0])} der Unterschiede zwischen den Befragten in allen fünf Fragen. ${p.loadings.every(r => r[0] >= 0.5) ? 'Wer bei einer Frage viel Zuversicht zeigt, zeigt sie meist auch bei den anderen. ' : ''}Die übrigen vier Eigenwerte liegen zwischen ${num(Math.min(...rest))} und ${num(Math.max(...rest))}.`,
        fachlich: `Eigenwerte der Korrelationsmatrix: ${p.values.map(v => num(v)).join('; ')}. Ihre Summe ist mit allen Nachkommastellen 5, die Zahl der Fragen.`,
        zusatz: `${n === 1 ? 'Ein Eigenwert liegt' : `${n} Eigenwerte liegen`} über 1.`,
      };
    },
    voraussetzung: 'Gerechnet wird mit der Korrelationsmatrix, also mit standardisierten Fragen. Jede Frage muss streuen.',
    think: [
      {
        question: 'Frage 1 wird umgepolt, aus 7 wird 1. Was passiert mit dem ersten Eigenwert?',
        options: ['bleibt gleich', 'sinkt', 'steigt'], correct: 0,
        explain: 'Umpolen dreht nur das Vorzeichen der Korrelationen von Frage 1. Die Eigenwerte bleiben genau dieselben, nur der Eigenvektor ändert bei Frage 1 sein Vorzeichen.',
        kurz: 'Eigenwerte hängen nicht an der Polung einzelner Fragen.',
        tryIt: { label: 'Frage 1 umpolen', op: 'reverse', column: 'x' },
        expect: { change: 'same' },
      },
      {
        question: 'Die gewählte Person kreuzt bei Frage 1 die 1 an. Was ergeben danach alle fünf Eigenwerte zusammen?',
        options: ['5', '4', 'hängt von der Person ab'], correct: 0,
        explain: 'Die Eigenwerte einzeln ändern sich ein wenig, ihre Summe nicht. Sie ist immer die Zahl der Fragen, weil jede Frage die Varianz 1 mitbringt.',
        kurz: 'Die Summe der Eigenwerte ist fest.',
        tryIt: { label: 'die gewählte Person bei Frage 1 auf 1', op: 'outlier', column: 'x', value: 1 },
        expect: { change: 'equals', value: 5, measure: c => { const p = pcaOf(c); return p ? p.values.reduce((a, b) => a + b, 0) : null; } },
      },
    ],
  },
  r: {
    // Mit summary() (IB2): Die Eigenwerte stehen in der Tabelle Total Variance Explained.
    entry: 'efa', variant: 0, summary: true,
    tokens: PCA_TOKENS,
    outputMap: [
      { match: 'Total', atlas: 'd₁, der erste Eigenwert', step: 2, explain: 'Unter Initial Eigenvalues, Spalte Total, steht für die erste Komponente 3.560. So viel von der gesamten Streuung 5 bündelt sie.' },
      { match: '% Var.', atlas: 'd₁ geteilt durch 5', step: 2, explain: '3,56 / 5 ≈ 71,2 %. Diesen Anteil meldet die Kurzfassung von efa() als Variance explained.' },
      { match: '0.414', atlas: 'd₂, der zweite Eigenwert', step: 3, explain: 'Die zweite Komponente bündelt nur 0,41, weniger als eine einzelne Frage mit 1. Mit n_factors = 1 behält efa() nur die erste.' },
    ],
    check: {
      question: 'Welche Zahl ist der erste Eigenwert? Tippe sie an.', correct: 'Total',
      wrong: {
        '% Var.': 'Fast! Das ist der Anteil in Prozent: 3,56 / 5 ≈ 71,2 %. Der Eigenwert selbst steht links daneben unter Total.',
        '0.414': 'Fast! Das ist der Eigenwert der zweiten Komponente. Der erste steht eine Zeile darüber.',
      },
    },
  },
  next: {
    next: { id: 'loadings', why: 'Aus Eigenvektor und Eigenwert werden die Ladungen: wie eng jede Frage mit der Komponente zusammenhängt.' },
    before: [
      { id: 'correlation_matrix', why: 'Die Matrix, deren Eigenwerte hier gemeint sind.' },
      { id: 'z', why: 'Standardisierte Fragen bringen je die Varianz 1 mit.' },
    ],
    after: [
      { id: 'efa', why: 'Eigenwerte helfen, die Zahl der Komponenten zu wählen, entscheiden sie aber nicht allein.' },
      { id: 'dimensionality', why: 'Wie viele Eigenwerte groß sind, deutet auf die Zahl der gemeinsamen Merkmale.' },
    ],
    more: [{ id: 'factor_model', why: 'Im Faktorenmodell sind die erklärten Anteile kleiner als die Eigenwerte.' }],
  },
};
