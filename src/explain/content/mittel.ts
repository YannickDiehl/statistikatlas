// Werkstatt „Arithmetisches Mittel“ (Stufe 1). Wortlaut: docs/superpowers/specs/2026-09-30-freie-karte-formelwerkstatt/01-arithmetisches-mittel.md
import type { Ctx, Workshop } from '../types';
import { series, type Series } from '../math';
import { num, signed, close } from '../format';

type C = Ctx<Series>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const werte = (c: C) => c.s.xs.join(' + ');

export const mittel: Workshop<number[], Series> = {
  id: 'mittel',
  wofuer: 'Wo stehen die Befragten einer Gruppe politisch im Durchschnitt? Fünf Beispielpersonen stufen sich auf der Links-rechts-Skala des ALLBUS ein (1 = ganz links, 10 = ganz rechts).',
  names: NAMES,
  bounds: { min: 1, max: 10 },
  presets: [
    { id: 'B', label: 'Gruppe B: 1 3 5 7 9', data: [1, 3, 5, 7, 9] },
    { id: 'A', label: 'Gruppe A: 4 5 5 5 6', data: [4, 5, 5, 5, 6] },
    { id: 'ausreisser', label: 'Mit Ausreißer: 1 3 5 7 10', data: [1, 3, 5, 7, 10] },
  ],
  compute: series,
  glyphs: [
    { sym: 'x̄', say: '„x quer“', term: 'Arithmetisches Mittel', plain: 'die Mitte der Gruppe', step: 2 },
    { sym: 'xᵢ', say: '„x i“', term: 'Beobachtung', plain: 'der Wert von Person i', step: 1 },
    { sym: 'i', say: '„i“', term: 'Laufindex', plain: 'die Nummer der Person, von 1 bis n', step: 1 },
    { sym: 'n', say: '„n“', term: 'Fallzahl', plain: 'wie viele Personen, hier 5', step: 2 },
    { sym: 'Σ', say: '„Sigma“', term: 'Summenzeichen', plain: 'alles addieren, jede Person einmal', step: 1 },
  ],
  steps: [
    {
      button: 'Σ', sym: 'Σxᵢ', concept: 'sum', perPerson: true,
      kurz: 'Alle Werte werden zusammengezählt.',
      fachlich: 'Das Summenzeichen Σ addiert die Beobachtungen xᵢ aller n Personen.',
      vorgerechnet: c => `${werte(c)} = ${num(c.s.sum)}. Person ${c.names[c.who]} trägt ihren Wert ${c.s.xs[c.who]} dazu bei, wie alle anderen auch.`,
      alltag: 'Wie beim Zusammenlegen: Alle werfen ihre Punkte in einen gemeinsamen Topf.',
      warum: 'Der Mittelwert soll alle Personen berücksichtigen, jede genau einmal. Dafür sorgt Σ: Der Laufindex i geht von 1 bis n.',
      fehler: 'Eine Person vergessen oder doppelt zählen. Zähle nach: Es müssen n = 5 Summanden sein.',
      check: {
        question: 'Wie groß ist die Summe Σxᵢ?',
        answer: c => c.s.sum,
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          if (c.s.xs.some(x => x !== 0 && close(v, c.s.sum - x))) return 'Da fehlt eine Person. Es müssen 5 Summanden sein.';
          if (c.s.xs.some(x => x !== 0 && close(v, c.s.sum + x))) return 'Eine Person ist doppelt gezählt.';
          return null;
        },
      },
    },
    {
      button: '÷ n', sym: 'x̄', concept: 'mean', also: 'Division der Summe durch n', perPerson: false,
      kurz: 'Die Summe wird gerecht auf alle verteilt.',
      fachlich: 'Die Summe geteilt durch die Fallzahl n ergibt das arithmetische Mittel x̄.',
      vorgerechnet: c => `${num(c.s.sum)} / 5 = ${num(c.s.mean)}. Hätten alle fünf dieselbe Einstufung, läge sie bei ${num(c.s.mean)}.`,
      alltag: 'Wie beim Teilen einer Rechnung: der Gesamtbetrag geteilt durch die Zahl der Personen.',
      warum: 'Ohne das Teilen wüchse die Zahl mit jeder weiteren Person. Erst das Teilen macht Gruppen unterschiedlicher Größe vergleichbar.',
      fehler: 'Durch n − 1 teilen. Das gehört zur Varianz; beim Mittelwert wird durch n geteilt.',
      check: {
        question: 'Wie groß ist x̄?',
        answer: c => c.s.mean,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.sum) ? 'Das ist noch die Summe. Jetzt durch n = 5 teilen.'
          : close(v, c.s.sum / 4) ? 'Beim Mittelwert durch n = 5 teilen, nicht durch n − 1.'
          : null,
      },
    },
  ],
  numeric: c => [
    'x̄ = (', ...c.s.xs.flatMap((x, i) => i ? [' ', { part: ['+'], m: 1 }, ' ', { part: [String(x)], m: 1 }] : [{ part: [String(x)], m: 1 }]),
    ') ', { part: ['/ 5'], m: 2 }, ' = ', { part: [num(c.s.sum)], m: 1 }, ' ', { part: ['/ 5'], m: 2 }, ' = ', { part: [num(c.s.mean)], m: 2 },
  ],
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.xs[i]), sum: c => num(c.s.sum), sumFrom: 1 },
      { head: 'xᵢ − x̄', from: 2, active: [2], cell: (c, i) => signed(c.s.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer' },
    ],
    lines: [{ from: 2, step: 2, text: c => `x̄ = ${num(c.s.sum)} / 5 = ${num(c.s.mean)}` }],
  },
  captions: {
    1: 'Die fünf Einstufungen auf dem Zahlenstrahl. Punkte lassen sich ziehen.',
    2: 'Links und rechts gleichen sich die Abstände genau aus. Deshalb ist x̄ der Ausgleichspunkt.',
  },
  think: [
    {
      question: 'Person E rückt von 9 auf 10. Um wie viel ändert sich x̄?', options: ['um 1', 'um 0,2', 'gar nicht'], correct: 1, step: 2,
      explain: 'Die Summe wächst um 1, geteilt durch n = 5 ergibt +0,2. Jede Person bewegt den Mittelwert um ein n-tel ihrer eigenen Änderung.',
      kurz: 'Einzelne zählen, aber nur anteilig.',
      tryIt: { label: 'E auf 10', apply: d => d.map((x, i) => i === 4 ? 10 : x) },
    },
    {
      question: 'Muss der Mittelwert ein Wert sein, den jemand angegeben hat?', options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'Bei 1 3 5 7 10 ist x̄ = 5,2, und niemand hat 5,2 angegeben. Der Mittelwert ist ein Rechenwert, kein beobachteter Wert.',
      kurz: 'Der Durchschnitt muss nicht vorkommen.',
      tryIt: { label: 'Mit Ausreißer', apply: () => [1, 3, 5, 7, 10] },
    },
    {
      question: 'Was ergibt die Summe aller Abweichungen xᵢ − x̄?', options: ['0', 'n', 'hängt von den Daten ab'], correct: 0, step: 2,
      explain: 'Der Mittelwert ist genau der Punkt, an dem sich die Abweichungen nach links und nach rechts ausgleichen, wie bei einer Wippe im Gleichgewicht. Die Summenzeile der Tabelle zeigt es.',
      kurz: 'Die Wippe ist immer im Gleichgewicht.',
    },
    {
      question: 'Ein Tippfehler: Statt 9 steht 90 im Datensatz. Was passiert mit x̄?', options: ['ändert sich kaum', 'springt stark nach oben'], correct: 1, step: 1,
      explain: 'Die Summe wird 106, geteilt durch 5 ergibt 21,2, weit außerhalb der Skala. Deshalb zuerst die Daten prüfen. Robuster gegen Ausreißer ist der Median.',
      kurz: 'Ein einziger falscher Wert kann den Mittelwert weit verschieben.',
    },
  ],
  variants: {
    mean: {
      lastStep: 2,
      kurz: 'Der Mittelwert ist der Ausgleichspunkt. Würde man alle Werte gerecht verteilen, bekäme jede Person genau ihn.',
      fachlich: 'Das arithmetische Mittel x̄ ist die Summe aller Beobachtungen geteilt durch die Fallzahl n.',
      symbolic: ['x̄ = ', { frac: [{ big: 'Σ', m: 1 }, { part: ['x', { sub: 'i' }], m: 1 }], den: [{ part: ['n'], m: 2 }], m: 2 }],
      aria: 'x quer gleich Summe über alle Personen i von x i, geteilt durch n',
      metrics: [{ label: 'Mittelwert x̄', value: c => num(c.s.mean) }],
      interpret: c => ({
        kurz: `Im Durchschnitt stufen sich die fünf bei ${num(c.s.mean)} ein, ${c.s.mean < 5.5 ? 'links der Skalenmitte 5,5' : c.s.mean === 5.5 ? 'genau auf der Skalenmitte 5,5' : 'rechts der Skalenmitte 5,5'}.`,
        fachlich: `x̄ = ${num(c.s.mean)}. Wie einig sich die Gruppe ist, sagt der Mittelwert nicht: Gruppe A und Gruppe B haben beide x̄ = 5. Das misst die Standardabweichung.`,
      }),
      genau: {
        kurz: 'Der Mittelwert ist nur sinnvoll, wenn die Abstände zwischen den Werten etwas bedeuten.',
        paragraphs: () => [
          'Die Links-rechts-Skala hier wie eine metrische Skala zu behandeln, ist eine Annahme: Gleiche Zahlenabstände sollen gleiche inhaltliche Abstände bedeuten. Für geordnete Kategorien ohne diese Annahme eignet sich der Median.',
          'Der Mittelwert ist der Wert, für den die Summe der quadrierten Abweichungen am kleinsten ist. Deshalb misst man die Streuung um ihn herum (Werkstatt Standardabweichung).',
          'In gewichteten Stichproben wie dem ALLBUS zählt jede Person mit ihrem Gewicht: x̄w = Σwᵢxᵢ / Σwᵢ (Begriff „Gewichte“).',
        ],
      },
    },
  },
};
