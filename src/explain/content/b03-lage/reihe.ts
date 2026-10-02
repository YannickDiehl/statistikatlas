// Werkstatt „Der Reihe nach“ für Median (Schritte 1 bis 3) und Quantile mit Interquartilsabstand (Schritte 1 bis 6):
// ordnen, Plätze abzählen, Werte ablesen, zwischen Nachbarn einteilen (Type 6 wie mariposa::w_quantile). Fünf
// Beispielpersonen mit ihrer Lernzeit; die Brücke rechnet dasselbe mit allen 200 Befragten. Referenzwerte: b03-lage.test.ts.
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, Workshop } from '../../types';
import { num, unit } from '../../format';
/** Breite in der Einheit der Spalte, ohne Einheit in Skalenpunkten. */
const breadth = (c: BridgeCtx<Reihe>, v: number) => c.col.unit ? c.u(v) : unit(v, 'Skalenpunkt', 'Skalenpunkte');
import { countWithin } from '../../sample';
import { quantile6, valueText } from './lage';

/** Kennwerte der Reihe: geordnete Werte, Plätze je Person (bei Gleichstand die Spanne), Median, Quartile, IQR. */
export interface Reihe {
  xs: number[]; n: number; sorted: number[];
  /** Platz der Person in der geordneten Reihe (1 bis n; bei Gleichstand stabil nach der Reihenfolge der Daten) */
  place: number[];
  /** Bei Gleichstand: erster und letzter Platz mit demselben Wert */
  placeLo: number[]; placeHi: number[];
  mid: number; median: number; mean: number;
  h1: number; h3: number; q1: number; q3: number; iqr: number; range: number;
  below: number; above: number; same: number;
}

export function reihe(xs: readonly number[]): Reihe {
  const n = xs.length, order = xs.map((v, i) => i).sort((a, b) => xs[a] - xs[b] || a - b), sorted = order.map(i => xs[i]);
  const place = new Array<number>(n);
  order.forEach((i, k) => { place[i] = k + 1; });
  const placeLo = xs.map(v => sorted.indexOf(v) + 1), placeHi = xs.map(v => sorted.lastIndexOf(v) + 1);
  const median = quantile6(xs, 0.5), q1 = quantile6(xs, 0.25), q3 = quantile6(xs, 0.75), mean = xs.reduce((a, b) => a + b, 0) / n;
  return {
    xs: [...xs], n, sorted, place, placeLo, placeHi, mid: (n + 1) / 2, median, mean,
    h1: (n + 1) * 0.25, h3: (n + 1) * 0.75, q1, q3, iqr: q3 - q1, range: sorted[n - 1] - sorted[0],
    below: xs.filter(v => v < median - 1e-9).length, above: xs.filter(v => v > median + 1e-9).length, same: xs.filter(v => Math.abs(v - median) <= 1e-9).length,
  };
}

type C = Ctx<Reihe>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const h = (v: number) => unit(v, 'Stunde', 'Stunden');
const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** Platz als tiefgestellte Zahl in Klammern: x₍₃₎. */
export const at = (k: number) => `x₍${String(k).split('').map(d => SUB[Number(d)]).join('')}₎`;
/** „unter dem Median“, „über dem Median“, „genau auf dem Median“ mit Abstand. */
const toMedian = (v: number, med: number, u: (v: number) => string) => Math.abs(v - med) < 1e-9 ? 'genau auf dem Median' : `um ${u(Math.abs(v - med))} ${v > med ? 'über' : 'unter'} dem Median`;
/** Wo ein Wert zu den Quartilen liegt. */
const quarter = (v: number, s: Reihe) => v < s.q1 - 1e-9 ? 'im unteren Viertel' : v > s.q3 + 1e-9 ? 'im oberen Viertel' : 'in der mittleren Hälfte';
/** Einteilen zwischen den Nachbarn auf Platz ⌊h⌋ und ⌊h⌋ + 1, als Rechnung mit den sichtbaren Zahlen. */
function between(s: Reihe, hp: number, u: (v: number) => string): string {
  const j = Math.floor(hp), g = hp - j;
  if (j < 1) return u(s.sorted[0]);
  if (j >= s.n) return u(s.sorted[s.n - 1]);
  const a = s.sorted[j - 1], b = s.sorted[j], v = a + g * (b - a);
  return g < 1e-9 ? `${at(j)} = ${u(a)}` : `${num(a)} + ${num(g)} · (${num(b)} − ${num(a)}) ${Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '='} ${u(v)}`;
}


export const derReiheNach: Workshop<number[], Reihe> = {
  id: 'b03-reihe',
  wofuer: 'Fünf Personen sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben. Welcher Wert liegt in der Mitte, wenn man sie der Reihe nach aufstellt? Und wie breit ist der Bereich, in dem die mittlere Hälfte liegt?',
  mut: 'Hier rechnest du kaum: Du ordnest, zählst Plätze ab und liest Werte ab. Nur bei den Vierteln teilst du einmal den Abstand zweier Nachbarn. Das Rechnen übernimmt später R.',
  picture: 'b03-reihe',
  names: NAMES,
  bounds: { min: 0, max: 20 },
  presets: [
    { id: 'A', label: 'Lernzeiten: 3 12 5 8 6', data: [3, 12, 5, 8, 6] },
    { id: 'B', label: 'Mit Ausreißer: 3 20 5 8 6', data: [3, 20, 5, 8, 6] },
  ],
  dataNote: 'Fünf Beispielpersonen, Lernzeit in Stunden. Die Punkte im Bild lassen sich ziehen.',
  compute: reihe,
  glyphs: [
    { sym: 'x₍ᵢ₎', say: 'x i in Klammern', term: 'Ordnungsstatistik', plain: 'der Wert auf Platz i der geordneten Reihe', step: 1 },
    { sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele Personen, hier 5', step: 2 },
    { sym: 'x̃', say: 'x Schlange', term: 'Median', plain: 'der mittlere Wert der Reihe nach', step: 3 },
    { sym: 'p', say: 'p', term: 'Anteil', plain: 'welcher Anteil höchstens darunter liegen soll, etwa 0,25', step: 4 },
    { sym: 'Q₁, Q₃', say: 'Q eins, Q drei', term: 'Quartile', plain: 'die Grenzen zum unteren und zum oberen Viertel', step: 5 },
    { sym: 'IQR', say: 'I Q R', term: 'Interquartilsabstand', plain: 'die Breite der mittleren Hälfte', step: 6 },
  ],
  steps: [
    {
      button: 'x₍ᵢ₎', title: 'Der Reihe nach ordnen', sym: 'x₍₁₎ ≤ … ≤ x₍ₙ₎', say: 'x eins bis x n, jeweils in Klammern', concept: 'sorting', perPerson: true,
      was: 'Wir ordnen die fünf Lernzeiten vom kleinsten zum größten Wert. Jede Person bekommt einen Platz in dieser Reihe.',
      rechnung: c => `Der Reihe nach: ${c.s.sorted.join(' ≤ ')}. Person ${P(c)} hat ${h(c.s.xs[c.who])} und steht auf Platz ${c.s.place[c.who]}.`,
      fach: 'Die geordneten Werte heißen Ordnungsstatistiken: x₍₁₎ ist der kleinste, x₍ₙ₎ der größte Wert.',
      warum: 'Median und Quartile fragen nach Plätzen in dieser Reihe. Ohne Ordnung gibt es keine Mitte.',
      acht: 'Ordnen heißt nicht, die Personen zu vergessen. Die Tabelle zeigt weiter, wer welchen Platz hat.',
      check: {
        question: 'Welcher Wert steht der Reihe nach auf Platz 2?',
        answer: c => c.s.sorted[1],
        diagnose: (c, v) => v === 'NA' ? null
          : v === c.s.xs[1] && v !== c.s.sorted[1] ? 'Fast! Das ist der Wert von Person B, der zweite Eintrag der Liste. Erst ordnen, dann abzählen.'
          : v === c.s.sorted[c.s.n - 2] && v !== c.s.sorted[1] ? 'Fast! Du hast von oben gezählt. Platz 1 ist der kleinste Wert.'
          : null,
      },
    },
    {
      button: 'n', title: 'Abzählen und die Mitte suchen', sym: 'n', say: 'n', concept: 'validn', perPerson: false,
      was: 'Wir zählen die Werte: n = 5. Die Mitte liegt auf Platz (n + 1) / 2, hier also auf Platz 3.',
      rechnung: '(5 + 1) / 2 = 3. Zwei Werte stehen davor, zwei dahinter.',
      fach: 'Bei n Werten liegt die Mitte der geordneten Reihe auf Platz (n + 1) / 2.',
      warum: 'Mit dem Plus eins landet die Mitte so, dass davor und dahinter gleich viele Werte stehen.',
      acht: 'Nicht n / 2 rechnen, das ergäbe 2,5. Bei einer geraden Zahl, etwa sechs, liegt die Mitte bei 3,5: zwischen dem dritten und dem vierten Wert.',
      check: {
        question: 'Auf welchem Platz liegt die Mitte bei fünf Personen?',
        answer: c => c.s.mid,
        diagnose: (c, v) => v !== 'NA' && Math.abs(v - c.s.n / 2) < 1e-9 ? 'Fast! Das ist n / 2. Für die Mitte rechnest du (n + 1) / 2 = 3: zwei Werte davor, zwei dahinter.' : null,
      },
    },
    {
      button: 'x̃', title: 'Den mittleren Wert ablesen', sym: 'x̃', say: 'x Schlange', concept: 'median', perPerson: true,
      was: 'Wir lesen den Wert auf Platz 3 ab. Das ist der Median.',
      rechnung: c => `x̃ = ${at(3)} = ${h(c.s.median)}. Person ${P(c)} liegt mit ${h(c.s.xs[c.who])} ${toMedian(c.s.xs[c.who], c.s.median, h)}.`,
      fach: 'Der Median x̃ ist der Wert in der Mitte der geordneten Reihe. Mindestens die Hälfte der Werte ist kleiner oder gleich, mindestens die Hälfte größer oder gleich.',
      warum: 'Der Median hängt nur an der Reihenfolge. Ein einzelner sehr großer Wert verschiebt ihn deshalb nicht.',
      acht: c => Math.abs(c.s.mean - c.s.median) < 0.005
        ? `Der Median ist nicht der Mittelwert, auch wenn hier beide bei ${num(c.s.median)} liegen. Zieh einen Punkt weit nach rechts, dann trennen sie sich.`
        : `Der Median ist nicht der Mittelwert. Hier ist der Mittelwert x̄ = ${num(c.s.mean)}, der Median ${num(c.s.median)}.`,
      alltag: 'Wie in einer Reihe, die sich nach Körpergröße aufstellt: Wer genau in der Mitte steht, bestimmt den Median. Wie groß die Größte ist, spielt keine Rolle.',
      check: {
        question: 'Welcher Wert steht in der Mitte der Reihe?',
        answer: c => c.s.median,
        diagnose: (c, v) => v === 'NA' ? null
          : Math.abs(c.s.mean - c.s.median) > 0.011 && Math.abs(v - c.s.mean) < 0.011 ? 'Fast! Das ist der Mittelwert. Der Median ist der mittlere Wert der Reihe nach.'
          : v === c.s.xs[2] && v !== c.s.median ? 'Fast! Das ist der mittlere Eintrag der ungeordneten Liste. Erst ordnen, dann den Wert auf Platz 3 ablesen.'
          : null,
      },
    },
    {
      button: '(n + 1) · p', title: 'Die Viertel-Plätze bestimmen', sym: 'h = (n + 1) · p', say: 'h gleich n plus eins mal p', concept: 'quantile', perPerson: false,
      was: 'Für das untere Viertel rechnen wir (n + 1) · 0,25, für das obere (n + 1) · 0,75. So finden wir die Plätze der Quartile.',
      rechnung: '(5 + 1) · 0,25 = 1,5 und (5 + 1) · 0,75 = 4,5.',
      fach: 'Das Quantil zum Anteil p liegt auf Platz h = (n + 1) · p der geordneten Reihe. So rechnen mariposa und SPSS (Type 6).',
      warum: 'Der Median war der Fall p = 0,5: (5 + 1) · 0,5 = 3. Dieselbe Regel findet jede andere Grenze.',
      acht: 'Die Plätze müssen keine ganzen Zahlen sein. 1,5 heißt: zwischen Platz 1 und Platz 2.',
      check: {
        question: 'Auf welchem Platz liegt das erste Quartil?',
        answer: c => c.s.h1,
        diagnose: (c, v) => v !== 'NA' && Math.abs(v - c.s.n * 0.25) < 1e-9 ? 'Fast! Das ist n · 0,25. mariposa rechnet (n + 1) · 0,25 = 1,5.' : null,
      },
    },
    {
      button: 'Q₁, Q₃', title: 'Zwischen Nachbarn einteilen', sym: 'Q₁, Q₃', say: 'Q eins, Q drei', concept: 'quantile', perPerson: true,
      was: 'Platz 1,5 liegt genau in der Mitte zwischen Platz 1 und Platz 2. Also nehmen wir die Mitte zwischen diesen beiden Werten.',
      rechnung: c => `Q₁ = ${between(c.s, c.s.h1, num)}. Q₃ = ${between(c.s, c.s.h3, num)}. Person ${P(c)} liegt ${quarter(c.s.xs[c.who], c.s)}.`,
      fach: 'Liegt der Platz h zwischen zwei ganzen Zahlen, wird linear eingeteilt: Q = x₍ⱼ₎ + (h − j) · (x₍ⱼ₊₁₎ − x₍ⱼ₎), mit j als ganzzahligem Teil von h.',
      warum: 'Q₁ trennt das untere Viertel vom Rest, Q₃ das obere. Dazwischen liegt die mittlere Hälfte.',
      acht: 'Mit nur fünf Personen hängt Q₃ noch am größten Wert. Erst bei vielen Befragten liegen die Quartile fest in der Masse der Daten.',
      check: {
        question: 'Wo liegt das erste Quartil Q₁?',
        answer: c => c.s.q1,
        diagnose: (c, v) => v !== 'NA' && Math.abs(c.s.sorted[1] - c.s.sorted[0]) > 1e-9 && (v === c.s.sorted[0] || v === c.s.sorted[1])
          ? 'Fast! Das ist einer der beiden Nachbarn. Q₁ liegt auf Platz 1,5, also genau in der Mitte zwischen beiden.' : null,
      },
    },
    {
      button: 'Q₃ − Q₁', title: 'Die mittlere Hälfte messen', sym: 'IQR', say: 'I Q R', concept: 'quantile', perPerson: false,
      was: 'Wir ziehen Q₁ von Q₃ ab. Das ist die Breite der mittleren Hälfte.',
      rechnung: c => `IQR = ${num(c.s.q3)} − ${num(c.s.q1)} = ${h(c.s.iqr)}.`,
      fach: 'Der Interquartilsabstand IQR = Q₃ − Q₁ misst die Streuung der mittleren Hälfte der Werte.',
      warum: 'Die Ränder fallen weg. Deshalb reagiert der IQR weniger auf Ausreißer als die Spannweite.',
      acht: 'Der IQR ist ein Abstand, keine Lage. Er sagt, wie breit die mittlere Hälfte ist, nicht wo sie liegt.',
      check: {
        question: 'Wie breit ist die mittlere Hälfte?',
        answer: c => c.s.iqr,
        diagnose: (c, v) => v === 'NA' ? null
          : Math.abs(c.s.range - c.s.iqr) > 1e-9 && v === c.s.range ? 'Fast! Das ist die Spannweite, der größte minus der kleinste Wert. Gesucht ist Q₃ − Q₁.'
          : Math.abs(c.s.q1) > 1e-9 && Math.abs(v - c.s.q3) < 1e-9 ? 'Fast! Das ist Q₃ allein. Zieh noch Q₁ ab.'
          : null,
      },
    },
  ],
  numeric: (c, last) => {
    const s = c.s, med: FNode[] = [{ part: ['x̃'], m: 3 }, ' = ', { part: [at(3)], m: 2 }, ' = ', { part: [num(s.median)], m: 3 }];
    if (last <= 3) return [{ part: [s.sorted.join(' ≤ ')], m: 1 }, { br: true }, ...med];
    return [
      { part: [s.sorted.join(' ≤ ')], m: 1 }, { br: true },
      { part: ['h = 1,5 und 4,5'], m: 4 }, { br: true },
      { part: ['Q₁'], m: 5 }, ' = ', { part: [num(s.q1)], m: 5 }, ',  ', ...med, ',  ', { part: ['Q₃'], m: 5 }, ' = ', { part: [num(s.q3)], m: 5 }, { br: true },
      { part: ['IQR'], m: 6 }, ' = ', num(s.q3), ' − ', num(s.q1), ' = ', { part: [num(s.iqr)], m: 6 },
    ];
  },
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [1], cell: (c, i) => num(c.s.xs[i]) },
      { head: 'Platz', from: 1, active: [1, 2], cell: (c, i) => String(c.s.place[i]) },
      { head: 'zum Median', from: 3, active: [3], cell: (c, i) => Math.abs(c.s.xs[i] - c.s.median) < 1e-9 ? 'gleich' : c.s.xs[i] < c.s.median ? 'darunter' : 'darüber' },
      { head: 'Viertel', from: 5, active: [5, 6], cell: (c, i) => c.s.xs[i] < c.s.q1 - 1e-9 ? 'unteres' : c.s.xs[i] > c.s.q3 + 1e-9 ? 'oberes' : 'mittlere Hälfte' },
    ],
    lines: [
      { from: 1, step: 1, text: c => `Der Reihe nach: ${c.s.sorted.join(' ≤ ')}` },
      { from: 2, step: 2, text: () => 'Mitte: Platz (5 + 1) / 2 = 3' },
      { from: 3, step: 3, text: c => `x̃ = ${at(3)} = ${num(c.s.median)}` },
      { from: 4, step: 4, text: () => 'Viertel-Plätze: (5 + 1) · 0,25 = 1,5 und (5 + 1) · 0,75 = 4,5' },
      { from: 5, step: 5, text: c => `Q₁ = ${num(c.s.q1)}, Q₃ = ${num(c.s.q3)}` },
      { from: 6, step: 6, text: c => `IQR = ${num(c.s.q3)} − ${num(c.s.q1)} = ${num(c.s.iqr)}` },
    ],
  },
  captions: {
    1: 'Oben die fünf Lernzeiten, unten dieselben Werte der Reihe nach. Du kannst die Punkte ziehen.',
    2: 'Die Mitte der Reihe ist Platz 3.',
    3: 'Der Wert auf Platz 3 ist der Median, oben als grüne Linie.',
    4: 'Die Viertel-Plätze 1,5 und 4,5 liegen zwischen zwei Plätzen.',
    5: 'Q₁ und Q₃ liegen jeweils in der Mitte zwischen zwei Nachbarn, oben gestrichelt.',
    6: 'Das Band zwischen Q₁ und Q₃ ist die mittlere Hälfte; seine Breite ist der IQR.',
  },
  think: [
    {
      question: 'Die Person mit der längsten Lernzeit lernt plötzlich 20 Stunden. Was passiert mit dem Median?',
      questionFor: { quantile: 'Die Person mit der längsten Lernzeit lernt plötzlich 20 Stunden. Was passiert mit dem ersten Quartil Q₁?' },
      options: ['bleibt gleich', 'steigt', 'sinkt'], correct: 0, step: 3,
      explain: 'Ihr Wert rückt nur weiter nach oben, ihr Platz bleibt der letzte. Median und Q₁ hängen an Plätzen weiter unten und bleiben gleich. Q₃ dagegen hängt bei fünf Personen am größten Wert.',
      kurz: 'Plätze zählen, nicht Abstände.',
      tryIt: { label: 'größten Wert auf 20 Stunden', apply: d => { const i = d.indexOf(Math.max(...d)); return d.map((x, k) => k === i ? 20 : x); } },
    },
    {
      question: 'Bei sechs statt fünf Personen: Auf welchem Platz liegt die Mitte?', options: ['3,5', '3', '4'], correct: 0, step: 2,
      explain: '(6 + 1) / 2 = 3,5: zwischen dem dritten und dem vierten Wert. Der Median ist dann die Mitte zwischen diesen beiden.',
      kurz: 'Gerade Zahl: zwei Werte in der Mitte.',
    },
    {
      question: 'Muss der Median eine Lernzeit sein, die jemand genannt hat?', options: ['bei fünf Personen ja, bei sechs nicht unbedingt', 'immer', 'nie'], correct: 0, step: 3,
      explain: 'Bei ungerader Zahl ist der Median ein beobachteter Wert. Bei gerader Zahl kann die Mitte zwischen zwei Werten liegen, die niemand genannt hat.',
      kurz: 'Der Median kann zwischen zwei Antworten liegen.',
    },
  ],
  variants: {
    median: {
      lastStep: 3,
      kurz: 'Der Median ist der mittlere Wert, wenn du alle Antworten der Reihe nach ordnest. Die eine Hälfte liegt darunter, die andere darüber.',
      fachlich: 'Der Median x̃ ist der Wert in der Mitte der geordneten Reihe, auf Platz (n + 1) / 2; bei gerader Fallzahl das Mittel der beiden mittleren Werte.',
      symbolic: [{ part: ['x̃'], m: 3 }, ' = ', { part: ['x'], m: 1 }, { part: [{ sub: '((n + 1) / 2)' }], m: 2 }],
      aria: 'x Schlange gleich der Wert auf Platz n plus eins durch zwei der geordneten Reihe',
      metrics: [{ label: 'Mittelwert x̄', value: c => num(c.s.mean) }, { label: 'Median x̃', value: c => num(c.s.median) }],
      interpret: c => {
        const s = c.s, who = (k: number) => k === 1 ? 'Eine Person hat' : `${k} Personen haben`;
        const pull = s.mean - s.median > 1 ? ` Der Mittelwert liegt mit ${h(s.mean)} darüber: Ein großer Wert zieht ihn nach oben, den Median nicht.` : '';
        return {
          kurz: `Der mittlere Wert der Reihe nach ist ${h(s.median)}. ${who(s.below)} weniger gelernt, ${s.above} mehr.${pull}`,
          fachlich: `x̃ = ${num(s.median)} h, x̄ = ${num(s.mean)} h. Der Median nutzt nur die Reihenfolge; wie weit der größte Wert entfernt ist, spielt keine Rolle.`,
        };
      },
      next: { id: 'quantile', label: 'Weiter zu den Quartilen' },
      genau: {
        kurz: 'Bei gerader Fallzahl gibt es zwei mittlere Werte; der Median ist dann ihr Mittel. Bei geordneten Kategorien nennt man besser beide.',
        paragraphs: () => [
          'Bei sechs Personen liegt die Mitte auf Platz (6 + 1) / 2 = 3,5, also zwischen dem dritten und dem vierten Wert. Für Zahlen nimmt man die Mitte zwischen beiden; median() und w_median() in R rechnen genauso.',
          'Bei geordneten Kategorien wie dem Schulabschluss sind die Codes keine Mengen. Liegen die beiden mittleren Antworten in verschiedenen Kategorien, nennt man besser beide, statt ihre Codes zu mitteln.',
          'Der Median ist der Wert, für den die Summe der Abstände (ohne Quadrat) am kleinsten ist. Der Mittelwert macht die Summe der quadrierten Abstände am kleinsten; deshalb reagiert er stärker auf Ausreißer.',
        ],
      },
    },
    quantile: {
      lastStep: 6,
      kurz: 'Quartile teilen die geordnete Reihe in Viertel. Der Interquartilsabstand ist die Breite der mittleren Hälfte.',
      fachlich: 'Das Quantil zum Anteil p liegt auf Platz h = (n + 1) · p der geordneten Reihe, zwischen zwei Nachbarn linear eingeteilt (Type 6). Der Interquartilsabstand ist IQR = Q₃ − Q₁.',
      symbolic: [{ part: ['IQR'], m: 6 }, ' = ', { part: ['Q₃'], m: 5 }, ' − ', { part: ['Q₁'], m: 5 }, ',  Q', { sub: 'p' }, ' auf Platz ', { part: ['(n + 1) · p'], m: 4 }, ' der ', { part: ['geordneten Reihe'], m: 1 }],
      aria: 'I Q R gleich Q drei minus Q eins; das Quantil Q p steht auf Platz n plus eins mal p der geordneten Reihe',
      metrics: [{ label: 'Q₁', value: c => num(c.s.q1) }, { label: 'Q₃', value: c => num(c.s.q3) }, { label: 'Interquartilsabstand IQR', value: c => num(c.s.iqr) }],
      interpret: c => ({
        kurz: `Die mittlere Hälfte der fünf lernt zwischen ${num(c.s.q1)} und ${h(c.s.q3)}. Diese Spanne ist ${h(c.s.iqr)} breit.`,
        fachlich: `Q₁ = ${num(c.s.q1)}, x̃ = ${num(c.s.median)}, Q₃ = ${num(c.s.q3)}, IQR = ${num(c.s.iqr)} h. Mit nur fünf Personen hängt Q₃ noch am größten Wert; bei 200 Befragten nicht mehr.`,
      }),
      genau: {
        kurz: 'Für Quantile gibt es mehrere Rechenwege. mariposa nutzt Type 6 wie SPSS; quantile() in R rechnet ohne weitere Angabe nach Type 7.',
        paragraphs: c => {
          const t7 = (p: number) => { const s = c.s.sorted, hp = 1 + (c.s.n - 1) * p, j = Math.floor(hp); return j >= c.s.n ? s[c.s.n - 1] : s[j - 1] + (hp - j) * (s[j] - s[j - 1]); };
          return [
            `Type 7 nimmt den Platz 1 + (n − 1) · p. Bei deinen fünf Werten ergäbe das Q₁ = ${num(t7(0.25))} statt ${num(c.s.q1)} und Q₃ = ${num(t7(0.75))} statt ${num(c.s.q3)}. Bei 200 Befragten liegen beide Wege meist nah beieinander.`,
            'Liegt der Platz h unter 1 oder über n, nimmt mariposa den kleinsten bzw. den größten Wert.',
            'Der Median ist das Quantil zu 50 %, die Quartile sind die Quantile zu 25 % und 75 %. Perzentile teilen in Hundertstel, Dezile in Zehntel.',
            'Ein Boxplot zeichnet genau diese Zahlen: die Box von Q₁ bis Q₃, den Strich beim Median und Linien zu den übrigen Werten, oft bis höchstens 1,5 · IQR von der Box entfernt.',
          ];
        },
      },
    },
  },
};

// ---------- Brücke „Mit 200 Befragten“ ----------

type B = BridgeCtx<Reihe>;
const N = (c: B) => c.values.length;
const PB = (c: B) => c.names[c.who];
const lernzeit = (c: B) => c.col.id === 'lernzeit';
const amount = (c: B, v: number) => lernzeit(c) ? h(v) : c.u(v);
const eq = (v: number) => Math.abs(Math.round(v * 100) / 100 - v) > 1e-9 ? '≈' : '=';
/** Platz der gewählten Person, bei Gleichstand als Spanne. */
const placeOf = (c: B) => c.s.placeLo[c.who] === c.s.placeHi[c.who] ? `Platz ${c.s.placeLo[c.who]}` : `einem der Plätze ${c.s.placeLo[c.who]} bis ${c.s.placeHi[c.who]}`;
/** Lage des Platzes zu einem Bezugsplatz. */
const sideOf = (c: B, ref: number) => c.s.placeHi[c.who] < ref ? 'davor' : c.s.placeLo[c.who] > ref ? 'dahinter' : 'genau dort';
/** Median der Spalte in Worten; bei Kategorien mit Wertelabel, bei zwei verschiedenen mittleren Kategorien beide. */
function medianText(c: B): string {
  const s = c.s, a = Math.floor(s.mid);
  if (c.col.scale !== 'metric' && !Number.isInteger(s.mid) && s.sorted[a - 1] !== s.sorted[a])
    return `zwischen ${valueText(c.col.id, s.sorted[a - 1])} und ${valueText(c.col.id, s.sorted[a])}`;
  return c.col.scale === 'metric' ? amount(c, s.median) : valueText(c.col.id, s.median);
}

export const bridgeReihe: Bridge<Reihe> = {
  data: 'series',
  numeric: (c, last) => {
    const s = c.s, a = Math.floor(s.mid), even = !Number.isInteger(s.mid);
    const med: FNode[] = even
      ? [{ part: ['x̃'], m: 3 }, ' = ( ', { part: [at(a)], m: 2 }, ' + ', { part: [at(a + 1)], m: 2 }, ' ) / 2 = ( ', { part: [num(s.sorted[a - 1])], m: 3 }, ' + ', { part: [num(s.sorted[a])], m: 3 }, ' ) / 2 ', eq(s.median), ' ', { part: [c.u(s.median)], m: 3 }]
      : [{ part: ['x̃'], m: 3 }, ' = ', { part: [at(a)], m: 2 }, ' = ', { part: [c.u(s.median)], m: 3 }];
    if (last <= 3) return [{ part: [`Platz (${N(c)} + 1) / 2 = ${num(s.mid)}`], m: 2 }, { br: true }, ...med];
    return [
      { part: [`h = (${N(c)} + 1) · p`], m: 4 }, ' = ', num(s.h1), ' und ', num(s.h3), { br: true },
      { part: ['Q₁'], m: 5 }, ` ${eq(s.q1)} `, { part: [c.u(s.q1)], m: 5 }, ',  ', { part: ['Q₃'], m: 5 }, ` ${eq(s.q3)} `, { part: [c.u(s.q3)], m: 5 }, { br: true },
      { part: ['IQR'], m: 6 }, ' = ', num(s.q3), ' − ', num(s.q1), ` ${eq(s.iqr)} `, { part: [c.u(s.iqr)], m: 6 },
    ];
  },
  lines: [
    {
      all: c => `Alle ${N(c)} Werte von „${c.col.title}“ der Reihe nach: von ${c.u(c.s.sorted[0])} auf Platz 1 bis ${c.u(c.s.sorted[N(c) - 1])} auf Platz ${N(c)}.`,
      person: c => `${PB(c)} hat ${c.u(c.values[c.who])} und steht der Reihe nach auf ${placeOf(c)}.`,
    },
    {
      all: c => `(${N(c)} + 1) / 2 = ${num(c.s.mid)}: Die Mitte liegt ${Number.isInteger(c.s.mid) ? `auf Platz ${c.s.mid}` : `zwischen Platz ${Math.floor(c.s.mid)} und Platz ${Math.floor(c.s.mid) + 1}`}.`,
      person: c => `${PB(c)} steht auf ${placeOf(c)}, von der Mitte aus gesehen ${sideOf(c, c.s.mid)}.`,
    },
    {
      all: c => {
        const s = c.s, a = Math.floor(s.mid);
        return Number.isInteger(s.mid) ? `Auf Platz ${a} steht ${c.u(s.median)}: x̃ = ${c.u(s.median)}.`
          : `Auf Platz ${a} und ${a + 1} stehen ${c.u(s.sorted[a - 1])} und ${c.u(s.sorted[a])}; die Mitte dazwischen ist x̃ ${eq(s.median)} ${c.u(s.median)}.`;
      },
      person: c => `${PB(c)} liegt mit ${c.u(c.values[c.who])} ${toMedian(c.values[c.who], c.s.median, c.u)}.`,
    },
    {
      all: c => `(${N(c)} + 1) · 0,25 = ${num(c.s.h1)} und (${N(c)} + 1) · 0,75 = ${num(c.s.h3)}: die Plätze der beiden Quartile.`,
      person: c => {
        const lo = c.s.placeLo[c.who], hi = c.s.placeHi[c.who];
        return `${PB(c)} steht auf ${placeOf(c)}: ${hi < c.s.h1 ? 'vor dem Platz von Q₁' : lo > c.s.h3 ? 'hinter dem Platz von Q₃' : lo >= c.s.h1 && hi <= c.s.h3 ? 'zwischen den Plätzen von Q₁ und Q₃' : 'an einem der beiden Plätze der Quartile'}.`;
      },
    },
    {
      all: c => `Q₁ = ${between(c.s, c.s.h1, c.u)}. Q₃ = ${between(c.s, c.s.h3, c.u)}.`,
      person: c => `${PB(c)} liegt mit ${c.u(c.values[c.who])} ${quarter(c.values[c.who], c.s)}.`,
    },
    {
      all: c => `IQR = ${num(c.s.q3)} − ${num(c.s.q1)} ${eq(c.s.iqr)} ${c.u(c.s.iqr)}: So breit ist die mittlere Hälfte.`,
      person: c => `${PB(c)} liegt ${quarter(c.values[c.who], c.s)}; dazu gehören ${countWithin(c.values, c.s.q1, c.s.q3)} von ${N(c)} Befragten.`,
    },
  ],
  metrics: (c, variant) => variant === 'quantile'
    ? [{ label: 'Befragte n', value: String(N(c)) }, { label: 'Q₁', value: c.u(c.s.q1) }, { label: 'Q₃', value: c.u(c.s.q3) }, { label: 'Interquartilsabstand IQR', value: c.u(c.s.iqr) }]
    : [{ label: 'Befragte n', value: String(N(c)) }, { label: 'Mittelwert x̄', value: c.u(c.s.mean) }, { label: 'Median x̃', value: c.u(c.s.median) }],
  interpret: (c, variant) => {
    const s = c.s, n = N(c);
    if (variant === 'quantile') return {
      kurz: lernzeit(c)
        ? `Die mittlere Hälfte der ${n} Befragten hat in den letzten sieben Tagen zwischen ${num(s.q1)} und ${h(s.q3)} gelernt. Diese Spanne ist ${h(s.iqr)} breit.`
        : `Die mittlere Hälfte der ${n} Befragten liegt bei „${c.col.title}“ zwischen ${c.u(s.q1)} und ${c.u(s.q3)}. Diese Spanne ist ${breadth(c, s.iqr)} breit.`,
      fachlich: `Q₁ ${eq(s.q1)} ${c.u(s.q1)}, x̃ ${eq(s.median)} ${c.u(s.median)}, Q₃ ${eq(s.q3)} ${c.u(s.q3)}; IQR = Q₃ − Q₁ ${eq(s.iqr)} ${c.u(s.iqr)} bei n = ${n}, gerechnet nach Type 6 wie in mariposa.`,
      zusatz: `${countWithin(c.values, s.q1, s.q3)} von ${n} Befragten liegen zwischen Q₁ und Q₃, die Grenzen eingeschlossen.`,
    };
    return {
      kurz: lernzeit(c)
        ? `Der mittlere Wert der ${n} Befragten der Reihe nach liegt bei ${h(s.median)} Lernzeit in den letzten sieben Tagen. Im Durchschnitt sind es ${h(s.mean)}.`
        : `Bei „${c.col.title}“ liegt der mittlere Wert der ${n} Befragten der Reihe nach ${medianText(c).startsWith('zwischen') ? '' : 'bei '}${medianText(c)}.`,
      fachlich: `Der Median von „${c.col.title}“ beträgt x̃ ${eq(s.median)} ${c.u(s.median)} bei n = ${n}; der Mittelwert x̄ ${eq(s.mean)} ${c.u(s.mean)}.`,
      zusatz: `${s.below} von ${n} Befragten liegen unter dem Median, ${s.above} darüber und ${s.same} genau darauf.`,
    };
  },
  voraussetzung: (c, variant) => variant === 'quantile'
    ? 'Quartile brauchen eine Reihenfolge, der IQR als Abstand zusätzlich sinnvolle Abstände. Bei wenigen verschiedenen Werten fallen Quartile oft auf dieselbe Zahl.'
    : c.col.scale === 'metric' ? 'Der Median braucht nur eine Reihenfolge. Er passt zu metrischen Spalten und zu geordneten Kategorien.'
    : `„${c.col.title}“ hat geordnete Antworten: Der Median passt, auch ohne gleiche Abstände zwischen den Codes.`,
  picture: () => ({}),
  value: (c, variant) => variant === 'quantile' ? c.s.iqr : c.s.median,
};
derReiheNach.bridge = bridgeReihe;

const LZ = 'lernzeit';

export const medianTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b03-reihe', variant: 'median', variable: LZ,
    think: [
      {
        question: 'Eine Person hat plötzlich gar nicht gelernt (0 Stunden). Was passiert mit dem Median?', options: ['bleibt gleich', 'sinkt deutlich', 'steigt'], correct: 0, step: 3,
        explain: 'Wer vorher über dem Median lag, rutscht ans untere Ende. Auf den mittleren Plätzen der Reihe stehen hier aber mehrere Befragte mit genau 7,6 Stunden, deshalb bleibt der Median. Der Mittelwert sinkt dagegen um bis zu 0,09 Stunden.',
        kurz: 'Der Median hängt an der Reihenfolge, nicht an der Größe.',
        tryIt: { label: 'die gewählte Person auf 0 Stunden', op: 'outlier', column: 'x', value: 0 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Median?', options: ['bleibt gleich', 'steigt um 1 Stunde', 'steigt um 200 Stunden'], correct: 1, step: 3,
        explain: 'Die Reihenfolge bleibt dieselbe, nur jeder Wert ist eine Stunde größer. Also auch der mittlere Wert der Reihe nach.',
        kurz: 'Verschieben verschiebt den Median um genau so viel.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'plus', amount: 1 },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem Median?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1, step: 3,
        explain: 'Die Reihenfolge bleibt, und jeder Wert verdoppelt sich. Also verdoppelt sich auch der mittlere Wert der Reihe nach.',
        kurz: 'Malnehmen wirkt auf den Median genauso.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  r: {
    entry: 'median', variant: 0,
    outputMap: [
      { match: 'Median', atlas: 'x̃', step: 3, explain: 'Der mittlere Wert der Reihe nach, bei 200 Befragten die Mitte zwischen Platz 100 und Platz 101.' },
      { match: 'N', atlas: 'n', step: 2, explain: 'N zählt die gültigen Werte. Aus N folgt der Platz der Mitte, (N + 1) / 2.' },
      { match: 'Missing', atlas: 'fehlende Werte', explain: 'Missing zählt Befragte ohne Antwort. Sie gehen nicht in die Reihe ein.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist der Median? Tippe sie an.', correct: 'Median',
      wrong: {
        N: 'Fast! N ist die Zahl der Befragten. Der Median steht unter Median.',
        Missing: 'Fast! Missing zählt fehlende Antworten. Der Median steht unter Median.',
      },
    },
  },
  next: {
    next: { id: 'quantile', why: 'Dieselbe Idee für andere Plätze: Viertel statt Hälften.' },
    before: [
      { id: 'sorting', why: 'Erst ordnen, dann die Mitte suchen.' },
      { id: 'ordinal', why: 'Für den Median reicht eine Reihenfolge; gleiche Abstände braucht er nicht.' },
      { id: 'validn', why: 'n bestimmt, auf welchem Platz die Mitte liegt.' },
    ],
    after: [
      { id: 'mann_whitney', why: 'Vergleicht zwei Gruppen nach der Reihenfolge statt nach Mittelwerten.' },
      { id: 'describe', why: 'Zeigt Median und Mittelwert nebeneinander.' },
    ],
    more: [
      { id: 'mean', why: 'Die Mitte, die jeden Wert mit seiner Größe zählt.' },
      { id: 'shape', why: 'Liegen Mittelwert und Median weit auseinander, ist die Verteilung schief.' },
    ],
  },
};

export const quantileTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b03-reihe', variant: 'quantile', variable: LZ,
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem Interquartilsabstand?', options: ['steigt um 1 Stunde', 'bleibt gleich', 'verdoppelt sich'], correct: 1, step: 6,
        explain: 'Q₁ und Q₃ wachsen beide um eine Stunde. Ihr Abstand bleibt derselbe.',
        kurz: 'Verschieben ändert die Lage, nicht die Breite.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem Interquartilsabstand?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1, step: 6,
        explain: 'Die Reihenfolge bleibt, alle Werte verdoppeln sich, also auch Q₁, Q₃ und ihr Abstand.',
        kurz: 'Doppelte Werte, doppelter IQR.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  r: {
    entry: 'quantile', variant: 0,
    tokens: {
      probs: { sym: 'probs =', term: 'Anteile p', kurz: 'Die Anteile, zu denen R die Quantile rechnet: .25 und .75 sind die beiden Quartile, .5 ist der Median.', fehler: "Mit Prozentzahlen wie probs = c(25, 50, 75) bricht R ab und meldet: 'probs' nicht in [0, 1]. Schreib Anteile zwischen 0 und 1." },
    },
    outputMap: [
      { match: '5.800', atlas: 'Q₁', step: 5, explain: 'Unter 25% steht das erste Quartil: Etwa ein Viertel der Befragten liegt darunter.' },
      { match: '7.600', atlas: 'x̃', step: 3, explain: 'Unter 50% steht der Median, das Quantil zu 50 %.' },
      { match: '9.750', atlas: 'Q₃', step: 5, explain: 'Unter 75% steht das dritte Quartil. Q₃ minus Q₁ ergibt den IQR von 3,95 Stunden.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist das erste Quartil Q₁? Tippe sie an.', correct: '5.800',
      wrong: {
        '7.600': 'Fast! Das ist der Median, das Quantil zu 50 %. Q₁ steht unter 25%.',
        '9.750': 'Fast! Das ist das dritte Quartil Q₃. Q₁ steht unter 25%.',
      },
    },
  },
  next: {
    next: { id: 'outliers_influence', why: 'Mit dem IQR lassen sich auffällige Werte erkennen, etwa mehr als 1,5 · IQR außerhalb der Box.' },
    before: [
      { id: 'median', why: 'Das Quantil zu 50 %.' },
      { id: 'sorting', why: 'Quantile sind Plätze in der geordneten Reihe.' },
    ],
    after: [
      { id: 'theoretical_quantile', why: 'Quantile einer Modellverteilung, etwa der Normalverteilung.' },
      { id: 'critical_value', why: 'Ein kritischer Wert ist ein Quantil der Verteilung, die ohne Effekt gälte.' },
    ],
    more: [
      { id: 'range', why: 'Misst die ganze Breite statt der mittleren Hälfte.' },
      { id: 'describe', why: 'Zeigt Q25, Q75 und IQR neben den anderen Kennzahlen.' },
    ],
  },
};
