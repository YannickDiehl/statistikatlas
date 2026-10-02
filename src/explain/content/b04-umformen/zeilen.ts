// Tabellen-Werkzeug „Rechnen innerhalb einer Person“ (Begriff `row_operations`): fünf Befragte aus dem Lehrdatensatz,
// ihre fünf Antworten zur Methoden-Zuversicht, zusammengefasst mit row_means(), row_sums() oder row_count() aus
// mariposa 0.7.4. Vorbild src/explain/content/muster/dummy.ts. In R nachgerechnet, siehe b04-umformen.test.ts.
import type { ConceptTabs, SampleCtx, TableTool } from '../../types';
import { num, close } from '../../format';
import { ref, titleFor } from '../../../domain/learning';
import { sampleColumn } from '../../sample';

export const ITEMS = ['methoden1', 'methoden2', 'methoden3', 'methoden4', 'methoden5'] as const;

/** P001, P002, P003, P004 und P007 aus dem Lehrdatensatz (createSurvey()) mit ihren Antworten auf methoden1 bis methoden5. */
const FUENF = [
  { person: 'P001', answers: [2, 3, 3, 2, 3] },
  { person: 'P002', answers: [5, 5, 5, 5, 5] },
  { person: 'P003', answers: [5, 5, 3, 4, 4] },
  { person: 'P004', answers: [4, 4, 4, 5, 4] },
  { person: 'P007', answers: [3, 2, 1, 1, 3] },
];

/** Die drei Operationen: neue Spalte, Rechnung je Person und der mariposa-Aufruf. */
export const ZEILEN_OPS = {
  mittel: { name: 'methoden_mittel', calc: (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length, call: 'row_means(pick(methoden1, methoden2, methoden3, methoden4, methoden5), min_valid = 5)' },
  summe: { name: 'methoden_summe', calc: (a: number[]) => a.reduce((x, y) => x + y, 0), call: 'row_sums(pick(methoden1, methoden2, methoden3, methoden4, methoden5), min_valid = 5)' },
  zustimmung: { name: 'methoden_zustimmung', calc: (a: number[]) => a.filter(v => v >= 5).length, call: 'row_count(pick(methoden1, methoden2, methoden3, methoden4, methoden5), count = c(5, 6, 7))' },
} as const;
type Op = keyof typeof ZEILEN_OPS;
const op = (option: string) => ZEILEN_OPS[(option in ZEILEN_OPS ? option : 'mittel') as Op];
const P003 = FUENF[2].answers;

export const zeilen: TableTool = {
  concept: 'row_operations',
  wofuer: 'Fünf Fragen im Lehrdatensatz messen, wie sicher sich Befragte bei Methoden fühlen, jeweils von 1 (stimme überhaupt nicht zu) bis 7 (stimme voll und ganz zu). Du willst für jede Person eine Zahl, die ihre fünf Antworten zusammenfasst. Dafür rechnest du quer durch ihre Zeile.',
  kurz: 'Rechnen innerhalb einer Person heißt: Mehrere Antworten derselben Person werden zu einer Zahl zusammengefasst. Jede Person bekommt ihren eigenen neuen Wert.',
  mut: 'Hier rechnest du nur mit fünf Zahlen je Person: zusammenzählen, teilen oder abzählen. Das übernimmt später R für alle 200 auf einmal.',
  columns: [{ key: 'person', label: 'Person' }, ...ITEMS.map(k => ({ key: k, label: k }))],
  rows: FUENF.map(r => ({ person: r.person, ...Object.fromEntries(ITEMS.map((k, i) => [k, r.answers[i]])) })),
  options: [
    { id: 'mittel', label: 'Mittelwert je Person' },
    { id: 'summe', label: 'Summe je Person' },
    { id: 'zustimmung', label: 'Zustimmungen je Person (5, 6 oder 7)' },
  ],
  steps: [
    {
      title: 'Die Antworten einer Person nebeneinanderlegen',
      was: 'Für jede Person nehmen wir ihre fünf Antworten aus derselben Zeile. Die anderen Personen spielen dabei keine Rolle.',
      warum: 'Der neue Wert soll diese eine Person beschreiben. Deshalb rechnen wir quer durch ihre Zeile, nicht die Spalte hinunter.',
      acht: 'Der Mittelwert einer Spalte, etwa von methoden1, fasst eine Frage über alle Personen zusammen. Das ist die andere Richtung.',
      fach: 'Zeilenweise Operationen fassen mehrere Variablen eines Falls zu einem Wert zusammen.',
      concept: 'row_operations',
    },
    {
      title: 'Zusammenfassen',
      was: 'Je nach Wahl bilden wir den Mittelwert der fünf Antworten, ihre Summe oder zählen, wie oft 5, 6 oder 7 vorkommt.',
      warum: 'Mittelwert und Summe beschreiben, wie zuversichtlich jemand insgesamt ist. Die Zählung sagt, wie oft jemand zustimmt.',
      acht: 'Der Mittelwert bleibt auf der Antwortskala von 1 bis 7 und ist leichter zu lesen. Die Summe reicht von 5 bis 35.',
      fach: 'row_means() bildet den Zeilenmittelwert, row_sums() die Zeilensumme, row_count() die Zahl der Zellen mit bestimmten Werten.',
    },
    {
      title: 'Fehlende Antworten regeln',
      was: 'Wir legen fest, wie viele der fünf Antworten eine Person mindestens gegeben haben muss. Hier verlangen wir alle fünf: min_valid = 5.',
      warum: 'Ein Mittelwert aus nur einer Antwort wäre wenig verlässlich. Die Regel steht vorher fest und gilt für alle gleich.',
      acht: 'Im Lehrdatensatz fehlt keine Antwort, deshalb ändert die Regel hier nichts. In echten Umfragen fehlen oft einzelne Antworten.',
      fach: 'min_valid legt die Mindestzahl gültiger Items fest; wer weniger beantwortet hat, bekommt NA.',
      concept: 'missing',
    },
  ],
  apply: (rows, option) => {
    const o = op(option);
    return {
      columns: [{ key: 'person', label: 'Person' }, ...ITEMS.map(k => ({ key: k, label: k })), { key: o.name, label: o.name }],
      rows: rows.map(r => ({ ...r, [o.name]: num(o.calc(ITEMS.map(k => Number(r[k])))) })),
    };
  },
  rCode: option => [
    'library(dplyr)',
    'library(mariposa)',
    '',
    'atlas <- read_spss("Statistikatlas-200-Befragte.sav")',
    '',
    'atlas <- atlas %>%',
    `  mutate(${op(option).name} = ${op(option).call})`,
  ].join('\n'),
  check: {
    question: 'Welchen neuen Wert bekommt P003 (Antworten 5, 5, 3, 4, 4)?',
    answer: option => op(option).calc(P003),
    right: 'Genau. Jede Person bekommt aus ihren eigenen fünf Antworten genau einen neuen Wert.',
    diagnose: (option, v) => {
      if (v === 'NA') return null;
      const mean = ZEILEN_OPS.mittel.calc(P003), sum = ZEILEN_OPS.summe.calc(P003), agree = ZEILEN_OPS.zustimmung.calc(P003);
      if (option === 'mittel') return close(v, sum) ? 'Fast! Das ist die Summe. Für den Mittelwert teilst du noch durch 5.'
        : close(v, sum / 4) ? 'Fast! Du hast durch 4 geteilt. Es sind fünf Antworten, also teilst du durch 5.'
        : close(v, agree) ? 'Fast! Das ist die Zahl der Zustimmungen. Gefragt ist der Mittelwert.' : null;
      if (option === 'summe') return close(v, mean) ? 'Fast! Das ist der Mittelwert. Für die Summe teilst du nicht durch 5.'
        : close(v, agree) ? 'Fast! Das ist die Zahl der Zustimmungen. Gefragt ist die Summe.' : null;
      return close(v, 3) ? 'Fast! Das sind die Antworten unter 5. Gezählt werden die Antworten 5, 6 oder 7.'
        : close(v, 4) ? 'Fast! Die 4 heißt „Weder noch“ und zählt nicht als Zustimmung.'
        : close(v, sum) || close(v, mean) ? 'Fast! Das ist eine Rechnung mit allen Antworten. Hier zählst du nur, wie oft 5, 6 oder 7 vorkommt.' : null;
    },
  },
  think: [
    {
      question: 'P003 und P004 haben beide das Itemmittel 4,2. Haben sie dieselben Antworten gegeben?', options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'P003 hat 5, 5, 3, 4, 4 angekreuzt, P004 4, 4, 4, 5, 4. Der Mittelwert fasst zusammen und verliert dabei, wie die Antworten verteilt sind.',
      kurz: 'Gleicher Wert, verschiedene Antworten.',
    },
    {
      question: 'Was unterscheidet row_means() von describe(methoden1)?', options: ['row_means() rechnet quer durch eine Person, describe() die Spalte hinunter', 'nichts, beide bilden einen Mittelwert'], correct: 0, step: 1,
      explain: 'row_means() liefert 200 Werte, einen je Person. describe(methoden1) liefert einen Wert für eine Frage über alle 200 Befragten.',
      kurz: 'Zeile oder Spalte: Das ist der Unterschied.',
    },
    {
      question: 'Eine Person lässt eine der fünf Fragen aus. Was liefert row_means() mit min_valid = 5?', options: ['den Mittelwert ihrer vier Antworten', 'NA', '0'], correct: 1, step: 3,
      explain: 'Mit min_valid = 5 braucht es alle fünf Antworten. Sonst steht NA da, nicht 0: Eine fehlende Antwort ist keine Null.',
      kurz: 'min_valid legt fest, wie viele Antworten nötig sind.',
    },
  ],
  genau: {
    kurz: 'Zeilenoperationen rechnen je Person über mehrere Spalten. Welche Spalten zusammengehören, entscheidest du, nicht R.',
    paragraphs: [
      'pick() gibt row_means() die ausgewählten Spalten als kleine Tabelle weiter. Mit pick(starts_with("methoden")) wählst du alle fünf auf einmal.',
      'Ohne min_valid rechnet row_means() mit jeder Zahl gültiger Antworten, auch mit einer einzigen. Für Skalen legt man vorher fest, wie viele es mindestens sein müssen, etwa vier von fünf.',
      'row_count() zählt bestimmte Werte, etwa gewählte Lernquellen: Im Lehrdatensatz haben 17 Befragte keine der drei Quellen gewählt, 39 alle drei.',
      'Wer den Mittelwert bildet, behandelt die Antwortstufen als gleich weit auseinander. Ob die fünf Fragen dasselbe messen, prüft die Reliabilität.',
    ],
  },
};

/** Itemmittel der Methoden-Zuversicht je Person für die aktuellen Daten, mit Kennzahlen. */
export function itemMeans(c: SampleCtx) {
  const cols = ITEMS.map(k => sampleColumn(c.rows, k)), n = c.rows.length;
  const means = c.rows.map((_, i) => cols.reduce((a, col) => a + col[i], 0) / ITEMS.length);
  const mean = means.reduce((a, b) => a + b, 0) / n, sd = Math.sqrt(means.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1));
  return { means, cols, n, mean, sd, min: Math.min(...means), max: Math.max(...means), above: means.filter(v => v > 4 + 1e-9).length, below: means.filter(v => v < 4 - 1e-9).length };
}

const T = (id: string) => titleFor(ref(id));

export const tabsRowOperations: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: 'methoden1' },
    kurz: 'Dieselbe Rechnung für alle 200 Befragten: Jede Person bekommt aus ihren fünf Antworten zur Methoden-Zuversicht ein eigenes Itemmittel.',
    value: c => itemMeans(c).mean,
    result: c => {
      const m = itemMeans(c), who = 1;
      return {
        kurz: `Die ${m.n} Itemmittel reichen von ${num(m.min)} bis ${num(m.max)}; im Schnitt liegen sie bei ${num(m.mean)}. ${m.above} Befragte liegen über der Skalenmitte 4 („Weder noch“), ${m.below} darunter.`,
        fachlich: `row_means() über methoden1 bis methoden5: Mittelwert ${num(m.mean)}, Standardabweichung ${num(m.sd)}, kleinster Wert ${num(m.min)}, größter ${num(m.max)}, n = ${m.n}.`,
        zusatz: `${c.rows[who].id} hat ${m.cols.map(col => num(col[who])).join(', ')} angekreuzt und bekommt ${num(m.means[who])}.`,
      };
    },
    voraussetzung: 'Die fünf Fragen zeigen in dieselbe Richtung und haben dieselben sieben Stufen. Im Lehrdatensatz fehlt keine Antwort.',
    think: [
      {
        question: 'Angenommen, alle kreuzen bei Frage 1 die 7 an. Was passiert mit dem durchschnittlichen Itemmittel?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 0,
        explain: 'Wer vorher weniger als 7 hatte, bekommt bei Frage 1 mehr. Das Itemmittel steigt dann um ein Fünftel davon: (7 − alte Antwort) / 5.',
        kurz: 'Eine Frage zählt ein Fünftel des Itemmittels.',
        tryIt: { label: 'alle bei methoden1 auf 7', op: 'constant', column: 'x', value: 7 },
        expect: { change: 'up' },
      },
      {
        question: 'Angenommen, alle kreuzen bei Frage 1 die 1 an. Was passiert mit dem durchschnittlichen Itemmittel?', options: ['steigt', 'bleibt gleich', 'sinkt'], correct: 2,
        explain: 'Wer vorher mehr als 1 hatte, verliert bei Frage 1. Jede Person sinkt um ein Fünftel ihres Verlusts, die anderen vier Antworten bleiben.',
        kurz: 'Jede Person bekommt ihren eigenen Wert, aus ihrer eigenen Zeile.',
        tryIt: { label: 'alle bei methoden1 auf 1', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'down' },
      },
    ],
  },
  r: {
    entry: 'row_operations', variant: 0,
    tokens: {
      row_means: { sym: 'row_means()', term: T('row_operations'), kurz: 'Bildet je Person den Mittelwert über die ausgewählten Spalten. Das Ergebnis hat eine Zahl je Zeile.', fehler: 'Verlangst du mehr Antworten, als es Spalten gibt, warnt mariposa: `min_valid` (3) is greater than the number of items (2). All rows will be "NA".' },
      min_valid: { sym: 'min_valid =', term: 'Mindestzahl gültiger Antworten', kurz: 'So viele Antworten braucht eine Person mindestens, sonst steht NA da. Hier sind es alle fünf.', fehler: 'Nur ganze Zahlen gehen: min_valid = 2.5 bricht ab mit `min_valid` must be a positive whole number of items.' },
    },
    outputMap: [
      { match: 'Mean', atlas: 'Durchschnitt der Itemmittel', step: 2, explain: 'Der Mittelwert der 200 Itemmittel. Jede Person zählt mit ihrem eigenen Wert einmal.' },
      { match: 'Min', atlas: 'kleinstes Itemmittel', explain: 'Die Person mit der geringsten Zuversicht kommt im Mittel auf 1,2.' },
      { match: 'Max', atlas: 'größtes Itemmittel', explain: 'Mindestens eine Person hat bei allen fünf Fragen die 7 angekreuzt.' },
      { match: 'N', atlas: 'n', step: 3, explain: 'Alle 200 haben einen Wert. Mit min_valid = 5 stünde bei fehlenden Antworten NA da.' },
    ],
    check: {
      question: 'Welche Zahl ist der Durchschnitt der 200 Itemmittel? Tippe sie an.', correct: 'Mean',
      wrong: {
        SD: 'Fast! Das ist die Standardabweichung der Itemmittel. Der Durchschnitt steht unter Mean.',
        Min: 'Fast! Das ist das kleinste Itemmittel. Der Durchschnitt steht unter Mean.',
        Max: 'Fast! Das ist das größte Itemmittel. Der Durchschnitt steht unter Mean.',
      },
    },
  },
  next: {
    next: { id: 'item_score', why: 'Der Mittelwert über gleich gepolte Fragen zum selben Thema ist ein Skalenwert.' },
    before: [
      { id: 'missing', why: 'min_valid regelt, wie viele Antworten eine Person mindestens braucht.' },
      { id: 'recode', why: 'Umgekehrt formulierte Fragen polst du vorher um.' },
    ],
    after: [
      { id: 'reliability', why: 'Prüft, ob die Fragen genug zusammenpassen, um sie zusammenzufassen.' },
    ],
    more: [
      { id: 'multiple_response', why: 'row_count() zählt, wie viele Lernquellen eine Person gewählt hat.' },
      { id: 'mean', why: 'Der Mittelwert einer Spalte fasst eine Frage über alle Personen zusammen.' },
    ],
  },
};
