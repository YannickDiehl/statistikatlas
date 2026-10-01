// Werkstatt „Arithmetisches Mittel“. Ton nach dem gebilligten Beispiel der Streuung (src/explain/content/streuung.ts).
import type { Ctx, Workshop } from '../types';
import { series, type Series } from '../math';
import { num, signed, close } from '../format';
import { bridgeMittel } from './pilot-tabs';

type C = Ctx<Series>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const werte = (c: C) => c.s.xs.join(' + ');

export const mittel: Workshop<number[], Series> = {
  id: 'mittel',
  bridge: bridgeMittel,
  wofuer: 'Fünf Personen sagen, wo sie sich politisch einordnen: von 1 (ganz links) bis 10 (ganz rechts). Wo steht die Gruppe im Durchschnitt? Der Mittelwert beantwortet das mit einer einzigen Zahl.',
  mut: 'Die Formel hat nur zwei Schritte, und du kennst beide: zusammenzählen und teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'mittel',
  names: NAMES,
  bounds: { min: 1, max: 10 },
  presets: [
    { id: 'B', label: 'Gruppe B: 1 3 5 7 9', data: [1, 3, 5, 7, 9] },
    { id: 'A', label: 'Gruppe A: 4 5 5 5 6', data: [4, 5, 5, 5, 6] },
    { id: 'randwert', label: 'Mit Randwert: 1 3 5 7 10', data: [1, 3, 5, 7, 10] },
  ],
  compute: series,
  glyphs: [
    { sym: 'x̄', say: 'x quer', term: 'Arithmetisches Mittel', plain: 'die Mitte der Gruppe', step: 2 },
    { sym: 'xᵢ', say: 'x i', term: 'Beobachtung', plain: 'die Antwort von Person i', step: 1 },
    { sym: 'i', say: 'i', term: 'Laufindex', plain: 'die Nummer der Person, von 1 bis n', step: 1 },
    { sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele Personen, hier 5', step: 2 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jede Person einmal', step: 1 },
  ],
  steps: [
    {
      button: 'Σ', title: 'Alles zusammenzählen', sym: 'Σxᵢ', say: 'Sigma x i', concept: 'sum', perPerson: true,
      was: 'Wir zählen die Antworten aller fünf Personen zusammen.',
      rechnung: c => `${werte(c)} = ${num(c.s.sum)}. Person ${c.names[c.who]} trägt ihre ${c.s.xs[c.who]} dazu bei, wie alle anderen auch.`,
      fach: 'Das Summenzeichen Σ addiert die Beobachtungen xᵢ aller n Personen.',
      warum: 'Der Mittelwert soll alle berücksichtigen, jede Person genau einmal. Dafür sorgt Σ: Der Laufindex i geht von 1 bis n.',
      acht: 'Zähl nach: Es müssen fünf Zahlen sein. Eine vergessene oder doppelte Person passiert schnell.',
      alltag: 'Wie beim Zusammenlegen: Alle werfen ihre Punkte in einen gemeinsamen Topf.',
      check: {
        question: 'Wie groß ist die Summe der fünf Antworten?',
        answer: c => c.s.sum,
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const missing = c.s.xs.findIndex(x => x !== 0 && close(v, c.s.sum - x));
          if (missing >= 0) return `Fast! Ohne Person ${c.names[missing]} (${c.s.xs[missing]}) käme genau das heraus. Fehlt eine Person? Es müssen fünf Zahlen sein.`;
          const twice = c.s.xs.findIndex(x => x !== 0 && close(v, c.s.sum + x));
          if (twice >= 0) return `Fast! Mit Person ${c.names[twice]} (${c.s.xs[twice]}) doppelt käme genau das heraus. Zählt eine Person zweimal?`;
          return null;
        },
      },
    },
    {
      button: '÷ n', title: 'Gerecht verteilen', sym: 'x̄', say: 'x quer', concept: 'mean', perPerson: false,
      was: 'Wir teilen die Summe durch die Zahl der Personen, hier also durch 5.',
      rechnung: c => `${num(c.s.sum)} / 5 = ${num(c.s.mean)}. Hätten alle fünf dieselbe Antwort, läge sie bei ${num(c.s.mean)}.`,
      fach: 'Die Summe geteilt durch die Fallzahl n ergibt das arithmetische Mittel x̄.',
      warum: 'Ohne das Teilen wüchse die Zahl mit jeder weiteren Person. Erst das Teilen macht große und kleine Gruppen vergleichbar.',
      acht: 'Beim Mittelwert teilst du durch alle n Personen. Das „n − 1“ gehört zur Streuung, nicht hierher.',
      alltag: 'Wie beim Teilen einer Rechnung: der Gesamtbetrag geteilt durch die Zahl der Personen.',
      check: {
        question: 'Wo liegt die Mitte dieser Gruppe?',
        answer: c => c.s.mean,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.sum) ? 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.'
          : close(v, c.s.sum / 4) ? 'Fast! Du hast durch 4 geteilt. Beim Mittelwert teilst du durch alle fünf, nicht durch n − 1.'
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
      { head: 'xᵢ − x̄', from: 2, active: [2], cell: (c, i) => signed(c.s.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer', tone: (c, i) => c.s.dev[i] > 1e-9 ? 'pos' : c.s.dev[i] < -1e-9 ? 'neg' : undefined },
    ],
    lines: [
      { from: 2, step: 2, text: c => `x̄ = ${num(c.s.sum)} / 5 = ${num(c.s.mean)}` },
      { from: 2, step: 2, text: () => 'Die Spalte xᵢ − x̄ zeigt: So gleichen sich die Abstände aus, ihre Summe ist 0.' },
    ],
  },
  captions: {
    1: 'Die fünf Antworten auf der Skala. Du kannst die Punkte ziehen.',
    2: 'Links und rechts gleichen sich die Abstände genau aus. Deshalb ist x̄ der Ausgleichspunkt.',
  },
  think: [
    {
      question: 'In Gruppe B rückt Person E von 9 auf 10. Um wie viel ändert sich x̄?', options: ['um 1', 'um 0,2', 'gar nicht'], correct: 1, step: 2,
      explain: 'Die Summe wächst um 1, geteilt durch n = 5 ergibt +0,2. Jede Person bewegt den Mittelwert um ein Fünftel ihrer eigenen Änderung.',
      kurz: 'Einzelne zählen, aber nur anteilig.',
      tryIt: { label: 'Gruppe B, E auf 10', apply: () => [1, 3, 5, 7, 10] },
    },
    {
      question: 'Muss der Mittelwert eine Antwort sein, die jemand gegeben hat?', options: ['ja', 'nein'], correct: 1, step: 2,
      explain: 'Bei 1 3 5 7 10 ist x̄ = 5,2, und niemand hat 5,2 gesagt. Der Mittelwert ist ein Rechenwert, keine beobachtete Antwort.',
      kurz: 'Der Durchschnitt muss nicht vorkommen.',
      tryIt: { label: 'Mit Randwert', apply: () => [1, 3, 5, 7, 10] },
    },
    {
      question: 'Was ergibt die Summe aller Abstände xᵢ − x̄?', options: ['0', 'n', 'hängt von den Daten ab'], correct: 0, step: 2,
      explain: 'Der Mittelwert ist genau der Punkt, an dem sich die Abstände nach links und nach rechts ausgleichen, wie bei einer Wippe im Gleichgewicht. Die Summenzeile der Tabelle zeigt es.',
      kurz: 'Die Wippe ist immer im Gleichgewicht.',
    },
    {
      question: 'In Gruppe B steht durch einen Tippfehler statt 9 eine 90 im Datensatz. Was passiert mit x̄?', options: ['ändert sich kaum', 'springt stark nach oben'], correct: 1, step: 1,
      explain: 'Die Summe wird 106, geteilt durch 5 ergibt 21,2, weit außerhalb der Skala. Deshalb zuerst die Daten prüfen. Weniger empfindlich gegen Ausreißer ist der Median.',
      kurz: 'Ein einziger falscher Wert kann den Mittelwert weit verschieben.',
    },
  ],
  variants: {
    mean: {
      lastStep: 2,
      kurz: 'Der Mittelwert ist der Ausgleichspunkt der Gruppe. Würde man alle Antworten gerecht verteilen, bekäme jede Person genau ihn.',
      fachlich: 'Das arithmetische Mittel x̄ ist die Summe aller Beobachtungen geteilt durch die Fallzahl n.',
      symbolic: ['x̄ = ', { frac: [{ big: 'Σ', m: 1 }, { part: ['x', { sub: 'i' }], m: 1 }], den: [{ part: ['n'], m: 2 }], m: 2 }],
      aria: 'x quer gleich Summe über alle Personen i von x i, geteilt durch n',
      metrics: [{ label: 'Mittelwert x̄', value: c => num(c.s.mean) }],
      interpret: c => ({
        kurz: `Im Durchschnitt ordnen sich die fünf bei ${num(c.s.mean)} ein, ${Math.abs(c.s.mean - 5.5) < 0.005 ? 'genau auf der Skalenmitte 5,5' : `${c.s.mean < 5.5 ? 'links' : 'rechts'} der Skalenmitte 5,5`}.`,
        fachlich: `x̄ = ${num(c.s.mean)}. Wie einig sich die Gruppe ist, sagt der Mittelwert nicht: Gruppe A und Gruppe B haben beide x̄ = 5. Das misst die Standardabweichung.`,
      }),
      next: { id: 'sd', label: 'Weiter zur Standardabweichung' },
      genau: {
        kurz: 'Der Mittelwert ist nur sinnvoll, wenn die Abstände zwischen den Antworten etwas bedeuten.',
        paragraphs: () => [
          'Die Links-rechts-Skala hier wie eine metrische Skala zu behandeln, ist eine Annahme: Gleiche Zahlenabstände sollen gleiche inhaltliche Abstände bedeuten. Für geordnete Kategorien ohne diese Annahme eignet sich der Median.',
          'Der Mittelwert ist der Wert, für den die Summe der quadrierten Abstände am kleinsten ist. Deshalb misst man die Streuung um ihn herum (Werkstatt Standardabweichung).',
          'In gewichteten Stichproben wie dem ALLBUS zählt jede Person mit ihrem Gewicht: x̄ (gewichtet) = Σwᵢxᵢ / Σwᵢ (Begriff „Gewichte“).',
        ],
      },
    },
  },
};
