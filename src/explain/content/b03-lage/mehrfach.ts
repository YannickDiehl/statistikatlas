// Werkstatt „Mehrfachantworten“ (multiple_response): fünf Personen kreuzen ihre Lernquellen an (Buch, Video, Kurs),
// gezählt wird je Option, geteilt einmal durch alle Kreuze und einmal durch alle Personen. Die Daten sind drei Spalten,
// keine Reihe und kein Paar; deshalb bekommt der Begriff statt einer Brücke eine Auswertung mit den 200 Befragten.
// Referenzwerte in R: b03-lage.test.ts.
import type { ConceptTabs, Ctx, SampleCtx, Workshop } from '../../types';
import { num, pct, unit } from '../../format';
import { sampleColumn } from '../../sample';

export const OPTIONEN = ['Buch', 'Video', 'Kurs'] as const;
export const QUELLEN = ['quelle_buch', 'quelle_video', 'quelle_kurs'] as const;

/** Kennwerte der Mehrfachantworten; `rows` je Person [Buch, Video, Kurs] mit 1 = angekreuzt. */
export interface Mehrfach {
  rows: number[][]; n: number;
  counts: number[]; total: number; perPerson: number[];
  respPct: number[]; casePct: number[]; caseSum: number; respSum: number; none: number;
}

export function mehrfach(rows: readonly (readonly number[])[]): Mehrfach {
  const n = rows.length, counts = OPTIONEN.map((_, j) => rows.reduce((a, r) => a + (r[j] === 1 ? 1 : 0), 0));
  const total = counts.reduce((a, b) => a + b, 0), perPerson = rows.map(r => r.filter(v => v === 1).length);
  const casePct = counts.map(k => k / n * 100);
  return {
    rows: rows.map(r => [...r]), n, counts, total, perPerson,
    respPct: counts.map(k => total ? k / total * 100 : 0), casePct, caseSum: casePct.reduce((a, b) => a + b, 0), respSum: total ? 100 : 0,
    none: perPerson.filter(k => k === 0).length,
  };
}

type C = Ctx<Mehrfach>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const V = 1; // Video: die Option der Kontrollfragen
const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';
const list = (xs: string[]) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} und ${xs[xs.length - 1]}`;
const chosen = (c: C) => { const r = c.s.rows[c.who], j = OPTIONEN.filter((_, k) => r[k] === 1); return j.length ? list(j) : 'nichts'; };
/** Prozent mit höchstens zwei Nachkommastellen, wie im Atlas üblich. */
const p2 = (v: number) => `${num(v)} %`;

export const mehrfachantworten: Workshop<number[][], Mehrfach> = {
  id: 'b03-mehrfach',
  wofuer: 'Fünf Personen sagen, womit sie in den letzten sieben Tagen gelernt haben: Buch, Video, Kurs; mehrere Antworten sind möglich. Wie viele nutzen Videos? Und welchen Anteil haben Videos an allem, was genannt wurde? Das sind zwei verschiedene Prozente.',
  mut: 'Hier zählst du Kreuze und teilst zweimal: einmal durch alle Kreuze, einmal durch alle Personen. Mehr steckt nicht dahinter. Das Rechnen übernimmt später R.',
  picture: 'b03-mehrfach',
  dataNote: 'Fünf Beispielpersonen, je Lernquelle ein Kästchen. Tippe ein Kästchen an, um ein Kreuz zu setzen oder zu entfernen.',
  names: NAMES,
  bounds: { min: 0, max: 1 },
  presets: [
    { id: 'A', label: 'Gruppe 1: E ohne Kreuz', data: [[1, 0, 1], [1, 1, 0], [0, 1, 0], [1, 1, 1], [0, 0, 0]] },
    { id: 'B', label: 'Jede Person ein Kreuz', data: [[1, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1], [1, 0, 0]] },
  ],
  compute: mehrfach,
  glyphs: [
    { sym: 'nⱼ', say: 'n j', term: 'Nennungen', plain: 'wie oft Option j angekreuzt wurde', step: 1 },
    { sym: 'Σnⱼ', say: 'Sigma n j', term: 'alle Nennungen', plain: 'alle Kreuze zusammen', step: 2 },
    { sym: 'n', say: 'n', term: 'gültige Fälle', plain: 'alle Personen, auch ohne Kreuz', step: 4 },
  ],
  steps: [
    {
      button: 'nⱼ', title: 'Kreuze je Lernquelle zählen', sym: 'nⱼ', say: 'n j', concept: 'frequency', perPerson: true,
      was: 'Für jede Lernquelle zählen wir die Kreuze, Spalte für Spalte. Eine Person kann in mehreren Spalten ein Kreuz haben.',
      rechnung: c => `Buch ${c.s.counts[0]}, Video ${c.s.counts[1]}, Kurs ${c.s.counts[2]}. Person ${P(c)} hat ${chosen(c)} angekreuzt.`,
      fach: 'Die Nennungen nⱼ zählen, wie viele Personen die Option j gewählt haben, wie eine Häufigkeit je Option.',
      warum: 'Jede Option ist eine eigene Ja-nein-Frage. Erst die Zählung je Spalte zeigt, welche Quelle wie oft genutzt wird.',
      acht: 'Zähl spaltenweise, nicht zeilenweise. Die Kreuze einer Person gehören zu verschiedenen Lernquellen.',
      check: {
        question: 'Wie oft wurde Video angekreuzt?',
        answer: c => c.s.counts[V],
        diagnose: (c, v) => v !== 'NA' && v === c.s.perPerson[c.who] && v !== c.s.counts[V] ? `Fast! Das sind die Kreuze von Person ${P(c)}. Gefragt ist die Spalte Video.` : null,
      },
    },
    {
      button: 'Σnⱼ', title: 'Alle Kreuze zusammenzählen', sym: 'Σnⱼ', say: 'Sigma n j', concept: 'sum', perPerson: false,
      was: 'Wir zählen die Kreuze aller drei Lernquellen zusammen. Das sind alle Nennungen.',
      rechnung: c => `${c.s.counts.join(' + ')} = ${c.s.total} Kreuze.`,
      fach: 'Die Summe der Nennungen Σnⱼ zählt alle gewählten Antworten zusammen.',
      warum: 'Diese Zahl ist die Basis für den Anteil einer Quelle an allem, was genannt wurde.',
      acht: 'Es gibt meist mehr Kreuze als Personen. Wer zwei Quellen nennt, zählt hier doppelt.',
      check: {
        question: 'Wie viele Kreuze sind es insgesamt?',
        answer: c => c.s.total,
        diagnose: (c, v) => v !== 'NA' && v === c.s.n && c.s.total !== c.s.n ? 'Fast! 5 ist die Zahl der Personen. Gezählt werden die Kreuze, und eine Person kann mehrere setzen.' : null,
      },
    },
    {
      button: '÷ Σnⱼ', title: 'Durch alle Kreuze teilen', sym: '% Antworten', say: 'Prozent der Antworten', concept: 'multiple_response', perPerson: false,
      was: 'Wir teilen die Kreuze einer Quelle durch alle Kreuze. Das ergibt ihren Anteil an allen Nennungen.',
      rechnung: c => `Video: ${c.s.counts[V]} / ${c.s.total} ${eq(c.s.respPct[V])} ${p2(c.s.respPct[V])}. Alle drei zusammen: 100 %.`,
      fach: 'Die Prozente der Antworten sind 100 · nⱼ / Σnⱼ. Sie ergeben zusammen immer 100 %.',
      warum: 'So siehst du, welchen Teil aller genannten Quellen Videos ausmachen.',
      acht: 'Diese Prozente sagen nicht, wie viele Personen Videos nutzen. Dafür teilst du im nächsten Schritt durch die Personen.',
      check: {
        question: 'Wie viel Prozent aller Kreuze gehen an Video? Zwei Nachkommastellen reichen.',
        answer: c => c.s.respPct[V],
        diagnose: (c, v) => v !== 'NA' && Math.abs(c.s.casePct[V] - c.s.respPct[V]) > 0.011 && Math.abs(v - c.s.casePct[V]) < 0.011 ? 'Fast! Das ist der Anteil an den Personen. Hier teilst du durch alle Kreuze.' : null,
      },
    },
    {
      button: '÷ n', title: 'Durch alle Personen teilen', sym: '% Fälle', say: 'Prozent der Fälle', concept: 'multiple_response', perPerson: true,
      was: 'Jetzt teilen wir die Kreuze einer Quelle durch die Zahl der Personen, n = 5. Das ergibt den Anteil der Personen, die sie nutzen.',
      rechnung: c => `Video: ${c.s.counts[V]} / ${c.s.n} = ${p2(c.s.casePct[V])} der Personen. Person ${P(c)} zählt als ein Fall${c.s.perPerson[c.who] ? '' : ', auch ohne ein Kreuz'}.`,
      fach: 'Die Prozente der Fälle sind 100 · nⱼ / n, mit n als Zahl der gültigen Fälle. Wer nichts angekreuzt hat, bleibt ein gültiger Fall.',
      warum: 'Diese Zahl beantwortet die Frage „Wie viele nutzen Videos?“. Meistens ist sie die gesuchte.',
      acht: 'Auch Personen ohne Kreuz gehören in n. Wer sie weglässt, macht alle Anteile zu groß.',
      check: {
        question: 'Wie viel Prozent der Personen haben Video angekreuzt?',
        answer: c => c.s.casePct[V],
        diagnose: (c, v) => v !== 'NA' && Math.abs(c.s.casePct[V] - c.s.respPct[V]) > 0.011 && Math.abs(v - c.s.respPct[V]) < 0.011 ? `Fast! Das ist der Anteil an allen Kreuzen. Hier teilst du durch die Zahl der Personen, n = ${c.s.n}.` : null,
      },
    },
    {
      button: 'Σ %', title: 'Die Prozente zusammenzählen', sym: '', concept: 'multiple_response', perPerson: false,
      was: 'Wir zählen die Prozente der Fälle aller drei Quellen zusammen. Das Ergebnis darf über 100 % liegen.',
      rechnung: c => `${c.s.casePct.map(p2).join(' + ')} = ${p2(c.s.caseSum)}.`,
      fach: 'Die Fallprozente summieren sich auf 100 · Σnⱼ / n. Das ist mehr als 100 %, sobald Personen im Schnitt mehr als eine Option wählen.',
      warum: c => `Die Summe zeigt, wie viele Quellen eine Person im Schnitt nutzt: ${p2(c.s.caseSum)} heißt ${unit(c.s.caseSum / 100, 'Quelle', 'Quellen')} je Person.`,
      acht: 'Eine Summe über 100 % ist hier kein Rechenfehler. Sie entsteht, weil eine Person bei mehreren Lernquellen mitzählt.',
      check: {
        question: 'Wie viel Prozent ergeben die Prozente der Fälle zusammen?',
        answer: c => c.s.caseSum,
        diagnose: (c, v) => v !== 'NA' && v === 100 && Math.abs(c.s.caseSum - 100) > 0.011 ? 'Fast! 100 % ergeben nur die Prozente der Antworten. Die Prozente der Fälle können mehr ergeben, weil Personen mehrere Kreuze setzen.' : null,
      },
    },
  ],
  numeric: (c, last) => [
    'Video: ', { part: [`n = ${c.s.counts[V]}`], m: 1 }, ', ', { part: [`Σnⱼ = ${c.s.total}`], m: 2 }, { br: true },
    { part: [`% Antworten = 100 · ${c.s.counts[V]} / ${c.s.total} ${eq(c.s.respPct[V])} ${p2(c.s.respPct[V])}`], m: 3 }, { br: true },
    { part: [`% Fälle = 100 · ${c.s.counts[V]} / ${c.s.n} = ${p2(c.s.casePct[V])}`], m: 4 },
    ...(last >= 5 ? [{ br: true } as const, { part: [`alle Fälle zusammen ${p2(c.s.caseSum)}`], m: 5 }] : []),
  ],
  table: {
    columns: [
      ...OPTIONEN.map((o, j) => ({ head: o, from: 1, active: [1], cell: (c: C, i: number) => c.s.rows[i][j] === 1 ? '1' : '0', sum: (c: C) => String(c.s.counts[j]), sumFrom: 1 })),
      { head: 'Kreuze der Person', from: 2, active: [2], cell: (c: C, i: number) => String(c.s.perPerson[i]), sum: (c: C) => String(c.s.total), sumFrom: 2 },
    ],
    lines: [
      { from: 3, step: 3, text: c => `% der Antworten: ${OPTIONEN.map((o, j) => `${o} ${c.s.counts[j]} / ${c.s.total} ${eq(c.s.respPct[j])} ${p2(c.s.respPct[j])}`).join(', ')}` },
      { from: 4, step: 4, text: c => `% der Fälle: ${OPTIONEN.map((o, j) => `${o} ${c.s.counts[j]} / ${c.s.n} = ${p2(c.s.casePct[j])}`).join(', ')}` },
      { from: 5, step: 5, text: c => `Zusammen: ${p2(c.s.caseSum)} der Fälle ${Math.abs(c.s.caseSum - 100) < 0.005 ? 'und' : 'gegenüber'} 100 % der Antworten` },
    ],
  },
  captions: {
    1: 'Ein grünes Kästchen ist ein Kreuz. Unter jeder Spalte steht, wie oft sie angekreuzt wurde.',
    2: 'Rechts steht, wie viele Kreuze jede Person gesetzt hat; ganz unten alle zusammen.',
    3: 'Die hellen Balken zeigen den Anteil jeder Quelle an allen Kreuzen.',
    4: 'Die dunklen Balken zeigen den Anteil der Personen, die eine Quelle nutzen.',
    5: 'Die dunklen Balken zusammen sind länger als 100 %, die hellen genau 100 %.',
  },
  think: [
    {
      question: 'Jede der fünf Personen setzt genau ein Kreuz. Was ergeben die Prozente der Fälle zusammen?', options: ['100 %', 'mehr als 100 %', 'weniger als 100 %'], correct: 0, step: 5,
      explain: 'Dann gibt es genauso viele Kreuze wie Personen. Prozente der Fälle und Prozente der Antworten sind gleich und ergeben zusammen 100 %.',
      kurz: 'Ein Kreuz je Person: beide Prozente gleich.',
      tryIt: { label: 'Jede Person ein Kreuz', apply: () => [[1, 0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1], [1, 0, 0]] },
    },
    {
      question: 'Eine Person hat kein Kreuz gesetzt. Gehört sie in die Zahl der Fälle?', options: ['ja', 'nein'], correct: 0, step: 4,
      explain: 'Keine Quelle genutzt ist eine gültige Antwort. Fehlend wäre die Person nur, wenn alle drei Angaben fehlen.',
      kurz: 'Kein Kreuz heißt nicht fehlend.',
    },
    {
      question: 'Alle fünf nutzen zusätzlich Videos. Was passiert mit dem Anteil von Video an allen Kreuzen?', options: ['steigt, aber nicht auf 100 %', 'steigt auf 100 %', 'bleibt gleich'], correct: 0, step: 3,
      explain: 'Video bekommt fünf Kreuze, die Fallprozente steigen auf 100 %. An allen Kreuzen bleibt Video aber nur ein Teil, weil auch Buch und Kurs genannt werden.',
      kurz: 'Alle nutzen es heißt nicht: Es ist alles, was genannt wird.',
      tryIt: { label: 'alle kreuzen Video an', apply: d => d.map(r => [r[0], 1, r[2]]) },
    },
  ],
  variants: {
    multiple_response: {
      lastStep: 5,
      kurz: 'Bei Mehrfachantworten darf jede Person mehrere Kreuze setzen. Deshalb gibt es zwei Prozente: den Anteil an allen Kreuzen und den Anteil an allen Personen.',
      fachlich: 'Je Option zählt man die Nennungen. Prozente der Antworten teilen durch alle Nennungen, Prozente der Fälle durch die gültigen Fälle; diese können zusammen über 100 % liegen.',
      symbolic: ['% Fälle = 100 · ', { frac: [{ part: ['n', { sub: 'j' }], m: 1 }], den: [{ part: ['n'], m: 4 }], m: 4 }, ',  % Antworten = 100 · ', { frac: [{ part: ['n', { sub: 'j' }], m: 1 }], den: [{ part: ['Σn', { sub: 'j' }], m: 2 }], m: 3 }],
      aria: 'Prozent der Fälle gleich 100 mal n j geteilt durch n; Prozent der Antworten gleich 100 mal n j geteilt durch die Summe aller n j',
      metrics: [
        { label: 'Kreuze insgesamt', value: c => String(c.s.total) },
        { label: 'Video: % der Fälle', value: c => p2(c.s.casePct[V]) },
        { label: 'Fälle zusammen', value: c => p2(c.s.caseSum) },
      ],
      interpret: c => {
        const s = c.s, sum = Math.abs(s.caseSum - 100) < 0.005 ? 'Zusammen genau 100 %.' : s.caseSum > 100 ? `Zusammen sind das ${p2(s.caseSum)}, weil manche mehrere Quellen nutzen.` : `Zusammen nur ${p2(s.caseSum)}, weil manche gar keine Quelle angekreuzt haben.`;
        return {
          kurz: `${p2(s.casePct[0])} der fünf haben mit einem Buch gelernt, ${p2(s.casePct[1])} mit Videos, ${p2(s.casePct[2])} mit einem Kurs. ${sum}`,
          fachlich: `Nennungen ${s.counts.join(', ')}, zusammen ${s.total}. Prozente der Antworten: ${s.respPct.map(p2).join(', ')}; Prozente der Fälle: ${s.casePct.map(p2).join(', ')}.`,
        };
      },
      genau: {
        kurz: 'R zählt mit counted = 1 die Einsen jeder Option. Wer keine Option gewählt hat, bleibt ein gültiger Fall.',
        paragraphs: () => [
          'In mariposa: multiple_response(quelle_buch, quelle_video, quelle_kurs, counted = 1). Die Spalte Responses % zeigt die Prozente der Antworten, % of Cases die Prozente der Fälle.',
          'Als fehlend zählt eine Person erst, wenn alle Optionen fehlen; R meldet sie unter Excluded (all missing). Eine 0 in allen Optionen ist dagegen eine gültige Antwort: keine Quelle genutzt.',
          'Welche Basis passt, hängt von der Frage ab. „Wie viele Befragte nutzen Videos?“ beantworten die Prozente der Fälle, „Welchen Anteil haben Videos an allen genannten Quellen?“ die Prozente der Antworten.',
        ],
      },
    },
  },
};

/** Mehrfachantworten der 200 Befragten aus den drei Spalten der Lernquellen. */
export function mehrfachOf(c: SampleCtx): Mehrfach {
  const cols = [c.columns.x?.[0] ?? QUELLEN[0], c.columns.y?.[0] ?? QUELLEN[1], c.columns.z?.[0] ?? QUELLEN[2]].map(id => sampleColumn(c.rows, id));
  return mehrfach(c.rows.map((_, i) => cols.map(col => col[i])));
}

export const multipleResponseTabs: ConceptTabs = {
  sample: {
    kind: 'analysis', columns: { x: QUELLEN[0], y: QUELLEN[1], z: QUELLEN[2] },
    kurz: 'Dieselbe Rechnung mit allen 200 Befragten: Welche Lernquellen haben sie in den letzten sieben Tagen genutzt?',
    value: c => mehrfachOf(c).caseSum,
    result: c => {
      const s = mehrfachOf(c), more = s.caseSum > 100.005 ? ', weil viele mehrere Quellen nutzen' : '';
      return {
        kurz: `${pct(s.casePct[0] / 100)} der ${s.n} Befragten haben in den letzten sieben Tagen mit einem Buch gelernt, ${pct(s.casePct[1] / 100)} mit Videos und ${pct(s.casePct[2] / 100)} mit einem Kurs. Zusammen sind das ${pct(s.caseSum / 100)}${more}.`,
        fachlich: `${s.total} Nennungen bei ${s.n} gültigen Fällen. Prozente der Antworten: Buch ${pct(s.respPct[0] / 100)}, Video ${pct(s.respPct[1] / 100)}, Kurs ${pct(s.respPct[2] / 100)}; Prozente der Fälle: ${s.casePct.map(v => pct(v / 100)).join(', ')}.`,
        zusatz: `${s.none} Befragte haben keine der drei Quellen genutzt; sie zählen trotzdem als Fälle.`,
      };
    },
    voraussetzung: 'Die drei Spalten gehören zur selben Frage, 1 heißt gewählt. Wer keine Quelle gewählt hat, ist ein gültiger Fall mit lauter Nullen.',
    think: [
      {
        question: 'Angenommen, alle 200 hätten auch mit einem Buch gelernt. Wie viel Prozent der Fälle zeigt R dann für Buch?', options: ['100', '60', '48'], correct: 0,
        explain: 'Alle 200 haben bei Buch eine 1: 200 / 200 = 100 % der Fälle. An allen Kreuzen hat Buch aber nur einen Teil, in den Ausgangsdaten dann 200 von 416, also 48,1 %.',
        kurz: 'Alle nutzen es heißt nicht: Es ist alles, was genannt wird.',
        tryIt: { label: 'alle haben ein Buch genutzt', op: 'constant', column: 'x', value: 1 },
        expect: { change: 'equals', value: 100, measure: c => mehrfachOf(c).casePct[0] },
      },
      {
        question: 'Angenommen, niemand hätte Videos genutzt. Wie viele gültige Fälle zählt R dann?', options: ['200', '87', '183'], correct: 0,
        explain: 'Eine 0 heißt „nicht gewählt“, nicht „fehlend“. Auch wer jetzt keine einzige Quelle mehr angekreuzt hat, bleibt ein gültiger Fall.',
        kurz: 'Kein Kreuz heißt nicht fehlend.',
        tryIt: { label: 'niemand hat Videos genutzt', op: 'constant', column: 'y', value: 0 },
        expect: { change: 'equals', value: 200, measure: c => mehrfachOf(c).n },
      },
    ],
  },
  r: {
    entry: 'multiple_response', variant: 0,
    tokens: {
      counted: { sym: 'counted =', term: 'gezählter Wert', kurz: 'Welcher Code als „gewählt“ zählt. In den drei Spalten heißt 1 gewählt und 0 nicht gewählt.', fehler: 'Mit counted = 2 findet R keinen einzigen gewählten Wert: Alle Nennungen sind 0, ohne Fehlermeldung.' },
    },
    outputMap: [
      { match: 'Responses n', atlas: 'Nennungen nⱼ', step: 1, explain: 'Responses n zählt die Kreuze je Lernquelle: 121 Befragte haben ein Buch genutzt.' },
      { match: 'Responses %', atlas: '% der Antworten', step: 3, explain: 'Der Anteil an allen 337 Kreuzen. Diese Spalte ergibt zusammen 100 %.' },
      { match: '% of Cases', atlas: '% der Fälle', step: 4, explain: 'Der Anteil an allen 200 Befragten. Diese Spalte ergibt zusammen 168,5 %.' },
    ],
    check: {
      question: 'Welche Zahl sagt, wie viel Prozent der Befragten mit einem Buch gelernt haben? Tippe sie an.', correct: '% of Cases',
      wrong: {
        'Responses %': 'Fast! Das ist der Anteil von Buch an allen Kreuzen. Der Anteil an den Befragten steht unter % of Cases.',
        'Responses n': 'Fast! Das ist die Zahl der Kreuze bei Buch. Der Anteil an den Befragten steht unter % of Cases.',
      },
    },
  },
  next: {
    next: { id: 'crosstab', why: 'Zählt Kombinationen zweier Fragen, etwa Lernquelle Buch nach Weiterbildung.' },
    before: [
      { id: 'frequency', why: 'Jede Option einzeln gezählt, wie in einer gewöhnlichen Häufigkeitstabelle.' },
      { id: 'validn', why: 'Die gültigen Fälle sind die Basis der Fallprozente.' },
    ],
    after: [{ id: 'dummy', why: 'Jede Option ist eine Spalte mit 0 und 1, die nur ja oder nein sagt.' }],
    more: [{ id: 'labels', why: 'In der Ausgabe heißen die Optionen nach ihren Variablenlabels, etwa Lernquelle Buch.' }],
  },
};
