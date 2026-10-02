// Begriffskarte „Schätzer & Schätzung“ (estimator). Beispiel: Lernzeit der 200 Befragten, zwei Rechenregeln
// (Mittelwert und Median) für die typische Lernzeit; unter „Genau genommen“ die Varianz mit n − 1 gegen n.
// Reiter: Mittelwert und Median aus den aktuellen Daten, Vorhersagen zu beiden Regeln.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, unit } from '../../format';
import { columnX, mean, median } from './daten';

/** Zwei Schätzer für die typische Lernzeit, angewandt auf die aktuellen Daten, und die Quadratsumme für s². */
export function schaetzungen(c: SampleCtx) {
  const x = columnX(c, 'lernzeit'), m = mean(x), ss = x.reduce((a, v) => a + (v - m) ** 2, 0);
  return { n: x.length, sum: x.reduce((a, b) => a + b, 0), mean: m, median: median(x), s2: ss / (x.length - 1), ssN: ss / x.length };
}

/** Die Ausgangsdaten (200 Befragte): feste Zahlen für die Texte der Karte, in R nachgerechnet. */
export const LERNZEIT = { n: 200, sum: 1550.3, mean: 7.7515, median: 7.6, s2: 10.48150, ssN: 10.42910 } as const;

export const estimator: ConceptCard = {
  concept: 'estimator',
  wofuer: 'Du willst wissen, wie lange Erwachsene typischerweise lernen. Die 200 Befragten des Lehrdatensatzes geben dir 200 Zahlen. Wie wird daraus eine einzige Zahl für alle?',
  kurz: 'Ein Schätzer ist eine Rechenregel, die aus den Daten eine Zahl für den unbekannten Parameter macht. Die Zahl, die dabei herauskommt, heißt Schätzung.',
  stellDirVor: {
    text: `Die Regel „alles zusammenzählen und durch die Zahl der Befragten teilen“ ergibt für die 200 Befragten ${unit(LERNZEIT.mean, 'Stunde', 'Stunden')} Lernzeit in den letzten sieben Tagen. Diese Regel ist der Schätzer, die ${num(LERNZEIT.mean)} Stunden sind die Schätzung. Eine andere Regel, der mittlere Wert der Reihe nach (Median), ergibt ${unit(LERNZEIT.median, 'Stunde', 'Stunden')}.`,
    figures: [
      { label: 'Regel Mittelwert', value: `${num(LERNZEIT.mean)} h` },
      { label: 'Regel Median', value: `${num(LERNZEIT.median)} h` },
      { label: 'Befragte', value: String(LERNZEIT.n) },
    ],
  },
  heisst: {
    sym: 'θ̂', say: 'theta Dach',
    fach: 'Ein Schätzer θ̂ = g(X₁, …, Xₙ) ist eine Funktion der Stichprobenwerte. Vor der Erhebung ist sein Ergebnis zufällig; mit den beobachteten Daten entsteht ein fester Schätzwert für den Parameter θ.',
  },
  bausteine: [
    {
      title: 'Eine Rechenregel wählen',
      was: 'Für den Mittelwert μ aller Menschen nimmst du die Regel: zusammenzählen und durch n teilen. Das Dach in θ̂ zeigt: Das ist geschätzt.',
      warum: 'Die Regel steht fest, bevor du die Daten siehst. So kann jede und jeder sie nachrechnen.',
      acht: 'Der Schätzer ist die Regel, nicht die Zahl. Beide heißen oft x̄, deshalb verwechselt man sie leicht.',
      concept: 'mean',
    },
    {
      title: 'Die Regel auf die Daten anwenden',
      was: `Mit den 200 Lernzeiten ergibt die Regel ${unit(LERNZEIT.mean, 'Stunde', 'Stunden')}. Diese Zahl ist die Schätzung, auch Schätzwert genannt.`,
      rechnung: `x̄ = ${num(LERNZEIT.sum)} / ${LERNZEIT.n} ≈ ${num(LERNZEIT.mean)} h`,
      warum: 'Mit anderen Befragten käme eine andere Zahl heraus. Vor der Erhebung ist das Ergebnis der Regel deshalb eine Zufallsgröße.',
      acht: 'Eine Schätzung ist keine Messung des Parameters. Sie kann danebenliegen, auch wenn alles richtig gerechnet ist.',
      concept: 'random_variable',
    },
    {
      title: 'Regeln vergleichen',
      was: 'Für dieselbe Zielgröße gibt es oft mehrere Regeln. Gute Regeln liegen im Mittel richtig und schwanken wenig.',
      warum: 'Eine Regel, die im Mittel danebenliegt, heißt verzerrt. Eine, die stark schwankt, ist ungenau.',
      acht: 'Bei der Varianz teilst du durch n − 1 statt durch n. Mit n läge die Regel im Mittel etwas zu niedrig.',
      concept: 'sampling_bias',
    },
  ],
  ausprobieren: [
    {
      question: 'Eine Person lernt plötzlich 40 Stunden statt ihrer bisherigen Zeit. Welche Regel reagiert stärker?',
      options: ['der Mittelwert', 'der Median', 'beide gleich'], correct: 0, step: 3,
      explain: 'Der Mittelwert nimmt jede Stunde mit, also auch die 40. Der Median schaut nur, wer in der Reihe in der Mitte steht; diese Stelle rückt höchstens einen Platz weiter.',
      kurz: 'Der Median ist robuster gegen Ausreißer.',
    },
    {
      question: 'Zwei Forschende rechnen mit denselben Daten und derselben Regel. Bekommen sie dieselbe Schätzung?',
      options: ['ja', 'nein'], correct: 0, step: 2,
      explain: 'Die Regel legt das Ergebnis für gegebene Daten fest. Unterschiedlich wird es erst mit anderen Daten.',
      kurz: 'Gleiche Daten, gleiche Regel, gleiche Schätzung.',
    },
    {
      question: 'Du ziehst eine neue Stichprobe aus derselben Grundgesamtheit. Was bleibt gleich?',
      options: ['die Regel', 'die Schätzung', 'beides'], correct: 0, step: 2,
      explain: 'Die Regel „zusammenzählen und durch n teilen“ bleibt. Die Zahl, die sie ausrechnet, ändert sich mit den Daten.',
      kurz: 'Die Regel bleibt, die Schätzung schwankt.',
    },
  ],
  check: {
    question: `In einer Studie steht: „x̄ = ${num(LERNZEIT.mean)} h“. Was davon ist der Schätzer?`,
    options: [`die Zahl ${num(LERNZEIT.mean)}`, 'die Regel, mit der x̄ berechnet wird', 'die wahre mittlere Lernzeit aller Erwachsenen'],
    correct: 1,
    right: `Genau. Der Schätzer ist die Rechenregel; ${unit(LERNZEIT.mean, 'Stunde', 'Stunden')} sind ihre Schätzung für diese Daten.`,
    diagnose: {
      0: `Fast! ${num(LERNZEIT.mean)} ist die Schätzung, also das Ergebnis der Regel für diese Daten.`,
      2: 'Fast! Das ist der Parameter μ, den die Regel schätzen soll.',
    },
  },
  fuerDich: 'Wenn du in R einen Mittelwert ausrechnest, wendest du einen Schätzer an. Die Zahl in der Ausgabe ist eine Schätzung: Mit anderen Befragten sähe sie etwas anders aus.',
  genau: {
    kurz: 'Vor der Erhebung ist ein Schätzer eine Zufallsvariable, danach liefert er einen festen Schätzwert. Gute Schätzer sind erwartungstreu und schwanken wenig.',
    paragraphs: [
      'Große Buchstaben (X₁, …, Xₙ, X̄) betonen die Zufälligkeit vor der Ziehung; x̄ bezeichnet das aus den beobachteten Werten berechnete Mittel.',
      `Erwartungstreu heißt: Über alle möglichen Stichproben gemittelt trifft der Schätzer den Parameter genau. s² mit n − 1 ist erwartungstreu für σ²; die Quadratsumme geteilt durch n wäre im Mittel zu klein. Für die 200 Lernzeiten ergibt sie ${num(LERNZEIT.ssN)} statt ${num(LERNZEIT.s2)} h².`,
      'Verschiedene Regeln können denselben Parameter schätzen. Bei einer symmetrischen Verteilung schätzen Mittelwert und Median dieselbe Mitte; der Mittelwert schwankt dann meist weniger, der Median ist robuster gegen Ausreißer.',
      'Wie genau eine Regel ist, hängt auch von der Verteilung und vom Erhebungsdesign ab. Bei gewichteten oder geklumpten Stichproben braucht es angepasste Schätzer.',
    ],
  },
};

export const estimatorTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Zwei Rechenregeln für dieselben 200 Lernzeiten: Mittelwert und Median. Jede Regel liefert ihre eigene Schätzung.',
    value: c => schaetzungen(c).mean,
    result: c => {
      const e = schaetzungen(c);
      return {
        kurz: `Die Regel „zusammenzählen und durch ${e.n} teilen“ ergibt ${unit(e.mean, 'Stunde', 'Stunden')}. Die Regel „mittlerer Wert der Reihe nach“ ergibt ${unit(e.median, 'Stunde', 'Stunden')}. Beide schätzen, wie lange Menschen typischerweise lernen.`,
        fachlich: `Schätzer x̄ = Σxᵢ / n mit dem Schätzwert ${num(e.mean)} h; Schätzer Median mit dem Schätzwert ${num(e.median)} h.`,
        zusatz: `Für die Streuung gibt es ebenfalls zwei Regeln: s² mit n − 1 ergibt ${num(e.s2)} h², die Quadratsumme durch n ${num(e.ssN)} h².`,
      };
    },
    voraussetzung: 'Mittelwert und Median schätzen dieselbe Zielgröße nur, wenn die Lernzeiten in der Grundgesamtheit symmetrisch verteilt sind.',
    think: [
      {
        question: 'Eine Person lernt plötzlich 40 Stunden. Was macht die Schätzung nach der Regel Mittelwert?',
        options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Der Mittelwert zählt alle Stunden zusammen. Die 40 Stunden ziehen ihn nach oben, ganz gleich, welche Person es ist.',
        kurz: 'Der Mittelwert nimmt jeden Wert mit.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        expect: { change: 'up' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was macht die Schätzung nach der Regel Median?',
        options: ['steigt um 1 Stunde', 'bleibt gleich', 'verdoppelt sich'], correct: 0,
        explain: 'Die Reihenfolge bleibt, alle rücken um eine Stunde. Also rückt auch der mittlere Wert der Reihe nach um eine Stunde.',
        kurz: 'Beide Regeln wandern mit den Daten.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1, measure: c => schaetzungen(c).median },
      },
    ],
  },
  next: {
    next: { id: 'sampling_distribution', why: 'Dieselbe Regel ergibt bei jeder neuen Stichprobe eine andere Schätzung. Die Verteilung dieser Schätzungen zeigt, wie genau die Regel ist.' },
    before: [
      { id: 'population_parameter', why: 'Legt fest, welche Zielgröße die Regel schätzen soll.' },
      { id: 'mean', why: 'Der Mittelwert ist die bekannteste Schätzregel.' },
    ],
    after: [
      { id: 'sampling_bias', why: 'Wenn eine Regel im Mittel danebenliegt.' },
      { id: 'law_large_numbers', why: 'Mit mehr Befragten landet der Mittelwert immer verlässlicher beim Parameter.' },
    ],
    more: [
      { id: 'median', why: 'Eine zweite Regel für die Mitte, robust gegen Ausreißer.' },
      { id: 'variance', why: 'Warum die Regel für die Streuung durch n − 1 teilt.' },
    ],
  },
};
