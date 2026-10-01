// Werkstatt „Zusammenhang“ für Kovarianz und Pearson-r. Ton nach dem gebilligten Beispiel der Streuung (src/explain/content/streuung.ts).
import type { Ctx, FNode, Workshop } from '../types';
import { pairStats, type PairStats, type Pairs } from '../math';
import { num, signed, paren, close } from '../format';

type C = Ctx<PairStats>;
const NAMES = ['A', 'B', 'C', 'D', 'E'] as const;
const P = (c: C) => c.names[c.who];
const side = (d: number) => d > 1e-9 ? 'über' : d < -1e-9 ? 'unter' : 'genau auf';
const X = [2, 3, 4, 5, 6];

const products = (c: C): FNode[] => c.s.xs.flatMap((x, i): FNode[] => [
  ...(i ? [' ', { part: ['+'], m: 4 }, ' '] as FNode[] : []),
  { part: ['('], m: 3 }, { part: [`${x} −`], m: 2 }, ' ', { part: [num(c.s.x.mean)], m: 1 }, { part: [')'], m: 3 },
  { part: [' · ('], m: 3 }, { part: [`${c.s.ys[i]} −`], m: 2 }, ' ', { part: [num(c.s.y.mean)], m: 1 }, { part: [')'], m: 3 },
]);

/** Betrag von r, gerundet wie angezeigt: 0,4999… gilt als 0,5. */
const shown = (r: number) => Math.round(Math.abs(r) * 100) / 100;
const strength = (r: number) => {
  const a = shown(r);
  return a >= 1 ? 'perfekt' : a >= 0.5 ? 'stark' : a >= 0.3 ? 'mittel' : 'schwach';
};

export const zusammenhang: Workshop<Pairs, PairStats> = {
  id: 'zusammenhang',
  wofuer: 'Vertraut, wer dem Bundestag vertraut, auch eher der Bundesregierung? Fünf Personen beantworten beide Fragen, jeweils von 1 (gar kein Vertrauen) bis 7 (großes Vertrauen). Die Formel prüft, ob die beiden Antworten einer Person meist auf derselben Seite des Durchschnitts liegen.',
  mut: 'Die Formel sieht nach viel aus. Sie besteht aber aus sechs kleinen Schritten, die du schon kennst: Mitte finden, Abstände messen, malnehmen, zusammenzählen und teilen. Das Rechnen übernimmt später R. Hier geht es ums Verstehen.',
  picture: 'zusammenhang',
  names: NAMES,
  bounds: { min: 1, max: 7 },
  presets: [
    { id: 'gleich', label: 'Gleichläufig', data: { x: X, y: [2, 5, 3, 6, 4] } },
    { id: 'gegen', label: 'Gegenläufig', data: { x: X, y: [6, 3, 5, 2, 4] } },
    { id: 'krumm', label: 'Gekrümmt', data: { x: X, y: [5, 3, 2, 3, 5] } },
  ],
  compute: pairStats,
  glyphs: [
    { sym: 'x̄, ȳ', say: 'x quer, y quer', term: 'Mittelwerte', plain: 'die Mitte jeder Frage', step: 1 },
    { sym: 'xᵢ, yᵢ', say: 'x i, y i', term: 'Zusammengehöriges Wertepaar', plain: 'die beiden Antworten von Person i', step: 2 },
    { sym: '( ) · ( )', say: 'mal', term: 'Abweichungsprodukt', plain: 'die beiden Abweichungen malnehmen', step: 3 },
    { sym: 'Σ', say: 'Sigma', term: 'Summenzeichen', plain: 'alles addieren, jede Person einmal', step: 4 },
    { sym: 'n − 1', say: 'n minus eins', term: 'Freiheitsgrade', plain: 'eins weniger als Personen', step: 5 },
    { sym: 'sₓᵧ', say: 's x y', term: 'Stichprobenkovarianz', plain: 'die durchschnittliche Fläche mit Vorzeichen', step: 5 },
    { sym: 'sₓ, sᵧ', say: 's x, s y', term: 'Standardabweichungen', plain: 'typische Abstände jeder Frage', step: 6 },
    { sym: 'r', say: 'r', term: 'Pearson-Korrelation', plain: 'Zusammenhang zwischen −1 und +1', step: 6 },
  ],
  steps: [
    {
      button: 'x̄ und ȳ', title: 'Zwei Mitten finden', sym: 'x̄, ȳ', say: 'x quer, y quer', concept: 'mean', perPerson: false,
      was: 'Wir suchen für beide Fragen die Mitte. Zusammen bilden die beiden Mitten ein Achsenkreuz.',
      rechnung: c => `x̄ = (${c.s.xs.join(' + ')}) / 5 = ${num(c.s.x.mean)} und ȳ = (${c.s.ys.join(' + ')}) / 5 = ${num(c.s.y.mean)}`,
      fach: 'Die arithmetischen Mittel x̄ und ȳ sind die Bezugspunkte für die Abweichungen beider Variablen.',
      warum: 'Ob zwei Antworten zusammenhängen, siehst du erst im Vergleich zur Mitte: Liegt jemand bei beiden Fragen darüber oder darunter?',
      acht: 'Du brauchst zwei Mitten, eine für jede Frage. Mit nur einer Mitte fehlt die Hälfte des Achsenkreuzes.',
      alltag: 'Wie ein Fadenkreuz: Es teilt das Bild in vier Felder, rechts oben, links oben, links unten und rechts unten.',
      check: {
        question: 'Wo liegt die Mitte der zweiten Frage, also ȳ?',
        answer: c => c.s.y.mean,
        diagnose: (c, v) => v === 'NA' ? null
          : close(v, c.s.y.sum) ? 'Fast! Das ist die Summe. Jetzt noch durch 5 teilen.'
          : !close(c.s.x.mean, c.s.y.mean) && close(v, c.s.x.mean) ? 'Fast! Das ist die Mitte der ersten Frage, x̄. Gefragt ist ȳ, die Mitte beim Vertrauen in die Bundesregierung.'
          : null,
      },
    },
    {
      button: 'Abweichungen', title: 'Abstände messen', sym: 'xᵢ − x̄, yᵢ − ȳ', say: 'x i minus x quer, y i minus y quer', concept: 'deviation', perPerson: true,
      was: 'Für jede Person messen wir bei beiden Fragen: Wie weit liegt sie von der Mitte weg, und auf welcher Seite?',
      rechnung: c => {
        const dx = c.s.x.dev[c.who], dy = c.s.y.dev[c.who];
        return `Person ${P(c)}: ${c.s.xs[c.who]} − ${num(c.s.x.mean)} = ${signed(dx)} und ${c.s.ys[c.who]} − ${num(c.s.y.mean)} = ${signed(dy)}. Beim Bundestag liegt ${P(c)} ${side(dx)} dem Durchschnitt, bei der Bundesregierung ${side(dy)} dem Durchschnitt.`;
      },
      fach: 'Je Person gibt es zwei Abweichungen vom Mittelwert, xᵢ − x̄ und yᵢ − ȳ, jeweils mit Vorzeichen. Beide gehören zu derselben Person.',
      warum: 'Die beiden Vorzeichen zeigen, in welchem der vier Felder eine Person liegt.',
      acht: 'Beide Abstände gehören zu derselben Person. Wer die Spalten getrennt sortiert, mischt die Personen durcheinander.',
      alltag: 'Wie eine Adresse im Fadenkreuz: so weit nach links oder rechts, so weit nach unten oder oben.',
      check: {
        question: c => `Wie weit liegt Person ${P(c)} beim Vertrauen in die Bundesregierung von der Mitte weg? Mit Vorzeichen.`,
        answer: c => c.s.y.dev[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const dx = c.s.x.dev[c.who], dy = c.s.y.dev[c.who];
          if (Math.abs(dy) > 1e-9 && close(v, -dy)) return 'Fast! Der Abstand stimmt, nur die Seite nicht. Rechne Antwort minus Mitte.';
          if (!close(dx, dy) && close(v, dx)) return 'Fast! Das ist der Abstand beim Bundestag. Gefragt ist die Bundesregierung, also y.';
          return null;
        },
      },
    },
    {
      button: '( ) · ( )', title: 'Die Abstände malnehmen', sym: '(xᵢ − x̄)(yᵢ − ȳ)', say: 'x i minus x quer, mal y i minus y quer', concept: 'crossproduct', perPerson: true,
      was: 'Wir nehmen die beiden Abstände einer Person miteinander mal. Heraus kommt eine Rechteckfläche mit Vorzeichen.',
      rechnung: c => {
        const dx = c.s.x.dev[c.who], dy = c.s.y.dev[c.who], p = c.s.prod[c.who];
        const how = p > 1e-9 ? `Plus: ${P(c)} liegt bei beiden Fragen auf derselben Seite.`
          : p < -1e-9 ? `Minus: ${P(c)} liegt auf verschiedenen Seiten.`
          : `Null: ${P(c)} liegt bei einer Frage genau in der Mitte.`;
        return `Person ${P(c)}: ${paren(dx)} · ${paren(dy)} = ${num(p)}. ${how}`;
      },
      fach: 'Das Abweichungsprodukt ist positiv, wenn eine Person in beiden Variablen auf derselben Seite des Mittelwerts liegt, und negativ, wenn sie auf verschiedenen Seiten liegt.',
      warum: 'Das Vorzeichen sagt, ob diese Person zum gleichläufigen oder zum gegenläufigen Muster passt. Die Größe der Fläche sagt, wie deutlich.',
      acht: 'Denk an die Vorzeichenregel: Minus mal Minus ergibt Plus, Plus mal Minus ergibt Minus.',
      alltag: 'Wie zwei Wetterfahnen: Zeigen beide in dieselbe Richtung, zählt das als Übereinstimmung, sonst als Widerspruch.',
      check: {
        question: c => `Was kommt heraus, wenn du die beiden Abstände von Person ${P(c)} malnimmst?`,
        answer: c => c.s.prod[c.who],
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const p = c.s.prod[c.who], dx = c.s.x.dev[c.who], dy = c.s.y.dev[c.who];
          if (Math.abs(p) > 1e-9 && close(v, -p)) return 'Fast! Achte auf das Vorzeichen: Minus mal Minus ergibt Plus, Plus mal Minus ergibt Minus.';
          if (!close(dx + dy, p) && close(v, dx + dy)) return 'Fast! Das ist die Summe der beiden Abstände. Gefragt ist ihr Produkt.';
          return null;
        },
      },
    },
    {
      button: 'Σ', title: 'Alles zusammenzählen', sym: 'Σ', say: 'Sigma', concept: 'crossproduct_sum', perPerson: false,
      was: 'Wir zählen die fünf Flächen zusammen, mit ihren Vorzeichen. Plusflächen und Minusflächen verrechnen sich dabei.',
      rechnung: c => `${c.s.prod.map(p => paren(p)).join(' + ')} = ${num(c.s.cp)}. ${c.s.cp > 1e-9 ? 'Die Plusflächen überwiegen.' : c.s.cp < -1e-9 ? 'Die Minusflächen überwiegen.' : 'Plus und Minus heben sich auf.'}`,
      fach: 'Die Summe der Abweichungsprodukte fasst die gemeinsame Abweichung aller Personen zusammen.',
      warum: 'Erst über alle Personen hinweg zeigt sich, welches Muster überwiegt.',
      acht: 'Negative Flächen zählen mit ihrem Minus. Wer sie weglässt oder positiv zählt, macht den Zusammenhang stärker, als er ist.',
      alltag: 'Wie eine Abstimmung: Gleichläufige Personen stimmen für Plus, gegenläufige für Minus, und deutlichere Stimmen zählen mehr.',
      check: {
        question: 'Wie groß ist die Summe der fünf Produkte?',
        answer: c => c.s.cp,
        diagnose: (c, v) => {
          if (v === 'NA') return null;
          const abs = c.s.pos - c.s.neg;
          if (c.s.neg < -1e-9 && close(v, abs)) return 'Fast! Du hast die negativen Produkte positiv gezählt. Sie gehören mit Minus in die Summe.';
          if (Math.abs(c.s.cp) > 1e-9 && close(v, 0)) return 'Fast! 0 ist die Summe der Abstände einer Frage. Gefragt ist die Summe der Produkte.';
          return null;
        },
      },
    },
    {
      button: '÷ (n − 1)', title: 'Gerecht teilen', sym: 'sₓᵧ', say: 's x y', concept: 'covariance', perPerson: false,
      was: 'Wir teilen die Summe durch die Zahl der Personen minus eins, hier also durch 4.',
      rechnung: c => `${num(c.s.cp)} / (5 − 1) = ${num(c.s.cp)} / 4 = ${num(c.s.cov)}`,
      fach: 'Die Summe der Abweichungsprodukte geteilt durch n − 1 ergibt die Stichprobenkovarianz sₓᵧ.',
      warum: 'Durch das Teilen werden große und kleine Gruppen vergleichbar. Das minus eins hat denselben Grund wie bei der Varianz.',
      acht: 'Die Größe der Kovarianz ist noch keine Stärke. Auf einer Skala von 10 bis 70 wäre sie hundertmal so groß, ohne dass sich am Zusammenhang etwas ändert.',
      check: {
        question: 'Was kommt heraus, wenn du die Summe durch 4 teilst?',
        answer: c => c.s.cov,
        diagnose: (c, v) => v === 'NA' || Math.abs(c.s.cp) < 1e-9 ? null
          : close(v, c.s.cp / 5) ? 'Fast! Du hast durch 5 geteilt. Hier teilst du durch 4, also n − 1.'
          : close(v, c.s.cp) ? 'Fast! Das ist noch die Summe. Jetzt noch durch 4 teilen.'
          : null,
      },
    },
    {
      button: '÷ (sₓ · sᵧ)', title: 'Mit dem Größtmöglichen vergleichen', sym: 'r', say: 'r', concept: 'pearson', perPerson: false,
      links: [{ id: 'sd_product', label: 'Produkt der Standardabweichungen' }, { id: 'sd', label: 'Standardabweichung' }],
      was: 'Wir teilen durch das Produkt der beiden Standardabweichungen. So entsteht eine Zahl zwischen −1 und +1.',
      rechnung: c => c.s.r === null
        ? `sₓ ≈ ${num(c.s.x.sd)} und sᵧ ≈ ${num(c.s.y.sd)}. Eine Standardabweichung ist 0. Durch 0 kann man nicht teilen, r ist hier nicht definiert.`
        : `${num(c.s.cov)} / (${num(c.s.x.sd)} · ${num(c.s.y.sd)}) = ${num(c.s.cov)} / ${num(c.s.sxy)} ≈ ${num(c.s.r)}`,
      fach: 'Pearson-r ist die Kovarianz geteilt durch das Produkt der beiden Standardabweichungen. Das Ergebnis hat keine Einheit und liegt zwischen −1 und +1.',
      warum: 'Die Kovarianz kann höchstens so groß werden wie sₓ · sᵧ. Teilen wir dadurch, verschwinden die Einheiten, und ganz verschiedene Fragen werden vergleichbar.',
      acht: 'r ist kein Anteil von Personen. r = 0,5 heißt nicht, dass die Hälfte übereinstimmt. Es sagt, wie eng die Punkte an einer Geraden liegen.',
      alltag: 'Wie eine Prozentangabe: nicht wie viele Punkte, sondern welcher Anteil vom Höchstmöglichen.',
      check: {
        question: c => c.s.r === null ? 'Wie groß ist r? Eine Standardabweichung ist hier 0. Tippe NA, wenn r nicht definiert ist.' : 'Wie groß ist r? Zwei Nachkommastellen reichen.',
        answer: c => c.s.r === null ? 'NA' : c.s.r,
        diagnose: (c, v) => {
          if (v === 'NA' || c.s.r === null || Math.abs(c.s.cov) < 1e-9) return null;
          if (close(v, c.s.cov / (c.s.x.sd + c.s.y.sd))) return 'Fast! Im Nenner steht das Produkt sₓ · sᵧ, nicht die Summe.';
          if (close(v, c.s.cov / (c.s.x.variance * c.s.y.variance))) return 'Fast! Im Nenner stehen die Standardabweichungen, nicht die Varianzen.';
          if (!close(c.s.cov, c.s.r) && close(v, c.s.cov)) return 'Fast! Das ist noch die Kovarianz. Jetzt noch durch sₓ · sᵧ teilen.';
          return null;
        },
      },
    },
  ],
  numeric: (c, last) => {
    const cov: FNode[] = ['sₓᵧ = [ ', ...products(c), ' ] ', { part: ['/ (5 − 1)'], m: 5 }, { br: true },
      '= ', { part: [num(c.s.cp)], m: 4 }, ' ', { part: ['/ 4'], m: 5 }, ' = ', { part: [num(c.s.cov)], m: 5 }];
    if (last < 6) return cov;
    return [...cov, { br: true }, 'r = ', { part: [num(c.s.cov)], m: 5 }, ' ', { part: [`/ (${num(c.s.x.sd)} · ${num(c.s.y.sd)})`], m: 6 }, c.s.r === null ? ': ' : ' ≈ ',
      { part: [c.s.r === null ? 'nicht definiert' : num(c.s.r)], m: 6 }];
  },
  table: {
    columns: [
      { head: 'xᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.xs[i]), sum: c => num(c.s.x.sum), sumFrom: 1 },
      { head: 'yᵢ', from: 1, active: [1], cell: (c, i) => String(c.s.ys[i]), sum: c => num(c.s.y.sum), sumFrom: 1 },
      { head: 'xᵢ − x̄', from: 2, active: [2], cell: (c, i) => signed(c.s.x.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer' },
      { head: 'yᵢ − ȳ', from: 2, active: [2], cell: (c, i) => signed(c.s.y.dev[i]), sum: () => '0', sumFrom: 2, sumNote: 'immer' },
      { head: 'Produkt', from: 3, active: [3, 4], cell: (c, i) => num(c.s.prod[i]), sum: c => num(c.s.cp), sumFrom: 4, tone: (c, i) => c.s.prod[i] > 1e-9 ? 'pos' : c.s.prod[i] < -1e-9 ? 'neg' : undefined },
    ],
    lines: [
      { from: 1, step: 1, text: c => `x̄ = ${num(c.s.x.sum)} / 5 = ${num(c.s.x.mean)}, ȳ = ${num(c.s.y.sum)} / 5 = ${num(c.s.y.mean)}` },
      { from: 5, step: 5, text: c => `sₓᵧ = ${num(c.s.cp)} / 4 = ${num(c.s.cov)}` },
      { from: 6, step: 6, text: c => `sₓ ≈ ${num(c.s.x.sd)}, sᵧ ≈ ${num(c.s.y.sd)}, r = ${num(c.s.cov)} / ${num(c.s.sxy)}${c.s.r === null ? ': nicht definiert' : ` ≈ ${num(c.s.r)}`}` },
    ],
  },
  captions: {
    1: 'Das Achsenkreuz aus x̄ und ȳ teilt das Bild in vier Felder. Du kannst die Punkte ziehen.',
    2: 'Jede Person hat zwei Abstände: waagerecht zu x̄, senkrecht zu ȳ.',
    3: 'Rechts oben und links unten: gleichläufig, die Fläche zählt plus. Die anderen Felder zählen minus.',
    4: 'Der Balken legt alle Plusflächen und alle Minusflächen gegeneinander.',
    5: 'Geteilt durch n − 1 ergibt sich die durchschnittliche Fläche mit Vorzeichen: die Kovarianz.',
    6: 'Die durchschnittliche Fläche im Vergleich zur größtmöglichen, sₓ · sᵧ: Das Verhältnis ist r.',
  },
  think: [
    {
      question: 'Du misst beide Fragen auf einer Skala von 10 bis 70 statt 1 bis 7 (alles mal 10). Was passiert?',
      options: ['beide werden zehnmal so groß', 'Kovarianz hundertmal so groß, r gleich', 'beide bleiben gleich'], correct: 1, step: 6, stepFor: { covariance: 5 },
      explain: 'Jede Abweichung wird zehnmal so groß, jedes Produkt hundertmal (10 · 10). sₓ und sᵧ werden je zehnmal so groß, ihr Produkt hundertmal; in r kürzt sich das weg.',
      kurz: 'r hängt nicht von der Einheit ab, die Kovarianz schon.',
    },
    {
      question: 'Die Punkte liegen auf einem symmetrischen U. Wie groß ist r?', questionFor: { covariance: 'Die Punkte liegen auf einem symmetrischen U. Wie groß ist die Kovarianz?' },
      options: ['nahe 1', '0', 'negativ'], correct: 1, step: 4,
      explain: 'Rechts und links liegen die Punkte oben, in der Mitte unten: Beim symmetrischen U heben sich die Plus- und Minusrechtecke genau auf, die Summe ist 0. Kovarianz und r messen nur den geraden (linearen) Anteil eines Zusammenhangs.',
      kurz: 'r = 0 heißt nicht, dass es keinen Zusammenhang gibt.',
      tryIt: { label: 'gekrümmt', apply: () => ({ x: X, y: [5, 3, 2, 3, 5] }) },
    },
    {
      question: 'Eine Person liegt beim Vertrauen in den Bundestag genau im Durchschnitt. Was trägt sie zur Kovarianz bei?',
      options: ['etwas Positives', 'nichts', 'etwas Negatives'], correct: 1, step: 3,
      explain: 'Ihre Abweichung in x ist 0, das Rechteck hat keine Breite, das Produkt ist 0, egal wie weit sie in y abweicht.',
      kurz: 'Wer in einer Frage im Durchschnitt liegt, trägt nichts bei.',
    },
    {
      question: 'Wer dem Bundestag mehr vertraut, vertraut der Regierung weniger. Welches Vorzeichen hat r?', questionFor: { covariance: 'Wer dem Bundestag mehr vertraut, vertraut der Regierung weniger. Welches Vorzeichen hat die Kovarianz?' },
      options: ['positiv', 'negativ'], correct: 1, step: 3,
      explain: 'Die Punkte liegen dann vor allem links oben und rechts unten; dort sind die Rechtecke negativ.',
      kurz: 'Gegenläufig heißt Minus.',
      tryIt: { label: 'gegenläufig', apply: () => ({ x: X, y: [6, 3, 5, 2, 4] }) },
    },
  ],
  variants: {
    pearson: {
      lastStep: 6,
      kurz: 'r sagt dir, wie eng die Punkte an einer Geraden liegen, von −1 (perfekt gegenläufig) über 0 bis +1 (perfekt gleichläufig).',
      fachlich: 'Die Kovarianz geteilt durch das Produkt der beiden Standardabweichungen.',
      symbolic: ['r = ', { frac: [
        { frac: [{ big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }, { part: [')('], m: 3 }, { part: ['y', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['ȳ'], m: 1 }, { part: [')'], m: 3 }], den: [{ part: ['n − 1'], m: 5 }], m: 5 },
      ], den: [{ part: ['sₓ · sᵧ'], m: 6 }], m: 6 }],
      aria: 'r gleich: Summe über alle Personen i von x i minus x quer, mal y i minus y quer, geteilt durch n minus 1; das Ganze geteilt durch s x mal s y',
      metrics: [{ label: 'Kovarianz sₓᵧ', value: c => num(c.s.cov) }, { label: 'Pearson-r', value: c => c.s.r === null ? 'nicht definiert' : num(c.s.r) }],
      interpret: c => {
        if (c.s.r === null) return { kurz: 'Bei einer Frage haben alle dasselbe geantwortet. Dann lässt sich kein Zusammenhang berechnen.', fachlich: 'Eine Standardabweichung ist 0, deshalb ist r nicht definiert.' };
        const r = c.s.r, dir = r > 0 ? 'gleichläufiger' : 'gegenläufiger';
        const people = r > 0 ? 'Wer dem Bundestag mehr vertraut, vertraut hier eher auch der Bundesregierung mehr.' : 'Wer dem Bundestag mehr vertraut, vertraut hier der Bundesregierung eher weniger.';
        return {
          kurz: shown(r) < 0.1 ? 'Zwischen den beiden Antworten gibt es hier keinen geraden Zusammenhang.'
            : strength(r) === 'perfekt' ? `Alle Punkte liegen auf einer Geraden: ein perfekt ${dir} Zusammenhang.`
            : `${people} Das ist ein ${dir}, ${{ schwach: 'schwacher', mittel: 'mittelstarker', stark: 'starker', perfekt: 'perfekter' }[strength(r)]} Zusammenhang${strength(r) === 'stark' ? ', aber kein perfekter' : ''}.`,
          fachlich: `r = ${num(r)}. Nach der verbreiteten Faustregel von Cohen ist ein Betrag ab 0,1 schwach, ab 0,3 mittel, ab 0,5 stark. Bei nur fünf Personen ist r sehr unsicher; die Werkstatt zeigt die Rechnung, nicht einen Befund über Deutschland.`,
        };
      },
      genau: {
        kurz: 'r beschreibt nur gerade Muster und sagt nichts darüber, was was verursacht.',
        paragraphs: () => [
          'Es gibt einen zweiten Rechenweg mit demselben Ergebnis: beide Variablen z-standardisieren und r = Σzₓzᵧ / (n − 1) rechnen. Er ist über den Routenwähler im Abschnitt „Mit dem Lehrdatensatz“ erreichbar.',
          'Dass r zwischen −1 und +1 liegt, folgt aus |sₓᵧ| ≤ sₓ · sᵧ (Cauchy-Schwarz-Ungleichung). Gleichheit gilt nur, wenn alle Punkte exakt auf einer Geraden liegen.',
          'Einzelne auffällige Punkte können r stark verändern. Bei Ausreißern ist die Spearman-Korrelation robuster, bei nur geordneten Kategorien angemessener.',
          'Die Vertrauensskalen hier wie metrische Skalen zu behandeln, ist eine Annahme: Gleiche Zahlenabstände sollen gleiche inhaltliche Abstände bedeuten.',
          'Ein Zusammenhang beweist keine Ursache: Beides kann zum Beispiel von der Nähe zu einer Regierungspartei abhängen (Begriffe „Drittvariable“ und „Confounding“).',
        ],
      },
    },
    covariance: {
      lastStep: 5,
      kurz: 'Die Kovarianz sagt, ob zwei Merkmale gemeinsam über oder unter dem jeweiligen Durchschnitt liegen: positiv heißt gleichläufig, negativ gegenläufig.',
      fachlich: 'Die Summe der Abweichungsprodukte geteilt durch n − 1.',
      symbolic: ['sₓᵧ = ', { frac: [{ big: 'Σ', m: 4 }, { part: ['('], m: 3 }, { part: ['x', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['x̄'], m: 1 }, { part: [')('], m: 3 }, { part: ['y', { sub: 'i' }, ' −'], m: 2 }, ' ', { part: ['ȳ'], m: 1 }, { part: [')'], m: 3 }], den: [{ part: ['n − 1'], m: 5 }], m: 5 }],
      aria: 's x y gleich Summe über alle Personen i von: x i minus x quer, mal y i minus y quer, geteilt durch n minus 1',
      metrics: [{ label: 'Summe der Produkte', value: c => num(c.s.cp) }, { label: 'Kovarianz sₓᵧ', value: c => num(c.s.cov) }],
      interpret: c => ({
        kurz: c.s.cov > 1e-9 ? 'Wer dem Bundestag mehr vertraut, vertraut in diesen fünf Beispielen eher auch der Bundesregierung.'
          : c.s.cov < -1e-9 ? 'Wer dem Bundestag mehr vertraut, vertraut in diesen fünf Beispielen der Bundesregierung eher weniger.'
          : 'Ein gerades gemeinsames Muster ist nicht zu erkennen.',
        fachlich: `sₓᵧ = ${num(c.s.cov)}. Das Vorzeichen zeigt die Richtung. Die Größe ist ohne Einheiten schwer zu deuten, dafür gibt es Pearson-r.`,
      }),
      next: { id: 'pearson', label: 'Weiter zur Pearson-Korrelation' },
      genau: {
        kurz: 'Die Kovarianz zeigt die Richtung, aber ihre Größe hängt von den Einheiten ab.',
        paragraphs: () => [
          'Die Kovarianz einer Variable mit sich selbst ist ihre Varianz: Aus dem Rechteck wird ein Quadrat.',
          'Dass |sₓᵧ| höchstens sₓ · sᵧ sein kann, nutzt Pearson-r, um die Kovarianz auf −1 bis +1 zu bringen.',
          'Ein Zusammenhang beweist keine Ursache: Beides kann zum Beispiel von der Nähe zu einer Regierungspartei abhängen (Begriffe „Drittvariable“ und „Confounding“).',
        ],
      },
    },
  },
};
