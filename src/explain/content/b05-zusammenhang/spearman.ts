// Werkstatt „Rangkorrelation“ für die Spearman-Korrelation: Pearson mit Rängen statt Werten (wie R und mariposa,
// auch bei gleichen Werten genau). Fünf Beispielpersonen, Brücke zu den 200 Befragten, Reiter.
// Alle Zahlen sind in R nachgerechnet, siehe ./b05-zusammenhang.test.ts.
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, Workshop } from '../../types';
import type { Pairs } from '../../math';
import { close, num, paren, signed } from '../../format';
import { sumNodes, unitText } from '../../sample';
import { eq, pl, place, shown, strength, T, word } from './shared';
import { relate } from '../../math';
import { averageRanks } from '../../../domain/descriptive';

/** Kennwerte der Rangkorrelation: Ränge, Abstände zum mittleren Rang, Produkte, Quadratsummen, ρ und zum Vergleich r. */
export type RankStats = {
  n: number; xs: number[]; ys: number[];
  rx: number[]; ry: number[];
  /** Mittlerer Rang (n + 1) / 2. */
  mid: number;
  dx: number[]; dy: number[];
  prod: number[];
  /** Summe der Produkte, Summe der positiven und der negativen Produkte, Summe der Beträge. */
  sp: number; pos: number; neg: number; absSum: number;
  qx: number; qy: number; den: number;
  rho: number | null;
  /** Pearson-r der Antworten selbst. */
  r: number | null;
  /** Kurzformel 1 − 6 · Σd² / (n(n² − 1)) mit d = R(x) − R(y); ohne gleiche Werte gleich ρ. */
  d2: number; short: number;
  ties: number;
};

export function rankStats(d: Pairs): RankStats {
  const n = d.x.length, rx = averageRanks(d.x), ry = averageRanks(d.y), mid = (n + 1) / 2;
  const dx = rx.map(v => v - mid), dy = ry.map(v => v - mid);
  const prod = dx.map((v, i) => v * dy[i] || 0);
  const sp = prod.reduce((a, b) => a + b, 0);
  const pos = prod.filter(p => p > 0).reduce((a, b) => a + b, 0), neg = prod.filter(p => p < 0).reduce((a, b) => a + b, 0);
  const qx = dx.reduce((a, v) => a + v * v, 0), qy = dy.reduce((a, v) => a + v * v, 0), den = Math.sqrt(qx * qy);
  const d2 = rx.reduce((a, v, i) => a + (v - ry[i]) ** 2, 0);
  const ties = new Set(d.x).size < n || new Set(d.y).size < n ? 1 : 0;
  return {
    n, xs: [...d.x], ys: [...d.y], rx, ry, mid, dx, dy, prod, sp, pos, neg, absSum: pos - neg, qx, qy, den,
    rho: den > 1e-12 ? sp / den : null, r: relate(d.x, d.y).r, d2, short: n > 1 ? 1 - 6 * d2 / (n * (n * n - 1)) : 0, ties,
  };
}

type C = Ctx<RankStats>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const hours = (v: number) => `${v} ${v === 1 ? 'Stunde' : 'Stunden'}`;
const tasks = (v: number) => `${v} ${v === 1 ? 'Aufgabe' : 'Aufgaben'}`;
/** „4 Stunden sind Platz 2 von 5, also Rang 2“ oder bei gleichen Werten die geteilten Plätze. */
function rankSentence(values: number[], i: number, label: (v: number) => string): string {
  const p = place(values, i);
  if (p.same === 1) return `${label(values[i])} sind Platz ${p.first} von ${values.length}, also Rang ${p.first}.`;
  const places = p.same === 2 ? `${p.first} und ${p.last}` : `${p.first} bis ${p.last}`;
  return `${label(values[i])} haben ${word(p.same)} Personen. Sie teilen sich die Plätze ${places} und bekommen je Rang ${num(p.rank)}.`;
}
const sideOf = (d: number) => d > 1e-9 ? 'über' : d < -1e-9 ? 'unter' : 'genau auf';
const X = [2, 4, 5, 7, 9];

/** Ein Summand der eingesetzten Formel: (R(xᵢ) − R̄) · (R(yᵢ) − R̄). */
const term = (rx: number, ry: number, mid: number): FNode[] => [
  { part: ['('], m: 3 }, { part: [num(rx)], m: 1 }, { part: [` − ${num(mid)}`], m: 2 }, { part: [')'], m: 3 },
  { part: [' · ('], m: 3 }, { part: [num(ry)], m: 1 }, { part: [` − ${num(mid)}`], m: 2 }, { part: [')'], m: 3 },
];
const plus4: FNode[] = [' ', { part: ['+'], m: 4 }, ' '];
/** Zweite Zeile der eingesetzten Formel: Summe durch das Größtmögliche. */
const result = (s: RankStats): FNode[] => ['= ', { part: [num(s.sp)], m: 4 }, ' ', { part: [`/ √(${num(s.qx)} · ${num(s.qy)})`], m: 5 },
  s.rho === null ? ': ' : ` ${eq(s.rho)} `, { part: [s.rho === null ? 'nicht definiert' : num(s.rho)], m: 5 }];

const KURZFORMEL = (s: RankStats) => s.ties
  ? `Ohne gleiche Werte gibt es eine Kurzformel: ρ = 1 − 6 · Σdᵢ² / (n(n² − 1)) mit dᵢ = R(xᵢ) − R(yᵢ). Mit gleichen Werten ist sie nur eine Näherung: Hier ergäbe sie ${num(s.short)} statt ρ ${s.rho === null ? 'nicht definiert' : `≈ ${num(s.rho)}`}. R rechnet deshalb wie diese Werkstatt.`
  : `Ohne gleiche Werte gibt es eine Kurzformel: ρ = 1 − 6 · Σdᵢ² / (n(n² − 1)) mit dᵢ = R(xᵢ) − R(yᵢ). Hier ist Σdᵢ² = ${num(s.d2)}, also ρ = 1 − 6 · ${num(s.d2)} / (5 · 24) = ${num(s.short)}, genau wie oben.`;

export const rangkorrelation: Workshop<Pairs, RankStats> = {
  id: 'b05-rangkorrelation',
  wofuer: 'Fünf Personen sagen, wie viele Stunden sie in der letzten Woche gelernt haben, und lösen einen kleinen Test mit zehn Aufgaben. Hängen Lernzeit und Ergebnis zusammen? Die Spearman-Korrelation schaut nicht auf die Zahlen selbst, sondern auf die Reihenfolge: Hat, wer am meisten lernt, auch die meisten Aufgaben gelöst?',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber aus fünf kleinen Schritten: Plätze vergeben, abziehen, malnehmen, zusammenzählen und teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b05-rangkorrelation',
  names: NAMES,
  bounds: { min: 1, max: 10 },
  presets: [
    { id: 'meist', label: 'Meist gleichläufig', data: { x: X, y: [3, 2, 6, 5, 8] } },
    { id: 'bogen', label: 'Steigend, aber gebogen', data: { x: [1, 2, 3, 5, 10], y: [2, 4, 7, 8, 9] } },
    { id: 'gleich', label: 'Mit gleichen Werten', data: { x: [2, 4, 4, 7, 9], y: [3, 5, 2, 5, 8] } },
  ],
  compute: rankStats,
  glyphs: [
    { sym: 'R(xᵢ), R(yᵢ)', say: 'R von x i, R von y i', term: 'Ränge', plain: 'der Platz einer Antwort in der Reihenfolge, vom kleinsten Wert an', step: 1 },
    { sym: 'R̄', say: 'R quer', term: 'Mittlerer Rang', plain: '(n + 1) / 2, bei fünf Personen 3', step: 2 },
    { sym: '( ) · ( )', say: 'mal', term: 'Produkt der Rangabstände', plain: 'die beiden Abstände einer Person malnehmen', step: 3 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles zusammenzählen, jede Person einmal', step: 4 },
    { sym: '√', say: 'Wurzel', term: 'Quadratwurzel', plain: 'macht aus dem Produkt der beiden Quadratsummen wieder eine Größe wie die Summe', step: 5 },
    { sym: 'ρ', say: 'rho', term: 'Spearman-Korrelation', plain: 'Zusammenhang der Reihenfolgen, zwischen −1 und +1', step: 5 },
  ],
  steps: [
    {
      button: 'R( )', title: 'Plätze vergeben', sym: 'R(xᵢ), R(yᵢ)', say: 'R von x i, R von y i', concept: 'ranks', perPerson: true,
      was: 'Wir ersetzen jede Antwort durch ihren Platz in der Reihenfolge. Die kleinste Antwort bekommt Rang 1, die größte Rang 5, für beide Fragen getrennt.',
      rechnung: c => `Person ${P(c)}: ${rankSentence(c.s.xs, c.who, hours)} ${rankSentence(c.s.ys, c.who, tasks)}`,
      fach: 'Der Rang R(xᵢ) ist der Platz eines Werts in der aufsteigend sortierten Reihe. Gleiche Werte erhalten den Mittelwert ihrer Plätze, den mittleren Rang.',
      warum: 'Ränge behalten nur die Reihenfolge. Wie weit zwei Antworten auseinanderliegen, zählt danach nicht mehr. Deshalb stört ein einzelner Ausreißer wenig.',
      acht: 'Rang 1 bekommt die kleinste Antwort, nicht die größte. Bei gleichen Antworten nicht losen: Alle bekommen den Mittelwert ihrer Plätze, etwa 2,5 für die Plätze 2 und 3.',
      check: {
        question: c => `Welchen Rang hat Person ${P(c)} bei den Lernstunden?`,
        answer: c => c.s.rx[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const i = c.who, R = c.s.rx[i], x = c.s.xs[i], p = place(c.s.xs, i);
          if (close(v, R)) return null;
          if (!close(x, R) && close(v, x)) return 'Fast! Das ist die Antwort selbst. Gesucht ist ihr Platz in der Reihenfolge, von der kleinsten Antwort an gezählt.';
          if (close(v, c.s.n + 1 - R)) return 'Fast! Du hast von der größten Antwort an gezählt. Rang 1 bekommt die kleinste Antwort.';
          if (p.same > 1 && Number.isInteger(v) && v >= p.first && v <= p.last) return `Fast! Gleiche Antworten teilen sich ihre Plätze. Alle bekommen den Mittelwert, hier ${num(R)}.`;
          return null;
        },
      },
    },
    {
      button: 'R − R̄', title: 'Abstand zum mittleren Rang', sym: 'R(xᵢ) − R̄, R(yᵢ) − R̄', say: 'R von x i minus R quer, R von y i minus R quer', concept: 'deviation', perPerson: true,
      was: 'Die Ränge 1 bis 5 haben immer die Mitte 3. Für jede Person messen wir bei beiden Fragen, wie weit ihr Rang davon entfernt ist.',
      rechnung: c => {
        const dx = c.s.dx[c.who], dy = c.s.dy[c.who];
        const where = sideOf(dx) === sideOf(dy) ? `Bei beiden Fragen liegt ${P(c)} ${sideOf(dx)} dem mittleren Rang.` : `Bei den Stunden liegt ${P(c)} ${sideOf(dx)} dem mittleren Rang, bei den Aufgaben ${sideOf(dy)}.`;
        return `Person ${P(c)}: Stunden ${num(c.s.rx[c.who])} − 3 = ${signed(dx)}, Aufgaben ${num(c.s.ry[c.who])} − 3 = ${signed(dy)}. ${where}`;
      },
      fach: 'Der mittlere Rang R̄ = (n + 1) / 2 ist der Mittelwert der Ränge, auch bei gleichen Werten. Die Abweichungen vom mittleren Rang tragen ein Vorzeichen.',
      warum: 'Ab hier rechnest du wie bei der Pearson-Korrelation, nur mit Rängen statt mit Antworten. Das Vorzeichen zeigt, ob jemand in der oberen oder unteren Hälfte steht.',
      acht: 'Abgezogen wird der mittlere Rang 3, nicht der Mittelwert der Antworten. Die Antworten selbst kommen ab Schritt 1 nicht mehr vor.',
      check: {
        question: c => `Wie weit liegt Person ${P(c)} mit ihrem Rang bei den Aufgaben vom mittleren Rang weg? Mit Vorzeichen.`,
        answer: c => c.s.dy[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const dx = c.s.dx[c.who], dy = c.s.dy[c.who];
          if (Math.abs(dy) > 1e-9 && close(v, -dy)) return 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne Rang minus 3.';
          if (!close(dx, dy) && close(v, dx)) return 'Fast! Das ist der Abstand bei den Lernstunden. Gefragt sind die Aufgaben.';
          return null;
        },
      },
    },
    {
      button: '( ) · ( )', title: 'Die Abstände malnehmen', sym: '(R(xᵢ) − R̄)(R(yᵢ) − R̄)', say: 'R von x i minus R quer, mal R von y i minus R quer', concept: 'crossproduct', perPerson: true,
      was: 'Wir nehmen die beiden Rangabstände einer Person miteinander mal. Plus heißt: Die Person steht bei beiden Fragen auf derselben Seite der Mitte.',
      rechnung: c => {
        const p = c.s.prod[c.who];
        const how = p > 1e-9 ? `Plus: ${P(c)} steht bei beiden Fragen auf derselben Seite.` : p < -1e-9 ? `Minus: ${P(c)} steht auf verschiedenen Seiten.` : `Null: ${P(c)} steht bei einer Frage genau auf dem mittleren Rang.`;
        return `Person ${P(c)}: ${paren(c.s.dx[c.who])} · ${paren(c.s.dy[c.who])} = ${num(p)}. ${how}`;
      },
      fach: 'Das Produkt der Rangabweichungen ist positiv, wenn eine Person bei beiden Variablen auf derselben Seite des mittleren Rangs liegt.',
      warum: 'So gibt jede Person eine Stimme ab: für gleichläufige oder für gegenläufige Reihenfolgen. Wer weit außen steht, zählt mehr.',
      acht: 'Minus mal Minus ergibt Plus. Wer bei beiden Fragen weit hinten steht, passt genauso zum gleichläufigen Muster wie jemand, der bei beiden vorne steht.',
      check: {
        question: c => `Was kommt heraus, wenn du die beiden Rangabstände von Person ${P(c)} malnimmst?`,
        answer: c => c.s.prod[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const p = c.s.prod[c.who], dx = c.s.dx[c.who], dy = c.s.dy[c.who];
          if (Math.abs(p) > 1e-9 && close(v, -p)) return 'Fast! Achte auf das Vorzeichen: Minus mal Minus ergibt Plus, Plus mal Minus ergibt Minus.';
          if (!close(dx + dy, p) && close(v, dx + dy)) return 'Fast! Das ist die Summe der beiden Abstände. Gefragt ist ihr Produkt.';
          return null;
        },
      },
    },
    {
      button: 'Σ', title: 'Alles zusammenzählen', sym: 'Σ', say: 'Sigma', concept: 'crossproduct_sum', perPerson: false,
      was: 'Wir zählen die fünf Produkte zusammen, mit ihren Vorzeichen. Plus und Minus verrechnen sich dabei.',
      rechnung: c => `${c.s.prod.map(p => paren(p)).join(' + ')} = ${num(c.s.sp)}. ${c.s.sp > 1e-9 ? 'Die Plusbeiträge überwiegen.' : c.s.sp < -1e-9 ? 'Die Minusbeiträge überwiegen.' : 'Plus und Minus heben sich auf.'}`,
      fach: 'Die Summe der Produkte der Rangabweichungen fasst zusammen, wie gut die beiden Reihenfolgen übereinstimmen.',
      warum: 'Je mehr Personen bei beiden Fragen auf derselben Seite stehen, desto größer wird die Summe. Erst über alle Personen zeigt sich, welches Muster überwiegt.',
      acht: 'Negative Produkte zählen mit ihrem Minus. Wer sie positiv zählt, macht den Zusammenhang stärker, als er ist.',
      check: {
        question: 'Wie groß ist die Summe der fünf Produkte?',
        answer: c => c.s.sp,
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          if (c.s.neg < -1e-9 && close(v, c.s.absSum)) return 'Fast! Du hast die negativen Produkte positiv gezählt. Sie gehören mit Minus in die Summe.';
          if (Math.abs(c.s.sp) > 1e-9 && close(v, 0)) return 'Fast! 0 ist die Summe der Rangabstände einer Frage. Gefragt ist die Summe der Produkte.';
          return null;
        },
      },
    },
    {
      button: '÷ √( )', title: 'Mit dem Größtmöglichen vergleichen', sym: 'ρ', say: 'rho', concept: 'spearman', perPerson: false,
      links: [{ id: 'pearson', label: 'Pearson-Korrelation' }],
      was: 'Wir teilen die Summe durch das Größtmögliche: die Wurzel aus dem Produkt der beiden Quadratsummen (die quadrierten Rangabstände, zusammengezählt). Heraus kommt eine Zahl zwischen −1 und +1.',
      rechnung: c => c.s.rho === null
        ? 'Bei einer Frage haben alle denselben Rang. Dann ist eine Quadratsumme 0, und durch 0 kann man nicht teilen: ρ ist nicht definiert.'
        : c.s.ties
          ? `Quadratsummen: ${num(c.s.qx)} bei den Stunden, ${num(c.s.qy)} bei den Aufgaben. ρ = ${num(c.s.sp)} / √(${num(c.s.qx)} · ${num(c.s.qy)}) = ${num(c.s.sp)} / ${num(c.s.den)} ${eq(c.s.rho)} ${num(c.s.rho)}.`
          : `Ohne gleiche Werte ist jede Quadratsumme 10: (−2)² + (−1)² + 0² + 1² + 2². Also ρ = ${num(c.s.sp)} / √(10 · 10) = ${num(c.s.sp)} / 10 = ${num(c.s.rho)}.`,
      fach: 'Spearman-ρ ist die Pearson-Korrelation der Ränge: die Summe der Produkte geteilt durch √(Σ(R(xᵢ) − R̄)² · Σ(R(yᵢ) − R̄)²). Das n − 1 der Pearson-Formel kürzt sich weg.',
      warum: 'Im Betrag kann die Summe nie größer werden als diese Wurzel. Teilen wir dadurch, liegt ρ immer zwischen −1 und +1, egal wie viele Personen es sind.',
      acht: 'ρ = 1 heißt: Die Reihenfolge ist bei beiden Fragen genau gleich. Es heißt nicht, dass die Punkte auf einer Geraden liegen.',
      check: {
        question: c => c.s.rho === null ? 'Wie groß ist ρ? Eine Quadratsumme ist hier 0. Tippe NA, wenn ρ nicht definiert ist.' : 'Wie groß ist ρ? Zwei Nachkommastellen reichen.',
        answer: c => c.s.rho === null ? 'NA' : c.s.rho,
        diagnose: (c, v) => {
          if (v === 'NA' || c.s.rho === null || close(v, c.s.rho)) return null;
          if (!close(c.s.sp, c.s.rho) && close(v, c.s.sp)) return 'Fast! Das ist noch die Summe aus Schritt 4. Teile sie durch das Größtmögliche.';
          if (close(v, c.s.sp / 4)) return 'Fast! Du hast durch 4 geteilt wie bei der Kovarianz. Hier teilst du durch die Wurzel aus dem Produkt der Quadratsummen.';
          if (c.s.r !== null && close(v, c.s.r)) return 'Fast! Das ist Pearson-r der Antworten selbst. ρ rechnet mit den Rängen.';
          if (c.s.ties && close(v, c.s.short)) return 'Fast! Das ist die Kurzformel mit den Rangdifferenzen. Bei gleichen Werten stimmt sie nur ungefähr.';
          return null;
        },
      },
    },
  ],
  numeric: c => ['ρ = [ ', ...c.s.xs.flatMap((_, i): FNode[] => [...(i ? plus4 : []), ...term(c.s.rx[i], c.s.ry[i], c.s.mid)]), ' ] ',
    { part: [`/ √(${num(c.s.qx)} · ${num(c.s.qy)})`], m: 5 }, { br: true }, ...result(c.s)],
  table: {
    columns: [
      { head: 'xᵢ → R(xᵢ)', from: 1, active: [1], cell: (c, i) => `${c.s.xs[i]} → ${num(c.s.rx[i])}` },
      { head: 'yᵢ → R(yᵢ)', from: 1, active: [1], cell: (c, i) => `${c.s.ys[i]} → ${num(c.s.ry[i])}` },
      { head: 'R(xᵢ) − R̄', from: 2, active: [2], cell: (c, i) => signed(c.s.dx[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer' },
      { head: 'R(yᵢ) − R̄', from: 2, active: [2], cell: (c, i) => signed(c.s.dy[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer' },
      { head: 'Produkt', from: 3, active: [3, 4], cell: (c, i) => num(c.s.prod[i]), sum: c => num(c.s.sp), sumFrom: 4, tone: (c, i) => c.s.prod[i] > 1e-9 ? 'pos' : c.s.prod[i] < -1e-9 ? 'neg' : undefined },
    ],
    lines: [
      { from: 1, step: 1, text: () => 'Jede Rangreihe ergibt zusammen 1 + 2 + 3 + 4 + 5 = 15, auch mit gleichen Werten.' },
      { from: 2, step: 2, text: () => 'R̄ = (5 + 1) / 2 = 3' },
      { from: 5, step: 5, text: c => `Quadratsummen ${num(c.s.qx)} und ${num(c.s.qy)}: ρ = ${num(c.s.sp)} / √(${num(c.s.qx)} · ${num(c.s.qy)})${c.s.rho === null ? ', nicht definiert' : ` ${eq(c.s.rho)} ${num(c.s.rho)}`}` },
    ],
  },
  captions: {
    1: 'Oben die Antworten, unten ihre Plätze. Du kannst die Punkte oben ziehen.',
    2: 'Das Kreuz unten liegt beim mittleren Rang 3. Die Linien zeigen die Abstände dazu.',
    3: 'Rechts oben und links unten zählen plus, die anderen Felder minus.',
    4: 'Die Summe legt alle Plus- und Minusflächen gegeneinander.',
    5: 'Die Summe im Vergleich zum Größtmöglichen: Das Verhältnis ist ρ.',
  },
  think: [
    {
      question: 'In „Meist gleichläufig“ hat Person E allein die meisten Lernstunden, 9. Sie lernt noch eine Stunde mehr. Was passiert mit ρ?',
      options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 1,
      explain: 'E hat weiter die meisten Stunden, ihr Rang bleibt 5. Alle Ränge bleiben gleich, also auch ρ. Pearson-r ändert sich dagegen, weil es mit den Abständen rechnet: von 0,83 auf 0,84.',
      kurz: 'Ränge sind gegen Ausreißer robust.',
      tryIt: { label: '„Meist gleichläufig“, E auf 10 Stunden', apply: () => ({ x: [2, 4, 5, 7, 10], y: [3, 2, 6, 5, 8] }) },
    },
    {
      question: 'Die Punkte steigen immer, aber in einem Bogen. Welche Zahl ist größer, Pearson-r oder ρ?',
      options: ['Pearson-r', 'ρ', 'beide gleich'], correct: 1, step: 5,
      explain: 'Die Reihenfolgen stimmen dann genau überein, also ist ρ = 1. Die Punkte liegen aber nicht auf einer Geraden, deshalb ist r kleiner, im Beispiel etwa 0,84.',
      kurz: 'ρ misst stetiges Steigen, r gerades Steigen.',
      tryIt: { label: 'steigend, aber gebogen', apply: () => ({ x: [1, 2, 3, 5, 10], y: [2, 4, 7, 8, 9] }) },
    },
    {
      question: 'B und C haben gleich lange gelernt, 4 Stunden. Welchen Rang bekommen sie?',
      options: ['beide den kleineren Platz', 'beide den Mittelwert ihrer Plätze', 'einer Platz 2, einer Platz 3'], correct: 1, step: 1,
      explain: 'Sie teilen sich die Plätze 2 und 3 und bekommen beide Rang 2,5. So bleibt die Summe aller Ränge 15, und niemand wird bevorzugt.',
      kurz: 'Gleiche Werte, gleicher mittlerer Rang.',
      tryIt: { label: 'mit gleichen Werten', apply: () => ({ x: [2, 4, 4, 7, 9], y: [3, 5, 2, 5, 8] }) },
    },
    {
      question: 'Die Reihenfolge bei den Aufgaben ist genau umgekehrt wie bei den Stunden. Wie groß ist ρ?',
      options: ['0', '−1', '+1'], correct: 1, step: 5,
      explain: 'Wer bei den Stunden Rang 1 hat, hat bei den Aufgaben Rang 5 und so weiter. Jedes Produkt ist negativ oder 0, die Summe ist −10, und −10 / 10 = −1.',
      kurz: 'Umgekehrte Reihenfolge heißt ρ = −1.',
      tryIt: { label: 'Reihenfolge umkehren', apply: () => ({ x: X, y: [9, 7, 5, 3, 2] }) },
    },
  ],
  variants: {
    spearman: {
      lastStep: 5,
      kurz: 'Die Spearman-Korrelation sagt dir, ob zwei Reihenfolgen zusammenpassen: Liegt, wer bei der einen Frage vorne liegt, auch bei der anderen vorne? Sie reicht von −1 über 0 bis +1.',
      fachlich: 'Die Pearson-Korrelation der Ränge beider Variablen; gleiche Werte erhalten mittlere Ränge.',
      symbolic: ['ρ = ', { frac: [
        { big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['R(x', { sub: 'i' }, ')'], m: 1 }, { part: [' − R̄'], m: 2 }, { part: [')('], m: 3 },
        { part: ['R(y', { sub: 'i' }, ')'], m: 1 }, { part: [' − R̄'], m: 2 }, { part: [')'], m: 3 },
      ], den: [{ big: '√', m: 5 }, { root: [{ part: ['Σ(R(xᵢ) − R̄)²'], m: 5 }, ' · ', { part: ['Σ(R(yᵢ) − R̄)²'], m: 5 }], m: 5 }], m: 5 }],
      aria: 'rho gleich: Summe über alle Personen i von R von x i minus R quer, mal R von y i minus R quer; geteilt durch die Wurzel aus dem Produkt der beiden Quadratsummen der Rangabstände',
      metrics: [
        { label: 'Pearson-r der Antworten', value: c => c.s.r === null ? 'nicht definiert' : num(c.s.r) },
        { label: 'Spearman-ρ', value: c => c.s.rho === null ? 'nicht definiert' : num(c.s.rho) },
      ],
      interpret: c => {
        if (c.s.rho === null) return { kurz: 'Bei einer Frage haben alle dieselbe Antwort. Dann gibt es keine Reihenfolge, die man vergleichen könnte.', fachlich: 'Eine Rangreihe ist konstant, ihre Quadratsumme ist 0. Deshalb ist ρ nicht definiert.' };
        const rho = c.s.rho, dir = rho > 0 ? 'gleichläufiger' : 'gegenläufiger';
        return {
          kurz: shown(rho) < 0.1 ? 'Die beiden Reihenfolgen haben hier kaum etwas miteinander zu tun.'
            : shown(rho) >= 1 ? `Die Reihenfolgen stimmen ${rho > 0 ? 'genau überein: Wer mehr lernt, hat auch mehr Aufgaben gelöst.' : 'genau umgekehrt überein: Wer mehr lernt, hat weniger Aufgaben gelöst.'}`
            : `${rho > 0 ? 'Wer mehr lernt, hat hier eher auch mehr Aufgaben gelöst, mit Ausnahmen.' : 'Wer mehr lernt, hat hier eher weniger Aufgaben gelöst, mit Ausnahmen.'} Das ist ein ${dir}, ${strength(rho)} Zusammenhang der Reihenfolgen.`,
          fachlich: `ρ = ${num(rho)}, Pearson-r der Antworten: ${c.s.r === null ? 'nicht definiert' : num(c.s.r)}. Nach der verbreiteten Faustregel von Cohen ist ein Betrag ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark. Bei nur fünf Personen ist ρ sehr unsicher; die Werkstatt zeigt die Rechnung, keinen Befund.`,
        };
      },
      genau: {
        kurz: 'ρ beschreibt jedes Muster, das stetig steigt oder stetig fällt, nicht nur gerade. Bei gleichen Werten rechnet R mit mittleren Rängen, genau wie diese Werkstatt.',
        paragraphs: c => [
          KURZFORMEL(c.s),
          'Spearman passt zu geordneten Kategorien wie dem Schulabschluss und zu metrischen Daten mit Ausreißern. Ein U-förmiges Muster bleibt aber auch für ρ unsichtbar: Es steigt nicht stetig.',
          'spearman_rho() aus mariposa rechnet ρ ebenso und meldet dazu einen p-Wert aus einer t-Näherung mit n − 2 Freiheitsgraden. Bei nur fünf Personen ist dieser p-Wert wenig verlässlich.',
          'Ein Zusammenhang beweist keine Ursache: Wer mehr lernt und mehr löst, kann sich auch in anderem unterscheiden, etwa im Vorwissen (Begriff „Confounding“).',
        ],
      },
    },
  },
};

// ---------- Brücke „Mit 200 Befragten“ ----------

type BC = BridgeCtx<RankStats>;
const N = (c: BC) => c.values.length;
const PB = (c: BC) => c.names[c.who];
const t1 = (c: BC) => `„${c.col.title}“`, t2 = (c: BC) => `„${c.col2!.title}“`;
const y2 = (c: BC, v: number) => unitText(c.col2!, v);

export const bridgeRangkorrelation: Bridge<RankStats> = {
  data: 'pairs',
  numeric: c => ['ρ = [ ', ...sumNodes(N(c), c.who, i => term(c.s.rx[i], c.s.ry[i], c.s.mid), plus4), ' ] ',
    { part: [`/ √(${num(c.s.qx)} · ${num(c.s.qy)})`], m: 5 }, { br: true }, ...result(c.s)],
  lines: [
    {
      all: c => `Jede Spalte wird für sich sortiert: Rang 1 bekommt der kleinste Wert, Rang ${N(c)} der größte. Gleiche Werte teilen sich ihre Plätze.`,
      person: c => {
        const p = place(c.values, c.who);
        return `${PB(c)} hat bei ${t1(c)} ${c.u(c.values[c.who])}, das ist Rang ${num(c.s.rx[c.who])}${p.same === 2 ? ', geteilt mit einer weiteren Person' : p.same > 2 ? `, geteilt mit ${p.same - 1} weiteren` : ''}. Bei ${t2(c)} hat ${PB(c)} ${y2(c, c.values2![c.who])}: Rang ${num(c.s.ry[c.who])}.`;
      },
    },
    {
      all: c => `Der mittlere Rang ist (${N(c)} + 1) / 2 = ${num(c.s.mid)}. Für jede Person gibt es zwei Abstände dazu; jede Sorte ergibt zusammen 0.`,
      person: c => `${PB(c)}: ${num(c.s.rx[c.who])} − ${num(c.s.mid)} = ${signed(c.s.dx[c.who])} und ${num(c.s.ry[c.who])} − ${num(c.s.mid)} = ${signed(c.s.dy[c.who])}.`,
    },
    {
      all: () => 'Je Person werden die beiden Rangabstände malgenommen. Gleiche Vorzeichen ergeben Plus, verschiedene ergeben Minus.',
      person: c => {
        const p = c.s.prod[c.who];
        return `${PB(c)}: ${paren(c.s.dx[c.who])} · ${paren(c.s.dy[c.who])} ${eq(p)} ${signed(p)}${Math.abs(p) < 0.005 ? ', also kein Beitrag' : p > 0 ? ', dieselbe Seite bei beiden Spalten' : ', verschiedene Seiten'}.`;
      },
    },
    {
      all: c => `Die ${N(c)} Produkte ergeben zusammen ${num(c.s.sp)}. ${pl(c.s.prod.filter(p => p > 1e-9).length, 'ist', 'sind')} positiv, ${c.s.prod.filter(p => p < -1e-9).length} negativ.`,
      person: c => `${PB(c)} steuert ${signed(c.s.prod[c.who])} zur Summe bei.`,
    },
    {
      all: c => c.s.rho === null ? 'Eine der beiden Spalten hat lauter gleiche Werte. Dann ist ρ nicht definiert.'
        : `${num(c.s.sp)} / √(${num(c.s.qx)} · ${num(c.s.qy)}) ≈ ${num(c.s.rho)}. Zum Vergleich: Pearson-r der Werte selbst ist ${c.s.r === null ? 'nicht definiert' : num(c.s.r)}.`,
      person: c => {
        const p = c.s.prod[c.who], rho = c.s.rho ?? 0;
        return Math.abs(p) < 0.005 || Math.abs(rho) < 0.005 ? `${PB(c)} trägt kaum etwas zu ρ bei.`
          : `${PB(c)} ${p * rho > 0 ? 'stützt' : 'schwächt'} den ${rho > 0 ? 'gleichläufigen' : 'gegenläufigen'} Zusammenhang der Reihenfolgen.`;
      },
    },
  ],
  metrics: c => [
    { label: 'Befragte n', value: String(N(c)) },
    { label: 'Pearson-r der Werte', value: c.s.r === null ? 'nicht definiert' : num(c.s.r) },
    { label: 'Spearman-ρ', value: c.s.rho === null ? 'nicht definiert' : num(c.s.rho) },
  ],
  interpret: c => {
    const same = c.s.prod.filter(p => p > 1e-9).length;
    const zusatz = `${same} von ${N(c)} Befragten stehen bei beiden Spalten auf derselben Seite des mittleren Rangs.`;
    if (c.s.rho === null) return { kurz: 'Eine der beiden Spalten hat lauter gleiche Werte. Dann gibt es keine Reihenfolge, die man vergleichen könnte.', fachlich: 'Eine Rangreihe ist konstant, deshalb ist ρ nicht definiert.', zusatz };
    const rho = c.s.rho;
    return {
      kurz: shown(rho) < 0.1 ? `Die Reihenfolgen bei ${t1(c)} und ${t2(c)} hängen hier kaum zusammen.`
        : `Wer bei ${t1(c)} einen höheren Rang hat, hat bei ${t2(c)} eher ${rho > 0 ? 'auch einen höheren' : 'einen niedrigeren'}. Das ist ein ${rho > 0 ? 'gleichläufiger' : 'gegenläufiger'}, ${strength(rho)} Zusammenhang der Reihenfolgen.`,
      fachlich: `Die Spearman-Korrelation von ${t1(c)} und ${t2(c)} beträgt ρ ≈ ${num(rho)} bei n = ${N(c)}; Pearson-r der Werte selbst ist ${c.s.r === null ? 'nicht definiert' : num(c.s.r)}. Nach der Faustregel von Cohen ist ein Betrag ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark.`,
      zusatz,
    };
  },
  voraussetzung: () => 'Beide Spalten brauchen eine Reihenfolge, geordnete Kategorien reichen. ρ erfasst Muster, die stetig steigen oder fallen; ein einzelner Ausreißer zählt nur mit seinem Rang.',
  picture: (c, step) => ({
    contributions: step === 3 || step === 4 ? { label: 'Produkte der Rangabstände aller Befragten, der Größe nach', values: c.s.prod } : undefined,
  }),
  value: c => c.s.rho,
};
rangkorrelation.bridge = bridgeRangkorrelation;

// ---------- Reiter ----------

export const spearmanTabs: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'b05-rangkorrelation', variant: 'spearman', variable: 'lernzeit,wissenstest',
    think: [
      {
        question: 'Alle lernen doppelt so lange. Was macht ρ?', options: ['bleibt gleich', 'verdoppelt sich', 'wird kleiner'], correct: 0, step: 1,
        explain: 'Die Reihenfolge der Lernzeiten bleibt dieselbe: Wer vorher mehr gelernt hat, hat auch jetzt mehr gelernt. Gleiche Ränge in Schritt 1, also gleiches ρ.',
        kurz: 'ρ hängt nur an der Reihenfolge.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'same' },
      },
      {
        question: 'Der Wissenstest wird umgepolt: Aus vielen gelösten Aufgaben werden wenige. Was macht ρ?', options: ['bleibt gleich', 'wechselt das Vorzeichen', 'wird 0'], correct: 1, step: 5,
        explain: 'Die Reihenfolge im Wissenstest dreht sich um: Rang 1 wird Rang 200. Jeder Rangabstand wechselt sein Vorzeichen (Schritt 2), also auch die Summe und ρ (Schritt 5).',
        kurz: 'Umpolen dreht die Richtung, nicht die Stärke.',
        tryIt: { label: 'Wissenstest umpolen (20 minus Aufgaben)', op: 'reverse', column: 'y' },
        expect: { change: 'sign' },
      },
      {
        question: 'Alle lernen eine Stunde mehr. Was macht ρ?', options: ['wird größer', 'bleibt gleich', 'wird kleiner'], correct: 1, step: 1,
        explain: 'Eine Stunde mehr für alle ändert keine Reihenfolge. Die Ränge bleiben, und ρ bleibt gleich.',
        kurz: 'Verschieben ändert keine Ränge.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
    ],
  },
  r: {
    entry: 'spearman', variant: 0,
    tokens: {
      spearman_rho: { sym: 'spearman_rho()', term: T('spearman'), kurz: 'Berechnet Spearman-ρ für zwei oder mehr Spalten, dazu den p-Wert und die Zahl der Befragten N.', fehler: 'Mit nur einer Spalte meldet mariposa: At least two variables must be specified for correlation analysis.' },
    },
    outputMap: [
      { match: 'rho', atlas: 'ρ', explain: 'rho ist die Spearman-Korrelation: Pearson-r der Ränge von Finanzlage und Schulabschluss. Dieselbe Zahl siehst du im Teil mit den 200 Befragten, wenn du Finanzielle Lage und Schulabschluss wählst.' },
      { match: 'p', atlas: 'p-Wert', explain: 'Gäbe es unter allen Menschen keinen Zusammenhang der Reihenfolgen, käme ein so großes ρ in etwa 7 von 100 Stichproben vor.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die Befragten mit gültigen Werten in beiden Spalten.' },
    ],
    check: {
      question: 'Welche Zahl in der Ausgabe ist ρ? Tippe sie an.', correct: 'rho',
      wrong: { p: 'Fast! Das ist der p-Wert. Er sagt, wie überraschend ρ wäre, wenn es keinen Zusammenhang gäbe. ρ steht hinter rho =.', N: 'Fast! Das ist die Zahl der Befragten. ρ steht hinter rho =.' },
    },
  },
  next: {
    next: { id: 'kendall_tau', why: 'Noch ein Maß für Reihenfolgen: Es vergleicht Personen paarweise und zählt Gleichstände ausdrücklich mit.' },
    before: [
      { id: 'ranks', why: 'Die Plätze, mit denen Spearman statt der Werte rechnet.' },
      { id: 'pearson', why: 'Dieselbe Formel, nur mit den Werten selbst.' },
      { id: 'ordinal', why: 'Für geordnete Kategorien ist Spearman gemacht.' },
    ],
    after: [
      { id: 'mann_whitney', why: 'Auch dieser Test rechnet mit Rängen statt mit Werten.' },
      { id: 'correlation_matrix', why: 'Auch Rangkorrelationen lassen sich für viele Spalten nebeneinanderstellen.' },
    ],
    more: [
      { id: 'linear', why: 'Pearson verlangt ein gerades Muster, Spearman nur ein stetig steigendes oder fallendes.' },
      { id: 'p_value', why: 'Wie überraschend wäre ein ρ dieser Größe, wenn es keinen Zusammenhang gäbe?' },
    ],
  },
};
