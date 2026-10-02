// Begriffskarte „Zählen“ (count), Rechenbaustein der Detailansicht. Zahlen aus dem Lehrdatensatz, in R nachgerechnet:
// b12-kategorial-design.test.ts.
import type { ConceptCard, ConceptTabs, SampleCtx } from '../../types';
import { num } from '../../format';
import { sampleColumnInfo } from '../../sample';
import { columnById } from '../../../domain/survey';
import { SCHULE } from './chisq-gof';

/** Gültige Werte, verschiedene Werte, häufigster Wert und Nullen in der Spalte x der Auswertung. */
export function zaehlung(c: SampleCtx) {
  const x = c.columns.x?.[0] ?? 'lernzeit', values = c.rows.map(r => r.values[x]).filter(v => Number.isFinite(v));
  const freq = new Map<number, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  const [top, topCount] = [...freq.entries()].reduce((a, b) => b[1] > a[1] || (b[1] === a[1] && b[0] < a[0]) ? b : a);
  return { x, n: values.length, distinct: freq.size, top, topCount, zeros: freq.get(0) ?? 0 };
}
const valueText = (id: string, v: number) => { const k = columnById[id]?.categories?.find(c => c.value === v); return k ? `„${k.label}“` : `der Wert ${num(v)}`; };

export const zaehlen: ConceptCard = {
  concept: 'count',
  wofuer: 'Bevor du einen Mittelwert oder einen Anteil ausrechnest, musst du wissen, wie viele Werte eingehen. Zählen wirkt unscheinbar, entscheidet aber, durch welche Zahl du später teilst.',
  kurz: 'Zählen heißt: jeden berücksichtigten Eintrag genau einmal erfassen. Gleiche Werte und der Wert 0 zählen mit.',
  stellDirVor: {
    text: `Der Lehrdatensatz hat 200 Befragte. 82 davon haben in den letzten zwölf Monaten eine Weiterbildung gemacht, 118 nicht. Beim Schulabschluss ergibt das Zählen ${SCHULE.join(', ').replace(/, (\d+)$/, ' und $1')} Befragte, zusammen wieder 200.`,
    figures: [
      { label: 'Befragte', value: '200' },
      { label: 'mit Weiterbildung', value: '82' },
      { label: 'ohne Weiterbildung', value: '118' },
    ],
  },
  heisst: {
    sym: 'n', say: 'n',
    fach: 'Beim Zählen erhält jeder berücksichtigte Eintrag genau eine Einheit. Die Zahl der gültigen Werte heißt n; zählt man je Kategorie, entstehen absolute Häufigkeiten.',
  },
  bausteine: [
    {
      title: 'Jeden Wert einmal zählen',
      was: 'Wir gehen alle Befragten durch und zählen jede Person genau einmal. Das ergibt n, die Zahl der gültigen Werte.',
      rechnung: 'Lernzeit: 200 gültige Angaben, also n = 200.',
      warum: 'Durch n teilst du beim Mittelwert, durch n − 1 bei der Varianz. Ein Fehler beim Zählen steckt dann in jeder späteren Zahl.',
      acht: 'Gleiche Werte zählen einzeln, und eine 0 ist ein gültiger Wert. Wer 0 Stunden gelernt hat, gehört dazu.',
      concept: 'validn',
    },
    {
      title: 'Je Kategorie zählen',
      was: 'Bei Antworten mit Kategorien zählen wir, wie viele Befragte jede Antwort gegeben haben. Zusammen muss wieder die Gesamtzahl herauskommen.',
      rechnung: `${SCHULE.join(' + ')} = ${SCHULE.reduce((a, b) => a + b, 0)}.`,
      warum: 'Aus diesen Zahlen werden Anteile, Kreuztabellen und Tests wie der Chi-Quadrat-Test.',
      acht: 'Prüf die Summe: Fehlt jemand oder zählt jemand doppelt, stimmt sie nicht mehr.',
      concept: 'frequency',
    },
    {
      title: 'Fehlende Angaben nicht mitzählen',
      was: 'Wer eine Frage nicht beantwortet hat, zählt für diese Frage nicht. n kann deshalb je Frage verschieden sein.',
      warum: 'Sonst teilst du auch durch Personen, von denen kein Wert in der Summe steckt.',
      acht: 'In R steht eine fehlende Angabe als NA. describe() meldet sie getrennt unter Missing.',
      concept: 'missing',
    },
  ],
  ausprobieren: [
    {
      question: 'Fünf Personen haben 4, 0, 6, 0 und 3 Stunden gelernt. Wie viele Werte zählst du?',
      options: ['5', '3', '13'], correct: 0, step: 1,
      explain: 'Jede Person zählt einmal, auch mit 0 Stunden. 13 ist die Summe, nicht die Anzahl.',
      kurz: 'Eine 0 ist ein Wert.',
    },
    {
      question: 'Zwei Personen haben beide 5 Stunden gelernt. Zählen sie einmal oder zweimal?',
      options: ['einmal', 'zweimal'], correct: 1, step: 1,
      explain: 'Gezählt werden Personen, nicht verschiedene Werte. Gleiche Werte zählen so oft, wie sie vorkommen.',
      kurz: 'Gleiche Werte zählen einzeln.',
    },
    {
      question: 'Von 200 Befragten haben 10 die Frage nach der Lernzeit nicht beantwortet. Wie groß ist n für die Lernzeit?',
      options: ['190', '200', '210'], correct: 0, step: 3,
      explain: 'Nur gültige Angaben zählen. Der Mittelwert der Lernzeit teilt dann durch 190.',
      kurz: 'n zählt gültige Werte.',
    },
  ],
  check: {
    question: 'Was zählt n bei der Lernzeit der Befragten?',
    options: [
      'alle gültigen Angaben, auch die Nullen',
      'nur die Personen, die mehr als 0 Stunden gelernt haben',
      'die verschiedenen Werte, die vorkommen',
      'die Summe der Stunden',
    ],
    correct: 0,
    right: 'Genau. Jede gültige Angabe zählt einmal, auch 0 Stunden.',
    diagnose: {
      1: 'Fast! 0 Stunden ist eine gültige Antwort. Wer nicht gelernt hat, zählt trotzdem.',
      2: 'Fast! Gleiche Werte zählen einzeln. Gezählt werden Personen, nicht verschiedene Werte.',
      3: 'Fast! Das ist die Summe. n sagt, wie viele Werte in die Summe eingehen.',
    },
  },
  fuerDich: 'Wenn eine Studie einen Anteil nennt, frag: Von wie vielen? 60 % von 10 Befragten sagen viel weniger als 60 % von 1.000.',
  genau: {
    kurz: 'n zählt die gültigen Werte einer Spalte. Für Zusammenhänge zählen nur Personen mit beiden Werten.',
    paragraphs: [
      'Für Zusammenhänge zählen nur vollständige Paare: Fehlt einer der beiden Werte, fällt die Person für diese Rechnung heraus. So beruhen Mittelwerte, Streuungen und Kovarianz auf denselben Personen.',
      'Mit Gewichten zählt eine Person mehr oder weniger als eins. Die gewichtete Fallzahl ist dann die Summe der Gewichte.',
      'Zählen ist die Grundlage der Häufigkeitstabelle: frequency() in mariposa zählt je Antwort und meldet daneben die Prozente.',
    ],
  },
};

export const zaehlenTabs: ConceptTabs = {
  sample: {
    kind: 'analysis',
    kurz: 'Zählen mit allen 200 Befragten: wie viele gültige Werte die gewählte Spalte hat und wie oft ihr häufigster Wert vorkommt.',
    value: c => zaehlung(c).n,
    result: c => {
      const z = zaehlung(c), title = sampleColumnInfo(z.x).title;
      return {
        kurz: `„${title}“ hat ${z.n} gültige Werte, einen je Person. Darunter sind ${z.distinct === 1 ? 'nur ein einziger Wert' : `${z.distinct} verschiedene Werte`}; am häufigsten ist ${valueText(z.x, z.top)} mit ${z.topCount} Befragten.`,
        fachlich: `n = ${z.n} gültige Werte, ${z.distinct} verschiedene Ausprägungen.`,
        zusatz: z.zeros === 0 ? 'Den Wert 0 hat in dieser Spalte niemand.' : `${z.zeros === 1 ? 'Eine Person hat' : `${z.zeros} Befragte haben`} ${columnById[z.x]?.categories ? `den Code 0, ${valueText(z.x, 0)}` : 'den Wert 0'}; ${z.zeros === 1 ? 'sie zählt' : 'sie zählen'} mit.`,
      };
    },
    voraussetzung: 'Gezählt werden gültige Werte. Im Lehrdatensatz fehlt keine Angabe, deshalb ist n in jeder Spalte 200.',
    think: [
      {
        question: 'Alle Befragten bekommen den Wert 5. Wie viele verschiedene Werte zählst du dann?', options: ['1', '5', '200'], correct: 0,
        explain: 'Alle haben jetzt denselben Wert. Es gibt also genau einen verschiedenen Wert, und er kommt 200-mal vor.',
        kurz: 'Verschiedene Werte und Personen sind zweierlei.',
        tryIt: { label: 'alle auf 5', op: 'constant', column: 'x', value: 5 },
        expect: { change: 'equals', value: 1, measure: c => zaehlung(c).distinct },
      },
      {
        question: 'Alle Werte verdoppeln sich. Wie viele gültige Werte zählst du dann?', options: ['200', '400', '100'], correct: 0,
        explain: 'Verdoppeln ändert die Werte, nicht die Zahl der Personen. n bleibt 200.',
        kurz: 'n zählt Personen, nicht Größen.',
        tryIt: { label: 'alle verdoppeln', op: 'double', column: 'x', value: 2 },
        expect: { change: 'equals', value: 200, measure: c => zaehlung(c).n },
      },
    ],
  },
  next: {
    next: { id: 'validn', why: 'Die Zahl der gültigen Werte, durch die du später teilst.' },
    before: [{ id: 'series', why: 'Die Werte, die gezählt werden.' }],
    after: [
      { id: 'frequency', why: 'Zählen je Antwort ergibt die Häufigkeitstabelle.' },
      { id: 'crosstab', why: 'Zählen je Kombination zweier Antworten.' },
    ],
    more: [{ id: 'missing', why: 'Fehlende Angaben zählen nicht mit.' }],
  },
};

