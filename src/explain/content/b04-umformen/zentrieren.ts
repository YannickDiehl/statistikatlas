// Werkstatt „Zentrieren“ (Begriff `centering`): von jeder Lernzeit die Mitte abziehen. Die ersten beiden Schritte
// teilt sie mit der Werkstatt „Standardisieren“ (z). Ton nach src/explain/content/streuung.ts; Zahlen in R
// nachgerechnet, siehe b04-umformen.test.ts.
import type { Bridge, BridgeCtx, ConceptTabs, Ctx, FNode, Step, Workshop } from '../../types';
import { num, signed, close } from '../../format';
import { sumNodes } from '../../sample';
import { NAMES, P, N, amount, eq, hours, lernzeit, scaleNote, shiftWithin, toMiddle, valuesOf, zstats, type ZStats } from './shared';

type C = Ctx<ZStats>;
type BC = BridgeCtx<ZStats>;

/** Wertebereich der fünf Lernzeiten (Stunden in den letzten sieben Tagen) beim Ziehen. */
export const LINEAL_BOUNDS = { min: 0, max: 20 };
/** Voreinstellungen beider Werkstätten: Mitte 8 und s = 2; mit einer Viellernerin Mitte 10 und s ≈ 5,83. */
export const LINEAL_PRESETS = [
  { id: 'gruppe', label: 'Fünf Personen: 5 7 9 9 10', data: [5, 7, 9, 9, 10] },
  { id: 'viel', label: 'Mit einer Viellernerin: 5 7 9 9 20', data: [5, 7, 9, 9, 20] },
];

const side = (c: C) => {
  const d = c.s.dev[c.who];
  return Math.abs(d) < 1e-9 ? `${P(c)} lernt genau so lange wie der Durchschnitt.` : `${P(c)} lernt ${hours(Math.abs(d))} ${d > 0 ? 'mehr' : 'weniger'} als der Durchschnitt.`;
};

/** Schritt 1 beider Werkstätten: die Mitte der fünf Lernzeiten. */
export const STEP_MITTE: Step<ZStats> = {
  button: 'x̄', title: 'Die Mitte finden', sym: 'x̄', say: 'x quer', concept: 'mean', perPerson: false,
  was: 'Wir zählen alle fünf Lernzeiten zusammen und teilen durch fünf. Das ist die Mitte der Gruppe.',
  rechnung: c => `(${c.s.xs.map(x => num(x)).join(' + ')}) / 5 = ${num(c.s.sum)} / 5 ${eq(c.s.mean)} ${num(c.s.mean)}`,
  fach: 'Das arithmetische Mittel x̄ ist die Summe aller Werte geteilt durch die Fallzahl n.',
  warum: 'Gleich vergleichen wir jede Lernzeit mit dieser Mitte. Dafür brauchen wir sie zuerst.',
  acht: 'Hier teilst du durch alle fünf Personen. Das n − 1 gehört erst zur Streuung.',
  check: {
    question: 'Wo liegt die Mitte der fünf Lernzeiten?',
    answer: c => c.s.mean,
    diagnose: (c, v) => v === 'NA' || c.s.sum < 1e-9 ? null
      : close(v, c.s.sum) ? 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.'
      : close(v, c.s.sum / 4) ? 'Fast! Du hast durch 4 geteilt. Für die Mitte teilst du durch alle fünf.'
      : null,
  },
};

/** Schritt 2 beider Werkstätten: die Mitte von jeder Lernzeit abziehen (Begriff `centering`). */
export const STEP_ZENTRIEREN: Step<ZStats> = {
  button: 'xᵢ − x̄', title: 'Die Mitte abziehen', sym: 'xᵢ − x̄', say: 'x i minus x quer', concept: 'centering', perPerson: true,
  links: [{ id: 'deviation', label: 'Abweichung vom Mittelwert' }],
  was: 'Von jeder Lernzeit ziehen wir dieselbe Zahl ab: die Mitte. Danach liegt die Mitte bei 0.',
  rechnung: c => `Person ${P(c)}: ${num(c.s.xs[c.who])} − ${num(c.s.mean)} = ${signed(c.s.dev[c.who])}. ${side(c)}`,
  fach: 'Zentrieren heißt, von allen Werten denselben Mittelwert x̄ abzuziehen. Die zentrierten Werte sind die Abweichungen vom Mittelwert und haben selbst den Mittelwert 0.',
  warum: 'Jetzt zeigt jede Zahl sofort, ob jemand über oder unter dem Durchschnitt liegt. Das Vorzeichen sagt die Seite, die Zahl den Abstand.',
  acht: c => {
    const lo = c.s.minAt, hi = c.s.maxAt, gap = c.s.xs[hi] - c.s.xs[lo];
    return gap < 1e-9 ? 'Hier lernen alle gleich lange. Zentriert stehen alle bei 0.'
      : `Alle bekommen denselben Abzug. Deshalb bleiben die Abstände untereinander gleich: Zwischen ${c.names[lo]} und ${c.names[hi]} liegen vorher und nachher ${hours(gap)}.`;
  },
  check: {
    question: c => `Wo steht Person ${P(c)} nach dem Zentrieren? Mit Vorzeichen.`,
    answer: c => c.s.dev[c.who],
    diagnose: (c, v) => {
      if (v === 'NA') return null;
      const d = c.s.dev[c.who], x = c.s.xs[c.who];
      if (Math.abs(d) > 1e-9 && close(v, -d)) return 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne Lernzeit minus Mitte.';
      if (!close(x, d) && close(v, x)) return 'Fast! Das ist noch die Lernzeit selbst. Zieh die Mitte davon ab.';
      return null;
    },
  },
};

/** Spalten xᵢ und xᵢ − x̄ der Rechentabelle (beide Werkstätten). */
export const COL_X = { head: 'xᵢ', from: 1, active: [1], cell: (c: C, i: number) => num(c.s.xs[i]), sum: (c: C) => num(c.s.sum), sumFrom: 1 };
export const COL_DEV = {
  head: 'xᵢ − x̄', from: 2, active: [2], cell: (c: C, i: number) => signed(c.s.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer',
  tone: (c: C, i: number) => c.s.dev[i] > 1e-9 ? 'pos' as const : c.s.dev[i] < -1e-9 ? 'neg' as const : undefined,
};

// ---------- Brücke: die ersten beiden Schritte mit 200 Befragten (auch für Standardisieren) ----------

/** Mittelwert der 200 als Formel: „x̄ = ( 6 + … + 8,3 + … + 5,9 ) / 200 ≈ 7,75 h“. */
export const meanNodes = (c: BC): FNode[] => [
  'x̄ = ( ', ...sumNodes(N(c), c.who, i => [{ part: [num(c.values[i])], m: 1 }], [' ', { part: ['+'], m: 1 }, ' ']), ' ) ',
  { part: [`/ ${N(c)}`], m: 1 }, ` ${eq(c.s.mean)} `, { part: [c.u(c.s.mean)], m: 1 },
];
export const LINE_MITTE = {
  all: (c: BC) => `Alle ${N(c)} ${valuesOf(c)} zusammen ergeben ${c.u(c.s.sum)}. Geteilt durch ${N(c)}: x̄ ${eq(c.s.mean)} ${c.u(c.s.mean)}.`,
  person: (c: BC) => `${P(c)} hat ${c.u(c.values[c.who])}. Der Wert zählt in der Summe einmal mit, wie jeder andere auch.`,
};
export const LINE_ZENTRIEREN = {
  all: (c: BC) => `Von jedem der ${N(c)} Werte ziehen wir ${c.u(c.s.mean)} ab. Danach liegt die Mitte bei 0: ${c.s.below} Werte sind negativ, ${c.s.above} positiv.`,
  person: (c: BC) => `${P(c)}: ${num(c.values[c.who])} − ${num(c.s.mean)} ${eq(c.s.dev[c.who])} ${signed(c.s.dev[c.who])}, also ${toMiddle(c, c.s.dev[c.who])}.`,
};

export const bridgeZentrieren: Bridge<ZStats> = {
  data: 'series',
  numeric: c => [
    ...meanNodes(c), { br: true },
    `${P(c)}: `, { part: [`${num(c.values[c.who])} −`], m: 2 }, ' ', { part: [num(c.s.mean)], m: 1 }, ` ${eq(c.s.dev[c.who])} `, { part: [signed(c.s.dev[c.who])], m: 2 },
  ],
  lines: [LINE_MITTE, LINE_ZENTRIEREN],
  metrics: c => [
    { label: 'Befragte n', value: String(N(c)) },
    { label: 'Mitte x̄', value: c.u(c.s.mean) },
    { label: `${P(c)} zentriert`, value: signed(c.s.dev[c.who]) },
  ],
  interpret: c => {
    const d = c.s.dev[c.who], zero = N(c) - c.s.below - c.s.above;
    return {
      kurz: Math.abs(d) < 0.005
        ? `Nach dem Zentrieren liegt die Mitte bei 0. ${P(c)} steht genau dort: ${lernzeit(c) ? 'Die Lernzeit entspricht dem Durchschnitt.' : 'Der Wert entspricht dem Durchschnitt.'}`
        : `Nach dem Zentrieren liegt die Mitte bei 0. ${P(c)} steht bei ${signed(d)} und ${lernzeit(c) ? `lernt damit ${amount(c, Math.abs(d))} ${d > 0 ? 'mehr' : 'weniger'} als der Durchschnitt.` : `liegt damit ${c.u(Math.abs(d))} ${d > 0 ? 'über' : 'unter'} dem Durchschnitt.`}`,
      fachlich: `Die zentrierte Spalte „${c.col.title}“ hat den Mittelwert 0 und dieselbe Standardabweichung wie vorher, s ≈ ${c.u(c.s.sd)}.`,
      zusatz: `${c.s.below} von ${N(c)} Befragten haben einen negativen zentrierten Wert, ${c.s.above} einen positiven${zero ? `, ${zero} genau 0` : ''}.`,
    };
  },
  voraussetzung: c => `${scaleNote(c)} Zentrieren verschiebt nur: Form und Streuung bleiben gleich.`,
  picture: (c, step) => ({
    center: c.s.mean, deviation: step >= 2,
    contributions: step >= 2 ? { label: 'Zentrierte Werte aller Befragten, der Größe nach', values: c.s.dev } : undefined,
  }),
  value: c => c.s.dev[c.who],
};

// ---------- Werkstatt ----------

export const zentrieren: Workshop<number[], ZStats> = {
  id: 'zentrieren',
  bridge: bridgeZentrieren,
  wofuer: 'Fünf Personen sagen, wie viele Stunden sie in den letzten sieben Tagen gelernt haben. Person A lernt 5 Stunden. Ist das viel oder wenig? Das zeigt erst der Vergleich mit der Mitte der Gruppe. Zentrieren schreibt jede Lernzeit so um, dass sie genau diesen Vergleich zeigt.',
  mut: 'Hier brauchst du nur zwei Handgriffe, die du kennst: die Mitte ausrechnen und sie von jeder Zahl abziehen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'b04-zentrieren',
  names: NAMES,
  bounds: LINEAL_BOUNDS,
  presets: LINEAL_PRESETS,
  compute: zstats,
  glyphs: [
    { sym: 'x̄', say: 'x quer', term: 'Arithmetisches Mittel', plain: 'die Mitte der Gruppe', step: 1 },
    { sym: 'xᵢ', say: 'x i', term: 'Beobachtung', plain: 'die Lernzeit von Person i', step: 1 },
    { sym: 'n', say: 'n', term: 'Fallzahl', plain: 'wie viele Personen, hier 5', step: 1 },
    { sym: 'xᵢ − x̄', say: 'x i minus x quer', term: 'zentrierter Wert', plain: 'wie weit Person i über oder unter der Mitte liegt', step: 2 },
  ],
  steps: [STEP_MITTE, STEP_ZENTRIEREN],
  numeric: c => [
    'x̄ = (', ...c.s.xs.flatMap((x, i): FNode[] => i ? [' + ', { part: [num(x)], m: 1 }] : [{ part: [num(x)], m: 1 }]), ') / 5 ', eq(c.s.mean), ' ', { part: [num(c.s.mean)], m: 1 },
    { br: true },
    `Person ${P(c)}: `, { part: [`${num(c.s.xs[c.who])} −`], m: 2 }, ' ', { part: [num(c.s.mean)], m: 1 }, ' = ', { part: [signed(c.s.dev[c.who])], m: 2 },
  ],
  table: {
    columns: [COL_X, COL_DEV],
    lines: [{ from: 1, step: 1, text: c => `x̄ = ${num(c.s.sum)} / 5 ${eq(c.s.mean)} ${num(c.s.mean)}` }],
  },
  captions: {
    1: 'Die fünf Lernzeiten auf einem Lineal in Stunden. Du kannst die Punkte ziehen.',
    2: 'Das zweite Lineal misst von der Mitte aus. Die Punkte bleiben, wo sie sind; nur die Beschriftung verschiebt sich.',
  },
  think: [
    {
      question: 'Alle lernen gleich viel mehr, zum Beispiel zwei Stunden. Was passiert mit den zentrierten Werten?', options: ['werden größer', 'bleiben gleich', 'werden kleiner'], correct: 1, step: 2,
      explain: 'Die Mitte wandert mit. Im Abstand hebt sich die Verschiebung auf: (xᵢ + 2) − (x̄ + 2) = xᵢ − x̄.',
      kurz: 'Verschieben ändert die zentrierten Werte nicht.',
      tryIt: { label: 'alle verschieben', apply: d => d.map(x => x + shiftWithin(d, LINEAL_BOUNDS.min, LINEAL_BOUNDS.max)) },
    },
    {
      question: 'Alle lernen nur halb so lange. Was passiert mit den zentrierten Werten?', options: ['bleiben gleich', 'halbieren sich', 'verdoppeln sich'], correct: 1, step: 2,
      explain: 'Die Mitte halbiert sich mit, also auch jeder Abstand: xᵢ / 2 − x̄ / 2 = (xᵢ − x̄) / 2. Zentrierte Werte behalten die Einheit der Daten, hier Stunden.',
      kurz: 'Zentrieren verschiebt, es ändert die Einheit nicht.',
      tryIt: { label: 'alle halb so lange', apply: d => d.map(x => x / 2) },
    },
    {
      question: 'Wie groß ist die Standardabweichung nach dem Zentrieren?', options: ['dieselbe wie vorher', '0', '1'], correct: 0, step: 2,
      explain: c => `Zentrieren verschiebt nur. Die Abstände zur Mitte sind vorher und nachher dieselben, also bleibt auch s ${eq(c.s.sd)} ${num(c.s.sd)}. Die 1 bekommst du erst, wenn du zusätzlich durch s teilst.`,
      kurz: 'Zentrieren ändert die Lage, nicht die Streuung.',
    },
    {
      question: 'Warum ist die Mitte der zentrierten Werte immer 0?', options: ['weil sich Plus und Minus genau ausgleichen', 'weil man durch 5 teilt'], correct: 0, step: 2,
      explain: c => `Hier: ${c.s.dev.map(d => signed(d)).join(' ')} = 0. Die Abstände von der eigenen Mitte ergeben zusammen immer 0, das zeigt die Summenzeile der Tabelle.`,
      kurz: 'Die Mitte ist der Ausgleichspunkt aller Abstände.',
    },
  ],
  variants: {
    centering: {
      lastStep: 2,
      kurz: 'Zentrieren heißt: von jedem Wert die Mitte abziehen. Danach liegt die Mitte bei 0, und jede Zahl zeigt, wie weit jemand über oder unter dem Durchschnitt liegt.',
      fachlich: 'Zentrierung am Mittelwert: xᶜᵢ = xᵢ − x̄. Die zentrierte Reihe hat den Mittelwert 0; die Abstände zwischen den Fällen und die Standardabweichung bleiben unverändert.',
      symbolic: [{ part: ['xᶜ', { sub: 'i' }], m: 2 }, ' = ', { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }],
      aria: 'x i zentriert gleich x i minus x quer',
      metrics: [
        { label: 'Mitte x̄', value: c => num(c.s.mean) },
        { label: 'Mitte nach dem Zentrieren', value: () => '0' },
        { label: 'gewählte Person zentriert', value: c => signed(c.s.dev[c.who]) },
      ],
      interpret: c => {
        const d = c.s.dev[c.who];
        return {
          kurz: `Nach dem Zentrieren liegt die Mitte bei 0. Person ${P(c)} steht bei ${signed(d)}: ${side(c)}`,
          fachlich: `Die zentrierten Werte sind ${c.s.dev.map(x => signed(x)).join('; ')}. Ihr Mittelwert ist 0, ihre Standardabweichung bleibt s ${eq(c.s.sd)} ${num(c.s.sd)} wie vor dem Zentrieren.`,
        };
      },
      next: { id: 'z', label: 'Weiter zur z-Standardisierung' },
      genau: {
        kurz: 'Zentrieren verschiebt nur. Form, Abstände und Streuung der Werte bleiben gleich.',
        paragraphs: () => [
          'Zentrieren ist eine Verschiebung um −x̄. Die Standardabweichung, die Schiefe und jede Korrelation mit anderen Spalten bleiben gleich, denn sie hängen nur von den Abständen zur Mitte ab.',
          'In Regressionen mit Wechselwirkungen zentriert man oft die erklärenden Variablen. Der Achsenabschnitt gilt dann für eine Person mit durchschnittlichem Wert statt für den Wert 0, den es vielleicht gar nicht gibt.',
          'Man kann auch an einem anderen Wert zentrieren, etwa am Median, dem mittleren Wert der Reihe nach, oder am Mittelpunkt einer Antwortskala. Dann liegt die Mitte der neuen Werte nicht bei 0.',
          'In R legt center(lernzeit, suffix = "_zentriert") eine neue Spalte lernzeit_zentriert an. Ohne suffix ersetzt center() die Spalte im Ergebnis.',
        ],
      },
    },
  },
};

// ---------- Reiter ----------

export const tabsCentering: ConceptTabs = {
  sample: {
    kind: 'bridge', workshop: 'zentrieren', variant: 'centering', variable: 'lernzeit',
    think: [
      {
        question: 'Alle lernen eine Stunde mehr. Was passiert mit dem zentrierten Wert der gewählten Person?', options: ['steigt um 1', 'bleibt gleich', 'sinkt um 1'], correct: 1, step: 2,
        explain: 'Die Mitte wandert um eine Stunde mit. Im Abstand hebt sich die Stunde auf: (xᵢ + 1) − (x̄ + 1) = xᵢ − x̄.',
        kurz: 'Verschieben ändert keinen zentrierten Wert.',
        tryIt: { label: 'alle eine Stunde mehr', op: 'shift', column: 'x', value: 1 },
        expect: { change: 'same' },
      },
      {
        question: 'Alle lernen doppelt so lange. Was passiert mit dem zentrierten Wert der gewählten Person?', options: ['bleibt gleich', 'verdoppelt sich', 'vervierfacht sich'], correct: 1, step: 2,
        explain: 'Lernzeit und Mitte verdoppeln sich beide, also auch ihr Abstand: 2 · xᵢ − 2 · x̄ = 2 · (xᵢ − x̄).',
        kurz: 'Zentrierte Werte behalten die Einheit der Daten.',
        tryIt: { label: 'alle doppelt so lange', op: 'double', column: 'x', value: 2 },
        expect: { change: 'factor', factor: 2 },
      },
    ],
  },
  r: {
    entry: 'centering', variant: 0,
    tokens: {
      center: { sym: 'center()', term: 'Zentrierung am Mittelwert', kurz: 'Zieht von jedem Wert den Mittelwert der Spalte ab. Mit suffix entsteht eine neue Spalte, die alte bleibt.', fehler: 'Ein Tippfehler im Spaltennamen bricht ab. center(lernzeitt) meldet: Can\'t select columns that don\'t exist.' },
    },
    outputMap: [
      { match: '0.000', atlas: 'Mitte nach dem Zentrieren', step: 2, explain: 'Die zentrierte Spalte hat den Mittelwert 0: Plus und Minus gleichen sich aus.' },
      { match: 'Mean', atlas: 'x̄', step: 1, explain: 'Der Mittelwert der Lernzeit. Genau diese Zahl zieht center() von jedem Wert ab.' },
      { match: 'SD', atlas: 's', explain: 'Die Standardabweichung steht in beiden Zeilen gleich da. Zentrieren verschiebt nur, die Streuung bleibt.' },
      { match: 'N', atlas: 'n', explain: 'N zählt die gültigen Werte, hier alle 200 Befragten.' },
    ],
    check: {
      question: 'Welche Zahl zeigt die Mitte nach dem Zentrieren? Tippe sie an.', correct: '0.000',
      wrong: {
        Mean: 'Fast! Das ist die Mitte vor dem Zentrieren. Die zentrierte Spalte steht eine Zeile tiefer.',
        SD: 'Fast! Das ist die Standardabweichung. Sie bleibt beim Zentrieren gleich; gefragt ist die Mitte.',
        N: 'Fast! N zählt die Befragten. Die Mitte steht unter Mean in der Zeile lernzeit_zentriert.',
      },
    },
  },
  next: {
    next: { id: 'z', why: 'Teilst du die zentrierten Werte noch durch s, misst jede Zahl den Abstand in Standardabweichungen.' },
    before: [
      { id: 'mean', why: 'Die Mitte, die von jedem Wert abgezogen wird.' },
      { id: 'deviation', why: 'Ein zentrierter Wert ist die Abweichung einer Person vom Mittelwert.' },
    ],
    after: [
      { id: 'covariance', why: 'Multipliziert die zentrierten Werte zweier Spalten miteinander.' },
      { id: 'interaction', why: 'Mit zentrierten Variablen bleibt der Achsenabschnitt eines Modells mit Wechselwirkung lesbar.' },
    ],
    more: [
      { id: 'sd', why: 'Bleibt beim Zentrieren gleich, denn die Abstände ändern sich nicht.' },
      { id: 'scaling', why: 'Teilt alle Werte durch dieselbe Zahl, statt etwas abzuziehen.' },
    ],
  },
};
