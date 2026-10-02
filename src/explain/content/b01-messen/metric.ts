// Begriffskarte „Metrisches Skalenniveau“ (metric). Beispiel: drei Spalten derselben Befragten P002 im Lehrdatensatz.
// Vorlage: Begriffskarte (Skalenniveaus sind eine Idee, keine Rechnung). Zahlen in R nachgerechnet: b01-messen.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { columnById } from '../../../domain/survey';
import { num, pct } from '../../format';
import { sampleColumn, sampleColumnInfo, unitText } from '../../sample';
import { FUENF, labelOf, mean, middle, numR, role, valueText } from './shared';

const P1 = FUENF[0], P4 = FUENF[3];

export const metric: ConceptCard = {
  concept: 'metric',
  wofuer: 'Darfst du aus den Antworten einen Mittelwert bilden? Das hängt davon ab, was die Zahlen bedeuten. Bei metrischen Merkmalen heißt ein Schritt von 1 überall dasselbe, und genau dann sind Mittelwert und Standardabweichung sinnvoll.',
  kurz: 'Metrisch heißt: Gleiche Zahlenabstände bedeuten überall gleich viel, wie bei Stunden, Euro oder Jahren. Nur dann darfst du mit Abständen rechnen.',
  stellDirVor: {
    text: `Drei Angaben derselben Person P002: Sie hat in den letzten sieben Tagen 8,3 Stunden gelernt. Ihr Schulabschluss hat den Code 3 (${labelOf('schulabschluss', 3)}), ihr Berufsabschluss den Code 1 (${labelOf('berufsabschluss', 1)}). Nur bei der Lernzeit heißt „1 mehr“ überall dasselbe: eine Stunde. Von 6 auf 7 Stunden ist es genauso weit wie von 10 auf 11.`,
    figures: [
      { label: 'Lernzeit', value: '8,3 h' },
      { label: 'Schulabschluss', value: 'Code 3' },
      { label: 'Berufsabschluss', value: 'Code 1' },
    ],
  },
  heisst: {
    fach: 'Bei metrischen Merkmalen sind Abstände zwischen Werten inhaltlich interpretierbar (Intervallskala). Hat die Skala einen echten Nullpunkt, sind auch Verhältnisse interpretierbar (Verhältnisskala). Erst dann sind Mittelwert, Varianz und Pearson-Korrelation sinnvoll.',
  },
  bausteine: [
    {
      title: 'Prüfen, ob gleiche Abstände gleich viel bedeuten',
      was: 'Du fragst: Ist der Schritt von 2 auf 3 genauso groß wie der von 9 auf 10? Bei Stunden, Euro und Jahren ist das so.',
      warum: 'Nur dann darfst du Abstände zusammenzählen und miteinander vergleichen.',
      acht: 'Ob eine Skala metrisch ist, steht nicht in den Zahlen. Es hängt davon ab, was gemessen wurde und wie.',
      concept: 'operationalization',
    },
    {
      title: 'Mit Abständen rechnen',
      was: 'Bei metrischen Werten kannst du Abstände ausrechnen und vergleichen. Daraus entstehen Mittelwert und Standardabweichung.',
      rechnung: `${P4.id} lernte ${num(P4.lernzeit)} h, ${P1.id} ${num(P1.lernzeit)} h: ${num(P4.lernzeit - P1.lernzeit)} Stunden Unterschied. Mittelwert der 200 Befragten: 7,75 h.`,
      warum: 'Der Mittelwert verteilt die Summe gerecht auf alle. Das ergibt nur Sinn, wenn jede Stunde gleich viel zählt.',
      acht: 'R rechnet einen Mittelwert auch aus Codes aus. Ob er etwas bedeutet, musst du selbst entscheiden.',
      concept: 'mean',
    },
    {
      title: 'Auf den Nullpunkt achten',
      was: `Die Lernzeit hat einen echten Nullpunkt: 0 Stunden heißt, gar nicht gelernt. Dann darfst du auch sagen: ${P4.id} hat 1,75-mal so lange gelernt wie ${P1.id}.`,
      rechnung: `${num(P4.lernzeit)} / ${num(P1.lernzeit)} = ${num(P4.lernzeit / P1.lernzeit)}`,
      warum: 'Ohne echten Nullpunkt sind nur Abstände sinnvoll, keine Verhältnisse. 20 Grad Celsius sind nicht doppelt so warm wie 10 Grad.',
      acht: 'Metrisch heißt nicht stetig. Die Zahl gelöster Aufgaben ist metrisch, kennt aber nur ganze Zahlen.',
      concept: 'discrete_continuous',
    },
    {
      title: 'Zustimmungsstufen als Annahme behandeln',
      was: 'Bei Fragen wie „Ich plane feste Zeiten zum Lernen ein.“ (1 bis 5) sind die Abstände nicht gemessen. Wer einen Mittelwert rechnet, nimmt sie als gleich groß an.',
      warum: 'Diese Annahme ist üblich und oft vertretbar, aber sie bleibt eine Annahme. Nenne sie, wenn du so rechnest.',
      acht: '„Weder noch“ liegt nicht unbedingt genau in der Mitte zwischen „Stimme eher nicht zu“ und „Stimme eher zu“.',
      concept: 'ordinal',
    },
  ],
  ausprobieren: [
    {
      question: `${P1.id} lernte ${num(P1.lernzeit)} Stunden, ${P4.id} ${num(P4.lernzeit)} Stunden. Darfst du sagen, ${P4.id} lernte ${num(P4.lernzeit - P1.lernzeit)} Stunden mehr?`,
      options: ['ja', 'nein'], correct: 0, step: 2,
      explain: 'Ja. Die Lernzeit ist metrisch: Jede Stunde ist gleich lang, egal ob es die erste oder die zehnte ist.',
      kurz: 'Bei metrischen Daten sind Abstände echte Mengen.',
    },
    {
      question: 'Darfst du sagen: 20 Grad Celsius sind doppelt so warm wie 10 Grad?',
      options: ['ja', 'nein'], correct: 1, step: 3,
      explain: 'Nein. Celsius hat keinen echten Nullpunkt: 0 Grad heißt nicht „gar keine Wärme“. In Fahrenheit wären es 68 und 50 Grad, und das Verhältnis wäre ein anderes.',
      kurz: 'Verhältnisse brauchen einen echten Nullpunkt.',
    },
    {
      question: 'Die finanzielle Lage hat die Codes 1 bis 5. Ist der Schritt von „Sehr schwer“ zu „Eher schwer“ so groß wie von „Eher leicht“ zu „Sehr leicht“?',
      options: ['ja, beide Male 1', 'das weiß man nicht'], correct: 1, step: 4,
      explain: 'Die Codes sind gleichmäßig nummeriert, die Antworten aber nicht gemessen. Wie groß ein Schritt inhaltlich ist, sagt die Frage nicht.',
      kurz: 'Gleichmäßige Codes heißen nicht gleich große Schritte.',
    },
  ],
  check: {
    question: 'Welche Spalte des Lehrdatensatzes ist metrisch?',
    options: [
      'Lernzeit in Stunden',
      'Schulabschluss mit den Codes 0 bis 4',
      'Berufsabschluss mit den Codes 0 bis 8',
      'Geschlecht mit den Codes 0 bis 3',
    ],
    correct: 0,
    right: 'Genau. Eine Stunde ist überall gleich lang, deshalb sind Abstände bei der Lernzeit echte Mengen.',
    diagnose: {
      1: 'Fast! Die Abschlüsse haben eine Reihenfolge, aber keine festen Abstände. Das ist ordinal.',
      2: 'Fast! Die Codes der Berufsabschlüsse sind nur Namen ohne Reihenfolge. Das ist nominal.',
      3: 'Fast! Auch hier sind die Codes nur Namen. Ein Abstand zwischen Code 1 und Code 3 bedeutet nichts.',
    },
  },
  fuerDich: 'Bevor du einen Mittelwert berichtest, frag dich: Bedeutet ein Schritt auf der Skala überall gleich viel? Bei Stunden, Euro und Jahren ja. Bei Zustimmungsstufen ist es eine Annahme, die du nennen solltest.',
  genau: {
    kurz: 'Metrisch heißt: Abstände sind interpretierbar, mit echtem Nullpunkt auch Verhältnisse. Das Skalenniveau ist eine Eigenschaft der Messung, nicht der Zahlen.',
    paragraphs: [
      'Stevens unterscheidet nominal, ordinal, intervall- und verhältnisskaliert. Metrisch fasst die beiden letzten zusammen. Jede Stufe erlaubt alle Aussagen der Stufen davor.',
      'Diskret oder stetig ist eine andere Frage: Eine Personenzahl ist diskret und metrisch, eine Lernzeit stetig und metrisch.',
      'Zustimmungsskalen mit fünf oder mehr Stufen werden in der Praxis oft wie metrische Daten ausgewertet. Das ist eine Annahme über gleich große Abstände; der Atlas kennzeichnet sie bei jeder solchen Rechnung.',
      'Eine Zahl kann auch nur ein Name sein, etwa 1 für Rot und 2 für Blau oder eine Postleitzahl. Wer damit rechnet, bekommt Zahlen ohne Bedeutung.',
    ],
  },
};

type Kind = 'metric' | 'likert' | 'binary' | 'ordinal' | 'nominal';
/** Wie der Atlas eine Spalte einordnet: metrisch, Zustimmungsstufen, 0/1, geordnete oder ungeordnete Kategorien. */
export function kindOf(column: string): Kind {
  const c = columnById[column];
  if (!c) return 'metric';
  return c.kind === 'likert' ? 'likert' : c.kind === 'binary' ? 'binary' : c.scale;
}

function metricOf(c: SampleCtx) {
  const column = role(c, 'x', 'lernzeit'), values = sampleColumn(c.rows, column), m = mean(values);
  const sd = Math.sqrt(values.reduce((a, v) => a + (v - m) ** 2, 0) / (values.length - 1));
  return { column, values, m, sd, info: sampleColumnInfo(column), kind: kindOf(column) };
}

export const metricTabs: ConceptTabs = {
  sample: {
    kind: 'analysis',
    kurz: 'Dieselbe Frage für jede Spalte der 200 Befragten: Bedeuten gleiche Abstände gleich viel, und ist der Mittelwert deshalb sinnvoll?',
    value: c => metricOf(c).m,
    result: c => {
      const { column, values, m, sd, info, kind } = metricOf(c), ids = c.rows.map(r => r.id);
      const u = (v: number) => unitText(info, v);
      if (kind === 'metric') return {
        kurz: `„${info.title}“ ist metrisch: Gleiche Zahlenabstände bedeuten überall gleich viel. Deshalb ist der Mittelwert ${u(m)} eine sinnvolle Aussage über die ${values.length} Befragten.`,
        fachlich: `Metrisches Skalenniveau: Mittelwert x̄ ≈ ${u(m)} und Standardabweichung s ≈ ${u(sd)} sind interpretierbar.`,
        zusatz: `${ids[0]} und ${ids[1]} liegen ${u(Math.abs(values[1] - values[0]))} auseinander; dieser Abstand bedeutet überall auf der Skala gleich viel.`,
      };
      const [lo, hi] = middle(values), med = lo === hi ? valueText(column, lo) : `zwischen ${valueText(column, lo)} und ${valueText(column, hi)}`;
      if (kind === 'likert') return {
        kurz: `„${info.title}“ hat geordnete Zustimmungsstufen. Den Mittelwert ${numR(m)} darfst du nur deuten, wenn du gleich große Abstände zwischen den Stufen annimmst.`,
        fachlich: `Ordinales Zustimmungsitem, metrisch nur unter der Annahme gleicher Abstände. Mittelwert der Codes ${numR(m)}; der mittlere Wert der Reihe nach ist ${med}.`,
        zusatz: `${ids[0]} hat ${valueText(column, values[0])} geantwortet.`,
      };
      if (kind === 'binary') return {
        kurz: `„${info.title}“ hat nur die Werte 0 und 1. Der Mittelwert ${numR(m)} ist hier der Anteil der Antworten „${labelOf(column, 1)}“: ${pct(m)}.`,
        fachlich: `Binäres Merkmal (0/1): Der Mittelwert ist ein Anteil. Abstände gibt es nur einen, von 0 nach 1.`,
        zusatz: `${ids[0]} hat ${valueText(column, values[0])}.`,
      };
      return kind === 'ordinal' ? {
        kurz: `„${info.title}“ ist ordinal: Die Codes haben eine Reihenfolge, aber keine festen Abstände. Der Mittelwert der Codes, ${numR(m)}, ist deshalb keine sinnvolle Aussage.`,
        fachlich: `Ordinales Skalenniveau: Zulässig sind Häufigkeiten, Median und Ränge. Der mittlere Wert der Reihe nach ist ${med}.`,
        zusatz: `${ids[0]} hat ${valueText(column, values[0])}.`,
      } : {
        kurz: `„${info.title}“ ist nominal: Die Codes sind nur Namen. Ein Mittelwert der Codes, ${numR(m)}, bedeutet nichts.`,
        fachlich: 'Nominales Skalenniveau: Zulässig sind Häufigkeiten, Anteile und der Modus.',
        zusatz: `${ids[0]} hat ${valueText(column, values[0])}.`,
      };
    },
    voraussetzung: 'Das Skalenniveau folgt aus der Frage und den Antwortmöglichkeiten, nicht aus den Zahlen im Datensatz.',
    think: [
      {
        question: 'Alle Werte steigen um 1. Was passiert mit dem Abstand zwischen P001 und P002?',
        options: ['bleibt gleich', 'wird größer', 'wird kleiner'], correct: 0,
        explain: 'Beide rücken um denselben Schritt nach oben. Bei metrischen Daten bleibt der Abstand zwischen zwei Personen dann genau gleich.',
        kurz: 'Verschieben ändert keine Abstände.',
        tryIt: { label: 'alle Werte um 1 erhöhen', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same', measure: c => { const v = sampleColumn(c.rows, role(c, 'x', 'lernzeit')); return v[1] - v[0]; } },
      },
      {
        question: 'Alle Werte werden verdoppelt. Was passiert mit dem Mittelwert?',
        options: ['bleibt gleich', 'verdoppelt sich', 'steigt um 2'], correct: 1,
        explain: 'Jeder Wert verdoppelt sich, also auch ihre Summe und der Mittelwert. „Doppelt so viel“ ergibt aber nur einen Sinn, wenn die Skala einen echten Nullpunkt hat, wie die Lernzeit.',
        kurz: 'Malnehmen wirkt auf den Mittelwert genauso.',
        tryIt: { label: 'alle Werte verdoppeln', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  r: {
    entry: 'describe', variant: 0,
    outputMap: [
      { match: 'Mean', atlas: 'Mittelwert x̄', step: 2, explain: 'Der Mittelwert zählt Abstände zusammen. Er ist sinnvoll, weil eine Stunde und ein Euro überall gleich viel sind.' },
      { match: 'SD', atlas: 'Standardabweichung s', step: 2, explain: 'Auch die Standardabweichung rechnet mit Abständen zur Mitte und braucht deshalb metrische Daten.' },
      { match: 'Median', atlas: 'Median', step: 4, explain: 'Der Median braucht nur die Reihenfolge. Er passt auch zu geordneten Kategorien.' },
      { match: 'N', atlas: 'Fallzahl n', explain: 'Für Lernzeit und Einkommen liegen alle 200 Angaben vor.' },
    ],
    check: {
      question: 'Welche dieser Zahlen ergibt auch bei geordneten Kategorien einen Sinn? Tippe sie an.', correct: 'Median',
      wrong: {
        Mean: 'Fast! Der Mittelwert zählt Abstände zusammen. Das setzt ein metrisches Skalenniveau voraus.',
        SD: 'Fast! Die Standardabweichung misst Abstände zur Mitte. Ohne feste Abstände bedeutet sie nichts.',
        N: 'Fast! N zählt nur die Personen. Gesucht ist ein Kennwert, der mit der Reihenfolge allein auskommt.',
      },
    },
  },
  next: {
    next: { id: 'mean', why: 'Verteilt die Summe gerecht auf alle. Sinnvoll, weil jede Einheit gleich viel zählt.' },
    before: [
      { id: 'ordinal', why: 'Die Stufe davor: Reihenfolge ja, feste Abstände nein.' },
      { id: 'operationalization', why: 'Erst die Messregel entscheidet, ob Abstände etwas bedeuten.' },
    ],
    after: [
      { id: 'sd', why: 'Misst, wie weit die Werte typischerweise von der Mitte entfernt sind.' },
      { id: 'pearson', why: 'Geradliniger Zusammenhang zweier metrischer Merkmale.' },
      { id: 't_test', why: 'Vergleicht die Mittelwerte zweier Gruppen.' },
    ],
    more: [{ id: 'discrete_continuous', why: 'Nur ganze Zahlen oder auch Zwischenwerte: eine andere Frage als das Skalenniveau.' }],
  },
};
