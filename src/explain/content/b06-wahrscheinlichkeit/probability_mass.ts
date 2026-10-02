// Begriffskarte „Wahrscheinlichkeitsmasse“. Beispiel: X = Haushaltsgröße einer zufällig gezogenen Person aus den
// 200 Befragten, p(1) bis p(5). Zahlen in R nachgerechnet, siehe b06-wahrscheinlichkeit.test.ts.
// Bild: 'b06-masse' in src/components/explain/pictures/b06-wahrscheinlichkeit.tsx.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { pct } from '../../format';
import { HAUSHALT, column } from './gemeinsam';

const H = HAUSHALT;
export const massOf = (k: number) => k >= 1 && k <= 5 ? H.count[k - 1] / H.n : 0;
export const massUpTo = (k: number) => H.values.filter(v => v <= k).reduce((a, v) => a + massOf(v), 0);

/** Wahrscheinlichkeitsmasse der Spalte x in den aktuellen Daten: Werte, p(k), größte Masse und Summe. */
function mass(c: SampleCtx) {
  const xs = column(c, 'x', 'haushaltsgroesse'), n = xs.length;
  const values = [...new Set(xs)].sort((a, b) => a - b);
  const p = values.map(v => xs.filter(x => x === v).length / n);
  return { n, values, p, max: Math.max(...p), top: values[p.indexOf(Math.max(...p))], sum: p.reduce((a, b) => a + b, 0) };
}

export const probabilityMass: ConceptCard = {
  concept: 'probability_mass',
  picture: 'b06-masse',
  wofuer: 'Du ziehst eine der 200 Befragten zufällig. Wie wahrscheinlich lebt sie allein, zu zweit, zu dritt? Für jeden möglichen Wert eine Wahrscheinlichkeit: Das ist die Wahrscheinlichkeitsmasse.',
  kurz: 'Die Wahrscheinlichkeitsmasse gibt jedem möglichen Wert einer diskreten Variable seine Wahrscheinlichkeit. Alle zusammen ergeben genau 1.',
  stellDirVor: {
    text: `X ist die Haushaltsgröße einer zufällig gezogenen Person. Von den ${H.n} Befragten leben ${H.count[0]} allein: p(1) = ${H.count[0]} / ${H.n} = ${pct(massOf(1))}. Ebenso ist p(2) = ${pct(massOf(2))}, p(3) = ${pct(massOf(3))}, p(4) = ${pct(massOf(4))} und p(5) = ${pct(massOf(5))}. Zusammen ergibt das 100 %.`,
    figures: H.values.map(k => ({ label: `p(${k})`, value: pct(massOf(k)) })),
  },
  heisst: {
    sym: 'p(k) = P(X = k)', say: 'p von k gleich P von X gleich k',
    fach: 'Die Wahrscheinlichkeitsmasse einer diskreten Zufallsvariable X ordnet jedem möglichen Wert k die Punktwahrscheinlichkeit p(k) = P(X = k) zu; es gilt Σ p(k) = 1.',
  },
  bausteine: [
    {
      title: 'Die möglichen Werte auflisten',
      was: 'Bei der Haushaltsgröße kommen im Lehrdatensatz die Werte 1 bis 5 vor. Jeder bekommt einen eigenen Balken.',
      warum: 'Eine Masse gibt es nur bei diskreten Variablen: Nur dann lassen sich die Werte einzeln aufzählen.',
      acht: 'Werte, die nie vorkommen, haben die Masse 0. Haushalte mit 6 Personen gibt es hier nicht: p(6) = 0.',
      concept: 'discrete_continuous',
    },
    {
      title: 'Jedem Wert seine Wahrscheinlichkeit geben',
      was: 'Die Höhe jedes Balkens ist die Wahrscheinlichkeit dieses Werts. Bei der Ziehung aus den 200 ist das sein Anteil.',
      rechnung: `p(4) = P(X = 4) = ${H.count[3]} / ${H.n} = ${pct(massOf(4))}`,
      warum: 'So liest du sofort ab, welcher Wert wie wahrscheinlich ist. Am wahrscheinlichsten zieht man hier jemanden, der allein lebt.',
      acht: `Die Balken zeigen Wahrscheinlichkeiten, keine Anzahlen von Personen. ${pct(massOf(4))} heißt: Gut jede fünfte Ziehung trifft einen Vier-Personen-Haushalt.`,
      concept: 'probability',
    },
    {
      title: 'Für mehrere Werte addieren',
      was: 'Für mehrere Werte zählst du ihre Balken zusammen. Alle Balken zusammen ergeben 1.',
      rechnung: `P(X ≥ 4) = p(4) + p(5) = ${pct(massOf(4))} + ${pct(massOf(5))} = ${pct(massOf(4) + massOf(5))}`,
      warum: 'Verschiedene Werte schließen sich aus: Eine Person lebt in genau einem Haushalt einer bestimmten Größe. Deshalb darfst du addieren.',
      acht: 'Ergibt die Summe aller Balken nicht 1, fehlt ein Wert oder es steckt ein Rechenfehler darin.',
      concept: 'cumulative_probability',
    },
  ],
  ausprobieren: [
    {
      question: 'Kann ein Balken einer Wahrscheinlichkeitsmasse höher als 1 sein?',
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'Jede Punktwahrscheinlichkeit liegt zwischen 0 und 1, und alle zusammen ergeben genau 1. Ein einzelner Balken über 1 ist unmöglich.',
      kurz: 'Keine Masse über 1.',
    },
    {
      question: 'Wie wahrscheinlich lebt die gezogene Person in einem Haushalt mit höchstens 2 Personen?',
      options: [pct(massOf(2)), pct(massUpTo(2)), pct(1 - massUpTo(2))], correct: 1, step: 3,
      explain: `p(1) + p(2) = ${pct(massOf(1))} + ${pct(massOf(2))} = ${pct(massUpTo(2))}. Schieb den Regler auf 2.`,
      kurz: 'Für mehrere Werte addierst du.',
    },
    {
      question: 'Die Binomialverteilung gibt die Wahrscheinlichkeit für 0, 1, 2 bis n Treffer an. Ist sie eine Wahrscheinlichkeitsmasse?',
      options: ['ja', 'nein'], correct: 0, step: 1,
      explain: 'Trefferzahlen sind diskret. Jede bekommt eine Wahrscheinlichkeit, und zusammen ergibt das 1.',
      kurz: 'Diskrete Modelle werden durch Massen beschrieben.',
    },
  ],
  regler: {
    label: 'Haushaltsgröße k',
    min: 1, max: 5, step: 1, initial: 2,
    format: v => `k = ${v}`,
    describe: v => `p(${v}) = ${pct(massOf(v))}: So wahrscheinlich ziehst du jemanden aus einem Haushalt mit ${v === 1 ? 'einer Person' : `${v} Personen`}. Mit allen kleineren Werten zusammen: P(X ≤ ${v}) = ${pct(massUpTo(v))}.`,
  },
  check: {
    question: `p(1) = ${pct(massOf(1))}, p(2) = ${pct(massOf(2))}, p(3) = ${pct(massOf(3))}, p(4) = ${pct(massOf(4))}. Wie groß ist p(5), wenn es keine größeren Haushalte gibt?`,
    options: [pct(massOf(5)), '20 %', pct(massUpTo(4)), '100 %'],
    correct: 0,
    right: `Genau. 100 % − ${pct(massOf(1))} − ${pct(massOf(2))} − ${pct(massOf(3))} − ${pct(massOf(4))} = ${pct(massOf(5))}.`,
    diagnose: {
      1: 'Noch nicht ganz. Die Balken müssen nicht gleich hoch sein. Rechne 100 % minus die vier anderen.',
      2: `Fast! ${pct(massUpTo(4))} sind die vier anderen zusammen. p(5) ist der Rest bis 100 %.`,
      3: 'Fast! 100 % ist die Summe aller Balken. Für p(5) ziehst du die anderen vier davon ab.',
    },
  },
  fuerDich: 'Zeigt eine Grafik Balken für Wahrscheinlichkeiten, prüf zwei Dinge: Liegt jeder Balken zwischen 0 und 1, und ergeben alle zusammen 1? Wenn nicht, zeigt die Grafik etwas anderes, etwa Anzahlen.',
  genau: {
    kurz: 'Formal ist p(k) = P(X = k) für jeden möglichen Wert k, mit p(k) ≥ 0 und Σ p(k) = 1. Nur diskrete Verteilungen haben eine solche Masse.',
    paragraphs: [
      'Hier entsteht die Masse aus der Ziehung mit gleichen Chancen aus den 200 Befragten; sie ist damit die empirische Verteilung. Ein Modell wie die Binomialverteilung liefert die Masse dagegen aus einer Formel.',
      'Bernoulli-, Binomial- und hypergeometrische Verteilung werden durch Wahrscheinlichkeitsmassen beschrieben. Stetige Verteilungen haben stattdessen eine Dichte.',
    ],
  },
};

export const probabilityMassTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'haushaltsgroesse' },
    kurz: 'Dieselbe Masse mit allen 200 Befragten: Wie wahrscheinlich zieht man jede Haushaltsgröße?',
    value: c => mass(c).max,
    result: c => {
      const m = mass(c), list = m.values.map((v, i) => `p(${v}) = ${pct(m.p[i])}`).join(', ');
      return {
        kurz: m.values.length === 1
          ? `Alle ${m.n} Befragten haben dieselbe Haushaltsgröße ${m.values[0]}. Dann trägt dieser eine Wert die ganze Masse: p(${m.values[0]}) = 100 %.`
          : `Am wahrscheinlichsten zieht man jemanden aus einem Haushalt mit ${m.top === 1 ? 'einer Person' : `${m.top} Personen`}: ${pct(m.max)}. Alle ${m.values.length} Balken zusammen ergeben ${pct(m.sum)}.`,
        fachlich: `Wahrscheinlichkeitsmasse der Haushaltsgröße bei Ziehung mit gleichen Chancen: ${list}.`,
        zusatz: `Jede der ${m.n} Personen trägt 1 / ${m.n} zu genau einem Balken bei.`,
      };
    },
    voraussetzung: 'Jede der 200 Befragten hat dieselbe Chance, gezogen zu werden; die Haushaltsgröße ist diskret.',
    think: [
      {
        question: 'Alle Haushalte bekommen eine Person mehr. Was passiert mit dem höchsten Balken?',
        options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1,
        explain: 'Jeder Balken rückt um einen Wert nach rechts, seine Höhe bleibt. Der höchste Balken steht jetzt bei 2 statt bei 1.',
        kurz: 'Verschieben ändert die Werte, nicht ihre Wahrscheinlichkeiten.',
        tryIt: { label: 'alle Haushalte eine Person größer', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Angenommen, alle 200 lebten zu dritt. Wie groß ist dann der höchste Balken?',
        options: ['1', '0,2', '0,6'], correct: 0,
        explain: 'Es gibt nur noch den Wert 3. Er trägt die ganze Masse: p(3) = 1, alle anderen Balken sind 0.',
        kurz: 'Die Summe bleibt 1, egal wie sich die Masse verteilt.',
        tryIt: { label: 'alle auf 3 Personen', op: 'constant', column: 'x', value: 3 },
        expect: { change: 'equals', value: 1 },
      },
    ],
  },
  next: {
    next: { id: 'binomial_distribution', why: 'Ein Modell, das die Masse für die Zahl der Treffer aus einer Formel liefert.' },
    before: [
      { id: 'discrete_continuous', why: 'Eine Masse gibt es nur bei diskreten Variablen.' },
      { id: 'probability', why: 'Jeder Balken ist eine Wahrscheinlichkeit.' },
    ],
    after: [
      { id: 'expectation', why: 'Gewichtet jeden Wert mit seiner Masse und zählt zusammen.' },
      { id: 'cumulative_probability', why: 'Zählt die Balken bis zu einer Grenze zusammen.' },
      { id: 'bernoulli_distribution', why: 'Die kleinste Masse: zwei Werte, 0 und 1.' },
    ],
    more: [{ id: 'hypergeometric_distribution', why: 'Eine Masse für Ziehungen ohne Zurücklegen.' }],
  },
};
