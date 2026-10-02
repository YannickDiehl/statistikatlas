// Begriffskarte „Empirische Verteilung“. Beispiel: Schulabschluss der 200 Befragten, Anteile je Abschluss (jede Person
// zählt 1/200) und die kumulierte Verteilung Fₙ. Zahlen in R nachgerechnet, siehe b06-wahrscheinlichkeit.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { pct } from '../../format';
import { ABSCHLUSS, column } from './gemeinsam';

const A = ABSCHLUSS;
const share = (k: number) => A.count[k] / A.n;
/** Fₙ bis einschließlich Code k. */
const upTo = (k: number) => A.count.slice(0, k + 1).reduce((a, b) => a + b, 0);

/** Anteile je Code und kumuliert für die aktuellen Daten (Spalte x, sonst schulabschluss). */
function dist(c: SampleCtx) {
  const xs = column(c, 'x', 'schulabschluss'), n = xs.length;
  const counts = [0, 1, 2, 3, 4].map(k => xs.filter(v => v === k).length);
  const cum = counts.map((_, k) => counts.slice(0, k + 1).reduce((a, b) => a + b, 0) / n);
  return { n, counts, shares: counts.map(k => k / n), cum };
}

export const empiricalDistribution: ConceptCard = {
  concept: 'empirical_distribution',
  wofuer: 'Wie verteilen sich die 200 Befragten auf die Schulabschlüsse? Die empirische Verteilung beschreibt genau das, was beobachtet wurde: welche Werte vorkommen und wie oft.',
  kurz: 'Die empirische Verteilung zeigt, welche Werte in deinen Daten wie oft vorkommen. Jede Person zählt dabei gleich viel, nämlich 1 durch n.',
  stellDirVor: {
    text: `Von den ${A.n} Befragten haben ${A.count[0]} keinen Schulabschluss, ${A.count[1]} einen Hauptschulabschluss, ${A.count[2]} einen mittleren Abschluss, ${A.count[3]} die Fachhochschulreife und ${A.count[4]} Abitur. Als Anteile sind das ${[0, 1, 2, 3].map(k => pct(share(k))).join(', ')} und ${pct(share(4))}. Zusammen ergibt das 100 %.`,
    figures: [0, 1, 2, 3, 4].map(k => ({ label: A.labels[k], value: pct(share(k)) })),
  },
  heisst: {
    sym: 'Fₙ(x)', say: 'F n von x',
    fach: 'Die empirische Verteilung gibt jeder der n Beobachtungen das Gewicht 1/n. Ihre Verteilungsfunktion Fₙ(x) ist der Anteil der Beobachtungen, die höchstens x sind.',
  },
  bausteine: [
    {
      title: 'Jeder Person ihr Gewicht geben',
      was: `Jede der ${A.n} Befragten zählt gleich viel: 1 / ${A.n} = ${pct(1 / A.n)}. Gleiche Werte sammeln ihre Anteile.`,
      rechnung: `${A.count[0]} Befragte ohne Schulabschluss: ${A.count[0]} · ${pct(1 / A.n)} = ${pct(share(0))}.`,
      warum: 'So wird aus einer Liste von 200 Antworten eine Verteilung. Die lässt sich mit anderen Daten oder einem Modell vergleichen.',
      acht: 'Die Anteile beziehen sich auf die gültigen Antworten. Fehlen Angaben, ist n kleiner als die Zahl der Befragten.',
      concept: 'frequency',
    },
    {
      title: 'Von unten aufsammeln',
      was: 'Bei geordneten Werten zählst du zusammen, wie viele höchstens bis zu einem Wert reichen. Das ist die kumulierte Verteilung Fₙ(x).',
      rechnung: `Fₙ(mittlerer Abschluss) = (${A.count[0]} + ${A.count[1]} + ${A.count[2]}) / ${A.n} = ${upTo(2)} / ${A.n} = ${pct(upTo(2) / A.n)}.`,
      warum: `So liest du ab, welcher Anteil höchstens einen bestimmten Abschluss hat: ${pct(upTo(2) / A.n)} höchstens einen mittleren.`,
      acht: 'Kumulieren braucht eine Reihenfolge. Bei Kategorien ohne Rangfolge, etwa beim Berufsabschluss, ergibt eine kumulierte Kurve keinen Sinn.',
      concept: 'cumulative_probability',
    },
    {
      title: 'Beobachtung und Modell trennen',
      was: 'Die empirische Verteilung beschreibt nur diese 200 Befragten. Eine andere Stichprobe sähe etwas anders aus.',
      warum: 'Ein Modell, die theoretische Verteilung, beschreibt dagegen alle möglichen Werte und ihre Wahrscheinlichkeiten. Die empirische Verteilung schätzt dieses Modell.',
      acht: 'Die Treppe der Daten ist kein Modell. Sie steigt in Stufen, genau dort, wo Werte beobachtet wurden.',
      concept: 'theoretical_distribution',
    },
  ],
  ausprobieren: [
    {
      question: 'Wie viel Prozent der 200 haben höchstens die Fachhochschulreife?',
      options: [pct(share(3)), pct(upTo(3) / A.n), '100 %'], correct: 1, step: 2,
      explain: `${A.count[0]} + ${A.count[1]} + ${A.count[2]} + ${A.count[3]} = ${upTo(3)} von ${A.n}, also ${pct(upTo(3) / A.n)}. Nur die ${A.count[4]} mit Abitur liegen darüber.`,
      kurz: 'Kumuliert heißt: alles bis hierher.',
    },
    {
      question: 'Ein Histogramm der Lernzeit sieht mit breiteren Balken anders aus. Ändert sich damit die empirische Verteilung?',
      options: ['ja', 'nein'], correct: 1, step: 1,
      explain: 'Die Daten bleiben dieselben 200 Werte. Die Klassenbreite ändert nur, wie grob das Bild sie zusammenfasst.',
      kurz: 'Das Bild ist eine Darstellung, nicht die Verteilung selbst.',
    },
    {
      question: 'Zwei neue Befragte ohne Schulabschluss kommen dazu. Wie viel wiegt dann eine Person?',
      options: ['1 / 200', '1 / 202', '2 / 202'], correct: 1, step: 1,
      explain: `Jede Person bekommt 1 / n, und n ist jetzt 202. Ohne Schulabschluss sind dann ${A.count[0] + 2} / 202 ≈ ${pct((A.count[0] + 2) / 202)}.`,
      kurz: 'Mit n ändert sich das Gewicht jeder Person.',
    },
  ],
  check: {
    question: 'Was beschreibt die empirische Verteilung des Schulabschlusses im Lehrdatensatz?',
    options: [
      'Die Anteile der Abschlüsse unter genau diesen 200 Befragten.',
      'Die Anteile der Abschlüsse unter allen Erwachsenen in Deutschland.',
      'Wie wahrscheinlich eine Person später einen höheren Abschluss macht.',
      'Die Verteilung, die eine Normalverteilung vorhersagt.',
    ],
    correct: 0,
    right: 'Genau. Sie fasst die beobachteten Werte zusammen, jede Person mit dem Gewicht 1 / 200.',
    diagnose: {
      1: 'Fast! Das wäre die Verteilung in der Grundgesamtheit. Die empirische Verteilung beschreibt nur die Daten, und der Lehrdatensatz ist ohnehin synthetisch.',
      2: 'Noch nicht ganz. Die Verteilung beschreibt, welche Abschlüsse jetzt vorkommen, nicht was später passiert.',
      3: 'Fast! Das wäre ein Modell, eine theoretische Verteilung. Die empirische Verteilung kommt allein aus den beobachteten Werten.',
    },
  },
  fuerDich: 'Bevor du einen Mittelwert oder einen Test rechnest, schau dir die empirische Verteilung an, als Häufigkeitstabelle oder Histogramm. Ausreißer oder zwei Gipfel siehst du oft nur dort.',
  genau: {
    kurz: 'Formal legt die empirische Verteilung auf jede Beobachtung die Masse 1/n. Ihre Verteilungsfunktion Fₙ(x) ist eine Treppe, die an jedem beobachteten Wert springt.',
    paragraphs: [
      'Fₙ(x) ist die Anzahl der xᵢ ≤ x geteilt durch n. Bei Zufallsstichproben nähert sich Fₙ mit wachsendem n der Verteilungsfunktion des Modells (Satz von Glivenko und Cantelli).',
      'Ein Histogramm fasst numerische Werte in Klassen zusammen. Eine andere Klassenbreite verändert sein Aussehen, aber nicht die Originaldaten.',
      'Bei nominalen Kategorien sind einzelne Anteile sinnvoll; eine kumulierte Kurve braucht eine begründete Ordnung. Der Schulabschluss ist geordnet, deshalb ergibt Fₙ hier Sinn.',
    ],
  },
};

export const empiricalDistributionTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'schulabschluss' },
    kurz: 'Dieselbe Verteilung mit allen 200 Befragten: Welcher Anteil hat welchen Abschluss, und welcher Anteil höchstens einen mittleren?',
    value: c => dist(c).cum[2],
    result: c => {
      const d = dist(c);
      return {
        kurz: `Die Anteile der fünf Abschlüsse von ohne bis Abitur: ${d.shares.map(s => pct(s)).join(', ')}. Höchstens einen mittleren Abschluss haben ${pct(d.cum[2])}.`,
        fachlich: `Jede der ${d.n} Personen zählt 1 / ${d.n}. Kumuliert: Fₙ = ${d.cum.map(s => pct(s)).join(', ')} für die Codes 0 bis 4.`,
        zusatz: `${d.counts[0] + d.counts[1] + d.counts[2]} von ${d.n} Befragten haben höchstens einen mittleren Abschluss.`,
      };
    },
    voraussetzung: 'Die empirische Verteilung beschreibt nur diese 200 Befragten; kumulieren ist sinnvoll, weil die Abschlüsse geordnet sind.',
    think: [
      {
        question: 'Angenommen, niemand hätte einen Schulabschluss. Wie viel Prozent haben dann höchstens einen mittleren Abschluss?',
        options: ['0', '59,5', '100'], correct: 2,
        explain: 'Alle 200 stehen dann ganz unten in der Reihenfolge. Bis zum mittleren Abschluss sind alle aufgesammelt: 100 %.',
        kurz: 'Liegen alle unten, ist die Treppe sofort oben.',
        tryIt: { label: 'alle auf ohne Schulabschluss (Code 0)', op: 'constant', column: 'x', value: 0 },
        expect: { change: 'equals', value: 100, measure: c => dist(c).cum[2] * 100 },
      },
      {
        question: 'Angenommen, alle 200 hätten Abitur. Wie viel Prozent haben dann höchstens einen mittleren Abschluss?',
        options: ['0', '20', '100'], correct: 0,
        explain: 'Niemand liegt dann bei einem mittleren Abschluss oder darunter. Die Treppe bleibt bis zum Abitur bei 0 und springt erst dort auf 100 %.',
        kurz: 'Fₙ springt genau dort, wo Werte liegen.',
        tryIt: { label: 'alle auf Abitur (Code 4)', op: 'constant', column: 'x', value: 4 },
        expect: { change: 'equals', value: 0, measure: c => dist(c).cum[2] * 100 },
      },
    ],
  },
  r: {
    entry: 'frequency', variant: 0,
    outputMap: [
      { match: 'Valid %', atlas: 'Anteil je Abschluss', step: 1, explain: 'Valid % ist der Anteil jedes Abschlusses an den gültigen Antworten. Zusammen ergeben alle Zeilen 100 %.' },
      { match: 'Cum. %', atlas: 'Fₙ, kumuliert', step: 2, explain: 'Die Spalte für kumulierte Prozent sammelt die Anteile von oben nach unten auf. In der ersten Zeile steht nur der Anteil ohne Schulabschluss.' },
      { match: '59.50', atlas: 'Fₙ(mittlerer Abschluss)', step: 2, explain: 'Bis einschließlich mittlerer Abschluss: 21 + 20 + 18,5 = 59,5 % der Befragten.' },
      { match: 'valid N', atlas: 'n', step: 1, explain: 'valid N zählt die gültigen Antworten. Jede von ihnen zählt 1 / 200.' },
    ],
    check: {
      question: 'Welche Zahl ist Fₙ(mittlerer Abschluss), der Anteil mit höchstens einem mittleren Abschluss? Tippe sie an.', correct: '59.50',
      wrong: {
        'Valid %': 'Fast! Das ist der Anteil ohne Schulabschluss allein. Kumuliert bis zum mittleren Abschluss steht unter Cum. % in der dritten Zeile.',
        '18.50': 'Fast! 18,5 % haben genau einen mittleren Abschluss. Höchstens einen mittleren haben 59,5 %, unter Cum. %.',
      },
    },
  },
  next: {
    next: { id: 'theoretical_distribution', why: 'Ein Modell, mit dem du die beobachtete Verteilung vergleichen kannst.' },
    before: [
      { id: 'frequency', why: 'Die Häufigkeitstabelle zählt, wie oft jeder Wert vorkommt.' },
      { id: 'validn', why: 'n, durch das jede Person ihr Gewicht 1 / n bekommt.' },
    ],
    after: [
      { id: 'quantile', why: 'Quantile der Daten liest du an der kumulierten Verteilung ab.' },
      { id: 'cumulative_probability', why: 'Dieselbe Idee im Modell: alles bis zu einer Grenze aufsammeln.' },
      { id: 'shape', why: 'Beschreibt die Form der Verteilung: schief oder spitz.' },
    ],
    more: [{ id: 'describe', why: 'Kennwerte, die du zusammen mit der Verteilung lesen solltest.' }],
  },
};
