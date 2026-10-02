// Begriffskarte „Likelihood“ (Bereich B13) mit Reitern. Beispiel: 82 von 200 Befragten mit Weiterbildung;
// Modellvergleich wie im Katalogaufruf logistic_regression. Referenzwerte aus R in b13-regression.test.ts.
import type { ConceptCard, ConceptTabs } from '../../types';
import { num, count } from '../../format';
import { MODELL } from './gerade-tabs';
import { bernoulliLL } from './fit';
import { FACTORS_TOKEN, LOGISTIC_TOKEN, WB_MODELL, wbModel } from './logistisch-kit';

/** Log-Likelihood von 82 Ja unter 200 bei der Wahrscheinlichkeit p. */
export const llWb = (p: number) => bernoulliLL(82, 200, p);
const BEST = llWb(0.41);
/** Brüche als Wort: „halb“, „ein Drittel“ … „ein Zwölftel“, darüber „ein 26stel“. */
const PARTS = ['', '', 'halb', 'ein Drittel', 'ein Viertel', 'ein Fünftel', 'ein Sechstel', 'ein Siebtel', 'ein Achtel', 'ein Neuntel', 'ein Zehntel', 'ein Elftel', 'ein Zwölftel'];
/** Wie wahrscheinlich die Daten unter p sind, verglichen mit p = 0,41 (Likelihood-Quotient), als Teil: „nur etwa ein 26stel so wahrscheinlich“. */
const ratioText = (p: number) => {
  const r = Math.exp(BEST - llWb(p)), k = Math.round(r);
  return r < 1.5 ? 'fast genauso wahrscheinlich' : r >= 1000 ? 'nicht einmal ein Tausendstel so wahrscheinlich' : `nur etwa ${k < PARTS.length ? PARTS[k] : `ein ${count(k)}stel`} so wahrscheinlich`;
};

export const likelihoodKarte: ConceptCard = {
  concept: 'likelihood',
  picture: 'b13-likelihood',
  wofuer: 'Welche Wahrscheinlichkeit passt am besten zu den Daten? Von 200 Befragten haben 82 eine Weiterbildung gemacht. Die Likelihood fragt für jede denkbare Wahrscheinlichkeit: Wie gut passen die beobachteten Antworten dazu?',
  kurz: 'Die Likelihood sagt dir, wie gut eine Annahme zu den beobachteten Daten passt. Die logistische Regression wählt die Koeffizienten, unter denen die Daten am wahrscheinlichsten sind.',
  stellDirVor: {
    text: `Angenommen, jede Person macht mit derselben Wahrscheinlichkeit p eine Weiterbildung. Wie wahrscheinlich wären dann genau die beobachteten 82 Ja und 118 Nein? Bei p = 0,41 beträgt die Log-Likelihood ${num(BEST)}, bei p = 0,9 nur ${num(llWb(0.9))}. Am größten ist sie bei 82 / 200 = 0,41.`,
    figures: [
      { label: 'Ja', value: '82' },
      { label: 'Nein', value: '118' },
      { label: 'bestes p', value: '0,41' },
      { label: '−2 · ℓ', value: num(-2 * BEST) },
    ],
  },
  heisst: {
    sym: 'ℓ', say: 'l',
    fach: 'Die Log-Likelihood ℓ ist die Summe der logarithmierten Wahrscheinlichkeiten der beobachteten Antworten unter einem Modell. Der Maximum-Likelihood-Schätzer macht sie so groß wie möglich.',
  },
  bausteine: [
    {
      title: 'Jeder Antwort ihre Wahrscheinlichkeit geben',
      was: 'Wer Ja gesagt hat, bekommt p. Wer Nein gesagt hat, bekommt 1 − p.',
      rechnung: 'Bei p = 0,41 bekommt jede der 82 Ja-Antworten 0,41, jede der 118 Nein-Antworten 0,59.',
      warum: 'Ein gutes p gibt den Antworten, die wirklich gegeben wurden, eine hohe Wahrscheinlichkeit.',
      acht: 'Die Likelihood ist keine Wahrscheinlichkeit für p. Sie sagt, wie wahrscheinlich die Daten wären, wenn p stimmte.',
      concept: 'bernoulli_distribution',
    },
    {
      title: 'Die Logarithmen zusammenzählen',
      was: 'Statt 200 kleine Zahlen malzunehmen, zählen wir ihre Logarithmen zusammen.',
      rechnung: `82 · ln(0,41) + 118 · ln(0,59) ≈ ${num(82 * Math.log(0.41))} − ${num(-118 * Math.log(0.59))} = ${num(BEST)}`,
      warum: 'Das Produkt von 200 Wahrscheinlichkeiten wäre winzig. Der Logarithmus macht daraus eine Summe, und das beste p bleibt dasselbe.',
      acht: 'Die Log-Likelihood ist nie positiv. Größer heißt hier: näher an 0.',
    },
    {
      title: 'Die beste Annahme suchen',
      was: 'Wir probieren alle p durch. Am größten ist die Log-Likelihood bei 82 / 200 = 0,41, dem Anteil in den Daten.',
      warum: 'Das ist die Maximum-Likelihood-Schätzung. Die logistische Regression macht dasselbe mit ihren Koeffizienten statt mit einem einzigen p.',
      acht: `R meldet meist −2 mal die Log-Likelihood, hier ${num(-2 * BEST)} statt ${num(BEST)}. Dort heißt kleiner besser.`,
      concept: 'logistic_regression',
    },
    {
      title: 'Zwei Modelle vergleichen',
      was: `Mit Lernzeit und Alter als Prädiktoren sinkt −2 · ℓ von ${num(WB_MODELL.nullDev)} auf ${num(WB_MODELL.dev)}. Der Rückgang ist die Prüfgröße Chi-Quadrat.`,
      rechnung: `${num(WB_MODELL.nullDev)} − ${num(WB_MODELL.dev)} = ${num(WB_MODELL.nullDev - WB_MODELL.dev)}. R meldet dazu p = .712.`,
      warum: 'Hingen Lernzeit und Alter nicht mit der Weiterbildung zusammen, käme ein so großer Rückgang in etwa 71 von 100 Stichproben vor.',
      acht: 'Vergleichen darfst du nur Modelle mit denselben Personen, bei denen das kleinere im größeren steckt.',
      concept: 'chi_square_distribution',
    },
  ],
  regler: {
    label: 'Welche Wahrscheinlichkeit p nimmst du an?', min: 0.05, max: 0.95, step: 0.01, initial: 0.41,
    format: v => `p = ${num(v)}`,
    describe: v => Math.abs(v - 0.41) < 0.005
      ? `Das ist das Maximum: Kein anderes p passt besser zu 82 Ja unter 200. Die Log-Likelihood beträgt ${num(BEST)}.`
      : `Bei p = ${num(v)} beträgt die Log-Likelihood ${num(llWb(v))}. Die beobachteten Antworten wären darunter ${ratioText(v)} wie unter p = 0,41.`,
  },
  ausprobieren: [
    {
      question: 'Schieb p auf 0,5. Passt das besser oder schlechter zu 82 Ja unter 200 als 0,41?', options: ['besser', 'schlechter', 'genauso'], correct: 1, step: 3,
      explain: `Bei 0,5 beträgt die Log-Likelihood ${num(llWb(0.5))}, bei 0,41 ${num(BEST)}. Die beobachteten Antworten wären unter 0,5 ${ratioText(0.5)} wie unter 0,41.`,
      kurz: 'Am besten passt der Anteil, den du beobachtet hast.',
    },
    {
      question: 'Statt 82 von 200 sind es 820 von 2.000. Wo liegt das Maximum?', options: ['auch bei 0,41', 'bei 0,82', 'bei 0,041'], correct: 0, step: 3,
      explain: 'Der Anteil bleibt 0,41, also auch das beste p. Die Kurve wird aber zehnmal so steil: Mit mehr Daten grenzt die Likelihood p enger ein.',
      kurz: 'Mehr Daten, gleiches Maximum, schärfere Spitze.',
    },
    {
      question: 'Kann die Log-Likelihood positiv werden?', options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'Jede Wahrscheinlichkeit liegt zwischen 0 und 1, ihr Logarithmus also bei 0 oder darunter. Die Summe ist deshalb nie positiv.',
      kurz: 'Näher an 0 heißt: Das Modell passt besser.',
    },
  ],
  check: {
    question: 'Ein Logitmodell hat −2 · ℓ = 300, ein zweites mit einem Prädiktor mehr −2 · ℓ = 290, bei denselben Personen. Welche Aussage stimmt?',
    options: [
      'Unter dem zweiten Modell sind die beobachteten Antworten wahrscheinlicher.',
      'Das erste Modell passt besser, weil 300 größer ist.',
      'Das zweite Modell stimmt mit der Wahrscheinlichkeit 290 / 300.',
      'Beide passen gleich gut.',
    ],
    correct: 0,
    right: 'Genau. Bei −2 · ℓ heißt kleiner: Die Daten sind unter dem Modell wahrscheinlicher. Der Rückgang von 10 ist die Prüfgröße für den zusätzlichen Prädiktor.',
    diagnose: {
      1: 'Fast! R meldet −2 mal die Log-Likelihood. Dort ist kleiner besser.',
      2: 'Fast! Die Likelihood ist keine Wahrscheinlichkeit dafür, dass ein Modell stimmt. Sie sagt, wie wahrscheinlich die Daten unter dem Modell sind.',
      3: 'Noch nicht ganz. Der Unterschied von 10 zeigt, dass das zweite Modell besser passt.',
    },
  },
  fuerDich: 'Wenn eine Studie Modelle über „Log-Likelihood“, „AIC“ oder „BIC“ vergleicht, steckt diese Idee dahinter: Unter welchem Modell sind die beobachteten Antworten am wahrscheinlichsten? Mehr Prädiktoren helfen dabei immer ein wenig, deshalb ziehen AIC und BIC dafür etwas ab.',
  genau: {
    kurz: 'Die Likelihood ist eine Funktion der Parameter bei festen Daten. Werte aus verschiedenen Datensätzen lassen sich nicht vergleichen.',
    paragraphs: [
      'Allgemein gilt ℓ = Σ [yᵢ · ln(pᵢ) + (1 − yᵢ) · ln(1 − pᵢ)]. In der logistischen Regression hat jede Person ihr eigenes pᵢ aus dem Modell.',
      `Der Likelihood-Quotienten-Test vergleicht ineinander geschachtelte Modelle. Ohne Zusammenhang folgt die Differenz von −2 · ℓ annähernd einer χ²-Verteilung mit so vielen Freiheitsgraden, wie Koeffizienten dazukommen; hier ${num(WB_MODELL.nullDev - WB_MODELL.dev)} bei 2 Freiheitsgraden.`,
      'Trennt ein Prädiktor Ja und Nein vollständig, wächst die Likelihood immer weiter, je größer sein Koeffizient wird. Dann gibt es keine endliche Schätzung.',
      'Pseudo-R² wie das von McFadden, 1 − ℓ mit Prädiktoren durch ℓ ohne, vergleicht Log-Likelihoods, keine Quadratsummen. R meldet hier McFadden R Square 0.003; das ist kein Anteil erklärter Varianz.',
    ],
  },
};

export const likelihoodTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit', y: 'weiterbildung' },
    kurz: 'Dieselbe Frage mit allen 200 Befragten: Sagen Lernzeit und Alter die Weiterbildung besser vorher als der Anteil allein?',
    value: c => wbModel(c)?.dev ?? null,
    result: c => {
      const m = wbModel(c);
      if (!m) return { kurz: 'Mit diesen Daten lässt sich das Logitmodell nicht schätzen.', fachlich: 'Es braucht Ja- und Nein-Antworten und Prädiktoren, die Ja und Nein nicht vollständig trennen.' };
      const how = m.chi2 < 2 ? 'Das ist kaum ein Rückgang: Lernzeit und Alter helfen fast nicht, die Antworten vorherzusagen.' : 'Lernzeit und Alter machen die beobachteten Antworten wahrscheinlicher.';
      return {
        kurz: `Ohne Prädiktoren beträgt −2 · ℓ ${num(m.nullDev)}, mit Lernzeit und Alter ${num(m.dev)}. ${how}`,
        fachlich: `Log-Likelihood mit Prädiktoren ≈ ${num(-m.dev / 2)}, ohne ≈ ${num(-m.nullDev / 2)}. Die Differenz von −2 · ℓ, ${num(m.chi2)}, ist die Prüfgröße des Likelihood-Quotienten-Tests mit 2 Freiheitsgraden.`,
        zusatz: `${m.k} von ${m.n} Befragten haben eine Weiterbildung gemacht; das beste p ohne Prädiktoren ist ${num(m.k / m.n)}.`,
      };
    },
    voraussetzung: 'Die Likelihood nimmt unabhängige Befragte an. Vergleichen lassen sich nur Modelle mit denselben Personen.',
    think: [
      {
        question: 'Die Weiterbildung wird umgepolt: Aus Ja wird Nein und aus Nein Ja. Was macht −2 · ℓ?', options: ['wechselt das Vorzeichen', 'bleibt gleich', 'verdoppelt sich'], correct: 1,
        explain: 'Das Modell dreht nur seine Vorzeichen um und sagt für jede Person 1 − p statt p voraus. Jede beobachtete Antwort behält dieselbe Wahrscheinlichkeit.',
        kurz: 'Wie Ja und Nein heißen, ändert nichts an der Passung.',
        tryIt: { label: 'Weiterbildung umpolen (Ja und Nein tauschen)', op: 'reverse', column: 'y' },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was macht −2 · ℓ?', options: ['wird kleiner', 'bleibt gleich', 'wird größer'], correct: 1,
        explain: 'Der Koeffizient der Lernzeit halbiert sich, und jede Person bekommt dasselbe p wie vorher. Also bleibt auch die Likelihood gleich.',
        kurz: 'Die Einheit eines Prädiktors ändert nichts an der Passung.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'logistic_regression', variant: 0,
    tokens: { logistic_regression: LOGISTIC_TOKEN, factors: FACTORS_TOKEN, modell: MODELL },
    outputMap: [
      { match: '270.064', atlas: '−2 · ℓ', step: 3, explain: 'Die Zeile mit Log Likelihood zeigt −2 mal die Log-Likelihood des Modells mit Lernzeit und Alter. Kleiner heißt: Die Daten passen besser.' },
      { match: '0.680', atlas: 'Rückgang von −2 · ℓ', step: 4, explain: 'Chi-square: so viel kleiner ist −2 · ℓ als ohne Prädiktoren. Hier ist der Rückgang winzig.' },
      { match: '.712', atlas: 'p-Wert des Vergleichs', step: 4, explain: 'Hingen Lernzeit und Alter nicht mit der Weiterbildung zusammen, käme ein so großer Rückgang in etwa 71 von 100 Stichproben vor.' },
    ],
    check: {
      question: 'Welche Zahl ist −2 mal die Log-Likelihood des Modells? Tippe sie an.', correct: '270.064',
      wrong: {
        '0.680': 'Fast! Das ist der Rückgang gegenüber dem Modell ohne Prädiktoren. −2 · ℓ selbst steht unter Model Summary.',
        '13.145': 'Fast! Das ist die Prüfgröße des Hosmer-Lemeshow-Tests. −2 · ℓ steht unter Model Summary.',
      },
    },
  },
  next: {
    next: { id: 'logistic_regression', why: 'Sie schätzt ihre Koeffizienten, indem sie die Likelihood so groß wie möglich macht.' },
    before: [
      { id: 'bernoulli_distribution', why: 'Ja oder Nein mit der Wahrscheinlichkeit p: daraus wird die Likelihood jeder Antwort.' },
      { id: 'probability', why: 'Die Wahrscheinlichkeiten, die zusammengezählt werden, nachdem man sie logarithmiert hat.' },
    ],
    after: [
      { id: 'chi_square_distribution', why: 'So ist der Rückgang von −2 · ℓ verteilt, wenn es keinen Zusammenhang gibt.' },
      { id: 'estimator', why: 'Maximum Likelihood ist ein Weg, Schätzer zu finden.' },
    ],
    more: [{ id: 'explained_variance', why: 'Pseudo-R² sieht ähnlich aus, ist aber kein Anteil erklärter Varianz.' }],
  },
};
