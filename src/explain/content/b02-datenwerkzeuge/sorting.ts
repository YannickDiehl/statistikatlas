// Werkzeug „Sortieren & Ordnungsstatistiken“: P001 bis P005 mit Lernzeit und Wissenstest, sortiert mit arrange()
// aus dplyr (ganze Zeilen) oder, als Falle, mit sort() nur in einer Spalte. In R nachgerechnet, siehe
// ./b02-datenwerkzeuge.test.ts.
import type { ConceptTabs, SampleCtx, TableTool } from '../../types';
import { num } from '../../format';
import { sampleColumn } from '../../sample';
import { middleValues } from '../../../domain/descriptive';
import { FUENF, tief } from './daten';

type Zeile = (typeof FUENF)[number];
/** Reihenfolge der Zeilen und der Lernzeiten je Wahl. */
const nachLernzeit = [...FUENF].sort((a, b) => a.lernzeit - b.lernzeit);
const REIHE: Record<string, { zeilen: readonly Zeile[]; lernzeit: (z: Zeile, i: number) => number; os: (i: number) => number }> = {
  auf: { zeilen: nachLernzeit, lernzeit: z => z.lernzeit, os: i => i + 1 },
  ab: { zeilen: [...nachLernzeit].reverse(), lernzeit: z => z.lernzeit, os: i => FUENF.length - i },
  // Falsch: nur die Spalte wird sortiert, die Personen bleiben in ihrer Zeile und bekommen fremde Lernzeiten.
  spalte: { zeilen: FUENF, lernzeit: (_, i) => nachLernzeit[i].lernzeit, os: i => i + 1 },
};

/** Die Paare (Lernzeit, Wissenstest) jeder Person vor und nach dem Sortieren, für das Bild. */
export function paare(option: string) {
  const r = REIHE[option];
  return r.zeilen.map((z, i) => ({ person: z.person, vorher: { x: z.lernzeit, y: z.wissenstest }, nachher: { x: r.lernzeit(z, i), y: z.wissenstest } }));
}

/** Position von P002 nach dem Sortieren (1 bis 5). */
export const positionP002 = (option: string) => REIHE[option].zeilen.findIndex(z => z.person === 'P002') + 1;

const FILTER = '  filter(id %in% c("P001", "P002", "P003", "P004", "P005")) %>%';
const SORT: Record<string, string[]> = {
  auf: ['atlas %>%', FILTER, '  arrange(lernzeit) %>%'],
  ab: ['atlas %>%', FILTER, '  arrange(desc(lernzeit)) %>%'],
  spalte: ['# So nicht: sort() sortiert nur diese Spalte, die Paare zerfallen', 'atlas %>%', FILTER, '  mutate(lernzeit = sort(lernzeit)) %>%'],
};

export const sorting: TableTool = {
  concept: 'sorting',
  picture: 'b02-sortieren-paare',
  wofuer: 'Wer von den ersten fünf Befragten hat in den letzten sieben Tagen am wenigsten gelernt, wer am meisten, und welcher Wert ist der Reihe nach der mittlere? Sortierst du sie nach ihrer Lernzeit, kannst du es ablesen.',
  kurz: 'Sortieren stellt die Werte der Größe nach in eine Reihe, vom kleinsten bis zum größten. Dann liest du ab, welcher Wert vorne steht, welcher hinten und welcher der Reihe nach der mittlere ist.',
  mut: 'Hier rechnest du nichts. Du stellst nur fünf Zahlen der Größe nach auf, wie Menschen in einer Schlange.',
  columns: [{ key: 'person', label: 'Person' }, { key: 'lernzeit', label: 'lernzeit (h)' }, { key: 'wissenstest', label: 'wissenstest' }],
  rows: FUENF.map(r => ({ person: r.person, lernzeit: num(r.lernzeit), wissenstest: r.wissenstest })),
  options: [
    { id: 'auf', label: 'Aufsteigend nach lernzeit' },
    { id: 'ab', label: 'Absteigend nach lernzeit' },
    { id: 'spalte', label: 'Nur die Spalte lernzeit sortieren' },
  ],
  steps: [
    {
      title: 'Ganze Zeilen der Größe nach ordnen',
      was: 'Du stellst die Befragten so auf, dass die Lernzeit von oben nach unten wächst. Die ganze Zeile wandert mit, also auch der Wissenstest.',
      warum: 'Nur wenn die ganze Zeile mitwandert, gehören Lernzeit und Wissenstest weiter zur selben Person.',
      acht: 'Sortierst du nur eine Spalte, bekommen Personen fremde Werte. Jeder Zusammenhang zwischen zwei Spalten wäre dann zerstört.',
      fach: 'Sortieren ordnet die Fälle nach einer Variable; die Werte jedes Falls bleiben beisammen.',
    },
    {
      title: 'Die Positionen durchzählen',
      was: 'Der kleinste Wert bekommt Position 1, der größte Position 5. Den Wert an Position i schreibt man x₍ᵢ₎.',
      warum: 'Mit Positionen kannst du über die Reihe sprechen: x₍₁₎ ist das Minimum, x₍₅₎ das Maximum.',
      acht: 'x₍₂₎ ist nicht der Wert der zweiten Person, sondern der zweitkleinste Wert. Die Klammer um den Index macht den Unterschied.',
      sym: 'x₍ᵢ₎', say: 'x i in Klammern',
      fach: 'x₍ᵢ₎ heißt i-te Ordnungsstatistik: der Wert an Position i der aufsteigend sortierten Reihe x₍₁₎ ≤ … ≤ x₍ₙ₎.',
      concept: 'sorting',
    },
    {
      title: 'Ränder und mittleren Wert ablesen',
      was: `Bei fünf Werten steht der mittlere Wert der Reihe nach an Position 3: x₍₃₎ = ${num(nachLernzeit[2].lernzeit)} h. Das ist der Median.`,
      warum: 'Median, Quartile und Spannweite liest du alle an Positionen der sortierten Reihe ab.',
      acht: `Sortieren behält die Werte. Ränge ersetzen sie durch ihre Positionen: Aus ${num(nachLernzeit[2].lernzeit)} h würde die 3.`,
      fach: 'Ordnungsstatistiken sind die Grundlage für Median, Quantile und den Shapiro-Wilk-Test.',
      concept: 'median',
    },
  ],
  apply: (_rows, option) => {
    const r = REIHE[option];
    return {
      columns: [
        { key: 'person', label: 'Person' }, { key: 'lernzeit', label: 'lernzeit (h)' }, { key: 'wissenstest', label: 'wissenstest' },
        { key: 'position', label: 'Position' }, { key: 'os', label: 'Ordnungsstatistik' },
      ],
      rows: r.zeilen.map((z, i) => ({ person: z.person, lernzeit: num(r.lernzeit(z, i)), wissenstest: z.wissenstest, position: i + 1, os: `x₍${tief(r.os(i))}₎` })),
    };
  },
  rCode: option => [
    'library(dplyr)', 'library(mariposa)', '', 'atlas <- read_spss("Statistikatlas-200-Befragte.sav")', '',
    ...SORT[option], '  select(id, lernzeit, wissenstest)',
  ].join('\n'),
  check: {
    question: 'An welcher Position steht P002 nach dem Sortieren?',
    answer: positionP002,
    right: 'Genau. Die Position zählt die Zeilen der Tabelle nachher, von oben nach unten.',
    diagnose: (option, v) => {
      if (v === 'NA' || v === positionP002(option)) return null;
      if (option === 'auf') return v === 2 ? 'Fast! 2 ist der Platz von P002 vor dem Sortieren. Aufsteigend steht P002 mit 8,3 h an Position 4.'
        : v === 3 ? 'Fast! An Position 3 steht P005 mit 6,8 h, der mittlere Wert der Reihe nach. P002 folgt mit 8,3 h an Position 4.'
        : null;
      if (option === 'ab') return v === 4 ? 'Fast! 4 wäre die Position beim aufsteigenden Sortieren. Absteigend steht der größte Wert oben, und P002 folgt an Position 2.'
        : null;
      return v === 4 ? 'Fast! So wäre es, wenn die ganze Zeile mitwandert. Hier wurde nur die Spalte sortiert: P002 bleibt in Zeile 2 und bekommt eine fremde Lernzeit.'
        : null;
    },
  },
  think: [
    {
      question: 'Du sortierst nur die Spalte lernzeit. Was passiert mit dem Zusammenhang zwischen Lernzeit und Wissenstest?',
      options: ['er bleibt erhalten', 'er wird verfälscht'], correct: 1, step: 1,
      explain: 'Jede Person bekommt eine fremde Lernzeit, ihr Wissenstest bleibt. Die Paare passen nicht mehr zusammen, und jede Korrelation rechnet mit erfundenen Paaren.',
      kurz: 'Immer ganze Zeilen sortieren.',
    },
    {
      question: 'Ist x₍₂₎ dasselbe wie x₂?',
      options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'x₂ ist die Lernzeit der zweiten Person in der Liste, bei P002 also 8,3 h. x₍₂₎ ist der zweitkleinste Wert, die 6,3 h von P003.',
      kurz: 'Mit Klammer: Position in der Reihe; ohne Klammer: Person in der Liste.',
    },
    {
      question: 'Du sortierst absteigend. Welcher Wert ist dann x₍₁₎?',
      options: ['10,5 h, der oberste', '6 h, der kleinste'], correct: 1, step: 2,
      explain: 'x₍₁₎ meint immer den kleinsten Wert. Die Richtung ändert nur die Reihenfolge der Zeilen, nicht die Namen der Ordnungsstatistiken.',
      kurz: 'x₍₁₎ ist immer das Minimum.',
    },
  ],
  genau: {
    kurz: 'Ordnungsstatistiken x₍₁₎ ≤ … ≤ x₍ₙ₎ sind die sortierten Werte selbst. Ränge ersetzen Werte durch Positionen, Sortieren behält sie.',
    paragraphs: [
      'Bei gleichen Werten (Bindungen) ist die Reihenfolge innerhalb der Gleichen egal: x₍ᵢ₎ bleibt eindeutig, weil gleiche Werte dieselbe Zahl sind. Ränge brauchen dafür eine Regel, meist den Durchschnitt der Positionen.',
      'In R sortiert arrange() ganze Zeilen, arrange(desc()) absteigend. sort() sortiert nur einen einzelnen Vektor; in einem Datensatz trennt es Werte von ihren Personen.',
      'Bei ungeradem n steht der Median an Position (n + 1) / 2. Bei geradem n ist er der Durchschnitt der Werte an den Positionen n / 2 und n / 2 + 1. Auch Quantile und den Interquartilsabstand liest du an Positionen der sortierten Reihe ab.',
      'Sortieren braucht eine Rangfolge. Für Kategorien ohne Rangfolge, etwa den Geschlechtseintrag, ergibt eine sortierte Reihe keinen Sinn, auch wenn R ihre Codes sortieren kann.',
    ],
  },
};

/** Die sortierte Reihe mit Rändern, den beiden mittleren Werten (middleValues), Median und Zahl verschiedener Werte. */
export function reihe(values: readonly number[]) {
  const [unten, oben] = middleValues([...values])!;
  return { n: values.length, min: Math.min(...values), max: Math.max(...values), unten, oben, median: (unten + oben) / 2, verschieden: new Set(values).size };
}
const lernzeit = (c: SampleCtx) => reihe(sampleColumn(c.rows, 'lernzeit'));
/** Wo der Median steht: „dem Durchschnitt der Werte an den Positionen 100 und 101“ bei geradem n, „dem Wert an Position 3“ bei ungeradem. */
const medianStelle = (n: number) => n % 2 === 0 ? `dem Durchschnitt der Werte an den Positionen ${n / 2} und ${n / 2 + 1}` : `dem Wert an Position ${(n + 1) / 2}`;

export const sortingTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'lernzeit' },
    kurz: 'Dieselbe Reihe mit allen 200 Befragten: Sortiert stehen ihre Lernzeiten vom kleinsten bis zum größten Wert hintereinander.',
    value: c => lernzeit(c).min,
    result: c => {
      const r = lernzeit(c);
      return {
        kurz: `Am wenigsten hat jemand ${num(r.min)} h gelernt (x₍₁₎), am meisten jemand ${num(r.max)} h (x₍${tief(r.n)}₎). Der Median, der mittlere Wert der Reihe nach, liegt bei ${num(r.median)} h. Die eine Hälfte hat höchstens so lange gelernt, die andere mindestens so lange.`,
        fachlich: r.n % 2 === 0
          ? `Ordnungsstatistiken der Lernzeit: Minimum x₍₁₎ = ${num(r.min)} h, Maximum x₍${tief(r.n)}₎ = ${num(r.max)} h; der Median ist der Durchschnitt der Werte an den Positionen ${r.n / 2} und ${r.n / 2 + 1}, ${num(r.unten)} h und ${num(r.oben)} h.`
          : `Ordnungsstatistiken der Lernzeit: Minimum x₍₁₎ = ${num(r.min)} h, Maximum x₍${tief(r.n)}₎ = ${num(r.max)} h; der Median ist der Wert an Position ${(r.n + 1) / 2}, ${num(r.median)} h.`,
        zusatz: `Unter den ${r.n} Lernzeiten gibt es nur ${r.verschieden} verschiedene Werte: Gleiche Werte stehen in der sortierten Reihe direkt hintereinander.`,
      };
    },
    voraussetzung: 'Sortieren braucht eine Rangfolge der Werte. Die Lernzeit hat sie; Kategorien ohne Rangfolge hätten keine.',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit x₍₁₎, dem kleinsten Wert?',
        options: ['er steigt um 1', 'er bleibt gleich', 'das hängt von der Person ab'], correct: 0,
        explain: 'Alle rücken um eine Stunde nach oben, die Reihenfolge bleibt. Deshalb ist auch der kleinste Wert genau eine Stunde größer.',
        kurz: 'Verschieben ändert die Werte, nicht die Reihenfolge.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1 },
      },
      {
        question: 'Die gewählte Person lernt plötzlich 40 Stunden. Was passiert mit dem letzten Wert der Reihe, x₍₂₀₀₎?',
        options: ['er steigt deutlich, auf 40', 'er bleibt gleich', 'er sinkt'], correct: 0,
        explain: '40 Stunden sind mehr als alle bisherigen Werte. Diese Person rückt ans Ende der Reihe, und x₍₂₀₀₎ wird 40.',
        kurz: 'Ein neuer Höchstwert landet immer an der letzten Position.',
        tryIt: { label: 'die gewählte Person auf 40 Stunden', op: 'outlier', column: 'x', value: 40 },
        // „deutlich“: mindestens 10 % des Ausgangswerts (18,4 h, nach dem Verschieben 19,4 h), also mindestens 2 h.
        expect: { change: 'up', atLeast: 2, measure: c => lernzeit(c).max },
      },
    ],
  },
  r: {
    entry: 'median', variant: 0, live: { fn: 'describe', show: ['min', 'max'] },
    tokens: {
      '"min"': { sym: '"min"', term: 'Minimum x₍₁₎', kurz: 'Fordert das Minimum an, den ersten Wert der sortierten Reihe.', fehler: 'Schreibst du "minimum", meldet mariposa: Unknown `show` value: "minimum". Erlaubt ist "min".' },
      '"max"': { sym: '"max"', term: 'Maximum x₍ₙ₎', kurz: 'Fordert das Maximum an, den letzten Wert der sortierten Reihe.', fehler: 'Ohne Anführungszeichen meldet mariposa: `show` must be a character vector of statistic names.' },
    },
    outputMap: [
      { match: 'Min', atlas: 'x₍₁₎', step: 2, explain: 'Das Minimum ist der erste Wert der sortierten Reihe. Kein Wert liegt darunter.' },
      { match: 'Max', atlas: 'x₍ₙ₎', step: 2, explain: 'Das Maximum ist der letzte Wert der sortierten Reihe, an Position n.' },
      { match: 'N', atlas: 'n, die letzte Position', explain: 'So viele Werte stehen in der Reihe. Das Maximum steht an genau dieser Position.' },
    ],
    check: {
      question: 'Welche Zahl ist x₍₁₎, der erste Wert der sortierten Reihe? Tippe sie an.', correct: 'Min',
      wrong: {
        Max: 'Fast! Max ist der letzte Wert der sortierten Reihe, x₍ₙ₎. Der erste steht unter Min.',
        N: 'Fast! N zählt die Werte und ist damit die letzte Position. Der erste Wert steht unter Min.',
      },
    },
  },
  next: {
    next: { id: 'median', why: c => { const r = lernzeit(c); return `Der mittlere Wert der Reihe nach: Bei den ${r.n} Befragten liegt er bei ${num(r.median)} h, ${medianStelle(r.n)}.`; } },
    before: [
      { id: 'ordinal', why: 'Sortieren braucht eine Rangfolge der Werte.' },
      { id: 'series', why: 'Die Werte einer Spalte, die sortiert eine Reihe ergeben.' },
    ],
    after: [
      { id: 'quantile', why: 'Teilt die sortierte Reihe an festen Positionen, etwa nach dem ersten Viertel.' },
      { id: 'ranks', why: 'Ersetzt die sortierten Werte durch ihre Positionen.' },
    ],
    more: [
      { id: 'pairs', why: 'Sortiere nie eine Spalte allein, sonst zerfallen die Paare.' },
      { id: 'normality_test', why: 'Der Shapiro-Wilk-Test vergleicht die sortierten Werte mit dem, was eine Normalverteilung erwarten ließe.' },
    ],
  },
};
