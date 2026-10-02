// Begriffskarte „Diskret & stetig“. Beispiel: Haushaltsgröße (fünf Werte, 1 bis 5) gegenüber Schlafdauer (jeder Wert
// zwischen 5,1 und 9,5 Stunden denkbar). Zahlen in R nachgerechnet, siehe b06-wahrscheinlichkeit.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num, pct } from '../../format';
import { HAUSHALT, SCHLAF, column, schlafModell } from './gemeinsam';

const H = HAUSHALT, S = SCHLAF;
const p = (k: number) => H.count[k - 1] / H.n;
const P78 = schlafModell.F(8) - schlafModell.F(7);
/** Höhe der Dichte bei 7 Stunden, wie angezeigt gerundet (0,48). */
const F7_SHOWN = Math.round(schlafModell.f(7) * 100) / 100;

/** Zahl verschiedener Werte in beiden Spalten der Auswertung. */
function distinct(c: SampleCtx) {
  const h = column(c, 'x', 'haushaltsgroesse'), s = column(c, 'y', 'schlafdauer');
  return { n: h.length, h: new Set(h).size, s: new Set(s).size, hMin: Math.min(...h), hMax: Math.max(...h), sMin: Math.min(...s), sMax: Math.max(...s) };
}

export const discreteContinuous: ConceptCard = {
  concept: 'discrete_continuous',
  wofuer: 'Wie viele Personen leben in deinem Haushalt? Darauf gibt es nur ganze Zahlen. Wie lange hast du pro Nacht geschlafen? Hier ist auch jeder Wert dazwischen möglich. Mit Wahrscheinlichkeiten rechnet man bei beiden Arten unterschiedlich.',
  kurz: 'Diskrete Variablen haben einzelne, abzählbare Werte wie 1, 2, 3; stetige können jeden Wert in einem Bereich annehmen. Diskret rechnest du mit einzelnen Werten, stetig mit Bereichen.',
  stellDirVor: {
    text: `Im Lehrdatensatz leben ${H.count[0]} der ${H.n} Befragten allein, ${H.count[1]} zu zweit, ${H.count[2]} zu dritt, ${H.count[3]} zu viert und ${H.count[4]} zu fünft. Weitere Werte kommen nicht vor. Die Schlafdauer dagegen reicht von ${num(S.min)} bis ${num(S.max)} Stunden, und dazwischen ist jeder Wert denkbar, etwa 7,23 oder 7,231 Stunden.`,
    figures: [
      { label: 'Haushaltsgröße', value: '5 Werte, 1 bis 5' },
      { label: 'P(genau 2 Personen)', value: pct(p(2)) },
      { label: 'Schlafdauer', value: `${num(S.min)} bis ${num(S.max)} h` },
      { label: 'P(7 bis 8 h) im Modell', value: pct(P78) },
    ],
  },
  heisst: {
    fach: 'Eine diskrete Zufallsvariable hat endlich oder abzählbar viele mögliche Werte, jeder mit eigener Wahrscheinlichkeit. Eine stetige verteilt ihre Wahrscheinlichkeit über Wertebereiche, beschrieben durch eine Dichte.',
  },
  bausteine: [
    {
      title: 'Die möglichen Werte zählen',
      was: 'Kannst du die möglichen Werte aufzählen, 1, 2, 3 und so weiter, ist die Variable diskret. Liegt zwischen zwei Werten immer noch einer, ist sie stetig.',
      warum: 'Davon hängt ab, ob du Wahrscheinlichkeiten einzelner Werte addierst oder Flächen unter einer Kurve bestimmst.',
      acht: 'Diskret heißt nicht nominal. Die Haushaltsgröße ist diskret und trotzdem metrisch: 4 Personen sind doppelt so viele wie 2.',
      concept: 'metric',
    },
    {
      title: 'Diskret: einzelne Werte',
      was: `Jeder mögliche Wert bekommt eine eigene Wahrscheinlichkeit. P(Haushalt mit genau 2 Personen) = ${H.count[1]} / ${H.n} = ${pct(p(2))}.`,
      rechnung: `P(X = 2) = ${pct(p(2))}; P(X ≤ 2) = ${pct(p(1))} + ${pct(p(2))} = ${pct(p(1) + p(2))}`,
      warum: 'Bei abzählbar vielen Werten kann jeder einzelne einen echten Teil der Wahrscheinlichkeit tragen.',
      acht: `Bei diskreten Variablen zählt die Grenze: P(X ≤ 2) schließt die 2 ein, P(X < 2) nicht. Hier sind das ${pct(p(1) + p(2))} gegenüber ${pct(p(1))}.`,
      concept: 'probability_mass',
    },
    {
      title: 'Stetig: Bereiche',
      was: 'Bei der Schlafdauer fragst du nach Bereichen, etwa zwischen 7 und 8 Stunden. Die Wahrscheinlichkeit ist die Fläche unter einer Dichtekurve.',
      rechnung: `Im Normalmodell der Schlafdauer: P(7 ≤ X ≤ 8) ≈ ${pct(P78)}`,
      warum: 'Bei einer stetigen Größe verteilt sich die Wahrscheinlichkeit lückenlos über einen ganzen Bereich. Ein einzelner Punkt hat keine Breite und bekommt deshalb nichts ab: Ein exakter Wert hat die Wahrscheinlichkeit 0.',
      acht: 'Gemessen wird trotzdem gerundet, etwa auf eine Nachkommastelle. „7,2 Stunden“ meint dann den Bereich von 7,15 bis 7,25, und der hat eine Wahrscheinlichkeit.',
      concept: 'density_function',
    },
  ],
  ausprobieren: [
    {
      question: 'Ist die Zahl gelöster Aufgaben im Wissenstest diskret oder stetig?',
      options: ['diskret', 'stetig'], correct: 0, step: 1,
      explain: 'Es gibt nur die Werte 0, 1, 2 bis 20. Zwischen 10 und 11 gelösten Aufgaben liegt kein möglicher Wert.',
      kurz: 'Zählungen sind diskret.',
    },
    {
      question: 'Ist das Haushaltsnettoeinkommen diskret oder stetig?',
      options: ['diskret', 'stetig', 'beides ist vertretbar'], correct: 2, step: 1,
      explain: 'Genau genommen zählt man in Cent, also diskret. Bei so vielen möglichen Werten rechnet man aber meist mit einem stetigen Modell.',
      kurz: 'Bei sehr vielen Werten nimmt man oft ein stetiges Modell.',
    },
    {
      question: 'Wie wahrscheinlich schläft jemand im Modell genau 7 Stunden, also 7,000… ohne jede Rundung?',
      options: ['etwa 0,5', 'etwa 40 %', '0'], correct: 2, step: 3,
      explain: `Ein einzelner Punkt hat keine Breite und damit keine Fläche. Schon „auf die Sekunde genau“ wäre ein Bereich, mit etwa ${num(F7_SHOWN)} / 3600 ≈ ${num(F7_SHOWN / 3600, 5)}.`,
      kurz: 'Stetig: Einzelne Werte haben die Wahrscheinlichkeit 0.',
    },
  ],
  check: {
    question: 'Welche Aussage über diskret und stetig stimmt?',
    options: [
      'Die Schlafdauer ist stetig, deshalb fragt man nach Bereichen wie 7 bis 8 Stunden.',
      'Die Haushaltsgröße ist diskret, deshalb darf man mit ihr nicht rechnen.',
      'Bei stetigen Variablen hat jeder Wert die Wahrscheinlichkeit 1 durch die Zahl der Werte.',
      'Diskret und ordinal bedeuten dasselbe.',
    ],
    correct: 0,
    right: 'Genau. Stetig heißt: Die Wahrscheinlichkeit steckt in Bereichen, nicht in einzelnen Punkten.',
    diagnose: {
      1: 'Fast! Diskret ist nicht nominal. Die Haushaltsgröße ist diskret und metrisch; Mittelwert und Varianz sind sinnvoll.',
      2: 'Fast! Bei einer stetigen Variable hat ein einzelner Wert keine Breite, also die Wahrscheinlichkeit 0.',
      3: 'Fast! Diskret und stetig beschreiben die möglichen Werte. Das Skalenniveau sagt, was Abstände zwischen ihnen bedeuten.',
    },
  },
  fuerDich: 'Wenn du eine Variable auswertest, frag dich zuerst: Zähle ich etwas, oder messe ich? Gezählte Dinge wie Personen oder gelöste Aufgaben sind diskret, gemessene wie Zeit meist stetig.',
  genau: {
    kurz: 'Diskret und stetig beschreiben die möglichen Werte, das Skalenniveau beschreibt, was Abstände bedeuten. Beides beantwortet verschiedene Fragen.',
    paragraphs: [
      'Diskrete Verteilungen beschreibt eine Wahrscheinlichkeitsmasse p(k) = P(X = k), stetige eine Dichte f(x), deren Fläche über einem Bereich die Wahrscheinlichkeit ist.',
      'Gerundete Messwerte sind diskret aufgezeichnet, auch wenn ein stetiges Modell den zugrunde liegenden Vorgang beschreibt. Lernzeit und Schlafdauer stehen im Lehrdatensatz auf 0,1 Stunden gerundet.',
      'Eine Personenzahl ist diskret und metrisch. Ein Zustimmungsitem mit fünf Stufen ist diskret und ordinal; wer es metrisch auswertet, nimmt gleiche Abstände an.',
    ],
  },
};

export const discreteContinuousTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'haushaltsgroesse', y: 'schlafdauer' },
    kurz: 'Beide Arten bei allen 200 Befragten: Wie viele verschiedene Werte haben die Haushaltsgröße und die Schlafdauer?',
    value: c => distinct(c).s,
    result: c => {
      const d = distinct(c);
      return {
        kurz: `Die Haushaltsgröße hat bei ${d.n} Befragten ${d.h === 1 ? `nur einen Wert, ${d.hMin}` : `${d.h} verschiedene Werte, von ${d.hMin} bis ${d.hMax}`}. ${d.s === 1
          ? 'Die Schlafdauer hat nur einen Wert; möglich wären trotzdem alle Werte dazwischen.'
          : `Die Schlafdauer hat ${d.s} verschiedene Werte, weil sie auf 0,1 Stunden gerundet ist; ungerundet wären fast alle verschieden.`}`,
        fachlich: 'Die Haushaltsgröße ist diskret, ein Modell gibt jedem Wert eine Wahrscheinlichkeit. Die Schlafdauer ist stetig gedacht und gerundet aufgezeichnet; ein Modell beschreibt sie mit einer Dichte.',
        zusatz: `Die Schlafdauer reicht von ${num(d.sMin)} bis ${num(d.sMax)} Stunden.`,
      };
    },
    voraussetzung: 'Wie viele Werte vorkommen, hängt auch von der Messgenauigkeit ab; ob eine Variable stetig ist, entscheidet, was dazwischen möglich wäre.',
    think: [
      {
        question: 'Angenommen, alle 200 schliefen genau 7 Stunden. Wie viele verschiedene Werte hat die Schlafdauer dann?',
        options: ['1', '7', '200'], correct: 0,
        explain: 'Dann kommt nur noch ein Wert vor. Stetig bleibt die Variable trotzdem: Möglich wären weiter alle Werte dazwischen, beobachtet ist nur einer.',
        kurz: 'Beobachtete Werte sind nicht dasselbe wie mögliche Werte.',
        tryIt: { label: 'alle auf 7 Stunden', op: 'constant', column: 'y', value: 7 },
        expect: { change: 'equals', value: 1 },
      },
      {
        question: 'Alle schlafen eine halbe Stunde länger. Was passiert mit der Zahl verschiedener Werte?',
        options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0,
        explain: 'Jeder Wert rückt um 0,5 Stunden. Aus verschiedenen Werten werden wieder verschiedene Werte, ihre Zahl bleibt.',
        kurz: 'Verschieben ändert die Werte, nicht ihre Anzahl.',
        tryIt: { label: 'alle eine halbe Stunde länger', op: 'shift', column: 'y', value: 0.5 },
        expect: { change: 'same' },
      },
    ],
  },
  next: {
    next: { id: 'probability_mass', why: 'Bei diskreten Variablen bekommt jeder einzelne Wert seine Wahrscheinlichkeit.' },
    before: [
      { id: 'random_variable', why: 'Diskret oder stetig ist immer eine Zufallsvariable.' },
      { id: 'metric', why: 'Das Skalenniveau ist eine andere Frage als diskret oder stetig.' },
    ],
    after: [
      { id: 'density_function', why: 'Bei stetigen Variablen steckt die Wahrscheinlichkeit in Flächen.' },
      { id: 'cumulative_probability', why: 'Funktioniert für beide Arten: alles bis zu einer Grenze.' },
    ],
    more: [{ id: 'binomial_distribution', why: 'Ein diskretes Modell für die Zahl der Treffer.' }],
  },
};
